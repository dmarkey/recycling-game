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
    
    // Debug: Log when vibration is attempted
    console.log('Attempting to vibrate for bin:', binType);

    // Phone vibration (if supported)
    if ('vibrate' in navigator) {
      console.log('navigator.vibrate is supported');
      navigator.vibrate(200); // Simpler vibration pattern for testing
    } else {
      console.log('navigator.vibrate is NOT supported');
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

  // No visual highlight for correct bin; all bins look the same
  const getHighlightClass = (_binType: string) => {
    return '';
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
            bin.type === 'drs' ? (
              <div
                key={bin.type}
                ref={el => { if (el) binsRef.current[index] = el; }}
                data-bin-type={bin.type}
                className={`bg-blue-800 border-4 border-blue-900 shadow-2xl cursor-pointer transition-all duration-300 hover:scale-105 ${getHighlightClass(bin.type)} relative flex flex-col items-center justify-start overflow-visible`}
                style={{
                  animation: vibratingBins.has(bin.type) ? 'vibrate 0.1s linear infinite' : 'none',
                  minHeight: '180px',
                  height: '180px',
                  borderRadius: '1.25rem', // less rounded, more rectangular
                  boxShadow: '0 6px 24px 0 rgba(30, 41, 59, 0.45)'
                }}
                onClick={() => {
                  if (draggedBottle) {
                    triggerVibration(bin.type);
                    onBottleDrop(draggedBottle, bin.type);
                  }
                }}
                onTouchEnd={() => {
                  if (draggedBottle) {
                    triggerVibration(bin.type);
                    onBottleDrop(draggedBottle, bin.type);
                  }
                }}
              >
                {/* Re-turn Logo Image */}
                <img
                  src="/images/re-turn-logo.png"
                  alt="Re-turn logo"
                  className="absolute top-4 left-1/2 transform -translate-x-1/2 w-10 h-10 object-contain z-10"
                  draggable={false}
                />
                {/* Bottle slot */}
                <div className="absolute top-16 left-1/2 transform -translate-x-1/2 w-16 h-16 bg-black rounded-full border-4 border-white flex items-center justify-center z-10 shadow-lg">
                  <div className="w-7 h-7 bg-gray-800 rounded-full border-2 border-gray-600" />
                </div>
                {/* Simple instruction */}
                <div className="absolute top-32 left-1/2 transform -translate-x-1/2 w-32 flex flex-col items-center z-10">
                  <span className="text-white text-xs font-semibold">Insert bottle/can</span>
                </div>
                {/* Bin identification number */}
                <div className="absolute bottom-2 right-3 text-xs text-white opacity-60 font-mono">
                  #{index + 1}
                </div>
                {/* Drop Zone Indicator removed: no visual prompt for correct bin */}
                {/* Processing Effect */}
                {vibratingBins.has(bin.type) && (
                  <>
                    <div className="absolute inset-0 bg-white bg-opacity-30 rounded-xl animate-pulse pointer-events-none" />
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
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
              </div>
            ) : (
              <div
                key={bin.type}
                ref={el => { if (el) binsRef.current[index] = el; }}
                data-bin-type={bin.type}
                className={`bg-gray-800 border-4 border-gray-900 shadow-2xl cursor-pointer transition-all duration-300 hover:scale-105 ${getHighlightClass(bin.type)} relative flex flex-col items-center justify-start overflow-visible rounded-3xl`}
                style={{
                  animation: vibratingBins.has(bin.type) ? 'vibrate 0.1s linear infinite' : 'none',
                  minHeight: '180px',
                  height: '180px',
                  borderRadius: '1.5rem'
                }}
                onClick={() => {
                  if (draggedBottle) {
                    triggerVibration(bin.type);
                    onBottleDrop(draggedBottle, bin.type);
                  }
                }}
                onTouchEnd={() => {
                  if (draggedBottle) {
                    triggerVibration(bin.type);
                    onBottleDrop(draggedBottle, bin.type);
                  }
                }}
              >
                {/* Colored front panel with circular hole */}
                <div className={`absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-24 ${bin.color} border-4 ${bin.color.split(' ').find(c => c.startsWith('border-')) || 'border-gray-900'} rounded-b-3xl flex flex-col items-center z-10`}>
                  {/* Circular hole */}
                  <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-black rounded-full border-4 border-gray-900 shadow-inner z-20" />
                  {/* Simple recycling logo */}
                  <div className="absolute top-[4.5rem] left-1/2 transform -translate-x-1/2 w-16 flex justify-center z-20">
                    <Recycle className="w-5 h-5 text-white drop-shadow" />
                  </div>
                </div>
                {/* Bin body shine */}
                <div className="absolute top-16 left-6 w-2 h-16 bg-white opacity-10 rounded-full blur-sm pointer-events-none" />
                {/* Side handles */}
                <div className="absolute left-0 top-16 w-2 h-8 bg-gray-700 rounded-r shadow-sm" />
                <div className="absolute right-0 top-16 w-2 h-8 bg-gray-700 rounded-l shadow-sm" />
                {/* Bottom rim */}
                <div className="absolute bottom-0 left-2 right-2 h-2 bg-gray-900 rounded-b-2xl shadow-inner" />
                {/* Bin identification number */}
                <div className="absolute bottom-2 right-3 text-xs text-white opacity-60 font-mono">
                  #{index + 1}
                </div>
                {/* Drop Zone Indicator removed: no visual prompt for correct bin */}
                {/* Processing Effect */}
                {vibratingBins.has(bin.type) && (
                  <>
                    <div className="absolute inset-0 bg-white bg-opacity-30 rounded-3xl animate-pulse pointer-events-none" />
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
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
              </div>
            )
          ))}
        </div>
      </div>

      {/* CSS Animation for Vibration Effect */}
      <style>{`
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