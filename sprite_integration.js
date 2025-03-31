/**
 * Drone: The Daily Commute
 * Simplified Sprite Integration for Briefcase Change
 */

// Global variables
let commuterSprites = [];
let spriteBasePath = 'assets/sprites/';

// Initialize when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  setTimeout(initializeSprites, 500);
});

/**
 * Initialize the sprite system
 */
function initializeSprites() {
  console.log("Initializing simplified sprite system");
  
  // Set up the first commuter sprite (with briefcase)
  createInitialCommuter();
  
  // Install custom game function handlers
  installGameHandlers();
}

/**
 * Create the initial commuter sprite
 */
function createInitialCommuter() {
  // Get the scene container
  const sceneContainer = document.getElementById('scene-container');
  if (!sceneContainer) {
    console.error("Scene container not found");
    return;
  }
  
  // Calculate position - center of the platform
  const platformWidth = sceneContainer.offsetWidth;
  const platformY = 0; // Base position at bottom
  
  // Position at center (50%)
  const commuterX = platformWidth * 0.5;
  
  // Create the commuter element
  const commuterElement = document.createElement('div');
  commuterElement.id = 'commuter-0';
  commuterElement.className = 'commuter-sprite';
  
  // Set styles
  commuterElement.style.position = 'absolute';
  commuterElement.style.left = `${commuterX}px`;
  commuterElement.style.bottom = `${platformY}px`;
  commuterElement.style.width = '36px';
  commuterElement.style.height = '85px';
  commuterElement.style.transform = 'translateX(-50%)';
  commuterElement.style.backgroundImage = `url(${spriteBasePath}commuter1.png)`;
  commuterElement.style.backgroundSize = 'contain';
  commuterElement.style.backgroundRepeat = 'no-repeat';
  commuterElement.style.backgroundPosition = 'bottom center';
  commuterElement.style.zIndex = '10';
  commuterElement.style.cursor = 'pointer';
  
  // Add to scene
  sceneContainer.appendChild(commuterElement);
  
  // Make it clickable
  commuterElement.addEventListener('click', handleCommuterClick);
  
  // Store commuter data
  commuterSprites.push({
    id: 'commuter-0',
    element: commuterElement,
    config: {
      hasBriefcase: true,
      type: 0 // 0 = with briefcase, 1 = without briefcase
    }
  });
  
  console.log("Initial commuter created");
}

/**
 * Handle clicks on the commuter
 */
function handleCommuterClick(event) {
  console.log("Commuter clicked");
  
  // Make sure the game allows clicking
  if (typeof window.canClick === 'undefined' || !window.canClick) {
    console.log("Clicking not allowed right now");
    return;
  }
  
  if (window.isTransitioning) {
    console.log("Game is transitioning");
    return;
  }
  
  // Check if this is the current change to find
  if (window.currentChange && (window.currentChange.commuterId === 0 || window.currentChange.id === 'commuter-0')) {
    console.log("Correct commuter clicked!");
    
    // Increase awareness
    if (typeof window.increaseAwareness === 'function' && window.GAME_SETTINGS) {
      window.increaseAwareness(window.GAME_SETTINGS.baseAwarenessGain);
      console.log("Awareness increased");
    } else {
      console.error("increaseAwareness function or GAME_SETTINGS not available");
    }
    
    // Disable further clicking
    window.canClick = false;
    
    // Show thought bubble
    if (typeof window.showThoughtBubble === 'function') {
      window.showThoughtBubble();
      console.log("Showing thought bubble");
    }
    
    // Update narrative text
    if (typeof window.updateNarrativeText === 'function') {
      window.updateNarrativeText();
      console.log("Updating narrative text");
    }
    
    // Mark change as found
    window.currentChange.found = true;
    
    // Highlight the commuter
    event.target.classList.add('highlight-pulse');
    setTimeout(() => {
      event.target.classList.remove('highlight-pulse');
    }, 1500);
    
    console.log("Change found and processed");
  } else {
    // Wrong commuter or no change to find
    console.log("Wrong commuter clicked or no change to find");
    console.log("currentChange:", window.currentChange);
    
    // Show message
    if (typeof window.showMessage === 'function') {
      window.showMessage("I didn't notice anything different there", 1500);
    }
  }
}

/**
 * Install custom game function handlers
 */
function installGameHandlers() {
  console.log("Installing game handlers");
  
  // Keep original functions as backup
  const originalCreateFirstChange = window.createFirstChange;
  const originalApplyChange = window.applyChange;
  const originalHighlightMissedChange = window.highlightMissedChange;
  const originalSelectRandomChange = window.selectRandomChange;
  const originalHandleElementClick = window.handleElementClick;
  
  // Override createFirstChange
  window.createFirstChange = function() {
    console.log("Creating first change: removing briefcase");
    
    // Create the change object
    const changeObject = {
      commuterId: 0,
      id: 'commuter-0',
      type: 'briefcase',
      property: 'hasBriefcase',
      value: false,
      found: false
    };
    
    console.log("First change created:", changeObject);
    return changeObject;
  };
  
  // Override applyChange
  window.applyChange = function(change) {
    if (!change) return;
    console.log("Applying change:", change);
    
    // Only handle the briefcase change
    if (change.property === 'hasBriefcase' && change.value === false) {
      const commuter = commuterSprites[change.commuterId];
      if (commuter && commuter.element) {
        // Change to the no-briefcase sprite
        commuter.element.style.backgroundImage = `url(${spriteBasePath}commuter1_nobriefcase.png)`;
        commuter.config.hasBriefcase = false;
        commuter.config.type = 1;
        console.log("Changed to no-briefcase sprite");
      }
    }
  };
  
  // Override highlightMissedChange
  window.highlightMissedChange = function(change) {
    if (!change) return;
    console.log("Highlighting missed change:", change);
    
    const commuter = commuterSprites[change.commuterId];
    if (commuter && commuter.element) {
      commuter.element.classList.add('highlight-pulse');
      setTimeout(() => {
        commuter.element.classList.remove('highlight-pulse');
      }, 1500);
      console.log("Applied highlight to commuter");
    }
  };
  
  // Override selectRandomChange for future days
  window.selectRandomChange = function() {
    // For simplicity, just alternate between adding/removing hat
    const commuter = commuterSprites[0];
    if (!commuter) return null;
    
    console.log("Selecting random change");
    return {
      commuterId: 0,
      id: 'commuter-0',
      type: 'hat',
      property: 'hasHat',
      value: !commuter.config.hasHat,
      found: false
    };
  };
  
  // Override handleElementClick to do nothing (our click handler is directly on the element)
  window.handleElementClick = function(event) {
    // Do nothing specific here
    console.log("Global handleElementClick called");
    
    // Call original if it exists
    if (typeof originalHandleElementClick === 'function') {
      originalHandleElementClick(event);
    }
  };
  
  console.log("Game handlers installed");
}

// Fix sprite path if the default doesn't work
setTimeout(function() {
  const sprite = document.querySelector('.commuter-sprite');
  if (sprite && (!sprite.style.backgroundImage || sprite.style.backgroundImage === '')) {
    console.log("Sprite background not loading, trying alternative paths");
    
    // Try different paths
    const paths = [
      'assets/sprites/',
      'sprites/',
      './sprites/',
      './assets/sprites/',
      '../sprites/',
      '../assets/sprites/',
      '/'
    ];
    
    function testPath(path, callback) {
      const img = new Image();
      img.onload = function() {
        callback(true, path);
      };
      img.onerror = function() {
        callback(false, path);
      };
      img.src = path + 'commuter1.png';
    }
    
    function tryNextPath(index) {
      if (index >= paths.length) {
        console.log("All paths failed, using fallback");
        sprite.style.backgroundColor = '#3a6ea5';
        sprite.style.border = '2px solid #b8c8d8';
        return;
      }
      
      testPath(paths[index], function(success, path) {
        if (success) {
          console.log("Found working path:", path);
          spriteBasePath = path;
          sprite.style.backgroundImage = `url(${path}commuter1.png)`;
        } else {
          tryNextPath(index + 1);
        }
      });
    }
    
    tryNextPath(0);
  }
}, 1000);