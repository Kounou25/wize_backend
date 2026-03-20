CREATE DATABASE wize;

-- extension UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- TABLE AGENCES
CREATE TABLE agences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agence VARCHAR(100) NOT NULL,
    ville VARCHAR(50) NOT NULL,
    pays VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- TABLE USERS
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE,
    phone VARCHAR(20) UNIQUE NOT NULL,
    role VARCHAR(20) CHECK (role IN ('admin','agent','guichet','bagagiste','embarquement')) DEFAULT 'agent',
    password TEXT NOT NULL,
    status VARCHAR(10) DEFAULT 'active',
    agence_id UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_agence
    FOREIGN KEY (agence_id)
    REFERENCES agences(id)
    ON DELETE SET NULL
);

-- TABLE CARDS
CREATE TABLE cards(
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    card_id VARCHAR(50) NOT NULL UNIQUE,
    created_by UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_user
    FOREIGN KEY (created_by)
    REFERENCES users(id)
    ON DELETE SET NULL
);

-- TABLE SCANS
CREATE TABLE scans(
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    scanned_card TEXT,
    scanned_by UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user_scan
    FOREIGN KEY (scanned_by)
    REFERENCES users(id)
    ON DELETE SET NULL
);

-- INDEX
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_agence ON users(agence_id);

CREATE INDEX idx_scans_card ON scans(scanned_card);
CREATE INDEX idx_scans_user ON scans(scanned_by);
CREATE INDEX idx_scans_created_at ON scans(created_at);

-- TRIGGER UPDATE UPDATED_AT
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agences_updated_at
BEFORE UPDATE ON agences
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- TABLE REFRESH TOKENS
CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    token TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_refresh_user
    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE
);

CREATE INDEX idx_refresh_tokens_user ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_token ON refresh_tokens(token);