import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { Role } from '@prisma/client';

export interface AuthRequest extends Request {
  auth?: {
    userId: string;
  };
  dbUser?: {
    id: string;
    role: Role;
    institutionId: string | null;
  };
}

export const requireRole = (roles: Role[]) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    const clerkUserId = req.auth?.userId;

    if (!clerkUserId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      const user = await prisma.user.findUnique({
        where: { clerkUserId },
      });

      if (!user) {
        return res.status(404).json({ error: 'User record not found in database' });
      }

      if (!roles.includes(user.role)) {
        return res.status(403).json({ error: 'Forbidden: Insufficient privileges' });
      }

      req.dbUser = {
        id: user.id,
        role: user.role,
        institutionId: user.institutionId,
      };

      next();
    } catch (error) {
      console.error('Role validation error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
};
