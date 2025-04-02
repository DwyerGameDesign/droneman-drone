/**
 * Drone: The Daily Commute
 * Core Game Logic - Initialization and main game loop
 */

// Import commuters and UI modules
// These will be imported in the HTML file separately

// Game state
let day = 1;
let awareness = 0;
let canClick = false;
let currentChange = null;
let isTransitioning = false;
let typewriter = null;
let awarenessMeter = null;
let currentSegment = 0;
let changesFound = 0;
let progressToNextSegment = 0;

// Configurable game settings
const PROGRESSION_CONFIG = {
    initialChangesPerDay: 1,
    maxChangesPerDay: 5,
    // Changes needed to fill each segment (progressively more difficult)
    changesToFillSegment: [1, 2, 3, 4, 5, 5, 5, 5],
    awarenessPenalty: 10, // How much awareness decreases when missing a change
    awarenessGainPerChange: 20 // Base awareness gain per change found
};

// Game elements
const sceneContainer = document.getElementById('scene-container');
const trainButton = document.getElementById('train-button');
const dayDisplay = document.getElementById('day');
const narrativeText = document.getElementById('narrative-text');
const message = document.getElementById('message');
const thoughtBubble = document.getElementById('thought-bubble');

// Initialize the game when DOM is fully loaded
document.addEventListener('DOMContentLoaded', init);

// Export game state and core functions
window.gameState = {
    day,
    awareness,
    canClick,
    currentChange,
    isTransitioning,
    typewriter,
    awarenessMeter,
    currentSegment,
    changesFound,
    progressToNextSegment,
    PROGRESSION_CONFIG,
    elements: {
        sceneContainer,
        trainButton,
        dayDisplay,
        narrativeText,
        message,
        thoughtBubble
    }
};

// Export core functions
window.core = {
    init,
    initTypewriter,
    createAwarenessMeter,
    handleSegmentFilled,
    initializeTrainPlatformBackground,
    takeTrain,
    proceedToNextDay,
    determineChangesForDay,
    increaseAwareness,
    decreaseAwareness,
    setupMobileSupport,
    enhanceTouchTargets
};

/**
 * Initialize the game
 */
async function init() {
    console.log("Initializing Drone: The Daily Commute");

    // Initialize game state
    gameState.day = 1;
    gameState.awareness = 0;
    gameState.canClick = false;  // Start with clicking disabled
    gameState.currentChange = null;
    gameState.isTransitioning = false;
    gameState.currentSegment = 0;
    gameState.changesFound = 0;
    gameState.progressToNextSegment = 0;

    // Initialize UI elements
    gameState.elements = {
        sceneContainer: document.getElementById('scene-container'),
        trainButton: document.getElementById('train-button'),
        dayDisplay: document.getElementById('day'),
        narrativeText: document.getElementById('narrative-text'),
        message: document.getElementById('message'),
        thoughtBubble: document.getElementById('thought-bubble')
    };

    // Initialize train platform background
    initializeTrainPlatformBackground();

    // Initialize typewriter
    gameState.typewriter = new Typewriter(gameState.elements.narrativeText, {
        typingSpeed: 30,
        deleteSpeed: 10,
        pauseFor: 2000
    });

    // Initialize awareness meter
    gameState.awarenessMeter = new AwarenessMeter({
        container: document.getElementById('awareness-container'),
        maxLevel: 100,
        segmentSize: 20,
        meterWidth: 200,
        meterHeight: 15,
        activeColor: '#4e4eb2',
        inactiveColor: '#3a3a3a',
        borderColor: '#666',
        onSegmentFilled: handleSegmentFilled
    });

    // Add event listeners
    gameState.elements.trainButton.addEventListener('click', takeTrain);

    // Initialize commuters - wait for variations to be detected
    await commuters.detectCommuterVariations();
    commuters.addInitialCommuter();

    // Initialize doober system
    if (window.dooberSystem && window.dooberSystem.init) {
        window.dooberSystem.init();
    }

    // Initialize shader effects
    if (window.shaderEffects && window.shaderEffects.init) {
        window.shaderEffects.init();
    }

    // Set initial narrative text
    window.ui.updateNarrativeText();

    // Enable clicking if we're on day 4 or later
    gameState.canClick = gameState.day >= 4;

    // Set up mobile support
    setupMobileSupport();
}

/**
 * Initialize the typewriter for narrative text
 */
function initTypewriter() {
    // Create a new Typewriter instance
    if (typeof Typewriter !== 'undefined') {
        gameState.typewriter = new Typewriter(gameState.elements.narrativeText, {
            speed: 40,
            delay: 0,
            cursor: ''
        });
    } else {
        // Fallback for when the Typewriter class is not available
        gameState.typewriter = {
            type: function (text) {
                gameState.elements.narrativeText.textContent = text;
                return this;
            },
            stop: function () {
                // Do nothing
            }
        };
        
        // Try to load the Typewriter script dynamically
        const script = document.createElement('script');
        script.src = 'typewriter.js';
        script.onload = function () {
            // Once loaded, create a proper Typewriter instance
            gameState.typewriter = new Typewriter(gameState.elements.narrativeText, {
                speed: 40,
                delay: 0,
                cursor: ''
            });
            gameState.typewriter.type(gameState.elements.narrativeText.textContent);
        };
        document.head.appendChild(script);
    }
}

/**
 * Initialize visual feedback systems (doober and shader effects)
 */
function initVisualFeedbackSystems() {
    // Initialize doober system
    if (typeof window.dooberSystem !== 'undefined' && window.dooberSystem.init) {
        window.dooberSystem.init();
    } else {
        console.warn("Doober system not available. Make sure doober.js is included.");
    }
    
    // Initialize shader effects
    if (typeof window.shaderEffects !== 'undefined' && window.shaderEffects.init) {
        window.shaderEffects.init();
    } else {
        console.warn("Shader effects not available. Make sure shader-effects.js is included.");
    }
}

/**
 * Create and initialize the awareness meter
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
        awarenessMeter = new AwarenessMeter({
            container: awarenessContainer,
            maxLevel: 100,
            segmentSize: 20,
            meterWidth: 200,
            meterHeight: 15,
            activeColor: '#4e4eb2',
            inactiveColor: '#3a3a3a',
            borderColor: '#666',
            onSegmentFilled: handleSegmentFilled
        });

        // Initial update
        awarenessMeter.update(awareness);
    } else {
        console.warn("AwarenessMeter class not found, awareness will be tracked internally only");
    }
}

/**
 * Handle when a meter segment is filled
 */
function handleSegmentFilled(segmentNumber, previousSegmentNumber) {
    console.log(`Segment ${segmentNumber} filled!`);

    // If this is a new segment (not just updating the display)
    if (segmentNumber > previousSegmentNumber) {
        // Update current segment
        gameState.currentSegment = segmentNumber;

        // Reset progress to next segment
        gameState.progressToNextSegment = 0;

        // Hide train button temporarily
        if (gameState.elements.trainButton) {
            gameState.elements.trainButton.style.display = 'none';
        }

        // Add a new commuter immediately but make it invisible
        const newCommuter = commuters.addCommuter();
        if (newCommuter) {
            console.log(`Added commuter ${newCommuter.type} for segment ${segmentNumber}`);
            newCommuter.element.style.opacity = '0';
            newCommuter.element.style.transition = 'opacity 0.5s ease-in-out';
        }

        // Play the segment completion effect
        if (window.shaderEffects && window.shaderEffects.playEffect) {
            // Start the shader effect
            window.shaderEffects.playEffect('wave', () => {
                // Shader effect is done, show train button again
                if (gameState.elements.trainButton) {
                    gameState.elements.trainButton.style.display = 'block';
                }
            });

            // Show narrative text immediately after shader starts
            window.ui.showSegmentNarrative(segmentNumber);

            // Start fading in the new commuter after a short delay
            if (newCommuter) {
                setTimeout(() => {
                    newCommuter.element.style.opacity = '1';
                }, 300);
            }
        } else {
            // Fallback if shader effects aren't available
            // Show narrative text
            window.ui.showSegmentNarrative(segmentNumber);

            // Fade in the new commuter
            if (newCommuter) {
                newCommuter.element.style.opacity = '1';
                // Highlight the new commuter
                commuters.highlightElement(newCommuter.element);
            }
            
            // Show train button again
            if (gameState.elements.trainButton) {
                gameState.elements.trainButton.style.display = 'block';
            }
        }
    }
}

/**
 * Initialize the train platform background
 */
function initializeTrainPlatformBackground() {
    // Create the background element
    const platformBackground = document.createElement('div');
    platformBackground.id = 'platform-background';
    platformBackground.className = 'platform-background';

    // Apply styles
    platformBackground.style.position = 'absolute';
    platformBackground.style.top = '0';
    platformBackground.style.left = '0';
    platformBackground.style.width = '100%';
    platformBackground.style.height = '100%';
    platformBackground.style.backgroundImage = 'url(assets/sprites/train_platform.png)';
    platformBackground.style.backgroundSize = 'cover';
    platformBackground.style.backgroundPosition = 'center';
    platformBackground.style.backgroundRepeat = 'no-repeat';
    platformBackground.style.zIndex = '1'; // Set low z-index so it appears behind all other elements

    // Insert at the beginning of the scene container
    sceneContainer.insertBefore(platformBackground, sceneContainer.firstChild);
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

        // Apply awareness penalty
        const penalty = PROGRESSION_CONFIG.awarenessPenalty;
        decreaseAwareness(penalty);

        // Proceed to next day after highlighting
        setTimeout(() => {
            proceedToNextDay();
        }, 1500);
    } else {
        // No missed change, proceed immediately
        proceedToNextDay();
    }
}

/**
 * Function to handle the transition to the next day
 */
function proceedToNextDay() {
    // Fade out
    gameState.elements.sceneContainer.classList.add('fading');

    setTimeout(() => {
        // Increment day
        gameState.day++;
        gameState.elements.dayDisplay.textContent = gameState.day;

        // Reset current change
        gameState.currentChange = null;

        // Determine number of changes for today
        const changesToCreate = determineChangesForDay();

        // Create new change
        if (gameState.day === 4) {
            // First change is on day 4
            commuters.createFirstChange();
        } else if (gameState.day > 4) {
            // For later days, create random changes
            commuters.createRandomChange(changesToCreate);
        }

        // Enable clicking since there's something to find (if day >= 4)
        gameState.canClick = gameState.day >= 4;

        // Check for lyrics or special day text
        window.ui.checkForLyrics();

        // Fade back in
        setTimeout(() => {
            gameState.elements.sceneContainer.classList.remove('fading');

            // Re-enable train button
            if (gameState.elements.trainButton) {
                gameState.elements.trainButton.disabled = false;
            }

            // Update narrative text with typewriter effect
            if (gameState.typewriter) {
                gameState.typewriter.stop();
                gameState.elements.narrativeText.textContent = '';
                setTimeout(() => {
                    window.ui.updateNarrativeText();
                }, 100);
            }

            gameState.isTransitioning = false; // Reset transition flag
        }, 500); // Fade in duration
    }, 500); // Fade out duration
}

/**
 * Determine the number of changes to create for the current day
 */
function determineChangesForDay() {
    // Determine how many changes to create based on the current segment
    const baseChanges = Math.min(
        currentSegment + 1,
        PROGRESSION_CONFIG.maxChangesPerDay
    );

    // For early game, start with just 1 change
    if (day < 6) {
        return Math.min(1, PROGRESSION_CONFIG.initialChangesPerDay);
    }

    // Later in the game, add more changes based on progression
    return Math.min(
        baseChanges,
        PROGRESSION_CONFIG.maxChangesPerDay
    );
}

/**
 * Increase awareness level
 */
function increaseAwareness(amount) {
    // Calculate new awareness
    gameState.awareness = Math.min(100, gameState.awareness + amount);

    // Update meter if available
    if (gameState.awarenessMeter) {
        gameState.awarenessMeter.update(gameState.awareness);
    }

    // Update color stage
    updateColorStage();

    // Emit event
    const event = new CustomEvent('awarenessChanged', {
        detail: {
            awareness: gameState.awareness,
            change: amount
        }
    });
    document.dispatchEvent(event);

    console.log(`Awareness increased by ${amount} to ${gameState.awareness}`);

    // Check for game completion
    if (gameState.awareness >= 100) {
        gameComplete();
    }
}

/**
 * Decrease awareness level
 */
function decreaseAwareness(amount) {
    // Calculate new awareness
    gameState.awareness = Math.max(0, gameState.awareness - amount);

    // Update meter if available
    if (gameState.awarenessMeter) {
        gameState.awarenessMeter.update(gameState.awareness);
    }

    // Update color stage
    updateColorStage();

    // Emit event
    const event = new CustomEvent('awarenessChanged', {
        detail: {
            awareness: gameState.awareness,
            change: -amount
        }
    });
    document.dispatchEvent(event);

    console.log(`Awareness decreased by ${amount} to ${gameState.awareness}`);
}

/**
 * Game completion
 */
function gameComplete() {
    sceneContainer.classList.add('completion');

    setTimeout(() => {
        const completionMessage = document.createElement('div');
        completionMessage.className = 'completion-message';
        completionMessage.innerHTML = `
            <h2>DRONE NO MORE</h2>
            <p>You've reached 100% awareness and broken free from the daily grind.</p>
            <p>Days on the train: ${day}</p>
            <p>Changes found: ${changesFound}</p>
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
 * Set up mobile support if needed
 */
function setupMobileSupport() {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    if (isMobile) {
        document.body.classList.add('mobile');

        // Add mobile-specific controls if needed
        const gameContainer = document.querySelector('.game-container');
        if (gameContainer && !document.querySelector('.mobile-controls')) {
            const mobileControls = document.createElement('div');
            mobileControls.className = 'mobile-controls';

            const hintButton = document.createElement('button');
            hintButton.id = 'hint-button';
            hintButton.className = 'hint-button';
            hintButton.textContent = 'Need a Hint?';
            hintButton.addEventListener('click', showHint);

            mobileControls.appendChild(hintButton);
            gameContainer.appendChild(mobileControls);
        }

        enhanceTouchTargets();
    }
}

/**
 * Make touch targets larger for mobile devices
 */
function enhanceTouchTargets() {
    const touchAreaSize = 20; // Size of the touch area in pixels
    const touchAreaStyle = {
        position: 'absolute',
        top: `-${touchAreaSize}px`,
        left: `-${touchAreaSize}px`,
        right: `-${touchAreaSize}px`,
        bottom: `-${touchAreaSize}px`,
        zIndex: '10'
    };

    document.querySelectorAll('.commuter-sprite').forEach(el => {
        if (!el.querySelector('.touch-area')) {
            const touchArea = document.createElement('div');
            touchArea.className = 'touch-area';
            Object.assign(touchArea.style, touchAreaStyle);

            touchArea.addEventListener('click', e => {
                e.stopPropagation();
                el.click();
            });

            el.appendChild(touchArea);
        }
    });
}

// Export necessary functions and variables for other modules
window.increaseAwareness = increaseAwareness;
window.decreaseAwareness = decreaseAwareness;
window.takeTrain = takeTrain;
window.handleSegmentFilled = handleSegmentFilled;
window.updateAwarenessDisplay = updateAwarenessDisplay;
window.highlightElement = highlightElement;
window.highlightMissedChange = highlightMissedChange;
window.showHint = showHint;