import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";

import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCnvwZeZDqCwuQ5ssJqER1hKJVqJRnvInA",
  authDomain: "arise-ai-a363d.firebaseapp.com",
  projectId: "arise-ai-a363d",
  storageBucket: "arise-ai-a363d.firebasestorage.app",
  messagingSenderId: "527426300346",
  appId: "1:527426300346:web:107eaf1f151ae294bf9583"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

const email = document.getElementById("email");
const password = document.getElementById("password");
const userInfo = document.getElementById("userInfo");

document.getElementById("registerBtn").onclick = async () => {
  try {
    const user = await createUserWithEmailAndPassword(auth, email.value, password.value);
    userInfo.innerText = "Registered: " + user.user.email;
  } catch (e) {
    alert(e.message);
  }
};

document.getElementById("loginBtn").onclick = async () => {
  try {
    const user = await signInWithEmailAndPassword(auth, email.value, password.value);
    userInfo.innerText = "Logged in: " + user.user.email;
  } catch (e) {
    alert(e.message);
  }
};

document.getElementById("googleBtn").onclick = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    userInfo.innerText = "Google Login: " + result.user.displayName;
  } catch (e) {
    alert(e.message);
  }
};

document.getElementById("logoutBtn").onclick = async () => {
  await signOut(auth);
  userInfo.innerText = "Logged out";
};
