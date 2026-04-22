import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { requireRole, AuthRequest } from '../middleware/auth';
import { Role } from '@prisma/client';

const router = Router();

// Create a session (Trainer)
router.post('/', requireRole([Role.TRAINER]), async (req: AuthRequest, res: Response) => {
  const { title, date, startTime, endTime, batchId } = req.body;
  const dbUser = req.dbUser!;

  try {
    // Verify trainer is in this batch
    const batchTrainer = await prisma.batchTrainer.findUnique({
      where: {
        batchId_trainerId: { batchId, trainerId: dbUser.id }
      }
    });

    if (!batchTrainer) {
      return res.status(403).json({ error: 'You are not assigned to this batch' });
    }

    const session = await prisma.session.create({
      data: {
        title,
        date: new Date(date),
        startTime,
        endTime,
        batchId,
        trainerId: dbUser.id
      }
    });

    res.json(session);
  } catch (error) {
    console.error('Session creation error:', error);
    res.status(500).json({ error: 'Failed to create session' });
  }
});

// View attendance for a session (Trainer)
router.get('/:id/attendance', requireRole([Role.TRAINER]), async (req: AuthRequest, res: Response) => {
  const { id } = req.params as any;
  const dbUser = req.dbUser!;

  try {
    const session = await prisma.session.findUnique({
      where: { id },
      include: {
        attendance: {
          include: { student: true }
        },
        batch: {
          include: {
            students: {
              include: { student: true }
            }
          }
        }
      }
    });

    if (!session) return res.status(404).json({ error: 'Session not found' });
    if (session.trainerId !== dbUser.id) return res.status(403).json({ error: 'Not your session' });

    res.json(session);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get active sessions for student or trainer
router.get('/active', requireRole([Role.STUDENT, Role.TRAINER]), async (req: AuthRequest, res: Response) => {
  const dbUser = req.dbUser!;

  try {
    let sessions;
    if (dbUser.role === Role.STUDENT) {
      sessions = await prisma.session.findMany({
        where: {
          batch: {
            students: { some: { studentId: dbUser.id } }
          }
        },
        include: {
          attendance: {
            where: { studentId: dbUser.id }
          },
          trainer: true
        },
        orderBy: { date: 'desc' }
      });
    } else {
      sessions = await prisma.session.findMany({
        where: { trainerId: dbUser.id },
        orderBy: { date: 'desc' }
      });
    }

    res.json(sessions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch sessions' });
  }
});

export default router;
