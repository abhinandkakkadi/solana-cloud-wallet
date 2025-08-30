import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import './Pages.css';

const Profile = () => {
  const { user, apiCall, logout } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const response = await apiCall('/profile');
      
      if (response.ok) {
        const data = await response.json();
        setProfileData(data);
      } else {
        setError('Failed to fetch profile data');
      }
    } catch (error) {
      console.error('Profile fetch error:', error);
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="error-container">
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={fetchProfileData} className="btn btn-primary">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="profile-header">
        <h1>Profile</h1>
        <button onClick={logout} className="btn btn-secondary">
          Sign Out
        </button>
      </div>

      <div className="profile-grid">
        <div className="profile-card">
          <h3>Personal Information</h3>
          <div className="profile-info">
            <div className="info-item">
              <label>Name:</label>
              <span>{user?.firstName} {user?.lastName}</span>
            </div>
            <div className="info-item">
              <label>Email:</label>
              <span>{user?.email}</span>
            </div>
            <div className="info-item">
              <label>Member Since:</label>
              <span>{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</span>
            </div>
          </div>
        </div>

        <div className="profile-card">
          <h3>Account Settings</h3>
          <div className="settings-buttons">
            <button className="settings-btn">Change Password</button>
            <button className="settings-btn">Update Email</button>
            <button className="settings-btn">Security Settings</button>
            <button className="settings-btn">Privacy Settings</button>
          </div>
        </div>

        <div className="profile-card">
          <h3>Account Statistics</h3>
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-value">15</div>
              <div className="stat-label">Transactions</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">$12,345</div>
              <div className="stat-label">Total Volume</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">3</div>
              <div className="stat-label">Wallets Connected</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">98.5%</div>
              <div className="stat-label">Success Rate</div>
            </div>
          </div>
        </div>

        <div className="profile-card">
          <h3>Security</h3>
          <div className="security-info">
            <div className="security-item">
              <span>Two-Factor Authentication</span>
              <span className="status enabled">Enabled</span>
            </div>
            <div className="security-item">
              <span>Email Verification</span>
              <span className="status enabled">Verified</span>
            </div>
            <div className="security-item">
              <span>Phone Verification</span>
              <span className="status disabled">Not Verified</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;