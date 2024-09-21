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
 * @returns {Array} - An array containing the new state of the board, the type of move made, and whether the piece was promoted to a king.
 */
export function makeMove(board, startX, startY, endX, endY, player) {
  const newBoard = board.map(row => [...row]);
  let moveType = "move"; // Two types of moves: "move" or "capture"
  let promotedToKing = false;
  const piece = newBoard[startY][startX];

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
    promotedToKing = true; // Helps to stop a piece from capturing on the same turn after it was just promoted

  }

  return [newBoard, moveType, promotedToKing];
}


/**
 * Checks if there are any force jumps for the player, and if there are any normal moves to detect a stalemate.
 * 
 * @param {number[][]} board - Game board represented as a 2D array.
 * @param {number} currentPlayer - Current player making the move.
 * 
 * @returns {Array} - An array containing the highlighted squares array, mandatory moves array, and a stalemate boolean.
 */
export function getAvailableMoves(board, currentPlayer) {
  let highlightedSquares = [];
  let mandatoryMoves = [];
  let isStalemate = true;  // Assume stalemate until proven otherwise

  // Iterate over the board to find all the current player's pieces
  board.forEach((row, y) => {
    row.forEach((piece, x) => {
      const playerPieces = currentPlayer === 1 ? [1, 3] : [2, 4];
      if (playerPieces.includes(piece)) {
        let [newHighlightedSquares, newMandatoryMoves, moveRequired, pieceStalemate] = checkPieceForMoves(board, x, y, currentPlayer);
        highlightedSquares.push(...newHighlightedSquares);
        mandatoryMoves.push(...newMandatoryMoves);

        if (!pieceStalemate) {
          isStalemate = false; // Piece has a move, not a stalemate
        }
      }
    });
  });

  return [highlightedSquares, mandatoryMoves, isStalemate];
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

  [highlightedSquares, mandatoryMoves, moveRequired] = checkPieceForMoves(board, x, y, currentPlayer);

  return [highlightedSquares, mandatoryMoves, moveRequired];
}


/**
 * Checks if the piece at position (x, y) can make a capturing jump as well as a normal move to check for stalemates.
 * 
 * @param {number[][]} board - The game board represented as a 2D array.
 * @param {number} x - X coordinate of the piece.
 * @param {number} y - Y coordinate of the piece.
 * @param {number} currentPlayer - Current player making the move.
 * 
 * @returns {Array} - An array containing the highlighted squares array, mandatory moves array, move required boolean, and a stalemate boolean.
 */
export function checkPieceForMoves(board, x, y, currentPlayer) {
  let highlightedSquares = [];
  let mandatoryMoves = [];
  let moveRequired = false;
  let hasNormalMove = false;
  let piece = board[y][x];

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
        // Check if its a king or a piece moving forward
        if ((piece === 3 || piece === 4) || dy < 0) {
          moveRequired = true;
          highlightedSquares.push([captureX, captureY]);
          mandatoryMoves.push({ from: [x, y], to: [landX, landY] });
        }
      }
    }

    // Also check for a normal move in this direction (non-jump)
    const [newX, newY] = [x + dx, y + dy];
    if (newX >= 0 && newX < 8 && newY >= 0 && newY < 8 && board[newY][newX] === 0) {
      // Check if its a king or a piece moving forward
      if ((piece === 3 || piece === 4) || dy < 0) {
        hasNormalMove = true;
      }
    }
  });

  const isStalemate = !moveRequired && !hasNormalMove;

  return [highlightedSquares, mandatoryMoves, moveRequired, isStalemate];
}

/**
 * Checks for possible moves for a piece at position (x, y) to be shown on the board.
 * 
 * @param {number[][]} board - The game board represented as a 2D array.
 * @param {number} x - X coordinate of the piece.
 * @param {number} y - Y coordinate of the piece.
 * @param {number} currentPlayer - Current player making the move.
 * @param {Array} mandatoryMoves - Array of mandatory move objects. (Example: [{ from: [0, 0], to: [1, 1] }] )
 * 
 * @returns {Array} - An array containing the possible moves for the piece.
 */
export function markPossibleMoves(board, x, y, currentPlayer, mandatoryMoves) {
  let possibleMoves = [];
  const piece = board[y][x];

  // Directions for moving: up-left, up-right, down-left, down-right
  const directions = [
    [-1, -1], [-1, 1], [1, -1], [1, 1]
  ];

  const opponentPieces = currentPlayer === 1 ? [2, 4] : [1, 3];

  if (piece !== 0 && !opponentPieces.includes(piece)) {
    directions.forEach(([dx, dy]) => {
      const [newX, newY] = [x + dx, y + dy];

      if ((piece === 1 || piece === 2) && dy === 1) return; // Skip if the piece is a normal piece and checking backwards direction

      // NORMAL MOVE PATH --------
      // Check if the new position is within bounds and is empty
      if (newX >= 0 && newX < 8 && newY >= 0 && newY < 8 && board[newY][newX] === 0) {
        // Check for mandatory moves and don't show paths for regular moves if there are any
        if (!mandatoryMoves.length > 0) {
          possibleMoves.push([newX, newY]);
        }
      }

      const [captureX, captureY] = [x + dx, y + dy];
      const [landX, landY] = [x + 2 * dx, y + 2 * dy];

      // CAPTURE MOVE PATH --------
      // Check if there's a valid landing spot
      if (landX >= 0 && landX < 8 && landY >= 0 && landY < 8 && board[landY][landX] === 0) {
        const middlePiece = board[captureY][captureX];
        // Check if there's an opponent piece to capture
        if (opponentPieces.includes(middlePiece)) {
          possibleMoves.push([landX, landY]);
        }
      }
    });
  }

  return possibleMoves;
}