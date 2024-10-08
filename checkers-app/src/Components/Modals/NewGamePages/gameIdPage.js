import { useState } from 'react';
import { DialogTitle } from '@headlessui/react';
import { HiClipboardList } from "react-icons/hi";
import { RiLoader5Fill } from "react-icons/ri";

export default function GameIdPage() {
  const [copied, setCopied] = useState(false);

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

  return (
    <>
      <div className="text-center">
        <DialogTitle as="h3" className="text:base sm:text-xl font-semibold leading-6 text-gray-100 inline-flex">
          <RiLoader5Fill className="w-6 h-6 text-gray-100 my-auto mr-2 animate-spin rounded-full" />
          Waiting for player...
        </DialogTitle>
      </div>

      <div className="w-full mt-4">
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
  );
}