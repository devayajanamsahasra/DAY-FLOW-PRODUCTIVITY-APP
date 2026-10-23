import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Plant, PlantType } from '../types';
import { Sprout, Sparkles, Plus, Award, TreePine, Flower2, Leaf, Sun, X } from 'lucide-react';

export const FocusGardenView: React.FC = () => {
  const { plants, plantNewSeed, sessions } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPlantName, setNewPlantName] = useState('');
  const [newPlantType, setNewPlantType] = useState<PlantType>('sunflower');

  const totalFocusSessions = sessions.filter((s) => s.mode === 'focus').length;
  const fullyGrownCount = plants.filter((p) => p.stage === 5).length;

  const handlePlant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlantName.trim()) return;
    plantNewSeed(newPlantName.trim(), newPlantType);
    setNewPlantName('');
    setIsModalOpen(false);
  };

  const plantTypeIcons: Record<PlantType, React.ReactNode> = {
    sunflower: <Sun className="w-8 h-8 text-amber-500" />,
    bonsai: <TreePine className="w-8 h-8 text-emerald-600" />,
    lavender: <Flower2 className="w-8 h-8 text-purple-500" />,
    oak: <Leaf className="w-8 h-8 text-emerald-700" />,
    succulent: <Sprout className="w-8 h-8 text-teal-500" />,
  };

  const stageDescriptions = [
    'Stage 1: Planted Seed in fertile soil',
    'Stage 2: First Green Sprout breaking through',
    'Stage 3: Sturdy Seedling taking root',
    'Stage 4: Budding with vibrant life',
    'Stage 5: Fully Flourished Botanical Wonder',
  ];

  return (
    <div className="space-y-6">
      {/* Garden Header */}
      <div className="rounded-2xl border border-emerald-100 dark:border-emerald-950/80 bg-gradient-to-br from-emerald-50/50 via-white to-teal-50/30 dark:from-slate-900 dark:via-emerald-950/20 dark:to-slate-900 p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
            <Sprout className="w-3.5 h-3.5" />
            <span>Virtual Focus Garden</span>
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-1">
            Nurture Focus, Cultivate Life
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md">
            Every 25 minutes of deep focus nourishes your garden. Complete sessions to grow sprouts into magnificent blooming trees.
          </p>
        </div>

        {/* Garden Stats */}
        <div className="flex items-center gap-3">
          <div className="text-center px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 shadow-sm">
            <span className="block text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">
              {fullyGrownCount}
            </span>
            <span className="text-[10px] uppercase font-semibold text-slate-400">
              Flourished
            </span>
          </div>

          <div className="text-center px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 shadow-sm">
            <span className="block text-xl font-bold font-mono text-indigo-600 dark:text-indigo-400 tabular-nums">
              {totalFocusSessions * 25}
            </span>
            <span className="text-[10px] uppercase font-semibold text-slate-400">
              Sun Points
            </span>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-3 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-sm flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Plant Seed</span>
          </button>
        </div>
      </div>

      {/* Garden Plants Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {plants.map((plant) => {
          const isComplete = plant.stage === 5;
          const stagePercent = isComplete ? 100 : (plant.growthPoints % 100);

          return (
            <div
              key={plant.id}
              className={`rounded-2xl border p-5 transition-all flex flex-col justify-between ${
                isComplete
                  ? 'border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/30 dark:bg-emerald-950/20'
                  : 'border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider capitalize">
                    {plant.type}
                  </span>
                  {isComplete ? (
                    <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 rounded-full">
                      Full Bloom
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full font-mono">
                      Stage {plant.stage}/5
                    </span>
                  )}
                </div>

                {/* Animated Graphic representation */}
                <div className="w-24 h-24 mx-auto my-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 flex items-center justify-center relative">
                  {plantTypeIcons[plant.type]}
                  <div
                    className="absolute bottom-1 right-1 text-[10px] font-mono font-bold px-1 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
                  >
                    Lv.{plant.stage}
                  </div>
                </div>

                <h3 className="text-sm font-bold text-slate-900 dark:text-white text-center mt-2 truncate">
                  {plant.name}
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 text-center mt-1">
                  {stageDescriptions[plant.stage - 1]}
                </p>
              </div>

              {/* Growth Progress Bar */}
              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-slate-400 mb-1.5">
                  <span>Growth</span>
                  <span className="tabular-nums font-semibold">{isComplete ? '100%' : `${stagePercent}%`}</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${isComplete ? 100 : stagePercent}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Plant New Seed Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Plant a New Seed
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handlePlant} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Plant Name
                </label>
                <input
                  type="text"
                  value={newPlantName}
                  onChange={(e) => setNewPlantName(e.target.value)}
                  placeholder="e.g. Tree of Discipline"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  autoFocus
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Flora Variety
                </label>
                <select
                  value={newPlantType}
                  onChange={(e) => setNewPlantType(e.target.value as PlantType)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="sunflower">Radiant Sunflower</option>
                  <option value="bonsai">Zen Bonsai</option>
                  <option value="lavender">Calm Lavender</option>
                  <option value="oak">Mighty Oak</option>
                  <option value="succulent">Emerald Succulent</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg"
                >
                  Plant in Garden
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
