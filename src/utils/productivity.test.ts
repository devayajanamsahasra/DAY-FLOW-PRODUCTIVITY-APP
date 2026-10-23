import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateStreaks,
  calculateDailyFocusTime,
  calculateCategoryBreakdown,
  calculatePlannedVsActual,
  filterTasks,
  formatMinutes,
} from './productivity';
import { Task, FocusSession } from '../types';

test('calculateStreaks handles consecutive days including today', () => {
  const dates = ['2026-10-21', '2026-10-22', '2026-10-23'];
  const res = calculateStreaks(dates, '2026-10-23');
  assert.equal(res.currentStreak, 3);
  assert.equal(res.bestStreak, 3);
});

test('calculateStreaks handles yesterday completion when today is not yet checked', () => {
  const dates = ['2026-10-21', '2026-10-22'];
  const res = calculateStreaks(dates, '2026-10-23');
  assert.equal(res.currentStreak, 2);
  assert.equal(res.bestStreak, 2);
});

test('calculateStreaks breaks if older than yesterday', () => {
  const dates = ['2026-10-20'];
  const res = calculateStreaks(dates, '2026-10-23');
  assert.equal(res.currentStreak, 0);
  assert.equal(res.bestStreak, 1);
});

test('calculateDailyFocusTime correctly aggregates focus and break minutes', () => {
  const sessions: FocusSession[] = [
    {
      id: 's1',
      mode: 'focus',
      durationMinutes: 25,
      startedAt: '2026-10-23T09:00:00Z',
      completedAt: '2026-10-23T09:25:00Z',
    },
    {
      id: 's2',
      mode: 'shortBreak',
      durationMinutes: 5,
      startedAt: '2026-10-23T09:25:00Z',
      completedAt: '2026-10-23T09:30:00Z',
    },
    {
      id: 's3',
      mode: 'focus',
      durationMinutes: 50,
      startedAt: '2026-10-23T10:00:00Z',
      completedAt: '2026-10-23T10:50:00Z',
    },
    {
      id: 's4',
      mode: 'focus',
      durationMinutes: 25,
      startedAt: '2026-10-22T09:00:00Z',
      completedAt: '2026-10-22T09:25:00Z',
    },
  ];

  const res = calculateDailyFocusTime(sessions, '2026-10-23');
  assert.equal(res.focusMinutes, 75);
  assert.equal(res.breakMinutes, 5);
  assert.equal(res.sessionCount, 2);
});

test('calculatePlannedVsActual calculates accurate variance', () => {
  const tasks: Task[] = [
    {
      id: 't1',
      title: 'Design Mockup',
      priority: 'high',
      category: 'Creative',
      dueDate: '2026-10-23',
      estimatedMinutes: 60,
      actualMinutes: 45,
      completed: true,
      isTopPriority: true,
      recurring: 'none',
      subtasks: [],
      createdAt: '2026-10-23T08:00:00Z',
    },
    {
      id: 't2',
      title: 'Write Docs',
      priority: 'medium',
      category: 'Work',
      dueDate: '2026-10-23',
      estimatedMinutes: 30,
      actualMinutes: 50,
      completed: true,
      isTopPriority: false,
      recurring: 'none',
      subtasks: [],
      createdAt: '2026-10-23T08:00:00Z',
    },
  ];

  const res = calculatePlannedVsActual(tasks);
  assert.equal(res.totalPlannedMinutes, 90);
  assert.equal(res.totalActualMinutes, 95);
  assert.equal(res.varianceMinutes, 5);
});

test('filterTasks correctly filters by view, search, and category', () => {
  const tasks: Task[] = [
    {
      id: 't1',
      title: 'Prepare Slide Deck',
      priority: 'urgent',
      category: 'Work',
      dueDate: '2026-10-23',
      estimatedMinutes: 45,
      actualMinutes: 0,
      completed: false,
      isTopPriority: true,
      recurring: 'none',
      subtasks: [],
      createdAt: '2026-10-23T08:00:00Z',
    },
    {
      id: 't2',
      title: 'Buy Groceries',
      priority: 'low',
      category: 'Personal',
      dueDate: '2026-10-24',
      estimatedMinutes: 30,
      actualMinutes: 0,
      completed: false,
      isTopPriority: false,
      recurring: 'none',
      subtasks: [],
      createdAt: '2026-10-23T08:00:00Z',
    },
  ];

  // Test view: today
  const todayOnly = filterTasks(tasks, 'today', '', 'all', 'all', 'dueDate', '2026-10-23');
  assert.equal(todayOnly.length, 1);
  assert.equal(todayOnly[0].id, 't1');

  // Test view: upcoming
  const upcoming = filterTasks(tasks, 'upcoming', '', 'all', 'all', 'dueDate', '2026-10-23');
  assert.equal(upcoming.length, 1);
  assert.equal(upcoming[0].id, 't2');

  // Test search
  const searched = filterTasks(tasks, 'all', 'deck', 'all', 'all', 'dueDate', '2026-10-23');
  assert.equal(searched.length, 1);
  assert.equal(searched[0].id, 't1');
});

test('formatMinutes produces expected human readable output', () => {
  assert.equal(formatMinutes(0), '0m');
  assert.equal(formatMinutes(45), '45m');
  assert.equal(formatMinutes(60), '1h');
  assert.equal(formatMinutes(125), '2h 5m');
});
