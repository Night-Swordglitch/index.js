import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';

const app = express();
app.use(cors());
app.use(express.json());

const GEMINI_KEY = process.env.GEMINI_API_KEY; // from Render env variables
const PORT = process.env.PORT || 10000;

// Basic health check
app.get('/', (req, res) => res.send('Gemini proxy is running'));

// AI chat endpoint
app.post('/ai', async (req, res) => {
  const { message } = req.body;

  if (!message) return res.json({ reply: "No message provided" });

  try {
    const response = await fetch('https://api.generativeai.google/v1/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GEMINI_KEY}`
      },
      body: JSON.stringify({
        prompt: message,
        // optional: you can configure model, temperature, etc.
        model: 'gemini-1.5',
        temperature: 0.7,
        max_output_tokens: 500
      })
    });

    const data = await response.json();
    const reply = data?.response || data?.candidates?.[0]?.content || "No reply from Gemini";

    res.json({ reply });

  } catch (err) {
    console.error("Proxy AI error:", err);
    res.json({ reply: "No reply from Gemini" });
  }
});

app.listen(PORT, () => console.log(`Gemini proxy running on port ${PORT}`));
