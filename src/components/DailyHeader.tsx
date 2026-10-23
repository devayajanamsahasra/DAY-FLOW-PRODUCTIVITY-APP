import React, { useState, useEffect } from 'react';
import { getDailyQuote } from '../utils/quotes';
import { getTodayDateString } from '../utils/seedData';
import { useApp } from '../context/AppContext';
import { Quote as QuoteIcon, Heart, Copy, Share2, Check } from 'lucide-react';

export const DailyHeader: React.FC = () => {
  const { showToast } = useApp();
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [copied, setCopied] = useState<boolean>(false);
  const [favoriteQuotes, setFavoriteQuotes] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('dayflow_favorite_quotes');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Keep date updated accurately
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDate(new Date());
    }, 1000 * 60); // every minute
    return () => clearInterval(timer);
  }, []);

  const todayStr = getTodayDateString();
  const dailyQuote = getDailyQuote(todayStr);

  const formattedDate = currentDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  // Time-of-day greeting
  const hour = currentDate.getHours();
  let greeting = 'Good morning';
  let greetingSub = 'Make today intentional and clear.';
  if (hour >= 12 && hour < 17) {
    greeting = 'Good afternoon';
    greetingSub = 'Keep up the momentum and stay focused.';
  } else if (hour >= 17 && hour < 22) {
    greeting = 'Good evening';
    greetingSub = 'Reflect on wins and wind down mindfully.';
  } else if (hour >= 22 || hour < 5) {
    greeting = 'Night Owl session';
    greetingSub = 'Quiet hours for deep, uninterrupted creative focus.';
  }

  const isFavorited = favoriteQuotes.includes(dailyQuote.id);

  const toggleFavorite = () => {
    let updated: string[];
    if (isFavorited) {
      updated = favoriteQuotes.filter((id) => id !== dailyQuote.id);
      showToast('Removed from favorite quotes.');
    } else {
      updated = [...favoriteQuotes, dailyQuote.id];
      showToast('Saved quote to favorites!');
    }
    setFavoriteQuotes(updated);
    try {
      localStorage.setItem('dayflow_favorite_quotes', JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const copyQuote = async () => {
    const text = `"${dailyQuote.quote}" — ${dailyQuote.author} (via DAYFLOW)`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      showToast('Quote copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast('Failed to copy to clipboard.');
    }
  };

  const shareQuote = async () => {
    const text = `"${dailyQuote.quote}" — ${dailyQuote.author}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Daily Inspiration from DAYFLOW',
          text,
          url: window.location.href,
        });
      } catch {
        // User cancelled or share dismissed
      }
    } else {
      copyQuote();
    }
  };

  return (
    <div className="mb-8">
      {/* Date & Greeting */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-5">
        <div>
          <div className="text-xs font-semibold tracking-wider uppercase text-indigo-600 dark:text-indigo-400 mb-1">
            {formattedDate}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {greeting}, Achiever
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {greetingSub}
          </p>
        </div>
      </div>

      {/* Motivational Quote Banner */}
      <div className="relative overflow-hidden rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 sm:p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="hidden sm:flex w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 items-center justify-center shrink-0 text-indigo-600 dark:text-indigo-400">
            <QuoteIcon className="w-5 h-5" />
          </div>

          <div className="flex-1">
            <p className="text-sm sm:text-base italic text-slate-700 dark:text-slate-200 font-medium leading-relaxed">
              "{dailyQuote.quote}"
            </p>
            <div className="flex items-center justify-between mt-3 flex-wrap gap-2">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 tracking-wide">
                — {dailyQuote.author}
              </span>

              {/* Quote Actions */}
              <div className="flex items-center gap-1">
                <button
                  onClick={toggleFavorite}
                  className={`p-1.5 rounded-md text-xs flex items-center gap-1 transition-colors ${
                    isFavorited
                      ? 'text-rose-600 bg-rose-50 dark:bg-rose-950/40'
                      : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                  title={isFavorited ? 'Remove from favorites' : 'Save to favorites'}
                  aria-label="Save quote to favorites"
                >
                  <Heart className={`w-3.5 h-3.5 ${isFavorited ? 'fill-rose-500 text-rose-500' : ''}`} />
                  <span className="text-[11px] font-medium hidden sm:inline">
                    {isFavorited ? 'Saved' : 'Save'}
                  </span>
                </button>

                <button
                  onClick={copyQuote}
                  className="p-1.5 rounded-md text-xs flex items-center gap-1 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  title="Copy quote text"
                  aria-label="Copy quote to clipboard"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span className="text-[11px] font-medium hidden sm:inline">
                    {copied ? 'Copied' : 'Copy'}
                  </span>
                </button>

                <button
                  onClick={shareQuote}
                  className="p-1.5 rounded-md text-xs flex items-center gap-1 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  title="Share quote"
                  aria-label="Share quote"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span className="text-[11px] font-medium hidden sm:inline">Share</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
