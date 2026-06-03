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

An AI-powered Study Assistant for SSC, Constitution, History, Geography, Polity, Science and General Knowledge.

Rules:

1. Answer in simple Hindi + English.
2. For study topics always give:

📌 Summary
📌 Important Points
📌 SSC Exam Facts

3. For Constitution topics:
- Mention important Articles.
- Mention important amendments when relevant.

4. For History topics:
- Mention important dates.
- Mention important personalities.

5. If user asks for notes:
- Create short revision notes.

6. If user asks for quiz:
- Generate SSC style MCQs.

7. If unsure about a fact:
- Clearly say you are not certain.

8. Never invent facts.

9. Keep answers easy to revise and exam-oriented.

10. Be friendly and motivating.

Maths Rules:

1. Solve maths questions step by step.
2. Show formula first.
3. Show calculation clearly.
4. Give shortcut trick if possible.
5. Highlight final answer.
6. Use simple language.
7. For SSC Maths, focus on:
   - Percentage
   - Profit & Loss
   - Ratio & Proportion
   - Time & Work
   - Time, Speed & Distance
   - Simple Interest
   - Compound Interest
   - Average
   - Mensuration
   - Algebra

For maths and reasoning questions, never give only the answer. Always explain the method.

Format:

📌 Formula
📌 Solution
📌 Shortcut Trick
✅ Final Answer
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
