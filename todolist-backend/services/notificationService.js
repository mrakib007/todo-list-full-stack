const pool = require('../config/database');
const emailService = require('./emailService');

// Create notifications table to track sent notifications
const createNotificationsTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS task_notifications (
      id SERIAL PRIMARY KEY,
      task_id INTEGER REFERENCES tasks(id) ON DELETE CASCADE,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      notification_type VARCHAR(50) NOT NULL, -- '12_hours' or '6_hours'
      sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(task_id, notification_type)
    )
  `;
  await pool.query(query);
  
  try {
    await pool.query('CREATE INDEX IF NOT EXISTS idx_task_notifications_task_id ON task_notifications(task_id)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_task_notifications_user_id ON task_notifications(user_id)');
  } catch (error) {
    if (!error.message.includes('already exists')) {
      console.error('Error creating index:', error.message);
    }
  }
};

// Check if notification was already sent
const hasNotificationBeenSent = async (taskId, notificationType) => {
  const query = `
    SELECT id FROM task_notifications 
    WHERE task_id = $1 AND notification_type = $2
  `;
  const result = await pool.query(query, [taskId, notificationType]);
  return result.rows.length > 0;
};

// Mark notification as sent
const markNotificationAsSent = async (taskId, userId, notificationType) => {
  const query = `
    INSERT INTO task_notifications (task_id, user_id, notification_type)
    VALUES ($1, $2, $3)
    ON CONFLICT (task_id, notification_type) DO NOTHING
    RETURNING id
  `;
  const result = await pool.query(query, [taskId, userId, notificationType]);
  return result.rows[0];
};

const getTasksDueInHours = async (hours) => {
  const now = new Date();
  const targetTime = new Date(now.getTime() + hours * 60 * 60 * 1000);
  
  // Round to nearest minute for more accurate matching
  targetTime.setSeconds(0);
  targetTime.setMilliseconds(0);
  
  const startTime = new Date(targetTime.getTime() - 5 * 60 * 1000);
  const endTime = new Date(targetTime.getTime() + 5 * 60 * 1000);
  
  const query = `
    SELECT 
      t.id,
      t.title,
      t.description,
      t.due_date,
      t.priority,
      t.status,
      u.id as user_id,
      u.email,
      u.name as user_name
    FROM tasks t
    INNER JOIN users u ON t.user_id = u.id
    WHERE t.due_date IS NOT NULL
      AND t.due_date >= $1
      AND t.due_date <= $2
      AND t.status NOT IN ('completed', 'cancelled')
      AND u.email IS NOT NULL
      AND u.status = 'active'
    ORDER BY t.due_date ASC
  `;
  
  const result = await pool.query(query, [startTime, endTime]);
  return result.rows;
};

// Send notifications for tasks due in X hours
const sendNotificationsForTasksDueInHours = async (hours, notificationType) => {
  try {
    const tasks = await getTasksDueInHours(hours);
    
    if (tasks.length === 0) {
      return { sent: 0, failed: 0 };
    }
    
    let sentCount = 0;
    let failedCount = 0;
    
    for (const task of tasks) {
      try {
        const alreadySent = await hasNotificationBeenSent(task.id, notificationType);
        
        if (alreadySent) {
          continue;
        }
        
        const emailResult = await emailService.sendTaskReminder(
          task.email,
          task.user_name,
          task.title,
          task.description,
          task.due_date,
          hours
        );
        
        if (emailResult.success) {
          await markNotificationAsSent(task.id, task.user_id, notificationType);
          sentCount++;
        } else {
          failedCount++;
        }
      } catch (error) {
        failedCount++;
      }
    }
    
    return { sent: sentCount, failed: failedCount };
  } catch (error) {
    return { sent: 0, failed: 0, error: error.message };
  }
};

const initializeNotifications = async () => {
  try {
    await createNotificationsTable();
  } catch (error) {
  }
};

module.exports = {
  initializeNotifications,
  sendNotificationsForTasksDueInHours,
  getTasksDueInHours,
  hasNotificationBeenSent,
  markNotificationAsSent,
};

