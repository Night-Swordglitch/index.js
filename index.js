import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// MAIN CHAT ROUTE
app.post("/chat", async (req, res) => {
  try {
    const userText = req.body.text;

    if (!userText) {
      return res.status(400).json({ error: "No user text provided" });
    }

    // Send to Gemini
    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [{ text: userText }]
        }
      ]
    });

    const aiReply = result.response.text();

    console.log("AI replied:", aiReply);

    res.json({ reply: aiReply });

  } catch (err) {
    console.error("Gemini Error:", err);
    res.status(500).json({ error: "Gemini returned no response" });
  }
});

app.get("/", (req, res) => {
  res.send("JARVIS AI Proxy is running");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
