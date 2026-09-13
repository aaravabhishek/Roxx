-- ============================================================
-- Store Rating Web Application - Database Schema
-- ============================================================
-- Run this file against a MySQL server to create the database,
-- tables, constraints, indexes and a default admin account.
--
-- Usage (from a terminal with mysql client installed):
--   mysql -u root -p < store_rating.sql
-- ============================================================

CREATE DATABASE IF NOT EXISTS store_rating_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE store_rating_db;

-- ------------------------------------------------------------
-- USERS TABLE
-- Holds all three roles: admin, user (normal user), owner
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(60) NOT NULL,
  email VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  address VARCHAR(400) NOT NULL DEFAULT '',
  role ENUM('admin', 'user', 'owner') NOT NULL DEFAULT 'user',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_users_email (email),
  INDEX idx_users_role (role),
  INDEX idx_users_name (name)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- STORES TABLE
-- Each store belongs to one store owner (users.role = 'owner')
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS stores (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(60) NOT NULL,
  email VARCHAR(255) NOT NULL,
  address VARCHAR(400) NOT NULL DEFAULT '',
  owner_id INT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_stores_owner FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_stores_name (name),
  INDEX idx_stores_owner (owner_id)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- RATINGS TABLE
-- A user can rate a store only once (UNIQUE user_id + store_id).
-- Submitting again updates the existing row (handled in app code).
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ratings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  store_id INT NOT NULL,
  rating TINYINT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_ratings_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_ratings_store FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE,
  CONSTRAINT chk_ratings_value CHECK (rating BETWEEN 1 AND 5),
  UNIQUE KEY uq_user_store (user_id, store_id),
  INDEX idx_ratings_store (store_id)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- DEFAULT ADMIN ACCOUNT
-- ------------------------------------------------------------
-- The default admin account is NOT inserted here as a hardcoded
-- password hash. Instead, run the backend seed script once after
-- installing backend dependencies and configuring your .env file:
--
--   cd backend
--   npm install
--   npm run seed
--
-- This creates (or updates) the admin account with:
--   Email:    admin@storerating.com
--   Password: Admin@123
--
-- The seed script hashes the password with bcrypt at run time, so the
-- hash always matches the exact bcrypt version installed in the
-- project. Change this password immediately after first login.
