const express = require("express");

const app = express();
app.use(express.json());

// ==================
// GAME STATE
// ==================
let currentWord = null;
let gameActive = false;
let winnerData = null;
let roundStartTime = null;
let totalRounds = 0;
let winningRounds = 0;
let roundsHistory = [];

// ==================
// ROUTES
// ==================

// فحص السيرفر
app.get("/", (req, res) => {
  res.send("3BS Kick Server is running ✅");
});

// بدء جولة جديدة
app.post("/set-word", (req, res) => {
  const { word } = req.body;

  if (!word) {
    return res.status(400).json({ error: "No word provided" });
  }

  currentWord = word.toLowerCase();
  gameActive = true;
  winnerData = null;
  roundStartTime = Date.now();
  totalRounds++;

  console.log("🎯 New round started:", currentWord);

  res.json({ success: true });
});

// تسجيل فوز (يأتي من الواجهة)
app.post("/report-win", (req, res) => {
  if (!gameActive || winnerData) {
    return res.json({ ignored: true });
  }

  const { winner, hintsUsed = 0 } = req.body;

  if (!winner) {
    return res.status(400).json({ error: "No winner name" });
  }

  const duration = Math.floor((Date.now() - roundStartTime) / 1000);

  winnerData = {
    word: currentWord,
    winner,
    duration,
    hintsUsed,
    date: new Date().toLocaleString()
  };

  gameActive = false;
  winningRounds++;

  roundsHistory.push(winnerData);

  console.log("🏆 WINNER:", winnerData);

  res.json({ success: true, winnerData });
});

// آخر فوز
app.get("/last-win", (req, res) => {
  res.json(winnerData);
});

// سجل الجولات
app.get("/stats", (req, res) => {
  res.json({
    totalRounds,
    winningRounds,
    winRate:
      totalRounds === 0
        ? 0
        : Math.round((winningRounds / totalRounds) * 100),
    roundsHistory
  });
});

// إعادة الإحصائيات
app.post("/reset-stats", (req, res) => {
  totalRounds = 0;
  winningRounds = 0;
  roundsHistory = [];
  winnerData = null;

  res.json({ success: true });
});

// ==================

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("🚀 Server running on port", PORT);
});
