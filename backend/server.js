const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Pool } = require("pg");
const cors = require("cors");
require("dotenv").config();
const { Keypair } = require("@solana/web3.js");
const bip39 = require("bip39");
const { derivePath } = require("ed25519-hd-key");
const crypto = require("crypto");
const { console } = require("inspector");

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-here";

const corsOptions = {
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
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

const pool = new Pool({
  user: process.env.DB_USER || "postgres",
  host: process.env.DB_HOST || "localhost",
  database: process.env.DB_NAME || "auth_db",
  password: process.env.DB_PASSWORD || "password",
  port: process.env.DB_PORT || 5432,
});

pool.on("connect", () => {
  console.log("Connected to PostgreSQL database");
});

pool.on("error", (err) => {
  console.error("Database connection error:", err);
});

app.use(express.json());

const findUserByEmail = async (email) => {
  const query = "SELECT * FROM users WHERE email = $1";
  const result = await pool.query(query, [email]);
  return result.rows[0];
};

const findUserById = async (id) => {
  const query = "SELECT * FROM users WHERE id = $1";
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

const createUser = async (email, hashedPassword) => {
  const query = `
    INSERT INTO users (email, password, created_at, updated_at) 
    VALUES ($1, $2, NOW(), NOW()) 
    RETURNING id, email, created_at
  `;
  const result = await pool.query(query, [email, hashedPassword]);
  return result.rows[0];
};

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Access token required" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: "Invalid or expired token" });
  }
};

const validateSignup = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      error: "Email and password are required",
    });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "Invalid email format" });
  }

  if (password.length < 6) {
    return res.status(400).json({
      error: "Password must be at least 6 characters long",
    });
  }

  next();
};

const validateSignin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      error: "Email and password are required",
    });
  }

  next();
};

const errorHandler = (err, req, res, next) => {
  console.error("Error:", err);

  if (err.code === "23505") {
    return res.status(400).json({ error: "Email already exists" });
  }

  if (err.code === "ECONNREFUSED") {
    return res.status(500).json({ error: "Database connection failed" });
  }

  res.status(500).json({ error: "Internal server error" });
};

app.post("/signup", validateSignup, async (req, res, next) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const { email, password } = req.body;

    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        error: "User already exists",
      });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = await createUser(email, hashedPassword);

    await client.query("COMMIT");

    const token = jwt.sign(
      { userId: newUser.id, email: newUser.email },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.status(201).json({
      message: "User created successfully",
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        createdAt: newUser.created_at,
      },
    });
  } catch (error) {
    await client.query("ROLLBACK");
    next(error);
  } finally {
    client.release();
  }
});

app.post("/signin", validateSignin, async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(401).json({
        error: "Invalid credentials",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        error: "Invalid credentials",
      });
    }

    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: "24h",
    });

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        email: user.email,
        createdAt: user.created_at,
      },
    });
  } catch (error) {
    next(error);
  }
});

app.get("/profile", authenticateToken, async (req, res, next) => {
  try {
    const user = await findUserById(req.user.userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
      },
    });
  } catch (error) {
    next(error);
  }
});

app.post("/wallet/create", authenticateToken, async (req, res, next) => {
  try {
    const { chain } = req.body;

    if (!chain) {
      return res.status(400).json({ error: "invalid_chain" });
    }

    const accountQuery = `
    select account_index, mnemonic FROM accounts WHERE user_id = $1
  `;

    const account = await pool.query(accountQuery, [req.user.userId]);

    let seed;
    if (account.rowCount == 0) {
      seed = createSeedPhrase();
      const encodedSeed = seed.toString("base64");
      const encryptedMnemonic = encrypt(
        encodedSeed,
        "my-secret-key-32-characters-long"
      );

      console.log("Encrypted mnemonic:", encryptedMnemonic);

      // const createAccountQuery = `
      // INSERT INTO accounts (user_id, account_index, mnemonic) VALUES ($1, $2, $3)
      // RETURNING account_index, mnenonic
      // `;

      // const account = await pool.query(createAccountQuery, [req.user.userId, 0, encryptedMnemonic]);
      // create new account
    }

    res.json({
      message: `Seed phrase, ${seed}!`,
    });

    // const publicAddress = "";
    // const privateKey = "";

    // const query = `
    //   insert into wallets (user_id, chain, public_address, private_key, created_at, updated_at)
    //   VALUES ($1, $2, $3, $4, NOW(), NOW())
    //   RETURNING id, public_address
    // `;

    // const result = await pool.query(query, [
    //   req.user.userId,
    //   chain,
    //   publicAddress,
    //   privateKey,
    // ]);
  } catch (error) {
    next(error);
  }
});

function encrypt(text, secretKey) {
  const iv = crypto.randomBytes(16);

  const cipher = crypto.createCipher("aes-256-gcm", secretKey);
  cipher.setAAD(Buffer.from("additional data", "utf8"));

  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");

  const tag = cipher.getAuthTag();

  const combined = Buffer.concat([iv, tag, Buffer.from(encrypted, "hex")]);

  return combined.toString("base64");
}

function decrypt(encryptedData, secretKey) {
  const combined = Buffer.from(encryptedData, "base64");

  const iv = combined.slice(0, 16);
  const tag = combined.slice(16, 32);
  const encrypted = combined.slice(32);

  const decipher = crypto.createDecipher("aes-256-gcm", secretKey);
  decipher.setAAD(Buffer.from("additional data", "utf8"));
  decipher.setAuthTag(tag);

  let decrypted = decipher.update(encrypted, null, "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}

function createSeedPhrase() {
  const mnemonic = bip39.generateMnemonic();
  return bip39.mnemonicToSeedSync(mnemonic);
}

function createWallet(index = 0) {
  const derivedSeed = derivePath(
    `m/44'/501'/${index}'/0'`,
    seed.toString("hex")
  ).key;
  const keypair = Keypair.fromSeed(derivedSeed);

  return { keypair, mnemonic };
}

app.get("/dashboard", authenticateToken, async (req, res, next) => {
  try {
    const user = await findUserById(req.user.userId);

    res.json({
      message: `Welcome to your dashboard, ${user.email}!`,
      userId: user.id,
      lastLogin: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
});

app.put("/profile", authenticateToken, async (req, res, next) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const { email } = req.body;
    const userId = req.user.userId;

    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: "Invalid email format" });
      }
    }

    const query = `
      UPDATE users 
      SET email = COALESCE($1, email), updated_at = NOW() 
      WHERE id = $2 
      RETURNING id, email, created_at, updated_at
    `;

    const result = await pool.query(query, [email, userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    await client.query("COMMIT");

    res.json({
      message: "Profile updated successfully",
      user: result.rows[0],
    });
  } catch (error) {
    await client.query("ROLLBACK");
    next(error);
  } finally {
    client.release();
  }
});

app.get("/admin/users", authenticateToken, async (req, res, next) => {
  try {
    const adminUser = await findUserById(req.user.userId);
    if (!adminUser.email.includes("admin")) {
      return res.status(403).json({ error: "Admin access required" });
    }

    const query = `
      SELECT id, email, created_at, updated_at 
      FROM users 
      ORDER BY created_at DESC
    `;
    const result = await pool.query(query);

    res.json({
      users: result.rows,
      total: result.rows.length,
    });
  } catch (error) {
    next(error);
  }
});

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

app.use(errorHandler);

process.on("SIGINT", async () => {
  console.log("Shutting down gracefully...");
  await pool.end();
  process.exit(0);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log("Available routes:");
  console.log("POST /signup - Create account");
  console.log("POST /signin - Login");
  console.log("GET /profile - Get user profile (protected)");
  console.log("GET /dashboard - User dashboard (protected)");
  console.log("PUT /profile - Update profile (protected)");
  console.log("GET /admin/users - List users (admin only)");
  console.log("GET /health/db - Database health check");
});

module.exports = app;
