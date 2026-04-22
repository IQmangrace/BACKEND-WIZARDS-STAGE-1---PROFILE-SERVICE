dotenv.config();
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import profileRoutes from './routes/profileRoutes.js';
import connectDB from './config/database.js'; // import connectDB

//

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json());

// Routes
app.use('/api', profileRoutes);

// Health check
app.get('/', (req, res) => {
  res.json({ message: "✅ Backend Wizards Stage 1 API (ESM)" });
});

// Connect DB
connectDB();

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server on http://localhost:${PORT}`);
});