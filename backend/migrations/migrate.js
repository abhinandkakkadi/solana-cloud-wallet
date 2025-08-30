const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const pool = new Pool({
  user: process.env.DB_USER || "postgres",
  host: process.env.DB_HOST || "localhost",
  database: process.env.DB_NAME || "auth_db",
  password: process.env.DB_PASSWORD || "password",
  port: process.env.DB_PORT || 5432,
});

const runMigration = async (filename, sqlContent) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Execute the migration SQL
    await client.query(sqlContent);

    await client.query("COMMIT");
    console.log(`✅ Migration ${filename} executed successfully`);
  } catch (error) {
    await client.query("ROLLBACK");
    console.error(`❌ Migration ${filename} failed:`, error.message);
    throw error;
  } finally {
    client.release();
  }
};

const runMigrations = async () => {
  try {
    console.log("🚀 Starting database migrations...");

    // Define migrations in order
    const migrations = [
      {
        filename: "001_create_users_table.sql",
        sql: `
          CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

          CREATE TABLE IF NOT EXISTS users (
              id SERIAL PRIMARY KEY,
              email VARCHAR(255) UNIQUE NOT NULL,
              password VARCHAR(255) NOT NULL,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
              updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );

          CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
          CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at)
        `,
      },
      {
        filename: "002_add_user_roles.sql",
        sql: `
          ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'user';
          ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

          CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
        `,
      },
      {
        filename: "003_create_wallets_table.sql",
        sql: `
          CREATE TABLE IF NOT EXISTS wallets (
              id SERIAL PRIMARY KEY,
              user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
              public_ddress VARCHAR(255) UNIQUE NOT NULL,
              private_key VARCHAR(255) NOT NULL,
              chain VARCHAR(100) NOT NULL,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
              updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );

          CREATE INDEX IF NOT EXISTS idx_wallets_user_id ON wallets(user_id);
          CREATE INDEX IF NOT EXISTS idx_wallets_chain ON wallets(chain);
        `,
      },
      {
        filename: "004_account.sql",
        sql: `
          CREATE TABLE IF NOT EXISTS accounts (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          account_index INTEGER NOT NULL,
          mnemonic VARCHAR(255) UNIQUE NOT NULL
          );

          CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON accounts(user_id)
        `,
      },
    ];

    // Run pending migrations
    for (const migration of migrations) {
      await runMigration(migration.filename, migration.sql);
    }

    console.log("✅ All migrations completed successfully");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
};

// CLI interface
const command = process.argv[2];

switch (command) {
  case "up":
    runMigrations();
    break;
}

module.exports = { runMigrations, rollbackMigration };
