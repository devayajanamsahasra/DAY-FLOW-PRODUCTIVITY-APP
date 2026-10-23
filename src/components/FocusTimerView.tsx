import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { TimerMode } from '../types';
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  Bell,
  BellOff,
  Clock,
  CheckCircle2,
  ListTodo,
  Volume2,
  VolumeX,
  Info,
  Maximize2,
} from 'lucide-react';
import { formatMinutes } from '../utils/productivity';

export const FocusTimerView: React.FC = () => {
  const {
    timerMode,
    timeLeft,
    isRunning,
    activeTaskId,
    setActiveTaskId,
    startTimer,
    pauseTimer,
    resetTimer,
    skipTimer,
    setTimerMode,
    tasks,
    sessions,
    settings,
    updateSettings,
    notificationPermission,
    requestNotificationPermission,
    setIsFocusModeOpen,
  } = useApp();

  const [showNotificationHelp, setShowNotificationHelp] = useState(false);

  // Calculate total seconds for the active mode
  const totalSeconds =
    timerMode === 'focus'
      ? (settings.focusDuration || 25) * 60
      : timerMode === 'shortBreak'
      ? (settings.shortBreakDuration || 5) * 60
      : (settings.longBreakDuration || 15) * 60;

  const progressPercent = totalSeconds > 0 ? ((totalSeconds - timeLeft) / totalSeconds) * 100 : 0;

  // Format time display (MM:SS)
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeDisplay = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const activeTask = tasks.find((t) => t.id === activeTaskId);

  // SVG Circular progress math
  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  const handleModeChange = (mode: TimerMode) => {
    setTimerMode(mode);
  };

  const todaySessions = sessions.filter(
    (s) => s.completedAt.split('T')[0] === new Date().toISOString().split('T')[0]
  );
  const totalTodayFocusMins = todaySessions
    .filter((s) => s.mode === 'focus')
    .reduce((acc, s) => acc + s.durationMinutes, 0);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Timer Card */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm p-6 sm:p-10 text-center">
        {/* Top Controls: Mode Switcher */}
        <div className="inline-flex p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800 max-w-md mx-auto mb-8">
          <button
            onClick={() => handleModeChange('focus')}
            className={`px-5 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all ${
              timerMode === 'focus'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Focus ({settings.focusDuration}m)
          </button>
          <button
            onClick={() => handleModeChange('shortBreak')}
            className={`px-5 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all ${
              timerMode === 'shortBreak'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Short Break ({settings.shortBreakDuration}m)
          </button>
          <button
            onClick={() => handleModeChange('longBreak')}
            className={`px-5 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all ${
              timerMode === 'longBreak'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Long Break ({settings.longBreakDuration}m)
          </button>
        </div>

        {/* Circular Countdown Ring */}
        <div className="relative w-72 h-72 sm:w-80 sm:h-80 mx-auto flex items-center justify-center">
          <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 280 280">
            {/* Background circle track */}
            <circle
              cx="140"
              cy="140"
              r={radius}
              stroke="currentColor"
              strokeWidth="12"
              fill="transparent"
              className="text-slate-100 dark:text-slate-800"
            />
            {/* Animated progress stroke */}
            <circle
              cx="140"
              cy="140"
              r={radius}
              stroke="currentColor"
              strokeWidth="12"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className={`transition-all duration-300 ${
                timerMode === 'focus'
                  ? 'text-indigo-600 dark:text-indigo-500'
                  : timerMode === 'shortBreak'
                  ? 'text-emerald-500'
                  : 'text-blue-500'
              }`}
            />
          </svg>

          {/* Time text in center */}
          <div className="absolute flex flex-col items-center justify-center">
            <span className="text-5xl sm:text-6xl font-extrabold tracking-tight font-mono tabular-nums text-slate-900 dark:text-white">
              {timeDisplay}
            </span>
            <span className="text-xs uppercase font-semibold tracking-wider text-slate-400 dark:text-slate-500 mt-2">
              {isRunning
                ? timerMode === 'focus'
                  ? 'In Deep Flow'
                  : 'Resting & Recharging'
                : 'Paused'}
            </span>

            {/* Active task pill inside ring */}
            {activeTask && (
              <div className="mt-3 max-w-[200px] truncate text-xs font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-3 py-1 rounded-full">
                {activeTask.title}
              </div>
            )}
          </div>
        </div>

        {/* Controls: Start/Pause, Reset, Skip */}
        <div className="flex items-center justify-center gap-4 mt-8">
          <button
            onClick={resetTimer}
            className="p-3 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
            title="Reset timer to beginning"
            aria-label="Reset timer"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          {/* Big Play/Pause CTA */}
          <button
            onClick={isRunning ? pauseTimer : startTimer}
            className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white font-bold shadow-lg transition-transform hover:scale-105 active:scale-95 ${
              timerMode === 'focus'
                ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/25'
                : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/25'
            }`}
            aria-label={isRunning ? 'Pause timer' : 'Start timer'}
          >
            {isRunning ? (
              <Pause className="w-7 h-7 fill-white" />
            ) : (
              <Play className="w-7 h-7 fill-white ml-0.5" />
            )}
          </button>

          <button
            onClick={skipTimer}
            className="p-3 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
            title="Complete / Skip this session"
            aria-label="Skip session"
          >
            <SkipForward className="w-5 h-5" />
          </button>

          {/* Full Screen Zen Trigger */}
          <button
            onClick={() => setIsFocusModeOpen(true)}
            className="p-3 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
            title="Enter Zen Fullscreen Focus Mode"
            aria-label="Enter Zen focus mode"
          >
            <Maximize2 className="w-5 h-5" />
          </button>
        </div>

        {/* Task linking selector */}
        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 max-w-md mx-auto">
          <label htmlFor="timer-task-select" className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">
            Link Timer to a Specific Task:
          </label>
          <div className="flex items-center gap-2">
            <select
              id="timer-task-select"
              value={activeTaskId || ''}
              onChange={(e) => setActiveTaskId(e.target.value || null)}
              className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">No task linked (unassigned focus)</option>
              {tasks
                .filter((t) => !t.completed)
                .map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title} ({formatMinutes(t.estimatedMinutes)})
                  </option>
                ))}
            </select>
            {activeTaskId && (
              <button
                onClick={() => setActiveTaskId(null)}
                className="px-2.5 py-2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                title="Unlink task"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Preferences & Browser Notification Advisory */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Quick Settings & Audio */}
        <div className="p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-500" />
            <span>Timer & Audio Controls</span>
          </h3>

          <div className="space-y-3 text-xs">
            {/* Sound Toggle */}
            <div className="flex items-center justify-between">
              <span className="text-slate-700 dark:text-slate-300">Sound Chimes on Finish</span>
              <button
                onClick={() => updateSettings({ soundEnabled: !settings.soundEnabled })}
                className={`p-2 rounded-lg transition-colors ${
                  settings.soundEnabled
                    ? 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/50'
                    : 'text-slate-400 bg-slate-100 dark:bg-slate-800'
                }`}
                aria-label="Toggle sound chimes"
              >
                {settings.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>
            </div>

            {/* Auto Start Transitions */}
            <div className="flex items-center justify-between">
              <span className="text-slate-700 dark:text-slate-300">Auto-start Breaks</span>
              <input
                type="checkbox"
                checked={settings.autoStartBreaks}
                onChange={(e) => updateSettings({ autoStartBreaks: e.target.checked })}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-700 dark:text-slate-300">Auto-start Next Focus</span>
              <input
                type="checkbox"
                checked={settings.autoStartFocus}
                onChange={(e) => updateSettings({ autoStartFocus: e.target.checked })}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Browser Notifications & Operating System Limitations */}
        <div className="p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Bell className="w-4 h-4 text-indigo-500" />
              <span>Browser Notifications</span>
            </h3>
            <button
              onClick={() => setShowNotificationHelp(!showNotificationHelp)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              title="Notification info"
              aria-label="Notification limitations info"
            >
              <Info className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-600 dark:text-slate-300">
              Permission Status: <strong className="font-semibold capitalize">{notificationPermission}</strong>
            </span>
            {notificationPermission !== 'granted' && (
              <button
                onClick={requestNotificationPermission}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
              >
                Enable Alerts
              </button>
            )}
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-[11px] text-slate-500 dark:text-slate-400 space-y-1 leading-relaxed">
            <p>
              <strong>Reliability notice:</strong> Timer counts down accurately using real elapsed time even when you switch tabs.
            </p>
            {showNotificationHelp && (
              <p className="pt-1 text-slate-600 dark:text-slate-300">
                Note that standard browser security restrictions prevent notifications if your browser is closed entirely or if the operating system puts the device into sleep mode. When you awaken the device, the elapsed session completes automatically.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Today's Completed Sessions Log */}
      <div className="p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Today's Completed Sessions
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Total Focused Today: <strong className="text-indigo-600 dark:text-indigo-400 font-mono">{formatMinutes(totalTodayFocusMins)}</strong> across {todaySessions.filter((s) => s.mode === 'focus').length} focus blocks
            </p>
          </div>
        </div>

        {todaySessions.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-400">
            No completed sessions today yet. Start the timer to log your first session!
          </div>
        ) : (
          <div className="space-y-2">
            {todaySessions.map((s) => {
              const completedTime = new Date(s.completedAt).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              });
              return (
                <div
                  key={s.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2
                      className={`w-4 h-4 ${
                        s.mode === 'focus' ? 'text-indigo-500' : 'text-emerald-500'
                      }`}
                    />
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {s.mode === 'focus' ? 'Deep Focus Session' : 'Recharge Break'}
                    </span>
                    {s.taskTitle && (
                      <span className="text-slate-500 dark:text-slate-400 truncate max-w-[200px]">
                        — {s.taskTitle}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 font-mono tabular-nums text-slate-500 dark:text-slate-400">
                    <span>{s.durationMinutes} mins</span>
                    <span className="text-[11px]">{completedTime}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
