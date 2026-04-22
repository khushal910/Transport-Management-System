import 'dotenv/config';
import compression from 'compression';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import express, { NextFunction, Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import morgan from 'morgan';
import dbConnect, { getDatabaseStatus, isDatabaseConnected } from './src/config/dbConnection';
import runtimeConfig from './src/config/runtime';
import analyticsRouter from './src/routers/analytics.route';
import authRouter from './src/routers/auth.route';
import dashboardRouter from './src/routers/dashboard.route';
import driverRouter from './src/routers/driver.route';
import driverStatusRouter from './src/routers/driverStatus.route';
import expenseRouter from './src/routers/expense.route';
import gpsRouter from './src/routers/gps.route';
import maintenanceRouter from './src/routers/maintenance.route';
import safetyRouter from './src/routers/safety.route';
import tripRouter from './src/routers/trip.route';
import vehicleRoute from './src/routers/vehicle.route';

const app = express();

app.disable('x-powered-by');

if (runtimeConfig.isProduction) {
  app.set('trust proxy', 1);
}

const allowedOrigins = new Set(runtimeConfig.corsOrigins);

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.has(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error('Origin not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(
  helmet({
    crossOriginResourcePolicy: false,
  }),
);
app.use(compression());

const apiRateLimiter = rateLimit({
  windowMs: runtimeConfig.rateLimitWindowMs,
  max: runtimeConfig.rateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests. Please try again shortly.',
  },
});

app.use('/api', apiRateLimiter);
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan(runtimeConfig.isProduction ? 'combined' : 'dev'));

app.get('/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is healthy',
    environment: runtimeConfig.nodeEnv,
    database: {
      status: getDatabaseStatus(),
      connected: isDatabaseConnected(),
    },
    timestamp: new Date().toISOString(),
  });
});

const requireDatabaseConnection = (req: Request, res: Response, next: NextFunction) => {
  if (isDatabaseConnected()) {
    next();
    return;
  }

  res.status(503).json({
    success: false,
    message:
      'Database is unavailable. Ensure your MongoDB Atlas IP whitelist and MONGO_URI are configured, then retry.',
    database: {
      status: getDatabaseStatus(),
    },
  });
};

// API
app.use('/api/auth', requireDatabaseConnection, authRouter);
app.use('/api/vehicle', requireDatabaseConnection, vehicleRoute);
app.use('/api/trip', requireDatabaseConnection, tripRouter);
app.use('/api/maintenance', requireDatabaseConnection, maintenanceRouter);
app.use('/api/expense', requireDatabaseConnection, expenseRouter);
app.use('/api/driver', requireDatabaseConnection, driverRouter);
app.use('/api/driver-status', requireDatabaseConnection, driverStatusRouter);
app.use('/api/analytics', requireDatabaseConnection, analyticsRouter);
app.use('/api/dashboard', requireDatabaseConnection, dashboardRouter);
app.use('/api/safety', requireDatabaseConnection, safetyRouter);
app.use('/api/gps', requireDatabaseConnection, gpsRouter);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled server error:', err.message);
  if (!runtimeConfig.isProduction && err.stack) {
    console.error(err.stack);
  }

  res.status(500).json({
    success: false,
    message: 'Internal server error',
  });
});

const port = runtimeConfig.port;
let httpServer: ReturnType<typeof app.listen> | null = null;

const shutdown = (signal: string) => {
  if (!httpServer) {
    process.exit(0);
    return;
  }

  httpServer.close((error?: Error) => {
    if (error) {
      console.error('Error while shutting down server:', error.message);
      process.exit(1);
      return;
    }

    process.exit(0);
  });
};

const startServer = async () => {
  let isDbReady = false;

  try {
    isDbReady = await dbConnect();

    if (!isDbReady && !runtimeConfig.isProduction) {
      console.warn('Starting server in development with database unavailable (degraded mode).');
    }

    if (!isDbReady && runtimeConfig.isProduction) {
      console.error('Database is unavailable in production. Aborting startup.');
      process.exit(1);
      return;
    }

    httpServer = app.listen(port, () => {
      // Server listening
    });

    httpServer.on('error', (error: NodeJS.ErrnoException) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`Port ${port} is already in use. Please stop the process using this port or set PORT to a different value.`);
        process.exit(1);
      }
      console.error('Server error:', error);
      process.exit(1);
    });
  } catch (error) {
    console.error('Failed to connect to database:', error);
    process.exit(1);
  }
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

startServer();
