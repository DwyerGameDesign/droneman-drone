# Drone: The Daily Commute

A browser-based game inspired by the song "Drone" from the concept album. The game puts you in the shoes of a commuter taking the same train every day, gradually becoming more aware of your surroundings and breaking free from monotony.

## Game Overview

In "Drone: The Daily Commute," you:
1. Take the 6:40 train each day by clicking the button
2. Find what's different in today's commute by spotting and clicking on the change
3. Increase your Awareness with each discovery
4. Watch as the environment gradually transforms with your growing Awareness
5. Break free from the routine when you reach 100% Awareness

## File Structure

- `index.html` - The main HTML structure of the game
- `styles.css` - All styling and visual effects
- `config.js` - Game settings, song lyrics, and changeable elements configuration
- `game.js` - Main game logic and functionality

## How to Install

1. Download all files to a directory on your computer
2. Open `index.html` in a web browser

No server or special software is required to run the game.

## How to Customize

### Adding New Changeable Elements

To add new elements that can change:

1. Create the HTML elements in `index.html`
2. Add their IDs to the appropriate array in `CHANGEABLE_ELEMENTS` in `config.js`
3. Add any necessary CSS in `styles.css`
4. If needed, add a new category type in `config.js` and handle it in the `selectRandomChange()` function in `game.js`

### Changing Game Settings

Modify the `GAME_SETTINGS` object in `config.js` to customize:

- Transition timing (fade durations)
- Awareness gain per correct guess
- Win conditions
- Color stages and their thresholds

### Customizing Visuals

- Edit the CSS classes in `styles.css` to change the appearance of any game element
- Modify the background color stages by editing the `.stage-X` classes in `styles.css`
- Add new character elements or scene objects by adding them to `index.html` and styling them appropriately

### Adding More Lyrics and Thoughts

- Add more song lyrics by editing the `SONG_LYRICS` array in `config.js`
- Add or modify thoughts in the `THOUGHTS` object in `config.js`

## Extending the Game

As your Awareness increases in the game, you might want to add more complex changes and interactions:

1. **New Types of Changes**: Add changes to colors, positions, or character expressions
2. **Environmental Elements**: Add weather effects, time of day changes, or background elements
3. **Interactive Elements**: Add clickable items that provide bonus awareness or special effects
4. **Sound Effects**: Add train sounds, ambient noise, or music
5. **Advanced Gameplay Mechanics**: Add a soul energy system to purchase upgrades

## Inspired by the Song "Drone"

This game is inspired by the song "Drone" from the concept album, with themes of:
- Breaking free from monotony
- Gradual awakening to one's surroundings
- The journey from "drone" to individual
- Recognizing patterns and making changes

## Credits

This game was created based on the concept album "Drone Man," particularly the song "Drone," which follows a person's journey of awakening during their daily train commute.