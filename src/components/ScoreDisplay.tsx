import React from 'react';
import { Euro, Gauge } from 'lucide-react';

interface ScoreDisplayProps {
  score: number;
  conveyorSpeed: number;
}

const ScoreDisplay: React.FC<ScoreDisplayProps> = ({ score, conveyorSpeed }) => {
  return (
    <div className="flex items-center gap-3 bg-white bg-opacity-80 rounded-lg px-3 py-2 shadow-md">
      <div className="flex items-center gap-1">
        <Euro className="w-4 h-4 text-green-600" />
        <div>
          <div className="text-sm font-bold text-green-800">€{score.toFixed(2)}</div>
          <div className="text-xs text-gray-600">Earned</div>
        </div>
      </div>
      
      <div className="w-px h-6 bg-gray-300" />
      
      <div className="flex items-center gap-1">
        <Gauge className="w-4 h-4 text-blue-600" />
        <div>
          <div className="text-sm font-bold text-green-800">{conveyorSpeed.toFixed(1)}x</div>
          <div className="text-xs text-gray-600">Speed</div>
        </div>
      </div>
    </div>
  );
};

export default ScoreDisplay;