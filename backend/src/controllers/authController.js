const AuthService = require('../services/authService');
const pool = require('../config/database');

class AuthController {
  static async signup(req, res, next) {
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      const { email, password } = req.body;
      const result = await AuthService.signup(email, password);

      await client.query("COMMIT");

      res.status(201).json({
        message: "User created successfully",
        ...result
      });
    } catch (error) {
      await client.query("ROLLBACK");
      next(error);
    } finally {
      client.release();
    }
  }

  static async signin(req, res, next) {
    try {
      const { email, password } = req.body;
      const result = await AuthService.signin(email, password);

      res.json({
        message: "Login successful",
        ...result
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AuthController;