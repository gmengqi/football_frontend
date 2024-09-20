import { useState } from 'react';
import api from '../api'; // Import your Axios instance

interface Team {
  name: string;
  registrationDate: string; // dd/MM format
  groupNumber: number;
}

export default function TeamInput() {
  const [input, setInput] = useState('');
  const [teams, setTeams] = useState<Team[]>([]);
  const [error, setError] = useState('');
  const [errorMessages, setErrorMessages] = useState<string[]>([]); // State to store error messages from API
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false); // State for success message
  const [isProcessClicked, setIsProcessClicked] = useState(false); // State to enable/disable submit button

  const processTeams = () => {
    const lines = input.trim().split('\n');
    const newTeams: Team[] = [];
    let hasError = false;

    // Regex to validate dd/MM date format
    const dateRegex = /^\d{2}\/\d{2}$/;

    lines.forEach((line, index) => {
      const parts = line.trim().split(' ');
      if (parts.length !== 3) {
        setError(`Invalid format in line ${index + 1}. Expected: "Team Name Registration Date (dd/MM) Group Number"`);
        setTeams([]); // Clear previous results if there's an error
        hasError = true;
        return;
      }

      const [name, registrationDate, groupNumber] = parts;
      const groupNum = parseInt(groupNumber.trim(), 10);

      if (!dateRegex.test(registrationDate.trim())) {
        setError(`Invalid date format in line ${index + 1}. Date must be in the format dd/MM.`);
        setTeams([]); // Clear previous results if there's an error
        hasError = true;
        return;
      }

      if (groupNum !== 1 && groupNum !== 2) {
        setError(`Invalid group number in line ${index + 1}. Group number must be either 1 or 2.`);
        setTeams([]); // Clear previous results if there's an error
        hasError = true;
        return;
      }

      if (isNaN(groupNum)) {
        setError(`Invalid group number in line ${index + 1}. Group number must be a number.`);
        setTeams([]); // Clear previous results if there's an error
        hasError = true;
        return;
      }

      newTeams.push({ name: name.trim(), registrationDate: registrationDate.trim(), groupNumber: groupNum });
    });

    if (!hasError) {
      setTeams(newTeams);
      setError('');      
      setIsProcessClicked(true); // Enable the submit button
      setIsSubmitting(false); 
    } else {
      setIsProcessClicked(false); // Disable submit button if there's an error
      // Remove the error message after 3 seconds
      setTimeout(() => {
        setError('');
      }, 3000);
    }
  };

  const handleSubmit = async () => {
    if (teams.length === 0) {
      setError('Please process the teams before submitting.');
      return;
    }

    setIsSubmitting(true);
    setError('');
    setSubmitSuccess(false);
    setErrorMessages([]); // Reset error messages

    try {
      const response = await api.post('/team/addTeams', teams, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.status !== 200) {
        throw new Error(`Failed to submit teams. Status code: ${response.data}`);
      }

      if (response.data.errors && response.data.errors.length > 0) {
        setErrorMessages(response.data.errors);
        setSubmitSuccess(false);
        return;
      }
            
      setIsSubmitting(false);
      setSubmitSuccess(true);
      setShowSuccessMessage(true); // Show success message

      // Automatically hide success message after 3 seconds
      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 3000); // Hide message after 3 seconds

    } catch (error) {
      setIsSubmitting(false);
      setErrorMessages(['An unexpected error occurred. Please try again later.']);
      // Automatically hide error message after 3 seconds
      setTimeout(() => {
        setErrorMessages([]);
      }, 3000);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold">Team Input</h1>
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Enter team details (one per line):&#10;Team Name Registration Date (dd/MM) Group Number&#10;Example: TeamA 31/12 1"
        rows={10}
        className="w-full p-2 border rounded resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        onClick={processTeams}
        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105"
      >
        Process Teams
      </button>
      {error && <div className="text-red-500">{error}</div>}
      {teams.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-2">Processed Teams:</h2>
          <table className="min-w-full table-auto bg-white border rounded-md">
            <thead>
              <tr className="bg-gray-200">
                <th className="px-4 py-2 text-left">Team Name</th>
                <th className="px-4 py-2 text-left">Registration Date (dd/MM)</th>
                <th className="px-4 py-2 text-left">Group Number</th>
              </tr>
            </thead>
            <tbody>
              {teams.map((team, index) => (
                <tr key={index} className="border-t">
                  <td className="px-4 py-2">{team.name}</td>
                  <td className="px-4 py-2">{team.registrationDate}</td>
                  <td className="px-4 py-2">{team.groupNumber}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <button
            onClick={handleSubmit}
            disabled={!isProcessClicked || isSubmitting}
            className="mt-4 w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Teams'}
          </button>
        </div>
      )}
      {errorMessages.length > 0 && (
        <div className="mt-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg">
          <ul>
            {errorMessages.map((msg, index) => (
              <li key={index}>{msg}</li>
            ))}
          </ul>
        </div>
      )}
      {showSuccessMessage && (
        <div className="mt-4 bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-lg relative">
          <span>Teams submitted successfully!</span>
          <button
            onClick={() => setShowSuccessMessage(false)}
            className="absolute top-0 right-0 mt-2 mr-2 text-green-700"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
