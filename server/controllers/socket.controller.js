// server/controllers/socket.controller.js
const jwt = require('jsonwebtoken');
const User = require('../models/User.model');
const Chat = require('../models/Chat.model');
const Message = require('../models/Message.model');

// Map to store online users: { userId: socketId }
const onlineUsers = new Map();

// Handle socket connection and authentication
exports.handleConnection = async (io, socket, token) => {
  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user by id
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      socket.disconnect(true);
      return;
    }
    
    // Store user data in socket
    socket.user = user;
    
    // Add user to online users
    onlineUsers.set(user._id.toString(), socket.id);
    
    // Broadcast user online status
    io.emit('userStatus', {
      userId: user._id,
      status: 'online'
    });
    
    // Join user to their personal room for direct messages
    socket.join(user._id.toString());
    
    // Get user's chats and join those rooms
    const userChats = await Chat.find({
      users: { $elemMatch: { $eq: user._id } }
    });
    
    userChats.forEach(chat => {
      socket.join(chat._id.toString());
    });
    
    // Send list of online users to the newly connected user
    const onlineUsersList = [...onlineUsers.keys()];
    socket.emit('onlineUsers', onlineUsersList);
    
    console.log(`User authenticated: ${user.name} (${user._id})`);
  } catch (error) {
    console.error('Socket authentication error:', error);
    socket.disconnect(true);
  }
};

// Handle socket disconnection
exports.handleDisconnect = (io, socket) => {
  if (socket.user) {
    // Remove user from online users
    onlineUsers.delete(socket.user._id.toString());
    
    // Broadcast user offline status
    io.emit('userStatus', {
      userId: socket.user._id,
      status: 'offline'
    });
    
    console.log(`User disconnected: ${socket.user.name} (${socket.user._id})`);
  }
};

// Handle joining a specific chat
exports.handleJoinChat = async (io, socket, chatId) => {
  if (!socket.user) return;
  
  try {
    // Check if the user is part of this chat
    const chat = await Chat.findOne({
      _id: chatId,
      users: { $elemMatch: { $eq: socket.user._id } }
    });
    
    if (!chat) return;
    
    // Join the chat room
    socket.join(chatId);
    
    // Send typing status to false for all users in this chat
    io.to(chatId).emit('typingStatus', {
      chatId,
      userId: socket.user._id,
      isTyping: false
    });
    
    console.log(`User ${socket.user._id} joined chat: ${chatId}`);
  } catch (error) {
    console.error('Error joining chat:', error);
  }
};

// Handle new chat message
exports.handleChatMessage = async (io, socket, messageData) => {
  if (!socket.user) return;
  
  const { chatId, content, attachments } = messageData;
  
  try {
    // Check if the user is part of this chat
    const chat = await Chat.findOne({
      _id: chatId,
      users: { $elemMatch: { $eq: socket.user._id } }
    });
    
    if (!chat) return;
    
    // Create new message
    const newMessage = await Message.create({
      sender: socket.user._id,
      content,
      chat: chatId,
      attachments: attachments || []
    });
    
    // Populate message with sender info
    const populatedMessage = await Message.findById(newMessage._id)
      .populate('sender', 'name avatar')
      .populate('chat');
    
    // Emit message to all users in the chat
    io.to(chatId).emit('newMessage', populatedMessage);
    
    // Update last message in chat
    await Chat.findByIdAndUpdate(chatId, {
      latestMessage: newMessage._id
    });
    
    // Send notification to offline users
    chat.users.forEach(userId => {
      if (userId.toString() !== socket.user._id.toString()) {
        // Check if user is online
        if (!onlineUsers.has(userId.toString())) {
          // TODO: Send push notification
        } else {
          // Send in-app notification
          io.to(userId.toString()).emit('notification', {
            type: 'newMessage',
            message: `New message from ${chat.isGroupChat ? chat.chatName : socket.user.name}`,
            chatId
          });
        }
      }
    });
    
    console.log(`New message in chat ${chatId} from user ${socket.user._id}`);
  } catch (error) {
    console.error('Error sending message:', error);
  }
};

// Handle typing indicator
exports.handleTyping = (io, socket, data) => {
  if (!socket.user) return;
  
  const { chatId, isTyping } = data;
  
  // Broadcast typing status to chat room
  socket.to(chatId).emit('typingStatus', {
    chatId,
    userId: socket.user._id,
    isTyping
  });
};

