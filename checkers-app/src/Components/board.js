import { FaCrown } from "react-icons/fa";

export default function Board({ board }) {

  // PIECE VALUES
  // 0: empty square
  // 1: red piece
  // 2: white piece
  // 3: red king
  // 4: white king

  return (
    <>
      <div className="grid grid-cols-8 grid-rows-8 mt-32 aspect-square rounded-lg overflow-hidden border-8 border-gray-950">
        {board.map((row, rowIndex) => (
          <>
            {row.map((square, colIndex) => (
              <div
                key={colIndex}
                className={`flex justify-center items-center aspect-square ${(rowIndex + colIndex) % 2 === 0 ? 'bg-gray-700' : 'bg-gray-900'} ${square !== 0 ? 'cursor-pointer' : ''}`}
              >
                {square !== 0 && (
                  <div
                    className={`w-full flex m-3 rounded-full aspect-square border-4 sm:border-8 ${square === 1 || square === 3 ? 'bg-red-500 border-red-700' : 'bg-gray-100 border-gray-300'} ${square === 3 || square === 4 ? 'border-yellow-600' : ''}`}
                  >
                    <FaCrown className={`m-auto h-7 w-7 hidden ${square === 3 || square === 4 ? 'block text-red-800' : 'block text-gray-400'}`}/>
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