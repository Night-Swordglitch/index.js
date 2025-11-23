// index.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Gemini API key from environment
const GEMINI_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_KEY) {
  console.error("ERROR: GEMINI_API_KEY not set in environment");
  process.exit(1);
}

const GEMINI_URL = "https://generativeai.googleapis.com/v1beta2/models/gemini-1.5:generateText";

// AI proxy endpoint
app.post("/ai", async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: "No message provided" });

  try {
    // Node 20+ native fetch
    const response = await fetch(GEMINI_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${GEMINI_KEY}`,
      },
      body: JSON.stringify({
        prompt: message,
        temperature: 0.7,
        maxOutputTokens: 512
      }),
    });

    const data = await response.json();
    const aiText = data?.candidates?.[0]?.content || "No response from Gemini";

    res.json({ reply: aiText });
  } catch (err) {
    console.error("Failed to fetch from Gemini:", err);
    res.status(500).json({ error: "Failed to fetch from Gemini", details: err.message });
  }
});

// Port from Render or fallback to 10000 for local testing
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`AI proxy running on port ${PORT}`);
});
