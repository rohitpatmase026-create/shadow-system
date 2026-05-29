require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

// ======================
// MIDDLEWARE
// ======================

app.use(cors());

app.use(express.json());

app.use(express.static(path.join(__dirname, "public")));

// ======================
// CHAT API
// ======================

app.post("/api/chat", async (req, res) => {
  try {
    const { message, memory = [] } = req.body;

    // SYSTEM PROMPT

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

      // MEMORY

      ...memory.slice(-10),

      // USER MESSAGE

      {
        role: "user",
        content: message,
      },
    ];

    // GROQ API

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",

      {
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
      }
    );

    const data = await response.json();

    console.log(data);

    const reply = data?.choices?.[0]?.message?.content || "⚠ No response";

    res.json({
      reply,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      reply: "⚠ SHADOW OS ERROR",
    });
  }
});

// ======================
// START SERVER
// ======================

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`⚔ SHADOW OS running on port ${PORT}`);
});
