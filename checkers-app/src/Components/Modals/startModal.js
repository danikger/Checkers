import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react';
import { useState, useEffect } from 'react';
import { generateGameId } from '../../utils/utilFunctions.js';

import GameIdPage from './NewGamePages/gameIdPage.js';
import UsernamePage from './MatchmakingPages/usernamePage.js';
import LobbyPage from './MatchmakingPages/lobbyPage.js';
import InvitationPage from './MatchmakingPages/invitationPage.js';

export default function StartModal({ openStartModal, connectWebsocket, setGameId }) {
  const [startGamePage, setStartGamePage] = useState(1);
  const [username, setUsername] = useState('');

  const modalContents = {
    1: mainPage(),
    2: <GameIdPage />,
    3: <UsernamePage username={username} setUsername={setUsername} setStartGamePage={setStartGamePage} />,
    4: <LobbyPage setStartGamePage={setStartGamePage} />,
    5: <InvitationPage setStartGamePage={setStartGamePage} />
  };


  useEffect(() => {
    if (startGamePage === 2) {
      const urlParams = new URLSearchParams(window.location.search);
      let urlGameId = urlParams.get('gameId');
      if (urlGameId === null) {
        urlGameId = generateGameId();
        urlParams.set('gameId', urlGameId);
        window.history.replaceState(null, null, `?${urlParams.toString()}`);
        setGameId(urlGameId);
        connectWebsocket();
        sessionStorage.setItem('gameId', JSON.stringify(urlGameId));
      }
    }
  }, [startGamePage]);


  function renderModalContents() {
    return (
      modalContents[startGamePage]
    )
  }

  function mainPage() {
    return (
      <>
        <div className="text-center">
          <DialogTitle as="h3" className="text:base sm:text-xl font-semibold leading-6 text-gray-100">
            New Game
          </DialogTitle>
        </div>
        <div className="mt-4 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
          <button
            type="button"
            onClick={() => setStartGamePage(2)}
            className="inline-flex w-full items-center justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 sm:col-start-1"
          >
            Create Game
          </button>
          <button
            type="button"
            onClick={() => setStartGamePage(3)}
            className="mt-3 inline-flex w-full items-center justify-center rounded-md bg-gray-100 px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-200 sm:col-start-2 sm:mt-0"
          >
            Find Players
          </button>
        </div>
      </>
    )
  }

  return (
    <Dialog open={openStartModal} onClose={() => null} className="relative z-10">
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-gray-950 bg-opacity-80 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
      />

      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full justify-center p-4 text-center items-center sm:p-0">
          <DialogPanel
            transition
            className="relative transform overflow-hidden rounded-lg bg-gray-800 px-4 pb-4 pt-5 text-left shadow-xl
                      transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 
                      data-[enter]:ease-out data-[leave]:ease-in sm:my-8 sm:w-full min-[450px]:w-3/4 w-full sm:max-w-md sm:p-6 data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"
          >
            {renderModalContents()}
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  )
}
