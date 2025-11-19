import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';

const app = express();
app.use(cors());
app.use(express.json());

const GEMINI_KEY = process.env.GEMINI_API_KEY; // Set this in Render environment variables
const PORT = process.env.PORT || 10000;

app.get('/', (req, res) => res.send('Gemini proxy running'));

// AI endpoint
app.post('/ai', async (req, res) => {
  const { message } = req.body;
  if (!message) return res.json({ reply: "No message provided" });

  try {
    const response = await fetch('https://generativeai.googleapis.com/v1beta2/models/gemini-1.5:generateText', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GEMINI_KEY}`
      },
      body: JSON.stringify({
        prompt: { text: message },
        temperature: 0.7,
        maxOutputTokens: 500
      })
    });

    const data = await response.json();
    const reply = data?.candidates?.[0]?.content || "No reply from Gemini";
    res.json({ reply });

  } catch (err) {
    console.error("Proxy AI error:", err);
    res.json({ reply: "Error contacting Gemini API" });
  }
});

app.listen(PORT, () => console.log(`Gemini proxy running on port ${PORT}`));
