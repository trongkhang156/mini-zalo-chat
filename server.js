const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Serve frontend
app.use(express.static(path.join(__dirname, "public")));

const users = {}; // { username: socket.id }

io.on("connection", (socket) => {
  console.log("✅ New connection:", socket.id);

  // Khi người dùng đăng ký tên
  socket.on("register", (username) => {
    socket.username = username;
    users[username] = socket.id;
    console.log(`🟢 ${username} connected`);
    io.emit("users", Object.keys(users)); // gửi danh sách người dùng
  });

  // Nhận tin nhắn riêng
  socket.on("private message", ({ to, message }) => {
    const targetId = users[to];
    if (targetId) {
      io.to(targetId).emit("private message", { from: socket.username, message });
    }
  });

  // Khi ngắt kết nối
  socket.on("disconnect", () => {
    if (socket.username) {
      console.log(`🔴 ${socket.username} disconnected`);
      delete users[socket.username];
      io.emit("users", Object.keys(users));
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
