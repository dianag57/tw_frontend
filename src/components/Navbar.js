import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <h1>Acordare de note anonim</h1>
      <div className="navbar-links">
        <span>Bine ai venit, <strong>{user?.fullName}</strong></span>
        {user?.role === 'student' && (
          <>
            <Link to="/dashboard">Tablou de Bord</Link>
            <Link to="/projects">Proiecte</Link>
            <Link to="/jury">Juriu</Link>
          </>
        )}
        {user?.role === 'professor' && (
          <>
            <Link to="/dashboard">Tablou de Bord</Link>
            <Link to="/professor">Vizualizare Evaluări</Link>
          </>
        )}
        <button className="btn btn-danger" onClick={handleLogout}>
          Deconectare
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
