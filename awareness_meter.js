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
        
        this.currentXP = 0;        // Current XP points within current level
        this.currentLevel = 1;     // Current level (starts at 1)
        this.maxLevel = options.maxLevel || AWARENESS_CONFIG.maxLevel || 10;
        
        // Get XP needed for next level
        this.xpToNextLevel = AWARENESS_CONFIG.xpRequirements[this.currentLevel];
        
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
        
        console.log(`[ADD XP] Added ${amount} XP. Now at Level ${this.currentLevel}: ${this.currentXP}/${this.xpToNextLevel} XP`);
        
        // Check if we've gained a level
        let leveledUp = false;
        
        // Check if we need to level up (possibly multiple times)
        while (this.currentXP >= this.xpToNextLevel && this.currentLevel < this.maxLevel) {
            // Level up
            this.currentLevel++;
            
            // Calculate excess XP after level up
            const excessXP = this.currentXP - this.xpToNextLevel;
            
            console.log(`[LEVEL UP] ${previousLevel} -> ${this.currentLevel} with ${excessXP} excess XP`);
            
            // Reset XP to excess amount
            this.currentXP = excessXP;
            
            // Update XP needed for next level
            this.xpToNextLevel = AWARENESS_CONFIG.xpRequirements[this.currentLevel];
            
            console.log(`[NEW LEVEL] ${this.currentLevel}: Need ${this.xpToNextLevel} XP for next level, have ${this.currentXP} XP`);
            
            leveledUp = true;
        }
        
        // Cap XP at max for highest level
        if (this.currentLevel >= this.maxLevel) {
            this.currentXP = Math.min(this.currentXP, this.xpToNextLevel || 0);
        }
        
        // Update display with animation sequence
        if (leveledUp) {
            // First, fill the bar to 100%
            this.progressElement.style.transition = 'width 0.8s ease-in-out';
            this.progressElement.style.width = '100%';
            
            // After bar fills, show level up text
            setTimeout(() => {
                // Show level up effect
                if (window.xpEffects && window.xpEffects.showLevelUp) {
                    window.xpEffects.showLevelUp(this.meterElement, this.currentLevel);
                }
                
                // After level up text appears, update level and reset bar
                setTimeout(() => {
                    // Update level text
                    this.levelDisplay.textContent = `Level ${this.currentLevel}`;
                    
                    // Reset bar to new level's progress
                    const progressPercent = this.xpToNextLevel > 0 ? (this.currentXP / this.xpToNextLevel) * 100 : 100;
                    const cappedProgress = Math.min(Math.max(0, progressPercent), 100);
                    this.progressElement.style.width = `${cappedProgress}%`;
                    
                    // If level increased and callback exists, call it after a delay
                    if (this.options.onLevelUp) {
                        setTimeout(() => {
                            this.options.onLevelUp(this.currentLevel, previousLevel);
                        }, 2000); // 2 second delay
                    }
                }, 1000); // Wait for level up text to start floating
            }, 800); // Wait for bar fill animation to complete
        } else {
            // Normal progress update
            this.updateDisplay();
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
        const progressPercent = this.xpToNextLevel > 0 ? (this.currentXP / this.xpToNextLevel) * 100 : 100;
        const cappedProgress = Math.min(Math.max(0, progressPercent), 100); // Keep between 0-100%
        
        console.log(`[METER] Level ${this.currentLevel}: ${this.currentXP}/${this.xpToNextLevel} XP (${cappedProgress.toFixed(1)}%)`);
        
        // Update progress bar width
        this.progressElement.style.width = `${cappedProgress}%`;
    }
    
    /**
     * Set the progress directly (mainly for initialization)
     * @param {number} level - Level to set
     * @param {number} levelXP - Current XP amount within the level
     */
    setProgress(level, levelXP) {
        // Guard against invalid levels
        this.currentLevel = Math.max(1, Math.min(level, this.maxLevel));
        
        // Store current XP
        this.currentXP = Math.max(0, levelXP);
        
        // Get XP needed for current level's next level-up
        this.xpToNextLevel = AWARENESS_CONFIG.xpRequirements[this.currentLevel];
        
        console.log(`[SET PROGRESS] Level ${this.currentLevel}: ${this.currentXP}/${this.xpToNextLevel} XP`);
        
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