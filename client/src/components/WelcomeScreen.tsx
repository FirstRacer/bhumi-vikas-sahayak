import React from 'react';
import { Building2, ArrowRight, ShieldCheck, BookOpen, Layers } from 'lucide-react';

interface WelcomeScreenProps {
  language: 'en' | 'hi';
  userName?: string;
  onGetStarted: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  language,
  userName,
  onGetStarted
}) => {
  return (
    <div className="max-w-3xl mx-auto my-8 sm:my-14 p-6 sm:p-10 bg-white border border-slate-200 rounded-2xl shadow-sm">
      <div className="text-center max-w-xl mx-auto space-y-6">
        {/* Emblem / Portal Logo */}
        <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto shadow-md">
          <Building2 className="w-8 h-8 text-amber-500" />
        </div>

        {/* Welcome Headline */}
        <div>
          <span className="inline-block text-xs font-semibold bg-amber-50 text-amber-900 border border-amber-200 px-3 py-1 rounded-full mb-3">
            {language === 'hi' ? 'मध्य प्रदेश शासन • विनियामक सहायता पोर्टल' : 'Govt. of Madhya Pradesh • Regulatory Portal'}
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {language === 'hi'
              ? `नमस्ते${userName ? `, ${userName}` : ''}! भूमि विकास सहायक में आपका स्वागत है`
              : `Welcome to Bhumi Vikas Sahayak${userName ? `, ${userName}` : ''}`}
          </h1>
          <p className="mt-3 text-sm text-slate-600 leading-relaxed">
            {language === 'hi'
              ? 'मध्य प्रदेश भूमि विकास नियम, 2012 (06 मार्च 2025 तक अद्यतन) के अंतर्गत भवन अनुज्ञा, FAR, अधिकतम ऊंचाई, पार्किंग एवं सेटबैक नियमों की पारदर्शी एवं सटीक तकनीकी सहायता प्रणाली।'
              : 'Your verified municipal intelligence portal for Madhya Pradesh Bhumi Vikas Rules, 2012 (amended up to 06 March 2025). Instant rule citations, building limit computations, and plan compliance verification.'}
          </p>
        </div>

        {/* Feature Highlights (Simple, Non-duplicated) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left pt-2">
          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
            <BookOpen className="w-4 h-4 text-slate-700 mb-1.5" />
            <h2 className="text-xs font-bold text-slate-900">
              {language === 'hi' ? 'आधिकारिक राजपत्र नियम' : 'Gazetted Rules'}
            </h2>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {language === 'hi' ? 'सटीक नियम एवं पृष्ठ संख्या' : 'Exact rule and page citations'}
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
            <ShieldCheck className="w-4 h-4 text-slate-700 mb-1.5" />
            <h2 className="text-xs font-bold text-slate-900">
              {language === 'hi' ? 'सत्यापित सीमा गणना' : 'Verified Limits'}
            </h2>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {language === 'hi' ? 'तालिका 4 व 8 के आधार पर' : 'Table 4 & 8 calculations'}
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
            <Layers className="w-4 h-4 text-slate-700 mb-1.5" />
            <h2 className="text-xs font-bold text-slate-900">
              {language === 'hi' ? '7 एकीकृत मॉड्यूल' : '7 Core Modules'}
            </h2>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {language === 'hi' ? 'एकल स्वच्छ डैशबोर्ड में' : 'Accessible in one unified view'}
            </p>
          </div>
        </div>

        {/* Clear Get Started Action */}
        <div className="pt-4">
          <button
            onClick={onGetStarted}
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-8 py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-xl shadow-md transition transform active:scale-98 cursor-pointer"
          >
            <span>{language === 'hi' ? 'शुरू करें (Get Started)' : 'Get Started'}</span>
            <ArrowRight className="w-4 h-4 text-amber-400" />
          </button>
        </div>
      </div>
    </div>
  );
};
