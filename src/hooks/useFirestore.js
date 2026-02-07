/**
 * Firestore Data Hooks
 * 
 * React hooks for accessing Firestore data with real-time updates
 */

import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
    subscribeSongs,
    subscribeSongsByFolder,
    subscribeFavorites,
    subscribeFolders
} from '../firebase/firestore';

/**
 * Hook to get all songs with real-time updates
 * @returns {{ songs: Array, loading: boolean, error: string|null }}
 */
export const useSongs = () => {
    const { user } = useAuth();
    const [songs, setSongs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!user) {
            setSongs([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        const unsubscribe = subscribeSongs(user.uid, (data) => {
            setSongs(data);
            setLoading(false);
        }, (err) => {
            setError(err.message);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    return { songs, loading, error };
};

/**
 * Hook to get songs by folder or filter with REAL-TIME updates
 * Handles all cases: null (all), 'favorites', or specific folder ID
 * @param {string|null} folderId - Folder ID, 'favorites', or null for all
 * @returns {{ songs: Array, loading: boolean }}
 */
export const useSongsByFolder = (folderId) => {
    const { user } = useAuth();
    const [songs, setSongs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            setSongs([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        let unsubscribe;

        const handleData = (data) => {
            setSongs(data);
            setLoading(false);
        };

        const handleError = (error) => {
            console.error('Songs subscription error:', error);
            setSongs([]);
            setLoading(false);
        };

        // Choose the right subscription based on folderId
        if (folderId === null) {
            // All songs
            unsubscribe = subscribeSongs(user.uid, handleData, handleError);
        } else if (folderId === 'favorites') {
            // Favorites only
            unsubscribe = subscribeFavorites(user.uid, handleData, handleError);
        } else {
            // Specific folder
            unsubscribe = subscribeSongsByFolder(user.uid, folderId, handleData, handleError);
        }

        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, [user, folderId]);

    return { songs, loading };
};

/**
 * Hook to get all folders with real-time updates
 * @returns {{ folders: Array, loading: boolean }}
 */
export const useFolders = () => {
    const { user } = useAuth();
    const [folders, setFolders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            setFolders([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        const unsubscribe = subscribeFolders(user.uid, (data) => {
            setFolders(data);
            setLoading(false);
        }, (error) => {
            console.error('Folders subscription error:', error);
            setFolders([]);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    return { folders, loading };
};

/**
 * Hook to get favorite count (uses real-time data)
 * @returns {number}
 */
export const useFavoriteCount = () => {
    const { songs } = useSongs();
    return songs.filter(s => s.isFavorite).length;
};
