import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
const PORT = process.env.PORT || 10000;

// Middleware
app.use(cors());
app.use(express.json());

// Endpoint for your front-end to call
app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: "No message provided" });

    // Call Gemini API
    const response = await fetch("https://api.generativeai.googleapis.com/v1beta2/models/text-bison-001:generateMessage", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GEMINI_API_KEY}`,
      },
      body: JSON.stringify({ input: message }),
    });

    if (!response.ok) {
      const text = await response.text();
      return res.status(response.status).json({ error: text });
    }

    const data = await response.json();
    res.json({ reply: data.reply || "No reply from Gemini." });

  } catch (err) {
    console.error("Error contacting Gemini API:", err);
    res.status(500).json({ error: "Unable to contact AI proxy." });
  }
});

app.listen(PORT, () => {
  console.log(`Gemini proxy running on port ${PORT}`);
});
