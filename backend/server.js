const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
require('dotenv').config();

const {
  initDatabase,
  createUser,
  saveMessage,
  getRecentMessages,
  getRooms,
} = require('./database');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

app.use(cors());
app.use(express.json());

// Store active users
const activeUsers = new Map();
const userSockets = new Map();

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Cat Chat Server is purring!' });
});

app.get('/api/messages', async (req, res) => {
  try {
    const messages = await getRecentMessages(100);
    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

app.get('/api/rooms', async (req, res) => {
  try {
    const rooms = await getRooms();
    res.json(rooms);
  } catch (error) {
    console.error('Error fetching rooms:', error);
    res.status(500).json({ error: 'Failed to fetch rooms' });
  }
});

app.get('/api/active-users', (req, res) => {
  res.json(Array.from(activeUsers.values()));
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  // User joins
  socket.on('user:join', async (data) => {
    try {
      const { username, catAvatar } = data;
      
      // Create or get user from database
      const user = await createUser(username, catAvatar);
      
      // Store user info
      activeUsers.set(socket.id, {
        id: user.id,
        username: user.username,
        catAvatar: user.cat_avatar,
        socketId: socket.id,
      });
      userSockets.set(user.username, socket.id);

      // Send confirmation to user
      socket.emit('user:joined', {
        userId: user.id,
        username: user.username,
        catAvatar: user.cat_avatar,
      });

      // Broadcast to all users
      io.emit('user:list', Array.from(activeUsers.values()));
      
      // Notify others
      socket.broadcast.emit('user:notification', {
        type: 'join',
        username: user.username,
        message: `${user.username} joined the chat! 🐱`,
      });

      console.log(`User joined: ${user.username}`);
    } catch (error) {
      console.error('Error handling user join:', error);
      socket.emit('error', { message: 'Failed to join chat' });
    }
  });

  // Handle new message
  socket.on('message:send', async (data) => {
    try {
      const user = activeUsers.get(socket.id);
      if (!user) {
        socket.emit('error', { message: 'User not authenticated' });
        return;
      }

      const { message } = data;
      
      // Save message to database
      const savedMessage = await saveMessage(
        user.id,
        user.username,
        message,
        user.catAvatar
      );

      // Broadcast message to all connected clients
      io.emit('message:new', {
        id: savedMessage.id,
        username: savedMessage.username,
        message: savedMessage.message,
        catAvatar: savedMessage.cat_avatar,
        createdAt: savedMessage.created_at,
      });

      console.log(`Message from ${user.username}: ${message}`);
    } catch (error) {
      console.error('Error handling message:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  // Handle typing indicator
  socket.on('user:typing', (data) => {
    const user = activeUsers.get(socket.id);
    if (user) {
      socket.broadcast.emit('user:typing', {
        username: user.username,
        isTyping: data.isTyping,
      });
    }
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    const user = activeUsers.get(socket.id);
    if (user) {
      activeUsers.delete(socket.id);
      userSockets.delete(user.username);
      
      // Notify others
      io.emit('user:list', Array.from(activeUsers.values()));
      socket.broadcast.emit('user:notification', {
        type: 'leave',
        username: user.username,
        message: `${user.username} left the chat 😿`,
      });

      console.log(`User disconnected: ${user.username}`);
    }
  });
});

// Initialize database and start server
const PORT = process.env.PORT || 3001;

initDatabase()
  .then(() => {
    server.listen(PORT, () => {
      console.log(`🐱 Cat Chat Server is running on port ${PORT}`);
      console.log(`🎯 Ready to handle WebSocket connections`);
    });
  })
  .catch((error) => {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  });

