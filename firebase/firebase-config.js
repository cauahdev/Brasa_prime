import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
  getFirestore,
  collection,
  addDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyB6Q8XRP99c3mVkwdEL-jMCJFDEMdLbd4w",
  authDomain: "brasa-prime.firebaseapp.com",
  projectId: "brasa-prime",
  storageBucket: "brasa-prime.firebasestorage.app",
  messagingSenderId: "283430936504",
  appId: "1:283430936504:web:a1f38ebb1f5d2ae7cff94d",
  measurementId: "G-34XX045Y86"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db, collection, addDoc };