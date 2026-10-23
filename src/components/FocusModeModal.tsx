import React from 'react';
import { useApp } from '../context/AppContext';
import { Play, Pause, X, Volume2, RotateCcw, SkipForward, Sparkles } from 'lucide-react';
import { soundEngine } from '../utils/audio';

export const FocusModeModal: React.FC = () => {
  const {
    isFocusModeOpen,
    setIsFocusModeOpen,
    timerMode,
    timeLeft,
    isRunning,
    startTimer,
    pauseTimer,
    resetTimer,
    skipTimer,
    activeTaskId,
    tasks,
    settings,
    updateSettings,
  } = useApp();

  if (!isFocusModeOpen) return null;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeDisplay = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const activeTask = tasks.find((t) => t.id === activeTaskId);

  const ambientOptions: Array<{ id: 'none' | 'rain' | 'forest' | 'waves' | 'whitenoise'; label: string }> = [
    { id: 'none', label: 'Silence' },
    { id: 'rain', label: 'Rain drizzle' },
    { id: 'forest', label: 'Forest wind' },
    { id: 'waves', label: 'Ocean waves' },
    { id: 'whitenoise', label: 'Soft white noise' },
  ];

  const handleAmbientChange = (type: 'none' | 'rain' | 'forest' | 'waves' | 'whitenoise') => {
    updateSettings({ ambientSound: type });
    if (type === 'none') {
      soundEngine.stopAmbient();
    } else {
      soundEngine.startAmbient(type, settings.soundVolume);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col justify-between bg-slate-950 text-white p-6 sm:p-12 animate-fade-in"
      role="dialog"
      aria-modal="true"
    >
      {/* Top Bar: Active Task & Exit */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse" />
          <span className="text-xs uppercase font-mono tracking-widest text-slate-400">
            Zen Focus Chamber
          </span>
        </div>

        <button
          onClick={() => setIsFocusModeOpen(false)}
          className="p-2.5 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          aria-label="Exit Zen focus mode"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Focus Area: Big Timer & Task */}
      <div className="flex flex-col items-center justify-center my-auto max-w-2xl mx-auto text-center space-y-6">
        {activeTask ? (
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
              Primary Objective
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              {activeTask.title}
            </h2>
            {activeTask.description && (
              <p className="text-sm text-slate-400 max-w-lg mx-auto">
                {activeTask.description}
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
              Freeform Focus
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Single-Task Clarity
            </h2>
            <p className="text-sm text-slate-400">
              Quiet the noise, eliminate tabs, and pour your attention into this block.
            </p>
          </div>
        )}

        {/* Big Countdown */}
        <div className="text-7xl sm:text-9xl font-black font-mono tabular-nums tracking-tighter text-indigo-400 drop-shadow-md">
          {timeDisplay}
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-6 pt-4">
          <button
            onClick={resetTimer}
            className="p-4 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            title="Reset timer"
            aria-label="Reset timer"
          >
            <RotateCcw className="w-6 h-6" />
          </button>

          <button
            onClick={isRunning ? pauseTimer : startTimer}
            className="w-20 h-20 rounded-3xl bg-indigo-600 hover:bg-indigo-500 flex items-center justify-center text-white shadow-xl shadow-indigo-600/30 transition-transform hover:scale-105 active:scale-95"
            aria-label={isRunning ? 'Pause timer' : 'Start timer'}
          >
            {isRunning ? (
              <Pause className="w-8 h-8 fill-white" />
            ) : (
              <Play className="w-8 h-8 fill-white ml-1" />
            )}
          </button>

          <button
            onClick={skipTimer}
            className="p-4 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            title="Complete / Skip session"
            aria-label="Skip session"
          >
            <SkipForward className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Bottom Bar: Ambient Sound Generator Selector */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-900 pt-6">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Volume2 className="w-4 h-4 text-indigo-400" />
          <span>Ambient Audio:</span>
          <div className="flex items-center gap-1.5 flex-wrap">
            {ambientOptions.map((opt) => (
              <button
                key={opt.id}
                onClick={() => handleAmbientChange(opt.id)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  settings.ambientSound === opt.id
                    ? 'bg-indigo-600 text-white font-semibold'
                    : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <span className="text-[11px] text-slate-500 font-mono">
          Press ESC or click (X) to return
        </span>
      </div>
    </div>
  );
};
