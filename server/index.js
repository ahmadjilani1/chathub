// server/index.js - Main server file with Socket.io integration
const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const path = require('path');
const { instrument } = require('@socket.io/admin-ui');

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const chatRoutes = require('./routes/chat.routes');
const messageRoutes = require('./routes/message.routes');

// Import middlewares
const { protect } = require('./middleware/auth.middleware');
const errorHandler = require('./middleware/error.middleware');

// Import socket controller
const { 
  handleConnection, 
  handleDisconnect, 
  handleJoinChat, 
  handleChatMessage, 
  handleTyping 
} = require('./controllers/socket.controller');

// Initialize app
const app = express();
const server = http.createServer(app);
const io = socketio(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Setup Socket.io admin UI
if (process.env.NODE_ENV === 'development') {
  instrument(io, {
    auth: {
      type: 'basic',
      username: process.env.SOCKET_ADMIN_USER || 'admin',
      password: process.env.SOCKET_
