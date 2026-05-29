require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

const PORT = process.env.PORT || 3000;

// ======================
// MIDDLEWARE
// ======================

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, "public")));

// ======================
// HOME ROUTE
// ======================

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ======================
// CHAT API
// ======================

app.post("/api/chat", async (req, res) => {
  try {

    const { message, memory = [] } = req.body;

    const messages = [
      {
        role: "system",
        content: `
You are SHADOW OS ⚔

A futuristic cinematic AI assistant.

RULES:

1. Always give beautiful formatted replies.

2. Use:
- headings
- bullet points
- spacing
- sections

3. Never give boring one-line replies.

4. Speak naturally in:
- English
- Hindi
- Hinglish

5. Never say you are ChatGPT unless necessary.

6. Make replies feel premium and modern.
`
      },

      ...memory,

      {
        role: "user",
        content: message
      }
    ];

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",

          Authorization: `Bearer ${process.env.GROQ_API_KEY}`
        },

        body: JSON.stringify({
          model: "llama3-70b-8192",

          messages,

          temperature: 0.8,

          max_tokens: 1000
        })
      }
    );

    const data = await response.json();

    console.log(data);

    const reply =
      data?.choices?.[0]?.message?.content ||
      "⚠ SYSTEM ERROR";

    res.json({ reply });

  } catch (error) {

    console.log(error);

    res.json({
      reply: "⚠ SYSTEM ERROR"
    });
  }
});

// ======================
// START SERVER
// ======================

app.listen(PORT, () => {
  console.log(`⚔ SHADOW OS running on port ${PORT}`);
});
