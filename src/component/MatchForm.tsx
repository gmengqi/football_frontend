'use client';

import { useState } from 'react';
import api from '../api'; // Import Axios instance

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
  const [showSuccessMessage, setShowSuccessMessage] = useState(false); // New state for success message
  const [apiErrors, setApiErrors] = useState<string[]>([]); // State to store API errors

  const processResults = () => {
    const lines = input.trim().split('\n');
    const newResults: MatchResult[] = [];
    let hasError = false;

    lines.forEach((line, index) => {
      const parts = line.trim().split(' ');
      if (parts.length !== 4) {
        setError(`Invalid format on line ${index + 1}. Expected: "Team A Team B Score A Score B"`);
        hasError = true;
        return;
      }

      const [teamAName, teamBName, teamAScore, teamBScore] = parts;
      const teamAGoals = parseInt(teamAScore, 10);
      const teamBGoals = parseInt(teamBScore, 10);

      if (teamAName === teamBName) {
        setError(`Teams cannot have the same name on line ${index + 1}.`);
        hasError = true;
        return;
      }

      if (teamAGoals < 0 || teamBGoals < 0) {
        setError(`Scores must be positive numbers on line ${index + 1}.`);
        hasError = true;
        return;
      }

      if (isNaN(teamAGoals) || isNaN(teamBGoals)) {
        setError(`Invalid scores on line ${index + 1}. Scores must be numbers.`);
        hasError = true;
        return;
      }

      newResults.push({ teamAName, teamBName, teamAGoals, teamBGoals });
    });

    if (!hasError) {
      setResults(newResults);
      setError('');
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
    setShowSuccessMessage(false);
    setApiErrors([]); // Clear previous API errors

    try {
      const response = await api.post('/match/addMatches', results, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Handle the response and any error messages
      if (response.data.errors && response.data.errors.length > 0) {
        setApiErrors(response.data.errors);
        setSubmitSuccess(false);
        return;
      }

      setSubmitSuccess(true);
      setShowSuccessMessage(true); // Show success message
    } catch (error: any) {
      if (error.response && error.response.data.errors) {
        // Display error messages from the API
        setApiErrors(error.response.data.errors);
      } else {
        setError('Failed to submit results. Please try again.');
      }
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
        placeholder="Enter match results (one per line):&#10;TeamA TeamB 2 1&#10;TeamB TeamC 0 3&#10;TeamC TeamD 1 1"
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
            disabled={isSubmitting}
            className={`mt-6 w-full text-white font-bold py-3 px-6 rounded-lg shadow-lg transition-all duration-300 transform ${
              isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600 hover:scale-105'
            }`}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Results'}
          </button>

          {submitSuccess && (
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

          {apiErrors.length > 0 && (
            <div className="mt-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg">
              <p className="font-bold">API Errors:</p>
              <ul>
                {apiErrors.map((err, index) => (
                  <li key={index} className="text-sm">{err}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
