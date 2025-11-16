const pool = require('../config/database');

const mindMapModel = {
  createTable: async () => {
    const query = `
      CREATE TABLE IF NOT EXISTS mindmaps (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        data JSONB NOT NULL DEFAULT '{"nodes": [], "edges": []}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    await pool.query(query);
  },

  create: async (userId, title, description = null, data = { nodes: [], edges: [] }) => {
    const query = `
      INSERT INTO mindmaps (user_id, title, description, data, created_at, updated_at)
      VALUES ($1, $2, $3, $4, NOW(), NOW())
      RETURNING *
    `;
    const result = await pool.query(query, [userId, title, description, JSON.stringify(data)]);
    return {
      ...result.rows[0],
      data: typeof result.rows[0].data === 'string' ? JSON.parse(result.rows[0].data) : result.rows[0].data
    };
  },

  findByUserId: async (userId) => {
    const query = `
      SELECT id, user_id, title, description, data, created_at, updated_at
      FROM mindmaps 
      WHERE user_id = $1 
      ORDER BY updated_at DESC
    `;
    const result = await pool.query(query, [userId]);
    return result.rows.map(row => ({
      ...row,
      data: typeof row.data === 'string' ? JSON.parse(row.data) : row.data
    }));
  },

  findByIdAndUserId: async (mindMapId, userId) => {
    const query = 'SELECT * FROM mindmaps WHERE id = $1 AND user_id = $2';
    const result = await pool.query(query, [mindMapId, userId]);
    if (result.rows.length === 0) return null;
    return {
      ...result.rows[0],
      data: typeof result.rows[0].data === 'string' ? JSON.parse(result.rows[0].data) : result.rows[0].data
    };
  },

  update: async (mindMapId, userId, updates) => {
    const { title, description, data } = updates;
    const query = `
      UPDATE mindmaps 
      SET title = COALESCE($3, title),
          description = COALESCE($4, description),
          data = COALESCE($5::jsonb, data),
          updated_at = NOW()
      WHERE id = $1 AND user_id = $2
      RETURNING *
    `;
    const dataJson = data ? JSON.stringify(data) : null;
    const result = await pool.query(query, [mindMapId, userId, title, description, dataJson]);
    if (result.rows.length === 0) return null;
    return {
      ...result.rows[0],
      data: typeof result.rows[0].data === 'string' ? JSON.parse(result.rows[0].data) : result.rows[0].data
    };
  },

  delete: async (mindMapId, userId) => {
    const query = 'DELETE FROM mindmaps WHERE id = $1 AND user_id = $2 RETURNING *';
    const result = await pool.query(query, [mindMapId, userId]);
    return result.rows[0] || null;
  },

  search: async (userId, searchQuery) => {
    const query = `
      SELECT id, user_id, title, description, data, created_at, updated_at
      FROM mindmaps 
      WHERE user_id = $1 
      AND (title ILIKE $2 OR description ILIKE $2)
      ORDER BY updated_at DESC
    `;
    const searchPattern = `%${searchQuery}%`;
    const result = await pool.query(query, [userId, searchPattern]);
    return result.rows.map(row => ({
      ...row,
      data: typeof row.data === 'string' ? JSON.parse(row.data) : row.data
    }));
  }
};

module.exports = mindMapModel;

