/**
 * Drone: The Daily Commute
 * Album Link - Adds a clickable album sprite that opens a URL
 */

// The URL to open when the album sprite is clicked
const ALBUM_URL = "https://www.google.com";

// Position for the album sprite [left%, bottom%]
const ALBUM_POSITION = [96, 35];

// Dimensions of the album sprite
const ALBUM_WIDTH = 150;
const ALBUM_HEIGHT = 174;

// Reference to the album element
let albumElement = null;

/**
 * Initialize and add the album sprite to the scene
 */
function initAlbumLink() {
    console.log("Initializing album link");
    addAlbumToScene();
}

/**
 * Create and add the album sprite to the scene
 */
function addAlbumToScene() {
    // If we already have an album element, don't add another
    if (albumElement) return;

    // Create the album element
    albumElement = document.createElement('div');
    albumElement.id = 'album-sprite';
    albumElement.className = 'album-sprite';
    
    // Calculate actual position
    const containerWidth = gameState.elements.sceneContainer.offsetWidth;
    const containerHeight = gameState.elements.sceneContainer.offsetHeight;
    
    const xPos = (ALBUM_POSITION[0] / 100) * containerWidth;
    const yPos = (ALBUM_POSITION[1] / 100) * containerHeight;
    
    // Set styles
    albumElement.style.position = 'absolute';
    albumElement.style.left = `${xPos}px`;
    albumElement.style.bottom = `${yPos}px`;
    albumElement.style.width = `${ALBUM_WIDTH}px`;
    albumElement.style.height = `${ALBUM_HEIGHT}px`;
    albumElement.style.transform = 'translateX(-50%)';
    albumElement.style.backgroundImage = 'url(assets/sprites/album.png)';
    albumElement.style.backgroundSize = 'contain';
    albumElement.style.backgroundRepeat = 'no-repeat';
    albumElement.style.backgroundPosition = 'bottom center';
    albumElement.style.zIndex = '6'; // Between set dressing (5) and commuters (10)
    albumElement.style.cursor = 'pointer';
    albumElement.style.transition = 'transform 0.2s ease, filter 0.3s ease';
    
    // Add hover effect
    albumElement.addEventListener('mouseenter', () => {
        albumElement.style.transform = 'translateX(-50%) scale(1.1)';
        albumElement.style.filter = 'brightness(1.2)';
    });
    
    albumElement.addEventListener('mouseleave', () => {
        albumElement.style.transform = 'translateX(-50%) scale(1)';
        albumElement.style.filter = 'brightness(1)';
    });
    
    // Add click handler
    albumElement.addEventListener('click', handleAlbumClick);
    
    // Add to DOM
    gameState.elements.sceneContainer.appendChild(albumElement);
    
    console.log("Added album sprite to scene");
}

/**
 * Handle album click events
 */
function handleAlbumClick(event) {
    console.log("Album clicked! Opening URL:", ALBUM_URL);
    
    // Prevent default behavior
    event.preventDefault();
    event.stopPropagation();
    
    // Add a click effect
    albumElement.classList.add('album-click-effect');
    
    // Remove the effect after animation completes
    setTimeout(() => {
        albumElement.classList.remove('album-click-effect');
    }, 300);
    
    // Open the URL in a new tab
    window.open(ALBUM_URL, '_blank');
}

/**
 * Update album position on resize
 */
function updateAlbumPosition() {
    if (!albumElement) return;
    
    const containerWidth = gameState.elements.sceneContainer.offsetWidth;
    const containerHeight = gameState.elements.sceneContainer.offsetHeight;
    
    const xPos = (ALBUM_POSITION[0] / 100) * containerWidth;
    const yPos = (ALBUM_POSITION[1] / 100) * containerHeight;
    
    albumElement.style.left = `${xPos}px`;
    albumElement.style.bottom = `${yPos}px`;
}

// Export album link functions to window object
window.albumLink = {
    initAlbumLink,
    addAlbumToScene,
    updateAlbumPosition
}; 