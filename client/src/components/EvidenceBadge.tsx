import React from 'react';
import { BookOpen, FileText, AlertCircle } from 'lucide-react';

export interface Citation {
  ruleNumber: string;
  title: string;
  pageNumber: number;
  sourceDoc: string;
  excerpt?: string;
}

interface EvidenceBadgeProps {
  citations: Citation[];
  evidenceSufficient: boolean;
  language: 'en' | 'hi';
}

export const EvidenceBadge: React.FC<EvidenceBadgeProps> = ({
  citations,
  evidenceSufficient,
  language
}) => {
  if (!evidenceSufficient) {
    return (
      <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded text-xs text-amber-900 flex items-start space-x-2">
        <AlertCircle className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">
            {language === 'hi' ? 'साक्ष्य अपर्याप्त सूचना:' : 'Insufficient Statutory Evidence:'}
          </span>{' '}
          {language === 'hi'
            ? 'उपलब्ध मध्य प्रदेश भूमि विकास नियमों में इस प्रश्न के लिए कोई प्रत्यक्ष वैधानिक धारा या प्रावधान नहीं मिला।'
            : 'No exact statutory rule matches this query in the provided MP Bhumi Vikas Rules documents.'}
        </div>
      </div>
    );
  }

  if (citations.length === 0) return null;

  return (
    <div className="mt-3 pt-3 border-t border-slate-200">
      <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-800 mb-2">
        <BookOpen className="w-3.5 h-3.5 text-slate-700" />
        <span>{language === 'hi' ? 'वैधानिक नियम संदर्भ एवं स्रोत:' : 'Statutory References & Source Provisions:'}</span>
      </div>
      <div className="space-y-1.5">
        {citations.map((c, i) => (
          <div
            key={i}
            className="bg-white border border-slate-300 rounded p-2 text-xs text-slate-800 shadow-2xs hover:border-slate-400 transition"
          >
            <div className="flex flex-wrap items-center justify-between gap-1">
              <div className="flex items-center space-x-1.5 font-semibold text-slate-900">
                <FileText className="w-3.5 h-3.5 text-slate-600" />
                <span>{c.ruleNumber}</span>
                <span className="text-slate-500 font-normal">| {c.title}</span>
              </div>
              <span className="bg-slate-100 text-slate-700 border border-slate-200 text-[10px] px-1.5 py-0.5 rounded font-mono font-medium">
                {language === 'hi' ? `पृष्ठ ${c.pageNumber}` : `Page ${c.pageNumber}`}
              </span>
            </div>
            {c.excerpt && (
              <div className="mt-1 text-[11px] text-slate-600 italic bg-slate-50 p-1.5 rounded border border-slate-100">
                "{c.excerpt}"
              </div>
            )}
            <div className="mt-1 text-[10px] text-slate-500 font-sans">
              <span className="font-medium text-slate-600">{language === 'hi' ? 'दस्तावेज़: ' : 'Document: '}</span>
              {c.sourceDoc}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
