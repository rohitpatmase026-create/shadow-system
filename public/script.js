const input = document.getElementById("input");
const sendBtn = document.getElementById("send");
const micBtn = document.getElementById("mic");
const chatBox = document.getElementById("chat-box");


// MEMORY

let memory = JSON.parse(
  localStorage.getItem("shadowMemory")
) || [];


// SEND MESSAGE

async function sendMessage() {

  const message = input.value.trim();

  if (!message) return;


  // USER MESSAGE

  const userMsg =
    document.createElement("div");

  userMsg.className =
    "user-message";

  userMsg.innerHTML =
    message;

  chatBox.appendChild(userMsg);


  // SAVE MEMORY

  memory.push({

    role: "user",

    content: message
  });


  localStorage.setItem(

    "shadowMemory",

    JSON.stringify(memory)
  );


  input.value = "";


  // THINKING EFFECT

  const loading =
    document.createElement("div");

  loading.className =
    "ai-message thinking";

  loading.innerHTML = `

  <div class="thinking-text">
    ⚔ SHADOW OS is thinking
  </div>

  <div class="typing-dots">
    <span></span>
    <span></span>
    <span></span>
  </div>

  `;

  chatBox.appendChild(
    loading
  );


  chatBox.scrollTop =
    chatBox.scrollHeight;


  try {

    const response =
      await fetch("/api/chat", {

        method: "POST",

        headers: {

          "Content-Type":
          "application/json"
        },

        body: JSON.stringify({

          message,
          memory
        })
      });


    const data =
      await response.json();


    loading.remove();


    // AI MESSAGE

    const aiMsg =
      document.createElement("div");

    aiMsg.className =
      "ai-message";

    aiMsg.innerHTML =
      "⚔ SHADOW OS<br><br>" +
      data.reply;

    chatBox.appendChild(aiMsg);


    // SAVE AI MEMORY

    memory.push({

      role: "assistant",

      content: data.reply
    });


    localStorage.setItem(

      "shadowMemory",

      JSON.stringify(memory)
    );


    chatBox.scrollTop =
      chatBox.scrollHeight;

  }

  catch (error) {

    loading.remove();

    const errorMsg =
      document.createElement("div");

    errorMsg.className =
      "ai-message";

    errorMsg.innerHTML =
      "⚠ SYSTEM ERROR";

    chatBox.appendChild(errorMsg);
  }
}


// BUTTON CLICK

sendBtn.addEventListener(
  "click",
  sendMessage
);


// ENTER KEY

input.addEventListener(
  "keydown",

  function (e) {

    if (e.key === "Enter") {

      sendMessage();
    }
  }
);


// VOICE INPUT

if (
  "webkitSpeechRecognition"
  in window
) {

  const recognition =
    new webkitSpeechRecognition();

  recognition.lang =
    "en-US";


  micBtn.addEventListener(

    "click",

    () => {

      recognition.start();
    }
  );


  recognition.onresult =
    function (event) {

      input.value =

        event.results[0][0]
        .transcript;
    };
}