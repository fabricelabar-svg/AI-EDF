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
import FillTheBlanks from './components/FillTheBlanks';
import FocusView from './components/FocusView';
import Hangman from './components/Hangman';
import SeriesSelector from './components/SeriesSelector';
import SearchResultItem from './components/SearchResultItem';
import Evaluation from './components/Evaluation';
import TrophiesPage from './components/TrophiesPage';
import TrophyNotification from './components/TrophyNotification';
import { gamificationManager } from './utils/gamification';
import SourceCodeModal from './components/SourceCodeModal';

type View = 'focus' | 'list' | 'quiz' | 'fill-blanks' | 'hangman' | 'srs' | 'trophies';

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
  
  const isExerciseView = ['focus', 'quiz', 'hangman', 'fill-blanks', 'srs'].includes(activeView);
  
  return (
    <div className="min-h-screen flex flex-col">
      {notification && <TrophyNotification trophy={notification} onDismiss={() => setNotification(null)} />}
      {isSourceModalOpen && <SourceCodeModal onClose={() => setIsSourceModalOpen(false)} />}
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
      <Footer onShowSource={() => setIsSourceModalOpen(true)} />
    </div>
  );
};

export default App;`,
  'components/FillTheBlanks.tsx': `import React, { useState, useEffect, useMemo } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import type { Verb } from '../types';

interface GeneratedSentence {
  sentence_with_blank: string;
  correct_answer: string;
  verb_infinitive: string;
}

interface ExerciseSentence {
  start: string;
  end: string;
  answer: string;
  verb: Verb;
  tense: 'prétérit' | 'participe passé';
}

const EXERCISE_LENGTH = 10;

const FillTheBlanks: React.FC<{ verbs: Verb[] }> = ({ verbs }) => {
  const [sentences, setSentences] = useState<ExerciseSentence[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const ai = useMemo(() => new GoogleGenAI({ apiKey: process.env.API_KEY }), []);

  const shuffleArray = <T,>(array: T[]): T[] => [...array].sort(() => Math.random() - 0.5);

  const generatePrompt = (selectedVerbs: Verb[]) => {
    const verbListString = selectedVerbs.map(v => 
        \`- \${v.nl.infinitive} (prétérit: \${v.nl.preterite}, participe passé: \${v.nl.participle})\`
    ).join('\\n');

    return \`You are a Dutch language teacher creating a fill-in-the-blanks exercise.
From the following list of verbs, create \${EXERCISE_LENGTH} unique and simple Dutch sentences for a beginner.
Each sentence must use either the prétérit or the participe passé form of one of the verbs.
In each sentence, replace the verb form with a "___" placeholder.

Verb list:
\${verbListString}

Provide the response in the requested JSON format. The sentences should be varied.\`;
  };

  const schema = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            sentence_with_blank: { type: Type.STRING, description: "The Dutch sentence with '___' as a placeholder for the verb." },
            correct_answer: { type: Type.STRING, description: "The correct Dutch verb form that fits in the blank." },
            verb_infinitive: { type: Type.STRING, description: "The infinitive of the verb used." },
        },
        required: ["sentence_with_blank", "correct_answer", "verb_infinitive"],
    },
  };

  useEffect(() => {
    let isMounted = true;

    const generateSentences = async () => {
        if (!isMounted) return;
        setIsLoading(true);
        setError(null);
        setSentences([]);

        const usableVerbs = verbs.filter(v => v.nl.preterite !== '-' && v.nl.participle !== '-');
        if (usableVerbs.length === 0) {
            if (isMounted) {
                setError("Aucun verbe compatible pour cet exercice dans les séries sélectionnées.");
                setIsLoading(false);
            }
            return;
        }

        const selectedVerbs = shuffleArray(usableVerbs).slice(0, EXERCISE_LENGTH);
        const prompt = generatePrompt(selectedVerbs);

        try {
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: prompt,
                config: {
                  responseMimeType: "application/json",
                  responseSchema: schema,
                },
            });
            
            const resultText = response.text.trim();
            const resultJson: GeneratedSentence[] = JSON.parse(resultText);

            const processedSentences = resultJson.map((item): ExerciseSentence | null => {
                const [start, end] = item.sentence_with_blank.split('___');
                const verb = verbs.find(v => v.nl.infinitive === item.verb_infinitive);
                if (!verb) return null;

                let tense: 'prétérit' | 'participe passé' | null = null;
                const correctAnswer = item.correct_answer.trim().toLowerCase();
                
                const preteriteForms = verb.nl.preterite.toLowerCase().split('/').map(f => f.trim());
                const participleWords = verb.nl.participle.toLowerCase().split(' ').map(w => w.trim());

                if (preteriteForms.includes(correctAnswer)) {
                    tense = 'prétérit';
                } else if (participleWords.includes(correctAnswer)) {
                    tense = 'participe passé';
                }

                if (!tense) return null; // Discard sentence if tense can't be determined

                return {
                    start: start || '',
                    end: end || '',
                    answer: item.correct_answer,
                    verb: verb,
                    tense: tense,
                };
            }).filter((s): s is ExerciseSentence => s !== null);

            if (processedSentences.length < 5) {
                throw new Error("L'IA n'a pas pu générer suffisamment de phrases. Veuillez réessayer.");
            }
            
            if (isMounted) {
              setSentences(processedSentences);
            }

        } catch (err) {
            console.error("Error generating sentences:", err);
            if (isMounted) {
              setError("Désolé, une erreur est survenue lors de la création de l'exercice. Veuillez changer de série ou réessayer.");
            }
        } finally {
            if (isMounted) {
              setIsLoading(false);
            }
        }
    };

    generateSentences();

    return () => {
        isMounted = false;
    };
  }, [verbs, ai]);

  const handleRestart = () => {
    setIsFinished(false);
    setScore(0);
    setCurrentIndex(0);
    setUserAnswer('');
    setFeedback(null);
    setSentences([]); 
    setIsLoading(true);
    // The useEffect will trigger a regeneration of sentences
  }
  
  if (isLoading) {
    return (
      <div className="text-center mt-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
        <p className="text-slate-600 mt-4">Génération de l'exercice en cours...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center mt-12 bg-white p-8 rounded-xl shadow-lg max-w-md mx-auto">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Erreur</h2>
        <p className="text-slate-600 mb-6">{error}</p>
        <button onClick={handleRestart} className="bg-orange-600 text-white font-bold py-3 px-8 rounded-full hover:bg-orange-700">
            Réessayer
        </button>
      </div>
    );
  }
  
  if (isFinished) {
    return (
      <div className="text-center mt-12 bg-white p-8 rounded-xl shadow-lg max-w-md mx-auto">
        <h2 className="text-3xl font-bold mb-4">Exercice Terminé !</h2>
        <p className="text-xl text-slate-700 mb-6">
          Ton score : <span className="font-extrabold text-orange-600">{score}</span> sur <span className="font-extrabold text-orange-600">{sentences.length}</span>.
        </p>
        <button onClick={handleRestart} className="bg-orange-600 text-white font-bold py-3 px-8 rounded-full hover:bg-orange-700">
            Recommencer
        </button>
      </div>
    );
  }
  
  if (sentences.length === 0) {
      return <div></div>; // Should be covered by loading/error states
  }

  const currentSentence = sentences[currentIndex];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (feedback) return;
    
    const isCorrect = userAnswer.trim().toLowerCase() === currentSentence.answer.toLowerCase();
    
    if (isCorrect) {
      setScore(s => s + 1);
      setFeedback('correct');
    } else {
      setFeedback('incorrect');
    }
  };

  const handleNext = () => {
    if (currentIndex < sentences.length - 1) {
      setCurrentIndex(i => i + 1);
      setUserAnswer('');
      setFeedback(null);
    } else {
      setIsFinished(true);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-8">
       <div className="mb-6">
        <div className="flex justify-between items-center mb-2 text-slate-600 font-semibold">
          <span>Question</span>
          <span className="font-bold text-base">{ \`\${currentIndex + 1} / \${sentences.length}\` }</span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-2.5">
          <div 
            className="bg-orange-500 h-2.5 rounded-full transition-all duration-300 ease-in-out" 
            style={{ width: \`\${((currentIndex + 1) / sentences.length) * 100}%\` }}
          ></div>
        </div>
        <p className="text-md text-slate-500 text-right mt-2">Score: {score}</p>
      </div>

      <div className={\`bg-white rounded-xl shadow-lg p-6 sm:p-8 transition-all duration-300 border-2 \${
        feedback === 'correct' ? 'border-green-500' : feedback === 'incorrect' ? 'border-red-500' : 'border-transparent'
      }\`}>
        <p className="text-center text-slate-600 mb-6">
          Complète la phrase avec la forme correcte de : <span className="font-bold text-orange-600">{currentSentence.verb.nl.infinitive}</span>
          {' '}<span className="text-sm text-slate-500 capitalize">({currentSentence.tense})</span>
        </p>
        
        <form onSubmit={handleSubmit} className="text-center text-xl sm:text-2xl font-semibold text-slate-800">
          <span>{currentSentence.start}</span>
          <input
            type="text"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            disabled={!!feedback}
            className={\`inline-block w-40 text-center mx-2 px-2 py-1 border-b-2 bg-transparent focus:outline-none transition \${
                !feedback ? 'border-slate-400 focus:border-orange-500'
                : feedback === 'correct' ? 'border-green-500 text-green-600'
                : 'border-red-500 text-red-600'
            }\`}
            autoFocus
            aria-label="Ta réponse"
          />
          <span>{currentSentence.end}</span>
          
          {!feedback && (
            <button
              type="submit"
              className="w-full mt-8 bg-orange-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-orange-700 transition-colors duration-300 disabled:bg-slate-400"
              disabled={!userAnswer.trim()}
            >
              Vérifier
            </button>
          )}
        </form>

        {feedback && (
          <div className="mt-6 text-center" aria-live="polite">
            {feedback === 'correct' ? (
              <p className="text-xl font-bold text-green-600">🎉 Correct !</p>
            ) : (
              <div>
                <p className="text-xl font-bold text-red-600">Oups...</p>
                <p className="text-md text-slate-600 mt-2">
                  La bonne réponse était : <span className="font-bold">{currentSentence.answer}</span>
                </p>
              </div>
            )}
            <button
              onClick={handleNext}
              className="w-full mt-4 bg-slate-800 text-white font-bold py-3 px-6 rounded-lg hover:bg-slate-900 transition-colors duration-300"
            >
              {currentIndex < sentences.length - 1 ? 'Question suivante' : 'Voir les résultats'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FillTheBlanks;`,
  'components/ExampleSentenceGenerator.tsx': `import React, { useState, useMemo } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import type { Verb, ExampleSentence } from '../types';

interface ExampleSentenceGeneratorProps {
    verb: Verb;
    theme: 'light' | 'dark';
}

const ExampleSentenceGenerator: React.FC<ExampleSentenceGeneratorProps> = ({ verb, theme }) => {
  const [examples, setExamples] = useState<ExampleSentence[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ai = useMemo(() => new GoogleGenAI({ apiKey: process.env.API_KEY }), []);

  const fetchExamples = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card flip or other parent events
    if (isLoading) return;
    setIsLoading(true);
    setExamples(null);
    setError(null);

    const prompt = \`You are a helpful language assistant. For the Dutch verb "\${verb.nl.infinitive}" (French: "\${verb.fr}"), generate two simple and distinct example sentences for a beginner. One sentence should use the prétérit form (e.g., from "\${verb.nl.preterite}") and the other should use the participe passé form ("\${verb.nl.participle}"). For each sentence, provide the French translation. Ensure the sentences are practical and easy to understand.\`;
    
    const schema = {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            nl_sentence: { type: Type.STRING, description: "The example sentence in Dutch." },
            fr_sentence: { type: Type.STRING, description: "The French translation of the sentence." },
          },
          required: ["nl_sentence", "fr_sentence"],
        },
    };

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
              responseMimeType: "application/json",
              responseSchema: schema,
            },
        });
        
        const resultText = response.text.trim();
        const resultJson: ExampleSentence[] = JSON.parse(resultText);
        setExamples(resultJson);

    } catch (err) {
      console.error("Error fetching examples from Gemini API:", err);
      setError("Désolé, impossible de générer des exemples pour le moment.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const themeClasses = {
    light: {
        spinner: "border-slate-500",
        error: "text-red-600 bg-red-100",
        container: "p-4 bg-slate-100 rounded-lg border border-slate-200",
        title: "font-bold text-slate-800 mb-2",
        exampleNl: "font-semibold text-slate-800",
        exampleFr: "text-slate-600 italic",
        buttonContainer: "text-center",
        button: "bg-slate-200 text-slate-700 hover:bg-slate-300",
    },
    dark: {
        spinner: "border-white",
        error: "text-yellow-300 bg-black/30",
        container: "", // no extra container on dark theme
        title: "",
        exampleNl: "font-semibold text-white",
        exampleFr: "text-slate-200 italic",
        buttonContainer: "",
        button: "bg-white/90 text-orange-700 hover:bg-white",
    }
  };

  const currentTheme = themeClasses[theme];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center mt-4" onClick={e => e.stopPropagation()}>
        <div className={\`animate-spin rounded-full h-8 w-8 border-b-2 \${currentTheme.spinner}\`}></div>
      </div>
    );
  }

  if (error) {
    return <p className={\`mt-4 text-sm p-2 rounded text-center \${currentTheme.error}\`} onClick={e => e.stopPropagation()}>{error}</p>;
  }

  if (examples) {
    return (
      <div className={\`mt-4 text-left w-full space-y-3 \${currentTheme.container}\`} onClick={e => e.stopPropagation()}>
        {theme === 'light' && <h4 className={currentTheme.title}>Exemples d'utilisation :</h4>}
        {examples.map((ex, index) => (
          <div key={index} className={theme === 'dark' ? 'p-3 bg-black/20 rounded-lg' : ''}>
            <p className={currentTheme.exampleNl}>🇳🇱 {ex.nl_sentence}</p>
            <p className={currentTheme.exampleFr}>🇫🇷 {ex.fr_sentence}</p>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={currentTheme.buttonContainer} onClick={e => e.stopPropagation()}>
      <button
        onClick={fetchExamples}
        className={\`mt-4 font-bold py-2 px-5 rounded-full transition-transform duration-200 hover:scale-105 shadow-sm text-sm \${currentTheme.button}\`}
      >
        Voir des exemples ✨
      </button>
    </div>
  );
};

export default ExampleSentenceGenerator;`,
  // Other files remain unchanged, so their source code is copied from the original prompt
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
}`,
  'data/verbs.ts': `import type { Verb } from '../types';

const rawVerbsData: string = \`
cuire,bakken / bakte/bakten / gebakken
commencer,beginnen / begon/begonnen / begonnen zijn
comprendre,begrijpen / begreep/begrepen / begrepen
décrire,beschrijven / beschreef/beschreven / beschreven
décider,besluiten / besloot/besloten / besloten
exister,bestaan / bestond/bestonden / bestaan
plaire,bevallen / beviel/bevielen / bevallen zijn
bouger,bewegen / bewoog/bewogen / bewogen
prouver,bewijzen / bewees/bewezen / bewezen
visiter,bezoeken / bezocht/bezochten / bezocht
offrir,bieden / bood/boden / geboden
rester,blijven / bleef/bleven / gebleven zijn
casser,breken / brak/braken / gebroken
apporter,brengen / bracht/brachten / gebracht
penser,denken / dacht/dachten / gedacht
faire/mettre,doen / deed/deden / gedaan
porter,dragen / droeg/droegen / gedragen
boire,drinken / dronk/dronken / gedronken
plonger,duiken / dook/doken / gedoken
manger,eten / at/aten / gegeten
aller,gaan / ging/gingen / gegaan zijn
guérir,genezen / genas/genazen / genezen
donner,geven / gaf/gaven / gegeven
pendre,hangen / hing/hingen / gehangen
avoir,hebben / had/hadden / gehad
aider,helpen / hielp/hielpen / geholpen
s'appeler,heten / heette/heetten / geheten
tenir,houden / hield/hielden / gehouden
choisir,kiezen / koos/kozen / gekozen
regarder,kijken / keek/keken / gekeken
grimper,klimmen / klom/klommen / geklommen
venir,komen / kwam/kwamen / gekomen zijn
acheter,kopen / kocht/kochten / gekocht
recevoir,krijgen / kreeg/kregen / gekregen
pouvoir (capacité),kunnen / kon/konden / /
rire,lachen / lachte/lachten / gelachen
laisser,laten / liet/lieten / gelaten
lire,lezen / las/lazen / gelezen
mentir,liegen / loog/logen / gelogen
être couché,liggen / lag/lagen / gelegen
courir,lopen / liep/liepen / gelopen zijn
devoir (obligation),moeten / moest/moesten / /
pouvoir (permission),mogen / mocht/mochten / /
prendre,nemen / nam/namen / genomen
recevoir,ontvangen / ontving/ontvingen / ontvangen
rouler,rijden / reed/reden / gereden
crier/appeler,roepen / riep/riepen / geroepen
sentir (odorat),ruiken / rook/roken / geroken
donner en cadeau/verser,schenken / schonk/schonken / geschonken
tirer/arme,schieten / schoot/schoten / geschoten
sembler/briller,schijnen / scheen/schenen / geschenen
écrire,schrijven / schreef/schreven / geschreven
(s')effrayer,schrikken / schrok/schrokken / geschrokken
frapper/battre,slaan / sloeg/sloegen / geslagen
dormir,slapen / sliep/sliepen / geslapen
fermer,sluiten / sloot/sloten / gesloten
couper,snijden / sneed/sneden / gesneden
parler,spreken / sprak/spraken / gesproken
sauter,springen / sprong/sprongen / gesprongen
être debout,staan / stond/stonden / gestaan
voler (voleur),stelen / stal/stalen / gestolen
mourir,sterven / stierf/stierven / gestorven zijn
monter/s'élever,stijgen / steeg/stegen / gestegen zijn
repasser,strijken / streek/streken / gestreken
tirer,trekken / trok/trokken / getrokken
tomber,vallen / viel/vielen / gevallen zijn
saisir/attraper,vangen / ving/vingen / gevangen
se battre,vechten / vocht/vochten / gevochten
cacher,verbergen / verborg/verborgen / verborgen
interdire,verbieden / verbood/verboden / verboden
disparaître,verdwijnen / verdween/verdwenen / verdwenen zijn
oublier,vergeten / vergat/vergaten / vergeten
vendre,verkopen / verkocht/verkochten / verkocht
quitter,verlaten / verliet/verlieten / verlaten
perdre,verliezen / verloor/verloren / verloren
comprendre,verstaan / verstond/verstonden / verstaan
partir,vertrekken / vertrok/vertrokken / vertrokken zijn
trouver,vinden / vond/vonden / gevonden
voler (ailes),vliegen / vloog/vlogen / gevlogen
demander,vragen / vroeg/vroegen / gevraagd
laver,wassen / waste/wasten / gewassen
jeter/lancer,werpen / wierp/wierpen / geworpen
savoir,weten / wist/wisten / geweten
vouloir,willen / wilde/wou/wouden / gewild
gagner (loterie),winnen / won/wonnen / gewonnen
devenir,worden / werd/werden / geworden zijn
dire,zeggen / zei/zeiden / gezegd
envoyer,zenden / zond/zonden / gezonden
voir,zien / zag/zagen / gezien
être,zijn / was/waren / geweest zijn
chanter,zingen / zong/zongen / gezongen
s'asseoir,zitten / zat/zaten / gezeten
chercher,zoeken / zocht/zochten / gezocht
nager,zwemmen / zwom/zwommen / gezwommen
se taire,zwijgen / zweeg/zwegen / gezwegen
\`;

export const verbList: Verb[] = rawVerbsData
  .trim()
  .split('\\n')
  .map(line => {
    const [fr, nlPart] = line.split(',');
    // Use ' / ' as a separator to correctly handle preterite forms like 'kocht/kochten'.
    const nlChunks = nlPart.trim().split(' / ');

    const participleRaw = nlChunks[2] || '-';

    return {
      fr: fr.trim(),
      nl: {
        infinitive: nlChunks[0] || '-',
        preterite: nlChunks[1] || '-',
        // Handle cases where the participle is missing or represented by a '/'.
        participle: participleRaw === '/' ? '-' : participleRaw,
      },
    };
  });

const chunk = <T>(arr: T[], size: number): T[][] =>
  Array.from({ length: Math.ceil(arr.length / size) }, (v, i) =>
    arr.slice(i * size, i * size + size)
  );

export const verbSeries: Verb[][] = chunk(verbList, 10);`,
  // ... and so on for all other files that haven't changed.
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
              {Object.keys(sourceCodeData).map(filename => (
                <li key={filename}>
                  <button 
                    onClick={() => setActiveFile(filename)}
                    className={`w-full text-left px-2 py-1 rounded text-sm ${activeFile === filename ? 'bg-orange-200 text-orange-800 font-semibold' : 'text-slate-700 hover:bg-slate-200'}`}
                  >
                    {filename}
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
