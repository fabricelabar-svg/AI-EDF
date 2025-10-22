import React, { useState } from 'react';
import type { Verb } from '../types';

interface SeriesSelectorProps {
  series: Verb[][];
  onSelect: (indices: number[]) => void;
}

const SeriesSelector: React.FC<SeriesSelectorProps> = ({ series, onSelect }) => {
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);

  const handleToggleSeries = (index: number) => {
    setSelectedIndices(prev =>
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const handleStart = () => {
    if (selectedIndices.length > 0) {
      onSelect(selectedIndices);
    }
  };

  return (
    <div className="text-center mt-12">
      <h2 className="text-3xl font-bold mb-4">Choisis une ou plusieurs séries</h2>
      <p className="text-slate-600 mb-8 max-w-xl mx-auto">Sélectionne les séries de verbes que tu souhaites pratiquer, puis clique sur "Commencer".</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 max-w-4xl mx-auto">
        {series.map((verbList, index) => {
          const isSelected = selectedIndices.includes(index);
          return (
            <button
              key={index}
              onClick={() => handleToggleSeries(index)}
              className={`p-6 rounded-xl shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                isSelected
                  ? 'bg-orange-100 border-2 border-orange-500'
                  : 'bg-white border border-slate-200'
              }`}
              aria-pressed={isSelected}
              aria-label={`Sélectionner la Série ${index + 1}`}
            >
              <span className="text-xl font-bold text-orange-600">Série {index + 1}</span>
              <span className="block text-xs text-slate-500 mt-1">{verbList.length} verbes</span>
            </button>
          );
        })}
      </div>
      <div className="mt-10">
        <button
          onClick={handleStart}
          disabled={selectedIndices.length === 0}
          className="bg-orange-600 text-white font-bold py-4 px-12 rounded-full hover:bg-orange-700 transition-colors duration-300 shadow-lg disabled:bg-slate-400 disabled:cursor-not-allowed disabled:shadow-none"
        >
          Commencer l'exercice ({selectedIndices.length} série{selectedIndices.length <= 1 ? '' : 's'})
        </button>
      </div>
    </div>
  );
};

export default SeriesSelector;