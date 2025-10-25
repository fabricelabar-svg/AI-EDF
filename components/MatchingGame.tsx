import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { Verb } from '../types';
import { leaderboardManager } from '../utils/leaderboard';
import LeaderboardPodium from './LeaderboardPodium';
import { recordGameEvent } from '../utils/gamification';

const GAME_SIZE = 6;

const shuffleArray = <T,>(array: T[]): T[] => {
  return [...array].sort(() => Math.random() - 0.5);
};

const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
};

interface MatchItem {
  id: string; // Using infinitive as ID
  text: string;
}

const MatchingGame: React.FC<{ verbs: Verb[] }> = ({ verbs }) => {
  const [gameState, setGameState] = useState<'playing' | 'finished'>('playing');
  const [gameId, setGameId] = useState(0); // Used to trigger podium refresh
  const [gameVerbs, setGameVerbs] = useState<Verb[]>([]);
  const [leftItems, setLeftItems] = useState<MatchItem[]>([]);
  const [rightItems, setRightItems] = useState<MatchItem[]>([]);
  
  const [selectedLeftId, setSelectedLeftId] = useState<string | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<Set<string>>(new Set());
  const [incorrectPair, setIncorrectPair] = useState<[string, string] | null>(null);
  
  const [time, setTime] = useState(0);
  const timerRef = useRef<number | null>(null);
  const [finalTime, setFinalTime] = useState<number | null>(null);

  // Name management state
  const [showNamePrompt, setShowNamePrompt] = useState(false);
  const [tempUsername, setTempUsername] = useState('');

  const setupGame = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);

    const availableVerbs = verbs.filter(v => v.fr && v.nl.infinitive && v.nl.infinitive !== '-');
    const shuffled = shuffleArray(availableVerbs);
    const selected = shuffled.slice(0, GAME_SIZE);

    if (selected.length < 2) {
      setGameVerbs([]);
      return;
    }

    setGameVerbs(selected);
    setLeftItems(selected.map(v => ({ id: v.nl.infinitive, text: v.fr })));
    setRightItems(shuffleArray(selected.map(v => ({ id: v.nl.infinitive, text: v.nl.infinitive }))));
    
    // Reset state
    setGameState('playing');
    setSelectedLeftId(null);
    setMatchedPairs(new Set());
    setIncorrectPair(null);
    setTime(0);
    setFinalTime(null);
    setShowNamePrompt(false);
    setTempUsername('');
    setGameId(prev => prev + 1);

    timerRef.current = window.setInterval(() => {
        setTime(prev => prev + 1);
    }, 1000);

  }, [verbs]);

  useEffect(() => {
    setupGame();
    return () => {
        if (timerRef.current) clearInterval(timerRef.current);
    }
  }, [setupGame]);

  const handleLeftClick = (id: string) => {
    if (matchedPairs.has(id) || incorrectPair) return;
    setSelectedLeftId(id);
  };

  const handleRightClick = (id: string) => {
    if (!selectedLeftId || matchedPairs.has(selectedLeftId) || incorrectPair) return;

    if (selectedLeftId === id) {
      // Correct match
      setMatchedPairs(prev => new Set(prev).add(id));
      setSelectedLeftId(null);
    } else {
      // Incorrect match
      setIncorrectPair([selectedLeftId, id]);
      setSelectedLeftId(null);
      setTimeout(() => {
        setIncorrectPair(null);
      }, 700);
    }
  };

  useEffect(() => {
    if (gameState === 'playing' && gameVerbs.length > 0 && matchedPairs.size === gameVerbs.length) {
      if (timerRef.current) clearInterval(timerRef.current);
      const capturedTime = time;
      setFinalTime(capturedTime);
      recordGameEvent('matching_game_completed', { time: capturedTime });
      
      const currentUsername = leaderboardManager.getUserName();
      if (currentUsername === 'Anonyme') {
          setShowNamePrompt(true);
      } else {
          leaderboardManager.addScore('matching', capturedTime);
          setGameId(prev => prev + 1);
      }
      
      setTimeout(() => {
        setGameState('finished');
      }, 500);
    }
  }, [matchedPairs, gameVerbs, time, gameState]);

  const handleNameSave = (e: React.FormEvent) => {
    e.preventDefault();
    const nameToSave = tempUsername.trim();
    if (nameToSave && finalTime !== null) {
      leaderboardManager.setUserName(nameToSave);
      leaderboardManager.addScore('matching', finalTime);
      setShowNamePrompt(false);
      setGameId(prev => prev + 1);
    }
  };

  const getItemClasses = (id: string, side: 'left' | 'right') => {
    let base = "w-full p-4 rounded-lg border-2 text-center cursor-pointer transition-all duration-200";
    
    if (matchedPairs.has(id)) {
        return `${base} bg-green-100 border-green-400 text-green-800 cursor-not-allowed opacity-60 line-through`;
    }
    
    if (incorrectPair && ((side === 'left' && incorrectPair[0] === id) || (side === 'right' && incorrectPair[1] === id))) {
        return `${base} bg-red-100 border-red-500 animate-shake`;
    }
    
    if (side === 'left' && selectedLeftId === id) {
        return `${base} bg-orange-100 border-orange-500 ring-2 ring-orange-400`;
    }
    
    return `${base} bg-white border-slate-300 hover:bg-slate-50 hover:border-orange-400`;
  };

  if (gameVerbs.length < 2) {
    return (
        <div className="text-center p-8 text-slate-500 bg-white rounded-lg shadow-md max-w-md mx-auto">
            <h3 className="text-xl font-semibold">Pas assez de verbes</h3>
            <p className="mt-2">Il n'y a pas assez de verbes dans cette série pour jouer. Veuillez sélectionner une autre série.</p>
        </div>
    );
  }

  if (gameState === 'finished') {
    return (
        <div className="text-center mt-12 bg-white p-8 rounded-xl shadow-lg max-w-md mx-auto">
            <h2 className="text-3xl font-bold text-green-600 mb-4">🎉 Excellent !</h2>
            <p className="text-slate-700 mb-2">
            Tu as associé tous les verbes correctement.
            </p>
            <p className="text-2xl font-bold text-slate-800 mb-6">
                Ton temps : {formatTime(finalTime || 0)}
            </p>

            {showNamePrompt ? (
                <form onSubmit={handleNameSave} className="mt-4 border-t pt-4">
                    <label htmlFor="username" className="block font-semibold mb-2 text-slate-700">Entre ton nom pour le classement !</label>
                    <input
                        id="username"
                        type="text"
                        value={tempUsername}
                        onChange={(e) => setTempUsername(e.target.value)}
                        placeholder="Ton nom"
                        className="w-full text-center py-2 px-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        autoFocus
                    />
                    <button
                        type="submit"
                        disabled={!tempUsername.trim()}
                        className="w-full mt-3 bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 disabled:bg-slate-400"
                    >
                        Enregistrer mon score
                    </button>
                </form>
            ) : (
                 <button
                    onClick={setupGame}
                    className="bg-orange-600 text-white font-bold py-3 px-8 rounded-full hover:bg-orange-700 transition-colors duration-300 shadow-lg"
                >
                    Rejouer
                </button>
            )}
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
            <h2 className="text-3xl font-bold">Jeu d'Association</h2>
            <p className="text-slate-600 mt-2">Associe le verbe français à son infinitif en néerlandais le plus vite possible.</p>
        </div>

        <div className="flex justify-center items-center gap-2 text-center mb-6 text-2xl font-bold text-slate-700 bg-white py-2 px-4 rounded-lg shadow-md max-w-xs mx-auto">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-mono">{formatTime(time)}</span>
        </div>
        
        <div className="grid grid-cols-2 gap-4 sm:gap-8">
            {/* Left Column (French) */}
            <div className="space-y-4">
                {leftItems.map(item => (
                    <button 
                        key={item.id}
                        onClick={() => handleLeftClick(item.id)}
                        disabled={matchedPairs.has(item.id)}
                        className={getItemClasses(item.id, 'left')}
                    >
                        <span className="font-semibold text-lg capitalize">{item.text}</span>
                    </button>
                ))}
            </div>
            
            {/* Right Column (Dutch) */}
            <div className="space-y-4">
                 {rightItems.map(item => (
                    <button 
                        key={item.id}
                        onClick={() => handleRightClick(item.id)}
                        disabled={!selectedLeftId || matchedPairs.has(item.id)}
                        className={`${getItemClasses(item.id, 'right')} disabled:cursor-not-allowed disabled:bg-slate-100 disabled:border-slate-200`}
                    >
                         <span className="font-semibold text-lg">{item.text}</span>
                    </button>
                ))}
            </div>
        </div>

        <LeaderboardPodium game="matching" gameId={gameId} />

        <style>
        {`
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
            20%, 40%, 60%, 80% { transform: translateX(5px); }
          }
          .animate-shake {
            animation: shake 0.5s ease-in-out;
          }
        `}
        </style>
    </div>
  );
};

export default MatchingGame;
