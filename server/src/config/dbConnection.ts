import mongoose, { Connection } from 'mongoose';
import runtimeConfig from './runtime';

type DatabaseStatus = 'connected' | 'connecting' | 'disconnected' | 'disconnecting';

const mapReadyStateToStatus = (readyState: number): DatabaseStatus => {
  if (readyState === 1) {
    return 'connected';
  }

  if (readyState === 2) {
    return 'connecting';
  }

  if (readyState === 3) {
    return 'disconnecting';
  }

  return 'disconnected';
};

export const getDatabaseStatus = (): DatabaseStatus => {
  return mapReadyStateToStatus(mongoose.connection.readyState);
};

export const isDatabaseConnected = (): boolean => {
  return mongoose.connection.readyState === 1;
};

const attachConnectionListeners = (connection: Connection) => {
  connection.on('connected', () => {
    console.info('MongoDB connected');
  });

  connection.on('disconnected', () => {
    console.warn('MongoDB disconnected');
  });

  connection.on('error', (error: Error) => {
    console.error('MongoDB connection error:', error.message);
  });
};

let listenersAttached = false;

/**
 * Database connection utility
 * Initializes MongoDB connection using Mongoose
 */
const dbConnect = async (): Promise<boolean> => {
  const mongoUri = runtimeConfig.mongoUri;

  if (!listenersAttached) {
    attachConnectionListeners(mongoose.connection);
    listenersAttached = true;
  }

  if (!mongoUri) {
    const message = 'MONGO_URI environment variable is not defined';
    if (runtimeConfig.isProduction) {
      throw new Error(message);
    }

    console.warn(`${message}. Server will run in development without database access.`);
    return false;
  }

  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: runtimeConfig.isProduction ? 15000 : 5000,
      connectTimeoutMS: runtimeConfig.isProduction ? 15000 : 5000,
    });
    return true;
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown database connection error';
    if (runtimeConfig.isProduction) {
      throw new Error(message);
    }

    console.error('Mongoose connection error:', message);
    console.warn('Server will continue running in development mode with database-dependent routes returning 503.');
    return false;
  }
};

export default dbConnect;
