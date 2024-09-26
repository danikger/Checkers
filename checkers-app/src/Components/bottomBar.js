import { useEffect, useState } from 'react';
import { HiUserCircle } from "react-icons/hi";

export default function BottomBar(props) {

  return (
    <>
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between mt-2 lg:px-0 px-4">
        <div className="flex flex-1">
          <div className="flex items-center">
            <span className={`aspect-square flex rounded-full h-9 sm:h-12 bg-gray-600 items-center justify-center ${props.currentPlayer === props.playerRole ? 'ring-2 ring-yellow-500' : ''}`}>
              <HiUserCircle className="w-full h-full text-gray-800" />
            </span>
            <span className="text-white font-semibold ml-2 sm:text-base text-sm">You</span>
          </div>
        </div>
        <button className="flex bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-semibold text-center sm:text-sm text-xs" onClick={props.onConcede}>Concede</button>
        <div className="justify-end flex flex-1">
          <div>
            <span className={`aspect-square flex rounded-full h-9 sm:h-12 border-4 sm:border-[5px] 
                              items-center justify-center sm:text-base text-sm font-semibold flex-1 
                              ${props.playerRole === 1 ? 'text-gray-800 bg-gray-100 border-gray-300' : 'text-white bg-red-500 border-red-700'}`}>
              {12 - props.opponentPieces}
            </span>
          </div>
        </div>
      </div>
    </>
  );
}