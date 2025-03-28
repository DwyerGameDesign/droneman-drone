/**
 * Drone: The Daily Commute
 * Main game logic
 */

// Game state
let day = 1;
let awareness = 0;
let canClick = false;
let currentChange = null;
let previousState = {};
let currentState = {};
let isTransitioning = false;
let allChanges = [];

// Game elements
const sceneContainer = document.getElementById('scene-container');
const trainButton = document.getElementById('train-button');
const dayDisplay = document.getElementById('day');
const awarenessDisplay = document.getElementById('awareness-number');
const narrativeText = document.getElementById('narrative-text');
const fadeOverlay = document.getElementById('fade-overlay');
const message = document.getElementById('message');
const thoughtBubble = document.getElementById('thought-bubble');

// Initialize the game when DOM is fully loaded
document.addEventListener('DOMContentLoaded', init);

/**
 * Initialize the game
 */
function init() {
    // Update displays
    updateAwarenessDisplay();
    updateNarrativeText();
    
    // Setup click handlers for elements
    setupClickHandlers();
    
    // Initialize default styles for all elements
    initializeDefaultStyles();
    
    // Add train button listener
    trainButton.addEventListener('click', takeTrain);
    
    // Apply initial color stage
    updateColorStage();
    
    // Show initial message
    showMessage("Find what's different each day", 3000);
}

/**
 * Initialize default property values for all changeable elements
 */
function initializeDefaultStyles() {
    CHANGEABLE_ELEMENTS.forEach(category => {
        category.ids.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                // Set initial defaults based on type
                switch(category.type) {
                    case 'hat-visibility':
                    case 'briefcase-visibility':
                        element.style.visibility = Math.random() < 0.8 ? 'hidden' : 'visible';
                        break;
                    case 'hat':
                    case 'briefcase':
                        if (element.style.visibility === 'visible') {
                            const randomColor = category.values[Math.floor(Math.random() * category.values.length)];
                            element.style.backgroundColor = randomColor;
                        }
                        break;
                    default:
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
        
        // Mark the change as found
        currentChange.found = true;
    } else {
        // Wrong element clicked
        showMessage("everyday the same", 1500);
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
        
        // Proceed to next day after highlighting
        setTimeout(() => {
            proceedToNextDay();
        }, GAME_SETTINGS.missedChangeHighlightDuration);
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
        
        // Generate new change
        currentChange = selectRandomChange();
        currentChange.found = false; // Initialize as not found
        
        // Add the current change to the history of all changes
        allChanges.push(currentChange);
        
        // Apply the change to the element
        applyChange(currentChange);
        
        // Update narrative text
        updateNarrativeText();
        
        // Maintain container size - fixed width and height
        sceneContainer.style.width = '800px';
        sceneContainer.style.height = '400px';
        narrativeText.style.width = '800px';
        
        // Fade back in
        setTimeout(() => {
            sceneContainer.classList.remove('fading');
            
            // Allow clicking after fade completes
            setTimeout(() => {
                canClick = true;
                isTransitioning = false; // Reset transition flag
                showMessage(`Day ${day}: Find what changed today`, 2000);
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
    // Randomly select a category
    const categoryIndex = Math.floor(Math.random() * CHANGEABLE_ELEMENTS.length);
    const category = CHANGEABLE_ELEMENTS[categoryIndex];
    
    // Randomly select an element from the category
    const elementIndex = Math.floor(Math.random() * category.ids.length);
    const elementId = category.ids[elementIndex];
    
    // Get current element
    const element = document.getElementById(elementId);
    if (!element) return null;
    
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
    
    updateAwarenessDisplay();
    updateColorStage();
    
    // No cap on maximum awareness, just keep incrementing
}

/**
 * Update the awareness display
 */
function updateAwarenessDisplay() {
    awarenessDisplay.textContent = awareness;
}

/**
 * Update the narrative text based on the current day/awareness
 */
function updateNarrativeText() {
    // Check if there's a lyric for the current day
    const lyricForToday = SONG_LYRICS.find(lyric => lyric.day === day);
    
    if (lyricForToday) {
        narrativeText.textContent = `"${lyricForToday.text}"`;
    } else if (day === 1) {
        narrativeText.textContent = "Every day the same. Rolling to a paycheck. 6:40 train. Find the differences in your routine commute to break free from the monotony.";
    } else {
        // Choose narrative based on awareness cycles (repeating every 40 awareness points)
        const narrativeCycle = Math.floor(awareness / 10) % 4;
        
        switch(narrativeCycle) {
            case 0:
                narrativeText.textContent = "The routine continues. Same faces, same train. But something feels different today.";
                break;
            case 1:
                narrativeText.textContent = "You're starting to notice the world around you more clearly. The routine is still there, but you're waking up.";
                break;
            case 2:
                narrativeText.textContent = "The grip is loosening. Each day you feel more conscious, more alive. The routine can be broken.";
                break;
            case 3:
                narrativeText.textContent = "The world is more vibrant now. The daily commute is becoming a journey of choice, not necessity.";
                break;
        }
    }
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
 * Game completion
 */
function gameComplete() {
    showMessage("You've broken free from the routine! DRONE NO MORE!", 5000);
    
    // Additional game completion effects
    sceneContainer.classList.add('completion');
    
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
        
        // Style the completion message
        completionMessage.style.position = 'absolute';
        completionMessage.style.top = '50%';
        completionMessage.style.left = '50%';
        completionMessage.style.transform = 'translate(-50%, -50%)';
        completionMessage.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        completionMessage.style.color = '#d4d4c8';
        completionMessage.style.padding = '20px';
        completionMessage.style.textAlign = 'center';
        completionMessage.style.zIndex = '1000';
        
        // Add to scene
        sceneContainer.appendChild(completionMessage);
        
        // Update narrative
        narrativeText.textContent = "DRONE NO MORE, I'M MY OWN MAN. You've broken free from the cycle.";
    }, 6000);
}