import React, { useState, useEffect, useCallback } from 'react';
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

export default Evaluation;
