import { Quote } from '../types';

export const QUOTES_COLLECTION: Quote[] = [
  {
    id: 'q1',
    quote: "Focus is not about saying yes to what you need to do, but saying no to a hundred other good ideas.",
    author: "Steve Jobs",
    category: "focus",
  },
  {
    id: 'q2',
    quote: "You do not rise to the level of your goals. You fall to the level of your systems.",
    author: "James Clear",
    category: "discipline",
  },
  {
    id: 'q3',
    quote: "Action isn't just the effect of motivation; it's also the cause of it.",
    author: "Mark Manson",
    category: "momentum",
  },
  {
    id: 'q4',
    quote: "Until we can manage time, we can manage nothing else.",
    author: "Peter F. Drucker",
    category: "time",
  },
  {
    id: 'q5',
    quote: "The key is not to prioritize what's on your schedule, but to schedule your priorities.",
    author: "Stephen Covey",
    category: "time",
  },
  {
    id: 'q6',
    quote: "Deep work is the ability to focus without distraction on a cognitively demanding task.",
    author: "Cal Newport",
    category: "focus",
  },
  {
    id: 'q7',
    quote: "Small daily improvements over time lead to stunning results.",
    author: "Robin Sharma",
    category: "momentum",
  },
  {
    id: 'q8',
    quote: "Discipline is choosing between what you want now and what you want most.",
    author: "Abraham Lincoln",
    category: "discipline",
  },
  {
    id: 'q9',
    quote: "Be present in all things and thankful for all things.",
    author: "Maya Angelou",
    category: "mindfulness",
  },
  {
    id: 'q10',
    quote: "Do the hard jobs first. The easy jobs will take care of themselves.",
    author: "Dale Carnegie",
    category: "discipline",
  },
  {
    id: 'q11',
    quote: "Time is what we want most, but what we use worst.",
    author: "William Penn",
    category: "time",
  },
  {
    id: 'q12',
    quote: "Flow is being completely involved in an activity for its own sake.",
    author: "Mihaly Csikszentmihalyi",
    category: "focus",
  },
  {
    id: 'q13',
    quote: "Momentum breeds momentum. Start small, move fast, and keep compounding.",
    author: "Dayflow Philosophy",
    category: "momentum",
  },
  {
    id: 'q14',
    quote: "The secret of getting ahead is getting started. The secret of getting started is breaking your complex tasks into small manageable tasks.",
    author: "Mark Twain",
    category: "time",
  },
  {
    id: 'q15',
    quote: "Where your attention goes, your energy flows and your life grows.",
    author: "Tony Robbins",
    category: "focus",
  },
  {
    id: 'q16',
    quote: "Mindfulness is about being fully awake in our lives. It is about perceiving the exquisite vividness of each moment.",
    author: "Jon Kabat-Zinn",
    category: "mindfulness",
  },
  {
    id: 'q17',
    quote: "Productivity is never an accident. It is always the result of a commitment to excellence, intelligent planning, and focused effort.",
    author: "Paul J. Meyer",
    category: "discipline",
  },
  {
    id: 'q18',
    quote: "It is not that we have a short time to live, but that we waste a lot of it.",
    author: "Seneca",
    category: "time",
  },
  {
    id: 'q19',
    quote: "Give me six hours to chop down a tree and I will spend the first four sharpening the axe.",
    author: "Abraham Lincoln",
    category: "focus",
  },
  {
    id: 'q20',
    quote: "Habits are the compound interest of self-improvement.",
    author: "James Clear",
    category: "discipline",
  },
  {
    id: 'q21',
    quote: "Real peace comes not from eliminating trouble, but from discovering purpose in the calm moments.",
    author: "Marcus Aurelius",
    category: "mindfulness",
  },
  {
    id: 'q22',
    quote: "The way to get started is to quit talking and begin doing.",
    author: "Walt Disney",
    category: "momentum",
  },
  {
    id: 'q23',
    quote: "Lack of direction, not lack of time, is the problem. We all have twenty-four hour days.",
    author: "Zig Ziglar",
    category: "time",
  },
  {
    id: 'q24',
    quote: "Concentrate all your thoughts upon the work at hand. The sun's rays do not burn until brought to a focus.",
    author: "Alexander Graham Bell",
    category: "focus",
  },
  {
    id: 'q25',
    quote: "You don't have to be extreme, just consistent.",
    author: "Anonymous",
    category: "discipline",
  },
  {
    id: 'q26',
    quote: "Breath by breath, task by task, clarity emerges from continuous presence.",
    author: "Thich Nhat Hanh",
    category: "mindfulness",
  },
  {
    id: 'q27',
    quote: "A year from now you may wish you had started today.",
    author: "Karen Lamb",
    category: "momentum",
  },
  {
    id: 'q28',
    quote: "One reason so few of us achieve what we truly desire is that we never direct our focus; we never concentrate our power.",
    author: "Tony Robbins",
    category: "focus",
  },
  {
    id: 'q29',
    quote: "Either you run the day or the day runs you.",
    author: "Jim Rohn",
    category: "time",
  },
  {
    id: 'q30',
    quote: "Self-discipline begins with the mastery of your thoughts. If you don't control what you think, you can't control what you do.",
    author: "Napoleon Hill",
    category: "discipline",
  },
  {
    id: 'q31',
    quote: "The present moment is filled with joy and happiness. If you are attentive, you will see it.",
    author: "Thich Nhat Hanh",
    category: "mindfulness",
  },
  {
    id: 'q32',
    quote: "Success is the sum of small efforts, repeated day in and day out.",
    author: "Robert Collier",
    category: "momentum",
  },
  {
    id: 'q33',
    quote: "Do not wait to strike till the iron is hot; but make it hot by striking.",
    author: "William Butler Yeats",
    category: "momentum",
  },
  {
    id: 'q34',
    quote: "What gets measured gets managed.",
    author: "Peter F. Drucker",
    category: "time",
  },
  {
    id: 'q35',
    quote: "Your future is created by what you do today, not tomorrow.",
    author: "Robert Kiyosaki",
    category: "discipline",
  },
];

/**
 * Returns a deterministic quote for any given date string (YYYY-MM-DD),
 * ensuring the quote stays consistent throughout the day and changes tomorrow.
 */
export function getDailyQuote(dateStr: string): Quote {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = (hash << 5) - hash + dateStr.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % QUOTES_COLLECTION.length;
  return QUOTES_COLLECTION[index];
}
