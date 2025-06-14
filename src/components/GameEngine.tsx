import React, { useState, useEffect, useCallback, useRef } from 'react';
import ConveyorBelt from './ConveyorBelt';
import RecyclingBins from './RecyclingBins';
import ScoreDisplay from './ScoreDisplay';
import GameOverScreen from './GameOverScreen';
import { Bottle, GameState } from '../types/game';
import { generateBottle } from '../utils/bottleGenerator';
import { soundEffects } from '../utils/soundEffects';

const GameEngine: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    level: 1, // Keep for internal tracking but don't display
    isPlaying: true,
    bottles: [],
    conveyorSpeed: 1,
    nextBottleId: 0
  });

  const [draggedBottle, setDraggedBottle] = useState<Bottle | null>(null);
  const [crushingBottles, setCrushingBottles] = useState<Set<number>>(new Set());
  const [errorEffects, setErrorEffects] = useState<Array<{id: number, x: number, y: number}>>([]);
  const [speedUpCelebration, setSpeedUpCelebration] = useState<{active: boolean, newSpeed: number, milestone: number} | null>(null);
  const gameLoopRef = useRef<number>();
  const physicsLoopRef = useRef<number>();
  const lastBottleSpawnRef = useRef<number>(0);
  const lastSpeedTierRef = useRef<number>(0); // Track previous speed tier

  const spawnBottle = useCallback(() => {
    const now = Date.now();
    // Consistent bottle generation regardless of speed
    const spawnInterval = 2500;
    
    if (now - lastBottleSpawnRef.current > spawnInterval) {
      const newBottle = generateBottle(gameState.nextBottleId);
      setGameState(prev => ({
        ...prev,
        bottles: [...prev.bottles, newBottle],
        nextBottleId: prev.nextBottleId + 1
      }));
      lastBottleSpawnRef.current = now;
    }
  }, [gameState.nextBottleId]);

  // Physics simulation for bottles on the conveyor belt
  const updatePhysics = useCallback(() => {
    setGameState(prev => {
      const WALL_POSITION = 50; // Position of the left wall
      
      const updatedBottles = prev.bottles.map(bottle => {
        // Only apply physics to bottles that have stopped moving on the belt
        if (bottle.isSettled || !bottle.velocity) return bottle;
        
        // Very gentle physics constants
        const gravity = 0.08; // Weak gravity for gentle settling
        const friction = 0.92; // High friction to slow things down
        const bounce = 0.05; // Very little bounce
        const groundLevel = 0; // Belt surface level
        
        // Current velocity
        let currentVelX = bottle.velocity.x;
        let currentVelY = bottle.velocity.y;
        
        // Apply gentle gravity only if above ground
        if (bottle.y > groundLevel) {
          currentVelY += gravity;
        }
        
        // Apply friction
        currentVelX *= friction;
        currentVelY *= friction;
        
        // Update position
        let newX = bottle.x + currentVelX;
        let newY = Math.max(groundLevel, bottle.y + currentVelY);
        let newRotation = (bottle.rotation || 0) + currentVelX * 0.01; // Very gentle rotation
        
        // Ground collision - bottles settle on the belt
        if (newY <= groundLevel && currentVelY < 0) {
          newY = groundLevel;
          currentVelY = Math.abs(currentVelY) * bounce;
        }
        
        // WALL COLLISION - bottles hit the left wall and bounce back
        if (newX < WALL_POSITION) {
          newX = WALL_POSITION;
          currentVelX = Math.abs(currentVelX) * 0.3; // Bounce back from wall
          newRotation += (Math.random() - 0.5) * 5; // Random tilt from wall impact
        }
        
        // Keep bottles on the conveyor belt (don't let them fall off the right side)
        if (newX > window.innerWidth - 20) {
          newX = window.innerWidth - 20;
          currentVelX = -Math.abs(currentVelX) * 0.3;
        }
        
        // Gentle collision with other bottles
        const otherBottles = prev.bottles.filter(b => b.id !== bottle.id);
        for (const other of otherBottles) {
          const dx = newX - other.x;
          const dy = newY - (other.y || 0);
          const distance = Math.sqrt(dx * dx + dy * dy);
          const minDistance = 35; // Minimum distance between bottles
          
          if (distance < minDistance && distance > 0) {
            // Very gentle push apart
            const pushForce = (minDistance - distance) * 0.03;
            const pushX = (dx / distance) * pushForce;
            const pushY = (dy / distance) * pushForce;
            
            newX += pushX;
            newY = Math.max(groundLevel, newY + pushY);
            
            // Small velocity changes from collision
            currentVelX += pushX * 0.15;
            currentVelY += pushY * 0.15;
            
            // Don't let bottles push each other through the wall
            if (newX < WALL_POSITION) {
              newX = WALL_POSITION;
              currentVelX = Math.abs(currentVelX) * 0.2;
            }
          }
        }
        
        // Check if bottle has settled (very lenient)
        const isSettled = Math.abs(currentVelX) < 0.05 && Math.abs(currentVelY) < 0.05 && newY <= groundLevel + 1;
        
        return {
          ...bottle,
          x: newX,
          y: newY,
          rotation: newRotation,
          velocity: { x: currentVelX, y: currentVelY },
          isSettled
        };
      });
      
      return {
        ...prev,
        bottles: updatedBottles
      };
    });
  }, []);

  const updateBottlePositions = useCallback(() => {
    setGameState(prev => {
      const WALL_POSITION = 50; // Position of the left wall
      
      const updatedBottles = prev.bottles.map(bottle => {
        // Check if there's a bottle blocking this one from moving
        const bottlesAhead = prev.bottles.filter(b => 
          b.id !== bottle.id && 
          Math.abs(b.x - bottle.x) < 40 && // Close horizontally
          b.x < bottle.x // Ahead of current bottle
        );
        
        // If there are bottles blocking, start physics simulation
        if (bottlesAhead.length > 0) {
          // Stop the bottle and give it slight physics
          return {
            ...bottle,
            velocity: {
              x: -0.3, // Small backward push from collision
              y: 0
            },
            rotation: (Math.random() - 0.5) * 4, // Small random tilt
            isSettled: false
          };
        }
        
        // Normal conveyor movement if no obstruction
        const newX = bottle.x - prev.conveyorSpeed * 1.5;
        
        // Check if bottle hits the wall - start physics simulation
        if (newX <= WALL_POSITION) {
          return {
            ...bottle,
            x: WALL_POSITION,
            velocity: {
              x: 0.2, // Small bounce back from wall
              y: 0
            },
            rotation: (Math.random() - 0.5) * 6, // Random tilt from wall impact
            isSettled: false
          };
        }
        
        return {
          ...bottle,
          x: newX
        };
      });
      
      // Check for game over condition - too many bottles piled up
      const bottlesAtWall = updatedBottles.filter(bottle => bottle.x <= 80).length;
      const bottlesWithPhysics = updatedBottles.filter(bottle => bottle.velocity && !bottle.isSettled).length;
      
      // Game over if too many bottles are backed up
      if ((bottlesAtWall > 8 || bottlesWithPhysics > 12) && prev.isPlaying) {
        console.log('Game over - too many bottles backed up!');
        soundEffects.playError();
        return {
          ...prev,
          bottles: updatedBottles,
          isPlaying: false
        };
      }
      
      return {
        ...prev,
        bottles: updatedBottles
      };
    });
  }, []);

  const gameLoop = useCallback(() => {
    if (gameState.isPlaying) {
      spawnBottle();
      updateBottlePositions();
      
      setGameState(prev => {
        // Speed increases every 5 euros (€5, €10, €15, etc.)
        const speedTier = Math.floor(prev.score / 5);
        const newSpeed = Math.min(1 + (speedTier * 0.2), 3.0); // Cap at 3x speed
        
        // Check if we've reached a new speed tier
        if (speedTier > lastSpeedTierRef.current && speedTier > 0) {
          console.log('SPEED UP! New tier:', speedTier, 'New speed:', newSpeed);
          
          // Trigger celebration
          setSpeedUpCelebration({
            active: true,
            newSpeed: newSpeed,
            milestone: speedTier * 5
          });
          
          // Play celebration sound
          soundEffects.playSpeedUp();
          
          // Phone vibration for celebration
          if ('vibrate' in navigator) {
            navigator.vibrate([200, 100, 200, 100, 300]); // Celebration pattern
          }
          
          // Remove celebration after animation
          setTimeout(() => {
            setSpeedUpCelebration(null);
          }, 3000);
          
          lastSpeedTierRef.current = speedTier;
        }
        
        return {
          ...prev,
          conveyorSpeed: newSpeed
        };
      });
    }
  }, [gameState.isPlaying, spawnBottle, updateBottlePositions]);

  // Physics loop for smooth bottle collision animation
  useEffect(() => {
    if (gameState.isPlaying) {
      physicsLoopRef.current = setInterval(updatePhysics, 50);
    } else {
      if (physicsLoopRef.current) {
        clearInterval(physicsLoopRef.current);
      }
    }

    return () => {
      if (physicsLoopRef.current) {
        clearInterval(physicsLoopRef.current);
      }
    };
  }, [updatePhysics, gameState.isPlaying]);

  // Main game loop
  useEffect(() => {
    if (gameState.isPlaying) {
      gameLoopRef.current = setInterval(gameLoop, 60);
    } else {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    }

    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    };
  }, [gameLoop, gameState.isPlaying]);

  const createCrushEffect = (bottle: Bottle) => {
    setCrushingBottles(prev => new Set(prev).add(bottle.id));
    
    // Remove the crushing effect after animation
    setTimeout(() => {
      setCrushingBottles(prev => {
        const newSet = new Set(prev);
        newSet.delete(bottle.id);
        return newSet;
      });
    }, 600);
  };

  const createErrorEffect = (x: number, y: number) => {
    const errorId = Date.now() + Math.random();
    setErrorEffects(prev => [...prev, { id: errorId, x, y }]);
    
    // Remove error effect after animation
    setTimeout(() => {
      setErrorEffects(prev => prev.filter(effect => effect.id !== errorId));
    }, 1000);
  };

  const handleBottleDrop = useCallback((bottle: Bottle, binType: string) => {
    console.log('Bottle dropped:', bottle.type, bottle.subType, bottle.color, bottle.depositValue, 'into bin:', binType);
    
    const isCorrectBin = (
      ((bottle.type === 'plastic' || bottle.type === 'aluminum') && binType === 'drs') ||
      (bottle.type === 'glass' && binType === bottle.color)
    );

    if (isCorrectBin) {
      // Create visual crushing effect
      createCrushEffect(bottle);
      
      // Play appropriate sound effect
      if (bottle.type === 'glass') {
        soundEffects.playGlassBreak();
      } else if (bottle.type === 'aluminum') {
        soundEffects.playCanCrush();
      } else if (bottle.type === 'plastic') {
        soundEffects.playPlasticCrush();
      }
      
      // Play success sound after a short delay
      setTimeout(() => {
        soundEffects.playSuccess();
      }, 200);

      // Remove bottle and add score - GLASS BOTTLES WORTH NOTHING
      setGameState(prev => {
        let scoreToAdd = 0;
        
        // Only DRS items (plastic and aluminum) give money
        if (bottle.type === 'plastic' || bottle.type === 'aluminum') {
          // Convert cents to euros (15¢ = €0.15, 25¢ = €0.25)
          scoreToAdd = (bottle.depositValue || 0) / 100;
        }
        // Glass bottles give 0 euros
        
        console.log('Correct sorting! Adding €', scoreToAdd.toFixed(2));
        
        return {
          ...prev,
          bottles: prev.bottles.filter(b => b.id !== bottle.id),
          score: prev.score + scoreToAdd
        };
      });
    } else {
      // Wrong bin - deduct points and create error effect
      console.log('Incorrect sorting - deducting points');
      soundEffects.playError();
      
      // Create error effect at center of screen
      createErrorEffect(window.innerWidth / 2, window.innerHeight / 2);
      
      setGameState(prev => {
        // Deduct €0.50 for wrong sorting
        const pointsToDeduct = 0.5;
        const newScore = Math.max(0, prev.score - pointsToDeduct);
        
        return {
          ...prev,
          bottles: prev.bottles.filter(b => b.id !== bottle.id),
          score: newScore
        };
      });
    }
    
    setDraggedBottle(null);
  }, []);

  const restartGame = () => {
    setGameState({
      score: 0,
      level: 1,
      isPlaying: true,
      bottles: [],
      conveyorSpeed: 1,
      nextBottleId: 0
    });
    setDraggedBottle(null);
    setCrushingBottles(new Set());
    setErrorEffects([]);
    setSpeedUpCelebration(null);
    lastBottleSpawnRef.current = 0;
    lastSpeedTierRef.current = 0;
  };

  const handleDragStart = useCallback((bottle: Bottle) => {
    console.log('Drag started for bottle:', bottle.id, bottle.type);
    setDraggedBottle(bottle);
  }, []);

  const handleDragEnd = useCallback(() => {
    console.log('Drag ended');
  }, []);

  // Count bottles that are backing up on the belt
  const backlogBottles = gameState.bottles.filter(bottle => bottle.x <= 80).length;
  const physicsBottles = gameState.bottles.filter(bottle => bottle.velocity && !bottle.isSettled).length;

  // Calculate current speed tier for display
  const speedTier = Math.floor(gameState.score / 5);
  const nextSpeedAt = (speedTier + 1) * 5;

  return (
    <div className="w-full h-screen bg-gradient-to-b from-sky-200 to-green-100 overflow-hidden relative flex flex-col">
      {/* MOBILE-OPTIMIZED HEADER - Compact and clean */}
      <div className="flex-shrink-0 bg-white bg-opacity-90 shadow-sm p-3">
        <div className="flex justify-between items-center">
          {/* Left: Game Title - Smaller for mobile */}
          <h1 className="text-lg font-bold text-green-800 flex items-center gap-1">
            🇮🇪 Ireland Recycles
          </h1>
          
          {/* Right: Score and Speed - Stacked vertically for mobile */}
          <div className="flex flex-col items-end gap-1">
            <ScoreDisplay score={gameState.score} conveyorSpeed={gameState.conveyorSpeed} />
            
            {/* Speed Progress - Compact mobile version */}
            <div className="bg-blue-50 border border-blue-300 rounded-md px-2 py-1 flex items-center gap-1">
              <div className="text-blue-600 text-sm">🏃‍♂️</div>
              <div className="text-xs text-blue-700">
                <span className="font-semibold">Next: €{nextSpeedAt}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Warning indicators - Full width on mobile */}
        {backlogBottles > 5 && (
          <div className="mt-2 bg-orange-100 border border-orange-400 rounded-lg px-3 py-2 flex items-center justify-center gap-2">
            <div className="text-orange-600 font-bold">⚠️</div>
            <div className="text-sm text-orange-700 font-semibold">
              Pile Up: {backlogBottles} bottles
            </div>
            {backlogBottles > 8 && (
              <div className="text-red-600 font-bold animate-pulse">🚨 CRITICAL!</div>
            )}
          </div>
        )}
      </div>

      {/* MAIN GAME AREA - Flexible height */}
      <div className="flex-1 relative">
        {/* Recycling Bins - Positioned in upper portion for easy reach */}
        <div className="absolute top-4 left-0 right-0 h-64">
          <RecyclingBins 
            onBottleDrop={handleBottleDrop}
            draggedBottle={draggedBottle}
          />
        </div>
      </div>

      {/* CONVEYOR BELT - Fixed at bottom with proper height */}
      <div className="flex-shrink-0 h-32">
        <ConveyorBelt 
          bottles={gameState.bottles}
          conveyorSpeed={gameState.conveyorSpeed}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          isPlaying={gameState.isPlaying}
        />
      </div>

      {/* SPEED UP CELEBRATION - Mobile optimized */}
      {speedUpCelebration && (
        <div className="fixed inset-0 z-50 pointer-events-none">
          {/* Background Flash */}
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 opacity-30 animate-pulse" />
          
          {/* Fireworks/Particles - Fewer for mobile performance */}
          <div className="absolute inset-0">
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="absolute w-3 h-3 rounded-full animate-ping"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  backgroundColor: ['#FFD700', '#FF6B35', '#F7931E', '#FFB347', '#FF69B4'][Math.floor(Math.random() * 5)],
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${1 + Math.random() * 2}s`
                }}
              />
            ))}
          </div>
          
          {/* Central Celebration Message - Mobile sized */}
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="bg-white bg-opacity-95 rounded-2xl p-6 shadow-2xl border-4 border-yellow-400 text-center animate-bounce max-w-sm w-full">
              <div className="text-4xl mb-3 animate-spin">🚀</div>
              <div className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 via-orange-600 to-red-600 mb-2">
                SPEED UP!
              </div>
              <div className="text-lg font-bold text-green-800 mb-2">
                {speedUpCelebration.newSpeed.toFixed(1)}x Speed!
              </div>
              <div className="text-sm text-gray-700">
                €{speedUpCelebration.milestone} Milestone! 🎉
              </div>
              
              {/* Progress Bar Animation - Mobile sized */}
              <div className="mt-3 w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-green-400 to-blue-500 rounded-full animate-pulse"
                  style={{ width: `${Math.min((speedUpCelebration.newSpeed - 1) / 2 * 100, 100)}%` }}
                />
              </div>
            </div>
          </div>
          
          {/* Corner Celebrations - Smaller for mobile */}
          <div className="absolute top-4 left-4 text-3xl animate-bounce" style={{ animationDelay: '0.2s' }}>🎊</div>
          <div className="absolute top-4 right-4 text-3xl animate-bounce" style={{ animationDelay: '0.4s' }}>🎉</div>
          <div className="absolute bottom-20 left-4 text-3xl animate-bounce" style={{ animationDelay: '0.6s' }}>✨</div>
          <div className="absolute bottom-20 right-4 text-3xl animate-bounce" style={{ animationDelay: '0.8s' }}>🌟</div>
        </div>
      )}

      {/* Crushing Effects - Mobile positioned */}
      {Array.from(crushingBottles).map(bottleId => (
        <div
          key={`crush-${bottleId}`}
          className="fixed pointer-events-none z-50"
          style={{
            left: '50%',
            top: '30%',
            transform: 'translate(-50%, -50%)'
          }}
        >
          {/* Particle effect - Smaller for mobile */}
          <div className="relative">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-green-400 rounded-full animate-ping"
                style={{
                  left: `${Math.cos(i * Math.PI / 3) * 20}px`,
                  top: `${Math.sin(i * Math.PI / 3) * 20}px`,
                  animationDelay: `${i * 50}ms`,
                  animationDuration: '600ms'
                }}
              />
            ))}
            <div className="w-6 h-6 bg-green-500 rounded-full animate-pulse opacity-80" />
          </div>
        </div>
      ))}

      {/* Error Effects - Mobile positioned */}
      {errorEffects.map(effect => (
        <div
          key={`error-${effect.id}`}
          className="fixed pointer-events-none z-50"
          style={{
            left: `${effect.x}px`,
            top: `${effect.y}px`,
            transform: 'translate(-50%, -50%)'
          }}
        >
          <div className="relative">
            <div className="text-3xl font-bold text-red-600 animate-bounce">-€0.50</div>
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-red-500 rounded-full animate-ping"
                style={{
                  left: `${Math.cos(i * Math.PI / 2) * 15}px`,
                  top: `${Math.sin(i * Math.PI / 2) * 15}px`,
                  animationDelay: `${i * 100}ms`,
                  animationDuration: '800ms'
                }}
              />
            ))}
          </div>
        </div>
      ))}

      {/* Game Over Screen */}
      {!gameState.isPlaying && (
        <GameOverScreen 
          score={gameState.score}
          level={gameState.level}
          onRestart={restartGame}
        />
      )}
    </div>
  );
};

export default GameEngine;