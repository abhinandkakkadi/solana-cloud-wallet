const app = require('./src/app');
const { PORT } = require('./src/config');
const pool = require('./src/config/database');

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("Shutting down gracefully...");
  await pool.end();
  process.exit(0);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log("Available routes:");
  console.log("POST /api/signup - Create account");
  console.log("POST /api/signin - Login");
  console.log("GET /api/profile - Get user profile (protected)");
  console.log("GET /api/dashboard - User dashboard (protected)");
  console.log("PUT /api/profile - Update profile (protected)");
  console.log("GET /api/wallet - Get wallets (protected)");
  console.log("POST /api/wallet/create - Create wallet (protected)");
  console.log("POST /api/transaction/create - Create transaction (protected)");
  console.log("GET /api/admin/users - List users (admin only)");
  console.log("GET /health/db - Database health check");
});