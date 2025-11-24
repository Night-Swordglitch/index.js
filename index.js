// index.js (CommonJS) — AI proxy for local dev
require("dotenv").config();
const express = require("express");
const https = require("https");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 10000;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// quick health check
app.get("/", (req, res) => res.send("AI Proxy Online"));

// POST /chat  -> friendly proxy to PaLM / Generative API
app.post("/chat", (req, res) => {
  const userMessage = req.body.message;
  if (!userMessage) return res.status(400).json({ reply: "No message provided" });

  if (!GEMINI_API_KEY) {
    console.error("Missing GEMINI_API_KEY in environment");
    return res.status(500).json({ reply: "GEMINI_API_KEY not set" });
  }

  // Use a stable v1 endpoint (text-bison as example). If you have a different model, swap here.
  const hostname = "generativeai.googleapis.com";
  const path = "/v1/models/text-bison-001:generateMessage";

  // Build payload per the v1 generateMessage format
  const payloadObj = {
    messages: [{ author: "user", content: userMessage }],
    temperature: 0.7,
    candidateCount: 1
  };
  const postData = JSON.stringify(payloadObj);

  const options = {
    hostname,
    path,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(postData),
      "Authorization": `Bearer ${GEMINI_API_KEY}`
    }
  };

  const request = https.request(options, (response) => {
    let body = "";
    response.on("data", (chunk) => (body += chunk));
    response.on("end", () => {
      // If non-JSON response (HTML error), return readable error
      if (!body) return res.status(500).json({ reply: "Empty response from upstream" });

      try {
        const json = JSON.parse(body);

        // Try multiple possible response shapes:
        // 1) data.candidates[0].content[0].text  (typical generateMessage)
        // 2) fallback to candidates[0].output or .text
        let reply = "No response from AI";

        if (json?.candidates?.[0]) {
          const cand = json.candidates[0];
          // structure: candidates[0].content[0].text
          if (cand?.content?.[0]?.text) reply = cand.content[0].text;
          else if (cand?.output) reply = cand.output;
          else if (cand?.text) reply = cand.text;
        } else if (json?.output?.[0]?.content) {
          reply = json.output[0].content;
        } else if (json?.message?.content?.[0]?.text) {
          reply = json.message.content[0].text;
        }

        return res.json({ reply });
      } catch (err) {
        // upstream did not return JSON (HTML error, 404, etc.)
        console.error("Upstream response parse error:", err);
        console.error("Raw body:", body);
        return res.status(502).json({ reply: "Upstream error: " + body.slice(0, 500) });
      }
    });
  });

  request.on("error", (err) => {
    console.error("HTTPS request error:", err);
    res.status(502).json({ reply: "Error contacting AI API: " + err.message });
  });

  request.write(postData);
  request.end();
});

// start
app.listen(PORT, () => {
  console.log(`JARVIS AI Proxy running on port ${PORT}`);
});
