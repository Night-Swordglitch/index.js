import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 10000;

app.post("/ai", async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: "No message provided" });

  try {
    const response = await fetch(
      "https://generativeai.googleapis.com/v1beta2/models/gemini-1.5:generateText",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.GEMINI_API_KEY}`
        },
        body: JSON.stringify({
          prompt: message,
          temperature: 0.7,
          maxOutputTokens: 512
        })
      }
    );

    const data = await response.json();
    // Adjust according to actual Gemini API response structure
    const aiText = data?.candidates?.[0]?.content || "No response from Gemini";
    res.json({ reply: aiText });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch from Gemini" });
  }
});

app.listen(PORT, () => {
  console.log(`AI proxy running on port ${PORT}`);
});
