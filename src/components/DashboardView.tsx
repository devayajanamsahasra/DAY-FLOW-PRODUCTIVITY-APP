import React from 'react';
import { useApp } from '../context/AppContext';
import { DailyHeader } from './DailyHeader';
import { TaskItem } from './TaskItem';
import {
  Clock,
  CheckCircle2,
  Play,
  Pause,
  Flame,
  Award,
  Sparkles,
  ArrowRight,
  Sprout,
  Calendar,
  Check,
} from 'lucide-react';
import { formatMinutes } from '../utils/productivity';
import { getTodayDateString } from '../utils/seedData';

export const DashboardView: React.FC<{ onOpenTaskModal: () => void; onEditTask: (t: any) => void }> = ({
  onOpenTaskModal,
  onEditTask,
}) => {
  const {
    tasks,
    sessions,
    habits,
    plants,
    dailyQuests,
    settings,
    timerMode,
    timeLeft,
    isRunning,
    startTimer,
    pauseTimer,
    setActiveTab,
    toggleHabitDay,
  } = useApp();

  const todayStr = getTodayDateString();

  // Metrics for today
  const todaySessions = sessions.filter(
    (s) => s.completedAt.split('T')[0] === todayStr && s.mode === 'focus'
  );
  const todayFocusMinutes = todaySessions.reduce((acc, s) => acc + s.durationMinutes, 0);
  const dailyGoalMinutes = settings.dailyFocusGoalMinutes || 120;
  const goalPercent = Math.min(100, Math.round((todayFocusMinutes / dailyGoalMinutes) * 100));

  const topPriorities = tasks.filter((t) => t.isTopPriority && !t.completed);
  const activePlant = plants.find((p) => p.stage < 5) || plants[0];

  const habitsScheduledToday = habits.filter((h) => {
    const dayOfWeek = new Date().getDay();
    return h.targetDays.includes(dayOfWeek);
  });

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTimer = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return (
    <div className="space-y-8">
      {/* Live Date, Time, and Motivational Quote */}
      <DailyHeader />

      {/* Hero Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Daily Focus Goal Widget */}
        <div className="p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                Daily Focus Goal
              </span>
              <Clock className="w-4 h-4 text-indigo-500" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold font-mono text-slate-900 dark:text-white tabular-nums">
                {formatMinutes(todayFocusMinutes)}
              </span>
              <span className="text-xs font-medium text-slate-400">
                / {formatMinutes(dailyGoalMinutes)} target
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {goalPercent >= 100
                ? 'Target achieved! Outstanding focus today.'
                : `${dailyGoalMinutes - todayFocusMinutes} minutes remaining to reach your goal.`}
            </p>
          </div>

          <div className="mt-5 space-y-1.5">
            <div className="flex justify-between text-[11px] font-mono font-medium text-slate-500">
              <span>Goal Progress</span>
              <span className="tabular-nums font-bold">{goalPercent}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                style={{ width: `${goalPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Quick Pomodoro Widget */}
        <div className="p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Current Flow
              </span>
              <span className="text-xs font-mono capitalize px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 font-medium">
                {timerMode}
              </span>
            </div>
            <div className="text-3xl font-extrabold font-mono text-slate-900 dark:text-white tabular-nums tracking-tight">
              {formattedTimer}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {isRunning ? 'Timer is active in background' : 'Ready to start your next session'}
            </p>
          </div>

          <div className="mt-5 flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={isRunning ? pauseTimer : startTimer}
              className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg flex items-center gap-1.5 transition-colors"
            >
              {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
              <span>{isRunning ? 'Pause' : 'Start Focus'}</span>
            </button>

            <button
              onClick={() => setActiveTab('timer')}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              <span>Full Timer</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Focus Garden Progress Preview */}
        <div className="p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                Focus Garden
              </span>
              <Sprout className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-slate-900 dark:text-white truncate">
                {activePlant ? activePlant.name : 'Flourishing Flora'}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Stage {activePlant?.stage || 1} of 5 · {activePlant?.growthPoints || 0}% Growth Points
            </p>
          </div>

          <div className="mt-5 flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
            <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
              {plants.filter((p) => p.stage === 5).length} fully bloomed
            </span>
            <button
              onClick={() => setActiveTab('garden')}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              <span>Visit Garden</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Top 3 Priorities Section */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Today's Top 3 Priorities
            </h2>
          </div>
          <button
            onClick={() => setActiveTab('tasks')}
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
          >
            <span>View All Tasks ({tasks.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {topPriorities.length === 0 ? (
          <div className="p-6 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 text-center">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              No top priorities selected for today. Star tasks in your list to keep them front and center.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {topPriorities.map((task) => (
              <TaskItem key={task.id} task={task} onEdit={onEditTask} />
            ))}
          </div>
        )}
      </section>

      {/* Split: Daily Quests & Habits Checklist */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Quests Card */}
        <div className="p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Daily Productivity Quests
              </h3>
            </div>
            <span className="text-xs font-mono text-slate-500">
              {dailyQuests.filter((q) => q.completed).length}/{dailyQuests.length} Complete
            </span>
          </div>

          <div className="space-y-3">
            {dailyQuests.map((quest) => (
              <div
                key={quest.id}
                className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/40 space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      {quest.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      {quest.description}
                    </p>
                  </div>
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                      quest.completed
                        ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                        : 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                    }`}
                  >
                    {quest.completed ? 'COMPLETED' : `+${quest.xp} XP`}
                  </span>
                </div>

                <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                  <div
                    className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, (quest.current / quest.target) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Daily Habits Quick Checklist */}
        <div className="p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-emerald-500" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Today's Habits
              </h3>
            </div>
            <button
              onClick={() => setActiveTab('habits')}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Full Tracker
            </button>
          </div>

          <div className="space-y-2">
            {habitsScheduledToday.map((habit) => {
              const isDone = habit.completedDates.includes(todayStr);
              return (
                <div
                  key={habit.id}
                  onClick={() => toggleHabitDay(habit.id, todayStr)}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                    isDone
                      ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/60'
                      : 'bg-slate-50/50 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors ${
                        isDone
                          ? 'bg-emerald-500 text-white'
                          : 'border border-slate-300 dark:border-slate-600 text-transparent'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                    <span
                      className={`text-xs font-medium ${
                        isDone
                          ? 'line-through text-slate-400 dark:text-slate-500'
                          : 'text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      {habit.title}
                    </span>
                  </div>

                  <span className="text-[11px] font-mono text-amber-500 font-bold flex items-center gap-1">
                    <Flame className="w-3 h-3 fill-amber-400" />
                    {habit.currentStreak}d
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
