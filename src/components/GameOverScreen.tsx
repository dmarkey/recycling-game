import React from 'react';
import { RotateCcw, Euro } from 'lucide-react';

interface GameOverScreenProps {
  score: number;
  level: number;
  onRestart: () => void;
}

const GameOverScreen: React.FC<GameOverScreenProps> = ({
  score,
  level,
  onRestart
}) => {
  const getMessage = () => {
    if (score >= 5) return "Excellent recycling! 🌟";
    if (score >= 2.5) return "Great job! 🎉";
    if (score >= 1) return "Good work! 👍";
    return "Keep trying! 💪";
  };

  return (
    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-3xl p-8 max-w-md mx-4 text-center shadow-2xl">
        <div className="text-6xl mb-4">🇮🇪</div>
        
        <h2 className="text-3xl font-bold text-green-800 mb-2">Game Over!</h2>
        <p className="text-xl text-gray-600 mb-6">{getMessage()}</p>
        
        <div className="bg-green-50 rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-center gap-4 mb-4">
            <Euro className="w-8 h-8 text-green-600" />
            <div>
              <div className="text-3xl font-bold text-green-800">€{score.toFixed(2)}</div>
              <div className="text-sm text-gray-600">Total Earned</div>
            </div>
          </div>
          
          <div className="text-lg text-green-700">
            Final Speed: <span className="font-bold">{Math.min(1 + (Math.floor(score / 10) * 0.2), 3.0).toFixed(1)}x</span>
          </div>
        </div>
        
        <button
          onClick={onRestart}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-8 rounded-2xl text-xl transition-colors duration-200 flex items-center gap-3 mx-auto shadow-lg hover:shadow-xl"
        >
          <RotateCcw className="w-6 h-6" />
          Play Again
        </button>
        
        <div className="mt-4 text-sm text-gray-500">
          Keep recycling to help Ireland! 🌱
        </div>
      </div>
    </div>
  );
};

export default GameOverScreen;