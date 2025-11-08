const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const { swaggerUi, specs } = require('./config/swagger');
const authRoutes = require('./routes/authRoutes');
const { createUsersTable, updateExistingUsersType, createAdminUser } = require('./models/userModel');

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

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Initialize database tables
const initializeDatabase = async () => {
  try {
    await createUsersTable();
    await updateExistingUsersType();
    await createAdminUser();
    console.log('Database tables initialized');
  } catch (error) {
    console.error('Database initialization error:', error);
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