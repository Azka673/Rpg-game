/**  
 * Game World - Contains all world entities and systems  
 */  
class World {  
    constructor(width, height) {  
        this.width = width;  
        this.height = height;  
        this.terrain = [];  
        this.tiles = [];  
        this.entities = [];  
        this.enemies = [];  
        this.npcs = [];  
        this.projectiles = [];  
        this.particles = [];  
        this.locations = [];  
        this.shops = [];  
        this.dungeons = [];  
        this.portals = [];  

        // World state  
        this.timeOfDay = 0.5; // 0 = midnight, 0.5 = noon, 1 = midnight again  
        this.dayDuration = 600; // seconds (10 minutes per in-game day)  
        this.dayProgress = 0;  
        this.weather = 'clear';  
        this.weatherTransition = 0;  

        // Time system  
        this.time = 0;  
        this.season = 'spring'; // spring, summer, autumn, winter  

        // Spawn point  
        this.spawnPoint = new Vector2(500, 500);  

        // Generate world  
        this.generate();  
    }  

    /**  
     * Generate world terrain and entities  
     */  
    generate() {  
        this.generateTerrain();  
        this.generateLocations();  
        this.generateEnemies();  
        this.generateNPCs();  
        this.generateMisc();  
    }  

    /**  
     * Generate procedural terrain using Perlin-like noise  
     */  
    generateTerrain() {  
        const tileSize = 20;  
        const tilesX = Math.ceil(this.width / tileSize);  
        const tilesY = Math.ceil(this.height / tileSize);  

        for (let y = 0; y < tilesY; y++) {  
            this.tiles[y] = [];  
            for (let x = 0; x < tilesX; x++) {  
                const tileData = this.generateTile(x, y);  
                this.tiles[y][x] = tileData;  
            }  
        }  
    }  

    /**  
     * Generate single tile  
     */  
    generateTile(x, y) {  
        const noise = this.perlinNoise(x * 0.1, y * 0.1);  
        let biome = BIOME.FOREST;  
        let color = '#2d5016';  

        if (noise > 0.6) {  
            biome = BIOME.MOUNTAIN;  
            color = '#8b7355';  
        } else if (noise > 0.4) {  
            biome = BIOME.FOREST;  
            color = '#2d5016';  
        } else if (noise > 0.2) {  
            biome = BIOME.DESERT;  
            color = '#d4a76a';  
        } else {  
            biome = BIOME.OCEAN;  
            color = '#1e40af';  
        }  

        return {  
            biome,  
            color,  
            x: x * 20,  
            y: y * 20,  
            width: 20,  
            height: 20,  
            traversable: biome !== BIOME.OCEAN && biome !== BIOME.MOUNTAIN  
        };  
    }  

    /**  
     * Simple Perlin-like noise function  
     */  
    perlinNoise(x, y) {  
        const xi = Math.floor(x);  
        const yi = Math.floor(y);  
        const xf = x - xi;  
        const yf = y - yi;  

        const n00 = Math.sin(xi * 12.9898 + yi * 78.233) * 43758.5453;  
        const n10 = Math.sin((xi + 1) * 12.9898 + yi * 78.233) * 43758.5453;  
        const n01 = Math.sin(xi * 12.9898 + (yi + 1) * 78.233) * 43758.5453;  
        const n11 = Math.sin((xi + 1) * 12.9898 + (yi + 1) * 78.233) * 43758.5453;  

        const v00 = n00 - Math.floor(n00);  
        const v10 = n10 - Math.floor(n10);  
        const v01 = n01 - Math.floor(n01);  
        const v11 = n11 - Math.floor(n11);  

        const u = xf * xf * (3 - 2 * xf);  
        const v = yf * yf * (3 - 2 * yf);  

        const nx0 = Utils.lerp(v00, v10, u);  
        const nx1 = Utils.lerp(v01, v11, u);  
        return Utils.lerp(nx0, nx1, v);  
    }  

    /**  
     * Generate major locations (villages, castles, dungeons, etc)  
     */  
    generateLocations() {  
        const locations = [  
            { name: 'Emberholm Village', x: 300, y: 300, type: 'village', icon: '🏘️' },  
            { name: 'Crystal Castle', x: 800, y: 200, type: 'castle', icon: '🏰' },  
            { name: 'Deep Forest', x: 150, y: 600, type: 'forest', icon: '🌳' },  
            { name: 'Stonepeak Mountain', x: 600, y: 800, type: 'mountain', icon: '🏔️' },  
            { name: 'Dragon\'s Lair', x: 1200, y: 300, type: 'boss_arena', icon: '🐉' },  
            { name: 'Obsidian Mines', x: 400, y: 900, type: 'mine', icon: '⛏️' },  
            { name: 'Corrupted Ruins', x: 1000, y: 600, type: 'dungeon', icon: '💀' },  
            { name: 'Mystic Lake', x: 200, y: 1000, type: 'water', icon: '💧' },  
            { name: 'Frostveil Peak', x: 1100, y: 900, type: 'snow', icon: '❄️' },  
            { name: 'Hidden Island', x: 1400, y: 400, type: 'island', icon: '🏝️' }  
        ];  

        this.locations = locations;  
    }  

    /**  
     * Generate enemies  
     */  
    generateEnemies() {  
        const enemyTypes = [  
            { type: 'slime', hp: 20, damage: 2, color: '#00ff00', icon: '🟢' },  
            { type: 'goblin', hp: 30, damage: 4, color: '#00aa00', icon: '👹' },  
            { type: 'wolf', hp: 40, damage: 5, color: '#8b4513', icon: '🐺' },  
            { type: 'skeleton', hp: 50, damage: 6, color: '#cccccc', icon: '💀' },  
            { type: 'bandit', hp: 60, damage: 7, color: '#660000', icon: '🗡️' },  
            { type: 'dragon', hp: 500, damage: 15, color: '#ff0000', icon: '🐉', boss: true },  
            { type: 'ancient_guardian', hp: 300, damage: 12, color: '#666666', icon: '🛡️', boss: true },  
            { type: 'dark_mage', hp: 80, damage: 10, color: '#6600cc', icon: '🧙', spell_user: true }  
        ];  

        // Spawn enemies across the world  
        for (let i = 0; i < 50; i++) {  
            const type = Utils.randomElement(enemyTypes);  
            const x = Utils.randomFloat(100, this.width - 100);  
            const y = Utils.randomFloat(100, this.height - 100);  

            const enemy = new Enemy(x, y, type.type, {  
                maxHealth: type.hp,  
                damage: type.damage,  
                color: type.color,  
                icon: type.icon,  
                isBoss: type.boss || false,  
                isSpellUser: type.spell_user || false  
            });  

            this.enemies.push(enemy);  
        }  
    }  

    /**  
     * Generate NPCs  
     */  
    generateNPCs() {  
        const npcs = [  
            {  
                name: 'Aldric the Blacksmith',  
                x: 300,  
                y: 330,  
                role: 'blacksmith',  
                dialogue: 'Need anything forged? I\'ve got the finest weapons in the realm!',  
                icon: '⚒️'  
            },  
            {  
                name: 'Elara the Healer',  
                x: 290,  
                y: 310,  
                role: 'healer',  
                dialogue: 'Need healing potions? I have the strongest remedies!',  
                icon: '⚗️'  
            },  
            {  
                name: 'Theron the Merchant',  
                x: 310,  
                y: 320,  
                role: 'merchant',  
                dialogue: 'Check out my wares! Fresh from distant lands!',  
                icon: '💰'  
            },  
            {  
                name: 'Quest Master Galen',  
                x: 320,  
                y: 315,  
                role: 'questgiver',  
                dialogue: 'I have tasks that need completing. Interested?',  
                icon: '📜'  
            },  
            {  
                name: 'Lyra the Ranger',  
                x: 200,  
                y: 650,  
                role: 'trainer',  
                dialogue: 'Want to learn bow techniques? I can teach you!',  
                icon: '🏹'  
            },  
            {  
                name: 'Mage Zephyr',  
                x: 850,  
                y: 250,  
                role: 'trainer',  
                dialogue: 'Interested in the arcane arts? Come, I\'ll teach you!',  
                icon: '🧙'  
            }  
        ];  

        npcs.forEach(npcData => {  
            const npc = new NPC(npcData.x, npcData.y, npcData);  
            this.npcs.push(npc);  
        });  
    }  

    /**  
     * Generate miscellaneous objects (trees, rocks, etc)  
     */  
    generateMisc() {  
        // This would include environmental objects, decorations, etc.  
        // For now, kept simple  
    }  

    /**  
     * Update world  
     */  
    update(deltaTime) {  
        // Update time system  
        this.updateTimeSystem(deltaTime);  

        // Update enemies  
        this.enemies.forEach((enemy, index) => {  
            enemy.update(deltaTime);  
            
            if (enemy.health <= 0) {  
                this.enemies.splice(index, 1);  
            }  
        });  

        // Update NPCs  
        this.npcs.forEach(npc => {  
            npc.update(deltaTime);  
        });  

        // Update projectiles  
        this.projectiles.forEach((projectile, index) => {  
            projectile.update(deltaTime);  

            if (projectile.isOutOfBounds(this.width, this.height)) {  
                this.projectiles.splice(index, 1);  
            }  
        });  

        // Update particles  
        this.particles.forEach((particle, index) => {  
            particle.update(deltaTime);  

            if (particle.isDead) {  
                this.particles.splice(index, 1);  
            }  
        });  
    }  

    /**  
     * Update time and weather system  
     */  
    updateTimeSystem(deltaTime) {  
        this.time += deltaTime;  
        this.dayProgress += deltaTime / this.dayDuration;  

        if (this.dayProgress >= 1) {  
            this.dayProgress = 0;  
            this.timeOfDay = (this.timeOfDay + 1) % 1;  
        }  

        this.timeOfDay = this.dayProgress;  

        // Update weather randomly  
        if (Math.random() < deltaTime * 0.01) {  
            const weathers = ['clear', 'rain', 'snow', 'fog', 'storm'];  
            this.weather = Utils.randomElement(weathers);  
        }  
    }  

    /**  
     * Get sky color based on time of day  
     */  
    getSkyColor() {  
        const colors = {  
            night: '#0a0e27',  
            sunrise: '#ff6b3d',  
            day: '#87ceeb',  
            sunset: '#ff8c42',  
            midnight: '#030812'  
        };  

        if (this.timeOfDay < 0.25) {  
            // Night to sunrise  
            return this.lerpColor(colors.night, colors.sunrise, this.timeOfDay * 4);  
        } else if (this.timeOfDay < 0.35) {  
            // Sunrise to day  
            return this.lerpColor(colors.sunrise, colors.day, (this.timeOfDay - 0.25) * 10);  
        } else if (this.timeOfDay < 0.65) {  
            // Day  
            return colors.day;  
        } else if (this.timeOfDay < 0.75) {  
            // Day to sunset  
            return this.lerpColor(colors.day, colors.sunset, (this.timeOfDay - 0.65) * 10);  
        } else {  
            // Sunset to night  
            return this.lerpColor(colors.sunset, colors.midnight, (this.timeOfDay - 0.75) * 4);  
        }  
    }  

    /**  
     * Lerp between two colors  
     */  
    lerpColor(color1, color2, t) {  
        const c1 = parseInt(color1.slice(1), 16);  
        const c2 = parseInt(color2.slice(1), 16);  

        const r1 = (c1 >> 16) & 255;  
        const g1 = (c1 >> 8) & 255;  
        const b1 = c1 & 255;  

        const r2 = (c2 >> 16) & 255;  
        const g2 = (c2 >> 8) & 255;  
        const b2 = c2 & 255;  

        const r = Math.round(Utils.lerp(r1, r2, t));  
        const g = Math.round(Utils.lerp(g1, g2, t));  
        const b = Math.round(Utils.lerp(b1, b2, t));  

        return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;  
    }  

    /**  
     * Draw world  
     */  
    draw(ctx, camera) {  
        // Draw tiles  
        this.drawTiles(ctx, camera);  

        // Draw enemies  
        this.enemies.forEach(enemy => {  
            enemy.draw(ctx, camera);  
        });  

        // Draw NPCs  
        this.npcs.forEach(npc => {  
            npc.draw(ctx, camera);  
        });  

        // Draw projectiles  
        this.projectiles.forEach(projectile => {  
            projectile.draw(ctx, camera);  
        });  
    }  

    /**  
     * Draw world tiles  
     */  
    drawTiles(ctx, camera) {  
        const tileSize = 20;  
        const startX = Math.floor(camera.x / tileSize);  
        const startY = Math.floor(camera.y / tileSize);  
        const endX = startX + Math.ceil(camera.canvas.width / tileSize) + 1;  
        const endY = startY + Math.ceil(camera.canvas.height / tileSize) + 1;  

        for (let y = Math.max(0, startY); y < Math.min(this.tiles.length, endY); y++) {  
            for (let x = Math.max(0, startX); x < Math.min(this.tiles[y].length, endX); x++) {  
                const tile = this.tiles[y][x];  
                const screenX = tile.x - camera.x + camera.canvas.width / 2;  
                const screenY = tile.y - camera.y + camera.canvas.height / 2;  

                ctx.fillStyle = tile.color;  
                ctx.fillRect(screenX, screenY, tile.width, tile.height);  

                // Draw tile border  
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';  
                ctx.lineWidth = 0.5;  
                ctx.strokeRect(screenX, screenY, tile.width, tile.height);  
            }  
        }  
    }  

    /**  
     * Add projectile  
     */  
    addProjectile(projectile) {  
        this.projectiles.push(projectile);  
    }  

    /**  
     * Add particle  
     */  
    addParticle(particle) {  
        this.particles.push(particle);  
    }  

    /**  
     * Get nearby enemies within distance  
     */  
    getNearbyEnemies(position, distance) {  
        return this.enemies.filter(enemy =>   
            Utils.isWithinRange(position, enemy.position, distance)  
        );  
    }  

    /**  
     * Get nearby NPCs  
     */  
    getNearbyNPCs(position, distance) {  
        return this.npcs.filter(npc =>   
            Utils.isWithinRange(position, npc.position, distance)  
        );  
    }  

    /**  
     * Spawn random events  
     */  
    spawnRandomEvent() {  
        const events = [  
            'enemy_ambush',  
            'chest_found',  
            'merchant_passage',  
            'wildlife_migration',  
            'meteor_shower'  
        ];  

        const event = Utils.randomElement(events);  
        // Implement event logic here  
    }  

    /**  
     * Save world state  
     */  
    toJSON() {  
        return {  
            timeOfDay: this.timeOfDay,  
            weather: this.weather,  
            season: this.season,  
            enemies: this.enemies.map(e => e.toJSON()),  
            npcs: this.npcs.map(n => n.toJSON())  
        };  
    }  
}  

/**  
 * Enemy class  
 */  
class Enemy {  
    constructor(x, y, type, options = {}) {  
        this.position = new Vector2(x, y);  
        this.velocity = new Vector2(0, 0);  
        this.type = type;  
        this.radius = 10;  

        // Stats  
        this.maxHealth = options.maxHealth || 30;  
        this.health = this.maxHealth;  
        this.damage = options.damage || 4;  
        this.color = options.color || '#00ff00';  
        this.icon = options.icon || '🟢';  
        this.isBoss = options.isBoss || false;  
        this.isSpellUser = options.isSpellUser || false;  

        // AI  
        this.state = 'idle'; // idle, chase, attack, retreat  
        this.targetPlayer = null;  
        this.detectionRange = 200;  
        this.attackRange = 40;  
        this.attackCooldown = 0;  
        this.patrolRange = 150;  
        this.patrolTarget = this.position.clone();  

        // Loot  
        this.lootTable = {  
            'slime': [{ item: 'slime_goo', chance: 0.3 }, { item: 'copper_coin', chance: 1 }],  
            'goblin': [{ item: 'goblin_ear', chance: 0.5 }, { item: 'silver_coin', chance: 0.8 }],  
            'wolf': [{ item: 'wolf_fang', chance: 0.4 }, { item: 'silver_coin', chance: 0.9 }],  
            'skeleton': [{ item: 'bone_dust', chance: 0.6 }, { item: 'gold_coin', chance: 0.7 }],  
            'bandit': [{ item: 'stolen_goods', chance: 0.5 }, { item: 'gold_coin', chance: 0.8 }]  
        };  

        // Status effects  
        this.statusEffects = [];  
    }  

    /**  
     * Update enemy AI  
     */  
    update(deltaTime) {  
        // Update status effects  
        this.updateStatusEffects(deltaTime);  

        // AI behavior  
        this.updateAI(deltaTime);  

        // Update position  
        this.position = this.position.add(this.velocity.multiply(deltaTime));  
        this.velocity = this.velocity.multiply(0.9);  

        // Update cooldowns  
        this.attackCooldown = Math.max(0, this.attackCooldown - deltaTime);  
    }  

    /**  
     * Update enemy AI logic  
     */  
    updateAI(deltaTime) {  
        if (!game.player) return;  

        const distToPlayer = this.position.distance(game.player.position);  

        if (distToPlayer < this.detectionRange) {  
            this.state = 'chase';  
            this.targetPlayer = game.player;  
        } else {  
            this.state = 'idle';  
        }  

        switch(this.state) {  
            case 'chase':  
                this.chasePlayer(deltaTime);  
                break;  
            case 'idle':  
                this.patrol(deltaTime);  
                break;  
        }  
    }  

    /**  
     * Chase player  
     */  
    chasePlayer(deltaTime) { 
        if (!this.targetPlayer) return;  

        const direction = Utils.getDirection(this.position, this.targetPlayer.position);  
        this.velocity = direction.multiply(this.isBoss ? 2 : 1.5);  

        const distToPlayer = this.position.distance(this.targetPlayer.position);  

        if (distToPlayer < this.attackRange && this.attackCooldown === 0) {
            this.attack();
        }
    }

    /**
     * Perform an attack
     */
    attack() {
        if (!this.targetPlayer) return;
        // melee swing
        this.attackCooldown = 1 + (this.isBoss ? 0.5 : 0);
        const dmg = this.damage;
        const dir = Utils.getDirection(this.position, this.targetPlayer.position);
        this.targetPlayer.takeDamage(dmg, dir);
        // spawn particles and sound
        if (typeof game !== 'undefined' && game.particles) game.particles.create('slash', this.position.clone(), dir.angle ? dir.angle() : 0);
        if (typeof AudioManager !== 'undefined') AudioManager.playSound('player_hit');
    }

    /**
     * Simple patrol behavior
     */
    patrol(deltaTime) {
        if (this.position.distance(this.patrolTarget) < 10) {
            // pick new patrol target
            this.patrolTarget = new Vector2(
                this.position.x + Utils.randomFloat(-this.patrolRange, this.patrolRange),
                this.position.y + Utils.randomFloat(-this.patrolRange, this.patrolRange)
            );
        }

        const dir = Utils.getDirection(this.position, this.patrolTarget);
        this.velocity = this.velocity.add(dir.multiply(0.2));
    }

    /**
     * Take damage and handle death
     */
    takeDamage(amount, direction = null) {
        this.health -= amount;
        if (direction) this.velocity = this.velocity.add(direction.multiply(2));
        if (typeof game !== 'undefined' && game.ui) game.ui.showFloatingDamage(this.position, Math.round(amount), 'damage');

        if (this.health <= 0) {
            // drop loot and reward
            if (typeof game !== 'undefined' && game.player) game.player.addExperience(Math.round((this.maxHealth || 10) * 0.5));
        }
    }

    /**
     * Update status effects list
     */
    updateStatusEffects(deltaTime) {
        this.statusEffects = this.statusEffects.filter(effect => {
            effect.duration -= deltaTime;
            // apply effect per tick
            if (effect.type === STATUS_EFFECT.POISON) this.health -= 0.5 * deltaTime;
            if (effect.type === STATUS_EFFECT.BURN) this.health -= 1.0 * deltaTime;
            return effect.duration > 0;
        });
    }

    /**
     * Draw enemy
     */
    draw(ctx, camera) {
        const screen = camera.worldToScreen(this.position);
        // body
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(screen.x, screen.y, this.radius, 0, Math.PI * 2);
        ctx.fill();

        // health bar
        const barW = 30;
        const hpPct = Math.max(0, this.health / this.maxHealth);
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(screen.x - barW/2, screen.y - this.radius - 12, barW, 5);
        ctx.fillStyle = `hsl(${hpPct*120}, 80%, 45%)`;
        ctx.fillRect(screen.x - barW/2, screen.y - this.radius - 12, barW * hpPct, 5);
    }

    toJSON() {
        return {
            type: this.type,
            position: { x: this.position.x, y: this.position.y },
            health: this.health
        };
    }
}