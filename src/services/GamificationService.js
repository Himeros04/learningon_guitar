/**
 * Gamification Logic Service
 * Pure functions for calculating levels, XP, and badges.
 */

// Leveling System Configuration
const BASE_XP = 100;
const GROWTH_FACTOR = 1.5;

/**
 * Calculate level based on total XP
 * Formula: Level = floor(log(XP / BASE_XP) / log(GROWTH_FACTOR)) + 1
 * or iterative check for simpler control
 */
export const calculateLevel = (totalXp) => {
    if (totalXp < BASE_XP) return 1;

    let level = 1;
    let xpRequired = BASE_XP;

    while (totalXp >= xpRequired) {
        level++;
        xpRequired = Math.floor(xpRequired * GROWTH_FACTOR);
    }

    return level;
};

/**
 * Calculate XP required for next level
 */
export const getXpForNextLevel = (currentLevel) => {
    if (currentLevel < 1) return BASE_XP;
    return Math.floor(BASE_XP * Math.pow(GROWTH_FACTOR, currentLevel - 1));
};

/**
 * Calculate progress percentage to next level
 */
export const getLevelProgress = (totalXp, currentLevel) => {
    const prevLevelXp = currentLevel === 1 ? 0 : Math.floor(BASE_XP * Math.pow(GROWTH_FACTOR, currentLevel - 2));
    const nextLevelXp = getXpForNextLevel(currentLevel);

    const xpInLevel = totalXp - prevLevelXp;
    const xpNeeded = nextLevelXp - prevLevelXp;

    // Safety check div by zero
    if (xpNeeded <= 0) return 100;

    return Math.min(100, Math.max(0, Math.floor((xpInLevel / xpNeeded) * 100)));
};

/**
 * Check if daily streak should continue or reset
 * @param {Date} lastLoginDate 
 * @param {Date} currentDate 
 * @returns {'continue' | 'reset' | 'same_day'}
 */
export const checkStreakStatus = (lastLoginDate, currentDate) => {
    if (!lastLoginDate) return 'reset';

    const last = new Date(lastLoginDate);
    const current = new Date(currentDate);

    // Normalize to midnight
    last.setHours(0, 0, 0, 0);
    current.setHours(0, 0, 0, 0);

    const diffTime = Math.abs(current - last);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'same_day';
    if (diffDays === 1) return 'continue';
    return 'reset';
};

export const XP_VALUES = {
    DAILY_LOGIN: 10,
    PLAY_SESSION_MIN: 5,
    OCR_SCAN: 50,
    CLEANUP: 20,
    SONG_MASTERY: 100,
    NEW_CHORD: 15,
    BLIND_TEST_WIN: 30,
    FOCUS_SESSION: 50,
    SMART_CAPO: 10
};

export const BADGES = {
    'novice': { id: 'novice', name: 'Débutant', icon: '🎸', description: 'Niveau 1 atteint' },
    'streak_7': { id: 'streak_7', name: 'Marathonien', icon: '🔥', description: '7 jours de suite' },
    'library_10': { id: 'library_10', name: 'Collectionneur', icon: '📚', description: '10 chansons dans la bibliothèque' },
    'editor': { id: 'editor', name: 'L\'Architecte', icon: '📝', description: '10 chansons éditées' }
};
