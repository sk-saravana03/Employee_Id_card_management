import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import './models/index.js';
import { requestLogger } from './middleware/requestLogger.middleware.js';
import authRoutes from './routes/auth.routes.js';
import employeeRoutes from './routes/employee.routes.js';
import branchRoutes from './routes/branch.routes.js';
import departmentRoutes from './routes/department.routes.js';
import userRoutes from './routes/user.routes.js';
import idCardRoutes from './routes/idCard.routes.js';
import printRoutes from './routes/print.routes.js';
import visitorRoutes from './routes/visitor.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import attendanceRoutes from './routes/attendance.routes.js';
import documentRoutes from './routes/document.routes.js';

const app = express();

// Security HTTP Headers
app.use(helmet());

// CORS Configuration
const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:5173',
  'http://127.0.0.1:5173',
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, true); // Dev flexible fallback
      }
    },
    credentials: true,
  })
);

// Body Parsing & Cookie Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Request Logging — logs method, URL, status code & response time for every API call
app.use(requestLogger);

// Detailed morgan dev logger (optional, only in development)
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    system: 'Enterprise Employee ID Card Management System API',
    timestamp: new Date(),
  });
});

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/employees', employeeRoutes);
app.use('/api/v1/branches', branchRoutes);
app.use('/api/v1/departments', departmentRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/id-cards', idCardRoutes);
app.use('/api/v1/print', printRoutes);
app.use('/api/v1/visitors', visitorRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/attendance', attendanceRoutes);
app.use('/api/v1/documents', documentRoutes);

// Centralized 404 Route Handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Resource not found: ${req.originalUrl}`,
  });
});

// Centralized Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Global Server Error]:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

export default app;
