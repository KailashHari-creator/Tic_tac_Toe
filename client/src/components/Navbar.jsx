import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';
import { useEffect } from 'react';

const Navbar = () => {
  const nav = useNavigate();

   useEffect(() => {
    const token = localStorage.getItem('token');
    // Optionally, you could fetch user data here to display in the navbar
    // For example, you could fetch user profile and set it in state
    // const fetchUserProfile = async () => {
    //   const res = await fetch('/api/user/profile', { 
    //     headers: { Authorization: `Bearer ${token}` }
    //   });
    //   if (res.ok) {
    //     const profile = await res.json();
    //     // setProfile(profile); // Assuming you have a state to hold profile data
    //   } else {
    //     console.error('Failed to fetch user profile');
    //   }
    // };
    // fetchUserProfile();
  }, [nav]);

const logout = () => {
  localStorage.removeItem('token');
  window.dispatchEvent(new Event("storage")); // ✅ notify App
  nav('http://43.205.242.23:3001/'); // Redirect to home page
};


  return (
    <nav className="navbar">
      <Link className="nav-link" to="http://43.205.242.23:3001/dashboard">Dashboard</Link>
      <Link className="nav-link" to="http://43.205.242.23:3001/edit-profile">Edit Profile</Link>
      <button className="nav-button" onClick={logout}>Logout</button>
    </nav>
  );
};

export default Navbar;
