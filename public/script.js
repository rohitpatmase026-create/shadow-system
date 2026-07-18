const input = document.getElementById("input");
const sendBtn = document.getElementById("send");
const micBtn = document.getElementById("mic");
const chatBox = document.getElementById("chat-box");
const appWrapper = document.getElementById("app");
const historyList = document.getElementById("history-list");
const newChatBtn = document.getElementById("new-chat-btn");

// MULTI-CHAT ARRAY CONFIG
let allChats = JSON.parse(localStorage.getItem("shadowAllChats")) || [];
let currentChatId = localStorage.getItem("shadowCurrentChatId") || null;
let memory = [];

// 1. RENDER CHAT HISTORY SIDEBAR ITEMS
function renderSidebar() {
  historyList.innerHTML = "";
  allChats.forEach(chat => {
    const item = document.createElement("div");
    item.className = `history-item ${chat.id == currentChatId ? 'active' : ''}`;
    // Sidebar list me user ka pehla sawaal dikhega heading ki tarah
    item.innerText = chat.title || "Empty Chat";
    item.addEventListener("click", () => switchChat(chat.id));
    historyList.appendChild(item);
  });
}

// 2. SWITCH TO SPECIFIC CHAT SESSION
function switchChat(chatId) {
  currentChatId = chatId;
  localStorage.setItem("shadowCurrentChatId", chatId);
  
  const selectedChat = allChats.find(c => c.id == chatId);
  if (selectedChat) {
    memory = selectedChat.messages || [];
    chatBox.innerHTML = "";
    appWrapper.classList.remove("initial-state");
    
    // UI par purani messages load karein
    memory.forEach(msg => {
      const msgDiv = document.createElement("div");
      if (msg.role === "user") {
        msgDiv.className = "user-message";
        msgDiv.innerHTML = `<div class="msg-text">${msg.content}</div><button class="speak-msg-btn" onclick="speakFromElement(this)">🔊 Listen</button>`;
      } else {
        msgDiv.className = "ai-message";
        const displayReply = msg.content.startsWith("⚔ SHADOW OS") ? msg.content : `<strong>⚔ SHADOW OS</strong><br><br>${msg.content}`;
        msgDiv.innerHTML = `<div class="msg-text">${displayReply}</div><button class="speak-msg-btn" onclick="speakFromElement(this)">🔊 Listen Reply</button>`;
      }
      chatBox.appendChild(msgDiv);
    });
    chatBox.scrollTop = chatBox.scrollHeight;
  }
  renderSidebar();
}

// 3. START A COMPLETELY NEW CHAT SESSION
function startNewChat() {
  currentChatId = null;
  localStorage.removeItem("shadowCurrentChatId");
  memory = [];
  chatBox.innerHTML = "";
  appWrapper.classList.add("initial-state");
  renderSidebar();
}

// 4. TEXT TO SPEECH ENGINE
function speak(text) {
  window.speechSynthesis.cancel();
  const cleanText = text.replace(/<\/?[^>]+(>|$)/g, "").replace(/⚔|⚠/g, "").replace("SHADOW OS", "");
  const utterance = new SpeechSynthesisUtterance(cleanText);
  const voices = window.speechSynthesis.getVoices();
  const selectedVoice = voices.find(voice => voice.name.includes("Google") || voice.lang === "en-US");
  if (selectedVoice) utterance.voice = selectedVoice;
  utterance.pitch = 0.9;
  utterance.rate = 1.0;
  window.speechSynthesis.speak(utterance);
}

function speakFromElement(buttonElement) {
  const messageText = buttonElement.parentElement.querySelector(".msg-text").innerText;
  speak(messageText);
}

// 5. SEND MESSAGE FUNCTION
async function sendMessage() {
  const message = input.value.trim();
  if (!message) return;

  // Agar pehla message hai toh new session id create karo
  if (!currentChatId) {
    currentChatId = Date.now().toString();
    localStorage.setItem("shadowCurrentChatId", currentChatId);
    
    const newSession = {
      id: currentChatId,
      title: message, // Pehla message title banega
      messages: []
    };
    allChats.unshift(newSession); // New session top par add karo
    appWrapper.classList.remove("initial-state");
  }

  // UI user render
  const userMsg = document.createElement("div");
  userMsg.className = "user-message";
  userMsg.innerHTML = `<div class="msg-text">${message}</div><button class="speak-msg-btn" onclick="speakFromElement(this)">🔊 Listen</button>`;
  chatBox.appendChild(userMsg);

  // Update logic arrays
  memory.push({ role: "user", content: message });
  
  // Current active session ko global chats me synchronize karo
  const chatIdx = allChats.findIndex(c => c.id == currentChatId);
  if (chatIdx !== -1) allChats[chatIdx].messages = memory;
  
  localStorage.setItem("shadowAllChats", JSON.stringify(allChats));
  renderSidebar();

  input.value = "";

  // THINKING LOGIC
  const loading = document.createElement("div");
  loading.className = "ai-message thinking";
  loading.innerHTML = `
    <div class="thinking-text">⚔ SHADOW OS is thinking</div>
    <div class="typing-dots"><span></span><span></span><span></span></div>
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

    // AI DISPLAY RENDERING
    const aiMsg = document.createElement("div");
    aiMsg.className = "ai-message";
    aiMsg.innerHTML = `
      <div class="msg-text"><strong>⚔ SHADOW OS</strong><br><br>${data.reply}</div>
      <button class="speak-msg-btn" onclick="speakFromElement(this)">🔊 Listen Reply</button>
    `;
    chatBox.appendChild(aiMsg);

    speak(data.reply);

    // Save reply status
    memory.push({ role: "assistant", content: data.reply });
    if (chatIdx !== -1) allChats[chatIdx].messages = memory;
    
    localStorage.setItem("shadowAllChats", JSON.stringify(allChats));
    chatBox.scrollTop = chatBox.scrollHeight;
  } catch (error) {
    loading.remove();
    const errorMsg = document.createElement("div");
    errorMsg.className = "ai-message";
    errorMsg.innerHTML = `<div class="msg-text">⚠ SYSTEM ERROR</div><button class="speak-msg-btn" onclick="speakFromElement(this)">🔊 Listen</button>`;
    chatBox.appendChild(errorMsg);
    speak("System Error");
  }
}

// RUN INITIALIZATIONS ON LOAD
newChatBtn.addEventListener("click", startNewChat);
sendBtn.addEventListener("click", sendMessage);
input.addEventListener("keydown", (e) => { if (e.key === "Enter") sendMessage(); });

if (currentChatId) {
  switchChat(currentChatId);
} else {
  renderSidebar();
}

// MIC INTEGRATION (SPEECH-TO-TEXT)
if ("webkitSpeechRecognition" in window) {
  const recognition = new webkitSpeechRecognition();
  recognition.lang = "en-US";
  micBtn.addEventListener("click", () => {
    micBtn.style.background = "rgba(255, 0, 0, 0.2)";
    recognition.start();
  });
  recognition.onresult = (e) => {
    input.value = e.results[0][0].transcript;
    micBtn.style.background = "rgba(255, 255, 255, 0.05)";
    sendMessage();
  };
  recognition.onerror = () => { micBtn.style.background = "rgba(255, 255, 255, 0.05)"; };
  recognition.onend = () => { micBtn.style.background = "rgba(255, 255, 255, 0.05)"; };
}

window.speechSynthesis.onvoiceschanged = () => { window.speechSynthesis.getVoices(); };
