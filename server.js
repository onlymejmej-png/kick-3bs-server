const express = require("express");
const WebSocket = require("ws");

const app = express();
app.use(express.json());

// ==================
// GAME STATE
// ==================
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

// بدء جولة جديدة + إرسال الكلمة
app.post("/set-word", (req, res) => {
  const { word } = req.body;

  if (!word) {
    return res.status(400).json({ error: "No word provided" });
  }

  currentWord = word.toLowerCase().trim();
  gameActive = true;
  winnerData = null;
  roundStartTime = Date.now();

  console.log("🎯 New round started. Word:", currentWord);

  res.json({ success: true });
});

// جلب آخر فوز
app.get("/last-win", (req, res) => {
  res.json(winnerData);
});

// ==================
// KICK IRC WEBSOCKET
// ==================

const channelName = "absi"; // اسم قناة Kick
const kickWsUrl = "wss://irc-ws.chat.kick.com";

console.log("🔌 Connecting to Kick IRC chat:", channelName);

const ws = new WebSocket(kickWsUrl);

ws.on("open", () => {
  console.log("✅ Connected to Kick IRC");

  // تسجيل دخول كـ Guest
  ws.send("PASS oauth:anonymous");
  ws.send("NICK justinfan12345");
  ws.send(`JOIN #${channelName}`);
});

ws.on("message", (data) => {
  try {
    const raw = data.toString();

    // رد على PING
    if (raw.startsWith("PING")) {
      ws.send("PONG :kick.com");
      return;
    }

    // نقرأ فقط رسائل الشات
    if (!raw.includes("PRIVMSG")) return;

    // مثال:
    // :username!username@username PRIVMSG #absi :hello
    const parts = raw.split(" ");
    const username = parts[0].split("!")[0].replace(":", "");
    const chatMessage = raw
      .split("PRIVMSG")[1]
      .split(":")
      .slice(1)
      .join(":")
      .toLowerCase()
      .trim();

    if (!gameActive || !currentWord) return;
    if (winnerData) return;

    if (chatMessage === currentWord) {
      const duration = Math.floor((Date.now() - roundStartTime) / 1000);

      winnerData = {
        word: currentWord,
        winner: username,
        duration, // بالثواني
        hintsUsed: 0, // تحسبها من الواجهة
        date: new Date().toLocaleString()
      };

      gameActive = false;

      console.log("🏆 WINNER FOUND:", winnerData);
    }
  } catch (err) {
    console.error("❌ Message parse error:", err.message);
  }
});

ws.on("close", () => {
  console.log("❌ Disconnected from Kick IRC");
});

ws.on("error", (err) => {
  console.error("❌ WebSocket error:", err.message);
});

// ==================
// START SERVER
// ==================

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("🚀 Server running on port", PORT);
});
