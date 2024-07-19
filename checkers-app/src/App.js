import './App.css';
import { useEffect, useState } from 'react';
import { initialBoard } from './GameLogic/gameLogic.js';
import Board from './Components/board.js';

function App() {
  const [board, setBoard] = useState(initialBoard);

  return (
    <>
      <main className="bg-gray-950 min-h-screen absolute w-full">
        <div className="max-w-4xl mx-auto">
          <Board board={board}/>

          {/* <div className="w-full flex items-center justify-center">
            <button className="bg-blue-500 text-white px-4 py-2 rounded-lg font-medium my-8">Concede</button>
          </div> */}
        </div>
      </main>
    </>
  );
}

export default App;
