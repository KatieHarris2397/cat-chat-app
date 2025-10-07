const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

// Initialize database tables
const initDatabase = async () => {
  const client = await pool.connect();
  try {
    // Create users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        cat_avatar VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create messages table
    await client.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        username VARCHAR(50) NOT NULL,
        message TEXT NOT NULL,
        cat_avatar VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create rooms table
    await client.query(`
      CREATE TABLE IF NOT EXISTS rooms (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) UNIQUE NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Insert default rooms
    await client.query(`
      INSERT INTO rooms (name, description)
      VALUES 
        ('General', 'The main cat lounge for all cats'),
        ('Meow Meow', 'For serious cat discussions only'),
        ('Catnip Corner', 'Casual cat chatter'),
        ('Purr Palace', 'Share your best purrs')
      ON CONFLICT (name) DO NOTHING
    `);

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  } finally {
    client.release();
  }
};

// User operations
const createUser = async (username, catAvatar) => {
  try {
    const result = await pool.query(
      'INSERT INTO users (username, cat_avatar) VALUES ($1, $2) RETURNING *',
      [username, catAvatar]
    );
    return result.rows[0];
  } catch (error) {
    if (error.code === '23505') { // Unique violation
      const result = await pool.query(
        'SELECT * FROM users WHERE username = $1',
        [username]
      );
      return result.rows[0];
    }
    throw error;
  }
};

const getUser = async (username) => {
  const result = await pool.query(
    'SELECT * FROM users WHERE username = $1',
    [username]
  );
  return result.rows[0];
};

// Message operations
const saveMessage = async (userId, username, message, catAvatar) => {
  const result = await pool.query(
    'INSERT INTO messages (user_id, username, message, cat_avatar) VALUES ($1, $2, $3, $4) RETURNING *',
    [userId, username, message, catAvatar]
  );
  return result.rows[0];
};

const getRecentMessages = async (limit = 50) => {
  const result = await pool.query(
    'SELECT * FROM messages ORDER BY created_at DESC LIMIT $1',
    [limit]
  );
  return result.rows.reverse();
};

// Room operations
const getRooms = async () => {
  const result = await pool.query('SELECT * FROM rooms ORDER BY created_at ASC');
  return result.rows;
};

module.exports = {
  pool,
  initDatabase,
  createUser,
  getUser,
  saveMessage,
  getRecentMessages,
  getRooms,
};

