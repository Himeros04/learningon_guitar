import {
    doc,
    setDoc,
    getDoc,
    updateDoc,
    serverTimestamp,
    onSnapshot,
    collection,
    getDocs,
    addDoc,
    query,
    orderBy,
    limit
} from 'firebase/firestore';
import { db } from './config';

const COLLECTION = 'users';

/**
 * Create or get user profile
 * @param {Object} user Auth user object
 */
export const initializeUserProfile = async (user) => {
    if (!user) return null;

    const userRef = doc(db, COLLECTION, user.uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
        return userSnap.data();
    }

    // Initialize new user profile with gamification defaults
    const newProfile = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        gamification: {
            xp: 0,
            level: 1,
            currentStreak: 0,
            lastLogin: new Date().toISOString(), // Store as ISO string for simpler serialization
            badges: [],
            dailyLootClaimed: false,
            dailyQuests: []
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
    };

    await setDoc(userRef, newProfile);
    return newProfile;
};

/**
 * Update user gamification state
 * @param {string} userId 
 * @param {Object} updates Partial updates for gamification object
 */
export const updateUserGamification = async (userId, updates) => {
    const userRef = doc(db, COLLECTION, userId);

    // We need to use dot notation for nested field updates in Firestore
    // e.g. "gamification.xp": 100
    const firestoreUpdates = {};
    for (const [key, value] of Object.entries(updates)) {
        firestoreUpdates[`gamification.${key}`] = value;
    }

    firestoreUpdates['updatedAt'] = serverTimestamp();

    await updateDoc(userRef, firestoreUpdates);
};

/**
 * Subscribe to user profile changes
 */
export const subscribeUserProfile = (userId, callback) => {
    const userRef = doc(db, COLLECTION, userId);
    return onSnapshot(userRef, (doc) => {
        if (doc.exists()) {
            callback(doc.data());
        }
    });
};

/**
 * Get all users (Admin only)
 * @returns {Promise<Array>}
 */
/**
 * Get all users (Admin only)
 * @returns {Promise<Array>}
 */
export const getAllUsers = async () => {
    try {
        const querySnapshot = await getDocs(collection(db, COLLECTION));
        return querySnapshot.docs.map(doc => ({
            uid: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error("Error fetching all users:", error);
        return [];
    }
};
/**
 * Add a history entry for XP gain
 * @param {string} userId 
 * @param {Object} entry { amount, reason, date }
 */
export const addUserHistory = async (userId, entry) => {
    try {
        const historyRef = collection(db, COLLECTION, userId, 'history');
        await addDoc(historyRef, {
            ...entry,
            createdAt: serverTimestamp()
        });
    } catch (error) {
        console.error("Error adding history:", error);
    }
};

/**
 * Get user XP history
 * @param {string} userId
 */
export const getUserHistory = async (userId) => {
    try {
        const historyRef = collection(db, COLLECTION, userId, 'history');
        const q = query(historyRef, orderBy('createdAt', 'desc'), limit(50));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error("Error getting history:", error);
        return [];
    }
};
