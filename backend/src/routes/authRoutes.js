const express = require("express");
const AuthController = require('../controllers/authController');
const { validateSignup, validateSignin } = require('../middleware/validation');

const router = express.Router();

router.post("/signup", validateSignup, AuthController.signup);
router.post("/signin", validateSignin, AuthController.signin);

module.exports = router;