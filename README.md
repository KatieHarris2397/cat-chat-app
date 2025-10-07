# 🐱 Cat Chat - Real-time Chat Application

A beautiful, real-time chat application with a cat theme! Built to demonstrate WebSocket support, database integration, and real-time capabilities with excellent scalability.

The application is deployable on Nexlayer's cloud platform, demonstrating production-ready deployment with:
- Full WebSocket support for real-time messaging
- PostgreSQL database with persistent storage
- Nginx reverse proxy for API and WebSocket routing
- Three-tier architecture (Frontend, Backend, Database)

## ✨ Features

- 🔄 **Real-time messaging** with WebSocket (Socket.io)
- 💾 **PostgreSQL database** integration for persistent storage
- 🎨 **Beautiful cat-themed UI** with modern design
- 👥 **Active users list** showing who's online
- ⌨️ **Typing indicators** for better user experience
- 🐾 **Custom cat avatars** for each user
- 📱 **Responsive design** for mobile and desktop
- 🐳 **Fully Dockerized** for easy deployment
- ⚡ **Scalable architecture** ready for production
- ☁️ **Cloud-ready** - Deployable on Nexlayer

## 🏗️ Architecture

- **Frontend**: React with Socket.io client
- **Backend**: Node.js + Express + Socket.io
- **Database**: PostgreSQL 15
- **Containerization**: Docker

## 📋 Prerequisites

- Docker (version 20.10 or higher)
- Node.js (version 18 or higher) - for local development
- npm or yarn - for local development

## 🚀 Quick Start with Docker

### Step 1: Build the Docker Images

Build all three Docker images:

```bash
# Build the database image
docker build -t cat-chat-db ./database

# Build the backend image
docker build -t cat-chat-backend ./backend

# Build the frontend image
docker build -t cat-chat-frontend ./frontend
```

### Step 2: Create a Docker Network

Create a network for the containers to communicate:

```bash
docker network create cat-chat-network
```

### Step 3: Run the Database Container

```bash
docker run -d \
  --name cat-chat-db \
  --network cat-chat-network \
  -p 5432:5432 \
  -e POSTGRES_DB=catchat \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  cat-chat-db
```

Wait a few seconds for the database to initialize.

### Step 4: Run the Backend Container

```bash
docker run -d \
  --name cat-chat-backend \
  --network cat-chat-network \
  -p 3001:3001 \
  -e PORT=3001 \
  -e DB_HOST=cat-chat-db \
  -e DB_PORT=5432 \
  -e DB_NAME=catchat \
  -e DB_USER=postgres \
  -e DB_PASSWORD=postgres \
  -e CLIENT_URL=http://localhost:3000 \
  cat-chat-backend
```

### Step 5: Run the Frontend Container

```bash
docker run -d \
  --name cat-chat-frontend \
  --network cat-chat-network \
  -p 3000:80 \
  cat-chat-frontend
```

### Step 6: Access the Application

Open your browser and navigate to:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001/api/health

## 🛠️ Local Development (Without Docker)

### Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file (or copy from .env.example)
cat > .env << EOL
PORT=3001
DB_HOST=localhost
DB_PORT=5432
DB_NAME=catchat
DB_USER=postgres
DB_PASSWORD=postgres
CLIENT_URL=http://localhost:3000
EOL

# Make sure PostgreSQL is running locally
# Create the database: createdb catchat

# Start the server
npm start

# Or for development with auto-reload
npm run dev
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env file
cat > .env << EOL
REACT_APP_SOCKET_URL=http://localhost:3001
REACT_APP_API_URL=http://localhost:3001/api
EOL

# Start the development server
npm start
```

The application will open at http://localhost:3000

## 🐳 Docker Management Commands

### Stop All Containers

```bash
docker stop cat-chat-frontend cat-chat-backend cat-chat-db
```

### Remove All Containers

```bash
docker rm cat-chat-frontend cat-chat-backend cat-chat-db
```

### View Logs

```bash
# Backend logs
docker logs cat-chat-backend

# Frontend logs
docker logs cat-chat-frontend

# Database logs
docker logs cat-chat-db

# Follow logs in real-time
docker logs -f cat-chat-backend
```

### Restart Containers

```bash
docker restart cat-chat-backend
docker restart cat-chat-frontend
docker restart cat-chat-db
```

### Clean Up Everything

```bash
# Stop and remove containers
docker stop cat-chat-frontend cat-chat-backend cat-chat-db
docker rm cat-chat-frontend cat-chat-backend cat-chat-db

# Remove images
docker rmi cat-chat-frontend cat-chat-backend cat-chat-db

# Remove network
docker network rm cat-chat-network
```

## 🔧 Configuration

### Backend Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Backend server port | 3001 |
| DB_HOST | Database host | localhost |
| DB_PORT | Database port | 5432 |
| DB_NAME | Database name | catchat |
| DB_USER | Database user | postgres |
| DB_PASSWORD | Database password | postgres |
| CLIENT_URL | Frontend URL for CORS | http://localhost:3000 |

### Frontend Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| REACT_APP_SOCKET_URL | Backend WebSocket URL | http://localhost:3001 |
| REACT_APP_API_URL | Backend API URL | http://localhost:3001/api |

## 📊 Database Schema

### Users Table
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    cat_avatar VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Messages Table
```sql
CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    username VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    cat_avatar VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Rooms Table
```sql
CREATE TABLE rooms (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🎯 WebSocket Events

### Client → Server
- `user:join` - User joins the chat
- `message:send` - Send a new message
- `user:typing` - Typing indicator

### Server → Client
- `user:joined` - Confirmation of successful join
- `message:new` - New message broadcast
- `user:list` - Updated list of active users
- `user:notification` - User join/leave notifications
- `user:typing` - Someone is typing

## 📸 Features Showcase

### Cat Avatar Selection
Choose from 15 different cat emojis as your avatar!

### Real-time Messaging
Messages appear instantly for all connected users via WebSocket.

### Typing Indicators
See when other users are typing in real-time.

### Active Users List
Always know who else is in the chat room.

### Persistent Storage
All messages are stored in PostgreSQL and loaded when you join.

## 🚀 Scalability Features

1. **Database Indexing**: Optimized queries with indexes on frequently accessed columns
2. **Connection Pooling**: PostgreSQL connection pool for efficient database access
3. **WebSocket Broadcasting**: Efficient message distribution to all connected clients
4. **Stateless Backend**: Can be horizontally scaled with load balancer
5. **Docker Ready**: Easy deployment and scaling with container orchestration

### Key Configuration Notes

- **Frontend**: Uses `window.location.origin` to connect to backend (cloud-compatible)
- **Backend**: References database as `database.pod` (Nexlayer's internal DNS)
- **Nginx Proxy**: Routes `/api/` and `/socket.io/` to backend service
- **Persistent Storage**: 2GB volume mounted for PostgreSQL data

## 🐛 Troubleshooting

### Database Connection Issues

If the backend can't connect to the database:
```bash
# Check if database container is running
docker ps

# Check database logs
docker logs cat-chat-db

# Verify database is accessible
docker exec -it cat-chat-db psql -U postgres -d catchat -c "SELECT 1;"
```

### WebSocket Connection Issues

If the frontend can't connect to backend:
1. Verify backend is running: http://localhost:3001/api/health
2. Check browser console for errors
3. Ensure CORS is properly configured
4. Check that ports are not already in use

### Port Already in Use

```bash
# Find process using port 3001
lsof -i :3001

# Kill the process
kill -9 <PID>
```

## 🤝 Contributing

Feel free to submit issues and enhancement requests!

## 📝 License

This project is open source and available under the MIT License.

## 🎨 Credits

Built with ❤️ using React, Node.js, Socket.io, and PostgreSQL.
Cat emojis provided by Unicode standard.

---

**Enjoy chatting with your fellow cats! 🐱💬**

