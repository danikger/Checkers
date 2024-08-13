import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react'
import { useState } from 'react'

export default function StartModal({ isHost, setIsHost, setGameId, setIsConnected }) {
  const [startGamePage, setStartGamePage] = useState(1);


  function startNewGame() {
    // sendMessage({ action: 'start' });
    setIsHost(false);
    const urlParams = new URLSearchParams(window.location.search);
    let lobbyId = urlParams.get('gameId');
    if (lobbyId === null) {
      lobbyId = generateGameId();
      console.log(lobbyId);
      urlParams.set('gameId', lobbyId);
      window.history.replaceState(null, null, `?${urlParams.toString()}`);
      setGameId(lobbyId);
      setIsConnected(true);
    }
  }

  const generateGameId = () => {
    return Math.random().toString(36).substr(2, 9);
  };

  function modalContents() {
    if (startGamePage === 1) {
      return (
        <>
          <div>
            <div className="text-center">
              <DialogTitle as="h3" className="text-xl font-semibold leading-6 text-gray-100">
                New Game
              </DialogTitle>
              {/* <div className="mt-2">
                  <p className="text-sm text-gray-400">
                    Description text ???
                  </p>
                </div> */}
            </div>
          </div>
          <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
            <button
              type="button"
              onClick={() => startNewGame()}
              className="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 sm:col-start-1"
            >
              Create Game
            </button>
            <button
              type="button"
              // onClick={() => setOpen(false)}
              className="mt-3 inline-flex w-full justify-center rounded-md bg-gray-100 px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-200 sm:col-start-2 sm:mt-0"
            >
              Find Players
            </button>
          </div>
        </>
      )
    }
    else {
      return (
        <>
          
        </>
      )
    }
  }

  return (
    <Dialog open={isHost} onClose={() => null} className="relative z-10">
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-gray-950 bg-opacity-80 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
      />

      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full justify-center p-4 text-center items-center sm:p-0">
          <DialogPanel
            transition
            className="relative transform overflow-hidden rounded-lg bg-gray-800 px-4 pb-4 pt-5 text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in sm:my-8 sm:w-full sm:max-w-md sm:p-6 data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"
          >
            {modalContents()}
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  )
}
