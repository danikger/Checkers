import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react';
import { RiLoader5Fill } from "react-icons/ri";

export default function EndModal({ openEndModal, endCondition, onRematch, rematchPending }) {

  function getModalTitle() {
    if (endCondition === 'rematch_requested') {
      return 'Opponent requested a rematch'
    }

    const victoryConditions = ['victory', 'victory-stalemate', 'victory-concede'];
    const lossConditions = ['loss', 'loss-stalemate', 'loss-concede'];

    if (victoryConditions.includes(endCondition)) {
      return 'You Won';
    }
    
    if (lossConditions.includes(endCondition)) {
      return 'You Lost';
    }
    
    return ''; // When a player accepts a rematch, this text flashes for a second
  }

  function getModalDescription() {
    switch (endCondition) {
      case 'loss-stalemate':
        return 'You have no remaining moves.';
      case 'victory-stalemate':
        return 'Your opponent had no remaining moves.';
      case 'loss-concede':
        return 'You conceded the game.';
      case 'victory-concede':
        return 'Your opponent conceded the game.';
      default:
        return '';
    }
  }

  return (
    <Dialog open={openEndModal} onClose={() => null} className="relative z-10">
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

            <div className="mt-5 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
              {
                endCondition === 'rematch_requested' ? (
                  <>
                    <button
                      type="button"
                      onClick={() => onRematch()}
                      className="inline-flex w-full items-center justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 sm:col-start-1"
                    >
                      Accept
                    </button>
                    <button
                      type="button"
                      onClick={() => window.location.href = '/'}
                      className="mt-3 inline-flex w-full items-center justify-center rounded-md bg-gray-100 px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-200 sm:col-start-2 sm:mt-0"
                    >
                      Decline
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => window.location.href = '/'}
                      className="inline-flex w-full items-center justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 sm:col-start-1"
                    >
                      New Game
                    </button>
                    <button
                      type="button"
                      onClick={() => onRematch()}
                      className={`mt-3 text-center inline-flex items-center w-full justify-center rounded-md bg-gray-100 px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-200 sm:col-start-2 sm:mt-0 ${rematchPending ? 'cursor-default' : ''}`}
                    >
                      {rematchPending && <RiLoader5Fill className="w-5 h-5 text-gray-800 my-auto mr-2 animate-spin rounded-full" />}
                      Rematch
                    </button>
                  </>
                )
              }
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  )
}
