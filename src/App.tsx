import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import './App.css';
import TeamList from './component/TeamForm';
import MatchResults from './component/MatchForm';
import Ranking from './component/Ranking'
import TeamDetails from './component/TeamDetails';
import Navbar from './component/NavBar';

function HomePage() {
  return (
    <div> 
    <Ranking /> 
    <TeamDetails />
    </div>
  );
}

function App() {
  return (
    <Router>
    <div className="App">
      <Navbar />
      <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/add-match" element={<MatchResults />} />
          <Route path="/add-team" element={<TeamList />} />
        </Routes>
    </div>
    </Router>
  );
}

export default App;