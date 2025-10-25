import React, { useState, useEffect, useMemo } from 'react';
import type { Verb } from '../types';
import ExampleSentenceGenerator from './ExampleSentenceGenerator';

interface FocusViewProps {
  verbs: Verb[];
}

const shuffleArray = <T,>(array: T[]): T[] => {
  if (!Array.isArray(array)) return [];
  return [...array].sort(() => Math.random() - 0.5);
};

const VerbInfoRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
    <div className="flex justify-between items-baseline py-3 border-b border-slate-200">
        <span className="text-slate-500">{label}</span>
        <span className="font-semibold text-right text-lg">{value}</span>
    </div>
);

const FocusView: React.FC<FocusViewProps> = ({ verbs }) => {
  const safeVerbs = useMemo(() => Array.isArray(verbs) ? verbs : [], [verbs]);
  const [shuffledVerbs, setShuffledVerbs] = useState<Verb[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    setShuffledVerbs(shuffleArray(safeVerbs));
    setCurrentIndex(0);
  }, [safeVerbs]);

  const currentVerb = useMemo(() => {
    if (!shuffledVerbs || shuffledVerbs.length === 0) return null;
    return shuffledVerbs[currentIndex];
  }, [shuffledVerbs, currentIndex]);

  const handleNext = () => {
    if (shuffledVerbs.length === 0) return;
    setCurrentIndex((prevIndex) => (prevIndex + 1) % shuffledVerbs.length);
  };

  const handlePrev = () => {
    if (shuffledVerbs.length === 0) return;
    setCurrentIndex((prevIndex) => (prevIndex - 1 + shuffledVerbs.length) % shuffledVerbs.length);
  };

  const handleShuffle = () => {
    setShuffledVerbs(shuffleArray(safeVerbs));
    setCurrentIndex(0);
  };

  const handleSpeak = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentVerb || typeof window.speechSynthesis === 'undefined') return;

    const toSpeak = `${currentVerb.nl.infinitive}. ${currentVerb.nl.preterite}. ${currentVerb.nl.participle}.`;
    const utterance = new SpeechSynthesisUtterance(toSpeak);
    utterance.lang = 'nl-BE';
    utterance.rate = 0.8;
    
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  if (!currentVerb) {
    return <div className="text-center p-8 text-slate-500">Sélectionnez une série pour commencer.</div>;
  }

  return (
    <div className="max-w-xl mx-auto flex flex-col items-center">
        <p className="text-slate-600 font-semibold mb-4">
          {currentIndex + 1} / {shuffledVerbs.length}
        </p>
      
        <div className="w-full bg-white rounded-xl shadow-lg border border-slate-200/80 p-8">
            <div className="flex justify-between items-start mb-4">
                <h2 className="text-3xl font-bold text-orange-700 capitalize">{currentVerb.fr}</h2>
                <button onClick={handleSpeak} className="text-slate-500 hover:text-orange-600 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
                    </svg>
                </button>
            </div>
            <div className="space-y-2">
                <VerbInfoRow label="Infinitif" value={currentVerb.nl.infinitive} />
                <VerbInfoRow label="Prétérit" value={currentVerb.nl.preterite.replace('/', ' - ')} />
                {currentVerb.nl.participle !== '-' && (
                    <VerbInfoRow label="Participe Passé" value={currentVerb.nl.participle} />
                )}
            </div>
            
            <ExampleSentenceGenerator key={currentVerb.nl.infinitive} verb={currentVerb} theme="light" />
        </div>

      <div className="flex items-center space-x-4 mt-8">
        <button onClick={handlePrev} className="bg-white border border-slate-300 text-slate-700 font-bold py-3 px-6 rounded-full hover:bg-slate-100 transition-colors duration-300 shadow-sm">
          Précédent
        </button>
        <button onClick={handleShuffle} className="bg-orange-600 text-white font-bold py-3 px-8 rounded-full hover:bg-orange-700 transition-colors duration-300 shadow-lg">
          Mélanger
        </button>
        <button onClick={handleNext} className="bg-white border border-slate-300 text-slate-700 font-bold py-3 px-6 rounded-full hover:bg-slate-100 transition-colors duration-300 shadow-sm">
          Suivant
        </button>
      </div>
    </div>
  );
};

export default FocusView;