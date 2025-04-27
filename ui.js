/**
 * Drone: The Daily Commute
 * UI and Display - All UI and display-related functions
 */

// Debug mode flag - set to false for playtesting
const DEBUG_MODE = false;

/**
 * Update the awareness display
 */
function updateAwarenessDisplay() {
    // Update meter if available
    if (awarenessMeter) {
        awarenessMeter.setProgress(gameState.awarenessLevel, gameState.awarenessXP);
    }
}

/**
 * Update the narrative text based on the current awareness level
 */
function updateNarrativeText() {
    if (!gameState.typewriter) return;

    // For day 1, always use the specific text
    if (gameState.day === 1) {
        console.log("Day 1: Using specific narrative text 'everyday the same...'");
        gameState.typewriter.type("everyday the same... until you look closer.");
        return;
    }

    // Choose the appropriate narrative set based on awareness level
    let narrativeSet = 'early';
    if (gameState.awarenessLevel >= 8) {
        narrativeSet = 'final';
    } else if (gameState.awarenessLevel >= 5) {
        narrativeSet = 'late';
    } else if (gameState.awarenessLevel >= 3) {
        narrativeSet = 'mid';
    }
    
    // Get narratives from config
    const narratives = DAY_NARRATIVES[narrativeSet];
    
    // Select a random narrative from the appropriate set
    const randomIndex = Math.floor(Math.random() * narratives.length);
    const text = narratives[randomIndex];

    console.log(`Day ${gameState.day}: Using '${narrativeSet}' narrative: "${text}"`);
    gameState.typewriter.type(text);
}

/**
 * Show narrative text when a segment is filled
 */
function showSegmentNarrative(segmentNumber) {
    if (!gameState.typewriter) return;

    // Choose the appropriate narrative set based on level
    let narrativeSet = 'early';
    if (segmentNumber >= 8) {
        narrativeSet = 'final';
    } else if (segmentNumber >= 5) {
        narrativeSet = 'late';
    } else if (segmentNumber >= 3) {
        narrativeSet = 'mid';
    }
    
    // Get narratives from config
    const narratives = LEVEL_UP_NARRATIVES[narrativeSet];
    
    // Select a random narrative from the appropriate set
    const randomIndex = Math.floor(Math.random() * narratives.length);
    const text = narratives[randomIndex];
    
    // Display the narrative
    gameState.typewriter.stop();
    gameState.elements.narrativeText.textContent = '';
        setTimeout(() => {
        gameState.typewriter.type(text);
        }, 100);
}

/**
 * Update typewriter text
 */
function updateTypewriterText(text) {
    if (typewriter) {
        typewriter.stop();
        narrativeText.textContent = '';
        setTimeout(() => {
            typewriter.type(text);
        }, 100);
    } else {
        narrativeText.textContent = text;
    }
}

/**
 * Show a message for a specified duration
 * @param {string} text - The message text to display
 * @param {number} duration - How long to display the message in milliseconds
 * @param {boolean} positionHigher - Whether to position the message higher on the screen
 */
function showMessage(text, duration = 2000, positionHigher = false) {
    message.textContent = text;
    message.style.visibility = 'visible';
    
    // Position the message higher if requested
    if (positionHigher) {
        message.style.top = '20%'; // Higher position
        message.style.fontSize = '1.2em'; // Slightly larger font
    } else {
        message.style.top = '30%'; // Default position
        message.style.fontSize = '1em'; // Default font size
    }

    setTimeout(() => {
        message.style.visibility = 'hidden';
        // Reset position and font size after hiding
        message.style.top = '30%';
        message.style.fontSize = '1em';
    }, duration);
}

/**
 * Show a popup message at the click location
 */
function showPopupMessage(text, x, y) {
    // Find or create the popup element
    let popup = document.getElementById('popup-message');

    if (!popup) {
        popup = document.createElement('div');
        popup.id = 'popup-message';
        document.body.appendChild(popup);

        // Style the popup
        popup.style.position = 'absolute';
        popup.style.padding = '8px 12px';
        popup.style.backgroundColor = 'rgba(20, 20, 20, 0.8)';
        popup.style.color = '#d4d4c8';
        popup.style.borderRadius = '5px';
        popup.style.fontSize = '14px';
        popup.style.fontFamily = "'Courier New', monospace";
        popup.style.zIndex = '1000';
        popup.style.pointerEvents = 'none'; // Let clicks pass through
        popup.style.transition = 'opacity 0.5s ease';
    }

    // Set the text and position
    popup.textContent = text;
    popup.style.left = `${x}px`;
    popup.style.top = `${y}px`;
    popup.style.opacity = '1';

    // Show and then fade out
    clearTimeout(popup.fadeTimeout);
    popup.style.display = 'block';

    popup.fadeTimeout = setTimeout(() => {
        popup.style.opacity = '0';
        setTimeout(() => {
            popup.style.display = 'none';
        }, 500);
    }, 2000);
}

/**
 * Show a thought bubble with text
 * @param {HTMLElement} element - The element to attach the thought bubble to
 * @param {string} text - The thought text
 * @param {boolean} isPositive - Whether it's a positive or negative thought
 */
function showThoughtBubble(element, text, isPositive) {
    if (!element) return;
    
    // Create a temporary thought bubble
    const thoughtBubble = document.createElement('div');
    thoughtBubble.className = isPositive ? 'thought-bubble temp-thought' : 'thought-bubble temp-thought negative';
    thoughtBubble.textContent = text;
    
    // Position the bubble above the element
    const rect = element.getBoundingClientRect();
    const sceneRect = gameState.elements.sceneContainer.getBoundingClientRect();
    
    // Calculate position, keeping bubble inside the scene container
    let leftPos = rect.left + rect.width/2 - sceneRect.left;
    let bottomPos = sceneRect.bottom - rect.top + 10;
    
    // Create and style the bubble
    thoughtBubble.style.position = 'absolute';
    thoughtBubble.style.left = `${leftPos}px`;
    thoughtBubble.style.bottom = `${bottomPos}px`;
    thoughtBubble.style.transform = 'translateX(-50%)';
    
    // Add speech bubble tail
    const tail = document.createElement('div');
    tail.style.position = 'absolute';
    tail.style.bottom = '-8px';
    tail.style.left = '50%';
    tail.style.transform = 'translateX(-50%)';
    tail.style.width = '0';
    tail.style.height = '0';
    tail.style.borderLeft = '8px solid transparent';
    tail.style.borderRight = '8px solid transparent';
    tail.style.borderTop = isPositive ? '8px solid #d4d4c8' : '8px solid #e6a4a4';
    thoughtBubble.appendChild(tail);
    
    // Add to scene
    gameState.elements.sceneContainer.appendChild(thoughtBubble);
    
    // Remove after animation completes
    setTimeout(() => {
        if (thoughtBubble.parentNode) {
            thoughtBubble.parentNode.removeChild(thoughtBubble);
        }
    }, 3000);
}

function showSegmentConnectionNarrative(segmentNumber) {
    // Define narratives about noticing someone new
    const narratives = [
        "Wait... who's that? I don't think I've seen them before. Something about them draws my attention.",
        "A new face on the platform. They seem different from the usual crowd. I feel a strange connection.",
        "Another commuter appears. There's something familiar about them, like we've met in a dream.",
        "Someone new joins the platform. Our eyes meet briefly, and I feel a spark of recognition.",
        "I notice another person waiting for the train. Something about their presence feels significant.",
        "A stranger appears, but somehow they don't feel like a stranger. It's as if I was meant to notice them.",
        "Another commuter materializes on the platform. I feel drawn to them in a way I can't explain.",
        "Someone new is waiting for the train. They seem to radiate an awareness I'm only beginning to understand.",
        "A new face emerges from the crowd. Something about them resonates with my awakening consciousness."
    ];

    // Get the narrative for this segment (0-indexed array)
    const narrative = narratives[(segmentNumber - 1) % narratives.length] ||
        "Another commuter appears, and they seem different from the others...";

    // Update the narrative display
    if (typewriter) {
        typewriter.stop();
        narrativeText.textContent = '';
        setTimeout(() => {
            typewriter.type(narrative);
        }, 100);
    } else {
        narrativeText.textContent = narrative;
    }
}

/**
 * Game completion
 */
function gameComplete() {
    const sceneContainer = gameState.elements.sceneContainer;
    const trainButton = gameState.elements.trainButton;
    
    sceneContainer.classList.add('completion');

    setTimeout(() => {
        const completionMessage = document.createElement('div');
        completionMessage.className = 'completion-message';
        completionMessage.innerHTML = `
            <h2>DRONE NO MORE</h2>
            <p>You've reached 100% awareness and broken free from the daily grind.</p>
            <p>Days on the train: ${gameState.day}</p>
            <p>Changes found: ${gameState.changesFound}</p>
        `;

        // Style the completion message
        Object.assign(completionMessage.style, {
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            color: '#d4d4c8',
            padding: '20px',
            textAlign: 'center',
            zIndex: '1000',
            borderRadius: '5px'
        });

        sceneContainer.appendChild(completionMessage);
        updateTypewriterText("DRONE NO MORE, I'M MY OWN MAN. You've broken free from the cycle.");

        if (trainButton) {
            trainButton.disabled = true;
        }
    }, 2000);
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
    const commuter = commuters.allCommuters.find(c => c.id === gameState.currentChange.commuterId);

    if (commuter && commuter.element && !gameState.currentChange.found) {
        // Determine which quadrant the change is in
        const rect = commuter.element.getBoundingClientRect();
        const sceneRect = gameState.elements.sceneContainer.getBoundingClientRect();

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

/**
 * Create debug button for showing positions
 */
function createDebugButton() {
    // Only create debug button if DEBUG_MODE is true
    if (!DEBUG_MODE) return;

    // Create debug button
    const debugButton = document.createElement('button');
    debugButton.id = 'debug-positions-button';
    debugButton.textContent = 'Debug Positions';
    
    // Add the debug button to the document
    document.body.appendChild(debugButton);
    
    // Add click event listener
    debugButton.addEventListener('click', debugPositions);
}

/**
 * Debug function to show all positions
 */
function debugPositions() {
    console.log("Debugging positions - displaying all commuters and set dressing");
    
    // Clear existing elements
    clearAllElements();
    
    // Add all commuters in their positions
    for (let i = 0; i < window.commuters.COMMUTER_POSITIONS.length; i++) {
        // Create the commuter element
        const commuterId = `debug-commuter-${i}`;
        const commuterElement = document.createElement('div');
        commuterElement.id = commuterId;
        commuterElement.className = 'commuter-sprite debug-element';
        
        // Add label to show position index
        const label = document.createElement('div');
        label.textContent = `C${i}`;
        label.className = 'debug-label debug-commuter-label';
        commuterElement.appendChild(label);
        
        // Calculate actual position
        const position = window.commuters.COMMUTER_POSITIONS[i];
        const containerWidth = gameState.elements.sceneContainer.offsetWidth;
        const containerHeight = gameState.elements.sceneContainer.offsetHeight;
        const xPos = (position[0] / 100) * containerWidth;
        const yPos = (position[1] / 100) * containerHeight;
        
        // Set styles
        commuterElement.style.position = 'absolute';
        commuterElement.style.left = `${xPos}px`;
        commuterElement.style.bottom = `${yPos}px`;
        commuterElement.style.transform = 'translateX(-50%)';
        
        // Use a default commuter sprite for visualization
        const commuterType = i === 0 ? 'commuter1' : `commuter${((i % 7) + 1)}`;
        commuterElement.style.backgroundImage = `url(assets/sprites/${commuterType}.png)`;
        commuterElement.style.backgroundSize = 'contain';
        commuterElement.style.backgroundRepeat = 'no-repeat';
        commuterElement.style.backgroundPosition = 'bottom center';
        commuterElement.style.zIndex = `${10 + i}`;
        commuterElement.style.width = '54px';
        commuterElement.style.height = '128px';
        
        // Add to DOM
        gameState.elements.sceneContainer.appendChild(commuterElement);
    }
    
    // Add all set dressing in their positions
    for (let i = 0; i < window.setDressing.SET_DRESSING_POSITIONS.length; i++) {
        // Create the set dressing element
        const setDressingId = `debug-set-dressing-${i}`;
        const setDressingElement = document.createElement('div');
        setDressingElement.id = setDressingId;
        setDressingElement.className = 'set-dressing-sprite debug-element';
        
        // Add label to show position index
        const label = document.createElement('div');
        label.textContent = `S${i}`;
        label.className = 'debug-label debug-setdressing-label';
        setDressingElement.appendChild(label);
        
        // Calculate actual position
        const position = window.setDressing.SET_DRESSING_POSITIONS[i];
        const containerWidth = gameState.elements.sceneContainer.offsetWidth;
        const containerHeight = gameState.elements.sceneContainer.offsetHeight;
        const xPos = (position[0] / 100) * containerWidth;
        const yPos = (position[1] / 100) * containerHeight;
        
        // Set styles
        setDressingElement.style.position = 'absolute';
        setDressingElement.style.left = `${xPos}px`;
        setDressingElement.style.bottom = `${yPos}px`;
        setDressingElement.style.transform = 'translateX(-50%)';
        
        // Use a different set dressing type for each position
        const types = window.setDressing.SET_DRESSING_TYPES;
        const setDressingType = types[i % types.length];
        setDressingElement.style.backgroundImage = `url(assets/sprites/${setDressingType}.png)`;
        setDressingElement.style.backgroundSize = 'contain';
        setDressingElement.style.backgroundRepeat = 'no-repeat';
        setDressingElement.style.backgroundPosition = 'bottom center';
        setDressingElement.style.zIndex = '5';
        
        // Set dimensions based on type
        let width, height;
        switch(setDressingType) {
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
        
        setDressingElement.style.width = `${width}px`;
        setDressingElement.style.height = `${height}px`;
        
        // Add to DOM
        gameState.elements.sceneContainer.appendChild(setDressingElement);
    }
    
    // Create a clear button
    const clearButton = document.createElement('button');
    clearButton.id = 'debug-clear-button';
    clearButton.textContent = 'Clear Debug Elements';
    
    // Add the clear button to the document
    document.body.appendChild(clearButton);
    
    // Add click event listener
    clearButton.addEventListener('click', clearAllElements);
}

/**
 * Clear all debug elements
 */
function clearAllElements() {
    // Remove all debug elements
    document.querySelectorAll('.debug-element').forEach(element => {
        element.remove();
    });
    
    // Remove clear button if it exists
    const clearButton = document.getElementById('debug-clear-button');
    if (clearButton) {
        clearButton.remove();
    }
}

// Export UI functions to window object
window.ui = {
    updateAwarenessDisplay,
    showMessage,
    showPopupMessage,
    showThoughtBubble,
    updateNarrativeText,
    showSegmentNarrative,
    updateTypewriterText,
    gameComplete,
    showSegmentConnectionNarrative,
    showHint,
    createDebugButton,
    debugPositions,
    clearAllElements
};