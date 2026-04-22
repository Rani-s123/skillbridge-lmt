import { Router } from 'express';
import prisma from '../lib/prisma';
import { Role } from '@prisma/client';
import { ClerkExpressWithAuth } from '@clerk/clerk-sdk-node';
import { AuthRequest } from '../middleware/auth';

const router = Router();

// Publicly sync user after Clerk signup/login
router.post('/sync', ClerkExpressWithAuth() as any, async (req: AuthRequest, res) => {
  const { name, role, institutionId } = req.body;
  const clerkUserId = req.auth?.userId;

  if (!clerkUserId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const user = await prisma.user.upsert({
      where: { clerkUserId },
      update: {
        name,
        // Role should probably not be updated via sync if already set
      },
      create: {
        clerkUserId,
        name,
        role: role as Role,
        institutionId: institutionId || null,
      },
    });

    res.json(user);
  } catch (error) {
    console.error('User sync error:', error);
    res.status(500).json({ error: 'Failed to sync user' });
  }
});

// Get current user profile
router.get('/profile', ClerkExpressWithAuth() as any, async (req: AuthRequest, res) => {
  const clerkUserId = req.auth?.userId;

  if (!clerkUserId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { clerkUserId },
      include: {
        institution: true,
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
