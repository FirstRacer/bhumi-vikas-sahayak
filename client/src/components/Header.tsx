import React from 'react';
import { Building2, LogOut, Globe } from 'lucide-react';

interface HeaderProps {
  language: 'en' | 'hi';
  onToggleLanguage: () => void;
  currentUser?: { id: string; name: string; email: string } | null;
  onLogout?: () => void;
  onGoHome?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  language,
  onToggleLanguage,
  currentUser,
  onLogout,
  onGoHome
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-50">
      {/* Subtle top tricolor accent line */}
      <div className="h-0.5 bg-gradient-to-r from-amber-500 via-white to-emerald-600" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name */}
          <button
            onClick={onGoHome}
            className="flex items-center space-x-3 text-left cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center flex-shrink-0 group-hover:border-amber-500 transition">
              <Building2 className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-base sm:text-lg font-bold tracking-tight text-white group-hover:text-amber-400 transition font-serif">
                  {language === 'hi' ? 'भूमि विकास सहायक' : 'Bhumi Vikas Sahayak'}
                </span>
                <span className="hidden sm:inline-block text-[10px] bg-slate-800 text-slate-300 border border-slate-700 px-1.5 py-0.5 rounded">
                  MP Rules 2012 / 2025
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                {language === 'hi'
                  ? 'मध्य प्रदेश शासन — भवन निर्माण एवं विकास नियम मार्गदर्शन'
                  : 'Govt. of Madhya Pradesh — Building Rules Assistance'}
              </p>
            </div>
          </button>

          {/* Right Utilities: Language & Profile/Logout */}
          <div className="flex items-center space-x-3">
            {/* Language Selector */}
            <button
              onClick={onToggleLanguage}
              className="flex items-center space-x-1.5 px-2.5 py-1 text-xs font-medium rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition cursor-pointer"
              title="Toggle Hindi / English"
            >
              <Globe className="w-3.5 h-3.5 text-amber-400" />
              <span>{language === 'hi' ? 'English' : 'हिंदी'}</span>
            </button>

            {/* Profile & Logout (When logged in) */}
            {currentUser && onLogout && (
              <div className="flex items-center space-x-2.5 pl-3 border-l border-slate-800">
                <div className="hidden sm:flex flex-col text-right">
                  <span className="text-xs font-semibold text-slate-200 truncate max-w-[140px]">
                    {currentUser.name}
                  </span>
                  <span className="text-[10px] text-slate-400 truncate max-w-[140px]">
                    {currentUser.email}
                  </span>
                </div>
                <button
                  onClick={onLogout}
                  className="flex items-center space-x-1.5 px-2.5 py-1 bg-slate-800 hover:bg-red-950/70 text-slate-300 hover:text-red-200 border border-slate-700 hover:border-red-800 rounded text-xs font-medium transition cursor-pointer"
                  title="Sign Out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{language === 'hi' ? 'लॉगआउट' : 'Logout'}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
