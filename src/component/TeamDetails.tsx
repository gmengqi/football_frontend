'use client';

import { AxiosError } from 'axios';
import { useState } from 'react';
import api from '../api';  // Your Axios instance

interface Team {
  name: string;
  registrationDate: string;
  groupNumber: number;
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
  const [editedTeam, setEditedTeam] = useState<Team | null>(null);  // For editing team data
  const [outcome, setOutcome] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Fetch outcome by team name and group number
  const fetchOutcome = async (teamName: string, groupNumber: number) => {
    try {
      const response = await api.get(`/team/rankings/getOutcome/${teamName}/${groupNumber}`);
      if (response.status === 200) {
        setOutcome(response.data ? "Progressed" : "Eliminated");
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
        setEditedTeam(response.data);  // Sync editing data
        fetchOutcome(response.data.name, response.data.groupNumber);
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
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, field: keyof Team) => {
    if (editedTeam) {
      setEditedTeam({
        ...editedTeam,
        [field]: e.target.value
      });
    }
  };

  // Validate the edited team form
  const validateForm = (): boolean => {
    if (!editedTeam) return false;
    if (editedTeam.groupNumber !== 1 && editedTeam.groupNumber !== 2) {
      setError('Group number must be 1 or 2.');
      return false;
    }
    if (editedTeam.totalGoals < 0 || editedTeam.matchPoints < 0 || editedTeam.alternatePoints < 0 || editedTeam.matchesPlayed < 0) {
      setError('Goals, points, and matches played must be positive.');
      return false;
    }
    if (new Date(editedTeam.registrationDate) > new Date()) {
      setError('Registration date cannot be in the future.');
      return false;
    }
    setError('');  // Clear any previous errors
    return true;
  };

  // Save edited team data using DTO
  const saveTeam = async () => {
    if (!editedTeam) return;
    if (!validateForm()) return;  // Validate before submitting

    const dto: UpdateTeamDTO = {
      teamName: team!.name,  // Keep the original name as the team name
      newName: editedTeam.name !== team!.name ? editedTeam.name : undefined,
      newRegistrationDate: editedTeam.registrationDate,
      groupNumber: editedTeam.groupNumber,
      totalGoals: editedTeam.totalGoals,
      matchPoints: editedTeam.matchPoints,
      alternatePoints: editedTeam.alternatePoints,
      matchesPlayed: editedTeam.matchesPlayed
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
      // Check if the error is an Axios error
      if (error instanceof AxiosError && error.response) {
        // Set the error message from the response
        setError(error.response.data.message || 'Failed to update the team.');
      } else {
        setError('An unexpected error occurred.');
      }
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

  // Cancel editing and revert changes
  const cancelEdit = () => {
    setEditedTeam(team);  // Revert to original team data
    setEditMode(false);
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

      {loading && (
        <div className="text-blue-500">Loading...</div>
      )}

      {editedTeam && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Team Details:</h2>
          {editMode ? (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold">Team Name</label>
                  <input
                    value={editedTeam.name}
                    onChange={(e) => handleInputChange(e, 'name')}
                    className="p-2 border rounded w-full"
                  />
                </div>
                <div>
                  <label className="block font-bold">Registration Date</label>
                  <input
                    value={editedTeam.registrationDate}
                    onChange={(e) => handleInputChange(e, 'registrationDate')}
                    className="p-2 border rounded w-full"
                  />
                </div>
                <div>
                  <label className="block font-bold">Group Number</label>
                  <input
                    value={editedTeam.groupNumber}
                    onChange={(e) => handleInputChange(e, 'groupNumber')}
                    className="p-2 border rounded w-full"
                  />
                </div>
                <div>
                  <label className="block font-bold">Total Goals</label>
                  <input
                    value={editedTeam.totalGoals}
                    onChange={(e) => handleInputChange(e, 'totalGoals')}
                    className="p-2 border rounded w-full"
                  />
                </div>
                <div>
                  <label className="block font-bold">Match Points</label>
                  <input
                    value={editedTeam.matchPoints}
                    onChange={(e) => handleInputChange(e, 'matchPoints')}
                    className="p-2 border rounded w-full"
                  />
                </div>
                <div>
                  <label className="block font-bold">Alternate Points</label>
                  <input
                    value={editedTeam.alternatePoints}
                    onChange={(e) => handleInputChange(e, 'alternatePoints')}
                    className="p-2 border rounded w-full"
                  />
                </div>
                <div>
                  <label className="block font-bold">Matches Played</label>
                  <input
                    value={editedTeam.matchesPlayed}
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
                  onClick={cancelEdit}
                  className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <strong>Team Name:</strong> {editedTeam.name}
              </div>
              <div>
                <strong>Registration Date:</strong> {editedTeam.registrationDate}
              </div>
              <div>
                <strong>Group Number:</strong> {editedTeam.groupNumber}
              </div>
              <div>
                <strong>Total Goals:</strong> {editedTeam.totalGoals}
              </div>
              <div>
                <strong>Match Points:</strong> {editedTeam.matchPoints}
              </div>
              <div>
                <strong>Alternate Points:</strong> {editedTeam.alternatePoints}
              </div>
              <div>
                <strong>Matches Played:</strong> {editedTeam.matchesPlayed}
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
