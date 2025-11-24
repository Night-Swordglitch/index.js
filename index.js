// =========================
// JARVIS AI Proxy (CommonJS)
// =========================

const express = require("express");
const https = require("https");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
app.use(express.json());

const PORT = 10000;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Simple AI proxy POST endpoint
app.post("/chat", (req, res) => {
  const userMessage = req.body.message;

  if (!userMessage) return res.status(400).json({ reply: "No message received." });

  // Gemini API request options
  const data = JSON.stringify({
    prompt: userMessage,
    temperature: 0.7,
    maxOutputTokens: 200
  });

  const options = {
    hostname: "generativeai.googleapis.com",
    path: "/v1beta2/models/gemini-1.5:generateText",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${GEMINI_API_KEY}`
    }
  };

  const request = https.request(options, (response) => {
    let body = "";
    response.on("data", chunk => (body += chunk));
    response.on("end", () => {
      try {
        const json = JSON.parse(body);
        const reply = json.candidates?.[0]?.content || "No response from AI";
        res.json({ reply });
      } catch (err) {
        console.error("Error parsing Gemini response:", err);
        res.json({ reply: "Error parsing AI response." });
      }
    });
  });

  request.on("error", (err) => {
    console.error("HTTPS request error:", err);
    res.json({ reply: "Error contacting AI API." });
  });

  request.write(data);
  request.end();
});

// Keep server alive
app.listen(PORT, () => console.log(`JARVIS AI Proxy running on port ${PORT}`));
