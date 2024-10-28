import './App.css';
import { useEffect, useState } from 'react';
import { initialBoard } from './GameLogic/gameLogic.js';
import useWebSocket from 'react-use-websocket';
import Board from './Components/board.js';
import StartModal from './Components/Modals/startModal.js';
import DisconnectModal from './Components/Modals/disconnectModal.js';
import EndModal from './Components/Modals/endModal.js';
import { flipGameBoard } from './utils/utilFunctions.js';
import TopBar from './Components/topBar.js';
import BottomBar from './Components/bottomBar.js';
import useTimer from './utils/useTimer.js';
import { getGameIdFromURL } from './utils/utilFunctions.js';

function App() {
  const [board, setBoard] = useState([...initialBoard]);
  const [isConnected, setIsConnected] = useState(false);
  const [isHost, setIsHost] = useState(() => {
    let gameId = getGameIdFromURL();
    return gameId === null ? true : false;
  });
  const [gameId, setGameId] = useState(() => {
    return getGameIdFromURL();
  });
  const [gameStarted, setGameStarted] = useState(false);
  const [currentPlayer, setCurrentPlayer] = useState(2); // Keeps track of whose turn it is. 1: Red's turn, 2: White's turn
  const [playerRole, setPlayerRole] = useState(2); // Tracks the player's color. 1: Red, 2: White
  const [itemType, setItemType] = useState(''); // Tracks the type of item being sent to the API (game or lobby)
  const [username, setUsername] = useState(''); // Tracks the player's username

  const [redPieces, setRedPieces] = useState(12); // Tracks red pieces left on the board
  const [whitePieces, setWhitePieces] = useState(12); // Tracks white pieces left on the board

  const [rematchPending, setRematchPending] = useState(false); // Tracks if a rematch request has been sent

  // MODALS -----------------
  const [openStartModal, setOpenStartModal] = useState(true);

  const [openDisconnectModal, setDisconnectModal] = useState(false);
  const [disconnectType, setDisconnectType] = useState(''); // Tracks the type of disconnection. 'opponent' or 'self'

  const [openEndModal, setEndModal] = useState(false);
  const [endCondition, setEndCondition] = useState(''); // Determines the title displayed in the end modal and handling incoming rematch requests.

  // timeLeft and timerActive in case i want to add a visible timer later :))
  const { timeLeft, timerActive, setTimerActive } = useTimer(gameStarted, currentPlayer, playerRole, handleTimeout);


  useEffect(() => {
    // Checks if the user has previously refreshed the page. Sends the user back to the home page if they are trying to reconnect to the same game.
    const existingGameId = JSON.parse(sessionStorage.getItem('gameId'));
    let urlGameId = getGameIdFromURL();

    if (urlGameId && urlGameId === existingGameId) {
      sessionStorage.removeItem('gameId');
      window.location.href = '/';
    } else if (urlGameId) {
      sessionStorage.setItem('gameId', JSON.stringify(urlGameId));
    }

    // Checks if user is a guest and sets the appriopriate player role and board state
    if (!isHost) {
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


  // Prompts user to confirm page refresh (only if game has started)
  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (gameStarted) {
        event.preventDefault();
        event.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [gameStarted]);


  const socketURL = 'wss://k81ymo1nek.execute-api.us-east-1.amazonaws.com/production/';

  const { sendMessage, lastMessage, readyState, getWebSocket } = useWebSocket(socketURL, {
    queryParams: { gameId: gameId, itemType: itemType, username: username },
    // shouldReconnect: () => false,
    onOpen: () => console.log('Connected'),
    onClose: () => {
      console.log('Disconnected');
      if (gameStarted) {
        setIsConnected(false);
        setDisconnectType('player');
        setDisconnectModal(true);
        setGameStarted(false);
      }
    },
    onError: (error) => {
      console.log('WebSocket Error: ', error);
      setIsConnected(false);
    },
  }, isConnected);


  /**
   * Handles connecting to the API
   */
  const connectWebsocket = (newGameId, itemType, username) => {
    setGameId(newGameId);
    setItemType(itemType);
    setUsername(username);
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
    const messageObj = JSON.stringify({ action: "sendMessage", data: { data: message, gameId: lobbyId, type: type } });
    console.log('Sending message:', messageObj);
    sendMessage(messageObj);
  };


  // Handles incoming messages from API
  useEffect(() => {
    if (lastMessage !== null) {
      let receivedMessage = JSON.parse(lastMessage.data);
      console.log(receivedMessage);

      switch (receivedMessage.type) {
        case 'start':
          setGameStarted(true);
          setOpenStartModal(false);
          break;

        case 'disconnect':
          setDisconnectModal(true);
          setDisconnectType('opponent');
          setGameStarted(false);
          break;

        case 'move':
          setBoard(flipGameBoard(receivedMessage.data.board)); // Update the board with the move from the opponent
          playerRole === 1 ? setRedPieces((prevState) => prevState - receivedMessage.data.piecesCaptured) : setWhitePieces((prevState) => prevState - receivedMessage.data.piecesCaptured); // Set new number of pieces
          setCurrentPlayer(currentPlayer === 1 ? 2 : 1); // Switch turns
          break;

        case 'defeat':
          setEndCondition(`victory-${receivedMessage.data.defeatType}`); // Opponent either has a stalemate or conceded
          setEndModal(true);
          setGameStarted(false);
          break;

        case 'rematch_request':
          if (rematchPending) {
            // Both players agreed to a rematch, reset the game
            resetGame();
          } else {
            // The other player requested a rematch, prompt the current player
            setEndCondition('rematch_requested');
            setEndModal(true);
          }
          break;

        case 'invalid-game':
          window.location.href = '/';
          break;
      }
    }
  }, [lastMessage]);


  // Checks number of pieces and ends the game if either player has no pieces left
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
   * @param {number} capturesCompleted - The number of opponent's pieces captured in the move.
   */
  function handleMove(newBoard, capturesCompleted) {
    setTimerActive(false); // Stop the timer 
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
    setBoard(isHost ? initialBoard : flipGameBoard(initialBoard)); // If player is the host, set the board to the initial state. If player is a guest, flip the board.
    setRedPieces(12);
    setWhitePieces(12);
    setGameStarted(true);
    setEndModal(false);
    setCurrentPlayer(2);
    setRematchPending(false);
    setEndCondition('');
  }


  /**
   * Handles the game end condition by displaying the end modal and sending a defeat message to the opponent.
   * 
   * @param {string} defeatType The type of defeat that ended the game. 'stalemate', 'concede', or 'timeout'.
   */
  function handleGameEnd(defeatType) {
    setEndModal(true);
    setEndCondition(`loss-${defeatType}`);
    setGameStarted(false);
    sendMessageWebsocket("defeat", undefined, { defeatType: defeatType });
  }


  // Handles the stalemate condition by the current player
  function handleStalemate() {
    if (redPieces !== 0 && whitePieces !== 0) handleGameEnd('stalemate');
  }


  // Handles the concede condition by the current player
  function handleConcede() {
    handleGameEnd('concede');
  }


  // Handles the timeout condition by the current player
  function handleTimeout() {
    if (currentPlayer === playerRole) handleGameEnd('timeout');
  }


  return (
    <>
      <main className="bg-gray-900 min-h-screen absolute w-full">
        <StartModal openStartModal={openStartModal} connectWebsocket={connectWebsocket} disconnectWebsocket={disconnectWebsocket} sendMessageWebsocket={sendMessageWebsocket} lastMessage={lastMessage} />
        <DisconnectModal openDisconnectModal={openDisconnectModal} disconnectType={disconnectType} />
        <EndModal openEndModal={openEndModal} endCondition={endCondition} onRematch={handleRematch} rematchPending={rematchPending} />
        <div className="max-w-4xl mx-auto mt-16">
          <TopBar playerPieces={playerRole === 1 ? redPieces : whitePieces} playerRole={playerRole} currentPlayer={currentPlayer} />
          <Board
            board={board}
            setBoard={setBoard}
            gameStarted={gameStarted}
            currentPlayer={currentPlayer}
            playerRole={playerRole}
            onMove={handleMove}
            onStalemate={handleStalemate}
          />
          <BottomBar opponentPieces={playerRole === 1 ? whitePieces : redPieces} playerRole={playerRole} onConcede={handleConcede} currentPlayer={currentPlayer} />
        </div>
      </main>
    </>
  );
}

export default App;