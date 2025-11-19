import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 10000;

// Middleware
app.use(cors());
app.use(express.json());

// Gemini API endpoint (update if your model/region is different)
const GEMINI_URL = "https://generativeai.googleapis.com/v1beta2/models/text-bison-001:generateMessage";

// Health check
app.get("/", (req, res) => {
  res.send("Gemini proxy is running");
});

// Endpoint to forward user messages to Gemini
app.post("/chat", async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: "No message provided" });
  }

  try {
    const response = await fetch(GEMINI_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GEMINI_API_KEY}`,
      },
      body: JSON.stringify({
        prompt: message,
        temperature: 0.7,
        maxOutputTokens: 256
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("Gemini API error:", text);
      return res.status(response.status).json({ error: "Gemini API error", details: text });
    }

    const data = await response.json();

    // Adjust depending on Gemini's response format
    const reply = data?.candidates?.[0]?.content || "No response from Gemini";

    res.json({ reply });
  } catch (err) {
    console.error("Error contacting Gemini:", err);
    res.status(500).json({ error: "Failed to contact Gemini", details: err.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Gemini proxy running on port ${PORT}`);
});
