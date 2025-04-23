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
            <p class="warning-message">STATION ANNOUNCEMENT:</p>
            <p class="warning-message">mobile devices not permitted on this platform</p>
            <p class="warning-message">please return on desktop to board the 6:40 train</p>
            <div class="album-container">
                <a href="${albumUrl}" target="_blank">
                    <img src="assets/sprites/album.png" alt="Altered Root Band" class="album-image">
                </a>
            </div>
        </div>
    `;
    
    // Add to the document
    document.body.appendChild(mobileWarning);
    
    // Add styles specifically for the mobile warning screen
    const style = document.createElement('style');
    style.textContent = `
        .mobile-warning {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: #1a1a1a;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            z-index: 2000;
            padding: 20px;
            box-sizing: border-box;
            font-family: 'Courier New', monospace;
            color: #d4d4c8;
            text-align: center;
        }
        
        .mobile-warning h1 {
            margin-bottom: 20px;
            font-size: 24px;
            letter-spacing: 2px;
        }
        
        .warning-content {
            max-width: 90%;
            display: flex;
            flex-direction: column;
            align-items: center;
        }
        
        .warning-message {
            font-size: 18px;
            margin: 5px 0;
        }
        
        .album-container {
            margin: 25px 0;
            transition: transform 0.3s ease;
        }
        
        .album-container:hover {
            transform: scale(1.05);
        }
        
        .album-image {
            max-width: 250px;
            height: auto;
            box-shadow: 0 0 20px rgba(78, 78, 178, 0.5);
            border-radius: 4px;
        }
    `;
    
    document.head.appendChild(style);
    
    console.log("Mobile warning screen has been displayed");
}