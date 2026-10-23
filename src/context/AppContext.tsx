import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  DailyQuest,
  FocusSession,
  Habit,
  Plant,
  PlantType,
  Task,
  TimeBlock,
  TimerMode,
  UserSettings,
  WeeklyReflection,
} from '../types';
import {
  DEFAULT_SETTINGS,
  getInitialFocusSessions,
  getInitialHabits,
  getInitialPlants,
  getInitialTasks,
  getInitialTimeBlocks,
  getTodayDateString,
} from '../utils/seedData';
import { calculateStreaks, checkDailyQuests, exportToCSV } from '../utils/productivity';
import { soundEngine } from '../utils/audio';
import {
  STORAGE_KEYS,
  safeLoad,
  safeSave,
  saveTimerState,
  calculateRestoredTimer,
  exportAllData,
  importAllData,
  PersistentTimerData,
} from '../utils/storage';

interface ToastAction {
  label: string;
  onClick: () => void;
}

interface ToastMessage {
  id: string;
  text: string;
  action?: ToastAction;
}

interface AppContextType {
  // State
  tasks: Task[];
  habits: Habit[];
  sessions: FocusSession[];
  plants: Plant[];
  timeBlocks: TimeBlock[];
  dailyQuests: DailyQuest[];
  reflections: WeeklyReflection[];
  settings: UserSettings;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isFocusModeOpen: boolean;
  setIsFocusModeOpen: (open: boolean) => void;

  // Task actions
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'actualMinutes' | 'completed'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  duplicateTask: (id: string) => void;
  toggleTaskComplete: (id: string) => void;
  toggleSubtask: (taskId: string, subtaskId: string) => void;
  toggleTopPriority: (taskId: string) => void;

  // Habit actions
  addHabit: (habit: Omit<Habit, 'id' | 'createdAt' | 'currentStreak' | 'bestStreak' | 'completedDates'>) => void;
  updateHabit: (id: string, updates: Partial<Habit>) => void;
  deleteHabit: (id: string) => void;
  toggleHabitDay: (habitId: string, dateStr: string) => void;

  // Timer state & actions
  timerMode: TimerMode;
  timeLeft: number; // in seconds
  isRunning: boolean;
  activeTaskId: string | null;
  setActiveTaskId: (id: string | null) => void;
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  skipTimer: () => void;
  setTimerMode: (mode: TimerMode) => void;
  notificationPermission: NotificationPermission;
  requestNotificationPermission: () => Promise<void>;

  // Plant actions
  plantNewSeed: (name: string, type: PlantType) => void;

  // Time block actions
  addTimeBlock: (block: Omit<TimeBlock, 'id'>) => void;
  updateTimeBlock: (id: string, updates: Partial<TimeBlock>) => void;
  deleteTimeBlock: (id: string) => void;
  toggleTimeBlockComplete: (id: string) => void;

  // Reflection actions
  saveReflection: (reflection: Omit<WeeklyReflection, 'id' | 'createdAt'>) => void;

  // Settings & Storage
  updateSettings: (newSettings: Partial<UserSettings>) => void;
  resetToDefaultData: () => void;
  exportData: (format: 'json' | 'csv') => void;
  importData: (jsonString: string) => boolean;

  // Toast
  toast: ToastMessage | null;
  showToast: (text: string, action?: ToastAction) => void;
  clearToast: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load persistent state using robust safeLoad wrapper with fallbacks
  const [tasks, setTasks] = useState<Task[]>(() =>
    safeLoad<Task[]>(STORAGE_KEYS.TASKS, getInitialTasks())
  );

  const [habits, setHabits] = useState<Habit[]>(() =>
    safeLoad<Habit[]>(STORAGE_KEYS.HABITS, getInitialHabits())
  );

  const [sessions, setSessions] = useState<FocusSession[]>(() =>
    safeLoad<FocusSession[]>(STORAGE_KEYS.SESSIONS, getInitialFocusSessions())
  );

  const [plants, setPlants] = useState<Plant[]>(() =>
    safeLoad<Plant[]>(STORAGE_KEYS.PLANTS, getInitialPlants())
  );

  const [timeBlocks, setTimeBlocks] = useState<TimeBlock[]>(() =>
    safeLoad<TimeBlock[]>(STORAGE_KEYS.TIMEBLOCKS, getInitialTimeBlocks())
  );

  const [reflections, setReflections] = useState<WeeklyReflection[]>(() =>
    safeLoad<WeeklyReflection[]>(STORAGE_KEYS.REFLECTIONS, [])
  );

  const [settings, setSettings] = useState<UserSettings>(() =>
    safeLoad<UserSettings>(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS)
  );

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isFocusModeOpen, setIsFocusModeOpen] = useState<boolean>(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Undo history buffer for recovering deleted tasks
  const lastDeletedTaskRef = useRef<Task | null>(null);

  const getModeDurationSeconds = useCallback(
    (mode: TimerMode): number => {
      if (mode === 'focus') return (settings.focusDuration || 25) * 60;
      if (mode === 'shortBreak') return (settings.shortBreakDuration || 5) * 60;
      return (settings.longBreakDuration || 15) * 60;
    },
    [settings.focusDuration, settings.shortBreakDuration, settings.longBreakDuration]
  );

  // Calculate restored timer state across page reloads/browser sessions
  const restoredTimer = calculateRestoredTimer(
    safeLoad<PersistentTimerData | null>(STORAGE_KEYS.TIMER, null),
    Date.now(),
    (settings.focusDuration || 25) * 60
  );

  const [timerMode, setTimerModeState] = useState<TimerMode>(restoredTimer.mode);
  const [isRunning, setIsRunning] = useState<boolean>(restoredTimer.isRunning);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(restoredTimer.activeTaskId);
  const [timeLeft, setTimeLeft] = useState<number>(restoredTimer.timeLeft);

  // Elapsed-time tracking refs to eliminate drift across tab switches or background execution
  const timerStartTimeRef = useRef<number | null>(
    restoredTimer.isRunning ? Date.now() - (restoredTimer.targetDuration - restoredTimer.timeLeft) * 1000 : null
  );
  const timerTargetDurationRef = useRef<number>(restoredTimer.targetDuration);
  const sessionStartTimeRef = useRef<string | null>(restoredTimer.sessionStartTime);

  // Browser notification permission state
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission;
    }
    return 'default';
  });

  const showToast = useCallback((text: string, action?: ToastAction) => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    setToast({ id: String(Date.now()), text, action });
    toastTimeoutRef.current = setTimeout(() => {
      setToast(null);
    }, 5500);
  }, []);

  const clearToast = useCallback(() => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    setToast(null);
  }, []);

  // Handle auto-completion if timer finished while the page was closed or backgrounded
  useEffect(() => {
    if (restoredTimer.completedWhileAway) {
      const durationMinutes = restoredTimer.awayMinutes || Math.round(restoredTimer.targetDuration / 60);
      const newSession: FocusSession = {
        id: `sess-${Date.now()}`,
        taskId: restoredTimer.activeTaskId || undefined,
        taskTitle: restoredTimer.activeTaskId
          ? tasks.find((t) => t.id === restoredTimer.activeTaskId)?.title
          : undefined,
        mode: restoredTimer.mode,
        durationMinutes,
        startedAt: restoredTimer.sessionStartTime || new Date(Date.now() - durationMinutes * 60000).toISOString(),
        completedAt: new Date().toISOString(),
      };

      setSessions((prev) => [newSession, ...prev]);

      if (restoredTimer.mode === 'focus') {
        if (restoredTimer.activeTaskId) {
          setTasks((prev) =>
            prev.map((t) =>
              t.id === restoredTimer.activeTaskId
                ? { ...t, actualMinutes: (t.actualMinutes || 0) + durationMinutes }
                : t
            )
          );
        }

        // Award plant growth
        setPlants((prev) => {
          const activePlant = prev.find((p) => p.stage < 5) || prev[0];
          if (!activePlant) return prev;
          const newPoints = activePlant.growthPoints + durationMinutes;
          const newStage = newPoints >= 100 && activePlant.stage < 5 ? activePlant.stage + 1 : activePlant.stage;
          return prev.map((p) =>
            p.id === activePlant.id
              ? {
                  ...p,
                  growthPoints: newPoints >= 100 && newStage === 5 ? 100 : newPoints % 100,
                  stage: newStage,
                  completedAt: newStage === 5 && !p.completedAt ? new Date().toISOString() : p.completedAt,
                }
              : p
          );
        });
      }

      showToast(`Focus session completed while you were away! (+${durationMinutes}m logged)`);
    }
  }, []); // Run once on startup

  // Persistent storage sync for tasks, habits, sessions, plants, timeblocks, reflections, settings
  useEffect(() => {
    safeSave(STORAGE_KEYS.TASKS, tasks);
  }, [tasks]);

  useEffect(() => {
    safeSave(STORAGE_KEYS.HABITS, habits);
  }, [habits]);

  useEffect(() => {
    safeSave(STORAGE_KEYS.SESSIONS, sessions);
  }, [sessions]);

  useEffect(() => {
    safeSave(STORAGE_KEYS.PLANTS, plants);
  }, [plants]);

  useEffect(() => {
    safeSave(STORAGE_KEYS.TIMEBLOCKS, timeBlocks);
  }, [timeBlocks]);

  useEffect(() => {
    safeSave(STORAGE_KEYS.REFLECTIONS, reflections);
  }, [reflections]);

  useEffect(() => {
    safeSave(STORAGE_KEYS.SETTINGS, settings);
  }, [settings]);

  // Persist timer state to localStorage continuously & on unload
  useEffect(() => {
    saveTimerState({
      mode: timerMode,
      timeLeft,
      isRunning,
      activeTaskId,
      targetDuration: timerTargetDurationRef.current,
      sessionStartTime: sessionStartTimeRef.current,
      lastTimestamp: Date.now(),
    });
  }, [timerMode, timeLeft, isRunning, activeTaskId]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      saveTimerState({
        mode: timerMode,
        timeLeft,
        isRunning,
        activeTaskId,
        targetDuration: timerTargetDurationRef.current,
        sessionStartTime: sessionStartTimeRef.current,
        lastTimestamp: Date.now(),
      });
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [timerMode, timeLeft, isRunning, activeTaskId]);

  // Handle Dark Mode HTML class & Theme
  useEffect(() => {
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.theme]);

  // Ambient sound management
  useEffect(() => {
    if (isRunning && settings.ambientSound !== 'none') {
      soundEngine.startAmbient(settings.ambientSound, settings.soundVolume);
    } else {
      soundEngine.stopAmbient();
    }
    return () => {
      soundEngine.stopAmbient();
    };
  }, [isRunning, settings.ambientSound, settings.soundVolume]);

  const requestNotificationPermission = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const perm = await Notification.requestPermission();
        setNotificationPermission(perm);
        if (perm === 'granted') {
          showToast('Desktop notifications enabled!');
        } else {
          showToast('Notification permission was not granted.');
        }
      } catch {
        showToast('Notification request not supported in this environment.');
      }
    } else {
      showToast('Notifications are not supported in this browser.');
    }
  };

  // Complete session callback
  const handleSessionComplete = useCallback(() => {
    setIsRunning(false);
    timerStartTimeRef.current = null;

    const completedAt = new Date().toISOString();
    const startedAt = sessionStartTimeRef.current || new Date(Date.now() - timerTargetDurationRef.current * 1000).toISOString();
    const durationMinutes = Math.round(timerTargetDurationRef.current / 60);

    const activeTask = tasks.find((t) => t.id === activeTaskId);
    const newSession: FocusSession = {
      id: `sess-${Date.now()}`,
      taskId: activeTaskId || undefined,
      taskTitle: activeTask ? activeTask.title : undefined,
      mode: timerMode,
      durationMinutes,
      startedAt,
      completedAt,
    };

    setSessions((prev) => [newSession, ...prev]);

    // If focus session and linked to task, update actual minutes
    if (timerMode === 'focus' && activeTaskId) {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === activeTaskId
            ? { ...t, actualMinutes: (t.actualMinutes || 0) + durationMinutes }
            : t
        )
      );
    }

    // Advance focus garden plant growth if in focus mode
    if (timerMode === 'focus') {
      setPlants((prev) => {
        const activePlant = prev.find((p) => p.stage < 5) || prev[0];
        if (!activePlant) return prev;

        const newPoints = activePlant.growthPoints + durationMinutes;
        let newStage = activePlant.stage;

        if (newPoints >= 100 && activePlant.stage < 5) {
          newStage = (activePlant.stage + 1);
        }

        return prev.map((p) =>
          p.id === activePlant.id
            ? {
                ...p,
                growthPoints: newPoints >= 100 && newStage === 5 ? 100 : newPoints % 100,
                stage: newStage,
                completedAt: newStage === 5 && !p.completedAt ? completedAt : p.completedAt,
              }
            : p
        );
      });
    }

    // Sound alert
    if (settings.soundEnabled) {
      soundEngine.playChime(timerMode === 'focus' ? 'complete' : 'break', settings.soundVolume);
    }

    // Confetti on focus completion
    if (timerMode === 'focus') {
      try {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#6366f1', '#10b981', '#f59e0b', '#ec4899'],
        });
      } catch {
        // canvas-confetti fallback
      }
    }

    // Browser Notification
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        const title = timerMode === 'focus' ? 'Focus Session Complete!' : 'Break Over — Ready to Flow?';
        const body =
          timerMode === 'focus'
            ? `Fantastic work! You completed ${durationMinutes} minutes of focused effort.`
            : `Break is complete. Time to dive back into your priorities.`;
        new Notification(title, { body, icon: '/favicon.ico' });
      } catch {
        // ignore notification error
      }
    }

    // In-app alert
    showToast(
      timerMode === 'focus'
        ? `Focus session complete (${durationMinutes}m)! Great job.`
        : `Break finished! Ready to resume flow.`
    );

    // Auto transitions
    if (timerMode === 'focus') {
      if (settings.autoStartBreaks) {
        setTimerModeState('shortBreak');
        const dur = (settings.shortBreakDuration || 5) * 60;
        setTimeLeft(dur);
        timerTargetDurationRef.current = dur;
        timerStartTimeRef.current = Date.now();
        sessionStartTimeRef.current = new Date().toISOString();
        setIsRunning(true);
      } else {
        setTimerModeState('shortBreak');
        const dur = (settings.shortBreakDuration || 5) * 60;
        setTimeLeft(dur);
        timerTargetDurationRef.current = dur;
      }
    } else {
      if (settings.autoStartFocus) {
        setTimerModeState('focus');
        const dur = (settings.focusDuration || 25) * 60;
        setTimeLeft(dur);
        timerTargetDurationRef.current = dur;
        timerStartTimeRef.current = Date.now();
        sessionStartTimeRef.current = new Date().toISOString();
        setIsRunning(true);
      } else {
        setTimerModeState('focus');
        const dur = (settings.focusDuration || 25) * 60;
        setTimeLeft(dur);
        timerTargetDurationRef.current = dur;
      }
    }
  }, [
    activeTaskId,
    timerMode,
    settings.autoStartBreaks,
    settings.autoStartFocus,
    settings.focusDuration,
    settings.shortBreakDuration,
    settings.soundEnabled,
    settings.soundVolume,
    showToast,
    tasks,
  ]);

  // High precision timer loop based on real timestamp differences
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isRunning) {
      interval = setInterval(() => {
        if (!timerStartTimeRef.current) return;
        const elapsed = Math.floor((Date.now() - timerStartTimeRef.current) / 1000);
        const remaining = Math.max(0, timerTargetDurationRef.current - elapsed);
        setTimeLeft(remaining);

        if (remaining <= 0) {
          handleSessionComplete();
        }
      }, 250);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, handleSessionComplete]);

  const startTimer = useCallback(() => {
    if (!isRunning) {
      timerStartTimeRef.current = Date.now() - (timerTargetDurationRef.current - timeLeft) * 1000;
      if (!sessionStartTimeRef.current) {
        sessionStartTimeRef.current = new Date().toISOString();
      }
      setIsRunning(true);
      if (settings.soundEnabled) {
        soundEngine.playChime('start', settings.soundVolume);
      }
    }
  }, [isRunning, timeLeft, settings.soundEnabled, settings.soundVolume]);

  const pauseTimer = useCallback(() => {
    if (isRunning) {
      if (timerStartTimeRef.current) {
        const elapsed = Math.floor((Date.now() - timerStartTimeRef.current) / 1000);
        setTimeLeft(Math.max(0, timerTargetDurationRef.current - elapsed));
      }
      setIsRunning(false);
      timerStartTimeRef.current = null;
    }
  }, [isRunning]);

  const resetTimer = useCallback(() => {
    setIsRunning(false);
    timerStartTimeRef.current = null;
    sessionStartTimeRef.current = null;
    const dur = getModeDurationSeconds(timerMode);
    timerTargetDurationRef.current = dur;
    setTimeLeft(dur);
  }, [timerMode, getModeDurationSeconds]);

  const skipTimer = useCallback(() => {
    handleSessionComplete();
  }, [handleSessionComplete]);

  const setTimerMode = useCallback(
    (mode: TimerMode) => {
      setIsRunning(false);
      timerStartTimeRef.current = null;
      sessionStartTimeRef.current = null;
      setTimerModeState(mode);
      const dur = getModeDurationSeconds(mode);
      timerTargetDurationRef.current = dur;
      setTimeLeft(dur);
    },
    [getModeDurationSeconds]
  );

  // Task actions
  const addTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'actualMinutes' | 'completed'>) => {
    const newTask: Task = {
      ...taskData,
      id: `task-${Date.now()}`,
      actualMinutes: 0,
      completed: false,
      createdAt: new Date().toISOString(),
    };
    setTasks((prev) => [newTask, ...prev]);
    showToast(`Task "${newTask.title}" created.`);
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
  };

  const deleteTask = (id: string) => {
    const taskToDelete = tasks.find((t) => t.id === id);
    if (!taskToDelete) return;
    lastDeletedTaskRef.current = taskToDelete;
    setTasks((prev) => prev.filter((t) => t.id !== id));

    showToast(`Task deleted.`, {
      label: 'Undo',
      onClick: () => {
        if (lastDeletedTaskRef.current) {
          setTasks((prev) => [lastDeletedTaskRef.current!, ...prev]);
          lastDeletedTaskRef.current = null;
          showToast('Task restored.');
        }
      },
    });
  };

  const duplicateTask = (id: string) => {
    const orig = tasks.find((t) => t.id === id);
    if (!orig) return;
    const clone: Task = {
      ...orig,
      id: `task-${Date.now()}`,
      title: `${orig.title} (Copy)`,
      completed: false,
      completedAt: undefined,
      actualMinutes: 0,
      createdAt: new Date().toISOString(),
    };
    setTasks((prev) => [clone, ...prev]);
    showToast(`Duplicated "${clone.title}".`);
  };

  const toggleTaskComplete = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const willComplete = !t.completed;
          if (willComplete) {
            try {
              confetti({
                particleCount: 50,
                spread: 50,
                origin: { y: 0.7 },
                colors: ['#10b981', '#6366f1', '#3b82f6'],
              });
            } catch {
              // fallback
            }
          }
          return {
            ...t,
            completed: willComplete,
            completedAt: willComplete ? new Date().toISOString() : undefined,
          };
        }
        return t;
      })
    );
  };

  const toggleSubtask = (taskId: string, subtaskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          return {
            ...t,
            subtasks: t.subtasks.map((st) =>
              st.id === subtaskId ? { ...st, completed: !st.completed } : st
            ),
          };
        }
        return t;
      })
    );
  };

  const toggleTopPriority = (taskId: string) => {
    setTasks((prev) => {
      const target = prev.find((t) => t.id === taskId);
      if (!target) return prev;

      // If turning on, check top 3 count
      if (!target.isTopPriority) {
        const topCount = prev.filter((t) => t.isTopPriority && !t.completed).length;
        if (topCount >= 3) {
          showToast('You already have 3 Top Priorities for today. Finish or unpin one first!');
          return prev;
        }
      }

      return prev.map((t) => (t.id === taskId ? { ...t, isTopPriority: !t.isTopPriority } : t));
    });
  };

  // Habit actions
  const addHabit = (habitData: Omit<Habit, 'id' | 'createdAt' | 'currentStreak' | 'bestStreak' | 'completedDates'>) => {
    const newHabit: Habit = {
      ...habitData,
      id: `habit-${Date.now()}`,
      completedDates: [],
      currentStreak: 0,
      bestStreak: 0,
      createdAt: new Date().toISOString(),
    };
    setHabits((prev) => [...prev, newHabit]);
    showToast(`Habit "${newHabit.title}" created.`);
  };

  const updateHabit = (id: string, updates: Partial<Habit>) => {
    setHabits((prev) => prev.map((h) => (h.id === id ? { ...h, ...updates } : h)));
  };

  const deleteHabit = (id: string) => {
    setHabits((prev) => prev.filter((h) => h.id !== id));
    showToast('Habit deleted.');
  };

  const toggleHabitDay = (habitId: string, dateStr: string) => {
    const today = getTodayDateString();
    setHabits((prev) =>
      prev.map((h) => {
        if (h.id === habitId) {
          const isDone = h.completedDates.includes(dateStr);
          const newDates = isDone
            ? h.completedDates.filter((d) => d !== dateStr)
            : [...h.completedDates, dateStr];

          const { currentStreak, bestStreak } = calculateStreaks(newDates, today);

          if (!isDone && dateStr === today) {
            try {
              confetti({
                particleCount: 35,
                spread: 45,
                origin: { y: 0.7 },
                colors: ['#10b981', '#34d399', '#6ee7b7'],
              });
            } catch {
              // fallback
            }
          }

          return {
            ...h,
            completedDates: newDates,
            currentStreak,
            bestStreak: Math.max(h.bestStreak, bestStreak),
          };
        }
        return h;
      })
    );
  };

  // Focus garden plant actions
  const plantNewSeed = (name: string, type: PlantType) => {
    const newPlant: Plant = {
      id: `plant-${Date.now()}`,
      name,
      type,
      stage: 1,
      growthPoints: 0,
      plantedAt: getTodayDateString(),
    };
    setPlants((prev) => [newPlant, ...prev]);
    showToast(`Planted "${name}" in your Focus Garden!`);
  };

  // Daily planner time blocks
  const addTimeBlock = (blockData: Omit<TimeBlock, 'id'>) => {
    const newBlock: TimeBlock = {
      ...blockData,
      id: `block-${Date.now()}`,
    };
    setTimeBlocks((prev) => [...prev, newBlock]);
    showToast('Time block scheduled.');
  };

  const updateTimeBlock = (id: string, updates: Partial<TimeBlock>) => {
    setTimeBlocks((prev) => prev.map((b) => (b.id === id ? { ...b, ...updates } : b)));
  };

  const deleteTimeBlock = (id: string) => {
    setTimeBlocks((prev) => prev.filter((b) => b.id !== id));
    showToast('Time block removed.');
  };

  const toggleTimeBlockComplete = (id: string) => {
    setTimeBlocks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, completed: !b.completed } : b))
    );
  };

  // Reflections
  const saveReflection = (reflectionData: Omit<WeeklyReflection, 'id' | 'createdAt'>) => {
    const newReflection: WeeklyReflection = {
      ...reflectionData,
      id: `refl-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setReflections((prev) => [newReflection, ...prev]);
    showToast('Weekly reflection saved! Excellent dedication.');
  };

  // Settings
  const updateSettings = (newSettings: Partial<UserSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const resetToDefaultData = () => {
    setTasks(getInitialTasks());
    setHabits(getInitialHabits());
    setSessions(getInitialFocusSessions());
    setPlants(getInitialPlants());
    setTimeBlocks(getInitialTimeBlocks());
    setReflections([]);
    setSettings(DEFAULT_SETTINGS);
    // Clear timer state
    safeSave(STORAGE_KEYS.TIMER, null);
    setIsRunning(false);
    setTimeLeft(DEFAULT_SETTINGS.focusDuration * 60);
    setTimerModeState('focus');
    setActiveTaskId(null);
    showToast('Reset all data to default demo state.');
  };

  const exportData = (format: 'json' | 'csv') => {
    const today = getTodayDateString();
    if (format === 'json') {
      const jsonStr = exportAllData({
        tasks,
        habits,
        sessions,
        plants,
        timeBlocks,
        reflections,
        settings,
      });
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dayflow-backup-${today}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('Exported complete data backup as JSON.');
    } else {
      const csvStr = exportToCSV(tasks, sessions);
      const blob = new Blob([csvStr], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dayflow-productivity-${today}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('Exported tasks & sessions as CSV.');
    }
  };

  const importData = (jsonString: string): boolean => {
    const result = importAllData(jsonString);
    if (!result.success || !result.data) {
      showToast(result.error || 'Failed to import backup.');
      return false;
    }
    const { data } = result;
    setTasks(data.tasks);
    setHabits(data.habits);
    setSessions(data.sessions);
    setPlants(data.plants);
    setTimeBlocks(data.timeBlocks);
    setReflections(data.reflections);
    if (data.settings) {
      setSettings((prev) => ({ ...prev, ...data.settings }));
    }
    showToast('Restored all tasks, habits, and history successfully!');
    return true;
  };

  // Daily quests dynamic check
  const today = getTodayDateString();
  const rawQuests: DailyQuest[] = [
    {
      id: 'q-focus',
      title: 'Deep Work Champion',
      description: 'Log at least 50 minutes of deep focus time today.',
      target: 50,
      current: 0,
      completed: false,
      xp: 150,
      type: 'focus',
    },
    {
      id: 'q-priority',
      title: 'Priority Executioner',
      description: 'Check off at least 2 tasks today.',
      target: 2,
      current: 0,
      completed: false,
      xp: 100,
      type: 'tasks',
    },
    {
      id: 'q-habits',
      title: 'Consistency Builder',
      description: 'Complete at least 3 daily habits today.',
      target: 3,
      current: 0,
      completed: false,
      xp: 120,
      type: 'habits',
    },
  ];

  const dailyQuests = checkDailyQuests(rawQuests, tasks, sessions, habits, today);

  return (
    <AppContext.Provider
      value={{
        tasks,
        habits,
        sessions,
        plants,
        timeBlocks,
        dailyQuests,
        reflections,
        settings,
        activeTab,
        setActiveTab,
        isFocusModeOpen,
        setIsFocusModeOpen,
        addTask,
        updateTask,
        deleteTask,
        duplicateTask,
        toggleTaskComplete,
        toggleSubtask,
        toggleTopPriority,
        addHabit,
        updateHabit,
        deleteHabit,
        toggleHabitDay,
        timerMode,
        timeLeft,
        isRunning,
        activeTaskId,
        setActiveTaskId,
        startTimer,
        pauseTimer,
        resetTimer,
        skipTimer,
        setTimerMode,
        notificationPermission,
        requestNotificationPermission,
        plantNewSeed,
        addTimeBlock,
        updateTimeBlock,
        deleteTimeBlock,
        toggleTimeBlockComplete,
        saveReflection,
        updateSettings,
        resetToDefaultData,
        exportData,
        importData,
        toast,
        showToast,
        clearToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
