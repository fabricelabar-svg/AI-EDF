import React, { useState, useEffect, useRef } from 'react';
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
          if (verb.nl.participle !== '-') questionTypes.push({ prompt: `Quel est le participe passé de '${verb.nl.infinitive}' ?`, answer: verb.nl.participle });
          if (verb.nl.preterite !== '-') questionTypes.push({ prompt: `Quel est le prétérit de '${verb.nl.infinitive}' ?`, answer: verb.nl.preterite });
          if (verb.fr !== '-') questionTypes.push({ prompt: `Que signifie '${verb.nl.infinitive}' en français ?`, answer: verb.fr });
      }
      if (verb.nl.participle !== '-' && verb.nl.infinitive !== '-') {
        questionTypes.push({ prompt: `Quel est l'infinitif de '${verb.nl.participle}' ?`, answer: verb.nl.infinitive });
      }
      if (verb.fr !== '-' && verb.nl.infinitive !== '-') {
        questionTypes.push({ prompt: `Comment dit-on '${verb.fr}' en néerlandais (infinitif) ?`, answer: verb.nl.infinitive });
      }
      
      const chosenType = questionTypes[Math.floor(Math.random() * questionTypes.length)] || { prompt: `Comment dit-on '${verb.fr}' en néerlandais (infinitif) ?`, answer: verb.nl.infinitive };
      
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
          <span className="font-bold text-base">{`${currentQuestionIndex + 1} / ${quizLength}`}</span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-2.5">
          <div 
            className="bg-orange-500 h-2.5 rounded-full transition-all duration-300 ease-in-out" 
            style={{ width: `${(currentQuestionIndex / quizLength) * 100}%` }}
          ></div>
        </div>
        <p className="text-md text-slate-500 text-right mt-2">Score: {score}</p>
      </div>
      
      {level && level > 1 && timeLeft !== null && (
         <div className="w-full bg-slate-200 rounded-full h-2.5 mb-4 dark:bg-slate-700">
            <div className="bg-orange-500 h-2.5 rounded-full" style={{ width: `${(timeLeft / timeLimit) * 100}%`, transition: 'width 1s linear' }}></div>
        </div>
      )}

      <div className={`bg-white rounded-xl shadow-lg p-6 sm:p-8 transition-all duration-300 border-2 ${
        feedback ? (feedback.isCorrect ? 'border-green-500' : 'border-red-500') : 'border-transparent'
      }`}>
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
            className={`w-full text-center py-3 px-4 border rounded-lg focus:outline-none focus:ring-2 text-lg transition ${
              !feedback 
                ? 'border-slate-300 focus:ring-orange-500' 
                : feedback.isCorrect 
                ? 'border-green-500 bg-green-50 focus:ring-green-500' 
                : 'border-red-500 bg-red-50 focus:ring-red-500'
            }`}
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

export default Quiz;