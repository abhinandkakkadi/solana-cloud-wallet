require("dotenv").config();


module.exports = {
  PORT: process.env.PORT || 3000,
  JWT_SECRET: process.env.JWT_SECRET || "your-secret-key-here",
  ENCRYPTION_KEY: process.env.SYMETRIC_SECRET_KEY || "my-secret-key-32-characters-long",
  SOLANA_RPC_URL: process.env.SOLANA_RPC_URL || "https://api.devnet.solana.com",
  CORS_OPTIONS: {
    origin: [
      "http://localhost:3000",
      "http://localhost:5173",
      "http://localhost:8080",
      "http://127.0.0.1:3000",
      "http://127.0.0.1:5173",
      "http://127.0.0.1:8080",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }
};