import 'dotenv/config';
import express from 'express';
import dbConnect from './src/config/dbConnection.js';
import cors from 'cors';
import authRouter from './src/routers/auth.route.js';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import vehicleRoute from './src/routers/vehicle.route.js';
import tripRouter from './src/routers/trip.route.js';
import maintenanceRouter from './src/routers/maintenance.route.js';
import expenseRouter from './src/routers/expense.route.js';
import driverRouter from './src/routers/driver.route.js';
import analyticsRouter from './src/routers/analytics.route.js';
import dashboardRouter from './src/routers/dashboard.route.js';

const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
})); // For local development
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
app.use('/api/analytics', analyticsRouter)
app.use('/api/dashboard', dashboardRouter)

const port = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await dbConnect();
    app.listen(port, () => {
      console.log(`Server running on http://localhost:${port}`);
    });
  } catch (error) {
    console.error('Failed to connect to database:', error);
    process.exit(1);
  }
};

startServer();
