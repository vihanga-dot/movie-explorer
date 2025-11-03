import { initializeApp } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "https://www.gstatic.com/firebasejs/10.6.0/firebase-auth.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCcR2FctbSYs07U958JgAtXX28Q6dE_w58",
  authDomain: "movieexplorer-a962a.firebaseapp.com",
  projectId: "movieexplorer-a962a",
  storageBucket: "movieexplorer-a962a.firebasestorage.app",
  messagingSenderId: "26461702551",
  appId: "1:26461702551:web:884a5e6c90820cb4265cd2",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// Elements
const loginForm = document.getElementById("login-form");
const signupForm = document.getElementById("signup-form");
const googleBtns = document.querySelectorAll(".google-btn");

// Button loading helper
function showButtonLoading(btn) {
  if (!btn) return;
  btn.disabled = true;
  btn.innerHTML = `<span class="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mx-auto"></span>`;
}
function hideButtonLoading(btn, text) {
  if (!btn) return;
  btn.disabled = false;
  btn.textContent = text;
}

// LOGIN
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = loginForm.email.value.trim();
    const password = loginForm.password.value.trim();
    const btnText = loginForm.querySelector(
      "button[type='submit']"
    ).textContent;
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      localStorage.setItem('userUid', userCredential.user.uid);
      window.location.href = "index.html";
    } catch (err) {
      alert(err.message);
    } finally {
      hideButtonLoading(
        loginForm.querySelector("button[type='submit']"),
        btnText
      );
    }
  });
}

// SIGNUP
if (signupForm) {
  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = signupForm.email.value.trim();
    const password = signupForm.password.value.trim();
    const btnText = signupForm.querySelector(
      "button[type='submit']"
    ).textContent;
    showButtonLoading(signupForm.querySelector("button[type='submit']"));
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      localStorage.setItem('userUid', userCredential.user.uid);
      window.location.href = "profile.html";
    } catch (err) {
      alert(err.message);
    } finally {
      hideButtonLoading(
        signupForm.querySelector("button[type='submit']"),
        btnText
      );
    }
  });
}

// GOOGLE LOGIN
googleBtns.forEach((btn) => {
  btn.addEventListener("click", async () => {
    showButtonLoading(btn);
    try {
      const userCredential = await signInWithPopup(auth, provider);
      localStorage.setItem('userUid', userCredential.user.uid);
      window.location.href = "index.html";
    } catch (err) {
      alert(err.message);
    } finally {
      hideButtonLoading(btn, "Continue with Google");
    }
  });
});

