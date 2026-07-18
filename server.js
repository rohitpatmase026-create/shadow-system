require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

// Agar Node v18 se lower version hai, toh node-fetch module crash hone se bachayega
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const app = express();

// MIDDLEWARES
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// CHAT ROUTE
app.post("/api/chat", async (req, res) => {
  try {
    const { message, memory = [] } = req.body;

    // FUTURISTIC SYSTEM PROMPT
    const messages = [
      {
        role: "system",
        content: `
You are SHADOW OS ⚔
A smart futuristic AI assistant.
Talk naturally and intelligently.
Be friendly, modern, and helpful.
Do not act like a robot.
Use formatting only when useful.
Never say you are ChatGPT unless necessary.
`,
      },
      // LAST 10 CONVERSATIONS MEMORY LIMIT
      ...memory.slice(-10),
      {
        role: "user",
        content: message,
      },
    ];

    // GROQ ENDPOINT REQUEST
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: messages,
        temperature: 0.7,
        max_tokens: 2048,
      }),
    });

    const data = await response.json();
    const reply = data?.choices?.[0]?.message?.content || "⚠ No response from core.";

    res.json({ reply });
  } catch (error) {
    console.error("SHADOW SYSTEM ERR:", error);
    res.status(500).json({ reply: "⚠ SHADOW OS INTERACTION ERROR" });
  }
});

// INITIALIZATION
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`⚔ SHADOW OS running smoothly on port ${PORT}`);
});
