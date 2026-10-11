import { searchRules, VerifiedRule } from './retriever';

export interface VerificationAuditResult {
  statementTested: string;
  verdict: 'VERIFIED_FACTUAL' | 'INSUFFICIENT_EVIDENCE' | 'CONFLICT_DETECTED';
  confidenceScore: number; // 0 to 100
  supportingRules: {
    ruleNumber: string;
    pageNumber: number;
    title: string;
    exactExcerpt: string;
  }[];
  flaggedGaps: string[];
  explanation: string;
}

export function auditAnswer(statement: string): VerificationAuditResult {
  const matches = searchRules(statement, 3);

  if (matches.length === 0 || matches[0].score < 15) {
    return {
      statementTested: statement,
      verdict: 'INSUFFICIENT_EVIDENCE',
      confidenceScore: 10,
      supportingRules: [],
      flaggedGaps: [
        'No matching statutory provision found in the Madhya Pradesh Bhumi Vikas Rules, 2012 (2025 Edition).',
        'Cannot verify claim without an official Gazette notification or specific rule number reference.'
      ],
      explanation: 'Evidence is insufficient: The statement cannot be substantiated against official regulatory text in the database. Needs human review before relying on this claim.'
    };
  }

  const top = matches[0];
  const supportingRules = matches.map(m => ({
    ruleNumber: m.rule.ruleNumber,
    pageNumber: m.rule.pageNumber,
    title: m.rule.title,
    exactExcerpt: m.snippet
  }));

  const lowerStatement = statement.toLowerCase();
  const lowerContent = top.rule.content.toLowerCase();

  // Check for potential conflict: e.g. claiming a number that contradicts statutory number
  const numbersInStatement = statement.match(/\b\d+(\.\d+)?\b/g);
  let conflictFound = false;
  let flaggedGaps: string[] = [];

  if (numbersInStatement && numbersInStatement.length > 0) {
    const numbersMissingInText = numbersInStatement.filter(n => !lowerContent.includes(n));
    if (numbersMissingInText.length > 0 && numbersInStatement.length >= 2) {
      conflictFound = true;
      flaggedGaps.push(`Figures [${numbersMissingInText.join(', ')}] in statement could not be corroborated in ${top.rule.ruleNumber}.`);
    }
  }

  if (conflictFound) {
    return {
      statementTested: statement,
      verdict: 'CONFLICT_DETECTED',
      confidenceScore: 45,
      supportingRules,
      flaggedGaps,
      explanation: `Potential conflict or numerical divergence identified in statement when compared against ${top.rule.ruleNumber} (Page ${top.rule.pageNumber}). Requires human verification.`
    };
  }

  return {
    statementTested: statement,
    verdict: 'VERIFIED_FACTUAL',
    confidenceScore: Math.min(Math.round(top.score * 1.8), 98),
    supportingRules,
    flaggedGaps: [],
    explanation: `Corroborated by ${top.rule.ruleNumber} ("${top.rule.title}", Page ${top.rule.pageNumber}) of the official Madhya Pradesh Bhumi Vikas Rules, 2012.`
  };
}
