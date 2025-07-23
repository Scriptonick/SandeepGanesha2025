-- Ganpati Festival Game Database Schema

CREATE DATABASE IF NOT EXISTS GanpatiFestivalGame;
USE GanpatiFestivalGame;

-- Users table
CREATE TABLE Users (
    Id INT PRIMARY KEY AUTO_INCREMENT,
    Name VARCHAR(100) NOT NULL,
    Email VARCHAR(100) NOT NULL UNIQUE,
    Password VARCHAR(255) NOT NULL,
    Role INT NOT NULL DEFAULT 2, -- 1=Admin, 2=User
    IsActive BOOLEAN DEFAULT TRUE,
    IsBlocked BOOLEAN DEFAULT FALSE,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    LastScratchDate DATE NULL
);

-- Ganpati Avatars table (Ashtavinayak)
CREATE TABLE GanpatiAvatars (
    Id INT PRIMARY KEY AUTO_INCREMENT,
    Name VARCHAR(100) NOT NULL,
    Location VARCHAR(100) NOT NULL,
    Description VARCHAR(500),
    ImageUrl VARCHAR(200),
    IsActive BOOLEAN DEFAULT TRUE,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User Collections table
CREATE TABLE UserCollections (
    Id INT PRIMARY KEY AUTO_INCREMENT,
    UserId INT NOT NULL,
    GanpatiAvatarId INT NOT NULL,
    CollectedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (UserId) REFERENCES Users(Id),
    FOREIGN KEY (GanpatiAvatarId) REFERENCES GanpatiAvatars(Id),
    UNIQUE KEY unique_user_avatar (UserId, GanpatiAvatarId)
);

-- Scratch Cards table (for tracking daily scratches)
CREATE TABLE ScratchCards (
    Id INT PRIMARY KEY AUTO_INCREMENT,
    UserId INT NOT NULL,
    GanpatiAvatarId INT NOT NULL,
    IsWon BOOLEAN DEFAULT FALSE,
    ScratchedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (UserId) REFERENCES Users(Id),
    FOREIGN KEY (GanpatiAvatarId) REFERENCES GanpatiAvatars(Id)
);

-- Avatar Inventory table (for admin to manage quantities)
CREATE TABLE AvatarInventories (
    Id INT PRIMARY KEY AUTO_INCREMENT,
    GanpatiAvatarId INT NOT NULL,
    Quantity INT NOT NULL DEFAULT 0,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (GanpatiAvatarId) REFERENCES GanpatiAvatars(Id),
    UNIQUE KEY unique_avatar_inventory (GanpatiAvatarId)
);

-- Insert Ashtavinayak Avatars
INSERT INTO GanpatiAvatars (Name, Location, Description, ImageUrl) VALUES
('Mayureshwar', 'Morgaon', 'The first avatar of Lord Ganesha', '/images/avatars/mayureshwar.jpg'),
('Siddhivinayak', 'Siddhatek', 'The grantor of success', '/images/avatars/siddhivinayak.jpg'),
('Ballaleshwar', 'Pali', 'The devoted child avatar', '/images/avatars/ballaleshwar.jpg'),
('Varadavinayak', 'Mahad', 'The boon giver', '/images/avatars/varadavinayak.jpg'),
('Chintamani', 'Theur', 'The remover of worries', '/images/avatars/chintamani.jpg'),
('Girijatmaj', 'Lenyadri', 'Son of Goddess Parvati', '/images/avatars/girijatmaj.jpg'),
('Vighnahar', 'Ozar', 'The remover of obstacles', '/images/avatars/vighnahar.jpg'),
('Mahaganapati', 'Ranjangaon', 'The great Ganesha', '/images/avatars/mahaganapati.jpg');

-- Initialize inventory for all avatars
INSERT INTO AvatarInventories (GanpatiAvatarId, Quantity)
SELECT Id, 100 FROM GanpatiAvatars;

-- Create default admin user (password should be hashed in real implementation)
INSERT INTO Users (Name, Email, Password, Role) VALUES
('Admin User', 'admin@ganpati.com', 'Admin123!', 1);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON Users(Email);
CREATE INDEX idx_users_role ON Users(Role);
CREATE INDEX idx_user_collections_user ON UserCollections(UserId);
CREATE INDEX idx_user_collections_avatar ON UserCollections(GanpatiAvatarId);
CREATE INDEX idx_scratch_cards_user_date ON ScratchCards(UserId, ScratchedAt);
CREATE INDEX idx_avatar_inventories_avatar ON AvatarInventories(GanpatiAvatarId);