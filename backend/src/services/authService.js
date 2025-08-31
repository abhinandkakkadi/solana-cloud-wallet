const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require('../models/User');
const { JWT_SECRET } = require('../config');

class AuthService {
  static async signup(email, password) {
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      throw new Error('User already exists');
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const newUser = await User.create(email, hashedPassword);

    const token = this.generateToken(newUser.id, newUser.email);
    
    return {
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        createdAt: newUser.created_at,
      }
    };
  }

  static async signin(email, password) {
    const user = await User.findByEmail(email);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    const token = this.generateToken(user.id, user.email);
    
    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        createdAt: user.created_at,
      }
    };
  }

  static generateToken(userId, email) {
    return jwt.sign(
      { userId, email },
      JWT_SECRET,
      { expiresIn: "24h" }
    );
  }
}

module.exports = AuthService;