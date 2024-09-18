import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import './App.css';
import Navbar from './component/NavBar';

function HomePage() {
  return (
    <div> 
      <h1> Hi </h1>
    </div>
  );
}

function App() {
  return (
    <Router>
    <div className="App">
      <Navbar />
    </div>
    </Router>
  );
}

export default App;