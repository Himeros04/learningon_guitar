/**
 * Firebase Authentication Services
 * 
 * Provides authentication functions for Google Sign-In and Email/Password
 */

import {
    signInWithPopup,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    GoogleAuthProvider,
    updateProfile
} from 'firebase/auth';
import { auth } from './config';

// Google Auth Provider
const googleProvider = new GoogleAuthProvider();

/**
 * Sign in with Google popup
 * @returns {Promise<UserCredential>}
 */
export const signInWithGoogle = async () => {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        return { user: result.user, error: null };
    } catch (error) {
        console.error('Google Sign-In Error:', error);
        return { user: null, error: error.message };
    }
};

/**
 * Sign in with email and password
 * @param {string} email 
 * @param {string} password 
 * @returns {Promise<{user, error}>}
 */
export const signInWithEmail = async (email, password) => {
    try {
        const result = await signInWithEmailAndPassword(auth, email, password);
        return { user: result.user, error: null };
    } catch (error) {
        console.error('Email Sign-In Error:', error);
        return { user: null, error: getErrorMessage(error.code) };
    }
};

/**
 * Create a new account with email and password
 * @param {string} email 
 * @param {string} password 
 * @param {string} displayName 
 * @returns {Promise<{user, error}>}
 */
export const signUpWithEmail = async (email, password, displayName = '') => {
    try {
        const result = await createUserWithEmailAndPassword(auth, email, password);

        // Update profile with display name if provided
        if (displayName && result.user) {
            await updateProfile(result.user, { displayName });
        }

        return { user: result.user, error: null };
    } catch (error) {
        console.error('Sign-Up Error:', error);
        return { user: null, error: getErrorMessage(error.code) };
    }
};

/**
 * Sign out the current user
 * @returns {Promise<{success, error}>}
 */
export const signOutUser = async () => {
    try {
        await signOut(auth);
        return { success: true, error: null };
    } catch (error) {
        console.error('Sign-Out Error:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Subscribe to auth state changes
 * @param {Function} callback - Called with user object or null
 * @returns {Function} Unsubscribe function
 */
export const onAuthStateChange = (callback) => {
    return onAuthStateChanged(auth, callback);
};

/**
 * Get current user
 * @returns {User|null}
 */
export const getCurrentUser = () => {
    return auth.currentUser;
};

/**
 * Convert Firebase error codes to user-friendly messages in French
 * @param {string} errorCode 
 * @returns {string}
 */
const getErrorMessage = (errorCode) => {
    const errorMessages = {
        'auth/email-already-in-use': 'Cette adresse email est déjà utilisée.',
        'auth/invalid-email': 'Adresse email invalide.',
        'auth/operation-not-allowed': 'Opération non autorisée.',
        'auth/weak-password': 'Le mot de passe doit contenir au moins 6 caractères.',
        'auth/user-disabled': 'Ce compte a été désactivé.',
        'auth/user-not-found': 'Aucun compte trouvé avec cette adresse email.',
        'auth/wrong-password': 'Mot de passe incorrect.',
        'auth/invalid-credential': 'Email ou mot de passe incorrect.',
        'auth/too-many-requests': 'Trop de tentatives. Réessayez plus tard.',
        'auth/popup-closed-by-user': 'Connexion annulée.',
    };

    return errorMessages[errorCode] || 'Une erreur est survenue. Veuillez réessayer.';
};

export default {
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    signOutUser,
    onAuthStateChange,
    getCurrentUser
};
