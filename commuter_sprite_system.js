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
            spriteScale: 3, // Scale of sprites (multiplier)
            ...options
        };
        
        this.commuters = [];
        this.spriteSheet = null;
        this.spriteParts = {
            hat: { x: 84, y: 0, width: 140, height: 64 },
            head: { x: 628, y: 0, width: 128, height: 128 },
            body: { x: 280, y: 64, width: 210, height: 240 },
            shirt: { x: 628, y: 212, width: 128, height: 128 },
            pants: { x: 628, y: 456, width: 128, height: 128 },
            briefcase: { x: 84, y: 732, width: 154, height: 112 },
            shoe: { x: 476, y: 732, width: 88, height: 112 }
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
                hat: { visible: Math.random() > 0.3 },
                head: { visible: true },
                body: { visible: true },
                shirt: { visible: true },
                pants: { visible: true },
                briefcase: { visible: Math.random() > 0.5 },
                leftShoe: { visible: true },
                rightShoe: { visible: true }
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
        commuterElement.style.width = `${this.spriteParts.body.width * this.options.spriteScale / 4}px`;
        commuterElement.style.height = `${(this.spriteParts.body.height + this.spriteParts.pants.height) * this.options.spriteScale / 4}px`;
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
        // Special case for left/right shoe
        let spritePart;
        if (partName === 'leftShoe' || partName === 'rightShoe') {
            spritePart = this.spriteParts.shoe;
        } else {
            spritePart = this.spriteParts[partName];
        }
        
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
        partElement.style.width = `${spritePart.width * this.options.spriteScale / 4}px`;
        partElement.style.height = `${spritePart.height * this.options.spriteScale / 4}px`;
        
        // Position each part appropriately
        switch (partName) {
            case 'hat':
                partElement.style.top = `-${spritePart.height * this.options.spriteScale / 8}px`;
                partElement.style.left = `-${spritePart.width * this.options.spriteScale / 16}px`;
                break;
            case 'head':
                partElement.style.top = `${this.spriteParts.hat.height * this.options.spriteScale / 8}px`;
                partElement.style.left = `${this.spriteParts.body.width * this.options.spriteScale / 10}px`;
                break;
            case 'body':
                partElement.style.top = `${(this.spriteParts.hat.height + this.spriteParts.head.height) * this.options.spriteScale / 12}px`;
                partElement.style.left = `0px`;
                break;
            case 'shirt':
                partElement.style.top = `${(this.spriteParts.hat.height + this.spriteParts.head.height) * this.options.spriteScale / 8}px`;
                partElement.style.left = `${this.spriteParts.body.width * this.options.spriteScale / 10}px`;
                partElement.style.zIndex = '2'; // Place shirt under body but above pants
                break;
            case 'pants':
                partElement.style.top = `${(this.spriteParts.hat.height + this.spriteParts.head.height + this.spriteParts.body.height) * this.options.spriteScale / 8}px`;
                partElement.style.left = `${this.spriteParts.body.width * this.options.spriteScale / 10}px`;
                break;
            case 'briefcase':
                partElement.style.top = `${(this.spriteParts.hat.height + this.spriteParts.head.height + this.spriteParts.body.height / 2) * this.options.spriteScale / 8}px`;
                partElement.style.left = `-${spritePart.width * this.options.spriteScale / 4}px`;
                break;
            case 'leftShoe':
                partElement.style.top = `${(this.spriteParts.hat.height + this.spriteParts.head.height + this.spriteParts.body.height + this.spriteParts.pants.height) * this.options.spriteScale / 8}px`;
                partElement.style.left = `${this.spriteParts.body.width * this.options.spriteScale / 16}px`;
                break;
            case 'rightShoe':
                partElement.style.top = `${(this.spriteParts.hat.height + this.spriteParts.head.height + this.spriteParts.body.height + this.spriteParts.pants.height) * this.options.spriteScale / 8}px`;
                partElement.style.left = `${this.spriteParts.body.width * this.options.spriteScale / 4}px`;
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
                    hat: { visible: Math.random() > 0.3 },
                    head: { visible: true },
                    body: { visible: true },
                    shirt: { visible: true },
                    pants: { visible: true },
                    briefcase: { visible: Math.random() > 0.5 },
                    leftShoe: { visible: true },
                    rightShoe: { visible: true }
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