/**
 * Drone: The Daily Commute
 * Commuter Management - All commuter-related functionality
 */

// Maximum number of commuters in the scene
const MAX_COMMUTERS = 8;

// Positions for each commuter [left%, bottom%]
const COMMUTER_POSITIONS = [
    [50, 20],  // center
    [30, 20],  // left of center
    [70, 20],  // right of center
    [15, 20],  // far left
    [85, 20],  // far right
    [40, 20],  // left-center
    [60, 20],  // right-center
    [75, 20]   // near right
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
 */
function addCommuter() {
    // Check if we've reached the maximum number of commuters
    if (activeCommuters >= MAX_COMMUTERS) {
        console.log("Maximum number of commuters reached");
        return null;
    }

    const commuterIndex = activeCommuters + 1;
    const commuterType = `commuter${commuterIndex}`;

    // Check if we have variations for this commuter
    if (!commuterVariations[commuterType] || commuterVariations[commuterType].length === 0) {
        console.log(`No variations found for ${commuterType}`);
        return null;
    }

    // Get position for this commuter
    const position = COMMUTER_POSITIONS[activeCommuters] || [50, 20];

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

    console.log(`Added ${commuterType} at position ${position}`);
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
        window.ui.showPopupMessage("everyday the same", event.clientX, event.clientY);
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

        // Highlight the commuter with temporary pulse effect
        highlightElement(commuterElement);
        
        // Add permanent glow effect after the initial highlight animation
        setTimeout(() => {
            commuterElement.classList.add('found-change');
            
            // Create and add click blocker to prevent further interactions
            const clickBlocker = document.createElement('div');
            clickBlocker.className = 'click-blocker';
            gameState.elements.sceneContainer.appendChild(clickBlocker);
        }, 1500);
        
        // Add doober animation to awareness meter
        if (window.dooberSystem && window.dooberSystem.animate) {
            const awarenessContainer = document.getElementById('awareness-container');
            if (awarenessContainer) {
                window.dooberSystem.animate(commuterElement, awarenessContainer);
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

        // Show positive thought bubble from a random commuter
        window.core.showRandomThoughtBubble(true);

        // Enable train button so player can proceed
        if (gameState.elements.trainButton) {
            gameState.elements.trainButton.disabled = false;
        }
        
        // Disable clicking until next day
        gameState.canClick = false;
        
        // Update narrative text
        window.ui.updateNarrativeText();
    } else {
        console.log("Wrong commuter clicked or no change to find");
        
        // Show a message about the wrong choice
        window.ui.showMessage("That's not what changed...", 1500);
        
        // Highlight the actual change if it's a commuter change
        if (gameState.currentChange && 
            !gameState.currentChange.found && 
            gameState.currentChange.changeType !== 'setDressing') {
            highlightMissedChange();
        } else if (gameState.currentChange && 
            !gameState.currentChange.found && 
            gameState.currentChange.changeType === 'setDressing' &&
            window.setDressing) {
            window.setDressing.highlightMissedChange();
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
    applyVariation(firstCommuter, newVariation);

    // Create change object
    gameState.currentChange = {
        commuterId: firstCommuter.id,
        fromVariation: currentVariation,
        toVariation: newVariation,
        found: false
    };

    // Enable clicking since this is day 4 and we have a change to find
    gameState.canClick = true;
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

    if (availableCommuters.length === 0) return;

    // Select a random commuter
    const randomIndex = Math.floor(Math.random() * availableCommuters.length);
    const commuter = availableCommuters[randomIndex];

    // Get variations for this commuter
    const variations = commuterVariations[commuter.type];
    if (!variations || variations.length <= 1) return;

    // Select a different variation than the current one
    const currentVariation = commuter.currentVariation;
    const otherVariations = variations.filter(v => v !== currentVariation);

    if (otherVariations.length === 0) return;

    // Select a random variation
    const newVariation = otherVariations[Math.floor(Math.random() * otherVariations.length)];

    // Apply the change
    applyVariation(commuter, newVariation);

    // Create change object
    gameState.currentChange = {
        commuterId: commuter.id,
        fromVariation: currentVariation,
        toVariation: newVariation,
        found: false
    };
}

/**
 * Apply a variation to a commuter
 */
function applyVariation(commuter, variation) {
    if (!commuter || !variation) return;

    // Update the background image
    commuter.element.style.backgroundImage = `url(assets/sprites/${variation})`;

    // Update the current variation
    commuter.currentVariation = variation;

    console.log(`Applied variation ${variation} to ${commuter.id}`);
}

/**
 * Highlight a commuter when a change is found
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
    if (!gameState.currentChange) return;

    // Find the commuter
    const commuter = allCommuters.find(c => c.id === gameState.currentChange.commuterId);

    if (commuter && commuter.element) {
        // Add missed highlight class
        commuter.element.classList.add('highlight-missed');

        // Remove after animation completes
        setTimeout(() => {
            commuter.element.classList.remove('highlight-missed');
        }, 1500);
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
    applyVariation,
    highlightElement,
    highlightMissedChange,
    allCommuters,
    activeCommuters,
    commuterVariations,
    MAX_COMMUTERS,
    COMMUTER_POSITIONS
};