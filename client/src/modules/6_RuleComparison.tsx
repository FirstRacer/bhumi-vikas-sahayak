import React, { useEffect, useState } from 'react';
import { GitCompare, Filter } from 'lucide-react';
import { authenticatedFetch } from '../utils/auth';

interface RuleComparisonProps {
  language: 'en' | 'hi';
}

interface ComparisonItem {
  id: string;
  title: string;
  category: string;
  ruleReference: string;
  page: number;
  baseline2012: string;
  current2025: string;
  impact: string;
}

export const RuleComparisonModule: React.FC<RuleComparisonProps> = ({ language }) => {
  const [comparisons, setComparisons] = useState<ComparisonItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  useEffect(() => {
    authenticatedFetch('/api/comparisons')
      .then(res => res.json())
      .then(data => {
        setComparisons(data);
      })
      .catch(err => {
        console.error(err);
      });
  }, []);

  const categories = ['all', ...new Set(comparisons.map(c => c.category))];

  const filtered = activeCategory === 'all'
    ? comparisons
    : comparisons.filter(c => c.category === activeCategory);

  return (
    <div className="space-y-5">
      {/* Module Header Container */}
      <div className="bg-white rounded border border-slate-300 shadow-xs overflow-hidden">
        <div className="bg-slate-800 text-white px-5 py-3.5 border-b border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold flex items-center space-x-2">
              <GitCompare className="w-4 h-4 text-amber-400" />
              <span>{language === 'hi' ? 'नियम तुलना' : 'Rule Comparison'}</span>
            </h2>
            <p className="text-[11px] text-slate-300 mt-0.5">
              {language === 'hi'
                ? 'मूल नियम 2012 बनाम 2025 तक अद्यतन प्रावधानों (FAR, सीमांत दूरी, शुल्क) का तुलनात्मक विश्लेषण'
                : 'Side-by-side comparative analysis of baseline 2012 rules vs. verified 2025 updates'}
            </p>
          </div>

          <div className="flex items-center space-x-1.5 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-300" />
            <div className="flex flex-wrap gap-1">
              {categories.map((cat, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveCategory(cat)}
                  className={`text-[11px] px-2 py-0.5 rounded capitalize transition cursor-pointer ${
                    activeCategory === cat
                      ? 'bg-slate-700 text-white border border-slate-500 font-semibold'
                      : 'bg-slate-800/80 text-slate-300 border border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Comparison Grid */}
      <div className="grid grid-cols-1 gap-4">
        {filtered.map(item => (
          <div key={item.id} className="bg-white rounded border border-slate-300 shadow-2xs overflow-hidden">
            <div className="p-3 bg-slate-100 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-slate-900 bg-white border border-slate-300 px-2 py-0.5 rounded font-mono">
                  {item.ruleReference}
                </span>
                <h3 className="text-xs sm:text-sm font-bold text-slate-900">{item.title}</h3>
              </div>
              <div className="flex items-center space-x-2 text-xs">
                <span className="bg-slate-200 text-slate-700 px-2 py-0.5 rounded text-[11px]">
                  {item.category}
                </span>
                <span className="text-slate-500 font-mono text-[11px]">Page {item.page}</span>
              </div>
            </div>

            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              {/* Baseline 2012 */}
              <div className="bg-slate-50 p-3.5 rounded border border-slate-200">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    2012 Baseline Provision
                  </span>
                  <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded font-mono">
                    Prior Rule
                  </span>
                </div>
                <p className="text-slate-700 leading-relaxed">{item.baseline2012}</p>
              </div>

              {/* Current 2025 */}
              <div className="bg-emerald-50/40 p-3.5 rounded border border-emerald-200">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-900">
                    2025 Gazetted Rule
                  </span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-300 px-1.5 py-0.2 rounded font-mono font-bold">
                    Effective Now
                  </span>
                </div>
                <p className="text-slate-900 leading-relaxed font-medium">{item.current2025}</p>
              </div>
            </div>

            <div className="px-4 py-2 bg-slate-50 border-t border-slate-200 flex items-center space-x-2 text-xs text-slate-700">
              <span className="font-bold text-slate-900">प्रशासनिक प्रभाव (Impact):</span>
              <span>{item.impact}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
