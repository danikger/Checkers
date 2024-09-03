export const initialBoard = [
  [0, 1, 0, 1, 0, 1, 0, 1],
  [1, 0, 1, 0, 1, 0, 1, 0],
  [0, 1, 0, 1, 0, 1, 0, 1],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [2, 0, 2, 0, 2, 0, 2, 0],
  [0, 2, 0, 2, 0, 2, 0, 2],
  [2, 0, 2, 0, 2, 0, 2, 0]
];

/**
 * Checks if the move from (startX, startY) to (endX, endY) is valid.
 */
export function isValidMove(board, startX, startY, endX, endY, player) {
  const piece = board[startY][startX];

  // Check if the target position is within the board boundaries
  if (endX < 0 || endX > 7 || endY < 0 || endY > 7) return false; 

  const target = board[endY][endX];
  if (target !== 0) return false; // Target square must be empty

  const isKing = piece === 3 || piece === 4;
  const directionY = Math.abs(startY - endY);
  const directionX = Math.abs(startX - endX);

  // Regular move (1 square diagonally, with direction depending on whether the piece is a king or not)
  if (directionX === 1 && directionY === 1 && (isKing || endY < startY)) {
    return true;
  }

  // Capture move (2 squares diagonally, with direction depending on whether the piece is a king or not)
  if (directionX === 2 && directionY === 2 && (isKing || endY < startY)) {
    const middleX = (startX + endX) / 2;
    const middleY = (startY + endY) / 2;
    const middlePiece = board[middleY][middleX];

    // Determine the opponent pieces based on the player
    const opponentPieces = player === 1 ? [2, 4] : [1, 3];

    if (opponentPieces.includes(middlePiece)) {
      return true;
    }
  }

  return false;
}


/**
 * Executes the move on the board.
 */
export function makeMove(board, startX, startY, endX, endY, player) {
  const newBoard = board.map(row => [...row]);
  const piece = newBoard[startY][startX];

  newBoard[endY][endX] = piece;
  newBoard[startY][startX] = 0;

  // Check if the move was a capture
  if (Math.abs(startX - endX) === 2) {
    const middleX = (startX + endX) / 2;
    const middleY = (startY + endY) / 2;
    newBoard[middleY][middleX] = 0; // Remove captured piece
  }

  // Promote to king if reaching the last row
  if ((player === 1 && endY === 0) || (player === 2 && endY === 0)) {
    newBoard[endY][endX] = player === 1 ? 3 : 4; // Red king or white king
  }

  return newBoard;
}
