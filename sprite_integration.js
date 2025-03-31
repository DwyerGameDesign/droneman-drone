/**
 * Drone: The Daily Commute
 * Sprite Integration - Handles commuter sprites and changes
 */

// Global variables
let spriteBasePath = 'assets/sprites/';

/**
 * Initialize the sprite system
 */
function initializeSprites() {
    console.log("Initializing simplified sprite system");
    
    // Create initial commuter
    const sceneContainer = document.getElementById('scene-container');
    if (!sceneContainer) return;
    
    // Create commuter element
    const commuter = document.createElement('div');
    commuter.id = 'commuter-0';
    commuter.className = 'commuter-sprite';
    
    // Set initial sprite (with briefcase)
    commuter.style.backgroundImage = `url(${spriteBasePath}commuter1.png)`;
    
    // Add to scene
    sceneContainer.appendChild(commuter);
    
    // Add click handler
    commuter.addEventListener('click', handleCommuterClick);
    
    console.log("Initial commuter created");
    
    // Install game handlers
    installGameHandlers();
}

/**
 * Create the first change (day 4 - briefcase disappears)
 */
function createFirstChange() {
    const change = {
        type: 'briefcase',
        property: 'hasBriefcase',
        value: false,
        commuterId: 0,
        found: false
    };
    console.log("Created first change:", change);
    return change;
}

/**
 * Apply the selected change to the commuter
 */
function applyChange(change) {
    console.log('Applying change:', change);
    
    if (change.type === 'briefcase') {
        const commuter = document.getElementById('commuter-0');
        if (commuter) {
            // Change the sprite image based on briefcase state
            commuter.style.backgroundImage = change.value ? 
                `url(${spriteBasePath}commuter1.png)` : 
                `url(${spriteBasePath}commuter1_nobriefcase.png)`;
            console.log("Changed commuter sprite");
        }
    }
}

/**
 * Handle commuter click events
 */
function handleCommuterClick(event) {
    console.log("Commuter clicked");
    
    // Only process clicks when allowed
    if (!window.canClick) {
        console.log("Clicks not allowed");
        return;
    }
    
    const commuter = event.target.closest('.commuter-sprite');
    if (!commuter) {
        console.log("No commuter found in click target");
        return;
    }
    
    console.log("Current change:", window.currentChange);
    
    // Check if this is the commuter with the current change
    if (window.currentChange && commuter.id === 'commuter-0') {
        console.log("Correct commuter clicked!");
        
        // Mark change as found
        window.currentChange.found = true;
        
        // Increase awareness
        window.increaseAwareness(20);
        
        // Show success message
        window.showMessage("You noticed the change! The briefcase is gone!", 2000);
        
        // Update narrative
        window.updateNarrativeText();
        
        // Disable clicking until next change
        window.canClick = false;
        
        // Add highlight effect
        commuter.classList.add('highlight-pulse');
        setTimeout(() => {
            commuter.classList.remove('highlight-pulse');
        }, 1500);
    } else {
        console.log("No change to find or wrong commuter");
        window.showMessage("I didn't notice anything different there", 1500);
    }
}

/**
 * Highlight a missed change before transitioning
 */
function highlightMissedChange(change) {
    if (change && change.type === 'briefcase') {
        const commuter = document.getElementById('commuter-0');
        if (commuter) {
            commuter.classList.add('highlight-pulse');
            window.showMessage("You missed the change! The briefcase disappeared.", 2000);
        }
    }
}

/**
 * Install game handlers
 */
function installGameHandlers() {
    console.log("Installing game handlers");
    
    // Override the necessary game.js functions
    window.createFirstChange = createFirstChange;
    window.applyChange = applyChange;
    window.highlightMissedChange = highlightMissedChange;
    
    // Add a listener for the train button to reset canClick
    const trainButton = document.getElementById('train-button');
    if (trainButton) {
        trainButton.addEventListener('click', function() {
            // We wait for a bit after the train button is clicked before enabling clicking
            setTimeout(function() {
                console.log("Enabling clicking after train button press");
                window.canClick = true;
            }, 2000); // 2 seconds should be enough time for the day transition
        });
    }
    
    console.log("Game handlers installed");
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(initializeSprites, 500);
});