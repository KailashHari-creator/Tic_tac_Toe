import { WebSocketServer } from 'ws';
import { v4 as uuidv4 } from 'uuid';
import pool from './db.js';

const players = {};
const rooms = {};
const roomState = {}; // ✅ Added

export function setupWebSocket(server) {
  const wss = new WebSocketServer({ server });

  wss.on('connection', (ws) => {
  ws.on('message', async (message) => {
    const data = JSON.parse(message.toString());

    // First thing: set up connection with DB playerID
    if (data.method === 'connect') {
      const playerID = data.playerID;
      players[playerID] = { ws };

      try {
        const res = await pool.query('SELECT username, avatar FROM players WHERE id = $1', [playerID]);
        const { username, avatar } = res.rows[0];

        ws.send(JSON.stringify({
          method: 'connect',
          playerID,
          username,
          avatar
        }));
      } catch (err) {
        console.error("DB Fetch Error:", err);
        ws.send(JSON.stringify({ method: 'error', message: 'Invalid user ID.' }));
      }
    }
      if (data.method === 'createRoom') {
  const roomCode = uuidv4().slice(0, 6).toUpperCase();
  const res = await pool.query('SELECT username, avatar FROM players WHERE id = $1', [data.playerID]);
  
  if (res.rows.length === 0) {
    return ws.send(JSON.stringify({ method: 'error', message: 'Invalid player ID' }));
  }

  const { username, avatar } = res.rows[0];

  rooms[roomCode] = {
    roomCode,
    players: [
      { playerID: data.playerID, symbol: 'X', username, avatar }
    ]
  };

  players[data.playerID].roomCode = roomCode;

  ws.send(JSON.stringify({
    method: 'createRoom',
    room: rooms[roomCode]
  }));
}

      if (data.method === 'joinRoom') {
        const room = rooms[data.roomCode];
        if (!room) {
          return ws.send(JSON.stringify({ method: 'invalidRoom', message: 'Room does not exist.' }));
        }
        if (room.players.length >= 2) {
          return ws.send(JSON.stringify({ method: 'fullRoom', message: 'Room is full.' }));
        }
        const res = await pool.query('SELECT username, avatar FROM players WHERE id = $1', [data.playerID]);
        console.log("res", res);
        if (res.rows.length === 0) {
          return ws.send(JSON.stringify({
            method: 'error',
            message: 'User not found in database.'
          }));
        }
        const { username, avatar } = res.rows[0];

        room.players.push({ playerID: data.playerID, symbol:room.players.length === 0 ? 'X' : 'O', username, avatar });
        players[data.playerID].roomCode = data.roomCode;

        room.players.forEach(p => {
          players[p.playerID].ws.send(JSON.stringify({
            method: 'joinRoom',
            room
          }));
        });


        if (room.players.length === 2) updateRoomState(room.roomCode);
      }

      if (data.method === 'play') {
        const room = rooms[data.roomCode];
        const state = roomState[data.roomCode]; // ✅ corrected
        const currentPlayer = state.currentPlayer;

        if (currentPlayer !== data.playerID) {
          players[data.playerID].ws.send(JSON.stringify({
            method: 'outOfTurn',
            message: 'Not your turn!'
          }));
          return;
        }

        if (state.board[data.cell]) return;

        const playerSymbol = room.players.find(p => p.playerID === data.playerID).symbol;
        state.board[data.cell] = playerSymbol;

        const winnerSymbol = checkWinner(state.board);
        if (winnerSymbol) {
          const winner = room.players.find(p => p.symbol === winnerSymbol);
          const loser = room.players.find(p => p.symbol !== winnerSymbol);
          await updateStats(winner.playerID, 'win');
          await updateStats(loser.playerID, 'lose');
          state.winner = winner.playerID;
        } else if (state.board.every(Boolean)) {
          for (const p of room.players) await updateStats(p.playerID, 'draw');
          state.winner = 'draw';
        } else {
          state.currentPlayer = room.players.find(p => p.playerID !== data.playerID).playerID;
        }

        room.players.forEach(p => {
          players[p.playerID].ws.send(JSON.stringify({
            method: 'play',
            roomState: state,
            winner: state.winner
          }));
        });
      }

      if (data.method === 'restartGame') {
  const room = rooms[data.roomCode];
  const starter = room.players.find(p => p.symbol === 'X');
  roomState[data.roomCode] = {
    board: Array(9).fill(null),
    currentPlayer: starter.playerID,
    winner: null
  };

  room.players.forEach(p => {
    players[p.playerID].ws.send(JSON.stringify({
      method: 'play',
      roomState: roomState[data.roomCode]
    }));
  });
}

    });
  });
}

function updateRoomState(roomCode) {
  const room = rooms[roomCode];
  if (!room) return console.error(`No such room: ${roomCode}`);

  if (!roomState[roomCode]) {
    const starter = room.players.find(p => p.symbol === 'X');
    roomState[roomCode] = {
      board: Array(9).fill(null),
      currentPlayer: starter?.playerID || room.players[0].playerID,
      winner: null
    };
  }

  // ✅ Safely broadcast updated room state
  room.players.forEach(p => {
    const socket = players[p.playerID]?.ws;
    if (socket && socket.readyState === socket.OPEN) {
      socket.send(JSON.stringify({
        method: 'play',
        roomState: roomState[roomCode]
      }));
    }
  });
}


function checkWinner(board) {
  const combos = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
  for (let [a,b,c] of combos) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) return board[a];
  }
  return null;
}

async function updateStats(playerID, result) {
  const fieldMap = {
    win: 'wins',
    lose: 'losses',
    draw: 'draws'
  };
  const field = fieldMap[result];

  await pool.query(`
    UPDATE players
    SET ${field} = ${field} + 1,
        games_played = games_played + 1
    WHERE id = $1
  `, [playerID]);
}

export async function getPlayerStats(playerID) {
  const res = await pool.query('SELECT * FROM players WHERE id = $1', [playerID]);
  return res.rows[0];
}
