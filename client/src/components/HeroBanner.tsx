import React, { useState } from 'react';
import {
  ArrowRight,
  ChevronRight
} from 'lucide-react';
import type { ModuleId } from './Sidebar';

interface HeroBannerProps {
  language: 'en' | 'hi';
  onSelectModule: (id: ModuleId) => void;
  onQuickQuery?: (query: string) => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  language,
  onSelectModule
}) => {
  // Quick parameter test form state
  const [roadWidth, setRoadWidth] = useState('18');
  const [plotArea, setPlotArea] = useState('1500');

  const handleQuickCalculation = (e: React.FormEvent) => {
    e.preventDefault();
    onSelectModule('calculator');
  };

  return (
    <div className="relative mb-6 rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 shadow-md">
      {/* Background with formal deep architectural gradient texture */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 opacity-95" />
      <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px] opacity-25" />

      {/* Main Content Area */}
      <div className="relative z-10 p-6 sm:p-8 lg:p-10">
        {/* Top Tagline Pill (Inspired by "От подбора земли..." pill in reference) */}
        <div className="inline-flex items-center space-x-2 bg-slate-800/90 border border-slate-700/80 px-3 py-1 rounded-full text-xs text-slate-300 mb-5 shadow-xs">
          <span className="w-2 h-2 rounded-full bg-amber-400" />
          <span className="font-medium">
            {language === 'hi'
              ? 'मध्य प्रदेश राजपत्र असाधारण (06 मार्च 2025 तक अद्यतन विहित नियम)'
              : 'Official Madhya Pradesh Gazette (Amended up to 06 March 2025)'}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Bold Headline & Integrated Inquiry Card */}
          <div className="lg:col-span-7 space-y-6">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight">
                {language === 'hi'
                  ? 'भवन निर्माण, FAR एवं विनियामक अनुपालन की आधिकारिक सहायता'
                  : 'Madhya Pradesh Building Rules & Statutory Compliance Portal'}
              </h1>
              <p className="mt-3 text-sm text-slate-300 leading-relaxed max-w-2xl">
                {language === 'hi'
                  ? 'मध्य प्रदेश भूमि विकास नियम, 2012 के तहत भूखंड क्षेत्रफल, सड़क चौड़ाई, अग्र खुला स्थान (सेटबैक), एवं अधिकतम ऊंचाई की सटीक गणना एवं दस्तावेजी साक्ष्य।'
                  : 'Verify Floor Area Ratio (FAR), permissible heights, setback open spaces, and parking norms grounded in MP Gazette statutory provisions.'}
              </p>
            </div>

            {/* Quick Interactive Parameter Bar (Directly inspired by the input card in the reference) */}
            <form
              onSubmit={handleQuickCalculation}
              className="bg-white/95 backdrop-blur-sm p-4 rounded-xl border border-slate-200/80 shadow-lg text-slate-900"
            >
              <div className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2.5 flex items-center justify-between">
                <span>{language === 'hi' ? 'त्वरित भवन सीमा जांच' : 'Quick Building Limit Estimator'}</span>
                <span className="text-[11px] font-normal text-slate-500">Rules 42 & 61 Verified</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    {language === 'hi' ? 'सड़क चौड़ाई' : 'Road Width'}
                  </label>
                  <select
                    value={roadWidth}
                    onChange={e => setRoadWidth(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900 focus:bg-white focus:border-slate-800"
                  >
                    <option value="12">12 Meters (1:1.50 FAR)</option>
                    <option value="18">18 Meters (1:1.75 FAR)</option>
                    <option value="24">24 Meters (1:2.00 FAR)</option>
                    <option value="30">30+ Meters (1:2.50 FAR)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    {language === 'hi' ? 'भूखंड क्षेत्रफल (m²)' : 'Plot Area (m²)'}
                  </label>
                  <input
                    type="number"
                    value={plotArea}
                    onChange={e => setPlotArea(e.target.value)}
                    placeholder="1500"
                    className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900 focus:bg-white focus:border-slate-800"
                  />
                </div>

                <div className="flex items-end">
                  <button
                    type="submit"
                    className="w-full py-1.5 px-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded transition flex items-center justify-center space-x-1.5 cursor-pointer shadow-xs"
                  >
                    <span>{language === 'hi' ? 'गणना देखें' : 'Calculate Limits'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Right Column: Featured Gazette Notification Card (Inspired by the featured image/article card in reference) */}
          <div className="lg:col-span-5">
            <div className="bg-slate-800/90 border border-slate-700 rounded-xl p-5 text-white shadow-xl">
              {/* Badge */}
              <div className="flex items-center justify-between mb-3">
                <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[11px] font-bold px-2.5 py-0.5 rounded">
                  {language === 'hi' ? 'अद्यतन राजपत्र अधिसूचना' : 'Latest Gazette Notification'}
                </span>
                <span className="text-slate-400 font-mono text-[11px]">06 March 2025</span>
              </div>

              <h2 className="text-base font-bold leading-snug text-white mb-2">
                {language === 'hi'
                  ? 'मध्य प्रदेश भूमि विकास (संशोधन) नियम, 2025'
                  : 'MP Bhumi Vikas (Amendment) Rules 2025'}
              </h2>

              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                {language === 'hi'
                  ? 'अधिसूचना क्रमांक 74 के तहत 12 मीटर, 18 मीटर एवं 24 मीटर सड़कों पर FAR तथा बहुमंजिला भवनों के लिए संशोधित सेटबैक प्रावधान लागू किए गए हैं।'
                  : 'Notification No. 74 introduced updated Floor Area Ratios for 12m, 18m, and 24m road widths with revised marginal open spaces for high-rise buildings.'}
              </p>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-700/80">
                <button
                  onClick={() => onSelectModule('amendments')}
                  className="inline-flex items-center space-x-1.5 text-xs font-semibold text-amber-400 hover:text-amber-300 transition cursor-pointer"
                >
                  <span>{language === 'hi' ? 'संशोधन तुलना देखें' : 'View Full Amendment'}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => onSelectModule('plan-checker')}
                  className="px-3 py-1 bg-white hover:bg-slate-100 text-slate-900 rounded text-xs font-bold transition cursor-pointer shadow-2xs"
                >
                  {language === 'hi' ? 'नक्शा जांचें' : 'Check Plan'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
