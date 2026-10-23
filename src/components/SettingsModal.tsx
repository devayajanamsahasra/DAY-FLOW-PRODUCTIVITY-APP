import React from 'react';
import { useApp } from '../context/AppContext';
import { AccentColor } from '../types';
import {
  X,
  Volume2,
  Clock,
  Palette,
  Download,
  RotateCcw,
  Sun,
  Moon,
  ShieldCheck,
  Check,
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { settings, updateSettings, resetToDefaultData, exportData, importData } = useApp();

  if (!isOpen) return null;

  const accentColors: Array<{ id: AccentColor; name: string; bg: string }> = [
    { id: 'indigo', name: 'Indigo Flow', bg: 'bg-indigo-600' },
    { id: 'emerald', name: 'Emerald Calm', bg: 'bg-emerald-600' },
    { id: 'violet', name: 'Violet Zen', bg: 'bg-violet-600' },
    { id: 'amber', name: 'Amber Glow', bg: 'bg-amber-600' },
    { id: 'rose', name: 'Rose Bloom', bg: 'bg-rose-600' },
    { id: 'cyan', name: 'Cyan Clarity', bg: 'bg-cyan-600' },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-modal-title"
    >
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl p-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-5">
          <h2 id="settings-modal-title" className="text-base font-bold text-slate-900 dark:text-white">
            Preferences & Personalization
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6 text-xs">
          {/* Appearance: Theme & Accent Color */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Palette className="w-4 h-4 text-indigo-500" />
              <span>Theme & Accent Color</span>
            </h3>

            {/* Dark / Light Toggle */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
              <span className="text-slate-700 dark:text-slate-300 font-medium">Interface Theme</span>
              <div className="flex items-center gap-1 p-1 bg-slate-200/80 dark:bg-slate-700 rounded-lg">
                <button
                  type="button"
                  onClick={() => updateSettings({ theme: 'light' })}
                  className={`px-3 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 ${
                    settings.theme === 'light'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 dark:text-slate-300'
                  }`}
                >
                  <Sun className="w-3.5 h-3.5 text-amber-500" />
                  <span>Light</span>
                </button>
                <button
                  type="button"
                  onClick={() => updateSettings({ theme: 'dark' })}
                  className={`px-3 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 ${
                    settings.theme === 'dark'
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-300'
                  }`}
                >
                  <Moon className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Dark</span>
                </button>
              </div>
            </div>

            {/* Accent Color picker */}
            <div>
              <span className="block text-slate-700 dark:text-slate-300 font-medium mb-2">
                Brand Accent Palette
              </span>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {accentColors.map((color) => (
                  <button
                    key={color.id}
                    type="button"
                    onClick={() => updateSettings({ accentColor: color.id })}
                    className={`p-2 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                      settings.accentColor === color.id
                        ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 ring-1 ring-indigo-600'
                        : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span className={`w-5 h-5 rounded-full ${color.bg}`} />
                    <span className="text-[10px] text-slate-600 dark:text-slate-400 font-medium truncate w-full text-center">
                      {color.name.split(' ')[0]}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Timer Durations */}
          <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-500" />
              <span>Pomodoro Durations</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1">
                  Focus Session (mins)
                </label>
                <input
                  type="number"
                  min={5}
                  max={120}
                  value={settings.focusDuration}
                  onChange={(e) => updateSettings({ focusDuration: Number(e.target.value) || 25 })}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1">
                  Short Break (mins)
                </label>
                <input
                  type="number"
                  min={1}
                  max={30}
                  value={settings.shortBreakDuration}
                  onChange={(e) =>
                    updateSettings({ shortBreakDuration: Number(e.target.value) || 5 })
                  }
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1">
                  Long Break (mins)
                </label>
                <input
                  type="number"
                  min={5}
                  max={60}
                  value={settings.longBreakDuration}
                  onChange={(e) =>
                    updateSettings({ longBreakDuration: Number(e.target.value) || 15 })
                  }
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
                />
              </div>
            </div>

            {/* Daily Goal */}
            <div>
              <label className="block text-slate-600 dark:text-slate-400 mb-1">
                Daily Focus Target Goal (mins): Currently {settings.dailyFocusGoalMinutes} mins (
                {Math.floor(settings.dailyFocusGoalMinutes / 60)}h{' '}
                {settings.dailyFocusGoalMinutes % 60}m)
              </label>
              <input
                type="range"
                min={30}
                max={480}
                step={15}
                value={settings.dailyFocusGoalMinutes}
                onChange={(e) =>
                  updateSettings({ dailyFocusGoalMinutes: Number(e.target.value) })
                }
                className="w-full accent-indigo-600"
              />
            </div>
          </div>

          {/* Sound Volume */}
          <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-indigo-500" />
              <span>Audio Chimes & Volume</span>
            </h3>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-700 dark:text-slate-300">Sound enabled</span>
                <input
                  type="checkbox"
                  checked={settings.soundEnabled}
                  onChange={(e) => updateSettings({ soundEnabled: e.target.checked })}
                  className="w-4 h-4 rounded text-indigo-600"
                />
              </div>

              <div className="flex items-center justify-between gap-4">
                <span className="text-slate-700 dark:text-slate-300">Volume level</span>
                <input
                  type="range"
                  min={0.1}
                  max={1}
                  step={0.1}
                  value={settings.soundVolume}
                  onChange={(e) => updateSettings({ soundVolume: Number(e.target.value) })}
                  className="w-32 accent-indigo-600"
                />
              </div>
            </div>
          </div>

          {/* Data Persistence, Export & Import */}
          <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Local Storage Persistence & Backups</span>
              </h3>
              <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded">
                Auto-saved
              </span>
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Your tasks, habits, daily planner blocks, and active focus timer progress are continuously saved to your browser's persistent storage. Even if you refresh or reopen the tab, your timer accurately computes elapsed seconds and preserves all changes.
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => exportData('json')}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export JSON Backup</span>
              </button>

              <button
                type="button"
                onClick={() => exportData('csv')}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>

              <label className="px-3 py-1.5 rounded-lg border border-indigo-200 dark:border-indigo-800 bg-indigo-50/60 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 font-medium cursor-pointer transition-colors flex items-center gap-1.5">
                <span>Import JSON</span>
                <input
                  type="file"
                  accept=".json,application/json"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        const content = event.target?.result as string;
                        if (content) {
                          const ok = importData(content);
                          if (ok) onClose();
                        }
                      };
                      reader.readAsText(file);
                    }
                  }}
                />
              </label>

              <button
                type="button"
                onClick={() => {
                  if (confirm('Reset all tasks, habits, and sessions to default demo data?')) {
                    resetToDefaultData();
                    onClose();
                  }
                }}
                className="px-3 py-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 font-medium ml-auto flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset to Seed Data</span>
              </button>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-5 border-t border-slate-100 dark:border-slate-800 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
