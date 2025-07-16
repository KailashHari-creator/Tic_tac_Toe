import './PlayerCard.css';

const PlayerCard = ({ player }) => {
  const avatar = player.avatar || '👾';
  const name = player.username || 'Unknown';
  const symbol = player.symbol ? `Symbol: ${player.symbol}` : null;

  return (
    <div className="player-card">
      <div className="avatar">{avatar}</div>
      <div className="name">{name}</div>
      {symbol && <div className="symbol">{symbol}</div>}
    </div>
  );
};

export default PlayerCard;
