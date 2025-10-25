import React from 'react';

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

export default Footer;
