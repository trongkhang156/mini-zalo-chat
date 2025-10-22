const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
app.set("trust proxy", 1); // ✅ cần cho HTTPS trên Render

// Tạo HTTP server
const server = http.createServer(app);

// Cấu hình Socket.IO
const io = new Server(server, {
  cors: {
    origin: "*", // ✅ Cho phép tất cả client (máy khác, điện thoại)
    methods: ["GET", "POST"]
  },
  transports: ["websocket", "polling"]
});

// Serve giao diện frontend (thư mục public)
app.use(express.static(path.join(__dirname, "public")));

// Lưu danh sách user đang online
const users = {}; // { username: socket.id }

io.on("connection", (socket) => {
  console.log("✅ New connection:", socket.id);

  // Khi user đăng ký (gửi username)
  socket.on("register", (username) => {
    socket.username = username;
    users[username] = socket.id;
    console.log(`🟢 ${username} connected (${socket.id})`);
    io.emit("users", Object.keys(users)); // Cập nhật danh sách user cho mọi người
  });

  // Khi gửi tin nhắn riêng
  socket.on("private message", ({ to, message }) => {
    console.log("📨 private message:", { from: socket.username, to, message });
    console.log("👥 users hiện tại:", users);

    const targetId = users[to];
    if (targetId) {
      // ✅ Gửi tin nhắn cho người nhận
      io.to(targetId).emit("private message", {
        from: socket.username,
        message
      });
    } else {
      console.log(`⚠️ Không tìm thấy người nhận: ${to}`);
    }

    // ✅ Gửi lại cho chính người gửi (để hiển thị trên UI của họ)
    io.to(socket.id).emit("private message", {
      from: socket.username,
      message
    });
  });

  // Khi user ngắt kết nối
  socket.on("disconnect", () => {
    if (socket.username) {
      console.log(`🔴 ${socket.username} disconnected`);
      delete users[socket.username];
      io.emit("users", Object.keys(users));
    }
  });
});

// Render server port
const PORT = process.env.PORT || 3000;
server.listen(PORT, "0.0.0.0", () =>
  console.log(`🚀 Server running on port ${PORT}`)
);
