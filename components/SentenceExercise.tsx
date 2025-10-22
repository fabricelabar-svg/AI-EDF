import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import type { Verb, GeminiFeedback } from '../types';

// Helper to pick a random item from an array
const getRandomItem = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

// Helper for text-to-speech
const speak = (text: string, lang: string = 'nl-NL') => {
  if ('speechSynthesis' in window) {
    // Cancel any previous speech
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  }
};

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


type Level = 1 | 2 | 3;

const SentenceExercise: React.FC<{ verbs: Verb[] }> = ({ verbs }) => {
  const [exerciseState, setExerciseState] = useState<'idle' | 'active'>('idle');
  const [level, setLevel] = useState<Level | null>(null);
  const [currentVerb, setCurrentVerb] = useState<Verb | null>(null);
  const [userSentence, setUserSentence] = useState('');
  const [feedback, setFeedback] = useState<GeminiFeedback | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const timerRef = useRef<number | null>(null);
  const [questionCount, setQuestionCount] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const handleTimeUp = () => {
    setFeedback({ isCorrect: false, feedback: 'Temps écoulé !' });
  };

  const loadNextVerb = () => {
    const usableVerbs = verbs.filter(v => v.nl.preterite !== '-' && v.nl.participle !== '-');
    setCurrentVerb(getRandomItem(usableVerbs));
    setUserSentence('');
    setFeedback(null);
    setError(null);
  };
  
  const startExercise = (selectedLevel: Level) => {
    setLevel(selectedLevel);
    setExerciseState('active');
    setQuestionCount(0);
    setIsPaused(false);
    loadNextVerb();
  };

  useEffect(() => {
    if (exerciseState === 'active' && level && level > 1 && !feedback && !error && !isPaused) {
      const timeLimit = level === 2 ? 30 : 20;
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
  }, [currentVerb, exerciseState, level, feedback, error, isPaused]);
  
  const handleProceed = () => {
    const nextCount = questionCount + 1;
    setQuestionCount(nextCount);
    if (nextCount > 0 && nextCount % 5 === 0) {
      setIsPaused(true);
    } else {
      loadNextVerb();
    }
  };

  const createGeminiPrompt = (verb: Verb, sentence: string): string => {
      return `You are a Dutch language teacher evaluating a student's sentence.
The student was asked to create a sentence in a past tense (prétérit or passé composé) using the Dutch verb "${verb.nl.infinitive}".
The past tense forms are:
- Prétérit: ${verb.nl.preterite}
- Participe Passé: ${verb.nl.participle}

The student's sentence is: "${sentence}"

Please evaluate the sentence based on these criteria:
1. Does it correctly use one of the past tense forms of "${verb.nl.infinitive}"?
2. Is the sentence grammatically correct in Dutch (word order, auxiliary verb if needed, etc.)?
3. The sentence must be more than a simple subject-verb pair. It must contain at least one complement (e.g., an object, an adverb, a prepositional phrase). A sentence like "Ik sliep" (I slept) is too simple and should be considered incorrect.

Based on your evaluation, provide a response in the requested JSON format.
If the sentence is correct according to all three criteria, set 'isCorrect' to true and provide a short, encouraging Dutch phrase like "Goed gedaan!" or "Proficiat!" in the 'feedback' field.
If the sentence is incorrect, set 'isCorrect' to false and provide a clear, concise explanation in French explaining which criterion was not met. For example, if it's too simple, say "La phrase est trop simple, essayez d'ajouter un complément.".`;
  };
  
  const schema = {
    type: Type.OBJECT,
    properties: {
        isCorrect: {
            type: Type.BOOLEAN,
            description: "Is the sentence grammatically correct and does it use the past tense of the verb correctly?",
        },
        feedback: {
            type: Type.STRING,
            description: "If correct, an encouraging Dutch phrase (e.g., \"Goed gedaan!\"). If incorrect, a helpful explanation of the error in French.",
        },
    },
    required: ["isCorrect", "feedback"],
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userSentence.trim() || !currentVerb || feedback) return;

    if (timerRef.current) clearInterval(timerRef.current);
    
    setIsLoading(true);
    setFeedback(null);
    setError(null);

    try {
      const prompt = createGeminiPrompt(currentVerb, userSentence);
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: schema,
        },
      });
      
      const resultText = response.text.trim();
      const resultJson: GeminiFeedback = JSON.parse(resultText);

      setFeedback(resultJson);

      if (resultJson.isCorrect) {
        speak(resultJson.feedback);
        if (level === 3) {
            playVictorySound();
        }
      }
    } catch (err) {
      console.error("Error calling Gemini API:", err);
      setError("Désolé, une erreur s'est produite lors de l'évaluation de ta phrase. Veuillez réessayer.");
    } finally {
      setIsLoading(false);
    }
  };

  if (exerciseState === 'idle') {
    return (
      <div className="text-center mt-12">
        <h2 className="text-2xl font-bold mb-4">Prêt à construire des phrases ?</h2>
        <p className="text-slate-600 mb-8">Choisis ton niveau de difficulté.</p>
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
             <button onClick={() => startExercise(1)} className="bg-orange-600 text-white font-bold py-3 px-8 rounded-full hover:bg-orange-700 transition-colors duration-300 shadow-lg w-60">Niveau 1 😊</button>
             <button onClick={() => startExercise(2)} className="bg-orange-600 text-white font-bold py-3 px-8 rounded-full hover:bg-orange-700 transition-colors duration-300 shadow-lg w-60">Niveau 2 🏃‍♂️</button>
             <button onClick={() => startExercise(3)} className="bg-orange-600 text-white font-bold py-3 px-8 rounded-full hover:bg-orange-700 transition-colors duration-300 shadow-lg w-60">Niveau 3 🔥</button>
        </div>
      </div>
    );
  }
  
  if (isPaused) {
    return (
        <div className="text-center mt-12 bg-white p-8 rounded-xl shadow-lg max-w-md mx-auto">
            <h2 className="text-2xl font-bold mb-4">Super travail !</h2>
            <p className="text-slate-600 mb-8">Tu as répondu à {questionCount} questions. Veux-tu faire une petite pause ?</p>
            <div className="flex justify-center gap-4">
                <button 
                    onClick={() => setExerciseState('idle')}
                    className="bg-slate-700 text-white font-bold py-3 px-8 rounded-full hover:bg-slate-800 transition-colors duration-300 shadow-lg"
                >
                    Arrêter
                </button>
                <button 
                    onClick={() => { setIsPaused(false); loadNextVerb(); }}
                    className="bg-orange-600 text-white font-bold py-3 px-8 rounded-full hover:bg-orange-700 transition-colors duration-300 shadow-lg"
                >
                    Continuer
                </button>
            </div>
        </div>
    );
  }


  if (!currentVerb) {
    return <div>Chargement de l'exercice...</div>;
  }
  
  const timeLimit = level === 2 ? 30 : 20;

  return (
    <div className="max-w-2xl mx-auto mt-8">
      <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 border-2 border-slate-200">
        
        {level && level > 1 && timeLeft !== null && (
         <div className="w-full bg-slate-200 rounded-full h-2.5 mb-6">
            <div className="bg-orange-500 h-2.5 rounded-full" style={{ width: `${(timeLeft / timeLimit) * 100}%`, transition: 'width 1s linear' }}></div>
        </div>
        )}

        <h2 className="text-2xl font-bold text-center mb-2">Création de Phrases</h2>
        <p className="text-center text-slate-600 mb-6">
          Crée une phrase au passé (prétérit ou passé composé) avec le verbe :
        </p>
        <div className="text-center mb-6">
          <p className="text-3xl font-extrabold text-orange-600">{currentVerb.nl.infinitive}</p>
        </div>

        <form onSubmit={handleSubmit}>
          <textarea
            value={userSentence}
            onChange={(e) => setUserSentence(e.target.value)}
            disabled={isLoading || !!feedback}
            placeholder="Écris ta phrase ici..."
            rows={3}
            className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 text-lg transition ${
              !feedback && !error
                ? 'border-slate-300 focus:ring-orange-500'
                : (feedback && feedback.isCorrect)
                ? 'border-green-500 bg-green-50 focus:ring-green-500'
                : 'border-red-500 bg-red-50 focus:ring-red-500'
            }`}
            aria-label="Ta phrase"
          />

          {!feedback && (
            <button
              type="submit"
              className="w-full mt-4 bg-orange-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-orange-700 transition-colors duration-300 disabled:bg-slate-400 disabled:cursor-not-allowed"
              disabled={isLoading || !userSentence.trim()}
            >
              {isLoading ? 'Évaluation en cours...' : 'Vérifier'}
            </button>
          )}
        </form>

        {feedback && (
          <div className={`mt-6 p-4 rounded-lg text-center ${feedback.isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`} aria-live="polite">
            <p className="font-bold text-xl">{feedback.isCorrect ? '🎉' : '🤔'}</p>
            <p className="mt-2 text-lg">{feedback.feedback}</p>
          </div>
        )}

        {error && (
            <div className="mt-6 p-4 rounded-lg text-center bg-red-100 text-red-800" aria-live="assertive">
                 <p>{error}</p>
            </div>
        )}

        {(feedback || error) && (
            <button
              onClick={handleProceed}
              className="w-full mt-4 bg-slate-800 text-white font-bold py-3 px-6 rounded-lg hover:bg-slate-900 transition-colors duration-300"
            >
              Verbe suivant
            </button>
        )}
      </div>
    </div>
  );
};

export default SentenceExercise;