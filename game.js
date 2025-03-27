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
    
    trainButton.addEventListener('click', takeTrain);
    
    // Apply initial color stage
    updateColorStage();
}

/**
 * Set up click handlers for all elements
 */
function setupClickHandlers() {
    // Add click handlers to all potentially changing elements
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
    if (!canClick) return;
    
    const clickedId = event.target.id;
    
    if (clickedId === currentChange.id) {
        // Correct element clicked
        showMessage("You noticed the difference!", 2000);
        increaseAwareness(GAME_SETTINGS.baseAwarenessGain);
        canClick = false;
        showThoughtBubble();
        
        // Enable the button again after a short delay
        setTimeout(() => {
            trainButton.disabled = false;
        }, 1500);
    } else {
        // Wrong element clicked
        showMessage("That's not what changed...", 1500);
    }
}

/**
 * Take the train to the next day
 */
function takeTrain() {
    if (!canClick && day > 1) return;
    
    trainButton.disabled = true;
    
    // Fade out
    sceneContainer.classList.add('fading');
    
    setTimeout(() => {
        // Save current state as previous
        previousState = {...currentState};
        
        // Increment day
        day++;
        dayDisplay.textContent = day;
        
        // Generate new change
        currentChange = selectRandomChange();
        
        // Apply the change
        applyChange(currentChange);
        
        // Check for lyrics
        checkForLyrics();
        
        // Fade back in
        setTimeout(() => {
            sceneContainer.classList.remove('fading');
            
            // Allow clicking after fade completes
            setTimeout(() => {
                canClick = true;
                showMessage("Find what changed today...", 2000);
            }, 1000);
        }, GAME_SETTINGS.waitDuration);
    }, GAME_SETTINGS.fadeOutDuration);
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
    
    // Determine what change to make
    let changeType;
    if (category.type === 'arm') {
        // For arms, change rotation
        const rotationAngle = Math.floor((randomSeed % 87) - 43); // Range: -43 to +43 degrees
        changeType = {
            property: 'transform',
            value: `rotate(${rotationAngle}deg)`
        };
    } else if (category.type === 'accessory') {
        // For accessories, toggle visibility
        const element = document.getElementById(elementId);
        const currentVisibility = element.style.visibility;
        changeType = {
            property: 'visibility',
            value: currentVisibility === 'visible' ? 'hidden' : 'visible'
        };
    }
    
    return {
        id: elementId,
        type: category.type,
        change: changeType
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
    
    // Additional game completion logic could go here
    // - Play victory sound
    // - Show end screen
    // - Offer restart option
}

/**
 * Utility function to get a random item from an array
 */
function getRandomFromArray(array) {
    return array[Math.floor(Math.random() * array.length)];
}

// Initialize the game
init();