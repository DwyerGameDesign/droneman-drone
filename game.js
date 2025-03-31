/**
 * Drone: The Daily Commute
 * Main game logic - Updated for single sprite approach
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
let foundFirstChange = false;
let typewriter = null;
let awarenessMeter = null;

// Game elements
const sceneContainer = document.getElementById('scene-container');
const trainButton = document.getElementById('train-button');
const dayDisplay = document.getElementById('day');
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
    // Initialize typewriter
    initTypewriter();
    
    // Create awareness meter
    createAwarenessMeter();
    
    // Update displays
    updateAwarenessDisplay();
    
    // Set initial narrative text
    typewriter.type("everyday the same...");
    
    // Get the train button element with error handling
    const trainButton = document.getElementById('train-button');
    // Only add event listener if button exists
    if (trainButton) {
        trainButton.addEventListener('click', takeTrain);
    } else {
        console.log("Train button not found - continuing without it");
    }
    
    // Apply initial color stage
    updateColorStage();
}

/**
 * Initialize the typewriter for narrative text
 */
function initTypewriter() {
    // Create a new Typewriter instance
    if (typeof Typewriter !== 'undefined') {
        typewriter = new Typewriter(narrativeText, {
            speed: 40,
            delay: 0,
            cursor: '|'
        });
    } else {
        // Fallback for when the Typewriter class is not available
        typewriter = {
            type: function(text) {
                narrativeText.textContent = text;
                return this;
            },
            stop: function() {
                // Do nothing
            }
        };
        
        // Try to load the Typewriter script dynamically
        const script = document.createElement('script');
        script.src = 'typewriter.js';
        script.onload = function() {
            // Once loaded, create a proper Typewriter instance
            typewriter = new Typewriter(narrativeText, {
                speed: 40,
                delay: 0,
                cursor: '|'
            });
            typewriter.type(narrativeText.textContent);
        };
        document.head.appendChild(script);
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
    awarenessMeter = new AwarenessMeter({
        container: awarenessContainer,
        ...AWARENESS_METER_CONFIG,
        onSegmentFilled: handleSegmentFilled
    });
    
    // Initial update
    awarenessMeter.update(awareness);
}

/**
 * Handle when a meter segment is filled
 */
function handleSegmentFilled(segmentNumber) {
    console.log(`Segment ${segmentNumber} filled!`);
    
    // Add a new commuter when we have enough awareness
    // This function is defined in sprite_integration.js
    if (typeof addNewCommuter === 'function') {
        addNewCommuter(segmentNumber);
    }
}

/**
 * Update the awareness display
 */
function updateAwarenessDisplay() {
    // Update meter if available
    if (awarenessMeter) {
        awarenessMeter.update(awareness);
    }
}

/**
 * Take the train to the next day
 */
function takeTrain() {
    // Prevent multiple clicks during transition
    if (isTransitioning) return;
    
    isTransitioning = true;
    
    // Disable train button during transition (if it exists)
    const trainButton = document.getElementById('train-button');
    if (trainButton) {
        trainButton.disabled = true;
    }
    
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
        
        // Handle day 4 specifically for the first change
        if (day === 4) {
            // Use the predefined first change for day 4
            currentChange = createFirstChange();
            currentChange.found = false;
            
            // Add the current change to the history of all changes
            allChanges.push(currentChange);
            
            // Apply the change to the commuter
            applyChange(currentChange);
            
            // Enable clicking since there's something to find
            canClick = true;
        } else if (day > 4) {
            // Generate random changes after the first one
            currentChange = selectRandomChange();
            if (currentChange) {
                currentChange.found = false;
                
                // Add the current change to the history of all changes
                allChanges.push(currentChange);
                
                // Apply the change to the commuter
                applyChange(currentChange);
                
                // Enable clicking since there's something to find
                canClick = true;
            }
        } else {
            // No change to find yet
            currentChange = null;
            canClick = false;
        }
        
        // Only update lyrics if they exist for this day
        checkForLyrics();
        
        // Maintain container size - fixed width and height
        sceneContainer.style.width = '800px';
        sceneContainer.style.height = '400px';
        narrativeText.style.width = '800px';
        
        // Stop any previous typewriting
        if (typewriter) {
            typewriter.stop();
        }
        
        // Fade back in
        setTimeout(() => {
            sceneContainer.classList.remove('fading');
            
            // Start typewriter animation for the narrative text
            if (typewriter) {
                // Get the current narrative text
                const textToType = narrativeText.textContent;
                narrativeText.textContent = ''; // Clear for typewriter effect
                setTimeout(() => {
                    typewriter.type(textToType);
                }, 100);
            }
            
            // Re-enable train button if it exists
            const trainButton = document.getElementById('train-button');
            if (trainButton) {
                trainButton.disabled = false;
            }
            
            isTransitioning = false; // Reset transition flag
        }, GAME_SETTINGS.fadeInDuration);
    }, GAME_SETTINGS.fadeOutDuration);
}

/**
 * Create the first change - stub to be implemented by sprite_integration.js
 */
function createFirstChange() {
    // This will be overridden by sprite_integration.js
    console.log('Creating first change');
    return null;
}

/**
 * Function to highlight missed changes - stub to be implemented by sprite_integration.js
 */
function highlightMissedChange(change) {
    console.log('Highlighting missed change:', change);
    // This will be overridden by sprite_integration.js
}

/**
 * Select a random element to change - stub to be implemented by sprite_integration.js
 */
function selectRandomChange() {
    console.log('Selecting random change');
    // This will be overridden by sprite_integration.js
    return null;
}

/**
 * Apply the selected change - stub to be implemented by sprite_integration.js
 */
function applyChange(change) {
    console.log('Applying change:', change);
    // This will be overridden by sprite_integration.js
}

/**
 * Handle element clicks - stub to be implemented by sprite_integration.js
 */
function handleElementClick(event) {
    // This will be overridden by sprite_integration.js
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
 * Check for lyrics for the current day
 */
function checkForLyrics() {
    // Check if there's a lyric for the current day
    const lyricForToday = SONG_LYRICS.find(lyric => lyric.day === day);
    
    if (lyricForToday) {
        narrativeText.textContent = `"${lyricForToday.text}"`;
    }
}

/**
 * Update the narrative text based on the current awareness
 * Only called when a change is found
 */
function updateNarrativeText() {
    // Don't change initial narrative until first change is found
    if (!foundFirstChange) {
        foundFirstChange = true;
        narrativeText.textContent = "I noticed something different today...";
        
        if (typewriter) {
            typewriter.stop();
            setTimeout(() => {
                typewriter.type(narrativeText.textContent);
            }, 100);
        }
        return;
    }
    
    // Check if there's a lyric for the current day
    const lyricForToday = SONG_LYRICS.find(lyric => lyric.day === day);
    
    if (lyricForToday) {
        narrativeText.textContent = `"${lyricForToday.text}"`;
        
        // Restart the typewriter with this text
        if (typewriter) {
            typewriter.stop();
            setTimeout(() => {
                typewriter.type(narrativeText.textContent);
            }, 100);
        }
    } else {
        // Choose narrative based on awareness cycles (repeating every 40 awareness points)
        const narrativeCycle = Math.floor(awareness / 10) % 4;
        
        let newText = "";
        
        switch(narrativeCycle) {
            case 0:
                newText = "The routine continues. Same faces, same train. But something feels different today.";
                break;
            case 1:
                newText = "You're starting to notice the world around you more clearly. The routine is still there, but you're waking up.";
                break;
            case 2:
                newText = "The grip is loosening. Each day you feel more conscious, more alive. The routine can be broken.";
                break;
            case 3:
                newText = "The world is more vibrant now. The daily commute is becoming a journey of choice, not necessity.";
                break;
        }
        
        narrativeText.textContent = newText;
        
        // Restart the typewriter with this text
        if (typewriter) {
            typewriter.stop();
            setTimeout(() => {
                typewriter.type(newText);
            }, 100);
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
    // Additional game completion effects
    sceneContainer.classList.add('completion');
    
    // Display final message
    setTimeout(() => {
        const completionMessage = document.createElement('div');
        completionMessage.className = 'completion-message';
        completionMessage.innerHTML = `
            <h2>DRONE NO MORE</h2>
            <p>You've reached 100% awareness and broken free from the daily grind.</p>
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
        
        // Use typewriter for final message
        if (typewriter) {
            typewriter.stop();
            setTimeout(() => {
                typewriter.type(narrativeText.textContent);
            }, 100);
        }
    }, 3000);
}