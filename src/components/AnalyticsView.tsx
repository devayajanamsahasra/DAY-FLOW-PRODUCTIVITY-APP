import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  calculateWeeklyTrends,
  calculateCategoryBreakdown,
  calculatePlannedVsActual,
  formatMinutes,
} from '../utils/productivity';
import { getDateOffset, getTodayDateString } from '../utils/seedData';
import {
  BarChart3,
  PieChart,
  TrendingUp,
  Clock,
  CheckCircle2,
  Calendar,
  Flame,
  ArrowUpRight,
  Download,
} from 'lucide-react';

export const AnalyticsView: React.FC = () => {
  const { tasks, sessions, habits, settings, exportData } = useApp();
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  const todayStr = getTodayDateString();

  // Past 7 days dates
  const weekDates = Array.from({ length: 7 }, (_, i) => getDateOffset(i - 6));
  const weeklyTrends = calculateWeeklyTrends(sessions, tasks, weekDates);
  const categoryBreakdown = calculateCategoryBreakdown(tasks, sessions);
  const plannedVsActual = calculatePlannedVsActual(tasks);

  // Aggregates
  const totalFocusMinutes = sessions
    .filter((s) => s.mode === 'focus')
    .reduce((sum, s) => sum + s.durationMinutes, 0);

  const totalBreakMinutes = sessions
    .filter((s) => s.mode !== 'focus')
    .reduce((sum, s) => sum + s.durationMinutes, 0);

  const completedTasksCount = tasks.filter((t) => t.completed).length;
  const totalSessionsCount = sessions.filter((s) => s.mode === 'focus').length;

  // Max focus minutes in past 7 days for bar chart scale
  const maxWeeklyFocus = Math.max(1, ...weeklyTrends.map((d) => d.focusMinutes));

  // 90-Day Activity Heatmap Data
  const last90Days = Array.from({ length: 90 }, (_, i) => {
    const dStr = getDateOffset(i - 89);
    const daySessions = sessions.filter(
      (s) => s.mode === 'focus' && (s.completedAt || s.startedAt).split('T')[0] === dStr
    );
    const dayTasks = tasks.filter((t) => t.completed && t.completedAt?.split('T')[0] === dStr);
    const intensity = Math.min(4, daySessions.length + dayTasks.length);
    return {
      date: dStr,
      focusMins: daySessions.reduce((acc, s) => acc + s.durationMinutes, 0),
      tasksDone: dayTasks.length,
      intensity, // 0 = none, 1 = low, 2 = med, 3 = high, 4 = max
    };
  });

  const heatmapColors = [
    'bg-slate-100 dark:bg-slate-800',
    'bg-indigo-200 dark:bg-indigo-950',
    'bg-indigo-400 dark:bg-indigo-700',
    'bg-indigo-600 dark:bg-indigo-500',
    'bg-indigo-700 dark:bg-indigo-400',
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner & Export Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Real Analytics Engine
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-1">
            Productivity & Time Intelligence
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Grounded entirely in your actual saved focus sessions, habit logs, and completed tasks.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => exportData('csv')}
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl transition-colors flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => exportData('json')}
            className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Total Deep Work</span>
            <Clock className="w-4 h-4 text-indigo-500" />
          </div>
          <span className="text-2xl font-extrabold font-mono text-slate-900 dark:text-white tabular-nums">
            {formatMinutes(totalFocusMinutes)}
          </span>
          <span className="block text-[11px] text-slate-400 mt-1">
            Across {totalSessionsCount} focus blocks
          </span>
        </div>

        <div className="p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Recharge & Breaks</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <span className="text-2xl font-extrabold font-mono text-slate-900 dark:text-white tabular-nums">
            {formatMinutes(totalBreakMinutes)}
          </span>
          <span className="block text-[11px] text-slate-400 mt-1">
            Intentional rest time
          </span>
        </div>

        <div className="p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Completed Tasks</span>
            <CheckCircle2 className="w-4 h-4 text-blue-500" />
          </div>
          <span className="text-2xl font-extrabold font-mono text-slate-900 dark:text-white tabular-nums">
            {completedTasksCount}
          </span>
          <span className="block text-[11px] text-slate-400 mt-1">
            Out of {tasks.length} total tasks
          </span>
        </div>

        <div className="p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Active Habits</span>
            <Flame className="w-4 h-4 text-amber-500" />
          </div>
          <span className="text-2xl font-extrabold font-mono text-slate-900 dark:text-white tabular-nums">
            {habits.length}
          </span>
          <span className="block text-[11px] text-slate-400 mt-1">
            Top streak: {Math.max(0, ...habits.map((h) => h.bestStreak))} days
          </span>
        </div>
      </div>

      {/* Main Charts Split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Focus Time Bar Chart */}
        <div className="p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-indigo-500" />
              <span>Weekly Focus & Break Time</span>
            </h3>
            <div className="flex items-center gap-3 text-xs font-medium text-slate-500">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded bg-indigo-600 inline-block" /> Focus
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded bg-emerald-400 inline-block" /> Break
              </span>
            </div>
          </div>

          <div className="h-48 flex items-end justify-between gap-2 pt-6">
            {weeklyTrends.map((day) => {
              const focusHeightPercent = Math.max(4, Math.round((day.focusMinutes / maxWeeklyFocus) * 100));
              const breakHeightPercent = Math.max(0, Math.round((day.breakMinutes / maxWeeklyFocus) * 100));

              return (
                <div key={day.date} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group relative">
                  {/* Tooltip */}
                  <div className="absolute -top-12 z-20 hidden group-hover:block bg-slate-900 text-white text-[10px] py-1 px-2 rounded shadow-md pointer-events-none whitespace-nowrap">
                    <div>{day.dayName} ({day.date}):</div>
                    <div>Focus: {formatMinutes(day.focusMinutes)}</div>
                    <div>Break: {formatMinutes(day.breakMinutes)}</div>
                    <div>Tasks done: {day.tasksCompleted}</div>
                  </div>

                  {/* Bars stack */}
                  <div className="w-full max-w-[32px] flex flex-col justify-end h-full">
                    <div
                      className="w-full bg-emerald-400 dark:bg-emerald-500 rounded-t-sm"
                      style={{ height: `${breakHeightPercent}%` }}
                    />
                    <div
                      className="w-full bg-indigo-600 hover:bg-indigo-500 rounded-t-sm transition-all"
                      style={{ height: `${focusHeightPercent}%` }}
                    />
                  </div>

                  {/* Day label */}
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                    {day.dayName}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Category Breakdown Progress */}
        <div className="p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <PieChart className="w-4 h-4 text-indigo-500" />
              <span>Category Distribution</span>
            </h3>
            <span className="text-xs text-slate-400">By focus minutes</span>
          </div>

          <div className="space-y-3.5 pt-2">
            {categoryBreakdown.map((cat) => (
              <div key={cat.category} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {cat.category}
                  </span>
                  <div className="flex items-center gap-2 font-mono tabular-nums text-slate-500 dark:text-slate-400">
                    <span>{formatMinutes(cat.focusMinutes)}</span>
                    <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">
                      ({cat.percent}%)
                    </span>
                  </div>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(2, cat.percent)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Planned vs Actual Duration Table */}
      <div className="p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Planned vs Actual Task Time
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Total Planned: <strong className="font-mono text-slate-700 dark:text-slate-300">{formatMinutes(plannedVsActual.totalPlannedMinutes)}</strong> · Actual Logged: <strong className="font-mono text-indigo-600 dark:text-indigo-400">{formatMinutes(plannedVsActual.totalActualMinutes)}</strong>
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400">
                <th className="py-2.5 font-semibold">Task Title</th>
                <th className="py-2.5 font-semibold text-right">Planned</th>
                <th className="py-2.5 font-semibold text-right">Actual</th>
                <th className="py-2.5 font-semibold text-right">Variance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {plannedVsActual.taskComparisons.slice(0, 5).map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                  <td className="py-2.5 font-medium text-slate-800 dark:text-slate-200 truncate max-w-xs">
                    {t.title}
                  </td>
                  <td className="py-2.5 text-right font-mono tabular-nums text-slate-500">
                    {formatMinutes(t.planned)}
                  </td>
                  <td className="py-2.5 text-right font-mono tabular-nums text-indigo-600 dark:text-indigo-400 font-semibold">
                    {formatMinutes(t.actual)}
                  </td>
                  <td className={`py-2.5 text-right font-mono tabular-nums font-semibold ${t.diff > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                    {t.diff > 0 ? `+${t.diff}m` : t.diff < 0 ? `${t.diff}m` : 'On track'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 90-Day Activity Heatmap */}
      <div className="p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-500" />
            <span>90-Day Activity Heatmap</span>
          </h3>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
            <span>Less</span>
            {heatmapColors.map((cls, idx) => (
              <span key={idx} className={`w-3 h-3 rounded-sm ${cls} inline-block`} />
            ))}
            <span>More</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5 pt-2">
          {last90Days.map((cell) => (
            <div
              key={cell.date}
              className={`w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-sm ${heatmapColors[cell.intensity]} transition-transform hover:scale-125 cursor-pointer`}
              title={`${cell.date}: ${cell.focusMins}m focus · ${cell.tasksDone} tasks done`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
