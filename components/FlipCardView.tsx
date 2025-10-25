import React, { useState } from 'react';
import type { Verb } from '../types';

interface FlipCardProps {
  verb: Verb;
}

const FlipCard: React.FC<FlipCardProps> = ({ verb }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleSpeak = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (typeof window.speechSynthesis === 'undefined') return;

    const toSpeak = `${verb.nl.infinitive}. ${verb.nl.preterite}. ${verb.nl.participle}.`;
    const utterance = new SpeechSynthesisUtterance(toSpeak);
    utterance.lang = 'nl-BE';
    utterance.rate = 0.8;
    
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="perspective-1000 w-full h-52 sm:h-64 cursor-pointer" onClick={() => setIsFlipped(!isFlipped)}>
      <div className={`relative w-full h-full transform-style-3d transition-transform duration-700 ${isFlipped ? 'rotate-y-180' : ''}`}>
        {/* Front of the card */}
        <div className="absolute w-full h-full backface-hidden rounded-xl shadow-lg border border-slate-200 bg-white flex flex-col justify-center items-center p-4">
          <h3 className="text-2xl sm:text-3xl font-bold text-center text-orange-700 capitalize">{verb.fr}</h3>
          <p className="text-sm text-slate-400 mt-2">Cliquez pour voir la traduction</p>
        </div>
        
        {/* Back of the card */}
        <div className="absolute w-full h-full backface-hidden rotate-y-180 rounded-xl shadow-lg border border-slate-200 bg-slate-800 text-white flex flex-col justify-center p-4">
          <button onClick={handleSpeak} className="absolute top-3 right-3 text-slate-400 hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
            </svg>
          </button>
          <div className="w-full text-left px-2">
            <p className="text-slate-300 text-sm">Infinitif:</p>
            <p className="font-bold text-2xl">{verb.nl.infinitive}</p>
            <p className="text-slate-300 text-sm mt-2">Prétérit:</p>
            <p className="font-bold text-xl">{verb.nl.preterite.replace('/', ' - ')}</p>
            {verb.nl.participle !== '-' && (
              <>
                <p className="text-slate-300 text-sm mt-2">Participe Passé:</p>
                <p className="font-bold text-xl">{verb.nl.participle}</p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};


const FlipCardView: React.FC<{ verbs: Verb[] }> = ({ verbs }) => {
  return (
    <div className="max-w-5xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold">Mode Étude : Flashcards</h2>
        <p className="text-slate-600 mt-2">Cliquez sur une carte pour révéler la traduction et les formes du verbe.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {verbs.map(verb => (
          <FlipCard key={verb.nl.infinitive} verb={verb} />
        ))}
      </div>
    </div>
  );
};

export default FlipCardView;