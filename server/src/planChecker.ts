import { calculateBuildingLimits, CalculatorInput } from './calculatorRules';

export interface PlanSubmission {
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
}

export interface ComplianceCheckItem {
  parameter: string;
  proposedValue: string;
  permissibleValue: string;
  status: 'PASS' | 'FAIL' | 'WARNING';
  ruleReference: string;
  pageReference: number;
  remarks: string;
}

export interface PlanEvaluationResult {
  disclaimer: string;
  overallStatus: 'COMPLIANT' | 'NON_COMPLIANT' | 'NEEDS_VERIFICATION';
  passedChecksCount: number;
  failedChecksCount: number;
  checks: ComplianceCheckItem[];
  statutoryAdvice: string[];
}

export function checkPlanCompliance(plan: PlanSubmission): PlanEvaluationResult {
  const limits = calculateBuildingLimits({
    roadWidthMeters: plan.roadWidthMeters,
    plotAreaSqM: plan.plotAreaSqM,
    frontageMeters: plan.frontageMeters,
    occupancyType: plan.occupancyType,
    proposedHeightMeters: plan.proposedHeightMeters,
  });

  const checks: ComplianceCheckItem[] = [];

  // 1. FAR Check
  const proposedFar = Math.round((plan.proposedBuiltUpAreaSqM / plan.plotAreaSqM) * 100) / 100;
  const farPass = proposedFar <= limits.maxFar;
  checks.push({
    parameter: 'Floor Area Ratio (FAR)',
    proposedValue: `${proposedFar} (${plan.proposedBuiltUpAreaSqM} sq.m.)`,
    permissibleValue: `Max ${limits.maxFar} (${limits.permissibleBuiltUpAreaSqM} sq.m.)`,
    status: farPass ? 'PASS' : 'FAIL',
    ruleReference: 'Rule 61 / Table 4',
    pageReference: 83,
    remarks: farPass ? 'Proposed FAR is within statutory ceiling.' : 'Proposed FAR exceeds maximum permissible limit.'
  });

  // 2. Ground Coverage Check
  const proposedCoveragePercent = Math.round((plan.proposedGroundCoverageSqM / plan.plotAreaSqM) * 1000) / 10;
  checks.push({
    parameter: 'Ground Coverage',
    proposedValue: `${proposedCoveragePercent}% (${plan.proposedGroundCoverageSqM} sq.m.)`,
    permissibleValue: 'Unverified / Governed by Setbacks (Table 4 Col 6 deleted)',
    status: 'WARNING',
    ruleReference: 'MP Gazette No. 74 (06-03-2025)',
    pageReference: 58,
    remarks: 'Standalone coverage percentage deleted by 2025 Gazette; ground envelope must be verified via front and side/rear setbacks.'
  });

  // 3. Building Height Check
  const heightPass = plan.proposedHeightMeters <= limits.maxBuildingHeightMeters;
  checks.push({
    parameter: 'Building Height',
    proposedValue: `${plan.proposedHeightMeters} m`,
    permissibleValue: `Max ${limits.maxBuildingHeightMeters} m`,
    status: heightPass ? 'PASS' : 'FAIL',
    ruleReference: 'Rule 42(1) Table 4 Column 7',
    pageReference: 58,
    remarks: heightPass ? 'Height is within permissible limit for access road width.' : 'Building height exceeds allowable ceiling for road width.'
  });

  // 4. Front Marginal Open Space (Front Setback)
  const frontMOSPass = plan.proposedFrontMOSMeters >= limits.minimumFrontMOSMeters;
  checks.push({
    parameter: 'Front Setback (MOS)',
    proposedValue: `${plan.proposedFrontMOSMeters} m`,
    permissibleValue: `Min ${limits.minimumFrontMOSMeters} m`,
    status: frontMOSPass ? 'PASS' : 'FAIL',
    ruleReference: 'Rule 42(1) Table 4 Column 8',
    pageReference: 58,
    remarks: frontMOSPass ? 'Front setback satisfies minimum open space requirement.' : 'Front setback is inadequate; violation of open space requirement.'
  });

  // 5. Side & Rear MOS
  const sideRearPass = plan.proposedSideRearMOSMeters >= limits.minimumSideRearMOSMeters;
  checks.push({
    parameter: 'Side & Rear Setbacks',
    proposedValue: `${plan.proposedSideRearMOSMeters} m`,
    permissibleValue: `Min ${limits.minimumSideRearMOSMeters} m`,
    status: sideRearPass ? 'PASS' : 'FAIL',
    ruleReference: 'Rule 42(1) Table 4 Column 9',
    pageReference: 58,
    remarks: sideRearPass ? 'Side and rear margins satisfy statutory clearance.' : 'Side or rear setback is less than required minimum clearance.'
  });

  // 6. Parking Spaces (ECS)
  checks.push({
    parameter: 'Off-Street Parking (ECS)',
    proposedValue: `${plan.proposedParkingECS} ECS`,
    permissibleValue: 'Requires verification against Appendix 1-1 / झ-1',
    status: plan.proposedParkingECS > 0 ? 'WARNING' : 'FAIL',
    ruleReference: 'Rule 84(1) & Appendix 1-1',
    pageReference: 97,
    remarks: 'Parking ratio requires verification against official Appendix 1-1 table for the specified occupancy.'
  });

  const passedCount = checks.filter(c => c.status === 'PASS').length;
  const failedCount = checks.filter(c => c.status === 'FAIL').length;

  return {
    disclaimer: 'IMPORTANT STATUTORY NOTICE: This automated building plan check is an advisory pre-check system designed for technical guidance under the Madhya Pradesh Bhumi Vikas Rules, 2012. This report DOES NOT constitute official or legal building permission from the Bhopal Municipal Corporation (BMC) or the Directorate of Town and Country Planning (T&CP). Formal sanction must be obtained via the official MP e-NagarPalika portal.',
    overallStatus: failedCount === 0 ? 'COMPLIANT' : 'NON_COMPLIANT',
    passedChecksCount: passedCount,
    failedChecksCount: failedCount,
    checks,
    statutoryAdvice: [
      'Submit formal scrutiny drawings through an architect/engineer registered under Rule 26.',
      'Affidavit in Appendix A-2(2) & A-2(3) required under Rule 14 for deemed approval eligibility.',
      'Ensure fire authority NOC if building height exceeds 12.5 meters pursuant to Rule 87.'
    ]
  };
}
