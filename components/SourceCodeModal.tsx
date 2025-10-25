import React, { useState } from 'react';

// This is a special component. It contains the source code of the entire application.
// In a real-world scenario, this would be handled differently (e.g., linking to a GitHub repo),
// but for this environment, we embed the code directly.

const sourceCodeData: Record<string, string> = {
  'index.html': `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Nederlands Leren : hoofdtijden</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
      body {
        font-family: 'Inter', sans-serif;
      }
      @import url('https://rsms.me/inter/inter.css');
      
      .perspective-1000 {
        perspective: 1000px;
      }
      .transform-style-3d {
        transform-style: preserve-3d;
      }
      .rotate-y-180 {
        transform: rotateY(180deg);
      }
      .transform-rotate-y-180 {
         transform: rotateY(180deg);
      }
      .backface-hidden {
        backface-visibility: hidden;
        -webkit-backface-visibility: hidden;
      }
    </style>
  <script type="importmap">
{
  "imports": {
    "react/": "https://aistudiocdn.com/react@^19.2.0/",
    "react": "https://aistudiocdn.com/react@^19.2.0",
    "react-dom/": "https://aistudiocdn.com/react-dom@^19.2.0/",
    "@google/genai": "https://aistudiocdn.com/@google/genai@^1.26.0"
  }
}
</script>
</head>
  <body class="bg-slate-50 text-slate-800">
    <div id="root"></div>
    <script type="module" src="/index.tsx"></script>
  </body>
</html>`,
  'index.tsx': `
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`,
  'metadata.json': `{
  "name": "Nederlands leren : Hoofdtijden",
  "description": "An interactive web application to learn and search for Dutch irregular verbs, showing their French translation, infinitive, preterite, and past participle forms.",
  "requestFramePermissions": []
}`,
  'App.tsx': `import React, { useState, useMemo, useEffect } from 'react';
import { verbList, verbSeries } from './data/verbs';
import type { Verb, Trophy } from './types';
import Header from './components/Header';
import SearchBar from './components/SearchBar';
import Footer from './components/Footer';
import Quiz from './components/Quiz';
import MatchingGame from './components/MatchingGame';
import FlipCardView from './components/FlipCardView';
import Hangman from './components/Hangman';
import SeriesSelector from './components/SeriesSelector';
import SearchResultItem from './components/SearchResultItem';
import Evaluation from './components/Evaluation';
import TrophiesPage from './components/TrophiesPage';
import TrophyNotification from './components/TrophyNotification';
import { gamificationManager } from './utils/gamification';
import SourceCodeModal from './components/SourceCodeModal';

type View = 'focus' | 'list' | 'quiz' | 'matching' | 'hangman' | 'srs' | 'trophies';

const App: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeView, setActiveView] = useState<View>('focus');
  const [selectedSeriesIndices, setSelectedSeriesIndices] = useState<number[]>([]);
  const [isSourceModalOpen, setIsSourceModalOpen] = useState(false);

  // --- GAMIFICATION STATE ---
  const [streak, setStreak] = useState(0);
  const [notification, setNotification] = useState<Trophy | null>(null);

  useEffect(() => {
    // Initial load
    gamificationManager.updateStreak();
    setStreak(gamificationManager.getStreak());

    const handleTrophyUnlock = (event: Event) => {
        const trophy = (event as CustomEvent).detail as Trophy;
        setNotification(trophy);
    };

    window.addEventListener('trophyUnlocked', handleTrophyUnlock);

    // Record initial view
    gamificationManager.recordView('focus');

    return () => {
      window.removeEventListener('trophyUnlocked', handleTrophyUnlock);
    };
  }, []);


  const filteredVerbs = useMemo(() => {
    if (!searchTerm) {
      return [];
    }
    const lowercasedFilter = searchTerm.toLowerCase();
    return verbList.filter((verb: Verb) =>
      verb.fr.toLowerCase().includes(lowercasedFilter) ||
      verb.nl.infinitive.toLowerCase().includes(lowercasedFilter) ||
      verb.nl.preterite.toLowerCase().includes(lowercasedFilter) ||
      verb.nl.participle.toLowerCase().includes(lowercasedFilter)
    );
  }, [searchTerm]);

  const handleSetView = (view: View) => {
    setActiveView(view);
    gamificationManager.updateStreak();
    setStreak(gamificationManager.getStreak());
    gamificationManager.recordView(view);
  };

  const activeVerbs = useMemo(() => {
    if (selectedSeriesIndices.length === 0) return [];
    // Sort indices to keep series order consistent
    const sortedIndices = [...selectedSeriesIndices].sort((a, b) => a - b);
    return sortedIndices.flatMap(index => verbSeries[index]);
  }, [selectedSeriesIndices]);

  const TabButton: React.FC<{ view: View; label: string }> = ({ view, label }) => {
    const isActive = activeView === view;
    return (
      <button
        onClick={() => handleSetView(view)}
        className={\`px-6 py-2 rounded-full font-semibold transition-colors duration-300 \${
          isActive
            ? 'bg-orange-600 text-white shadow-md'
            : 'bg-white text-slate-600 hover:bg-slate-100'
        }\`}
      >
        {label}
      </button>
    );
  };
  
  const isExerciseView = ['focus', 'quiz', 'hangman', 'matching', 'srs'].includes(activeView);
  
  return (
    <div className="min-h-screen flex flex-col">
      {notification && <TrophyNotification trophy={notification} onDismiss={() => setNotification(null)} />}
      {isSourceModalOpen && <SourceCodeModal onClose={() => setIsSourceModalOpen(false)} />}
      <main className="flex-grow container mx-auto px-4 py-8">
        <Header streak={streak} />

        {/* Tab Navigation */}
        <div className="flex justify-center flex-wrap gap-x-4 gap-y-2 mb-8">
          <TabButton view="focus" label="Flashcards" />
          <TabButton view="quiz" label="Quiz" />
          <TabButton view="matching" label="Jeu d'Association" />
          <TabButton view="hangman" label="Jeu du Pendu" />
          <TabButton view="srs" label="Évaluation" />
          <TabButton view="trophies" label="Trophées" />
          <TabButton view="list" label="Rechercher" />
        </div>
        
        {activeView === 'list' && (
          <div className="max-w-2xl mx-auto">
            <SearchBar
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <div className="mt-4 bg-white rounded-xl shadow-lg border border-slate-200/80 overflow-hidden">
                {filteredVerbs.length > 0 ? (
                  <ul className="divide-y divide-slate-200">
                    {filteredVerbs.map((verb, index) => (
                      <SearchResultItem key={\`\${verb.nl.infinitive}-\${index}\`} verb={verb} />
                    ))}
                  </ul>
                ) : (
                  <div className="text-center p-12 text-slate-500">
                    <h3 className="text-xl font-semibold">Aucun verbe trouvé</h3>
                    <p className="mt-2">Essayez de modifier votre recherche.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeView === 'trophies' && <TrophiesPage />}

        {isExerciseView && (
          <>
            {selectedSeriesIndices.length === 0 ? (
              <SeriesSelector series={verbSeries} onSelect={setSelectedSeriesIndices} />
            ) : (
              <>
                 <div className="text-center mb-6">
                  <button 
                    onClick={() => setSelectedSeriesIndices([])}
                    className="bg-slate-200 text-slate-700 font-semibold py-2 px-5 rounded-full hover:bg-slate-300 transition-colors"
                  >
                    ← Changer de série(s)
                  </button>
                  <h2 className="text-2xl font-bold mt-4">
                    Série(s) {selectedSeriesIndices.sort((a, b) => a - b).map(i => i + 1).join(', ')}
                  </h2>
                </div>

                {activeView === 'focus' && <FlipCardView verbs={activeVerbs} />}
                {activeView === 'quiz' && <Quiz verbs={activeVerbs} />}
                {activeView === 'hangman' && <Hangman verbs={activeVerbs} />}
                {activeView === 'matching' && <MatchingGame verbs={activeVerbs} />}
                {activeView === 'srs' && <Evaluation verbs={activeVerbs} />}
              </>
            )}
          </>
        )}

      </main>
      <Footer onShowSource={() => setIsSourceModalOpen(true)} />
    </div>
  );
};

export default App;`,
  'components/MatchingGame.tsx': `import React, { useState, useEffect, useCallback, useRef } from 'react';
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
    return \`\${minutes}:\${secs.toString().padStart(2, '0')}\`;
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
        return \`\${base} bg-green-100 border-green-400 text-green-800 cursor-not-allowed opacity-60 line-through\`;
    }
    
    if (incorrectPair && ((side === 'left' && incorrectPair[0] === id) || (side === 'right' && incorrectPair[1] === id))) {
        return \`\${base} bg-red-100 border-red-500 animate-shake\`;
    }
    
    if (side === 'left' && selectedLeftId === id) {
        return \`\${base} bg-orange-100 border-orange-500 ring-2 ring-orange-400\`;
    }
    
    return \`\${base} bg-white border-slate-300 hover:bg-slate-50 hover:border-orange-400\`;
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
                        className={\`\${getItemClasses(item.id, 'right')} disabled:cursor-not-allowed disabled:bg-slate-100 disabled:border-slate-200\`}
                    >
                         <span className="font-semibold text-lg">{item.text}</span>
                    </button>
                ))}
            </div>
        </div>

        <LeaderboardPodium game="matching" gameId={gameId} />

        <style>
        {\`
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
            20%, 40%, 60%, 80% { transform: translateX(5px); }
          }
          .animate-shake {
            animation: shake 0.5s ease-in-out;
          }
        \`}
        </style>
    </div>
  );
};

export default MatchingGame;
`,
  'components/LeaderboardPodium.tsx': `import React, { useState, useEffect } from 'react';
import { leaderboardManager } from '../utils/leaderboard';
import type { LeaderboardScore } from '../types';

interface LeaderboardPodiumProps {
    game: string;
    gameId: number; // A changing key to trigger re-fetches
}

const formatTime = (seconds: number) => {
    if (seconds === Infinity || typeof seconds !== 'number') return "-:--";
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return \`\${minutes}:\${secs.toString().padStart(2, '0')}\`;
};

const PodiumPlace: React.FC<{ rank: number; score?: LeaderboardScore; icon: string }> = ({ rank, score, icon }) => {
    const time = score ? formatTime(score.time) : "-:--";
    const name = score ? score.name : '???';
    const date = score ? new Date(score.date).toLocaleDateString('fr-FR') : 'N/A';
    
    const heightClasses: { [key: number]: string } = { 1: 'h-40', 2: 'h-32', 3: 'h-24' };
    const bgColorClasses: { [key: number]: string } = { 1: 'bg-amber-400', 2: 'bg-slate-400', 3: 'bg-yellow-700' };

    return (
        <div className="flex flex-col items-center w-32">
            <p className="text-4xl">{icon}</p>
            <div className={\`w-full text-center rounded-t-lg flex flex-col justify-center items-center p-2 text-white font-bold \${heightClasses[rank]} \${bgColorClasses[rank]}\`}>
                <span className="text-lg font-semibold truncate w-full px-1">{name}</span>
                <span className="text-2xl my-1">{time}</span>
                <span className="text-xs opacity-80">{date}</span>
            </div>
        </div>
    );
};

const LeaderboardPodium: React.FC<LeaderboardPodiumProps> = ({ game, gameId }) => {
    const [scores, setScores] = useState<LeaderboardScore[]>([]);

    useEffect(() => {
        setScores(leaderboardManager.getScores(game));
    }, [game, gameId]);

    return (
        <div className="w-full mt-12 p-6 bg-white rounded-xl shadow-lg border border-slate-200">
            <h3 className="text-2xl font-bold text-center text-slate-800 mb-6">🏆 Podium des Meilleurs Temps</h3>
            <div className="flex justify-center items-end gap-2 sm:gap-4">
                <PodiumPlace rank={2} score={scores[1]} icon="🥈" />
                <PodiumPlace rank={1} score={scores[0]} icon="🥇" />
                <PodiumPlace rank={3} score={scores[2]} icon="🥉" />
            </div>
        </div>
    );
};

export default LeaderboardPodium;`,
  'types.ts': `export interface Verb {
  fr: string;
  nl: {
    infinitive: string;
    preterite: string;
    participle: string;
  };
}

export interface QuizQuestion {
  prompt: string;
  answer: string;
  verb: Verb;
}

export interface GeminiFeedback {
  isCorrect: boolean;
  feedback: string;
}

export interface ExampleSentence {
  nl_sentence: string;
  fr_sentence: string;
}

export interface VerbUserData {
  [infinitive: string]: {
    masteryLevel: number;
    nextReview: string; // ISO string date
  };
}

export interface Trophy {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export interface LeaderboardScore {
  time: number; // in seconds
  date: string; // ISO string date
  name: string;
}
`,
  'utils/leaderboard.ts': `import type { LeaderboardScore } from '../types';

const LEADERBOARD_KEY_PREFIX = 'leaderboard_';
const USERNAME_KEY = 'leaderboard_username';
const MAX_SCORES = 10;

class LeaderboardManager {
  private getKey(game: string): string {
    return \`\${LEADERBOARD_KEY_PREFIX}\${game}\`;
  }

  public getScores(game: string): LeaderboardScore[] {
    try {
      const stored = localStorage.getItem(this.getKey(game));
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.error('Error parsing leaderboard data', e);
      return [];
    }
  }

  public getUserName(): string {
    return localStorage.getItem(USERNAME_KEY) || 'Anonyme';
  }

  public setUserName(name: string): void {
    if (name && name.trim()) {
        localStorage.setItem(USERNAME_KEY, name.trim());
    }
  }

  public addScore(game: string, time: number): void {
    if (time <= 0) return;
    const scores = this.getScores(game);
    const newScore: LeaderboardScore = {
      time,
      date: new Date().toISOString(),
      name: this.getUserName(),
    };
    
    scores.push(newScore);
    // Sort by time, ascending.
    scores.sort((a, b) => a.time - b.time);
    
    const topScores = scores.slice(0, MAX_SCORES);
    
    try {
      localStorage.setItem(this.getKey(game), JSON.stringify(topScores));
    } catch (e) {
      console.error('Error saving leaderboard data', e);
    }
  }
}

export const leaderboardManager = new LeaderboardManager();`,
};

interface SourceCodeModalProps {
  onClose: () => void;
}

const SourceCodeModal: React.FC<SourceCodeModalProps> = ({ onClose }) => {
  const [activeFile, setActiveFile] = useState<string>('App.tsx');
  const [copySuccess, setCopySuccess] = useState('');

  const handleCopy = () => {
    navigator.clipboard.writeText(sourceCodeData[activeFile] || '').then(() => {
        setCopySuccess('Copié !');
        setTimeout(() => setCopySuccess(''), 2000);
    }, () => {
        setCopySuccess('Échec de la copie');
        setTimeout(() => setCopySuccess(''), 2000);
    });
  };

  const fileOrder = [
    'index.html', 'index.tsx', 'metadata.json', 'App.tsx', 'types.ts',
    'data/verbs.ts', 'data/trophies.ts',
    'utils/gamification.ts', 'utils/srs.ts', 'utils/leaderboard.ts',
    'components/Header.tsx', 'components/Footer.tsx', 'components/SeriesSelector.tsx', 
    'components/FlipCardView.tsx', 'components/Quiz.tsx', 'components/MatchingGame.tsx', 
    'components/Hangman.tsx', 'components/Evaluation.tsx', 'components/TrophiesPage.tsx',
    'components/SearchBar.tsx', 'components/SearchResultItem.tsx',
    'components/TrophyNotification.tsx', 'components/LeaderboardPodium.tsx', 
    'components/ExampleSentenceGenerator.tsx', 'components/SourceCodeModal.tsx'
  ];

  const sortedFiles = fileOrder.filter(f => sourceCodeData[f]);


  return (
    <div 
      className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white w-full max-w-4xl h-[90vh] rounded-xl shadow-2xl flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <header className="flex items-center justify-between p-4 border-b bg-slate-50">
          <h2 className="text-xl font-bold text-slate-800">Code Source de l'Application</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-800">&times;</button>
        </header>
        <div className="flex flex-1 overflow-hidden">
          <aside className="w-1/4 md:w-1/5 bg-slate-100 p-4 overflow-y-auto">
            <h3 className="font-semibold mb-2 text-slate-600">Fichiers</h3>
            <ul>
              {sortedFiles.map(filename => (
                <li key={filename}>
                  <button 
                    onClick={() => setActiveFile(filename)}
                    className={`w-full text-left px-2 py-1 rounded text-sm ${activeFile === filename ? 'bg-orange-200 text-orange-800 font-semibold' : 'text-slate-700 hover:bg-slate-200'}`}
                  >
                    {filename.replace('components/', '').replace('utils/', '').replace('data/', '')}
                  </button>
                </li>
              ))}
            </ul>
          </aside>
          <main className="flex-1 flex flex-col">
            <div className="p-4 flex justify-between items-center border-b">
                <p className="font-mono text-sm text-slate-600">{activeFile}</p>
                <button onClick={handleCopy} className="bg-slate-200 text-slate-700 text-xs font-semibold py-1 px-3 rounded-md hover:bg-slate-300">
                    {copySuccess || 'Copier'}
                </button>
            </div>
            <div className="flex-1 overflow-auto">
                <pre className="p-4 text-sm"><code className="language-javascript">{sourceCodeData[activeFile] || 'Fichier non trouvé.'}</code></pre>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default SourceCodeModal;
