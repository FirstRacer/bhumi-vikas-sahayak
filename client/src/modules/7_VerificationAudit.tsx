import React, { useState } from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { authenticatedFetch } from '../utils/auth';

interface VerificationProps {
  language: 'en' | 'hi';
}

interface AuditResult {
  statementTested: string;
  verdict: 'VERIFIED_FACTUAL' | 'INSUFFICIENT_EVIDENCE' | 'CONFLICT_DETECTED';
  confidenceScore: number;
  supportingRules: {
    ruleNumber: string;
    pageNumber: number;
    title: string;
    exactExcerpt: string;
  }[];
  flaggedGaps: string[];
  explanation: string;
}

export const VerificationAuditModule: React.FC<VerificationProps> = ({ language }) => {
  const [statement, setStatement] = useState(
    'Under Rule 42 Table 4, a building on a 24m road with a 2000 sq.m plot has an allowed FAR of 1:2.0 and height up to 30 meters.'
  );
  const [result, setResult] = useState<AuditResult | null>(null);
  const [loading, setLoading] = useState(false);

  const sampleAudits = [
    {
      label: 'Verified Claim (Table 4 FAR & Height)',
      text: 'Under Rule 42 Table 4, on a 24m road with a 2000 sq.m plot, FAR is 1:2.0 and building height is up to 30 meters.'
    },
    {
      label: 'Discrepancy / Regulatory Conflict',
      text: 'Rule 42 allows an FAR of 1:3.5 and 50 meters building height on an 18m road.'
    },
    {
      label: 'Unsubstantiated / Missing Statutory Evidence',
      text: 'The municipality provides 90% property tax exemption for green roofs under Bhopal bylaws.'
    }
  ];

  const handleAudit = async (textToAudit?: string) => {
    const text = textToAudit || statement;
    if (!text.trim() || loading) return;

    setLoading(true);
    try {
      const res = await authenticatedFetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ statement: text })
      });
      const data = await res.json();
      setResult(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Module Header Container */}
      <div className="bg-white rounded border border-slate-300 shadow-xs overflow-hidden">
        <div className="bg-slate-800 text-white px-5 py-3.5 border-b border-slate-700 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-bold flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-amber-400" />
              <span>{language === 'hi' ? 'उत्तर स्रोत एवं सत्यापन' : 'Answer Sources and Verification'}</span>
            </h2>
            <p className="text-[11px] text-slate-300 mt-0.5">
              {language === 'hi'
                ? 'कथनों को आधिकारिक राजपत्र नियमों के विरुद्ध जांचें एवं साक्ष्य के अभाव को मानवीय समीक्षा हेतु चिह्नित करें'
                : 'Audits assertions against gazetted rules, identifies contradictions, and flags missing evidence for review'}
            </p>
          </div>
          <div className="text-[11px] bg-slate-700 border border-slate-600 px-2.5 py-1 rounded text-slate-200">
            {language === 'hi' ? 'वैधानिक संपुष्टि' : 'Statutory Verification'}
          </div>
        </div>

        {/* Query & Audit Form */}
        <div className="p-5">
          <label className="block text-xs font-semibold text-slate-800 mb-1.5">
            {language === 'hi' ? 'सत्यापन हेतु विनियामक कथन या दावा दर्ज करें:' : 'Regulatory Statement or Claim to Audit:'}
          </label>
          <textarea
            rows={3}
            value={statement}
            onChange={e => setStatement(e.target.value)}
            placeholder="Enter any regulatory statement to cross-check against official PDF rules..."
            className="w-full bg-white border border-slate-300 rounded p-3 text-xs text-slate-900 focus:border-slate-600 focus:ring-1 focus:ring-slate-600"
          />

          <div className="mt-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div className="flex flex-wrap gap-1.5">
              <span className="text-[11px] text-slate-500 font-semibold self-center mr-1">Sample Queries:</span>
              {sampleAudits.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setStatement(s.text);
                    handleAudit(s.text);
                  }}
                  className="bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 text-[11px] px-2 py-0.5 rounded transition cursor-pointer"
                >
                  {s.label}
                </button>
              ))}
            </div>

            <button
              onClick={() => handleAudit()}
              disabled={loading || !statement.trim()}
              className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-semibold text-xs rounded transition cursor-pointer shadow-2xs flex-shrink-0"
            >
              {language === 'hi' ? 'साक्ष्य जांचें' : 'Execute Verification Audit'}
            </button>
          </div>
        </div>
      </div>

      {/* Audit Verdict Results */}
      {result && (
        <div className="bg-white rounded border border-slate-300 overflow-hidden shadow-2xs">
          <div className="p-3.5 bg-slate-100 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center space-x-2.5">
              <span
                className={`px-2.5 py-0.5 rounded text-xs font-bold uppercase tracking-wider ${
                  result.verdict === 'VERIFIED_FACTUAL'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : result.verdict === 'CONFLICT_DETECTED'
                    ? 'bg-red-100 text-red-800 border border-red-300'
                    : 'bg-amber-100 text-amber-900 border border-amber-300'
                }`}
              >
                {result.verdict === 'VERIFIED_FACTUAL' && '✓ Statutory Corroboration Confirmed'}
                {result.verdict === 'CONFLICT_DETECTED' && '⚠ Regulatory Conflict Detected'}
                {result.verdict === 'INSUFFICIENT_EVIDENCE' && '⚡ Insufficient Evidence — Flagged for Review'}
              </span>
              <span className="text-xs font-mono text-slate-700">
                Confidence: {result.confidenceScore}%
              </span>
            </div>
            <span className="text-[11px] text-slate-500 font-mono">
              MP Bhumi Vikas Rules (2025 Edition)
            </span>
          </div>

          <div className="p-4 space-y-4">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Audit Assessment Summary
              </h4>
              <p className="text-xs text-slate-800 leading-relaxed bg-slate-50 p-3 rounded border border-slate-200 font-normal">
                {result.explanation}
              </p>
            </div>

            {/* Flagged Gaps */}
            {result.flaggedGaps.length > 0 && (
              <div className="bg-red-50 border border-red-200 p-3 rounded text-xs">
                <div className="flex items-center space-x-1.5 text-red-900 font-bold mb-1">
                  <AlertCircle className="w-3.5 h-3.5 text-red-700" />
                  <span>Flagged Discrepancies & Evidentiary Gaps for Human Review:</span>
                </div>
                <ul className="text-red-800 space-y-0.5 list-disc list-inside">
                  {result.flaggedGaps.map((g, i) => (
                    <li key={i}>{g}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Supporting Rules */}
            {result.supportingRules.length > 0 && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Corroborating Statutory Provisions in Database:
                </h4>
                <div className="space-y-2">
                  {result.supportingRules.map((sr, i) => (
                    <div key={i} className="bg-slate-50 border border-slate-200 rounded p-2.5 text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-slate-900">
                          {sr.ruleNumber} — {sr.title}
                        </span>
                        <span className="text-slate-500 font-mono text-[11px]">PDF Page {sr.pageNumber}</span>
                      </div>
                      <p className="text-slate-700 italic leading-relaxed">"{sr.exactExcerpt}"</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
