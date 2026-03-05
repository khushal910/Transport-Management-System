import 'dotenv/config';
import express from 'express';
import dbConnect from './src/config/dbConnection.js';
import cors from 'cors';
import authRouter from './src/routers/auth.route.js';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import vehicleRoute from './src/routers/vehicle.route.js';

const app = express();

app.use(express.json());
app.use(cors()); // For local development
app.use(cookieParser());
app.use(morgan('dev'))


// API
app.use('/api/auth', authRouter)
app.use('/api/vehicle', vehicleRoute)

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
