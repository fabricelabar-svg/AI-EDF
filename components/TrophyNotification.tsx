import React, { useState, useEffect } from 'react';
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
      className={`fixed bottom-5 right-5 z-50 flex items-center gap-4 p-4 rounded-xl shadow-2xl bg-gradient-to-r from-slate-800 to-slate-900 text-white border-2 border-amber-400 transition-all duration-300 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
    >
      <div className="text-4xl">{trophy.icon}</div>
      <div>
        <h3 className="font-bold">Trophée débloqué !</h3>
        <p className="text-slate-200">{trophy.name}</p>
      </div>
    </div>
  );
};

export default TrophyNotification;
