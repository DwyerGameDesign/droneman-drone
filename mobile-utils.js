/**
 * Drone: The Daily Commute
 * Mobile-specific utilities and enhancements - Updated for single sprite approach
 */

// Check if we're on a mobile device
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
const isPortrait = window.innerHeight > window.innerWidth;

// Initialize mobile optimizations when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    if (isMobile) {
        initMobileOptimizations();
    }
    
    // Listen for orientation changes
    window.addEventListener('resize', handleOrientationChange);
});

/**
 * Initialize mobile-specific optimizations
 */
function initMobileOptimizations() {
    // Enhance tap targets
    enhanceTapTargets();
    
    // Add touch feedback
    addTouchFeedback();
    
    // Setup hint system if available
    setupHintSystem();
    
    // Add pinch-to-zoom prevention
    preventPinchZoom();
    
    // Adjust elements based on current orientation
    adjustForOrientation();
}

/**
 * Make tap targets larger and more accessible
 */
function enhanceTapTargets() {
    // Increase clickable area for commuter sprites
    document.querySelectorAll('.commuter-sprite').forEach(el => {
        // Add an invisible larger hitbox
        el.style.position = 'relative';
        
        // Only add touch area if it doesn't already exist
        if (!el.querySelector('.touch-area')) {
            const touchArea = document.createElement('div');
            touchArea.className = 'touch-area';
            touchArea.style.position = 'absolute';
            touchArea.style.top = '-10px';
            touchArea.style.left = '-10px';
            touchArea.style.right = '-10px';
            touchArea.style.bottom = '-10px';
            touchArea.style.zIndex = '10';
            
            // Pass clicks through to the original element
            touchArea.addEventListener('click', function(e) {
                e.stopPropagation();
                el.click();
            });
            
            el.appendChild(touchArea);
        }
    });
}

/**
 * Add visual feedback for touch interactions
 */
function addTouchFeedback() {
    document.querySelectorAll('.commuter-sprite, .train-button, .hint-button').forEach(el => {
        el.addEventListener('touchstart', function() {
            this.style.opacity = '0.7';
        });
        
        el.addEventListener('touchend', function() {
            this.style.opacity = '1';
        });
        
        el.addEventListener('touchcancel', function() {
            this.style.opacity = '1';
        });
    });
}

/**
 * Setup the hint system for mobile users
 */
function setupHintSystem() {
    // Check if hint button exists
    const hintButton = document.getElementById('hint-button');
    if (!hintButton) {
        // Create a hint button if it doesn't exist
        const mobileControls = document.querySelector('.mobile-controls');
        if (!mobileControls) {
            // Create mobile controls container if it doesn't exist
            const gameContainer = document.querySelector('.game-container');
            if (gameContainer) {
                const newMobileControls = document.createElement('div');
                newMobileControls.className = 'mobile-controls';
                gameContainer.appendChild(newMobileControls);
                
                // Create hint button
                const newHintButton = document.createElement('button');
                newHintButton.id = 'hint-button';
                newHintButton.className = 'hint-button';
                newHintButton.textContent = 'Need a Hint?';
                newMobileControls.appendChild(newHintButton);
                
                // Setup hint button
                setupHintButtonListener(newHintButton);
            }
        } else {
            // Add hint button to existing mobile controls
            const newHintButton = document.createElement('button');
            newHintButton.id = 'hint-button';
            newHintButton.className = 'hint-button';
            newHintButton.textContent = 'Need a Hint?';
            mobileControls.appendChild(newHintButton);
            
            // Setup hint button
            setupHintButtonListener(newHintButton);
        }
    } else {
        // Setup existing hint button
        setupHintButtonListener(hintButton);
    }
}

/**
 * Set up click listener for hint button
 */
function setupHintButtonListener(hintButton) {
    hintButton.addEventListener('click', function() {
        if (!currentChange) return;
        
        // Provide a simple hint based on the type of change
        let hintText = "Look for a change in ";
        
        // Determine specific hint based on change type
        switch (currentChange.type) {
            case 'hat':
                hintText += "someone's hat";
                break;
            case 'briefcase':
                hintText += "someone's briefcase";
                break;
            case 'type':
                hintText += "someone's appearance";
                break;
            case 'direction':
                hintText += "which way someone is facing";
                break;
            default:
                // Get the commuter element
                const commuter = commuterSprites[currentChange.commuterId];
                if (commuter && commuter.element) {
                    // Determine which quadrant the change is in
                    const rect = commuter.element.getBoundingClientRect();
                    const sceneRect = document.getElementById('scene-container').getBoundingClientRect();
                    
                    const isTop = rect.top < (sceneRect.top + sceneRect.height / 2);
                    const isLeft = rect.left < (sceneRect.left + sceneRect.width / 2);
                    
                    let location = isTop ? 'top' : 'bottom';
                    location += isLeft ? ' left' : ' right';
                    
                    hintText += `the ${location} area`;
                }
        }
        
        showMessage(hintText, 2000);
        
        // Disable hint button temporarily
        this.disabled = true;
        setTimeout(() => {
            this.disabled = false;
        }, 5000);
    });
}

/**
 * Handle orientation changes
 */
function handleOrientationChange() {
    const newIsPortrait = window.innerHeight > window.innerWidth;
    
    // Only do something if orientation actually changed
    if (newIsPortrait !== isPortrait) {
        // Update our tracking variable
        isPortrait = newIsPortrait;
        
        // Adjust layout for new orientation
        adjustForOrientation();
    }
}

/**
 * Adjust elements based on current orientation
 */
function adjustForOrientation() {
    // Adjust station elements
    document.querySelectorAll('.window').forEach(window => {
        window.style.height = isPortrait ? '50px' : '60px';
    });
    
    // Adjust commuter sizes
    document.querySelectorAll('.commuter-sprite').forEach(sprite => {
        sprite.style.transform = `scale(${isPortrait ? 0.8 : 1})`;
    });
    
    // Adjust platform height if needed
    const platform = document.querySelector('.platform');
    if (platform) {
        platform.style.height = isPortrait ? '100px' : '120px';
    }
    
    // Adjust train position
    const train = document.querySelector('.train');
    if (train) {
        train.style.bottom = isPortrait ? '120px' : '140px';
    }
}

/**
 * Prevent pinch zoom on mobile
 */
function preventPinchZoom() {
    document.addEventListener('touchmove', function(event) {
        if (event.touches.length > 1) {
            event.preventDefault();
        }
    }, { passive: false });
}

/**
 * Show message - utility function for hint system
 */
function showMessage(text, duration) {
    // Check if the main game's showMessage is available
    if (typeof window.showMessage === 'function') {
        window.showMessage(text, duration);
    } else {
        // Fallback implementation
        const message = document.getElementById('message');
        if (message) {
            message.textContent = text;
            message.style.visibility = 'visible';
            
            setTimeout(() => {
                message.style.visibility = 'hidden';
            }, duration);
        }
    }
}