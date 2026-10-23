import React, { useState, useEffect } from 'react';
import { Category, Priority, Subtask, Task } from '../types';
import { getTodayDateString } from '../utils/seedData';
import { X, Plus, Trash2, CheckCircle2, Star } from 'lucide-react';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Omit<Task, 'id' | 'createdAt' | 'actualMinutes' | 'completed'>) => void;
  taskToEdit?: Task | null;
}

export const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose, onSave, taskToEdit }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [category, setCategory] = useState<Category>('Work');
  const [dueDate, setDueDate] = useState(getTodayDateString());
  const [dueTime, setDueTime] = useState('17:00');
  const [estimatedMinutes, setEstimatedMinutes] = useState(30);
  const [isTopPriority, setIsTopPriority] = useState(false);
  const [recurring, setRecurring] = useState<'none' | 'daily' | 'weekdays' | 'weekly'>('none');
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title);
      setDescription(taskToEdit.description || '');
      setPriority(taskToEdit.priority);
      setCategory(taskToEdit.category);
      setDueDate(taskToEdit.dueDate);
      setDueTime(taskToEdit.dueTime || '17:00');
      setEstimatedMinutes(taskToEdit.estimatedMinutes || 30);
      setIsTopPriority(taskToEdit.isTopPriority);
      setRecurring(taskToEdit.recurring);
      setSubtasks(taskToEdit.subtasks || []);
      setNotes(taskToEdit.notes || '');
    } else {
      setTitle('');
      setDescription('');
      setPriority('medium');
      setCategory('Work');
      setDueDate(getTodayDateString());
      setDueTime('17:00');
      setEstimatedMinutes(30);
      setIsTopPriority(false);
      setRecurring('none');
      setSubtasks([]);
      setNotes('');
    }
    setError('');
  }, [taskToEdit, isOpen]);

  if (!isOpen) return null;

  const handleAddSubtask = () => {
    if (!newSubtaskTitle.trim()) return;
    setSubtasks([
      ...subtasks,
      {
        id: `sub-${Date.now()}`,
        title: newSubtaskTitle.trim(),
        completed: false,
      },
    ]);
    setNewSubtaskTitle('');
  };

  const handleRemoveSubtask = (id: string) => {
    setSubtasks(subtasks.filter((st) => st.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Task title is required');
      return;
    }

    onSave({
      title: title.trim(),
      description: description.trim() || undefined,
      priority,
      category,
      dueDate,
      dueTime: dueTime || undefined,
      estimatedMinutes: Number(estimatedMinutes) || 25,
      isTopPriority,
      recurring,
      subtasks,
      notes: notes.trim() || undefined,
    });
    onClose();
  };

  const categories: Category[] = ['Work', 'Personal', 'Health', 'Study', 'Finance', 'Creative'];
  const priorities: { value: Priority; label: string }[] = [
    { value: 'urgent', label: 'Urgent' },
    { value: 'high', label: 'High' },
    { value: 'medium', label: 'Medium' },
    { value: 'low', label: 'Low' },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="task-modal-title"
    >
      <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl p-6 transition-all">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-5">
          <h2 id="task-modal-title" className="text-lg font-bold text-slate-900 dark:text-white">
            {taskToEdit ? 'Edit Task' : 'Create New Task'}
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
          <div className="mb-4 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label htmlFor="task-title-input" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Task Title <span className="text-rose-500">*</span>
            </label>
            <input
              id="task-title-input"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Finalize presentation deck"
              className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              autoFocus
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="task-desc-input" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Description & Outcome
            </label>
            <textarea
              id="task-desc-input"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What defines completion for this task?"
              className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Priority & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="task-priority-select" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Priority
              </label>
              <select
                id="task-priority-select"
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {priorities.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="task-category-select" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Category
              </label>
              <select
                id="task-category-select"
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
          </div>

          {/* Due Date & Due Time & Duration */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label htmlFor="task-due-date" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Due Date
              </label>
              <input
                id="task-due-date"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label htmlFor="task-due-time" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Due Time
              </label>
              <input
                id="task-due-time"
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label htmlFor="task-duration" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Est. Duration (mins)
              </label>
              <select
                id="task-duration"
                value={estimatedMinutes}
                onChange={(e) => setEstimatedMinutes(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value={15}>15 mins</option>
                <option value={25}>25 mins (1 Pomodoro)</option>
                <option value={30}>30 mins</option>
                <option value={45}>45 mins</option>
                <option value={60}>60 mins (1 hour)</option>
                <option value={90}>90 mins</option>
                <option value={120}>120 mins (2 hours)</option>
              </select>
            </div>
          </div>

          {/* Top 3 Priorities & Recurring */}
          <div className="flex flex-wrap items-center justify-between gap-4 py-2 border-t border-b border-slate-100 dark:border-slate-800">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={isTopPriority}
                onChange={(e) => setIsTopPriority(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 dark:border-slate-600 dark:bg-slate-800"
              />
              <div className="flex items-center gap-1.5">
                <Star className={`w-3.5 h-3.5 ${isTopPriority ? 'fill-amber-400 text-amber-500' : 'text-slate-400'}`} />
                <span>Mark as Top 3 Priority for Today</span>
              </div>
            </label>

            <div className="flex items-center gap-2">
              <label htmlFor="task-recurrence" className="text-xs text-slate-500 dark:text-slate-400">
                Repeat:
              </label>
              <select
                id="task-recurrence"
                value={recurring}
                onChange={(e) => setRecurring(e.target.value as any)}
                className="px-2.5 py-1 text-xs rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300"
              >
                <option value="none">Does not repeat</option>
                <option value="daily">Daily</option>
                <option value="weekdays">Weekdays (Mon-Fri)</option>
                <option value="weekly">Weekly</option>
              </select>
            </div>
          </div>

          {/* Subtasks */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Subtasks ({subtasks.filter((st) => st.completed).length}/{subtasks.length})
            </label>
            <div className="space-y-1.5 mb-2">
              {subtasks.map((st) => (
                <div
                  key={st.id}
                  className="flex items-center justify-between gap-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60"
                >
                  <span className={`text-xs text-slate-700 dark:text-slate-200 ${st.completed ? 'line-through text-slate-400 dark:text-slate-500' : ''}`}>
                    {st.title}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSubtask(st.id)}
                    className="p-1 text-slate-400 hover:text-rose-500 transition-colors"
                    aria-label={`Remove subtask ${st.title}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSubtask();
                  }
                }}
                placeholder="Add a subtask step..."
                className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <button
                type="button"
                onClick={handleAddSubtask}
                className="px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-sm"
            >
              {taskToEdit ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
