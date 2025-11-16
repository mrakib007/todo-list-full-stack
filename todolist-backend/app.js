const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const { swaggerUi, specs } = require('./config/swagger');
const pool = require('./config/database');
const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const mindMapRoutes = require('./routes/mindMapRoutes');
const { authenticateToken } = require('./middleware/auth');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');
const { createUsersTable, updateExistingUsersType, createAdminUser } = require('./models/userModel');
const mindMapModel = require('./models/mindMapModel');

const app = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
}));
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', authenticateToken, taskRoutes);
app.use('/api/users', authenticateToken, userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/mindmaps', authenticateToken, mindMapRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// 404 handler for undefined routes 
app.use(notFoundHandler);

// Global error handler 
app.use(errorHandler);

const initializeDatabase = async () => {
  try {
    await createUsersTable();
    await createTasksTable();
    await mindMapModel.createTable();
    await updateExistingUsersType();
    await createAdminUser();
    console.log('Database tables initialized');
  } catch (error) {
    console.error('Database initialization error:', error);
  }
};

// Create tasks table
const createTasksTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS tasks (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      priority VARCHAR(50) DEFAULT 'medium',
      status VARCHAR(50) DEFAULT 'pending',
      due_date TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
  await pool.query(query);
  
  try {
    await pool.query(`ALTER TABLE tasks ADD COLUMN IF NOT EXISTS due_date TIMESTAMP`);
  } catch (error) {
    if (!error.message.includes('already exists')) {
      console.error('Alter table error:', error.message);
    }
  }
};

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API Documentation available at http://localhost:${PORT}/api-docs`);
  await initializeDatabase();
});

module.exports = app;