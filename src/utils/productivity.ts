import { DailyQuest, FocusSession, Habit, Priority, Task } from '../types';

/**
 * Calculates current consecutive streak and all-time best streak given an array of date strings (YYYY-MM-DD).
 */
export function calculateStreaks(
  completedDates: string[],
  todayStr: string
): { currentStreak: number; bestStreak: number } {
  if (!completedDates || completedDates.length === 0) {
    return { currentStreak: 0, bestStreak: 0 };
  }

  // Deduplicate and sort descending
  const uniqueDates = Array.from(new Set(completedDates)).sort().reverse();
  const dateSet = new Set(uniqueDates);

  // Parse today and yesterday in local date math
  const today = new Date(todayStr + 'T00:00:00');
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  let currentStreak = 0;
  // If completed today, start counting from today.
  // If not completed today, but was completed yesterday, current streak is alive starting from yesterday!
  let checkDate = new Date(today);
  if (!dateSet.has(todayStr)) {
    if (dateSet.has(yesterdayStr)) {
      checkDate = new Date(yesterday);
    } else {
      checkDate = null as unknown as Date;
    }
  }

  if (checkDate) {
    while (true) {
      const dStr = checkDate.toISOString().split('T')[0];
      if (dateSet.has(dStr)) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
  }

  // Compute best streak across all history
  const sortedAsc = Array.from(new Set(completedDates)).sort();
  let bestStreak = 0;
  let tempStreak = 0;
  let prevDate: Date | null = null;

  for (const dStr of sortedAsc) {
    const cur = new Date(dStr + 'T00:00:00');
    if (!prevDate) {
      tempStreak = 1;
    } else {
      const diffDays = Math.round((cur.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        tempStreak++;
      } else if (diffDays === 0) {
        // same day, no change
      } else {
        tempStreak = 1;
      }
    }
    if (tempStreak > bestStreak) {
      bestStreak = tempStreak;
    }
    prevDate = cur;
  }

  return {
    currentStreak,
    bestStreak: Math.max(bestStreak, currentStreak),
  };
}

/**
 * Calculates focus time, break time, and session count for a given calendar date.
 */
export function calculateDailyFocusTime(
  sessions: FocusSession[],
  dateStr: string
): { focusMinutes: number; breakMinutes: number; sessionCount: number } {
  let focusMinutes = 0;
  let breakMinutes = 0;
  let sessionCount = 0;

  for (const s of sessions) {
    // Session completedAt or startedAt matching dateStr
    const sDate = (s.completedAt || s.startedAt).split('T')[0];
    if (sDate === dateStr) {
      if (s.mode === 'focus') {
        focusMinutes += s.durationMinutes;
        sessionCount++;
      } else {
        breakMinutes += s.durationMinutes;
      }
    }
  }

  return { focusMinutes, breakMinutes, sessionCount };
}

/**
 * Aggregates productivity trends for the past 7 days.
 */
export function calculateWeeklyTrends(
  sessions: FocusSession[],
  tasks: Task[],
  weekDates: string[]
): Array<{
  date: string;
  dayName: string;
  focusMinutes: number;
  breakMinutes: number;
  tasksCompleted: number;
}> {
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return weekDates.map((dateStr) => {
    const d = new Date(dateStr + 'T00:00:00');
    const dayName = dayNames[d.getDay()];

    const { focusMinutes, breakMinutes } = calculateDailyFocusTime(sessions, dateStr);

    const tasksCompleted = tasks.filter((t) => {
      if (!t.completed || !t.completedAt) return false;
      return t.completedAt.split('T')[0] === dateStr;
    }).length;

    return {
      date: dateStr,
      dayName,
      focusMinutes,
      breakMinutes,
      tasksCompleted,
    };
  });
}

/**
 * Aggregates breakdown of tasks and focus sessions by category.
 */
export function calculateCategoryBreakdown(
  tasks: Task[],
  sessions: FocusSession[]
): Array<{
  category: string;
  taskCount: number;
  completedTasks: number;
  focusMinutes: number;
  percent: number;
}> {
  const categories = ['Work', 'Personal', 'Health', 'Study', 'Finance', 'Creative'];
  const taskMap: Record<string, { total: number; completed: number }> = {};
  const focusMap: Record<string, number> = {};

  categories.forEach((c) => {
    taskMap[c] = { total: 0, completed: 0 };
    focusMap[c] = 0;
  });

  tasks.forEach((t) => {
    if (taskMap[t.category]) {
      taskMap[t.category].total++;
      if (t.completed) taskMap[t.category].completed++;
    }
  });

  let totalFocusMinutes = 0;
  sessions.forEach((s) => {
    if (s.mode === 'focus') {
      totalFocusMinutes += s.durationMinutes;
      // Match task category if linked
      const matchedTask = tasks.find((t) => t.id === s.taskId);
      const cat = matchedTask ? matchedTask.category : 'Work';
      if (focusMap[cat] !== undefined) {
        focusMap[cat] += s.durationMinutes;
      }
    }
  });

  return categories.map((cat) => {
    const focusMins = focusMap[cat] || 0;
    const percent = totalFocusMinutes > 0 ? Math.round((focusMins / totalFocusMinutes) * 100) : 0;
    return {
      category: cat,
      taskCount: taskMap[cat]?.total || 0,
      completedTasks: taskMap[cat]?.completed || 0,
      focusMinutes: focusMins,
      percent,
    };
  });
}

/**
 * Calculates planned vs actual duration comparison.
 */
export function calculatePlannedVsActual(tasks: Task[]): {
  totalPlannedMinutes: number;
  totalActualMinutes: number;
  varianceMinutes: number;
  taskComparisons: Array<{ id: string; title: string; planned: number; actual: number; diff: number }>;
} {
  let totalPlannedMinutes = 0;
  let totalActualMinutes = 0;

  const taskComparisons = tasks.map((t) => {
    const planned = t.estimatedMinutes || 0;
    const actual = t.actualMinutes || 0;
    totalPlannedMinutes += planned;
    totalActualMinutes += actual;
    return {
      id: t.id,
      title: t.title,
      planned,
      actual,
      diff: actual - planned,
    };
  });

  return {
    totalPlannedMinutes,
    totalActualMinutes,
    varianceMinutes: totalActualMinutes - totalPlannedMinutes,
    taskComparisons,
  };
}

/**
 * Filters and sorts tasks based on user selected views, search queries, priority, and sort options.
 */
export function filterTasks(
  tasks: Task[],
  view: string, // 'today' | 'upcoming' | 'overdue' | 'completed' | 'all' | 'top3'
  searchQuery: string,
  categoryFilter: string,
  priorityFilter: string,
  sortBy: string, // 'dueDate' | 'priority' | 'duration' | 'title'
  todayStr: string
): Task[] {
  const priorityWeight: Record<Priority, number> = {
    urgent: 4,
    high: 3,
    medium: 2,
    low: 1,
  };

  return tasks
    .filter((task) => {
      // View filtering
      if (view === 'today') {
        if (task.completed) return false;
        return task.dueDate === todayStr;
      }
      if (view === 'upcoming') {
        if (task.completed) return false;
        return task.dueDate > todayStr;
      }
      if (view === 'overdue') {
        if (task.completed) return false;
        return task.dueDate < todayStr;
      }
      if (view === 'completed') {
        return task.completed;
      }
      if (view === 'top3') {
        return task.isTopPriority && !task.completed;
      }
      return true; // 'all'
    })
    .filter((task) => {
      // Search query filtering
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        task.title.toLowerCase().includes(q) ||
        (task.description && task.description.toLowerCase().includes(q)) ||
        (task.notes && task.notes.toLowerCase().includes(q))
      );
    })
    .filter((task) => {
      // Category filter
      if (!categoryFilter || categoryFilter === 'all') return true;
      return task.category === categoryFilter;
    })
    .filter((task) => {
      // Priority filter
      if (!priorityFilter || priorityFilter === 'all') return true;
      return task.priority === priorityFilter;
    })
    .sort((a, b) => {
      if (sortBy === 'priority') {
        return priorityWeight[b.priority] - priorityWeight[a.priority];
      }
      if (sortBy === 'duration') {
        return (b.estimatedMinutes || 0) - (a.estimatedMinutes || 0);
      }
      if (sortBy === 'title') {
        return a.title.localeCompare(b.title);
      }
      // Default: dueDate ascending, then dueTime
      const dateA = a.dueDate + (a.dueTime || '23:59');
      const dateB = b.dueDate + (b.dueTime || '23:59');
      return dateA.localeCompare(dateB);
    });
}

/**
 * Evaluates progress on daily quests based on today's activities.
 */
export function checkDailyQuests(
  quests: DailyQuest[],
  tasks: Task[],
  sessions: FocusSession[],
  habits: Habit[],
  todayStr: string
): DailyQuest[] {
  const todayFocusMinutes = calculateDailyFocusTime(sessions, todayStr).focusMinutes;
  const todayTasksCompleted = tasks.filter(
    (t) => t.completed && t.completedAt && t.completedAt.split('T')[0] === todayStr
  ).length;
  const todayHabitsCompleted = habits.filter((h) =>
    h.completedDates.includes(todayStr)
  ).length;

  return quests.map((q) => {
    let current = 0;
    if (q.type === 'focus') {
      current = Math.min(q.target, todayFocusMinutes);
    } else if (q.type === 'tasks') {
      current = Math.min(q.target, todayTasksCompleted);
    } else if (q.type === 'habits') {
      current = Math.min(q.target, todayHabitsCompleted);
    } else {
      current = q.current;
    }

    return {
      ...q,
      current,
      completed: current >= q.target,
    };
  });
}

/**
 * Formats minutes into human-readable e.g. "2h 15m" or "45m"
 */
export function formatMinutes(minutes: number): string {
  if (minutes < 0) minutes = 0;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (hours === 0) return `${remainingMinutes}m`;
  if (remainingMinutes === 0) return `${hours}h`;
  return `${hours}h ${remainingMinutes}m`;
}

/**
 * Exports tasks and focus sessions as CSV data string.
 */
export function exportToCSV(tasks: Task[], sessions: FocusSession[]): string {
  const headers = ['Type', 'ID', 'Title', 'Category', 'Priority', 'Due Date', 'Estimated Mins', 'Actual Mins', 'Completed'];
  const rows: string[] = [headers.join(',')];

  tasks.forEach((t) => {
    rows.push(
      [
        'Task',
        `"${t.id}"`,
        `"${t.title.replace(/"/g, '""')}"`,
        `"${t.category}"`,
        `"${t.priority}"`,
        `"${t.dueDate}"`,
        t.estimatedMinutes,
        t.actualMinutes,
        t.completed ? 'YES' : 'NO',
      ].join(',')
    );
  });

  sessions.forEach((s) => {
    rows.push(
      [
        'FocusSession',
        `"${s.id}"`,
        `"${(s.taskTitle || s.mode).replace(/"/g, '""')}"`,
        `"${s.mode}"`,
        '-',
        `"${s.completedAt || s.startedAt}"`,
        s.durationMinutes,
        s.durationMinutes,
        'YES',
      ].join(',')
    );
  });

  return rows.join('\n');
}
