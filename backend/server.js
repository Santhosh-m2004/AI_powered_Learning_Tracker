import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Routes
import authRoutes from './routes/authRoutes.js';
import learningRoutes from './routes/learningRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import planRoutes from './routes/planRoutes.js';
import noteRoutes from './routes/noteRoutes.js';
import adminRoutes from './routes/adminRoutes.js'
// Middleware
import errorHandler from './middleware/errorMiddleware.js';

// DB
import connectDB from './config/db.js';

dotenv.config();

console.log("server.js loaded");

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

/* -------------------- MIDDLEWARE -------------------- */
app.use(helmet());
app.use(morgan('dev'));

app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* -------------------- ROUTES -------------------- */
app.use('/api/auth', authRoutes);
app.use('/api/learning', learningRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/plans', planRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/admin', adminRoutes);

/* -------------------- ERROR HANDLER -------------------- */
app.use(errorHandler);

/* -------------------- SERVER START -------------------- */
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    console.log("Connecting to MongoDB...");
    await connectDB(); // ✅ wait for DB

    app.listen(PORT, () => {
      console.log(
        `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`
      );
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
  }
};

startServer();
