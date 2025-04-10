/**
 * Drone: The Daily Commute
 * Set Dressing Management - All set dressing-related functionality
 */

// Maximum number of set dressing elements in the scene
const MAX_SET_DRESSING = 8;

// Positions for each set dressing element [left%, bottom%]
// Positioned in columns offset from commuter positions to prevent overlapping
const SET_DRESSING_POSITIONS = [
    [4, 21],
    [18, 22],
    [31, 23],
    [43, 21],
    [55, 24],
    [65, 22],
    [78, 23],
    [91, 21]
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
 * Check if a position would overlap with existing set dressing or commuters
 * @param {number} xPos - X position in pixels
 * @param {number} yPos - Y position in pixels
 * @param {number} width - Width of new element
 * @param {number} height - Height of new element
 * @param {number} buffer - Additional buffer space to prevent close placement
 * @returns {boolean} - True if position overlaps with existing elements
 */
function checkForOverlap(xPos, yPos, width, height, buffer = 20) {
    // Add buffer to dimensions to prevent elements from being too close
    const adjustedWidth = width + buffer;
    const adjustedHeight = height + buffer;
    
    // Check against all existing set dressing elements
    for (const dressing of allSetDressing) {
        if (!dressing.element) continue;
        
        // Get element position and size
        const rect = dressing.element.getBoundingClientRect();
        const sceneRect = gameState.elements.sceneContainer.getBoundingClientRect();
        
        // Convert to same coordinate system as new element
        const elementLeft = rect.left - sceneRect.left;
        const elementBottom = sceneRect.bottom - rect.bottom;
        const elementWidth = rect.width;
        const elementHeight = rect.height;
        
        // Check for overlap using rectangles
        if (
            xPos - adjustedWidth/2 < elementLeft + elementWidth/2 + buffer &&
            xPos + adjustedWidth/2 > elementLeft - elementWidth/2 - buffer &&
            yPos - adjustedHeight < elementBottom + elementHeight + buffer &&
            yPos > elementBottom - buffer
        ) {
            return true; // Overlap detected
        }
    }
    
    // Check against all commuters as well
    if (window.commuters && window.commuters.allCommuters) {
        for (const commuter of window.commuters.allCommuters) {
            if (!commuter.element) continue;
            
            // Get element position and size
            const rect = commuter.element.getBoundingClientRect();
            const sceneRect = gameState.elements.sceneContainer.getBoundingClientRect();
            
            // Convert to same coordinate system as new element
            const elementLeft = rect.left - sceneRect.left;
            const elementBottom = sceneRect.bottom - rect.bottom;
            const elementWidth = rect.width;
            const elementHeight = rect.height;
            
            // Use a larger buffer for commuters since they're more important
            const commuterBuffer = buffer * 1.5;
            
            // Check for overlap using rectangles
            if (
                xPos - adjustedWidth/2 < elementLeft + elementWidth/2 + commuterBuffer &&
                xPos + adjustedWidth/2 > elementLeft - elementWidth/2 - commuterBuffer &&
                yPos - adjustedHeight < elementBottom + elementHeight + commuterBuffer &&
                yPos > elementBottom - commuterBuffer
            ) {
                console.log(`Overlap detected with commuter ${commuter.id}`);
                return true; // Overlap detected
            }
        }
    }
    
    return false; // No overlap
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
        //case 'fireextinguisher':
        //    width = 36;
        //    height = 36;
        //    break;
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
    let xPos, yPos, adjustedYPercent;
    let attempts = 0;
    const maxAttempts = 10;
    
    // Try to find a position without overlap within the selected position area
    do {
        // Get base position
        const baseX = position[0];
        const baseY = position[1];
        
        // Add minor randomness to positions (±2% for Y, ±1% for X)
        // Reduced randomness to stay closer to the selected position
        const randomXOffset = (Math.random() * 2 - 1);
        const randomYOffset = (Math.random() * 4 - 2);
        
        const adjustedXPercent = baseX + randomXOffset;
        adjustedYPercent = baseY + randomYOffset;
        
        xPos = (adjustedXPercent / 100) * containerWidth;
        yPos = (adjustedYPercent / 100) * containerHeight;
        
        attempts++;
    } while (attempts < maxAttempts && checkForOverlap(xPos, yPos, width, height));
    
    if (attempts >= maxAttempts) {
        console.log(`Couldn't find non-overlapping position for ${selectedType} after ${maxAttempts} attempts`);
    }
    
    console.log(`Placing ${selectedType} at position [${xPos}px, ${yPos}px] (attempt ${attempts}) using position index ${randomPositionIndex}`);

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

        // Show positive thought bubble from a random commuter
        showRandomThoughtBubble(true);

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
        
        // Update narrative text
        window.ui.updateNarrativeText();
    } else {
        console.log("Wrong set dressing element clicked or no change to find");
        
        // Get the custom message for this change
        let message = null;
        if (gameState.currentChange && !gameState.currentChange.found) {
            if (gameState.currentChange.changeType === 'commuter') {
                const fromVariation = gameState.currentChange.fromVariation;
                const toVariation = gameState.currentChange.toVariation;
                
                // Extract base types from variations
                const fromBase = fromVariation.split('_')[0];
                const toBase = toVariation.split('_')[0];
                
                // Try both directions of lookup
                if (CHANGE_MESSAGES.commuter[fromBase] && 
                    CHANGE_MESSAGES.commuter[fromBase][toVariation]) {
                    message = CHANGE_MESSAGES.commuter[fromBase][toVariation];
                } else if (CHANGE_MESSAGES.commuter[toBase] && 
                    CHANGE_MESSAGES.commuter[toBase][fromVariation]) {
                    message = CHANGE_MESSAGES.commuter[toBase][fromVariation];
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
        
        // Show the custom message in a thought bubble from commuter1
        const commuter1 = window.commuters.allCommuters.find(c => c.type === 'commuter1');
        if (commuter1 && commuter1.element && message) {
            window.ui.showThoughtBubble(commuter1.element, message, false);
            
            // Don't show random thought bubble since we're already showing a custom message
        } else if (gameState.currentChange && !gameState.currentChange.found) {
            // If we couldn't find commuter1 or a message, but there is a change, show a default message
            if (commuter1 && commuter1.element) {
                window.ui.showThoughtBubble(commuter1.element, "Something changed, but I can't quite place it...", false);
            }
        } else {
            // Only show random negative thought if there's no change to find
            window.core.showRandomThoughtBubble(false);
        }
        
        // Highlight the actual change if it's a set dressing change
        if (gameState.currentChange && 
            !gameState.currentChange.found && 
            gameState.currentChange.changeType === 'setDressing') {
            window.setDressing.highlightMissedChange();
        }
        
        // End the game with a summary after showing the highlight
        setTimeout(() => {
            window.core.showGameOverSummary("Your awareness wasn't strong enough to notice the changes.");
        }, 4500); // Match the highlight animation duration
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
    
    // Determine whether to add a new element or change an existing one
    // If we still have unique types available, prefer adding new elements
    const shouldAddNew = (allSetDressing.length < MAX_SET_DRESSING) && 
                       (unusedTypes.length > 0 || Math.random() < 0.8 || allSetDressing.length < 4);

    if (shouldAddNew) {
        console.log("Will add a new set dressing element");
        return createNewSetDressingElement();
    } else {
        // Change an existing set dressing element
        console.log("Will change an existing set dressing element");
        const changedElement = changeExistingSetDressing();
        
        // If changing an existing element fails, fall back to adding a new one
        if (!changedElement && allSetDressing.length < MAX_SET_DRESSING) {
            console.log("Changing existing set dressing failed, falling back to adding a new one");
            return createNewSetDressingElement();
        }
        
        return changedElement;
    }
}

/**
 * Change an existing set dressing element
 */
function changeExistingSetDressing() {
    // Select a random set dressing element
    if (allSetDressing.length === 0) return null;

    const randomIndex = Math.floor(Math.random() * allSetDressing.length);
    const setDressing = allSetDressing[randomIndex];

    // Get all available types except the current one
    const availableTypes = SET_DRESSING_TYPES.filter(type => 
        type !== setDressing.type && 
        setDressingVariations[type] && 
        setDressingVariations[type].length > 0
    );

    if (availableTypes.length === 0) return null;

    // Select a random new type
    const newType = availableTypes[Math.floor(Math.random() * availableTypes.length)];
    const oldType = setDressing.type;
    
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

    console.log(`Changed set dressing from ${oldType} to ${newType}`);
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