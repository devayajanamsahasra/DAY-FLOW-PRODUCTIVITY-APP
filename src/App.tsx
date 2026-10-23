import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { TasksView } from './components/TasksView';
import { FocusTimerView } from './components/FocusTimerView';
import { HabitTrackerView } from './components/HabitTrackerView';
import { DailyPlannerView } from './components/DailyPlannerView';
import { FocusGardenView } from './components/FocusGardenView';
import { AnalyticsView } from './components/AnalyticsView';
import { FocusModeModal } from './components/FocusModeModal';
import { WeeklyReflectionModal } from './components/WeeklyReflectionModal';
import { SettingsModal } from './components/SettingsModal';
import { TaskModal } from './components/TaskModal';
import { Toast } from './components/Toast';
import { Sparkles, Heart } from 'lucide-react';
import { Task } from './types';

const MainLayout: React.FC = () => {
  const { activeTab, setActiveTab, addTask, updateTask } = useApp();

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isReflectionOpen, setIsReflectionOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);

  const handleOpenCreateTask = () => {
    setTaskToEdit(null);
    setIsTaskModalOpen(true);
  };

  const handleOpenEditTask = (task: Task) => {
    setTaskToEdit(task);
    setIsTaskModalOpen(true);
  };

  const handleSaveTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'actualMinutes' | 'completed'>) => {
    if (taskToEdit) {
      updateTask(taskToEdit.id, taskData);
    } else {
      addTask(taskData);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Top Bar adhering to Top Bar Contract */}
      <Header onOpenSettings={() => setIsSettingsOpen(true)} />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'dashboard' && (
          <DashboardView
            onOpenTaskModal={handleOpenCreateTask}
            onEditTask={handleOpenEditTask}
          />
        )}
        {activeTab === 'tasks' && <TasksView />}
        {activeTab === 'timer' && <FocusTimerView />}
        {activeTab === 'habits' && <HabitTrackerView />}
        {activeTab === 'planner' && <DailyPlannerView />}
        {activeTab === 'garden' && <FocusGardenView />}
        {activeTab === 'analytics' && <AnalyticsView />}
      </main>

      {/* Minimal clean footer adhering to Anti-Slop guidelines */}
      <footer className="border-t border-slate-200 dark:border-slate-800/80 py-6 text-xs text-slate-500 dark:text-slate-400 bg-white/50 dark:bg-slate-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700 dark:text-slate-300">DAYFLOW</span>
            <span>·</span>
            <span>Make Every Minute Matter</span>
          </div>

          <div className="flex items-center gap-4 text-xs font-medium">
            <button
              onClick={() => setIsReflectionOpen(true)}
              className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              Weekly Reflection
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              Time Intelligence
            </button>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              Preferences
            </button>
          </div>
        </div>
      </footer>

      {/* Modals & Overlays */}
      <FocusModeModal />
      <WeeklyReflectionModal
        isOpen={isReflectionOpen}
        onClose={() => setIsReflectionOpen(false)}
      />
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSave={handleSaveTask}
        taskToEdit={taskToEdit}
      />
      <Toast />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
