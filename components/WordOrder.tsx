import React, { useState, useEffect, useMemo } from 'react';
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
          <span className="font-bold text-base">{`${currentIndex + 1} / ${questions.length}`}</span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-2.5">
          <div 
            className="bg-orange-500 h-2.5 rounded-full transition-all duration-300" 
            style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
          ></div>
        </div>
        <p className="text-md text-slate-500 text-right mt-2">Score: {score}</p>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <p className="text-center text-slate-600 mb-2">Reconstitue la phrase.</p>
        <p className="text-center text-lg font-semibold text-orange-600 mb-6">Indice : {currentQuestion.hint}</p>

        <div className={`min-h-[6rem] w-full p-3 mb-4 rounded-lg flex flex-wrap gap-2 items-center justify-center ${
            feedback === 'correct' ? 'bg-green-100 border-2 border-green-300' :
            feedback === 'incorrect' ? 'bg-red-100 border-2 border-red-300' : 'bg-slate-100'
        }`}>
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

export default WordOrder;
