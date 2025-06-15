import { Bottle, BottleType } from '../types/game';
import { ImageManager } from './imageManager';

export const generateBottle = (id: number): Bottle => {
  const itemType = Math.random();
  const imageManager = ImageManager.getInstance();
  
  if (itemType < 0.4) {
    // DRS Plastic bottles (40% chance)
    const depositValues = [15, 25]; // Common DRS bottle values in Ireland
    const depositValue = depositValues[Math.floor(Math.random() * depositValues.length)];
    
    return {
      id,
      type: 'plastic' as BottleType,
      subType: 'bottle',
      depositValue,
      x: window.innerWidth + 100,
      y: 0,
      rotation: 0,
      velocity: { x: 0, y: 0 },
      isSettled: false
    };
  } else if (itemType < 0.7) {
    // DRS Aluminum cans (30% chance)
    const depositValue = 15; // Standard can deposit in Ireland
    
    return {
      id,
      type: 'aluminum' as BottleType,
      subType: 'can',
      depositValue,
      x: window.innerWidth + 100,
      y: 0,
      rotation: 0,
      velocity: { x: 0, y: 0 },
      isSettled: false
    };
  } else {
    // Glass bottles (30% chance)
    const colors: ('green' | 'clear' | 'brown')[] = ['green', 'clear', 'brown'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    
    return {
      id,
      type: 'glass' as BottleType,
      subType: 'bottle',
      color,
      x: window.innerWidth + 100,
      y: 0,
      rotation: 0,
      velocity: { x: 0, y: 0 },
      isSettled: false
    };
  }
};

// Function to refresh available images (call this when new images are added)
export const refreshImageCache = (): void => {
  const imageManager = ImageManager.getInstance();
  imageManager.clearCache();
  // The ImageManager will automatically reload images on next access
};

// Function to get available image counts for debugging
export const getImageStats = () => {
  const imageManager = ImageManager.getInstance();
  const images = imageManager.getAvailableImages();
  
  return {
    '15c items': images.images15c.length,
    '25c items': images.images25c.length,
    'Glass white': images.imagesGlassWhite.length,
    'Glass brown': images.imagesGlassBrown.length,
    'Glass green': images.imagesGlassGreen.length,
    total: images.images15c.length + images.images25c.length +
           images.imagesGlassWhite.length + images.imagesGlassBrown.length +
           images.imagesGlassGreen.length
  };
};