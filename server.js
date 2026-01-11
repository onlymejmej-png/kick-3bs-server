const express = require("express");
const WebSocket = require("ws");

const app = express();
app.use(express.json());

let currentWord = null;
let gameActive = false;
let winnerData = null;
let roundStartTime = null;

// ==================
// API ROUTES
// ==================

app.get("/", (req, res) => {
  res.send("3BS Kick Server is running ✅");
});

app.post("/set-word", (req, res) => {
  const { word } = req.body;

  if (!word) {
    return res.status(400).json({ error: "No word provided" });
  }

  currentWord = word.toLowerCase();
  gameActive = true;
  winnerData = null;
  roundStartTime = Date.now();

  console.log("🎯 New round word:", currentWord);

  res.json({ success: true });
});

app.get("/last-win", (req, res) => {
  res.json(winnerData);
});

// ==================
// KICK CHAT WEBSOCKET
// ==================

const channelName = "absi"; // اسم قناة Kick
const kickWsUrl = `wss://chat.kick.com/chatroom/${channelName}`;

console.log("🔌 Connecting to Kick chat:", channelName);

const ws = new WebSocket(kickWsUrl);

ws.on("open", () => {
  console.log("✅ Connected to Kick chat");
});

ws.on("message", (data) => {
  try {
    const message = JSON.parse(data.toString());

    // نتأكد إنها رسالة شات
    if (!message?.data?.content || !message?.data?.sender?.username) return;

    const chatMessage = message.data.content.toLowerCase().trim();
    const username = message.data.sender.username;

    if (!gameActive || !currentWord) return;
    if (winnerData) return;

    if (chatMessage === currentWord) {
      const duration = Math.floor((Date.now() - roundStartTime) / 1000);

      winnerData = {
        word: currentWord,
        winner: username,
        duration,
        hintsUsed: 0, // أنت تحسبها من الواجهة
        date: new Date().toLocaleString()
      };

      gameActive = false;

      console.log("🏆 WINNER:", winnerData);
    }
  } catch (err) {
    console.error("❌ Kick message error:", err.message);
  }
});

ws.on("close", () => {
  console.log("❌ Disconnected from Kick chat");
});

ws.on("error", (err) => {
  console.error("❌ WebSocket error:", err.message);
});

// ==================

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("🚀 Server running on port", PORT);
});
