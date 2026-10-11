import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';
dotenv.config();

let anthropicClient: Anthropic | null = null;

export function getClaudeModelName(): string {
  return process.env.ANTHROPIC_MODEL || 'claude-sonnet-5';
}

export function getAnthropicClient(): Anthropic | null {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey || apiKey.trim() === '' || apiKey === 'YOUR_ANTHROPIC_API_KEY') {
    return null;
  }
  if (!anthropicClient) {
    anthropicClient = new Anthropic({
      apiKey: apiKey.trim(),
    });
  }
  return anthropicClient;
}

export function isAnthropicConfigured(): boolean {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  return Boolean(apiKey && apiKey.trim() !== '' && apiKey !== 'YOUR_ANTHROPIC_API_KEY');
}
