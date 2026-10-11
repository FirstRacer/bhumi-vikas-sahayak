import path from 'path';
import fs from 'fs';

/**
 * Returns the absolute path to the data directory.
 * Works reliably in both:
 * 1. tsx development mode: __dirname is server/src
 * 2. compiled production mode: __dirname is server/dist
 * 3. when executed from root or server cwd
 */
export function getDataDirectory(): string {
  // Check candidate paths in order of likelihood
  const candidates = [
    path.resolve(process.cwd(), 'data'),
    path.resolve(__dirname, '../../data'),
    path.resolve(__dirname, '../data'),
    path.resolve(__dirname, '../../../data'),
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  // Fallback default
  return path.resolve(__dirname, '../../data');
}
