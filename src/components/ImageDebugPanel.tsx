import React, { useState, useEffect } from 'react';
import { ImageManager } from '../utils/imageManager';
import { getImageStats, refreshImageCache } from '../utils/bottleGenerator';

interface ImageDebugPanelProps {
  isVisible: boolean;
  onToggle: () => void;
}

export const ImageDebugPanel: React.FC<ImageDebugPanelProps> = ({
  isVisible,
  onToggle
}) => {
  const [imageStats, setImageStats] = useState(getImageStats());
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      refreshImageCache();
      // Wait a bit for the cache to refresh
      setTimeout(() => {
        setImageStats(getImageStats());
        setIsRefreshing(false);
      }, 1000);
    } catch (error) {
      console.error('Failed to refresh image cache:', error);
      setIsRefreshing(false);
    }
  };

  const imageManager = ImageManager.getInstance();
  const availableImages = imageManager.getAvailableImages();

  if (!isVisible) {
    return (
      <button
        onClick={onToggle}
        className="fixed bottom-4 right-4 bg-blue-600 text-white p-2 rounded-full shadow-lg hover:bg-blue-700 transition z-50"
        title="Show Image Debug Panel"
      >
        🖼️
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg shadow-lg p-4 max-w-sm z-50">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold text-gray-800">Image Debug</h3>
        <button
          onClick={onToggle}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>

      <div className="space-y-2 mb-4">
        <div className="text-sm">
          <strong>Available Images:</strong>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>15c items: {imageStats['15c items']}</div>
          <div>25c items: {imageStats['25c items']}</div>
          <div>Glass white: {imageStats['Glass white']}</div>
          <div>Glass brown: {imageStats['Glass brown']}</div>
          <div>Glass green: {imageStats['Glass green']}</div>
          <div className="col-span-2 font-semibold">Total: {imageStats.total}</div>
        </div>
      </div>

      <button
        onClick={handleRefresh}
        disabled={isRefreshing}
        className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
      >
        {isRefreshing ? 'Refreshing...' : 'Refresh Images'}
      </button>

      <div className="mt-3 text-xs text-gray-600">
        <div className="mb-1"><strong>How to add images:</strong></div>
        <div>1. Add images to public/images/[category]/</div>
        <div>2. Click "Refresh Images"</div>
        <div>3. New images will appear in game</div>
      </div>

      <details className="mt-3">
        <summary className="text-xs text-gray-600 cursor-pointer">Show image paths</summary>
        <div className="mt-2 max-h-32 overflow-y-auto text-xs">
          {Object.entries(availableImages).map(([category, images]) => (
            <div key={category} className="mb-2">
              <div className="font-semibold">{category}:</div>
              {images.map((img, idx) => (
                <div key={idx} className="text-gray-600 truncate">
                  {img.split('/').pop()}
                </div>
              ))}
            </div>
          ))}
        </div>
      </details>
    </div>
  );
};

export default ImageDebugPanel;