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
        this.currentLevel = 1;     // Current level (starts at 1)
        this.maxLevel = 10;        // Maximum achievable level
        this.xpToNextLevel = this.getXPRequiredForNextLevel(this.currentLevel);
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
        // Use hardcoded values from config if available
        if (AWARENESS_CONFIG.xpRequirements && 
            Array.isArray(AWARENESS_CONFIG.xpRequirements) && 
            level < AWARENESS_CONFIG.xpRequirements.length &&
            AWARENESS_CONFIG.xpRequirements[level]) {
            return AWARENESS_CONFIG.xpRequirements[level];
        }
        
        // Fallback to calculated value if not defined in config
        const baseXP = 100;
        const scalingFactor = 1.5;
        
        // Scale XP requirements using formula
        return Math.floor(baseXP * Math.pow(scalingFactor, level - 1));
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
        
        // Update display
        this.updateDisplay();
        
        // If level increased and callback exists, call it
        if (leveledUp && this.options.onLevelUp) {
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
}

// Export the meter for other scripts to access
window.AwarenessMeter = AwarenessMeter;