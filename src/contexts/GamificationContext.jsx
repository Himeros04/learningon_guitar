import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { initializeUserProfile, subscribeUserProfile, updateUserGamification, addUserHistory } from '../firebase/users';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { calculateLevel, checkStreakStatus, XP_VALUES } from '../services/GamificationService';
import { useToast } from '../components/Toast';

const GamificationContext = createContext(null);

export const GamificationProvider = ({ children }) => {
    const { user } = useAuth();
    const { showToast } = useToast();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    // Initialize/Subscribe to user profile
    useEffect(() => {
        let unsubscribe;

        const init = async () => {
            if (user) {
                try {
                    // Ensure profile exists
                    await initializeUserProfile(user);

                    // Subscribe to changes
                    unsubscribe = subscribeUserProfile(user.uid, (data) => {
                        setProfile(data);
                        setLoading(false);

                        // Check for daily login on load (optimize to run only once per session)
                        checkDailyLogin(data, user.uid);
                    });
                } catch (error) {
                    console.error("Error initializing gamification:", error);
                    setLoading(false);
                }
            } else {
                setProfile(null);
                setLoading(false);
            }
        };

        init();

        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, [user]);

    // Daily Login Logic
    const checkDailyLogin = async (currentProfile, uid) => {
        if (!currentProfile?.gamification) return;

        const { lastLogin, currentStreak } = currentProfile.gamification;
        const now = new Date();
        const status = checkStreakStatus(lastLogin, now);

        if (status === 'same_day') return; // Already logged in today

        let newStreak = status === 'reset' ? 1 : currentStreak + 1;

        // Award XP for daily login
        await addXp(XP_VALUES.DAILY_LOGIN, 'Connexion quotidienne');

        // Update login time and streak
        await updateUserGamification(uid, {
            lastLogin: now.toISOString(),
            currentStreak: newStreak,
            dailyLootClaimed: false // Reset daily loot availability
        });

        showToast(`Connexion quotidienne : +${XP_VALUES.DAILY_LOGIN} XP ! Série : ${newStreak} jours`, 'success');
    };

    /**
     * Add XP to user and handle level up
     */
    const addXp = async (amount, reason) => {
        if (!user) return;

        let currentProfile = profile;

        // Fallback: Fetch profile if not loaded in state
        if (!currentProfile) {
            try {
                const userRef = doc(db, 'users', user.uid);
                const snap = await getDoc(userRef);
                if (snap.exists()) {
                    currentProfile = snap.data();
                }
            } catch (err) {
                console.error("Error fetching profile for XP:", err);
                return;
            }
        }

        if (!currentProfile) return;

        const currentXp = currentProfile.gamification?.xp || 0;
        const currentLevel = currentProfile.gamification?.level || 1;

        const newXp = currentXp + amount;
        const newLevel = calculateLevel(newXp);

        const updates = {
            xp: newXp,
            level: newLevel
        };

        await updateUserGamification(user.uid, updates);

        // Create history entry
        await addUserHistory(user.uid, {
            amount,
            reason: reason || 'Gain d\'XP',
            date: new Date().toISOString()
        });

        if (newLevel > currentLevel) {
            showToast(`Niveau Supérieur ! Vous êtes maintenant niveau ${newLevel} ! 🎉`, 'success');
        } else {
            // Show toast for XP gain (user feedback)
            showToast(`+${amount} XP ${reason ? ': ' + reason : ''}`, 'success');
        }
    };

    /**
     * Claim Daily Loot
     */
    const claimDailyLoot = async () => {
        if (!user) return;
        await updateUserGamification(user.uid, { dailyLootClaimed: true });
        // The updated profile will propagate via subscription
    };

    /**
     * Unlock a badge
     */
    const unlockBadge = async (badgeId) => {
        if (!user || !profile) return;

        const currentBadges = profile.gamification?.badges || [];
        if (currentBadges.includes(badgeId)) return; // Already unlocked

        const newBadges = [...currentBadges, badgeId];
        await updateUserGamification(user.uid, { badges: newBadges });

        showToast(`Badge Débloqué : ${badgeId} ! 🏆`, 'success');
    };

    const value = {
        profile,
        gamification: profile?.gamification || {},
        loading,
        addXp,
        unlockBadge,
        claimDailyLoot
    };

    return (
        <GamificationContext.Provider value={value}>
            {children}
        </GamificationContext.Provider>
    );
};

export const useGamification = () => {
    const context = useContext(GamificationContext);
    if (!context) {
        throw new Error('useGamification must be used within a GamificationProvider');
    }
    return context;
};
