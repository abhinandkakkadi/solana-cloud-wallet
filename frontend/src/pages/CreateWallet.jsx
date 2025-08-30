import React from "react";
import "./Pages.css";

const Chains = {
    base: 'base',
    ethereum: 'ethereum',
    solana: 'solana'
  };


const CreateWallet = () => {
  const [formData, setFormData] = useState({
    chain: "",
  });

  const handleInputChange =  (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("Create wallet attempt:", formData?.chain);

    try {
      const result = await login(formData.email, formData.password);

      if (!result.success) {
        setError(result.error || "Sign in failed");
      }

      setFormData({
        chain: "",
      });
    } catch (error) {
      setError("An unexpected error occurred");
    }
  };

  return (
    <div className="page-container">
      <div className="auth-container">
        <div className="auth-card">
          <h1>Create Wallet</h1>
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="chain">Chain</label>
              <input
                type="text"
                id="chain"
                name="chain"
                value={formData.email}
                onChange={handleInputChange}
                required
                placeholder="Enter your email"
                disabled={loading}
              />
            </div>
            <button type="submit" className="auth-btn">
              Submit
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
