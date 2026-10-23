import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatMinutes } from '../utils/productivity';
import { getTodayDateString, getDateOffset } from '../utils/seedData';
import { X, Sparkles, Star, Trophy, Clock, CheckCircle2 } from 'lucide-react';

interface WeeklyReflectionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WeeklyReflectionModal: React.FC<WeeklyReflectionModalProps> = ({ isOpen, onClose }) => {
  const { tasks, sessions, saveReflection, reflections } = useApp();

  const [achievements, setAchievements] = useState('');
  const [obstacles, setObstacles] = useState('');
  const [improvements, setImprovements] = useState('');
  const [rating, setRating] = useState<number>(5);

  if (!isOpen) return null;

  // Past 7 days calculations
  const today = getTodayDateString();
  const weekStart = getDateOffset(-6);

  const completedTasksThisWeek = tasks.filter((t) => {
    if (!t.completed || !t.completedAt) return false;
    const d = t.completedAt.split('T')[0];
    return d >= weekStart && d <= today;
  }).length;

  const focusMinutesThisWeek = sessions
    .filter((s) => {
      const d = (s.completedAt || s.startedAt).split('T')[0];
      return s.mode === 'focus' && d >= weekStart && d <= today;
    })
    .reduce((sum, s) => sum + s.durationMinutes, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveReflection({
      weekStartDate: weekStart,
      achievements: achievements.trim() || 'Consistent execution and focused sessions.',
      obstacles: obstacles.trim() || 'Minor context switching and notifications.',
      improvements: improvements.trim() || 'Schedule protected morning deep-work blocks.',
      rating,
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl p-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-500" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Weekly Reflection & Review
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Weekly Stats Summary */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="p-3.5 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60">
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 mb-1">
              <Clock className="w-4 h-4" />
              <span className="text-xs font-semibold">Weekly Focus</span>
            </div>
            <span className="text-xl font-bold font-mono text-slate-900 dark:text-white">
              {formatMinutes(focusMinutesThisWeek)}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/60">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 mb-1">
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-xs font-semibold">Tasks Completed</span>
            </div>
            <span className="text-xl font-bold font-mono text-slate-900 dark:text-white">
              {completedTasksThisWeek} tasks
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Rating */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              How satisfied are you with this week's discipline?
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="p-1 transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-5 h-5 ${
                      star <= rating
                        ? 'fill-amber-400 text-amber-500'
                        : 'text-slate-300 dark:text-slate-600'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Wins */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              What were your key wins and completed outcomes?
            </label>
            <textarea
              rows={2}
              value={achievements}
              onChange={(e) => setAchievements(e.target.value)}
              placeholder="e.g. Completed roadmap proposal, exercised 4 times"
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400"
            />
          </div>

          {/* Obstacles */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              What frictions or distractions emerged?
            </label>
            <textarea
              rows={2}
              value={obstacles}
              onChange={(e) => setObstacles(e.target.value)}
              placeholder="e.g. Afternoon energy dips, too many slack messages"
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400"
            />
          </div>

          {/* Improvement */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              What one adjustment will you make next week?
            </label>
            <textarea
              rows={2}
              value={improvements}
              onChange={(e) => setImprovements(e.target.value)}
              placeholder="e.g. Schedule my top 3 the night before, 9am focus block"
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg"
            >
              Save Reflection
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
