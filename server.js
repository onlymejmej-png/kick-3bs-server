const express = require("express");
const app = express();

app.use(express.json());

let roundActive = false;
let winnerDeclared = false;

let currentRound = null;
let lastWin = null;
let rounds = [];

// اختبار السيرفر
app.get("/", (req, res) => {
  res.send("3BS Kick Server is running ✅");
});

// بدء جولة جديدة
app.post("/start-round", (req, res) => {
  const { word } = req.body;

  if (!word) {
    return res.status(400).json({ error: "Word required" });
  }

  currentRound = {
    word,
    startTime: Date.now(),
    hintsUsed: 0,
  };

  roundActive = true;
  winnerDeclared = false;

  res.json({ success: true, message: "Round started", word });
});

// استقبال رسالة (محاكاة رسالة Kick)
app.post("/chat-message", (req, res) => {
  const { username, message } = req.body;

  if (!roundActive || winnerDeclared) {
    return res.json({ ignored: true });
  }

  if (
    message.toLowerCase() === currentRound.word.toLowerCase()
  ) {
    winnerDeclared = true;
    roundActive = false;

    const endTime = Date.now();
    const duration = Math.floor(
      (endTime - currentRound.startTime) / 1000
    );

    const winData = {
      word: currentRound.word,
      duration,
      hintsUsed: currentRound.hintsUsed,
      date: new Date().toISOString().split("T")[0],
      winner: username,
    };

    lastWin = winData;
    rounds.push(winData);

    return res.json({
      win: true,
      data: winData,
    });
  }

  res.json({ win: false });
});

// آخر فوز
app.get("/last-win", (req, res) => {
  res.json(lastWin);
});

// سجل الجولات
app.get("/rounds", (req, res) => {
  res.json({
    totalRounds: rounds.length,
    wins: rounds.length,
    rounds,
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
