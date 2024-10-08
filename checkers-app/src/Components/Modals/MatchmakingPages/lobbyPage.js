import { DialogTitle } from '@headlessui/react';
import { HiUserCircle } from "react-icons/hi";

export default function LobbyPage({ setStartGamePage }) {

  const players = [
    'Sky42',
    'Pixie7',
    'ShadowX',
    'NeoTig',
    'CyKnight',
    'MYSTDRA',
    'QQueen',
    'AstNom',
    'VortexV',
    'FrostP',
    'SolSur',
    'EchoW',
    'GalGuru',
    'CryptRv',
    'BlzRdr',
    'BlzRdr'
  ];

  return (
    <>
      <div className="text-center">
        <DialogTitle as="h3" className="text:base sm:text-xl font-semibold leading-6 text-gray-100 inline-flex">
          Multiplayer
        </DialogTitle>
        <div className="mt-2">
          <p className="text-sm text-gray-400">
            Click on a player to invite them for a game lil bro.
          </p>
        </div>
      </div>

      <div className="w-full mt-4">
        <div className="relative">
          <div className="flex flex-wrap justify-center items-start gap-2">
            {players.map(player => (
              <div onClick={() => setStartGamePage(5)} className="flex flex-col items-center justify-center cursor-pointer hover:scale-110 ease-in-out duration-75 delay-75 hover:bg-gray-700 rounded-lg p-1 w-[22%] sm:w-[18%]">
                <span className="aspect-square flex rounded-full h-9 sm:h-12 bg-gray-600 items-center justify-center">
                  <HiUserCircle className="w-full h-full text-gray-800" />
                </span>
                <span className="text-white mt-1 text-xs">{player}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-1 sm:gap-3 w-3/5 mx-auto">
          <button
            type="button"
            onClick={() => setStartGamePage(3)}
            className="inline-flex w-full items-center justify-center rounded-md bg-gray-100 px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            Back
          </button>
        </div>
      </div>
    </>
  );
}