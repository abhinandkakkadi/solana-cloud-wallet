const WalletService = require('../services/walletService');

class WalletController {
  static async getWallets(req, res, next) {
    try {
      const wallets = await WalletService.getUserWallets(req.user.userId);
      
      res.json({
        data: wallets,
      });
    } catch (error) {
      next(error);
    }
  }

  static async createWallet(req, res, next) {
    try {
      const { chain } = req.body;
      const result = await WalletService.createWallet(req.user.userId, chain);

      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  static async createTransaction(req, res, next) {
    try {
      const { uid, amount } = req.body;

      if (!uid || !amount) {
        return res.status(400).json({ error: "invalid_request" });
      }

      // TODO: Implement transaction creation logic
      // const transactionId = await TransactionService.create(uid, amount);

      res.json({
        message: "Transaction created successfully",
        // transactionId,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = WalletController;