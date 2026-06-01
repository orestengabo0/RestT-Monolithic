import { Request, Response, NextFunction } from 'express';
import { JwtService, JwtPayload } from '../../config/jwt';
import { UnauthorizedError } from '../errors';

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('No token provided');
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const payload = JwtService.verifyAccessToken(token);

    // Attach user to request
    req.user = payload;

    next();
  } catch (error) {
    next(error);
  }
};
