const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);

// 🟢 Thêm phần CORS cho Render
const io = new Server(server, {
  cors: {
    origin: "*", // hoặc domain cụ thể "https://mini-zalo-chat.onrender.com"
    methods: ["GET", "POST"]
  }
});

app.use(express.static(path.join(__dirname, 'public')));

// Mapping user -> socket
const users = {};

io.on('connection', (socket) => {
  console.log('✅ New connection:', socket.id);

  socket.on('register', (username) => {
    users[username] = socket.id;
    socket.username = username;
    io.emit('users', Object.keys(users));
  });

  socket.on('private message', ({ to, message }) => {
    const from = socket.username;
    const ts = Date.now();
    if (users[to]) {
      io.to(users[to]).emit('private message', { from, to, message, ts });
    }
    socket.emit('private message', { from, to, message, ts });
  });

  socket.on('disconnect', () => {
    if (socket.username) {
      delete users[socket.username];
      io.emit('users', Object.keys(users));
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
