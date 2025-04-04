/**
 * Drone: The Daily Commute
 * Core Game Logic - Initialization and main game loop with XP-based awareness system
 */

// Import commuters and UI modules
// These will be imported in the HTML file separately

// Game state
let gameState = {
    day: 1,
    awarenessLevel: 1,     // Current level of awareness (1-10)
    awarenessXP: 0,        // Current XP within the current level
    canClick: false,
    currentChange: null,
    isTransitioning: false,
    typewriter: null,
    awarenessMeter: null,
    changesFound: 0,
    elements: {
        // Elements will be defined in init()
    }
};

// AWARENESS_CONFIG is defined in config.js and loaded before this file

// XP Effects System
const xpEffects = {
    // Check if styles have been added
    stylesAdded: false,

    /**
     * Initialize the XP effects system
     */
    init: function() {
        // Add required styles
        this.addStyles();
    },
    
    /**
     * Add required CSS styles for XP effects
     */
    addStyles: function() {
        if (this.stylesAdded) return;
        
        // Create style element
        const styleElement = document.createElement('style');
        styleElement.id = 'xp-effects-styles';
        
        // Define necessary styles
        styleElement.textContent = `
            /* XP Particles effect */
            .xp-particle {
                position: absolute;
                pointer-events: none;
                font-size: 12px;
                font-weight: bold;
                color: #4e4eb2;
                text-shadow: 0 0 3px rgba(255, 255, 255, 0.7);
                z-index: 1000;
            }
            
            .xp-particle.xp-loss {
                color: #d9534f; /* Red color for XP loss */
                text-shadow: 0 0 3px rgba(255, 255, 255, 0.7);
            }
            
            @keyframes float-up {
                0% {
                    opacity: 1;
                    transform: translateY(0) scale(1);
                }
                100% {
                    opacity: 0;
                    transform: translateY(-30px) scale(1.2);
                }
            }
            
            /* Animations for level up */
            @keyframes level-up-pulse {
                0% { 
                    box-shadow: 0 0 0 0 rgba(78, 78, 178, 0.7);
                    transform: scale(1);
                }
                50% { 
                    box-shadow: 0 0 0 10px rgba(78, 78, 178, 0);
                    transform: scale(1.05);
                }
                100% { 
                    box-shadow: 0 0 0 0 rgba(78, 78, 178, 0);
                    transform: scale(1);
                }
            }
            
            .level-up-animation {
                animation: level-up-pulse 0.8s 1;
            }
            
            /* Eye icon animation */
            @keyframes eye-pulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.3); }
                100% { transform: scale(1); }
            }
            
            .awareness-icon-pulse {
                animation: eye-pulse 0.8s 1;
            }
        `;
        
        // Add to document head
        document.head.appendChild(styleElement);
        this.stylesAdded = true;
    },
    
    /**
     * Show XP gain particles
     * @param {number} amount - Amount of XP gained
     */
    showXPGain: function(amount) {
        const awarenessContainer = document.getElementById('awareness-container');
        if (!awarenessContainer) return;
        
        // Get element position
        const rect = awarenessContainer.getBoundingClientRect();
        
        // Create particle text
        const particle = document.createElement('div');
        particle.className = 'xp-particle';
        particle.textContent = `+${amount} XP`;
        
        // Position the particle
        particle.style.position = 'absolute';
        particle.style.left = `${rect.left + rect.width / 2}px`;
        particle.style.top = `${rect.top + rect.height / 2}px`;
        particle.style.transform = 'translate(-50%, -50%)';
        
        // Add animation
        particle.style.animation = 'float-up 1.5s forwards';
        
        // Add to document
        document.body.appendChild(particle);
        
        // Remove after animation completes
        setTimeout(() => {
            if (particle.parentNode) {
                particle.parentNode.removeChild(particle);
            }
        }, 1500);
    },
    
    /**
     * Show XP loss particles
     * @param {number} amount - Amount of XP lost
     */
    showXPLoss: function(amount) {
        const awarenessContainer = document.getElementById('awareness-container');
        if (!awarenessContainer) return;
        
        // Get element position
        const rect = awarenessContainer.getBoundingClientRect();
        
        // Create particle text
        const particle = document.createElement('div');
        particle.className = 'xp-particle xp-loss';
        particle.textContent = `-${amount} XP`;
        
        // Position the particle
        particle.style.position = 'absolute';
        particle.style.left = `${rect.left + rect.width / 2}px`;
        particle.style.top = `${rect.top + rect.height / 2}px`;
        particle.style.transform = 'translate(-50%, -50%)';
        
        // Add animation
        particle.style.animation = 'float-up 1.5s forwards';
        
        // Add to document
        document.body.appendChild(particle);
        
        // Remove after animation completes
        setTimeout(() => {
            if (particle.parentNode) {
                particle.parentNode.removeChild(particle);
            }
        }, 1500);
    },
    
    /**
     * Show level up effect
     * @param {HTMLElement} element - The meter element
     * @param {number} newLevel - The new level
     */
    showLevelUp: function(element, newLevel) {
        if (!element) return;
        
        // Add level up class for animation
        element.classList.add('level-up-animation');
        
        // Create level up text
        const levelUpText = document.createElement('div');
        levelUpText.className = 'xp-particle';
        levelUpText.textContent = `LEVEL ${newLevel}!`;
        levelUpText.style.color = '#ffcc00';
        levelUpText.style.fontSize = '16px';
        
        // Get element position
        const rect = element.getBoundingClientRect();
        
        // Position the text
        levelUpText.style.position = 'absolute';
        levelUpText.style.left = `${rect.left + rect.width / 2}px`;
        levelUpText.style.top = `${rect.top - 10}px`;
        levelUpText.style.transform = 'translate(-50%, -50%)';
        
        // Add animation
        levelUpText.style.animation = 'float-up 2s forwards';
        
        // Add to document
        document.body.appendChild(levelUpText);
        
        // Make the eye icon pulse
        const eyeIcon = document.querySelector('.awareness-icon');
        if (eyeIcon) {
            eyeIcon.classList.add('awareness-icon-pulse');
            setTimeout(() => {
                eyeIcon.classList.remove('awareness-icon-pulse');
            }, 800);
        }
        
        // Remove level up animation class after it completes
        setTimeout(() => {
            element.classList.remove('level-up-animation');
        }, 800);
        
        // Remove the text after animation completes
        setTimeout(() => {
            if (levelUpText.parentNode) {
                levelUpText.parentNode.removeChild(levelUpText);
            }
        }, 2000);
    }
};

// Initialize the game when DOM is fully loaded
document.addEventListener('DOMContentLoaded', init);

// Export game state and core objects
window.gameState = gameState;
window.xpEffects = xpEffects;

// Export core game functions to window object
window.core = {
    init,
    takeTrain,
    proceedToNextDay,
    addAwarenessXP,
    removeAwarenessXP,
    showRandomThoughtBubble,
    showThoughtBubbleAtElement,
    updateAwarenessLevel,
    handleLevelUp,
    handleCommuterClick,
    highlightMissedChange,
    initTypewriter,
    createAwarenessMeter,
    initializeTrainPlatformBackground,
    setupMobileSupport,
    enhanceTouchTargets,
    createDailyChange,
    showHint,
    gameComplete,
    showGameOverSummary
};

/**
 * Initialize the game
 */
async function init() {
    console.log("Initializing Drone: The Daily Commute");

    // Initialize game state
    gameState.day = 1;
    gameState.awarenessLevel = 1;
    gameState.awarenessXP = 0;
    gameState.canClick = false;  // Start with clicking disabled
    gameState.currentChange = null;
    gameState.isTransitioning = false;
    gameState.changesFound = 0;

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

    // Initialize XP effects
    xpEffects.init();

    // Initialize awareness meter
    gameState.awarenessMeter = new AwarenessMeter({
        container: document.getElementById('awareness-container'),
        maxLevel: AWARENESS_CONFIG.maxLevel,
        meterWidth: 200,
        meterHeight: 15,
        activeColor: '#4e4eb2',
        inactiveColor: '#3a3a3a',
        borderColor: '#666',
        onLevelUp: handleLevelUp
    });

    // Add event listeners
    gameState.elements.trainButton.addEventListener('click', takeTrain);

    // Initialize commuters - wait for variations to be detected
    await commuters.detectCommuterVariations();
    commuters.addInitialCommuter();

    // Initialize set dressing detection (but don't add any pieces on day 1)
    if (window.setDressing && window.setDressing.detectSetDressingVariations) {
        await window.setDressing.detectSetDressingVariations();
        // No initial set dressing - only add them as changes
    }

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

    // Enable clicking if we're on day 2 or later
    gameState.canClick = gameState.day >= 2;

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
        gameState.awarenessMeter = new AwarenessMeter({
            container: awarenessContainer,
            maxLevel: AWARENESS_CONFIG.maxLevel,
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

    // Show level up effect
    const meterElement = document.querySelector('.awareness-meter');
    if (meterElement) {
        xpEffects.showLevelUp(meterElement, newLevel);
    }

    // Check for game completion (if maxLevel reached)
    if (newLevel >= AWARENESS_CONFIG.maxLevel) {
        gameComplete();
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
    gameState.elements.sceneContainer.insertBefore(platformBackground, gameState.elements.sceneContainer.firstChild);
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
        if (!gameState.currentChange.changeType || gameState.currentChange.changeType === 'commuter') {
            commuters.highlightMissedChange();
        } else if (gameState.currentChange.changeType === 'setDressing' && window.setDressing) {
            window.setDressing.highlightMissedChange();
        }

        // Proceed to next day after highlighting
        setTimeout(() => {
            proceedToNextDay();
        }, 1500);
    } else {
        // No change exists today - award XP for "observant riding"
        if (gameState.day >= 0 && !gameState.currentChange) {  // Only if there was no change at all today
            addAwarenessXP(AWARENESS_CONFIG.baseXpForTakingTrain);
        }
        
        // Proceed immediately
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
        // Clean up found-change highlights
        const foundElements = document.querySelectorAll('.found-change');
        foundElements.forEach(element => {
            element.classList.remove('found-change');
        });
        
        // Remove any click blockers
        const clickBlockers = document.querySelectorAll('.click-blocker');
        clickBlockers.forEach(blocker => {
            if (blocker.parentNode) {
                blocker.parentNode.removeChild(blocker);
            }
        });

        // Increment day
        gameState.day++;
        gameState.elements.dayDisplay.textContent = gameState.day;

        // Reset current change
        gameState.currentChange = null;

        // Create changes for the new day based on specific pattern
        if (gameState.day === 2) {
            // On day 2, add a set dressing piece
            console.log("Day 2: Adding a set dressing piece");
            if (window.setDressing) {
                const change = window.setDressing.createNewSetDressingElement();
                if (change) {
                    gameState.currentChange = change;
                    console.log("Created set dressing change:", change);
                } else {
                    // Fallback if set dressing fails
                    console.log("Failed to create set dressing, falling back to commuter change");
                    gameState.currentChange = { changeType: 'commuter' };
                    commuters.createFirstChange();
                }
            }
        } else if (gameState.day === 3) {
            // On day 3, change a commuter
            console.log("Day 3: Changing a commuter");
            gameState.currentChange = { changeType: 'commuter' };
            commuters.createRandomChange();
        } else if (gameState.day > 3) {
            // For later days, randomly choose between commuter or set dressing changes
            createDailyChange();
        }

        // Enable clicking since there's something to find (if day >= 2)
        gameState.canClick = gameState.day >= 2;

        // Disable train button on day 2+ until player finds the change or makes a mistake
        if (gameState.day >= 2 && gameState.elements.trainButton) {
            gameState.elements.trainButton.disabled = true;
        }

        // Fade back in
        setTimeout(() => {
            gameState.elements.sceneContainer.classList.remove('fading');

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
    // Early game, gradually introduce changes
    if (gameState.day < 6) {
        return gameState.day >= 4 ? 1 : 0;  // Start with day 4
    }
    
    // Determine chance of change based on awareness level
    const awarenessLevel = gameState.awarenessLevel || 1;
    
    // As awareness increases, so does the chance of having a change
    const changeProb = Math.min(0.9, 0.5 + (awarenessLevel * 0.05));
    
    // Randomly determine if there should be a change today
    return Math.random() < changeProb ? 1 : 0;
}

/**
 * Add awareness XP with visual feedback
 * @param {number} amount - Amount of XP to add
 */
function addAwarenessXP(amount) {
    const oldAwarenessLevel = gameState.awarenessLevel;
    
    gameState.awarenessXP += amount;
    
    // Update the awareness level based on new XP
    updateAwarenessLevel();
    
    // Update the XP display
    if (gameState.awarenessMeter) {
        const currentXP = gameState.awarenessXP;
        const requiredXP = AWARENESS_CONFIG.xpRequirements[gameState.awarenessLevel];
        
        // If we're about to level up, cap at max XP for this level
        const displayXP = currentXP > requiredXP ? requiredXP : currentXP;
        
        gameState.awarenessMeter.setProgress(gameState.awarenessLevel, displayXP);
    }
    
    // Show floating XP text
    if (window.xpEffects && window.xpEffects.showXPGain) {
        window.xpEffects.showXPGain(amount);
    }
    
    // If levelup occurred, handle it
    if (gameState.awarenessLevel > oldAwarenessLevel) {
        handleLevelUp(gameState.awarenessLevel);
    }
}

/**
 * Remove awareness XP with visual feedback
 * Prevents XP from going below 0 or decreasing the awareness level
 * @param {number} amount - Amount of XP to remove
 */
function removeAwarenessXP(amount) {
    // Store current level to prevent decreasing it
    const currentLevel = gameState.awarenessLevel;
    const currentXP = gameState.awarenessXP;
    
    // Calculate minimum XP for the current level (XP required for previous level)
    const prevLevelXP = currentLevel > 1 ? AWARENESS_CONFIG.xpRequirements[currentLevel - 1] : 0;
    
    // Calculate new XP, ensuring it doesn't go below minimum for current level or below 0
    const newXP = Math.max(prevLevelXP, Math.max(0, currentXP - amount));
    
    // Only proceed if there's an actual change
    if (newXP < currentXP) {
        gameState.awarenessXP = newXP;
        
        // Update the XP display
        if (gameState.awarenessMeter) {
            const requiredXP = AWARENESS_CONFIG.xpRequirements[currentLevel];
            gameState.awarenessMeter.setProgress(currentLevel, newXP);
        }
        
        // Show floating XP loss text
        if (window.xpEffects && window.xpEffects.showXPLoss) {
            window.xpEffects.showXPLoss(amount);
        } else {
            console.log(`Lost ${amount} XP`);
        }
    }
}

/**
 * Show a random thought bubble from one of the commuters
 * @param {boolean} isPositive - Whether to show a positive or negative thought
 */
function showRandomThoughtBubble(isPositive) {
    // Only proceed if there are commuters
    if (!commuters.allCommuters || commuters.allCommuters.length === 0) return;
    
    // Select a random commuter
    const randomIndex = Math.floor(Math.random() * commuters.allCommuters.length);
    const randomCommuter = commuters.allCommuters[randomIndex];
    
    if (!randomCommuter || !randomCommuter.element) return;
    
    // Get the thought content based on positive/negative
    let thoughts;
    if (isPositive) {
        // Use positive thoughts from higher awareness levels
        const thoughtSet = gameState.awarenessLevel >= 8 ? 'final' : 
                          gameState.awarenessLevel >= 5 ? 'late' : 
                          gameState.awarenessLevel >= 3 ? 'mid' : 'early';
        thoughts = THOUGHTS[thoughtSet];
    } else {
        // Define negative thoughts
        thoughts = [
            "Something feels off...",
            "That's not it...",
            "I'm not seeing clearly...",
            "My awareness is slipping...",
            "Focus is fading...",
            "Can't quite put my finger on it...",
            "I thought I was more observant...",
            "The details are blurring...",
            "I need to pay closer attention..."
        ];
    }
    
    // Select a random thought
    const randomThoughtIndex = Math.floor(Math.random() * thoughts.length);
    const thought = thoughts[randomThoughtIndex];
    
    // Create and position the thought bubble
    showThoughtBubbleAtElement(randomCommuter.element, thought, isPositive);
}

/**
 * Display a thought bubble at a specific element
 * @param {HTMLElement} element - The element to attach the thought bubble to
 * @param {string} text - The thought text
 * @param {boolean} isPositive - Whether it's a positive or negative thought
 */
function showThoughtBubbleAtElement(element, text, isPositive) {
    if (!element) return;
    
    // Create a temporary thought bubble
    const thoughtBubble = document.createElement('div');
    thoughtBubble.className = 'thought-bubble temp-thought';
    thoughtBubble.textContent = text;
    
    // Add color based on positive/negative
    if (!isPositive) {
        thoughtBubble.style.backgroundColor = '#e6a4a4';
        thoughtBubble.style.color = '#5a1a1a';
    }
    
    // Position the bubble above the element
    const rect = element.getBoundingClientRect();
    const sceneRect = gameState.elements.sceneContainer.getBoundingClientRect();
    
    thoughtBubble.style.position = 'absolute';
    thoughtBubble.style.left = `${rect.left + rect.width/2 - sceneRect.left}px`;
    thoughtBubble.style.bottom = `${sceneRect.bottom - rect.top + 10}px`;
    thoughtBubble.style.transform = 'translateX(-50%)';
    thoughtBubble.style.maxWidth = '120px';
    thoughtBubble.style.display = 'block';
    thoughtBubble.style.zIndex = '100';
    
    // Add to scene
    gameState.elements.sceneContainer.appendChild(thoughtBubble);
    
    // Remove after a few seconds
    setTimeout(() => {
        if (thoughtBubble.parentNode) {
            thoughtBubble.parentNode.removeChild(thoughtBubble);
        }
    }, 3000);
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
            <p>You've reached maximum awareness and broken free from the daily grind.</p>
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
        window.ui.updateTypewriterText("DRONE NO MORE, I'M MY OWN MAN. You've broken free from the cycle.");

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

        // Calculate awareness gain based on difficulty
        const baseGain = AWARENESS_CONFIG.baseXpForFindingChange;
        const difficultyMultiplier = 1 + (gameState.day - 4) * 0.1; // 10% increase per day
        const awarenessGain = Math.floor(baseGain * difficultyMultiplier);

        // Increase awareness
        addAwarenessXP(awarenessGain);

        // Show positive thought bubble from a random commuter
        showRandomThoughtBubble(true);

        // Enable train button so player can proceed
        if (gameState.elements.trainButton) {
            gameState.elements.trainButton.disabled = false;
        }
        
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
        showRandomThoughtBubble(false);
        
        // End the game with a summary after showing the highlight
        setTimeout(() => {
            showGameOverSummary("Your awareness wasn't strong enough to notice the changes.");
        }, 1500);
    }
}

/**
 * Show game over summary with replay option
 * @param {string} message - The message to display
 */
function showGameOverSummary(message) {
    const sceneContainer = gameState.elements.sceneContainer;
    const trainButton = gameState.elements.trainButton;
    
    // Disable clicking
    gameState.canClick = false;
    gameState.isTransitioning = true;
    
    // Add game over class
    sceneContainer.classList.add('game-over');
    
    // Disable train button
    if (trainButton) {
        trainButton.disabled = true;
    }
    
    // Select random ending text from config
    const randomText = GAME_OVER_TEXTS[Math.floor(Math.random() * GAME_OVER_TEXTS.length)];
    
    // Update typewriter with random ending text
    if (gameState.typewriter) {
        gameState.typewriter.stop();
        gameState.elements.narrativeText.textContent = '';
        setTimeout(() => {
            gameState.typewriter.type(randomText);
        }, 100);
    }
    
    // Create and show the summary popup
    setTimeout(() => {
        const summaryPopup = document.createElement('div');
        summaryPopup.className = 'game-over-summary';
        
        summaryPopup.innerHTML = `
            <h2>AWARENESS LOST</h2>
            <p>${message}</p>
            <p>Days on the train: ${gameState.day}</p>
            <p>Awareness level: ${gameState.awarenessLevel}</p>
            <p>Changes found: ${gameState.changesFound}</p>
            <button id="replay-button">Take the Train Again</button>
        `;
        
        // Add to document body instead of scene container
        document.body.appendChild(summaryPopup);
        
        // Add event listener to replay button
        const replayButton = document.getElementById('replay-button');
        if (replayButton) {
            replayButton.addEventListener('click', () => {
                location.reload(); // Reload the page to restart the game
            });
        }
    }, 2000);
}

/**
 * Show a hint to help the player
 */
function showHint() {
    // Only provide hint if there is an active change
    if (!gameState.currentChange) {
        window.ui.showMessage("No changes to find yet. Take the train!", 1500);
        return;
    }

    if (!gameState.currentChange.changeType || gameState.currentChange.changeType === 'commuter') {
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
            window.ui.showMessage(`Look for a change in the ${location} area`, 2000);
        }
    } else if (gameState.currentChange.changeType === 'setDressing' && window.setDressing) {
        // Find the set dressing element for the current change
        const setDressing = window.setDressing.allSetDressing.find(s => s.id === gameState.currentChange.elementId);

        if (setDressing && setDressing.element && !gameState.currentChange.found) {
            // Determine which quadrant the set dressing is in
            const rect = setDressing.element.getBoundingClientRect();
            const sceneRect = gameState.elements.sceneContainer.getBoundingClientRect();

            const isTop = rect.top < (sceneRect.top + sceneRect.height / 2);
            const isLeft = rect.left < (sceneRect.left + sceneRect.width / 2);

            let location = isTop ? 'top' : 'bottom';
            location += isLeft ? ' left' : ' right';
            
            // Provide a hint based on the change action
            let hintText = '';
            if (gameState.currentChange.changeAction === 'add') {
                hintText = `Look for something new in the ${location} area`;
            } else {
                hintText = `Look for a change in the ${location} area`;
            }

            // Show hint message
            window.ui.showMessage(hintText, 2000);
        }
    }

    // Disable hint button temporarily
    const hintButton = document.getElementById('hint-button');
    if (hintButton) {
        hintButton.disabled = true;
        setTimeout(() => {
            hintButton.disabled = false;
        }, 5000);
    }
}

function createDailyChange() {
    // For all days after day 2, always create either a commuter or set dressing change
    const randomValue = Math.random();
    
    // Balance between commuter and set dressing changes
    // Higher probability for set dressing changes
    const commuterProb = 0.4; // 40% chance for commuter changes
    const setDressingProb = 0.6; // 60% chance for set dressing changes
    
    console.log(`Change probabilities: commuter=${commuterProb.toFixed(2)}, setDressing=${setDressingProb.toFixed(2)}`);

    if (randomValue < commuterProb) {
        // Create commuter change
        console.log("Creating commuter change for today");
        gameState.currentChange = { changeType: 'commuter' };
        commuters.createRandomChange(1);
    } else if (window.setDressing) {
        // Create set dressing change
        console.log("Creating set dressing change for today");
        
        let change;
        // If no set dressing elements exist yet, forcefully add a new one
        if (window.setDressing.allSetDressing.length === 0) {
            console.log("No set dressing elements exist yet, adding the first one");
            change = window.setDressing.createNewSetDressingElement();
        } else {
            // Otherwise use the normal function that can add or change
            change = window.setDressing.createSetDressingChange();
        }
        
        if (change) {
            // Set dressing change created successfully
            console.log(`Set dressing change created: ${change.changeAction} for ${change.elementId}`);
            gameState.currentChange = change;
            
            // If this is an 'add' change, specifically log it
            if (change.changeAction === 'add') {
                const newDressing = window.setDressing.allSetDressing.find(d => d.id === change.elementId);
                if (newDressing) {
                    console.log(`Added new ${newDressing.type} set dressing element at position [${newDressing.position}]`);
                }
            }
        } else {
            // Fallback to commuter change if set dressing change fails
            console.warn("Failed to create set dressing change, falling back to commuter change");
            gameState.currentChange = { changeType: 'commuter' };
            commuters.createRandomChange(1);
        }
    } else {
        // Fallback to commuter change if set dressing is not available
        console.log("Set dressing not available, creating commuter change");
        gameState.currentChange = { changeType: 'commuter' };
        commuters.createRandomChange(1);
    }
}

/**
 * Update awareness level based on current XP
 */
function updateAwarenessLevel() {
    const xpRequirements = AWARENESS_CONFIG.xpRequirements;
    let newLevel = 1;
    
    // Find the highest level that we meet the XP requirement for
    for (let i = 1; i < xpRequirements.length; i++) {
        if (gameState.awarenessXP >= xpRequirements[i-1]) {
            newLevel = i;
        } else {
            break;
        }
    }
    
    // Update level if changed
    if (newLevel !== gameState.awarenessLevel) {
        gameState.awarenessLevel = newLevel;
    }
}
