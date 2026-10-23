import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { TaskItem } from './TaskItem';
import { TaskModal } from './TaskModal';
import { Task } from '../types';
import { filterTasks } from '../utils/productivity';
import { getTodayDateString } from '../utils/seedData';
import { Plus, Search, Filter, ArrowUpDown, Star, CheckCircle2, Calendar } from 'lucide-react';

export const TasksView: React.FC = () => {
  const { tasks, addTask, updateTask } = useApp();

  const [activeView, setActiveView] = useState<'today' | 'upcoming' | 'overdue' | 'completed' | 'all'>('today');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [sortBy, setSortBy] = useState('dueDate');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);

  const todayStr = getTodayDateString();

  // Top 3 Priorities
  const topPriorities = tasks.filter((t) => t.isTopPriority && !t.completed);

  // Filtered tasks list
  const filteredTasks = filterTasks(
    tasks,
    activeView,
    searchQuery,
    categoryFilter,
    priorityFilter,
    sortBy,
    todayStr
  );

  const handleOpenCreateModal = () => {
    setTaskToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (task: Task) => {
    setTaskToEdit(task);
    setIsModalOpen(true);
  };

  const handleSaveTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'actualMinutes' | 'completed'>) => {
    if (taskToEdit) {
      updateTask(taskToEdit.id, taskData);
    } else {
      addTask(taskData);
    }
  };

  // Counts for tabs
  const todayCount = tasks.filter((t) => !t.completed && t.dueDate === todayStr).length;
  const overdueCount = tasks.filter((t) => !t.completed && t.dueDate < todayStr).length;
  const upcomingCount = tasks.filter((t) => !t.completed && t.dueDate > todayStr).length;
  const completedCount = tasks.filter((t) => t.completed).length;

  return (
    <div className="space-y-6">
      {/* Top 3 Priorities Highlight Section */}
      <section className="rounded-2xl border border-indigo-100 dark:border-indigo-950/80 bg-gradient-to-br from-indigo-50/50 via-white to-slate-50 dark:from-slate-900 dark:via-indigo-950/20 dark:to-slate-900 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 dark:bg-amber-500/20 flex items-center justify-center text-amber-500">
              <Star className="w-4 h-4 fill-amber-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Today's Top 3 Priorities
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Focus on high-leverage outcomes first ({topPriorities.length}/3 selected)
              </p>
            </div>
          </div>
        </div>

        {topPriorities.length === 0 ? (
          <div className="py-4 text-center rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/40">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              No top priorities selected yet. Click the star icon on any task to pin it here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {topPriorities.map((task) => (
              <TaskItem key={task.id} task={task} onEdit={handleOpenEditModal} />
            ))}
          </div>
        )}
      </section>

      {/* Control Bar: Tabs, Search, Filters, Add Button */}
      <div className="space-y-3">
        {/* View Tabs & Primary CTA */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Segmented View Tabs (Functional buttons with click handlers) */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl overflow-x-auto scrollbar-none">
            <button
              onClick={() => setActiveView('today')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap shrink-0 transition-all ${
                activeView === 'today'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Today ({todayCount})
            </button>
            <button
              onClick={() => setActiveView('upcoming')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap shrink-0 transition-all ${
                activeView === 'upcoming'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Upcoming ({upcomingCount})
            </button>
            <button
              onClick={() => setActiveView('overdue')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap shrink-0 transition-all ${
                activeView === 'overdue'
                  ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Overdue ({overdueCount})
            </button>
            <button
              onClick={() => setActiveView('completed')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap shrink-0 transition-all ${
                activeView === 'completed'
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Completed ({completedCount})
            </button>
            <button
              onClick={() => setActiveView('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap shrink-0 transition-all ${
                activeView === 'all'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              All ({tasks.length})
            </button>
          </div>

          {/* New Task Button */}
          <button
            onClick={handleOpenCreateModal}
            className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>New Task</span>
          </button>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="all">All Categories</option>
            <option value="Work">Work</option>
            <option value="Personal">Personal</option>
            <option value="Health">Health</option>
            <option value="Study">Study</option>
            <option value="Finance">Finance</option>
            <option value="Creative">Creative</option>
          </select>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="dueDate">Sort by Due Date</option>
            <option value="priority">Sort by Priority</option>
            <option value="duration">Sort by Duration</option>
            <option value="title">Sort Alphabetically</option>
          </select>
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-2.5">
        {filteredTasks.length === 0 ? (
          <div className="py-12 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 p-6">
            <CheckCircle2 className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              No tasks found
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              {searchQuery || categoryFilter !== 'all' || priorityFilter !== 'all'
                ? 'Try adjusting your search query or filters.'
                : 'All clear! Add a new task to organize your day.'}
            </p>
            <button
              onClick={handleOpenCreateModal}
              className="mt-4 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors inline-flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Task</span>
            </button>
          </div>
        ) : (
          filteredTasks.map((task) => (
            <TaskItem key={task.id} task={task} onEdit={handleOpenEditModal} />
          ))
        )}
      </div>

      {/* Task Creation & Editing Modal */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTask}
        taskToEdit={taskToEdit}
      />
    </div>
  );
};
