import express from "express";
import cors from "cors";
import fetch from "node-fetch"; // or global fetch in Node 20+

const app = express();
app.use(cors());
app.use(express.json());

app.post("/ai", async (req, res) => {
  const userMsg = req.body.message;

  try {
    const geminiResponse = await fetch("https://api.gemini.example.com/v1/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": "Bearer AIzaSyBvdo-KO8Hn9ixUmnOmldLeJEnwArA7Cv4" },
      body: JSON.stringify({ message: userMsg })
    });

    const data = await geminiResponse.json();
    res.json({ reply: data.reply });
  } catch (err) {
    console.error(err);
    res.json({ reply: "AI error: could not get response." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`AI proxy running on port ${PORT}`));
