import React, { useState, useMemo, useEffect } from 'react';
import { verbList, verbSeries } from './data/verbs';
import type { Verb, Trophy } from './types';
import Header from './components/Header';
import SearchBar from './components/SearchBar';
import Footer from './components/Footer';
import Quiz from './components/Quiz';
import FillTheBlanks from './components/FillTheBlanks';
import FocusView from './components/FocusView';
import Hangman from './components/Hangman';
import SeriesSelector from './components/SeriesSelector';
import SearchResultItem from './components/SearchResultItem';
import Evaluation from './components/Evaluation';
import TrophiesPage from './components/TrophiesPage';
import TrophyNotification from './components/TrophyNotification';
import { gamificationManager } from './utils/gamification';

type View = 'focus' | 'list' | 'quiz' | 'fill-blanks' | 'hangman' | 'srs' | 'trophies';

const App: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeView, setActiveView] = useState<View>('focus');
  const [selectedSeriesIndices, setSelectedSeriesIndices] = useState<number[]>([]);

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
        className={`px-6 py-2 rounded-full font-semibold transition-colors duration-300 ${
          isActive
            ? 'bg-orange-600 text-white shadow-md'
            : 'bg-white text-slate-600 hover:bg-slate-100'
        }`}
      >
        {label}
      </button>
    );
  };
  
  const isExerciseView = ['focus', 'quiz', 'hangman', 'fill-blanks', 'srs'].includes(activeView);
  
  return (
    <div className="min-h-screen flex flex-col">
      {notification && <TrophyNotification trophy={notification} onDismiss={() => setNotification(null)} />}
      <main className="flex-grow container mx-auto px-4 py-8">
        <Header streak={streak} />

        {/* Tab Navigation */}
        <div className="flex justify-center flex-wrap gap-x-4 gap-y-2 mb-8">
          <TabButton view="focus" label="Étude Focus" />
          <TabButton view="quiz" label="Quiz" />
          <TabButton view="fill-blanks" label="Phrases à Compléter" />
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
                      <SearchResultItem key={`${verb.nl.infinitive}-${index}`} verb={verb} />
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

                {activeView === 'focus' && <FocusView verbs={activeVerbs} />}
                {activeView === 'quiz' && <Quiz verbs={activeVerbs} />}
                {activeView === 'hangman' && <Hangman verbs={activeVerbs} />}
                {activeView === 'fill-blanks' && <FillTheBlanks verbs={activeVerbs} />}
                {activeView === 'srs' && <Evaluation verbs={activeVerbs} />}
              </>
            )}
          </>
        )}

      </main>
      <Footer />
    </div>
  );
};

export default App;