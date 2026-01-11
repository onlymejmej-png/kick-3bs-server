const express = require("express");
const app = express();

app.use(express.json());

let currentWord = null;

// للتأكد إن السيرفر شغال
app.get("/", (req, res) => {
  res.send("3BS Kick Server is running ✅");
});

// وضع كلمة الفوز
app.post("/set-word", (req, res) => {
  const { word } = req.body;

  if (!word) {
    return res.status(400).json({ error: "No word provided" });
  }

  currentWord = word;
  console.log("New winning word:", word);

  res.json({ success: true, word });
});

// فحص الكلمة الحالية (مؤقت)
app.get("/current-word", (req, res) => {
  res.json({ word: currentWord });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
