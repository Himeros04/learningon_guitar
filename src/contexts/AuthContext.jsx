/**
 * Authentication Context
 * 
 * Provides authentication state and methods throughout the app
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChange, signInWithGoogle, signInWithEmail, signUpWithEmail, signOutUser } from '../firebase/auth';

// Create the context
const AuthContext = createContext(null);

/**
 * Auth Provider component - wrap your app with this
 */
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Subscribe to auth state changes on mount
    useEffect(() => {
        const unsubscribe = onAuthStateChange((firebaseUser) => {
            setUser(firebaseUser);
            setLoading(false);
        });

        // Cleanup subscription on unmount
        return () => unsubscribe();
    }, []);

    // Sign in with Google
    const loginWithGoogle = async () => {
        setLoading(true);
        const result = await signInWithGoogle();
        setLoading(false);
        return result;
    };

    // Sign in with email/password
    const loginWithEmail = async (email, password) => {
        setLoading(true);
        const result = await signInWithEmail(email, password);
        setLoading(false);
        return result;
    };

    // Sign up with email/password
    const registerWithEmail = async (email, password, displayName) => {
        setLoading(true);
        const result = await signUpWithEmail(email, password, displayName);
        setLoading(false);
        return result;
    };

    // Sign out
    const logout = async () => {
        const result = await signOutUser();
        return result;
    };

    // Context value
    const value = {
        user,
        loading,
        isAuthenticated: !!user,
        loginWithGoogle,
        loginWithEmail,
        registerWithEmail,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

/**
 * Hook to use auth context
 * @returns {{ user, loading, isAuthenticated, loginWithGoogle, loginWithEmail, registerWithEmail, logout }}
 */
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext;
