// config.js

// 1. Firebase Configuration
const firebaseConfig = {
    apiKey: "YOUR_FIREBASE_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// 2. Agora Configuration (Video SDK)
const agoraConfig = {
    appId: "YOUR_AGORA_APP_ID", // Get this from Agora Console
    token: null // For testing, set to null. For production, you need a token server.
};

// Initialize Firebase (We will load the SDKs in the HTML files)
// This file acts as a centralized config store.
