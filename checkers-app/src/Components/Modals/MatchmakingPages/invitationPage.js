import { DialogTitle } from '@headlessui/react';

export default function InvitationPage({ setStartGamePage }) {
  return (
    <>
      <div className="text-center">
        <DialogTitle as="h3" className="text:base sm:text-xl font-semibold leading-6 text-gray-100 inline-flex">
          USERNAME invited you to play
        </DialogTitle>
        {/* <div className="mt-2">
                <p className="text-sm text-gray-400">
                  Click on a player to invite them for a game lil bro.
                </p>
              </div> */}
      </div>

      <div className="w-full mt-4">
        <div className="sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3 w-full mx-auto">
          <button
            type="button"
            className="inline-flex w-full items-center justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 sm:col-start-1"
          >
            Accept
          </button>
          <button
            type="button"
            onClick={() => setStartGamePage(4)}
            className="mt-3 inline-flex w-full items-center justify-center rounded-md bg-gray-100 px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-200 sm:col-start-2 sm:mt-0"
          >
            Decline
          </button>
        </div>
      </div>
    </>
  );
}