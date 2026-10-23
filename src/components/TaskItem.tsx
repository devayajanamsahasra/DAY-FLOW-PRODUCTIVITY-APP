import React, { useState } from 'react';
import { Task } from '../types';
import { useApp } from '../context/AppContext';
import {
  CheckCircle,
  Circle,
  Clock,
  Calendar,
  MoreVertical,
  Play,
  Copy,
  Trash2,
  Edit2,
  ChevronDown,
  ChevronUp,
  Star,
  CheckSquare,
  Square,
  AlertCircle,
} from 'lucide-react';
import { formatMinutes } from '../utils/productivity';
import { getTodayDateString } from '../utils/seedData';

interface TaskItemProps {
  task: Task;
  onEdit: (task: Task) => void;
}

export const TaskItem: React.FC<TaskItemProps> = ({ task, onEdit }) => {
  const {
    toggleTaskComplete,
    deleteTask,
    duplicateTask,
    toggleSubtask,
    toggleTopPriority,
    setActiveTaskId,
    setTimerMode,
    setActiveTab,
  } = useApp();

  const [isExpanded, setIsExpanded] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const todayStr = getTodayDateString();

  // Compute deadline status
  const isOverdue = !task.completed && task.dueDate < todayStr;
  const isDueToday = !task.completed && task.dueDate === todayStr;

  const handleStartFocus = () => {
    setActiveTaskId(task.id);
    setTimerMode('focus');
    setActiveTab('timer');
  };

  const priorityColors = {
    urgent: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900',
    high: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900',
    medium: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900',
    low: 'text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700',
  };

  return (
    <div
      className={`group rounded-xl border transition-all ${
        task.completed
          ? 'bg-slate-50/60 dark:bg-slate-900/40 border-slate-200/60 dark:border-slate-800/60 opacity-75'
          : isOverdue
          ? 'bg-white dark:bg-slate-900 border-rose-200 dark:border-rose-900/60 shadow-sm'
          : task.isTopPriority
          ? 'bg-white dark:bg-slate-900 border-indigo-200 dark:border-indigo-900/60 shadow-sm'
          : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm'
      }`}
    >
      <div className="p-4 flex items-start gap-3">
        {/* Checkbox button */}
        <button
          onClick={() => toggleTaskComplete(task.id)}
          className="mt-0.5 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors focus:outline-none"
          aria-label={task.completed ? `Mark "${task.title}" as incomplete` : `Complete "${task.title}"`}
        >
          {task.completed ? (
            <CheckCircle className="w-5 h-5 text-emerald-500 fill-emerald-100 dark:fill-emerald-950" />
          ) : (
            <Circle className="w-5 h-5" />
          )}
        </button>

        {/* Task Core Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3
              className={`text-sm font-semibold truncate ${
                task.completed
                  ? 'line-through text-slate-400 dark:text-slate-500'
                  : 'text-slate-900 dark:text-white'
              }`}
            >
              {task.title}
            </h3>

            {/* Top Priority Pin */}
            {task.isTopPriority && !task.completed && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded">
                <Star className="w-3 h-3 fill-indigo-500 text-indigo-500" />
                Top 3
              </span>
            )}
          </div>

          {task.description && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
              {task.description}
            </p>
          )}

          {/* Metadata: Category, Priority, Deadline, Time (Clean unboxed text separators) */}
          <div className="flex items-center gap-2 mt-2.5 text-[11px] text-slate-500 dark:text-slate-400 flex-wrap">
            <span className="font-medium text-slate-700 dark:text-slate-300">
              {task.category}
            </span>

            <span aria-hidden="true">·</span>

            {/* Priority */}
            <span className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-semibold tracking-wider ${priorityColors[task.priority]}`}>
              {task.priority}
            </span>

            <span aria-hidden="true">·</span>

            {/* Due date with indicator */}
            <div className={`flex items-center gap-1 ${isOverdue ? 'text-rose-600 dark:text-rose-400 font-semibold' : ''}`}>
              {isOverdue && <AlertCircle className="w-3 h-3" />}
              <Calendar className="w-3 h-3" />
              <span>
                {isDueToday
                  ? `Today${task.dueTime ? ` at ${task.dueTime}` : ''}`
                  : isOverdue
                  ? `Overdue (${task.dueDate})`
                  : task.dueDate}
              </span>
            </div>

            <span aria-hidden="true">·</span>

            {/* Duration */}
            <div className="flex items-center gap-1 font-mono tabular-nums">
              <Clock className="w-3 h-3" />
              <span>
                {task.actualMinutes > 0 ? `${task.actualMinutes}m / ` : ''}
                {formatMinutes(task.estimatedMinutes)}
              </span>
            </div>

            {/* Subtask progress count if present */}
            {task.subtasks && task.subtasks.length > 0 && (
              <>
                <span aria-hidden="true">·</span>
                <span className="font-mono tabular-nums">
                  {task.subtasks.filter((st) => st.completed).length}/{task.subtasks.length} subtasks
                </span>
              </>
            )}
          </div>
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Quick Focus Button */}
          {!task.completed && (
            <button
              onClick={handleStartFocus}
              className="px-2.5 py-1 text-xs font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900 rounded-lg flex items-center gap-1 transition-colors"
              title="Start Pomodoro timer for this task"
              aria-label={`Start focus session for ${task.title}`}
            >
              <Play className="w-3 h-3 fill-indigo-600 dark:fill-indigo-400" />
              <span className="hidden sm:inline">Focus</span>
            </button>
          )}

          {/* Top Priority Toggle */}
          <button
            onClick={() => toggleTopPriority(task.id)}
            className={`p-1.5 rounded-lg transition-colors ${
              task.isTopPriority
                ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/40'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
            }`}
            title={task.isTopPriority ? 'Unpin from Top 3' : 'Pin to Top 3'}
            aria-label="Toggle top priority"
          >
            <Star className={`w-4 h-4 ${task.isTopPriority ? 'fill-amber-400' : ''}`} />
          </button>

          {/* Expand Details button if subtasks or notes exist */}
          {(task.subtasks?.length > 0 || task.notes) && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition-colors"
              aria-label={isExpanded ? 'Collapse subtasks' : 'Expand subtasks'}
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          )}

          {/* Action Menu (Edit, Duplicate, Delete) */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition-colors"
              aria-label="More options"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showMenu && (
              <div
                className="absolute right-0 top-8 z-20 w-36 py-1 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-lg text-xs"
                onMouseLeave={() => setShowMenu(false)}
              >
                <button
                  onClick={() => {
                    setShowMenu(false);
                    onEdit(task);
                  }}
                  className="w-full px-3 py-1.5 flex items-center gap-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 text-left"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => {
                    setShowMenu(false);
                    duplicateTask(task.id);
                  }}
                  className="w-full px-3 py-1.5 flex items-center gap-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 text-left"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Duplicate</span>
                </button>
                <div className="h-px bg-slate-100 dark:bg-slate-700 my-1" />
                <button
                  onClick={() => {
                    setShowMenu(false);
                    deleteTask(task.id);
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

      {/* Expanded Details: Subtasks & Notes */}
      {isExpanded && (
        <div className="px-4 pb-4 pt-1 border-t border-slate-100 dark:border-slate-800 text-xs space-y-3">
          {task.notes && (
            <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300">
              <span className="font-semibold block mb-0.5">Notes:</span>
              <p className="whitespace-pre-line">{task.notes}</p>
            </div>
          )}

          {task.subtasks && task.subtasks.length > 0 && (
            <div>
              <span className="font-semibold text-slate-600 dark:text-slate-300 block mb-1.5">
                Subtasks checklist:
              </span>
              <div className="space-y-1">
                {task.subtasks.map((st) => (
                  <button
                    key={st.id}
                    onClick={() => toggleSubtask(task.id, st.id)}
                    className="w-full flex items-center gap-2 p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800/80 text-left transition-colors"
                  >
                    {st.completed ? (
                      <CheckSquare className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    ) : (
                      <Square className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    )}
                    <span className={`text-xs ${st.completed ? 'line-through text-slate-400' : 'text-slate-700 dark:text-slate-200'}`}>
                      {st.title}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
