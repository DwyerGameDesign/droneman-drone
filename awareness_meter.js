/**
 * Drone: The Daily Commute
 * Awareness Meter System
 */

class AwarenessMeter {
    constructor(options = {}) {
        // Default options
        this.options = {
            container: document.getElementById('awareness-container'),
            maxLevel: 100,
            segmentSize: 20, // Each segment represents this much awareness
            meterWidth: 200,
            meterHeight: 20,
            activeColor: '#4e4eb2',
            inactiveColor: '#3a3a3a',
            borderColor: '#666',
            animationDuration: 800,
            onSegmentFilled: null, // Callback when a segment is filled
            ...options
        };
        
        this.currentLevel = 0;
        this.prevSegmentCount = 0;
        this.meterElement = null;
        this.segmentElements = [];
        
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
        this.meterElement.style.display = 'flex';
        
        // Number of segments based on maxLevel and segmentSize
        const numSegments = Math.ceil(this.options.maxLevel / this.options.segmentSize);
        
        // Create segments
        for (let i = 0; i < numSegments; i++) {
            const segment = document.createElement('div');
            segment.className = 'awareness-segment';
            segment.style.flex = '1';
            segment.style.height = '100%';
            segment.style.margin = '0 1px';
            segment.style.backgroundColor = this.options.inactiveColor;
            segment.style.transition = `background-color ${this.options.animationDuration}ms ease-in-out`;
            
            this.meterElement.appendChild(segment);
            this.segmentElements.push(segment);
        }
        
        // Add the meter to the container
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
     * Update the meter to reflect current awareness level
     * @param {number} level - Current awareness level
     */
    update(level) {
        // Store previous level for comparison
        const prevLevel = this.currentLevel;
        this.currentLevel = Math.min(level, this.options.maxLevel);
        
        // Calculate active segments
        const activeSegments = Math.ceil(this.currentLevel / this.options.segmentSize);
        
        // Update segment colors
        this.segmentElements.forEach((segment, index) => {
            if (index < activeSegments) {
                // Calculate how filled this segment is (partial fill for current segment)
                let fillPercent = 100;
                if (index === activeSegments - 1) {
                    // Last active segment might be partially filled
                    const remainder = this.currentLevel % this.options.segmentSize;
                    fillPercent = remainder === 0 ? 100 : (remainder / this.options.segmentSize) * 100;
                }
                
                // Apply gradient to simulate filling
                const color = this.options.activeColor;
                if (fillPercent < 100) {
                    segment.style.background = `linear-gradient(to right, 
                        ${color} ${fillPercent}%, 
                        ${this.options.inactiveColor} ${fillPercent}%)`;
                } else {
                    segment.style.backgroundColor = color;
                }
            } else {
                segment.style.backgroundColor = this.options.inactiveColor;
            }
        });
        
        // Check if we've filled a new segment
        const currentSegmentCount = Math.floor(this.currentLevel / this.options.segmentSize);
        if (currentSegmentCount > this.prevSegmentCount && this.options.onSegmentFilled) {
            this.options.onSegmentFilled(currentSegmentCount, this.prevSegmentCount);
        }
        this.prevSegmentCount = currentSegmentCount;
    }
    
    /**
     * Get the number of filled segments
     * @returns {number} Number of filled segments
     */
    getFilledSegments() {
        return Math.floor(this.currentLevel / this.options.segmentSize);
    }
    
    /**
     * Get the total number of segments
     * @returns {number} Total segments
     */
    getTotalSegments() {
        return this.segmentElements.length;
    }
}