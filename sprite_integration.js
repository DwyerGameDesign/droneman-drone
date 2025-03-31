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
 * Show a popup message at the click location
 */
function showPopupMessage(text, x, y) {
  // Find or create the popup element
  let popup = document.getElementById('popup-message');
  
  if (!popup) {
    popup = document.createElement('div');
    popup.id = 'popup-message';
    document.body.appendChild(popup);
    
    // Style the popup
    popup.style.position = 'absolute';
    popup.style.padding = '8px 12px';
    popup.style.backgroundColor = 'rgba(20, 20, 20, 0.8)';
    popup.style.color = '#d4d4c8';
    popup.style.borderRadius = '5px';
    popup.style.fontSize = '14px';
    popup.style.fontFamily = "'Courier New', monospace";
    popup.style.zIndex = '1000';
    popup.style.pointerEvents = 'none'; // Let clicks pass through
    popup.style.transition = 'opacity 0.5s ease';
  }
  
  // Set the text and position
  popup.textContent = text;
  popup.style.left = `${x}px`;
  popup.style.top = `${y}px`;
  popup.style.opacity = '1';
  
  // Show and then fade out
  clearTimeout(popup.fadeTimeout);
  popup.style.display = 'block';
  
  popup.fadeTimeout = setTimeout(() => {
    popup.style.opacity = '0';
    setTimeout(() => {
      popup.style.display = 'none';
    }, 500);
  }, 2000);
}

/**
 * Check if a click should be considered a valid click on the current change
 */
function isClickOnCurrentChange(element) {
  // No current change
  if (!window.currentChange) {
    console.log("No current change to find");
    return false;
  }
  
  // Check if this commuter matches the current change
  const matchesById = element.id === window.currentChange.id;
  const matchesByCommuterId = element.id === `commuter-${window.currentChange.commuterId}`;
  
  // Get the commuter index from the element id
  const commuterIdMatch = element.id.match(/commuter-(\d+)/);
  const commuterIndex = commuterIdMatch ? parseInt(commuterIdMatch[1]) : -1;
  const matchesByIndex = commuterIndex === window.currentChange.commuterId;
  
  // Log detailed information about the match attempt
  console.log("Current change:", window.currentChange);
  console.log("Element ID:", element.id);
  console.log("Matches by ID:", matchesById);
  console.log("Matches by commuterId:", matchesByCommuterId);
  console.log("Commuter index from element:", commuterIndex);
  console.log("Matches by index:", matchesByIndex);
  
  // Return true if any of the matching conditions are met
  return matchesById || matchesByCommuterId || matchesByIndex;
}

/**
 * Handle clicks on the commuter
 */
function handleCommuterClick(event) {
  console.log("Commuter clicked");
  
  // Get click coordinates
  const clickX = event.clientX;
  const clickY = event.clientY;
  
  // Make sure the game allows clicking
  if (typeof window.canClick === 'undefined' || !window.canClick) {
    console.log("Clicking not allowed right now");
    showPopupMessage("everyday the same", clickX, clickY);
    return;
  }
  
  if (window.isTransitioning) {
    console.log("Game is transitioning");
    showPopupMessage("everyday the same", clickX, clickY);
    return;
  }
  
  // Check if this is the current change to find
  if (isClickOnCurrentChange(event.target)) {
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
    
    // Show the "everyday the same" popup
    showPopupMessage("everyday the same", clickX, clickY);
    
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
    
    // Handle the briefcase change
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
    
    // Handle other changes in future days
    else if (change.property === 'hasHat') {
      const commuter = commuterSprites[change.commuterId];
      if (commuter && commuter.element) {
        // Add or remove hat
        const hatExists = commuter.element.querySelector('.commuter-hat');
        
        if (change.value === true && !hatExists) {
          // Add a hat
          const hatElement = document.createElement('div');
          hatElement.className = 'commuter-hat';
          hatElement.style.position = 'absolute';
          hatElement.style.top = '0';
          hatElement.style.left = '0';
          hatElement.style.width = '100%';
          hatElement.style.height = '30%';
          hatElement.style.backgroundImage = `url(${spriteBasePath}hat.png)`;
          hatElement.style.backgroundSize = 'contain';
          hatElement.style.backgroundRepeat = 'no-repeat';
          hatElement.style.backgroundPosition = 'top center';
          hatElement.style.zIndex = '11';
          commuter.element.appendChild(hatElement);
          commuter.config.hasHat = true;
          console.log("Added hat to commuter");
        } 
        else if (change.value === false && hatExists) {
          // Remove the hat
          hatExists.remove();
          commuter.config.hasHat = false;
          console.log("Removed hat from commuter");
        }
      }
    }
  };
  
  // Override highlightMissedChange
  window.highlightMissedChange = function(change) {
    if (!change) return;
    console.log("Highlighting missed change:", change);
    
    let element = null;
    
    // Find the element to highlight
    if (change.id) {
      element = document.getElementById(change.id);
    } else if (typeof change.commuterId === 'number') {
      const commuter = commuterSprites[change.commuterId];
      if (commuter && commuter.element) {
        element = commuter.element;
      }
    }
    
    // Apply the highlight
    if (element) {
      element.classList.add('highlight-pulse');
      setTimeout(() => {
        element.classList.remove('highlight-pulse');
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