import express from "express";
import "dotenv/config"; // loads .env variables
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 10000;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

app.use(cors());
app.use(express.json());

// =========================
// Test root route
// =========================
app.get("/", (req, res) => {
  res.send("AI Proxy Online");
});

// =========================
// Chat endpoint
// =========================
app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) return res.json({ reply: "No message received" });

    if (!GEMINI_API_KEY) {
      return res.json({ reply: "GEMINI_API_KEY not set" });
    }

    // =========================
    // Call Gemini API via fetch
    // =========================
    const response = await fetch(
      "https://generativeai.googleapis.com/v1beta2/models/gemini-1.5:generateText",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${GEMINI_API_KEY}`,
        },
        body: JSON.stringify({
          prompt: message,
          temperature: 0.7,
          maxOutputTokens: 200
        }),
      }
    );

    const data = await response.json();

    // Gemini returns text in data.candidates[0].output
    const reply = data?.candidates?.[0]?.output?.content || "No response from AI";

    res.json({ reply });

  } catch (err) {
    console.error("Error in /chat:", err);
    res.json({ reply: "Error contacting AI" });
  }
});

// =========================
// Start server
// =========================
app.listen(PORT, () => {
  console.log(`AI Proxy running on port ${PORT}`);
});
