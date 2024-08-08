Okay, I can't directly create files for you, but I'll provide a structural breakdown and the code snippets for building a basic React chat app with Node.js. 

**Project Setup:**

1. **Initialize:**
   - Open your terminal and run:
     ```bash
     npm init -y
     ```
   - Install dependencies (both client and server in one project for simplicity): 
     ```bash
     npm install express socket.io react react-dom
     ```

**Directory Structure:**

```
chat-app/
  - client/            // React frontend
    - public/
      - index.html 
    - src/
      - App.js
      - index.js
  - server/            // Node.js backend
    - index.js
  - package.json 
```

**Code:**

**./client/public/index.html:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Chat App</title>
</head>
<body>
    <div id="root"></div> 
    <script src="/static/js/bundle.js"></script>
</body>
</html>
```

**./client/src/App.js:**

```javascript
import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

function App() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const newSocket = io('http://localhost:5000'); // Connect to your server
    setSocket(newSocket);

    // Cleanup on component unmount
    return () => newSocket.close(); 
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on('message', (msg) => {
        setMessages((prevMessages) => [...prevMessages, msg]);
      });
    }
  }, [socket]);

  const sendMessage = () => {
    if (message && socket) {
      socket.emit('message', message);
      setMessage(''); 
    }
  };

  return (
    <div>
      <ul>
        {messages.map((msg, index) => (
          <li key={index}>{msg}</li>
        ))}
      </ul>
      <input 
        value={message}
        onChange={(e) => setMessage(e.target.value)} 
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
}

export default App;
```

**./client/src/index.js:**

```javascript
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App'; 

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);
```

**./server/index.js:**

```javascript
const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
  cors: { // Configure CORS to allow your React app to connect
    origin: "http://localhost:3000", 
    methods: ["GET", "POST"]
  }
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('message', (msg) => {
    io.emit('message', msg); 
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
http.listen(PORT, () => console.log(`Server running on port ${PORT}`));
```

**Steps to Run:**

1. **Start React Dev Server:**
   - Open a terminal in the `./client` directory.
   - Run `npm start` or the equivalent command based on your React setup.

2. **Start Node.js Server:**
   - Open another terminal in the root directory (`./chat-app`).
   - Run `node server/index.js`.

Now you should be able to access