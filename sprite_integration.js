/**
 * Drone: The Daily Commute
 * Sprite System Integration with Game Logic
 */

// Global variables for sprite system
let spriteSystem;
let commuterSprites = [];
let playerSprite;

/**
 * Initialize the sprite system and integrate with game
 */
function initializeSpriteSystem() {
    // Create the sprite system
    spriteSystem = new CommuterSpriteSystem({
        spriteSheetPath: 'assets/commuter-sprites.png', // Update this path to your sprite sheet image
        container: document.getElementById('scene-container'),
        spriteScale: 3
    });
    
    // Remove existing commuter elements
    removeExistingCommuters();
    
    // Add sprite-based commuters
    createCommuterSprites();
    
    // Override game functions to work with sprites
    overrideGameFunctions();
}

/**
 * Remove existing commuter elements
 */
function removeExistingCommuters() {
    // Get all existing commuters except the player
    const existingCommuters = document.querySelectorAll('.person:not(#player)');
    existingCommuters.forEach(commuter => {
        commuter.parentNode.removeChild(commuter);
    });
    
    // Remove player too if we're going to replace it
    const player = document.getElementById('player');
    if (player) {
        player.parentNode.removeChild(player);
    }
}

/**
 * Create sprite-based commuters
 */
function createCommuterSprites() {
    // Calculate positions
    const sceneContainer = document.getElementById('scene-container');
    const platformWidth = sceneContainer.offsetWidth;
    const platformY = 120; // Same as in your existing game
    
    // Create 7 commuters to match original game
    for (let i = 1; i <= 7; i++) {
        const commuterX = (platformWidth / 8) * i;
        
        const commuter = spriteSystem.createCommuter({
            id: `person${i}`,
            x: commuterX,
            y: platformY,
            facingLeft: Math.random() > 0.5,
            parts: {
                hat: { 
                    visible: false // Initially all hats are hidden
                },
                head: { visible: true },
                body: { visible: true },
                shirt: { visible: true },
                pants: { visible: true },
                briefcase: { 
                    visible: Math.random() > 0.5 
                },
                leftShoe: { visible: true },
                rightShoe: { visible: true }
            }
        });
        
        // Make commuter clickable for game interaction
        spriteSystem.makeClickable(commuter.id, handleSpriteClick);
        
        commuterSprites.push(commuter);
    }
    
    // Create player character (Drone Person)
    playerSprite = spriteSystem.createCommuter({
        id: 'player',
        x: (platformWidth / 8) * 7.5,
        y: platformY,
        facingLeft: true,
        parts: {
            hat: { visible: false },
            head: { visible: true },
            body: { visible: true },
            shirt: { visible: true },
            pants: { visible: true },
            briefcase: { visible: true },
            leftShoe: { visible: true },
            rightShoe: { visible: true }
        }
    });
}

/**
 * Handle sprite click events
 */
function handleSpriteClick(commuter, event) {
    // Create synthetic event expected by the original game
    const syntheticEvent = {
        target: {
            id: commuter.id
        },
        stopPropagation: () => event.stopPropagation()
    };
    
    // Call original click handler if it exists
    if (typeof window.handleElementClick === 'function') {
        window.handleElementClick(syntheticEvent);
    }
}

/**
 * Override game functions to work with sprite system
 */
function overrideGameFunctions() {
    // Store original functions
    const originalApplyChange = window.applyChange;
    const originalSelectRandomChange = window.selectRandomChange;
    
    // Override applyChange to work with sprites
    window.applyChange = function(change) {
        if (!change) return;
        
        console.log('Applying change:', change);
        
        // Extract the person ID (e.g., "person1-hat" -> "person1")
        const match = change.id.match(/^(person\d+|player)/);
        const personId = match ? match[1] : null;
        
        if (personId) {
            // Find the commuter
            const commuter = spriteSystem.commuters.find(c => c.id === personId);
            
            if (commuter) {
                // Create update options based on the change
                const updateOptions = { parts: {} };
                
                // Handle different types of changes
                if (change.id.includes('-hat')) {
                    updateOptions.parts.hat = {
                        visible: change.change.value === 'visible'
                    };
                } 
                else if (change.id.includes('-bag')) {
                    updateOptions.parts.briefcase = {
                        visible: change.change.value === 'visible'
                    };
                }
                // For visibility changes on other parts, we need more specific handling
                
                // Update the commuter with new options
                spriteSystem.updateCommuter(personId, updateOptions);
                
                // Update game state tracking
                if (window.currentState) {
                    window.currentState[change.id] = {
                        property: change.change.property,
                        value: change.change.value
                    };
                }
            }
        } else if (originalApplyChange) {
            // Fall back to original function for non-sprite changes
            originalApplyChange(change);
        }
    };
    
    // Override selectRandomChange to work better with sprites
    window.selectRandomChange = function() {
        // Use original function but adjust to ensure compatibility
        const change = originalSelectRandomChange();
        
        if (change) {
            // Adjust as needed for sprite system compatibility
            console.log('Selected change:', change);
        }
        
        return change;
    };
}

// Initialize the sprite system when the game starts
document.addEventListener('DOMContentLoaded', function() {
    // Wait for game to initialize first
    setTimeout(function() {
        initializeSpriteSystem();
    }, 500);
});