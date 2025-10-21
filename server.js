const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
app.set("trust proxy", 1); // ✅ cần cho HTTPS trên Render

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // ✅ Cho phép tất cả client (máy khác, điện thoại)
    methods: ["GET", "POST"]
  },
  transports: ["websocket", "polling"]
});

// Serve frontend
app.use(express.static(path.join(__dirname, "public")));

const users = {}; // { username: socket.id }

io.on("connection", (socket) => {
  console.log("✅ New connection:", socket.id);

  socket.on("register", (username) => {
    socket.username = username;
    users[username] = socket.id;
    console.log(`🟢 ${username} connected`);
    io.emit("users", Object.keys(users));
  });

  socket.on("private message", ({ to, message }) => {
    const targetId = users[to];
    if (targetId) {
      io.to(targetId).emit("private message", { from: socket.username, message });
    }
  });

  socket.on("disconnect", () => {
    if (socket.username) {
      console.log(`🔴 ${socket.username} disconnected`);
      delete users[socket.username];
      io.emit("users", Object.keys(users));
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, "0.0.0.0", () => console.log(`🚀 Server running on port ${PORT}`));
