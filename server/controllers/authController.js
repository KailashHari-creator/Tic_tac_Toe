import pool from '../db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { getPlayerStats } from '../websocket.js';

export const signup = async (req, res) => {
  const { username, password, avatar } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const id = uuidv4();

    const result = await pool.query(
      'INSERT INTO players (id, username, password, avatar) VALUES ($1, $2, $3, $4) RETURNING id, username, avatar',
      [id, username, hashedPassword, avatar]
    );

    const token = jwt.sign({ id }, process.env.JWT_SECRET);
    res.status(201).json({ player: result.rows[0], token });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(400).json({ message: 'Username already taken' });
    }
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const result = await pool.query('SELECT * FROM players WHERE username = $1', [username]);
    if (result.rows.length === 0) {
      return res.status(400).json({ message: 'User not found' });
    }

    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: 'Incorrect password' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '7d' } // optional
    );

    return res.json({ token }); // ✅ This is what frontend expects!
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Login failed' });
  }
};

export const getPlayerProfile = async (req, res) => {
  const playerId = req.player.id;

  try {
    const result = await pool.query('SELECT id, username, avatar FROM players WHERE id = $1', [playerId]);
    if (result.rows.length === 0) return res.status(404).json({ message: 'Player not found' });

    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
