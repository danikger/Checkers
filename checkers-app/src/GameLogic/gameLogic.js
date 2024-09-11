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
 * 
 * @param {number[][]} board - Game board represented as a 2D array.
 * @param {number} startX - Starting X coordinate of the piece.
 * @param {number} startY - Starting Y coordinate of the piece.
 * @param {number} endX - The ending X coordinate of the piece.
 * @param {number} endY - The ending Y coordinate of the piece.
 * @param {number} player - Player making the move.
 * 
 * @returns {boolean} - True if the move is valid, false otherwise.
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
 *
 * @param {number[][]} board - Game board represented as a 2D array.
 * @param {number} startX - Starting X coordinate of the piece.
 * @param {number} startY - Starting Y coordinate of the piece.
 * @param {number} endX - The ending X coordinate of the piece.
 * @param {number} endY - The ending Y coordinate of the piece.
 * @param {number} player - Player making the move.
 * 
 * @returns {Array} - An array containing the new state of the board and the type of move made.
 */
export function makeMove(board, startX, startY, endX, endY, player) {
  const newBoard = board.map(row => [...row]);
  const piece = newBoard[startY][startX];
  let moveType = "move"; // Two types of moves: "move" or "capture"

  newBoard[endY][endX] = piece;
  newBoard[startY][startX] = 0;

  // Check if the move was a capture
  if (Math.abs(startX - endX) === 2) {
    const middleX = (startX + endX) / 2;
    const middleY = (startY + endY) / 2;
    newBoard[middleY][middleX] = 0; // Remove captured piece
    moveType = "capture";
  }

  // Promote to king if reaching the last row
  if ((player === 1 && endY === 0) || (player === 2 && endY === 0)) {
    newBoard[endY][endX] = player === 1 ? 3 : 4; // Red king or white king
  }

  return [newBoard, moveType];
}


/**
 * Checks if there are any force jumps for the player.
 * 
 * @param {number[][]} board - Game board represented as a 2D array.
 * @param {number} currentPlayer - Current player making the move.
 * 
 * @returns {Array} - An array containing the highlighted squares and mandatory moves.
 */
export function checkForceJumpsBeforeMove(board, currentPlayer) {
  let highlightedSquares = [];
  let mandatoryMoves = [];

  // Iterate over the board to find all the current player's pieces
  board.forEach((row, y) => {
    row.forEach((piece, x) => {
      const playerPieces = currentPlayer === 1 ? [1, 3] : [2, 4];
      if (playerPieces.includes(piece)) {
        let [newHighlightedSquares, newMandatoryMoves] = checkPieceForJump(board, x, y, piece, currentPlayer);
        highlightedSquares.push(...newHighlightedSquares);
        mandatoryMoves.push(...newMandatoryMoves);
      }
    });
  });

  return [highlightedSquares, mandatoryMoves];
}


/**
 * Checks if a piece can make another capturing jump after a capture has been made.
 * 
 * @param {number[][]} board - Game board represented as a 2D array.
 * @param {number} x - X coordinate of the piece.
 * @param {number} y - Y coordinate of the piece.
 * @param {number} currentPlayer - Current player making the move.
 * 
 * @returns {Array} - An array containing the highlighted squares, mandatory moves, and whether a move is required.
 */
export function checkForceJumpsAfterCapture(board, x, y, currentPlayer) {
  let highlightedSquares = [];
  let mandatoryMoves = [];
  let moveRequired = false;

  const piece = board[y][x];

  [highlightedSquares, mandatoryMoves, moveRequired] = checkPieceForJump(board, x, y, piece, currentPlayer);

  return [highlightedSquares, mandatoryMoves, moveRequired];
}


/**
 * Checks if the piece at position (x, y) can make a capturing jump.
 * 
 * @param {number[][]} board - The game board represented as a 2D array.
 * @param {number} x - X coordinate of the piece.
 * @param {number} y - Y coordinate of the piece.
 * @param {number} piece - Piece type.
 * @param {number} currentPlayer - Current player making the move.
 * @returns 
 */
export function checkPieceForJump(board, x, y, piece, currentPlayer) {
  let highlightedSquares = [];
  let mandatoryMoves = [];
  let moveRequired = false;
  // Directions to check: up-left, down-left, top-right, down-right
  const directions = [
    [-1, -1], [-1, 1], [1, -1], [1, 1]
  ];

  const opponentPieces = currentPlayer === 1 ? [2, 4] : [1, 3];

  directions.forEach(([dx, dy]) => {
    const [captureX, captureY] = [x + dx, y + dy];
    const [landX, landY] = [x + 2 * dx, y + 2 * dy];

    // Check if landing is within bounds
    if (landX >= 0 && landX < 8 && landY >= 0 && landY < 8) {
      const middlePiece = board[captureY][captureX];
      const landingSquare = board[landY][landX];

      // Check if there's an opponent piece to capture and an empty landing square
      if (opponentPieces.includes(middlePiece) && landingSquare === 0) {
        // Kings can move in any direction, regular pieces can only move forward
        if ((piece === 3 || piece === 4) || dy < 0) {
          moveRequired = true;
          highlightedSquares.push([captureX, captureY]);
          mandatoryMoves.push({ from: [x, y], to: [landX, landY] });
        }
      }
    }
  });
  return [highlightedSquares, mandatoryMoves, moveRequired];
}


/**
 * Checks if there are any mandatory captures for the player.
 * Returns the coordinates of the piece that must be captured, or null if no capture is mandatory.
 */