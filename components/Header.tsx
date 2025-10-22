import React from 'react';

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

export default Header;
