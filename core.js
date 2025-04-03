/**
 * Updates to core.js for the XP-based awareness system
 */

// Updated Game state
let gameState = {
    day: 1,
    awarenessLevel: 0,     // Current level of awareness (0-10)
    awarenessXP: 0,        // Current XP within the current level
    canClick: false,
    currentChange: null,
    isTransitioning: false,
    typewriter: null,
    awarenessMeter: null,
    changesFound: 0,
    elements: {
        // Elements will be defined in init()
    },
    AWARENESS_CONFIG: AWARENESS_CONFIG // Reference to the awareness config
};

/**
 * Initialize the awareness meter
 */
function createAwarenessMeter() {
    // Create awareness container if it doesn't exist
    let awarenessContainer = document.getElementById('awareness-container');
    if (!awarenessContainer) {
        awarenessContainer = document.createElement('div');
        awarenessContainer.id = 'awareness-container';
        awarenessContainer.className = 'awareness-container';

        // Insert into the HUD
        const hud = document.querySelector('.hud');
        if (hud) {
            // Remove old awareness counter if it exists
            const oldCounter = document.querySelector('.awareness-counter');
            if (oldCounter) {
                oldCounter.remove();
            }

            hud.appendChild(awarenessContainer);
        }
    }

    // Create meter instance
    if (typeof AwarenessMeter !== 'undefined') {
        gameState.awarenessMeter = new AwarenessMeter({
            container: awarenessContainer,
            meterWidth: 200,
            meterHeight: 15,
            activeColor: '#4e4eb2',
            inactiveColor: '#3a3a3a',
            borderColor: '#666',
            onLevelUp: handleLevelUp
        });

        // Initial update
        gameState.awarenessMeter.setProgress(gameState.awarenessLevel, gameState.awarenessXP);
    } else {
        console.warn("AwarenessMeter class not found, awareness will be tracked internally only");
    }
}

/**
 * Handle when a level up occurs
 */
function handleLevelUp(newLevel, previousLevel) {
    console.log(`Level up! ${previousLevel} -> ${newLevel}`);

    // Update game state
    gameState.awarenessLevel = newLevel;
    
    // Update color stage
    updateColorStage();

    // Hide train button temporarily
    if (gameState.elements.trainButton) {
        gameState.elements.trainButton.style.display = 'none';
    }

    // Play the level up effect
    if (window.shaderEffects && window.shaderEffects.playEffect) {
        // Start the shader effect
        setTimeout(() => {
            window.shaderEffects.playEffect('wave', () => {
                // Shader effect is done, show train button again
                if (gameState.elements.trainButton) {
                    gameState.elements.trainButton.style.display = 'block';
                }
            });

            // Show narrative text after shader starts
            setTimeout(() => {
                window.ui.showSegmentNarrative(newLevel);

                // Add and animate the new commuter
                setTimeout(() => {
                    const newCommuter = commuters.addCommuter();
                    if (newCommuter) {
                        console.log(`Added commuter ${newCommuter.type} for level ${newLevel}`);
                        // Add the new-commuter class for the animation
                        newCommuter.element.classList.add('new-commuter');
                    }
                }, 600);
            }, 200);
        }, 600);
    } else {
        // Fallback if shader effects aren't available
        // Show narrative text
        window.ui.showSegmentNarrative(newLevel);

        // Add the new commuter
        const newCommuter = commuters.addCommuter();
        if (newCommuter) {
            // Add the new-commuter class for the animation
            newCommuter.element.classList.add('new-commuter');
            // Highlight the new commuter
            commuters.highlightElement(newCommuter.element);
        }
        
        // Show train button again
        if (gameState.elements.trainButton) {
            gameState.elements.trainButton.style.display = 'block';
        }
    }

    // Emit event for level up
    const event = new CustomEvent('awarenessLevelUp', {
        detail: {
            previousLevel,
            newLevel
        }
    });
    document.dispatchEvent(event);

    // Check for game completion (if maxLevel reached)
    if (newLevel >= AWARENESS_CONFIG.maxLevel) {
        gameComplete();
    }
}

/**
 * Increase awareness by adding XP
 * @param {number} amount - Amount of XP to add
 */
function addAwarenessXP(amount) {
    if (!gameState.awarenessMeter) return;

    // Apply level-based multiplier to XP gain
    const multiplier = AWARENESS_CONFIG.xpMultiplierByLevel[gameState.awarenessLevel] || 1.0;
    const adjustedAmount = Math.floor(amount * multiplier);
    
    console.log(`Adding ${adjustedAmount} XP (base: ${amount}, multiplier: ${multiplier})`);
    
    // Add XP through the meter (it will handle level-ups)
    const leveledUp = gameState.awarenessMeter.addXP(adjustedAmount);
    
    // Update internal XP tracking (meter also does this, but keep in sync)
    if (!leveledUp) {
        gameState.awarenessXP += adjustedAmount;
    } else {
        // If leveled up, meter has already updated the XP value
        gameState.awarenessXP = gameState.awarenessMeter.currentXP;
    }

    // Emit event
    const event = new CustomEvent('awarenessXPChanged', {
        detail: {
            xp: gameState.awarenessXP,
            level: gameState.awarenessLevel,
            change: adjustedAmount
        }
    });
    document.dispatchEvent(event);
}

/**
 * Update the background color stage based on awareness level
 */
function updateColorStage() {
    // Get color stages from config
    const colorStages = AWARENESS_CONFIG.colorStages;

    // Remove all stage classes first
    colorStages.forEach(stage => {
        gameState.elements.sceneContainer.classList.remove(stage.class);
    });

    // Find the appropriate stage for current awareness level
    for (let i = colorStages.length - 1; i >= 0; i--) {
        if (gameState.awarenessLevel >= colorStages[i].level) {
            gameState.elements.sceneContainer.classList.add(colorStages[i].class);
            break;
        }
    }
}

/**
 * Take the train to the next day
 */
function takeTrain() {
    // Prevent multiple clicks during transition
    if (gameState.isTransitioning) return;

    console.log("Taking the train");
    gameState.isTransitioning = true;

    // Disable train button during transition
    if (gameState.elements.trainButton) {
        gameState.elements.trainButton.disabled = true;
    }

    // Check if there's an unfound change to highlight
    if (gameState.currentChange && !gameState.currentChange.found) {
        // Highlight missed change
        commuters.highlightMissedChange();

        // Proceed to next day after highlighting
        setTimeout(() => {
            proceedToNextDay();
        }, 1500);
    } else {
        // No missed change, award XP for "observant riding"
        if (gameState.day > 4) {  // Only start giving XP after the first change appears
            addAwarenessXP(AWARENESS_CONFIG.baseXpForTakingTrain);
        }
        
        // Proceed immediately
        proceedToNextDay();
    }
}

/**
 * Handle commuter click events - Update for commuters.js
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
    if (gameState.currentChange && gameState.currentChange.commuterId === commuterId) {
        console.log("Correct commuter clicked!");

        // Mark as found
        gameState.currentChange.found = true;

        // Highlight the commuter
        highlightElement(commuterElement);
        
        // Add doober animation to awareness meter
        if (window.dooberSystem && window.dooberSystem.animate) {
            const awarenessContainer = document.getElementById('awareness-container');
            if (awarenessContainer) {
                window.dooberSystem.animate(commuterElement, awarenessContainer);
            }
        }

        // Increment changes found counter
        gameState.changesFound++;

        // Award XP for finding the change
        addAwarenessXP(AWARENESS_CONFIG.baseXpForFindingChange);

        // Disable further clicking until next day
        gameState.canClick = false;

        // Update narrative text
        window.ui.updateNarrativeText();
    } else {
        console.log("Wrong commuter clicked or no change to find");
        window.ui.showMessage("I didn't notice anything different there", 1500);
    }
}

// Function to update the commuters.js file with the new handleCommuterClick function
// This should be exported and replace the existing handler in commuters.js
window.commuters = window.commuters || {};
window.commuters.handleCommuterClick = handleCommuterClick;