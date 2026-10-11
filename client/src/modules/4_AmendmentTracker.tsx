import React, { useEffect, useState } from 'react';
import { FileSpreadsheet, Calendar, FileText, CheckCircle2, Search } from 'lucide-react';
import { authenticatedFetch } from '../utils/auth';

interface AmendmentTrackerProps {
  language: 'en' | 'hi';
}

interface Amendment {
  ruleNumber: string;
  topic: string;
  notificationNo: string;
  gazetteDate: string;
  pageRef: string;
  summary: string;
  oldProvision: string;
  newProvision: string;
  status: 'verified';
}

export const AmendmentTrackerModule: React.FC<AmendmentTrackerProps> = ({ language }) => {
  const [amendments, setAmendments] = useState<Amendment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    authenticatedFetch('/api/amendments')
      .then(res => res.json())
      .then(data => {
        setAmendments(data);
      })
      .catch(err => {
        console.error(err);
      });
  }, []);

  const filtered = amendments.filter(
    a =>
      a.ruleNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.summary.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-5">
      {/* Official Government Module Header */}
      <div className="bg-white rounded border border-slate-300 shadow-xs overflow-hidden">
        <div className="bg-slate-800 text-white px-5 py-3.5 border-b border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold flex items-center space-x-2">
              <FileSpreadsheet className="w-4 h-4 text-amber-400" />
              <span>{language === 'hi' ? 'नियम संशोधन' : 'Rule Amendments'}</span>
            </h2>
            <p className="text-[11px] text-slate-300 mt-0.5">
              {language === 'hi'
                ? 'मध्य प्रदेश राजपत्र असाधारण अधिसूचनाओं द्वारा किए गए अद्यतन (मार्च 2025 तक)'
                : 'Official MP Gazette notifications tracking legislative amendments up to 6th March 2025'}
            </p>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder={language === 'hi' ? 'संशोधन खोजें...' : 'Filter amendments...'}
              className="bg-slate-700 text-white placeholder-slate-400 border border-slate-600 rounded pl-8 pr-2.5 py-1 text-xs focus:outline-hidden focus:border-slate-400 w-56"
            />
          </div>
        </div>

        {/* Administrative Overview */}
        <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs bg-slate-50 border-b border-slate-200">
          <div className="bg-white border border-slate-200 p-2.5 rounded">
            <span className="text-slate-500 block text-[11px]">मूल विधिक अधिनियम (Baseline):</span>
            <span className="font-semibold text-slate-900">MP Bhumi Vikas Rules, 2012</span>
            <span className="text-[10px] text-slate-500 block">Gazette 30 May 2012</span>
          </div>
          <div className="bg-white border border-slate-200 p-2.5 rounded">
            <span className="text-slate-500 block text-[11px]">अद्यतन राजपत्र अधिसूचना (Latest):</span>
            <span className="font-semibold text-slate-900">Notification No. 74 / UDH</span>
            <span className="text-[10px] text-slate-500 block">Dated 06 March 2025</span>
          </div>
          <div className="bg-white border border-slate-200 p-2.5 rounded">
            <span className="text-slate-500 block text-[11px]">वैधानिक पुष्टि (Status):</span>
            <span className="font-semibold text-slate-800 flex items-center space-x-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              <span>Official Gazette Corroborated</span>
            </span>
            <span className="text-[10px] text-slate-500 block">Statutory Text Only</span>
          </div>
        </div>
      </div>

      {/* Amendments List */}
      <div className="space-y-3.5">
        {filtered.map((item, index) => (
          <div key={index} className="bg-white rounded border border-slate-300 p-4 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2.5 border-b border-slate-200 gap-2">
              <div className="flex items-center space-x-2.5">
                <span className="bg-slate-100 text-slate-800 border border-slate-300 text-xs font-bold px-2 py-0.5 rounded font-mono">
                  {item.ruleNumber}
                </span>
                <h3 className="text-xs sm:text-sm font-bold text-slate-900">{item.topic}</h3>
              </div>
              <div className="flex items-center space-x-1.5 text-xs text-slate-500">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-mono text-[11px]">{item.gazetteDate}</span>
              </div>
            </div>

            <div className="mt-2.5 text-xs text-slate-700 leading-relaxed">
              <p className="font-medium text-slate-800">{item.summary}</p>
            </div>

            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded">
                <span className="font-bold text-slate-700 block mb-1">पूर्व प्रावधान (2012 Baseline Provision):</span>
                <p className="text-slate-600">{item.oldProvision}</p>
              </div>

              <div className="p-3 bg-emerald-50/50 border border-emerald-200 rounded">
                <span className="font-bold text-emerald-900 block mb-1">संशोधित वैधानिक प्रावधान (2025 Gazette Position):</span>
                <p className="text-slate-800">{item.newProvision}</p>
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <div className="flex items-center space-x-1.5">
                <FileText className="w-3 h-3 text-slate-400" />
                <span>अधिसूचना संदर्भ: <strong className="text-slate-700">{item.notificationNo}</strong></span>
              </div>
              <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-600 border border-slate-200">
                {item.pageRef}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
