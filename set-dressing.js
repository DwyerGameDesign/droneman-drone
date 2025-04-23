/**
 * Drone: The Daily Commute
 * Set Dressing Management - All set dressing-related functionality
 */

// Maximum number of set dressing elements in the scene
const MAX_SET_DRESSING = 8;

// Positions for each set dressing element [left%, bottom%]
// Positioned in columns offset from commuter positions to prevent overlapping
const SET_DRESSING_POSITIONS = [
    [4, 21],   // Far far left
    [18, 22],  // Between far left and left
    [31, 23],  // Between left and left-center
    [44, 21],  // Between center and left-center
    [56, 24],  // Between center and right-center
    [69, 22],  // Between right-center and right
    [82, 23],  // Between right and far right
    [95, 21]   // Far far right
];

// Types of set dressing elements - updated to match your available sprites
const SET_DRESSING_TYPES = [
    'bench',
    'bottle',
    'caution',
    'cautionalt',
    'trash',
    'trashcan',
    'backpack',
    'rat'
];

// Array to store all set dressing elements
let allSetDressing = [];
let activeSetDressing = 0;
let setDressingVariations = {};
// Add a counter to track and force alternating behavior
let setDressingChangeCounter = 0;

/**
 * Detect all available set dressing variations
 */
async function detectSetDressingVariations() {
    console.log("Detecting set dressing sprites...");

    // For each set dressing type
    for (const type of SET_DRESSING_TYPES) {
        setDressingVariations[type] = [];

        // Check for base set dressing element
        const baseImage = new Image();
        baseImage.src = `assets/sprites/${type}.png`;

        try {
            await imageExists(baseImage);
            setDressingVariations[type].push(`${type}.png`);
        } catch (error) {
            // If base element doesn't exist, skip it
            console.warn(`Could not load sprite for ${type}`);
            continue;
        }
    }

    // Log final summary of found sprites
    console.log("Set dressing sprite detection complete. Found sprites:", setDressingVariations);
    return setDressingVariations;
}

/**
 * Promise that resolves when an image is loaded or rejects if it fails
 */
function imageExists(imgElement) {
    return new Promise((resolve, reject) => {
        imgElement.onload = () => resolve(true);
        imgElement.onerror = () => reject(false);

        // If image is already loaded
        if (imgElement.complete) {
            if (imgElement.naturalWidth > 0) {
                resolve(true);
            } else {
                reject(false);
            }
        }
    });
}

/**
 * Add initial set dressing to the scene
 */
function addInitialSetDressing(count = 3) {
    for (let i = 0; i < count; i++) {
        addSetDressing();
    }
}

/**
 * Add a new set dressing element to the scene
 */
function addSetDressing() {
    // Check if we've reached the maximum number of set dressing elements
    if (activeSetDressing >= MAX_SET_DRESSING) {
        console.log("Maximum number of set dressing elements reached");
        return null;
    }

    // Get types of set dressing elements already in use
    const usedTypes = allSetDressing.map(item => item.type);
    
    // Choose a set dressing type that has variations available and isn't already used
    const availableTypes = SET_DRESSING_TYPES.filter(type => 
        !usedTypes.includes(type) &&
        setDressingVariations[type] && 
        setDressingVariations[type].length > 0
    );

    if (availableTypes.length === 0) {
        console.log("No unique set dressing types available");
        return null;
    }

    const randomTypeIndex = Math.floor(Math.random() * availableTypes.length);
    const selectedType = availableTypes[randomTypeIndex];

    // Find available positions that aren't already occupied
    const occupiedPositions = allSetDressing.map(item => item.position);
    const availablePositions = SET_DRESSING_POSITIONS.filter(position => 
        !occupiedPositions.some(occupied => 
            occupied[0] === position[0] && occupied[1] === position[1]
        )
    );

    // If no positions are available, use a fallback position
    if (availablePositions.length === 0) {
        console.log("No available positions, using fallback position");
        return null;
    }

    // Select a random available position
    const randomPositionIndex = Math.floor(Math.random() * availablePositions.length);
    const position = availablePositions[randomPositionIndex];

    // Create the set dressing element
    const setDressingId = `set-dressing-${activeSetDressing}`;
    const setDressingElement = document.createElement('div');
    setDressingElement.id = setDressingId;
    setDressingElement.className = 'set-dressing-sprite';
    setDressingElement.dataset.setDressingType = selectedType;
    setDressingElement.dataset.setDressingId = activeSetDressing;

    // Calculate dimensions based on type
    let width, height;
    switch(selectedType) {
        case 'bench':
            width = 144;
            height = 54;
            break;
        case 'bottle':
            width = 18;
            height = 27;
            break;
        case 'caution':
        case 'cautionalt':
            width = 36;
            height = 54;
            break;
        case 'trash':
            width = 30;
            height = 24;
            break;
        case 'trashcan':
            width = 36;
            height = 45;
            break;
        case 'backpack':
            width = 36;
            height = 40;
            break;
        case 'rat':
            width = 35;
            height = 18;
            break;
        default:
            width = 36;
            height = 36;
    }

    // Calculate actual position
    const containerWidth = gameState.elements.sceneContainer.offsetWidth;
    const containerHeight = gameState.elements.sceneContainer.offsetHeight;
    const xPos = (position[0] / 100) * containerWidth;
    const yPos = (position[1] / 100) * containerHeight;
    
    console.log(`Placing ${selectedType} at position [${xPos}px, ${yPos}px] using position index ${randomPositionIndex}`);

    // Set styles
    setDressingElement.style.position = 'absolute';
    setDressingElement.style.left = `${xPos}px`;
    setDressingElement.style.bottom = `${yPos}px`;
    setDressingElement.style.transform = 'translateX(-50%)';

    // Use the first variation as default
    const defaultVariation = setDressingVariations[selectedType][0];
    setDressingElement.style.backgroundImage = `url(assets/sprites/${defaultVariation})`;
    setDressingElement.style.backgroundSize = 'contain';
    setDressingElement.style.backgroundRepeat = 'no-repeat';
    setDressingElement.style.backgroundPosition = 'bottom center';
    
    // Set z-index to be between platform (1) and commuters (10)
    // This ensures set dressing appears above platform but below commuters
    setDressingElement.style.zIndex = '5';
    setDressingElement.style.cursor = 'pointer';
    
    // Set dimensions
    setDressingElement.style.width = `${width}px`;
    setDressingElement.style.height = `${height}px`;

    // Add to DOM
    gameState.elements.sceneContainer.appendChild(setDressingElement);

    // Add click handler
    setDressingElement.addEventListener('click', handleSetDressingClick);

    // Create set dressing object
    const setDressing = {
        id: setDressingId,
        element: setDressingElement,
        type: selectedType,
        currentVariation: defaultVariation,
        position: position,
        index: activeSetDressing,
        isNewlyAdded: false // By default, not newly added
    };

    // Add to set dressing array
    allSetDressing.push(setDressing);

    // Increment active set dressing count
    activeSetDressing++;

    console.log(`Added ${selectedType} at position [${position}] (unique type: not already in use)`);
    return setDressing;
}

/**
 * Handle set dressing click events
 */
function handleSetDressingClick(event) {
    const setDressingElement = event.currentTarget;
    const setDressingId = setDressingElement.id;
    const setDressingType = setDressingElement.dataset.setDressingType;

    console.log(`Clicked set dressing: ${setDressingId} (${setDressingType})`);

    // Check if we're transitioning
    if (gameState.isTransitioning) {
        console.log("Game is transitioning");
        return;
    }

    // Check if clicking is allowed
    if (!gameState.canClick) {
        console.log("Clicking not allowed right now");
        
        // If we've found a change already but clicking isn't re-enabled yet (after level up)
        if (gameState.currentChange && gameState.currentChange.found) {
            window.ui.showPopupMessage("take the train to continue", event.clientX, event.clientY);
        } else {
        window.ui.showPopupMessage("everyday the same", event.clientX, event.clientY);
        }
        return;
    }

    // Check if this is the current change
    if (gameState.currentChange && 
        !gameState.currentChange.found &&
        gameState.currentChange.changeType === 'setDressing' && 
        gameState.currentChange.elementId === setDressingId) {
        console.log("Correct set dressing element clicked!");

        // Mark as found
        gameState.currentChange.found = true;

        // Highlight the set dressing element with temporary pulse effect
        highlightElement(setDressingElement);
        
        // Just create a click blocker without adding permanent found-change class
        setTimeout(() => {
            // Create and add click blocker to prevent further interactions
            const clickBlocker = document.createElement('div');
            clickBlocker.className = 'click-blocker';
            gameState.elements.sceneContainer.appendChild(clickBlocker);
        }, 1500);
        
        // Add doober animation to awareness meter
        if (window.dooberSystem && window.dooberSystem.animate) {
            const awarenessContainer = document.getElementById('awareness-container');
            if (awarenessContainer) {
                window.dooberSystem.animate(setDressingElement, awarenessContainer);
            }
        }

        // Increment changes found counter
        gameState.changesFound++;

        // Get awareness gain from central calculation function
        const awarenessGain = calculateAwarenessXP();

        // Calculate if this will cause a level up
        const currentLevel = gameState.awarenessLevel;
        const currentXP = gameState.awarenessXP;
        const xpRequirements = AWARENESS_CONFIG.xpRequirements;
        const willLevelUp = (currentXP + awarenessGain) >= xpRequirements[currentLevel];

        // Increase awareness
        addAwarenessXP(awarenessGain);

        // Only show train button immediately if no level up occurred
        if (!willLevelUp) {
            console.log("Core.js: No level up, showing train button");
            if (gameState.elements.trainButton) {
                gameState.elements.trainButton.style.display = 'block';
                console.log("Train button displayed");
            } else {
                console.error("Train button element not found in gameState.elements");
            }
        }
    } else {
        console.log("Wrong set dressing element clicked or no change to find");
        
        // Get the custom message for this change
        let message = null;
        if (gameState.currentChange && !gameState.currentChange.found) {
            if (gameState.currentChange.changeType === 'commuter') {
                const fromVariation = gameState.currentChange.fromVariation;
                const toVariation = gameState.currentChange.toVariation;
                
                console.log(`Looking for message with fromVariation: "${fromVariation}", toVariation: "${toVariation}"`);
                
                // Extract base types from variations properly
                // Format could be "commuter1.png" or "commuter1_a.png"
                let fromBase, toBase;
                
                // Extract the base name (e.g., "commuter1") and variation suffix (e.g., "_a") if any
                if (fromVariation.includes('_')) {
                    // Handle variations like "commuter1_a.png"
                    fromBase = fromVariation.split('.')[0]; // "commuter1_a"
                    const mainParts = fromBase.split('_');
                    fromBase = mainParts[0]; // "commuter1"
                } else {
                    // Handle base sprites like "commuter1.png"
                    fromBase = fromVariation.split('.')[0]; // "commuter1"
                }
                
                if (toVariation.includes('_')) {
                    // Handle variations like "commuter1_a.png"
                    toBase = toVariation.split('.')[0]; // "commuter1_a"
                } else {
                    // Handle base sprites like "commuter1.png"
                    toBase = toVariation.split('.')[0]; // "commuter1"
                }
                
                console.log(`Extracted types - fromBase: "${fromBase}", toBase: "${toBase}"`);
                
                // Debug: Show available keys in CHANGE_MESSAGES.commuter
                console.log(`CHANGE_MESSAGES.commuter keys: ${Object.keys(CHANGE_MESSAGES.commuter)}`);
                
                // First, try to find the message using the exact keys we have
                if (CHANGE_MESSAGES.commuter[fromBase] && CHANGE_MESSAGES.commuter[fromBase][toBase]) {
                    message = CHANGE_MESSAGES.commuter[fromBase][toBase];
                    console.log(`Found message using fromBase[toBase]: "${message}"`);
                } else {
                    // We might need to add suffix for the variation
                    // If toBase is "commuter1" and there's a variation suffix in toVariation like "commuter1_a.png", 
                    // we need to check for "commuter1" -> "commuter1_a"
                    const toVarName = toVariation.split('.')[0]; // Remove extension
                    
                    if (CHANGE_MESSAGES.commuter[fromBase] && CHANGE_MESSAGES.commuter[fromBase][toVarName]) {
                        message = CHANGE_MESSAGES.commuter[fromBase][toVarName];
                        console.log(`Found message using fromBase[toVarName]: "${message}"`);
                    } else {
                        // Try the other direction
                        const fromVarName = fromVariation.split('.')[0]; // Remove extension
                        
                        if (CHANGE_MESSAGES.commuter[toBase] && CHANGE_MESSAGES.commuter[toBase][fromVarName]) {
                            message = CHANGE_MESSAGES.commuter[toBase][fromVarName];
                            console.log(`Found message using toBase[fromVarName]: "${message}"`);
                        } else {
                            console.log(`No message found in CHANGE_MESSAGES.commuter for these variations`);
                            if (CHANGE_MESSAGES.commuter[fromBase]) {
                                console.log(`CHANGE_MESSAGES.commuter[${fromBase}] keys: ${Object.keys(CHANGE_MESSAGES.commuter[fromBase])}`);
                            }
                            if (CHANGE_MESSAGES.commuter[toBase]) {
                                console.log(`CHANGE_MESSAGES.commuter[${toBase}] keys: ${Object.keys(CHANGE_MESSAGES.commuter[toBase])}`);
                            }
                        }
                    }
                }
                
                // If no custom message is found, use a default
                if (!message) {
                    message = "I noticed something change with that commuter...";
                }
            } else if (gameState.currentChange.changeType === 'setDressing') {
                const fromType = gameState.currentChange.fromType;
                const toType = gameState.currentChange.toType;
                
                // Check if this is a new item being added
                if (gameState.currentChange.changeAction === 'add' || gameState.currentChange.isNewlyAdded) {
                    console.log(`Looking for new set dressing message for type: ${toType}`);
                    if (CHANGE_MESSAGES.setDressing.new && CHANGE_MESSAGES.setDressing.new[toType]) {
                        message = CHANGE_MESSAGES.setDressing.new[toType];
                        console.log(`Found new set dressing message: "${message}"`);
                    } else {
                        console.log(`No message found for new set dressing type: ${toType}`);
                    }
                } else {
                    // This is a change from one type to another
                    console.log(`Looking for set dressing change message from ${fromType} to ${toType}`);
                    if (CHANGE_MESSAGES.setDressing[fromType] && CHANGE_MESSAGES.setDressing[fromType][toType]) {
                        message = CHANGE_MESSAGES.setDressing[fromType][toType];
                        console.log(`Found set dressing change message: "${message}"`);
                    } else {
                        console.log(`No message found for set dressing change from ${fromType} to ${toType}`);
                    }
                }
                
                if (!message) {
                    message = "I noticed something change with the platform...";
                }
            }
        }
        
        // Show the custom message using the UI message system instead of thought bubble
        if (message) {
            window.ui.showMessage(message, 3000, true); // Show message higher on the screen
        } else if (gameState.currentChange && !gameState.currentChange.found) {
            // If we couldn't find a message, but there is a change, show a default message
            window.ui.showMessage("Something changed, but I can't quite place it...", 3000, true);
        } else {
            // Only show random negative thought if there's no change to find
            window.core.showRandomThoughtBubble(false);
        }
        
        // Highlight the actual change based on its type
        if (gameState.currentChange && !gameState.currentChange.found) {
            if (gameState.currentChange.changeType === 'setDressing') {
                window.setDressing.highlightMissedChange();
            } else if (gameState.currentChange.changeType === 'commuter') {
                window.commuters.highlightMissedChange();
            }
        }
        
        // End the game with a summary after showing the highlight
        setTimeout(() => {
            window.core.showGameOverSummary();
        }, 1500); // Match the highlight animation duration
    }
}

/**
 * Create a new set dressing element and return the change object
 */
function createNewSetDressingElement() {
    // Check if we've reached the maximum number of set dressing elements
    if (activeSetDressing >= MAX_SET_DRESSING) {
        console.warn("Maximum number of set dressing elements reached");
        return null;
    }
    
    // Check if there are any available positions
    const occupiedPositions = allSetDressing.map(item => item.position);
    const availablePositions = SET_DRESSING_POSITIONS.filter(position => 
        !occupiedPositions.some(occupied => 
            occupied[0] === position[0] && occupied[1] === position[1]
        )
    );
    
    if (availablePositions.length === 0) {
        console.warn("No available positions for new set dressing element");
        return null;
    }
    
        // Add a new set dressing element
        const newElement = addSetDressing();
    if (!newElement) {
        console.warn("Failed to add new set dressing element");
        return null;
    }

    // Mark as newly added
    newElement.isNewlyAdded = true;
    
    // Add a subtle fade-in animation without any highlights
    newElement.element.classList.add('set-dressing-add');
    
    // Make sure it's on the right layer but without attention-grabbing effects
    newElement.element.style.zIndex = '15';
    
    // Apply only a simple fade-in animation, no pulsing or glowing effects
    newElement.element.style.animation = 'set-dressing-add 1.5s ease-out forwards';
    
    // Remove any filter effects
    newElement.element.style.filter = 'none';

        // Create change object
        const change = {
            changeType: 'setDressing',
            elementId: newElement.id,
            changeAction: 'add',
        toType: newElement.type,
            found: false
        };

    console.log("Successfully created new set dressing element:", newElement.type);
        return change;
}

/**
 * Create a set dressing element change
 */
function createSetDressingChange() {
    console.log("Creating set dressing change");

    // If no set dressing elements exist yet, always add a new one
    if (allSetDressing.length === 0) {
        console.log("No set dressing elements exist yet, adding the first one");
        return createNewSetDressingElement();
    }

    // Get types of set dressing elements already in use
    const usedTypes = allSetDressing.map(item => item.type);
    
    // Check if we still have unused types available
    const unusedTypes = SET_DRESSING_TYPES.filter(type => 
        !usedTypes.includes(type) &&
        setDressingVariations[type] && 
        setDressingVariations[type].length > 0
    );
    
    // Force alternating behavior based on the counter
    // Even numbers (0, 2, 4...) will add new elements if possible
    // Odd numbers (1, 3, 5...) will change existing elements
    setDressingChangeCounter++;
    console.log(`Set dressing change counter: ${setDressingChangeCounter}`);
    
    const shouldAddNew = (setDressingChangeCounter % 2 === 0) && 
                        (allSetDressing.length < MAX_SET_DRESSING) && 
                        (unusedTypes.length > 0);

    if (shouldAddNew) {
        console.log("Will add a new set dressing element (forced by counter)");
        return createNewSetDressingElement();
    } else {
        // Check if we can change an existing element
        if (allSetDressing.length > 0 && SET_DRESSING_TYPES.length > 1) {
            console.log("Will change an existing set dressing element (forced by counter)");
            const changedElement = changeExistingSetDressing();
            
            // If changing an existing element fails, fall back to adding a new one
            if (!changedElement && allSetDressing.length < MAX_SET_DRESSING && unusedTypes.length > 0) {
                console.log("Changing existing set dressing failed, falling back to adding a new one");
                return createNewSetDressingElement();
            }
            
            return changedElement;
        } else if (allSetDressing.length < MAX_SET_DRESSING && unusedTypes.length > 0) {
            // If we can't change (not enough variety), but can add a new one
            console.log("Not enough variety to change, adding a new set dressing element");
            return createNewSetDressingElement();
        } else {
            console.log("Cannot create any set dressing changes");
            return null;
        }
    }
}

/**
 * Change an existing set dressing element
 */
function changeExistingSetDressing() {
    // Select a random set dressing element
    if (allSetDressing.length === 0) {
        console.log("No set dressing elements to change");
        return null;
    }

    const randomIndex = Math.floor(Math.random() * allSetDressing.length);
    const setDressing = allSetDressing[randomIndex];
    console.log(`Selected set dressing to change: ${setDressing.id} (${setDressing.type})`);

    // Get all available types except the current one
    const availableTypes = SET_DRESSING_TYPES.filter(type => 
        type !== setDressing.type && 
        setDressingVariations[type] && 
        setDressingVariations[type].length > 0
    );

    if (availableTypes.length === 0) {
        console.log("No available types to change to");
        return null;
    }

    // Select a random new type
    const newType = availableTypes[Math.floor(Math.random() * availableTypes.length)];
    const oldType = setDressing.type;
    console.log(`Will change ${setDressing.id} from "${oldType}" to "${newType}"`);
    
    // Store the original properties for debugging
    const originalElement = {
        id: setDressing.id,
        type: oldType,
        position: setDressing.position
    };
    
    // Update the element's type and sprite
    setDressing.type = newType;
    setDressing.currentVariation = `${newType}.png`;
    setDressing.element.dataset.setDressingType = newType;
    
    // Update the visual appearance
    setDressing.element.style.backgroundImage = `url(assets/sprites/${newType}.png)`;
    
    // Update dimensions based on new type
    let width, height;
    switch(newType) {
        case 'bench':
            width = 144;
            height = 54;
            break;
        case 'bottle':
            width = 18;
            height = 27;
            break;
        case 'caution':
        case 'cautionalt':
            width = 36;
            height = 54;
            break;
        case 'trash':
            width = 30;
            height = 24;
            break;
        case 'trashcan':
            width = 36;
            height = 45;
            break;
        case 'backpack':
            width = 36;
            height = 40;
            break;
        case 'rat':
            width = 35;
            height = 18;
            break;
        default:
            width = 36;
            height = 36;
    }
    
    setDressing.element.style.width = `${width}px`;
    setDressing.element.style.height = `${height}px`;

    // Create change object
    const change = {
        changeType: 'setDressing',
        elementId: setDressing.id,
        fromType: oldType,
        toType: newType,
        changeAction: 'swap',
        found: false
    };
    
    // Log the complete change object
    console.log(`Changed set dressing from ${oldType} to ${newType}`);
    console.log(`Change object created:`, JSON.stringify(change, null, 2));
    console.log(`Original element:`, JSON.stringify(originalElement, null, 2));
    console.log(`Updated element: id=${setDressing.id}, type=${setDressing.type}, position=${JSON.stringify(setDressing.position)}`);

    return change;
}

/**
 * Highlight a set dressing element when a change is found
 */
function highlightElement(element) {
    if (!element) return;

    // Add highlight class for subtle glow effect
    element.classList.add('highlight-pulse');

    // Remove after animation completes
    setTimeout(() => {
        element.classList.remove('highlight-pulse');
    }, 1500);
}

/**
 * Highlight missed change at the end of a day
 */
function highlightMissedChange() {
    if (!gameState.currentChange || gameState.currentChange.changeType !== 'setDressing') return;

    // Find the set dressing element
    const setDressing = allSetDressing.find(s => s.id === gameState.currentChange.elementId);

    if (setDressing && setDressing.element) {
        console.log(`Highlighting missed set dressing change: ${setDressing.type} (${gameState.currentChange.changeAction})`);
        
        // Add no-hover class just to prevent hover animations, not clicks
        setDressing.element.classList.add('no-hover');
        
        // Add missed highlight class - this will use the same style as commuters
        setDressing.element.classList.add('highlight-missed');
        
        // Ensure the set dressing appears above other elements during highlighting
        const originalZIndex = setDressing.element.style.zIndex;
        setDressing.element.style.zIndex = '100';

        // Remove after animation completes
        setTimeout(() => {
            setDressing.element.classList.remove('highlight-missed');
            setDressing.element.classList.remove('no-hover');
            setDressing.element.style.zIndex = originalZIndex;
        }, 1500); // Match animation duration (now 1.5s)
    }
}

// Export set dressing functions and variables to window object
window.setDressing = {
    addSetDressing,
    addInitialSetDressing,
    detectSetDressingVariations,
    handleSetDressingClick,
    createSetDressingChange,
    createNewSetDressingElement,
    changeExistingSetDressing,
    highlightElement,
    highlightMissedChange,
    allSetDressing,
    activeSetDressing,
    setDressingVariations,
    MAX_SET_DRESSING,
    SET_DRESSING_POSITIONS,
    SET_DRESSING_TYPES
};