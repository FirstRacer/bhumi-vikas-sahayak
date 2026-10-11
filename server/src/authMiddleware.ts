import { Request, Response, NextFunction } from 'express';
import { verifyAuthToken } from './authService';

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
    name: string;
  };
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      error: 'Authentication required. Please sign in to access this municipal module.',
      code: 'UNAUTHORIZED'
    });
    return;
  }

  const token = authHeader.split(' ')[1];
  const payload = verifyAuthToken(token);

  if (!payload) {
    res.status(401).json({
      error: 'Invalid or expired session token. Please sign in again.',
      code: 'TOKEN_EXPIRED_OR_INVALID'
    });
    return;
  }

  req.user = payload;
  next();
}
