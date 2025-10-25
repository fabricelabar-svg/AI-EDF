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
import WordOrder from './components/WordOrder';
import SeriesSelector from './components/SeriesSelector';
import SearchResultItem from './components/SearchResultItem';
import Evaluation from './components/Evaluation';
import TrophiesPage from './components/TrophiesPage';
import TrophyNotification from './components/TrophyNotification';
import { gamificationManager } from './utils/gamification';
import SourceCodeModal from './components/SourceCodeModal';

type View = 'focus' | 'list' | 'quiz' | 'matching' | 'hangman' | 'srs' | 'trophies' | 'word-order';

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
  
  const isExerciseView = ['focus', 'quiz', 'hangman', 'matching', 'srs', 'word-order'].includes(activeView);
  
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
          <TabButton view="word-order" label="Ordre des Mots" />
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
                {activeView === 'word-order' && <WordOrder verbs={activeVerbs} />}
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

export interface WordOrderSentence {
  infinitive: string;
  nl: string;
  fr: string;
}
`,
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
quitter,verlaten / verliet/lieten / verlaten
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
  'data/sentences.ts': `import type { WordOrderSentence } from '../types';

export const sentenceList: WordOrderSentence[] = [
  { infinitive: 'bakken', nl: 'Ik heb een taart gebakken.', fr: "J'ai cuit un gâteau." },
  { infinitive: 'beginnen', nl: 'De film is net begonnen.', fr: 'Le film vient de commencer.' },
  { infinitive: 'begrijpen', nl: 'Hij begreep de vraag niet.', fr: "Il ne comprenait pas la question." },
  { infinitive: 'blijven', nl: 'Zij is de hele dag thuis gebleven.', fr: 'Elle est restée toute la journée à la maison.' },
  { infinitive: 'brengen', nl: 'Hij heeft de boeken teruggebracht.', fr: 'Il a rapporté les livres.' },
  { infinitive: 'denken', nl: 'Ik dacht dat je zou komen.', fr: 'Je pensais que tu viendrais.' },
  { infinitive: 'doen', nl: 'Wat heb je gisteren gedaan?', fr: "Qu'as-tu fait hier ?" },
  { infinitive: 'drinken', nl: 'Wij dronken een kopje koffie.', fr: 'Nous buvions une tasse de café.' },
  { infinitive: 'eten', nl: 'Ze heeft al gegeten.', fr: 'Elle a déjà mangé.' },
  { infinitive: 'gaan', nl: 'Ik ben naar de winkel gegaan.', fr: 'Je suis allé au magasin.' },
  { infinitive: 'geven', nl: 'De zon gaf veel warmte.', fr: 'Le soleil donnait beaucoup de chaleur.' },
  { infinitive: 'hebben', nl: 'Gisteren had ik geen tijd.', fr: "Hier, je n'avais pas le temps." },
  { infinitive: 'helpen', nl: 'Zij heeft haar moeder geholpen.', fr: 'Elle a aidé sa mère.' },
  { infinitive: 'houden', nl: 'Hij hield de deur voor me open.', fr: 'Il tenait la porte ouverte pour moi.' },
  { infinitive: 'kiezen', nl: 'Ik heb de blauwe jurk gekozen.', fr: "J'ai choisi la robe bleue." },
  { infinitive: 'kijken', nl: 'We keken samen naar de zonsondergang.', fr: 'Nous regardions ensemble le coucher du soleil.' },
  { infinitive: 'komen', nl: 'Wanneer ben je aangekomen?', fr: 'Quand es-tu arrivé ?' },
  { infinitive: 'kopen', nl: 'Zij kocht een nieuwe fiets.', fr: 'Elle achetait un nouveau vélo.' },
  { infinitive: 'krijgen', nl: 'Ik kreeg een brief van mijn vriend.', fr: 'J\\'ai reçu une lettre de mon ami.' },
  { infinitive: 'lezen', nl: 'Hij heeft het hele boek gelezen.', fr: 'Il a lu tout le livre.' },
  { infinitive: 'lopen', nl: 'De kinderen liepen in het park.', fr: 'Les enfants marchaient dans le parc.' },
  { infinitive: 'nemen', nl: 'Zij nam de trein naar Brussel.', fr: 'Elle a pris le train pour Bruxelles.' },
  { infinitive: 'schrijven', nl: 'Ik heb een e-mail geschreven.', fr: "J'ai écrit un e-mail." },
  { infinitive: 'slapen', nl: 'De baby heeft de hele nacht geslapen.', fr: 'Le bébé a dormi toute la nuit.' },
  { infinitive: 'spreken', nl: 'Hij sprak zachtjes met haar.', fr: 'Il lui parlait doucement.' },
  { infinitive: 'vinden', nl: 'Ik heb mijn sleutels gevonden.', fr: 'J\\'ai trouvé mes clés.' },
  { infinitive: 'vragen', nl: 'De leraar vroeg iets aan de student.', fr: "Le professeur a demandé quelque chose à l'étudiant." },
  { infinitive: 'weten', nl: 'Ik wist het antwoord niet.', fr: 'Je ne savais pas la réponse.' },
  { infinitive: 'zien', nl: 'Heb je die film al gezien?', fr: 'As-tu déjà vu ce film ?' },
  { infinitive: 'zijn', nl: 'Ik ben vorig jaar in Spanje geweest.', fr: "J'ai été en Espagne l'année dernière." },
  { infinitive: 'zitten', nl: 'De kat zat op de stoel.', fr: 'Le chat était assis sur la chaise.' },
  { infinitive: 'zoeken', nl: 'Hij zocht overal naar zijn bril.', fr: 'Il cherchait ses lunettes partout.' },
  { infinitive: 'wassen', nl: 'Moeder heeft de kleren gewassen.', fr: 'Maman a lavé les vêtements.' },
  { infinitive: 'zeggen', nl: 'Wat zei je daarnet?', fr: "Qu'as-tu dit à l'instant ?" },
  { infinitive: 'worden', nl: 'Het kind is ziek geworden.', fr: "L'enfant est tombé malade." },
  { infinitive: 'vergeten', nl: 'Ik ben mijn portefeuille vergeten.', fr: "J'ai oublié mon portefeuille." },
  { infinitive: 'verkopen', nl: 'Hij heeft zijn oude auto verkocht.', fr: 'Il a vendu sa vieille voiture.' },
  { infinitive: 'verliezen', nl: 'Ons team heeft de wedstrijd verloren.', fr: 'Notre équipe a perdu le match.' },
  { infinitive: 'sterven', nl: 'De oude koning stierf in zijn kasteel.', fr: 'Le vieux roi est mort dans son château.' },
];`,
  'data/trophies.ts': `import type { Trophy } from '../types';

export const allTrophies: Trophy[] = [
  {
    id: 'first_quiz',
    name: "L'Initié",
    description: 'Termine ton premier quiz.',
    icon: '🎓',
  },
  {
    id: 'explorer',
    name: "L'Explorateur",
    description: "Essaie chaque type d'exercice.",
    icon: '🧭',
  },
  {
    id: 'perfect_score',
    name: 'Score Parfait',
    description: 'Obtiens 100% à un quiz de niveau 2 ou 3.',
    icon: '⭐',
  },
  {
    id: 'hangman_ace',
    name: 'As du Pendu',
    description: 'Gagne au Pendu avec moins de 4 erreurs.',
    icon: '🧠',
  },
  {
    id: 'mastery_apprentice',
    name: 'Apprenti Maître',
    description: 'Atteins le niveau de maîtrise 3 pour 10 verbes.',
    icon: '💪',
  },
  {
    id: 'mastery_master',
    name: 'Maître des Verbes',
    description: 'Atteins le niveau de maîtrise 5 pour 25 verbes.',
    icon: '👑',
  },
  {
    id: 'marathon_runner',
    name: 'Le Marathonien',
    description: "Termine une session d'Évaluation de 30 verbes ou plus.",
    icon: '🏃‍♂️',
  },
  {
    id: 'streak_7',
    name: 'Série de Feu',
    description: 'Maintiens une série de pratique de 7 jours.',
    icon: '🔥',
  },
  {
    id: 'streak_30',
    name: 'Série Infernale',
    description: 'Maintiens une série de 30 jours.',
    icon: '🌋',
  },
  {
    id: 'matching_first_game',
    name: "Le Vif-Argent",
    description: "Termine ton premier Jeu d'Association.",
    icon: '🔗',
  },
  {
    id: 'matching_speed_demon',
    name: "Vitesse de l'Éclair",
    description: "Termine un Jeu d'Association en moins de 30 secondes.",
    icon: '⚡',
  },
];`,
  'utils/gamification.ts': `import { allTrophies } from '../data/trophies';
import type { VerbUserData, Trophy } from '../types';

const STREAK_KEY = 'gamification_streak';
const TROPHIES_KEY = 'gamification_trophies';
const VIEWS_KEY = 'gamification_views';

interface StreakData {
  lastVisit: string; // ISO date string (yyyy-mm-dd)
  count: number;
}

class GamificationManager {
  constructor() {
    this.updateStreak();
    window.addEventListener('gamificationUpdate', this.handleEvent.bind(this) as EventListener);
  }

  // --- STREAK LOGIC ---
  private getTodayString(): string {
    return new Date().toISOString().split('T')[0];
  }
  
  public getStreak(): number {
    const data = this.getStreakData();
    return data.count;
  }

  private getStreakData(): StreakData {
    try {
      const stored = localStorage.getItem(STREAK_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) { console.error('Error parsing streak data', e); }
    return { lastVisit: this.getTodayString(), count: 1 };
  }

  private saveStreakData(data: StreakData): void {
    localStorage.setItem(STREAK_KEY, JSON.stringify(data));
  }
  
  public updateStreak(): void {
    const today = this.getTodayString();
    const data = this.getStreakData();
    
    if (data.lastVisit === today) return; // Already visited today

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayString = yesterday.toISOString().split('T')[0];

    if (data.lastVisit === yesterdayString) {
      // Consecutive day
      data.count += 1;
    } else {
      // Missed a day
      data.count = 1;
    }
    
    data.lastVisit = today;
    this.saveStreakData(data);
    this.checkStreakTrophies(data.count);
  }

  // --- TROPHY LOGIC ---
  public getUnlockedTrophies(): Set<string> {
    try {
      const stored = localStorage.getItem(TROPHIES_KEY);
      if (stored) {
        return new Set(JSON.parse(stored));
      }
    } catch (e) { console.error('Error parsing trophies data', e); }
    return new Set();
  }

  private unlockTrophy(trophyId: string): void {
    const unlocked = this.getUnlockedTrophies();
    if (unlocked.has(trophyId)) return; // Already unlocked

    unlocked.add(trophyId);
    localStorage.setItem(TROPHIES_KEY, JSON.stringify([...unlocked]));

    const trophy = allTrophies.find(t => t.id === trophyId);
    if (trophy) {
      // Dispatch event for UI to show notification
      window.dispatchEvent(new CustomEvent('trophyUnlocked', { detail: trophy }));
    }
  }
  
  // --- VIEW TRACKING for Explorer Trophy ---
  public recordView(view: string): void {
    try {
      // We only care about exercise views for the explorer trophy
      const exerciseViews = ['focus', 'quiz', 'matching', 'hangman', 'srs', 'word-order'];
      if (!exerciseViews.includes(view)) return;

      const stored = localStorage.getItem(VIEWS_KEY);
      const views = stored ? new Set(JSON.parse(stored)) : new Set();
      views.add(view);
      localStorage.setItem(VIEWS_KEY, JSON.stringify([...views]));
      
      if(views.size >= 5) {
          this.unlockTrophy('explorer');
      }
    } catch (e) { console.error('Error recording view', e); }
  }


  // --- EVENT HANDLING ---
  private handleEvent(event: CustomEvent): void {
    const { type, detail } = event.detail;
    switch(type) {
      case 'quiz_completed':
        this.checkQuizTrophies(detail);
        break;
      case 'hangman_won':
        this.checkHangmanTrophies(detail);
        break;
      case 'matching_game_completed':
        this.checkMatchingGameTrophies(detail);
        break;
      case 'srs_data_updated':
        this.checkSrsTrophies(detail);
        break;
    }
  }
  
  private checkStreakTrophies(count: number): void {
      if (count >= 7) this.unlockTrophy('streak_7');
      if (count >= 30) this.unlockTrophy('streak_30');
  }

  private checkQuizTrophies(data: { score: number, total: number, level: number, isSrs: boolean }): void {
    this.unlockTrophy('first_quiz');
    
    if (data.isSrs && data.total >= 30) {
      this.unlockTrophy('marathon_runner');
    }
    
    const isPerfect = data.score === data.total;
    if (isPerfect && data.level >= 2) {
      this.unlockTrophy('perfect_score');
    }
  }
  
  private checkHangmanTrophies(data: { errors: number }): void {
    if (data.errors < 4) {
      this.unlockTrophy('hangman_ace');
    }
  }

  private checkMatchingGameTrophies(data: { time: number }): void {
    this.unlockTrophy('matching_first_game');
    if (data.time < 30) {
      this.unlockTrophy('matching_speed_demon');
    }
  }
  
  private checkSrsTrophies(data: VerbUserData): void {
    const masteryLevels = Object.values(data).map(v => v.masteryLevel);
    const level3Count = masteryLevels.filter(l => l >= 3).length;
    const level5Count = masteryLevels.filter(l => l >= 5).length;
    
    if (level3Count >= 10) this.unlockTrophy('mastery_apprentice');
    if (level5Count >= 25) this.unlockTrophy('mastery_master');
  }
}

export const gamificationManager = new GamificationManager();

// Helper to dispatch events from components
export const recordGameEvent = (type: string, detail: any) => {
  window.dispatchEvent(new CustomEvent('gamificationUpdate', { detail: { type, detail } }));
};`,
  'utils/srs.ts': `import type { Verb, VerbUserData } from '../types';
import { verbList } from '../data/verbs';
import { recordGameEvent } from './gamification';

const STORAGE_KEY = 'dutchVerbsUserData';

// Spacing intervals in days for each mastery level
const MASTERY_LEVEL_INTERVALS: { [level: number]: number } = {
  1: 1,
  2: 3,
  3: 7,
  4: 14,
  5: 30,
  6: 60,
  7: 120,
};
const MAX_MASTERY_LEVEL = 7;

class SrsManager {
  private getAllUserData(): VerbUserData {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error("Could not parse user data from localStorage", error);
      return {};
    }
  }

  private saveAllUserData(data: VerbUserData): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      recordGameEvent('srs_data_updated', data);
    } catch (error) {
      console.error("Could not save user data to localStorage", error);
    }
  }

  public getVerbUserData(infinitive: string) {
    const allUserData = this.getAllUserData();
    return allUserData[infinitive] || { masteryLevel: 0, nextReview: new Date().toISOString() };
  }

  public updateVerbUserData(infinitive: string, isCorrect: boolean): void {
    const allUserData = this.getAllUserData();
    const currentData = allUserData[infinitive] || { masteryLevel: 0 };

    let newMasteryLevel = currentData.masteryLevel;

    if (isCorrect) {
      newMasteryLevel = Math.min(newMasteryLevel + 1, MAX_MASTERY_LEVEL);
    } else {
      // Be forgiving: only drop one level, or reset if it's already low
      newMasteryLevel = newMasteryLevel > 2 ? newMasteryLevel -1 : 1;
    }

    const intervalDays = MASTERY_LEVEL_INTERVALS[newMasteryLevel] || 1;
    const nextReviewDate = new Date();
    nextReviewDate.setDate(nextReviewDate.getDate() + intervalDays);
    
    // Set time to the beginning of the day for consistent daily reviews
    nextReviewDate.setHours(0, 0, 0, 0);

    allUserData[infinitive] = {
      masteryLevel: newMasteryLevel,
      nextReview: nextReviewDate.toISOString(),
    };
    
    this.saveAllUserData(allUserData);
  }

  public getVerbsForReview(sourceVerbs: Verb[] = verbList): Verb[] {
    const allUserData = this.getAllUserData();
    const now = new Date();

    const verbsToReview = sourceVerbs.filter(verb => {
      const userData = allUserData[verb.nl.infinitive];
      if (!userData) {
        // New verbs are always available for review
        return true;
      }
      const nextReviewDate = new Date(userData.nextReview);
      return now >= nextReviewDate;
    });
    
    // Prioritize verbs with lower mastery level.
    // If mastery levels are equal, shuffle the order to provide variety.
    verbsToReview.sort((a, b) => {
        const masteryA = allUserData[a.nl.infinitive]?.masteryLevel ?? 0;
        const masteryB = allUserData[b.nl.infinitive]?.masteryLevel ?? 0;
        
        if (masteryA < masteryB) return -1;
        if (masteryA > masteryB) return 1;

        return Math.random() - 0.5;
    });
    
    return verbsToReview;
  }
}

export const srsManager = new SrsManager();`,
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
  'components/Header.tsx': `import React from 'react';

interface HeaderProps {
  streak: number;
}

const Header: React.FC<HeaderProps> = ({ streak }) => {
  return (
    <header className="text-center mb-8 relative">
       {streak > 0 && (
        <div className="absolute top-0 right-0 sm:right-4 flex items-center gap-2 bg-white px-3 py-1.5 rounded-full shadow-md border border-slate-200">
          <span className="text-xl">🔥</span>
          <span className="font-bold text-slate-700">{streak}</span>
        </div>
      )}
      <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-600">
        Nederlands Leren : hoofdtijden
      </h1>
      <p className="mt-3 text-lg text-slate-600 max-w-2xl mx-auto">
        Apprends et amuse-toi avec les verbes irréguliers en néerlandais.
      </p>
    </header>
  );
};

export default Header;`,
    'components/Footer.tsx': `import React from 'react';

interface FooterProps {
  onShowSource: () => void;
}

const Footer: React.FC<FooterProps> = ({ onShowSource }) => {
  return (
    <footer className="w-full bg-white mt-12 py-4 border-t border-slate-200">
      <div className="container mx-auto text-center text-slate-500 text-sm">
        <p>
          Créé avec passion pour l'apprentissage des langues.
        </p>
        <button onClick={onShowSource} className="mt-2 text-orange-600 hover:underline text-xs">
          Voir le code source
        </button>
      </div>
    </footer>
  );
};

export default Footer;`,
'components/Quiz.tsx': `import React, { useState, useEffect, useRef } from 'react';
import type { Verb, QuizQuestion } from '../types';
import { srsManager } from '../utils/srs';
import { recordGameEvent } from '../utils/gamification';

interface QuizProps {
  verbs: Verb[];
  onQuizComplete?: () => void; // Optional callback for SRS
}

const QUIZ_LENGTH = 10;
type Level = 1 | 2 | 3;

// Web Audio API for sounds
const audioCtx = typeof window !== 'undefined' ? new (window.AudioContext || (window as any).webkitAudioContext)() : null;

const playTickSound = () => {
    if (!audioCtx) return;
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(1000, audioCtx.currentTime);
    gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);
    oscillator.start(audioCtx.currentTime);
    oscillator.stop(audioCtx.currentTime + 0.1);
};

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


const shuffleArray = <T,>(array: T[]): T[] => {
  return [...array].sort(() => Math.random() - 0.5);
};

const Quiz: React.FC<QuizProps> = ({ verbs, onQuizComplete }) => {
  const [quizState, setQuizState] = useState<'idle' | 'active' | 'finished'>('idle');
  const [level, setLevel] = useState<Level | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; correctAnswer: string; timeUp?: boolean } | null>(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const timerRef = useRef<number | null>(null);
  const quizLength = onQuizComplete ? verbs.length : QUIZ_LENGTH;

  useEffect(() => {
    if (quizState === 'finished' && (score / quizLength) >= 0.8) {
      playVictorySound();
    }
  }, [quizState, score, quizLength]);


  useEffect(() => {
    if (quizState === 'active' && level && level > 1 && !feedback) {
      const timeLimit = level === 2 ? 20 : 10;
      setTimeLeft(timeLimit);

      timerRef.current = window.setInterval(() => {
        setTimeLeft(prev => {
          if (prev !== null && prev > 1 && prev <= 6) { // Play tick for 5, 4, 3, 2, 1
            playTickSound();
          }
          if (prev === null || prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            handleTimeUp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [currentQuestionIndex, quizState, level, feedback]);

  const handleTimeUp = () => {
    const currentQuestion = questions[currentQuestionIndex];
    srsManager.updateVerbUserData(currentQuestion.verb.nl.infinitive, false);
    setFeedback({ isCorrect: false, correctAnswer: currentQuestion.answer, timeUp: true });
  };

  const generateQuestions = () => {
    const shuffledVerbs = shuffleArray(verbs);
    const selectedVerbs = onQuizComplete ? shuffledVerbs : shuffledVerbs.slice(0, quizLength);
    
    const newQuestions = selectedVerbs.map((verb: Verb): QuizQuestion => {
      const questionTypes: { prompt: string; answer: string }[] = [];
      
      if (verb.nl.infinitive !== '-') {
          if (verb.nl.participle !== '-') questionTypes.push({ prompt: \`Quel est le participe passé de '\${verb.nl.infinitive}' ?\`, answer: verb.nl.participle });
          if (verb.nl.preterite !== '-') questionTypes.push({ prompt: \`Quel est le prétérit de '\${verb.nl.infinitive}' ?\`, answer: verb.nl.preterite });
          if (verb.fr !== '-') questionTypes.push({ prompt: \`Que signifie '\${verb.nl.infinitive}' en français ?\`, answer: verb.fr });
      }
      if (verb.nl.participle !== '-' && verb.nl.infinitive !== '-') {
        questionTypes.push({ prompt: \`Quel est l'infinitif de '\${verb.nl.participle}' ?\`, answer: verb.nl.infinitive });
      }
      if (verb.fr !== '-' && verb.nl.infinitive !== '-') {
        questionTypes.push({ prompt: \`Comment dit-on '\${verb.fr}' en néerlandais (infinitif) ?\`, answer: verb.nl.infinitive });
      }
      
      const chosenType = questionTypes[Math.floor(Math.random() * questionTypes.length)] || { prompt: \`Comment dit-on '\${verb.fr}' en néerlandais (infinitif) ?\`, answer: verb.nl.infinitive };
      
      return { ...chosenType, verb };
    }).filter(q => q.prompt && q.answer);
    
    setQuestions(newQuestions);
  };

  const startQuiz = (selectedLevel: Level) => {
    setLevel(selectedLevel);
    generateQuestions();
    setQuizState('active');
    setScore(0);
    setCurrentQuestionIndex(0);
    setFeedback(null);
    setUserAnswer('');
  };
  
  // Auto-start quiz if it's for SRS
  useEffect(() => {
    if (onQuizComplete) {
        startQuiz(2); // Start SRS quizzes at medium difficulty by default
    }
  }, [onQuizComplete, verbs]);


  const handleAnswerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (feedback) return;

    if (timerRef.current) clearInterval(timerRef.current);

    const currentQuestion = questions[currentQuestionIndex];
    const correctAnswer = currentQuestion.answer;
    
    const possibleAnswers = correctAnswer.split('/').map(a => a.trim().toLowerCase());
    
    const isCorrect = possibleAnswers.includes(userAnswer.trim().toLowerCase());
    
    srsManager.updateVerbUserData(currentQuestion.verb.nl.infinitive, isCorrect);

    if (isCorrect) {
      setScore(prev => prev + 1);
    }
    setFeedback({ isCorrect, correctAnswer });
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setUserAnswer('');
      setFeedback(null);
    } else {
      setQuizState('finished');
      if (level) { // Level should be set
        recordGameEvent('quiz_completed', { 
            score, 
            total: quizLength, 
            level, 
            isSrs: !!onQuizComplete 
        });
      }
      if (onQuizComplete) {
        onQuizComplete();
      }
    }
  };

  if (quizState === 'idle' && !onQuizComplete) {
    return (
      <div className="text-center mt-12">
        <h2 className="text-2xl font-bold mb-4">Prêt à tester tes connaissances ?</h2>
        <p className="text-slate-600 mb-8">Choisis ton niveau de difficulté.</p>
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
             <button onClick={() => startQuiz(1)} className="bg-orange-600 text-white font-bold py-3 px-8 rounded-full hover:bg-orange-700 transition-colors duration-300 shadow-lg w-60">Niveau 1 😊</button>
             <button onClick={() => startQuiz(2)} className="bg-orange-600 text-white font-bold py-3 px-8 rounded-full hover:bg-orange-700 transition-colors duration-300 shadow-lg w-60">Niveau 2 🏃‍♂️</button>
             <button onClick={() => startQuiz(3)} className="bg-orange-600 text-white font-bold py-3 px-8 rounded-full hover:bg-orange-700 transition-colors duration-300 shadow-lg w-60">Niveau 3 🔥</button>
        </div>
      </div>
    );
  }

  if (quizState === 'finished') {
    return (
      <div className="text-center mt-12 bg-white p-8 rounded-xl shadow-lg max-w-md mx-auto">
        <h2 className="text-3xl font-bold mb-4">Quiz Terminé !</h2>
        <p className="text-xl text-slate-700 mb-6">
          Ton score final est de <span className="font-extrabold text-orange-600">{score}</span> sur <span className="font-extrabold text-orange-600">{quizLength}</span>.
        </p>
        {!onQuizComplete && (
            <button
            onClick={() => setQuizState('idle')}
            className="bg-orange-600 text-white font-bold py-3 px-8 rounded-full hover:bg-orange-700 transition-colors duration-300 shadow-lg"
            >
            Choisir un niveau
            </button>
        )}
      </div>
    );
  }
  
  if (questions.length === 0) {
    return <div>Chargement du quiz...</div>;
  }

  const currentQuestion = questions[currentQuestionIndex];
  const timeLimit = level === 2 ? 20 : 10;

  return (
    <div className="max-w-xl mx-auto mt-8">
       <div className="mb-6">
        <div className="flex justify-between items-center mb-2 text-slate-600 font-semibold text-sm">
          <span>{level === 1 ? 'Niveau: Facile 😊' : level === 2 ? 'Niveau: Moyen 🏃‍♂️' : 'Niveau: Difficile 🔥'}</span>
          <span className="font-bold text-base">{\`\${currentQuestionIndex + 1} / \${quizLength}\`}</span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-2.5">
          <div 
            className="bg-orange-500 h-2.5 rounded-full transition-all duration-300 ease-in-out" 
            style={{ width: \`\${(currentQuestionIndex / quizLength) * 100}%\` }}
          ></div>
        </div>
        <p className="text-md text-slate-500 text-right mt-2">Score: {score}</p>
      </div>
      
      {level && level > 1 && timeLeft !== null && (
         <div className="w-full bg-slate-200 rounded-full h-2.5 mb-4 dark:bg-slate-700">
            <div className="bg-orange-500 h-2.5 rounded-full" style={{ width: \`\${(timeLeft / timeLimit) * 100}%\`, transition: 'width 1s linear' }}></div>
        </div>
      )}

      <div className={\`bg-white rounded-xl shadow-lg p-6 sm:p-8 transition-all duration-300 border-2 \${
        feedback ? (feedback.isCorrect ? 'border-green-500' : 'border-red-500') : 'border-transparent'
      }\`}>
        <p className="text-xl sm:text-2xl font-semibold text-slate-800 text-center mb-6" aria-live="polite">
          {currentQuestion?.prompt}
        </p>
        
        <form onSubmit={handleAnswerSubmit}>
          <input
            type="text"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            disabled={!!feedback}
            placeholder="Ta réponse..."
            className={\`w-full text-center py-3 px-4 border rounded-lg focus:outline-none focus:ring-2 text-lg transition \${
              !feedback 
                ? 'border-slate-300 focus:ring-orange-500' 
                : feedback.isCorrect 
                ? 'border-green-500 bg-green-50 focus:ring-green-500' 
                : 'border-red-500 bg-red-50 focus:ring-red-500'
            }\`}
            aria-label="Réponse"
            autoFocus
          />
          {!feedback && (
            <button
              type="submit"
              className="w-full mt-4 bg-orange-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-orange-700 transition-colors duration-300 disabled:bg-slate-400"
              disabled={!userAnswer}
            >
              Vérifier
            </button>
          )}
        </form>

        {feedback && (
          <div className="mt-6 text-center" aria-live="polite">
            {feedback.isCorrect ? (
              <p className="text-xl font-bold text-green-600">🎉 Correct !</p>
            ) : (
              <div>
                {feedback.timeUp && <p className="text-xl font-bold text-red-600">Temps écoulé !</p>}
                {!feedback.timeUp && <p className="text-xl font-bold text-red-600">Oups, incorrect.</p>}
                <p className="text-md text-slate-600 mt-2">
                  La bonne réponse était : <span className="font-bold">{feedback.correctAnswer}</span>
                  {currentQuestion && (
                    <span className="block text-sm text-slate-500 capitalize mt-1">
                      ({currentQuestion.verb.fr})
                    </span>
                  )}
                </p>
              </div>
            )}
            <button
              onClick={handleNextQuestion}
              className="w-full mt-4 bg-slate-800 text-white font-bold py-3 px-6 rounded-lg hover:bg-slate-900 transition-colors duration-300"
            >
              {currentQuestionIndex < questions.length - 1 ? 'Question suivante' : 'Voir les résultats'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Quiz;`,
    'components/Hangman.tsx': `import React, { useState, useEffect, useCallback } from 'react';
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
            // FIX: Explicitly provide the generic type argument to \`getRandomItem\` to ensure correct type inference.
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
                // FIX: Explicitly provide the generic type argument to \`getRandomItem\` to ensure correct type inference.
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
        <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-2">Jeu du Pendu</h2>
            <p className="text-slate-600 mb-6">Devinez le verbe néerlandais (prétérit ou participe passé).</p>
            
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8">
                <div className="w-full md:w-1/3 h-48 sm:h-64 text-slate-700">
                    <Windmill wrongGuesses={wrongGuesses} />
                </div>
                
                <div className="w-full md:w-2/3 flex flex-col items-center justify-center min-h-[250px]">
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
                        <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
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
            </div>
        </div>
    );
};

export default Hangman;`,
'components/FlipCardView.tsx': `import React, { useState } from 'react';
import type { Verb } from '../types';
import ExampleSentenceGenerator from './ExampleSentenceGenerator';

interface FlipCardViewProps {
  verbs: Verb[];
}

const FlipCard: React.FC<{verb: Verb}> = ({ verb }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleSpeak = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (typeof window.speechSynthesis === 'undefined') return;

    const toSpeak = \`\${verb.nl.infinitive}. \${verb.nl.preterite}. \${verb.nl.participle}.\`;
    const utterance = new SpeechSynthesisUtterance(toSpeak);
    utterance.lang = 'nl-BE';
    utterance.rate = 0.8;
    
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="perspective-1000 w-full h-64 cursor-pointer" onClick={() => setIsFlipped(!isFlipped)}>
      <div className={\`relative w-full h-full transform-style-3d transition-transform duration-700 \${isFlipped ? 'rotate-y-180' : ''}\`}>
        {/* Front of the card */}
        <div className="absolute w-full h-full backface-hidden rounded-xl shadow-lg border border-slate-200 bg-white flex flex-col justify-center items-center p-4">
          <h3 className="text-3xl font-bold text-center text-orange-700 capitalize">{verb.fr}</h3>
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
           <ExampleSentenceGenerator verb={verb} theme="dark" />
        </div>
      </div>
    </div>
  );
};


const FlipCardView: React.FC<FlipCardViewProps> = ({ verbs }) => {
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

export default FlipCardView;`,
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

export default MatchingGame;`,
'components/WordOrder.tsx': `import React, { useState, useEffect, useMemo } from 'react';
import type { Verb } from '../types';
import { sentenceList } from '../data/sentences';

const EXERCISE_LENGTH = 10;

interface Question {
  correctSentence: string;
  shuffledWords: string[];
  hint: string; // French translation of the sentence
}

const shuffleArray = <T,>(array: T[]): T[] => [...array].sort(() => Math.random() - 0.5);

const WordOrder: React.FC<{ verbs: Verb[] }> = ({ verbs }) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userSentence, setUserSentence] = useState<string[]>([]);
  const [wordBank, setWordBank] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [gameId, setGameId] = useState(0);

  const availableSentences = useMemo(() => {
    const selectedVerbInfinitives = new Set(verbs.map(v => v.nl.infinitive));
    return sentenceList.filter(s => selectedVerbInfinitives.has(s.infinitive));
  }, [verbs]);

  const generateQuestions = useMemo(() => {
    return () => {
        setIsLoading(true);
        
        const shuffledSentences = shuffleArray(availableSentences);
        const selectedSentences = shuffledSentences.slice(0, EXERCISE_LENGTH);

        const generatedQuestions: Question[] = selectedSentences.map(sentence => {
            const words = sentence.nl.split(' ');
            return {
                correctSentence: sentence.nl,
                shuffledWords: shuffleArray(words),
                hint: sentence.fr,
            };
        });

        setQuestions(generatedQuestions);
        setIsLoading(false);
    };
  }, [availableSentences]);

  useEffect(() => {
    generateQuestions();
  }, [gameId, generateQuestions]);

  useEffect(() => {
    if (questions.length > 0) {
      setWordBank(questions[currentIndex].shuffledWords);
      setUserSentence([]);
    }
  }, [currentIndex, questions]);

  const handleWordBankClick = (word: string, index: number) => {
    if (feedback) return;
    setUserSentence(prev => [...prev, word]);
    setWordBank(prev => prev.filter((_, i) => i !== index));
  };

  const handleUserSentenceClick = (word: string, index: number) => {
    if (feedback) return;
    setWordBank(prev => [...prev, word]);
    setUserSentence(prev => prev.filter((_, i) => i !== index));
  };

  const checkAnswer = () => {
    if (feedback) return;
    const userAnswerStr = userSentence.join(' ');
    if (userAnswerStr === questions[currentIndex].correctSentence) {
      setFeedback('correct');
      setScore(s => s + 1);
    } else {
      setFeedback('incorrect');
    }
  };
  
  const handleNext = () => {
      if(currentIndex < questions.length - 1) {
          setCurrentIndex(i => i + 1);
          setFeedback(null);
      } else {
          setIsFinished(true);
      }
  };

  const handleRestart = () => {
      setGameId(id => id + 1);
      setCurrentIndex(0);
      setUserSentence([]);
      setFeedback(null);
      setScore(0);
      setIsFinished(false);
  };
  
  if (availableSentences.length === 0) {
    return (
      <div className="text-center mt-12 bg-white p-8 rounded-xl shadow-lg max-w-md mx-auto">
        <h2 className="text-2xl font-bold mb-4">Exercice indisponible</h2>
        <p className="text-slate-600">
          Désolé, il n'y a pas encore assez d'exemples de phrases pour les séries de verbes que tu as sélectionnées.
        </p>
      </div>
    );
  }

  if (isLoading || questions.length === 0) {
      return <div className="text-center mt-12"><p>Création de l'exercice...</p></div>
  }
  
  if (isFinished) {
    return (
      <div className="text-center mt-12 bg-white p-8 rounded-xl shadow-lg max-w-md mx-auto">
        <h2 className="text-3xl font-bold mb-4">Exercice Terminé !</h2>
        <p className="text-xl text-slate-700 mb-6">
          Ton score : <span className="font-extrabold text-orange-600">{score}</span> sur <span className="font-extrabold text-orange-600">{questions.length}</span>.
        </p>
        <button onClick={handleRestart} className="bg-orange-600 text-white font-bold py-3 px-8 rounded-full hover:bg-orange-700">
            Recommencer
        </button>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];

  return (
    <div className="max-w-2xl mx-auto mt-8">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2 text-slate-600 font-semibold">
          <span>Question</span>
          <span className="font-bold text-base">{\`\${currentIndex + 1} / \${questions.length}\`}</span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-2.5">
          <div 
            className="bg-orange-500 h-2.5 rounded-full transition-all duration-300" 
            style={{ width: \`\${((currentIndex + 1) / questions.length) * 100}%\` }}
          ></div>
        </div>
        <p className="text-md text-slate-500 text-right mt-2">Score: {score}</p>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <p className="text-center text-slate-600 mb-2">Reconstitue la phrase.</p>
        <p className="text-center text-lg font-semibold text-orange-600 mb-6">Indice : {currentQuestion.hint}</p>

        <div className={\`min-h-[6rem] w-full p-3 mb-4 rounded-lg flex flex-wrap gap-2 items-center justify-center \${
            feedback === 'correct' ? 'bg-green-100 border-2 border-green-300' :
            feedback === 'incorrect' ? 'bg-red-100 border-2 border-red-300' : 'bg-slate-100'
        }\`}>
            {userSentence.map((word, index) => (
                <button key={index} onClick={() => handleUserSentenceClick(word, index)} className="bg-white text-slate-800 font-semibold py-2 px-4 rounded-lg shadow-sm border border-slate-300">
                    {word}
                </button>
            ))}
        </div>

        <div className="min-h-[6rem] w-full p-3 mb-6 rounded-lg flex flex-wrap gap-2 items-center justify-center border-t-2 pt-4">
             {wordBank.map((word, index) => (
                <button key={index} onClick={() => handleWordBankClick(word, index)} className="bg-orange-100 text-orange-800 font-semibold py-2 px-4 rounded-lg hover:bg-orange-200">
                    {word}
                </button>
            ))}
        </div>

        {feedback ? (
            <div className="text-center">
                {feedback === 'incorrect' && (
                    <p className="text-red-600 font-semibold mb-2">La bonne réponse était : "{currentQuestion.correctSentence}"</p>
                )}
                 <button onClick={handleNext} className="w-full bg-slate-800 text-white font-bold py-3 px-6 rounded-lg hover:bg-slate-900 transition-colors">
                    {currentIndex < questions.length - 1 ? 'Question Suivante' : 'Terminer'}
                 </button>
            </div>
        ) : (
            <button onClick={checkAnswer} disabled={wordBank.length > 0} className="w-full bg-orange-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-orange-700 transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed">
                Vérifier
            </button>
        )}
      </div>
    </div>
  );
};

export default WordOrder;`,
  'components/Evaluation.tsx': `import React, { useState, useEffect, useCallback } from 'react';
import { srsManager } from '../utils/srs';
import type { Verb } from '../types';
import Quiz from './Quiz';

interface EvaluationProps {
  verbs: Verb[];
}

const Evaluation: React.FC<EvaluationProps> = ({ verbs }) => {
  const [verbsToReview, setVerbsToReview] = useState<Verb[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [quizSize, setQuizSize] = useState<number | null>(null);

  const loadVerbsForReview = useCallback(() => {
    setIsLoading(true);
    // Use the passed verbs from selected series
    const verbsForReview = srsManager.getVerbsForReview(verbs);
    setVerbsToReview(verbsForReview);
    setIsLoading(false);
  }, [verbs]);

  useEffect(() => {
    loadVerbsForReview();
  }, [loadVerbsForReview]);
  
  const handleQuizComplete = () => {
    // Go back to selection screen and refresh the list of verbs
    setQuizSize(null);
    loadVerbsForReview();
  };
  
  const startQuizWithSize = (size: number) => {
    setQuizSize(size);
  }

  if (isLoading) {
    return (
      <div className="text-center mt-12">
        <p className="text-slate-600">Chargement de ta session d'évaluation...</p>
      </div>
    );
  }

  if (verbsToReview.length === 0) {
    return (
      <div className="text-center mt-12 bg-white p-8 rounded-xl shadow-lg max-w-md mx-auto">
        <h2 className="text-3xl font-bold text-green-600 mb-4">🎉 Bravo !</h2>
        <p className="text-slate-700 mb-6">
          Tu n'as aucune révision en attente pour les séries sélectionnées.
          Choisis d'autres séries ou continue à pratiquer !
        </p>
        <button
            onClick={loadVerbsForReview}
            className="bg-orange-600 text-white font-bold py-3 px-8 rounded-full hover:bg-orange-700 transition-colors duration-300 shadow-lg"
        >
          Rafraîchir
        </button>
      </div>
    );
  }

  if (!quizSize) {
    const totalVerbs = verbsToReview.length;
    const sizeOptions = [5, 10, 15, 20, 25, 30, 40, 50, 75, 95].filter(o => o < totalVerbs);
    
    return (
      <div className="text-center mt-12 bg-white p-8 rounded-xl shadow-lg max-w-lg mx-auto">
        <h2 className="text-3xl font-bold mb-4">Prêt pour ton évaluation ?</h2>
        <p className="text-slate-700 mb-8">
          Tu as <span className="font-bold text-orange-600">{totalVerbs}</span> verbe{totalVerbs > 1 ? 's' : ''} à réviser dans cette sélection.
          <br/>
          Combien veux-tu en pratiquer maintenant ?
        </p>
        <div className="flex flex-wrap justify-center gap-3">
            {sizeOptions.map(size => (
                <button
                    key={size}
                    onClick={() => startQuizWithSize(size)}
                    className="bg-white border-2 border-orange-500 text-orange-600 font-bold py-2 px-6 rounded-full hover:bg-orange-100 transition-colors"
                >
                    {size}
                </button>
            ))}
            <button
                onClick={() => startQuizWithSize(totalVerbs)}
                className="bg-orange-600 text-white font-bold py-2 px-6 rounded-full hover:bg-orange-700 transition-colors"
            >
                Tous ({totalVerbs})
            </button>
        </div>
      </div>
    )
  }

  const verbsForQuiz = verbsToReview.slice(0, quizSize);

  return (
    <div>
      <h2 className="text-3xl font-bold text-center mb-4">Évaluation</h2>
      <p className="text-center text-slate-600 mb-8 max-w-xl mx-auto">
        Évalue ta maîtrise des verbes à réviser pour les séries sélectionnées.
      </p>
      <Quiz 
        key={quizSize}
        verbs={verbsForQuiz} 
        onQuizComplete={handleQuizComplete} 
      />
    </div>
  );
};

export default Evaluation;`,
  'components/SeriesSelector.tsx': `import React, { useState } from 'react';
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
              className={\`p-6 rounded-xl shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-orange-500 \${
                isSelected
                  ? 'bg-orange-100 border-2 border-orange-500'
                  : 'bg-white border border-slate-200'
              }\`}
              aria-pressed={isSelected}
              aria-label={\`Sélectionner la Série \${index + 1}\`}
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

export default SeriesSelector;`,
  'components/TrophiesPage.tsx': `import React from 'react';
import { gamificationManager } from '../utils/gamification';
import { allTrophies } from '../data/trophies';
import type { Trophy } from '../types';

const TrophyCard: React.FC<{ trophy: Trophy; isUnlocked: boolean }> = ({ trophy, isUnlocked }) => (
  <div className={\`p-6 rounded-xl text-center transition-all duration-300 \${isUnlocked ? 'bg-white shadow-lg border-2 border-amber-300' : 'bg-slate-100 border border-slate-200'}\`}>
    <div className={\`text-5xl mb-4 transition-transform duration-300 \${isUnlocked ? 'scale-110' : 'grayscale'}\`}>{trophy.icon}</div>
    <h3 className={\`font-bold text-lg \${isUnlocked ? 'text-amber-700' : 'text-slate-600'}\`}>{trophy.name}</h3>
    <p className={\`text-sm mt-1 \${isUnlocked ? 'text-slate-600' : 'text-slate-500'}\`}>{trophy.description}</p>
  </div>
);

const TrophiesPage: React.FC = () => {
  const unlockedTrophyIds = gamificationManager.getUnlockedTrophies();

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-10">
        <h2 className="text-4xl font-extrabold text-slate-800">🏆 Trophées</h2>
        <p className="mt-2 text-lg text-slate-600">Débloquez des succès en pratiquant et en apprenant.</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
        {allTrophies.map(trophy => (
          <TrophyCard key={trophy.id} trophy={trophy} isUnlocked={unlockedTrophyIds.has(trophy.id)} />
        ))}
      </div>
    </div>
  );
};

export default TrophiesPage;`,
  'components/TrophyNotification.tsx': `import React, { useState, useEffect } from 'react';
import type { Trophy } from '../types';

const TrophyNotification: React.FC<{ trophy: Trophy, onDismiss: () => void }> = ({ trophy, onDismiss }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onDismiss, 300); // Wait for fade out animation
    }, 4000);
    return () => clearTimeout(timer);
  }, [trophy, onDismiss]);

  return (
    <div 
      className={\`fixed bottom-5 right-5 z-50 flex items-center gap-4 p-4 rounded-xl shadow-2xl bg-gradient-to-r from-slate-800 to-slate-900 text-white border-2 border-amber-400 transition-all duration-300 transform \${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}\`}
    >
      <div className="text-4xl">{trophy.icon}</div>
      <div>
        <h3 className="font-bold">Trophée débloqué !</h3>
        <p className="text-slate-200">{trophy.name}</p>
      </div>
    </div>
  );
};

export default TrophyNotification;`,
  'components/SearchBar.tsx': `
import React from 'react';

interface SearchBarProps {
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ value, onChange }) => {
  return (
    <div className="relative max-w-lg mx-auto">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <svg
          className="h-5 w-5 text-slate-400"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
            clipRule="evenodd"
          />
        </svg>
      </div>
      <input
        type="text"
        placeholder="Rechercher un verbe (français ou néerlandais)..."
        value={value}
        onChange={onChange}
        className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-full text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition duration-150 ease-in-out"
      />
    </div>
  );
};

export default SearchBar;`,
  'components/SearchResultItem.tsx': `import React, { useState, useEffect } from 'react';
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
        return <div key={i} className={\`w-2 h-4 rounded-sm \${colorClass}\`}></div>;
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

export default SearchResultItem;`,
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
    'data/verbs.ts', 'data/sentences.ts', 'data/trophies.ts',
    'utils/gamification.ts', 'utils/srs.ts', 'utils/leaderboard.ts',
    'components/Header.tsx', 'components/Footer.tsx', 'components/SeriesSelector.tsx', 
    'components/FlipCardView.tsx', 'components/Quiz.tsx', 'components/MatchingGame.tsx', 
    'components/Hangman.tsx', 'components/WordOrder.tsx', 'components/Evaluation.tsx', 'components/TrophiesPage.tsx',
    'components/SearchBar.tsx', 'components/SearchResultItem.tsx',
    'components/TrophyNotification.tsx', 'components/LeaderboardPodium.tsx', 
    'components/ExampleSentenceGenerator.tsx', 'components/SourceCodeModal.tsx'
  ];

  const sortedFiles = fileOrder.filter(f => sourceCodeData[f] || f === 'components/SourceCodeModal.tsx');


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
                <pre className="p-4 text-sm"><code className="language-javascript">{sourceCodeData[activeFile] || (activeFile === 'components/SourceCodeModal.tsx' ? 'Displaying the source of this modal is handled by its definition.' : 'Fichier non trouvé.')}</code></pre>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default SourceCodeModal;