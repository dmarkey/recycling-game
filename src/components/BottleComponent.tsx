import React, { useState } from 'react';
import { Bottle } from '../types/game';

interface BottleComponentProps {
  bottle: Bottle;
  onDragStart: (bottle: Bottle) => void;
  onDragEnd: () => void;
}

const BottleComponent: React.FC<BottleComponentProps> = ({
  bottle,
  onDragStart,
  onDragEnd
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });

  const getItemSize = () => {
    if (bottle.type === 'aluminum') {
      return 'w-10 h-16'; // Standard can size
    } else if (bottle.type === 'plastic') {
      switch (bottle.depositValue) {
        case 15: return 'w-12 h-20'; // Small bottle
        case 25: return 'w-14 h-24'; // Large bottle
        default: return 'w-12 h-20';
      }
    }
    return 'w-12 h-24'; // Glass bottles
  };

  const renderAluminumCan = () => (
    <div className="relative w-full h-full">
      {/* Can Top */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-8 h-2 bg-gradient-to-b from-gray-300 to-gray-500 rounded-t-sm border border-gray-600">
        <div className="absolute top-0.5 left-1/2 transform -translate-x-1/2 w-3 h-0.5 bg-gray-200 rounded-full" />
      </div>
      
      {/* Can Body */}
      <div className="absolute top-2 left-0 right-0 bottom-0 bg-gradient-to-br from-blue-400 via-blue-500 to-blue-700 rounded-lg border-2 border-blue-800 shadow-lg overflow-hidden">
        {/* Can ridges */}
        <div className="absolute inset-0">
          <div className="absolute top-2 left-0 right-0 h-px bg-blue-300 opacity-50" />
          <div className="absolute top-4 left-0 right-0 h-px bg-blue-300 opacity-50" />
          <div className="absolute bottom-4 left-0 right-0 h-px bg-blue-300 opacity-50" />
          <div className="absolute bottom-2 left-0 right-0 h-px bg-blue-300 opacity-50" />
        </div>
        
        {/* DRS Label */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-white bg-opacity-95 rounded-lg p-1.5 border-2 border-green-600 shadow-md">
            <div className="text-center">
              <div className="text-xs font-bold text-green-800 leading-tight">DRS</div>
              <div className="text-sm font-black text-green-800">{bottle.depositValue}¢</div>
            </div>
          </div>
        </div>
        
        {/* Metallic shine */}
        <div className="absolute top-1 left-1 w-2 h-8 bg-white opacity-60 rounded-full blur-sm" />
        <div className="absolute top-4 right-1 w-1 h-6 bg-white opacity-30 rounded-full" />
      </div>
    </div>
  );

  const renderPlasticBottle = () => (
    <div className="relative w-full h-full">
      {/* Bottle Cap */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-8 h-4 bg-gradient-to-b from-red-500 to-red-700 rounded-t-lg border border-red-800 shadow-sm">
        <div className="absolute top-1 left-1/2 transform -translate-x-1/2 w-4 h-1 bg-red-300 rounded-full opacity-60" />
      </div>
      
      {/* Bottle Neck */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-6 h-6 bg-gradient-to-b from-blue-100 to-blue-200 border-l border-r border-blue-300">
        <div className="absolute top-0 left-0 w-1 h-full bg-white opacity-40" />
      </div>
      
      {/* Bottle Body */}
      <div className="absolute top-10 left-0 right-0 bottom-0 bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 rounded-b-2xl border-2 border-blue-300 shadow-lg overflow-hidden">
        {/* Plastic texture lines */}
        <div className="absolute inset-0">
          <div className="absolute top-2 left-0 right-0 h-px bg-blue-300 opacity-30" />
          <div className="absolute top-4 left-0 right-0 h-px bg-blue-300 opacity-30" />
          <div className="absolute bottom-4 left-0 right-0 h-px bg-blue-300 opacity-30" />
          <div className="absolute bottom-2 left-0 right-0 h-px bg-blue-300 opacity-30" />
        </div>
        
        {/* DRS Label */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-white bg-opacity-95 rounded-lg p-2 border-2 border-green-600 shadow-md">
            <div className="text-center">
              <div className="text-xs font-bold text-green-800 leading-tight">DRS</div>
              <div className="text-lg font-black text-green-800">{bottle.depositValue}¢</div>
            </div>
          </div>
        </div>
        
        {/* Highlight reflection */}
        <div className="absolute top-2 left-2 w-3 h-8 bg-white opacity-50 rounded-full blur-sm" />
        
        {/* Bottom curve highlight */}
        <div className="absolute bottom-1 left-1 right-1 h-2 bg-gradient-to-t from-white to-transparent opacity-30 rounded-b-xl" />
      </div>
    </div>
  );

  const renderGlassBottle = () => {
    const getGlassColors = () => {
      switch (bottle.color) {
        case 'green':
          return {
            main: 'from-green-400 via-green-500 to-green-700',
            border: 'border-green-800',
            highlight: 'bg-green-200',
            shadow: 'shadow-green-900/30'
          };
        case 'brown':
          return {
            main: 'from-amber-600 via-amber-700 to-amber-900',
            border: 'border-amber-900',
            highlight: 'bg-amber-300',
            shadow: 'shadow-amber-900/40'
          };
        case 'clear':
        default:
          return {
            main: 'from-gray-100 via-gray-200 to-gray-400',
            border: 'border-gray-500',
            highlight: 'bg-white',
            shadow: 'shadow-gray-600/30'
          };
      }
    };

    const colors = getGlassColors();

    return (
      <div className="relative w-full h-full">
        {/* Cork/Cap */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-7 h-3 bg-gradient-to-b from-yellow-800 to-yellow-900 rounded-t-sm border border-yellow-900">
          <div className="absolute top-0.5 left-1 right-1 h-px bg-yellow-600 opacity-60" />
        </div>
        
        {/* Bottle Neck */}
        <div className={`absolute top-3 left-1/2 transform -translate-x-1/2 w-5 h-4 bg-gradient-to-b ${colors.main} ${colors.border} border-l border-r`}>
          <div className={`absolute top-0 left-0 w-px h-full ${colors.highlight} opacity-60`} />
        </div>
        
        {/* Bottle Body */}
        <div className={`absolute top-7 left-0 right-0 bottom-0 bg-gradient-to-br ${colors.main} rounded-b-2xl border-2 ${colors.border} ${colors.shadow} shadow-lg overflow-hidden`}>
          {/* Glass reflection - main highlight */}
          <div className={`absolute top-2 left-1 w-2 h-12 ${colors.highlight} opacity-40 rounded-full blur-sm`} />
          
          {/* Secondary reflection */}
          <div className={`absolute top-6 right-1 w-1 h-8 ${colors.highlight} opacity-25 rounded-full`} />
          
          {/* Glass thickness effect at bottom */}
          <div className={`absolute bottom-0 left-0 right-0 h-3 bg-gradient-to-t ${colors.main.replace('from-', 'from-').replace('via-', 'via-').replace('to-', 'to-')} opacity-60 rounded-b-2xl`} />
          
          {/* Bottle bottom indentation */}
          <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-6 h-2 bg-black bg-opacity-20 rounded-full" />
        </div>
      </div>
    );
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragPosition({ x: e.clientX, y: e.clientY });
    onDragStart(bottle);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setDragPosition({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
      onDragEnd();
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    setIsDragging(true);
    setDragPosition({ x: touch.clientX, y: touch.clientY });
    onDragStart(bottle);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDragging) {
      e.preventDefault();
      const touch = e.touches[0];
      setDragPosition({ x: touch.clientX, y: touch.clientY });
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    if (isDragging) {
      setIsDragging(false);
      onDragEnd();
    }
  };

  const itemStyle = isDragging ? {
    position: 'fixed' as const,
    left: dragPosition.x - 32,
    top: dragPosition.y - 40,
    zIndex: 1000,
    transform: 'scale(1.1)',
    pointerEvents: 'none' as const
  } : {
    position: 'absolute' as const,
    left: `${bottle.x}px`,
    bottom: `${8 + (bottle.y || 0)}px`,
    transform: `translateX(-50%) rotate(${bottle.rotation || 0}deg)`,
    transition: bottle.x > 80 ? 'left 0.1s ease-out' : 'all 0.05s ease-out' // Smooth movement on belt, physics in pile
  };

  const renderItem = () => {
    switch (bottle.type) {
      case 'aluminum':
        return renderAluminumCan();
      case 'plastic':
        return renderPlasticBottle();
      case 'glass':
      default:
        return renderGlassBottle();
    }
  };

  return (
    <>
      <div
        className={`${getItemSize()} cursor-grab active:cursor-grabbing transition-all duration-200 hover:scale-105 ${isDragging ? 'opacity-90 rotate-3' : ''} ${bottle.x <= 80 ? 'drop-shadow-lg' : ''}`}
        style={itemStyle}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {renderItem()}
      </div>
      
      {/* Drag Layer for Mobile */}
      {isDragging && (
        <div
          className="fixed inset-0 z-50"
          style={{ touchAction: 'none' }}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        />
      )}
    </>
  );
};

export default BottleComponent;