// client/src/components/Chat/ChatContainer.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useChat } from '../../contexts/ChatContext';
import { useSocket } from '../../contexts/SocketContext';
import { useAuth } from '../../contexts/AuthContext';
import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import { Box, CircularProgress, Typography } from '@material-ui/core';
import { fetchMessages, markMessagesAsRead } from '../../services/messageService';

const ChatContainer = () => {
  const { chatId } = useParams();
  const { user } = useAuth();
  const { socket } = useSocket();
  const { chats, selectedChat, setSelectedChat } = useChat();
  
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [typingUsers, setTypingUsers] = useState({});
  
  const messageEndRef = useRef(null);
  
  // Set selected chat when chatId changes
  useEffect(() => {
    if (chatId && chats.length > 0) {
      const chat = chats.find(c => c._id === chatId);
      if (chat) {
        setSelectedChat(chat);
      }
    }
  }, [chatId, chats, setSelectedChat]);
  
  // Load messages when chat changes
  useEffect(() => {
    if (!selectedChat) return;
    
    const loadMessages = async () => {
      try {
        setLoading(true);
        const data = await fetchMessages(selectedChat._id);
        setMessages(data);
        setLoading(false);
        
        // Mark messages as read
        await markMessagesAsRead(selectedChat._id);
        
        // Scroll to bottom
        scrollToBottom();
      } catch (err) {
        setError('Failed to load messages');
        setLoading(false);
        console.error(err);
      }
    };
    
    loadMessages();
    
    // Join chat room
    if (socket) {
      socket.emit('joinChat', selectedChat._id);
    }
  }, [selectedChat, socket]);
  
  // Listen for new messages
  useEffect(() => {
    if (!socket) return;
    
    const handleNewMessage = (newMessage) => {
      if (newMessage.chat._id === selectedChat?._id) {
        setMessages(prevMessages => [...prevMessages, newMessage]);
        
        // Scroll to bottom when new message arrives
        scrollToBottom();
      }
    };
    
    socket.on('newMessage', handleNewMessage);
    
    return () => {
      socket.off('newMessage', handleNewMessage);
    };
  }, [socket, selectedChat]);
  
  // Listen for typing status
  useEffect(() => {
    if (!socket) return;
    
    const handleTypingStatus = (data) => {
      if (data.chatId === selectedChat?._id) {
        setTypingUsers(prev => ({
          ...prev,
          [data.userId]: data.isTyping
        }));
      }
    };
    
    socket.on('typingStatus', handleTypingStatus);
    
    return () => {
      socket.off('typingStatus', handleTypingStatus);
    };
  }, [socket, selectedChat]);
  
  // Scroll to bottom of message list
  const scrollToBottom = () => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  // Send a message
  const sendMessage = (content, attachments = []) => {
    if (!socket || !selectedChat) return;
    
    socket.emit('chatMessage', {
      chatId: selectedChat._id,
      content,
      attachments
    });
    
    // Stop typing indicator when sending message
    socket.emit('typing', {
      chatId: selectedChat._id,
      isTyping: false
    });
  };
  
  // Handle typing indicator
  const handleTyping = (isTyping) => {
    if (!socket || !selectedChat) return;
    
    socket.emit('typing', {
      chatId: selectedChat._id,
      isTyping
    });
  };
  
  // Check if any user is typing
  const isAnyoneTyping = () => {
    return Object.entries(typingUsers).some(([userId, isTyping]) => 
      userId !== user._id && isTyping
    );
  };
  
  // Get name of typing user(s)
  const getTypingUsersText = () => {
    const typingUserIds = Object.entries(typingUsers)
      .filter(([userId, isTyping]) => userId !== user._id && isTyping)
      .map(([userId]) => userId);
    
    if (typingUserIds.length === 0) return '';
    
    const typingUserNames = typingUserIds.map(userId => {
      const chatUser = selectedChat.users.find(u => u._id === userId);
      return chatUser ? chatUser.name.split(' ')[0] : 'Someone';
    });
    
    if (typingUserNames.length === 1) {
      return `${typingUserNames[0]} is typing...`;
    } else if (typingUserNames.length === 2) {
      return `${typingUserNames[0]} and ${typingUserNames[1]} are typing...`;
    } else {
      return 'Several people are typing...';
    }
  };
  
  if (!selectedChat) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        height="100%"
      >
        <Typography variant="body1" color="textSecondary">
          Select a chat to start messaging
        </Typography>
      </Box>
    );
  }
  
  return (
    <Box
      display="flex"
      flexDirection="column"
      height="100%"
      bgcolor="background.paper"
      borderRadius="4px"
      boxShadow={1}
    >
      <ChatHeader chat={selectedChat} />
      
      {loading ? (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          flexGrow={1}
        >
          <CircularProgress />
        </Box>
      ) : error ? (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          flexGrow={1}
        >
          <Typography color="error">{error}</Typography>
        </Box>
      ) : (
        <MessageList
          messages={messages}
          currentUser={user}
          typingText={isAnyoneTyping() ? getTypingUsersText() : ''}
          messageEndRef={messageEndRef}
        />
      )}
      
      <MessageInput onSend={sendMessage} onTyping={handleTyping} />
    </Box>
  );
};

export default ChatContainer;

