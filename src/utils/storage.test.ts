import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateRestoredTimer, importAllData, PersistentTimerData } from './storage';

test('calculateRestoredTimer returns default focus state when no saved data', () => {
  const result = calculateRestoredTimer(null, 1000000, 1500);
  assert.equal(result.mode, 'focus');
  assert.equal(result.timeLeft, 1500);
  assert.equal(result.isRunning, false);
  assert.equal(result.completedWhileAway, false);
});

test('calculateRestoredTimer restores exact paused time when isRunning is false', () => {
  const saved: PersistentTimerData = {
    mode: 'focus',
    timeLeft: 820,
    isRunning: false,
    activeTaskId: 'task-123',
    targetDuration: 1500,
    sessionStartTime: '2026-10-23T10:00:00Z',
    lastTimestamp: 1000000,
  };
  // 5 minutes later, but paused:
  const result = calculateRestoredTimer(saved, 1000000 + 300 * 1000, 1500);
  assert.equal(result.timeLeft, 820);
  assert.equal(result.isRunning, false);
  assert.equal(result.activeTaskId, 'task-123');
  assert.equal(result.completedWhileAway, false);
});

test('calculateRestoredTimer decrements elapsed seconds when timer was actively running', () => {
  const saved: PersistentTimerData = {
    mode: 'focus',
    timeLeft: 1200,
    isRunning: true,
    activeTaskId: 'task-1',
    targetDuration: 1500,
    sessionStartTime: '2026-10-23T10:00:00Z',
    lastTimestamp: 1000000,
  };
  // 45 seconds later
  const result = calculateRestoredTimer(saved, 1000000 + 45 * 1000, 1500);
  assert.equal(result.timeLeft, 1200 - 45);
  assert.equal(result.isRunning, true);
  assert.equal(result.completedWhileAway, false);
});

test('calculateRestoredTimer flags completedWhileAway if away longer than remaining seconds', () => {
  const saved: PersistentTimerData = {
    mode: 'focus',
    timeLeft: 300,
    isRunning: true,
    activeTaskId: 'task-1',
    targetDuration: 1500,
    sessionStartTime: '2026-10-23T10:00:00Z',
    lastTimestamp: 1000000,
  };
  // 600 seconds later (exceeded 300s remaining)
  const result = calculateRestoredTimer(saved, 1000000 + 600 * 1000, 1500);
  assert.equal(result.timeLeft, 0);
  assert.equal(result.isRunning, false);
  assert.equal(result.completedWhileAway, true);
  assert.equal(result.awayMinutes, 25);
});

test('importAllData parses and validates complete DAYFLOW export archive', () => {
  const rawExport = JSON.stringify({
    version: '2.0',
    app: 'DAYFLOW',
    data: {
      tasks: [{ id: 't1', title: 'Task 1', category: 'Work', priority: 'high', completed: false, dueDate: '2026-10-23', estimatedMinutes: 25, actualMinutes: 0, isTopPriority: true, recurring: 'none', subtasks: [] }],
      habits: [],
      sessions: [],
    },
  });

  const res = importAllData(rawExport);
  assert.equal(res.success, true);
  assert.equal(res.data?.tasks.length, 1);
  assert.equal(res.data?.tasks[0].title, 'Task 1');
});

test('importAllData handles invalid JSON gracefully', () => {
  const res = importAllData('not a valid json string');
  assert.equal(res.success, false);
  assert.equal(res.error, 'Failed to parse JSON backup.');
});
