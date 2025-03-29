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
    
    // Add the first commuter only
    createInitialCommuter();
    
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
    
    // Clear the commuter sprites array
    commuterSprites = [];
}

/**
 * Create the initial commuter (only one to start)
 */
function createInitialCommuter() {
    // Calculate position - center of the platform
    const sceneContainer = document.getElementById('scene-container');
    const platformWidth = sceneContainer.offsetWidth;
    const platformY = 120; // Bottom position
    
    // Create first commuter at center (50%)
    const commuterX = platformWidth * (COMMUTER_ADDITION.positions[0] / 100);
    
    const commuter = spriteSystem.createCommuter({
        id: `commuter-0`,
        x: commuterX,
        y: platformY,
        facingLeft: Math.random() > 0.5,
        parts: {
            hat: { visible: false }, // Initially no hat (first change will be adding a hat)
            head: { visible: true },
            body: { visible: true },
            shirt: { visible: true },
            pants: { visible: true },
            briefcase: { visible: Math.random() > 0.5 },
            leftShoe: { visible: true },
            rightShoe: { visible: true }
        }
    });
    
    // Make commuter clickable for game interaction
    spriteSystem.makeClickable(commuter.id, handleSpriteClick);
    
    commuterSprites.push(commuter);
    
    // Return the created commuter
    return commuter;
}

/**
 * Create a new commuter at a specified position index
 * @param {number} positionIndex - Index in the COMMUTER_ADDITION.positions array
 * @returns {Object} The created commuter
 */
function createNewCommuter(positionIndex) {
    if (commuterSprites.length >= COMMUTER_ADDITION.maxCommuters) {
        console.warn('Maximum number of commuters reached');
        return null;
    }
    
    // Calculate position
    const sceneContainer = document.getElementById('scene-container');
    const platformWidth = sceneContainer.offsetWidth;
    const platformY = 120; // Bottom position
    
    // Get position from config or default to random position
    const position = COMMUTER_ADDITION.positions[positionIndex] || (Math.random() * 80 + 10);
    const commuterX = platformWidth * (position / 100);
    
    // Generate random appearance
    const randomHat = COMMUTER_APPEARANCE.hats[Math.floor(Math.random() * COMMUTER_APPEARANCE.hats.length)];
    const randomBriefcase = COMMUTER_APPEARANCE.briefcases[Math.floor(Math.random() * COMMUTER_APPEARANCE.briefcases.length)];
    
    const commuter = spriteSystem.createCommuter({
        id: `commuter-${commuterSprites.length}`,
        x: commuterX,
        y: platformY,
        facingLeft: Math.random() > 0.5,
        parts: {
            hat: { 
                visible: randomHat.visible,
                styles: {
                    backgroundColor: randomHat.color
                }
            },
            head: { visible: true },
            body: { 
                visible: true,
                styles: {
                    backgroundColor: COMMUTER_APPEARANCE.coats[Math.floor(Math.random() * COMMUTER_APPEARANCE.coats.length)]
                }
            },
            shirt: { 
                visible: true,
                styles: {
                    backgroundColor: COMMUTER_APPEARANCE.shirts[Math.floor(Math.random() * COMMUTER_APPEARANCE.shirts.length)]
                }
            },
            pants: { 
                visible: true,
                styles: {
                    backgroundColor: COMMUTER_APPEARANCE.pants[Math.floor(Math.random() * COMMUTER_APPEARANCE.pants.length)]
                }
            },
            briefcase: { 
                visible: randomBriefcase.visible,
                styles: {
                    backgroundColor: randomBriefcase.color
                }
            },
            leftShoe: { 
                visible: true,
                styles: {
                    backgroundColor: COMMUTER_APPEARANCE.shoes[Math.floor(Math.random() * COMMUTER_APPEARANCE.shoes.length)]
                }
            },
            rightShoe: { 
                visible: true,
                styles: {
                    backgroundColor: COMMUTER_APPEARANCE.shoes[Math.floor(Math.random() * COMMUTER_APPEARANCE.shoes.length)]
                }
            }
        }
    });
    
    // Make commuter clickable for game interaction
    spriteSystem.makeClickable(commuter.id, handleSpriteClick);
    
    commuterSprites.push(commuter);
    
    // Return the created commuter
    return commuter;
}

/**
 * Handle sprite click events
 */
function handleSpriteClick(commuter, event) {
    // Ensure game is in clickable state
    if (!window.canClick || window.isTransitioning) return;
    
    // Check if this is the commuter with the current change
    if (window.currentChange && window.currentChange.commuterId === getCommuterIndex(commuter.id)) {
        console.log('Correct commuter clicked!');
        
        // Call the original increaseAwareness function
        window.increaseAwareness(GAME_SETTINGS.baseAwarenessGain);
        
        // Set canClick to false to prevent further clicks
        window.canClick = false;
        
        // Show thought bubble
        window.showThoughtBubble();
        
        // Update narrative text
        window.updateNarrativeText();
        
        // Mark change as found
        window.currentChange.found = true;
        
        // Add a visual highlight to the commuter
        highlightCommuter(commuter.element);
    } else {
        // Wrong commuter clicked
        console.log('Wrong commuter clicked');
        
        // Show message
        window.showMessage("I didn't notice anything different there", 1500);
    }
}

/**
 * Get the index of a commuter from its ID
 * @param {string} id - Commuter ID (format: "commuter-X")
 * @returns {number} The commuter index
 */
function getCommuterIndex(id) {
    const match = id.match(/commuter-(\d+)/);
    return match ? parseInt(match[1]) : -1;
}

/**
 * Apply highlight effect to a commuter element
 * @param {HTMLElement} element - The commuter element to highlight
 */
function highlightCommuter(element) {
    // Add highlighting effect
    element.classList.add('highlight-pulse');
    
    // Remove after animation completes
    setTimeout(() => {
        element.classList.remove('highlight-pulse');
    }, 1500);
}

/**
 * Create the first change (adding a hat on day 4)
 */
function createFirstChange() {
    if (commuterSprites.length === 0) return null;
    
    // Get the first commuter
    const firstCommuter = commuterSprites[0];
    const commuterId = getCommuterIndex(firstCommuter.id);
    
    // Create a change object
    return {
        commuterId: commuterId,
        type: FIRST_CHANGE.type,
        property: FIRST_CHANGE.property,
        value: FIRST_CHANGE.value,
        found: false
    };
}

/**
 * Select a random element to change on a commuter
 */
function selectRandomChange() {
    if (commuterSprites.length === 0) return null;
    
    // Select a random commuter
    const commuterIndex = Math.floor(Math.random() * commuterSprites.length);
    const commuter = commuterSprites[commuterIndex];
    
    // Pick a random change type
    const changeTypes = ['hat', 'coat', 'briefcase', 'pants', 'shoes', 'shirt'];
    const changeType = changeTypes[Math.floor(Math.random() * changeTypes.length)];
    
    // Default change properties
    let property = 'color';
    let value = '#000000';
    
    // Customize change based on type
    switch (changeType) {
        case 'hat':
            if (Math.random() > 0.7) {
                // Toggle hat visibility
                property = 'visible';
                value = true; // We'll invert this based on current state
            } else {
                // Change hat color
                property = 'color';
                const hatColors = COMMUTER_APPEARANCE.hats.map(h => h.color);
                value = hatColors[Math.floor(Math.random() * hatColors.length)];
            }
            break;
            
        case 'coat':
            property = 'color';
            value = COMMUTER_APPEARANCE.coats[Math.floor(Math.random() * COMMUTER_APPEARANCE.coats.length)];
            break;
            
        case 'shirt':
            property = 'color';
            value = COMMUTER_APPEARANCE.shirts[Math.floor(Math.random() * COMMUTER_APPEARANCE.shirts.length)];
            break;
            
        case 'pants':
            property = 'color';
            value = COMMUTER_APPEARANCE.pants[Math.floor(Math.random() * COMMUTER_APPEARANCE.pants.length)];
            break;
            
        case 'shoes':
            property = 'color';
            value = COMMUTER_APPEARANCE.shoes[Math.floor(Math.random() * COMMUTER_APPEARANCE.shoes.length)];
            break;
            
        case 'briefcase':
            if (Math.random() > 0.7) {
                // Toggle briefcase visibility
                property = 'visible';
                value = true; // We'll invert this based on current state
            } else {
                // Change briefcase color
                property = 'color';
                const briefcaseColors = COMMUTER_APPEARANCE.briefcases
                    .filter(b => b.color !== null)
                    .map(b => b.color);
                value = briefcaseColors[Math.floor(Math.random() * briefcaseColors.length)];
            }
            break;
    }
    
    return {
        commuterId: getCommuterIndex(commuter.id),
        type: changeType,
        property: property,
        value: value,
        found: false
    };
}

/**
 * Apply the selected change to a commuter
 */
function applyChange(change) {
    if (!change) return;
    
    // Find the commuter by ID
    const commuter = commuterSprites[change.commuterId];
    if (!commuter) return;
    
    // Create options object for updating the commuter
    const updateOptions = { parts: {} };
    
    // Apply change based on type
    switch (change.type) {
        case 'hat':
            if (change.property === 'visible') {
                // Toggle hat visibility
                const isVisible = commuter.config.parts.hat.visible;
                updateOptions.parts.hat = { visible: !isVisible };
            } else {
                // Change hat color
                updateOptions.parts.hat = { 
                    styles: { backgroundColor: change.value }
                };
            }
            break;
            
        case 'coat':
            updateOptions.parts.body = { 
                styles: { backgroundColor: change.value }
            };
            break;
            
        case 'shirt':
            updateOptions.parts.shirt = { 
                styles: { backgroundColor: change.value }
            };
            break;
            
        case 'pants':
            updateOptions.parts.pants = { 
                styles: { backgroundColor: change.value }
            };
            break;
            
        case 'shoes':
            updateOptions.parts.leftShoe = { 
                styles: { backgroundColor: change.value }
            };
            updateOptions.parts.rightShoe = { 
                styles: { backgroundColor: change.value }
            };
            break;
            
        case 'briefcase':
            if (change.property === 'visible') {
                // Toggle briefcase visibility
                const isVisible = commuter.config.parts.briefcase.visible;
                updateOptions.parts.briefcase = { visible: !isVisible };
            } else {
                // Change briefcase color
                updateOptions.parts.briefcase = { 
                    styles: { backgroundColor: change.value }
                };
            }
            break;
    }
    
    // Update the commuter
    spriteSystem.updateCommuter(commuter.id, updateOptions);
}

/**
 * Override game functions to work with sprite system
 */
function overrideGameFunctions() {
    // Store original functions
    const originalCreateFirstChange = window.createFirstChange;
    const originalSelectRandomChange = window.selectRandomChange;
    const originalApplyChange = window.applyChange;
    const originalHighlightMissedChange = window.highlightMissedChange;
    
    // Override createFirstChange function
    window.createFirstChange = function() {
        return createFirstChange();
    };
    
    // Override selectRandomChange function
    window.selectRandomChange = function() {
        return selectRandomChange();
    };
    
    // Override applyChange function
    window.applyChange = function(change) {
        applyChange(change);
    };
    
    // Override highlightMissedChange function
    window.highlightMissedChange = function(change) {
        if (!change) return;
        
        // Find the commuter element
        const commuter = commuterSprites[change.commuterId];
        if (commuter && commuter.element) {
            // Highlight the commuter
            highlightCommuter(commuter.element);
        }
    };
}

/**
 * Add a new commuter to the scene when a meter segment is filled
 * @param {number} segmentNumber - Current segment that was filled
 */
function addNewCommuter(segmentNumber) {
    // Check if we can add more commuters
    if (commuterSprites.length >= COMMUTER_ADDITION.maxCommuters) return;
    
    // Add a new commuter at the position corresponding to the segment
    createNewCommuter(segmentNumber);
    
    // Show notification
    window.showMessage("The station seems more crowded now...", 2000);
}

// Initialize the sprite system when the game starts
document.addEventListener('DOMContentLoaded', function() {
    // Wait for game to initialize first
    setTimeout(function() {
        initializeSpriteSystem();
    }, 500);
});