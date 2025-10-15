const db = require('../db');

const createUserTable = `
  CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'user') DEFAULT 'user',
    status TINYINT(1) DEFAULT 1,
    refresh_token VARCHAR(500),
    reset_token VARCHAR(255),
    reset_token_expiry DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  );
`;


db.query(createUserTable, (err) => {
  if (err) console.error("❌ Error creating users table:", err.message);
  else console.log("✅ 'users' table is ready");
});

module.exports = db;
