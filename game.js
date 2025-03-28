/**
 * Drone: The Daily Commute
 * Main game logic - Updated for retro pixel art style
 */

// Game state
let day = 1;
let awareness = 0;
let canClick = false;
let currentChange = null;
let previousState = {};
let currentState = {};
let isTransitioning = false; // Flag to prevent multiple transitions
let allChanges = []; // Array to store all changes for persistence

// Game elements
const sceneContainer = document.getElementById('scene-container');
const trainButton = document.getElementById('train-button');
const dayDisplay = document.getElementById('day');
const awarenessPercent = document.getElementById('awareness-percent');
const awarenessFill = document.getElementById('awareness-fill');
const lyricDisplay = document.getElementById('lyric-display');
const fadeOverlay = document.getElementById('fade-overlay');
const message = document.getElementById('message');
const thoughtBubble = document.getElementById('thought-bubble');

/**
 * Initialize the game
 */
function init() {
    updateAwarenessDisplay();
    checkForLyrics();
    setupClickHandlers();
    initializeDefaultStyles();
    
    trainButton.addEventListener('click', takeTrain);
    
    // Apply initial color stage
    updateColorStage();
    
    // Check if window includes utils.js and trigger mobile optimizations if necessary
    if (typeof transitionBackgroundColor === 'function') {
        setupMobileOptimizations();
    }
}

/**
 * Initialize default styles for all changeable elements
 */
function initializeDefaultStyles() {
    // Initialize default property values for all changeable elements
    CHANGEABLE_ELEMENTS.forEach(category => {
        category.ids.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                // Set initial defaults based on type
                switch(category.type) {
                    case 'hat-visibility':
                    case 'briefcase-visibility':
                        // 80% chance to be hidden initially
                        element.style.visibility = Math.random() < 0.8 ? 'hidden' : 'visible';
                        break;
                    case 'hat':
                    case 'briefcase':
                        // Random initial color if visible
                        if (element.style.visibility === 'visible') {
                            const randomColor = category.values[Math.floor(Math.random() * category.values.length)];
                            element.style.backgroundColor = randomColor;
                        }
                        break;
                    case 'trench-coat':
                    case 'trench-coat-width':
                    case 'pants':
                    case 'shoe-color':
                    case 'face-color':
                    case 'briefcase-position':
                        // Random initial value
                        const randomValue = category.values[Math.floor(Math.random() * category.values.length)];
                        element.style[category.property] = randomValue;
                        break;
                }
                
                // Store initial state
                currentState[id] = {
                    property: category.property,
                    value: element.style[category.property]
                };
            }
        });
    });
}

/**
 * Set up click handlers for all elements
 */
function setupClickHandlers() {
    // Add click handlers to all changeable elements
    CHANGEABLE_ELEMENTS.forEach(category => {
        category.ids.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('click', handleElementClick);
            }
        });
    });
}

/**
 * Set up mobile-specific optimizations
 */
function setupMobileOptimizations() {
    // Detect mobile devices
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
        // Make clickable elements larger for mobile
        document.querySelectorAll('.person, .hat, .bag, .left-leg, .right-leg, .left-shoe, .right-shoe').forEach(el => {
            el.style.minWidth = '24px';
            el.style.minHeight = '24px';
        });
        
        // Add touch feedback
        document.querySelectorAll('.person, .hat, .bag, .left-leg, .right-leg, .left-shoe, .right-shoe').forEach(el => {
            el.addEventListener('touchstart', function() {
                this.style.opacity = '0.7';
            });
            
            el.addEventListener('touchend', function() {
                this.style.opacity = '1';
            });
        });
    }
}

/**
 * Handle clicks on scene elements
 */
function handleElementClick(event) {
    if (!canClick || isTransitioning) return;
    
    const clickedId = event.target.id;
    
    if (clickedId === currentChange.id) {
        // Correct element clicked
        showMessage("You noticed the difference!", 2000);
        increaseAwareness(GAME_SETTINGS.baseAwarenessGain);
        canClick = false;
        showThoughtBubble();
        
        // Highlight the correct element
        const element = document.getElementById(clickedId);
        if (element) {
            // Add a temporary highlight
            const originalBorder = element.style.border;
            element.style.border = '2px solid white';
            
            setTimeout(() => {
                element.style.border = originalBorder;
            }, 1000);
        }
        
        // Mark the change as found but don't proceed to next day automatically
        currentChange.found = true;
    } else {
        // Wrong element clicked
        showMessage("That's not what changed...", 1500);
    }
}

/**
 * Take the train to the next day
 */
function takeTrain() {
    // Prevent multiple clicks during transition
    if (isTransitioning) return;
    
    isTransitioning = true;
    
    // Check if there's an unfound change to highlight
    if (currentChange && !currentChange.found) {
        highlightMissedChange(currentChange);
        
        // If fadeAfterHighlight is enabled, proceed to next day after highlighting
        if (GAME_SETTINGS.fadeAfterHighlight) {
            setTimeout(() => {
                proceedToNextDay();
            }, GAME_SETTINGS.missedChangeHighlightDuration);
        } else {
            // Just restore the transition flag if we're not fading
            setTimeout(() => {
                isTransitioning = false;
            }, GAME_SETTINGS.missedChangeHighlightDuration);
        }
    } else {
        // No change or player already found it, proceed immediately
        proceedToNextDay();
    }
}

/**
 * Function to handle the transition to the next day
 */
function proceedToNextDay() {
    // Fade out
    sceneContainer.classList.add('fading');
    
    setTimeout(() => {
        // Save current state as previous
        previousState = JSON.parse(JSON.stringify(currentState));
        
        // Increment day
        day++;
        dayDisplay.textContent = day;
        
        // Determine number of changes based on current day
        const numberOfChanges = day >= GAME_SETTINGS.multipleChangesThreshold ? 
            Math.min(3, Math.floor((day - GAME_SETTINGS.multipleChangesThreshold) / 20) + 1) : 1;
        
        // Generate new change(s)
        currentChange = selectRandomChange();
        currentChange.found = false; // Initialize as not found
        
        // Add the current change to the history of all changes
        allChanges.push(currentChange);
        
        // Apply all past changes to maintain persistence
        allChanges.forEach(change => {
            applyChange(change);
        });
        
        // Check for lyrics
        checkForLyrics();
        
        // Fade back in
        setTimeout(() => {
            sceneContainer.classList.remove('fading');
            
            // Allow clicking after fade completes
            setTimeout(() => {
                canClick = true;
                isTransitioning = false; // Reset transition flag
                showMessage(`Find what changed today... (Day ${day})`, 2000);
            }, GAME_SETTINGS.fadeInDuration);
        }, GAME_SETTINGS.waitDuration);
    }, GAME_SETTINGS.fadeOutDuration);
}

/**
 * Function to highlight missed changes
 */
function highlightMissedChange(change) {
    const element = document.getElementById(change.id);
    if (element) {
        // Remove any existing highlight class
        element.classList.remove('highlight');
        
        // Add the highlight class to trigger the animation
        void element.offsetWidth; // Trigger reflow to restart animation
        element.classList.add('highlight');
        
        // Show a message about the missed change
        showMessage("You missed a change!", GAME_SETTINGS.missedChangeHighlightDuration);
    }
}

/**
 * Select a random element to change
 */
function selectRandomChange() {
    // Use the day number as part of the seed for consistent randomness
    const randomSeed = day * 17 % 1000;
    
    // Randomly select a category
    const categoryIndex = Math.floor((randomSeed / 1000) * CHANGEABLE_ELEMENTS.length);
    const category = CHANGEABLE_ELEMENTS[categoryIndex];
    
    // Randomly select an element from the category
    const elementIndex = Math.floor((randomSeed % 100) / 100 * category.ids.length);
    const elementId = category.ids[elementIndex];
    
    // Get current element
    const element = document.getElementById(elementId);
    
    // Get current value for this property
    const currentValue = element.style[category.property];
    
    // Choose a new value different from the current one
    let newValue;
    let attempts = 0;
    
    do {
        const valueIndex = Math.floor(Math.random() * category.values.length);
        newValue = category.values[valueIndex];
        attempts++;
        
        // Prevent infinite loop
        if (attempts > 10) break;
    } while (newValue === currentValue);
    
    return {
        id: elementId,
        type: category.type,
        change: {
            property: category.property,
            value: newValue
        }
    };
}

/**
 * Apply the selected change to the element
 */
function applyChange(change) {
    const element = document.getElementById(change.id);
    if (element) {
        element.style[change.change.property] = change.change.value;
        
        // Store current state
        currentState[change.id] = {
            property: change.change.property,
            value: change.change.value
        };
    }
}

/**
 * Show a message for a specified duration
 */
function showMessage(text, duration) {
    message.textContent = text;
    message.style.visibility = 'visible';
    
    setTimeout(() => {
        message.style.visibility = 'hidden';
    }, duration);
}

/**
 * Show the thought bubble with text based on awareness level
 */
function showThoughtBubble() {
    // Select appropriate thought based on awareness level
    let thoughtPool;
    
    if (awareness < 25) {
        thoughtPool = THOUGHTS.early;
    } else if (awareness < 50) {
        thoughtPool = THOUGHTS.mid;
    } else if (awareness < 75) {
        thoughtPool = THOUGHTS.late;
    } else {
        thoughtPool = THOUGHTS.final;
    }
    
    // Randomly select a thought
    const thought = thoughtPool[Math.floor(Math.random() * thoughtPool.length)];
    thoughtBubble.textContent = thought;
    
    // Position the thought bubble near the player
    thoughtBubble.style.top = '40%';
    thoughtBubble.style.left = '75%';
    thoughtBubble.style.visibility = 'visible';
    
    setTimeout(() => {
        thoughtBubble.style.visibility = 'hidden';
    }, 3000);
}

/**
 * Increase awareness level
 */
function increaseAwareness(amount) {
    awareness += amount;
    if (awareness > GAME_SETTINGS.maxAwareness) {
        awareness = GAME_SETTINGS.maxAwareness;
    }
    
    updateAwarenessDisplay();
    updateColorStage();
    
    // Check for game completion
    if (awareness >= GAME_SETTINGS.maxAwareness && day >= GAME_SETTINGS.winDay) {
        gameComplete();
    }
}

/**
 * Update the awareness display
 */
function updateAwarenessDisplay() {
    awarenessPercent.textContent = `${awareness}%`;
    awarenessFill.style.width = `${awareness}%`;
}

/**
 * Update the background color stage based on awareness
 */
function updateColorStage() {
    // Remove all stage classes first
    GAME_SETTINGS.colorStages.forEach(stage => {
        sceneContainer.classList.remove(stage.class);
    });
    
    // Find the appropriate stage for current awareness
    for (let i = GAME_SETTINGS.colorStages.length - 1; i >= 0; i--) {
        if (awareness >= GAME_SETTINGS.colorStages[i].threshold) {
            sceneContainer.classList.add(GAME_SETTINGS.colorStages[i].class);
            break;
        }
    }
}

/**
 * Check if there's a lyric for the current day
 */
function checkForLyrics() {
    const lyricForToday = SONG_LYRICS.find(lyric => lyric.day === day);
    if (lyricForToday) {
        lyricDisplay.textContent = `"${lyricForToday.text}"`;
    } else {
        lyricDisplay.textContent = '';
    }
}

/**
 * Game completion
 */
function gameComplete() {
    showMessage("You've broken free from the routine! DRONE NO MORE!", 5000);
    
    // Additional game completion effects
    sceneContainer.classList.add('completion');
    
    // Play victory animation on player character
    const player = document.getElementById('player');
    if (player) {
        player.classList.add('victory-dance');
    }
    
    // Display final message
    setTimeout(() => {
        const completionMessage = document.createElement('div');
        completionMessage.className = 'completion-message';
        completionMessage.innerHTML = `
            <h2>Congratulations!</h2>
            <p>You've reached 100% awareness and broken free from the daily grind.</p>
            <p>No longer a drone, you've taken control of your life.</p>
            <p>Days on the train: ${day}</p>
        `;
        
        // Style the completion message - retro pixel art style
        completionMessage.style.position = 'absolute';
        completionMessage.style.top = '50%';
        completionMessage.style.left = '50%';
        completionMessage.style.transform = 'translate(-50%, -50%)';
        completionMessage.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        completionMessage.style.color = '#d4d4c8';
        completionMessage.style.padding = '20px';
        completionMessage.style.textAlign = 'center';
        completionMessage.style.zIndex = '1000';
        completionMessage.style.fontFamily = 'Courier New, monospace';
        
        // Add to scene
        sceneContainer.appendChild(completionMessage);
    }, 6000);
}

// Initialize the game
document.addEventListener('DOMContentLoaded', init);