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
        this.maxLevel = options.maxLevel || AWARENESS_CONFIG.maxLevel || 10;
        
        // Get XP requirements from config
        const xpRequirements = AWARENESS_CONFIG.xpRequirements;
        
        // XP needed to reach the next level (level 1 → level 2) is at index 1
        this.nextLevelRequirement = xpRequirements[this.currentLevel];
        this.currentLevelRequirement = 0; // At level 1, previous requirement is 0
        
        // Calculate XP needed from current level to next level
        this.xpToNextLevel = this.nextLevelRequirement || 50; // Default to 50 if not found
        
        console.log(`[INIT] Level ${this.currentLevel}: XP ${this.currentXP}/${this.xpToNextLevel} needed for next level`);
        
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
     * Get the total XP required to reach a specific level
     * @param {number} level - The level to get requirements for
     * @returns {number} - Total XP required to reach that level
     */
    getXPRequiredForLevel(level) {
        // Use hardcoded values from config if available
        if (AWARENESS_CONFIG.xpRequirements && 
            Array.isArray(AWARENESS_CONFIG.xpRequirements) && 
            level < AWARENESS_CONFIG.xpRequirements.length &&
            AWARENESS_CONFIG.xpRequirements[level] !== undefined) {
            
            // Return the total XP requirement for this level
            const requirement = AWARENESS_CONFIG.xpRequirements[level];
            console.log(`[XP REQ] Total XP required for Level ${level+1}: ${requirement}`);
            return requirement;
        }
        
        // Fallback to calculated value if not defined in config
        const baseXP = 100;
        const scalingFactor = 1.5;
        
        // Scale XP requirements using formula
        const calculatedRequirement = Math.floor(baseXP * Math.pow(scalingFactor, level - 1));
        console.log(`[XP REQ] Calculated XP for Level ${level+1}: ${calculatedRequirement}`);
        return calculatedRequirement;
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
        
        console.log(`[ADD XP] Added ${amount} XP. Now at Level ${this.currentLevel}: ${this.currentXP} XP total`);
        
        // Check if we've gained a level
        let leveledUp = false;
        
        // Get next level requirement
        const xpRequirements = AWARENESS_CONFIG.xpRequirements;
        
        // Check if we need to level up (possibly multiple times)
        while (this.currentXP >= this.nextLevelRequirement && this.currentLevel < this.maxLevel) {
            // Level up
            this.currentLevel++;
            
            console.log(`[LEVEL UP] ${previousLevel} -> ${this.currentLevel}`);
            
            // Update requirements after level up
            this.currentLevelRequirement = this.nextLevelRequirement;
            this.nextLevelRequirement = xpRequirements[this.currentLevel];
            
            // Calculate XP needed for this new level
            this.xpToNextLevel = this.nextLevelRequirement 
                ? this.nextLevelRequirement - this.currentLevelRequirement
                : 100; // Default if not defined
            
            console.log(`[NEW LEVEL] ${this.currentLevel}: XP needed for next level: ${this.xpToNextLevel}, Current XP: ${this.currentXP}`);
            
            leveledUp = true;
        }
        
        // Cap XP at max for highest level
        if (this.currentLevel >= this.maxLevel) {
            this.currentXP = Math.min(this.currentXP, this.nextLevelRequirement || Infinity);
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
        
        // Calculate progress percentage based on current XP relative to level requirements
        const xpInCurrentLevel = this.currentXP - this.currentLevelRequirement;
        const progressPercent = this.xpToNextLevel > 0 ? (xpInCurrentLevel / this.xpToNextLevel) * 100 : 100;
        const cappedProgress = Math.min(Math.max(0, progressPercent), 100); // Keep between 0-100%
        
        console.log(`[METER] Level: ${this.currentLevel}, XP: ${this.currentXP}, Min XP for this level: ${this.currentLevelRequirement}, XP for next level: ${this.nextLevelRequirement}, XP needed: ${this.xpToNextLevel}, Progress: ${cappedProgress.toFixed(1)}%`);
        
        // Update progress bar width
        this.progressElement.style.width = `${cappedProgress}%`;
    }
    
    /**
     * Set the progress directly (mainly for initialization)
     * @param {number} level - Level to set
     * @param {number} totalXP - Total XP amount
     */
    setProgress(level, totalXP) {
        // Guard against invalid levels
        this.currentLevel = Math.max(1, Math.min(level, this.maxLevel));
        
        // Store current XP
        this.currentXP = Math.max(0, totalXP);
        
        // Get XP requirements from config
        const xpRequirements = AWARENESS_CONFIG.xpRequirements;
        
        // Update requirements for current level
        this.currentLevelRequirement = (this.currentLevel > 1 && xpRequirements[this.currentLevel - 1]) 
            ? xpRequirements[this.currentLevel - 1] 
            : 0;
            
        this.nextLevelRequirement = xpRequirements[this.currentLevel];
        
        // Calculate XP needed for next level
        this.xpToNextLevel = this.nextLevelRequirement 
            ? this.nextLevelRequirement - this.currentLevelRequirement
            : 100; // Default to 100 if not defined
        
        console.log(`[SET PROGRESS] Level: ${this.currentLevel}, XP: ${this.currentXP}, Min XP: ${this.currentLevelRequirement}, Next level req: ${this.nextLevelRequirement}, XP needed: ${this.xpToNextLevel}`);
        
        // Update the display
        this.updateDisplay();
        
        // Force a repaint to ensure the progress bar updates visually
        this.progressElement.offsetHeight;
    }
    
    /**
     * Get current XP value
     * @returns {number} - Current XP
     */
    getCurrentXP() {
        return this.currentXP;
    }
    
    /**
     * Get current level
     * @returns {number} - Current level
     */
    getCurrentLevel() {
        return this.currentLevel;
    }
}

// Export the meter for other scripts to access
window.AwarenessMeter = AwarenessMeter;