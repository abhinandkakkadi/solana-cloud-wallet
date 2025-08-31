import React, { useEffect, useState } from "react";
import "./Pages.css";
import { useAuth } from "../contexts/AuthContext";

const CreateTransfer = () => {
  const { apiCall, loading } = useAuth();
  const [formData, setFormData] = useState({
    srcWalletAddress: "",
    amount: "",
    dstAddress: "",
  });
  const [wallets, setWallets] = useState([]);
  const [transactionHash, setTransactionHash] = useState("");

  useEffect(() => {
    const fetchWallet = async () => {
      try {
        const response = await apiCall("/wallet");

        if (!response.ok) {
          throw new Error(response.error || "fetch_wallet_failed");
        }

        const data = await response.json();
        setWallets(data?.data);
      } catch (error) {
        console.log(error);
      }
    };

    fetchWallet();
  }, []);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const wallet = wallets.find((wallet) => wallet.publicKey === formData.srcWalletAddress);

      const response = await apiCall("/transaction/create", {
        method: "POST",
        body: JSON.stringify({
          walletUid: wallet.uid,
          amount: formData.amount,
          dstAddress: formData.dstAddress,
        }),
      });


      if (!response.ok) {
        throw new Error(result.error || "create_wallet_failed");
      }

      setFormData({
        srcWalletAddress: "",
        amount: "",
        dstAddress: "",
      });

      const data = await response.json();
      setTransactionHash(data?.data?.hash);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="page-container">
      <div className="auth-container">
        <div className="auth-card">
          <h1>Transfer Solana</h1>
          <p className="auth-subtitle">
           Transfer Solana from one wallet to another
          </p>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <select
                name="srcWalletAddress"
                id="srcWalletAddress"
                defaultValue={formData.srcWalletAddress}
                onChange={handleInputChange}
                required
              >
                <option defaultValue="" disabled selected>
                  Choose Source Wallet
                </option>
                {wallets &&
                  wallets.map((wallet) => {
                    return (
                      <option key={wallet?.publicKey} value={wallet?.publicKey}>
                        {wallet?.publicKey}
                      </option>
                    );
                  })}
              </select>
              <label htmlFor="amount">Amount</label>
              <input
                type="text"
                id="amount"
                name="amount"
                value={formData.amount}
                onChange={handleInputChange}
                required
                placeholder="Enter Amount"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="dstAddress">Dst Wallet Address</label>
              <input
                type="text"
                id="dstAddress"
                name="dstAddress"
                value={formData.password}
                onChange={handleInputChange}
                required
                placeholder="Enter Destination Wallet Address"
                disabled={loading}
              />
            </div>

            <button type="submit" className="auth-btn">
              Send
            </button>
            {transactionHash && <p>Transaction Hash - {transactionHash}</p>}
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateTransfer;
