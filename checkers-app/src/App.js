import './App.css';
import { useEffect, useState } from 'react';
import { initialBoard } from './GameLogic/gameLogic.js';
import useWebSocket from 'react-use-websocket';
import Board from './Components/board.js';
import StartModal from './Components/Modals/startModal.js';
import DisconnectModal from './Components/Modals/disconnectModal.js';
import EndModal from './Components/Modals/endModal.js';
import { flipGameBoard } from './utils/utilFunctions.js';

function App() {
  const [board, setBoard] = useState([...initialBoard]);
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
  const [currentPlayer, setCurrentPlayer] = useState(2); // Keeps track of whose turn it is. 1: Red's turn, 2: White's turn
  const [playerRole, setPlayerRole] = useState(2); // Tracks the player's color. 1: Red, 2: White

  const [redPieces, setRedPieces] = useState(12); // Tracks red pieces left on the board
  const [whitePieces, setWhitePieces] = useState(12); // Tracks white pieces left on the board

  const [rematchPending, setRematchPending] = useState(false); // Tracks if a rematch request has been sent

  // MODALS -----------------
  const [openStartModal, setOpenStartModal] = useState(true);

  const [openDisconnectModal, setDisconnectModal] = useState(false);
  const [disconnectType, setDisconnectType] = useState(''); // Tracks the type of disconnection. 'opponent' or 'self'

  const [openEndModal, setEndModal] = useState(false);
  const [endCondition, setEndCondition] = useState(''); // Determines the title displayed in the end modal and handling incoming rematch requests.


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

    // Checks if user is a guest
    if (!isHost) {
      const urlParams = new URLSearchParams(window.location.search);
      let urlGameId = urlParams.get('gameId');
      setGameId(urlGameId);
      setIsConnected(true);
      sendMessageWebsocket("start", urlGameId, ""); // Reason sendMessageWebsocket even takes in a gameId is because gameId state might not be updated by the time this is called 
      setGameStarted(true);
      setOpenStartModal(false);
      setBoard(flipGameBoard(initialBoard));
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
    onClose: () => {
      console.log('Disconnected');
      setIsConnected(false);
      setDisconnectType('player');
      setDisconnectModal(true);
      setGameStarted(false);
    },
    onError: (error) => {
      console.log('WebSocket Error: ', error);
      setIsConnected(false);
    },
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
        setDisconnectType('opponent');
        setGameStarted(false);
      }
      if (receivedMessage.type === 'move') {
        setBoard(flipGameBoard(receivedMessage.message.board)); // Update the board with the move from the opponent
        playerRole === 1 ? setRedPieces((prevState) => prevState - receivedMessage.message.piecesCaptured) : setWhitePieces((prevState) => prevState - receivedMessage.message.piecesCaptured);
        setCurrentPlayer(currentPlayer === 1 ? 2 : 1); // Switch turns
      }
      if (receivedMessage.type === 'rematch_request') {
        if (rematchPending) {
          // Both players agreed to a rematch, reset the game
          resetGame();
        } else {
          // The other player requested a rematch, prompt the current player
          setEndCondition('rematch_requested');
          setEndModal(true);
        }
      }
    }
  }, [lastMessage]);


  // Checks if the game has ended. 
  useEffect(() => {
    if (redPieces === 0 || whitePieces === 0) {
      setEndModal(true);
      const condition = (playerRole === 2 && redPieces === 0) ? 'victory' : 'loss';
      setEndCondition(condition); //Set the game end condition which determines the title displayed in the end modal and handling rematch requests.
      setGameStarted(false);
    }
  }, [redPieces, whitePieces]);


  /**
   * Handles the move made by the player by taking into account any captured pieces, sending the move to the opponent, and switching turns.
   * 
   * @param {number[][]} newBoard - The new game board after the move.
   * @param {*} capturesCompleted - The number of opponent's pieces captured in the move.
   */
  function handleMove(newBoard, capturesCompleted) {
    playerRole === 1 ? setWhitePieces((prevState) => prevState - capturesCompleted) : setRedPieces((prevState) => prevState - capturesCompleted);
    sendMessageWebsocket("move", undefined, { board: newBoard, piecesCaptured: capturesCompleted });
    setCurrentPlayer(currentPlayer === 1 ? 2 : 1); // Switch turns
  }


  /**
   * Handles the rematch request that comes from the end modal on 'Rematch' and 'Accept' button clicks. If the player 
   */
  function handleRematch() {
    if (endCondition === 'rematch_requested') {
      // The player was prompted to accept a rematch request and they accepted
      resetGame();
    } else {
      // The player requested a rematch
      setRematchPending(true);
    }
    sendMessageWebsocket("rematch_request", undefined, { rematch: true });
  }


  /**
   * Resets the game to its initial state. Clears the board, resets the pieces, starts game, closes modal, and sets the current player to white.
   */
  function resetGame() {
    setBoard(!isHost ? flipGameBoard(initialBoard) : initialBoard);
    setRedPieces(12);
    setWhitePieces(12);
    setGameStarted(true);
    setEndModal(false);
    setCurrentPlayer(2);
    setRematchPending(false);
    setEndCondition('');
  }


  return (
    <>
      <main className="bg-gray-900 min-h-screen absolute w-full">
        <StartModal openStartModal={openStartModal} connectWebsocket={connectWebsocket} setGameId={setGameId} />
        <DisconnectModal openDisconnectModal={openDisconnectModal} disconnectType={disconnectType} />
        <EndModal openEndModal={openEndModal} endCondition={endCondition} onRematch={handleRematch} rematchPending={rematchPending} />
        <div className="max-w-4xl mx-auto">
          <Board
            board={board}
            setBoard={setBoard}
            gameStarted={gameStarted}
            currentPlayer={currentPlayer}
            playerRole={playerRole}
            onMove={handleMove}
          />

          {/* <div className="w-full flex items-center justify-center space-x-4">
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
          <input type="text" className="border border-gray-700 bg-gray-800 rounded-md shadow-sm text-gray-100" onChange={(e) => setInput(e.target.value)} /> */}
        </div>
      </main>
    </>
  );
}

export default App;
