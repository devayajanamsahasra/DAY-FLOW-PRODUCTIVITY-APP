import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Habit } from '../types';
import { HabitModal } from './HabitModal';
import { getTodayDateString, getDateOffset } from '../utils/seedData';
import {
  Plus,
  Flame,
  Trophy,
  Check,
  Calendar,
  MoreVertical,
  Edit2,
  Trash2,
  Sparkles,
} from 'lucide-react';

export const HabitTrackerView: React.FC = () => {
  const { habits, addHabit, updateHabit, deleteHabit, toggleHabitDay } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [habitToEdit, setHabitToEdit] = useState<Habit | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [calendarView, setCalendarView] = useState<'week' | 'month'>('week');

  const todayStr = getTodayDateString();

  // Generate the last 7 days (or current week)
  const past7Days = Array.from({ length: 7 }, (_, i) => {
    const offset = i - 6; // -6, -5, ..., 0 (today)
    const dStr = getDateOffset(offset);
    const date = new Date(dStr + 'T00:00:00');
    return {
      dateStr: dStr,
      dayNumber: date.getDay(),
      dayName: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()],
      dateNumber: date.getDate(),
      isToday: dStr === todayStr,
    };
  });

  const handleCreate = () => {
    setHabitToEdit(null);
    setIsModalOpen(true);
  };

  const handleEdit = (habit: Habit) => {
    setHabitToEdit(habit);
    setIsModalOpen(true);
    setActiveMenuId(null);
  };

  // Overall completion rate today
  const habitsScheduledToday = habits.filter((h) => {
    const dayOfWeek = new Date().getDay();
    return h.targetDays.includes(dayOfWeek);
  });
  const habitsDoneToday = habitsScheduledToday.filter((h) =>
    h.completedDates.includes(todayStr)
  ).length;
  const todayProgressPercent =
    habitsScheduledToday.length > 0
      ? Math.round((habitsDoneToday / habitsScheduledToday.length) * 100)
      : 0;

  return (
    <div className="space-y-6">
      {/* Top Banner: Habit Consistency & Motivation */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            Daily Momentum
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-1">
            Build Rituals That Last
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-lg">
            Track daily consistency, maintain unstoppable streaks, and compound small daily wins into life-changing mastery.
          </p>
        </div>

        {/* Today's Habit Progress ring */}
        <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800/60 px-5 py-3.5 rounded-2xl border border-slate-100 dark:border-slate-800">
          <div className="text-right">
            <span className="block text-2xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">
              {habitsDoneToday}/{habitsScheduledToday.length}
            </span>
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
              Completed Today ({todayProgressPercent}%)
            </span>
          </div>
          <div className="w-12 h-12 rounded-full border-4 border-slate-200 dark:border-slate-700 flex items-center justify-center text-xs font-bold font-mono text-slate-700 dark:text-slate-200">
            {todayProgressPercent}%
          </div>
        </div>
      </div>

      {/* Control bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
          <button
            onClick={() => setCalendarView('week')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              calendarView === 'week'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Weekly Grid
          </button>
          <button
            onClick={() => setCalendarView('month')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              calendarView === 'month'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Monthly Heatmap
          </button>
        </div>

        <button
          onClick={handleCreate}
          className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-sm flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>New Habit</span>
        </button>
      </div>

      {/* Weekly Grid View */}
      {calendarView === 'week' ? (
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
          {/* Header Row: Days of Week */}
          <div className="grid grid-cols-12 gap-2 p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <div className="col-span-5 sm:col-span-4 pl-2">Habit</div>
            <div className="col-span-5 sm:col-span-6 grid grid-cols-7 gap-1 text-center">
              {past7Days.map((d) => (
                <div key={d.dateStr} className={`py-1 rounded ${d.isToday ? 'text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-50 dark:bg-indigo-950/50' : ''}`}>
                  <span className="block text-[10px] uppercase">{d.dayName}</span>
                  <span className="text-xs font-mono">{d.dateNumber}</span>
                </div>
              ))}
            </div>
            <div className="col-span-2 text-right pr-2">Streak</div>
          </div>

          {/* Habit Rows */}
          {habits.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              No habits created yet. Click "New Habit" to start building your daily rituals!
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {habits.map((habit) => {
                return (
                  <div
                    key={habit.id}
                    className="grid grid-cols-12 gap-2 p-4 items-center hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                  >
                    {/* Habit Title & Category */}
                    <div className="col-span-5 sm:col-span-4 flex items-center gap-3 min-w-0 pr-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 shrink-0" />
                      <div className="min-w-0">
                        <span className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white truncate block">
                          {habit.title}
                        </span>
                        <span className="text-[11px] text-slate-400 dark:text-slate-500">
                          {habit.category}
                        </span>
                      </div>
                    </div>

                    {/* 7-Day Completion Buttons */}
                    <div className="col-span-5 sm:col-span-6 grid grid-cols-7 gap-1">
                      {past7Days.map((d) => {
                        const isDone = habit.completedDates.includes(d.dateStr);
                        const isScheduled = habit.targetDays.includes(d.dayNumber);

                        return (
                          <div key={d.dateStr} className="flex items-center justify-center">
                            <button
                              onClick={() => toggleHabitDay(habit.id, d.dateStr)}
                              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                                isDone
                                  ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/20 hover:bg-emerald-600'
                                  : isScheduled
                                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                                  : 'bg-transparent text-slate-300 dark:text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800'
                              } ${d.isToday ? 'ring-2 ring-indigo-500/40' : ''}`}
                              title={`${habit.title} on ${d.dateStr}`}
                              aria-label={`Toggle ${habit.title} on ${d.dateStr}`}
                            >
                              {isDone ? (
                                <Check className="w-4 h-4 stroke-[3]" />
                              ) : isScheduled ? (
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600" />
                              ) : (
                                <span className="text-[10px] text-slate-300 dark:text-slate-600">-</span>
                              )}
                            </button>
                          </div>
                        );
                      })}
                    </div>

                    {/* Streaks & Menu */}
                    <div className="col-span-2 flex items-center justify-end gap-2 pr-2">
                      <div className="flex items-center gap-1 text-xs font-mono tabular-nums text-amber-500 font-bold">
                        <Flame className="w-4 h-4 fill-amber-400" />
                        <span>{habit.currentStreak}d</span>
                      </div>

                      {/* Dropdown Menu */}
                      <div className="relative">
                        <button
                          onClick={() => setActiveMenuId(activeMenuId === habit.id ? null : habit.id)}
                          className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-md"
                          aria-label="Habit options"
                        >
                          <MoreVertical className="w-3.5 h-3.5" />
                        </button>

                        {activeMenuId === habit.id && (
                          <div
                            className="absolute right-0 top-6 z-20 w-32 py-1 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-lg text-xs"
                            onMouseLeave={() => setActiveMenuId(null)}
                          >
                            <button
                              onClick={() => handleEdit(habit)}
                              className="w-full px-3 py-1.5 flex items-center gap-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 text-left"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                              <span>Edit</span>
                            </button>
                            <button
                              onClick={() => {
                                deleteHabit(habit.id);
                                setActiveMenuId(null);
                              }}
                              className="w-full px-3 py-1.5 flex items-center gap-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-left"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Delete</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* Monthly Heatmap View (Last 30 days) */
        <div className="p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-6">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-500" />
            <span>30-Day Consistency Heatmaps</span>
          </h3>

          <div className="space-y-6">
            {habits.map((habit) => {
              const last30Days = Array.from({ length: 30 }, (_, i) => {
                const offset = i - 29;
                return getDateOffset(offset);
              });

              return (
                <div key={habit.id} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      {habit.title}
                    </span>
                    <span className="text-xs font-mono text-slate-500">
                      Best Streak: <strong className="text-indigo-600 dark:text-indigo-400">{habit.bestStreak} days</strong>
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {last30Days.map((dStr) => {
                      const isDone = habit.completedDates.includes(dStr);
                      return (
                        <div
                          key={dStr}
                          className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-mono transition-colors ${
                            isDone
                              ? 'bg-emerald-500 text-white font-bold'
                              : 'bg-slate-200 dark:bg-slate-700/60 text-slate-400'
                          }`}
                          title={`${dStr}: ${isDone ? 'Completed' : 'Not completed'}`}
                        >
                          {dStr.slice(-2)}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Habit Modal */}
      <HabitModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={(data) => {
          if (habitToEdit) {
            updateHabit(habitToEdit.id, data);
          } else {
            addHabit(data);
          }
        }}
        habitToEdit={habitToEdit}
      />
    </div>
  );
};
