import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';

import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import EditProfilePage from './pages/EditProfilePage';
import Navbar from './components/Navbar';

const App = () => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const location = useLocation();

  // Listen for changes in localStorage token (e.g. from logout)
  useEffect(() => {
    const syncToken = () => {
      setToken(localStorage.getItem('token'));
    };

    window.addEventListener('storage', syncToken);
    return () => window.removeEventListener('storage', syncToken);
  }, []);

  // Update token state when route changes (e.g. after login/logout)
  useEffect(() => {
    setToken(localStorage.getItem('token'));
  }, [location]);

  return (
    <>
      {token && <Navbar />}
      <Routes>
        <Route path="http://43.205.242.23:3001/" element={token ? <Navigate to="/dashboard" /> : <LoginPage />} />
        <Route path="http://43.205.242.23:3001/signup" element={<SignupPage />} />
        <Route path="http://43.205.242.23:3001/dashboard" element={token ? <DashboardPage /> : <Navigate to="http://43.205.242.23:3001/" />} />
        <Route path="http://43.205.242.23:3001/edit-profile" element={token ? <EditProfilePage /> : <Navigate to="http://43.205.242.23:3001/" />} />
      </Routes>
    </>
  );
};

export default App;

