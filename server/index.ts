import 'dotenv/config';
import express from 'express';
import dbConnect from './src/config/dbConnection';
import cors from 'cors';
import authRouter from './src/routers/auth.route';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import vehicleRoute from './src/routers/vehicle.route';
import tripRouter from './src/routers/trip.route';
import maintenanceRouter from './src/routers/maintenance.route';
import expenseRouter from './src/routers/expense.route';
import driverRouter from './src/routers/driver.route';
import driverStatusRouter from './src/routers/driverStatus.route';
import analyticsRouter from './src/routers/analytics.route';
import dashboardRouter from './src/routers/dashboard.route';
import safetyRouter from './src/routers/safety.route';
import gpsRouter from './src/routers/gps.route';
import { simulateActiveTripsGPS } from './src/services/gpsSimulator';

const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));// For local development
app.use(express.json());
app.use(cookieParser());
app.use(morgan('dev'))


// API
app.use('/api/auth', authRouter)
app.use('/api/vehicle', vehicleRoute)
app.use('/api/trip', tripRouter)
app.use('/api/maintenance', maintenanceRouter)
app.use('/api/expense', expenseRouter)
app.use('/api/driver', driverRouter)
app.use('/api/driver-status', driverStatusRouter)
app.use('/api/analytics', analyticsRouter)
app.use('/api/dashboard', dashboardRouter)
app.use('/api/safety', safetyRouter)
app.use('/api/gps', gpsRouter)

// Debug: Log all registered routes
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') return next();
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

const port = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await dbConnect();
    app.listen(port, () => {
      console.log(`Server running on http://localhost:${port}`);
      
      // Start GPS simulator for active trips (mock data generation)
      // Runs every 10 seconds to simulate real-time GPS updates
      setInterval(async () => {
        try {
          const updates = await simulateActiveTripsGPS();
          if (updates > 0) {
            console.log(`[GPS Simulator] Generated ${updates} GPS updates`);
          }
        } catch (error) {
          console.error('[GPS Simulator] Error:', error);
        }
      }, 10000); // Every 10 seconds
      
      console.log('[GPS Simulator] Started - will generate mock GPS data every 10 seconds');
    });
  } catch (error) {
    console.error('Failed to connect to database:', error);
    process.exit(1);
  }
};

startServer();
