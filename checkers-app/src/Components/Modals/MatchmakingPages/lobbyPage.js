import { DialogTitle } from '@headlessui/react';
import { HiUserCircle } from "react-icons/hi";
import { useState, useEffect } from 'react';
import { RiLoader5Fill } from "react-icons/ri";

import { useMatchmaking } from '../../../Context/matchmakingContext';

export default function LobbyPage({ setStartGamePage, disconnectWebsocket, sendMessageWebsocket, lastMessage, setMatchmakingInProgress }) {
  const { setOpponentData, username, lobbyId, invitePending, setInvitePending } = useMatchmaking();

  const [availablePlayers, setAvailablePlayers] = useState([]);
  const [guestData, setGuestData] = useState({});

  const apiURL = 'https://y8jgocjd20.execute-api.us-east-1.amazonaws.com/production/getActivePlayers';


  /**
   * Fetches all available players currently in the lobby.
   */
  const fetchAvailablePlayers = async () => {
    try {
      const response = await fetch(apiURL);
      const data = await response.json();
      let body = JSON.parse(data.body);
      body = body.filter(player => !player.PK.includes(`game-${lobbyId}`));
      setAvailablePlayers(body);
    }
    catch (error) {
      console.error('Error:', error);
    }
  };


  useEffect(() => {
    fetchAvailablePlayers();
  }, []);


  // Handles incoming lobby messages from API
  useEffect(() => {
    if (lastMessage !== null) {
      let receivedMessage = JSON.parse(lastMessage.data);

      switch (receivedMessage.type) {
        case 'update-players':
          fetchAvailablePlayers();
          break;

        case 'remove-players':
          setAvailablePlayers((prevState) => {
            return [...prevState].filter(existingPlayer => !receivedMessage.data.some(playerToRemove => playerToRemove.hostId === existingPlayer.hostId));
          });
          break;

        case 'add-players':
          setAvailablePlayers((prevState) => [...prevState, ...receivedMessage.data]);
          break;

        case 'lobby-invite':
          if (!invitePending) {
            setOpponentData(receivedMessage.data);
            setStartGamePage(5);
            setInvitePending(true);
          }
          break;

        case 'start':
          setInvitePending(false);
          break;

        case 'lobby-invite-declined':
          lobbyInviteDeclined();
          break;

        case 'back-to-lobby':
          setInvitePending(false);
          break;
      }
    }
  }, [lastMessage]);


  /**
   * Sends an invite to the selected player and updates the URL with the gameId.
   * @param {*} playerData Data of player to invite.
   */
  function handlePlayerInvite(playerData) {
    setInvitePending(true);
    setGuestData(playerData);

    const urlParams = new URLSearchParams(window.location.search);
    urlParams.set('gameId', lobbyId);
    window.history.replaceState(null, null, `?${urlParams.toString()}`);
    sessionStorage.setItem('gameId', JSON.stringify(lobbyId));

    sendMessageWebsocket("lobby-invite", undefined, { hostData: { username: username, gameId: lobbyId }, guestData: playerData });
  }


  /**
   * Handles the case where the invite was declined by the invited player. Removes the gameId from the URL and sessionStorage.
   */
  function lobbyInviteDeclined() {
    const urlParams = new URLSearchParams(window.location.search);
    urlParams.delete('gameId');
    window.history.replaceState(null, null, window.location.pathname);
    sessionStorage.removeItem('gameId');

    setStartGamePage(4);
    setInvitePending(false);
    fetchAvailablePlayers();
  }


  /**
   * Shows the modal content based on the state of invitePending. If invitePending is true, the modal will show the "Waiting for response" message.
   * @returns {JSX.Element} Modal content for invite pending.
   */
  function getModalContent() {
    if (invitePending) {
      return (
        <>
          <div className="text-center">
            <DialogTitle as="h3" className="text:base sm:text-xl font-semibold leading-6 text-gray-100 inline-flex">
              <RiLoader5Fill className="w-6 h-6 text-gray-100 my-auto mr-2 animate-spin rounded-full" />
              Waiting for response
            </DialogTitle>
          </div>

          <div className="w-full mt-4">
            <div className="mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-1 sm:gap-3 w-2/5 mx-auto">
              <button
                type="button"
                onClick={() => {
                  lobbyInviteDeclined();
                  sendMessageWebsocket("lobby-invite-declined", undefined, guestData);
                }}
                className="inline-flex w-full items-center justify-center rounded-md bg-gray-100 px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              >
                Back
              </button>
            </div>
          </div>
        </>
      );
    }
    else {
      return (
        <>
          <div className="text-center">
            <DialogTitle as="h3" className="text:base sm:text-xl font-semibold leading-6 text-gray-100 inline-flex">
              Multiplayer
            </DialogTitle>
            <div className="mt-2">
              <p className="text-sm text-gray-400">
                Select a player to send an invitaton for a game.
              </p>
            </div>
          </div>

          <div className="w-full mt-4">
            <div className="relative">
              <div className="flex flex-wrap justify-center items-start gap-2">
                {availablePlayers.map(player => (
                  <div key={player.hostId} onClick={() => handlePlayerInvite(player)} className="flex flex-col items-center justify-center cursor-pointer hover:scale-110 ease-in-out duration-75 delay-75 hover:bg-gray-700 rounded-lg p-1 w-[22%] sm:w-[18%]">
                    <span className="aspect-square flex rounded-full h-9 sm:h-12 bg-gray-600 items-center justify-center">
                      <HiUserCircle className="w-full h-full text-gray-800" />
                    </span>
                    <span className="text-white mt-1 text-xs">{player.username}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-1 sm:gap-3 w-2/5 mx-auto">
              <button
                type="button"
                onClick={() => {
                  disconnectWebsocket();
                  setStartGamePage(3);
                  setMatchmakingInProgress(false);
                }}
                className="inline-flex w-full items-center justify-center rounded-md bg-gray-100 px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              >
                Back
              </button>
            </div>
          </div>
        </>
      );
    }
  }

  return (
    <>
      {getModalContent()}
    </>
  );
}