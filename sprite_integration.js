/**
 * Drone: The Daily Commute
 * Simplified Sprite Integration for Briefcase Change
 */

// Global variables
let commuterSprites = [];
let spriteBasePath = 'assets/sprites/';

// Initialize when the DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
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

    // Add a listener for the train button to reset canClick
    const trainButton = document.getElementById('train-button');
    if (trainButton) {
        trainButton.addEventListener('click', function () {
            // We wait for a bit after the train button is clicked before enabling clicking
            setTimeout(function () {
                console.log("Enabling clicking after train button press");
                window.canClick = true;
            }, 2000); // 2 seconds should be enough time for the day transition
        });
    }
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
    console.log("canClick state:", window.canClick);
    console.log("isTransitioning state:", window.isTransitioning);
    console.log("Current day:", document.getElementById('day')?.textContent);

    // Force canClick to be true if we're on day 4 and there's a currentChange
    if (document.getElementById('day')?.textContent === '4' && window.currentChange) {
        console.log("Day 4 with change, forcing canClick to true");
        window.canClick = true;
    }

    // Get click coordinates
    const clickX = event.clientX;
    const clickY = event.clientY;

    // Check if we're transitioning
    if (window.isTransitioning) {
        console.log("Game is transitioning");
        return;
    }

    // Check if there's a change to find and if clicking is allowed
    const isChangePresent = window.currentChange !== null;
    const isClickingAllowed = window.canClick === true;

    // Only show "everyday the same" when there's no change or clicking isn't allowed
    if (!isChangePresent) {
        console.log("No change to find");
        showPopupMessage("everyday the same", clickX, clickY);
        return;
    }

    if (!isClickingAllowed) {
        console.log("Clicking not allowed right now");
        return;
    }

    // Check if this is the current change to find
    if (isClickOnCurrentChange(event.target)) {
        console.log("Correct commuter clicked!");

        // Highlight the commuter
        event.target.classList.add('highlight-pulse');
        setTimeout(() => {
            event.target.classList.remove('highlight-pulse');
        }, 1500);

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

        console.log("Change found and processed");
    } else {
        // Wrong commuter or no change to find
        console.log("Wrong commuter clicked or no change to find");

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
    const originalProceedToNextDay = window.proceedToNextDay;

    // Override createFirstChange
    window.createFirstChange = function () {
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

        // Make sure canClick is set to true when we create a change
        window.canClick = true;
        console.log("Set canClick to true for day 4");

        return changeObject;
    };

    // Override applyChange
    window.applyChange = function (change) {
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

                // Ensure canClick is true
                window.canClick = true;
                console.log("Set canClick to true after applying change");
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

                // Ensure canClick is true
                window.canClick = true;
                console.log("Set canClick to true after applying change");
            }
        }
    };

    // Override highlightMissedChange
    window.highlightMissedChange = function (change) {
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
    window.selectRandomChange = function () {
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
    window.handleElementClick = function (event) {
        // Do nothing specific here
        console.log("Global handleElementClick called");

        // Call original if it exists
        if (typeof originalHandleElementClick === 'function') {
            originalHandleElementClick(event);
        }
    };

    // Also hook into proceedToNextDay to ensure canClick is true after day changes
    if (typeof window.proceedToNextDay === 'function') {
        window.originalProceedToNextDay = window.proceedToNextDay;

        window.proceedToNextDay = function () {
            // Call the original function
            window.originalProceedToNextDay();

            // After the day change, ensure canClick is set to true if we're on day 4
            setTimeout(function () {
                const currentDay = document.getElementById('day')?.textContent;
                if (currentDay === '4') {
                    console.log("Day 4 detected, ensuring canClick is true");
                    window.canClick = true;
                }
            }, 1500);
        };
    }

    console.log("Game handlers installed");
}

/**
 * Modification to integrate train_platform.png into the scene
 * Add this code to sprite_integration.js or create a new file
 */

// Function to add the train platform background
function initializeTrainPlatformBackground() {
    // Get the scene container
    const sceneContainer = document.getElementById('scene-container');
    if (!sceneContainer) {
        console.error("Scene container not found");
        return;
    }

    // Create the background element
    const platformBackground = document.createElement('div');
    platformBackground.id = 'platform-background';
    platformBackground.className = 'platform-background';

    // Apply styles
    platformBackground.style.position = 'absolute';
    platformBackground.style.top = '0';
    platformBackground.style.left = '0';
    platformBackground.style.width = '100%';
    platformBackground.style.height = '100%';
    platformBackground.style.backgroundImage = 'url(assets/sprites/train_platform.png)';
    platformBackground.style.backgroundSize = 'cover';
    platformBackground.style.backgroundPosition = 'center';
    platformBackground.style.backgroundRepeat = 'no-repeat';
    platformBackground.style.zIndex = '1'; // Set low z-index so it appears behind all other elements

    // Insert at the beginning of the scene container (so it's behind other elements)
    sceneContainer.insertBefore(platformBackground, sceneContainer.firstChild);

    // Hide the original CSS-based station elements that are no longer needed
    hideOriginalStationElements();
}

// Function to hide the original CSS-based station elements
function hideOriginalStationElements() {
    // Array of selectors for elements to hide
    const elementsToHide = [
        '.ceiling',
        '.station-background',
        '.window',
        '.platform',
        '.platform-edge',
        '.train'
    ];

    // Hide each element type
    elementsToHide.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
            element.style.display = 'none';
        });
    });

    // Keep the sign and pillars visible as they might be interactive or overlay elements
}

// Add a listener to initialize after DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
    // Wait a bit to ensure sprite_integration.js has loaded
    setTimeout(function () {
        initializeTrainPlatformBackground();

        // Optional: Adjust commuter positions based on the new background
        adjustCommutersForNewBackground();
    }, 600);
});

// Function to adjust commuter positions to match the new background
function adjustCommutersForNewBackground() {
    // Get all commuter sprites
    const commuters = document.querySelectorAll('.commuter-sprite');

    // Adjust based on the dimensions of your train_platform.png
    commuters.forEach(commuter => {
        // Adjust bottom position to ensure commuters "stand" on the platform
        // Modify these values based on your specific platform image
        commuter.style.bottom = '40px';  // Adjust this value as needed
    });
}

// Fix sprite path if the default doesn't work
setTimeout(function () {
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
            img.onload = function () {
                callback(true, path);
            };
            img.onerror = function () {
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

            testPath(paths[index], function (success, path) {
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