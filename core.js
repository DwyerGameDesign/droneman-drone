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
    usedNarratives: [],    // Track used narratives
    usedThoughts: [],      // Track used thoughts
    isFirstTimePlayer: true, // Track if it's the player's first time
    activeMessageTimer: null, // Track active message timer
    lives: 3,              // Number of lives the player has
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

            /* Subtle glow for highlighted elements */
            .highlight-pulse {
                animation: glow-pulse 1.5s ease-in-out;
                box-shadow: 0 0 15px rgba(78, 78, 178, 0.8);
                z-index: 50;
                position: relative;
            }
            
            .highlight-missed {
                animation: glow-missed 1.5s ease-in-out;
                box-shadow: 0 0 15px rgba(217, 83, 79, 0.8);
                z-index: 50;
                position: relative;
            }
            
            .found-change {
                box-shadow: 0 0 8px rgba(78, 78, 178, 0.5);
                position: relative;
                z-index: 40;
            }
            
            @keyframes glow-pulse {
                0% { box-shadow: 0 0 0 rgba(78, 78, 178, 0); }
                50% { box-shadow: 0 0 20px rgba(78, 78, 178, 0.9); }
                100% { box-shadow: 0 0 8px rgba(78, 78, 178, 0.5); }
            }
            
            @keyframes glow-missed {
                0% { box-shadow: 0 0 0 rgba(217, 83, 79, 0); }
                50% { box-shadow: 0 0 20px rgba(217, 83, 79, 0.9); }
                100% { box-shadow: 0 0 8px rgba(217, 83, 79, 0.5); }
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
        
        // Find the actual awareness meter within the container
        const awarenessMeter = awarenessContainer.querySelector('.awareness-meter');
        const targetElement = awarenessMeter || awarenessContainer;
        
        // Get element position
        const rect = targetElement.getBoundingClientRect();
        
        // Create particle text
        const particle = document.createElement('div');
        particle.className = 'xp-particle';
        particle.textContent = `+${amount} XP`;
        
        // Position the particle - align to right side of meter
        particle.style.position = 'absolute';
        particle.style.left = `${rect.left + rect.width * 0.75}px`;
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
        
        // Find the actual awareness meter within the container
        const awarenessMeter = awarenessContainer.querySelector('.awareness-meter');
        const targetElement = awarenessMeter || awarenessContainer;
        
        // Get element position
        const rect = targetElement.getBoundingClientRect();
        
        // Create particle text
        const particle = document.createElement('div');
        particle.className = 'xp-particle xp-loss';
        particle.textContent = `-${amount} XP`;
        
        // Position the particle - align to right side of meter
        particle.style.position = 'absolute';
        particle.style.left = `${rect.left + rect.width * 0.75}px`;
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
    calculateAwarenessXP,
    calculateTrainXP,
    showRandomThoughtBubble,
    updateAwarenessLevel,
    handleLevelUp,
    continueWithLevelUp,
    highlightMissedChange,
    initTypewriter,
    createAwarenessMeter,
    initializeTrainPlatformBackground,
    setupMobileSupport,
    enhanceTouchTargets,
    createDailyChange,
    showHint,
    gameComplete,
    showGameOverSummary,
    diagnoseBtnVisibility,
    revealGame,
    addClickBlocker,
    showFirstTimeGuide,
    removeAllClickBlockers,
    loseLife,
    updateLivesDisplay,
    createLivesHUD,
    createHeartDoober,
    createHeartBreakEffect
};

/**
 * Initialize the game
 */
async function init() {
    console.log("Initializing Drone: The Daily Commute");

    // Game elements should be hidden initially via CSS
    // The loading-overlay will be visible instead

    // Check if this is the player's first time
    gameState.isFirstTimePlayer = localStorage.getItem('droneFirstTime') !== 'false';

    // Initialize game state
    gameState.day = 1;
    gameState.awarenessLevel = 1;
    gameState.awarenessXP = 0;
    gameState.canClick = false;  // Start with clicking disabled
    gameState.currentChange = null;
    gameState.isTransitioning = false;
    gameState.changesFound = 0;
    gameState.usedNarratives = [];  // Clear used narratives
    gameState.usedThoughts = [];    // Clear used thoughts
    gameState.lives = 3;           // Initialize with 3 lives

    // BUGFIX: Always ensure train button exists
    const trainButton = document.getElementById('train-button');
    if (!trainButton) {
        console.error("Train button not found in the DOM! Creating it...");
        // Create train button if it doesn't exist
        const newTrainButton = document.createElement('button');
        newTrainButton.id = 'train-button';
        newTrainButton.className = 'train-button';
        newTrainButton.textContent = 'Take Train';
        document.body.appendChild(newTrainButton);
    }

    // Initialize UI elements
    gameState.elements = {
        sceneContainer: document.getElementById('scene-container'),
        trainButton: document.getElementById('train-button'),
        dayDisplay: document.getElementById('day'),
        narrativeText: document.getElementById('narrative-text'),
        message: document.getElementById('message'),
        thoughtBubble: document.getElementById('thought-bubble')
    };

    // BUGFIX: Double check train button was found
    if (!gameState.elements.trainButton) {
        console.error("Train button still not found after initialization! Trying again...");
        gameState.elements.trainButton = document.getElementById('train-button');
    }

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
    createAwarenessMeter();

    // Initialize lives HUD
    createLivesHUD();

    // Add event listeners
    if (gameState.elements.trainButton) {
        console.log("Adding click listener to train button");
        gameState.elements.trainButton.addEventListener('click', takeTrain);
    } else {
        console.error("CRITICAL ERROR: Train button not found, can't add click listener!");
    }

    // Hide narrative text initially - we'll show it after fade-in
    if (gameState.elements.narrativeText) {
        gameState.elements.narrativeText.style.opacity = '0';
    }

    // Load all assets and initialize systems
    try {
        // Initialize commuters - wait for variations to be detected
        await commuters.detectCommuterVariations();
        commuters.addInitialCommuter();
        
        // Initialize set dressing detection
        if (window.setDressing && window.setDressing.detectSetDressingVariations) {
            await window.setDressing.detectSetDressingVariations();
            
            // Initialize doober system
            if (window.dooberSystem && window.dooberSystem.init) {
                window.dooberSystem.init();
            }
            
            // Initialize shader effects
            if (window.shaderEffects && window.shaderEffects.init) {
                window.shaderEffects.init();
            }
            
            // Set up mobile support
    setupMobileSupport();
            
            // Create debug button for position testing
            window.ui.createDebugButton();
            
            // Initialize album link
            if (window.albumLink && window.albumLink.initAlbumLink) {
                window.albumLink.initAlbumLink();
            }
            
            // Initialize play speaker
            if (window.playSpeaker && window.playSpeaker.initPlaySpeaker) {
                window.playSpeaker.initPlaySpeaker();
            }
            
            // All systems initialized, now reveal the game
            // Small delay to ensure everything is ready
            setTimeout(revealGame, 500);
        }
    } catch (error) {
        console.error("Error initializing game:", error);
        // Still try to reveal the game even if there was an error
        revealGame();
    }
}

/**
 * Reveal the game after loading is complete
 */
function revealGame() {
    console.log("All assets loaded, revealing game...");
    
    // Remove the loading overlay
    const loadingOverlay = document.getElementById('loading-overlay');
    if (loadingOverlay) {
        loadingOverlay.classList.add('hidden');
        
        // Remove from DOM after animation completes
        setTimeout(() => {
            if (loadingOverlay.parentNode) {
                loadingOverlay.parentNode.removeChild(loadingOverlay);
            }
        }, 1000);
    }
    
    // Show the game container
    const gameContainer = document.getElementById('game-container');
    if (gameContainer) {
        gameContainer.classList.remove('hidden');
    }
    
    // Fade in the narrative text after a brief delay
    setTimeout(() => {
        if (gameState.elements.narrativeText) {
            gameState.elements.narrativeText.style.transition = 'opacity 1s ease-in';
            gameState.elements.narrativeText.style.opacity = '1';
            
            // Update narrative text only after fade-in
            window.ui.updateNarrativeText();
        }
        
        // Enable clicking if we're on day 2 or later
        gameState.canClick = gameState.day >= 2;
        
        // Add click blocker on day 1
        if (gameState.day === 1) {
            addClickBlocker();
        }
        
        // Show first-time player guide if this is their first time
        if (gameState.isFirstTimePlayer) {
            showFirstTimeGuide();
        }
    }, 1000);
}

/**
 * Show first-time player guide message based on current day
 */
function showFirstTimeGuide() {
    // Only show if this is the player's first time
    if (!gameState.isFirstTimePlayer) {
        console.log("Not showing guide: not a first-time player");
        return;
    }
    
    console.log(`Showing first-time guide for day ${gameState.day}`);
    
    let message = '';
    
    // Different messages for different days
    switch (gameState.day) {
        case 1:
            message = "Take the 6:40 train to begin your journey.";
            break;
        case 2:
            message = "Something new has appeared on the platform. Select it if you are aware.";
            break;
        case 3:
            message = "What's different from yesterday? Look closely.";
            break;
        case 4:
            message = "Keep finding changes. Awareness is the first step to waking up.";
            break;
        default:
            // No message for later days
            console.log(`No guide message for day ${gameState.day}`);
            return;
    }
    
    console.log(`Guide message for day ${gameState.day}: "${message}"`);
    
    // Clear any existing message timer
    if (gameState.activeMessageTimer) {
        clearTimeout(gameState.activeMessageTimer);
        gameState.activeMessageTimer = null;
    }
    
    // Make sure UI is ready before showing the message
    if (window.ui && typeof window.ui.showMessage === 'function') {
        // Show the guide message persistently with higher position
        window.ui.showMessage(message, 300000, true); // 5 minutes, positioned higher
    } else {
        console.error("UI system not available for showing message");
    }
}

/**
 * Add a click blocker to prevent interaction with the scene
 * Shows an appropriate message directing player to take the train
 */
function addClickBlocker() {
    const sceneContainer = gameState.elements.sceneContainer;
    
    // Remove any existing click blockers first
    const existingBlockers = document.querySelectorAll('.click-blocker');
    if (existingBlockers.length > 0) {
        console.log(`Removing ${existingBlockers.length} existing click blockers before adding new one`);
    existingBlockers.forEach(blocker => {
        if (blocker.parentNode) {
            blocker.parentNode.removeChild(blocker);
        }
    });
    }
    
    // Create click blocker element
    const clickBlocker = document.createElement('div');
    clickBlocker.className = 'click-blocker';
    clickBlocker.id = 'click-blocker-day-' + gameState.day; // Add unique ID for debugging
    
    // Style the click blocker
    Object.assign(clickBlocker.style, {
        position: 'absolute',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        zIndex: '50',  // High enough to block clicks but below UI elements
        cursor: 'default',
        background: 'transparent'
    });
    
    // Add click handler that prevents propagation and shows a message
    clickBlocker.addEventListener('click', function(event) {
        event.stopPropagation();
        
        // Debug click blocker click
        console.log("Click blocker clicked, day:", gameState.day, 
                    "change found:", gameState.currentChange ? gameState.currentChange.found : "no change");
        
        // Show different messages based on game state
        if (gameState.day === 1) {
            // Day 1 - first time message
            window.ui.showMessage("Take the 6:40 train to begin your journey.", 1500);
        } else if (gameState.currentChange && gameState.currentChange.found) {
            // Change was found - tell player to take the train to continue
            window.ui.showMessage("You already found the change today. Take the train to continue your journey.", 1500);
        } else {
            // Other cases (clicked wrong area, etc.)
            window.ui.showMessage("Find what changed before taking the train.", 1500);
        }
    });
    
    console.log(`Adding click blocker for day ${gameState.day}`);
    
    // Add to scene container
    sceneContainer.appendChild(clickBlocker);
    
    // Make sure train button is visible and clickable (positioned above the blocker)
    if (gameState.elements.trainButton) {
        gameState.elements.trainButton.style.zIndex = '100';
        gameState.elements.trainButton.style.position = 'relative'; // Ensure it's positioned
    }
    
    // Safety check - auto-remove the click blocker if a change is found but not on day 1
    if (gameState.day > 1 && gameState.currentChange && gameState.currentChange.found) {
        console.log("Added click blocker with change already found - train should be clickable");
    }
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

        // Initial update with correct values
        gameState.awarenessMeter.setProgress(gameState.awarenessLevel, gameState.awarenessXP);
    } else {
        console.warn("AwarenessMeter class not found, awareness will be tracked internally only");
    }
}

/**
 * Handle when a level up occurs
 */
function handleLevelUp(newLevel, previousLevel) {
    console.log(`[LEVEL UP] ${previousLevel} -> ${newLevel}`);
    
    // Note: With individual level requirements, we don't need to calculate
    // excess XP here since the meter already handles it

    // Update game state to match awareness meter
    if (gameState.awarenessMeter) {
        gameState.awarenessLevel = newLevel;
        gameState.awarenessXP = gameState.awarenessMeter.getCurrentXP();
        
        console.log(`[LEVEL UP] Updated gameState: Level ${gameState.awarenessLevel}, XP reset to ${gameState.awarenessXP}`);
    }
    
    // Hide train button temporarily
    if (gameState.elements.trainButton) {
        gameState.elements.trainButton.style.display = 'none';
    }
    
    // Create level up popup
    const levelUpPopup = document.createElement('div');
    levelUpPopup.className = 'level-up-popup';
    levelUpPopup.innerHTML = `
        <h2>LEVEL UP</h2>
        <p>Your awareness is growing stronger.</p>
        <p>Awareness Level: <span class="level-number">${newLevel}</span></p>
        <button id="continue-level-up">Continue</button>
    `;
    
    // Add popup to body
    document.body.appendChild(levelUpPopup);
    
    // Add event listener to continue button
    const continueButton = document.getElementById('continue-level-up');
    if (continueButton) {
        continueButton.addEventListener('click', () => {
            // Remove the popup
            document.body.removeChild(levelUpPopup);
            
            // Continue with the level up process
            continueWithLevelUp(newLevel);
        });
    }
    
    // Check for game completion (if maxLevel reached)
    if (newLevel >= AWARENESS_CONFIG.maxLevel) {
        gameComplete();
    }
}

/**
 * Continue with level up process after popup is closed
 */
function continueWithLevelUp(newLevel) {
    // Reset the progress bar to show the correct amount for the new level
    if (gameState.awarenessMeter && typeof gameState.awarenessMeter.resetProgressAfterLevelUp === 'function') {
        gameState.awarenessMeter.resetProgressAfterLevelUp();
    }
    
    // Disable clicking until the player takes the train
    gameState.canClick = false;
    
    // Play the level up effect
    if (window.shaderEffects && window.shaderEffects.playEffect) {
        // Start the shader effect
        setTimeout(() => {
            window.shaderEffects.playEffect('wave', () => {
                // Shader effect is done, show train button
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
        
        // Show train button after all animations are complete
        setTimeout(() => {
            if (gameState.elements.trainButton) {
                gameState.elements.trainButton.style.display = 'block';
            }
        }, 2000);
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

    // Create the bench element
    const bench = document.createElement('div');
    bench.id = 'platform-bench';
    bench.className = 'platform-bench';
    
    // Apply bench styles
    bench.style.position = 'absolute';
    bench.style.width = '144px';
    bench.style.height = '54px';
    bench.style.backgroundImage = 'url(assets/sprites/bench.png)';
    bench.style.backgroundSize = 'contain';
    bench.style.backgroundRepeat = 'no-repeat';
    bench.style.backgroundPosition = 'center';
    bench.style.backgroundPosition = 'center';
    bench.style.zIndex = '2'; // Set higher than background but lower than other elements
    bench.style.bottom = '24%'; // Position from bottom
    bench.style.left = '30%'; // Center horizontally
    bench.style.transform = 'translateX(-50%)'; // Center the bench

    // Insert at the beginning of the scene container
    gameState.elements.sceneContainer.insertBefore(platformBackground, gameState.elements.sceneContainer.firstChild);
    gameState.elements.sceneContainer.appendChild(bench);
}

/**
 * Take the train to the next day
 */
function takeTrain() {
    // Prevent multiple clicks during transition
    if (gameState.isTransitioning) {
        console.log("Already transitioning, ignoring train click");
        return;
    }

    console.log("Taking the train");
    gameState.isTransitioning = true;
    
    // CRITICAL FIX: Record if there was an unfound change for highlighting purposes
    let shouldHighlightMissed = false;
    let missedChangeType = null;
    
    if (gameState.currentChange && !gameState.currentChange.found) {
        shouldHighlightMissed = true;
        missedChangeType = gameState.currentChange.changeType || 'commuter';
        console.log("Missed change to highlight:", missedChangeType);
    }

    // Clear any active message timers
    if (gameState.activeMessageTimer) {
        clearTimeout(gameState.activeMessageTimer);
        gameState.activeMessageTimer = null;
    }
    
    // Clear any displayed message
    const messageElement = document.getElementById('message');
    if (messageElement) {
        // Check if this is a message that should be cleared when train is clicked
        if (messageElement.dataset.clearOnTrain === 'true') {
            console.log("Clearing message marked for train click");
            messageElement.dataset.clearOnTrain = 'false';
        }
        messageElement.style.display = 'none';
        messageElement.style.visibility = 'hidden';
    }
    
    // Clear any thought bubbles
    const thoughtBubbles = document.querySelectorAll('.thought-bubble, .temp-thought');
    thoughtBubbles.forEach(bubble => {
        if (bubble.parentNode) {
            bubble.parentNode.removeChild(bubble);
        }
    });
    
    // CRITICAL FIX: Remove any click blockers that might be preventing interaction
    const clickBlockers = document.querySelectorAll('.click-blocker');
    clickBlockers.forEach(blocker => {
        console.log("Removing click blocker during train transition");
        if (blocker.parentNode) {
            blocker.parentNode.removeChild(blocker);
        }
    });

    // CRITICAL FIX: FULLY RESET the current change state, don't preserve anything
    // We've already recorded if we need to highlight a missed change
    console.log("Previous change state:", gameState.currentChange);
    gameState.currentChange = null;
    console.log("Reset current change to null");

    // Reset cursor style
    if (gameState.elements.sceneContainer) {
        gameState.elements.sceneContainer.style.cursor = 'default';
    }

    // Ensure train button reference is fresh before hiding
    if (!gameState.elements.trainButton || !document.contains(gameState.elements.trainButton)) {
        console.log("Train button reference needs refresh");
        gameState.elements.trainButton = document.getElementById('train-button');
    }

    // Hide train button during transition
    if (gameState.elements.trainButton) {
        gameState.elements.trainButton.style.display = 'none';
    }

    // Now use our recorded value to determine if we should highlight a missed change
    if (shouldHighlightMissed) {
        // Highlight missed change
        if (missedChangeType === 'commuter') {
            commuters.highlightMissedChange();
        } else if (missedChangeType === 'setDressing' && window.setDressing) {
            window.setDressing.highlightMissedChange();
        }

        // Proceed to next day after highlighting
        setTimeout(() => {
            proceedToNextDay();
        }, 1500);
    } else {
        // Only award XP for taking the train on day 1
        if (gameState.day === 1 && !gameState.currentChange) {
            console.log("Day 1: Awarding XP for first train ride");
            addAwarenessXP(calculateTrainXP());
        }
        
        // Proceed immediately
        proceedToNextDay();
    }
}

/**
 * Begin the day by setting up game state and clearing any leftover UI elements
 * This is called at the end of the day transition when we're ready to start the new day
 */
function beginDay() {
    // Make sure canClick is properly set based on game state
    gameState.canClick = gameState.day >= 2 && gameState.currentChange !== null;
    
    // CRITICAL FIX: Remove any click blockers that might still be present
    removeAllClickBlockers();
    
    // Clear any active message timers
    if (gameState.activeMessageTimer) {
        clearTimeout(gameState.activeMessageTimer);
        gameState.activeMessageTimer = null;
    }
    
    // Clear any displayed message
    const messageElement = document.getElementById('message');
    if (messageElement) {
        messageElement.style.display = 'none';
        messageElement.style.visibility = 'hidden';
        // Reset any train-specific attributes
        messageElement.dataset.clearOnTrain = 'false';
    }
    
    // Update narrative text with typewriter effect
    if (gameState.typewriter) {
        gameState.typewriter.stop();
        gameState.elements.narrativeText.textContent = '';
        setTimeout(() => {
            window.ui.updateNarrativeText();
            
            // Show a random thought bubble after the narrative text has been displayed
            // and had time to be read (if day is 2 or later and not a first-time player in tutorial)
            if (gameState.day >= 2 && !(gameState.isFirstTimePlayer && gameState.day <= 4)) {
                // Increased delay to allow player to read the narrative text first
                setTimeout(() => {
                    showRandomThoughtBubble(true);
                }, 1500); // 3 seconds delay after narrative text
            }
            
            // Important: Show first-time player guide with a longer delay to ensure UI is fully ready
            if (gameState.isFirstTimePlayer && gameState.day <= 4) {
                console.log(`Scheduling first-time guide for day ${gameState.day}`);
                setTimeout(() => {
                    showFirstTimeGuide();
                }, 1000); // Increased delay to ensure UI is ready
            }
            
            // After day 4, mark that the player is no longer a first-time player
            if (gameState.day > 4 && gameState.isFirstTimePlayer) {
                console.log("First-time player experience complete, setting flag to false");
                localStorage.setItem('droneFirstTime', 'false');
                gameState.isFirstTimePlayer = false;
            }
            
            // CRITICAL FIX: Make one final check for any click blockers after UI is set up
            setTimeout(() => {
                removeAllClickBlockers();
            }, 500);
        }, 100);
    }

    // Finally enable interactions after all setup is complete
    gameState.isTransitioning = false;
    console.log("Day transition complete, interaction enabled:", 
              { isTransitioning: gameState.isTransitioning, canClick: gameState.canClick });
}

/**
 * Function to handle the transition to the next day
 */
function proceedToNextDay() {
    // Refresh train button reference to prevent stale references
    gameState.elements.trainButton = document.getElementById('train-button');
    
    // Fade out
    gameState.elements.sceneContainer.classList.add('fading');

    setTimeout(() => {
        console.log("TRANSITIONING TO NEXT DAY - STARTING COMPLETE STATE RESET");
        
        // CRITICAL FIX: Completely reset current change object
        gameState.currentChange = null;
        console.log("Current change reset to null");
        
        // Clean up found-change highlights
        const foundElements = document.querySelectorAll('.found-change');
        foundElements.forEach(element => {
            element.classList.remove('found-change');
        });
        
        // CRITICAL FIX: Remove any click blockers at the beginning of transition
        removeAllClickBlockers();
        
        // Remove highlight classes
        const highlightElements = document.querySelectorAll('.highlight-pulse, .highlight-missed');
        highlightElements.forEach(element => {
            element.classList.remove('highlight-pulse', 'highlight-missed');
        });
        
        // Clear any remaining thought bubbles that might have been missed
        const thoughtBubbles = document.querySelectorAll('.thought-bubble, .temp-thought');
        thoughtBubbles.forEach(bubble => {
            if (bubble.parentNode) {
                bubble.parentNode.removeChild(bubble);
            }
        });
        
        // Clear any popup messages that might remain
        const popupMessages = document.querySelectorAll('#popup-message');
        popupMessages.forEach(popup => {
            if (popup.parentNode) {
                popup.parentNode.removeChild(popup);
            }
        });
        
        // Increment day
        gameState.day++;
        console.log(`Day ${gameState.day} starts, isFirstTimePlayer: ${gameState.isFirstTimePlayer}`);
        
        if (gameState.elements.dayDisplay) {
            gameState.elements.dayDisplay.textContent = gameState.day;
        }
        
        // Reset click state
        gameState.canClick = false; // Will be set to true after changes are determined
        
        // CRITICAL FIX: Reset all game interactive states
        gameState.isTransitioning = true; // Will be set to false after transition
        
        // Determine if there should be a change today
        determineChangesForDay();

        // Fade back in
        setTimeout(() => {
            gameState.elements.sceneContainer.classList.remove('fading');

            // Begin the day with a clean UI
            beginDay();
        }, 500); // Fade in duration
    }, 500); // Fade out duration
}

/**
 * Determine which changes should occur for the current day
 */
function determineChangesForDay() {
    // CRITICAL FIX: Ensure complete reset of current change state 
    // before creating new changes for this day
    gameState.currentChange = null;
    
    console.log(`Determining changes for day ${gameState.day}`);
    
    // Create changes for the new day based on specific pattern
    if (gameState.day === 2) {
        // On day 2, add a set dressing piece
        console.log("Day 2: Adding a set dressing piece");
        if (window.setDressing) {
            const change = window.setDressing.createNewSetDressingElement();
            if (change) {
                gameState.currentChange = change;
                // CRITICAL FIX: Ensure found property is explicitly false
                gameState.currentChange.found = false;
                console.log("Created set dressing change:", JSON.stringify(gameState.currentChange));
            } else {
                // Fallback if set dressing fails
                console.log("Failed to create set dressing, falling back to commuter change");
                gameState.currentChange = { changeType: 'commuter', found: false };
                commuters.createFirstChange();
            }
        }
    } else if (gameState.day === 3) {
        // On day 3, change a commuter
        console.log("Day 3: Changing a commuter");
        gameState.currentChange = { changeType: 'commuter', found: false };
        commuters.createRandomChange();
    } else if (gameState.day > 3) {
        // For later days, randomly choose between commuter or set dressing changes
        createDailyChange();
    }

    // Verify the change was created properly and has the expected found status
    if (gameState.currentChange) {
        console.log(`Day ${gameState.day} change created:`, JSON.stringify(gameState.currentChange));
        
        // Force found to false for the new day's change
        if (gameState.currentChange.found !== false) {
            console.warn("Warning: Change found status was not false! Correcting it now.");
            gameState.currentChange.found = false;
        }
        
        console.log(`Final change found status: ${gameState.currentChange.found === true ? 'FOUND' : 'NOT FOUND'}`);
    } else if (gameState.day >= 2) {
        console.warn("No change was created for day " + gameState.day);
    }

    // Enable clicking only if there's a change to find (if day >= 2)
    gameState.canClick = gameState.day >= 2 && gameState.currentChange !== null;
    console.log(`Game state - canClick: ${gameState.canClick}, currentChange exists: ${gameState.currentChange !== null}`);

    // Hide train button on day 2+ until player finds the change or makes a mistake
    if (gameState.day >= 2 && gameState.elements.trainButton) {
        gameState.elements.trainButton.style.display = 'none';
    }
}

/**
 * Add awareness XP with visual feedback
 * @param {number} amount - Amount of XP to add
 */
function addAwarenessXP(amount) {
    // Get the current level and XP before adding
    const currentLevel = gameState.awarenessLevel;
    const currentXP = gameState.awarenessXP;
    
    // Log initial state for debugging
    console.log(`[XP DEBUG] Adding ${amount} XP. Current: Level ${currentLevel}, XP ${currentXP}`);
    
    // Add XP to game state
    gameState.awarenessXP += amount;
    
    // Update the awareness meter if it exists
    if (gameState.awarenessMeter) {
        // Pass the updated total XP to the meter - it will handle level-up logic internally
        const leveledUp = gameState.awarenessMeter.addXP(amount);
        
        // Sync game state with meter state if level changed
        if (leveledUp) {
            // Update game state to match meter (the level up visuals are handled by the meter's callback)
            gameState.awarenessLevel = gameState.awarenessMeter.getCurrentLevel();
            gameState.awarenessXP = gameState.awarenessMeter.getCurrentXP();
        }
    } else {
        // No meter exists, handle level-up logic here
        checkForLevelUp();
    }
    
    // Get next level requirement for logging
    const xpRequirements = AWARENESS_CONFIG.xpRequirements;
    const nextLevelReq = xpRequirements[currentLevel];
    
    console.log(`[XP DEBUG] After adding: XP ${gameState.awarenessXP}, Required for next level: ${nextLevelReq}`);
    console.log(`[XP DEBUG] Updating meter: Level ${gameState.awarenessLevel}, XP ${gameState.awarenessXP}`);
    
    // Show floating XP text
    if (window.xpEffects && window.xpEffects.showXPGain) {
        window.xpEffects.showXPGain(amount);
    }
}

/**
 * Check if player has leveled up and handle the level-up process
 * This is used when no meter exists
 */
function checkForLevelUp() {
    const currentLevel = gameState.awarenessLevel;
    const xpRequirements = AWARENESS_CONFIG.xpRequirements;
    
    // Get required XP for current level
    const requiredXP = xpRequirements[currentLevel];
    
    // Check if we've reached the next level
    if (gameState.awarenessXP >= requiredXP && currentLevel < AWARENESS_CONFIG.maxLevel) {
        // Level up!
        const newLevel = currentLevel + 1;
        console.log(`[XP DEBUG] Leveling up! ${currentLevel} -> ${newLevel}`);
        
        // Calculate excess XP
        const excessXP = gameState.awarenessXP - requiredXP;
        
        // Update level
        gameState.awarenessLevel = newLevel;
        
        // Keep excess XP
        gameState.awarenessXP = excessXP;
        
        // Handle level-up visual effects
        handleLevelUp(newLevel, currentLevel);
        
        // Check for additional level-ups with the excess XP
        checkForLevelUp();
    }
}

/**
 * Remove awareness XP with visual feedback
 * Prevents XP from going below 0 or decreasing the awareness level
 * @param {number} amount - Amount of XP to remove
 */
function removeAwarenessXP(amount) {
    // Calculate new XP, ensuring it doesn't go below 0
    const newXP = Math.max(0, gameState.awarenessXP - amount);
    
    // Only proceed if there's an actual change
    if (newXP < gameState.awarenessXP) {
        // Update game state
        gameState.awarenessXP = newXP;
        
        // Update the awareness meter
        if (gameState.awarenessMeter) {
            // Set total XP (the meter will handle the rest)
            gameState.awarenessMeter.setProgress(gameState.awarenessLevel, newXP);
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

    // Don't show thought bubbles during the first 4 days for first-time players
    if (gameState.isFirstTimePlayer && gameState.day <= 4) return;

    // If we've missed a change, don't show random negative thoughts
    // The custom message will be shown by the click handler instead
    if (!isPositive && gameState.currentChange && !gameState.currentChange.found) {
        return;
    }
    
    // Select a random commuter
    const randomIndex = Math.floor(Math.random() * commuters.allCommuters.length);
    const randomCommuter = commuters.allCommuters[randomIndex];
    
    if (!randomCommuter || !randomCommuter.element) return;
    
    // Get the thought content based on positive/negative
    let thoughts;
    if (isPositive) {
        // Use positive thoughts from appropriate awareness level
        const thoughtSet = gameState.awarenessLevel >= 8 ? 'final' : 
                          gameState.awarenessLevel >= 5 ? 'late' : 
                          gameState.awarenessLevel >= 3 ? 'mid' : 'early';
        thoughts = THOUGHTS[thoughtSet];
        console.log(`Using ${thoughtSet} thoughts for awareness level ${gameState.awarenessLevel}`);
    } else {
        // Use negative thoughts from config
        thoughts = THOUGHTS.negative;
    }
    
    // Filter out thoughts that have already been used
    const availableThoughts = thoughts.filter(thought => !gameState.usedThoughts.includes(thought));
    
    // If all thoughts have been used, reset the used thoughts list
    if (availableThoughts.length === 0) {
        gameState.usedThoughts = [];
        availableThoughts.push(...thoughts);
    }
    
    // Select a random thought from available thoughts
    const randomThoughtIndex = Math.floor(Math.random() * availableThoughts.length);
    const thought = availableThoughts[randomThoughtIndex];
    
    // Add the thought to used thoughts
    gameState.usedThoughts.push(thought);
    
    console.log(`Showing thought bubble: "${thought}"`);
    
    // Use the UI's showThoughtBubble function
    window.ui.showThoughtBubble(randomCommuter.element, thought, isPositive);
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
            trainButton.style.display = 'none';
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
    
    // Add window resize listener to update album position
    window.addEventListener('resize', () => {
        if (window.albumLink && window.albumLink.updateAlbumPosition) {
            window.albumLink.updateAlbumPosition();
        }
        
        // Update speaker position on resize
        if (window.playSpeaker && window.playSpeaker.updateSpeakerPosition) {
            window.playSpeaker.updateSpeakerPosition();
        }
    });
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
 * Show game over summary with replay option
 * @param {string} message - The message to display (optional)
 */
function showGameOverSummary(message) {
    const sceneContainer = gameState.elements.sceneContainer;
    const trainButton = gameState.elements.trainButton;
    
    // Disable clicking
    gameState.canClick = false;
    gameState.isTransitioning = true;
    
    // Add game over class
    sceneContainer.classList.add('game-over');
    
    // Hide train button
    if (trainButton) {
        trainButton.style.display = 'none';
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
    
    // Use default message if none provided
    if (!message) {
        // Determine which set of messages to use based on awareness level
        let messageSet;
        if (gameState.awarenessLevel <= 2) {
            messageSet = GAME_OVER_SUMMARY_TEXT.early;
        } else if (gameState.awarenessLevel <= 4) {
            messageSet = GAME_OVER_SUMMARY_TEXT.mid;
        } else {
            messageSet = GAME_OVER_SUMMARY_TEXT.late;
        }
        
        // Select a random message from the appropriate message set
        message = messageSet[Math.floor(Math.random() * messageSet.length)];
    }
    
    // Get or update the high score
    let highScore = localStorage.getItem('droneHighScore') || 0;
    highScore = parseInt(highScore);
    
    // Check if player achieved a new high score
    const isNewBest = gameState.changesFound > highScore;
    
    // Update high score if current changes found is higher
    if (isNewBest) {
        highScore = gameState.changesFound;
        localStorage.setItem('droneHighScore', highScore);
    }
    
    // Create and show the summary popup
    setTimeout(() => {
        const summaryPopup = document.createElement('div');
        summaryPopup.className = 'game-over-summary';
        
        // Create the changes found text with appropriate high score message
        let changesFoundText;
        if (isNewBest) {
            changesFoundText = `Changes found: ${gameState.changesFound} <span style="color: #ffcc00; font-weight: bold;">New Best!</span>`;
        } else {
            changesFoundText = `Changes found: ${gameState.changesFound} || Your best: ${highScore}`;
        }
        
        summaryPopup.innerHTML = `
            <h2>AWARENESS LOST</h2>
            <p>${message}</p>
            <p></p>
            <p>${changesFoundText}</p>
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
    const commuterProb = 0.3; // 20% chance for commuter changes (reduced from 40%)
    const setDressingProb = 0.7; // 80% chance for set dressing changes (increased from 60%)
    
    console.log(`Change probabilities: commuter=${commuterProb.toFixed(2)}, setDressing=${setDressingProb.toFixed(2)}`);

    if (randomValue < commuterProb) {
        // Create commuter change
        console.log("Creating commuter change for today");
        gameState.currentChange = { changeType: 'commuter', found: false };
        commuters.createRandomChange(1);
        
        // Double-check the found status
        if (gameState.currentChange && gameState.currentChange.found !== false) {
            console.warn("Warning: Commuter change found status was not false! Correcting it now.");
            gameState.currentChange.found = false;
        }
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
            
            // CRITICAL FIX: Ensure found property is explicitly set to false
            gameState.currentChange.found = false;
            
            // Log more details about the change for debugging
            console.log("Set dressing change details:", JSON.stringify(gameState.currentChange, null, 2));
            
            // If this is an 'add' change, specifically log it
            if (change.changeAction === 'add') {
                const newDressing = window.setDressing.allSetDressing.find(d => d.id === change.elementId);
                if (newDressing) {
                    console.log(`Added new ${newDressing.type} set dressing element at position [${newDressing.position}]`);
                }
            } else if (change.changeAction === 'swap') {
                console.log(`Changed set dressing from ${change.fromType} to ${change.toType}`);
            }
        } else {
            // Fallback to commuter change if set dressing change fails
            console.warn("Failed to create set dressing change, falling back to commuter change");
            gameState.currentChange = { changeType: 'commuter', found: false };
            commuters.createRandomChange(1);
            
            // Double-check the found status again
            if (gameState.currentChange && gameState.currentChange.found !== false) {
                console.warn("Warning: Fallback commuter change found status was not false! Correcting it now.");
                gameState.currentChange.found = false;
            }
        }
    } else {
        // Fallback to commuter change if set dressing is not available
        console.log("Set dressing not available, creating commuter change");
        gameState.currentChange = { changeType: 'commuter', found: false };
        commuters.createRandomChange(1);
        
        // Double-check the found status once more
        if (gameState.currentChange && gameState.currentChange.found !== false) {
            console.warn("Warning: Fallback commuter change found status was not false! Correcting it now.");
            gameState.currentChange.found = false;
        }
    }
}

/**
 * Update awareness level based on current XP
 * This is used for initialization and checks
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
        console.log(`Updating awareness level: ${gameState.awarenessLevel} -> ${newLevel} (XP: ${gameState.awarenessXP})`);
        gameState.awarenessLevel = newLevel;
    }
    
    // Update meter if it exists
    if (gameState.awarenessMeter) {
        gameState.awarenessMeter.setProgress(gameState.awarenessLevel, gameState.awarenessXP);
    }
    
    return gameState.awarenessLevel;
}

/**
 * Calculate awareness XP gain based on current day/difficulty
 * @returns {number} - The amount of XP to award
 */
function calculateAwarenessXP() {
    // Use fixed XP amount with no modifiers
    const xpAmount = AWARENESS_CONFIG.baseXpForFindingChange;
    
    console.log(`Awarding fixed XP amount: ${xpAmount}`);
    
    return xpAmount;
}

/**
 * Calculate awareness XP gain for taking the train (no changes found)
 * This is a simpler calculation since it's just a base amount
 * @returns {number} - The amount of XP to award
 */
function calculateTrainXP() {
    // Use fixed XP amount with no modifiers
    const xpAmount = AWARENESS_CONFIG.baseXpForTakingTrain;
    
    console.log(`Awarding fixed train XP amount: ${xpAmount}`);
    
    return xpAmount;
}

/**
 * Add this new diagnostic function at the end of the file
 */
// Diagnostic function to help trace train button issues
function diagnoseBtnVisibility() {
    console.log("===== TRAIN BUTTON DIAGNOSTIC =====");
    
    // Check if train button exists in gameState
    console.log("gameState.elements.trainButton exists:", 
        gameState.elements && gameState.elements.trainButton ? "YES" : "NO");
    
    // Get direct DOM reference
    const trainBtn = document.getElementById('train-button');
    console.log("DOM train-button exists:", trainBtn ? "YES" : "NO");
    
    // Check display status
    if (trainBtn) {
        console.log("DOM train-button display:", trainBtn.style.display);
        console.log("DOM train-button computed display:", 
            window.getComputedStyle(trainBtn).display);
        console.log("DOM train-button disabled:", trainBtn.disabled);
        console.log("DOM train-button visible:", 
            trainBtn.offsetWidth > 0 && trainBtn.offsetHeight > 0 ? "YES" : "NO");
    }
    
    // Check if gameState trainButton matches DOM
    if (gameState.elements && gameState.elements.trainButton) {
        console.log("gameState trainButton matches DOM:", 
            gameState.elements.trainButton === trainBtn ? "YES" : "NO");
    }
    
    // Check for any CSS that might be affecting the button
    if (trainBtn) {
        console.log("Classes on train-button:", trainBtn.className);
        console.log("Parent element:", trainBtn.parentElement ? 
            trainBtn.parentElement.tagName + "#" + trainBtn.parentElement.id : "NONE");
    }
    
    console.log("==================================");
    
    // Force the button to be visible 
    if (trainBtn) {
        trainBtn.style.display = 'block';
        trainBtn.disabled = false;
        // Remove any classes that might hide it
        trainBtn.classList.remove('hidden');
    }
}

/**
 * Update narrative text with typewriter effect
 */
function updateNarrativeText() {
    if (!gameState.typewriter) return;
    
    // Get the appropriate narrative text based on the day
    let narrativeText = '';
    
    // Filter out narratives that have already been used
    const availableNarratives = NARRATIVE_TEXTS.filter(text => !gameState.usedNarratives.includes(text));
    
    // If all narratives have been used, reset the used narratives list
    if (availableNarratives.length === 0) {
        gameState.usedNarratives = [];
        availableNarratives.push(...NARRATIVE_TEXTS);
    }
    
    // Select a random narrative from available narratives
    const randomIndex = Math.floor(Math.random() * availableNarratives.length);
    narrativeText = availableNarratives[randomIndex];
    
    // Add the narrative to used narratives
    gameState.usedNarratives.push(narrativeText);
    
    // Type out the narrative text
    gameState.typewriter.type(narrativeText);
}

/**
 * Remove all click blockers from the scene
 * This can be called from any file to ensure click blockers are removed
 */
function removeAllClickBlockers() {
    const clickBlockers = document.querySelectorAll('.click-blocker');
    if (clickBlockers.length > 0) {
        console.log(`Removing ${clickBlockers.length} click blockers`);
        clickBlockers.forEach(blocker => {
            if (blocker.parentNode) {
                blocker.parentNode.removeChild(blocker);
            }
        });
        return true;
    }
    return false;
}

/**
 * Create and initialize the lives HUD
 */
function createLivesHUD() {
    // Create the container for lives
    const livesContainer = document.createElement('div');
    livesContainer.id = 'lives-container';
    livesContainer.className = 'lives-container';
    
    // Add a label for the lives
    const livesLabel = document.createElement('div');
    livesLabel.textContent = 'LIVES:';
    livesLabel.className = 'lives-label';
    
    livesContainer.appendChild(livesLabel);
    
    // Use heart sprite images instead of canvas drawing
    const heartImageURL = 'assets/sprites/heart.png';
    const grayHeartImageURL = 'assets/sprites/heart_gray.png';
    const emptyHeartImageURL = 'assets/sprites/heart_empty.png';
    
    // Store heart image URLs for later use
    gameState.heartImageURL = heartImageURL;
    gameState.grayHeartImageURL = grayHeartImageURL;
    gameState.emptyHeartImageURL = emptyHeartImageURL;
    
    // Create heart elements for each life
    for (let i = 0; i < gameState.lives; i++) {
        const heartElement = document.createElement('div');
        heartElement.className = 'life-heart';
        heartElement.style.backgroundImage = `url(${heartImageURL})`;
        heartElement.style.width = '28px';
        heartElement.style.height = '28px';
        heartElement.style.backgroundSize = 'contain';
        heartElement.style.backgroundRepeat = 'no-repeat';
        livesContainer.appendChild(heartElement);
    }
    
    // Add the lives container to the scene
    const sceneContainer = document.getElementById('scene-container');
    if (sceneContainer) {
        sceneContainer.appendChild(livesContainer);
    } else {
        // Fallback if scene container not found
        document.body.appendChild(livesContainer);
    }
    
    // Store reference to lives container for updates
    gameState.elements.livesContainer = livesContainer;
    
    // Restore narrative text to full width
    if (gameState.elements.narrativeText) {
        gameState.elements.narrativeText.style.width = '800px';
    }
    
    console.log(`Lives HUD created with ${gameState.lives} lives`);
}

/**
 * Update the lives display after losing a life
 */
function updateLivesDisplay() {
    if (!gameState.elements.livesContainer) return;
    
    // Remove all heart elements
    const hearts = gameState.elements.livesContainer.querySelectorAll('.life-heart, .empty-heart');
    hearts.forEach(heart => heart.remove());
    
    // Always create 3 heart elements (the initial max)
    const maxLives = 3;
    
    for (let i = 0; i < maxLives; i++) {
        if (i < gameState.lives) {
            // Create full heart for remaining lives
            const heartElement = document.createElement('div');
            heartElement.className = 'life-heart';
            heartElement.style.backgroundImage = `url(${gameState.heartImageURL})`;
            heartElement.style.width = '28px';
            heartElement.style.height = '28px';
            heartElement.style.backgroundSize = 'contain';
            heartElement.style.backgroundRepeat = 'no-repeat';
            gameState.elements.livesContainer.appendChild(heartElement);
        } else {
            // Create empty heart placeholder
            const emptyHeart = document.createElement('div');
            emptyHeart.className = 'empty-heart';
            emptyHeart.style.backgroundImage = `url(${gameState.emptyHeartImageURL})`;
            emptyHeart.style.width = '28px';
            emptyHeart.style.height = '28px';
            emptyHeart.style.backgroundSize = 'contain';
            emptyHeart.style.backgroundRepeat = 'no-repeat';
            gameState.elements.livesContainer.appendChild(emptyHeart);
        }
    }
    
    console.log(`Lives display updated: ${gameState.lives} lives remaining`);
}

/**
 * Remove a life from the player
 * @param {HTMLElement} clickedElement - The element that was clicked incorrectly
 * @returns {boolean} - True if player still has lives, false if game over
 */
function loseLife(clickedElement) {
    // Verify we have required elements
    if (!clickedElement || !gameState.elements.livesContainer) {
        // Just decrement lives with no animation if elements are missing
        gameState.lives--;
        updateLivesDisplay();
        return gameState.lives > 0;
    }
    
    // Capture the current number of lives so we can get the position before decrementing
    const currentLives = gameState.lives;
    
    // Create a visual effect of a black heart flying from the clicked element to the HUD
    // We pass the clicked element and the current lives count
    createHeartDoober(clickedElement, currentLives);
    
    // Decrement lives but don't update display yet
    gameState.lives--;
    console.log(`Player lost a life. Remaining lives: ${gameState.lives}`);
    
    // Delay updating the visual heart display until after the animation
    setTimeout(() => {
        // Update the lives display after animation is almost complete
        updateLivesDisplay();
    }, 750); // Just before the animation completes at 800ms
    
    // Return whether the player still has lives
    return gameState.lives > 0;
}

/**
 * Create a doober effect for a heart being lost
 * @param {HTMLElement} clickedElement - The element that was clicked incorrectly
 * @param {number} currentLives - Current number of lives before decrementing
 */
function createHeartDoober(clickedElement, currentLives) {
    // Create a black heart to animate
    const blackHeart = document.createElement('div');
    blackHeart.className = 'flying-heart black-heart';
    
    // Get positions
    const targetRect = clickedElement.getBoundingClientRect();
    const livesRect = gameState.elements.livesContainer.getBoundingClientRect();
    
    // Get all heart elements to find the correct one based on currentLives
    const heartElements = gameState.elements.livesContainer.querySelectorAll('.life-heart');
    
    // Calculate which heart to target (index is 0-based, but lives are 1-based)
    // Subtract 1 from currentLives because we're losing that heart
    const heartIndex = currentLives - 1;
    
    // Default position (right side of container) in case we can't find the specific heart
    let targetX = livesRect.right - 30;
    let targetY = livesRect.top + livesRect.height/2;
    
    // If we have heart elements and the index is valid, get the specific heart's position
    if (heartElements && heartElements.length > heartIndex && heartIndex >= 0) {
        const heartToRemove = heartElements[heartIndex];
        const heartRect = heartToRemove.getBoundingClientRect();
        
        // Get the exact center position of the heart
        targetX = heartRect.left + (heartRect.width / 2);
        targetY = heartRect.top + (heartRect.height / 2);
        
        console.log(`Targeting heart at index ${heartIndex} with exact position: x=${targetX}, y=${targetY}`);
    } else {
        console.log(`Could not find heart at index ${heartIndex}, using default position`);
    }
    
    // Size of the flying heart
    const heartSize = 28;
    
    // Position the black heart at the clicked element's position
    blackHeart.style.position = 'fixed';
    blackHeart.style.left = `${targetRect.left + targetRect.width/2 - heartSize/2}px`;  // Center horizontally
    blackHeart.style.top = `${targetRect.top + targetRect.height/2 - heartSize/2}px`;   // Center vertically
    blackHeart.style.width = `${heartSize}px`;
    blackHeart.style.height = `${heartSize}px`;
    blackHeart.style.backgroundImage = `url(${gameState.grayHeartImageURL})`;
    blackHeart.style.backgroundSize = 'contain';
    blackHeart.style.backgroundRepeat = 'no-repeat';
    blackHeart.style.backgroundPosition = 'center';
    blackHeart.style.zIndex = '1000';
    blackHeart.style.filter = 'drop-shadow(0 0 5px rgba(255, 0, 0, 0.7))';
    blackHeart.style.transition = 'none';
    
    // Add to document body
    document.body.appendChild(blackHeart);
    
    // Force a reflow to ensure transition works
    void blackHeart.offsetWidth;
    
    // Add transition and animate to the target heart position
    blackHeart.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
    // Account for the size of the flying heart to center it on the target
    blackHeart.style.left = `${targetX - (heartSize/2)}px`;  // Center on target
    blackHeart.style.top = `${targetY - (heartSize/2)}px`;   // Center on target
    blackHeart.style.transform = 'scale(0.8)';
    blackHeart.style.opacity = '0.4';
    
    // Create break particle effect at the clicked element
    createHeartBreakEffect(targetRect);
    
    // Remove the black heart element after animation completes
    setTimeout(() => {
        if (blackHeart.parentNode) {
            // Add a fade out
            blackHeart.style.opacity = '0';
            setTimeout(() => {
                if (blackHeart.parentNode) {
                    blackHeart.parentNode.removeChild(blackHeart);
                }
            }, 300);
        }
    }, 800);
}

/**
 * Create heart break effect at the clicked position
 */
function createHeartBreakEffect(targetRect) {
    const container = document.createElement('div');
    container.className = 'heart-break-effect';
    
    const centerX = targetRect.left + targetRect.width/2;
    const centerY = targetRect.top + targetRect.height/2;
    
    // Create several particles
    for (let i = 0; i < 10; i++) {
        const particle = document.createElement('div');
        particle.className = 'heart-doober-particle';
        
        // Style the particle
        particle.style.position = 'fixed';
        particle.style.left = `${centerX}px`;
        particle.style.top = `${centerY}px`;
        particle.style.width = '5px';
        particle.style.height = '5px';
        particle.style.backgroundColor = '#ff3333';
        particle.style.borderRadius = '50%';
        particle.style.boxShadow = '0 0 6px rgba(255, 30, 30, 0.9)';
        particle.style.transform = 'translate(-50%, -50%)';
        particle.style.opacity = '1';
        
        // Add to container
        container.appendChild(particle);
        
        // Animate with random direction
        const angle = (i / 10) * Math.PI * 2 + (Math.random() * 0.5); // Add some randomness
        const distance = 30 + Math.random() * 50;
        const duration = 400 + Math.random() * 300;
        
        // Calculate end position
        const endX = centerX + Math.cos(angle) * distance;
        const endY = centerY + Math.sin(angle) * distance;
        
        // Animate with Web Animations API
        particle.animate([
            { transform: 'translate(-50%, -50%) scale(1)', opacity: 1 },
            { transform: `translate(calc(${endX - centerX}px - 50%), calc(${endY - centerY}px - 50%)) scale(0)`, opacity: 0 }
        ], {
            duration: duration,
            easing: 'cubic-bezier(0.2, 0.9, 0.3, 1)',
            fill: 'forwards'
        });
    }
    
    document.body.appendChild(container);
    
    // Remove after animation completes
    setTimeout(() => {
        if (container.parentNode) {
            container.parentNode.removeChild(container);
        }
    }, 800);
}
