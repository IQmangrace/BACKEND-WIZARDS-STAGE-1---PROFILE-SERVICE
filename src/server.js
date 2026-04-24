import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import profileRoutes from './routes/profileRoutes.js';
import connectDB from './config/database.js';
import { seedDatabase } from './seed.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================
// MIDDLEWARE
// ============================================
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'DELETE'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// ============================================
// ROUTES
// ============================================
app.get('/', (req, res) => {
  res.json({
    status: 'success',
    message: '✅ Backend Wizards Stage 2 - Intelligence Query Engine',
    version: '2.0.0',
    endpoints: {
      profiles: '/api/profiles',
      search: '/api/profiles/search'
    }
  });
});

app.use('/api', profileRoutes);

// ============================================
// 404 + ERROR HANDLERS
// ============================================
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Endpoint not found'
  });
});

app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err.message);

  res.status(err.status || 500).json({
    status: 'error',
    message: err.message || 'Internal server error'
  });
});

// ============================================
// START SERVER
// ============================================
const startServer = async () => {
  try {
    await connectDB();

    // ✅ RUN SEED ONLY WHEN NEEDED
    if (process.env.RUN_SEED === "true") {
      console.log("🌱 Seeding database...");
      await seedDatabase();
      console.log("✅ Seeding done");
    }

    app.listen(PORT, () => {
      console.log(`\n🚀 Server Started`);
      console.log(`📍 Port: ${PORT}`);
      console.log(`🔗 http://localhost:${PORT}`);
    });

  } catch (error) {
    console.error('❌ Startup failed:', error.message);
    process.exit(1);
  }
};

startServer();

export default app;