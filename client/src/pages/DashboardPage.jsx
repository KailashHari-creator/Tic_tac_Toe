import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { connectWebSocket, getSocket } from '../socket';
import GameBoard from '../components/GameBoard';
import PlayerCard from '../components/PlayerCard';
import ResultBanner from '../components/ResultBanner';

const DashboardPage = () => {
  const [playerStats, setStats] = useState({});
  const [room, setRoom] = useState(null);
  const [roomState, setRoomState] = useState(null);
  const [yourID, setYourID] = useState(null);
  const [showStats, setShowStats] = useState(false);
  const navigate = useNavigate();

  const token = localStorage.getItem('token');

  // 🔐 Early redirect if no token
  useEffect(() => {
    if (!token) navigate('http://43.205.242.23:3001/');
  }, [token, navigate]);

  if (!token) return null; // Prevent rest of code from running

  let dbPlayerID = '';
  try {
    dbPlayerID = jwtDecode(token).id;
  } catch (err) {
    console.error('Invalid token:', err);
    navigate('http://43.205.242.23:3001/');
    return null;
  }




  const fetchStats = async () => {
    const res = await fetch('http://43.205.242.23:3001/api/game/stats', {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) setStats(await res.json());
  };

  useEffect(() => {
    fetchStats();

    const socket = connectWebSocket(dbPlayerID, data => {
      if (data.method === 'connect') setYourID(data.playerID);
      if (data.method === 'createRoom' || data.method === 'joinRoom') setRoom(data.room);
      if (data.method === 'play') setRoomState(data.roomState);
    });

    return () => getSocket().close();
  }, []);

  useEffect(() => {
    if (roomState?.winner) fetchStats();
  }, [roomState?.winner]);

  const ws = getSocket();

  const startGame = () =>
    ws.send(JSON.stringify({ method: 'createRoom', playerID: yourID }));

  const joinGame = () => {
    const code = prompt('Enter Room Code:');
    if (code)
      ws.send(
        JSON.stringify({ method: 'joinRoom', playerID: yourID, roomCode: code })
      );
  };

  const play = cell => {
    if (!roomState || roomState.winner || roomState.currentPlayer !== yourID) return;
    ws.send(
      JSON.stringify({
        method: 'play',
        playerID: yourID,
        roomCode: room.roomCode,
        cell
      })
    );
  };

  return (
    <div className="dashboard-container">

      {/* 🎴 Top Player Info */}
      <div className="top-player-info">
        <div>
          <strong>{playerStats.avatar}</strong> {playerStats.username}
        </div>
        {room && <div><strong>Room:</strong> {room.roomCode}</div>}
      </div>

      {/* 🎮 Buttons */}
      <div className="button-row">
        <button onClick={startGame}>Create Room</button>
        <button onClick={joinGame}>Join Room</button>
        <button onClick={() => setShowStats(!showStats)}>
          {showStats ? 'Hide Stats' : 'Show Stats'}
        </button>
      </div>

      {/* 🎲 Game Board Card */}
      <div className="game-board-card">
        {room && (
          <div className="player-container">
            {room.players.map(p => (
              <PlayerCard
                key={p.playerID}
                player={{
                  username: p.username,
                  avatar: p.avatar,
                  symbol: p.symbol
                }}
              />
            ))}
          </div>
        )}

        {roomState?.currentPlayer && (
          <h3>
            {roomState.currentPlayer === yourID ? 'Your Turn!' : "Opponent's Turn!"}
          </h3>
        )}

        <GameBoard board={roomState?.board || Array(9).fill(null)} onCellClick={play} />

        {roomState?.winner && (
          <button
            onClick={() =>
              ws.send(JSON.stringify({ method: 'restartGame', roomCode: room.roomCode }))
            }
          >
            Play Again
          </button>
        )}
      </div>

      {/* 📊 Collapsible Stats */}
      <div className={`stats-box ${showStats ? 'stats-expanded' : 'stats-collapsed'}`}>
        <h3>Your Stats</h3>
        <p>Games Played: {playerStats.games_played}</p>
        <p>Wins: {playerStats.wins}</p>
        <p>Losses: {playerStats.losses}</p>
        <p>Draws: {playerStats.draws}</p>
      </div>

      <ResultBanner result={roomState?.winner} yourID={yourID} />
    </div>
  );
};

export default DashboardPage;
