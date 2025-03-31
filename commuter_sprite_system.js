/**
 * Drone: The Daily Commute
 * Sprite System using colorization of single component images
 * Updated for larger sprite dimensions
 */

class CommuterSpriteSystem {
    constructor(options = {}) {
        // Default options
        this.options = {
            spritesPath: 'assets/sprites/', // Path to the sprites directory
            container: document.getElementById('scene-container'),
            spriteScale: 0.25, // Scale of sprites (multiplier) - adjusted for larger sprites
            ...options
        };
        
        this.commuters = [];
        
        // Define sprite paths for each component (single image per component)
        this.spritePaths = {
            hat: 'hat.png',
            head: 'head.png',
            body: 'coat.png',
            shirt: 'shirt.png',
            pants: 'pants.png',
            briefcase: 'briefcase.png',
            shoes: 'shoes.png' // Changed from shoe to shoes to match your note
        };
        
        // Store original sprite dimensions for proper scaling
        this.spriteDimensions = {
            hat: { width: 360, height: 144 },
            head: { width: 288, height: 256 },
            body: { width: 320, height: 440 },
            shirt: { width: 300, height: 210 },
            pants: { width: 280, height: 310 },
            briefcase: { width: 270, height: 220 },
            shoes: { width: 310, height: 90 }
        };
    }
    
    /**
     * Create a commuter using colorized sprite images
     * @param {Object} options - Configuration for the commuter
     * @returns {Object} - The created commuter object
     */
    createCommuter(options = {}) {
        // Calculate scaled dimensions for the commuter container
        const scale = this.options.spriteScale;
        const containerWidth = this.spriteDimensions.body.width * scale;
        const containerHeight = (
            this.spriteDimensions.head.height + 
            this.spriteDimensions.body.height + 
            this.spriteDimensions.pants.height
        ) * scale;
        
        // Default commuter options
        const defaultOptions = {
            id: `commuter-${this.commuters.length}`,
            x: 0,
            y: 0,
            parts: {
                hat: { 
                    visible: Math.random() > 0.3,
                    color: '#000000' // Black
                },
                head: { 
                    visible: true,
                    color: '#E8BEAC' // Default skin tone
                },
                body: { 
                    visible: true,
                    color: '#4e392e' // Brown coat
                },
                shirt: { 
                    visible: true,
                    color: '#FFFFFF' // White
                },
                pants: { 
                    visible: true,
                    color: '#37322e' // Dark gray
                },
                briefcase: { 
                    visible: Math.random() > 0.5,
                    color: '#8B4513' // Brown
                },
                shoes: { 
                    visible: true,
                    color: '#000000' // Black
                }
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
        commuterElement.style.width = `${containerWidth}px`;
        commuterElement.style.height = `${containerHeight}px`;
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
     * Create a single sprite part as a div with background image and color filter
     * @param {string} partName - Name of the part to create
     * @param {Object} partConfig - Configuration for this part
     * @returns {HTMLElement} - The created part element
     */
    _createSpritePart(partName, partConfig) {
        const partElement = document.createElement('div');
        partElement.className = `commuter-part commuter-${partName}`;
        partElement.style.position = 'absolute';
        partElement.style.backgroundRepeat = 'no-repeat';
        partElement.style.backgroundSize = 'contain';
        
        // Get the sprite path
        let spritePath;
        
        if (partName === 'leftShoe' || partName === 'rightShoe') {
            // We don't use these anymore - using the combined shoes sprite
            return null;
        } else {
            spritePath = this.options.spritesPath + this.spritePaths[partName];
        }
        
        // Set background image
        partElement.style.backgroundImage = `url(${spritePath})`;
        
        // Apply coloring with CSS filters
        if (partConfig.color) {
            this._applyColorFilter(partElement, partConfig.color);
        }
        
        // Get dimensions for this part
        const dimensions = this.spriteDimensions[partName];
        if (!dimensions) return null;
        
        // Calculate scaled dimensions
        const scale = this.options.spriteScale;
        const scaledWidth = dimensions.width * scale;
        const scaledHeight = dimensions.height * scale;
        
        // Set dimensions
        partElement.style.width = `${scaledWidth}px`;
        partElement.style.height = `${scaledHeight}px`;
        
        // Set position based on part type
        // These positions are calculated to create a properly stacked character
        // with the new sprite dimensions
        const headHeight = this.spriteDimensions.head.height * scale;
        const bodyHeight = this.spriteDimensions.body.height * scale;
        const bodyWidth = this.spriteDimensions.body.width * scale;
        
        switch (partName) {
            case 'hat':
                // Position hat on top of head
                partElement.style.top = `-${this.spriteDimensions.hat.height * scale * 0.7}px`;
                // Center hat horizontally
                partElement.style.left = `${(bodyWidth - scaledWidth) / 2}px`;
                partElement.style.zIndex = '5';
                break;
                
            case 'head':
                // Position head at the top
                partElement.style.top = '0px';
                // Center head horizontally
                partElement.style.left = `${(bodyWidth - scaledWidth) / 2}px`;
                partElement.style.zIndex = '4';
                break;
                
            case 'body':
                // Position body below head
                partElement.style.top = `${headHeight * 0.8}px`; // Slight overlap with head
                partElement.style.left = '0px';
                partElement.style.zIndex = '3';
                break;
                
            case 'shirt':
                // Position shirt on top of body (chest area)
                partElement.style.top = `${headHeight * 0.9}px`; // Slightly higher than coat start
                // Center shirt horizontally
                partElement.style.left = `${(bodyWidth - scaledWidth) / 2}px`;
                partElement.style.zIndex = '2';
                break;
                
            case 'pants':
                // Position pants below body
                partElement.style.top = `${headHeight * 0.8 + bodyHeight * 0.7}px`;
                // Center pants horizontally
                partElement.style.left = `${(bodyWidth - scaledWidth) / 2}px`;
                partElement.style.zIndex = '1';
                break;
                
            case 'briefcase':
                // Position briefcase beside the body
                partElement.style.top = `${headHeight + bodyHeight * 0.4}px`;
                partElement.style.left = `-${scaledWidth * 0.8}px`; // Beside the body
                partElement.style.zIndex = '6';
                break;
                
            case 'shoes':
                // Position shoes at the bottom
                partElement.style.top = `${headHeight * 0.8 + bodyHeight * 0.7 + this.spriteDimensions.pants.height * scale * 0.9}px`;
                // Center shoes horizontally
                partElement.style.left = `${(bodyWidth - scaledWidth) / 2}px`;
                partElement.style.zIndex = '0';
                break;
        }
        
        // Apply any custom styles from the config
        if (partConfig.styles) {
            Object.assign(partElement.style, partConfig.styles);
        }
        
        return partElement;
    }
    
    /**
     * Apply color filter to an element using CSS
     * @param {HTMLElement} element - The element to colorize
     * @param {string} color - Hex color string
     */
    _applyColorFilter(element, color) {
        // Extract RGB values from hex color
        const rgb = this._hexToRgb(color);
        
        if (!rgb) return;
        
        // For white, just use the original image with no filter
        if (rgb.r === 255 && rgb.g === 255 && rgb.b === 255) {
            element.style.filter = 'none';
            return;
        }
        
        // For black, use brightness and contrast
        if (rgb.r === 0 && rgb.g === 0 && rgb.b === 0) {
            element.style.filter = 'brightness(0) contrast(1)';
            return;
        }
        
        // Convert RGB to HSL to get the hue
        const hsl = this._rgbToHsl(rgb.r, rgb.g, rgb.b);
        
        // Apply filter based on HSL
        // We use a combination of hue-rotate (to change color), saturate (for color intensity),
        // and brightness (for lightness/darkness)
        const hueRotate = Math.round(hsl.h * 360);
        const saturate = Math.round(hsl.s * 100);
        const brightness = Math.round(hsl.l * 200); // Multiply by 200 to get a good range
        
        element.style.filter = `brightness(${brightness}%) saturate(${saturate}%) hue-rotate(${hueRotate}deg)`;
        
        // For some browsers, we need to ensure the original image is grayscale for best colorization
        element.style.mixBlendMode = 'multiply';
    }
    
    /**
     * Update an existing commuter
     * @param {string} id - ID of the commuter to update
     * @param {Object} options - New configuration options
     */
    updateCommuter(id, options = {}) {
        const commuter = this.commuters.find(c => c.id === id);
        if (!commuter) return null;
        
        // Check if we need to update individual parts
        if (options.parts) {
            for (const partName in options.parts) {
                const partConfig = options.parts[partName];
                const partSelector = `.commuter-${partName}`;
                let partElement = commuter.element.querySelector(partSelector);
                
                // Handle visibility changes
                if ('visible' in partConfig) {
                    if (partConfig.visible) {
                        // Create part if it doesn't exist
                        if (!partElement) {
                            const newPartConfig = {
                                ...commuter.config.parts[partName],
                                ...partConfig
                            };
                            partElement = this._createSpritePart(partName, newPartConfig);
                            commuter.element.appendChild(partElement);
                        }
                        // Update config
                        commuter.config.parts[partName].visible = true;
                    } else if (partElement) {
                        // Remove part if it exists
                        partElement.remove();
                        commuter.config.parts[partName].visible = false;
                    }
                }
                
                // Handle color changes
                if (partElement && 'color' in partConfig) {
                    this._applyColorFilter(partElement, partConfig.color);
                    commuter.config.parts[partName].color = partConfig.color;
                }
                
                // Apply any custom styles
                if (partElement && partConfig.styles) {
                    Object.assign(partElement.style, partConfig.styles);
                }
            }
        }
        
        // Update other commuter properties
        if ('x' in options) {
            commuter.element.style.left = `${options.x}px`;
            commuter.config.x = options.x;
        }
        
        if ('y' in options) {
            commuter.element.style.bottom = `${options.y}px`;
            commuter.config.y = options.y;
        }
        
        if ('facingLeft' in options) {
            commuter.element.style.transform = options.facingLeft ? 'scaleX(-1)' : '';
            commuter.config.facingLeft = options.facingLeft;
        }
        
        return commuter;
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
     * Remove a commuter from the scene
     * @param {string} id - ID of the commuter to remove
     */
    removeCommuter(id) {
        const commuter = this.commuters.find(c => c.id === id);
        if (commuter) {
            if (commuter.element.parentNode) {
                commuter.element.parentNode.removeChild(commuter.element);
            }
            this.commuters = this.commuters.filter(c => c.id !== id);
        }
    }
    
    /**
     * Convert hex color to RGB object
     * @param {string} hex - Hex color string (e.g., "#ff0000")
     * @returns {Object|null} - RGB object or null if invalid
     */
    _hexToRgb(hex) {
        // Remove # if present
        hex = hex.replace(/^#/, '');
        
        // Parse different formats
        let r, g, b;
        if (hex.length === 3) {
            // #RGB format
            r = parseInt(hex.charAt(0) + hex.charAt(0), 16);
            g = parseInt(hex.charAt(1) + hex.charAt(1), 16);
            b = parseInt(hex.charAt(2) + hex.charAt(2), 16);
        } else if (hex.length === 6) {
            // #RRGGBB format
            r = parseInt(hex.substring(0, 2), 16);
            g = parseInt(hex.substring(2, 4), 16);
            b = parseInt(hex.substring(4, 6), 16);
        } else {
            return null;
        }
        
        return { r, g, b };
    }
    
    /**
     * Convert RGB to HSL
     * @param {number} r - Red (0-255)
     * @param {number} g - Green (0-255)
     * @param {number} b - Blue (0-255)
     * @returns {Object} - HSL object with h, s, l properties (0-1)
     */
    _rgbToHsl(r, g, b) {
        r /= 255;
        g /= 255;
        b /= 255;
        
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;
        
        if (max === min) {
            h = s = 0; // achromatic
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            
            h /= 6;
        }
        
        return { h, s, l };
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