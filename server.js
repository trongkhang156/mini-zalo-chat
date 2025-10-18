const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);

// ⚙️ Cho phép Socket.IO hoạt động trên Render
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(express.static(path.join(__dirname, 'public')));

const users = new Map(); // socket.id -> username

io.on('connection', (socket) => {
  console.log('✅ New connection:', socket.id);

  // Khi client join
  socket.on('join', (username) => {
    users.set(socket.id, username);
    console.log('🟢 User joined:', username);
    io.emit('userList', Array.from(users.values()));
  });

  // Khi client đổi tên
  socket.on('rename', (newName) => {
    users.set(socket.id, newName);
    io.emit('userList', Array.from(users.values()));
  });

  // Khi client gửi tin nhắn
  socket.on('chatMessage', (msg) => {
    const user = users.get(socket.id) || 'Ẩn danh';
    io.emit('chatMessage', { user, msg });
  });

  // Khi client rời khỏi
  socket.on('disconnect', () => {
    const user = users.get(socket.id);
    users.delete(socket.id);
    console.log('❌ User disconnected:', user);
    io.emit('userList', Array.from(users.values()));
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
