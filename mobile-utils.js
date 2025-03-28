/**
 * Drone: The Daily Commute
 * Mobile-specific utilities and enhancements
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
    // Increase clickable area for elements
    document.querySelectorAll('.person, .accessory, .pants, .left-shoe, .right-shoe').forEach(el => {
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
    document.querySelectorAll('.person, .accessory, .pants, .left-shoe, .right-shoe, .train-button, .hint-button').forEach(el => {
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
    const hintButton = document.getElementById('hint-button');
    if (hintButton) {
        hintButton.addEventListener('click', function() {
            if (!currentChange) return;
            
            // Provide a simple hint based on the type of change
            const element = document.getElementById(currentChange.id);
            if (element) {
                let hintText = "Look for a change in ";
                
                // Determine specific hint based on change type
                if (currentChange.type.includes('hat')) {
                    hintText += "someone's hat";
                } else if (currentChange.type.includes('bag')) {
                    hintText += "someone's bag";
                } else if (currentChange.type.includes('torso')) {
                    hintText += "someone's shirt";
                } else if (currentChange.type.includes('pants')) {
                    hintText += "someone's pants";
                } else if (currentChange.type.includes('shoe')) {
                    hintText += "someone's shoes";
                } else {
                    // Determine which quadrant the change is in
                    const rect = element.getBoundingClientRect();
                    const sceneRect = document.getElementById('scene-container').getBoundingClientRect();
                    
                    const isTop = rect.top < (sceneRect.top + sceneRect.height / 2);
                    const isLeft = rect.left < (sceneRect.left + sceneRect.width / 2);
                    
                    let location = isTop ? 'top' : 'bottom';
                    location += isLeft ? ' left' : ' right';
                    
                    hintText += `the ${location} area`;
                }
                
                showMessage(hintText, 2000);
                
                // Disable hint button temporarily
                this.disabled = true;
                setTimeout(() => {
                    this.disabled = false;
                }, 5000);
            }
        });
    }
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
    if (isPortrait) {
        // Portrait-specific adjustments
        document.querySelectorAll('.window').forEach(window => {
            window.style.height = '50px';
        });
        
        // Adjust person positions for portrait layout
        const positions = {
            'person1': '8%',
            'person2': '22%',
            'person3': '36%', 
            'person4': '50%',
            'person5': '64%',
            'person6': '78%',
            'player': '92%'
        };
        
        Object.keys(positions).forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.style.left = positions[id];
            }
        });
    } else {
        // Landscape-specific adjustments
        document.querySelectorAll('.window').forEach(window => {
            window.style.height = '60px';
        });
        
        // Reset to original positions if needed
        const originalPositions = {
            'person1': '10%',
            'person2': '20%',
            'person3': '30%', 
            'person4': '40%',
            'person5': '50%',
            'person6': '60%',
            'player': '75%'
        };
        
        Object.keys(originalPositions).forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.style.left = originalPositions[id];
            }
        });
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