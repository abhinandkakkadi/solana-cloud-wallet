import React from 'react';
import { Link } from 'react-router-dom';
import './Pages.css';

const Home = () => {
  return (
    <div className="page-container">
      <div className="hero-section">
        <h1>Welcome to CryptoRamp</h1>
        <p>Your gateway to seamless crypto onramp and offramp solutions</p>
        
        <div className="feature-grid">
          <div className="feature-card">
            <h3>🚀 Fast Onramp</h3>
            <p>Convert fiat to crypto instantly with our streamlined process</p>
          </div>
          
          <div className="feature-card">
            <h3>💸 Easy Offramp</h3>
            <p>Cash out your crypto to your bank account in minutes</p>
          </div>
          
          <div className="feature-card">
            <h3>🔒 Secure</h3>
            <p>Bank-grade security with multi-layer protection</p>
          </div>
          
          <div className="feature-card">
            <h3>📱 Mobile Ready</h3>
            <p>Access your account anywhere with our responsive design</p>
          </div>
        </div>
        
        <div className="cta-buttons">
          <Link to="/user/signup" className="cta-btn primary">
            Get Started
          </Link>
          <Link to="/user/signin" className="cta-btn secondary">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;