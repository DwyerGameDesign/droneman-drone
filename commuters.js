/**
 * Drone: The Daily Commute
 * Commuter Management - All commuter-related functionality
 */

// Maximum number of commuters in the scene
const MAX_COMMUTERS = 8;

// Positions for each commuter [left%, bottom%]
// Organized in distinct columns to prevent overlapping
const COMMUTER_POSITIONS = [
    [49, 22],
    [13, 23],
    [24, 20],
    [37, 24],
    [60, 23],
    [72, 24],
    [85, 20],
    [95, 23]
];

// Array to store all commuters
let allCommuters = [];
let activeCommuters = 0;
let commuterVariations = {};

/**
 * Detect all available commuter variations
 */
async function detectCommuterVariations() {
    console.log("Detecting commuter variations...");

    // For each potential commuter (1-8)
    for (let i = 1; i <= MAX_COMMUTERS; i++) {
        commuterVariations[`commuter${i}`] = [];

        // Check for base commuter first
        const baseImage = new Image();
        baseImage.src = `assets/sprites/commuter${i}.png`;

        try {
            await imageExists(baseImage);
            commuterVariations[`commuter${i}`].push(`commuter${i}.png`);
            
            // Only check for variations if base commuter exists
            // Only check for 'a' variation as that's the only one we know exists
            const variantImage = new Image();
            variantImage.src = `assets/sprites/commuter${i}_a.png`;
            try {
                await imageExists(variantImage);
                commuterVariations[`commuter${i}`].push(`commuter${i}_a.png`);
            } catch (error) {
                // Silently skip non-existent variations
            }
        } catch (error) {
            // If base commuter doesn't exist, skip all variations
            continue;
        }
    }

    // Log final summary of found variations
    console.log("Commuter variations detection complete. Found variations:", commuterVariations);
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
 * Add the initial commuter to the scene
 */
function addInitialCommuter() {
    addCommuter();
}

/**
 * Add a new commuter to the scene
 * @returns {Object|null} - The created commuter object or null if failed
 */
function addCommuter() {
    // Check if we've reached the maximum number of commuters
    if (activeCommuters >= MAX_COMMUTERS) {
        console.log("Maximum number of commuters reached");
        return null;
    }

    let commuterType;
    let position;

    // First commuter should always be commuter1
    if (activeCommuters === 0) {
        commuterType = "commuter1";
        position = COMMUTER_POSITIONS[0]; // Use the first position for commuter1
    } else {
        // For subsequent commuters, randomly select type and position
        
        // Get already used commuter types to avoid duplicates
        const usedTypes = allCommuters.map(commuter => commuter.type);
        
        // Find available commuter types (that have variations)
        const availableTypes = Object.keys(commuterVariations)
            .filter(type => 
                !usedTypes.includes(type) && 
                commuterVariations[type] && 
                commuterVariations[type].length > 0
            );
            
        if (availableTypes.length === 0) {
            console.log("No available commuter types left");
            return null;
        }
        
        // Randomly select a commuter type
        const randomTypeIndex = Math.floor(Math.random() * availableTypes.length);
        commuterType = availableTypes[randomTypeIndex];
        
        // Find available positions that aren't already occupied
        const occupiedPositions = allCommuters.map(commuter => commuter.position);
        const availablePositions = COMMUTER_POSITIONS.filter(pos => 
            !occupiedPositions.some(occupied => 
                occupied[0] === pos[0] && occupied[1] === pos[1]
            )
        );
        
        if (availablePositions.length === 0) {
            console.log("No available positions for commuters");
            return null;
        }
        
        // Randomly select a position
        const randomPositionIndex = Math.floor(Math.random() * availablePositions.length);
        position = availablePositions[randomPositionIndex];
    }

    // Check if we have variations for this commuter
    if (!commuterVariations[commuterType] || commuterVariations[commuterType].length === 0) {
        console.log(`No variations found for ${commuterType}`);
        return null;
    }

    // Create the commuter element
    const commuterId = `commuter-${activeCommuters}`;
    const commuterElement = document.createElement('div');
    commuterElement.id = commuterId;
    commuterElement.className = 'commuter-sprite';
    commuterElement.dataset.commuterType = commuterType;

    // Calculate actual position
    const containerWidth = gameState.elements.sceneContainer.offsetWidth;
    const containerHeight = gameState.elements.sceneContainer.offsetHeight;
    const xPos = (position[0] / 100) * containerWidth;
    const yPos = (position[1] / 100) * containerHeight;

    // Set styles
    commuterElement.style.position = 'absolute';
    commuterElement.style.left = `${xPos}px`;
    commuterElement.style.bottom = `${yPos}px`;
    commuterElement.style.transform = 'translateX(-50%)';

    // Use the first variation as default
    const defaultVariation = commuterVariations[commuterType][0];
    commuterElement.style.backgroundImage = `url(assets/sprites/${defaultVariation})`;
    commuterElement.style.backgroundSize = 'contain';
    commuterElement.style.backgroundRepeat = 'no-repeat';
    commuterElement.style.backgroundPosition = 'bottom center';
    commuterElement.style.zIndex = `${10 + activeCommuters}`;
    commuterElement.style.cursor = 'pointer';

    // Add to DOM
    gameState.elements.sceneContainer.appendChild(commuterElement);

    // Add click handler
    commuterElement.addEventListener('click', handleCommuterClick);

    // Create commuter object
    const commuter = {
        id: commuterId,
        element: commuterElement,
        type: commuterType,
        currentVariation: defaultVariation,
        position: position,
        index: activeCommuters
    };

    // Add to commuters array
    allCommuters.push(commuter);

    // Increment active commuters count
    activeCommuters++;

    console.log(`Added ${commuterType} at position [${position[0]}%, ${position[1]}%] (position index: ${COMMUTER_POSITIONS.indexOf(position)})`);
    return commuter;
}

/**
 * Handle commuter click events
 */
function handleCommuterClick(event) {
    const commuterElement = event.currentTarget;
    const commuterId = commuterElement.id;

    console.log(`Clicked commuter: ${commuterId}`);

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
        (gameState.currentChange.changeType !== 'setDressing') && 
        gameState.currentChange.commuterId === commuterId) {
        console.log("Correct commuter clicked!");
        
        // Mark as found
        gameState.currentChange.found = true;

        // Highlight the commuter
        commuters.highlightElement(commuterElement);
        
        // Add doober animation to awareness meter
        if (window.dooberSystem && window.dooberSystem.animate) {
            const awarenessContainer = document.getElementById('awareness-container');
            if (awarenessContainer) {
                window.dooberSystem.animate(commuterElement, awarenessContainer);
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
        console.log("Wrong commuter clicked or no change to find");
        
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
                if (CHANGE_MESSAGES.setDressing[fromType] && CHANGE_MESSAGES.setDressing[fromType][toType]) {
                    message = CHANGE_MESSAGES.setDressing[fromType][toType];
                } else {
                    message = "I noticed something change with the platform...";
                }
            }
        }
        
        // Show the custom message in a thought bubble from commuter1
        const commuter1 = allCommuters.find(c => c.type === 'commuter1');
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
            showRandomThoughtBubble(false);
        }
        
        // Highlight the actual change if it's a commuter change
        if (gameState.currentChange && 
            !gameState.currentChange.found && 
            gameState.currentChange.changeType !== 'setDressing') {
            window.commuters.highlightMissedChange();
        } else if (gameState.currentChange && 
            !gameState.currentChange.found && 
            gameState.currentChange.changeType === 'setDressing' &&
            window.setDressing) {
            window.setDressing.highlightMissedChange();
        }
        
        // End the game with a summary after showing the highlight
        setTimeout(() => {
            showGameOverSummary("Your awareness wasn't strong enough to notice the changes.");
        }, 4500); // Match the highlight animation duration
    }
}

/**
 * Create the first change (day 4)
 */
function createFirstChange() {
    console.log("Creating first change");

    // Get the first commuter
    const firstCommuter = allCommuters[0];
    if (!firstCommuter) return;

    // Get variations for this commuter
    const variations = commuterVariations[firstCommuter.type];
    if (!variations || variations.length <= 1) return;

    // Select a different variation than the current one
    const currentVariation = firstCommuter.currentVariation;
    const otherVariations = variations.filter(v => v !== currentVariation);

    if (otherVariations.length === 0) return;

    // Select the first alternative variation
    const newVariation = otherVariations[0];

    // Apply the change
    applyCommuterVariation(firstCommuter, newVariation);

    // Create change object
    gameState.currentChange = {
        changeType: 'commuter',
        commuterId: firstCommuter.id,
        fromVariation: currentVariation,
        toVariation: newVariation,
        found: false
    };
    
    console.log(`Created first commuter change: ${firstCommuter.type} (${firstCommuter.id}) from ${currentVariation} to ${newVariation}`);

    // Enable clicking since this is day 4 and we have a change to find
    gameState.canClick = true;

    // Initialize train button
    if (gameState.elements.trainButton) {
        gameState.elements.trainButton.style.display = 'none';
    }
}

/**
 * Create a random change for the day
 */
function createRandomChange(count = 1) {
    console.log(`Creating ${count} random changes`);

    // Select random commuters
    const availableCommuters = [...allCommuters];

    // For now we only handle one change at a time
    // Later you can expand this to handle multiple changes

    if (availableCommuters.length === 0) {
        console.warn("No commuters available to change");
        return;
    }

    // Log all available commuters for debugging
    console.log(`Available commuters for changes: ${availableCommuters.map(c => `${c.type} (${c.id})`).join(', ')}`);

    // Select a random commuter
    const randomIndex = Math.floor(Math.random() * availableCommuters.length);
    const commuter = availableCommuters[randomIndex];

    console.log(`Selected commuter for change: ${commuter.type} (${commuter.id}), index: ${randomIndex}`);

    // Get variations for this commuter
    const variations = commuterVariations[commuter.type];
    if (!variations || variations.length <= 1) {
        console.warn(`No variations available for ${commuter.type}`);
        return;
    }

    // Select a different variation than the current one
    const currentVariation = commuter.currentVariation;
    const otherVariations = variations.filter(v => v !== currentVariation);

    if (otherVariations.length === 0) {
        console.warn(`No alternative variations for ${commuter.type}`);
        return;
    }

    // Select a random variation
    const newVariation = otherVariations[Math.floor(Math.random() * otherVariations.length)];

    // Apply the change
    applyCommuterVariation(commuter, newVariation);

    // Create change object - store the commuter ID properly
    gameState.currentChange = {
        changeType: 'commuter',
        commuterId: commuter.id, // Make sure this matches the DOM element ID
        fromVariation: currentVariation,
        toVariation: newVariation,
        found: false
    };
    
    // Verify the DOM element exists
    const commuterElement = document.getElementById(commuter.id);
    if (commuterElement) {
        console.log(`DOM element for ${commuter.id} exists and is valid`);
    } else {
        console.error(`DOM element for ${commuter.id} NOT FOUND - this will cause click detection to fail!`);
    }
    
    console.log(`Created commuter change: ${commuter.type} (${commuter.id}) from ${currentVariation} to ${newVariation}`);
    console.log(`Change object: ${JSON.stringify(gameState.currentChange)}`);
    
    // Enable clicking to find the change
    gameState.canClick = true;
}

/**
 * Apply a variation to a commuter
 */
function applyCommuterVariation(commuter, variation) {
    if (!commuter || !variation) return;

    // Update the background image
    commuter.element.style.backgroundImage = `url(assets/sprites/${variation})`;

    // Update the current variation
    commuter.currentVariation = variation;

    console.log(`[COMMUTER] Applied variation ${variation} to ${commuter.id} (type: ${commuter.type})`);
}

/**
 * Highlight a commuter when a change is found
 */
function highlightElement(element) {
    if (!element) return;

    // Simply add highlight class for glow effect - CSS handles positioning
    element.classList.add('highlight-pulse');

    // Remove highlight after animation completes
    setTimeout(() => {
        element.classList.remove('highlight-pulse');
    }, 1500);
}

/**
 * Highlight missed change at the end of a day
 */
function highlightMissedChange() {
    if (!gameState.currentChange) {
        console.warn("Cannot highlight missed change - no currentChange exists");
        return;
    }

    console.log(`Highlighting missed change: ${JSON.stringify(gameState.currentChange)}`);

    // Find the commuter
    const commuter = allCommuters.find(c => c.id === gameState.currentChange.commuterId);

    if (commuter && commuter.element) {
        console.log(`Found commuter to highlight: ${commuter.type} (${commuter.id})`);
        
        // Remove new-commuter class if it exists to prevent animation
        if (commuter.element.classList.contains('new-commuter')) {
            commuter.element.classList.remove('new-commuter');
        }
        
        // Add missed highlight class - CSS handles positioning and animation
        commuter.element.classList.add('highlight-missed');
        
        // Remove after animation completes
        setTimeout(() => {
            commuter.element.classList.remove('highlight-missed');
        }, 1500); // Match animation duration (now 1.5s)
    } else {
        console.error(`Could not find commuter with ID ${gameState.currentChange.commuterId} to highlight!`);
        console.log(`Available commuters: ${allCommuters.map(c => `${c.type} (${c.id})`).join(', ')}`);
    }
}

/**
 * Show a hint to help the player
 */
function showHint() {
    // Only provide hint if there is an active change
    if (!gameState.currentChange) {
        showMessage("No changes to find yet. Take the train!", 1500);
        return;
    }

    // Find the commuter for the current change
    const commuter = allCommuters.find(c => c.id === gameState.currentChange.commuterId);

    if (commuter && commuter.element && !gameState.currentChange.found) {
        // Determine which quadrant the change is in
        const rect = commuter.element.getBoundingClientRect();
        const sceneRect = sceneContainer.getBoundingClientRect();

        const isTop = rect.top < (sceneRect.top + sceneRect.height / 2);
        const isLeft = rect.left < (sceneRect.left + sceneRect.width / 2);

        let location = isTop ? 'top' : 'bottom';
        location += isLeft ? ' left' : ' right';

        // Show hint message
        showMessage(`Look for a change in the ${location} area`, 2000);

        // Disable hint button temporarily
        const hintButton = document.getElementById('hint-button');
        if (hintButton) {
            hintButton.disabled = true;
            setTimeout(() => {
                hintButton.disabled = false;
            }, 5000);
        }
    } else {
        showMessage("No unfound changes left today", 1500);
    }
}

// Export commuter functions and variables to window object
window.commuters = {
    addCommuter,
    addInitialCommuter,
    detectCommuterVariations,
    handleCommuterClick,
    createFirstChange,
    createRandomChange,
    applyCommuterVariation,
    highlightElement,
    highlightMissedChange,
    allCommuters,
    activeCommuters,
    commuterVariations,
    MAX_COMMUTERS,
    COMMUTER_POSITIONS
};