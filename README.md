# ChatHub - Real-time Chat Application

![ChatHub Banner](https://via.placeholder.com/800x200?text=ChatHub+Messaging+Platform)

## 🚀 Overview

ChatHub is a modern real-time chat application built with the MERN stack (MongoDB, Express, React, Node.js) and Socket.io. It features private messaging, group chats, media sharing, and real-time notifications.

## ✨ Features

- **Real-time Messaging** - Instant message delivery with typing indicators
- **User Authentication** - Secure login/registration with JWT and social auth options
- **Private Chats** - One-on-one messaging with any registered user
- **Group Conversations** - Create and manage group chats with multiple participants
- **Media Sharing** - Send images, documents, and links
- **Read Receipts** - Know when your messages have been read
- **Online Status** - See which users are currently online
- **Message History** - Persistent chat history stored in database
- **Push Notifications** - Get notified when you receive new messages
- **Responsive Design** - Works seamlessly on desktop and mobile devices

## 🛠️ Technologies

### Frontend
- React.js with Context API for state management
- Socket.io-client for real-time communication
- Material-UI for component styling
- Formik and Yup for form validation
- React Router for navigation

### Backend
- Node.js & Express.js
- Socket.io for WebSocket connections
- MongoDB with Mongoose ODM
- JWT for authentication
- Cloudinary for media storage
- Redis for caching and presence detection

### DevOps
- Docker & Docker Compose
- GitHub Actions for CI/CD
- Deployed on Vercel (frontend) and Heroku (backend)

## 📸 Screenshots

<div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
    <img src="https://via.placeholder.com/400x200?text=Chat+Interface" alt="Chat Interface" width="48%"/>
    <img src="https://via.placeholder.com/400x200?text=User+Profile" alt="User Profile" width="48%"/>
</div>
<div style="display: flex; justify-content: space-between;">
    <img src="https://via.placeholder.com/400x200?text=Group+Chat" alt="Group Chat" width="48%"/>
    <img src="https://via.placeholder.com/400x200?text=Mobile+View" alt="Mobile View" width="48%"/>
</div>

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or later)
- MongoDB
- Redis

### Installation

1. Clone the repository
```bash
git clone https://github.com/ahmadjilani1/chathub.git
cd chathub
```

2. Install dependencies for both frontend and backend
```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

3. Set up environment variables
```bash
# In the server directory, create a .env file with:
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
REDIS_URL=your_redis_url
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# In the client directory, create a .env file with:
REACT_APP_API_URL=http://localhost:5000
REACT_APP_SOCKET_ENDPOINT=http://localhost:5000
```

4. Run the development servers
```bash
# Run backend server
cd server
npm run dev

# Run frontend server in a new terminal
cd client
npm start
```

5. Open your browser and navigate to `http://localhost:3000`

## 🧪 Testing

```bash
# Run backend tests
cd server
npm test

# Run frontend tests
cd client
npm test
```

## 📝 API Documentation

The API documentation is available at `/api/docs` when running the development server.

## 🛣️ Roadmap

- [ ] End-to-end encryption for private chats
- [ ] Voice and video calling features
- [ ] Message translation
- [ ] Advanced search functionality
- [ ] Dark mode theme

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Contact

Ahmad Jilani - [LinkedIn](https://linkedin.com/in/ahmadjilani) - ahmad.jilani@example.com

Project Link: [https://github.com/ahmadjilani1/chathub](https://github.com/ahmadjilani1/chathub)
