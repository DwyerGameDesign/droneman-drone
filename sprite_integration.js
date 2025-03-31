/**
 * Drone: The Daily Commute
 * Sprite Integration - Handles commuter sprites and changes
 */

// Global variables
let spriteBasePath = 'assets/sprites/';
let currentChange = null;

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
    return {
        type: 'briefcase',
        property: 'hasBriefcase',
        value: false,
        commuterId: 0, // First commuter
        found: false
    };
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
        }
    }
}

/**
 * Handle commuter click events
 */
function handleCommuterClick(event) {
    // Only process clicks when allowed
    if (!window.canClick) return;
    
    const commuter = event.target.closest('.commuter-sprite');
    if (!commuter) return;
    
    // Check if this is the commuter with the current change
    if (window.currentChange && commuter.id === 'commuter-0') {
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
    }
}

/**
 * Highlight a missed change before transitioning
 */
function highlightMissedChange(change) {
    if (change.type === 'briefcase') {
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
    
    console.log("Game handlers installed");
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(initializeSprites, 500);
});