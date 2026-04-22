import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { ClerkExpressWithAuth } from '@clerk/clerk-sdk-node';
import batchRoutes from './routes/batch.routes';
import sessionRoutes from './routes/session.routes';
import attendanceRoutes from './routes/attendance.routes';
import userRoutes from './routes/user.routes';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Public health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// User routes (some public, some protected)
app.use('/users', userRoutes);

// Protected routes (require Clerk authentication)
app.use('/batches', ClerkExpressWithAuth() as any, batchRoutes);
app.use('/sessions', ClerkExpressWithAuth() as any, sessionRoutes);
app.use('/attendance', ClerkExpressWithAuth() as any, attendanceRoutes);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
