import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { requireRole, AuthRequest } from '../middleware/auth';
import { Role, AttendanceStatus } from '@prisma/client';

const router = Router();

// Mark attendance (Student)
router.post('/mark', requireRole([Role.STUDENT]), async (req: AuthRequest, res: Response) => {
  const { sessionId, status } = req.body;
  const dbUser = req.dbUser!;

  try {
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        batch: {
          include: { students: { where: { studentId: dbUser.id } } }
        }
      }
    });

    if (!session) return res.status(404).json({ error: 'Session not found' });
    if (session.batch.students.length === 0) {
      return res.status(403).json({ error: 'You are not enrolled in this batch' });
    }

    const attendance = await prisma.attendance.upsert({
      where: {
        sessionId_studentId: { sessionId, studentId: dbUser.id }
      },
      update: { status: status as AttendanceStatus },
      create: {
        sessionId,
        studentId: dbUser.id,
        status: status as AttendanceStatus
      }
    });

    res.json(attendance);
  } catch (error) {
    res.status(500).json({ error: 'Failed to mark attendance' });
  }
});

// Batch summary (Institution)
router.get('/batch/:id/summary', requireRole([Role.INSTITUTION]), async (req: AuthRequest, res: Response) => {
  const { id } = req.params as any;
  const dbUser = req.dbUser!;

  try {
    const batch = await prisma.batch.findUnique({
      where: { id },
      include: {
        sessions: {
          include: {
            attendance: true
          }
        },
        students: true
      }
    });

    if (!batch) return res.status(404).json({ error: 'Batch not found' });
    if (batch.institutionId !== dbUser.id) return res.status(403).json({ error: 'Not your institution' });

    const totalStudents = batch.students.length;
    const totalSessions = batch.sessions.length;
    const totalPossibleAttendances = totalStudents * totalSessions;
    const actualPresent = batch.sessions.reduce((acc: number, sess: any) => 
      acc + sess.attendance.filter((a: any) => a.status === AttendanceStatus.PRESENT || a.status === AttendanceStatus.LATE).length, 0
    );

    const attendanceRate = totalPossibleAttendances > 0 ? (actualPresent / totalPossibleAttendances) * 100 : 0;

    res.json({
      batchName: batch.name,
      totalStudents,
      totalSessions,
      attendanceRate: attendanceRate.toFixed(2)
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Institution summary (Programme Manager)
router.get('/institution/:id/summary', requireRole([Role.PROGRAMME_MANAGER]), async (req: AuthRequest, res: Response) => {
  const { id } = req.params as any;

  try {
    const batches = await prisma.batch.findMany({
      where: { institutionId: id },
      include: {
        sessions: { include: { attendance: true } },
        students: true
      }
    });

    const stats = batches.map((batch: any) => {
      const totalStudents = batch.students.length;
      const totalPossible = totalStudents * batch.sessions.length;
      const present = batch.sessions.reduce((acc: number, s: any) => acc + s.attendance.filter((a: any) => a.status !== AttendanceStatus.ABSENT).length, 0);
      return {
        batchName: batch.name,
        attendanceRate: totalPossible > 0 ? (present / totalPossible) * 100 : 0
      };
    });

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Programme-wide summary (PM and Monitoring Officer)
router.get('/programme/summary', requireRole([Role.PROGRAMME_MANAGER, Role.MONITORING_OFFICER]), async (req: AuthRequest, res: Response) => {
  try {
    const allSessions = await prisma.session.findMany({
      include: { attendance: true, batch: true }
    });

    const totalAttendanceMarked = allSessions.reduce((acc: number, s: any) => acc + s.attendance.length, 0);
    const presentCount = allSessions.reduce((acc: number, s: any) => acc + s.attendance.filter((a: any) => a.status !== AttendanceStatus.ABSENT).length, 0);

    const overallRate = totalAttendanceMarked > 0 ? (presentCount / totalAttendanceMarked) * 100 : 0;

    res.json({
      overallRate: overallRate.toFixed(2),
      totalSessions: allSessions.length,
      activeBatches: new Set(allSessions.map(s => s.batchId)).size
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
