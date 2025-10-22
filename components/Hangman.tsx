import React, { useState, useEffect, useCallback } from 'react';
import type { Verb } from '../types';
import { recordGameEvent } from '../utils/gamification';

const MAX_WRONG_GUESSES = 7;
const ALPHABET = 'abcdefghijklmnopqrstuvwxyz'.split('');

// Web Audio API for sounds
const audioCtx = typeof window !== 'undefined' ? new (window.AudioContext || (window as any).webkitAudioContext)() : null;

const playVictorySound = () => {
    if (!audioCtx) return;
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    oscillator.type = 'sine';
    gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((note, i) => {
        oscillator.frequency.setValueAtTime(note, audioCtx.currentTime + i * 0.1);
    });
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
    oscillator.start(audioCtx.currentTime);
    oscillator.stop(audioCtx.currentTime + 0.5);
};

// Helper to pick a random item from an array
// FIX: Changed to a standard function to avoid TSX parsing ambiguity with generics.
function getRandomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Component for the Windmill SVG
const Windmill: React.FC<{ wrongGuesses: number }> = ({ wrongGuesses }) => (
    <svg viewBox="0 0 100 100" className="w-full h-full max-w-xs mx-auto">
        <g stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round">
            {/* Ground */}
            {wrongGuesses > 0 && <path d="M5 95 H 95" />}
            {/* Tower */}
            {wrongGuesses > 1 && <path d="M35 95 L 45 40 H 55 L 65 95" />}
            {/* Cap */}
            {wrongGuesses > 2 && <path d="M40 40 L 50 25 L 60 40 Z" />}
            {/* Blades */}
            {wrongGuesses > 3 && <path d="M50 32 L 20 10" />}
            {wrongGuesses > 4 && <path d="M50 32 L 80 10" />}
            {wrongGuesses > 5 && <path d="M50 32 L 80 55" />}
            {wrongGuesses > 6 && <path d="M50 32 L 20 55" />}
        </g>
    </svg>
);


const Hangman: React.FC<{ verbs: Verb[] }> = ({ verbs }) => {
    const [gameState, setGameState] = useState<'idle' | 'playing' | 'won' | 'lost'>('idle');
    const [wordToGuess, setWordToGuess] = useState('');
    const [verbInfo, setVerbInfo] = useState<Verb | null>(null);
    const [guessedLetters, setGuessedLetters] = useState<Set<string>>(new Set());
    const [wordCount, setWordCount] = useState(0);
    const [isPaused, setIsPaused] = useState(false);

    const wrongGuesses = [...guessedLetters].filter(letter => !wordToGuess.toLowerCase().includes(letter)).length;

    const setupGame = useCallback(() => {
        const candidateVerbs = verbs.filter(verb => 
            (verb.nl.preterite && verb.nl.preterite !== '-') || 
            (verb.nl.participle && verb.nl.participle !== '-')
        );
        
        if (candidateVerbs.length === 0) return;

        let chosenWord = '';
        let chosenVerb: Verb | null = null;
        let attempts = 0;

        while (!chosenWord && attempts < 50) { // Safety break to prevent infinite loops
            // FIX: Explicitly provide the generic type argument to `getRandomItem` to ensure correct type inference.
            const randomVerb = getRandomItem<Verb>(candidateVerbs);
            const possibleForms = [];
            if (randomVerb.nl.preterite && randomVerb.nl.preterite !== '-') {
                possibleForms.push(randomVerb.nl.preterite.split('/')[0].trim());
            }
            if (randomVerb.nl.participle && randomVerb.nl.participle !== '-') {
                possibleForms.push(randomVerb.nl.participle.split(' ')[0].trim());
            }
            
            const validForms = possibleForms.filter(w => w);
            if (validForms.length > 0) {
                // FIX: Explicitly provide the generic type argument to `getRandomItem` to ensure correct type inference.
                chosenWord = getRandomItem<string>(validForms);
                chosenVerb = randomVerb;
            }
            attempts++;
        }
        
        if (!chosenWord || !chosenVerb) {
            console.error("Could not find a valid word for Hangman after 50 attempts.");
            return;
        }
        
        setWordToGuess(chosenWord);
        setVerbInfo(chosenVerb);
        setGuessedLetters(new Set());
        setGameState('playing');
    }, [verbs]);

    const handleGuess = (letter: string) => {
        if (gameState !== 'playing') return;
        setGuessedLetters(prev => new Set(prev).add(letter));
    };
    
    const handlePlayAgain = () => {
        const nextCount = wordCount + 1;
        setWordCount(nextCount);
        if (nextCount > 0 && nextCount % 5 === 0) {
            setIsPaused(true);
        } else {
            setupGame();
        }
    };

    useEffect(() => {
        if (gameState !== 'playing' || !wordToGuess) return;
        
        const wordLetters = new Set(wordToGuess.toLowerCase().split(''));
        const guessedCorrectLetters = [...guessedLetters].filter(l => wordLetters.has(l));

        if (guessedCorrectLetters.length === wordLetters.size) {
            setGameState('won');
            playVictorySound();
            recordGameEvent('hangman_won', { errors: wrongGuesses });
        } else if (wrongGuesses >= MAX_WRONG_GUESSES) {
            setGameState('lost');
        }
    }, [guessedLetters, wordToGuess, wrongGuesses, gameState]);

    const displayedWord = wordToGuess.split('').map((letter, index) => (
        <span key={index} className="inline-block text-center w-8 h-10 sm:w-10 sm:h-12 border-b-4 border-slate-400 text-2xl sm:text-3xl font-bold uppercase">
            {guessedLetters.has(letter.toLowerCase()) ? letter : ''}
        </span>
    ));

    if (gameState === 'idle') {
        return (
            <div className="text-center mt-12">
                <h2 className="text-2xl font-bold mb-4">Prêt à jouer au Pendu ?</h2>
                <p className="text-slate-600 mb-8">Construis le moulin avant de te tromper 7 fois !</p>
                <button 
                    onClick={() => { setWordCount(0); setIsPaused(false); setupGame(); }} 
                    className="bg-orange-600 text-white font-bold py-3 px-8 rounded-full hover:bg-orange-700 transition-colors duration-300 shadow-lg"
                >
                    Commencer la partie
                </button>
            </div>
        );
    }
    
    if (isPaused) {
        return (
            <div className="text-center mt-12 bg-white p-8 rounded-xl shadow-lg max-w-md mx-auto">
                <h2 className="text-2xl font-bold mb-4">Bravo !</h2>
                <p className="text-slate-600 mb-8">Tu as joué {wordCount} mots. On continue ?</p>
                <div className="flex justify-center gap-4">
                    <button 
                        onClick={() => { setIsPaused(false); setGameState('idle'); }}
                        className="bg-slate-700 text-white font-bold py-3 px-8 rounded-full hover:bg-slate-800 transition-colors duration-300 shadow-lg"
                    >
                        Arrêter
                    </button>
                    <button 
                        onClick={() => { setIsPaused(false); setupGame(); }}
                        className="bg-orange-600 text-white font-bold py-3 px-8 rounded-full hover:bg-orange-700 transition-colors duration-300 shadow-lg"
                    >
                        Continuer
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Jeu du Pendu</h2>
            <p className="text-slate-600 mb-6">Devinez le verbe néerlandais (prétérit ou participe passé).</p>
            
            <div className="h-48 sm:h-64 mb-6 text-slate-700">
                <Windmill wrongGuesses={wrongGuesses} />
            </div>

            <div className="flex justify-center gap-2 mb-8" aria-label="Mot à deviner">
                {displayedWord}
            </div>

            {gameState === 'playing' ? (
                <div className="flex flex-wrap justify-center gap-2 max-w-lg mx-auto" role="group">
                    {ALPHABET.map(letter => (
                        <button
                            key={letter}
                            onClick={() => handleGuess(letter)}
                            disabled={guessedLetters.has(letter)}
                            className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-white border-2 border-slate-300 text-lg font-bold uppercase transition-colors duration-200 enabled:hover:bg-orange-100 disabled:bg-slate-200 disabled:text-slate-400"
                        >
                            {letter}
                        </button>
                    ))}
                </div>
            ) : (
                <div className="bg-white p-8 rounded-xl shadow-lg">
                    {gameState === 'won' && <h3 className="text-3xl font-bold text-green-600">🎉 Proficiat!</h3>}
                    {gameState === 'lost' && <h3 className="text-3xl font-bold text-red-600">Dommage...</h3>}
                    <p className="mt-2 text-lg">Le mot était : <span className="font-extrabold text-orange-600 text-2xl">{wordToGuess}</span></p>
                    
                    {verbInfo && (
                        <div className="mt-4 text-left border-t pt-4 space-y-1 text-slate-600">
                           <p><span className="font-semibold">Infinitif:</span> {verbInfo.nl.infinitive}</p>
                           <p><span className="font-semibold">Prétérit:</span> {verbInfo.nl.preterite}</p>
                           <p><span className="font-semibold">Participe Passé:</span> {verbInfo.nl.participle}</p>
                           <p><span className="font-semibold">Français:</span> {verbInfo.fr}</p>
                        </div>
                    )}

                    <button
                        onClick={handlePlayAgain}
                        className="w-full mt-6 bg-orange-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-orange-700 transition-colors duration-300 shadow-md"
                    >
                        Rejouer
                    </button>
                </div>
            )}
        </div>
    );
};

export default Hangman;