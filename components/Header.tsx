
import React from 'react';
import { LockClosedIcon } from './Icons';

const Header: React.FC = () => {
  return (
    <header className="bg-slate-800/80 backdrop-blur-sm shadow-md p-4 flex items-center justify-between border-b border-slate-700">
      <div className="flex items-center space-x-3">
        <LockClosedIcon className="w-6 h-6 text-cyan-400" />
        <h1 className="text-xl font-bold text-gray-100">Gemini Secure Messenger</h1>
      </div>
      <div className="flex items-center space-x-2">
        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
        <span className="text-sm text-green-400">Secure Connection</span>
      </div>
    </header>
  );
};

export default Header;
