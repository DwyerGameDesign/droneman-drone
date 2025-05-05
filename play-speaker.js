/**
 * Drone: The Daily Commute
 * Play Speaker - Adds a clickable speaker sprite that plays/pauses an MP3
 */

// The MP3 file to play when the speaker is clicked
const MUSIC_FILE = "assets/audio/alteredroot_drone.mp3";

// Position for the speaker sprite [left%, bottom%]
const SPEAKER_POSITION = [10, 75]; 

// Dimensions of the speaker sprite
const SPEAKER_WIDTH = 30;
const SPEAKER_HEIGHT = 41;

// Reference to the speaker element and audio element
let speakerElement = null;
let audioElement = null;
let isPlaying = false;
let noteAnimationInterval = null; // Interval for spawning notes

/**
 * Initialize and add the speaker sprite to the scene
 */
function initPlaySpeaker() {
    console.log("Initializing play speaker");
    createAudioElement();
    addSpeakerToScene();
}

/**
 * Create the audio element
 */
function createAudioElement() {
    // Create an audio element if it doesn't exist
    if (!audioElement) {
        audioElement = document.createElement('audio');
        audioElement.id = 'background-music';
        audioElement.src = MUSIC_FILE;
        audioElement.loop = true;
        audioElement.volume = 0.5; // Set initial volume to 50%
        document.body.appendChild(audioElement);
        
        // Add event listeners to update speaker state
        audioElement.addEventListener('play', () => {
            isPlaying = true;
            updateSpeakerVisuals();
        });
        
        audioElement.addEventListener('pause', () => {
            isPlaying = false;
            updateSpeakerVisuals();
        });
        
        audioElement.addEventListener('ended', () => {
            isPlaying = false;
            updateSpeakerVisuals();
        });
    }
}

/**
 * Create and add the speaker sprite to the scene
 */
function addSpeakerToScene() {
    // If we already have a speaker element, don't add another
    if (speakerElement) return;

    // Create the speaker element
    speakerElement = document.createElement('div');
    speakerElement.id = 'speaker-sprite';
    speakerElement.className = 'speaker-sprite';
    
    // Calculate actual position
    const containerWidth = gameState.elements.sceneContainer.offsetWidth;
    const containerHeight = gameState.elements.sceneContainer.offsetHeight;
    
    const xPos = (SPEAKER_POSITION[0] / 100) * containerWidth;
    const yPos = (SPEAKER_POSITION[1] / 100) * containerHeight;
    
    // Set styles
    speakerElement.style.position = 'absolute';
    speakerElement.style.left = `${xPos}px`;
    speakerElement.style.bottom = `${yPos}px`;
    speakerElement.style.width = `${SPEAKER_WIDTH}px`;
    speakerElement.style.height = `${SPEAKER_HEIGHT}px`;
    speakerElement.style.transform = 'translateX(-50%)';
    speakerElement.style.backgroundImage = 'url(assets/sprites/speaker.png)';
    speakerElement.style.backgroundSize = 'contain';
    speakerElement.style.backgroundRepeat = 'no-repeat';
    speakerElement.style.backgroundPosition = 'center';
    speakerElement.style.zIndex = '200'; // Increased to be above click-blocker (z-index: 150)
    speakerElement.style.cursor = 'pointer';
    speakerElement.style.transition = 'transform 0.2s ease, filter 0.3s ease';
    
    // Add hover effect
    speakerElement.addEventListener('mouseenter', () => {
        speakerElement.style.transform = 'translateX(-50%) scale(1.1)';
        speakerElement.style.filter = 'brightness(1.2)';
    });
    
    speakerElement.addEventListener('mouseleave', () => {
        speakerElement.style.transform = 'translateX(-50%) scale(1)';
        speakerElement.style.filter = 'brightness(1)';
    });
    
    // Add click handler
    speakerElement.addEventListener('click', handleSpeakerClick);
    
    // Add to DOM
    gameState.elements.sceneContainer.appendChild(speakerElement);
    
    console.log("Added speaker sprite to scene");
}

/**
 * Handle speaker click events
 */
function handleSpeakerClick(event) {
    // Prevent default behavior
    event.preventDefault();
    event.stopPropagation();
    
    // Toggle play/pause
    if (isPlaying) {
        console.log("Speaker clicked! Pausing music");
        isPlaying = false;
        audioElement.pause();
    } else {
        console.log("Speaker clicked! Playing music");
        isPlaying = true;
        audioElement.play().catch(error => {
            console.error("Error playing audio:", error);
            // If there's an error, revert the playing state
            isPlaying = false;
            // Show a message about autoplay restrictions if needed
            if (error.name === "NotAllowedError") {
                window.ui.showMessage("Click again to play music (autoplay blocked by browser)", 3000);
            }
        });
    }
    
    // Update visuals immediately based on new state
    updateSpeakerVisuals();
    
    // Add a click effect
    speakerElement.classList.add('speaker-click-effect');
    
    // Remove the effect after animation completes
    setTimeout(() => {
        speakerElement.classList.remove('speaker-click-effect');
    }, 300);
}

/**
 * Update the speaker visuals based on play state
 */
function updateSpeakerVisuals() {
    if (!speakerElement) return;
    
    if (isPlaying) {
        speakerElement.style.backgroundImage = 'url(assets/sprites/speaker.png)';
        startNoteAnimation();
    } else {
        speakerElement.style.backgroundImage = 'url(assets/sprites/speaker.png)';
        stopNoteAnimation();
    }
}

/**
 * Start the music note animation
 */
function startNoteAnimation() {
    // Clear any existing interval first
    stopNoteAnimation();
    
    // Start spawning notes every 700-1200ms
    noteAnimationInterval = setInterval(() => {
        createMusicNote();
    }, Math.random() * 100 + 300);
    
    // Create initial note
    createMusicNote();
}

/**
 * Stop the music note animation
 */
function stopNoteAnimation() {
    if (noteAnimationInterval) {
        clearInterval(noteAnimationInterval);
        noteAnimationInterval = null;
    }
    
    // Remove any existing notes
    const notes = document.querySelectorAll('.music-note');
    notes.forEach(note => {
        if (note.parentNode) {
            note.parentNode.removeChild(note);
        }
    });
}

/**
 * Create a single music note that floats upward and to the right
 */
function createMusicNote() {
    if (!speakerElement || !isPlaying) return;
    
    // Get the speaker position
    const speakerRect = speakerElement.getBoundingClientRect();
    const sceneContainer = gameState.elements.sceneContainer;
    const sceneRect = sceneContainer.getBoundingClientRect();
    
    // Create note element
    const note = document.createElement('div');
    note.className = 'music-note';
    
    // Choose a random note image with fallback to note.png
    let noteImage = 'music_note.png'; // Default fallback
    
    // Only use variations if they're likely to exist
    if (Math.random() > 0.5) {
        // Try to use variations, but with fallback
        try {
            const noteTypes = ['music_note.png'];
            const randomNoteIndex = Math.floor(Math.random() * noteTypes.length);
            noteImage = noteTypes[randomNoteIndex];
        } catch (error) {
            console.warn("Error selecting note variation, using default");
        }
    }
    
    // Generate random movement values
    const moveDistance = 50 + Math.random() * 100; // Distance to move right
    const upDistance = 20 + Math.random() * 40; // Distance to move up
    const duration = 2000 + Math.random() * 1000; // Animation duration in ms
    
    // Set starting position (right side of speaker)
    const startX = speakerRect.right - sceneRect.left - 5; // Adjust for scene position
    const startY = speakerRect.top + (speakerRect.height / 2) - sceneRect.top - 10; // Center vertically
    
    // Set note styles
    note.style.position = 'absolute';
    note.style.left = `${startX}px`;
    note.style.top = `${startY}px`;
    note.style.width = '15px';
    note.style.height = '20px';
    note.style.backgroundImage = `url(assets/sprites/${noteImage})`;
    note.style.backgroundSize = 'contain';
    note.style.backgroundRepeat = 'no-repeat';
    note.style.backgroundPosition = 'center';
    note.style.zIndex = '201'; // Above click-blocker and equal to speaker
    note.style.opacity = '0.8';
    note.style.pointerEvents = 'none'; // Don't capture clicks
    note.style.transition = `all ${duration/1000}s ease-out`;
    
    // Handle image loading error by falling back to a colored div
    note.addEventListener('error', () => {
        // If image fails to load, create a simple colored note shape
        note.style.backgroundImage = 'none';
        note.style.backgroundColor = '#FFFFFF';
        note.style.borderRadius = '50%';
        note.style.width = '8px';
        note.style.height = '8px';
    });
    
    // Add to the scene container
    sceneContainer.appendChild(note);
    
    // Force a reflow to ensure transitions work properly
    void note.offsetWidth;
    
    // Set the ending position and fade out (immediately)
    note.style.transform = `translate(${moveDistance}px, -${upDistance}px) scale(0.6) rotate(${Math.random() * 40 - 20}deg)`;
    note.style.opacity = '0';
    
    // Remove the note after animation completes
    setTimeout(() => {
        if (note.parentNode) {
            note.parentNode.removeChild(note);
        }
    }, duration);
}

/**
 * Update speaker position on resize
 */
function updateSpeakerPosition() {
    if (!speakerElement) return;
    
    const containerWidth = gameState.elements.sceneContainer.offsetWidth;
    const containerHeight = gameState.elements.sceneContainer.offsetHeight;
    
    const xPos = (SPEAKER_POSITION[0] / 100) * containerWidth;
    const yPos = (SPEAKER_POSITION[1] / 100) * containerHeight;
    
    speakerElement.style.left = `${xPos}px`;
    speakerElement.style.bottom = `${yPos}px`;
}

/**
 * Add CSS for speaker click effect
 */
function addSpeakerStyles() {
    const styleElement = document.createElement('style');
    styleElement.id = 'speaker-styles';
    
    styleElement.textContent = `
        .speaker-click-effect {
            animation: speaker-pulse 0.3s ease;
        }
        
        @keyframes speaker-pulse {
            0% { transform: translateX(-50%) scale(1); }
            50% { transform: translateX(-50%) scale(1.2); }
            100% { transform: translateX(-50%) scale(1); }
        }
    `;
    
    document.head.appendChild(styleElement);
}

// Call to add the styles when script loads
addSpeakerStyles();

// Export play speaker functions to window object
window.playSpeaker = {
    initPlaySpeaker,
    addSpeakerToScene,
    updateSpeakerPosition
}; 