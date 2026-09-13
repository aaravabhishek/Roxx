require('dotenv').config();
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'store_rating_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Fail gracefully with a clear message if the database is unreachable.
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Connected to MySQL database:', process.env.DB_NAME || 'store_rating_db');
    connection.release();
  } catch (err) {
    console.error('❌ Could not connect to the MySQL database.');
    console.error('   Please verify your backend/.env settings and that MySQL is running.');
    console.error('   Details:', err.message);
  }
}

testConnection();

module.exports = pool;
