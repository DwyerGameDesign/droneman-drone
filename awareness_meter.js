/**
 * Drone: The Daily Commute
 * Updated Awareness Meter System (XP Style) with integrated XP Effects
 */

class AwarenessMeter {
    constructor(options = {}) {
        // Default options
        this.options = {
            container: document.getElementById('awareness-container'),
            meterWidth: 200,
            meterHeight: 20,
            activeColor: '#4e4eb2',
            inactiveColor: '#3a3a3a',
            borderColor: '#666',
            animationDuration: 800,
            onLevelUp: null, // Callback when a level is gained
            ...options
        };
        
        this.currentXP = 0;        // Current XP points
        this.currentLevel = 0;     // Current level (starts at 0)
        this.maxLevel = 10;        // Maximum achievable level
        this.xpToNextLevel = 100;  // XP needed for first level
        this.meterElement = null;
        this.progressElement = null;
        this.levelDisplay = null;
        
        // Initialize the meter
        this.createMeter();
    }
    
    /**
     * Create the meter DOM elements
     */
    createMeter() {
        // If no container provided, create one
        if (!this.options.container) {
            this.options.container = document.createElement('div');
            this.options.container.className = 'awareness-container';
            document.querySelector('.hud').appendChild(this.options.container);
        }
        
        // Create level display
        this.levelDisplay = document.createElement('div');
        this.levelDisplay.className = 'awareness-level';
        this.levelDisplay.textContent = `Level ${this.currentLevel}`;
        this.levelDisplay.style.marginRight = '10px';
        this.levelDisplay.style.fontWeight = 'bold';
        
        // Create meter container
        this.meterElement = document.createElement('div');
        this.meterElement.className = 'awareness-meter';
        this.meterElement.style.width = `${this.options.meterWidth}px`;
        this.meterElement.style.height = `${this.options.meterHeight}px`;
        this.meterElement.style.backgroundColor = this.options.inactiveColor;
        this.meterElement.style.border = `2px solid ${this.options.borderColor}`;
        this.meterElement.style.borderRadius = '3px';
        this.meterElement.style.overflow = 'hidden';
        this.meterElement.style.position = 'relative';
        
        // Create progress element
        this.progressElement = document.createElement('div');
        this.progressElement.className = 'awareness-progress';
        this.progressElement.style.height = '100%';
        this.progressElement.style.width = '0%';
        this.progressElement.style.backgroundColor = this.options.activeColor;
        this.progressElement.style.transition = `width ${this.options.animationDuration}ms ease-in-out`;
        
        // Add the progress to the meter
        this.meterElement.appendChild(this.progressElement);
        
        // Add level display and meter to the container
        this.options.container.appendChild(this.levelDisplay);
        this.options.container.appendChild(this.meterElement);
        
        // Add eye icon next to meter
        const eyeIcon = document.createElement('div');
        eyeIcon.className = 'awareness-icon';
        eyeIcon.innerHTML = '<span>👁️</span>';
        eyeIcon.style.marginLeft = '10px';
        eyeIcon.style.display = 'flex';
        eyeIcon.style.alignItems = 'center';
        eyeIcon.style.justifyContent = 'center';
        eyeIcon.style.width = '24px';
        eyeIcon.style.height = '24px';
        
        this.options.container.appendChild(eyeIcon);
    }
    
    /**
     * Get the XP required for the next level based on current level
     * This implements a scaling difficulty curve
     */
    getXPRequiredForNextLevel(level) {
        // Base XP requirement (for level 0 to level 1)
        const baseXP = 100;
        
        // Scale XP requirements for higher levels
        // Examples:
        // Level 0->1: 100 XP
        // Level 1->2: 150 XP
        // Level 2->3: 225 XP
        // Level 3->4: 340 XP
        // Level 4->5: 510 XP etc.
        return Math.floor(baseXP * Math.pow(1.5, level));
    }
    
    /**
     * Add XP to the meter
     * @param {number} amount - Amount of XP to add
     * @returns {boolean} - Whether a level up occurred
     */
    addXP(amount) {
        // Store current state for comparison
        const previousLevel = this.currentLevel;
        
        // Add XP
        this.currentXP += amount;
        
        // Check if we've gained a level
        let leveledUp = false;
        
        while (this.currentXP >= this.xpToNextLevel && this.currentLevel < this.maxLevel) {
            // Level up
            this.currentLevel++;
            
            // Carry over excess XP
            this.currentXP -= this.xpToNextLevel;
            
            // Calculate new XP requirement for next level
            this.xpToNextLevel = this.getXPRequiredForNextLevel(this.currentLevel);
            
            leveledUp = true;
        }
        
        // Cap XP at max for highest level
        if (this.currentLevel >= this.maxLevel) {
            this.currentXP = Math.min(this.currentXP, this.xpToNextLevel);
        }
        
        // Show XP gain effect
        if (amount > 0) {
            this.showXPGain(amount);
        }
        
        // Update display
        this.updateDisplay();
        
        // If level increased and callback exists, call it
        if (leveledUp && this.options.onLevelUp) {
            // Show level up effect
            this.showLevelUp(this.currentLevel);
            
            // Call the callback
            this.options.onLevelUp(this.currentLevel, previousLevel);
        }
        
        return leveledUp;
    }
    
    /**
     * Update the meter display to match current state
     */
    updateDisplay() {
        // Update level text
        this.levelDisplay.textContent = `Level ${this.currentLevel}`;
        
        // Calculate progress percentage
        const progressPercent = (this.currentXP / this.xpToNextLevel) * 100;
        
        // Update progress bar width
        this.progressElement.style.width = `${progressPercent}%`;
    }
    
    /**
     * Get current awareness level
     * @returns {number} Current level
     */
    getLevel() {
        return this.currentLevel;
    }
    
    /**
     * Get current progress percentage to next level
     * @returns {number} Progress percentage (0-100)
     */
    getProgressPercentage() {
        return (this.currentXP / this.xpToNextLevel) * 100;
    }
    
    /**
     * Get remaining XP needed for next level
     * @returns {number} XP needed
     */
    getXPToNextLevel() {
        return this.xpToNextLevel - this.currentXP;
    }
    
    /**
     * Set the progress directly (mainly for initialization)
     * @param {number} level - Level to set
     * @param {number} xp - Current XP within that level
     */
    setProgress(level, xp) {
        this.currentLevel = Math.min(level, this.maxLevel);
        
        // Calculate XP requirement for the current level
        this.xpToNextLevel = this.getXPRequiredForNextLevel(this.currentLevel);
        
        // Set XP
        this.currentXP = Math.min(xp, this.xpToNextLevel);
        
        // Update display
        this.updateDisplay();
    }
    
    // ===============================
    // Integrated XP Effects Functions
    // ===============================
    
    /**
     * Show XP gain particles
     * @param {number} amount - Amount of XP gained
     */
    showXPGain(amount) {
        // Reference to the meter element
        const meterElement = this.meterElement;
        if (!meterElement) return;
        
        // Get element position
        const rect = meterElement.getBoundingClientRect();
        
        // Create particle text
        const particle = document.createElement('div');
        particle.className = 'xp-particle';
        particle.textContent = `+${amount} XP`;
        particle.style.color = this.options.activeColor;
        
        // Add necessary styles if they don't exist in the CSS
        this.ensureStylesExist();
        
        // Position the particle
        particle.style.position = 'absolute';
        particle.style.left = `${rect.left + rect.width / 2}px`;
        particle.style.top = `${rect.top}px`;
        particle.style.transform = 'translate(-50%, -50%)';
        
        // Add animation
        particle.style.animation = 'float-up 1.5s forwards';
        
        // Add to document
        document.body.appendChild(particle);
        
        // Remove after animation completes
        setTimeout(() => {
            if (particle.parentNode) {
                particle.parentNode.removeChild(particle);
            }
        }, 1500);
    }
    
    /**
     * Show level up effect
     * @param {number} newLevel - The new level
     */
    showLevelUp(newLevel) {
        const meterElement = this.meterElement;
        if (!meterElement) return;
        
        // Add level up class for animation
        meterElement.classList.add('level-up-animation');
        
        // Create level up text
        const levelUpText = document.createElement('div');
        levelUpText.className = 'xp-particle';
        levelUpText.textContent = `LEVEL ${newLevel}!`;
        levelUpText.style.color = '#ffcc00';
        levelUpText.style.fontSize = '16px';
        
        // Get element position
        const rect = meterElement.getBoundingClientRect();
        
        // Position the text
        levelUpText.style.position = 'absolute';
        levelUpText.style.left = `${rect.left + rect.width / 2}px`;
        levelUpText.style.top = `${rect.top - 10}px`;
        levelUpText.style.transform = 'translate(-50%, -50%)';
        
        // Add animation
        levelUpText.style.animation = 'float-up 2s forwards';
        
        // Add to document
        document.body.appendChild(levelUpText);
        
        // Make the eye icon pulse
        const eyeIcon = document.querySelector('.awareness-icon');
        if (eyeIcon) {
            eyeIcon.classList.add('awareness-icon-pulse');
            setTimeout(() => {
                eyeIcon.classList.remove('awareness-icon-pulse');
            }, 800);
        }
        
        // Remove level up animation class after it completes
        setTimeout(() => {
            meterElement.classList.remove('level-up-animation');
        }, 800);
        
        // Remove the text after animation completes
        setTimeout(() => {
            if (levelUpText.parentNode) {
                levelUpText.parentNode.removeChild(levelUpText);
            }
        }, 2000);
    }
    
    /**
     * Ensure necessary CSS styles exist for XP effects
     */
    ensureStylesExist() {
        // Check if styles already exist
        if (document.getElementById('xp-effects-styles')) return;
        
        // Create style element
        const styleElement = document.createElement('style');
        styleElement.id = 'xp-effects-styles';
        
        // Define necessary styles
        styleElement.textContent = `
            /* XP Particles effect */
            .xp-particle {
                position: absolute;
                pointer-events: none;
                font-size: 12px;
                font-weight: bold;
                color: #4e4eb2;
                text-shadow: 0 0 3px rgba(255, 255, 255, 0.7);
                z-index: 1000;
            }
            
            @keyframes float-up {
                0% {
                    opacity: 1;
                    transform: translateY(0) scale(1);
                }
                100% {
                    opacity: 0;
                    transform: translateY(-30px) scale(1.2);
                }
            }
            
            /* Animations for level up */
            @keyframes level-up-pulse {
                0% { 
                    box-shadow: 0 0 0 0 rgba(78, 78, 178, 0.7);
                    transform: scale(1);
                }
                50% { 
                    box-shadow: 0 0 0 10px rgba(78, 78, 178, 0);
                    transform: scale(1.05);
                }
                100% { 
                    box-shadow: 0 0 0 0 rgba(78, 78, 178, 0);
                    transform: scale(1);
                }
            }
            
            .level-up-animation {
                animation: level-up-pulse 0.8s 1;
            }
            
            /* Eye icon animation */
            @keyframes eye-pulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.3); }
                100% { transform: scale(1); }
            }
            
            .awareness-icon-pulse {
                animation: eye-pulse 0.8s 1;
            }
        `;
        
        // Add to document head
        document.head.appendChild(styleElement);
    }
}

// Export the meter for other scripts to access
window.AwarenessMeter = AwarenessMeter;