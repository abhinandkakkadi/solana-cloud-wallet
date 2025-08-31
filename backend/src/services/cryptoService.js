const crypto = require("crypto");

class CryptoService {
  static encrypt(text, secretKey) {
    try {
      const key = crypto.createHash("sha256").update(secretKey).digest();
      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);

      let encrypted = cipher.update(text, "utf8", "hex");
      encrypted += cipher.final("hex");

      const combined = Buffer.concat([iv, Buffer.from(encrypted, "hex")]);
      return combined.toString("base64");
    } catch (error) {
      console.error("Encryption error:", error);
      throw new Error("Failed to encrypt data");
    }
  }

  static decrypt(encryptedData, secretKey) {
    try {
      const key = crypto.createHash("sha256").update(secretKey).digest();
      const combined = Buffer.from(encryptedData, "base64");
      const iv = combined.slice(0, 16);
      const encrypted = combined.slice(16);

      const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);

      let decrypted = decipher.update(encrypted, null, "utf8");
      decrypted += decipher.final("utf8");

      return decrypted;
    } catch (error) {
      console.error("Decryption error:", error);
      throw new Error("Failed to decrypt data");
    }
  }

  static convertToString(data) {
    if (Buffer.isBuffer(data)) {
      return data.toString("utf8");
    }
    return data;
  }
}

module.exports = CryptoService;