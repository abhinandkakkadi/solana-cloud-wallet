const pool = require('../config/database');

class User {
  static async findByEmail(email) {
    const query = "SELECT * FROM users WHERE email = $1";
    const result = await pool.query(query, [email]);
    return result.rows[0];
  }

  static async findById(id) {
    const query = "SELECT * FROM users WHERE id = $1";
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async create(email, hashedPassword) {
    const query = `
      INSERT INTO users (email, password, created_at, updated_at) 
      VALUES ($1, $2, NOW(), NOW()) 
      RETURNING id, email, created_at
    `;
    const result = await pool.query(query, [email, hashedPassword]);
    return result.rows[0];
  }

  static async updateProfile(userId, email) {
    const query = `
      UPDATE users 
      SET email = COALESCE($1, email), updated_at = NOW() 
      WHERE id = $2 
      RETURNING id, email, created_at, updated_at
    `;
    const result = await pool.query(query, [email, userId]);
    return result.rows[0];
  }

  static async getAllUsers() {
    const query = `
      SELECT id, email, created_at, updated_at 
      FROM users 
      ORDER BY created_at DESC
    `;
    const result = await pool.query(query);
    return result.rows;
  }
}

module.exports = User;