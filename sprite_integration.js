/**
 * Drone: The Daily Commute
 * Simplified Sprite Integration for Briefcase Change with Enhanced Debugging
 */

// Global variables
let commuterSprites = [];
let spriteBasePath = 'assets/sprites/';
let debugMode = true; // Enable detailed debugging

/**
 * Debug function that logs only when debug mode is enabled
 */
function debugLog(...args) {
  if (debugMode) {
    console.log(...args);
  }
}

// Dump game state to console
function dumpGameState() {
  debugLog("--- GAME STATE DUMP ---");
  debugLog("Day:", document.getElementById('day')?.textContent);
  debugLog("canClick:", window.canClick);
  debugLog("isTransitioning:", window.isTransitioning);
  debugLog("currentChange:", window.currentChange);
  debugLog("commuterSprites:", commuterSprites);
  debugLog("----------------------");
}

// Initialize when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  setTimeout(initializeSprites, 500);
});

/**
 * Initialize the sprite system
 */
function initializeSprites() {
  debugLog("Initializing simplified sprite system");
  
  // Set up the first commuter sprite (with briefcase)
  createInitialCommuter();
  
  // Install custom game function handlers
  installGameHandlers();
  
  // Monitor day display changes
  monitorDayChanges();
  
  // Add a listener for the train button to reset canClick
  const trainButton = document.getElementById('train-button');
  if (trainButton) {
    trainButton.addEventListener('click', function() {
      debugLog("Train button clicked");
      // We wait for a bit after the train button is clicked before enabling clicking
      setTimeout(function() {
        debugLog("Enabling clicking after train button press");
        window.canClick = true;
      }, 2000); // 2 seconds should be enough time for the day transition
    });
  }
  
  // Initial state dump
  setTimeout(dumpGameState, 1000);
}

/**
 * Monitor day display for changes
 */
function monitorDayChanges() {
  const dayElement = document.getElementById('day');
  if (!dayElement) return;
  
  // Create a MutationObserver to watch for changes to the day display
  const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      const newDay = dayElement.textContent;
      debugLog(`Day changed to ${newDay}`);
      
      if (newDay === '4') {
        debugLog("Day 4 detected - special handling for briefcase change");
        // Force canClick to be true on day 4
        setTimeout(function() {
          window.canClick = true;
          debugLog("Forced canClick to true on day 4");
          dumpGameState();
        }, 1000);
      }
    });
  });
  
  // Start observing the day element
  observer.observe(dayElement, { childList: true });
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
  
  debugLog("Initial commuter created");
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
    debugLog("No current change to find");
    return false;
  }
  
  // IMPORTANT: On day 4, we're looking for the missing briefcase specifically
  const currentDay = document.getElementById('day')?.textContent;
  if (currentDay === '4') {
    debugLog("Day 4 special check: Assuming commuter-0 is the target with missing briefcase");
    if (element.id === 'commuter-0') {
      return true;
    }
  }
  
  // Check if this commuter matches the current change
  const matchesById = element.id === window.currentChange.id;
  const matchesByCommuterId = element.id === `commuter-${window.currentChange.commuterId}`;
  
  // Get the commuter index from the element id
  const commuterIdMatch = element.id.match(/commuter-(\d+)/);
  const commuterIndex = commuterIdMatch ? parseInt(commuterIdMatch[1]) : -1;
  const matchesByIndex = commuterIndex === window.currentChange.commuterId;
  
  // Log detailed information about the match attempt
  debugLog("Current change:", window.currentChange);
  debugLog("Element ID:", element.id);
  debugLog("Matches by ID:", matchesById);
  debugLog("Matches by commuterId:", matchesByCommuterId);
  debugLog("Commuter index from element:", commuterIndex);
  debugLog("Matches by index:", matchesByIndex);
  
  // Return true if any of the matching conditions are met
  return matchesById || matchesByCommuterId || matchesByIndex;
}

/**
 * Handle clicks on the commuter
 */
function handleCommuterClick(event) {
  debugLog("Commuter clicked");
  dumpGameState();
  
  // Get click coordinates
  const clickX = event.clientX;
  const clickY = event.clientY;
  
  // SPECIAL HANDLING FOR DAY 4
  const currentDay = document.getElementById('day')?.textContent;
  if (currentDay === '4' && event.target.id === 'commuter-0') {
    debugLog("Day 4 special case: commuter-0 clicked, treating as correct");
    
    // Show the appropriate popup
    showPopupMessage("everyday the same", clickX, clickY);
    
    // Increase awareness
    if (typeof window.increaseAwareness === 'function' && window.GAME_SETTINGS) {
      window.increaseAwareness(window.GAME_SETTINGS.baseAwarenessGain);
      debugLog("Awareness increased on day 4 special case");
    }
    
    // Highlight the commuter
    event.target.classList.add('highlight-pulse');
    setTimeout(() => {
      event.target.classList.remove('highlight-pulse');
    }, 1500);
    
    // Mark any current change as found
    if (window.currentChange) {
      window.currentChange.found = true;
    }
    
    return;
  }
  
  // Regular flow for non-day-4
  // Make sure the game allows clicking
  if (typeof window.canClick === 'undefined' || !window.canClick) {
    debugLog("Clicking not allowed right now");
    showPopupMessage("everyday the same", clickX, clickY);
    return;
  }
  
  if (window.isTransitioning) {
    debugLog("Game is transitioning");
    showPopupMessage("everyday the same", clickX, clickY);
    return;
  }
  
  // Check if this is the current change to find
  if (isClickOnCurrentChange(event.target)) {
    debugLog("Correct commuter clicked!");
    
    // Increase awareness
    if (typeof window.increaseAwareness === 'function' && window.GAME_SETTINGS) {
      window.increaseAwareness(window.GAME_SETTINGS.baseAwarenessGain);
      debugLog("Awareness increased");
    } else {
      console.error("increaseAwareness function or GAME_SETTINGS not available");
    }
    
    // Disable further clicking
    window.canClick = false;
    
    // Show thought bubble
    if (typeof window.showThoughtBubble === 'function') {
      window.showThoughtBubble();
      debugLog("Showing thought bubble");
    }
    
    // Update narrative text
    if (typeof window.updateNarrativeText === 'function') {
      window.updateNarrativeText();
      debugLog("Updating narrative text");
    }
    
    // Mark change as found
    window.currentChange.found = true;
    
    // Highlight the commuter
    event.target.classList.add('highlight-pulse');
    setTimeout(() => {
      event.target.classList.remove('highlight-pulse');
    }, 1500);
    
    debugLog("Change found and processed");
  } else {
    // Wrong commuter or no change to find
    debugLog("Wrong commuter clicked or no change to find");
    
    // Show the "everyday the same" popup
    showPopupMessage("everyday the same", clickX, clickY);
  }
}

/**
 * Install custom game function handlers
 */
function installGameHandlers() {
  debugLog("Installing game handlers");
  
  // Keep original functions as backup
  const originalCreateFirstChange = window.createFirstChange;
  const originalApplyChange = window.applyChange;
  const originalHighlightMissedChange = window.highlightMissedChange;
  const originalSelectRandomChange = window.selectRandomChange;
  const originalHandleElementClick = window.handleElementClick;
  const originalShowMessage = window.showMessage;
  
  // Override showMessage to not interfere with our click handling
  window.showMessage = function(text, duration) {
    debugLog("showMessage called with:", text);
    // Only show "I didn't notice anything different there" if it's not day 4
    const currentDay = document.getElementById('day')?.textContent;
    if (currentDay === '4' && text === "I didn't notice anything different there") {
      debugLog("Suppressing 'I didn't notice anything different there' message on day 4");
      return;
    }
    
    // Call original if it exists
    if (typeof originalShowMessage === 'function') {
      originalShowMessage(text, duration);
    }
  };
  
  // Override createFirstChange
  window.createFirstChange = function() {
    debugLog("Creating first change: removing briefcase");
    
    // Create the change object
    const changeObject = {
      commuterId: 0,
      id: 'commuter-0',
      type: 'briefcase',
      property: 'hasBriefcase',
      value: false,
      found: false
    };
    
    debugLog("First change created:", changeObject);
    dumpGameState();
    
    return changeObject;
  };
  
  // Override applyChange
  window.applyChange = function(change) {
    if (!change) return;
    debugLog("Applying change:", change);
    
    // Handle the briefcase change
    if (change.property === 'hasBriefcase' && change.value === false) {
      const commuter = commuterSprites[change.commuterId];
      if (commuter && commuter.element) {
        // Change to the no-briefcase sprite
        commuter.element.style.backgroundImage = `url(${spriteBasePath}commuter1_nobriefcase.png)`;
        commuter.config.hasBriefcase = false;
        commuter.config.type = 1;
        debugLog("Changed to no-briefcase sprite");
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
          debugLog("Added hat to commuter");
        } 
        else if (change.value === false && hatExists) {
          // Remove the hat
          hatExists.remove();
          commuter.config.hasHat = false;
          debugLog("Removed hat from commuter");
        }
      }
    }
    
    dumpGameState();
  };
  
  // Override highlightMissedChange
  window.highlightMissedChange = function(change) {
    if (!change) return;
    debugLog("Highlighting missed change:", change);
    
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
      debugLog("Applied highlight to commuter");
    }
  };
  
  // Override selectRandomChange for future days
  window.selectRandomChange = function() {
    // For simplicity, just alternate between adding/removing hat
    const commuter = commuterSprites[0];
    if (!commuter) return null;
    
    debugLog("Selecting random change");
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
    debugLog("Global handleElementClick called");
    
    // Call original if it exists
    if (typeof originalHandleElementClick === 'function') {
      originalHandleElementClick(event);
    }
  };
  
  debugLog("Game handlers installed");
}

// Fix sprite path if the default doesn't work
setTimeout(function() {
  const sprite = document.querySelector('.commuter-sprite');
  if (sprite && (!sprite.style.backgroundImage || sprite.style.backgroundImage === '')) {
    debugLog("Sprite background not loading, trying alternative paths");
    
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
        debugLog("All paths failed, using fallback");
        sprite.style.backgroundColor = '#3a6ea5';
        sprite.style.border = '2px solid #b8c8d8';
        return;
      }
      
      testPath(paths[index], function(success, path) {
        if (success) {
          debugLog("Found working path:", path);
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

// Periodically dump game state
setInterval(function() {
  const currentDay = document.getElementById('day')?.textContent;
  if (currentDay === '4') {
    dumpGameState();
  }
}, 5000);