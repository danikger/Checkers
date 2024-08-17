/**
 * Generates a random string of 9 characters.
 * @returns {string} - A random string of 9 characters
 */
export default function generateGameId() {
    return Math.random().toString(36).substr(2, 9);
};