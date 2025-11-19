import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Jarvis Gemini Proxy is running.");
});

app.post("/ai", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "No message provided." });
    }

    // ---- Gemini URL ----
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`;

    // ---- Gemini API Call ----
    const response = await fetch(url, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: message }] }]
      })
    });

    const data = await response.json();

    if (!data || !data.candidates || !data.candidates[0]) {
      return res.json({ reply: "Gemini returned no response." });
    }

    const reply = data.candidates[0].content.parts[0].text;

    res.json({ reply });
  } catch (err) {
    console.error("Server error:", err);
    res.json({ reply: "Error: Unable to contact AI proxy." });
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Gemini proxy running on port", process.env.PORT || 3000);
});
