const pool = require('../config/database');

const taskModel = {
  // Create new task
  create: async (userId, title, description, priority = 'medium', dueDate = null) => {
    const query = `
      INSERT INTO tasks (user_id, title, description, priority, status, due_date, created_at, updated_at)
      VALUES ($1, $2, $3, $4, 'pending', $5, NOW(), NOW())
      RETURNING *
    `;
    const result = await pool.query(query, [userId, title, description, priority, dueDate]);
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
    const { title, description, priority, status, due_date } = updates;
    const query = `
      UPDATE tasks 
      SET title = COALESCE($3, title),
          description = COALESCE($4, description),
          priority = COALESCE($5, priority),
          status = COALESCE($6, status),
          due_date = COALESCE($7, due_date),
          updated_at = NOW()
      WHERE id = $1 AND user_id = $2
      RETURNING *
    `;
    const result = await pool.query(query, [taskId, userId, title, description, priority, status, due_date]);
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
  },

  // Get task statistics for a user
  getTaskStatistics: async (userId) => {
    const query = `
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'pending') as pending,
        COUNT(*) FILTER (WHERE status = 'in_progress') as in_progress,
        COUNT(*) FILTER (WHERE status = 'completed') as completed,
        COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled,
        COUNT(*) FILTER (WHERE priority = 'low') as low_priority,
        COUNT(*) FILTER (WHERE priority = 'medium') as medium_priority,
        COUNT(*) FILTER (WHERE priority = 'high') as high_priority,
        COUNT(*) FILTER (WHERE priority = 'urgent') as urgent_priority,
        COUNT(*) FILTER (WHERE due_date IS NOT NULL AND due_date < NOW() AND status NOT IN ('completed', 'cancelled')) as overdue
      FROM tasks
      WHERE user_id = $1
    `;
    const result = await pool.query(query, [userId]);
    return result.rows[0];
  },

  // Search tasks by title or description
  searchTasks: async (userId, searchQuery) => {
    const query = `
      SELECT * FROM tasks 
      WHERE user_id = $1 
      AND (title ILIKE $2 OR description ILIKE $2)
      ORDER BY created_at DESC
    `;
    const searchPattern = `%${searchQuery}%`;
    const result = await pool.query(query, [userId, searchPattern]);
    return result.rows;
  },

  // Get tasks with filters and sorting
  findWithFilters: async (userId, filters) => {
    const { status, priority, dueDate, overdue, sortBy = 'created_at', sortOrder = 'DESC' } = filters;
    let query = 'SELECT * FROM tasks WHERE user_id = $1';
    const params = [userId];
    let paramIndex = 2;

    if (status) {
      query += ` AND status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (priority) {
      query += ` AND priority = $${paramIndex}`;
      params.push(priority);
      paramIndex++;
    }

    if (dueDate) {
      query += ` AND due_date::date = $${paramIndex}::date`;
      params.push(dueDate);
      paramIndex++;
    }

    if (overdue === 'true' || overdue === true) {
      query += ` AND due_date IS NOT NULL AND due_date < NOW() AND status NOT IN ('completed', 'cancelled')`;
    }

    // Validate sortBy and sortOrder
    const validSortFields = ['created_at', 'updated_at', 'title', 'priority', 'status', 'due_date'];
    const validSortOrders = ['ASC', 'DESC'];
    const safeSortBy = validSortFields.includes(sortBy) ? sortBy : 'created_at';
    const safeSortOrder = validSortOrders.includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'DESC';

    query += ` ORDER BY ${safeSortBy} ${safeSortOrder}`;

    const result = await pool.query(query, params);
    return result.rows;
  },

  // Bulk delete tasks
  bulkDelete: async (userId, taskIds) => {
    const query = `
      DELETE FROM tasks 
      WHERE user_id = $1 AND id = ANY($2::int[])
      RETURNING *
    `;
    const result = await pool.query(query, [userId, taskIds]);
    return result.rows;
  },

  // Bulk update task status
  bulkUpdateStatus: async (userId, taskIds, status) => {
    const query = `
      UPDATE tasks 
      SET status = $3, updated_at = NOW()
      WHERE user_id = $1 AND id = ANY($2::int[])
      RETURNING *
    `;
    const result = await pool.query(query, [userId, taskIds, status]);
    return result.rows;
  },

  // Get overdue tasks
  getOverdueTasks: async (userId) => {
    const query = `
      SELECT * FROM tasks 
      WHERE user_id = $1 
      AND due_date IS NOT NULL 
      AND due_date < NOW() 
      AND status NOT IN ('completed', 'cancelled')
      ORDER BY due_date ASC, created_at DESC
    `;
    const result = await pool.query(query, [userId]);
    return result.rows;
  }
};

module.exports = taskModel;