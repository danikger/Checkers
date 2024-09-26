import { FaCrown } from "react-icons/fa";
import { isValidMove, makeMove, getAvailableMoves, checkForceJumpsAfterCapture, markPossibleMoves } from "../GameLogic/gameLogic";
import { useEffect, useState } from 'react';

// PIECE VALUES
// 0: empty square
// 1: red piece
// 2: white piece
// 3: red king
// 4: white king

export default function Board({ board, setBoard, gameStarted, currentPlayer, playerRole, onMove, onStalemate }) {
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [highlightedSquares, setHighlightedSquares] = useState([]);
  const [mandatoryMoves, setMandatoryMoves] = useState([]);
  const [possibleMoves, setPossibleMoves] = useState([]);

  const [capturesCompleted, setCapturesCompleted] = useState(0);

  // Checks for force jumps before making a move
  useEffect(() => {
    if (currentPlayer === playerRole) {
      const [highlightedSquares, mandatoryMoves, isStalemate] = getAvailableMoves(board, currentPlayer);
      // Current player has no possible moves left, they lose
      if (isStalemate) {
        onStalemate();
      }
      setHighlightedSquares(highlightedSquares);
      setMandatoryMoves(mandatoryMoves);
    }
  }, [currentPlayer]);

  /**
   * Handles selecting a piece or making a move on the board.
   */
  const handleSquareClick = (x, y) => {
    console.log(x, y);

    // Prevent interaction if the game hasn't started, if the clicked square is empty and no piece is selected, and that the player can only move their pieces during their turn
    if (!gameStarted || (board[y][x] === 0 && selectedSquare === null) || currentPlayer !== playerRole) return;

    // Check if there are any mandatory moves and restrict the player to those moves
    if (mandatoryMoves.length > 0) {
      setPossibleMoves([]); // Clear possible moves
      const selectedMove = [x, y];
      const isMoveValid = mandatoryMoves.some(move =>
        selectedMove.every((value, index) => value === move.from[index]) ||
        selectedMove.every((value, index) => value === move.to[index])
      );
      if (!isMoveValid) return;
    }

    setPossibleMoves(markPossibleMoves(board, x, y, playerRole, mandatoryMoves));

    // Handle move if a piece is already selected
    if (selectedSquare) {
      let capturesThisMove = 0;
      const [startX, startY] = selectedSquare;

      // Ensure the selected piece belongs to the current player
      const selectedSquareIsPlayerPiece = (playerRole === 1 && (board[startY][startX] === 1 || board[startY][startX] === 3)) ||
        (playerRole === 2 && (board[startY][startX] === 2 || board[startY][startX] === 4));

      if (!selectedSquareIsPlayerPiece) {
        setSelectedSquare(null); // Deselect if the selected piece doesn't belong to the current player
        return;
      }

      // Check if the move is valid and perform it
      if (isValidMove(board, startX, startY, x, y, playerRole)) {
        const [newBoard, moveType, promotedToKing] = makeMove(board, startX, startY, x, y, playerRole);
        setBoard(newBoard);
        if (moveType === "capture") capturesThisMove++; // Increment captures completed 

        // Check if the player has any force jumps after the capture and that the piece wasn't freshly promoted to a king
        if (moveType === "capture" && !promotedToKing) {
          const [highlightedSquares, mandatoryMoves, moveRequired] = checkForceJumpsAfterCapture(newBoard, x, y, currentPlayer);
          setHighlightedSquares(highlightedSquares);
          setMandatoryMoves(mandatoryMoves);
          if (moveRequired) {
            setCapturesCompleted((prevState) => prevState + 1); // Increment captures completed
            setSelectedSquare(null);
            return;
          }
        }

        setSelectedSquare(null);

        // Send updated board
        onMove(newBoard, capturesThisMove+capturesCompleted);
        setCapturesCompleted(0);
        setHighlightedSquares([]);
        setMandatoryMoves([]);
      } else {
        if (selectedSquareIsPlayerPiece) {
          setSelectedSquare([x, y]);
        } else {
          setSelectedSquare(null); // Clear selection if the piece doesn't belong to the player
        }
      }
    } else {
      // Only allow selecting a piece that belongs to the current player
      if ((playerRole === 1 && (board[y][x] === 1 || board[y][x] === 3)) ||
        (playerRole === 2 && (board[y][x] === 2 || board[y][x] === 4))) {
        setSelectedSquare([x, y]);
      } else {
        setSelectedSquare(null); // Clear selection if the piece doesn't belong to the player
      }
    }
  };


  return (
    <>
      <div className="grid grid-cols-8 grid-rows-8 aspect-square rounded-lg overflow-hidden border-4 sm:border-8 border-gray-950">
        {board.map((row, rowIndex) => (
          <>
            {row.map((square, colIndex) => (
              <div
                onClick={() => handleSquareClick(colIndex, rowIndex)}
                key={colIndex}
                className={`flex justify-center items-center aspect-square ${(rowIndex + colIndex) % 2 === 0 ? 'bg-gray-700' : 'bg-gray-900'} ${square !== 0 ? 'cursor-pointer' : ''} 
                ${possibleMoves.some(([col, row]) => col === colIndex && row === rowIndex) ? 'rounded-full aspect-square border-4 sm:border-8 border-gray-100 border-dotted m-1.5 sm:m-3 cursor-pointer' : ''}`}
              >
                {square !== 0 && (
                  <div
                    className={`w-full flex m-1.5 sm:m-3 rounded-full aspect-square border-4 sm:border-8 
                      ${(square === 1 || square === 3) ? 'bg-red-500 border-red-700' : (square === 2 || square === 4) ? 'bg-gray-100 border-gray-300' : ''}
                      ${highlightedSquares.some(([col, row]) => col === colIndex && row === rowIndex) ? 'ring-2 sm:ring-4 ring-yellow-500 ring-offset-2 sm:ring-offset-4 ring-offset-gray-900' : ''}`}
                  >
                    {(square === 3 || square === 4) && (
                      <FaCrown className={`m-auto h-3/5 w-3/5 ${square === 3 ? 'text-red-800' : square === 4 ? 'text-gray-400' : ''
                        }`} />
                    )}
                  </div>
                )}
              </div>
            ))}
          </>
        ))}
      </div>
    </>
  )
}

// ඞ