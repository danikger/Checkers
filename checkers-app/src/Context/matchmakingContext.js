import { createContext, useContext, useState } from 'react';

const MatchmakingContext = createContext();

export const MatchmakingProvider = ({ children }) => {
  const [username, setUsername] = useState('');
  const [lobbyId, setLobbyId] = useState('');
  const [invitePending, setInvitePending] = useState(false);
  const [opponentData, setOpponentData] = useState();

  const value = {
    username,
    setUsername,
    lobbyId,
    setLobbyId,
    invitePending,
    setInvitePending,
    opponentData,
    setOpponentData,
  };

  return <MatchmakingContext.Provider value={value}>{children}</MatchmakingContext.Provider>;
};

export const useMatchmaking = () => useContext(MatchmakingContext);
