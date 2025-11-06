import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NavBar = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: '#f0f0f0' }}>
            <div>
                <Link to="/">Dashboard</Link>
                <Link to="/favorites" style={{ marginLeft: '20px' }}>My Favs</Link>
            </div>
            <button onClick={handleLogout}>Logout</button>
        </nav>
    );
};

export default NavBar;
