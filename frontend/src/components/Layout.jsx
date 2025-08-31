import React from "react";
import { Link, useLocation } from "react-router-dom";
import "./Layout.css";
import { useAuth } from "../contexts/AuthContext";

const Layout = ({ children }) => {
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  return (
    <div className="layout">
      <header className="header">
        <div className="header-content">
          <Link to="/" className="logo">
            <h1>Crypto Transfer</h1>
          </Link>

          <nav className="nav">
            {isAuthenticated() && (
              <Link
                to="/wallet"
                className={
                  location.pathname === "/wallet"
                    ? "nav-link active"
                    : "nav-link"
                }
              >
                Wallet
              </Link>
            )}
            {isAuthenticated() && (
              <Link
                to="/transfer"
                className={
                  location.pathname === "/transfer"
                    ? "nav-link active"
                    : "nav-link"
                }
              >
                Transfer
              </Link>
            )}
          </nav>

          {!isAuthenticated() && (
            <div className="auth-buttons">
              <Link
                to="/user/signin"
                className={
                  location.pathname === "/user/signin"
                    ? "btn btn-secondary active"
                    : "btn btn-secondary"
                }
              >
                Sign In
              </Link>
              <Link
                to="/user/signup"
                className={
                  location.pathname === "/user/signup"
                    ? "btn btn-primary active"
                    : "btn btn-primary"
                }
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </header>

      <main className="main-content">{children}</main>

      <footer className="footer">
        <div className="footer-content">
          <p>&copy; 2024 CryptoRamp. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
