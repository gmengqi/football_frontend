'use client'

import { useState, useEffect } from 'react'
import api from '../api';  // Your Axios instance

interface Team {
  name: string;
  registrationDate: string;
  groupNumber: string;
  totalGoals: number;
  matchPoints: number;
  alternatePoints: number;
  matchesPlayed: number;
}

interface UpdateTeamDTO {
  teamName: string;
  newName?: string;
  newRegistrationDate?: string;
  groupNumber?: number;
  totalGoals?: number;
  matchPoints?: number;
  alternatePoints?: number;
  matchesPlayed?: number;
}

export default function TeamDetails() {
  const [teamNameInput, setTeamNameInput] = useState<string>('');
  const [team, setTeam] = useState<Team | null>(null);
  const [outcome, setOutcome] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Fetch outcome by team name and group number
  const fetchOutcome = async (teamName: string, groupNumber: string) => {
    try {
      const response = await api.get(`/team/rankings/getOutcome/${teamName}/${groupNumber}`);
      if (response.status === 200) {
        if (response.data) {
          setOutcome("Progessed"); 
        } else {
          setOutcome("Eliminated"); 
        }
      } else {
        setOutcome(null);
        setError('Failed to retrieve the outcome.');
      }
    } catch (error) {
      setError('Error occurred while retrieving the outcome.');
      setOutcome(null);
    }
  };

  // Fetch team details by team name
  const fetchTeamDetails = async () => {
    if (!teamNameInput.trim()) {
      setError('Please enter a team name.');
      return;
    }

    setLoading(true);
    setError('');
    setTeam(null);
    setOutcome(null);

    try {
      const response = await api.get(`/team/getTeam/${teamNameInput}`);
      if (response.status === 200) {
        setTeam(response.data);
        console.log(response.data.name)
        console.log(response.data.groupNumber)

        fetchOutcome(response.data.name, response.data.groupNumber); // Fetch outcome based on team and group
        setEditMode(false);  // Exit edit mode if new team is fetched
      } else {
        setError('Team not found.');
      }
    } catch (error) {
      setError('Error occurred while retrieving team details.');
    } finally {
      setLoading(false);
    }
  };

  // Handle input change for editing team
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    if (team) {
      setTeam({
        ...team,
        [field]: e.target.value
      });
    }
  };

  // Save edited team data using DTO
  const saveTeam = async () => {
    if (!team) return;

    const dto: UpdateTeamDTO = {
      teamName: team.name,
      newName: team.name !== teamNameInput ? teamNameInput : undefined,
      newRegistrationDate: team.registrationDate,
      groupNumber: parseInt(team.groupNumber),
      totalGoals: team.totalGoals,
      matchPoints: team.matchPoints,
      alternatePoints: team.alternatePoints,
      matchesPlayed: team.matchesPlayed
    };

    try {
      const response = await api.put(`/team/updateTeam/EDIT`, dto);
      if (response.status === 200) {
        setEditMode(false);
        fetchTeamDetails(); // Refresh the team details after successful update
      } else {
        setError('Failed to update the team.');
      }
    } catch (error) {
      setError('Error occurred while updating the team.');
    }
  };

  // Delete a team by team name
  const deleteTeam = async () => {
    if (!team) return;

    try {
      const response = await api.delete(`/team/deleteTeam/${team.name}`);
      if (response.status === 200) {
        setTeam(null); // Clear the team data after successful deletion
      } else {
        setError('Failed to delete the team.');
      }
    } catch (error) {
      setError('Error occurred while deleting the team.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold mb-4">Search for a Team</h1>

      {/* Error display */}
      {error && (
        <div className="text-red-500 mb-4">{error}</div>
      )}

      {/* Search Team by Name */}
      <div className="flex space-x-4 mb-4">
        <input
          type="text"
          value={teamNameInput}
          onChange={(e) => setTeamNameInput(e.target.value)}
          placeholder="Enter team name"
          className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={fetchTeamDetails}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Search Team
        </button>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="text-blue-500">Loading...</div>
      )}

      {/* Display Team Details */}
      {team && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Team Details:</h2>
          {editMode ? (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold">Team Name</label>
                  <input
                    value={team.name}
                    onChange={(e) => handleInputChange(e, 'teamName')}
                    className="p-2 border rounded w-full"
                  />
                </div>
                <div>
                  <label className="block font-bold">Registration Date</label>
                  <input
                    value={team.registrationDate}
                    onChange={(e) => handleInputChange(e, 'registrationDate')}
                    className="p-2 border rounded w-full"
                  />
                </div>
                <div>
                  <label className="block font-bold">Group Number</label>
                  <input
                    value={team.groupNumber}
                    onChange={(e) => handleInputChange(e, 'groupNumber')}
                    className="p-2 border rounded w-full"
                  />
                </div>
                <div>
                  <label className="block font-bold">Total Goals</label>
                  <input
                    value={team.totalGoals}
                    onChange={(e) => handleInputChange(e, 'totalGoals')}
                    className="p-2 border rounded w-full"
                  />
                </div>
                <div>
                  <label className="block font-bold">Match Points</label>
                  <input
                    value={team.matchPoints}
                    onChange={(e) => handleInputChange(e, 'matchPoints')}
                    className="p-2 border rounded w-full"
                  />
                </div>
                <div>
                  <label className="block font-bold">Alternate Points</label>
                  <input
                    value={team.alternatePoints}
                    onChange={(e) => handleInputChange(e, 'alternatePoints')}
                    className="p-2 border rounded w-full"
                  />
                </div>
                <div>
                  <label className="block font-bold">Matches Played</label>
                  <input
                    value={team.matchesPlayed}
                    onChange={(e) => handleInputChange(e, 'matchesPlayed')}
                    className="p-2 border rounded w-full"
                  />
                </div>
                <div>
                  <label className="block font-bold">Outcome</label>
                  <input
                    value={outcome || ''}
                    readOnly
                    className="p-2 border bg-gray-100 rounded w-full cursor-not-allowed"
                  />
                </div>
              </div>
              <div className="mt-4 space-x-4">
                <button
                  onClick={saveTeam}
                  className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => setEditMode(false)}
                  className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <strong>Team Name:</strong> {team.name}
              </div>
              <div>
                <strong>Registration Date:</strong> {team.registrationDate}
              </div>
              <div>
                <strong>Group Number:</strong> {team.groupNumber}
              </div>
              <div>
                <strong>Total Goals:</strong> {team.totalGoals}
              </div>
              <div>
                <strong>Match Points:</strong> {team.matchPoints}
              </div>
              <div>
                <strong>Alternate Points:</strong> {team.alternatePoints}
              </div>
              <div>
                <strong>Matches Played:</strong> {team.matchesPlayed}
              </div>
              <div>
                <strong>Outcome:</strong> {outcome || 'N/A'}
              </div>
              <div className="col-span-2 space-x-4 mt-4">
                <button
                  onClick={() => setEditMode(true)}
                  className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
                >
                  Edit
                </button>
                <button
                  onClick={deleteTeam}
                  className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
