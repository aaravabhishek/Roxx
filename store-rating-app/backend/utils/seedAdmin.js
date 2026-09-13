// Run with: npm run seed
// Creates (or resets) the default admin account used to log into the
// application for the first time.

require('dotenv').config();
const bcrypt = require('bcryptjs');
const pool = require('../db');

const ADMIN_EMAIL = 'admin@storerating.com';
const ADMIN_PASSWORD = 'Admin@123';
const ADMIN_NAME = 'System Administrator Default Account';
const ADMIN_ADDRESS = 'Head Office, Admin Address';

async function seed() {
  try {
    const hashed = await bcrypt.hash(ADMIN_PASSWORD, 10);

    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [ADMIN_EMAIL]);

    if (existing.length > 0) {
      await pool.query('UPDATE users SET password = ?, role = ? WHERE email = ?', [
        hashed,
        'admin',
        ADMIN_EMAIL,
      ]);
      console.log('✅ Existing admin account updated.');
    } else {
      await pool.query(
        'INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)',
        [ADMIN_NAME, ADMIN_EMAIL, hashed, ADMIN_ADDRESS, 'admin']
      );
      console.log('✅ Default admin account created.');
    }

    console.log('   Email:   ', ADMIN_EMAIL);
    console.log('   Password:', ADMIN_PASSWORD);
    console.log('   Please change this password after logging in.');
  } catch (err) {
    console.error('❌ Failed to seed admin account:', err.message);
  } finally {
    await pool.end();
  }
}

seed();
