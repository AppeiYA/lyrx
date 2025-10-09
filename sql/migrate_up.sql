CREATE TABLE IF NOT EXISTS follows(
    user_id TEXT NOT NULL,
    follower_id TEXT NOT NULL,
    PRIMARY KEY(user_id, follower_id),
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(follower_id) REFERENCES users(id) 
);

DROP INDEX IF EXISTS idx_follower;
DROP INDEX IF EXISTS idx_user;

CREATE INDEX idx_follower ON follows(follower_id);
CREATE INDEX idx_user ON follows(user_id);

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS posts(
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL,
    content TEXT NOT NULL,
    post_image TEXT,
    link TEXT,
    createdAt TIMESTAMP NOT NULL DEFAULT NOW(),
    updatedAt TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY(user_id) REFERENCES users(id)
);

-- DROP TYPE IF EXISTS item_type_enum;

-- CREATE TYPE item_type_enum AS ENUM ('comment', 'post');


CREATE TABLE IF NOT EXISTS likes(
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL,
    item_id TEXT NOT NULL,
    item_type item_type_enum NOT NULL,
    createdAt TIMESTAMP NOT NULL DEFAULT NOW(),
    updatedAt TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, item_id, item_type),
    FOREIGN KEY(user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS comments(
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL,
    item_id TEXT NOT NULL, 
    item_type item_type_enum NOT NULL,
    content TEXT NOT NULL,
    link TEXT,
    createdAt TIMESTAMP NOT NULL DEFAULT NOW(),
    updatedAt TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY(user_id) REFERENCES users(id)
);

