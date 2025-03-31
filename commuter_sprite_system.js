/**
 * Drone: The Daily Commute
 * Individual Sprite System - Optimized Version
 */

class CommuterSpriteSystem {
    constructor(options = {}) {
        // Default options
        this.options = {
            spritePath: 'assets/sprites/',
            container: document.getElementById('scene-container'),
            spriteScale: 1,
            ...options
        };
        
        this.commuters = [];
        this.spriteCache = new Map(); // Cache for loaded images
        this.spriteParts = {
            head: { 
                src: 'head.png',
                width: 32,
                height: 32,
                position: { x: 0, y: 0 }
            },
            body: { 
                src: 'body.png',
                width: 32,
                height: 48,
                position: { x: 0, y: 32 }
            },
            leftArm: { 
                src: 'left-arm.png',
                width: 16,
                height: 48,
                position: { x: -16, y: 32 }
            },
            rightArm: { 
                src: 'right-arm.png',
                width: 16,
                height: 48,
                position: { x: 32, y: 32 }
            },
            leftLeg: { 
                src: 'left-leg.png',
                width: 16,
                height: 48,
                position: { x: 0, y: 80 }
            },
            rightLeg: { 
                src: 'right-leg.png',
                width: 16,
                height: 48,
                position: { x: 16, y: 80 }
            },
            briefcase: { 
                src: 'briefcase.png',
                width: 32,
                height: 32,
                position: { x: -32, y: 48 }
            }
        };

        // Preload all sprite images
        this.preloadSprites();
        
        // Set up event delegation
        if (this.options.container) {
            this.options.container.addEventListener('click', this.handleClick.bind(this));
        }
    }

    /**
     * Preload all sprite images
     */
    async preloadSprites() {
        const loadPromises = Object.entries(this.spriteParts).map(([key, part]) => {
            return new Promise((resolve, reject) => {
                const img = new Image();
                img.onload = () => {
                    this.spriteCache.set(key, img);
                    resolve();
                };
                img.onerror = reject;
                img.src = this.options.spritePath + part.src;
            });
        });

        try {
            await Promise.all(loadPromises);
            console.log('All sprites preloaded successfully');
        } catch (error) {
            console.error('Error preloading sprites:', error);
        }
    }

    /**
     * Create a commuter using individual sprite images
     */
    createCommuter(options = {}) {
        const defaultOptions = {
            id: `commuter-${this.commuters.length}`,
            x: 0,
            y: 0,
            parts: {
                head: { visible: true },
                body: { visible: true },
                leftArm: { visible: true },
                rightArm: { visible: true },
                leftLeg: { visible: true },
                rightLeg: { visible: true },
                briefcase: { visible: Math.random() > 0.5 }
            },
            facingLeft: Math.random() > 0.5
        };
        
        const config = this._mergeDeep(defaultOptions, options);
        
        // Create container with a single DOM operation
        const commuterElement = document.createElement('div');
        commuterElement.id = config.id;
        commuterElement.className = 'commuter-sprite';
        commuterElement.dataset.commuterId = config.id;
        
        // Set all styles at once
        Object.assign(commuterElement.style, {
            position: 'absolute',
            left: `${config.x}px`,
            bottom: `${config.y}px`,
            width: `${32 * this.options.spriteScale}px`,
            height: `${128 * this.options.spriteScale}px`,
            transform: config.facingLeft ? 'scaleX(-1)' : '',
            zIndex: '10',
            cursor: 'pointer'
        });
        
        // Create all parts in a single batch
        const fragment = document.createDocumentFragment();
        for (const [partName, partConfig] of Object.entries(config.parts)) {
            if (partConfig.visible) {
                const partElement = this._createSpritePart(partName, partConfig);
                if (partElement) {
                    fragment.appendChild(partElement);
                }
            }
        }
        
        commuterElement.appendChild(fragment);
        
        // Single DOM operation to add the commuter
        if (this.options.container) {
            this.options.container.appendChild(commuterElement);
        }
        
        const commuter = {
            id: config.id,
            element: commuterElement,
            config: config
        };
        
        this.commuters.push(commuter);
        return commuter;
    }
    
    /**
     * Create a single sprite part as an img element
     */
    _createSpritePart(partName, partConfig) {
        const spritePart = this.spriteParts[partName];
        if (!spritePart) return null;
        
        const partElement = document.createElement('div');
        partElement.className = `commuter-part commuter-${partName}`;
        
        // Use cached image if available
        const img = this.spriteCache.get(partName) || new Image();
        img.src = this.options.spritePath + spritePart.src;
        
        // Set all styles at once
        Object.assign(partElement.style, {
            position: 'absolute',
            width: `${spritePart.width * this.options.spriteScale}px`,
            height: `${spritePart.height * this.options.spriteScale}px`,
            left: `${spritePart.position.x * this.options.spriteScale}px`,
            top: `${spritePart.position.y * this.options.spriteScale}px`
        });
        
        // Apply custom styles if any
        if (partConfig.styles) {
            Object.assign(partElement.style, partConfig.styles);
        }
        
        partElement.appendChild(img);
        return partElement;
    }
    
    /**
     * Handle click events using event delegation
     */
    handleClick(event) {
        const commuterElement = event.target.closest('.commuter-sprite');
        if (!commuterElement) return;
        
        const commuterId = commuterElement.dataset.commuterId;
        const commuter = this.commuters.find(c => c.id === commuterId);
        
        if (commuter && commuter.onClick) {
            commuter.onClick(commuter, event);
        }
    }
    
    /**
     * Make a commuter clickable
     */
    makeClickable(id, callback) {
        const commuter = this.commuters.find(c => c.id === id);
        if (commuter) {
            commuter.onClick = callback;
        }
    }
    
    /**
     * Update an existing commuter
     */
    updateCommuter(id, options = {}) {
        const commuter = this.commuters.find(c => c.id === id);
        if (!commuter) return null;
        
        // Remove old element
        commuter.element.remove();
        
        // Remove from array
        this.commuters = this.commuters.filter(c => c.id !== id);
        
        // Create new commuter with updated options
        const updatedConfig = this._mergeDeep(commuter.config, options);
        return this.createCommuter(updatedConfig);
    }
    
    /**
     * Create multiple commuters at once
     */
    createCrowd(count, baseOptions = {}) {
        const crowd = [];
        const containerWidth = this.options.container ? this.options.container.offsetWidth : 800;
        const spacing = containerWidth / (count + 1);
        
        // Create all commuters in a single batch
        const fragment = document.createDocumentFragment();
        
        for (let i = 0; i < count; i++) {
            const options = {
                ...baseOptions,
                id: `commuter-${this.commuters.length}`,
                x: spacing * (i + 1),
                facingLeft: Math.random() > 0.5
            };
            
            const commuter = this.createCommuter(options);
            if (commuter) {
                crowd.push(commuter);
                fragment.appendChild(commuter.element);
            }
        }
        
        // Single DOM operation to add all commuters
        if (this.options.container) {
            this.options.container.appendChild(fragment);
        }
        
        return crowd;
    }
    
    /**
     * Clean up resources
     */
    dispose() {
        // Remove all commuters
        this.commuters.forEach(commuter => {
            commuter.element.remove();
        });
        this.commuters = [];
        
        // Clear sprite cache
        this.spriteCache.clear();
        
        // Remove event listener
        if (this.options.container) {
            this.options.container.removeEventListener('click', this.handleClick);
        }
    }
    
    // ... keep existing utility methods (_mergeDeep, etc.) ...
} 