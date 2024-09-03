import { FaCrown } from "react-icons/fa";
import { initialBoard, isValidMove, makeMove } from "../GameLogic/gameLogic";
import { useEffect, useState } from 'react';

// PIECE VALUES
// 0: empty square
// 1: red piece
// 2: white piece
// 3: red king
// 4: white king

export default function Board({ board, setBoard, gameStarted, currentPlayer, setCurrentPlayer, gameId, sendMessageWebsocket, playerRole }) {
  const [selectedSquare, setSelectedSquare] = useState(null);

  /**
   * Handles selecting a piece or making a move on the board.
   */
  const handleSquareClick = (x, y) => {
    // Prevent interaction if the game hasn't started or if the clicked square is empty and no piece is selected
    if (!gameStarted || (board[y][x] === 0 && selectedSquare === null)) return;

    // Ensure that the player can only move their pieces during their turn
    if (currentPlayer !== playerRole) {
      return;
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
        const newBoard = makeMove(board, startX, startY, x, y, playerRole);
        setBoard(newBoard);

        const nextPlayer = currentPlayer === 1 ? 2 : 1;

        // Switch turns and clear the selection
        setCurrentPlayer(nextPlayer);
        setSelectedSquare(null);

        // Send updated board to the WebSocket server
        sendMessageWebsocket("move", gameId, newBoard);
      } else {
        setSelectedSquare(null);
        // alert("Invalid move");
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
                    className={`w-full flex m-3 rounded-full aspect-square border-4 sm:border-8 ${(square === 1 || square === 3) ? 'bg-red-500 border-red-700' : 'bg-gray-100 border-gray-300'}`}
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