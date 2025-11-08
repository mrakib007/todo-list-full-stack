const pool = require('../config/database');
const bcrypt = require('bcryptjs');

const createUsersTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      name VARCHAR(255) NOT NULL,
      user_type VARCHAR(50) DEFAULT 'user',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
  await pool.query(query);
  
  // Add user_type column if it doesn't exist (for existing tables)
  const alterQuery = `
    ALTER TABLE users 
    ADD COLUMN IF NOT EXISTS user_type VARCHAR(50) DEFAULT 'user'
  `;
  await pool.query(alterQuery);
};

const createUser = async (userData) => {
  const { email, password, name, user_type = 'user' } = userData;
  
  // Prevent creation of additional admin users
  if (user_type === 'super_admin' && email !== 'admin@todoapp.com') {
    throw new Error('Cannot create additional admin users');
  }
  
  const hashedPassword = await bcrypt.hash(password, 12);
  
  const query = `
    INSERT INTO users (email, password, name, user_type)
    VALUES ($1, $2, $3, $4)
    RETURNING id, email, name, user_type, created_at
  `;
  
  const result = await pool.query(query, [email, hashedPassword, name, user_type]);
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

const createAdminUser = async () => {
  const adminData = {
    email: 'admin@todoapp.com',
    password: 'admin123456',
    name: 'Super Admin',
    user_type: 'super_admin'
  };
  
  const existingAdmin = await findUserByEmail(adminData.email);
  if (!existingAdmin) {
    await createUser(adminData);
    console.log('Super admin user created: admin@todoapp.com / admin123456');
  }
};

const updateExistingUsersType = async () => {
  const query = `
    UPDATE users 
    SET user_type = 'user' 
    WHERE user_type IS NULL OR user_type = ''
  `;
  await pool.query(query);
};

const getAllUsers = async () => {
  const query = 'SELECT id, email, name, user_type, created_at FROM users ORDER BY created_at DESC';
  const result = await pool.query(query);
  return result.rows;
};

module.exports = {
  createUsersTable,
  createUser,
  findUserByEmail,
  comparePassword,
  createAdminUser,
  updateExistingUsersType,
  getAllUsers,
};