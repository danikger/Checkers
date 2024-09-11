import './App.css';
import { useEffect, useState } from 'react';
import { initialBoard } from './GameLogic/gameLogic.js';
import useWebSocket from 'react-use-websocket';
import Board from './Components/board.js';
import StartModal from './Components/Modals/startModal.js';
import DisconnectModal from './Components/Modals/disconnectModal.js';

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
  const [gameStarted, setGameStarted] = useState(false);
  const [openStartModal, setOpenStartModal] = useState(true);
  const [openDisconnectModal, setDisconnectModal] = useState(false);
  const [currentPlayer, setCurrentPlayer] = useState(2); // Keeps track of whose turn it is. 1: Red's turn, 2: White's turn
  const [playerRole, setPlayerRole] = useState(2); // Tracks the player's color. 1: Red, 2: White


  useEffect(() => {
    // Checks if the user has previously refreshed the page. Sends the user back to the home page if they are trying to reconnect to the same game.
    const existingGameId = JSON.parse(sessionStorage.getItem('gameId'));
    const urlParams = new URLSearchParams(window.location.search);
    let urlGameId = urlParams.get('gameId');

    if (urlGameId && urlGameId === existingGameId) {
      sessionStorage.removeItem('gameId');
      window.location.href = '/';
    } else if (urlGameId) {
      sessionStorage.setItem('gameId', JSON.stringify(urlGameId));
    }

    // Checks if user is a guest and connects them to the API if they are 
    if (!isHost) {
      const urlParams = new URLSearchParams(window.location.search);
      let urlGameId = urlParams.get('gameId');
      setGameId(urlGameId);
      setIsConnected(true);
      sendMessageWebsocket("start", urlGameId, ""); // Reason sendMessageWebsocket even takes in a gameId is because gameId state might not be updated by the time this is called 
      setGameStarted(true);
      setOpenStartModal(false);
      setBoard(([...initialBoard].reverse()).map(row => row.reverse()));
      setPlayerRole(1);
    } else {
      console.log('Host');
    }
  }, []);


  // Prompts user to confirm page refresh
  useEffect(() => {
    window.onbeforeunload = function () {
      return true;
    };

    return () => {
      window.onbeforeunload = null;
    };
  }, []);


  const socketURL = 'wss://k81ymo1nek.execute-api.us-east-1.amazonaws.com/production/';

  const { sendMessage, lastMessage, readyState, getWebSocket } = useWebSocket(socketURL, {
    queryParams: { gameId: gameId },
    // shouldReconnect: () => false,
    onOpen: () => console.log('Connected'),
    onClose: () => console.log('Disconnected'),
    onError: (error) => console.log('WebSocket Error: ', error),
  }, isConnected);


  /**
   * Handles connecting to the API
   */
  const connectWebsocket = () => {
    setIsConnected(true);
  };


  /**
   * Handles disconnecting from the API
   */
  const disconnectWebsocket = () => {
    const socket = getWebSocket();
    if (socket) {
      socket.close();
      setIsConnected(false);
    }
  };


  /**
   * Handles sending messages to the API
   */
  const sendMessageWebsocket = (type, lobbyId = gameId, message) => {
    const messageObj = JSON.stringify({ action: "sendMessage", message: { message: message, gameId: lobbyId, type: type } });
    console.log('Sending message:', messageObj);
    sendMessage(messageObj);
  };


  // Handles incoming messages from API
  useEffect(() => {
    if (lastMessage !== null) {
      let receivedMessage = JSON.parse(lastMessage.data);
      console.log(receivedMessage);
      if (receivedMessage.type === 'start') {
        console.log('Game started');
        setGameStarted(true);
        setOpenStartModal(false);
      }
      if (receivedMessage.type === 'disconnect') {
        console.log('Game disconnected');
        setDisconnectModal(true);
      }
      if (receivedMessage.type === 'move') {
        setBoard((receivedMessage.message.board.reverse()).map(row => row.reverse())); // Update the board with the move from the opponent
        setCurrentPlayer(currentPlayer === 1 ? 2 : 1); // Switch turns
      }
    }
  }, [lastMessage]);


  return (
    <>
      <main className="bg-gray-900 min-h-screen absolute w-full">
        <StartModal openStartModal={openStartModal} connectWebsocket={connectWebsocket} setGameId={setGameId} />
        <DisconnectModal openDisconnectModal={openDisconnectModal} />
        <div className="max-w-4xl mx-auto">
          {/* 🗼 */}
          <Board
            board={board}
            setBoard={setBoard}
            gameStarted={gameStarted}
            currentPlayer={currentPlayer}
            setCurrentPlayer={setCurrentPlayer}
            sendMessageWebsocket={sendMessageWebsocket}
            playerRole={playerRole}
          />

          <div className="w-full flex items-center justify-center space-x-4">
            <button className="bg-blue-600 hover:bg-blue-500 text-white text-sm px-6 py-2 rounded-lg font-semibold my-8" onClick={connectWebsocket} disabled={isConnected}>
              Connect
            </button>
            <button className="bg-blue-600 hover:bg-blue-500 text-white text-sm px-6 py-2 rounded-lg font-semibold my-8" onClick={disconnectWebsocket} disabled={!isConnected}>
              Disconnect
            </button>
            <button className="bg-blue-600 hover:bg-blue-500 text-white text-sm px-6 py-2 rounded-lg font-semibold my-8" onClick={() => sendMessageWebsocket("chat", gameId, input)} disabled={!isConnected}>
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
