import React, { useState, useEffect, useRef } from 'react';
import { Bottle } from '../types/game';

interface BottleComponentProps {
  bottle: Bottle;
  onDragStart: (bottle: Bottle) => void;
  onDragEnd: () => void;
}

// Performance monitoring utilities
const performanceLogger = {
  renderStart: 0,
  renderCount: 0,
  totalRenderTime: 0,
  
  startRender() {
    this.renderStart = performance.now();
  },
  
  endRender() {
    const renderTime = performance.now() - this.renderStart;
    this.renderCount++;
    this.totalRenderTime += renderTime;
    
    // Log every 100 renders to avoid spam
    if (this.renderCount % 100 === 0) {
      console.log(`[RENDER PERFORMANCE] Avg render time: ${(this.totalRenderTime / this.renderCount).toFixed(2)}ms over ${this.renderCount} renders`);
    }
  }
};

const BottleComponent: React.FC<BottleComponentProps> = ({
  bottle,
  onDragStart,
  onDragEnd
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);

  // Start performance monitoring
  useEffect(() => {
    performanceLogger.startRender();
    return () => {
      performanceLogger.endRender();
    };
  });

  // Get the appropriate image path based on bottle properties
  const getImagePath = (): string => {
    console.log(`[IMAGE MAPPING] Bottle type: ${bottle.type}, subType: ${bottle.subType}, color: ${bottle.color}, depositValue: ${bottle.depositValue}`);
    
    if (bottle.type === 'aluminum' && bottle.subType === 'can') {
      return '/images/beer-can-15c.png';
    }
    
    if (bottle.type === 'plastic' && bottle.subType === 'bottle') {
      if (bottle.depositValue === 15) {
        return '/images/plastic-bottle-15c.png';
      } else if (bottle.depositValue === 25) {
        return '/images/plastic-bottle-25c.png';
      }
      // Fallback to 15c for any other plastic bottle
      return '/images/plastic-bottle-15c.png';
    }
    
    if (bottle.type === 'glass' && bottle.subType === 'bottle') {
      switch (bottle.color) {
        case 'green':
          return '/images/glass-bottle-green.png';
        case 'brown':
          return '/images/glass-bottle-brown.png';
        case 'clear':
        default:
          return '/images/glass-bottle-white.png';
      }
    }
    
    // Fallback - should never happen
    console.warn(`[IMAGE MAPPING] No image found for bottle: ${bottle.type}/${bottle.subType}/${bottle.color}/${bottle.depositValue}`);
    return '/images/plastic-bottle-15c.png';
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
  const handleImageLoad = () => {
    setImageLoaded(true);
    setImageError(false);
    console.log(`[IMAGE LOAD] Successfully loaded: ${getImagePath()}`);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(false);
    console.error(`[IMAGE ERROR] Failed to load: ${getImagePath()}`);
  };

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
          // Enable hardware acceleration
          transform: 'translateZ(0)',
          backfaceVisibility: 'hidden',
          perspective: '1000px',
          // Optimize image rendering
          imageRendering: 'auto' as const,
          // Prevent image dragging
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
    console.log(`[FALLBACK RENDER] Using CSS fallback for ${bottle.type}`);
    
    // Simplified fallback - much lighter than original CSS
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

  // Event handlers for drag and drop
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragPosition({ x: e.clientX, y: e.clientY });
    onDragStart(bottle);
    console.log(`[DRAG START] Bottle ${bottle.id} (${bottle.type}) drag started`);
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
      console.log(`[DRAG END] Bottle ${bottle.id} (${bottle.type}) drag ended`);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    setIsDragging(true);
    setDragPosition({ x: touch.clientX, y: touch.clientY });
    onDragStart(bottle);
    console.log(`[TOUCH START] Bottle ${bottle.id} (${bottle.type}) touch started`);
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
      console.log(`[TOUCH END] Bottle ${bottle.id} (${bottle.type}) touch ended`);
    }
  };

  // Optimized styling with hardware acceleration
  const itemStyle = isDragging ? {
    position: 'fixed' as const,
    left: dragPosition.x - 32,
    top: dragPosition.y - 40,
    zIndex: 1000,
    transform: 'scale(1.1) translateZ(0)', // Hardware acceleration
    pointerEvents: 'none' as const,
    willChange: 'transform' // Optimize for animations
  } : {
    position: 'absolute' as const,
    left: `${bottle.x}px`,
    bottom: `${8 + (bottle.y || 0)}px`,
    transform: `translateX(-50%) rotate(${bottle.rotation || 0}deg) translateZ(0)`, // Hardware acceleration
    transition: bottle.x > 80 ? 'left 0.1s ease-out' : 'all 0.05s ease-out',
    willChange: bottle.x <= 80 ? 'transform' : 'auto' // Optimize physics bottles
  };

  // Main render function - chooses between image and fallback
  const renderItem = () => {
    // Always try to render the image first, fallback only if there's an error
    if (imageError) {
      return renderFallbackBottle();
    } else {
      return renderBottleImage();
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