import { FaCrown } from "react-icons/fa";
import { isValidMove, makeMove, checkForceJumpsBeforeMove, checkForceJumpsAfterCapture } from "../GameLogic/gameLogic";
import { useEffect, useState } from 'react';

// PIECE VALUES
// 0: empty square
// 1: red piece
// 2: white piece
// 3: red king
// 4: white king

export default function Board({ board, setBoard, gameStarted, currentPlayer, setCurrentPlayer, sendMessageWebsocket, playerRole }) {
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [highlightedSquares, setHighlightedSquares] = useState([]);
  const [mandatoryMoves, setMandatoryMoves] = useState([]);

  // Checks for force jumps before making a move
  useEffect(() => {
    if (currentPlayer === playerRole) {
      const [highlightedSquares, mandatoryMoves] = checkForceJumpsBeforeMove(board, currentPlayer);
      setHighlightedSquares(highlightedSquares);
      setMandatoryMoves(mandatoryMoves);
    }
  }, [currentPlayer]);

  /**
   * Handles selecting a piece or making a move on the board.
   */
  const handleSquareClick = (x, y) => {
    console.log(x, y);

    // Prevent interaction if the game hasn't started or if the clicked square is empty and no piece is selected
    if (!gameStarted || (board[y][x] === 0 && selectedSquare === null)) return;

    // Ensure that the player can only move their pieces during their turn
    if (currentPlayer !== playerRole) {
      return;
    }

    // Check if there are any mandatory moves and restrict the player to those moves
    if (mandatoryMoves.length > 0) {
      const selectedMove = [x, y];
      const isMoveValid = mandatoryMoves.some(move =>
        selectedMove.every((value, index) => value === move.from[index]) ||
        selectedMove.every((value, index) => value === move.to[index])
      );
      if (!isMoveValid) return;
    }

    // Handle move if a piece is already selected
    if (selectedSquare) {
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
        const [newBoard, moveType] = makeMove(board, startX, startY, x, y, playerRole);
        setBoard(newBoard);

        // Check if the player has any force jumps after the capture
        if (moveType === "capture") {
          const [highlightedSquares, mandatoryMoves, moveRequired] = checkForceJumpsAfterCapture(board, x, y, currentPlayer);
          setHighlightedSquares(highlightedSquares);
          setMandatoryMoves(mandatoryMoves);
          if (moveRequired) {
            setSelectedSquare([x, y]);
            return;
          }
        }

        const nextPlayer = currentPlayer === 1 ? 2 : 1;
        // Switch turns and clear the selection
        setCurrentPlayer(nextPlayer);
        setSelectedSquare(null);

        // Send updated board
        sendMessageWebsocket("move", undefined, { board: newBoard, lastMovedPiece: [Math.abs(x - 7), Math.abs(y - 7)] });
        setHighlightedSquares([]);
        setMandatoryMoves([]);
      } else {
        setSelectedSquare(null);
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
      <div className="grid grid-cols-8 grid-rows-8 mt-32 aspect-square rounded-lg overflow-hidden border-8 border-gray-950">
        {board.map((row, rowIndex) => (
          <>
            {row.map((square, colIndex) => (
              <div
                onClick={() => handleSquareClick(colIndex, rowIndex)}
                key={colIndex}
                className={`flex justify-center items-center aspect-square ${(rowIndex + colIndex) % 2 === 0 ? 'bg-gray-700' : 'bg-gray-900'} ${square !== 0 ? 'cursor-pointer' : ''}`}
              >
                {square !== 0 && (
                  <div
                    className={`w-full flex m-2 sm:m-3 rounded-full aspect-square border-4 sm:border-8 
                      ${(square === 1 || square === 3) ? 'bg-red-500 border-red-700' : 'bg-gray-100 border-gray-300'} 
                      ${highlightedSquares.some(([col, row]) => col === colIndex && row === rowIndex) ? 'ring sm:ring-4 ring-yellow-500 ring-offset-4 ring-offset-gray-900' : ''}`}
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