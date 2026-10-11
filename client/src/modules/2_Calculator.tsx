import React, { useState } from 'react';
import { Calculator, CheckCircle2, AlertTriangle, ArrowRight, HelpCircle } from 'lucide-react';
import { authenticatedFetch } from '../utils/auth';

interface CalculatorProps {
  language: 'en' | 'hi';
}

export type VerificationStatus = 'VERIFIED_STATUTORY' | 'UNVERIFIED_REQUIRES_VERIFICATION';

export interface ParameterVerification {
  value: string | number | null;
  status: VerificationStatus;
  ruleReference: string;
  pageNumber?: number;
  note: string;
}

interface CalcResult {
  isCompliant: boolean;
  maxFar: number;
  permissibleBuiltUpAreaSqM: number;
  maxBuildingHeightMeters: number;
  minimumFrontMOSMeters: number;
  minimumSideRearMOSMeters: number;

  farVerification: ParameterVerification;
  builtUpAreaVerification: ParameterVerification;
  heightVerification: ParameterVerification;
  frontMOSVerification: ParameterVerification;
  sideRearMOSVerification: ParameterVerification;
  groundCoverageVerification: ParameterVerification;
  parkingVerification: ParameterVerification;

  applicableRules: { ruleNumber: string; pageNumber: number; description: string }[];
  regulatoryNotes: string[];
  statutoryDisclaimer: string;
}

export const CalculatorModule: React.FC<CalculatorProps> = ({ language }) => {
  const [roadWidth, setRoadWidth] = useState<number>(18);
  const [plotArea, setPlotArea] = useState<number>(1500);
  const [frontage, setFrontage] = useState<number>(24);
  const [occupancy, setOccupancy] = useState<string>('residential');
  const [proposedHeight, setProposedHeight] = useState<number>(22);
  const [result, setResult] = useState<CalcResult | null>(null);
  const [loading, setLoading] = useState(false);

  const calculate = async () => {
    setLoading(true);
    try {
      const res = await authenticatedFetch('/api/calculator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roadWidthMeters: Number(roadWidth),
          plotAreaSqM: Number(plotArea),
          frontageMeters: Number(frontage),
          occupancyType: occupancy,
          proposedHeightMeters: Number(proposedHeight)
        })
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
    <div className="space-y-6">
      {/* Official Government Module Form Header */}
      <div className="bg-white rounded border border-slate-300 shadow-xs overflow-hidden">
        <div className="bg-slate-800 text-white px-5 py-3.5 border-b border-slate-700 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-bold flex items-center space-x-2">
              <Calculator className="w-4 h-4 text-amber-400" />
              <span>{language === 'hi' ? 'भवन सीमा कैलकुलेटर' : 'Building Limit Calculator'}</span>
            </h2>
            <p className="text-[11px] text-slate-300 mt-0.5">
              {language === 'hi'
                ? 'नियम 42 (तालिका 4) एवं नियम 61 (तालिका 8) के सत्यापित प्रावधान'
                : 'Calculations based strictly on Table 4 (Rule 42) and Table 8 (Rule 61) of MP Bhumi Vikas Rules'}
            </p>
          </div>
          <div className="text-[11px] bg-slate-700 border border-slate-600 px-2.5 py-1 rounded text-slate-200">
            {language === 'hi' ? 'सत्यापित गणना' : 'Statutory Computation'}
          </div>
        </div>

        {/* Parameter Inputs */}
        <div className="p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                {language === 'hi' ? 'सामने सड़क की चौड़ाई (मीटर)' : 'Road Width in Front (meters)'}
              </label>
              <input
                type="number"
                min="3"
                step="0.5"
                value={roadWidth}
                onChange={e => setRoadWidth(Number(e.target.value))}
                className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-900 focus:border-slate-600 focus:ring-1 focus:ring-slate-600"
              />
              <span className="text-[11px] text-slate-500 mt-0.5 block">Standard thresholds: 12m, 18m, 24m</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                {language === 'hi' ? 'भूखंड क्षेत्रफल (वर्ग मीटर)' : 'Plot Area (sq. meters)'}
              </label>
              <input
                type="number"
                min="50"
                step="10"
                value={plotArea}
                onChange={e => setPlotArea(Number(e.target.value))}
                className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-900 focus:border-slate-600 focus:ring-1 focus:ring-slate-600"
              />
              <span className="text-[11px] text-slate-500 mt-0.5 block">Area thresholds: 1000, 1500, 2000 m²</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                {language === 'hi' ? 'भूखंड का मुख (फ्रंटेज, मीटर)' : 'Plot Frontage (meters)'}
              </label>
              <input
                type="number"
                min="3"
                step="0.5"
                value={frontage}
                onChange={e => setFrontage(Number(e.target.value))}
                className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-900 focus:border-slate-600 focus:ring-1 focus:ring-slate-600"
              />
              <span className="text-[11px] text-slate-500 mt-0.5 block">Standard requirement: ≥18m</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                {language === 'hi' ? 'उपयोग का प्रकार (Occupancy)' : 'Occupancy Type'}
              </label>
              <select
                value={occupancy}
                onChange={e => setOccupancy(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-900 focus:border-slate-600 focus:ring-1 focus:ring-slate-600"
              >
                <option value="residential">{language === 'hi' ? 'आवासीय (Residential)' : 'Residential'}</option>
                <option value="commercial">{language === 'hi' ? 'व्यावसायिक (Commercial)' : 'Commercial'}</option>
                <option value="public_semipublic">{language === 'hi' ? 'सार्वजनिक/अर्ध-सार्वजनिक (Public/Semi-Public)' : 'Public / Semi-Public'}</option>
                <option value="industrial">{language === 'hi' ? 'औद्योगिक (Industrial)' : 'Industrial'}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                {language === 'hi' ? 'प्रस्तावित ऊंचाई (मीटर)' : 'Proposed Building Height (m)'}
              </label>
              <input
                type="number"
                min="3"
                step="0.5"
                value={proposedHeight}
                onChange={e => setProposedHeight(Number(e.target.value))}
                className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-900 focus:border-slate-600 focus:ring-1 focus:ring-slate-600"
              />
              <span className="text-[11px] text-slate-500 mt-0.5 block">Ceilings: 12.5m, 18m, 24m, 30m</span>
            </div>

            <div className="flex items-end">
              <button
                onClick={calculate}
                disabled={loading}
                className="w-full py-2 px-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded transition flex items-center justify-center space-x-1.5 cursor-pointer shadow-2xs"
              >
                <span>{loading ? (language === 'hi' ? 'गणना जारी...' : 'Computing...') : (language === 'hi' ? 'गणना निष्पादित करें' : 'Compute Statutory Limits')}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Output Results */}
      {result && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* 1. FAR Card */}
            <div className="bg-white p-4 rounded border border-slate-300 shadow-2xs">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-slate-600 uppercase">
                  {language === 'hi' ? 'अधिकतम FAR सीमा' : 'Maximum Permissible FAR'}
                </span>
                <span className="text-[10px] bg-slate-100 text-slate-700 font-semibold px-1.5 py-0.5 rounded border border-slate-300">
                  Verified Statutory Rule
                </span>
              </div>
              <div className="text-2xl font-bold text-slate-900 mt-1">
                {result.farVerification.value}
              </div>
              <span className="text-xs text-slate-600 font-medium mt-1 block">
                {result.farVerification.ruleReference} (Page {result.farVerification.pageNumber})
              </span>
            </div>

            {/* 2. Permissible Built-up Area Card */}
            <div className="bg-white p-4 rounded border border-slate-300 shadow-2xs">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-slate-600 uppercase">
                  {language === 'hi' ? 'स्वीकार्य निर्मित क्षेत्रफल' : 'Permissible Built-up Area'}
                </span>
                <span className="text-[10px] bg-slate-100 text-slate-700 font-semibold px-1.5 py-0.5 rounded border border-slate-300">
                  Verified Statutory Rule
                </span>
              </div>
              <div className="text-2xl font-bold text-slate-900 mt-1">
                {result.permissibleBuiltUpAreaSqM.toLocaleString()} <span className="text-xs font-normal text-slate-600">m²</span>
              </div>
              <span className="text-xs text-slate-500 mt-1 block">
                Plot {plotArea}m² × FAR {result.maxFar}
              </span>
            </div>

            {/* 3. Permissible Max Height Card */}
            <div className="bg-white p-4 rounded border border-slate-300 shadow-2xs">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-slate-600 uppercase">
                  {language === 'hi' ? 'स्वीकार्य अधिकतम ऊंचाई' : 'Permissible Max Height'}
                </span>
                <span className="text-[10px] bg-slate-100 text-slate-700 font-semibold px-1.5 py-0.5 rounded border border-slate-300">
                  Verified Statutory Rule
                </span>
              </div>
              <div className="text-2xl font-bold text-slate-900 mt-1">
                {result.maxBuildingHeightMeters} <span className="text-xs font-normal text-slate-600">meters</span>
              </div>
              <span className={`text-xs font-medium mt-1 block ${result.isCompliant ? 'text-emerald-700' : 'text-red-700'}`}>
                {result.isCompliant ? `Proposed height (${proposedHeight}m) satisfies ceiling` : `Height violation: proposed ${proposedHeight}m > ${result.maxBuildingHeightMeters}m`}
              </span>
            </div>
          </div>

          {/* Detailed Verification Matrix */}
          <div className="bg-white rounded border border-slate-300 overflow-hidden shadow-2xs">
            <div className="px-4 py-2.5 bg-slate-100 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                {language === 'hi' ? 'पैरामीटर सत्यापन तालिका' : 'Parameter Verification Matrix (Statutory vs Unverified)'}
              </h3>
              <span className="text-[11px] font-mono text-slate-600">MP Bhumi Vikas Rules (2025 Edition)</span>
            </div>

            <div className="divide-y divide-slate-200 text-xs">
              {/* Front MOS */}
              <div className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-50">
                <div>
                  <div className="font-bold text-slate-900 flex items-center space-x-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-slate-700" />
                    <span>Front Marginal Open Space (Front Setback)</span>
                  </div>
                  <p className="text-slate-600 text-[11px] mt-0.5">{result.frontMOSVerification.note}</p>
                </div>
                <div className="flex items-center space-x-3 sm:text-right">
                  <span className="font-bold text-slate-900">{result.frontMOSVerification.value}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-300 whitespace-nowrap">
                    Verified Statutory Rule
                  </span>
                </div>
              </div>

              {/* Side & Rear MOS */}
              <div className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-50">
                <div>
                  <div className="font-bold text-slate-900 flex items-center space-x-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-slate-700" />
                    <span>Sides & Rear Marginal Open Space</span>
                  </div>
                  <p className="text-slate-600 text-[11px] mt-0.5">{result.sideRearMOSVerification.note}</p>
                </div>
                <div className="flex items-center space-x-3 sm:text-right">
                  <span className="font-bold text-slate-900">{result.sideRearMOSVerification.value}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-300 whitespace-nowrap">
                    Verified Statutory Rule
                  </span>
                </div>
              </div>

              {/* Ground Coverage */}
              <div className="p-3.5 flex flex-col sm:flex-row sm:items-start justify-between gap-2 bg-amber-50/50">
                <div className="max-w-xl">
                  <div className="font-bold text-amber-900 flex items-center space-x-1.5">
                    <HelpCircle className="w-3.5 h-3.5 text-amber-700" />
                    <span>Maximum Ground Coverage Percentage</span>
                  </div>
                  <p className="text-amber-800 text-[11px] mt-0.5 leading-relaxed">
                    {result.groundCoverageVerification.note}
                  </p>
                </div>
                <div className="flex items-center space-x-2 sm:text-right flex-shrink-0">
                  <span className="text-xs font-medium text-amber-900 italic">Governed by Setbacks</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-900 border border-amber-300 whitespace-nowrap">
                    Not Verified Under 2025 Rules
                  </span>
                </div>
              </div>

              {/* Parking ECS */}
              <div className="p-3.5 flex flex-col sm:flex-row sm:items-start justify-between gap-2 bg-amber-50/50">
                <div className="max-w-xl">
                  <div className="font-bold text-amber-900 flex items-center space-x-1.5">
                    <HelpCircle className="w-3.5 h-3.5 text-amber-700" />
                    <span>Mandatory Parking ECS</span>
                  </div>
                  <p className="text-amber-800 text-[11px] mt-0.5 leading-relaxed">
                    {result.parkingVerification.note}
                  </p>
                </div>
                <div className="flex items-center space-x-2 sm:text-right flex-shrink-0">
                  <span className="text-xs font-medium text-amber-900 italic">Consult Appendix 1-1 / झ-1</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-900 border border-amber-300 whitespace-nowrap">
                    Requires Appendix Verification
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Statutory Provisions Reference */}
          <div className="bg-white p-4 rounded border border-slate-300 shadow-2xs">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5 flex items-center space-x-2">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              <span>{language === 'hi' ? 'सत्यापित नियम एवं राजपत्र संदर्भ' : 'Verified Statutory Provisions & Gazette Authorities'}</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {result.applicableRules.map((r, i) => (
                <div key={i} className="text-xs bg-slate-50 border border-slate-200 p-2.5 rounded">
                  <span className="font-bold text-slate-900">{r.ruleNumber}</span> (Page {r.pageNumber}):{' '}
                  <span className="text-slate-600">{r.description}</span>
                </div>
              ))}
            </div>
            {result.regulatoryNotes.length > 0 && (
              <div className="mt-3 pt-2.5 border-t border-slate-200 space-y-1">
                {result.regulatoryNotes.map((n, i) => (
                  <div key={i} className="text-[11px] text-slate-600 italic">
                    • {n}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
