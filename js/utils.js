/**
 * Utility functions for the Adventure RPG game
 */

class Vector2 {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    add(v) {
        return new Vector2(this.x + v.x, this.y + v.y);
    }

    subtract(v) {
        return new Vector2(this.x - v.x, this.y - v.y);
    }

    multiply(scalar) {
        return new Vector2(this.x * scalar, this.y * scalar);
    }

    distance(v) {
        const dx = this.x - v.x;
        const dy = this.y - v.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    length() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    normalize() {
        const len = this.length();
        if (len === 0) return new Vector2(0, 0);
        return new Vector2(this.x / len, this.y / len);
    }

    angle() {
        return Math.atan2(this.y, this.x);
    }

    static fromAngle(angle, length = 1) {
        return new Vector2(Math.cos(angle) * length, Math.sin(angle) * length);
    }

    clone() {
        return new Vector2(this.x, this.y);
    }
}

/**
 * Utility functions
 */
const Utils = {
    /**
     * Get random integer between min and max
     */
    randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    /**
     * Get random float between min and max
     */
    randomFloat(min, max) {
        return Math.random() * (max - min) + min;
    },

    /**
     * Clamp value between min and max
     */
    clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    },

    /**
     * Lerp between two values
     */
    lerp(a, b, t) {
        return a + (b - a) * this.clamp(t, 0, 1);
    },

    /**
     * Linear interpolation easing
     */
    easeLinear(t) {
        return t;
    },

    /**
     * Quadratic in easing
     */
    easeInQuad(t) {
        return t * t;
    },

    /**
     * Quadratic out easing
     */
    easeOutQuad(t) {
        return -t * (t - 2);
    },

    /**
     * Cubic in-out easing
     */
    easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : 1 + (--t) * 2 * (t *= t) * 2;
    },

    /**
     * Check if distance between two vectors is within range
     */
    isWithinRange(pos1, pos2, range) {
        return pos1.distance(pos2) <= range;
    },

    /**
     * Get direction from pos1 to pos2
     */
    getDirection(pos1, pos2) {
        return pos2.subtract(pos1).normalize();
    },

    /**
     * Get angle from pos1 to pos2
     */
    getAngle(pos1, pos2) {
        return Math.atan2(pos2.y - pos1.y, pos2.x - pos1.x);
    },

    /**
     * Rotate vector by angle
     */
    rotateVector(v, angle) {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        return new Vector2(
            v.x * cos - v.y * sin,
            v.x * sin + v.y * cos
        );
    },

    /**
     * Check if point is inside rectangle
     */
    isPointInRect(point, rect) {
        return point.x >= rect.x && point.x <= rect.x + rect.width &&
               point.y >= rect.y && point.y <= rect.y + rect.height;
    },

    /**
     * Check if circles collide
     */
    circlesCollide(pos1, radius1, pos2, radius2) {
        return pos1.distance(pos2) <= radius1 + radius2;
    },

    /**
     * Get random element from array
     */
    randomElement(array) {
        return array[Math.floor(Math.random() * array.length)];
    },

    /**
     * Shuffle array
     */
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    },

    /**
     * Format large numbers
     */
    formatNumber(num) {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num.toString();
    },

    /**
     * Debounce function
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    /**
     * Throttle function
     */
    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
};

/**
 * Rarity colors and data
 */
const RARITY = {
    COMMON: { name: 'Common', color: '#95a3a6', order: 0 },
    UNCOMMON: { name: 'Uncommon', color: '#1eff00', order: 1 },
    RARE: { name: 'Rare', color: '#0070dd', order: 2 },
    EPIC: { name: 'Epic', color: '#a335ee', order: 3 },
    LEGENDARY: { name: 'Legendary', color: '#ff8000', order: 4 },
    MYTHIC: { name: 'Mythic', color: '#e6cc80', order: 5 },
    ANCIENT: { name: 'Ancient', color: '#ff1493', order: 6 },
    GODLY: { name: 'Godly', color: '#ffff00', order: 7 }
};

/**
 * Item types
 */
const ITEM_TYPE = {
    WEAPON: 'weapon',
    ARMOR: 'armor',
    HELMET: 'helmet',
    BOOTS: 'boots',
    RING: 'ring',
    NECKLACE: 'necklace',
    CONSUMABLE: 'consumable',
    RESOURCE: 'resource',
    KEY: 'key',
    QUEST: 'quest'
};

/**
 * Status effects
 */
const STATUS_EFFECT = {
    POISON: 'poison',
    BURN: 'burn',
    FREEZE: 'freeze',
    STUN: 'stun',
    BLEED: 'bleed',
    WEAKNESS: 'weakness',
    STRENGTH: 'strength',
    SPEED: 'speed'
};

/**
 * Biomes
 */
const BIOME = {
    FOREST: 'forest',
    MOUNTAIN: 'mountain',
    DESERT: 'desert',
    SNOW: 'snow',
    OCEAN: 'ocean',
    CAVE: 'cave',
    VILLAGE: 'village',
    CASTLE: 'castle',
    RUINS: 'ruins'
};

/**
 * Time constants (in milliseconds)
 */
const TIME = {
    SECOND: 1000,
    MINUTE: 60000,
    HOUR: 3600000,
    DAY: 86400000
};

/**
 * Screen shake function
 */
function screenShake(intensity = 5, duration = 200) {
    if (!game || !game.settings.screenShake) return;
    
    const originalX = game.camera.x;
    const originalY = game.camera.y;
    const startTime = Date.now();
    
    const shake = () => {
        const elapsed = Date.now() - startTime;
        
        if (elapsed < duration) {
            game.camera.x = originalX + Utils.randomFloat(-intensity, intensity);
            game.camera.y = originalY + Utils.randomFloat(-intensity, intensity);
            requestAnimationFrame(shake);
        } else {
            game.camera.x = originalX;
            game.camera.y = originalY;
        }
    };
    
    shake();
}
