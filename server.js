const express = require("express");
const app = express();

app.use(express.json());

// ==========================
// GAME STATE
// ==========================
let currentWord = null;
let gameActive = false;
let winnerData = null;
let roundStartTime = null;

let messages = []; // شات اللعبة
const MAX_MESSAGES = 100;

// ==========================
// ROUTES
// ==========================

// فحص السيرفر
app.get("/", (req, res) => {
  res.send("3BS Game Server is running ✅");
});

// بدء جولة جديدة
app.post("/set-word", (req, res) => {
  const { word } = req.body;

  if (!word) {
    return res.status(400).json({ error: "No word provided" });
  }

  currentWord = word.toLowerCase().trim();
  gameActive = true;
  winnerData = null;
  roundStartTime = Date.now();
  messages = [];

  console.log("🎯 New round word:", currentWord);

  res.json({ success: true });
});

// إرسال رسالة / تخمين
app.post("/send-message", (req, res) => {
  const { username, message } = req.body;

  if (!username || !message) {
    return res.status(400).json({ error: "Missing data" });
  }

  if (!gameActive) {
    return res.json({ ignored: true });
  }

  const cleanMessage = message.toLowerCase().trim();

  const msgObj = {
    username,
    message,
    time: Date.now()
  };

  messages.push(msgObj);

  if (messages.length > MAX_MESSAGES) {
    messages.shift();
  }

  // تحقق من الفوز
  if (!winnerData && cleanMessage === currentWord) {
    const duration = Math.floor((Date.now() - roundStartTime) / 1000);

    winnerData = {
      winner: username,
      word: currentWord,
      duration,
      date: new Date().toLocaleString()
    };

    gameActive = false;

    console.log("🏆 WINNER:", winnerData);
  }

  res.json({ success: true });
});

// جلب رسائل الشات
app.get("/messages", (req, res) => {
  res.json(messages);
});

// جلب آخر فائز
app.get("/last-win", (req, res) => {
  res.json(winnerData);
});

// ==========================

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("🚀 Server running on port", PORT);
});
