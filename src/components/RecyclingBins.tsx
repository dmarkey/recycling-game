import React, { useRef, useEffect, useState } from 'react';
import { Bottle } from '../types/game';
import { Recycle } from 'lucide-react';

interface RecyclingBinsProps {
  onBottleDrop: (bottle: Bottle, binType: string) => void;
  draggedBottle: Bottle | null;
}

const RecyclingBins: React.FC<RecyclingBinsProps> = ({
  onBottleDrop,
  draggedBottle
}) => {
  const binsRef = useRef<HTMLDivElement[]>([]);
  const [vibratingBins, setVibratingBins] = useState<Set<string>>(new Set());

  // Vibration effect when bottle is processed
  const triggerVibration = (binType: string) => {
    // Add visual vibration
    setVibratingBins(prev => new Set(prev).add(binType));
    
    // Phone vibration (if supported)
    if ('vibrate' in navigator) {
      navigator.vibrate([100, 50, 100]); // Short vibration pattern
    }
    
    // Remove visual vibration after animation
    setTimeout(() => {
      setVibratingBins(prev => {
        const newSet = new Set(prev);
        newSet.delete(binType);
        return newSet;
      });
    }, 600);
  };

  useEffect(() => {
    const handleMouseUp = (e: MouseEvent) => {
      if (draggedBottle) {
        // Check if mouse is over any bin
        const element = document.elementFromPoint(e.clientX, e.clientY);
        const binElement = element?.closest('[data-bin-type]') as HTMLElement;
        
        if (binElement) {
          const binType = binElement.getAttribute('data-bin-type');
          if (binType) {
            triggerVibration(binType);
            onBottleDrop(draggedBottle, binType);
          }
        }
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (draggedBottle && e.changedTouches.length > 0) {
        const touch = e.changedTouches[0];
        const element = document.elementFromPoint(touch.clientX, touch.clientY);
        const binElement = element?.closest('[data-bin-type]') as HTMLElement;
        
        if (binElement) {
          const binType = binElement.getAttribute('data-bin-type');
          if (binType) {
            triggerVibration(binType);
            onBottleDrop(draggedBottle, binType);
          }
        }
      }
    };

    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [draggedBottle, onBottleDrop]);

  const bins = [
    {
      type: 'drs',
      label: 'DRS',
      shortLabel: 'DRS',
      color: 'bg-gradient-to-b from-blue-500 to-blue-700 border-blue-800',
      textColor: 'text-white',
      icon: '♻️',
      accentColor: 'bg-blue-600'
    },
    {
      type: 'green',
      label: 'Green',
      shortLabel: 'Green',
      color: 'bg-gradient-to-b from-green-500 to-green-700 border-green-800',
      textColor: 'text-white',
      icon: '🍾',
      accentColor: 'bg-green-600'
    },
    {
      type: 'clear',
      label: 'Clear',
      shortLabel: 'Clear',
      color: 'bg-gradient-to-b from-gray-300 to-gray-500 border-gray-600',
      textColor: 'text-gray-800',
      icon: '🍾',
      accentColor: 'bg-gray-400'
    },
    {
      type: 'brown',
      label: 'Brown',
      shortLabel: 'Brown',
      color: 'bg-gradient-to-b from-amber-600 to-amber-800 border-amber-900',
      textColor: 'text-white',
      icon: '🍾',
      accentColor: 'bg-amber-700'
    }
  ];

  const getHighlightClass = (binType: string) => {
    if (!draggedBottle) return '';
    
    const isCorrectBin = (
      ((draggedBottle.type === 'plastic' || draggedBottle.type === 'aluminum') && binType === 'drs') ||
      (draggedBottle.type === 'glass' && binType === draggedBottle.color)
    );
    
    return isCorrectBin ? 'ring-4 ring-yellow-400 ring-opacity-75 animate-pulse scale-105' : 'opacity-60 scale-95';
  };

  // All bins now have round holes - including DRS
  const renderHole = () => {
    return (
      <div className="absolute top-16 left-1/2 transform -translate-x-1/2 w-14 h-14 bg-black rounded-full shadow-inner border-3 border-gray-900">
        {/* Inner shadow for depth */}
        <div className="absolute inset-1 bg-gradient-to-br from-gray-800 to-black rounded-full" />
        {/* Highlight on edge */}
        <div className="absolute top-1 left-2 w-2 h-2 bg-gray-600 rounded-full opacity-60" />
      </div>
    );
  };

  return (
    <>
      {/* MOBILE-OPTIMIZED GRID LAYOUT */}
      <div className="w-full h-full p-4">
        {/* 2x2 Grid for mobile - easier to reach */}
        <div className="grid grid-cols-2 gap-6 h-full max-w-md mx-auto">
          {bins.map((bin, index) => (
            <div
              key={bin.type}
              ref={el => { if (el) binsRef.current[index] = el; }}
              data-bin-type={bin.type}
              className={`${bin.color} border-3 rounded-3xl shadow-xl cursor-pointer transition-all duration-300 hover:scale-105 ${getHighlightClass(bin.type)} relative overflow-visible flex flex-col`}
              style={{
                animation: vibratingBins.has(bin.type) ? 'vibrate 0.1s linear infinite' : 'none',
                minHeight: '140px'
              }}
            >
              {/* Bin Top Section with Logo - Better spacing for mobile */}
              <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-24 h-12 bg-white bg-opacity-95 rounded-xl border-2 border-gray-300 flex flex-col items-center justify-center shadow-md">
                <div className="text-lg mb-0.5">{bin.icon}</div>
                <div className="text-xs font-bold text-gray-800 leading-tight text-center px-1">
                  {bin.shortLabel}
                </div>
              </div>

              {/* Round Hole for ALL bins - Better positioned */}
              {renderHole()}

              {/* Main Body Content - Better spacing */}
              <div className="flex-1 flex items-end justify-center pb-3">
                {/* Small recycling symbol */}
                <div className="p-2 bg-white bg-opacity-20 rounded-full">
                  <Recycle className={`w-4 h-4 ${bin.textColor.replace('text-', 'text-').replace('gray-800', 'gray-700')} drop-shadow-sm`} />
                </div>
              </div>

              {/* Drop Zone Indicator - Mobile optimized */}
              {draggedBottle && getHighlightClass(bin.type).includes('ring-4') && (
                <>
                  <div className="absolute inset-0 bg-yellow-200 bg-opacity-40 rounded-3xl animate-pulse pointer-events-none" />
                  <div className="absolute inset-2 border-2 border-dashed border-yellow-400 rounded-2xl animate-pulse pointer-events-none" />
                </>
              )}

              {/* Processing Effect - Mobile optimized */}
              {vibratingBins.has(bin.type) && (
                <>
                  <div className="absolute inset-0 bg-white bg-opacity-30 rounded-3xl animate-pulse pointer-events-none" />
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                    {/* Processing particles - Fewer for mobile */}
                    {[...Array(4)].map((_, i) => (
                      <div
                        key={i}
                        className="absolute w-2 h-2 bg-yellow-400 rounded-full animate-ping"
                        style={{
                          left: `${Math.cos(i * Math.PI / 2) * 15}px`,
                          top: `${Math.sin(i * Math.PI / 2) * 15}px`,
                          animationDelay: `${i * 100}ms`,
                          animationDuration: '600ms'
                        }}
                      />
                    ))}
                  </div>
                </>
              )}

              {/* Minimal realistic features for mobile */}
              {/* Side handles - Better positioned */}
              <div className="absolute left-0 top-12 w-1.5 h-6 bg-gray-700 rounded-r shadow-sm" />
              <div className="absolute right-0 top-12 w-1.5 h-6 bg-gray-700 rounded-l shadow-sm" />
              
              {/* Bottom rim - Better proportions */}
              <div className="absolute bottom-0 left-2 right-2 h-1.5 bg-gray-800 rounded-b-2xl shadow-inner" />
              
              {/* Subtle shine effect - Better positioned */}
              <div className="absolute top-12 left-3 w-1.5 h-16 bg-white opacity-15 rounded-full blur-sm pointer-events-none" />
              
              {/* Bin identification number - Better positioned */}
              <div className="absolute bottom-2 right-3 text-xs text-white opacity-60 font-mono">
                #{index + 1}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CSS Animation for Vibration Effect */}
      <style jsx>{`
        @keyframes vibrate {
          0% { transform: translate(0, 0) rotate(0deg); }
          10% { transform: translate(-1px, -1px) rotate(-0.5deg); }
          20% { transform: translate(1px, -1px) rotate(0.5deg); }
          30% { transform: translate(-1px, 1px) rotate(-0.5deg); }
          40% { transform: translate(1px, 1px) rotate(0.5deg); }
          50% { transform: translate(-1px, -1px) rotate(-0.5deg); }
          60% { transform: translate(1px, -1px) rotate(0.5deg); }
          70% { transform: translate(-1px, 1px) rotate(-0.5deg); }
          80% { transform: translate(1px, 1px) rotate(0.5deg); }
          90% { transform: translate(-1px, -1px) rotate(-0.5deg); }
          100% { transform: translate(0, 0) rotate(0deg); }
        }
      `}</style>
    </>
  );
};

export default RecyclingBins;