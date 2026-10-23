import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { Sparkles, Sun, Moon, Maximize2, Settings as SettingsIcon } from 'lucide-react';

interface HeaderProps {
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSettings }) => {
  const { activeTab, setActiveTab, settings, updateSettings, setIsFocusModeOpen } = useApp();
  const [currentTime, setCurrentTime] = useState<string>('');

  // Live ticking clock updating every second
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'tasks', label: 'Tasks' },
    { id: 'timer', label: 'Focus Timer' },
    { id: 'habits', label: 'Habits' },
    { id: 'planner', label: 'Planner' },
    { id: 'garden', label: 'Garden' },
    { id: 'analytics', label: 'Analytics' },
  ];

  const toggleTheme = () => {
    updateSettings({ theme: settings.theme === 'dark' ? 'light' : 'dark' });
  };

  return (
    <header className="sticky top-0 z-30 w-full border-b border-slate-200 dark:border-slate-800 bg-white/85 dark:bg-slate-900/85 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-2.5 text-left group focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-md"
            aria-label="Go to DAYFLOW Dashboard"
          >
            <div className="w-8 h-8 rounded-lg bg-indigo-600 dark:bg-indigo-500 flex items-center justify-center text-white font-bold shadow-sm shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap">
              DAYFLOW
            </span>
          </button>

          {/* Live Clock Indicator */}
          <div className="hidden sm:flex items-center gap-1.5 pl-3 border-l border-slate-200 dark:border-slate-800 text-xs font-mono tabular-nums text-slate-500 dark:text-slate-400">
            <span>{currentTime}</span>
          </div>
        </div>

        {/* Zone 2: Navigation Links (1-2 words, single line) */}
        <nav
          className="hidden md:flex items-center gap-1 lg:gap-2 text-sm font-medium"
          aria-label="Main Navigation"
        >
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap shrink-0 transition-all ${
                  isActive
                    ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Primary Action & Controls */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Zen Full-Screen Focus Mode trigger */}
          <button
            onClick={() => setIsFocusModeOpen(true)}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors whitespace-nowrap shrink-0"
            title="Open Distraction-Free Zen Focus Mode"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>Zen Focus</span>
          </button>

          {/* Theme Switcher */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label={settings.theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {settings.theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-600" />
            )}
          </button>

          {/* Settings Modal */}
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Settings and Preferences"
          >
            <SettingsIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mobile navigation strip */}
      <div className="md:hidden flex items-center overflow-x-auto px-4 py-2 border-t border-slate-200 dark:border-slate-800 gap-1 scrollbar-none">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`px-3 py-1 text-xs font-medium rounded-md whitespace-nowrap shrink-0 transition-colors ${
                isActive
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </header>
  );
};
