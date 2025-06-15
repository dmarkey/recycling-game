import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Bottle } from '../types/game';
import { ImageManager } from '../utils/imageManager';

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
  const dragPositionRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);
  const bottleRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);

  // Get ImageManager instance
  const imageManager = useMemo(() => ImageManager.getInstance(), []);

  // Memoize the selected image path for this bottle instance
  const selectedImagePath = useMemo(() => {
    return imageManager.getImageForBottle(
      bottle.type,
      bottle.subType,
      bottle.depositValue,
      bottle.color
    );
  }, [bottle.id, bottle.type, bottle.subType, bottle.color, bottle.depositValue, imageManager]);

  const getImagePath = (): string => {
    return selectedImagePath;
  };

  // Get responsive sizing based on bottle type
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

  // Handle image loading events
  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
    setImageError(false);
  }, []);

  const handleImageError = useCallback(() => {
    setImageError(true);
    setImageLoaded(false);
  }, []);

  // Optimized image rendering with hardware acceleration
  const renderBottleImage = () => {
    const imagePath = getImagePath();
    
    return (
      <img
        ref={imageRef}
        src={imagePath}
        alt={`${bottle.type} ${bottle.subType}`}
        className="w-full h-full object-contain select-none pointer-events-none"
        style={{
          transform: 'translateZ(0)',
          backfaceVisibility: 'hidden',
          perspective: '1000px',
          imageRendering: 'auto' as const,
          userSelect: 'none',
          WebkitUserSelect: 'none',
          MozUserSelect: 'none',
          msUserSelect: 'none'
        }}
        onLoad={handleImageLoad}
        onError={handleImageError}
        draggable={false}
      />
    );
  };

  // Fallback CSS rendering for when images fail to load
  const renderFallbackBottle = () => {
    const getSimpleStyle = () => {
      if (bottle.type === 'aluminum') {
        return 'bg-blue-500 border-2 border-blue-700 rounded-lg';
      } else if (bottle.type === 'plastic') {
        return 'bg-blue-200 border-2 border-blue-400 rounded-2xl';
      } else {
        // Glass
        const colorMap = {
          green: 'bg-green-500 border-green-700',
          brown: 'bg-amber-600 border-amber-800',
          clear: 'bg-gray-300 border-gray-500'
        };
        const colors = colorMap[bottle.color as keyof typeof colorMap] || colorMap.clear;
        return `${colors} border-2 rounded-2xl`;
      }
    };

    return (
      <div className={`w-full h-full ${getSimpleStyle()} flex items-center justify-center`}>
        <div className="text-xs font-bold text-white bg-black bg-opacity-50 px-1 rounded">
          {bottle.type.charAt(0).toUpperCase()}
          {bottle.depositValue && <div>{bottle.depositValue}¢</div>}
        </div>
      </div>
    );
  };

  // Directly update the bottle position for smooth dragging
  const updateBottlePosition = useCallback(() => {
    if (!bottleRef.current || !isDragging) return;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    
    rafRef.current = requestAnimationFrame(() => {
      if (!bottleRef.current) return;
      const { x, y } = dragPositionRef.current;
      
      // Use individual style properties to avoid CSS placeholder warnings
      const element = bottleRef.current;
      element.style.position = 'fixed';
      element.style.left = `${x - 32}px`;
      element.style.top = `${y - 40}px`;
      element.style.zIndex = '1000';
      element.style.transform = 'scale(1.1) translateZ(0)';
      element.style.pointerEvents = 'auto';
      element.style.willChange = 'transform';
      element.style.touchAction = 'none';
      element.style.transition = 'none';
    });
  }, [isDragging]);

  // Reset bottle style after drag ends
  const resetBottlePosition = useCallback(() => {
    if (!bottleRef.current) return;
    bottleRef.current.removeAttribute('style');
  }, []);

  // Event handlers for drag and drop
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    dragPositionRef.current = { x: e.clientX, y: e.clientY };
    updateBottlePosition();
    onDragStart(bottle);
  }, [bottle, onDragStart, updateBottlePosition]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging) {
      dragPositionRef.current = { x: e.clientX, y: e.clientY };
      updateBottlePosition();
    }
  }, [isDragging, updateBottlePosition]);

  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      resetBottlePosition();
      onDragEnd();
    }
  }, [isDragging, onDragEnd, resetBottlePosition]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    setIsDragging(true);
    dragPositionRef.current = { x: touch.clientX, y: touch.clientY };
    updateBottlePosition();
    onDragStart(bottle);
  }, [bottle, onDragStart, updateBottlePosition]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (isDragging) {
      e.preventDefault();
      const touch = e.touches[0];
      dragPositionRef.current = { x: touch.clientX, y: touch.clientY };
      updateBottlePosition();
    }
  }, [isDragging, updateBottlePosition]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    if (isDragging) {
      setIsDragging(false);
      resetBottlePosition();
      onDragEnd();
    }
  }, [isDragging, onDragEnd, resetBottlePosition]);

  // Optimized styling with hardware acceleration
  const itemStyle = !isDragging ? {
      position: 'absolute' as const,
      left: `${bottle.x}px`,
      bottom: `${8 + (bottle.y || 0)}px`,
      transform: `translateX(-50%) rotate(${bottle.rotation || 0}deg) translateZ(0)`,
      transition: bottle.x > 80 ? 'left 0.1s ease-out' : 'all 0.05s ease-out',
      willChange: bottle.x <= 80 ? 'transform' : 'auto',
      touchAction: 'none' as const
    } : undefined;

  // Main render function - chooses between image and fallback
  const renderItem = () => {
    if (imageError) {
      return renderFallbackBottle();
    } else {
      return renderBottleImage();
    }
  };

  // Clean up RAF on unmount
  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <>
      <div
        ref={bottleRef}
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
        
        {/* Loading indicator for images */}
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded">
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
        
        {/* Error indicator */}
        {imageError && (
          <div className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
            !
          </div>
        )}
      </div>
      
      {/* Drag Layer for Mobile */}
      {isDragging && (
        <div
          className="fixed inset-0 z-40"
          style={{ touchAction: 'none', pointerEvents: 'auto' }}
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