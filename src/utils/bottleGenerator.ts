import { Bottle } from '../types/game';

export const generateBottle = (id: number): Bottle => {
  const itemType = Math.random();
  
  if (itemType < 0.4) {
    // DRS Plastic bottles (40% chance)
    const depositValues = [15, 25]; // Common DRS bottle values in Ireland
    const depositValue = depositValues[Math.floor(Math.random() * depositValues.length)];
    
    return {
      id,
      type: 'plastic',
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
      type: 'aluminum',
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
      type: 'glass',
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