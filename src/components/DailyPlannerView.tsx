import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { TimeBlock, Category } from '../types';
import { getTodayDateString } from '../utils/seedData';
import { Plus, Clock, CheckCircle2, Circle, Trash2, Calendar, Link as LinkIcon, X } from 'lucide-react';

export const DailyPlannerView: React.FC = () => {
  const { timeBlocks, addTimeBlock, deleteTimeBlock, toggleTimeBlockComplete, tasks } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [category, setCategory] = useState<Category>('Work');
  const [selectedTaskId, setSelectedTaskId] = useState<string>('');
  const [error, setError] = useState('');

  const todayStr = getTodayDateString();
  const todayBlocks = timeBlocks
    .filter((b) => b.date === todayStr)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const handleCreateBlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    if (startTime >= endTime) {
      setError('End time must be after start time');
      return;
    }

    addTimeBlock({
      title: title.trim(),
      date: todayStr,
      startTime,
      endTime,
      category,
      taskId: selectedTaskId || undefined,
      completed: false,
    });

    setIsModalOpen(false);
    setTitle('');
    setSelectedTaskId('');
    setError('');
  };

  const handleTaskSelection = (taskId: string) => {
    setSelectedTaskId(taskId);
    const matched = tasks.find((t) => t.id === taskId);
    if (matched && !title) {
      setTitle(matched.title);
      setCategory(matched.category);
    }
  };

  // Generate 24-hour slots or daytime hours from 07:00 to 21:00
  const hours = Array.from({ length: 15 }, (_, i) => i + 7); // 7 AM to 9 PM

  const categoryColors: Record<Category, string> = {
    Work: 'border-l-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-700 dark:text-indigo-300',
    Personal: 'border-l-blue-500 bg-blue-50/50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-300',
    Health: 'border-l-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300',
    Study: 'border-l-purple-500 bg-purple-50/50 dark:bg-purple-950/20 text-purple-700 dark:text-purple-300',
    Finance: 'border-l-amber-500 bg-amber-50/50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-300',
    Creative: 'border-l-rose-500 bg-rose-50/50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-300',
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Time Blocking Architecture
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-1">
            Today's Scheduled Flow
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Allocate focused hours to single intentions to eliminate multitasking.
          </p>
        </div>

        <button
          onClick={() => {
            setError('');
            setIsModalOpen(true);
          }}
          className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Time Block</span>
        </button>
      </div>

      {/* Timeline Schedule */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm p-6 space-y-4">
        {todayBlocks.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            No time blocks scheduled for today yet. Plan your morning, deep work, and evening blocks!
          </div>
        ) : (
          <div className="space-y-3">
            {todayBlocks.map((block) => (
              <div
                key={block.id}
                className={`flex items-center justify-between p-4 rounded-xl border border-slate-200/70 dark:border-slate-800 transition-all ${
                  block.completed
                    ? 'opacity-60 bg-slate-50 dark:bg-slate-800/40'
                    : 'bg-white dark:bg-slate-800/60 shadow-sm'
                }`}
              >
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => toggleTimeBlockComplete(block.id)}
                    className="text-slate-400 hover:text-emerald-500 transition-colors"
                    aria-label={`Toggle completion for ${block.title}`}
                  >
                    {block.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    ) : (
                      <Circle className="w-5 h-5" />
                    )}
                  </button>

                  <div>
                    <h4
                      className={`text-sm font-semibold ${
                        block.completed
                          ? 'line-through text-slate-400'
                          : 'text-slate-900 dark:text-white'
                      }`}
                    >
                      {block.title}
                    </h4>
                    <div className="flex items-center gap-2 mt-1 text-xs text-slate-500 dark:text-slate-400">
                      <span className="font-mono tabular-nums font-medium text-indigo-600 dark:text-indigo-400">
                        {block.startTime} – {block.endTime}
                      </span>
                      <span>·</span>
                      <span>{block.category}</span>
                      {block.taskId && (
                        <>
                          <span>·</span>
                          <span className="flex items-center gap-1 text-[11px] text-slate-400">
                            <LinkIcon className="w-3 h-3" /> Linked Task
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => deleteTimeBlock(block.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors"
                  aria-label={`Delete ${block.title}`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Time Block Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="block-modal-title"
        >
          <div className="relative w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <h3 id="block-modal-title" className="text-base font-bold text-slate-900 dark:text-white">
                Schedule Time Block
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs">
                {error}
              </div>
            )}

            <form onSubmit={handleCreateBlock} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Optional: Link to an existing task
                </label>
                <select
                  value={selectedTaskId}
                  onChange={(e) => handleTaskSelection(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                >
                  <option value="">-- No linked task (custom event) --</option>
                  {tasks
                    .filter((t) => !t.completed)
                    .map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.title}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Block Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Deep Work: Q4 Strategy"
                  className="w-full px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as Category)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                >
                  <option value="Work">Work</option>
                  <option value="Personal">Personal</option>
                  <option value="Health">Health</option>
                  <option value="Study">Study</option>
                  <option value="Finance">Finance</option>
                  <option value="Creative">Creative</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg"
                >
                  Schedule Block
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
