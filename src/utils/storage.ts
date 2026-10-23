import { FocusSession, Habit, Plant, Task, TimeBlock, TimerMode, UserSettings, WeeklyReflection } from '../types';

export const STORAGE_KEYS = {
  TASKS: 'dayflow_tasks_v2',
  HABITS: 'dayflow_habits_v2',
  SESSIONS: 'dayflow_sessions_v2',
  PLANTS: 'dayflow_plants_v2',
  TIMEBLOCKS: 'dayflow_timeblocks_v2',
  REFLECTIONS: 'dayflow_reflections_v2',
  SETTINGS: 'dayflow_settings_v2',
  TIMER: 'dayflow_timer_state_v2',
  FAVORITE_QUOTES: 'dayflow_favorite_quotes_v2',
} as const;

export interface PersistentTimerData {
  mode: TimerMode;
  timeLeft: number;
  isRunning: boolean;
  activeTaskId: string | null;
  targetDuration: number;
  sessionStartTime: string | null;
  lastTimestamp: number; // Date.now() when saved
}

export interface RestoredTimerData {
  mode: TimerMode;
  timeLeft: number;
  isRunning: boolean;
  activeTaskId: string | null;
  targetDuration: number;
  sessionStartTime: string | null;
  completedWhileAway: boolean;
  awayMinutes: number;
}

/**
 * Safely saves data to localStorage with quota overflow handling.
 */
export function safeSave<T>(key: string, value: T): boolean {
  if (typeof window === 'undefined' || !window.localStorage) {
    return false;
  }
  try {
    const serialized = JSON.stringify(value);
    window.localStorage.setItem(key, serialized);
    return true;
  } catch (err) {
    console.error(`[DAYFLOW Storage] Failed to save key "${key}":`, err);
    return false;
  }
}

/**
 * Safely loads data from localStorage with JSON parsing and fallback value.
 */
export function safeLoad<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined' || !window.localStorage) {
    return fallback;
  }
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return parsed ?? fallback;
  } catch (err) {
    console.warn(`[DAYFLOW Storage] Failed to parse key "${key}", using fallback:`, err);
    return fallback;
  }
}

/**
 * Saves current timer state including timestamp to support seamless reload recovery.
 */
export function saveTimerState(state: PersistentTimerData): boolean {
  return safeSave(STORAGE_KEYS.TIMER, {
    ...state,
    lastTimestamp: Date.now(),
  });
}

/**
 * Loads timer state on page startup or reload, computing elapsed time if the timer was running.
 */
export function calculateRestoredTimer(
  saved: PersistentTimerData | null,
  currentTimestamp: number = Date.now(),
  defaultDuration = 25 * 60
): RestoredTimerData {
  if (!saved) {
    return {
      mode: 'focus',
      timeLeft: defaultDuration,
      isRunning: false,
      activeTaskId: null,
      targetDuration: defaultDuration,
      sessionStartTime: null,
      completedWhileAway: false,
      awayMinutes: 0,
    };
  }

  // If timer was paused, restore exact paused timeLeft
  if (!saved.isRunning) {
    return {
      mode: saved.mode || 'focus',
      timeLeft: Math.max(0, saved.timeLeft ?? defaultDuration),
      isRunning: false,
      activeTaskId: saved.activeTaskId || null,
      targetDuration: saved.targetDuration || defaultDuration,
      sessionStartTime: saved.sessionStartTime || null,
      completedWhileAway: false,
      awayMinutes: 0,
    };
  }

  // Timer was running when last saved: compute elapsed seconds
  const elapsedSeconds = Math.max(0, Math.floor((currentTimestamp - saved.lastTimestamp) / 1000));
  const remainingSeconds = saved.timeLeft - elapsedSeconds;

  if (remainingSeconds <= 0) {
    // Session completed while page was closed or backgrounded
    const awayMinutes = Math.round(saved.targetDuration / 60);
    return {
      mode: saved.mode || 'focus',
      timeLeft: 0,
      isRunning: false,
      activeTaskId: saved.activeTaskId || null,
      targetDuration: saved.targetDuration || defaultDuration,
      sessionStartTime: saved.sessionStartTime,
      completedWhileAway: true,
      awayMinutes,
    };
  }

  // Still has time remaining
  return {
    mode: saved.mode || 'focus',
    timeLeft: remainingSeconds,
    isRunning: true,
    activeTaskId: saved.activeTaskId || null,
    targetDuration: saved.targetDuration || defaultDuration,
    sessionStartTime: saved.sessionStartTime,
    completedWhileAway: false,
    awayMinutes: 0,
  };
}

/**
 * Creates a complete JSON backup export of all stored items.
 */
export function exportAllData(data: {
  tasks: Task[];
  habits: Habit[];
  sessions: FocusSession[];
  plants: Plant[];
  timeBlocks: TimeBlock[];
  reflections: WeeklyReflection[];
  settings: UserSettings;
}): string {
  const payload = {
    version: '2.0',
    app: 'DAYFLOW',
    exportedAt: new Date().toISOString(),
    data,
  };
  return JSON.stringify(payload, null, 2);
}

/**
 * Validates and restores a complete JSON backup.
 */
export function importAllData(jsonString: string): {
  success: boolean;
  data?: {
    tasks: Task[];
    habits: Habit[];
    sessions: FocusSession[];
    plants: Plant[];
    timeBlocks: TimeBlock[];
    reflections: WeeklyReflection[];
    settings: UserSettings;
  };
  error?: string;
} {
  try {
    const parsed = JSON.parse(jsonString);
    if (!parsed || typeof parsed !== 'object') {
      return { success: false, error: 'Invalid JSON file.' };
    }
    const content = parsed.data || parsed;
    if (!content.tasks || !Array.isArray(content.tasks)) {
      return { success: false, error: 'Backup does not contain valid task records.' };
    }

    return {
      success: true,
      data: {
        tasks: content.tasks,
        habits: Array.isArray(content.habits) ? content.habits : [],
        sessions: Array.isArray(content.sessions) ? content.sessions : [],
        plants: Array.isArray(content.plants) ? content.plants : [],
        timeBlocks: Array.isArray(content.timeBlocks) ? content.timeBlocks : [],
        reflections: Array.isArray(content.reflections) ? content.reflections : [],
        settings: content.settings || {},
      },
    };
  } catch (err) {
    return { success: false, error: 'Failed to parse JSON backup.' };
  }
}
