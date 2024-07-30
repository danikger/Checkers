import './App.css';
import { useEffect, useState } from 'react';
import { initialBoard } from './GameLogic/gameLogic.js';
import useWebSocket from 'react-use-websocket';
import Board from './Components/board.js';

function App() {
  const [board, setBoard] = useState(initialBoard);
  const [isConnected, setIsConnected] = useState(false);

  const socketURL = 'wss://k81ymo1nek.execute-api.us-east-1.amazonaws.com/production/';

  const { sendMessage, lastMessage, readyState, getWebSocket } = useWebSocket(socketURL, {
    onOpen: () => console.log('Connected'),
    onClose: () => console.log('Disconnected'),
    onError: (error) => console.log('WebSocket Error: ', error),
  }, isConnected);

  const handleConnect = () => {
    setIsConnected(true);
  };

  const handleDisconnect = () => {
    const socket = getWebSocket();
    if (socket) {
      socket.close();
      setIsConnected(false);
    }
  };

  const handleMessage = () => {
    const message = JSON.stringify({ action: "sendMessage", message: [...initialBoard].reverse() });
    sendMessage(message);
  };

  // Handles incoming messages from API
  useEffect(() => {
    if (lastMessage !== null) {
      console.log('Received message:', lastMessage.data);
      console.log('Received message:', typeof(JSON.parse(lastMessage.data)));
      console.log('Received message:', JSON.parse(lastMessage.data));
    }
  }, [lastMessage]);

  console.log(readyState);

  return (
    <>
      <main className="bg-gray-900 min-h-screen absolute w-full">
        <div className="max-w-4xl mx-auto">
          <Board board={board} />

          <div className="w-full flex items-center justify-center space-x-4">
            <button className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-medium my-8" onClick={handleConnect} disabled={isConnected}>
              Connect
            </button>
            <button className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-medium my-8" onClick={handleDisconnect} disabled={!isConnected}>
              Disconnect
            </button>
            <button className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-medium my-8" onClick={handleMessage} disabled={!isConnected}>
              Send Message
            </button>
          </div>
        </div>
      </main>
    </>
  );
}

export default App;
