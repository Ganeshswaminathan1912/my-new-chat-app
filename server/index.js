require('dotenv').config(); // Load environment variables
const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
  cors: {
    origin: "http://localhost:3000", 
    methods: ["GET", "POST"]
  }
});
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// ... (Your existing code)

// Simplified User Data (Replace with database in a real app)
const users = []; 

// Authentication Middleware
const authenticateJWT = (socket, next) => {
  const token = socket.handshake.auth.token; 

  if (!token) {
    return next(new Error('Authentication error'));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = decoded; // Store user info in socket object
    next(); 
  } catch (error) {
    return next(new Error('Authentication error'));
  }
};

// Socket.IO Connection
io.on('connection', (socket) => {
  socket.on('login', async ({ username, password }) => {
    try {
      const user = users.find(user => user.username === username);
      if (!user) {
        return socket.emit('loginError', 'Invalid username or password');
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return socket.emit('loginError', 'Invalid username or password');
      }

      const token = jwt.sign({ userId: user.id, username: user.username }, process.env.JWT_SECRET);
      socket.emit('loginSuccess', { token }); // Send token on successful login
    } catch (error) {
      console.error('Login error:', error);
      socket.emit('loginError', 'An error occurred during login');
    }
  });

  // Protect the chat room with authentication middleware
  socket.use(authenticateJWT);

  socket.on('message', (msg) => {
    // Now you can access socket.user to get the logged-in user
    io.emit('message', { user: socket.user.username, text: msg });
  });

  // ... (Rest of your socket events)
});

// API Endpoints (for registration, etc.)
app.use(express.json()); // for parsing application/json

app.post('/register', async (req, res) => {
  const { username, password } = req.body;

  try {
    const existingUser = users.find(user => user.username === username);
    if (existingUser) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10); 
    const newUser = { id: users.length + 1, username, password: hashedPassword };
    users.push(newUser);

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Failed to register user' });
  }
});

// ... (Your existing code)