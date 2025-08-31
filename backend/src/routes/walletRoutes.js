const express = require("express");
const WalletController = require('../controllers/walletController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.get("/wallet", authenticateToken, WalletController.getWallets);
router.post("/wallet/create", authenticateToken, WalletController.createWallet);
router.post("/transaction/create", authenticateToken, WalletController.createTransaction);

module.exports = router;