import { Habit, Plant, Task, TimeBlock, UserSettings } from '../types';

export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getDateOffset(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export const DEFAULT_SETTINGS: UserSettings = {
  theme: 'light',
  accentColor: 'indigo',
  dailyFocusGoalMinutes: 120, // 2 hours
  focusDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  soundEnabled: true,
  soundVolume: 0.6,
  ambientSound: 'none',
  autoStartBreaks: false,
  autoStartFocus: false,
};

export function getInitialTasks(): Task[] {
  const today = getTodayDateString();
  const tomorrow = getDateOffset(1);
  const yesterday = getDateOffset(-1);

  return [
    {
      id: 'task-1',
      title: 'Architect Q4 Product Roadmap & Milestones',
      description: 'Align quarterly deliverables, team capacities, and cross-functional dependencies.',
      priority: 'urgent',
      category: 'Work',
      dueDate: today,
      dueTime: '14:00',
      estimatedMinutes: 60,
      actualMinutes: 50,
      completed: false,
      isTopPriority: true,
      recurring: 'none',
      subtasks: [
        { id: 'sub-1', title: 'Outline core theme and OKRs', completed: true },
        { id: 'sub-2', title: 'Estimate sprint complexity', completed: false },
        { id: 'sub-3', title: 'Draft presentation deck for leadership', completed: false },
      ],
      notes: 'Ensure engineering sync on backend schema before finalizing dates.',
      createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    },
    {
      id: 'task-2',
      title: 'Review UX wireframes for Mobile Dashboard',
      description: 'Audit mobile navigation, touch targets, and contrast accessibility.',
      priority: 'high',
      category: 'Creative',
      dueDate: today,
      dueTime: '16:30',
      estimatedMinutes: 45,
      actualMinutes: 25,
      completed: false,
      isTopPriority: true,
      recurring: 'none',
      subtasks: [
        { id: 'sub-4', title: 'Verify responsive breakpoint 390px', completed: true },
        { id: 'sub-5', title: 'Test thumb-reach floating actions', completed: false },
      ],
      createdAt: new Date(Date.now() - 3600000 * 18).toISOString(),
    },
    {
      id: 'task-3',
      title: 'High Intensity Core & Cardio Session',
      description: '30-minute interval workout to refresh cognitive energy.',
      priority: 'medium',
      category: 'Health',
      dueDate: today,
      dueTime: '18:00',
      estimatedMinutes: 30,
      actualMinutes: 0,
      completed: false,
      isTopPriority: true,
      recurring: 'daily',
      subtasks: [],
      createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    },
    {
      id: 'task-4',
      title: 'Read 25 Pages of "Deep Work" by Cal Newport',
      description: 'Focus on deliberate practice principles and attention hygiene.',
      priority: 'low',
      category: 'Personal',
      dueDate: today,
      dueTime: '21:00',
      estimatedMinutes: 30,
      actualMinutes: 30,
      completed: true,
      completedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      isTopPriority: false,
      recurring: 'daily',
      subtasks: [],
      createdAt: new Date(Date.now() - 3600000 * 10).toISOString(),
    },
    {
      id: 'task-5',
      title: 'Quarterly Expense Audit & Invoicing',
      description: 'Consolidate subscription costs and reconcile cloud invoices.',
      priority: 'high',
      category: 'Finance',
      dueDate: tomorrow,
      dueTime: '11:00',
      estimatedMinutes: 60,
      actualMinutes: 0,
      completed: false,
      isTopPriority: false,
      recurring: 'none',
      subtasks: [
        { id: 'sub-6', title: 'Download Stripe statement', completed: false },
        { id: 'sub-7', title: 'Categorize software tools', completed: false },
      ],
      createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    },
    {
      id: 'task-6',
      title: 'Refactor State Management & Context Handlers',
      description: 'Streamline re-renders and decouple pure calculations for testability.',
      priority: 'medium',
      category: 'Work',
      dueDate: yesterday,
      dueTime: '17:00',
      estimatedMinutes: 45,
      actualMinutes: 45,
      completed: true,
      completedAt: new Date(Date.now() - 3600000 * 22).toISOString(),
      isTopPriority: false,
      recurring: 'none',
      subtasks: [],
      createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    },
  ];
}

export function getInitialHabits(): Habit[] {
  const today = getTodayDateString();
  const d_1 = getDateOffset(-1);
  const d_2 = getDateOffset(-2);
  const d_3 = getDateOffset(-3);
  const d_4 = getDateOffset(-4);
  const d_5 = getDateOffset(-5);
  const d_6 = getDateOffset(-6);

  return [
    {
      id: 'habit-1',
      title: 'Morning Sunlight & 750ml Hydration',
      category: 'Health',
      targetDays: [0, 1, 2, 3, 4, 5, 6],
      completedDates: [d_5, d_4, d_3, d_2, d_1, today],
      currentStreak: 6,
      bestStreak: 14,
      reminderTime: '07:30',
      color: 'emerald',
      createdAt: new Date(Date.now() - 3600000 * 24 * 20).toISOString(),
    },
    {
      id: 'habit-2',
      title: '90-Minute Uninterrupted Deep Work Block',
      category: 'Work',
      targetDays: [1, 2, 3, 4, 5], // weekdays
      completedDates: [d_4, d_3, d_2, d_1],
      currentStreak: 4,
      bestStreak: 12,
      reminderTime: '09:00',
      color: 'indigo',
      createdAt: new Date(Date.now() - 3600000 * 24 * 18).toISOString(),
    },
    {
      id: 'habit-3',
      title: 'Evening Reflection & Tomorrow Top 3',
      category: 'Personal',
      targetDays: [0, 1, 2, 3, 4, 5, 6],
      completedDates: [d_6, d_5, d_4, d_3, d_2, d_1],
      currentStreak: 6,
      bestStreak: 21,
      reminderTime: '21:30',
      color: 'violet',
      createdAt: new Date(Date.now() - 3600000 * 24 * 30).toISOString(),
    },
    {
      id: 'habit-4',
      title: 'Zero Screen Time 45 mins Before Sleep',
      category: 'Health',
      targetDays: [0, 1, 2, 3, 4, 5, 6],
      completedDates: [d_3, d_2, d_1],
      currentStreak: 3,
      bestStreak: 8,
      reminderTime: '22:15',
      color: 'amber',
      createdAt: new Date(Date.now() - 3600000 * 24 * 10).toISOString(),
    },
  ];
}

export function getInitialFocusSessions() {
  const today = getTodayDateString();
  const d_1 = getDateOffset(-1);
  const d_2 = getDateOffset(-2);
  const d_3 = getDateOffset(-3);

  return [
    {
      id: 'sess-1',
      taskId: 'task-1',
      taskTitle: 'Architect Q4 Product Roadmap & Milestones',
      mode: 'focus' as const,
      durationMinutes: 25,
      startedAt: `${today}T09:30:00.000Z`,
      completedAt: `${today}T09:55:00.000Z`,
    },
    {
      id: 'sess-2',
      taskId: 'task-1',
      taskTitle: 'Architect Q4 Product Roadmap & Milestones',
      mode: 'focus' as const,
      durationMinutes: 25,
      startedAt: `${today}T10:05:00.000Z`,
      completedAt: `${today}T10:30:00.000Z`,
    },
    {
      id: 'sess-3',
      mode: 'shortBreak' as const,
      durationMinutes: 5,
      startedAt: `${today}T09:55:00.000Z`,
      completedAt: `${today}T10:00:00.000Z`,
    },
    {
      id: 'sess-4',
      taskId: 'task-4',
      taskTitle: 'Read 25 Pages of "Deep Work"',
      mode: 'focus' as const,
      durationMinutes: 30,
      startedAt: `${d_1}T20:00:00.000Z`,
      completedAt: `${d_1}T20:30:00.000Z`,
    },
    {
      id: 'sess-5',
      taskId: 'task-6',
      taskTitle: 'Refactor State Management & Context Handlers',
      mode: 'focus' as const,
      durationMinutes: 45,
      startedAt: `${d_1}T14:00:00.000Z`,
      completedAt: `${d_1}T14:45:00.000Z`,
    },
    {
      id: 'sess-6',
      mode: 'focus' as const,
      durationMinutes: 50,
      startedAt: `${d_2}T10:00:00.000Z`,
      completedAt: `${d_2}T10:50:00.000Z`,
    },
    {
      id: 'sess-7',
      mode: 'focus' as const,
      durationMinutes: 50,
      startedAt: `${d_3}T11:00:00.000Z`,
      completedAt: `${d_3}T11:50:00.000Z`,
    },
  ];
}

export function getInitialTimeBlocks(): TimeBlock[] {
  const today = getTodayDateString();
  return [
    {
      id: 'block-1',
      title: 'Morning Planning & Day Alignment',
      date: today,
      startTime: '08:30',
      endTime: '09:15',
      category: 'Personal',
      completed: true,
    },
    {
      id: 'block-2',
      title: 'Deep Focus: Q4 Product Roadmap',
      taskId: 'task-1',
      date: today,
      startTime: '09:30',
      endTime: '11:00',
      category: 'Work',
      completed: true,
    },
    {
      id: 'block-3',
      title: 'Creative Review: Mobile Wireframes',
      taskId: 'task-2',
      date: today,
      startTime: '14:00',
      endTime: '15:15',
      category: 'Creative',
      completed: false,
    },
    {
      id: 'block-4',
      title: 'Cardio & Strength Refresh',
      taskId: 'task-3',
      date: today,
      startTime: '17:30',
      endTime: '18:15',
      category: 'Health',
      completed: false,
    },
  ];
}

export function getInitialPlants(): Plant[] {
  const today = getTodayDateString();
  return [
    {
      id: 'plant-1',
      name: 'Sunflow of Clarity',
      type: 'sunflower',
      stage: 4,
      growthPoints: 80,
      plantedAt: getDateOffset(-2),
    },
    {
      id: 'plant-2',
      name: 'Zen Evergreen Bonsai',
      type: 'bonsai',
      stage: 5,
      growthPoints: 100,
      plantedAt: getDateOffset(-7),
      completedAt: getDateOffset(-1),
    },
    {
      id: 'plant-3',
      name: 'Calm French Lavender',
      type: 'lavender',
      stage: 3,
      growthPoints: 60,
      plantedAt: getDateOffset(-1),
    },
    {
      id: 'plant-4',
      name: 'Ancient Oak of Resilience',
      type: 'oak',
      stage: 2,
      growthPoints: 35,
      plantedAt: today,
    },
  ];
}
