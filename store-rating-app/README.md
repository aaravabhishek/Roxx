# Storewise — Store Rating Web Application

A full-stack web application where normal users can browse and rate stores,
store owners can see how their store is doing, and administrators manage
users and stores. Built with React (Vite), Node.js/Express, and MySQL.

---

## 1. Required Software

- **Node.js** v18 or later (includes npm)
- **MySQL** v8 or later (a local install, or any MySQL server you can connect to)

---

## 2. Create the Database

Open a terminal and log into MySQL:

```bash
mysql -u root -p
```

Then, from a normal terminal (not inside the mysql prompt), import the schema
file, which creates the database and all tables for you:

```bash
mysql -u root -p < database/store_rating.sql
```

This creates a database named `store_rating_db` with the `users`, `stores`,
and `ratings` tables, including the required constraints (unique
user+store rating, rating between 1 and 5, foreign keys, indexes).

---

## 3. Configure the Backend

```bash
cd backend
cp .env.example .env
```

Open `backend/.env` and fill in your MySQL credentials and a JWT secret:

```
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=store_rating_db

JWT_SECRET=replace_this_with_a_long_random_string
JWT_EXPIRES_IN=8h

PORT=5000
CLIENT_URL=http://localhost:5173
```

**Never commit your real `.env` file.**

---

## 4. Install Backend Dependencies

```bash
cd backend
npm install
```

---

## 5. Seed the Default Admin Account

This creates the admin login you'll use to log in for the first time. It
hashes the password with bcrypt using the exact library installed in the
project, so it's guaranteed to work:

```bash
npm run seed
```

This prints the default admin credentials (also listed below).

---

## 6. Start the Backend

```bash
npm run dev
```

You should see:

```
✅ Connected to MySQL database: store_rating_db
🚀 Backend server running on http://localhost:5000
```

If the database connection fails, double-check the values in `backend/.env`
and that MySQL is running.

---

## 7. Install Frontend Dependencies

Open a **new terminal** tab/window:

```bash
cd frontend
npm install
```

---

## 8. Configure the Frontend (optional)

The frontend defaults to `http://localhost:5000/api`. If your backend runs on
a different port, copy the example env file and adjust it:

```bash
cd frontend
cp .env.example .env
```

---

## 9. Start the Frontend

```bash
npm run dev
```

Vite will start the app at **http://localhost:5173**.

---

## 10. Default Admin Login

```
Email:    admin@storerating.com
Password: Admin@123
```

**Change this password immediately after your first login** (Sidebar →
Change Password).

---

## Project Structure

```
store-rating-app/
├── database/
│   └── store_rating.sql        # Schema + relationships + constraints
├── backend/
│   ├── server.js                # Express app entry point
│   ├── db.js                    # MySQL connection pool
│   ├── middleware/
│   │   └── auth.js              # JWT + role-based authorization
│   ├── routes/                  # auth / admin / user / stores / owner routes
│   ├── controllers/             # Business logic per route group
│   ├── utils/
│   │   ├── validators.js        # Backend validation rules
│   │   └── seedAdmin.js         # Creates the default admin account
│   ├── package.json
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── components/          # Button, Input, Modal, Table, RatingStars, etc.
    │   ├── context/              # AuthContext (JWT + user in localStorage)
    │   ├── services/             # axios instance + shared validators
    │   ├── pages/
    │   │   ├── Login.jsx / Register.jsx
    │   │   ├── admin/            # Admin dashboard, users, stores, forms
    │   │   ├── user/             # Store browsing, rating, dashboard
    │   │   └── owner/            # Owner dashboard, store(s), ratings
    │   └── styles/                # Global design tokens + component styles
    ├── package.json
    └── .env.example
```

---

## Architecture Overview

- **Authentication**: Email + password login for all three roles. Passwords
  are hashed with bcrypt and never returned by any API. A JWT is issued on
  login/registration and sent as `Authorization: Bearer <token>` on every
  subsequent request. The frontend stores the token and current user in
  `localStorage` via `AuthContext`.
- **Authorization**: Every protected backend route runs `authenticate`
  (verifies the JWT) and `authorize(role)` (checks the role in the token).
  This means the backend enforces access control independently of the
  frontend — role-protected pages on the frontend are a UX convenience, not
  the actual security boundary.
- **Database**: `users` holds all three roles via a `role` ENUM. `stores`
  references its owner via `owner_id`. `ratings` has a `UNIQUE(user_id,
  store_id)` constraint, so re-rating a store updates the existing row
  (`INSERT ... ON DUPLICATE KEY UPDATE`) instead of creating duplicates.
  Overall ratings are always computed live with `AVG()` — there is no stored
  "average rating" column to keep in sync.
- **Validation**: The same rules (name length, password complexity, email
  format, address length, rating range) are checked on both the frontend
  (for fast feedback) and the backend (as the real safeguard, since the
  frontend can always be bypassed).

---

## Requirement Checklist

**Tech stack**
- [x] React + Vite frontend, plain CSS, React Router
- [x] Node.js + Express REST API
- [x] MySQL database via `mysql2`
- [x] JWT auth + bcrypt password hashing

**Auth & Roles**
- [x] Common login page for all 3 roles, redirect based on role
- [x] Public registration always creates a Normal User
- [x] Register / Login / Logout / Change Password (all roles)
- [x] JWT auth middleware + role authorization middleware on every protected route

**Validation (frontend + backend)**
- [x] Name 20–60 chars, Address ≤400 chars
- [x] Password 8–16 chars, 1 uppercase, 1 special character
- [x] Email format + uniqueness
- [x] Rating integer 1–5

**Admin**
- [x] Dashboard: total users, stores, ratings
- [x] Add Store (with owner selection), Add User (any role)
- [x] View Stores (name, email, address, rating, owner)
- [x] View Users (name, email, address, role) + user details view
- [x] Owner details show their store's rating info
- [x] Search / filter (name, email, address, role) + sort (name, email, rating)
- [x] Change Password, Logout

**Normal User**
- [x] Register / Login
- [x] Dashboard with name, account info, stores rated count
- [x] View all stores: name, address, overall rating, own rating
- [x] Search stores by name / address
- [x] Submit rating (1–5, star UI)
- [x] Modify existing rating (upsert, no duplicates)
- [x] Change Password, Logout

**Store Owner**
- [x] Login
- [x] Dashboard: store info, average rating, rating count
- [x] Ratings list: user name, email, rating, plus average
- [x] Multi-store support via a simple store selector
- [x] Data scoped strictly to the owner's own store(s)
- [x] Change Password, Logout

**Non-functional**
- [x] Responsive layout (collapsible sidebar on small screens)
- [x] Loading / empty / error / success states throughout
- [x] Parameterized SQL queries (no injection risk), no passwords in API responses
- [x] `.env.example` provided, real secrets excluded via `.gitignore`

Out of scope, per the original requirements: rating history, notifications,
chat, email verification, social login, payments, analytics/charts, audit
logs, favorites, reviews/comments, image upload.
