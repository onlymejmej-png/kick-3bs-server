const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;

/* ====== CORS (حل المشكلة الأساسية) ====== */
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

app.use(express.json());

/* ====== حالة اللعبة ====== */
let currentWord = null;
let lastWinner = null;

/* ====== الصفحة الرئيسية ====== */
app.get("/", (req, res) => {
  res.send("3BS Kick Server is running ✅");
});

/* ====== تعيين الكلمة ====== */
app.post("/set-word", (req, res) => {
  const { word } = req.body;

  if (!word) {
    return res.status(400).json({ error: "No word provided" });
  }

  currentWord = word.toLowerCase().trim();
  lastWinner = null;

  console.log("🎯 New word set:", currentWord);
  res.json({ success: true });
});

/* ====== تسجيل فائز ====== */
app.post("/win", (req, res) => {
  const { username } = req.body;

  if (!username) {
    return res.status(400).json({ error: "No username" });
  }

  lastWinner = username;
  console.log("🏆 Winner:", username);

  res.json({ success: true });
});

/* ====== جلب آخر فائز ====== */
app.get("/last-win", (req, res) => {
  res.json({ winner: lastWinner });
});

/* ====== تشغيل السيرفر ====== */
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
