# Drone: The Daily Commute - Single Sprite Approach

This is an updated version of the game that uses full commuter sprites instead of composing characters from individual parts. This approach is simpler, more performant, and easier to maintain.

## Sprite Setup Instructions

### 1. Prepare Your Sprite Files

Place the following image files in the `assets/sprites/` directory:

- `commuter1.png` through `commuter5.png` - Full commuter sprites (5 different commuter types)
- `hat.png` - Hat accessory to overlay on commuters
- `briefcase.png` - Briefcase accessory to overlay on commuters

### 2. Recommended Sprite Dimensions

The game is designed to work with sprites of the following dimensions:

- **Full commuter sprites**: 392 × 922 pixels
- **Hat accessory**: ~200 × 150 pixels (positioned at top of commuter)
- **Briefcase accessory**: ~150 × 120 pixels (positioned at side of commuter)

### 3. File Structure

Make sure your files are organized like this:

```
/ (root directory)
├── assets/
│   └── sprites/
│       ├── commuter1.png
│       ├── commuter2.png
│       ├── commuter3.png
│       ├── commuter4.png
│       ├── commuter5.png
│       ├── hat.png
│       └── briefcase.png
├── awareness_meter.js
├── config.js
├── extensions.js
├── game.js
├── index.html
├── SingleCommuterSpriteSystem.js
├── sprite_integration.js
├── styles.css
└── typewriter.js
```

## Key Changes from Previous Version

1. **Simplified Sprite System**: Uses complete sprites instead of composing them from parts
2. **More Performant**: Fewer DOM elements and less complex layout calculations
3. **Easier to Update**: Add new commuter types by simply adding new image files
4. **More Flexible**: Accessories are overlaid on commuters instead of being part of the commuter

## Updating the Game

### Adding New Commuter Types

To add a new commuter type:

1. Add a new sprite image (e.g., `commuter6.png`) to the `assets/sprites/` directory
2. Update the `commuterTypes` array in `SingleCommuterSpriteSystem.js`:

```javascript
this.commuterTypes = [
    { id: 'commuter1', filename: 'commuter1.png' },
    { id: 'commuter2', filename: 'commuter2.png' },
    { id: 'commuter3', filename: 'commuter3.png' },
    { id: 'commuter4', filename: 'commuter4.png' },
    { id: 'commuter5', filename: 'commuter5.png' },
    { id: 'commuter6', filename: 'commuter6.png' } // New commuter type
];
```

3. Update any random selection logic in `sprite_integration.js` to include the new type

### Adding New Accessory Types

To add a new accessory type:

1. Add a new accessory image (e.g., `umbrella.png`) to the `assets/sprites/` directory
2. Update the `createCommuter` and `updateCommuter` methods in `SingleCommuterSpriteSystem.js` to support the new accessory
3. Add the new accessory to the change types in `selectRandomChange` in `sprite_integration.js`

## Adjusting Sprite Scaling

If your sprites are different sizes, adjust the scale factor in the sprite system:

1. Open `sprite_integration.js`
2. Find the `initializeSpriteSystem` function
3. Change the `spriteScale` value to fit your needs:

```javascript
spriteSystem = new CommuterSpriteSystem({
    spritesPath: 'assets/sprites/',
    container: document.getElementById('scene-container'),
    spriteScale: 0.18 // Adjust this value as needed
});
```