const pool = require('../config/database');

const taskModel = {
  // Create new task
  create: async (userId, title, description, priority = 'medium') => {
    const query = `
      INSERT INTO tasks (user_id, title, description, priority, status, created_at, updated_at)
      VALUES ($1, $2, $3, $4, 'pending', NOW(), NOW())
      RETURNING *
    `;
    const result = await pool.query(query, [userId, title, description, priority]);
    return result.rows[0];
  },

  // Get all tasks for a user
  findByUserId: async (userId, status = null) => {
    let query = 'SELECT * FROM tasks WHERE user_id = $1';
    const params = [userId];
    
    if (status) {
      query += ' AND status = $2';
      params.push(status);
    }
    
    query += ' ORDER BY created_at DESC';
    
    const result = await pool.query(query, params);
    return result.rows;
  },

  // Get task by ID and user ID
  findByIdAndUserId: async (taskId, userId) => {
    const query = 'SELECT * FROM tasks WHERE id = $1 AND user_id = $2';
    const result = await pool.query(query, [taskId, userId]);
    return result.rows[0];
  },

  // Update task
  update: async (taskId, userId, updates) => {
    const { title, description, priority, status } = updates;
    const query = `
      UPDATE tasks 
      SET title = COALESCE($3, title),
          description = COALESCE($4, description),
          priority = COALESCE($5, priority),
          status = COALESCE($6, status),
          updated_at = NOW()
      WHERE id = $1 AND user_id = $2
      RETURNING *
    `;
    const result = await pool.query(query, [taskId, userId, title, description, priority, status]);
    return result.rows[0];
  },

  // Delete task
  delete: async (taskId, userId) => {
    const query = 'DELETE FROM tasks WHERE id = $1 AND user_id = $2 RETURNING *';
    const result = await pool.query(query, [taskId, userId]);
    return result.rows[0];
  },

  // Update task status only
  updateStatus: async (taskId, userId, status) => {
    const query = `
      UPDATE tasks 
      SET status = $3, updated_at = NOW()
      WHERE id = $1 AND user_id = $2
      RETURNING *
    `;
    const result = await pool.query(query, [taskId, userId, status]);
    return result.rows[0];
  }
};

module.exports = taskModel;