import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";

const firebaseConfig = {

  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,

  authDomain: "cash-spending.firebaseapp.com",

  databaseURL: "https://cash-spending.firebaseio.com",

  projectId: "cash-spending",

  storageBucket: "cash-spending.firebasestorage.app",

  messagingSenderId: "838879186226",

  appId: "1:838879186226:web:5c0ba8a72c301d3e4ddb2b"

};


// Init firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
auth.useDeviceLanguage();

export { auth, RecaptchaVerifier, signInWithPhoneNumber };