const express = require("express");
const cors = require("cors");
const config = require('./config');
const { errorHandler } = require('./middleware/errorHandler');
const pool = require('./config/database');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const walletRoutes = require('./routes/walletRoutes');

const app = express();

app.use(cors(config.CORS_OPTIONS));
app.options("*", cors(config.CORS_OPTIONS));
app.use(express.json());

app.use('/api', authRoutes);
app.use('/api', userRoutes);
app.use('/api', walletRoutes);

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