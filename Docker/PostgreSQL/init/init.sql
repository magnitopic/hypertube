CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TYPE language_enum AS ENUM('en', 'es', 'de');

CREATE TABLE users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    password VARCHAR(255) DEFAULT NULL,
    biography VARCHAR(500),
    profile_picture VARCHAR(255) DEFAULT NULL,
    profile_picture_is_url BOOLEAN DEFAULT FALSE,
    prefered_language language_enum DEFAULT 'en',
    active_account BOOLEAN DEFAULT FALSE,
    oauth BOOLEAN DEFAULT FALSE,
    refresh_token VARCHAR(2048) DEFAULT NULL,
    reset_pass_token VARCHAR(2048) DEFAULT NULL
);

CREATE TABLE images (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    image_path VARCHAR(255) NOT NULL
);

CREATE TABLE movies (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tmdb_id INT UNIQUE,
    title VARCHAR(55),
    year INT,
    runtime INT DEFAULT NULL,
    directors VARCHAR[] DEFAULT '{}',
    writers VARCHAR[] DEFAULT '{}',
    stars VARCHAR[] DEFAULT '{}',
    genres VARCHAR[] DEFAULT '{}',
    rating DOUBLE PRECISION,
    thumbnail VARCHAR(2048),
    description VARCHAR(2048),
    language VARCHAR(2),
    popularity DOUBLE PRECISION,
    torrent_url VARCHAR(2048),
    file_name VARCHAR(512) DEFAULT NULL,
    downloaded BOOLEAN DEFAULT FALSE
);

CREATE TABLE watched_movies (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    movie_id UUID REFERENCES movies(id) ON DELETE CASCADE,
    watched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    downloaded BOOLEAN DEFAULT TRUE,
    UNIQUE (user_id, movie_id)
);

CREATE TABLE liked_movies (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    movie_id UUID REFERENCES movies(id) ON DELETE CASCADE,
    UNIQUE (user_id, movie_id)
);

CREATE TABLE comments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    content TEXT NOT NULL,
    movie_id UUID NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE users
ADD CONSTRAINT fk_profile_picture
FOREIGN KEY (profile_picture) REFERENCES images(id) ON DELETE SET NULL;

-- Index for faster queries
CREATE INDEX idx_watched_movies_user_id ON watched_movies(user_id);
CREATE INDEX idx_watched_movies_movie_id ON watched_movies(movie_id);
CREATE INDEX idx_comments_movie_id ON comments(movie_id);
CREATE INDEX idx_comments_user_id ON comments(user_id);
CREATE INDEX idx_comments_created_at ON comments(created_at DESC);