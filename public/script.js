const input = document.getElementById("input");
const sendBtn = document.getElementById("send");
const micBtn = document.getElementById("mic");
const chatBox = document.getElementById("chat-box");

// MEMORY INITIALIZATION
let memory = JSON.parse(localStorage.getItem("shadowMemory")) || [];

// TEXT TO SPEECH (VOICE OUTPUT) FUNCTION
function speak(text) {
  // Agar pehle se kuch bol raha hai toh use stop karo
  window.speechSynthesis.cancel();

  // HTML tags ko remove karne ke liye taaki text plain read ho
  const cleanText = text.replace(/<\/?[^>]+(>|$)/g, "").replace(/⚔|⚠/g, "");

  const utterance = new SpeechSynthesisUtterance(cleanText);
  
  // Voice customization (Futuristic feel ke liye)
  const voices = window.speechSynthesis.getVoices();
  // Koi acchi English voice select karne ki koshish (jaise Google US English)
  const selectedVoice = voices.find(voice => voice.name.includes("Google") || voice.lang === "en-US");
  if (selectedVoice) utterance.voice = selectedVoice;

  utterance.pitch = 0.85; // Thoda deep aur futuristic cinematic sound ke liye
  utterance.rate = 1.0;   // Normal speed

  window.speechSynthesis.speak(utterance);
}

// SEND MESSAGE FUNCTION
async function sendMessage() {
  const message = input.value.trim();
  if (!message) return;

  // USER MESSAGE TO UI
  const userMsg = document.createElement("div");
  userMsg.className = "user-message";
  userMsg.innerHTML = message;
  chatBox.appendChild(userMsg);

  // SAVE TO LOCAL MEMORY
  memory.push({ role: "user", content: message });
  localStorage.setItem("shadowMemory", JSON.stringify(memory));

  input.value = "";

  // THINKING EFFECT
  const loading = document.createElement("div");
  loading.className = "ai-message thinking";
  loading.innerHTML = `
    <div class="thinking-text">⚔ SHADOW OS is thinking</div>
    <div class="typing-dots">
      <span></span>
      <span></span>
      <span></span>
    </div>
  `;
  chatBox.appendChild(loading);
  chatBox.scrollTop = chatBox.scrollHeight;

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, memory })
    });

    const data = await response.json();
    loading.remove();

    // AI MESSAGE TO UI
    const aiMsg = document.createElement("div");
    aiMsg.className = "ai-message";
    aiMsg.innerHTML = "⚔ SHADOW OS<br><br>" + data.reply;
    chatBox.appendChild(aiMsg);

    // SPEAK THE AI REPLY (Voice Output Trigger)
    speak(data.reply);

    // SAVE AI REPLY TO MEMORY
    memory.push({ role: "assistant", content: data.reply });
    localStorage.setItem("shadowMemory", JSON.stringify(memory));

    chatBox.scrollTop = chatBox.scrollHeight;
  } catch (error) {
    loading.remove();
    const errorMsg = document.createElement("div");
    errorMsg.className = "ai-message";
    errorMsg.innerHTML = "⚠ SYSTEM ERROR";
    chatBox.appendChild(errorMsg);
    speak("System Error");
  }
}

// EVENTS
sendBtn.addEventListener("click", sendMessage);
input.addEventListener("keydown", function (e) {
  if (e.key === "Enter") {
    sendMessage();
  }
});

// VOICE SPEECH INTEGRATION (Speech-To-Text)
if ("webkitSpeechRecognition" in window) {
  const recognition = new webkitSpeechRecognition();
  recognition.lang = "en-US";

  micBtn.addEventListener("click", () => {
    micBtn.style.background = "rgba(255, 0, 0, 0.2)"; // Active hone par red glow tint
    recognition.start();
  });

  recognition.onresult = function (event) {
    input.value = event.results[0][0].transcript;
    micBtn.style.background = "rgba(255, 255, 255, 0.05)"; // Reset back to theme
    sendMessage(); // Option: text aate hi auto send ho jaye
  };

  recognition.onerror = function() {
    micBtn.style.background = "rgba(255, 255, 255, 0.05)";
  };

  recognition.onend = function() {
    micBtn.style.background = "rgba(255, 255, 255, 0.05)";
  };
}

// Voices ko asynchronously load karne ke liye chrome support
window.speechSynthesis.onvoiceschanged = () => {
  window.speechSynthesis.getVoices();
};
