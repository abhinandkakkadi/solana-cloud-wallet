import React, { useEffect, useState } from "react";
import "./Pages.css";
import { useAuth } from "../contexts/AuthContext";

const Chains = {
  base: "base",
  ethereum: "ethereum",
  solana: "solana",
};

const CreateWallet = () => {
  const { apiCall, loading } = useAuth();
  const [formData, setFormData] = useState({
    chain: "",
  });
  const [wallets, setWallets] = useState([]);
  const [refetchTrigger, setRefetchTrigger] = useState(0);

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
  }, [refetchTrigger]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const result = await apiCall("/wallet/create", {
        method: "POST",
        body: JSON.stringify({
          chain: formData.chain,
        }),
      });

      if (!result.ok) {
        throw new Error(result.error || "create_wallet_failed");
      }

      setFormData({
        chain: "",
      });

      setRefetchTrigger((prev) => prev + 1);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="page-container">
      <div className="wallet-container">
        <div className="auth-card">
          <h1>Create Wallet</h1>
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <select name="chain" id="chain" value={formData.chain} onChange={handleInputChange} required>
                <option value="" disabled selected>
                  Choose chain
                </option>
                <option value="solana">Solana</option>
              </select>
            </div>
            <button type="submit" className="auth-btn">
              Submit
            </button>
          </form>
        </div>
        <div className="wallet-card">
          {wallets && (
            <div className="wallet-list-container">
              <p>Customer Wallets</p>
              {wallets.map((wallet) => {
                return (
                  <div key={wallet.uid}>
                    <p>{wallet.publicKey}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateWallet;
