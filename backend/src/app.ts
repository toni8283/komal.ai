import express, { Express } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import healthRoutes from './routes/health.routes.js';
import therapistRoutes from './routes/therapist.routes.js';
import voiceRoutes from './routes/voice.routes.js';
import { errorHandler } from './middleware/error.middleware.js';

dotenv.config();

const app: Express = express();

// Allowed CORS origins
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.FRONTEND_URL
].filter(Boolean) as string[];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Routes
app.use('/health', healthRoutes);
app.use('/api/therapists', therapistRoutes);
app.use('/api/voice', voiceRoutes);

// Central error handler
app.use(errorHandler);

export default app;

