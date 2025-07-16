// Displays the tic-tac-toe grid and handles clicks
import './GameBoard.css';

const GameBoard = ({ board = Array(9).fill(null), onCellClick }) => {
  return (
    <div className="board">
      {board.map((val, i) => (
        <div
          key={i}
          className="cell"
          onClick={() => onCellClick && onCellClick(i)}
        >
          {val}
        </div>
      ))}
    </div>
  );
};

export default GameBoard;
