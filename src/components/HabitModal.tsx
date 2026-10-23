import React, { useState, useEffect } from 'react';
import { Category, Habit } from '../types';
import { X } from 'lucide-react';

interface HabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (habit: Omit<Habit, 'id' | 'createdAt' | 'currentStreak' | 'bestStreak' | 'completedDates'>) => void;
  habitToEdit?: Habit | null;
}

export const HabitModal: React.FC<HabitModalProps> = ({ isOpen, onClose, onSave, habitToEdit }) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<Category>('Health');
  const [targetDays, setTargetDays] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]); // All days by default
  const [reminderTime, setReminderTime] = useState('08:00');
  const [color, setColor] = useState('indigo');
  const [error, setError] = useState('');

  const dayLabels = [
    { num: 1, label: 'Mon' },
    { num: 2, label: 'Tue' },
    { num: 3, label: 'Wed' },
    { num: 4, label: 'Thu' },
    { num: 5, label: 'Fri' },
    { num: 6, label: 'Sat' },
    { num: 0, label: 'Sun' },
  ];

  const categories: Category[] = ['Health', 'Work', 'Personal', 'Study', 'Creative', 'Finance'];
  const colors = [
    { id: 'indigo', bg: 'bg-indigo-500' },
    { id: 'emerald', bg: 'bg-emerald-500' },
    { id: 'violet', bg: 'bg-violet-500' },
    { id: 'amber', bg: 'bg-amber-500' },
    { id: 'rose', bg: 'bg-rose-500' },
    { id: 'cyan', bg: 'bg-cyan-500' },
  ];

  useEffect(() => {
    if (habitToEdit) {
      setTitle(habitToEdit.title);
      setCategory(habitToEdit.category);
      setTargetDays(habitToEdit.targetDays || [0, 1, 2, 3, 4, 5, 6]);
      setReminderTime(habitToEdit.reminderTime || '08:00');
      setColor(habitToEdit.color || 'indigo');
    } else {
      setTitle('');
      setCategory('Health');
      setTargetDays([0, 1, 2, 3, 4, 5, 6]);
      setReminderTime('08:00');
      setColor('indigo');
    }
    setError('');
  }, [habitToEdit, isOpen]);

  if (!isOpen) return null;

  const toggleDay = (dayNum: number) => {
    if (targetDays.includes(dayNum)) {
      if (targetDays.length === 1) return; // keep at least 1 day
      setTargetDays(targetDays.filter((d) => d !== dayNum));
    } else {
      setTargetDays([...targetDays, dayNum]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Habit title is required');
      return;
    }
    onSave({
      title: title.trim(),
      category,
      targetDays,
      reminderTime: reminderTime || undefined,
      color,
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="habit-modal-title"
    >
      <div className="relative w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl p-6 transition-all">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
          <h2 id="habit-modal-title" className="text-base font-bold text-slate-900 dark:text-white">
            {habitToEdit ? 'Edit Habit' : 'Create New Habit'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label htmlFor="habit-title-input" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Habit Name <span className="text-rose-500">*</span>
            </label>
            <input
              id="habit-title-input"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Read 20 pages, Morning Run"
              className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              autoFocus
            />
          </div>

          {/* Category */}
          <div>
            <label htmlFor="habit-cat-select" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Category
            </label>
            <select
              id="habit-cat-select"
              value={category}
              onChange={(e) => setCategory(e.target.value as Category)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Target Days */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Weekly Schedule
            </label>
            <div className="flex gap-1.5 justify-between">
              {dayLabels.map((d) => {
                const isSelected = targetDays.includes(d.num);
                return (
                  <button
                    key={d.num}
                    type="button"
                    onClick={() => toggleDay(d.num)}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                      isSelected
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {d.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Reminder Time */}
          <div>
            <label htmlFor="habit-reminder-time" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Optional Daily Reminder Time
            </label>
            <input
              id="habit-reminder-time"
              type="time"
              value={reminderTime}
              onChange={(e) => setReminderTime(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Color theme */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Accent Color
            </label>
            <div className="flex items-center gap-3">
              {colors.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setColor(c.id)}
                  className={`w-7 h-7 rounded-full ${c.bg} flex items-center justify-center transition-transform ${
                    color === c.id ? 'ring-2 ring-offset-2 ring-indigo-500 scale-110' : 'opacity-80 hover:opacity-100'
                  }`}
                  aria-label={`Select ${c.id} color`}
                />
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
            >
              {habitToEdit ? 'Save Changes' : 'Create Habit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
