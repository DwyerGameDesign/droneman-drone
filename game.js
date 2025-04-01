/**
 * Drone: The Daily Commute
 * Enhanced Game Logic - Updated for multiple commuters and progressive difficulty
 */

// Game state
let day = 1;
let awareness = 0;
let canClick = false;
let currentChange = null;
let isTransitioning = false;
let typewriter = null;
let awarenessMeter = null;
let currentSegment = 0;
let changesFound = 0;
let progressToNextSegment = 0;
let allCommuters = [];
let activeCommuters = 0;
let commuterVariations = {};

// Configurable game settings
const PROGRESSION_CONFIG = {
    initialChangesPerDay: 1,
    maxChangesPerDay: 5,
    // Changes needed to fill each segment (progressively more difficult)
    changesToFillSegment: [1, 2, 3, 4, 5, 5, 5, 5],
    awarenessPenalty: 10, // How much awareness decreases when missing a change
    awarenessGainPerChange: 20 // Base awareness gain per change found
};

// Maximum number of commuters in the scene
const MAX_COMMUTERS = 8;

// Positions for each commuter [left%, bottom%]
const COMMUTER_POSITIONS = [
    [50, 20],  // center
    [30, 20],  // left of center
    [70, 20],  // right of center
    [15, 20],  // far left
    [85, 20],  // far right
    [40, 20],  // left-center
    [60, 20],  // right-center
    [75, 20]   // near right
];

// Game elements
const sceneContainer = document.getElementById('scene-container');
const trainButton = document.getElementById('train-button');
const dayDisplay = document.getElementById('day');
const narrativeText = document.getElementById('narrative-text');
const fadeOverlay = document.getElementById('fade-overlay');
const message = document.getElementById('message');
const thoughtBubble = document.getElementById('thought-bubble');

// Initialize the game when DOM is fully loaded
document.addEventListener('DOMContentLoaded', init);

/**
 * Initialize the game
 */
async function init() {
    console.log("Initializing Drone: The Daily Commute");

    // Initialize typewriter
    initTypewriter();

    // Create awareness meter
    createAwarenessMeter();

    // Initialize the train platform background
    initializeTrainPlatformBackground();

    // Detect available commuter variations
    await detectCommuterVariations();

    // Add initial commuter
    addInitialCommuter();

    // Update displays
    updateAwarenessDisplay();

    // Set initial narrative text
    typewriter.type("everyday the same...");

    // Set up train button
    if (trainButton) {
        trainButton.addEventListener('click', takeTrain);
    }

    // Apply initial color stage
    updateColorStage();

    // Setup mobile support if needed
    setupMobileSupport();
}

/**
 * Initialize the typewriter for narrative text
 */
function initTypewriter() {
    // Create a new Typewriter instance
    if (typeof Typewriter !== 'undefined') {
        typewriter = new Typewriter(narrativeText, {
            speed: 40,
            delay: 0,
            cursor: '|'
        });
    } else {
        // Fallback for when the Typewriter class is not available
        typewriter = {
            type: function (text) {
                narrativeText.textContent = text;
                return this;
            },
            stop: function () {
                // Do nothing
            }
        };

        // Try to load the Typewriter script dynamically
        const script = document.createElement('script');
        script.src = 'typewriter.js';
        script.onload = function () {
            // Once loaded, create a proper Typewriter instance
            typewriter = new Typewriter(narrativeText, {
                speed: 40,
                delay: 0,
                cursor: '|'
            });
            typewriter.type(narrativeText.textContent);
        };
        document.head.appendChild(script);
    }
}

/**
 * Create and initialize the awareness meter
 */
function createAwarenessMeter() {
    // Create awareness container if it doesn't exist
    let awarenessContainer = document.getElementById('awareness-container');
    if (!awarenessContainer) {
        awarenessContainer = document.createElement('div');
        awarenessContainer.id = 'awareness-container';
        awarenessContainer.className = 'awareness-container';

        // Insert into the HUD
        const hud = document.querySelector('.hud');
        if (hud) {
            // Remove old awareness counter if it exists
            const oldCounter = document.querySelector('.awareness-counter');
            if (oldCounter) {
                oldCounter.remove();
            }

            hud.appendChild(awarenessContainer);
        }
    }

    // Create meter instance
    if (typeof AwarenessMeter !== 'undefined') {
        awarenessMeter = new AwarenessMeter({
            container: awarenessContainer,
            maxLevel: 100,
            segmentSize: 20,
            meterWidth: 200,
            meterHeight: 15,
            activeColor: '#4e4eb2',
            inactiveColor: '#3a3a3a',
            borderColor: '#666',
            onSegmentFilled: handleSegmentFilled
        });

        // Initial update
        awarenessMeter.update(awareness);
    } else {
        console.warn("AwarenessMeter class not found, awareness will be tracked internally only");
    }
}

/**
 * Handle when a meter segment is filled
 */
function handleSegmentFilled(segmentNumber, previousSegmentNumber) {
    console.log(`Segment ${segmentNumber} filled!`);

    // If this is a new segment (not just updating the display)
    if (segmentNumber > previousSegmentNumber) {
        // Update current segment
        currentSegment = segmentNumber;

        // Reset progress to next segment
        progressToNextSegment = 0;

        // Show narrative for this segment
        showSegmentNarrative(segmentNumber);

        // Add a new commuter if available
        const newCommuter = addCommuter();
        if (newCommuter) {
            console.log(`Added commuter ${newCommuter.type} for segment ${segmentNumber}`);

            // Highlight the new commuter
            highlightElement(newCommuter.element);
        }
    }
}

/**
 * Show narrative for a segment
 */
function showSegmentNarrative(segmentNumber) {
    // Define narratives for each segment
    const narratives = [
        "The routine continues. Same faces, same train. But something feels different today.",
        "You're starting to notice the world around you more clearly. The routine is still there, but you're waking up.",
        "The grip is loosening. Each day you feel more conscious, more alive. The routine can be broken.",
        "The world is more vibrant now. The daily commute is becoming a journey of choice, not necessity.",
        "Colors appear more vivid. Details you never noticed before demand your attention.",
        "Time seems to flow differently now. You're present in each moment.",
        "Other commuters begin to appear as individuals, not a faceless crowd.",
        "The train no longer feels like a prison. It's merely a vehicle, and you control where it takes you.",
        "DRONE NO MORE, I'M MY OWN PERSON. You've broken free from the cycle."
    ];

    // Get the narrative for this segment (0-indexed array)
    const narrative = narratives[segmentNumber - 1] ||
        "Your awareness continues to grow...";

    // Update the narrative display
    if (typewriter) {
        typewriter.stop();
        narrativeText.textContent = '';
        setTimeout(() => {
            typewriter.type(narrative);
        }, 100);
    } else {
        narrativeText.textContent = narrative;
    }
}

/**
 * Initialize the train platform background
 */
function initializeTrainPlatformBackground() {
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

    // Insert at the beginning of the scene container
    sceneContainer.insertBefore(platformBackground, sceneContainer.firstChild);

    // Hide the original CSS-based station elements
    hideOriginalStationElements();

    // Try fixing the background image after a short delay
    setTimeout(fixTrainPlatformBackground, 1000);
}

/**
 * Hide original CSS-based station elements
 */
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
}

/**
 * Fix background if the default path doesn't work
 */
function fixTrainPlatformBackground() {
    // Get the platform background element
    let platformBackground = document.getElementById('platform-background');
    if (!platformBackground) return;

    // If the background image doesn't appear to be loading
    if (!platformBackground.style.backgroundImage ||
        platformBackground.style.backgroundImage === 'url("")' ||
        platformBackground.style.backgroundImage === 'none') {

        console.log("Attempting to fix train platform background image");

        // Try multiple paths
        const paths = [
            'assets/sprites/train_platform.png',
            './assets/sprites/train_platform.png',
            '../assets/sprites/train_platform.png',
            '/assets/sprites/train_platform.png',
            'sprites/train_platform.png',
            './sprites/train_platform.png',
            '../sprites/train_platform.png',
            '/sprites/train_platform.png',
            'train_platform.png'
        ];

        // Function to try loading from each path
        function tryNextPath(index) {
            if (index >= paths.length) {
                console.log("Couldn't find train_platform.png - using fallback");
                platformBackground.style.backgroundColor = '#2a2a2a';
                return;
            }

            const img = new Image();
            img.onload = function () {
                console.log("Found train platform image at:", paths[index]);
                platformBackground.style.backgroundImage = `url(${paths[index]})`;
            };

            img.onerror = function () {
                tryNextPath(index + 1);
            };

            img.src = paths[index];
        }

        // Start trying paths
        tryNextPath(0);
    }
}

/**
 * Detect all available commuter variations
 */
async function detectCommuterVariations() {
    console.log("Detecting commuter variations...");

    // For each potential commuter (1-8)
    for (let i = 1; i <= MAX_COMMUTERS; i++) {
        commuterVariations[`commuter${i}`] = [];

        // Check for variations (a, b, c, etc.)
        const letters = ['a', 'b', 'c', 'd', 'e', 'f'];

        // Basic variation is the commuter with no suffix
        const baseImage = new Image();
        baseImage.src = `assets/sprites/commuter${i}.png`;

        // Check if main version exists
        try {
            await imageExists(baseImage);
            commuterVariations[`commuter${i}`].push(`commuter${i}.png`);
            console.log(`Found base sprite: commuter${i}.png`);
        } catch (error) {
            console.log(`Base sprite commuter${i}.png not found`);
            // If base doesn't exist, skip this commuter
            continue;
        }

        // Check for letter variations
        for (const letter of letters) {
            const variantImage = new Image();
            variantImage.src = `assets/sprites/commuter${i}_${letter}.png`;

            try {
                await imageExists(variantImage);
                commuterVariations[`commuter${i}`].push(`commuter${i}_${letter}.png`);
                console.log(`Found variant: commuter${i}_${letter}.png`);
            } catch (error) {
                // This variation doesn't exist, that's okay
            }
        }

        // Also check for old-style variations like with/without briefcase
        const oldStyleVariants = [
            'nobriefcase', 'hat', 'glasses', 'phone', 'coffee'
        ];

        for (const variant of oldStyleVariants) {
            const variantImage = new Image();
            variantImage.src = `assets/sprites/commuter${i}_${variant}.png`;

            try {
                await imageExists(variantImage);
                commuterVariations[`commuter${i}`].push(`commuter${i}_${variant}.png`);
                console.log(`Found legacy variant: commuter${i}_${variant}.png`);
            } catch (error) {
                // This variation doesn't exist, that's okay
            }
        }
    }

    console.log("Detected variations:", commuterVariations);
}

/**
 * Promise that resolves when an image is loaded or rejects if it fails
 */
function imageExists(imgElement) {
    return new Promise((resolve, reject) => {
        imgElement.onload = () => resolve(true);
        imgElement.onerror = () => reject(false);

        // If image is already loaded
        if (imgElement.complete) {
            if (imgElement.naturalWidth > 0) {
                resolve(true);
            } else {
                reject(false);
            }
        }
    });
}

/**
 * Add the initial commuter to the scene
 */
function addInitialCommuter() {
    addCommuter();
}

/**
 * Add a new commuter to the scene
 */
function addCommuter() {
    if (activeCommuters >= MAX_COMMUTERS) {
        console.log("Maximum number of commuters reached");
        return null;
    }

    // Determine which commuter type to add (commuter1, commuter2, etc.)
    const commuterIndex = activeCommuters + 1;
    const commuterType = `commuter${commuterIndex}`;

    // Check if we have variations for this commuter
    if (!commuterVariations[commuterType] || commuterVariations[commuterType].length === 0) {
        console.log(`No variations found for ${commuterType}`);
        return null;
    }

    // Get position for this commuter
    const position = COMMUTER_POSITIONS[activeCommuters] || [50, 20];

    // Create the commuter element
    const commuterId = `commuter-${activeCommuters}`;
    const commuterElement = document.createElement('div');
    commuterElement.id = commuterId;
    commuterElement.className = 'commuter-sprite';
    commuterElement.dataset.commuterType = commuterType;

    // Calculate actual position
    const containerWidth = sceneContainer.offsetWidth;
    const containerHeight = sceneContainer.offsetHeight;
    const xPos = (position[0] / 100) * containerWidth;
    const yPos = (position[1] / 100) * containerHeight;

    // Set styles
    commuterElement.style.position = 'absolute';
    commuterElement.style.left = `${xPos}px`;
    commuterElement.style.bottom = `${yPos}px`;
    commuterElement.style.width = '36px';
    commuterElement.style.height = '85px';
    commuterElement.style.transform = 'translateX(-50%)';

    // Use the first variation as default
    const defaultVariation = commuterVariations[commuterType][0];
    commuterElement.style.backgroundImage = `url(assets/sprites/${defaultVariation})`;
    commuterElement.style.backgroundSize = 'contain';
    commuterElement.style.backgroundRepeat = 'no-repeat';
    commuterElement.style.backgroundPosition = 'bottom center';
    commuterElement.style.zIndex = `${10 + activeCommuters}`;
    commuterElement.style.cursor = 'pointer';

    // Add to DOM
    sceneContainer.appendChild(commuterElement);

    // Add click handler
    commuterElement.addEventListener('click', handleCommuterClick);

    // Create commuter object
    const commuter = {
        id: commuterId,
        element: commuterElement,
        type: commuterType,
        currentVariation: defaultVariation,
        position: position,
        index: activeCommuters
    };

    // Add to commuters array
    allCommuters.push(commuter);

    // Increment active commuters count
    activeCommuters++;

    console.log(`Added ${commuterType} at position ${position}`);
    return commuter;
}

/**
 * Handle clicks on commuters
 */
function handleCommuterClick(event) {
    const commuterElement = event.currentTarget;
    const commuterId = commuterElement.id;

    console.log(`Clicked commuter: ${commuterId}`);

    // Check if we're transitioning
    if (isTransitioning) {
        console.log("Game is transitioning");
        return;
    }

    // Check if clicking is allowed
    if (!canClick) {
        console.log("Clicking not allowed right now");
        showPopupMessage("everyday the same", event.clientX, event.clientY);
        return;
    }

    // Check if this is the current change
    if (currentChange && currentChange.commuterId === commuterId) {
        console.log("Correct commuter clicked!");

        // Mark as found
        currentChange.found = true;

        // Highlight the commuter
        highlightElement(commuterElement);

        // Increment changes found counter
        changesFound++;

        // Calculate awareness gain based on current difficulty
        const currentDifficulty = Math.max(1, currentSegment);

        // Adjust awareness gain based on the difficulty
        // Higher difficulty = less awareness gain per change
        const adjustedGain = Math.max(
            5,
            Math.round(PROGRESSION_CONFIG.awarenessGainPerChange / currentDifficulty)
        );

        // Increase awareness
        increaseAwareness(adjustedGain);

        // Increment progress to next segment
        progressToNextSegment++;

        // Show thought bubble
        showThoughtBubble();

        // Disable further clicking until next day
        canClick = false;

        // Update narrative text
        updateNarrativeText();
    } else {
        console.log("Wrong commuter clicked or no change to find");

        // Show message
        showMessage("I didn't notice anything different there", 1500);
    }
}

/**
 * Update the awareness display
 */
function updateAwarenessDisplay() {
    // Update meter if available
    if (awarenessMeter) {
        awarenessMeter.update(awareness);
    }
}

/**
 * Take the train to the next day
 */
function takeTrain() {
    // Prevent multiple clicks during transition
    if (isTransitioning) return;

    console.log("Taking the train");
    isTransitioning = true;

    // Disable train button during transition
    if (trainButton) {
        trainButton.disabled = true;
    }

    // Check if there's an unfound change to highlight
    if (currentChange && !currentChange.found) {
        // Highlight missed change
        highlightMissedChange();

        // Apply awareness penalty
        const penalty = PROGRESSION_CONFIG.awarenessPenalty;
        decreaseAwareness(penalty);

        // Proceed to next day after highlighting
        setTimeout(() => {
            proceedToNextDay();
        }, 1500);
    } else {
        // No missed change, proceed immediately
        proceedToNextDay();
    }
}

/**
 * Function to handle the transition to the next day
 */
function proceedToNextDay() {
    // Fade out
    sceneContainer.classList.add('fading');

    setTimeout(() => {
        // Increment day
        day++;
        dayDisplay.textContent = day;

        // Reset current change
        currentChange = null;

        // Determine number of changes for today
        const changesToCreate = determineChangesForDay();

        // Create new change
        if (day === 4) {
            // First change is on day 4
            createFirstChange();
        } else if (day > 4) {
            // For later days, create random changes
            createRandomChange(changesToCreate);
        }

        // Enable clicking since there's something to find (if day >= 4)
        canClick = day >= 4;

        // Check for lyrics or special day text
        checkForLyrics();

        // Fade back in
        setTimeout(() => {
            sceneContainer.classList.remove('fading');

            // Re-enable train button
            if (trainButton) {
                trainButton.disabled = false;
            }

            isTransitioning = false; // Reset transition flag
        }, 500); // Fade in duration
    }, 500); // Fade out duration
}

/**
 * Determine the number of changes to create for the current day
 */
function determineChangesForDay() {
    // Determine how many changes to create based on the current segment
    const baseChanges = Math.min(
        currentSegment + 1,
        PROGRESSION_CONFIG.maxChangesPerDay
    );

    // For early game, start with just 1 change
    if (day < 6) {
        return Math.min(1, PROGRESSION_CONFIG.initialChangesPerDay);
    }

    // Later in the game, add more changes based on progression
    return Math.min(
        baseChanges,
        PROGRESSION_CONFIG.maxChangesPerDay
    );
}

/**
 * Create the first change (day 4)
 */
function createFirstChange() {
    console.log("Creating first change");

    // Get the first commuter
    const firstCommuter = allCommuters[0];
    if (!firstCommuter) return;

    // Get variations for this commuter
    const variations = commuterVariations[firstCommuter.type];
    if (!variations || variations.length <= 1) return;

    // Select a different variation than the current one
    const currentVariation = firstCommuter.currentVariation;
    const otherVariations = variations.filter(v => v !== currentVariation);

    if (otherVariations.length === 0) return;

    // Select the first alternative variation
    const newVariation = otherVariations[0];

    // Apply the change
    applyVariation(firstCommuter, newVariation);

    // Create change object
    currentChange = {
        commuterId: firstCommuter.id,
        fromVariation: currentVariation,
        toVariation: newVariation,
        found: false
    };
}

/**
 * Create a random change for the day
 */
function createRandomChange(count = 1) {
    console.log(`Creating ${count} random changes`);

    // Select random commuters
    const availableCommuters = [...allCommuters];

    // For now we only handle one change at a time
    // Later you can expand this to handle multiple changes

    if (availableCommuters.length === 0) return;

    // Select a random commuter
    const randomIndex = Math.floor(Math.random() * availableCommuters.length);
    const commuter = availableCommuters[randomIndex];

    // Get variations for this commuter
    const variations = commuterVariations[commuter.type];
    if (!variations || variations.length <= 1) return;

    // Select a different variation than the current one
    const currentVariation = commuter.currentVariation;
    const otherVariations = variations.filter(v => v !== currentVariation);

    if (otherVariations.length === 0) return;

    // Select a random variation
    const newVariation = otherVariations[Math.floor(Math.random() * otherVariations.length)];

    // Apply the change
    applyVariation(commuter, newVariation);

    // Create change object
    currentChange = {
        commuterId: commuter.id,
        fromVariation: currentVariation,
        toVariation: newVariation,
        found: false
    };
}

/**
 * Apply a variation to a commuter
 */
function applyVariation(commuter, variation) {
    if (!commuter || !variation) return;

    // Update the background image
    commuter.element.style.backgroundImage = `url(assets/sprites/${variation})`;

    // Update the current variation
    commuter.currentVariation = variation;

    console.log(`Applied variation ${variation} to ${commuter.id}`);
}

/**
 * Highlight a commuter when a change is found
 */
function highlightElement(element) {
    if (!element) return;

    // Add highlight class
    element.classList.add('highlight-pulse');

    // Remove after animation completes
    setTimeout(() => {
        element.classList.remove('highlight-pulse');
    }, 1500);
}

/**
 * Highlight missed change at the end of a day
 */
function highlightMissedChange() {
    if (!currentChange) return;

    // Find the commuter
    const commuter = allCommuters.find(c => c.id === currentChange.commuterId);

    if (commuter && commuter.element) {
        // Add missed highlight class
        commuter.element.classList.add('highlight-missed');

        // Remove after animation completes
        setTimeout(() => {
            commuter.element.classList.remove('highlight-missed');
        }, 1500);
    }
}

/**
 * Increase awareness level
 */
function increaseAwareness(amount) {
    awareness += amount;

    updateAwarenessDisplay();
    updateColorStage();

    // Emit event
    const event = new CustomEvent('awarenessChanged', {
        detail: {
            awareness: awareness,
            change: amount
        }
    });
    document.dispatchEvent(event);

    console.log(`Awareness increased by ${amount} to ${awareness}`);

    // Check for game completion
    if (awareness >= 100) {
        gameComplete();
    }
}

/**
 * Decrease awareness level
 */
function decreaseAwareness(amount) {
    // Calculate new awareness
    awareness = Math.max(0, awareness - amount);

    // Update meter if available
    updateAwarenessDisplay();
    updateColorStage();

    // Emit event
    const event = new CustomEvent('awarenessChanged', {
        detail: {
            awareness: awareness,
            change: -amount
        }
    });
    document.dispatchEvent(event);

    console.log(`Awareness decreased by ${amount} to ${awareness}`);
}

/**
 * Check for lyrics for the current day
 */
function checkForLyrics() {
    // Define song lyrics that appear on certain days
    const SONG_LYRICS = [
        { day: 5, text: "Every day the same, rolling to a paycheck" },
        { day: 10, text: "6:40 train, drink my 40 on the way back" },
        { day: 15, text: "Soul's nearly drained, gotta be a way out" },
        { day: 20, text: "Signal in my brain, stopping me with self-doubt" },
        { day: 30, text: "Drone no more, I'm clean and free" },
        { day: 40, text: "The Man ain't got his grip on me" },
        { day: 50, text: "Drone no more, I'm my own man" },
        { day: 60, text: "Gotta engineer a plan" },
        { day: 75, text: "Time for a change, bell's ringing louder" },
        { day: 90, text: "No one left to blame, 'cause I'm my biggest doubter" },
        { day: 100, text: "Drone no more, I'm my own man" }
    ];

    // Check if there's a lyric for the current day
    const lyricForToday = SONG_LYRICS.find(lyric => lyric.day === day);

    if (lyricForToday) {
        narrativeText.textContent = `"${lyricForToday.text}"`;

        // Use typewriter effect
        if (typewriter) {
            typewriter.stop();
            setTimeout(() => {
                typewriter.type(narrativeText.textContent);
            }, 100);
        }
    }
}

/**
 * Update the narrative text based on the current awareness
 * Only called when a change is found
 */
function updateNarrativeText() {
    // Check if there's a lyric for the current day
    const SONG_LYRICS = [
        { day: 5, text: "Every day the same, rolling to a paycheck" },
        { day: 10, text: "6:40 train, drink my 40 on the way back" },
        { day: 15, text: "Soul's nearly drained, gotta be a way out" },
        { day: 20, text: "Signal in my brain, stopping me with self-doubt" },
        { day: 30, text: "Drone no more, I'm clean and free" },
        { day: 40, text: "The Man ain't got his grip on me" },
        { day: 50, text: "Drone no more, I'm my own man" },
        { day: 60, text: "Gotta engineer a plan" },
        { day: 75, text: "Time for a change, bell's ringing louder" },
        { day: 90, text: "No one left to blame, 'cause I'm my biggest doubter" },
        { day: 100, text: "Drone no more, I'm my own man" }
    ];

    const lyricForToday = SONG_LYRICS.find(lyric => lyric.day === day);

    if (lyricForToday) {
        narrativeText.textContent = `"${lyricForToday.text}"`;

        // Restart the typewriter with this text
        if (typewriter) {
            typewriter.stop();
            setTimeout(() => {
                typewriter.type(narrativeText.textContent);
            }, 100);
        }
    } else {
        // Choose narrative based on awareness level
        let newText = "";

        if (awareness < 25) {
            newText = "The routine continues, but something feels different today.";
        } else if (awareness < 50) {
            newText = "You're starting to notice the world around you more clearly.";
        } else if (awareness < 75) {
            newText = "The grip is loosening. Each day you feel more alive.";
        } else {
            newText = "The world is more vibrant now. You're breaking free.";
        }

        narrativeText.textContent = newText;

        // Restart the typewriter with this text
        if (typewriter) {
            typewriter.stop();
            setTimeout(() => {
                typewriter.type(newText);
            }, 100);
        }
    }
}

/**
 * Update the background color stage based on awareness
 */
function updateColorStage() {
    // Color stages
    const colorStages = [
        { threshold: 0, class: 'stage-1' },
        { threshold: 10, class: 'stage-2' },
        { threshold: 20, class: 'stage-3' },
        { threshold: 30, class: 'stage-4' },
        { threshold: 40, class: 'stage-5' },
        { threshold: 50, class: 'stage-6' },
        { threshold: 60, class: 'stage-7' },
        { threshold: 70, class: 'stage-8' },
        { threshold: 80, class: 'stage-9' },
        { threshold: 90, class: 'stage-10' }
    ];

    // Remove all stage classes first
    colorStages.forEach(stage => {
        sceneContainer.classList.remove(stage.class);
    });

    // Find the appropriate stage for current awareness
    for (let i = colorStages.length - 1; i >= 0; i--) {
        if (awareness >= colorStages[i].threshold) {
            sceneContainer.classList.add(colorStages[i].class);
            break;
        }
    }
}

/**
 * Show a thought bubble with text based on awareness level
 */
function showThoughtBubble() {
    // Define thoughts based on awareness levels
    const THOUGHTS = {
        early: [
            "Another day, another dollar.",
            "6:40 train again.",
            "Same commute, different day.",
            "This seat feels familiar.",
            "Two more stops to go."
        ],
        mid: [
            "Why do I do this every day?",
            "The train moves, but am I going anywhere?",
            "That person seems different today.",
            "I never noticed that building before.",
            "Time feels different when you pay attention."
        ],
        late: [
            "I don't have to do this forever.",
            "There's more to life than this cycle.",
            "I could engineer a plan to change things.",
            "My soul feels less drained today.",
            "The grip is loosening."
        ],
        final: [
            "I am not just a drone.",
            "The man ain't got his grip on me.",
            "I'm going to break this cycle.",
            "Today will be different.",
            "I'm my own person."
        ]
    };

    // Select appropriate thought based on awareness level
    let thoughtPool;

    if (awareness < 25) {
        thoughtPool = THOUGHTS.early;
    } else if (awareness < 50) {
        thoughtPool = THOUGHTS.mid;
    } else if (awareness < 75) {
        thoughtPool = THOUGHTS.late;
    } else {
        thoughtPool = THOUGHTS.final;
    }

    // Randomly select a thought
    const thought = thoughtPool[Math.floor(Math.random() * thoughtPool.length)];
    thoughtBubble.textContent = thought;

    // Position the thought bubble near the player
    thoughtBubble.style.top = '40%';
    thoughtBubble.style.left = '75%';
    thoughtBubble.style.visibility = 'visible';

    setTimeout(() => {
        thoughtBubble.style.visibility = 'hidden';
    }, 3000);
}

/**
 * Show a message for a specified duration
 */
function showMessage(text, duration = 2000) {
    message.textContent = text;
    message.style.visibility = 'visible';

    setTimeout(() => {
        message.style.visibility = 'hidden';
    }, duration);
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
 * Game completion
 */
function gameComplete() {
    // Additional game completion effects
    sceneContainer.classList.add('completion');

    // Display final message
    setTimeout(() => {
        const completionMessage = document.createElement('div');
        completionMessage.className = 'completion-message';
        completionMessage.innerHTML = `
            <h2>DRONE NO MORE</h2>
            <p>You've reached 100% awareness and broken free from the daily grind.</p>
            <p>Days on the train: ${day}</p>
            <p>Changes found: ${changesFound}</p>
        `;

        // Style the completion message
        completionMessage.style.position = 'absolute';
        completionMessage.style.top = '50%';
        completionMessage.style.left = '50%';
        completionMessage.style.transform = 'translate(-50%, -50%)';
        completionMessage.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        completionMessage.style.color = '#d4d4c8';
        completionMessage.style.padding = '20px';
        completionMessage.style.textAlign = 'center';
        completionMessage.style.zIndex = '1000';
        completionMessage.style.borderRadius = '5px';

        // Add to scene
        sceneContainer.appendChild(completionMessage);

        // Update narrative
        narrativeText.textContent = "DRONE NO MORE, I'M MY OWN MAN. You've broken free from the cycle.";

        // Use typewriter for final message
        if (typewriter) {
            typewriter.stop();
            setTimeout(() => {
                typewriter.type(narrativeText.textContent);
            }, 100);
        }

        // Disable train button
        if (trainButton) {
            trainButton.disabled = true;
        }
    }, 2000);
}

/**
 * Set up mobile support if needed
 */
function setupMobileSupport() {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    if (isMobile) {
        document.body.classList.add('mobile');

        // Add mobile-specific controls if needed
        const gameContainer = document.querySelector('.game-container');
        if (gameContainer && !document.querySelector('.mobile-controls')) {
            const mobileControls = document.createElement('div');
            mobileControls.className = 'mobile-controls';

            // Add hint button for mobile users
            const hintButton = document.createElement('button');
            hintButton.id = 'hint-button';
            hintButton.className = 'hint-button';
            hintButton.textContent = 'Need a Hint?';
            hintButton.addEventListener('click', showHint);

            mobileControls.appendChild(hintButton);
            gameContainer.appendChild(mobileControls);
        }

        // Enhance touch targets
        enhanceTouchTargets();
    }
}

/**
 * Make touch targets larger for mobile devices
 */
function enhanceTouchTargets() {
    // Increase clickable area for commuter sprites
    document.querySelectorAll('.commuter-sprite').forEach(el => {
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
            touchArea.addEventListener('click', function (e) {
                e.stopPropagation();
                el.click();
            });

            el.appendChild(touchArea);
        }
    });
}

/**
 * Show a hint to help the player
 */
function showHint() {
    // Only provide hint if there is an active change
    if (!currentChange) {
        showMessage("No changes to find yet. Take the train!", 1500);
        return;
    }

    // Find the commuter for the current change
    const commuter = allCommuters.find(c => c.id === currentChange.commuterId);

    if (commuter && commuter.element && !currentChange.found) {
        // Determine which quadrant the change is in
        const rect = commuter.element.getBoundingClientRect();
        const sceneRect = sceneContainer.getBoundingClientRect();

        const isTop = rect.top < (sceneRect.top + sceneRect.height / 2);
        const isLeft = rect.left < (sceneRect.left + sceneRect.width / 2);

        let location = isTop ? 'top' : 'bottom';
        location += isLeft ? ' left' : ' right';

        // Show hint message
        showMessage(`Look for a change in the ${location} area`, 2000);

        // Disable hint button temporarily
        const hintButton = document.getElementById('hint-button');
        if (hintButton) {
            hintButton.disabled = true;
            setTimeout(() => {
                hintButton.disabled = false;
            }, 5000);
        }
    } else {
        showMessage("No unfound changes left today", 1500);
    }
}