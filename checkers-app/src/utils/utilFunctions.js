/**
 * Generates a random string of 9 characters.
 * 
 * @returns {string} - A random string of 9 characters
 */
export function generateGameId() {
    return Math.random().toString(36).substr(2, 9);
};


/**
 * Flips the game board both horizontally and vertically.
 *
 * @param {number[][]} board - The game board to be flipped.
 * @returns {number[][]} - The flipped game board.
 */
export function flipGameBoard(board) {
    return [...board].map(row => [...row].reverse()).reverse()
}


/**
 * Retrieves the gameId from the URL.
 * 
 * @returns {string} - The gameId from the URL.
 */
export function getGameIdFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('gameId');
}