const pool = require('../config/database');

class Wallet {
  static async findByUserId(userId) {
    const query = "SELECT account_index, uid FROM wallets WHERE user_id = $1";
    const result = await pool.query(query, [userId]);
    return result.rows;
  }

  static async findByUid(uid) {
    const query = "SELECT * FROM wallets WHERE uid = $1";
    const result = await pool.query(query, [uid]);
    return result.rows[0];
  }

  static async create(userId, index, chain) {
    const query = `
      INSERT INTO wallets (user_id, account_index, chain, uid, created_at, updated_at) 
      VALUES ($1, $2, $3, uuid_generate_v4(), NOW(), NOW())
    `;
    await pool.query(query, [userId, index, chain]);
  }
}

module.exports = Wallet;