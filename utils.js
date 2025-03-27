/**
 * Drone: The Daily Commute
 * Utility functions for extending the game
 */

/**
 * Smoothly transition background color of an element
 * @param {HTMLElement} element - DOM element to change
 * @param {string} color - Target color (hex or CSS color name)
 * @param {number} duration - Duration of transition in milliseconds
 */
function transitionBackgroundColor(element, color, duration) {
    element.style.transition = `background-color ${duration}ms ease-in-out`;
    element.style.backgroundColor = color;
}

/**
 * Create a new HTML element with specified properties
 * @param {string} type - Element type (div, span, etc)
 * @param {string} id - Element ID
 * @param {string[]} classes - Array of CSS classes to add
 * @param {Object} styles - Object with CSS styles
 * @param {HTMLElement} parent - Parent element to append to
 * @returns {HTMLElement} The created element
 */
function createGameElement(type, id, classes, styles, parent) {
    const element = document.createElement(type);
    
    if (id) element.id = id;
    
    if (classes && classes.length) {
        classes.forEach(cls => element.classList.add(cls));
    }
    
    if (styles) {
        Object.keys(styles).forEach(key => {
            element.style[key] = styles[key];
        });
    }
    
    if (parent) {
        parent.appendChild(element);
    }
    
    return element;
}

/**
 * Play a simple beep sound of specified frequency and duration
 * @param {number} frequency - Sound frequency in Hz
 * @param {number} duration - Sound duration in milliseconds
 */
function playBeep(frequency, duration) {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.type = 'sine';
        oscillator.frequency.value = frequency;
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        gainNode.gain.value = 0.1; // Keep the volume low
        
        oscillator.start();
        
        setTimeout(() => {
            oscillator.stop();
        }, duration);
    } catch (error) {
        console.error('Audio playback error:', error);
    }
}

/**
 * Save game state to local storage
 * @param {Object} state - Game state to save
 */
function saveGameState(state) {
    try {
        localStorage.setItem('droneGameState', JSON.stringify(state));
    } catch (error) {
        console.error('Error saving game state:', error);
    }
}

/**
 * Load game state from local storage
 * @returns {Object|null} Game state object or null if not found
 */
function loadGameState() {
    try {
        const savedState = localStorage.getItem('droneGameState');
        return savedState ? JSON.parse(savedState) : null;
    } catch (error) {
        console.error('Error loading game state:', error);
        return null;
    }
}

/**
 * Get a random number between min and max (inclusive)
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Random number
 */
function getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generate a seeded random number using a specific day
 * Useful for creating consistent "random" changes for specific days
 * @param {number} day - The day number to use as seed
 * @param {number} factor - Additional factor to diversify results
 * @returns {number} A decimal number between 0 and 1
 */
function seededRandom(day, factor = 1) {
    const seed = day * factor;
    // Simple hash function to get a decimal between 0 and 1
    return ((Math.sin(seed) + 1) / 2);
}

/**
 * Calculate awareness stage based on current awareness level
 * @param {number} awareness - Current awareness level (0-100)
 * @param {number} totalStages - Total number of stages
 * @returns {number} Current stage (1-based)
 */
function calculateAwarenessStage(awareness, totalStages) {
    if (awareness <= 0) return 1;
    if (awareness >= 100) return totalStages;
    
    const stageSize = 100 / totalStages;
    return Math.ceil(awareness / stageSize);
}