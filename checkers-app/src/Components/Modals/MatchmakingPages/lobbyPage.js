import { DialogTitle } from '@headlessui/react';
import { HiUserCircle } from "react-icons/hi";
import { useState, useEffect } from 'react';
import { RiLoader5Fill } from "react-icons/ri";

import { useMatchmaking } from '../../../Context/matchmakingContext';

export default function LobbyPage({ setStartGamePage, disconnectWebsocket, sendMessageWebsocket, lastMessage }) {
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
      const body = JSON.parse(data.body);
      console.log(body);
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
   * 
   * @param {*} playerData 
   */
  function handlePlayerInvite(playerData) {
    console.log(playerData);
    setInvitePending(true);
    setGuestData(playerData);

    const urlParams = new URLSearchParams(window.location.search);
    urlParams.set('gameId', lobbyId);
    window.history.replaceState(null, null, `?${urlParams.toString()}`);
    sessionStorage.setItem('gameId', JSON.stringify(lobbyId));

    sendMessageWebsocket("lobby-invite", undefined, { hostData: { username: username, gameId: lobbyId }, guestData: playerData });
  }


  /**
   * 
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
   * 
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
            <div className="mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-1 sm:gap-3 w-3/5 mx-auto">
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
                  <div onClick={() => handlePlayerInvite(player)} className="flex flex-col items-center justify-center cursor-pointer hover:scale-110 ease-in-out duration-75 delay-75 hover:bg-gray-700 rounded-lg p-1 w-[22%] sm:w-[18%]">
                    <span className="aspect-square flex rounded-full h-9 sm:h-12 bg-gray-600 items-center justify-center">
                      <HiUserCircle className="w-full h-full text-gray-800" />
                    </span>
                    <span className="text-white mt-1 text-xs">{player.username}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-1 sm:gap-3 w-3/5 mx-auto">
              <button
                type="button"
                onClick={() => {
                  disconnectWebsocket();
                  setStartGamePage(3);
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