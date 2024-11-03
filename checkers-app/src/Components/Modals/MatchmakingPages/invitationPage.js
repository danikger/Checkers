import { DialogTitle } from '@headlessui/react';
import { useMatchmaking } from '../../../Context/matchmakingContext';

export default function InvitationPage({ setStartGamePage, sendMessageWebsocket }) {
  const { opponentData, setInvitePending, username } = useMatchmaking();

  function handleAccept() {
    sendMessageWebsocket("lobby-invite-accepted", undefined, {hostData: opponentData, guestData: {username: username}});
    let PK = opponentData.PK;
    let gameId = PK.split("-")[1];
    window.location.href = `/?gameId=${gameId}`;
    // setStartGamePage(3);
  }

  function handleDecline() {
    sendMessageWebsocket("lobby-invite-declined", undefined, opponentData);
    setInvitePending(true);
    setStartGamePage(4);
  }

  return (
    <>
      <div className="text-center">
        <DialogTitle as="h3" className="text:base sm:text-xl font-semibold leading-6 text-gray-100 inline-flex">
          {opponentData.username} invited you to play
        </DialogTitle>
        {/* <div className="mt-2">
          <p className="text-sm text-gray-400">
            Invited !!!!
          </p>
        </div> */}
      </div>

      <div className="w-full mt-4">
        <div className="sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3 w-full mx-auto">
          <button
            type="button"
            onClick={() => handleAccept()}
            className="inline-flex w-full items-center justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 sm:col-start-1"
          >
            Accept
          </button>
          <button
            type="button"
            onClick={() => handleDecline()}
            className="mt-3 inline-flex w-full items-center justify-center rounded-md bg-gray-100 px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-200 sm:col-start-2 sm:mt-0"
          >
            Decline
          </button>
        </div>
      </div>
    </>
  );
}