-- Ganpati Festival Game Database Schema
-- Run this script to initialize your MySQL database

CREATE DATABASE IF NOT EXISTS GanpatiFestivalGame;
USE GanpatiFestivalGame;

-- Users table
CREATE TABLE IF NOT EXISTS Users (
    Id INT PRIMARY KEY AUTO_INCREMENT,
    Name VARCHAR(100) NOT NULL,
    Email VARCHAR(100) NOT NULL UNIQUE,
    Password VARCHAR(255) NOT NULL,
    Role INT NOT NULL DEFAULT 2, -- 1=Admin, 2=User
    IsActive BOOLEAN DEFAULT TRUE,
    IsBlocked BOOLEAN DEFAULT FALSE,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    LastScratchDate TIMESTAMP NULL
);

-- Ganpati Avatars table (Ashtavinayak)
CREATE TABLE IF NOT EXISTS GanpatiAvatars (
    Id INT PRIMARY KEY AUTO_INCREMENT,
    Name VARCHAR(100) NOT NULL,
    Location VARCHAR(100) NOT NULL,
    Description VARCHAR(500),
    ImageUrl VARCHAR(200),
    IsActive BOOLEAN DEFAULT TRUE,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User Collections table
CREATE TABLE IF NOT EXISTS UserCollections (
    Id INT PRIMARY KEY AUTO_INCREMENT,
    UserId INT NOT NULL,
    GanpatiAvatarId INT NOT NULL,
    CollectedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE,
    FOREIGN KEY (GanpatiAvatarId) REFERENCES GanpatiAvatars(Id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_avatar (UserId, GanpatiAvatarId)
);

-- Scratch Cards table (for tracking daily scratches)
CREATE TABLE IF NOT EXISTS ScratchCards (
    Id INT PRIMARY KEY AUTO_INCREMENT,
    UserId INT NOT NULL,
    GanpatiAvatarId INT NOT NULL,
    IsWon BOOLEAN DEFAULT FALSE,
    ScratchedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE,
    FOREIGN KEY (GanpatiAvatarId) REFERENCES GanpatiAvatars(Id) ON DELETE CASCADE
);

-- Avatar Inventory table (for admin to manage quantities)
CREATE TABLE IF NOT EXISTS AvatarInventories (
    Id INT PRIMARY KEY AUTO_INCREMENT,
    GanpatiAvatarId INT NOT NULL,
    Quantity INT NOT NULL DEFAULT 0,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (GanpatiAvatarId) REFERENCES GanpatiAvatars(Id) ON DELETE CASCADE,
    UNIQUE KEY unique_avatar_inventory (GanpatiAvatarId)
);

-- Insert Ashtavinayak Avatars
INSERT IGNORE INTO GanpatiAvatars (Id, Name, Location, Description, ImageUrl) VALUES
(1, 'Mayureshwar', 'Morgaon', 'The first avatar of Lord Ganesha', '/images/avatars/mayureshwar.jpg'),
(2, 'Siddhivinayak', 'Siddhatek', 'The grantor of success', '/images/avatars/siddhivinayak.jpg'),
(3, 'Ballaleshwar', 'Pali', 'The devoted child avatar', '/images/avatars/ballaleshwar.jpg'),
(4, 'Varadavinayak', 'Mahad', 'The boon giver', '/images/avatars/varadavinayak.jpg'),
(5, 'Chintamani', 'Theur', 'The remover of worries', '/images/avatars/chintamani.jpg'),
(6, 'Girijatmaj', 'Lenyadri', 'Son of Goddess Parvati', '/images/avatars/girijatmaj.jpg'),
(7, 'Vighnahar', 'Ozar', 'The remover of obstacles', '/images/avatars/vighnahar.jpg'),
(8, 'Mahaganapati', 'Ranjangaon', 'The great Ganesha', '/images/avatars/mahaganapati.jpg');

-- Initialize inventory for all avatars
INSERT IGNORE INTO AvatarInventories (GanpatiAvatarId, Quantity)
SELECT Id, 50 FROM GanpatiAvatars;

-- Create default admin user
INSERT IGNORE INTO Users (Id, Name, Email, Password, Role) VALUES
(1, 'Admin User', 'admin@ganpati.com', '123456', 1);

-- Create demo users
INSERT IGNORE INTO Users (Id, Name, Email, Password, Role) VALUES
(2, 'John Doe', 'user@test.com', '123456', 2),
(3, 'Jane Smith', 'jane@test.com', '123456', 2);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON Users(Email);
CREATE INDEX IF NOT EXISTS idx_users_role ON Users(Role);
CREATE INDEX IF NOT EXISTS idx_user_collections_user ON UserCollections(UserId);
CREATE INDEX IF NOT EXISTS idx_user_collections_avatar ON UserCollections(GanpatiAvatarId);
CREATE INDEX IF NOT EXISTS idx_scratch_cards_user_date ON ScratchCards(UserId, ScratchedAt);
CREATE INDEX IF NOT EXISTS idx_avatar_inventories_avatar ON AvatarInventories(GanpatiAvatarId);

-- Show success message
SELECT 'Database initialized successfully!' as Message;