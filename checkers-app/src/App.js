import './App.css';
import { useEffect, useState } from 'react';
import { initialBoard } from './GameLogic/gameLogic.js';
import useWebSocket from 'react-use-websocket';
import Board from './Components/board.js';
import StartModal from './Components/startModal.js';

function App() {
  const [board, setBoard] = useState(initialBoard);
  const [input, setInput] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isHost, setIsHost] = useState(() => {
    const urlParams = new URLSearchParams(window.location.search);
    let gameId = urlParams.get('gameId');
    return gameId === null ? true : false;
  });
  const [gameId, setGameId] = useState(() => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('gameId');
  });

  
  // Determines if user is a host or guest. Checks if user is host and connects them to the API if they are a guest
  useEffect(() => {
    console.log(readyState);
    if (!isHost) {
      const urlParams = new URLSearchParams(window.location.search);
      let lobbyId = urlParams.get('gameId');
      setGameId(lobbyId);
      setIsConnected(true);

    } else {
      console.log('Host');
    }
  }, [isHost]);


  // Prompts user to confirm page refresh
  // useEffect(() => {
  //   window.onbeforeunload = function () {
  //     return true;
  //   };

  //   return () => {
  //     const urlParams = new URLSearchParams(window.location.search);
  //     urlParams.delete('gameId');
  //     setGameId(null);
  //     window.history.replaceState(null, null, `?${urlParams.toString()}`);
  //     setIsHost(true);
  //     window.onbeforeunload = null;
  //   };
  // }, []);


  const socketURL = 'wss://k81ymo1nek.execute-api.us-east-1.amazonaws.com/production/';

  const { sendMessage, lastMessage, readyState, getWebSocket } = useWebSocket(socketURL, {
    queryParams: { gameId: gameId },
    shouldReconnect: () => false,
    onOpen: () => console.log('Connected'),
    onClose: () => console.log('Disconnected'),
    onError: (error) => console.log('WebSocket Error: ', error),
  }, isConnected);


  /**
   * Handles connecting to the API
   */
  const handleConnect = () => {
    setIsConnected(true);
  };


  /**
   * Handles disconnecting from the API
   */
  const handleDisconnect = () => {
    const socket = getWebSocket();
    if (socket) {
      socket.close();
      setIsConnected(false);
    }
  };


  /**
   * Handles sending messages to the API
   */
  const handleMessage = () => {
    // const message = JSON.stringify({ action: "sendMessage", message: [...initialBoard].reverse() });
    const message = JSON.stringify({ action: "sendMessage", message: { message: input, roomCode: gameId } });
    console.log('Sending message:', message);
    sendMessage(message);
  };

  // Handles incoming messages from API
  useEffect(() => {
    if (lastMessage !== null) {
      console.log('Received message:', typeof (JSON.parse(lastMessage.data)));
      console.log('Received message:', JSON.parse(lastMessage.data));
    }
  }, [lastMessage]);


  return (
    <>
      <main className="bg-gray-900 min-h-screen absolute w-full">
        <StartModal isHost={isHost} setIsHost={setIsHost} setIsConnected={setIsConnected} setGameId={setGameId} />
        <div className="max-w-4xl mx-auto">
          <Board board={board} />

          <div className="w-full flex items-center justify-center space-x-4">
            <button className="bg-blue-600 hover:bg-blue-500 text-white text-sm px-6 py-2 rounded-lg font-semibold my-8" onClick={handleConnect} disabled={isConnected}>
              Connect
            </button>
            <button className="bg-blue-600 hover:bg-blue-500 text-white text-sm px-6 py-2 rounded-lg font-semibold my-8" onClick={handleDisconnect} disabled={!isConnected}>
              Disconnect
            </button>
            <button className="bg-blue-600 hover:bg-blue-500 text-white text-sm px-6 py-2 rounded-lg font-semibold my-8" onClick={handleMessage} disabled={!isConnected}>
              Send Message
            </button>
          </div>
          <input type="text" className="border border-gray-700 bg-gray-800 rounded-md shadow-sm text-gray-100" onChange={(e) => setInput(e.target.value)} />
        </div>
      </main>
    </>
  );
}

export default App;
