const { Keypair } = require("@solana/web3.js");
const bip39 = require("bip39");
const { derivePath } = require("ed25519-hd-key");
const Account = require("../models/Account");
const Wallet = require("../models/Wallet");
const CryptoService = require("./cryptoService");
const { ENCRYPTION_KEY, SOLANA_RPC_URL } = require("../config");
const {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
  sendAndConfirmTransaction,
} = require("@solana/web3.js");

class WalletService {
  static async getOrCreateAccount(userId) {
    let accounts = await Account.findByUserId(userId);

    if (accounts.length === 0) {
      const seed = this.createSeedPhrase();
      const encodedSeed = seed.toString("base64");
      const encryptedMnemonic = CryptoService.encrypt(
        encodedSeed,
        ENCRYPTION_KEY
      );

      const account = await Account.create(userId, encryptedMnemonic);
      accounts = account.rows;
    }

    return accounts[0];
  }

  static async getUserWallets(userId) {
    const account = await this.getOrCreateAccount(userId);
    const decryptedMnemonic = CryptoService.decrypt(
      account.mnemonic,
      ENCRYPTION_KEY
    );
    const encodedSeed = CryptoService.convertToString(decryptedMnemonic);
    const seed = Buffer.from(encodedSeed, "base64");

    const wallets = await Wallet.findByUserId(userId);
    const customerWallets = [];

    for (const wallet of wallets) {
      const keyPair = this.deriveWallet(seed, wallet.account_index);
      customerWallets.push({
        publicKey: keyPair.publicKey.toString(),
        uid: wallet.uid,
      });
    }

    return customerWallets;
  }

  static async createWallet(userId, chain) {
    if (!chain) {
      throw new Error("Chain is required");
    }

    const account = await this.getOrCreateAccount(userId);
    const decryptedMnemonic = CryptoService.decrypt(
      account.mnemonic,
      ENCRYPTION_KEY
    );
    const encodedSeed = CryptoService.convertToString(decryptedMnemonic);
    const seed = Buffer.from(encodedSeed, "base64");

    const newIndex = account.account_index + 1;
    const keyPair = this.deriveWallet(seed, newIndex);

    await Wallet.create(userId, newIndex, chain);
    await Account.incrementAccountIndex(userId);

    return {
      data: {
        publicKey: keyPair.publicKey.toString(),
        message: `Public Key generated successfully for chain ${chain}`,
      },
    };
  }

  static async sendTransaction(userId, walletUid, amount, dstAddress) {
    try {
      if (!walletUid) {
        throw new Error("Chain is required");
      }

      const wallet = await Wallet.findByUid(walletUid);

      const account = await this.getOrCreateAccount(userId);
      const decryptedMnemonic = CryptoService.decrypt(
        account.mnemonic,
        ENCRYPTION_KEY
      );
      const encodedSeed = CryptoService.convertToString(decryptedMnemonic);
      const seed = Buffer.from(encodedSeed, "base64");
      const keyPair = this.deriveWallet(seed, wallet.account_index);

      const connection = new Connection(SOLANA_RPC_URL, "confirmed");
      const lamports = Number(amount) * LAMPORTS_PER_SOL;

      const transferInstruction = SystemProgram.transfer({
        fromPubkey: keyPair.publicKey,
        toPubkey: new PublicKey(dstAddress),
        lamports,
      });

      const { blockhash } = await connection.getRecentBlockhash();

      const transaction = new Transaction({
        recentBlockhash: blockhash,
        feePayer: keyPair.publicKey,
      }).add(transferInstruction);

      transaction.sign(keyPair);

      const signature = await sendAndConfirmTransaction(
        connection,
        transaction,
        [keyPair],
        {
          commitment: "confirmed",
          preflightCommitment: "confirmed",
        }
      );

      return {
        hash: signature,
      };
    } catch (error) {
      throw new Error("Transaction failed: " + error.message);
    }
  }

  static createSeedPhrase() {
    const mnemonic = bip39.generateMnemonic();
    return bip39.mnemonicToSeedSync(mnemonic);
  }

  static deriveWallet(seed, index = 0) {
    const derivedSeed = derivePath(
      `m/44'/501'/${index}'/0'`,
      seed.toString("hex")
    ).key;
    const keypair = Keypair.fromSeed(derivedSeed);
    return keypair;
  }
}

module.exports = WalletService;
