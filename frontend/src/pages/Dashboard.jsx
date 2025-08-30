
import React from 'react';
import './Pages.css';

const Dashboard = () => {
  return (
    <div className="page-container">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p>Manage your crypto transactions and account settings</p>
      </div>
      
      <div className="dashboard-grid">
        <div className="dashboard-card balance-card">
          <h3>Portfolio Balance</h3>
          <div className="balance-amount">$12,345.67</div>
          <div className="balance-change positive">+5.67% (24h)</div>
        </div>
        
        <div className="dashboard-card">
          <h3>Recent Transactions</h3>
          <div className="transaction-list">
            <div className="transaction-item">
              <div className="transaction-info">
                <div className="transaction-type">Buy BTC</div>
                <div className="transaction-date">2 hours ago</div>
              </div>
              <div className="transaction-amount">+0.025 BTC</div>
            </div>
            
            <div className="transaction-item">
              <div className="transaction-info">
                <div className="transaction-type">Sell ETH</div>
                <div className="transaction-date">1 day ago</div>
              </div>
              <div className="transaction-amount">-2.5 ETH</div>
            </div>
            
            <div className="transaction-item">
              <div className="transaction-info">
                <div className="transaction-type">Buy USDC</div>
                <div className="transaction-date">3 days ago</div>
              </div>
              <div className="transaction-amount">+1,000 USDC</div>
            </div>
          </div>
        </div>
        
        <div className="dashboard-card">
          <h3>Quick Actions</h3>
          <div className="action-buttons">
            <button className="action-btn primary">Buy Crypto</button>
            <button className="action-btn secondary">Sell Crypto</button>
            <button className="action-btn secondary">Transfer</button>
            <button className="action-btn secondary">Withdraw</button>
          </div>
        </div>
        
        <div className="dashboard-card">
          <h3>Market Overview</h3>
          <div className="market-list">
            <div className="market-item">
              <div className="market-info">
                <div className="market-name">Bitcoin</div>
                <div className="market-symbol">BTC</div>
              </div>
              <div className="market-price">
                <div className="price">$43,250</div>
                <div className="change positive">+2.5%</div>
              </div>
            </div>
            
            <div className="market-item">
              <div className="market-info">
                <div className="market-name">Ethereum</div>
                <div className="market-symbol">ETH</div>
              </div>
              <div className="market-price">
                <div className="price">$2,680</div>
                <div className="change negative">-1.2%</div>
              </div>
            </div>
            
            <div className="market-item">
              <div className="market-info">
                <div className="market-name">Cardano</div>
                <div className="market-symbol">ADA</div>
              </div>
              <div className="market-price">
                <div className="price">$0.52</div>
                <div className="change positive">+0.8%</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;