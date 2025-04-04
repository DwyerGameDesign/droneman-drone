/**
 * Drone: The Daily Commute
 * Set Dressing Management - All set dressing-related functionality
 */

// Maximum number of set dressing elements in the scene
const MAX_SET_DRESSING = 8;

// Positions for each set dressing element [left%, bottom%]
const SET_DRESSING_POSITIONS = [
    [20, 10],  // far left, low
    [40, 10],  // left-center, low
    [60, 10],  // right-center, low
    [80, 10],  // far right, low
    [15, 30],  // far left, mid
    [35, 30],  // left-center, mid
    [65, 30],  // right-center, mid
    [85, 30]   // far right, mid
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
 * Add a new set dressing element to the scene
 */
function addSetDressing() {
    // Check if we've reached the maximum number of set dressing elements
    if (activeSetDressing >= MAX_SET_DRESSING) {
        console.log("Maximum number of set dressing elements reached");
        return null;
    }

    // Choose a set dressing type that has variations available
    const availableTypes = SET_DRESSING_TYPES.filter(type => 
        setDressingVariations[type] && setDressingVariations[type].length > 0
    );

    if (availableTypes.length === 0) {
        console.log("No set dressing types available");
        return null;
    }

    const randomTypeIndex = Math.floor(Math.random() * availableTypes.length);
    const selectedType = availableTypes[randomTypeIndex];

    // Get position for this set dressing element
    const position = SET_DRESSING_POSITIONS[activeSetDressing] || [50, 20];

    // Create the set dressing element
    const setDressingId = `set-dressing-${activeSetDressing}`;
    const setDressingElement = document.createElement('div');
    setDressingElement.id = setDressingId;
    setDressingElement.className = 'set-dressing-sprite';
    setDressingElement.dataset.setDressingType = selectedType;
    setDressingElement.dataset.setDressingId = activeSetDressing;

    // Calculate actual position
    const containerWidth = gameState.elements.sceneContainer.offsetWidth;
    const containerHeight = gameState.elements.sceneContainer.offsetHeight;
    const xPos = (position[0] / 100) * containerWidth;
    const yPos = (position[1] / 100) * containerHeight;

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
    setDressingElement.style.zIndex = `${5 + activeSetDressing}`;
    setDressingElement.style.cursor = 'pointer';
    
    // Size based on type - increase sizes by 20% to improve visibility
    switch(selectedType) {
        case 'bench':
            setDressingElement.style.width = '96px';  // 80px * 1.2
            setDressingElement.style.height = '36px'; // 30px * 1.2
            break;
        case 'bottle':
            setDressingElement.style.width = '24px';  // 20px * 1.2
            setDressingElement.style.height = '36px'; // 30px * 1.2
            break;
        case 'caution':
            setDressingElement.style.width = '48px';  // 40px * 1.2
            setDressingElement.style.height = '72px'; // 60px * 1.2
            break;
        case 'trash':
            setDressingElement.style.width = '36px';  // 30px * 1.2
            setDressingElement.style.height = '30px'; // 25px * 1.2
            break;
        case 'trashcan':
            setDressingElement.style.width = '42px';  // 35px * 1.2
            setDressingElement.style.height = '54px'; // 45px * 1.2
            break;
        default:
            setDressingElement.style.width = '48px';  // 40px * 1.2
            setDressingElement.style.height = '48px'; // 40px * 1.2
    }

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

    console.log(`Added ${selectedType} at position [${position}]`);
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
        gameState.currentChange.changeType === 'setDressing' && 
        gameState.currentChange.elementId === setDressingId) {
        console.log("Correct set dressing element clicked!");
        
        // Log change action type for debugging
        console.log(`Set dressing change action: ${gameState.currentChange.changeAction}`);

        // Mark as found
        gameState.currentChange.found = true;

        // Highlight the set dressing element
        highlightElement(setDressingElement);
        
        // Add doober animation to awareness meter
        if (window.dooberSystem && window.dooberSystem.animate) {
            const awarenessContainer = document.getElementById('awareness-container');
            if (awarenessContainer) {
                window.dooberSystem.animate(setDressingElement, awarenessContainer);
            }
        }

        // Increment changes found counter
        gameState.changesFound++;

        // Calculate awareness gain based on difficulty
        const baseGain = AWARENESS_CONFIG.baseXpForFindingChange;
        const difficultyMultiplier = 1 + (gameState.day - 4) * 0.1; // 10% increase per day
        const awarenessGain = Math.floor(baseGain * difficultyMultiplier);

        // Increase awareness
        window.core.addAwarenessXP(awarenessGain);

        // Show appropriate message based on change action
        if (gameState.currentChange.changeAction === 'add') {
            window.ui.showMessage(`You found the new ${setDressingType}!`, 2000);
        } else {
            window.ui.showMessage(`You noticed the ${setDressingType} changed!`, 2000);
        }

        // Disable further clicking until next day
        gameState.canClick = false;

        // Update narrative text
        window.ui.updateNarrativeText();
    } else {
        console.log("Wrong set dressing element clicked or no change to find");
        window.ui.showMessage("I didn't notice anything different there", 1500);
    }
}

/**
 * Create a new set dressing element change
 */
function createSetDressingChange() {
    console.log("Creating set dressing change");

    // If no set dressing elements exist yet, always add a new one
    if (allSetDressing.length === 0) {
        console.log("No set dressing elements exist yet, adding the first one");
        return createNewSetDressingElement();
    }

    // Randomly decide between adding a new element or changing an existing one
    // Force adding a new element more often, especially if we have few elements
    const shouldAddNew = (allSetDressing.length < MAX_SET_DRESSING) && 
                         (Math.random() < 0.8 || allSetDressing.length < 4);

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
 * Create a new set dressing element and return the change object
 */
function createNewSetDressingElement() {
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
    applyVariation(setDressing, newVariation);

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
function applyVariation(setDressing, variation) {
    if (!setDressing || !variation) return;

    // Update the background image
    setDressing.element.style.backgroundImage = `url(assets/sprites/${variation})`;

    // Update the current variation
    setDressing.currentVariation = variation;

    console.log(`Applied variation ${variation} to ${setDressing.id}`);
}

/**
 * Highlight a set dressing element when a change is found
 */
function highlightElement(element) {
    if (!element) return;

    // Add highlight class
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
        
        // Clear any existing animations first
        setDressing.element.style.animation = '';
        
        // Add missed highlight class
        setDressing.element.classList.add('highlight-missed');
        
        // For all missed set dressing changes, make the highlight very noticeable
        // Apply a strong pulsing effect
        setDressing.element.style.animation = 'commuter-missed 1.5s 3';
        setDressing.element.style.boxShadow = '0 0 20px rgba(217, 83, 79, 0.7)';
        
        // Apply an outline to make it more visible
        setDressing.element.style.outline = '3px solid rgba(217, 83, 79, 0.7)';
        
        // Temporarily increase z-index to ensure highlight is visible
        const currentZIndex = parseInt(setDressing.element.style.zIndex || '10');
        setDressing.element.style.zIndex = (currentZIndex + 5).toString();
        
        // Show a message pointing out the missed element
        if (gameState.currentChange.changeAction === 'add') {
            window.ui.showMessage(`You missed a new ${setDressing.type} that appeared!`, 2000);
        } else {
            window.ui.showMessage(`You missed that the ${setDressing.type} changed!`, 2000);
        }

        // Remove after animation completes
        setTimeout(() => {
            setDressing.element.classList.remove('highlight-missed');
            
            // Clean up additional styles
            setDressing.element.style.boxShadow = '';
            setDressing.element.style.outline = '';
            
            // Reset to normal animation and z-index
            setDressing.element.style.animation = '';
            setDressing.element.style.zIndex = currentZIndex.toString();
            
        }, 4500); // Extended time for visibility
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
    applyVariation,
    highlightElement,
    highlightMissedChange,
    allSetDressing,
    activeSetDressing,
    setDressingVariations,
    MAX_SET_DRESSING,
    SET_DRESSING_POSITIONS,
    SET_DRESSING_TYPES
};