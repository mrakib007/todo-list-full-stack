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
      status VARCHAR(50) DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
  await pool.query(query);
  
  // Add columns if they don't exist (for existing tables)
  const alterQueries = [
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS user_type VARCHAR(50) DEFAULT 'user'`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'pending'`
  ];
  
  for (const alterQuery of alterQueries) {
    await pool.query(alterQuery);
  }
};

const createUser = async (userData) => {
  const { email, password, name, user_type = 'user' } = userData;
  
  // Prevent creation of additional admin users
  if (user_type === 'super_admin' && email !== process.env.ADMIN_EMAIL) {
    throw new Error('Cannot create additional admin users');
  }
  
  const hashedPassword = await bcrypt.hash(password, 12);
  
  const query = `
    INSERT INTO users (email, password, name, user_type, status)
    VALUES ($1, $2, $3, $4, 'pending')
    RETURNING id, email, name, user_type, status, created_at
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
    email: process.env.ADMIN_EMAIL,
    password: process.env.ADMIN_PASSWORD || 'admin123456',
    name: process.env.ADMIN_NAME || 'Super Admin',
    user_type: 'super_admin'
  };

  const oldAdmin = await findUserByEmail('admin@todoapp.com');
  if (oldAdmin) {
    const query = `UPDATE users SET email = $1 WHERE email = 'admin@todoapp.com'`;
    await pool.query(query, [adminData.email]);
    console.log(`Admin email updated to: ${adminData.email}`);
  } else {
    const existingAdmin = await findUserByEmail(adminData.email);
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash(adminData.password, 12);
      const query = `
        INSERT INTO users (email, password, name, user_type, status)
        VALUES ($1, $2, $3, $4, 'active')
        RETURNING id, email, name, user_type, status, created_at
      `;
      await pool.query(query, [adminData.email, hashedPassword, adminData.name, adminData.user_type]);
      console.log(`Super admin user created: ${adminData.email}`);
    }
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
  const query = 'SELECT id, email, name, user_type, status, created_at FROM users ORDER BY created_at DESC';
  const result = await pool.query(query);
  return result.rows;
};

const findUserById = async (userId) => {
  const query = 'SELECT id, email, name, user_type, status, created_at FROM users WHERE id = $1';
  const result = await pool.query(query, [userId]);
  return result.rows[0];
};

const getUserById = async (id) => {
  return await findUserById(id);
};

const updateUserStatus = async (id, status) => {
  const query = `
    UPDATE users 
    SET status = $2
    WHERE id = $1 
    RETURNING id, email, name, user_type, status, created_at
  `;
  const result = await pool.query(query, [id, status]);
  return result.rows[0];
};

const getUserStats = async () => {
  const queries = {
    total: 'SELECT COUNT(*) as count FROM users',
    active: 'SELECT COUNT(*) as count FROM users WHERE status = $1',
    pending: 'SELECT COUNT(*) as count FROM users WHERE status = $1',
    banned: 'SELECT COUNT(*) as count FROM users WHERE status = $1'
  };
  
  const [total, active, pending, banned] = await Promise.all([
    pool.query(queries.total),
    pool.query(queries.active, ['active']),
    pool.query(queries.pending, ['pending']),
    pool.query(queries.banned, ['banned'])
  ]);
  
  return {
    totalUsers: parseInt(total.rows[0].count),
    activeUsers: parseInt(active.rows[0].count),
    pendingUsers: parseInt(pending.rows[0].count),
    bannedUsers: parseInt(banned.rows[0].count)
  };
};

const updateUser = async (userId, updates) => {
  const { name, email } = updates;
  const query = `
    UPDATE users 
    SET name = COALESCE($2, name),
        email = COALESCE($3, email)
    WHERE id = $1 
    RETURNING id, email, name, user_type, status, created_at
  `;
  const result = await pool.query(query, [userId, name, email]);
  return result.rows[0];
};

const updateUserProfile = async (id, updates) => {
  return await updateUser(id, updates);
};

const updateUserPassword = async (userId, hashedPassword) => {
  const query = `
    UPDATE users 
    SET password = $2
    WHERE id = $1
    RETURNING id, email, name, user_type, status, created_at
  `;
  const result = await pool.query(query, [userId, hashedPassword]);
  return result.rows[0];
};

const deleteUser = async (userId) => {
  const query = 'DELETE FROM users WHERE id = $1 RETURNING id, email, name, user_type, status';
  const result = await pool.query(query, [userId]);
  return result.rows[0];
};

module.exports = {
  createUsersTable,
  createUser,
  findUserByEmail,
  findUserById,
  getUserById,
  comparePassword,
  createAdminUser,
  updateExistingUsersType,
  getAllUsers,
  updateUser,
  updateUserProfile,
  updateUserPassword,
  updateUserStatus,
  getUserStats,
  deleteUser,
};