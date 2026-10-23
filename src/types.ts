export type Priority = 'urgent' | 'high' | 'medium' | 'low';

export type Category = 'Work' | 'Personal' | 'Health' | 'Study' | 'Finance' | 'Creative';

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: Priority;
  category: Category;
  dueDate: string; // YYYY-MM-DD
  dueTime?: string; // HH:MM
  estimatedMinutes: number;
  actualMinutes: number;
  completed: boolean;
  completedAt?: string;
  isTopPriority: boolean;
  recurring: 'none' | 'daily' | 'weekdays' | 'weekly';
  subtasks: Subtask[];
  notes?: string;
  createdAt: string;
}

export interface Habit {
  id: string;
  title: string;
  category: Category;
  targetDays: number[]; // 0=Sun, 1=Mon, ..., 6=Sat
  completedDates: string[]; // ['2026-10-23', ...]
  currentStreak: number;
  bestStreak: number;
  reminderTime?: string;
  color?: string;
  createdAt: string;
}

export type TimerMode = 'focus' | 'shortBreak' | 'longBreak';

export interface FocusSession {
  id: string;
  taskId?: string;
  taskTitle?: string;
  mode: TimerMode;
  durationMinutes: number;
  startedAt: string;
  completedAt: string;
}

export interface TimeBlock {
  id: string;
  title: string;
  taskId?: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM (e.g. "09:00")
  endTime: string; // HH:MM (e.g. "10:30")
  category: Category;
  completed: boolean;
}

export interface DailyQuest {
  id: string;
  title: string;
  description: string;
  target: number;
  current: number;
  completed: boolean;
  xp: number;
  type: 'focus' | 'tasks' | 'habits' | 'planner';
}

export type PlantType = 'sunflower' | 'bonsai' | 'lavender' | 'oak' | 'succulent';

export interface Plant {
  id: string;
  type: PlantType;
  name: string;
  stage: number; // 1: Seed, 2: Sprout, 3: Seedling, 4: Budding, 5: Fully Grown
  growthPoints: number; // 0 to 100
  plantedAt: string;
  completedAt?: string;
}

export type AccentColor = 'indigo' | 'emerald' | 'violet' | 'amber' | 'rose' | 'cyan';

export interface UserSettings {
  theme: 'light' | 'dark';
  accentColor: AccentColor;
  dailyFocusGoalMinutes: number; // e.g., 120
  focusDuration: number; // 25
  shortBreakDuration: number; // 5
  longBreakDuration: number; // 15
  soundEnabled: boolean;
  soundVolume: number; // 0 to 1
  ambientSound: 'none' | 'rain' | 'forest' | 'waves' | 'whitenoise';
  autoStartBreaks: boolean;
  autoStartFocus: boolean;
}

export interface Quote {
  id: string;
  quote: string;
  author: string;
  category: 'focus' | 'momentum' | 'discipline' | 'mindfulness' | 'time';
}

export interface WeeklyReflection {
  id: string;
  weekStartDate: string;
  achievements: string;
  obstacles: string;
  improvements: string;
  rating: number; // 1-5
  createdAt: string;
}
