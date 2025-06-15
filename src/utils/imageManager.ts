import { BottleType } from '../types/game';

// Dynamically import all images in each category directory using Vite's import.meta.glob
const images15c = Object.values(import.meta.glob('/public/images/15c/*.{png,jpg,jpeg,svg}', { eager: true, as: 'url' }));
const images25c = Object.values(import.meta.glob('/public/images/25c/*.{png,jpg,jpeg,svg}', { eager: true, as: 'url' }));
const imagesGlassWhite = Object.values(import.meta.glob('/public/images/glass-white/*.{png,jpg,jpeg,svg}', { eager: true, as: 'url' }));
const imagesGlassBrown = Object.values(import.meta.glob('/public/images/glass-brown/*.{png,jpg,jpeg,svg}', { eager: true, as: 'url' }));
const imagesGlassGreen = Object.values(import.meta.glob('/public/images/glass-green/*.{png,jpg,jpeg,svg}', { eager: true, as: 'url' }));

interface ImageCache {
  [key: string]: HTMLImageElement;
}

export class ImageManager {
  private static instance: ImageManager;
  private imageCache: ImageCache = {};
  private preloadPromises: Map<string, Promise<HTMLImageElement>> = new Map();

  private constructor() {
    this.preloadImages();
  }

  public static getInstance(): ImageManager {
    if (!ImageManager.instance) {
      ImageManager.instance = new ImageManager();
    }
    return ImageManager.instance;
  }

  private async preloadImages(): Promise<void> {
    const allImages = [
      ...images15c,
      ...images25c,
      ...imagesGlassWhite,
      ...imagesGlassBrown,
      ...imagesGlassGreen
    ];

    // Preload all images in parallel
    const preloadPromises = allImages.map(url => this.preloadImage(url as string));
    
    try {
      await Promise.allSettled(preloadPromises);
    } catch (error) {
      console.warn('Some images failed to preload:', error);
    }
  }

  private preloadImage(url: string): Promise<HTMLImageElement> {
    if (this.preloadPromises.has(url)) {
      return this.preloadPromises.get(url)!;
    }

    const promise = new Promise<HTMLImageElement>((resolve, reject) => {
      if (this.imageCache[url]) {
        resolve(this.imageCache[url]);
        return;
      }

      const img = new Image();
      img.onload = () => {
        this.imageCache[url] = img;
        resolve(img);
      };
      img.onerror = () => {
        reject(new Error(`Failed to load image: ${url}`));
      };
      img.src = url;
    });

    this.preloadPromises.set(url, promise);
    return promise;
  }

  public getImageForBottle(
    type: BottleType,
    subType: 'bottle' | 'can',
    depositValue?: number,
    color?: 'green' | 'clear' | 'brown'
  ): string {
    let imageArray: string[] = [];

    // 15c and 25c items (plastic bottles and cans)
    if (
      (type === 'aluminum' && subType === 'can' && depositValue === 15) ||
      (type === 'plastic' && subType === 'bottle' && depositValue === 15)
    ) {
      imageArray = images15c as string[];
    } else if (
      type === 'plastic' && subType === 'bottle' && depositValue === 25
    ) {
      imageArray = images25c as string[];
    } else if (type === 'glass' && subType === 'bottle') {
      switch (color) {
        case 'green':
          imageArray = imagesGlassGreen as string[];
          break;
        case 'brown':
          imageArray = imagesGlassBrown as string[];
          break;
        case 'clear':
        default:
          imageArray = imagesGlassWhite as string[];
          break;
      }
    } else {
      // Fallback
      imageArray = images15c as string[];
    }

    // Return a random image from the appropriate array
    if (imageArray.length === 0) {
      return '/images/15c/beer-can-15c.png'; // Fallback image
    }

    return imageArray[Math.floor(Math.random() * imageArray.length)];
  }

  public isImageCached(url: string): boolean {
    return !!this.imageCache[url];
  }

  public getCachedImage(url: string): HTMLImageElement | null {
    return this.imageCache[url] || null;
  }

  public async ensureImageLoaded(url: string): Promise<HTMLImageElement> {
    if (this.imageCache[url]) {
      return this.imageCache[url];
    }

    return this.preloadImage(url);
  }

  public getAvailableImages(): {
    images15c: string[];
    images25c: string[];
    imagesGlassWhite: string[];
    imagesGlassBrown: string[];
    imagesGlassGreen: string[];
  } {
    return {
      images15c: images15c as string[],
      images25c: images25c as string[],
      imagesGlassWhite: imagesGlassWhite as string[],
      imagesGlassBrown: imagesGlassBrown as string[],
      imagesGlassGreen: imagesGlassGreen as string[]
    };
  }

  public clearCache(): void {
    this.imageCache = {};
    this.preloadPromises.clear();
  }
}

export default ImageManager;