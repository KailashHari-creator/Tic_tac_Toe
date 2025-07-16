import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import gameRoutes from './routes/gameRoutes.js';
import { setupWebSocket } from './websocket.js';
import './db.js'; // Ensure the database connection is established

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/game', gameRoutes);

const server = app.listen(process.env.PORT || 3001, () => {
  console.log(`🚀 Express server running on port ${process.env.PORT}`);
});

setupWebSocket(server);
