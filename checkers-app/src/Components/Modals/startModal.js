import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react';
import { HiClipboardList } from "react-icons/hi";
import { RiLoader5Fill } from "react-icons/ri";
import { useState, useEffect } from 'react';
import { generateGameId } from '../../utils/utilFunctions.js';

export default function StartModal({ openStartModal, connectWebsocket, setGameId }) {
  const [startGamePage, setStartGamePage] = useState(1);
  const [copied, setCopied] = useState(false);


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



  /**
   * Copies the current URL to the clipboard, and changes 'copied' state to true for 2 seconds to show the "Copied" message on the button.
   */
  function copyToClipboard() {
    setCopied(true);

    navigator.clipboard.writeText(window.location.href);

    setTimeout(() => {
      setCopied(false);
    }, 2000);
  }


  function modalContents() {
    if (startGamePage === 1) {
      return (
        <>
          <div>
            <div className="text-center">
              <DialogTitle as="h3" className="text:base sm:text-xl font-semibold leading-6 text-gray-100">
                New Game
              </DialogTitle>
              {/* <div className="mt-2">
                  <p className="text-sm text-gray-400">
                    Description text ???
                  </p>
                </div> */}
            </div>
          </div>
          <div className="mt-5 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
            <button
              type="button"
              onClick={() => setStartGamePage(2)}
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
    if (startGamePage === 2) {
      return (
        <>
          <div>
            <div className="text-center">
              <DialogTitle as="h3" className="text:base sm:text-xl font-semibold leading-6 text-gray-100 inline-flex">
                <RiLoader5Fill className="w-6 h-6 text-gray-100 my-auto mr-2 animate-spin rounded-full" />
                Waiting for player...
              </DialogTitle>
              {/* <div className="mt-2">
                  <p className="text-sm text-gray-400">
                    Description text ???
                  </p>
                </div> */}
            </div>
          </div>

          <div className="w-full mt-5">
            <p className="text-gray-400 mb-1 text-sm">Share link:</p>
            <div className="relative">
              <label htmlFor="game-id-copy-text" className="sr-only">Game Link</label>
              <input id="game-id-copy-text" type="text" className="col-span-6 border border-gray-600 bg-gray-700 text-gray-400 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full px-2.5 py-4 placeholder-gray-400" value={window.location.href} disabled readOnly />
              <button onClick={() => copyToClipboard()} data-copy-to-clipboard-target="game-id-copy-text" className="absolute end-2.5 top-1/2 -translate-y-1/2 text-gray-400 bg-gray-800 border-gray-600 hover:bg-gray-700 rounded-lg py-2 px-2.5 inline-flex items-center justify-center border">
                {copied ? (
                  <span id="success-message" className="inline-flex items-center">
                    <HiClipboardList className="w-4 h-4 text-blue-500 mr-1.5" />
                    <span className="text-xs font-semibold text-blue-500">Copied</span>
                  </span>
                ) : (
                  <span id="default-message" className="inline-flex items-center">
                    <HiClipboardList className="w-4 h-4 mr-1.5" />
                    <span className="text-xs font-semibold">Copy</span>
                  </span>
                )}
              </button>
            </div>
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
            {modalContents()}
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  )
}
