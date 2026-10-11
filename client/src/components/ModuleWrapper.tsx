import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface ModuleWrapperProps {
  language: 'en' | 'hi';
  moduleTitleEn: string;
  moduleTitleHi: string;
  onBackToDashboard: () => void;
  children: React.ReactNode;
}

export const ModuleWrapper: React.FC<ModuleWrapperProps> = ({
  language,
  moduleTitleEn,
  moduleTitleHi,
  onBackToDashboard,
  children
}) => {
  return (
    <div className="space-y-3">
      {/* Compact Single "Back to Dashboard" Bar */}
      <div className="bg-white border border-slate-200 rounded-lg px-3 py-2 flex items-center justify-between shadow-2xs">
        <button
          onClick={onBackToDashboard}
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-800 hover:text-amber-800 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded transition cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{language === 'hi' ? 'डैशबोर्ड पर वापस जाएं' : 'Back to Dashboard'}</span>
        </button>

        <span className="text-xs font-bold text-slate-800">
          {language === 'hi' ? moduleTitleHi : moduleTitleEn}
        </span>
      </div>

      {/* Main Single Active Module View */}
      <div className="w-full">
        {children}
      </div>
    </div>
  );
};
