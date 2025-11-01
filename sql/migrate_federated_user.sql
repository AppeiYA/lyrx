CREATE TABLE IF NOT EXISTS federated_users (
    id VARCHAR(50) PRIMARY KEY,
    provider VARCHAR(100) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    user_id VARCHAR(50) NOT NULL,
    UNIQUE (provider, subject),
    FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);