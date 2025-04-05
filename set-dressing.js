/**
 * Drone: The Daily Commute
 * Set Dressing Management - All set dressing-related functionality
 */

// Maximum number of set dressing elements in the scene
const MAX_SET_DRESSING = 8;

// Positions for each set dressing element [left%, bottom%]
// Positioned in columns offset from commuter positions to prevent overlapping
const SET_DRESSING_POSITIONS = [
    [22, 15],   // Column 1.5 - Between far left and left
    [45, 16],   // Column 2.5 - Between left and center
    [65, 15],   // Column 3.5 - Between center and right
    [80, 14],   // Column 4.5 - Between right and far right
    [95, 15],   // Column 5.5 - Rightmost edge
    [8, 16],    // Column 0.5 - Leftmost edge
    [35, 17],   // Column 2.25 - Between left and left-center
    [55, 15]    // Column 3.25 - Between center and right-center
];

// Types of set dressing elements - updated to match your available sprites
const SET_DRESSING_TYPES = [
    'bench',
    'bottle',
    'caution',
    'trash',
    'trashcan'
];

// Array to store all set dressing elements
let allSetDressing = [];
let activeSetDressing = 0;
let setDressingVariations = {};

/**
 * Detect all available set dressing variations
 */
async function detectSetDressingVariations() {
    console.log("Detecting set dressing variations...");

    // For each set dressing type
    for (const type of SET_DRESSING_TYPES) {
        setDressingVariations[type] = [];

        // Check for base set dressing element first
        const baseImage = new Image();
        baseImage.src = `assets/sprites/${type}.png`;

        try {
            await imageExists(baseImage);
            setDressingVariations[type].push(`${type}.png`);
            
            // Only check for variations if base element exists
            // Check for 'a' variation (specifically known for caution_a)
            const variations = ['a'];
            for (const variant of variations) {
                const variantImage = new Image();
                variantImage.src = `assets/sprites/${type}_${variant}.png`;
                try {
                    await imageExists(variantImage);
                    setDressingVariations[type].push(`${type}_${variant}.png`);
                } catch (error) {
                    // Silently skip non-existent variations
                }
            }
        } catch (error) {
            // If base element doesn't exist, skip all variations
            continue;
        }
    }

    // Log final summary of found variations
    console.log("Set dressing variations detection complete. Found variations:", setDressingVariations);
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
        window.ui.showPopupMessage("everyday the same", event.clientX, event.clientY);
        return;
    }

    // Check if this is the current change
    if (gameState.currentChange && 
        !gameState.currentChange.found &&
        gameState.currentChange.changeType === 'setDressing' && 
        gameState.currentChange.elementId === setDressingId) {
        console.log("Correct set dressing element clicked!");
        
        // Log change action type for debugging
        console.log(`Set dressing change action: ${gameState.currentChange.changeAction}`);

        // Mark as found
        gameState.currentChange.found = true;

        // Highlight the set dressing element with temporary pulse effect
        highlightElement(setDressingElement);
        
        // Add permanent glow effect after the initial highlight animation
        setTimeout(() => {
            setDressingElement.classList.add('found-change');
            
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

        // Get awareness gain from core calculation function
        const awarenessGain = window.core.calculateAwarenessXP();

        // Increase awareness
        window.core.addAwarenessXP(awarenessGain);

        // Show appropriate message based on change action
        if (gameState.currentChange.changeAction === 'add') {
            window.ui.showMessage(`You found the new ${setDressingType}!`, 2000);
        } else {
            window.ui.showMessage(`You noticed the ${setDressingType} changed!`, 2000);
        }

        // Show positive thought bubble from a random commuter
        window.core.showRandomThoughtBubble(true);
        
        // Show train button so player can proceed
        if (gameState.elements.trainButton) {
            gameState.elements.trainButton.style.display = 'block';
        }
        
        // Disable clicking until next day
        gameState.canClick = false;

        // Update narrative text
        window.ui.updateNarrativeText();
    } else {
        console.log("Wrong set dressing element clicked or no change to find");
        
        // Show message about wrong choice
        window.ui.showMessage("That's not what changed...", 1500);
        
        // Highlight the actual change if it exists and hasn't been found
        if (gameState.currentChange && 
            !gameState.currentChange.found && 
            gameState.currentChange.changeType === 'setDressing') {
            highlightMissedChange();
        } else if (gameState.currentChange && 
            !gameState.currentChange.found && 
            gameState.currentChange.changeType !== 'setDressing') {
            // If it's a commuter change that was missed, highlight that instead
            window.core.highlightMissedChange();
        }
        
        // Show negative thought bubble from a random commuter
        window.core.showRandomThoughtBubble(false);
        
        // End the game with a summary after showing the highlight
        setTimeout(() => {
            window.core.showGameOverSummary("Your awareness wasn't strong enough to notice the changes.");
        }, 1500);
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

    // Get variations for this set dressing
    const variations = setDressingVariations[setDressing.type];
    if (!variations || variations.length <= 1) return null;

    // Select a different variation than the current one
    const currentVariation = setDressing.currentVariation;
    const otherVariations = variations.filter(v => v !== currentVariation);

    if (otherVariations.length === 0) return null;

    // Select a random variation
    const newVariation = otherVariations[Math.floor(Math.random() * otherVariations.length)];

    // Apply the change
    applySetDressingVariation(setDressing, newVariation);

    // Create change object
    const change = {
        changeType: 'setDressing',
        elementId: setDressing.id,
        fromVariation: currentVariation,
        toVariation: newVariation,
        changeAction: 'change',
        found: false
    };

    return change;
}

/**
 * Apply a variation to a set dressing element
 */
function applySetDressingVariation(setDressing, variation) {
    if (!setDressing || !variation) return;

    // Update the background image
    setDressing.element.style.backgroundImage = `url(assets/sprites/${variation})`;

    // Update the current variation
    setDressing.currentVariation = variation;

    console.log(`[SET DRESSING] Applied variation ${variation} to ${setDressing.id} (type: ${setDressing.type})`);
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
        
        // Add missed highlight class - this will use the same style as commuters
        setDressing.element.classList.add('highlight-missed');
        
        // Show a message pointing out the missed element
        if (gameState.currentChange.changeAction === 'add') {
            window.ui.showMessage(`You missed a new ${setDressing.type} that appeared!`, 2000);
        } else {
            window.ui.showMessage(`You missed that the ${setDressing.type} changed!`, 2000);
        }

        // Remove after animation completes
        setTimeout(() => {
            setDressing.element.classList.remove('highlight-missed');
        }, 1500);
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
    applySetDressingVariation,
    highlightElement,
    highlightMissedChange,
    allSetDressing,
    activeSetDressing,
    setDressingVariations,
    MAX_SET_DRESSING,
    SET_DRESSING_POSITIONS,
    SET_DRESSING_TYPES
};