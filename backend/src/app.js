const express = require("express");
const cors = require("cors");
const config = require('./config');
const { errorHandler } = require('./middleware/errorHandler');
const pool = require('./config/database');

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const walletRoutes = require('./routes/walletRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

// Middleware
app.use(cors(config.CORS_OPTIONS));
app.options("*", cors(config.CORS_OPTIONS));
app.use(express.json());

// Routes
app.use('/api', authRoutes);
app.use('/api', userRoutes);
app.use('/api', walletRoutes);
app.use('/api', adminRoutes);

// Health check routes
app.get("/", (req, res) => {
  res.json({
    message: "PostgreSQL Auth server is running!",
    timestamp: new Date().toISOString(),
  });
});

app.get("/health/db", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({
      status: "healthy",
      database: "connected",
      timestamp: result.rows[0].now,
    });
  } catch (error) {
    res.status(500).json({
      status: "unhealthy",
      database: "disconnected",
      error: error.message,
    });
  }
});

// Error handler
app.use(errorHandler);

module.exports = app;