// index.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 10000;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

app.use(cors());
app.use(express.json());

// Simple test route
app.get("/", (req, res) => {
  res.send("AI proxy is online");
});

// Chat route
app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.json({ reply: "No message received" });

    const apiUrl = "https://generativeai.googleapis.com/v1/models/text-bison-001:generateMessage";

    const payload = {
      messages: [{ author: "user", content: message }],
      temperature: 0.7,
      candidateCount: 1
    };

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${GEMINI_API_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    console.log("Gemini response:", JSON.stringify(data, null, 2));

    const reply = data?.candidates?.[0]?.content?.[0]?.text || "No response from AI";
    res.json({ reply });

  } catch (err) {
    console.error("Error in /chat:", err);
    res.json({ reply: "Error contacting AI: " + err.message });
  }
});

app.listen(PORT, () => {
  console.log(`AI proxy running on port ${PORT}`);
});
