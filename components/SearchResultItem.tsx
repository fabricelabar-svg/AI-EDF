import React, { useState, useEffect } from 'react';
import type { Verb } from '../types';
import ExampleSentenceGenerator from './ExampleSentenceGenerator';
import { srsManager } from '../utils/srs';

interface SearchResultItemProps {
  verb: Verb;
}

const MasteryIndicator: React.FC<{ level: number }> = ({ level }) => {
    const maxLevel = 5;
    const bars = Array.from({ length: maxLevel }, (_, i) => {
        const isActive = i < level;
        let colorClass = 'bg-slate-200';
        if (isActive) {
            if (level <= 1) colorClass = 'bg-red-400';
            else if (level <= 3) colorClass = 'bg-yellow-400';
            else colorClass = 'bg-green-400';
        }
        return <div key={i} className={`w-2 h-4 rounded-sm ${colorClass}`}></div>;
    });
    return <div className="flex items-center gap-0.5">{bars}</div>;
};


const SearchResultItem: React.FC<SearchResultItemProps> = ({ verb }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [masteryLevel, setMasteryLevel] = useState(0);

  useEffect(() => {
    const data = srsManager.getVerbUserData(verb.nl.infinitive);
    setMasteryLevel(data.masteryLevel);
  }, [verb.nl.infinitive]);

  return (
    <li className="px-6 py-4 hover:bg-slate-50 transition-colors">
      <div onClick={() => setIsExpanded(!isExpanded)} className="cursor-pointer">
        <div className="flex justify-between items-center">
            <p className="font-bold text-lg text-orange-700 capitalize">{verb.fr}</p>
            <MasteryIndicator level={masteryLevel} />
        </div>
        <p className="text-md text-slate-600">{verb.nl.infinitive} / {verb.nl.preterite.replace('/', ' - ')} / {verb.nl.participle}</p>
      </div>
      {isExpanded && <ExampleSentenceGenerator verb={verb} theme="light" />}
    </li>
  );
};

export default SearchResultItem;