import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Medal, Trash2, LogOut, PlayCircle } from 'lucide-react';

const MainPage = () => {
  const navigate = useNavigate();
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isPopoverVisible, setPopoverVisible] = useState(false);
  const [leaderboardData, setLeaderboardData] = useState<string[]>([]);

  const currentPlayer = "player1"; // Replace with actual username or player data

  const handleLogout = () => {
    // Add logout logic here
    localStorage.removeItem('playerName'); 
    navigate('/');
  };

  const handleDeleteAccount = async () => {
    // Retrieve the currently logged-in player's username from localStorage
    const currentPlayer = localStorage.getItem('playerName');
  
    if (!currentPlayer) {
      alert("Player not logged in or no username found.");
      return;
    }
  
    try {
      // Send the DELETE request to the backend
      const response = await fetch(`${import.meta.env.VITE_BCK_URL}/scores/delete_user_score/${currentPlayer}`, {
        method: 'DELETE',
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        alert(errorData.detail || 'Error deleting account');
        return;
      }
  
      const data = await response.json();
      console.log(data.message);  // Successfully deleted message
  
      // Clear the username from localStorage
      localStorage.removeItem('playerName');
  
      // Redirect to the homepage after deleting the account
      navigate('/');
    } catch (error) {
      console.error('Error deleting account:', error);
      alert('Failed to delete account');
    }
  };

  const handleCheckScore = async () => {
    try {
      // Retrieve the current player's username from localStorage
      const currentPlayer = localStorage.getItem('playerName'); 
  
      if (!currentPlayer) {
        alert("Player not logged in or no username found.");
        return;
      }
  
      // Fetch the score using the current player's username
      const response = await fetch(`${import.meta.env.VITE_BCK_URL}/scores/show_score/${currentPlayer}`);
  
      if (!response.ok) {
        const errorData = await response.json();
        alert(`Error fetching score: ${errorData.message || 'Unknown error'}`);
        return;
      }
  
      const data = await response.json();
  
      // Display score in an alert
      if (data.score !== undefined) {
        alert(`Your score: ${data.score}`);
      } else {
        alert("No score found for this user.");
      }
  
    } catch (error) {
      console.error("Error fetching score:", error);
      alert(`Failed to fetch score`);
    }
  };

  const handleLeaderboard = async () => {
    try {
      // Fetch leaderboard data from the backend
      const response = await fetch(`${import.meta.env.VITE_BCK_URL}/scores/leaderboard`);
      const data = await response.json();

      if (response.ok) {
        // Map player names and scores from the leaderboard data
        const topPlayers = data
          .map((player: { playerName: string; score: number }) => `${player.playerName}: ${player.score}`)
          .join(', ');

        // Set leaderboard data and show the popover
        setLeaderboardData(topPlayers.split(', '));
        setPopoverVisible(true);
      } else {
        alert('Error fetching leaderboard');
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      alert('Failed to fetch leaderboard');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl">
        <h1 className="text-4xl font-bold text-white text-center mb-8">Welcome Back!</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {/* Score Button */}
          <div className="relative">
            <button
              onClick={handleCheckScore}
              className="w-full p-4 bg-white/5 hover:bg-white/10 rounded-xl text-white flex items-center gap-3 transition-all"
            >
              <Trophy className="w-6 h-6 text-yellow-300" />
              Check Your Score
            </button>
          </div>

          {/* Leaderboard Button */}
          <div className="relative">
            <button
              onClick={handleLeaderboard}
              className="w-full p-4 bg-white/5 hover:bg-white/10 rounded-xl text-white flex items-center gap-3 transition-all"
            >
              <Medal className="w-6 h-6 text-blue-300" />
              Leaderboard
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {/* Start Game Button */}
          <button
            onClick={() => navigate('/game')}
            className="w-full p-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-xl text-white font-semibold flex items-center justify-center gap-3 transition-all"
          >
            <PlayCircle className="w-6 h-6" />
            Start Game
          </button>

          {/* Delete Account Button */}
          <div className="relative">
            <button
              onClick={() => setShowDeleteConfirm(!showDeleteConfirm)}
              className="w-full p-4 bg-red-500/20 hover:bg-red-500/30 rounded-xl text-red-300 font-semibold flex items-center justify-center gap-3 transition-all"
            >
              <Trash2 className="w-6 h-6" />
              Delete Account
            </button>
            {showDeleteConfirm && (
              <div className="absolute top-full left-0 mt-2 w-full p-4 bg-white/10 backdrop-blur-lg rounded-xl text-white z-10">
                <p className="mb-4">Are you sure you want to delete your account? This action cannot be undone.</p>
                <div className="flex gap-4">
                  <button
                    onClick={handleDeleteAccount}
                    className="flex-1 p-2 bg-red-500 hover:bg-red-600 rounded-lg transition-all"
                  >
                    Yes, Delete
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 p-2 bg-gray-500 hover:bg-gray-600 rounded-lg transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full p-4 bg-white/5 hover:bg-white/10 rounded-xl text-white font-semibold flex items-center justify-center gap-3 transition-all"
          >
            <LogOut className="w-6 h-6" />
            Logout
          </button>
          
        </div>

        {/* Popover for Leaderboard */}
        {isPopoverVisible && (
  <div className="absolute top-16 left-1/2 transform -translate-x-1/2 p-4 bg-black/80 backdrop-blur-lg rounded-xl text-white z-10 w-72">
    <h3 className="font-semibold text-lg mb-4">Top 10 Players</h3>
    <ul className="space-y-2">
      {leaderboardData.map((player, index) => (
        <li key={index} className="text-sm text-gray-200">
          {player}
        </li>
      ))}
    </ul>
    <button
      onClick={() => setPopoverVisible(false)}
      className="mt-4 w-full p-2 bg-red-500 hover:bg-red-600 rounded-lg"
    >
      Close
    </button>
  </div>
)}
      </div>
    </div>
  );
};

export default MainPage;
