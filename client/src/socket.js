let socket;

export function connectWebSocket(playerID, onMessage) {
  socket = new WebSocket('ws://localhost:3001');

  socket.onopen = () => {
    socket.send(JSON.stringify({
      method: 'connect',
      playerID: playerID  // ✅ this is now the DB id
    }));
  };

  socket.onmessage = (message) => {
    const data = JSON.parse(message.data);
    onMessage(data);
  };

  return socket;
}

export function getSocket() {
  return socket;
}
