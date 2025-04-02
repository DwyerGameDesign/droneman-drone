/**
 * Drone: The Daily Commute
 * Doober Visual Feedback System
 * 
 * This file implements the doober animation that flies from a
 * discovered change to the awareness meter.
 */

class DooberSystem {
    constructor(options = {}) {
        // Default options
        this.options = {
            container: document.body,
            size: 15,
            color: '#4e4eb2',
            glowColor: 'rgba(78, 78, 178, 0.6)',
            duration: 1000,
            easing: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
            count: 3,
            ...options
        };
        
        this.initialized = false;
        this.init();
    }
    
    /**
     * Initialize the doober system
     */
    init() {
        // Create a container for doobers if using a specific container
        if (this.options.container !== document.body) {
            // Make sure the container has position relative or absolute
            const position = window.getComputedStyle(this.options.container).position;
            if (position !== 'relative' && position !== 'absolute' && position !== 'fixed') {
                this.options.container.style.position = 'relative';
            }
        }
        
        this.initialized = true;
    }
    
    /**
     * Create a doober animation from an element to the awareness meter
     * @param {HTMLElement} sourceElement - The element where the doober starts
     * @param {HTMLElement} targetElement - The target element (awareness meter)
     */
    createDoober(sourceElement, targetElement) {
        if (!this.initialized) {
            this.init();
        }
        
        // Get source and target positions
        const sourceRect = sourceElement.getBoundingClientRect();
        const targetRect = targetElement.getBoundingClientRect();
        
        // Get positions relative to container
        const containerRect = this.options.container.getBoundingClientRect();
        
        // Calculate start and end positions
        const startX = sourceRect.left + sourceRect.width / 2 - containerRect.left;
        const startY = sourceRect.top + sourceRect.height / 2 - containerRect.top;
        const endX = targetRect.left + targetRect.width / 2 - containerRect.left;
        const endY = targetRect.top + targetRect.height / 2 - containerRect.top;
        
        // Create multiple doobers for a more dynamic effect
        for (let i = 0; i < this.options.count; i++) {
            setTimeout(() => {
                this._createSingleDoober(startX, startY, endX, endY, i);
            }, i * 150); // Stagger the animations
        }
    }
    
    /**
     * Create a single doober particle
     * @private
     */
    _createSingleDoober(startX, startY, endX, endY, index) {
        // Create doober element
        const doober = document.createElement('div');
        doober.className = 'doober';
        
        // Apply styles
        Object.assign(doober.style, {
            position: 'absolute',
            width: `${this.options.size}px`,
            height: `${this.options.size}px`,
            backgroundColor: this.options.color,
            borderRadius: '50%',
            boxShadow: `0 0 10px ${this.options.glowColor}`,
            zIndex: 1000,
            pointerEvents: 'none',
            left: `${startX}px`,
            top: `${startY}px`,
            transition: `all ${this.options.duration}ms ${this.options.easing}`,
            opacity: 0,
            transform: 'scale(0.5)'
        });
        
        // Add to container
        this.options.container.appendChild(doober);
        
        // Add slight randomness to the path
        const randomOffsetX = (Math.random() - 0.5) * 50;
        const randomOffsetY = (Math.random() - 0.5) * 50;
        
        // Define the control point for a curved path
        const controlX = startX + (endX - startX) * 0.5 + randomOffsetX;
        const controlY = startY + (endY - startY) * 0.3 + randomOffsetY;
        
        // Animate using keyframes for a curved path
        const keyframes = [
            { // Start
                offset: 0,
                opacity: 1,
                transform: 'scale(0.5)',
                left: `${startX}px`,
                top: `${startY}px`
            },
            { // Control point
                offset: 0.5,
                opacity: 1,
                transform: 'scale(1.2)',
                left: `${controlX}px`,
                top: `${controlY}px`
            },
            { // End
                offset: 1,
                opacity: 0,
                transform: 'scale(0.5)',
                left: `${endX}px`,
                top: `${endY}px`
            }
        ];
        
        // Apply animation
        const animation = doober.animate(keyframes, {
            duration: this.options.duration,
            easing: this.options.easing,
            fill: 'forwards'
        });
        
        // Clean up after animation
        animation.onfinish = () => {
            if (doober.parentNode) {
                doober.parentNode.removeChild(doober);
            }
        };
    }
}

// Initialize doober system when DOM is loaded
let dooberSystem;

function initDooberSystem() {
    dooberSystem = new DooberSystem({
        container: document.body,
        color: '#4e4eb2',
        glowColor: 'rgba(78, 78, 178, 0.6)',
        duration: 1200
    });
    
    console.log("Doober system initialized");
}

// Add doober animation when a change is found
function animateDooberToAwarenessMeter(sourceElement) {
    if (!dooberSystem) {
        initDooberSystem();
    }
    
    const awarenessContainer = document.getElementById('awareness-container');
    if (awarenessContainer && sourceElement) {
        dooberSystem.createDoober(sourceElement, awarenessContainer);
    }
}

// Export to window object
window.dooberSystem = {
    init: initDooberSystem,
    animate: animateDooberToAwarenessMeter
};