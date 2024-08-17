export default function generateGameId() {
    return Math.random().toString(36).substr(2, 9);
};