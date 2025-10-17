const socket = io();
let username = prompt("Nhập tên của bạn:");
socket.emit("join", username);

const messages = document.getElementById("messages");
const msgInput = document.getElementById("msg");
const sendBtn = document.getElementById("send");
const emojiBtn = document.getElementById("emoji");

const emojis = ["😊", "❤️", "👍", "🎉"];

emojiBtn.onclick = () => {
  const emoji = emojis[Math.floor(Math.random() * emojis.length)];
  msgInput.value += emoji;
  msgInput.focus();
};

sendBtn.onclick = sendMessage;
msgInput.addEventListener("keypress", (e) => e.key === "Enter" && sendMessage());

socket.on("chatMessage", ({ user, msg }) => {
  addMessage(`${user}: ${msg}`, user === username);
  if (user !== username) showNotification(`${user}: ${msg}`);
});

socket.on("notification", (text) => addMessage(`🔔 ${text}`, false));

function sendMessage() {
  const msg = msgInput.value.trim();
  if (!msg) return;
  socket.emit("chatMessage", msg);
  msgInput.value = "";
}

function addMessage(text, isYou) {
  const div = document.createElement("div");
  div.classList.add("message");
  if (isYou) div.classList.add("you");
  div.textContent = text;
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
}

function showNotification(text) {
  if (Notification.permission === "granted") {
    new Notification("Tin nhắn mới", { body: text });
  } else if (Notification.permission !== "denied") {
    Notification.requestPermission().then((p) => {
      if (p === "granted") new Notification("Tin nhắn mới", { body: text });
    });
  }
}
