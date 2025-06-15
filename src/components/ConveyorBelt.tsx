import React from 'react';
import BottleComponent from './BottleComponent';
import { Bottle } from '../types/game';

interface ConveyorBeltProps {
  bottles: Bottle[];
  conveyorSpeed: number;
  onDragStart: (bottle: Bottle) => void;
  onDragEnd: () => void;
  isPlaying: boolean;
}

const ConveyorBelt: React.FC<ConveyorBeltProps> = ({
  bottles,
  conveyorSpeed,
  onDragStart,
  onDragEnd,
  isPlaying
}) => {
  return (
    <div className="w-full h-full bg-gradient-to-r from-gray-300 to-gray-400 border-t-4 border-yellow-400 relative">
      {/* Left Wall - Physical barrier for bottles - Mobile optimized */}
      <div className="absolute left-0 top-0 w-6 h-full bg-gradient-to-r from-red-600 to-red-700 border-r-3 border-red-800 shadow-xl z-10">
        {/* Wall texture */}
        <div className="absolute inset-0 bg-gradient-to-b from-red-500 to-red-800 opacity-60" />
        
        {/* Warning stripes - Fewer for mobile */}
        <div className="absolute inset-0">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="absolute w-full h-1.5 bg-yellow-400 opacity-80"
              style={{ top: `${i * 24 + 6}px` }}
            />
          ))}
        </div>
        
        {/* Danger symbols - Smaller for mobile */}
        <div className="absolute top-2 left-1/2 transform -translate-x-1/2 text-yellow-300 text-xs">
          ⚠️
        </div>
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-yellow-300 text-xs">
          ⚠️
        </div>
        
        {/* 3D effect - highlight */}
        <div className="absolute top-0 left-0 w-0.5 h-full bg-red-400 opacity-60" />
        
        {/* Shadow on the belt */}
        <div className="absolute right-0 top-0 w-3 h-full bg-black opacity-30 blur-sm" />
      </div>

      {/* Conveyor Belt Pattern - Mobile optimized */}
      <div className="absolute inset-0 opacity-20">
        <div 
          className="h-full bg-repeat-x"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='30' height='15' viewBox='0 0 30 15' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.3'%3E%3Crect x='0' y='6' width='3' height='3'/%3E%3Crect x='6' y='6' width='3' height='3'/%3E%3Crect x='12' y='6' width='3' height='3'/%3E%3Crect x='18' y='6' width='3' height='3'/%3E%3Crect x='24' y='6' width='3' height='3'/%3E%3C/g%3E%3C/svg%3E")`,
            animation: isPlaying ? `conveyor ${3 / conveyorSpeed}s linear infinite` : 'none'
          }}
        />
      </div>

      {/* Right Edge Indicator - Smaller for mobile */}
      <div className="absolute right-0 top-0 w-1 h-full bg-red-500 opacity-60 animate-pulse" />

      {/* Bottles on Conveyor */}
      <div className="relative h-full">
        {bottles.map((bottle) => (
          <BottleComponent
            key={bottle.id}
            bottle={bottle}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
          />
        ))}
      </div>

      <style>{`
        @keyframes conveyor {
          0% { background-position-x: 0px; }
          100% { background-position-x: 30px; }
        }
      `}</style>
    </div>
  );
};

export default ConveyorBelt;