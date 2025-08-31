const User = require('../models/User');
const pool = require('../config/database');

class UserController {
  static async getProfile(req, res, next) {
    try {
      const user = await User.findById(req.user.userId);

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
  }

  static async updateProfile(req, res, next) {
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

      const updatedUser = await User.updateProfile(userId, email);

      if (!updatedUser) {
        return res.status(404).json({ error: "User not found" });
      }

      await client.query("COMMIT");

      res.json({
        message: "Profile updated successfully",
        user: updatedUser,
      });
    } catch (error) {
      await client.query("ROLLBACK");
      next(error);
    } finally {
      client.release();
    }
  }

  static async getDashboard(req, res, next) {
    try {
      const user = await User.findById(req.user.userId);

      res.json({
        message: `Welcome to your dashboard, ${user.email}!`,
        userId: user.id,
        lastLogin: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = UserController;