# Dynamic Image Management System

This document explains how to dynamically add new bottle and can images to the recycling game.

## How It Works

The game uses Vite's `import.meta.glob` to automatically discover and load images from specific directories. When you add new images to these directories, they will be automatically available in the game.

## Directory Structure

Add your images to the following directories in the `public/images/` folder:

```
public/images/
├── 15c/           # 15-cent deposit items (small plastic bottles, aluminum cans)
├── 25c/           # 25-cent deposit items (large plastic bottles)
├── glass-white/   # Clear glass bottles
├── glass-brown/   # Brown glass bottles
└── glass-green/   # Green glass bottles
```

## Supported Image Formats

- PNG (.png)
- JPEG (.jpg, .jpeg)
- SVG (.svg)
- GIF (.gif)
- WebP (.webp)

## Adding New Images

1. **Choose the correct category** based on the bottle/can type:
   - `15c/` - Small plastic bottles and aluminum cans with 15-cent deposit
   - `25c/` - Large plastic bottles with 25-cent deposit
   - `glass-white/` - Clear/white glass bottles (no deposit value)
   - `glass-brown/` - Brown glass bottles (no deposit value)
   - `glass-green/` - Green glass bottles (no deposit value)

2. **Copy your image files** to the appropriate directory

3. **Refresh the game** - In development mode, you'll see an image debug panel (🖼️ button) in the bottom-right corner. Click it and then click "Refresh Images" to reload the image cache.

## Image Requirements

- **File size**: Keep images under 5MB for optimal performance
- **Dimensions**: Recommended 200x300px or similar aspect ratio
- **Background**: Transparent PNG works best for realistic appearance
- **Naming**: Use descriptive names (e.g., `cola-bottle-25c.png`, `beer-can-heineken.png`)

## Development Tools

### Image Debug Panel

In development mode, click the 🖼️ button in the bottom-right corner to access:

- **Image count** for each category
- **Refresh button** to reload images after adding new ones
- **Image path listing** to see what images are currently loaded

### Console Functions

You can also use these functions in the browser console:

```javascript
// Get current image statistics
console.log(getImageStats());

// Refresh the image cache
refreshImageCache();
```

## Technical Details

### How Images Are Selected

- The game randomly selects an image from the appropriate category for each bottle/can
- Selection happens when a new bottle is generated
- Each bottle instance keeps the same image throughout its lifecycle

### Performance Optimizations

- Images are preloaded when the game starts
- Image cache prevents duplicate loading
- Hardware acceleration is used for smooth rendering
- CSS placeholder warnings have been eliminated

### File Watching

The Vite development server automatically watches for file changes in the `public/` directory. However, you may need to refresh the image cache using the debug panel or console commands to see new images in the game.

## Troubleshooting

### Images Not Appearing

1. Check that images are in the correct directory
2. Verify file format is supported
3. Use the debug panel to refresh the image cache
4. Check browser console for any error messages

### Performance Issues

1. Ensure images are reasonably sized (< 1MB recommended)
2. Use optimized formats (WebP for best compression)
3. Avoid adding too many large images at once

### Cache Issues

1. Use the "Refresh Images" button in the debug panel
2. Hard refresh the browser (Ctrl+F5 or Cmd+Shift+R)
3. Clear browser cache if needed

## Example Workflow

1. Create a new bottle image (e.g., `sprite-bottle-25c.png`)
2. Save it to `public/images/25c/sprite-bottle-25c.png`
3. Open the game in development mode
4. Click the 🖼️ debug panel button
5. Click "Refresh Images"
6. The new image will now randomly appear for 25-cent plastic bottles

## Production Deployment

When deploying to production:

1. All images in the directories will be automatically included
2. The debug panel will not be visible in production builds
3. Images are optimized and cached by Vite's build process