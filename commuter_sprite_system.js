/**
 * Drone: The Daily Commute
 * Sprite Sheet System using predesigned pixel art
 */

class CommuterSpriteSystem {
    constructor(options = {}) {
        // Default options
        this.options = {
            spriteSheetPath: 'assets/commuter-sprites.png', // Path to the sprite sheet
            container: document.getElementById('scene-container'),
            spriteScale: 2, // Scale of sprites (multiplier)
            ...options
        };
        
        this.commuters = [];
        this.spriteSheet = null;
        this.spriteParts = {
            head: { x: 0, y: 0, width: 32, height: 32 },
            body: { x: 32, y: 0, width: 32, height: 48 },
            leftArm: { x: 64, y: 0, width: 16, height: 48 },
            rightArm: { x: 80, y: 0, width: 16, height: 48 },
            leftLeg: { x: 96, y: 0, width: 16, height: 48 },
            rightLeg: { x: 112, y: 0, width: 16, height: 48 },
            briefcase: { x: 128, y: 0, width: 32, height: 32 }
        };
        
        // Load the sprite sheet
        this.loadSpriteSheet();
    }
    
    /**
     * Load the sprite sheet image
     */
    loadSpriteSheet() {
        return new Promise((resolve, reject) => {
            this.spriteSheet = new Image();
            this.spriteSheet.src = this.options.spriteSheetPath;
            
            this.spriteSheet.onload = () => {
                console.log('Sprite sheet loaded successfully');
                resolve(this.spriteSheet);
            };
            
            this.spriteSheet.onerror = (err) => {
                console.error('Error loading sprite sheet:', err);
                reject(err);
            };
        });
    }
    
    /**
     * Create a commuter using parts from the sprite sheet
     * @param {Object} options - Configuration for the commuter
     * @returns {Object} - The created commuter object
     */
    createCommuter(options = {}) {
        // Default commuter options
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
        
        // Merge with provided options
        const config = this._mergeDeep(defaultOptions, options);
        
        // Create the container element
        const commuterElement = document.createElement('div');
        commuterElement.id = config.id;
        commuterElement.className = 'commuter-sprite';
        commuterElement.style.position = 'absolute';
        commuterElement.style.left = `${config.x}px`;
        commuterElement.style.bottom = `${config.y}px`;
        commuterElement.style.width = `${32 * this.options.spriteScale}px`;
        commuterElement.style.height = `${96 * this.options.spriteScale}px`;
        commuterElement.style.transform = config.facingLeft ? 'scaleX(-1)' : '';
        commuterElement.style.zIndex = '10';
        commuterElement.style.cursor = 'pointer';
        
        // Create each body part
        for (const partName in config.parts) {
            if (config.parts[partName].visible) {
                const partElement = this._createSpritePart(partName, config.parts[partName]);
                if (partElement) {
                    commuterElement.appendChild(partElement);
                }
            }
        }
        
        // Add to container
        if (this.options.container) {
            this.options.container.appendChild(commuterElement);
        }
        
        // Store commuter data
        const commuter = {
            id: config.id,
            element: commuterElement,
            config: config
        };
        
        this.commuters.push(commuter);
        return commuter;
    }
    
    /**
     * Create a single sprite part as a div with background image
     * @param {string} partName - Name of the part to create
     * @param {Object} partConfig - Configuration for this part
     * @returns {HTMLElement} - The created part element
     */
    _createSpritePart(partName, partConfig) {
        const spritePart = this.spriteParts[partName];
        if (!spritePart) return null;
        
        const partElement = document.createElement('div');
        partElement.className = `commuter-part commuter-${partName}`;
        partElement.style.position = 'absolute';
        partElement.style.backgroundImage = `url(${this.options.spriteSheetPath})`;
        partElement.style.backgroundRepeat = 'no-repeat';
        partElement.style.imageRendering = 'pixelated';
        
        // Set background position based on sprite sheet coordinates
        partElement.style.backgroundPosition = `-${spritePart.x}px -${spritePart.y}px`;
        
        // Set dimensions based on the sprite part size
        partElement.style.width = `${spritePart.width * this.options.spriteScale}px`;
        partElement.style.height = `${spritePart.height * this.options.spriteScale}px`;
        
        // Position each part appropriately
        switch (partName) {
            case 'head':
                partElement.style.top = '0px';
                partElement.style.left = '0px';
                break;
            case 'body':
                partElement.style.top = `${32 * this.options.spriteScale}px`;
                partElement.style.left = '0px';
                break;
            case 'leftArm':
                partElement.style.top = `${32 * this.options.spriteScale}px`;
                partElement.style.left = `-${16 * this.options.spriteScale}px`;
                break;
            case 'rightArm':
                partElement.style.top = `${32 * this.options.spriteScale}px`;
                partElement.style.left = `${32 * this.options.spriteScale}px`;
                break;
            case 'leftLeg':
                partElement.style.top = `${80 * this.options.spriteScale}px`;
                partElement.style.left = '0px';
                break;
            case 'rightLeg':
                partElement.style.top = `${80 * this.options.spriteScale}px`;
                partElement.style.left = `${16 * this.options.spriteScale}px`;
                break;
            case 'briefcase':
                partElement.style.top = `${48 * this.options.spriteScale}px`;
                partElement.style.left = `-${32 * this.options.spriteScale}px`;
                break;
        }
        
        // Apply any custom styles from the config
        if (partConfig.styles) {
            Object.assign(partElement.style, partConfig.styles);
        }
        
        return partElement;
    }
    
    /**
     * Update an existing commuter
     * @param {string} id - ID of the commuter to update
     * @param {Object} options - New configuration options
     */
    updateCommuter(id, options = {}) {
        const commuter = this.commuters.find(c => c.id === id);
        if (!commuter) return null;
        
        // Remove from DOM
        if (commuter.element.parentNode) {
            commuter.element.parentNode.removeChild(commuter.element);
        }
        
        // Remove from our array
        this.commuters = this.commuters.filter(c => c.id !== id);
        
        // Create a new commuter with updated options
        const updatedConfig = this._mergeDeep(commuter.config, options);
        return this.createCommuter(updatedConfig);
    }
    
    /**
     * Make a commuter clickable
     * @param {string} id - ID of the commuter
     * @param {Function} callback - Click handler function
     */
    makeClickable(id, callback) {
        const commuter = this.commuters.find(c => c.id === id);
        if (commuter) {
            commuter.element.addEventListener('click', (event) => {
                event.stopPropagation();
                callback(commuter, event);
            });
        }
    }
    
    /**
     * Create multiple commuters at once
     * @param {number} count - Number of commuters to create
     * @param {Object} baseOptions - Base options for all commuters
     * @returns {Array} - Array of created commuters
     */
    createCrowd(count, baseOptions = {}) {
        const crowd = [];
        const containerWidth = this.options.container ? this.options.container.offsetWidth : 800;
        const spacing = containerWidth / (count + 1);
        
        for (let i = 0; i < count; i++) {
            const options = {
                ...baseOptions,
                id: `commuter-${this.commuters.length}`,
                x: spacing * (i + 1),
                facingLeft: Math.random() > 0.5,
                parts: {
                    head: { visible: true },
                    body: { visible: true },
                    leftArm: { visible: true },
                    rightArm: { visible: true },
                    leftLeg: { visible: true },
                    rightLeg: { visible: true },
                    briefcase: { visible: Math.random() > 0.5 }
                }
            };
            
            const commuter = this.createCommuter(options);
            crowd.push(commuter);
        }
        
        return crowd;
    }
    
    /**
     * Deep merge two objects
     * @private
     */
    _mergeDeep(target, source) {
        const output = Object.assign({}, target);
        
        if (this._isObject(target) && this._isObject(source)) {
            Object.keys(source).forEach(key => {
                if (this._isObject(source[key])) {
                    if (!(key in target)) {
                        Object.assign(output, { [key]: source[key] });
                    } else {
                        output[key] = this._mergeDeep(target[key], source[key]);
                    }
                } else {
                    Object.assign(output, { [key]: source[key] });
                }
            });
        }
        
        return output;
    }
    
    /**
     * Check if value is an object
     * @private
     */
    _isObject(item) {
        return (item && typeof item === 'object' && !Array.isArray(item));
    }
}