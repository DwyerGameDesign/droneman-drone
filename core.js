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
     * @param {HTMLElement} element - The element to show particles around
     * @param {number} amount - Amount of XP gained
     */
    showXPGain: function(element, amount) {
        if (!element) return;
        
        // Get element position
        const rect = element.getBoundingClientRect();
        
        // Create particle text
        const particle = document.createElement('div');
        particle.className = 'xp-particle';
        particle.textContent = `+${amount} XP`;
        
        // Position the particle
        particle.style.position = 'absolute';
        particle.style.left = `${rect.left + rect.width / 2}px`;
        particle.style.top = `${rect.top}px`;
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

// Export game state and core functions
window.gameState = gameState;

// Export core functions
window.core = {
    init,
    initTypewriter,
    createAwarenessMeter,
    handleLevelUp,
    initializeTrainPlatformBackground,
    takeTrain,
    proceedToNextDay,
    determineChangesForDay,
    addAwarenessXP,
    setupMobileSupport,
    enhanceTouchTargets,
    handleCommuterClick,
    createDailyChange
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

    // Initialize set dressing
    if (window.setDressing && window.setDressing.detectSetDressingVariations) {
        await window.setDressing.detectSetDressingVariations();
        window.setDressing.addInitialSetDressing(2); // Start with 2 set dressing elements
    }

    // Initialize debug buttons
    initDebugControls();

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
        // Increment day
        gameState.day++;
        gameState.elements.dayDisplay.textContent = gameState.day;

        // Reset current change
        gameState.currentChange = null;

        // Create changes for the new day
        if (gameState.day === 2) {
            // First change is now on day 2 - always a commuter
            gameState.currentChange = { changeType: 'commuter' };
            commuters.createFirstChange();
        } else if (gameState.day > 2) {
            // For later days, always create a change (commuter or set dressing)
            createDailyChange();
        }

        // Enable clicking since there's something to find (if day >= 2)
        gameState.canClick = gameState.day >= 2;

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
 * Increase awareness by adding XP
 * @param {number} amount - Amount of XP to add
 */
function addAwarenessXP(amount) {
    if (!gameState.awarenessMeter) return;

    // Apply level-based multiplier to XP gain
    const level = gameState.awarenessLevel;
    const multiplier = AWARENESS_CONFIG.xpMultiplierByLevel[level] || 1.0;
    const adjustedAmount = Math.floor(amount * multiplier);
    
    console.log(`Adding ${adjustedAmount} XP (base: ${amount}, multiplier: ${multiplier}, level: ${level})`);
    
    // Add XP through the meter (it will handle level-ups)
    const leveledUp = gameState.awarenessMeter.addXP(adjustedAmount);
    
    // Update internal XP tracking (meter also does this, but keep in sync)
    if (!leveledUp) {
        gameState.awarenessXP += adjustedAmount;
    } else {
        // If leveled up, meter has already updated the XP value
        gameState.awarenessXP = gameState.awarenessMeter.currentXP;
        gameState.awarenessLevel = gameState.awarenessMeter.currentLevel;
    }

    // Show XP gain effect
    const meterElement = document.querySelector('.awareness-meter');
    if (meterElement && amount > 0) {
        xpEffects.showXPGain(meterElement, adjustedAmount);
    }
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
    if (gameState.currentChange && gameState.currentChange.commuterId === commuterId) {
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
        const change = window.setDressing.createSetDressingChange();
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
 * Initialize debug controls
 */
function initDebugControls() {
    // Debug buttons
    const debugCommuterBtn = document.getElementById('debug-commuter-change');
    const debugSetDressingBtn = document.getElementById('debug-setdressing-change');
    
    // Add event listeners to debug buttons
    if (debugCommuterBtn) {
        debugCommuterBtn.addEventListener('click', () => debugTakeTrain('commuter'));
    }
    
    if (debugSetDressingBtn) {
        debugSetDressingBtn.addEventListener('click', () => debugTakeTrain('setDressing'));
    }
}

/**
 * Debug version of takeTrain that forces a specific change type
 */
function debugTakeTrain(changeType) {
    // Prevent multiple clicks during transition
    if (gameState.isTransitioning) {
        console.log("Game is transitioning, ignoring debug button click");
        return;
    }

    console.log(`Debug: Taking train with change type: ${changeType}`);
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
            proceedToNextDayWithChangeType(changeType);
        }, 1500);
    } else {
        // No change exists today - award XP for "observant riding"
        if (gameState.day >= 2 && !gameState.currentChange) {  // Only if there was no change at all today
            addAwarenessXP(AWARENESS_CONFIG.baseXpForTakingTrain);
        }
        
        // Proceed immediately
        proceedToNextDayWithChangeType(changeType);
    }
}

/**
 * Debug version of proceedToNextDay that forces a specific change type
 * @param {string} changeType - 'commuter' or 'setDressing'
 */
function proceedToNextDayWithChangeType(changeType) {
    // Fade out
    gameState.elements.sceneContainer.classList.add('fading');

    setTimeout(() => {
        // Increment day
        gameState.day++;
        gameState.elements.dayDisplay.textContent = gameState.day;

        // Reset current change
        gameState.currentChange = null;

        // Create the specified change type
        if (changeType === 'commuter') {
            console.log("Debug: Creating commuter change for today");
            gameState.currentChange = { changeType: 'commuter' };
            commuters.createRandomChange(1);
        } else if (changeType === 'setDressing' && window.setDressing) {
            console.log("Debug: Creating set dressing change for today");
            const change = window.setDressing.createSetDressingChange();
            if (change) {
                console.log("Set dressing change created successfully:", change);
                
                // Additional detailed logging for set dressing changes
                if (change.changeAction === 'add') {
                    const dressing = window.setDressing.allSetDressing.find(d => d.id === change.elementId);
                    if (dressing) {
                        console.log(`Added new ${dressing.type} set dressing at position [${dressing.position}]`);
                        console.log(`Total set dressing count: ${window.setDressing.allSetDressing.length}`);
                    }
                }
                
                gameState.currentChange = change;
            } else {
                console.warn("Failed to create set dressing change, falling back to commuter change");
                gameState.currentChange = { changeType: 'commuter' };
                commuters.createRandomChange(1);
            }
        }

        // Enable clicking since there's something to find (if day >= 2)
        gameState.canClick = gameState.day >= 2;

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
