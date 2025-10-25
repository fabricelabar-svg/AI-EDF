import React, { useState, useEffect, useMemo } from 'react';
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

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const shuffleArray = <T,>(array: T[]): T[] => [...array].sort(() => Math.random() - 0.5);

  const generatePrompt = (selectedVerbs: Verb[]) => {
    const verbListString = selectedVerbs.map(v => 
        `- ${v.nl.infinitive} (prétérit: ${v.nl.preterite}, participe passé: ${v.nl.participle})`
    ).join('\n');

    return `You are a Dutch language teacher creating a fill-in-the-blanks exercise.
From the following list of verbs, create ${EXERCISE_LENGTH} unique and simple Dutch sentences for a beginner.
Each sentence must use either the prétérit or the participe passé form of one of the verbs.
In each sentence, replace the verb form with a "___" placeholder.

Verb list:
${verbListString}

Provide the response in the requested JSON format. The sentences should be varied.`;
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
    const generateSentences = async () => {
        setIsLoading(true);
        setError(null);
        setSentences([]);

        const usableVerbs = verbs.filter(v => v.nl.preterite !== '-' && v.nl.participle !== '-');
        if (usableVerbs.length === 0) {
            setError("Aucun verbe compatible pour cet exercice dans les séries sélectionnées.");
            setIsLoading(false);
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

            setSentences(processedSentences);
        } catch (err) {
            console.error("Error generating sentences:", err);
            setError("Désolé, une erreur est survenue lors de la création de l'exercice. Veuillez changer de série ou réessayer.");
        } finally {
            setIsLoading(false);
        }
    };

    generateSentences();
  }, [verbs]);

  const handleRestart = () => {
    setIsFinished(false);
    setScore(0);
    setCurrentIndex(0);
    setUserAnswer('');
    setFeedback(null);
    setSentences([]); 
    setIsLoading(true);
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
          <span className="font-bold text-base">{`${currentIndex + 1} / ${sentences.length}`}</span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-2.5">
          <div 
            className="bg-orange-500 h-2.5 rounded-full transition-all duration-300 ease-in-out" 
            style={{ width: `${((currentIndex + 1) / sentences.length) * 100}%` }}
          ></div>
        </div>
        <p className="text-md text-slate-500 text-right mt-2">Score: {score}</p>
      </div>

      <div className={`bg-white rounded-xl shadow-lg p-6 sm:p-8 transition-all duration-300 border-2 ${
        feedback === 'correct' ? 'border-green-500' : feedback === 'incorrect' ? 'border-red-500' : 'border-transparent'
      }`}>
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
            className={`inline-block w-40 text-center mx-2 px-2 py-1 border-b-2 bg-transparent focus:outline-none transition ${
                !feedback ? 'border-slate-400 focus:border-orange-500'
                : feedback === 'correct' ? 'border-green-500 text-green-600'
                : 'border-red-500 text-red-600'
            }`}
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

export default FillTheBlanks;