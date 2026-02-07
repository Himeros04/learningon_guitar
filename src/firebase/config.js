/**
 * Firebase Configuration
 * 
 * SETUP INSTRUCTIONS:
 * 1. Go to https://console.firebase.google.com/
 * 2. Create a new project or select existing one
 * 3. Enable Authentication (Google + Email/Password)
 * 4. Enable Firestore Database
 * 5. Enable Storage
 * 6. Go to Project Settings > General > Your apps > Web app
 * 7. Copy your config values below
 */

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// TODO: Replace with your Firebase project configuration
const firebaseConfig = {
    apiKey: "AIzaSyDWpg-2OKnTQBrmjoMo5XsyEY_b6TK6hC8",
    authDomain: "learningon-guitar.firebaseapp.com",
    projectId: "learningon-guitar",
    storageBucket: "learningon-guitar.firebasestorage.app",
    messagingSenderId: "453234638819",
    appId: "1:453234638819:web:1dfe57a38f048c85e9aad6",
    measurementId: "G-YGD92SNSF3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
