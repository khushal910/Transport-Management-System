import 'dotenv/config';
import express from 'express';
import dbConnect from './src/config/dbConnection.js';
import cors from 'cors';

const app = express();

app.use(express.json());
app.use(cors()); // For local development

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
