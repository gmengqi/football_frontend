'use client'

import { useState } from 'react'
import api from '../api';  // Your API instance (e.g., Axios)

interface Team {
  name: string;
  matchPoints: number;
  totalGoals: number;
  alternatePoints: number;
}

export default function Ranking() {
  const [groupNumber, setGroupNumber] = useState('');
  const [teams, setTeams] = useState<Team[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchRankings = async () => {
    if (!groupNumber) {
      setError('Please enter a valid group number');
      return;
    }

    setLoading(true);
    setError('');
    setTeams([]); // Clear previous data when fetching a new group
    try {
      // Fetch the rankings from the API
      const response = await api.get(`/team/rankings/${groupNumber}`);
      setTeams(response.data);
    } catch (err) {
      setError('Failed to fetch rankings. Please check the group number and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold mb-4">Group Rankings</h1>

      {/* Input to fetch group number */}
      <div className="flex space-x-4 mb-4">
        <input
          type="text"
          value={groupNumber}
          onChange={(e) => {
            setGroupNumber(e.target.value);
            setTeams([]); // Clear the teams when typing a new group number
          }}
          placeholder="Enter Group Number"
          className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={fetchRankings}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Get Rankings
        </button>
      </div>

      {/* Error display */}
      {error && (
        <div className="text-red-500 mb-4">{error}</div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="text-blue-500">Loading...</div>
      )}

      {/* Rankings Table */}
      {teams.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-300">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="py-2 px-4 border-b">Rank</th>
                <th className="py-2 px-4 border-b">Team Name</th>
                <th className="py-2 px-4 border-b">Total Match Points</th>
                <th className="py-2 px-4 border-b">Total Goals</th>
                <th className="py-2 px-4 border-b">Total Alternate Points</th>
                <th className="py-2 px-4 border-b">Outcome</th>
              </tr>
            </thead>
            <tbody>
              {teams.map((team, index) => (
                <tr key={index} className="hover:bg-gray-100">
                  <td className="py-2 px-4 border-b">{index + 1}</td>
                  <td className="py-2 px-4 border-b">{team.name}</td>
                  <td className="py-2 px-4 border-b">{team.matchPoints}</td>
                  <td className="py-2 px-4 border-b">{team.totalGoals}</td>
                  <td className="py-2 px-4 border-b">{team.alternatePoints}</td>
                  <td className="py-2 px-4 border-b">
                    {index < 4 ? (
                      <span className="text-green-600 font-bold">Progressed</span>
                    ) : (
                      <span className="text-red-600">Eliminated</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
