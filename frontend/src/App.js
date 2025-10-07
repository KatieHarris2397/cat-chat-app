import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import './App.css';

// Use current domain for Nexlayer deployment, fallback to localhost for local dev
const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || window.location.origin;
const API_URL = process.env.REACT_APP_API_URL || `${window.location.origin}/api`;

// Cat avatar options
const CAT_AVATARS = [
  '😺', '😸', '😹', '😻', '😼', '😽', '🙀', '😿', '😾',
  '🐱', '🐈', '🐈‍⬛', '🦁', '🐯', '🐅'
];

function App() {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [username, setUsername] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(CAT_AVATARS[0]);
  const [isJoined, setIsJoined] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [activeUsers, setActiveUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [notification, setNotification] = useState(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Initialize socket connection
  useEffect(() => {
    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Connected to server');
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from server');
      setIsConnected(false);
    });

    return () => newSocket.close();
  }, []);

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    // User joined successfully
    socket.on('user:joined', (data) => {
      console.log('User joined:', data);
      fetchMessages();
    });

    // New message received
    socket.on('message:new', (message) => {
      setMessages((prev) => [...prev, message]);
    });

    // Active users list updated
    socket.on('user:list', (users) => {
      setActiveUsers(users);
    });

    // User notification
    socket.on('user:notification', (data) => {
      showNotification(data.message, data.type);
    });

    // Typing indicator
    socket.on('user:typing', (data) => {
      if (data.isTyping) {
        setTypingUsers((prev) => new Set([...prev, data.username]));
      } else {
        setTypingUsers((prev) => {
          const newSet = new Set(prev);
          newSet.delete(data.username);
          return newSet;
        });
      }
    });

    return () => {
      socket.off('user:joined');
      socket.off('message:new');
      socket.off('user:list');
      socket.off('user:notification');
      socket.off('user:typing');
    };
  }, [socket]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const response = await axios.get(`${API_URL}/messages`);
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleJoin = (e) => {
    e.preventDefault();
    if (username.trim() && socket) {
      socket.emit('user:join', {
        username: username.trim(),
        catAvatar: selectedAvatar,
      });
      setIsJoined(true);
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim() && socket) {
      socket.emit('message:send', { message: newMessage.trim() });
      setNewMessage('');
      
      // Stop typing indicator
      socket.emit('user:typing', { isTyping: false });
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    }
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    
    if (!socket) return;

    // Send typing indicator
    socket.emit('user:typing', { isTyping: true });

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('user:typing', { isTyping: false });
    }, 1000);
  };

  if (!isJoined) {
    return (
      <div className="App">
        <div className="join-container">
          <div className="join-card">
            <h1 className="app-title">🐱 Cat Chat</h1>
            <p className="app-subtitle">Join the purr-fect chat room!</p>
            
            <form onSubmit={handleJoin} className="join-form">
              <div className="form-group">
                <label>Choose your cat avatar:</label>
                <div className="avatar-grid">
                  {CAT_AVATARS.map((avatar) => (
                    <button
                      key={avatar}
                      type="button"
                      className={`avatar-option ${selectedAvatar === avatar ? 'selected' : ''}`}
                      onClick={() => setSelectedAvatar(avatar)}
                    >
                      {avatar}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="username">Enter your name:</label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Your cat name..."
                  maxLength={20}
                  required
                />
              </div>

              <button type="submit" className="join-button" disabled={!isConnected}>
                {isConnected ? '🐾 Join Chat' : '⏳ Connecting...'}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      {notification && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}

      <div className="chat-container">
        {/* Sidebar */}
        <div className="sidebar">
          <div className="sidebar-header">
            <h2>🐱 Cat Chat</h2>
            <div className="status-indicator">
              <span className={`status-dot ${isConnected ? 'connected' : 'disconnected'}`}></span>
              {isConnected ? 'Connected' : 'Disconnected'}
            </div>
          </div>

          <div className="active-users">
            <h3>Active Cats ({activeUsers.length})</h3>
            <div className="users-list">
              {activeUsers.map((user) => (
                <div key={user.socketId} className="user-item">
                  <span className="user-avatar">{user.catAvatar}</span>
                  <span className="user-name">{user.username}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main chat area */}
        <div className="chat-main">
          <div className="chat-header">
            <h2>💬 General Chat</h2>
            <div className="current-user">
              <span className="current-avatar">{selectedAvatar}</span>
              <span className="current-name">{username}</span>
            </div>
          </div>

          <div className="messages-container">
            {messages.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">😺</div>
                <p>No messages yet. Be the first to say meow!</p>
              </div>
            ) : (
              <>
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`message ${msg.username === username ? 'own-message' : ''}`}
                  >
                    <div className="message-avatar">{msg.cat_avatar || msg.catAvatar}</div>
                    <div className="message-content">
                      <div className="message-header">
                        <span className="message-username">{msg.username}</span>
                        <span className="message-time">
                          {new Date(msg.created_at || msg.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <div className="message-text">{msg.message}</div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </>
            )}

            {typingUsers.size > 0 && (
              <div className="typing-indicator">
                {Array.from(typingUsers).join(', ')} {typingUsers.size === 1 ? 'is' : 'are'} typing
                <span className="typing-dots">
                  <span>.</span>
                  <span>.</span>
                  <span>.</span>
                </span>
              </div>
            )}
          </div>

          <form onSubmit={handleSendMessage} className="message-form">
            <input
              type="text"
              value={newMessage}
              onChange={handleTyping}
              placeholder="Type your message... 🐾"
              disabled={!isConnected}
            />
            <button type="submit" disabled={!isConnected || !newMessage.trim()}>
              Send 🚀
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default App;

