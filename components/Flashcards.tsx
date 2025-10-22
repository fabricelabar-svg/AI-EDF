import React, { useState, useEffect, useMemo } from 'react';
import type { Verb } from '../types';
import ExampleSentenceGenerator from './ExampleSentenceGenerator';

interface FlashcardsProps {
  verbs: Verb[];
}

const shuffleArray = <T,>(array: T[]): T[] => {
  return [...array].sort(() => Math.random() - 0.5);
};
  
const CardFace: React.FC<{ children: React.ReactNode; isFront?: boolean; className?: string }> = ({ children, className }) => (
    <div className={`absolute w-full h-full backface-hidden rounded-xl flex flex-col justify-center items-center p-6 text-center shadow-lg ${className}`}>
        {children}
    </div>
);

const Flashcards: React.FC<FlashcardsProps> = ({ verbs }) => {
  const [shuffledVerbs, setShuffledVerbs] = useState<Verb[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    setShuffledVerbs(shuffleArray(verbs));
    setCurrentIndex(0);
    setIsFlipped(false);
  }, [verbs]);

  const currentVerb = useMemo(() => shuffledVerbs[currentIndex], [shuffledVerbs, currentIndex]);

  const handleNext = () => {
    setIsFlipped(false);
    // FIX: Ensure card flips back before changing content
    setTimeout(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % shuffledVerbs.length);
    }, 150);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    // FIX: Ensure card flips back before changing content
    setTimeout(() => {
        setCurrentIndex((prevIndex) => (prevIndex - 1 + shuffledVerbs.length) % shuffledVerbs.length);
    }, 150);
  };

  const handleShuffle = () => {
    setIsFlipped(false);
    // FIX: Ensure card flips back before changing content
    setTimeout(() => {
        setShuffledVerbs(shuffleArray(verbs));
        setCurrentIndex(0);
    }, 150);
  };

  const handleSpeak = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card from flipping
    if (!currentVerb || typeof window.speechSynthesis === 'undefined') {
      return;
    }

    const toSpeak = `${currentVerb.nl.infinitive}. ${currentVerb.nl.preterite}. ${currentVerb.nl.participle}.`;
    const utterance = new SpeechSynthesisUtterance(toSpeak);
    utterance.lang = 'nl-BE'; // Belgian Dutch
    utterance.rate = 0.8;
    
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  if (shuffledVerbs.length === 0 || !currentVerb) {
    return <div>Chargement des flashcards...</div>;
  }

  return (
    <div className="max-w-xl mx-auto flex flex-col items-center">
      <div className="w-full perspective-1000 h-80 mb-6">
        <div 
          className={`relative w-full h-full transition-transform duration-700 transform-style-3d cursor-pointer ${isFlipped ? 'rotate-y-180' : ''}`}
          onClick={() => setIsFlipped(!isFlipped)}
        >
          {/* Front of the card (Dutch) */}
          <CardFace isFront className="bg-white border-2 border-orange-200">
            <button onClick={handleSpeak} className="absolute top-4 right-4 text-slate-500 hover:text-orange-600 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
              </svg>
            </button>
            <div className="flex flex-col items-center justify-center space-y-4">
              <p className="text-4xl font-bold text-orange-700">{currentVerb.nl.infinitive}</p>
              <div className="flex justify-center items-baseline w-full text-lg mt-2 text-slate-700 gap-x-3">
                  <p className="font-semibold">{currentVerb.nl.preterite.replace('/', ' - ')}</p>
                  {currentVerb.nl.participle !== '-' && (
                      <>
                          <span className="text-slate-400 font-light">/</span>
                          <p className="font-semibold">{currentVerb.nl.participle}</p>
                      </>
                  )}
              </div>
            </div>
          </CardFace>
          
          {/* Back of the card (French) */}
          <CardFace className="bg-orange-600 text-white transform-rotate-y-180 !justify-around !py-8">
            <p className="text-4xl font-bold capitalize">{currentVerb.fr}</p>
            {/* By giving the generator a key that changes with the verb, we force React to re-mount it, resetting its internal state */}
            <ExampleSentenceGenerator key={currentVerb.nl.infinitive} verb={currentVerb} theme="dark" />
          </CardFace>
        </div>
      </div>

      <div className="text-center mb-6">
        <p className="text-slate-600 font-semibold">
          {currentIndex + 1} / {shuffledVerbs.length}
        </p>
      </div>

      <div className="flex items-center space-x-4">
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

export default Flashcards;