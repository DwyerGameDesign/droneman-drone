/**
 * Drone: The Daily Commute
 * Optional game extensions and advanced features
 * 
 * This file contains additional features that can be enabled to extend the game.
 * To use these features, include this file in your HTML after game.js:
 * <script src="extensions.js"></script>
 */

/**
 * ADVANCED COLOR SYSTEM
 * 
 * Gradually introduces color to specific elements as awareness increases
 */
const colorSystem = {
    enabled: true, // Set to true to enable this feature
    
    // Awareness thresholds for introducing color
    thresholds: {
        start: 30, // When colors start to appear
        full: 90,  // When colors reach full saturation
    },
    
    // Elements to colorize and their final colors
    elements: [
        { id: 'player', parts: ['.head', '.body', '.pants', '.left-shoe', '.right-shoe'], color: '#ffd700' },
        { id: 'sign', color: '#4a88ff' },
        { id: 'scene-container', property: 'backgroundColor', baseColor: [51, 51, 51], targetColor: [41, 62, 102] }
    ],
    
    /**
     * Initialize the color system
     */
    init: function() {
        if (!this.enabled) return;
        
        // Add event listener to update colors when awareness changes
        document.addEventListener('awarenessChanged', (e) => {
            this.updateColors(e.detail.awareness);
        });
        
        // Initial update - wait for gameState to be defined
        setTimeout(() => {
            if (typeof gameState !== 'undefined') {
                // For XP-based system, use awarenessLevel (0-10)
                this.updateColors(gameState.awarenessLevel * 10);
            }
        }, 100);
    },
    
    /**
     * Update colors based on current awareness
     */
    updateColors: function(awarenessLevel) {
        if (awarenessLevel < this.thresholds.start) return;
        
        // Calculate color intensity (0-1)
        const range = this.thresholds.full - this.thresholds.start;
        const intensity = Math.min(1, (awarenessLevel - this.thresholds.start) / range);
        
        this.elements.forEach(el => {
            const element = document.getElementById(el.id);
            if (!element) return;
            
            if (el.parts) {
                // Apply to child elements
                el.parts.forEach(selector => {
                    const parts = element.querySelectorAll(selector);
                    parts.forEach(part => {
                        this.applyColorWithIntensity(part, el.color, intensity);
                    });
                });
            } else if (el.property === 'backgroundColor') {
                // Transition between two colors
                const r = Math.round(el.baseColor[0] + (el.targetColor[0] - el.baseColor[0]) * intensity);
                const g = Math.round(el.baseColor[1] + (el.targetColor[1] - el.baseColor[1]) * intensity);
                const b = Math.round(el.baseColor[2] + (el.targetColor[2] - el.baseColor[2]) * intensity);
                element.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;
            } else {
                // Apply to the element itself
                this.applyColorWithIntensity(element, el.color, intensity);
            }
        });
    },
    
    /**
     * Apply color with specified intensity
     */
    applyColorWithIntensity: function(element, targetColor, intensity) {
        // Convert hex to rgb if needed
        let rgb;
        if (targetColor.startsWith('#')) {
            rgb = this.hexToRgb(targetColor);
        } else if (targetColor.startsWith('rgb')) {
            // Extract RGB values from rgb() string
            const matches = targetColor.match(/\d+/g);
            rgb = {
                r: parseInt(matches[0]),
                g: parseInt(matches[1]),
                b: parseInt(matches[2])
            };
        } else {
            // Default gray
            rgb = { r: 85, g: 85, b: 85 };
        }
        
        // Base gray color
        const baseColor = { r: 85, g: 85, b: 85 }; // #555
        
        // Calculate color based on intensity
        const r = Math.round(baseColor.r + (rgb.r - baseColor.r) * intensity);
        const g = Math.round(baseColor.g + (rgb.g - baseColor.g) * intensity);
        const b = Math.round(baseColor.b + (rgb.b - baseColor.b) * intensity);
        
        element.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;
        element.style.transition = 'background-color 1s ease-in-out';
    },
    
    /**
     * Convert hex color to RGB object
     */
    hexToRgb: function(hex) {
        // Remove # if present
        hex = hex.replace(/^#/, '');
        
        // Parse hex
        let bigint = parseInt(hex, 16);
        let r = (bigint >> 16) & 255;
        let g = (bigint >> 8) & 255;
        let b = bigint & 255;
        
        return { r, g, b };
    }
};

/**
 * SAVE SYSTEM
 * 
 * Adds game state saving and loading
 */
const saveSystem = {
    enabled: false, // Set to true to enable this feature
    
    /**
     * Initialize the save system
     */
    init: function() {
        if (!this.enabled) return;
        
        // Load saved game on start
        this.loadGame();
        
        // Save game when awareness changes
        document.addEventListener('awarenessChanged', () => {
            this.saveGame();
        });
        
        // Save game when day changes
        document.addEventListener('dayChanged', () => {
            this.saveGame();
        });
        
        // Create UI elements for save/load/reset
        this.createUI();
    },
    
    /**
     * Create UI for save system
     */
    createUI: function() {
        const gameContainer = document.querySelector('.game-container');
        
        // Create container
        const saveContainer = document.createElement('div');
        saveContainer.className = 'save-system';
        saveContainer.style.marginTop = '15px';
        saveContainer.style.display = 'flex';
        saveContainer.style.justifyContent = 'center';
        saveContainer.style.gap = '10px';
        
        // Create reset button
        const resetButton = document.createElement('button');
        resetButton.textContent = 'Reset Game';
        resetButton.className = 'reset-button';
        resetButton.style.padding = '8px 15px';
        resetButton.style.backgroundColor = '#a33';
        resetButton.style.color = 'white';
        resetButton.style.border = 'none';
        resetButton.style.borderRadius = '5px';
        resetButton.style.cursor = 'pointer';
        
        resetButton.addEventListener('click', () => {
            if (confirm('Are you sure you want to reset your progress?')) {
                this.resetGame();
            }
        });
        
        saveContainer.appendChild(resetButton);
        gameContainer.appendChild(saveContainer);
    },
    
    /**
     * Save the current game state
     */
    saveGame: function() {
        const gameState = {
            day,
            awareness,
            currentState,
            allChanges // Save the history of all changes for persistence
        };
        
        try {
            localStorage.setItem('droneGameState', JSON.stringify(gameState));
        } catch (error) {
            console.error('Error saving game:', error);
        }
    },
    
    /**
     * Load a saved game
     */
    loadGame: function() {
        try {
            const savedState = localStorage.getItem('droneGameState');
            if (savedState) {
                const gameState = JSON.parse(savedState);
                
                // Restore game state
                day = gameState.day;
                awareness = gameState.awareness;
                currentState = gameState.currentState;
                
                // Restore change history for persistence
                if (gameState.allChanges) {
                    allChanges = gameState.allChanges;
                }
                
                // Update UI
                dayDisplay.textContent = day;
                updateAwarenessDisplay();
                updateColorStage();
                checkForLyrics();
                
                // Apply all saved changes to maintain the state
                if (allChanges && allChanges.length > 0) {
                    allChanges.forEach(change => {
                        const element = document.getElementById(change.id);
                        if (element) {
                            element.style[change.change.property] = change.change.value;
                        }
                    });
                } else {
                    // Apply current state to elements if no change history
                    Object.keys(currentState).forEach(id => {
                        const element = document.getElementById(id);
                        if (element) {
                            const state = currentState[id];
                            element.style[state.property] = state.value;
                        }
                    });
                }
            }
        } catch (error) {
            console.error('Error loading game:', error);
        }
    },
    
    /**
     * Reset the game
     */
    resetGame: function() {
        // Clear saved game
        localStorage.removeItem('droneGameState');
        
        // Reset game state
        day = 1;
        awareness = 0;
        canClick = false;
        currentChange = null;
        previousState = {};
        currentState = {};
        allChanges = [];
        
        // Update UI
        dayDisplay.textContent = day;
        updateAwarenessDisplay();
        updateColorStage();
        checkForLyrics();
        
        // Reset all element states by reinitializing default styles
        initializeDefaultStyles();
        
        // Enable train button
        trainButton.disabled = false;
    }
};

// Fix for function overriding - properly store original functions
document.addEventListener('DOMContentLoaded', () => {
    // Store original functions before overriding
    const originalIncreaseAwareness = window.increaseAwareness;
    const originalTakeTrain = window.takeTrain;
    const originalHandleElementClick = window.handleElementClick;
    
    // Initialize extensions - remove audioSystem
    colorSystem.init();
    // audioSystem.init(); // Audio system removed
    saveSystem.init();
    
    // Override increaseAwareness function
    window.increaseAwareness = function(amount) {
        // Call the original function first
        originalIncreaseAwareness(amount);
        
        // Dispatch awareness changed event
        const event = new CustomEvent('awarenessChanged', {
            detail: {
                oldAwareness: awareness - amount,
                awareness,
                change: amount
            }
        });
        document.dispatchEvent(event);
        
        // Remove audio milestone check
        // if ((awareness % 10 === 0) || SONG_LYRICS.some(lyric => lyric.day === day)) {
        //     document.dispatchEvent(new Event('milestoneReached'));
        // }
    };
    
    // Override takeTrain function
    window.takeTrain = function() {
        // Store old day value
        const oldDay = day;
        
        // Call the original function
        originalTakeTrain();
        
        // Dispatch day changed event after a short delay to let original function complete
        setTimeout(() => {
            const event = new CustomEvent('dayChanged', {
                detail: {
                    oldDay,
                    day
                }
            });
            document.dispatchEvent(event);
        }, 100);
    };
    
    // Override handleElementClick function
    window.handleElementClick = function(event) {
        // Store if this was a correct click before calling original function
        const clickedId = event.target.id;
        const isCorrect = clickedId === currentChange?.id;
        
        // Call the original function
        originalHandleElementClick(event);
        
        // Remove audio event dispatches
        // setTimeout(() => {
        //     if (isCorrect) {
        //         document.dispatchEvent(new Event('correctGuess'));
        //     } else if (currentChange) {  // Only dispatch incorrect if there is a current change
        //         document.dispatchEvent(new Event('incorrectGuess'));
        //     }
        // }, 100);
    };
});