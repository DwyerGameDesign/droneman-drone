/**
 * Drone: The Daily Commute
 * Shader Effects System
 * 
 * This file implements visual shader effects for the game scene,
 * particularly when a segment is filled and a new commuter is introduced.
 */

class ShaderEffects {
    constructor(options = {}) {
        // Default options
        this.options = {
            container: document.getElementById('scene-container'),
            duration: 3000,
            transitionDuration: 800,
            ...options
        };
        
        this.effectElement = null;
        this.init();
    }
    
    /**
     * Initialize the shader effects system
     */
    init() {
        if (!this.options.container) {
            console.error("Scene container not found for shader effects");
            return;
        }
        
        // Create shader overlay element
        this.effectElement = document.createElement('div');
        this.effectElement.className = 'shader-effect-overlay';
        this.effectElement.style.position = 'absolute';
        this.effectElement.style.top = '0';
        this.effectElement.style.left = '0';
        this.effectElement.style.width = '100%';
        this.effectElement.style.height = '100%';
        this.effectElement.style.pointerEvents = 'none';
        this.effectElement.style.zIndex = '50';
        this.effectElement.style.opacity = '0';
        this.effectElement.style.transition = `opacity ${this.options.transitionDuration}ms ease-in-out`;
        
        // Add shader effect styles to document
        if (!document.getElementById('shader-effect-styles')) {
            const styleElement = document.createElement('style');
            styleElement.id = 'shader-effect-styles';
            styleElement.textContent = `
                @keyframes ripple-effect {
                    0% {
                        box-shadow: 0 0 0 0 rgba(78, 78, 178, 0.3), 
                                    0 0 0 10px rgba(78, 78, 178, 0.3), 
                                    0 0 0 30px rgba(78, 78, 178, 0.2);
                        background: radial-gradient(circle, rgba(78, 78, 178, 0.5) 0%, rgba(78, 78, 178, 0.2) 70%, rgba(0, 0, 0, 0) 100%);
                    }
                    100% {
                        box-shadow: 0 0 0 10px rgba(78, 78, 178, 0.3), 
                                    0 0 0 30px rgba(78, 78, 178, 0.2), 
                                    0 0 0 50px rgba(78, 78, 178, 0);
                        background: radial-gradient(circle, rgba(78, 78, 178, 0.2) 0%, rgba(78, 78, 178, 0.1) 70%, rgba(0, 0, 0, 0) 100%);
                    }
                }
                
                @keyframes wave-effect {
                    0% {
                        background-position: 0% 50%;
                    }
                    50% {
                        background-position: 100% 50%;
                    }
                    100% {
                        background-position: 0% 50%;
                    }
                }
                
                .shader-ripple {
                    animation: ripple-effect 2s infinite alternate ease-in-out;
                }
                
                .shader-wave {
                    background: linear-gradient(120deg, 
                        rgba(78, 78, 178, 0.1) 0%, 
                        rgba(78, 78, 178, 0.2) 25%, 
                        rgba(78, 78, 178, 0.3) 50%, 
                        rgba(78, 78, 178, 0.2) 75%, 
                        rgba(78, 78, 178, 0.1) 100%);
                    background-size: 200% 200%;
                    animation: wave-effect 3s infinite linear;
                }
                
                .shader-glitch {
                    position: relative;
                    overflow: hidden;
                }
                
                .shader-glitch::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: -100%;
                    width: 300%;
                    height: 100%;
                    background: linear-gradient(90deg, 
                        rgba(78, 78, 178, 0) 0%, 
                        rgba(78, 78, 178, 0.2) 45%, 
                        rgba(78, 78, 178, 0.4) 50%, 
                        rgba(78, 78, 178, 0.2) 55%, 
                        rgba(78, 78, 178, 0) 100%);
                    animation: glitch-slide 3s infinite linear;
                }
                
                @keyframes glitch-slide {
                    0% {
                        transform: translateX(0);
                    }
                    100% {
                        transform: translateX(33.33%);
                    }
                }
                
                .shader-pulse {
                    animation: shader-pulse 2s infinite;
                }
                
                @keyframes shader-pulse {
                    0% {
                        box-shadow: inset 0 0 20px rgba(78, 78, 178, 0.3);
                    }
                    50% {
                        box-shadow: inset 0 0 50px rgba(78, 78, 178, 0.5);
                    }
                    100% {
                        box-shadow: inset 0 0 20px rgba(78, 78, 178, 0.3);
                    }
                }
                
                .new-commuter-fade-in {
                    opacity: 0;
                    animation: fade-in 2s forwards;
                    animation-delay: 1s;
                }
                
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(10px) scale(0.95); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
            `;
            document.head.appendChild(styleElement);
        }
        
        // Add to container
        this.options.container.appendChild(this.effectElement);
        console.log("Shader effects system initialized");
    }
    
    /**
     * Play shader effect for segment completion
     * @param {string} effectType - Type of effect to play (ripple, wave, glitch, pulse)
     * @param {function} callback - Callback function when effect completes
     */
    playEffect(effectType = 'wave', callback = null) {
        if (!this.effectElement) {
            this.init();
        }
        
        // Reset any existing classes
        this.effectElement.className = 'shader-effect-overlay';
        
        // Add the specified effect class
        this.effectElement.classList.add(`shader-${effectType}`);
        
        // Show the effect
        this.effectElement.style.opacity = '1';
        
        // Set timeout to hide the effect
        setTimeout(() => {
            this.effectElement.style.opacity = '0';
            
            // Wait for transition to complete, then reset
            setTimeout(() => {
                this.effectElement.className = 'shader-effect-overlay';
                
                // Call callback if provided
                if (callback && typeof callback === 'function') {
                    callback();
                }
            }, this.options.transitionDuration);
        }, this.options.duration);
        
        return this;
    }
    
    /**
     * Add class to new commuter for fade-in effect
     * @param {HTMLElement} commuterElement - The new commuter element to animate
     */
    animateNewCommuter(commuterElement) {
        if (!commuterElement) return;
        
        // Add fade-in class
        commuterElement.classList.add('new-commuter-fade-in');
        
        // Remove class after animation completes
        setTimeout(() => {
            commuterElement.classList.remove('new-commuter-fade-in');
        }, 3000);
    }
}

// Initialize shader effects when DOM is loaded
let shaderEffects;

function initShaderEffects() {
    shaderEffects = new ShaderEffects({
        container: document.getElementById('scene-container'),
        duration: 3500,
        transitionDuration: 800
    });
    
    console.log("Shader effects initialized");
}

/**
 * Play segment completion effect
 * @param {string} effectType - Type of effect to play
 * @param {function} callback - Callback function when effect completes
 */
function playSegmentCompletionEffect(effectType = 'wave', callback = null) {
    if (!shaderEffects) {
        initShaderEffects();
    }
    
    // Hide train button
    const trainButton = document.getElementById('train-button');
    if (trainButton) {
        trainButton.style.display = 'none';
    }
    
    // Play effect
    shaderEffects.playEffect(effectType, () => {
        // Show train button again after effect completes
        if (trainButton) {
            trainButton.style.display = 'block';
        }
        
        // Call provided callback
        if (callback && typeof callback === 'function') {
            callback();
        }
    });
}

/**
 * Animate new commuter with fade-in effect
 * @param {HTMLElement} commuterElement - The new commuter element
 */
function animateNewCommuter(commuterElement) {
    if (!shaderEffects) {
        initShaderEffects();
    }
    
    shaderEffects.animateNewCommuter(commuterElement);
}

// Export functions
window.shaderEffects = {
    init: initShaderEffects,
    playEffect: playSegmentCompletionEffect,
    animateNewCommuter: animateNewCommuter
};