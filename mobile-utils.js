/**
 * Drone: The Daily Commute
 * Mobile detection and warning screen
 */

// Check if we're on a mobile device
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

// Initialize mobile detection when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    if (isMobile) {
        createMobileWarningScreen();
    }
});

/**
 * Create a mobile warning screen that appears instead of the game
 */
function createMobileWarningScreen() {
    // Hide the game container
    const gameContainer = document.getElementById('game-container');
    if (gameContainer) {
        gameContainer.style.display = 'none';
    }
    
    // Hide loading overlay if it's still showing
    const loadingOverlay = document.getElementById('loading-overlay');
    if (loadingOverlay) {
        loadingOverlay.style.display = 'none';
    }
    
    // Create the mobile warning screen
    const mobileWarning = document.createElement('div');
    mobileWarning.id = 'mobile-warning';
    mobileWarning.className = 'mobile-warning';
    
    // Album URL from album-link.js
    const albumUrl = "https://www.alteredrootband.com/";
    
    // Create the warning content
    mobileWarning.innerHTML = `
        <h1>DRONE: THE DAILY COMMUTE</h1>
        <div class="warning-content">
            <p>This game is designed for desktop browsers and doesn't work well on mobile devices.</p>
            <div class="album-container">
                <img src="assets/sprites/band_logo.png" alt="Altered Root Band" class="album-image">
            </div>
            <p>Please visit <a href="${albumUrl}" target="_blank">www.alteredrootband.com</a> to learn more.</p>
            <a href="${albumUrl}" target="_blank" class="visit-button">Visit Band Website</a>
        </div>
    `;
    
    // Add to the document
    document.body.appendChild(mobileWarning);
    
    console.log("Mobile warning screen has been displayed");
}