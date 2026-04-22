import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { requireRole, AuthRequest } from '../middleware/auth';
import { Role } from '@prisma/client';

const router = Router();

// Create a batch (Trainer or Institution)
router.post('/', requireRole([Role.TRAINER, Role.INSTITUTION]), async (req: AuthRequest, res: Response) => {
  const { name } = req.body;
  const dbUser = req.dbUser!;

  try {
    // If Trainer, use their institutionId. If Institution, use their own ID.
    const institutionId = dbUser.role === Role.INSTITUTION ? dbUser.id : dbUser.institutionId;

    if (!institutionId) {
      return res.status(400).json({ error: 'Trainer must be associated with an institution to create a batch' });
    }

    const batch = await prisma.batch.create({
      data: {
        name,
        institutionId,
        trainers: dbUser.role === Role.TRAINER ? {
          create: { trainerId: dbUser.id }
        } : undefined
      }
    });

    res.json(batch);
  } catch (error) {
    console.error('Batch creation error:', error);
    res.status(500).json({ error: 'Failed to create batch' });
  }
});

// Generate/Refresh invite link/code (Trainer)
router.post('/:id/invite', requireRole([Role.TRAINER]), async (req: AuthRequest, res: Response) => {
  const { id } = req.params as any;
  const dbUser = req.dbUser!;

  try {
    // Verify trainer belongs to this batch
    const batchTrainer = await prisma.batchTrainer.findUnique({
      where: {
        batchId_trainerId: {
          batchId: id,
          trainerId: dbUser.id
        }
      }
    });

    if (!batchTrainer) {
      return res.status(403).json({ error: 'Only assigned trainers can generate invite links for this batch' });
    }

    // Just return the invite code. Frontend will construct the link.
    const batch = await prisma.batch.findUnique({
      where: { id },
      select: { inviteCode: true }
    });

    res.json(batch);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Join a batch (Student)
router.post('/join', requireRole([Role.STUDENT]), async (req: AuthRequest, res: Response) => {
  const { inviteCode } = req.body;
  const dbUser = req.dbUser!;

  try {
    const batch = await prisma.batch.findUnique({
      where: { inviteCode }
    });

    if (!batch) {
      return res.status(404).json({ error: 'Invalid invite code' });
    }

    // Check if already in batch
    const existing = await prisma.batchStudent.findUnique({
      where: {
        batchId_studentId: {
          batchId: batch.id,
          studentId: dbUser.id
        }
      }
    });

    if (existing) {
      return res.status(400).json({ error: 'Already joined this batch' });
    }

    const join = await prisma.batchStudent.create({
      data: {
        batchId: batch.id,
        studentId: dbUser.id
      }
    });

    res.json({ message: 'Successfully joined batch', batchName: batch.name });
  } catch (error) {
    res.status(500).json({ error: 'Failed to join batch' });
  }
});

// Get batches for current user
router.get('/my', requireRole([Role.STUDENT, Role.TRAINER, Role.INSTITUTION]), async (req: AuthRequest, res: Response) => {
  const dbUser = req.dbUser!;

  try {
    let batches;
    if (dbUser.role === Role.STUDENT) {
      batches = await prisma.batch.findMany({
        where: { students: { some: { studentId: dbUser.id } } }
      });
    } else if (dbUser.role === Role.TRAINER) {
      batches = await prisma.batch.findMany({
        where: { trainers: { some: { trainerId: dbUser.id } } }
      });
    } else {
      batches = await prisma.batch.findMany({
        where: { institutionId: dbUser.id }
      });
    }

    res.json(batches);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch batches' });
  }
});

export default router;
