import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react';

export default function DisconnectModal({ openDisconnectModal, disconnectType }) {

  function getModalTitle() {
    return disconnectType === 'opponent' ? 'Opponent Disconnected' : 'Connection Lost';
  }

  function getModalDescription() {
    return disconnectType === 'opponent' ? 'Your opponent has disconnected from the game.' : 'You have lost connection to the game.';
  }

  return (
    <Dialog open={openDisconnectModal} onClose={() => null} className="relative z-10">
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
            <div>
              <div className="text-center">
                <DialogTitle as="h3" className="text:base sm:text-xl font-semibold leading-6 text-gray-100 inline-flex">
                  {getModalTitle()}
                </DialogTitle>
                <div className="mt-2">
                  <p className="text-sm text-gray-400">
                    {getModalDescription()}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-5 ">
              <button
                type="button"
                onClick={() => window.location.href = '/'}
                className="inline-flex w-full items-center justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              >
                Reset
              </button>
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  )
}
