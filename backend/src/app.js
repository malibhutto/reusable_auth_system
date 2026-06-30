import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import errorHandler from './middleware/errorMiddleware.js';

dotenv.config();

const app = express();

// Security HTTP headers
app.use(helmet());

// CORS configuration (allow cookies/credentials from the frontend URL)
const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
app.use(
  cors({
    origin: clientUrl,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cookie parser for secure HttpOnly cookie storage
app.use(cookieParser());

// Base health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date() });
});

// Auth Routes mounting
app.use('/api/auth', authRoutes);

// Fallback Route handler for 404s
app.use((req, res, next) => {
  const error = new Error(`Cannot find requested route ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
});

// Centralized error handling
app.use(errorHandler);

export default app;
