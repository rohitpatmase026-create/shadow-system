require("dotenv").config();[cite: 4]

const express = require("express");[cite: 4]
const cors = require("cors");[cite: 4]
const path = require("path");[cite: 4]

const app = express();[cite: 4]

// ======================
// MIDDLEWARE
// ======================

app.use(cors());[cite: 4]
app.use(express.json());[cite: 4]
app.use(express.static(path.join(__dirname, "public")));[cite: 4]

// ======================
// CHAT API
// ======================

app.post("/api/chat", async (req, res) => {[cite: 4]
  try {
    const { message, memory = [] } = req.body;[cite: 4]

    // SYSTEM PROMPT (Gemini-like Explanation Style)
    const messages = [
      {
        role: "system",
        content: `You are SHADOW OS ⚔, an authentic, helpful, and highly intelligent AI assistant.

Your Response Style Guidelines:
1. EXPLAIN CLEARLY: Explain concepts in a clear, structured, friendly, and easy-to-understand manner (like a supportive collaborator).
2. MATCH USER'S LANGUAGE: Always detect the user's language/script automatically and reply in the EXACT SAME language (Hindi in Devanagari, Hinglish, Marathi, English, etc.).
3. BALANCED & STRUCTURED: Use bullet points, short paragraphs, or step-by-step breakdowns when explaining complex topics. Avoid unnecessary long lectures, but make sure to explain enough so the user understands completely.
4. NATURAL & HUMBLE: Be conversational, supportive, and natural. Avoid sounding robotic, cold, or overly formal.`,
      },

      // MEMORY
      ...memory.slice(-10),[cite: 4]

      // USER MESSAGE
      {
        role: "user",
        content: message,[cite: 4]
      },
    ];

    // GROQ API
    const response = await fetch([cite: 4]
      "https://api.groq.com/openai/v1/chat/completions",[cite: 4]

      {
        method: "POST",[cite: 4]

        headers: {
          "Content-Type": "application/json",[cite: 4]
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,[cite: 4]
        },

        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",[cite: 4]
          messages: messages,[cite: 4]
          temperature: 0.6, // दोस्ताना और अच्छे एक्सप्लेनेशन के लिए
          max_tokens: 1000,   // पर्याप्त विस्तार से समझाने के लिए
        }),
      }
    );

    const data = await response.json();[cite: 4]

    console.log(data);[cite: 4]

    const reply = data?.choices?.[0]?.message?.content || "⚠ No response";[cite: 4]

    res.json({
      reply,[cite: 4]
    });
  } catch (error) {
    console.log(error);[cite: 4]

    res.status(500).json({
      reply: "⚠ SHADOW OS ERROR",[cite: 4]
    });
  }
});

// ======================
// START SERVER
// ======================

const PORT = process.env.PORT || 3000;[cite: 4]

app.listen(PORT, () => {
  console.log(`⚔ SHADOW OS running on port ${PORT}`);[cite: 4]
});
