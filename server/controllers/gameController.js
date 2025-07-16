import pool from '../db.js';
import jwt from 'jsonwebtoken';

export const getPlayerStats = async (req, res) => {
  const playerID = req.user.id;

  try {
    const result = await pool.query('SELECT * FROM players WHERE id = $1', [playerID]);
    const player = result.rows[0];
    const { password, ...cleaned } = player;
    res.json(cleaned);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateRecentOpponents = async (req, res) => {
  const playerID = req.user.id;
  const { opponentUsername } = req.body;

  try {
    const result = await pool.query(`
      UPDATE players
      SET recent_opponents = array_prepend($1, array_slice(recent_opponents, 0, 4))
      WHERE id = $2
    `, [opponentUsername, playerID]);

    res.status(200).json({ message: 'Opponent updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
export const updatePlayerStats = async (req, res) => {
  const playerID = req.user.id;
  const { result } = req.body; // 'win', 'lose', or 'draw'

  try {
    await updateStats(playerID, result);
    res.status(200).json({ message: 'Stats updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}

export const getStatsHandler = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const playerID = decoded.id;

    const result = await pool.query('SELECT wins, losses, draws, games_played FROM players WHERE id = $1', [playerID]);

    if (result.rows.length === 0) return res.status(404).json({ message: 'Player not found' });

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};