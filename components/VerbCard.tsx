
import React from 'react';
import type { Verb } from '../types';

interface VerbCardProps {
  verb: Verb;
}

const VerbInfoRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
    <div className="flex justify-between items-baseline text-sm">
        <span className="text-slate-500">{label}</span>
        <span className="font-semibold text-right">{value}</span>
    </div>
);


const VerbCard: React.FC<VerbCardProps> = ({ verb }) => {
  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 p-5 flex flex-col border border-slate-200/80">
      <h3 className="text-xl font-bold text-orange-700 capitalize mb-4 pb-3 border-b border-slate-200">
        {verb.fr}
      </h3>
      <div className="space-y-3 flex-grow">
        <VerbInfoRow label="Infinitif" value={verb.nl.infinitive} />
        <VerbInfoRow label="Prétérit" value={verb.nl.preterite} />
        <VerbInfoRow label="Participe Passé" value={verb.nl.participle} />
      </div>
    </div>
  );
};

export default VerbCard;