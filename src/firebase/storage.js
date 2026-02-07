/**
 * Firebase Storage Services
 * 
 * Upload/download files (song cover images)
 * Supports HEIC conversion for Apple devices
 */

import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './config';
import heic2any from 'heic2any';

/**
 * Check if file is HEIC format
 */
const isHeicFile = (file) => {
    const heicTypes = ['image/heic', 'image/heif'];
    const heicExtensions = ['.heic', '.heif'];

    if (heicTypes.includes(file.type.toLowerCase())) return true;

    const ext = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));
    return heicExtensions.includes(ext);
};

/**
 * Convert HEIC to JPEG
 * @param {File} file - HEIC file
 * @returns {Promise<File>} Converted JPEG file
 */
const convertHeicToJpeg = async (file) => {
    try {
        const blob = await heic2any({
            blob: file,
            toType: 'image/jpeg',
            quality: 0.9
        });

        // heic2any can return array or single blob
        const resultBlob = Array.isArray(blob) ? blob[0] : blob;

        // Create new file with .jpg extension
        const newName = file.name.replace(/\.(heic|heif)$/i, '.jpg');
        return new File([resultBlob], newName, { type: 'image/jpeg' });
    } catch (error) {
        console.error('HEIC conversion error:', error);
        throw new Error('Impossible de convertir l\'image HEIC');
    }
};

/**
 * Upload a song cover image
 * @param {string} userId - User ID
 * @param {string} songId - Song ID (used in path)
 * @param {File} file - Image file to upload
 * @returns {Promise<string>} Download URL
 */
export const uploadSongCover = async (userId, songId, file) => {
    // Convert HEIC if needed
    let uploadFile = file;
    if (isHeicFile(file)) {
        uploadFile = await convertHeicToJpeg(file);
    }

    const extension = uploadFile.name.split('.').pop();
    const timestamp = Date.now();
    const path = `users/${userId}/covers/${songId}_${timestamp}.${extension}`;

    const storageRef = ref(storage, path);

    const snapshot = await uploadBytes(storageRef, uploadFile, {
        contentType: uploadFile.type,
        customMetadata: {
            uploadedBy: userId,
            originalName: file.name
        }
    });

    return await getDownloadURL(snapshot.ref);
};

/**
 * Upload any image (generic)
 * @param {string} userId - User ID
 * @param {File} file - Image file
 * @param {string} folder - Folder name (e.g., 'covers', 'chords')
 * @returns {Promise<string>} Download URL
 */
export const uploadImage = async (userId, file, folder = 'images') => {
    // Convert HEIC if needed
    let uploadFile = file;
    if (isHeicFile(file)) {
        uploadFile = await convertHeicToJpeg(file);
    }

    const extension = uploadFile.name.split('.').pop();
    const timestamp = Date.now();
    const path = `users/${userId}/${folder}/${timestamp}.${extension}`;

    const storageRef = ref(storage, path);

    const snapshot = await uploadBytes(storageRef, uploadFile, {
        contentType: uploadFile.type
    });

    return await getDownloadURL(snapshot.ref);
};

/**
 * Delete an image by URL
 * @param {string} imageUrl - Full download URL
 */
export const deleteImage = async (imageUrl) => {
    try {
        const storageRef = ref(storage, imageUrl);
        await deleteObject(storageRef);
    } catch (error) {
        console.warn('Could not delete image:', error.message);
    }
};

/**
 * Validate image file (including HEIC)
 * @param {File} file 
 * @returns {{ valid: boolean, error?: string, isHeic?: boolean }}
 */
export const validateImageFile = (file) => {
    const maxSize = 10 * 1024 * 1024; // 10MB for HEIC (they're larger)
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/heic', 'image/heif'];
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.heic', '.heif'];

    const ext = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));
    const isValidExt = allowedExtensions.includes(ext);
    const isValidType = allowedTypes.includes(file.type.toLowerCase()) || file.type === '';

    if (!isValidType && !isValidExt) {
        return { valid: false, error: 'Format non supporté. Utilisez JPG, PNG, WebP, GIF ou HEIC.' };
    }

    if (file.size > maxSize) {
        return { valid: false, error: 'Image trop volumineuse (max 10MB).' };
    }

    return { valid: true, isHeic: isHeicFile(file) };
};

export default {
    uploadSongCover,
    uploadImage,
    deleteImage,
    validateImageFile
};
