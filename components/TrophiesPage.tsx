import React from 'react';
import { gamificationManager } from '../utils/gamification';
import { allTrophies } from '../data/trophies';
import type { Trophy } from '../types';

const TrophyCard: React.FC<{ trophy: Trophy; isUnlocked: boolean }> = ({ trophy, isUnlocked }) => (
  <div className={`p-6 rounded-xl text-center transition-all duration-300 ${isUnlocked ? 'bg-white shadow-lg border-2 border-amber-300' : 'bg-slate-100 border border-slate-200'}`}>
    <div className={`text-5xl mb-4 transition-transform duration-300 ${isUnlocked ? 'scale-110' : 'grayscale'}`}>{trophy.icon}</div>
    <h3 className={`font-bold text-lg ${isUnlocked ? 'text-amber-700' : 'text-slate-600'}`}>{trophy.name}</h3>
    <p className={`text-sm mt-1 ${isUnlocked ? 'text-slate-600' : 'text-slate-500'}`}>{trophy.description}</p>
  </div>
);

const TrophiesPage: React.FC = () => {
  const unlockedTrophyIds = gamificationManager.getUnlockedTrophies();

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-10">
        <h2 className="text-4xl font-extrabold text-slate-800">🏆 Trophées</h2>
        <p className="mt-2 text-lg text-slate-600">Débloquez des succès en pratiquant et en apprenant.</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
        {allTrophies.map(trophy => (
          <TrophyCard key={trophy.id} trophy={trophy} isUnlocked={unlockedTrophyIds.has(trophy.id)} />
        ))}
      </div>
    </div>
  );
};

export default TrophiesPage;
