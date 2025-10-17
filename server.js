const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

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
    // Gửi lại cho chính mình
    socket.emit('private message', { from, to, message, ts });
  });

  socket.on('disconnect', () => {
    if (socket.username) {
      delete users[socket.username];
      io.emit('users', Object.keys(users));
    }
  });
});

const PORT = 4000;

server.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Server chạy trên http://192.168.1.107:${PORT}`);
});
