import React, { useState } from 'react';
import { FileCheck2, Upload, CheckCircle2, XCircle, ShieldAlert } from 'lucide-react';
import { authenticatedFetch } from '../utils/auth';

interface PlanCheckerProps {
  language: 'en' | 'hi';
}

interface ComplianceCheckItem {
  parameter: string;
  proposedValue: string;
  permissibleValue: string;
  status: 'PASS' | 'FAIL' | 'WARNING';
  ruleReference: string;
  pageReference: number;
  remarks: string;
}

interface PlanResult {
  disclaimer: string;
  overallStatus: 'COMPLIANT' | 'NON_COMPLIANT' | 'NEEDS_VERIFICATION';
  passedChecksCount: number;
  failedChecksCount: number;
  checks: ComplianceCheckItem[];
  statutoryAdvice: string[];
}

export const PlanCheckerModule: React.FC<PlanCheckerProps> = ({ language }) => {
  const [formData, setFormData] = useState<{
    projectName: string;
    applicantName: string;
    plotAreaSqM: number;
    roadWidthMeters: number;
    frontageMeters: number;
    proposedBuiltUpAreaSqM: number;
    proposedGroundCoverageSqM: number;
    proposedHeightMeters: number;
    proposedFrontMOSMeters: number;
    proposedSideRearMOSMeters: number;
    proposedParkingECS: number;
    occupancyType: 'residential' | 'commercial' | 'industrial' | 'public_semipublic';
  }>({
    projectName: 'Shahpura Mixed Commercial Complex',
    applicantName: 'Bhopal Urban Developers',
    plotAreaSqM: 2000,
    roadWidthMeters: 24,
    frontageMeters: 30,
    proposedBuiltUpAreaSqM: 3900,
    proposedGroundCoverageSqM: 950,
    proposedHeightMeters: 28,
    proposedFrontMOSMeters: 12,
    proposedSideRearMOSMeters: 7.5,
    proposedParkingECS: 82,
    occupancyType: 'commercial'
  });

  const [fileName, setFileName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PlanResult | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFileName(e.target.files[0].name);
    }
  };

  const handleLoadSample = (sampleType: 'compliant' | 'non_compliant') => {
    if (sampleType === 'compliant') {
      setFormData({
        projectName: 'Shahpura Heights Residency',
        applicantName: 'M.P. Housing Board JV',
        plotAreaSqM: 1500,
        roadWidthMeters: 18,
        frontageMeters: 22,
        proposedBuiltUpAreaSqM: 2500,
        proposedGroundCoverageSqM: 600,
        proposedHeightMeters: 22,
        proposedFrontMOSMeters: 9.5,
        proposedSideRearMOSMeters: 6.5,
        proposedParkingECS: 28,
        occupancyType: 'residential'
      });
      setFileName('shahpura_residency_sanction_drg.pdf (Sample Compliant)');
    } else {
      setFormData({
        projectName: 'Kolar Road Complex',
        applicantName: 'Private Commercial Applicant',
        plotAreaSqM: 1200,
        roadWidthMeters: 12,
        frontageMeters: 18,
        proposedBuiltUpAreaSqM: 2400,
        proposedGroundCoverageSqM: 800,
        proposedHeightMeters: 25,
        proposedFrontMOSMeters: 5.0,
        proposedSideRearMOSMeters: 4.0,
        proposedParkingECS: 10,
        occupancyType: 'commercial'
      });
      setFileName('kolar_road_unverified_plan.dwg (Sample Non-Compliant)');
    }
  };

  const runComplianceCheck = async () => {
    setLoading(true);
    try {
      const res = await authenticatedFetch('/api/plan-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
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
      {/* Official Government Disclaimer Box */}
      <div className="bg-amber-50 border border-amber-300 p-4 rounded text-xs text-amber-900 leading-relaxed">
        <div className="flex items-start space-x-2.5">
          <ShieldAlert className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold uppercase tracking-wider block mb-0.5">
              {language === 'hi' ? 'महत्वपूर्ण विधिक सूचना (Statutory Notice):' : 'Mandatory Technical Notice:'}
            </span>
            {language === 'hi'
              ? 'यह सुविधा केवल मध्य प्रदेश भूमि विकास नियम, 2012 के तहत प्रारंभिक तकनीकी जांच हेतु है। यह रिपोर्ट सक्षम प्राधिकारी (भोपाल नगर निगम / नगर तथा ग्राम निवेश) की औपचारिक कानूनी भवन स्वीकृति नहीं है।'
              : 'This module is a technical pre-check against MP Bhumi Vikas Rules, 2012. It DOES NOT constitute formal or legal building sanction from the Bhopal Municipal Corporation (BMC) or Directorate of Town and Country Planning (T&CP).'}
          </div>
        </div>
      </div>

      {/* Main Form Container */}
      <div className="bg-white rounded border border-slate-300 shadow-xs overflow-hidden">
        <div className="bg-slate-800 text-white px-5 py-3.5 border-b border-slate-700 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-bold flex items-center space-x-2">
              <FileCheck2 className="w-4 h-4 text-amber-400" />
              <span>{language === 'hi' ? 'भवन नक्शा अनुपालन जांच' : 'Building Plan Checker'}</span>
            </h2>
            <p className="text-[11px] text-slate-300 mt-0.5">
              {language === 'hi'
                ? 'भवन नक्शा विनिर्देशों की वैधानिक मानकों से तुलना'
                : 'Scrutiny of proposed building plan parameters against MP gazetted limits'}
            </p>
          </div>

          <div className="flex items-center space-x-2 text-xs">
            <span className="text-slate-300 text-[11px]">{language === 'hi' ? 'नमूना:' : 'Load Sample:'}</span>
            <button
              onClick={() => handleLoadSample('compliant')}
              className="px-2 py-0.5 bg-slate-700 hover:bg-slate-600 text-slate-200 border border-slate-600 rounded text-[11px] cursor-pointer"
            >
              Compliant Case
            </button>
            <button
              onClick={() => handleLoadSample('non_compliant')}
              className="px-2 py-0.5 bg-slate-700 hover:bg-slate-600 text-slate-200 border border-slate-600 rounded text-[11px] cursor-pointer"
            >
              Violation Case
            </button>
          </div>
        </div>

        <div className="p-5">
          {/* File Upload Box */}
          <div className="mb-5 border border-dashed border-slate-300 rounded p-4 text-center bg-slate-50">
            <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1.5" />
            <p className="text-xs font-semibold text-slate-800">
              {language === 'hi' ? 'भवन नक्शा फ़ाइल अपलोड करें (PDF, DWG, DXF)' : 'Upload Building Plan File (PDF, DWG, DXF)'}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {fileName ? (
                <span className="font-semibold text-slate-800">Selected File: {fileName}</span>
              ) : (
                'System performs rule verification based on extracted/entered plan parameters'
              )}
            </p>
            <input
              type="file"
              id="fileInput"
              className="hidden"
              accept=".pdf,.dwg,.dxf,.png,.jpg"
              onChange={handleFileUpload}
            />
            <label
              htmlFor="fileInput"
              className="inline-block mt-2 px-3 py-1 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-medium rounded cursor-pointer transition shadow-2xs"
            >
              {language === 'hi' ? 'फ़ाइल चुनें' : 'Browse File'}
            </label>
          </div>

          {/* Form Parameters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">Project Name</label>
              <input
                type="text"
                value={formData.projectName}
                onChange={e => setFormData({ ...formData, projectName: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900 focus:border-slate-600 focus:ring-1 focus:ring-slate-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">Plot Area (m²)</label>
              <input
                type="number"
                value={formData.plotAreaSqM}
                onChange={e => setFormData({ ...formData, plotAreaSqM: Number(e.target.value) })}
                className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900 focus:border-slate-600 focus:ring-1 focus:ring-slate-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">Road Width (m)</label>
              <input
                type="number"
                value={formData.roadWidthMeters}
                onChange={e => setFormData({ ...formData, roadWidthMeters: Number(e.target.value) })}
                className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900 focus:border-slate-600 focus:ring-1 focus:ring-slate-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">Frontage (m)</label>
              <input
                type="number"
                value={formData.frontageMeters}
                onChange={e => setFormData({ ...formData, frontageMeters: Number(e.target.value) })}
                className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900 focus:border-slate-600 focus:ring-1 focus:ring-slate-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">Proposed Built-Up (m²)</label>
              <input
                type="number"
                value={formData.proposedBuiltUpAreaSqM}
                onChange={e => setFormData({ ...formData, proposedBuiltUpAreaSqM: Number(e.target.value) })}
                className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900 focus:border-slate-600 focus:ring-1 focus:ring-slate-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">Ground Coverage (m²)</label>
              <input
                type="number"
                value={formData.proposedGroundCoverageSqM}
                onChange={e => setFormData({ ...formData, proposedGroundCoverageSqM: Number(e.target.value) })}
                className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900 focus:border-slate-600 focus:ring-1 focus:ring-slate-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">Building Height (m)</label>
              <input
                type="number"
                value={formData.proposedHeightMeters}
                onChange={e => setFormData({ ...formData, proposedHeightMeters: Number(e.target.value) })}
                className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900 focus:border-slate-600 focus:ring-1 focus:ring-slate-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">Front Setback (MOS m)</label>
              <input
                type="number"
                value={formData.proposedFrontMOSMeters}
                onChange={e => setFormData({ ...formData, proposedFrontMOSMeters: Number(e.target.value) })}
                className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900 focus:border-slate-600 focus:ring-1 focus:ring-slate-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">Side/Rear Setback (m)</label>
              <input
                type="number"
                value={formData.proposedSideRearMOSMeters}
                onChange={e => setFormData({ ...formData, proposedSideRearMOSMeters: Number(e.target.value) })}
                className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900 focus:border-slate-600 focus:ring-1 focus:ring-slate-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">Parking Slots (ECS)</label>
              <input
                type="number"
                value={formData.proposedParkingECS}
                onChange={e => setFormData({ ...formData, proposedParkingECS: Number(e.target.value) })}
                className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900 focus:border-slate-600 focus:ring-1 focus:ring-slate-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">Occupancy</label>
              <select
                value={formData.occupancyType}
                onChange={e => setFormData({ ...formData, occupancyType: e.target.value as any })}
                className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900 focus:border-slate-600 focus:ring-1 focus:ring-slate-600"
              >
                <option value="residential">Residential</option>
                <option value="commercial">Commercial</option>
                <option value="public_semipublic">Public / Semi-Public</option>
                <option value="industrial">Industrial</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={runComplianceCheck}
                disabled={loading}
                className="w-full py-1.5 px-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded transition cursor-pointer flex items-center justify-center space-x-1 shadow-2xs"
              >
                <span>{loading ? 'Evaluating...' : (language === 'hi' ? 'अनुपालन जांचें' : 'Evaluate Plan')}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Compliance Results Table */}
      {result && (
        <div className="bg-white rounded border border-slate-300 overflow-hidden shadow-2xs">
          <div className="p-3.5 bg-slate-100 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center space-x-3">
              <span
                className={`px-2.5 py-0.5 rounded text-xs font-bold uppercase tracking-wider ${
                  result.overallStatus === 'COMPLIANT'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-red-100 text-red-800 border border-red-300'
                }`}
              >
                {result.overallStatus === 'COMPLIANT' ? 'Pre-Check Passed' : 'Violations Detected'}
              </span>
              <span className="text-xs text-slate-600 font-medium">
                {result.passedChecksCount} Passed / {result.failedChecksCount} Failed
              </span>
            </div>
            <span className="text-[11px] text-slate-500 font-mono">
              Evaluated against 2025 MP Gazette Norms
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-800 uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-3.5 py-2.5">Parameter</th>
                  <th className="px-3.5 py-2.5">Proposed Value</th>
                  <th className="px-3.5 py-2.5">Statutory Limit</th>
                  <th className="px-3.5 py-2.5">Rule Reference</th>
                  <th className="px-3.5 py-2.5">Status</th>
                  <th className="px-3.5 py-2.5">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {result.checks.map((c, i) => (
                  <tr key={i} className="hover:bg-slate-50">
                    <td className="px-3.5 py-2.5 font-semibold text-slate-900">{c.parameter}</td>
                    <td className="px-3.5 py-2.5 text-slate-800 font-mono">{c.proposedValue}</td>
                    <td className="px-3.5 py-2.5 text-slate-800 font-mono">{c.permissibleValue}</td>
                    <td className="px-3.5 py-2.5 text-slate-700 font-medium">
                      {c.ruleReference} (P.{c.pageReference})
                    </td>
                    <td className="px-3.5 py-2.5">
                      {c.status === 'PASS' ? (
                        <span className="inline-flex items-center space-x-1 text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                          <span>PASS</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 text-red-800 font-bold bg-red-50 px-2 py-0.5 rounded border border-red-200">
                          <XCircle className="w-3 h-3 text-red-700" />
                          <span>FAIL</span>
                        </span>
                      )}
                    </td>
                    <td className="px-3.5 py-2.5 text-slate-600">{c.remarks}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-3.5 bg-slate-50 border-t border-slate-200">
            <h4 className="text-xs font-bold text-slate-800 mb-1">Statutory Advisory Directives:</h4>
            <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside">
              {result.statutoryAdvice.map((a, i) => (
                <li key={i}>{a}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
