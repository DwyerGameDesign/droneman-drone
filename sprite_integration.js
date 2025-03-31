/**
 * Drone: The Daily Commute
 * Sprite Integration - Handles commuter sprites and changes
 */

window.DroneGame = window.DroneGame || {};
window.DroneGame.SpriteSystem = {
    SPRITE_BASE_PATH: 'assets/sprites/',
    
    initializeSprites: function() {
        console.log("Initializing simplified sprite system");
        
        const sceneContainer = document.getElementById('scene-container');
        if (!sceneContainer) return;
        
        // Create commuter element
        const commuter = document.createElement('div');
        commuter.id = 'commuter-0';
        commuter.className = 'commuter-sprite';
        
        // Set initial sprite (with briefcase)
        commuter.style.backgroundImage = `url(${this.SPRITE_BASE_PATH}commuter1.png)`;
        
        // Add to scene
        sceneContainer.appendChild(commuter);
        
        // Add click handler
        commuter.addEventListener('click', this.handleCommuterClick.bind(this));
        
        console.log("Initial commuter created");
        
        // Install game handlers
        this.installGameHandlers();
    },
    
    createFirstChange: function() {
        const change = {
            type: 'briefcase',
            property: 'hasBriefcase',
            value: false,
            commuterId: 0,
            found: false
        };
        console.log("Created first change:", change);
        return change;
    },
    
    applyChange: function(change) {
        console.log('Applying change:', change);
        
        if (change.type === 'briefcase') {
            const commuter = document.getElementById('commuter-0');
            if (commuter) {
                // Change the sprite image based on briefcase state
                commuter.style.backgroundImage = change.value ? 
                    `url(${this.SPRITE_BASE_PATH}commuter1.png)` : 
                    `url(${this.SPRITE_BASE_PATH}commuter1_nobriefcase.png)`;
                console.log("Changed commuter sprite");
            }
        }
    },
    
    handleCommuterClick: function(event) {
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
    },
    
    highlightMissedChange: function(change) {
        if (change && change.type === 'briefcase') {
            const commuter = document.getElementById('commuter-0');
            if (commuter) {
                commuter.classList.add('highlight-pulse');
                window.showMessage("You missed the change! The briefcase disappeared.", 2000);
            }
        }
    },
    
    installGameHandlers: function() {
        console.log("Installing game handlers");
        
        // Override the necessary game.js functions
        window.createFirstChange = this.createFirstChange.bind(this);
        window.applyChange = this.applyChange.bind(this);
        window.highlightMissedChange = this.highlightMissedChange.bind(this);
        
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
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        window.DroneGame.SpriteSystem.initializeSprites();
    }, 500);
});