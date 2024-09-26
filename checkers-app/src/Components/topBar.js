import { HiUserCircle } from "react-icons/hi";

export default function TopBar({ playerPieces, playerRole, currentPlayer }) {
  return (
    <>
      <div className="mx-auto flex w-full max-w-7xl items-end justify-between mb-2 lg:px-0 px-4">
        <div className="flex flex-1">
          <div className="flex items-center">
            <span className={`aspect-square flex rounded-full h-9 sm:h-12 bg-gray-600 items-center justify-center ${currentPlayer !== playerRole ? 'ring-2 ring-yellow-500' : ''}`}>
              <HiUserCircle className="w-full h-full text-gray-800" />
            </span>
            <span className="text-white font-semibold ml-2 sm:text-base text-sm">Opponent</span>
          </div>
        </div>
        {/* TIMER (feels too cluttered with this) */}
        {/* <div className="relative h-8 sm:h-12 overflow-hidden rounded-lg bg-gray-800 w-1/4 ">
          <div className="h-full rounded-lg bg-gray-700 transition-all duration-1000" style={{ width: `${width}%` }}>
            <span class="absolute inset-0 flex items-center justify-center sm:text-base text-sm font-semibold text-white select-none">0:30</span>
          </div>
        </div> */}
        <div className="justify-end flex flex-1">
          <div>
            <span className={`aspect-square flex rounded-full h-9 sm:h-12 border-4 sm:border-[5px] 
                              items-center justify-center sm:text-base text-sm font-semibold flex-1 
                              ${playerRole === 2 ? 'text-gray-800 bg-gray-100 border-gray-300' : 'text-white bg-red-500 border-red-700'}`}>
              {12 - playerPieces}
            </span>
          </div>
        </div>
      </div>
    </>
  );
}