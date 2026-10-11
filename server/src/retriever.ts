import fs from 'fs';
import path from 'path';

export interface VerifiedRule {
  id: string;
  ruleNumber: string;
  title: string;
  part: string;
  pageNumber: number;
  content: string;
  sourceDoc: string;
  keywords: string[];
}

export interface RetrievalResult {
  rule: VerifiedRule;
  score: number;
  snippet: string;
}

import { getDataDirectory } from './dataPaths';

let cachedRules: VerifiedRule[] | null = null;

export function loadRules(): VerifiedRule[] {
  if (cachedRules) return cachedRules;
  const filePath = path.join(getDataDirectory(), 'indexed/rules_english.json');
  if (fs.existsSync(filePath)) {
    const raw = fs.readFileSync(filePath, 'utf-8');
    cachedRules = JSON.parse(raw);
    return cachedRules!;
  }
  return [];
}

/**
 * Searches the verified rules using exact token matching, rule number extraction, and keyword relevance.
 */
export function searchRules(query: string, maxResults = 5): RetrievalResult[] {
  const rules = loadRules();
  const lowerQuery = query.toLowerCase();

  // Check if a specific rule number was mentioned, e.g. "Rule 42", "Rule 21", "Table 4", "नियम 21", "तालिका 4"
  const ruleMatch = lowerQuery.match(/(?:rule|table|नियम|तालिका)\s*(\d+[a-z]?)/i);
  const targetNumber = ruleMatch ? ruleMatch[1].toLowerCase() : null;

  const queryTokens = lowerQuery
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(t => t.length > 2);

  const scored: RetrievalResult[] = [];

  for (const r of rules) {
    let score = 0;
    const rNumLower = r.ruleNumber.toLowerCase();
    const titleLower = r.title.toLowerCase();
    const contentLower = r.content.toLowerCase();

    // Exact rule number boost
    if (targetNumber && rNumLower.includes(targetNumber)) {
      score += 50;
    }

    // Direct phrase matching
    if (contentLower.includes(lowerQuery)) {
      score += 25;
    }

    if (titleLower.includes(lowerQuery)) {
      score += 35;
    }

    // Token frequency
    for (const token of queryTokens) {
      if (titleLower.includes(token)) score += 8;
      if (rNumLower.includes(token)) score += 10;
      if (r.keywords && r.keywords.some(k => k.includes(token))) score += 4;
      const count = (contentLower.match(new RegExp('\\b' + token + '\\b', 'g')) || []).length;
      score += Math.min(count * 2, 20);
    }

    if (score > 0) {
      // Create a focused 250 character snippet
      let snippetIndex = 0;
      if (queryTokens.length > 0) {
        for (const token of queryTokens) {
          const idx = contentLower.indexOf(token);
          if (idx !== -1) {
            snippetIndex = Math.max(0, idx - 40);
            break;
          }
        }
      }
      const snippet = r.content.slice(snippetIndex, snippetIndex + 300).trim() + '...';

      scored.push({
        rule: r,
        score,
        snippet
      });
    }
  }

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, maxResults);
}
