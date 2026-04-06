import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { usersDb, Role } from '../db';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_for_testing';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: Role;
    status: string;
  };
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET) as any;
    req.user = payload;
    
    // Check if user still exists and is active
    const user = usersDb.get(payload.id);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized: User not found' });
    }
    if (user.status !== 'ACTIVE') {
      return res.status(403).json({ error: 'Forbidden: Account is inactive' });
    }
    
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};

export const requireRole = (roles: Role[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden: Insufficient role permissions' });
    }
    next();
  };
};
