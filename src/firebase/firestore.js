/**
 * Firestore Database Services
 * 
 * CRUD operations for songs, folders, and chords
 * Simple cloud-only approach (no offline sync)
 */

import {
    collection,
    doc,
    getDocs,
    getDoc,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    serverTimestamp,
    onSnapshot
} from 'firebase/firestore';
import { db } from './config';

// Collection references
const COLLECTIONS = {
    SONGS: 'songs',
    FOLDERS: 'folders',
    CHORDS: 'chords'
};

// ============================================
// SONGS
// ============================================

/**
 * Get all songs for a user
 * @param {string} userId 
 * @returns {Promise<Array>}
 */
export const getSongs = async (userId) => {
    const q = query(
        collection(db, COLLECTIONS.SONGS),
        where('userId', '==', userId),
        orderBy('updatedAt', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));
};

/**
 * Get songs by folder
 * @param {string} userId 
 * @param {string} folderId 
 * @returns {Promise<Array>}
 */
export const getSongsByFolder = async (userId, folderId) => {
    const q = query(
        collection(db, COLLECTIONS.SONGS),
        where('userId', '==', userId),
        where('folderId', '==', folderId)
    );

    const snapshot = await getDocs(q);
    const songs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));

    // Sort client-side to avoid composite index
    songs.sort((a, b) => {
        const dateA = a.updatedAt?.toDate?.() || new Date(a.updatedAt || 0);
        const dateB = b.updatedAt?.toDate?.() || new Date(b.updatedAt || 0);
        return dateB - dateA;
    });

    return songs;
};

/**
 * Get favorite songs
 * @param {string} userId 
 * @returns {Promise<Array>}
 */
export const getFavoriteSongs = async (userId) => {
    const q = query(
        collection(db, COLLECTIONS.SONGS),
        where('userId', '==', userId),
        where('isFavorite', '==', true)
    );

    const snapshot = await getDocs(q);
    const songs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));

    // Sort client-side to avoid composite index
    songs.sort((a, b) => {
        const dateA = a.updatedAt?.toDate?.() || new Date(a.updatedAt || 0);
        const dateB = b.updatedAt?.toDate?.() || new Date(b.updatedAt || 0);
        return dateB - dateA;
    });

    return songs;
};

/**
 * Get a single song by ID
 * @param {string} songId 
 * @returns {Promise<Object|null>}
 */
export const getSong = async (songId) => {
    const docRef = doc(db, COLLECTIONS.SONGS, songId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
};

/**
 * Add a new song
 * @param {string} userId 
 * @param {Object} songData 
 * @returns {Promise<string>} The new song ID
 */
export const addSong = async (userId, songData) => {
    const docRef = await addDoc(collection(db, COLLECTIONS.SONGS), {
        ...songData,
        userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
    });
    return docRef.id;
};

/**
 * Update a song
 * @param {string} songId 
 * @param {Object} data 
 */
export const updateSong = async (songId, data) => {
    const docRef = doc(db, COLLECTIONS.SONGS, songId);
    await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp()
    });
};

/**
 * Delete a song
 * @param {string} songId 
 */
export const deleteSong = async (songId) => {
    await deleteDoc(doc(db, COLLECTIONS.SONGS, songId));
};

/**
 * Subscribe to songs changes (real-time)
 * @param {string} userId 
 * @param {Function} callback 
 * @returns {Function} Unsubscribe function
 */
export const subscribeSongs = (userId, callback, onError) => {
    const q = query(
        collection(db, COLLECTIONS.SONGS),
        where('userId', '==', userId)
    );

    return onSnapshot(q, (snapshot) => {
        const songs = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        // Sort by updatedAt client-side to avoid composite index
        songs.sort((a, b) => {
            const dateA = a.updatedAt?.toDate?.() || new Date(a.updatedAt || 0);
            const dateB = b.updatedAt?.toDate?.() || new Date(b.updatedAt || 0);
            return dateB - dateA; // Descending
        });
        callback(songs);
    }, (error) => {
        console.error('Firestore songs subscription error:', error);
        if (onError) onError(error);
        callback([]); // Return empty array on error
    });
};

/**
 * Subscribe to songs in a specific folder (real-time)
 * @param {string} userId 
 * @param {string} folderId 
 * @param {Function} callback 
 * @param {Function} onError 
 * @returns {Function} Unsubscribe function
 */
export const subscribeSongsByFolder = (userId, folderId, callback, onError) => {
    const q = query(
        collection(db, COLLECTIONS.SONGS),
        where('userId', '==', userId),
        where('folderId', '==', folderId)
    );

    return onSnapshot(q, (snapshot) => {
        const songs = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        songs.sort((a, b) => {
            const dateA = a.updatedAt?.toDate?.() || new Date(a.updatedAt || 0);
            const dateB = b.updatedAt?.toDate?.() || new Date(b.updatedAt || 0);
            return dateB - dateA;
        });
        callback(songs);
    }, (error) => {
        console.error('Firestore folder songs subscription error:', error);
        if (onError) onError(error);
        callback([]);
    });
};

/**
 * Subscribe to favorite songs (real-time)
 * @param {string} userId 
 * @param {Function} callback 
 * @param {Function} onError 
 * @returns {Function} Unsubscribe function
 */
export const subscribeFavorites = (userId, callback, onError) => {
    const q = query(
        collection(db, COLLECTIONS.SONGS),
        where('userId', '==', userId),
        where('isFavorite', '==', true)
    );

    return onSnapshot(q, (snapshot) => {
        const songs = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        songs.sort((a, b) => {
            const dateA = a.updatedAt?.toDate?.() || new Date(a.updatedAt || 0);
            const dateB = b.updatedAt?.toDate?.() || new Date(b.updatedAt || 0);
            return dateB - dateA;
        });
        callback(songs);
    }, (error) => {
        console.error('Firestore favorites subscription error:', error);
        if (onError) onError(error);
        callback([]);
    });
};

// ============================================
// FOLDERS
// ============================================

/**
 * Get all folders for a user
 * @param {string} userId 
 * @returns {Promise<Array>}
 */
export const getFolders = async (userId) => {
    const q = query(
        collection(db, COLLECTIONS.FOLDERS),
        where('userId', '==', userId)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));
};

/**
 * Add a new folder
 * @param {string} userId 
 * @param {Object} folderData 
 * @returns {Promise<string>} The new folder ID
 */
export const addFolder = async (userId, folderData) => {
    const docRef = await addDoc(collection(db, COLLECTIONS.FOLDERS), {
        ...folderData,
        userId,
        parentId: folderData.parentId || null,
        createdAt: serverTimestamp()
    });
    return docRef.id;
};

/**
 * Update a folder
 * @param {string} folderId 
 * @param {Object} data 
 */
export const updateFolder = async (folderId, data) => {
    const docRef = doc(db, COLLECTIONS.FOLDERS, folderId);
    await updateDoc(docRef, data);
};

/**
 * Delete a folder (songs are unlinked, not deleted)
 * @param {string} userId
 * @param {string} folderId 
 */
export const deleteFolder = async (userId, folderId) => {
    // First, unlink all songs from this folder
    const songsQuery = query(
        collection(db, COLLECTIONS.SONGS),
        where('userId', '==', userId),
        where('folderId', '==', folderId)
    );

    const snapshot = await getDocs(songsQuery);
    const updatePromises = snapshot.docs.map(doc =>
        updateDoc(doc.ref, { folderId: null })
    );
    await Promise.all(updatePromises);

    // Then delete the folder
    await deleteDoc(doc(db, COLLECTIONS.FOLDERS, folderId));
};

/**
 * Subscribe to folders changes (real-time)
 * @param {string} userId 
 * @param {Function} callback 
 * @returns {Function} Unsubscribe function
 */
export const subscribeFolders = (userId, callback, onError) => {
    const q = query(
        collection(db, COLLECTIONS.FOLDERS),
        where('userId', '==', userId)
    );

    return onSnapshot(q, (snapshot) => {
        const folders = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        callback(folders);
    }, (error) => {
        console.error('Firestore folders subscription error:', error);
        if (onError) onError(error);
        callback([]); // Return empty array on error
    });
};

// ============================================
// CHORDS (User custom chords)
// ============================================

/**
 * Get all custom chords for a user
 * @param {string} userId 
 * @returns {Promise<Array>}
 */
export const getChords = async (userId) => {
    const q = query(
        collection(db, COLLECTIONS.CHORDS),
        where('userId', '==', userId)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));
};

/**
 * Add a custom chord
 * @param {string} userId 
 * @param {Object} chordData 
 * @returns {Promise<string>}
 */
export const addChord = async (userId, chordData) => {
    const docRef = await addDoc(collection(db, COLLECTIONS.CHORDS), {
        ...chordData,
        userId,
        createdAt: serverTimestamp()
    });
    return docRef.id;
};

/**
 * Update a chord
 * @param {string} chordId 
 * @param {Object} data 
 */
export const updateChord = async (chordId, data) => {
    const docRef = doc(db, COLLECTIONS.CHORDS, chordId);
    await updateDoc(docRef, data);
};

/**
 * Delete a chord
 * @param {string} chordId 
 */
export const deleteChord = async (chordId) => {
    await deleteDoc(doc(db, COLLECTIONS.CHORDS, chordId));
};



/**
 * Subscribe to user's chords (real-time)
 * @param {string} userId 
 * @param {Function} callback 
 * @param {Function} onError 
 * @returns {Function} Unsubscribe function
 */
export const subscribeChords = (userId, callback, onError) => {
    const q = query(
        collection(db, COLLECTIONS.CHORDS),
        where('userId', '==', userId)
    );

    return onSnapshot(q, (snapshot) => {
        const chords = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        callback(chords);
    }, (error) => {
        console.error('Firestore chords subscription error:', error);
        if (onError) onError(error);
        callback([]);
    });
};

/**
 * Seed initial chords for a new user
 * @param {string} userId 
 */
export const seedInitialChords = async (userId) => {
    const STARTER_CHORDS = [
        {
            name: 'C',
            category: 'Majeur',
            tags: ['basic', 'open'],
            data: {
                positions: [{ strings: { 6: -1, 5: 3, 4: 2, 3: 0, 2: 1, 1: 0 }, fingers: { 6: 0, 5: 3, 4: 2, 3: 0, 2: 1, 1: 0 }, baseFret: 1 }]
            }
        },
        {
            name: 'D',
            category: 'Majeur',
            tags: ['basic', 'open'],
            data: {
                positions: [{ strings: { 6: -1, 5: -1, 4: 0, 3: 2, 2: 3, 1: 2 }, fingers: { 6: 0, 5: 0, 4: 0, 3: 1, 2: 3, 1: 2 }, baseFret: 1 }]
            }
        },
        {
            name: 'E',
            category: 'Majeur',
            tags: ['basic', 'open'],
            data: {
                positions: [{ strings: { 6: 0, 5: 2, 4: 2, 3: 1, 2: 0, 1: 0 }, fingers: { 6: 0, 5: 2, 4: 3, 3: 1, 2: 0, 1: 0 }, baseFret: 1 }]
            }
        },
        {
            name: 'G',
            category: 'Majeur',
            tags: ['basic', 'open'],
            data: {
                positions: [{ strings: { 6: 3, 5: 2, 4: 0, 3: 0, 2: 0, 1: 3 }, fingers: { 6: 2, 5: 1, 4: 0, 3: 0, 2: 0, 1: 3 }, baseFret: 1 }]
            }
        },
        {
            name: 'A',
            category: 'Majeur',
            tags: ['basic', 'open'],
            data: {
                positions: [{ strings: { 6: -1, 5: 0, 4: 2, 3: 2, 2: 2, 1: 0 }, fingers: { 6: 0, 5: 0, 4: 1, 3: 2, 2: 3, 1: 0 }, baseFret: 1 }]
            }
        },
        {
            name: 'Am',
            category: 'Mineur',
            tags: ['basic', 'open'],
            data: {
                positions: [{ strings: { 6: -1, 5: 0, 4: 2, 3: 2, 2: 1, 1: 0 }, fingers: { 6: 0, 5: 0, 4: 2, 3: 3, 2: 1, 1: 0 }, baseFret: 1 }]
            }
        },
        {
            name: 'Em',
            category: 'Mineur',
            tags: ['basic', 'open'],
            data: {
                positions: [{ strings: { 6: 0, 5: 2, 4: 2, 3: 0, 2: 0, 1: 0 }, fingers: { 6: 0, 5: 2, 4: 3, 3: 0, 2: 0, 1: 0 }, baseFret: 1 }]
            }
        },
        {
            name: 'Dm',
            category: 'Mineur',
            tags: ['basic', 'open'],
            data: {
                positions: [{ strings: { 6: -1, 5: -1, 4: 0, 3: 2, 2: 3, 1: 1 }, fingers: { 6: 0, 5: 0, 4: 0, 3: 2, 2: 3, 1: 1 }, baseFret: 1 }]
            }
        },
        {
            name: 'F',
            category: 'Majeur',
            tags: ['basic', 'barre'],
            data: {
                positions: [{ strings: { 6: 1, 5: 3, 4: 3, 3: 2, 2: 1, 1: 1 }, fingers: { 6: 1, 5: 3, 4: 4, 3: 2, 2: 1, 1: 1 }, baseFret: 1 }]
            }
        },
        {
            name: 'E7',
            category: '7ème',
            tags: ['basic', 'open'],
            data: {
                positions: [{ strings: { 6: 0, 5: 2, 4: 0, 3: 1, 2: 0, 1: 0 }, fingers: { 6: 0, 5: 2, 4: 0, 3: 1, 2: 0, 1: 0 }, baseFret: 1 }]
            }
        }
    ];

    for (const chord of STARTER_CHORDS) {
        await addChord(userId, chord);
    }
};

/**
 * Get ALL songs for Admin Dashboard
 * @returns {Promise<Array>}
 */
export const getAllSongsAdmin = async () => {
    try {
        const q = query(collection(db, COLLECTIONS.SONGS), orderBy('updatedAt', 'desc'));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error("Error fetching all songs:", error);
        return [];
    }
};

export default {
    // Songs
    getSongs,
    getSongsByFolder,
    getFavoriteSongs,
    getSong,
    addSong,
    updateSong,
    deleteSong,
    subscribeSongs,
    // Folders
    getFolders,
    addFolder,
    updateFolder,
    deleteFolder,
    subscribeFolders,
    // Chords
    getChords,
    addChord,
    updateChord,
    deleteChord,
    subscribeChords,
    seedInitialChords,
    getAllSongsAdmin
};
