const pool = require('../config/database');
const bcrypt = require('bcryptjs');

const createUsersTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      name VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
  await pool.query(query);
};

const createUser = async (userData) => {
  const { email, password, name } = userData;
  const hashedPassword = await bcrypt.hash(password, 12);
  
  const query = `
    INSERT INTO users (email, password, name)
    VALUES ($1, $2, $3)
    RETURNING id, email, name, created_at
  `;
  
  const result = await pool.query(query, [email, hashedPassword, name]);
  return result.rows[0];
};

const findUserByEmail = async (email) => {
  const query = 'SELECT * FROM users WHERE email = $1';
  const result = await pool.query(query, [email]);
  return result.rows[0];
};

const comparePassword = async (plainPassword, hashedPassword) => {
  return await bcrypt.compare(plainPassword, hashedPassword);
};

module.exports = {
  createUsersTable,
  createUser,
  findUserByEmail,
  comparePassword,
};