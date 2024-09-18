import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="navbar">
      <div className="logo">
        <a href="/">GovTech</a>
      </div>
      <div className={`menu ${isOpen ? 'open' : ''}`}>
        <Link to="/" className="menu-item">Home</Link>
        <Link to="/add-team" className="menu-item">Team Form</Link>
        <Link to="/add-match" className="menu-item">Match Form</Link>
      </div>
      <button className="menu-toggle" onClick={toggleMenu}>
        ☰
      </button>
    </nav>
  );
};

export default Navbar;
