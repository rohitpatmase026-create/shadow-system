const input = document.getElementById("input");
const sendBtn = document.getElementById("send");
const micBtn = document.getElementById("mic");
const chatBox = document.getElementById("chat-box");


// ======================
// MEMORY
// ======================

let memory = JSON.parse(
  localStorage.getItem("shadowMemory")
) || [];


// ======================
// SEND MESSAGE
// ======================

async function sendMessage() {

  const message = input.value.trim();

  if (!message) return;


  // ======================
  // USER MESSAGE
  // ======================

  const userMsg =
    document.createElement("div");

  userMsg.className =
    "user-message";

  userMsg.innerHTML =
    message;

  chatBox.appendChild(userMsg);


  // SAVE USER MEMORY

  memory.push({

    role: "user",

    content: message
  });


  localStorage.setItem(

    "shadowMemory",

    JSON.stringify(memory)
  );


  // CLEAR INPUT

  input.value = "";


  // AUTO SCROLL

  chatBox.scrollTop =
    chatBox.scrollHeight;


  // ======================
  // THINKING EFFECT
  // ======================

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

    // ======================
    // API CALL
    // ======================

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


    // REMOVE THINKING

    loading.remove();


    // ======================
    // AI MESSAGE
    // ======================

    const aiMsg =
      document.createElement("div");

    aiMsg.className =
      "ai-message";

    chatBox.appendChild(aiMsg);


    // ======================
    // TYPEWRITER EFFECT
    // ======================

    const finalText =
      "⚔ SHADOW OS\n\n" +
      data.reply;

    let index = 0;

    function typeEffect() {

      if (index < finalText.length) {

        aiMsg.innerHTML =
          finalText
            .substring(0, index)
            .replace(/\n/g, "<br>");

        index++;

        chatBox.scrollTop =
          chatBox.scrollHeight;

        setTimeout(
          typeEffect,
          10
        );
      }
    }

    typeEffect();


    // SAVE AI MEMORY

    memory.push({

      role: "assistant",

      content: data.reply
    });


    localStorage.setItem(

      "shadowMemory",

      JSON.stringify(memory)
    );

  }

  catch (error) {

    console.log(error);

    loading.remove();


    // ERROR MESSAGE

    const errorMsg =
      document.createElement("div");

    errorMsg.className =
      "ai-message";

    errorMsg.innerHTML =
      "⚠ SYSTEM ERROR";

    chatBox.appendChild(errorMsg);
  }
}


// ======================
// SEND BUTTON
// ======================

sendBtn.addEventListener(
  "click",
  sendMessage
);


// ======================
// ENTER KEY FIX
// ======================

input.addEventListener(
  "keydown",

  (e) => {

    if (e.key === "Enter") {

      e.preventDefault();

      sendMessage();
    }
  }
);


// ======================
// VOICE INPUT
// ======================

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
