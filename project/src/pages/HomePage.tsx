import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, Trophy, BookOpen } from 'lucide-react';

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-4">Set Sudoku</h1>
          <p className="text-lg text-gray-200">
            Challenge your mind with set theory and logic
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/5 p-6 rounded-xl text-center">
            <Brain className="w-12 h-12 mx-auto mb-4 text-purple-300" />
            <h3 className="text-xl font-semibold text-white mb-2">Logic Puzzles</h3>
            <p className="text-gray-300">Solve puzzles using set operations</p>
          </div>
          <div className="bg-white/5 p-6 rounded-xl text-center">
            <Trophy className="w-12 h-12 mx-auto mb-4 text-yellow-300" />
            <h3 className="text-xl font-semibold text-white mb-2">Score Points</h3>
            <p className="text-gray-300">Compete for high scores</p>
          </div>
          <div className="bg-white/5 p-6 rounded-xl text-center">
            <BookOpen className="w-12 h-12 mx-auto mb-4 text-blue-300" />
            <h3 className="text-xl font-semibold text-white mb-2">Learn Sets</h3>
            <p className="text-gray-300">Master set theory concepts</p>
          </div>
        </div>

        <div className="text-center">
          <button
            onClick={() => navigate('/login')}
            className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full text-lg font-semibold hover:from-purple-600 hover:to-pink-600 transform hover:scale-105 transition-all shadow-lg"
          >
            Start Game
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;