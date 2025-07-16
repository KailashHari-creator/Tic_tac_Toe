import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const nav = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (res.ok) {
      localStorage.setItem('token', data.token);
      window.dispatchEvent(new Event("storage"));
      nav('/dashboard');
    } else alert(data.message);
  };

  const styles = {
    wrapper: {
      height: '100vh',
      background: 'radial-gradient(ellipse at top, #10131c, #05050f)',
      fontFamily: 'Orbitron, sans-serif',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    },
    card: {
      background: '#111',
      width: '360px',
      padding: '2.5rem',
      borderRadius: '15px',
      boxShadow: '0 0 25px #00ffff44, 0 0 10px #00ffff22 inset',
      color: '#0ff',
      textAlign: 'center',
    },
    heading: {
      marginBottom: '1.5rem',
      fontSize: '1.6rem',
      textShadow: '0 0 8px #0ff',
    },
    input: {
      width: '100%',
      padding: '0.75rem',
      marginBottom: '1rem',
      background: '#000',
      border: '1px solid #00ffff88',
      borderRadius: '8px',
      color: '#0ff',
      fontSize: '1rem',
      boxShadow: '0 0 8px #00ffff44 inset',
    },
    button: {
      width: '100%',
      padding: '0.75rem',
      background: '#00ffff',
      color: '#000',
      fontWeight: 'bold',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '1rem',
      boxShadow: '0 0 12px #00ffffaa',
      transition: 'background 0.3s ease',
    },
    buttonHover: {
      background: '#00e0e0'
    },
    footerText: {
      marginTop: '1.2rem',
      fontSize: '0.9rem',
      color: '#0ff'
    },
    link: {
      color: '#0ff',
      fontWeight: 'bold',
      textDecoration: 'none'
    }
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <h2 style={styles.heading}>Login</h2>
        <form onSubmit={handleLogin}>
          <input
            style={styles.input}
            value={username}
            onChange={e => setUsername(e.target.value)}
            placeholder="Username"
            required
          />
          <input
            type="password"
            style={styles.input}
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Password"
            required
          />
          <button style={styles.button} type="submit">Log In</button>
        </form>
        <p style={styles.footerText}>
          Don't have an account?{' '}
          <Link to="/signup" style={styles.link}>Signup</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
