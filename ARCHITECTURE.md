# 🏗️ Cat Chat - System Architecture

## Nexlayer

The application is deployable on Nexlayer's cloud platform with the following architecture:
- **Frontend Pod**: Nginx serving React app + reverse proxy for API/WebSocket
- **Backend Pod**: Node.js/Express/Socket.io server
- **Database Pod**: PostgreSQL 15 with 2GB persistent volume

## High-Level Architecture

### Nexlayer Cloud Deployment

```
┌─────────────────────────────────────────────────────────────┐
│                    Internet Users                           │
│                         (HTTPS)                             │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
          ┌────────────────────────┐
          │   Nexlayer Platform    │
          │   Load Balancer        │
          └────────────┬───────────┘
                      │
                      ▼
          ┌──────────────────────────────────────┐
          │    Nexlayer Pod Network              │
          │                                      │
          │  ┌──────────────────────────────┐    │
          │  │   Frontend Pod               │    │
          │  │   - Nginx (Port 80)          │    │
          │  │   - React Build              │    │
          │  │   - Reverse Proxy:           │    │
          │  │     • /api/ → backend.pod    │    │
          │  │     • /socket.io/ → backend  │    │
          │  └────────────┬─────────────────┘    │
          │               │                      │
          │               ▼                      │
          │  ┌──────────────────────────────┐    │
          │  │   Backend Pod                │    │
          │  │   hostname: backend.pod      │    │
          │  │   - Node.js (Port 3001)      │    │
          │  │   - Express API              │    │
          │  │   - Socket.io Server         │    │
          │  │   - WebSocket Handler        │    │
          │  └────────────┬─────────────────┘    │
          │               │                      │
          │               ▼                      │
          │  ┌──────────────────────────────┐    │
          │  │   Database Pod               │    │
          │  │   hostname: database.pod     │    │
          │  │   - PostgreSQL 15 (5432)     │    │
          │  │   - 2GB Persistent Volume    │    │
          │  │   - mountPath: /var/lib/     │    │
          │  │     postgresql               │    │
          │  └──────────────────────────────┘    │
          │                                      │
          └──────────────────────────────────────┘

Key Differences from Local:
- Single public URL (Nexlayer provides)
- Internal pod DNS (.pod suffix)
- Nginx reverse proxy handles all routing
- Frontend uses window.location.origin for connections
- Environment variable <% URL %> for dynamic URL
```

## Component Communication Flow

### 1. User Join Flow
```
User Opens App
     │
     ▼
┌─────────────────┐
│ Select Avatar   │
│ Enter Username  │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────┐
│ Emit: user:join             │
│ {username, catAvatar}       │
└────────┬────────────────────┘
         │ WebSocket
         ▼
┌─────────────────────────────┐
│ Backend: Handle user:join   │
│ - Validate data             │
│ - Query/Insert user to DB   │
│ - Store in activeUsers Map  │
└────────┬────────────────────┘
         │
         ├─────────────────────┐
         │                     │
         ▼                     ▼
┌──────────────────┐  ┌────────────────────┐
│ Emit: user:joined│  │ Broadcast:         │
│ (to sender)      │  │ - user:list        │
└──────────────────┘  │ - user:notification│
                      │ (to all others)    │
                      └────────────────────┘
```

### 2. Message Send Flow
```
User Types Message
     │
     ▼
┌─────────────────────────────┐
│ Emit: user:typing (debounced)│
│ {isTyping: true/false}      │
└────────┬────────────────────┘
         │ WebSocket
         ▼
┌─────────────────────────────┐
│ Backend: Broadcast typing   │
│ indicator to other users    │
└─────────────────────────────┘

User Presses Send
     │
     ▼
┌─────────────────────────────┐
│ Emit: message:send          │
│ {message: "Hello!"}         │
└────────┬────────────────────┘
         │ WebSocket
         ▼
┌─────────────────────────────┐
│ Backend: Handle message     │
│ - Get user from activeUsers │
│ - Insert message to DB      │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│ Broadcast: message:new      │
│ {id, username, message,     │
│  catAvatar, createdAt}      │
│ → To ALL connected clients  │
└─────────────────────────────┘
```

### 3. Data Persistence Flow
```
┌──────────────┐
│ Backend      │
│ Server.js    │
└──────┬───────┘
       │
       │ Requires
       ▼
┌──────────────┐
│ Database.js  │
│ (Data Layer) │
└──────┬───────┘
       │
       │ pg (node-postgres)
       │ Connection Pool
       ▼
┌──────────────┐
│ PostgreSQL   │
│ Database     │
│              │
│ ┌──────────┐│
│ │  users   ││
│ └──────────┘│
│ ┌──────────┐│
│ │ messages ││
│ └──────────┘│
│ ┌──────────┐│
│ │  rooms   ││
│ └──────────┘│
└──────────────┘
```

## Technology Stack Details

### Frontend (React)
```
frontend/
├── React 18
│   ├── Hooks (useState, useEffect, useRef)
│   ├── Event Handlers
│   └── Component Lifecycle
│
├── Socket.io Client 4
│   ├── WebSocket Connection
│   ├── Event Listeners
│   └── Event Emitters
│
├── Axios
│   └── REST API Calls
│
└── CSS3
    ├── Flexbox Layout
    ├── Grid Layout
    ├── Animations
    └── Media Queries
```

### Backend (Node.js)
```
backend/
├── Express 4
│   ├── HTTP Server
│   ├── REST API Routes
│   ├── Middleware (CORS)
│   └── Error Handling
│
├── Socket.io 4
│   ├── WebSocket Server
│   ├── Connection Management
│   ├── Room Management
│   └── Event Broadcasting
│
├── PostgreSQL Client (pg)
│   ├── Connection Pool
│   ├── Query Builder
│   └── Transaction Support
│
└── In-Memory State
    ├── activeUsers Map
    └── userSockets Map
```

### Database (PostgreSQL)
```
database/
├── PostgreSQL 15
│   ├── ACID Compliance
│   ├── Foreign Keys
│   ├── Indexes
│   └── Timestamps
│
└── Schema
    ├── users (id, username, cat_avatar)
    ├── messages (id, user_id, message, ...)
    └── rooms (id, name, description)
```

## Docker Container Details

### Frontend Container
```dockerfile
# Build Stage
node:18-alpine
  └─> npm install
  └─> npm run build
  └─> Create optimized production build

# Production Stage
nginx:alpine
  └─> Copy build files
  └─> Serve static files
  └─> Gzip compression
  └─> Cache headers
```

### Backend Container
```dockerfile
node:18-alpine
  └─> Copy package.json
  └─> npm install --production
  └─> Copy source code
  └─> Expose port 3001
  └─> Start with npm start
```

### Database Container
```dockerfile
postgres:15-alpine
  └─> Set environment variables
  └─> Copy init.sql
  └─> Auto-initialize on first run
  └─> Expose port 5432
```

## State Management

### Frontend State
```javascript
// Component State (React Hooks)
- socket: Socket.io connection
- isConnected: boolean
- username: string
- selectedAvatar: string
- isJoined: boolean
- messages: Array<Message>
- newMessage: string
- activeUsers: Array<User>
- typingUsers: Set<string>
- notification: {message, type}
```

### Backend State
```javascript
// In-Memory State
- activeUsers: Map<socketId, User>
  {
    id: number,
    username: string,
    catAvatar: string,
    socketId: string
  }

- userSockets: Map<username, socketId>
  For quick lookup by username
```

### Database State (Persistent)
```sql
-- Users: All registered users
-- Messages: All chat messages
-- Rooms: Available chat rooms
```

## API Endpoints

### REST API
```
GET  /api/health
     → Status check
     
GET  /api/messages
     → Fetch recent messages (100)
     
GET  /api/rooms
     → List available chat rooms
     
GET  /api/active-users
     → Get currently active users
```

### WebSocket Events (Socket.io)

**Client → Server**
```
user:join        {username, catAvatar}
message:send     {message}
user:typing      {isTyping}
disconnect       (automatic)
```

**Server → Client**
```
connect          (automatic)
user:joined      {userId, username, catAvatar}
message:new      {id, username, message, catAvatar, createdAt}
user:list        Array<User>
user:notification {type, username, message}
user:typing      {username, isTyping}
disconnect       (automatic)
error            {message}
```

## Security Considerations

### Current Implementation
- ❌ No authentication
- ❌ No authorization
- ❌ No input validation
- ❌ No rate limiting
- ❌ No XSS protection
- ✅ CORS enabled
- ✅ Environment variables

### Production Requirements
- ✅ JWT authentication
- ✅ Input sanitization
- ✅ Rate limiting
- ✅ HTTPS/WSS
- ✅ SQL injection prevention (parameterized queries)
- ✅ XSS protection
- ✅ CSRF tokens
- ✅ Helmet.js security headers

## Performance Optimizations

### Implemented
- ✅ Database connection pooling
- ✅ Debounced typing indicators
- ✅ Efficient WebSocket broadcasting
- ✅ CSS animations (GPU accelerated)
- ✅ Message batching
- ✅ Nginx gzip compression
- ✅ Static asset caching

### Future Optimizations
- 🔮 Redis for session storage
- 🔮 Message pagination
- 🔮 Virtual scrolling for large message lists
- 🔮 CDN for static assets
- 🔮 Database query optimization
- 🔮 WebSocket compression

### Browser DevTools
- Console: WebSocket events
- Network: HTTP requests
- Application: Local storage
- Performance: Rendering metrics

---

**This architecture demonstrates modern real-time web application patterns! 🚀**

