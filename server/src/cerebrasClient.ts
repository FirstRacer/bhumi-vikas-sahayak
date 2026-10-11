import Cerebras from '@cerebras/cerebras_cloud_sdk';
import dotenv from 'dotenv';
dotenv.config();

let cerebrasClient: Cerebras | null = null;

export function getCerebrasClient(): Cerebras | null {
  const apiKey = process.env.CEREBRAS_API_KEY;
  if (!apiKey || apiKey.trim() === '' || apiKey === 'YOUR_CEREBRAS_API_KEY') {
    return null;
  }
  if (!cerebrasClient) {
    cerebrasClient = new Cerebras({
      apiKey: apiKey.trim(),
    });
  }
  return cerebrasClient;
}

export function isCerebrasConfigured(): boolean {
  const apiKey = process.env.CEREBRAS_API_KEY;
  return Boolean(apiKey && apiKey.trim() !== '' && apiKey !== 'YOUR_CEREBRAS_API_KEY');
}
