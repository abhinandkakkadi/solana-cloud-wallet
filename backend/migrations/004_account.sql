CREATE TABLE IF NOT EXISTS accounts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    account_index INTEGER NOT NULL,
    mnemonic VARCHAR(255) UNIQUE NOT NULL,
);

CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON accounts(user_id);
