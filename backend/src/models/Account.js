const pool = require('../config/database');

class Account {
  static async findByUserId(userId) {
    const query = "SELECT account_index, mnemonic FROM accounts WHERE user_id = $1";
    const result = await pool.query(query, [userId]);
    return result.rows;
  }

  static async create(userId, encryptedMnemonic) {
    const query = `
      INSERT INTO accounts (user_id, account_index, mnemonic) 
      VALUES ($1, $2, $3)
      RETURNING account_index, mnemonic
    `;
    const result = await pool.query(query, [userId, 0, encryptedMnemonic]);
    return result;
  }

  static async incrementAccountIndex(userId) {
    const query = "UPDATE accounts SET account_index = account_index + 1 WHERE user_id = $1";
    await pool.query(query, [userId]);
  }
}

module.exports = Account;