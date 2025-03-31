/**
 * Drone: The Daily Commute
 * Single Commuter Sprite System
 * Uses full commuter sprites instead of composing from individual parts
 */

// Define CommuterSpriteSystem class directly in sprite_integration.js since the original file isn't loading
class CommuterSpriteSystem {
    constructor(options = {}) {
        // Default options
        this.options = {
            spritesPath: 'assets/sprites/', // Path to the sprites directory
            container: document.getElementById('scene-container'),
            spriteScale: 0.18, // Scale to make commuter appropriate size
            ...options
        };

        this.commuters = [];

        // Define commuter types - each corresponds to a different sprite image
        this.commuterTypes = [
            { id: 'commuter1', filename: 'commuter1.png' },
            { id: 'commuter2', filename: 'commuter2.png' },
            { id: 'commuter3', filename: 'commuter3.png' },
            { id: 'commuter4', filename: 'commuter4.png' },
            { id: 'commuter5', filename: 'commuter5.png' }
        ];

        // Default sprite dimensions - will be scaled accordingly
        this.spriteDimensions = {
            width: 200,
            height: 468
        };
    }

    /**
     * Create a commuter sprite
     * @param {Object} options - Configuration for the commuter
     * @returns {Object} - The created commuter object
     */
    createCommuter(options = {}) {
        // Calculate scaled dimensions
        const scale = this.options.spriteScale;
        const scaledWidth = this.spriteDimensions.width * scale;
        const scaledHeight = this.spriteDimensions.height * scale;

        // Default commuter options
        const defaultOptions = {
            id: `commuter-${this.commuters.length}`,
            x: 0,
            y: 0, // This will be adjusted to place commuter on platform
            type: Math.floor(Math.random() * this.commuterTypes.length), // Random commuter type
            variant: 'default',
            facingLeft: Math.random() > 0.5,
            hasHat: false, // Will be toggled on later as the first change
            hasBriefcase: Math.random() > 0.5
        };

        // Merge with provided options
        const config = this._mergeDeep(defaultOptions, options);

        // Get commuter type
        const commuterType = this.commuterTypes[config.type] || this.commuterTypes[0];

        // Create the container element
        const commuterElement = document.createElement('div');
        commuterElement.id = config.id;
        commuterElement.className = 'commuter-sprite';
        commuterElement.style.position = 'absolute';
        commuterElement.style.left = `${config.x}px`;

        // Bottom positioning - adjust to make commuter stand on platform
        commuterElement.style.bottom = `${config.y}px`;

        commuterElement.style.width = `${scaledWidth}px`;
        commuterElement.style.height = `${scaledHeight}px`;
        commuterElement.style.transform = config.facingLeft ? 'scaleX(-1)' : '';
        commuterElement.style.zIndex = '10';
        commuterElement.style.cursor = 'pointer';

        // Set up the background image
        const imagePath = `${this.options.spritesPath}${commuterType.filename}`;
        commuterElement.style.backgroundImage = `url(${imagePath})`;
        commuterElement.style.backgroundSize = 'contain';
        commuterElement.style.backgroundRepeat = 'no-repeat';
        commuterElement.style.backgroundPosition = 'bottom center';

        // Add data-debug attribute to help with troubleshooting
        commuterElement.setAttribute('data-debug', `type=${config.type}, path=${imagePath}`);

        // Create accessory elements (hat, briefcase) if needed
        if (config.hasHat) {
            const hatElement = document.createElement('div');
            hatElement.className = 'commuter-hat';
            hatElement.style.position = 'absolute';
            hatElement.style.top = '0';
            hatElement.style.left = '0';
            hatElement.style.width = '100%';
            hatElement.style.height = '30%';
            hatElement.style.backgroundImage = `url(${this.options.spritesPath}hat.png)`;
            hatElement.style.backgroundSize = 'contain';
            hatElement.style.backgroundRepeat = 'no-repeat';
            hatElement.style.backgroundPosition = 'top center';
            hatElement.style.zIndex = '11';
            commuterElement.appendChild(hatElement);
        }

        if (config.hasBriefcase) {
            const briefcaseElement = document.createElement('div');
            briefcaseElement.className = 'commuter-briefcase';
            briefcaseElement.style.position = 'absolute';
            briefcaseElement.style.bottom = '30%';
            briefcaseElement.style.left = config.facingLeft ? '60%' : '-20%';
            briefcaseElement.style.width = '40%';
            briefcaseElement.style.height = '20%';
            briefcaseElement.style.backgroundImage = `url(${this.options.spritesPath}briefcase.png)`;
            briefcaseElement.style.backgroundSize = 'contain';
            briefcaseElement.style.backgroundRepeat = 'no-repeat';
            briefcaseElement.style.zIndex = '9';
            commuterElement.appendChild(briefcaseElement);
        }

        // Add to container
        if (this.options.container) {
            this.options.container.appendChild(commuterElement);
        }

        // Store commuter data
        const commuter = {
            id: config.id,
            element: commuterElement,
            config: config
        };

        this.commuters.push(commuter);
        return commuter;
    }

    /**
     * Update an existing commuter
     * @param {string} id - ID of the commuter to update
     * @param {Object} options - New configuration options
     */
    updateCommuter(id, options = {}) {
        const commuter = this.commuters.find(c => c.id === id);
        if (!commuter) return null;

        // Update commuter attributes
        if ('type' in options) {
            const commuterType = this.commuterTypes[options.type] || this.commuterTypes[0];
            const imagePath = `${this.options.spritesPath}${commuterType.filename}`;
            commuter.element.style.backgroundImage = `url(${imagePath})`;
            commuter.config.type = options.type;
        }

        // Update hat visibility
        if ('hasHat' in options) {
            const hatElement = commuter.element.querySelector('.commuter-hat');

            if (options.hasHat && !hatElement) {
                // Add hat if it doesn't exist
                const newHatElement = document.createElement('div');
                newHatElement.className = 'commuter-hat';
                newHatElement.style.position = 'absolute';
                newHatElement.style.top = '0';
                newHatElement.style.left = '0';
                newHatElement.style.width = '100%';
                newHatElement.style.height = '30%';
                newHatElement.style.backgroundImage = `url(${this.options.spritesPath}hat.png)`;
                newHatElement.style.backgroundSize = 'contain';
                newHatElement.style.backgroundRepeat = 'no-repeat';
                newHatElement.style.backgroundPosition = 'top center';
                newHatElement.style.zIndex = '11';
                commuter.element.appendChild(newHatElement);
            } else if (!options.hasHat && hatElement) {
                // Remove hat
                hatElement.remove();
            }

            commuter.config.hasHat = options.hasHat;
        }

        // Update briefcase visibility
        if ('hasBriefcase' in options) {
            const briefcaseElement = commuter.element.querySelector('.commuter-briefcase');

            if (options.hasBriefcase && !briefcaseElement) {
                // Add briefcase if it doesn't exist
                const newBriefcaseElement = document.createElement('div');
                newBriefcaseElement.className = 'commuter-briefcase';
                newBriefcaseElement.style.position = 'absolute';
                newBriefcaseElement.style.bottom = '30%';
                newBriefcaseElement.style.left = commuter.config.facingLeft ? '60%' : '-20%';
                newBriefcaseElement.style.width = '40%';
                newBriefcaseElement.style.height = '20%';
                newBriefcaseElement.style.backgroundImage = `url(${this.options.spritesPath}briefcase.png)`;
                newBriefcaseElement.style.backgroundSize = 'contain';
                newBriefcaseElement.style.backgroundRepeat = 'no-repeat';
                newBriefcaseElement.style.zIndex = '9';
                commuter.element.appendChild(newBriefcaseElement);
            } else if (!options.hasBriefcase && briefcaseElement) {
                // Remove briefcase
                briefcaseElement.remove();
            }

            commuter.config.hasBriefcase = options.hasBriefcase;
        }

        // Update position
        if ('x' in options) {
            commuter.element.style.left = `${options.x}px`;
            commuter.config.x = options.x;
        }

        if ('y' in options) {
            commuter.element.style.bottom = `${options.y}px`;
            commuter.config.y = options.y;
        }

        // Update direction
        if ('facingLeft' in options) {
            commuter.element.style.transform = options.facingLeft ? 'scaleX(-1)' : '';

            // Update briefcase position if it exists
            const briefcaseElement = commuter.element.querySelector('.commuter-briefcase');
            if (briefcaseElement) {
                briefcaseElement.style.left = options.facingLeft ? '60%' : '-20%';
            }

            commuter.config.facingLeft = options.facingLeft;
        }

        return commuter;
    }

    /**
     * Make a commuter clickable
     * @param {string} id - ID of the commuter
     * @param {Function} callback - Click handler function
     */
    makeClickable(id, callback) {
        const commuter = this.commuters.find(c => c.id === id);
        if (commuter) {
            commuter.element.addEventListener('click', (event) => {
                event.stopPropagation();
                callback(commuter, event);
            });
        }
    }

    /**
     * Remove a commuter from the scene
     * @param {string} id - ID of the commuter to remove
     */
    removeCommuter(id) {
        const commuter = this.commuters.find(c => c.id === id);
        if (commuter) {
            if (commuter.element.parentNode) {
                commuter.element.parentNode.removeChild(commuter.element);
            }
            this.commuters = this.commuters.filter(c => c.id !== id);
        }
    }

    /**
     * Deep merge two objects
     * @private
     */
    _mergeDeep(target, source) {
        const output = Object.assign({}, target);

        if (this._isObject(target) && this._isObject(source)) {
            Object.keys(source).forEach(key => {
                if (this._isObject(source[key])) {
                    if (!(key in target)) {
                        Object.assign(output, { [key]: source[key] });
                    } else {
                        output[key] = this._mergeDeep(target[key], source[key]);
                    }
                } else {
                    Object.assign(output, { [key]: source[key] });
                }
            });
        }

        return output;
    }

    /**
     * Check if value is an object
     * @private
     */
    _isObject(item) {
        return (item && typeof item === 'object' && !Array.isArray(item));
    }
}

/**
 * Drone: The Daily Commute
 * Single Sprite System Integration with Game Logic
 */

// Global variables for sprite system
let spriteSystem;
let commuterSprites = [];

/**
 * Initialize the sprite system and integrate with game
 */
function initializeSpriteSystem() {
    // Create the sprite system with path to sprites
    spriteSystem = new CommuterSpriteSystem({
        spritesPath: 'assets/sprites/', // Path to the folder containing sprite images
        container: document.getElementById('scene-container'),
        spriteScale: 0.25 // Adjusted scale for the 200x468 sprite size
    });

    // Remove existing commuter elements
    removeExistingCommuters();

    // Add the first commuter only
    createInitialCommuter();

    // Override game functions to work with sprites
    overrideGameFunctions();
}

/**
 * Remove existing commuter elements
 */
function removeExistingCommuters() {
    // Get all existing commuters
    const existingCommuters = document.querySelectorAll('.person, .commuter-sprite');
    existingCommuters.forEach(commuter => {
        commuter.parentNode.removeChild(commuter);
    });

    // Clear the commuter sprites array
    commuterSprites = [];
}

/**
 * Create the initial commuter (only one to start)
 */
function createInitialCommuter() {
    // Calculate position - center of the platform
    const sceneContainer = document.getElementById('scene-container');
    const platformWidth = sceneContainer.offsetWidth;

    // Use a fixed y-position - commuter will stand directly on platform
    const platformY = 0;

    // Create first commuter at center (50%)
    const commuterX = platformWidth * (COMMUTER_ADDITION.positions[0] / 100);

    // Random commuter type but no hat (hat will be the first change)
    const commuter = spriteSystem.createCommuter({
        id: `commuter-0`,
        x: commuterX,
        y: platformY,
        type: Math.floor(Math.random() * 5), // Random commuter type
        facingLeft: Math.random() > 0.5,
        hasHat: false, // No hat initially (will be added on day 4)
        hasBriefcase: Math.random() > 0.5
    });

    // Make commuter clickable for game interaction
    spriteSystem.makeClickable(commuter.id, handleSpriteClick);

    commuterSprites.push(commuter);

    // Return the created commuter
    return commuter;
}

/**
 * Create a new commuter at a specified position index
 * @param {number} positionIndex - Index in the COMMUTER_ADDITION.positions array
 * @returns {Object} The created commuter
 */
function createNewCommuter(positionIndex) {
    if (commuterSprites.length >= COMMUTER_ADDITION.maxCommuters) {
        console.warn('Maximum number of commuters reached');
        return null;
    }

    // Calculate position
    const sceneContainer = document.getElementById('scene-container');
    const platformWidth = sceneContainer.offsetWidth;
    const platformY = 0; // Bottom position - will stand on platform

    // Get position from config or default to random position
    const position = COMMUTER_ADDITION.positions[positionIndex] || (Math.random() * 80 + 10);
    const commuterX = platformWidth * (position / 100);

    // Create commuter with random attributes
    const commuter = spriteSystem.createCommuter({
        id: `commuter-${commuterSprites.length}`,
        x: commuterX,
        y: platformY,
        type: Math.floor(Math.random() * 5), // Random commuter type
        facingLeft: Math.random() > 0.5,
        hasHat: Math.random() > 0.3, // Some have hats, some don't
        hasBriefcase: Math.random() > 0.5
    });

    // Make commuter clickable for game interaction
    spriteSystem.makeClickable(commuter.id, handleSpriteClick);

    commuterSprites.push(commuter);

    // Return the created commuter
    return commuter;
}

/**
 * Handle sprite click events
 */
function handleSpriteClick(commuter, event) {
    // Ensure game is in clickable state
    if (!window.canClick || window.isTransitioning) return;

    // Check if this is the commuter with the current change
    if (window.currentChange && window.currentChange.commuterId === getCommuterIndex(commuter.id)) {
        console.log('Correct commuter clicked!');

        // Call the original increaseAwareness function
        window.increaseAwareness(GAME_SETTINGS.baseAwarenessGain);

        // Set canClick to false to prevent further clicks
        window.canClick = false;

        // Show thought bubble
        window.showThoughtBubble();

        // Update narrative text
        window.updateNarrativeText();

        // Mark change as found
        window.currentChange.found = true;

        // Add a visual highlight to the commuter
        highlightCommuter(commuter.element);
    } else {
        // Wrong commuter clicked
        console.log('Wrong commuter clicked');

        // Show message
        window.showMessage("I didn't notice anything different there", 1500);
    }
}

/**
 * Get the index of a commuter from its ID
 * @param {string} id - Commuter ID (format: "commuter-X")
 * @returns {number} The commuter index
 */
function getCommuterIndex(id) {
    const match = id.match(/commuter-(\d+)/);
    return match ? parseInt(match[1]) : -1;
}

/**
 * Apply highlight effect to a commuter element
 * @param {HTMLElement} element - The commuter element to highlight
 */
function highlightCommuter(element) {
    // Add highlighting effect
    element.classList.add('highlight-pulse');

    // Remove after animation completes
    setTimeout(() => {
        element.classList.remove('highlight-pulse');
    }, 1500);
}

/**
 * Create the first change (adding a hat on day 4)
 */
function createFirstChange() {
    if (commuterSprites.length === 0) return null;

    // Get the first commuter
    const firstCommuter = commuterSprites[0];
    const commuterId = getCommuterIndex(firstCommuter.id);

    // Create a change object - first change is adding a hat
    return {
        commuterId: commuterId,
        type: 'hat',
        property: 'hasHat',
        value: true,
        found: false
    };
}

/**
 * Select a random element to change on a commuter
 */
function selectRandomChange() {
    if (commuterSprites.length === 0) return null;

    // Select a random commuter
    const commuterIndex = Math.floor(Math.random() * commuterSprites.length);
    const commuter = commuterSprites[commuterIndex];

    // Pick a random change type
    const changeTypes = ['hat', 'type', 'briefcase', 'direction'];
    const changeType = changeTypes[Math.floor(Math.random() * changeTypes.length)];

    // Default change properties
    let property = '';
    let value = null;

    // Customize change based on type
    switch (changeType) {
        case 'hat':
            property = 'hasHat';
            // Toggle hat visibility
            value = !commuter.config.hasHat;
            break;

        case 'type':
            property = 'type';
            // Change to a different commuter type
            let newType;
            do {
                newType = Math.floor(Math.random() * 5);
            } while (newType === commuter.config.type);
            value = newType;
            break;

        case 'briefcase':
            property = 'hasBriefcase';
            // Toggle briefcase visibility
            value = !commuter.config.hasBriefcase;
            break;

        case 'direction':
            property = 'facingLeft';
            // Toggle direction
            value = !commuter.config.facingLeft;
            break;
    }

    return {
        commuterId: getCommuterIndex(commuter.id),
        type: changeType,
        property: property,
        value: value,
        found: false
    };
}

/**
 * Apply the selected change to a commuter
 */
function applyChange(change) {
    if (!change) return;

    // Find the commuter by ID
    const commuter = commuterSprites[change.commuterId];
    if (!commuter) return;

    // Create options object for updating the commuter
    const updateOptions = {};
    updateOptions[change.property] = change.value;

    // Update the commuter
    spriteSystem.updateCommuter(commuter.id, updateOptions);
}

/**
 * Override game functions to work with sprite system
 */
function overrideGameFunctions() {
    // Store original functions
    const originalCreateFirstChange = window.createFirstChange;
    const originalSelectRandomChange = window.selectRandomChange;
    const originalApplyChange = window.applyChange;
    const originalHighlightMissedChange = window.highlightMissedChange;

    // Override createFirstChange function
    window.createFirstChange = function () {
        return createFirstChange();
    };

    // Override selectRandomChange function
    window.selectRandomChange = function () {
        return selectRandomChange();
    };

    // Override applyChange function
    window.applyChange = function (change) {
        applyChange(change);
    };

    // Override highlightMissedChange function
    window.highlightMissedChange = function (change) {
        if (!change) return;

        // Find the commuter element
        const commuter = commuterSprites[change.commuterId];
        if (commuter && commuter.element) {
            // Highlight the commuter
            highlightCommuter(commuter.element);
        }
    };
}

/**
 * Add a new commuter to the scene when a meter segment is filled
 * @param {number} segmentNumber - Current segment that was filled
 */
function addNewCommuter(segmentNumber) {
    // Check if we can add more commuters
    if (commuterSprites.length >= COMMUTER_ADDITION.maxCommuters) return;

    // Add a new commuter at the position corresponding to the segment
    createNewCommuter(segmentNumber);

    // Show notification
    window.showMessage("The station seems more crowded now...", 2000);
}

// Initialize the sprite system when the game starts
document.addEventListener('DOMContentLoaded', function () {
    // Wait for game to initialize first
    setTimeout(function () {
        initializeSpriteSystem();
    }, 500);
});

// Fix for sprite display - will try multiple paths
setTimeout(function () {
    console.log("Running sprite display fix...");

    // Check if commuters are visible
    const sprites = document.querySelectorAll('.commuter-sprite');
    if (sprites.length === 0) {
        console.log("No commuter sprites found, reinitializing sprite system");
        initializeSpriteSystem();
    } else {
        console.log("Found " + sprites.length + " commuter sprites");

        // Check if sprites have background images
        let needsFixing = false;
        sprites.forEach(function (sprite) {
            if (!sprite.style.backgroundImage || sprite.style.backgroundImage === '') {
                needsFixing = true;
            }
        });

        if (needsFixing) {
            console.log("Sprites found but need fixing");
            fixSpriteBackgrounds();
        }
    }
}, 1000);

// Function to fix sprite backgrounds
function fixSpriteBackgrounds() {
    // Get all commuter sprites
    const sprites = document.querySelectorAll('.commuter-sprite');

    // Try each path until one works
    const possiblePaths = [
        'assets/sprites/',
        'sprites/',
        './sprites/',
        './assets/sprites/',
        '../sprites/',
        '../assets/sprites/',
        '/'
    ];

    // Test which path works
    function testPaths(callback) {
        let workingPath = null;
        let testedCount = 0;

        possiblePaths.forEach(function (path) {
            const img = new Image();
            img.onload = function () {
                if (!workingPath) {
                    workingPath = path;
                    console.log("Found working path: " + path);
                    callback(path);
                }
            };
            img.onerror = function () {
                testedCount++;
                if (testedCount === possiblePaths.length && !workingPath) {
                    // No paths worked, use fallback
                    callback(null);
                }
            };
            img.src = path + 'commuter1.png';
        });
    }

    // Apply the working path to all sprites
    testPaths(function (path) {
        if (path) {
            // Update sprite system path
            if (spriteSystem) {
                spriteSystem.options.spritesPath = path;
            }

            // Fix each sprite
            sprites.forEach(function (sprite, index) {
                // Get commuter data
                const commuterData = commuterSprites[index];
                if (!commuterData) return;

                // Get commuter type
                const commuterType = commuterData.config.type || 0;
                const filename = 'commuter' + (commuterType + 1) + '.png';

                // Apply background image
                sprite.style.backgroundImage = 'url(' + path + filename + ')';
                sprite.style.backgroundSize = 'contain';
                sprite.style.backgroundRepeat = 'no-repeat';
                sprite.style.backgroundPosition = 'bottom center';

                // Make sure it's visible
                sprite.style.width = '36px';
                sprite.style.height = '85px';
                sprite.style.display = 'block';

                // Update accessories if needed
                if (commuterData.config.hasHat) {
                    const hatElement = sprite.querySelector('.commuter-hat') || document.createElement('div');
                    hatElement.className = 'commuter-hat';
                    hatElement.style.position = 'absolute';
                    hatElement.style.top = '0';
                    hatElement.style.left = '0';
                    hatElement.style.width = '100%';
                    hatElement.style.height = '30%';
                    hatElement.style.backgroundImage = 'url(' + path + 'hat.png)';
                    hatElement.style.backgroundSize = 'contain';
                    hatElement.style.backgroundRepeat = 'no-repeat';
                    hatElement.style.backgroundPosition = 'top center';
                    hatElement.style.zIndex = '11';
                    if (!sprite.contains(hatElement)) {
                        sprite.appendChild(hatElement);
                    }
                }

                if (commuterData.config.hasBriefcase) {
                    const briefcaseElement = sprite.querySelector('.commuter-briefcase') || document.createElement('div');
                    briefcaseElement.className = 'commuter-briefcase';
                    briefcaseElement.style.position = 'absolute';
                    briefcaseElement.style.bottom = '30%';
                    briefcaseElement.style.left = commuterData.config.facingLeft ? '60%' : '-20%';
                    briefcaseElement.style.width = '40%';
                    briefcaseElement.style.height = '20%';
                    briefcaseElement.style.backgroundImage = 'url(' + path + 'briefcase.png)';
                    briefcaseElement.style.backgroundSize = 'contain';
                    briefcaseElement.style.backgroundRepeat = 'no-repeat';
                    briefcaseElement.style.zIndex = '9';
                    if (!sprite.contains(briefcaseElement)) {
                        sprite.appendChild(briefcaseElement);
                    }
                }
            });

            console.log("Sprites fixed with path: " + path);
        } else {
            // Create fallback colored sprites
            sprites.forEach(function (sprite) {
                sprite.style.backgroundColor = '#3a6ea5';
                sprite.style.border = '2px solid #b8c8d8';
                sprite.style.width = '36px';
                sprite.style.height = '85px';
                sprite.style.display = 'block';
            });
            console.log("No working paths found, using colored fallback sprites");
        }
    });
}

// If there are zero commuters after the game starts, create one
setTimeout(function () {
    const sprites = document.querySelectorAll('.commuter-sprite');
    if (sprites.length === 0) {
        console.log("No sprites found after delay, forcing commuter creation");

        // Force create a commuter
        const sceneContainer = document.getElementById('scene-container');
        if (sceneContainer) {
            // Create a simple visible commuter
            const commuter = document.createElement('div');
            commuter.className = 'commuter-sprite';
            commuter.id = 'commuter-0';
            commuter.style.position = 'absolute';
            commuter.style.left = '50%';
            commuter.style.bottom = '120px';
            commuter.style.transform = 'translateX(-50%)';
            commuter.style.width = '36px';
            commuter.style.height = '85px';
            commuter.style.backgroundColor = '#3a6ea5';
            commuter.style.border = '2px solid #b8c8d8';
            commuter.style.zIndex = '10';
            commuter.style.cursor = 'pointer';

            // Make it clickable
            commuter.addEventListener('click', function (event) {
                if (typeof handleElementClick === 'function') {
                    handleElementClick(event);
                }
            });

            sceneContainer.appendChild(commuter);

            // Initialize game variables
            if (typeof window.commuterSprites === 'undefined') {
                window.commuterSprites = [];
            }

            // Add to commuter sprites array
            window.commuterSprites.push({
                id: 'commuter-0',
                element: commuter,
                config: {
                    id: 'commuter-0',
                    x: sceneContainer.offsetWidth / 2,
                    y: 0,
                    type: 0,
                    variant: 'default',
                    facingLeft: false,
                    hasHat: false,
                    hasBriefcase: false
                }
            });

            console.log("Emergency commuter created");
        }
    }
}, 2000);

// Debug function to log sprite information
function debugSprites() {
    console.log("=== SPRITE DEBUG INFO ===");
    console.log("Sprite system exists:", typeof spriteSystem !== 'undefined');

    if (typeof spriteSystem !== 'undefined') {
        console.log("Sprite path:", spriteSystem.options.spritesPath);
        console.log("Container:", spriteSystem.options.container);
        console.log("Scale:", spriteSystem.options.spriteScale);
    }

    console.log("commuterSprites array:", commuterSprites);
    console.log("Commuter elements in DOM:", document.querySelectorAll('.commuter-sprite').length);

    // Test image loading
    const testImage = new Image();
    testImage.onload = function () {
        console.log("✅ Test image loaded successfully");
    };
    testImage.onerror = function () {
        console.log("❌ Test image failed to load");
    };

    if (typeof spriteSystem !== 'undefined') {
        testImage.src = spriteSystem.options.spritesPath + 'commuter1.png';
    } else {
        testImage.src = 'assets/sprites/commuter1.png';
    }

    console.log("=========================");
}

// Add debug function call with a delay to allow everything to initialize
setTimeout(debugSprites, 3000);