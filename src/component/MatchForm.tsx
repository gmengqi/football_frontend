'use client';

import { useState } from 'react';
import api from '../api'; 

interface MatchResult {
  teamAName: string;
  teamBName: string;
  teamAGoals: number;
  teamBGoals: number;
}

export default function MatchResults() {
  const [input, setInput] = useState('');
  const [results, setResults] = useState<MatchResult[]>([]);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false); 
  const [isProcessClicked, setIsProcessClicked] = useState(false); 

  const processResults = () => {
    const lines = input.trim().split('\n');
    const newResults: MatchResult[] = [];
    let hasError = false;

    lines.forEach((line, index) => {
      const parts = line.trim().split(' ');
      if (parts.length !== 4) {
        setError(`Invalid format on line ${index + 1}. Expected: "Team A Team B Score A Score B"`);
        hasError = true;
        setResults([]); // Clear previous results if there's an error
        return;
      }

      const [teamAName, teamBName, teamAScore, teamBScore] = parts;
      const teamAGoals = parseInt(teamAScore, 10);
      const teamBGoals = parseInt(teamBScore, 10);

      if (isNaN(teamAGoals) || isNaN(teamBGoals)) {
        setError(`Invalid scores on line ${index + 1}. Scores must be numbers.`);
        hasError = true;
        setResults([]); // Clear previous results if there's an error
        return;
      }

      // Check if the team names are the same
      if (teamAName === teamBName) {
        setError(`Team names cannot be the same on line ${index + 1}.`);
        hasError = true;
        setResults([]); // Clear previous results if there's an error
        return;
      }

      // Check if the goals are negative
      if (teamAGoals < 0 || teamBGoals < 0) {
        setError(`Scores cannot be negative on line ${index + 1}.`);
        hasError = true;
        setResults([]); // Clear previous results if there's an error
        return;
      }

      newResults.push({ teamAName, teamBName, teamAGoals, teamBGoals });
    });

    if (!hasError) {
      setResults(newResults);
      setError('');
      setIsProcessClicked(true); // Enable the submit button
    } else {
      setIsProcessClicked(false); // Disable submit button if there's an error
    }
  };

  const handleSubmit = async () => {
    if (results.length === 0) {
      setError('Please process the results before submitting.');
      return;
    }

    setIsSubmitting(true);
    setError('');
    setSubmitSuccess(false);
    setShowSuccessMessage(true); // Show the success message

    try {
      const response = await api.post('/match/addMatches', results, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.status !== 200) {
        throw new Error(`Failed to submit results. Status code: ${response.status}`);
      }

      setSubmitSuccess(true);
      setResults([]); // Clear results after successful submission

      // Automatically hide success message after 3 seconds
      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 3000); // Hide message after 3 seconds (3000 milliseconds)
      
    } catch (error) {
      setError('Failed to submit results. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold">Match Results Input</h1>

      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Enter match results (one per line):&#10;Team A Team B 2 1&#10;Team B Team C 0 3&#10;Team C Team D 1 1"
        rows={10}
        className="w-full p-2 border rounded resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      <button
        onClick={processResults}
        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105"
      >
        Process Results
      </button>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg" role="alert">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      )}

      {results.length > 0 && (
        <div className="bg-gray-50 p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Processed Results</h2>
          <ul className="space-y-3">
            {results.map((result, index) => (
              <li
                key={index}
                className="flex justify-between items-center border border-gray-200 p-3 rounded-lg bg-white hover:bg-gray-100 shadow-sm transition-all"
              >
                <span className="font-bold text-gray-700">{result.teamAName}</span>
                <span className="text-gray-500">vs</span>
                <span className="font-bold text-gray-700">{result.teamBName}</span>
                <span className="text-gray-500">{result.teamAGoals} - {result.teamBGoals}</span>
              </li>
            ))}
          </ul>

          <button
            onClick={handleSubmit}
            disabled={!isProcessClicked || isSubmitting}
            className={`mt-6 w-full text-white font-bold py-3 px-6 rounded-lg shadow-lg transition-all duration-300 transform ${
              isSubmitting || !isProcessClicked ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600 hover:scale-105'
            }`}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Results'}
          </button>

          {showSuccessMessage && (
            <div className="mt-4 bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-lg relative">
              <span>Results submitted successfully!</span>
              <button
                onClick={() => setShowSuccessMessage(false)}
                className="absolute top-0 right-0 mt-2 mr-2 text-green-700"
              >
                ✕
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
