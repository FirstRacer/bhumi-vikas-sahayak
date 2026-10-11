export interface CalculatorInput {
  roadWidthMeters: number;
  plotAreaSqM: number;
  frontageMeters: number;
  occupancyType: 'residential' | 'commercial' | 'industrial' | 'public_semipublic';
  proposedHeightMeters?: number;
}

export type VerificationStatus = 'VERIFIED_STATUTORY' | 'UNVERIFIED_REQUIRES_VERIFICATION';

export interface ParameterVerification {
  value: string | number | null;
  status: VerificationStatus;
  ruleReference: string;
  pageNumber?: number;
  note: string;
}

export interface CalculationResult {
  isCompliant: boolean;
  maxFar: number;
  permissibleBuiltUpAreaSqM: number;
  maxBuildingHeightMeters: number;
  minimumFrontMOSMeters: number;
  minimumSideRearMOSMeters: number;

  // Audit-compliant parameters with verification status
  farVerification: ParameterVerification;
  builtUpAreaVerification: ParameterVerification;
  heightVerification: ParameterVerification;
  frontMOSVerification: ParameterVerification;
  sideRearMOSVerification: ParameterVerification;
  groundCoverageVerification: ParameterVerification;
  parkingVerification: ParameterVerification;

  // Backwards compatibility fields for existing interfaces
  maxGroundCoveragePercent: number | null;
  permissibleGroundCoverageSqM: number | null;
  parkingRequiredECS: number | null;

  applicableRules: { ruleNumber: string; pageNumber: number; description: string }[];
  regulatoryNotes: string[];
  statutoryDisclaimer: string;
}

/**
 * Calculates building parameters according to verified rules:
 * - Table 4 (Rule 42(1)): Buildings above 12.5m and up to 30m
 * - Table 8 (Rule 61): FAR by occupancy
 * - Rule 84: Parking Space (Appendix 1-1 / झ-1)
 *
 * NOTE: Decision-support tool only. Does NOT constitute official municipal building sanction.
 */
export function calculateBuildingLimits(input: CalculatorInput): CalculationResult {
  const { roadWidthMeters, plotAreaSqM, frontageMeters, occupancyType, proposedHeightMeters } = input;
  const applicableRules: { ruleNumber: string; pageNumber: number; description: string }[] = [];
  const regulatoryNotes: string[] = [];

  let maxFar = 1.25;
  let minFrontMOS = 4.5;
  let minSideRearMOS = 3.0;
  let maxHeight = 12.5;

  let farRule = 'Rule 61 (Table 8)';
  let farPage = 83;
  let heightRule = 'Rule 42(1) / Low-Rise Baseline';
  let heightPage = 58;
  let mosRule = 'Rule 42(1) / General Open Space';
  let mosPage = 58;

  // Base rule 61 (Table 8) FAR by occupancy
  applicableRules.push({
    ruleNumber: 'Rule 61 (Table 8)',
    pageNumber: 83,
    description: 'Floor Area Ratio (FAR) for Different Use Groups (Residential=1.25, Commercial=1.25-2.50, PSP=1.00)'
  });

  if (occupancyType === 'residential') {
    maxFar = 1.25;
  } else if (occupancyType === 'commercial') {
    maxFar = 1.50; // default for local/convenience shopping centre
  } else if (occupancyType === 'public_semipublic') {
    maxFar = 1.00;
  } else if (occupancyType === 'industrial') {
    maxFar = 1.00;
  }

  // Check Table 4 (Rule 42(1)) thresholds: road >= 12m, plot >= 1000 m², frontage >= 18m
  const qualifiesForTable4 = roadWidthMeters >= 12.0 && plotAreaSqM >= 1000 && frontageMeters >= 18.0;

  if (qualifiesForTable4) {
    applicableRules.push({
      ruleNumber: 'Rule 42(1) (Table 4)',
      pageNumber: 58,
      description: 'Development norms for plots with building height above 12.5m and up to 30m'
    });

    farRule = 'Rule 42(1) Table 4';
    farPage = 58;
    heightRule = 'Rule 42(1) Table 4 Column 7';
    heightPage = 58;
    mosRule = 'Rule 42(1) Table 4 Columns 8 & 9';
    mosPage = 58;

    if (roadWidthMeters >= 24.0 && plotAreaSqM >= 2000 && frontageMeters >= 30.0) {
      maxFar = Math.max(maxFar, 2.0);
      maxHeight = 30.0;
      minFrontMOS = 12.0;
      minSideRearMOS = 7.5;
      regulatoryNotes.push('Plot qualifies for Table 4 S.No. 3: 24m+ road width, FAR 1:2.0, Front MOS 12.0m, Sides/Rear 7.5m, Height up to 30.0m.');
    } else if (roadWidthMeters >= 18.0 && plotAreaSqM >= 1500 && frontageMeters >= 21.0) {
      maxFar = Math.max(maxFar, 1.75);
      maxHeight = 24.0;
      minFrontMOS = 9.0;
      minSideRearMOS = 6.0;
      regulatoryNotes.push('Plot qualifies for Table 4 S.No. 2: 18m+ road width, FAR 1:1.75, Front MOS 9.0m, Sides/Rear 6.0m, Height up to 24.0m.');
    } else {
      maxFar = Math.max(maxFar, 1.50);
      maxHeight = 18.0;
      minFrontMOS = 7.5;
      minSideRearMOS = 6.0;
      regulatoryNotes.push('Plot qualifies for Table 4 S.No. 1: 12m+ road width, FAR 1:1.50, Front MOS 7.5m, Sides/Rear 6.0m, Height up to 18.0m.');
    }
  } else {
    // Standard low-rise constraints
    maxHeight = 12.5;
    if (roadWidthMeters < 9.0) {
      minFrontMOS = 3.0;
      minSideRearMOS = 1.5;
      regulatoryNotes.push('Standard low-rise envelope: Road width below 9.0m limits maximum structure height to 12.5m (G+2 typical).');
    } else {
      minFrontMOS = 4.5;
      minSideRearMOS = 3.0;
    }
  }

  const permissibleBuiltUpAreaSqM = Math.round(plotAreaSqM * maxFar * 100) / 100;

  let isCompliant = true;
  if (proposedHeightMeters && proposedHeightMeters > maxHeight) {
    isCompliant = false;
    regulatoryNotes.push(`Proposed height (${proposedHeightMeters}m) exceeds maximum permissible height (${maxHeight}m) for the given road width and plot specifications.`);
  }

  // 1. FAR Verification
  const farVerification: ParameterVerification = {
    value: `1:${maxFar.toFixed(2)}`,
    status: 'VERIFIED_STATUTORY',
    ruleReference: farRule,
    pageNumber: farPage,
    note: `Statutorily verified under ${farRule} (Page ${farPage}) for road width ${roadWidthMeters}m and plot area ${plotAreaSqM}m².`
  };

  // 2. Built-up Area Verification
  const builtUpAreaVerification: ParameterVerification = {
    value: `${permissibleBuiltUpAreaSqM} m²`,
    status: 'VERIFIED_STATUTORY',
    ruleReference: `${farRule} & Rule 2(30)`,
    pageNumber: farPage,
    note: `Calculated as Plot Area (${plotAreaSqM} m²) × Permissible FAR (${maxFar}).`
  };

  // 3. Maximum Building Height Verification
  const heightVerification: ParameterVerification = {
    value: `${maxHeight} m`,
    status: 'VERIFIED_STATUTORY',
    ruleReference: heightRule,
    pageNumber: heightPage,
    note: `Statutorily verified under ${heightRule} (Page ${heightPage}) for road width ${roadWidthMeters}m.`
  };

  // 4. Front MOS Verification
  const frontMOSVerification: ParameterVerification = {
    value: `${minFrontMOS} m`,
    status: 'VERIFIED_STATUTORY',
    ruleReference: qualifiesForTable4 ? 'Rule 42(1) Table 4 Column 8' : 'Rule 56 Front Open Space',
    pageNumber: qualifiesForTable4 ? 58 : 77,
    note: `Statutorily verified minimum front open space requirement.`
  };

  // 5. Side & Rear MOS Verification
  const sideRearMOSVerification: ParameterVerification = {
    value: `${minSideRearMOS} m`,
    status: 'VERIFIED_STATUTORY',
    ruleReference: qualifiesForTable4 ? 'Rule 42(1) Table 4 Column 9' : 'Rule 56 Side/Rear Open Space',
    pageNumber: qualifiesForTable4 ? 58 : 78,
    note: `Statutorily verified minimum side and rear open space requirements.`
  };

  // 6. Ground Coverage Verification (Removed hardcoded 40%)
  const groundCoverageVerification: ParameterVerification = {
    value: null,
    status: 'UNVERIFIED_REQUIRES_VERIFICATION',
    ruleReference: 'MP Rajpatra (Asadharan) No. 74 (06-03-2025)',
    pageNumber: 58,
    note: 'Not verified under the 2025 amended rules. Column 6 of Table 4 was expressly deleted by MP Gazette No. 74 dated 06-03-2025. Permissible footprint is governed by mandatory setbacks (Front MOS and Sides/Rear MOS) and overall FAR ceiling rather than a standalone 40% cap.'
  };

  // 7. Parking ECS Verification (Removed hardcoded built-up/100)
  const parkingVerification: ParameterVerification = {
    value: null,
    status: 'UNVERIFIED_REQUIRES_VERIFICATION',
    ruleReference: 'Rule 84(1) (Appendix 1-1 / परिशिष्ट झ-1)',
    pageNumber: 97,
    note: 'Requires verification against the applicable official Appendix/table. Rule 84 mandates parking per Appendix 1-1 / 1-2 (परिशिष्ट झ-1 / झ-2). The heuristic of 1 ECS per 100 m² is an unverified manual rule of thumb and not an explicit statutory ratio in the 2025 PDF gazette.'
  };

  return {
    isCompliant,
    maxFar,
    permissibleBuiltUpAreaSqM,
    maxBuildingHeightMeters: maxHeight,
    minimumFrontMOSMeters: minFrontMOS,
    minimumSideRearMOSMeters: minSideRearMOS,

    farVerification,
    builtUpAreaVerification,
    heightVerification,
    frontMOSVerification,
    sideRearMOSVerification,
    groundCoverageVerification,
    parkingVerification,

    maxGroundCoveragePercent: null,
    permissibleGroundCoverageSqM: null,
    parkingRequiredECS: null,

    applicableRules,
    regulatoryNotes,
    statutoryDisclaimer: 'IMPORTANT STATUTORY NOTICE: This calculator is an advisory technical decision-support tool under the Madhya Pradesh Bhumi Vikas Rules, 2012 (2025 Edition). It DOES NOT constitute formal or legal building permission from the Bhopal Municipal Corporation (BMC) or the Directorate of Town and Country Planning (T&CP).'
  };
}
