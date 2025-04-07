/**
 * Drone: The Daily Commute
 * UI and Display - All UI and display-related functions
 */

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
        gameState.typewriter.type("everyday the same...");
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
 */
function showMessage(text, duration = 2000) {
    message.textContent = text;
    message.style.visibility = 'visible';

    setTimeout(() => {
        message.style.visibility = 'hidden';
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
 * Show a thought bubble with text based on awareness level
 */
function showThoughtBubble() {
    // Get thoughts from config
    // THOUGHTS is defined in config.js
    
    // Determine which thought set to use based on awareness level
    let thoughtSet = 'early';
    
    if (gameState.awarenessLevel >= 8) {
        thoughtSet = 'final';
    } else if (gameState.awarenessLevel >= 5) {
        thoughtSet = 'late';
    } else if (gameState.awarenessLevel >= 3) {
        thoughtSet = 'mid';
    }
    
    // Choose a random thought from the appropriate set
    const thoughts = THOUGHTS[thoughtSet];
    const randomIndex = Math.floor(Math.random() * thoughts.length);
    const thought = thoughts[randomIndex];
    
    // Display the thought
    thoughtBubble.textContent = thought;
    thoughtBubble.style.display = 'block';
    
    // Hide after a few seconds
    setTimeout(() => {
        thoughtBubble.style.display = 'none';
    }, 5000);
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
    showHint
};