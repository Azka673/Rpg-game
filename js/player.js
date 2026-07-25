/**
 * Player class - Main character controlled by player
 */
class Player {
    constructor(x, y) {
        this.position = new Vector2(x, y);
        this.velocity = new Vector2(0, 0);
        this.radius = 12;
        this.speed = 3;

        // Level and Experience
        this.level = 1;
        this.experience = 0;
        this.expToNextLevel = 100;

        // Health and Resources
        this.maxHealth = 100;
        this.health = 100;
        this.maxMana = 50;
        this.mana = 50;
        this.maxStamina = 100;
        this.stamina = 100;

        // Attributes
        this.stats = {
            strength: 10,
            dexterity: 10,
            intelligence: 10,
            defense: 10,
            luck: 5
        };

        // Bonuses from equipment
        this.bonuses = {
            strength: 0,
            dexterity: 0,
            intelligence: 0,
            defense: 0,
            luck: 0,
            healthRegen: 0.1,
            manaRegen: 0.2,
            damageMultiplier: 1
        };

        // Equipment
        this.equipment = {
            weapon: null,
            armor: null,
            helmet: null,
            boots: null,
            ring: null,
            necklace: null
        };

        // Inventory
        this.inventory = new Inventory(this);

        // Combat related
        this.isAttacking = false;
        this.attackCooldown = 0;
        this.isCasting = false;
        this.castCooldown = 0;
        this.isShielding = false;
        this.shieldCooldown = 0;
        this.dodgeRoll = false;
        this.dodgeRollCooldown = 0;
        this.dodgeRollDuration = 0.3;

        // Skills
        this.skills = {
            slash: { cooldown: 0, maxCooldown: 0.8, mana: 0, damage: 1.2 },
            arrow: { cooldown: 0, maxCooldown: 1.2, mana: 20, damage: 1.0 },
            fireball: { cooldown: 0, maxCooldown: 2, mana: 40, damage: 1.8 },
            shield: { cooldown: 0, maxCooldown: 1.5, mana: 15 },
            ultimate: { cooldown: 0, maxCooldown: 10, mana: 100, damage: 3.0 }
        };

        // State
        this.direction = 0;
        this.animationFrame = 0;
        this.animationSpeed = 0.1;
        this.statusEffects = [];

        // Mount
        this.mount = null;

        // Quests
        this.activeQuests = [];
        this.completedQuests = [];
        this.availableQuests = [];

        // Misc
        this.campfire = null;
        this.isSleeping = false;
        this.coins = 100;
        this.playtime = 0;
    }

    /**
     * Update player
     */
    update(deltaTime) {
        // Update position
        this.position = this.position.add(this.velocity.multiply(deltaTime));

        // Apply friction
        this.velocity = this.velocity.multiply(0.9);

        // Regenerate resources
        this.health = Math.min(this.maxHealth, this.health + this.bonuses.healthRegen * deltaTime);
        this.mana = Math.min(this.maxMana, this.mana + this.bonuses.manaRegen * deltaTime);
        this.stamina = Math.min(this.maxStamina, this.stamina + 20 * deltaTime);

        // Update cooldowns
        this.attackCooldown = Math.max(0, this.attackCooldown - deltaTime);
        this.castCooldown = Math.max(0, this.castCooldown - deltaTime);
        this.shieldCooldown = Math.max(0, this.shieldCooldown - deltaTime);
        this.dodgeRollCooldown = Math.max(0, this.dodgeRollCooldown - deltaTime);
        this.dodgeRollDuration = Math.max(0, this.dodgeRollDuration - deltaTime);

        // Update skill cooldowns
        for (let skill in this.skills) {
            this.skills[skill].cooldown = Math.max(0, this.skills[skill].cooldown - deltaTime);
        }

        // Update status effects
        this.updateStatusEffects(deltaTime);

        // Update animation
        this.animationFrame += this.animationSpeed;

        // Update playtime
        this.playtime += deltaTime;

        // Keep player in world bounds
        const padding = 50;
        this.position.x = Utils.clamp(this.position.x, padding, game.world.width - padding);
        this.position.y = Utils.clamp(this.position.y, padding, game.world.height - padding);

        // Update quests
        this.updateQuests();
    }

    /**
     * Draw player
     */
    draw(ctx, camera) {
        const screenPos = this.getScreenPosition(camera);
        
        // Draw player body
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(screenPos.x, screenPos.y, this.radius, 0, Math.PI * 2);
        ctx.fill();

        // Draw player direction indicator
        ctx.strokeStyle = '#0070dd';
        ctx.lineWidth = 2;
        const dirEnd = new Vector2(
            screenPos.x + Math.cos(this.direction) * this.radius * 1.3,
            screenPos.y + Math.sin(this.direction) * this.radius * 1.3
        );
        ctx.beginPath();
        ctx.moveTo(screenPos.x, screenPos.y);
        ctx.lineTo(dirEnd.x, dirEnd.y);
        ctx.stroke();

        // Draw health bar
        const barWidth = 40;
        const barHeight = 4;
        const barX = screenPos.x - barWidth / 2;
        const barY = screenPos.y - this.radius - 15;

        // Background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(barX, barY, barWidth, barHeight);

        // Health fill
        const healthPercent = this.health / this.maxHealth;
        ctx.fillStyle = `hsl(${healthPercent * 120}, 100%, 50%)`;
        ctx.fillRect(barX, barY, barWidth * healthPercent, barHeight);

        // Status effects
        this.statusEffects.forEach((effect, index) => {
            ctx.fillStyle = effect.color;
            ctx.beginPath();
            ctx.arc(screenPos.x - 15 + index * 8, screenPos.y - this.radius - 25, 3, 0, Math.PI * 2);
            ctx.fill();
        });
    }

    /**
     * Get screen position relative to camera
     */
    getScreenPosition(camera) {
        return new Vector2(
            this.position.x - camera.x + camera.canvas.width / 2,
            this.position.y - camera.y + camera.canvas.height / 2
        );
    }

    /**
     * Move player
     */
    move(direction) {
        const moveSpeed = this.mount ? 5 : 3;
        this.velocity = this.velocity.add(direction.multiply(moveSpeed));
        
        if (direction.length() > 0) {
            this.direction = direction.angle();
        }
    }

    /**
     * Attack with sword
     */
    attack() {
        if (this.attackCooldown > 0 || !this.equipment.weapon) return;

        const damage = this.calculateDamage();
        this.attackCooldown = this.skills.slash.maxCooldown;

        // Create slash effect
        const slashPos = new Vector2(
            this.position.x + Math.cos(this.direction) * 30,
            this.position.y + Math.sin(this.direction) * 30
        );

        game.particles.create('slash', slashPos, this.direction);
        AudioManager.playSound('attack_sword');
        screenShake(3, 100);

        // Check for enemies in range
        game.world.enemies.forEach(enemy => {
            if (Utils.isWithinRange(this.position, enemy.position, 40)) {
                const dir = Utils.getDirection(this.position, enemy.position);
                enemy.takeDamage(damage, dir);
                
                // Critical hit
                if (Math.random() < this.getCriticalChance()) {
                    enemy.takeDamage(damage * 0.5, dir);
                    game.ui.showFloatingDamage(enemy.position, 'CRITICAL!', 'critical');
                }
            }
        });

        this.isAttacking = true;
        setTimeout(() => this.isAttacking = false, 200);
    }

    /**
     * Fire arrow
     */
    fireArrow() {
        if (this.skills.arrow.cooldown > 0 || this.mana < this.skills.arrow.mana) return;

        this.mana -= this.skills.arrow.mana;
        this.skills.arrow.cooldown = this.skills.arrow.maxCooldown;

        const arrow = new Projectile(
            this.position.clone(),
            new Vector2(Math.cos(this.direction), Math.sin(this.direction)),
            'arrow'
        );
        game.world.projectiles.push(arrow);

        AudioManager.playSound('arrow_shoot');
    }

    /**
     * Cast fireball
     */
    castFireball() {
        if (this.skills.fireball.cooldown > 0 || this.mana < this.skills.fireball.mana) return;

        this.mana -= this.skills.fireball.mana;
        this.skills.fireball.cooldown = this.skills.fireball.maxCooldown;

        const fireball = new Projectile(
            this.position.clone(),
            new Vector2(Math.cos(this.direction), Math.sin(this.direction)),
            'fireball'
        );
        game.world.projectiles.push(fireball);

        game.particles.create('magic', this.position.clone(), this.direction);
        AudioManager.playSound('spell_fireball');
        screenShake(4, 150);
    }

    /**
     * Raise shield
     */
    raiseShield() {
        if (this.shieldCooldown > 0 || !this.equipment.armor || this.mana < this.skills.shield.mana) return;

        this.mana -= this.skills.shield.mana;
        this.isShielding = true;
        this.shieldCooldown = this.skills.shield.maxCooldown;

        setTimeout(() => this.isShielding = false, 1500);
        AudioManager.playSound('shield_raise');
    }

    /**
     * Dodge roll
     */
    dodgeRoll() {
        if (this.dodgeRollCooldown > 0 || this.stamina < 20) return;

        this.stamina -= 20;
        this.dodgeRoll = true;
        this.dodgeRollCooldown = 1.5;
        this.dodgeRollDuration = 0.3;

        const rollDir = new Vector2(Math.cos(this.direction), Math.sin(this.direction));
        this.velocity = rollDir.multiply(8);

        AudioManager.playSound('dodge_roll');
    }

    /**
     * Ultimate ability
     */
    castUltimate() {
        if (this.skills.ultimate.cooldown > 0 || this.mana < this.skills.ultimate.mana) return;

        this.mana -= this.skills.ultimate.mana;
        this.skills.ultimate.cooldown = this.skills.ultimate.maxCooldown;

        // Damage all enemies in radius
        const radius = 150;
        game.world.enemies.forEach(enemy => {
            if (Utils.isWithinRange(this.position, enemy.position, radius)) {
                const dir = Utils.getDirection(this.position, enemy.position);
                const damage = this.calculateDamage() * this.skills.ultimate.damage;
                enemy.takeDamage(damage, dir);
                
                // Stun effect
                enemy.statusEffects.push({
                    type: STATUS_EFFECT.STUN,
                    duration: 2,
                    color: '#fbbf24'
                });
            }
        });

        game.particles.create('ultimate', this.position.clone(), 0);
        AudioManager.playSound('ultimate_cast');
        screenShake(8, 300);
    }

    /**
     * Take damage
     */
    takeDamage(damage, direction = null) {
        if (this.isShielding) {
            damage *= 0.5;
            game.ui.showFloatingDamage(this.position, 'BLOCKED', 'blocked');
        }

        if (this.dodgeRoll) {
            return; // Dodged
        }

        const finalDamage = Math.max(1, damage - (this.stats.defense + this.bonuses.defense) * 0.5);
        this.health -= finalDamage;

        if (direction) {
            this.velocity = direction.multiply(3);
        }

        game.ui.showFloatingDamage(this.position, Math.round(finalDamage), 'damage');
        AudioManager.playSound('player_hit');

        if (this.health <= 0) {
            this.die();
        }
    }

    /**
     * Heal
     */
    heal(amount) {
        const oldHealth = this.health;
        this.health = Math.min(this.maxHealth, this.health + amount);
        const healed = this.health - oldHealth;
        
        if (healed > 0) {
            game.ui.showFloatingDamage(this.position, '+' + Math.round(healed), 'healing');
        }
    }

    /**
     * Add experience
     */
    addExperience(amount) {
        this.experience += amount;
        game.ui.showNotification(`+${amount} EXP`, 'info');

        while (this.experience >= this.expToNextLevel) {
            this.levelUp();
        }
    }

    /**
     * Level up
     */
    levelUp() {
        this.experience -= this.expToNextLevel;
        this.level++;
        this.expToNextLevel = Math.floor(this.expToNextLevel * 1.15);

        // Increase stats
        this.maxHealth += 20;
        this.health = this.maxHealth;
        this.maxMana += 10;
        this.mana = this.maxMana;
        this.maxStamina += 15;
        this.stamina = this.maxStamina;

        this.stats.strength += 1;
        this.stats.dexterity += 1;
        this.stats.intelligence += 1;

        game.ui.showNotification(`Level Up! Now Level ${this.level}`, 'success');
        AudioManager.playSound('level_up');
    }

    /**
     * Die
     */
    die() {
        game.ui.showNotification('You have died!', 'error');
        game.saveGame();
        // Respawn at spawn point after 3 seconds
        setTimeout(() => {
            this.position = new Vector2(game.world.spawnPoint.x, game.world.spawnPoint.y);
            this.health = this.maxHealth;
            this.mana = this.maxMana;
            this.stamina = this.maxStamina;
        }, 3000);
    }

    /**
     * Calculate damage based on stats and equipment
     */
    calculateDamage() {
        let damage = 5 + (this.stats.strength + this.bonuses.strength) * 0.5;
        
        if (this.equipment.weapon) {
            damage += this.equipment.weapon.baseDamage;
        }

        return damage * this.bonuses.damageMultiplier;
    }

    /**
     * Get critical chance
     */
    getCriticalChance() {
        return Math.min(0.5, 0.05 + (this.stats.dexterity + this.bonuses.dexterity) * 0.01);
    }

    /**
     * Update status effects
     */
    updateStatusEffects(deltaTime) {
        this.statusEffects = this.statusEffects.filter(effect => {
            effect.duration -= deltaTime;

            // Apply effect
            switch(effect.type) {
                case STATUS_EFFECT.POISON:
                    this.takeDamage(0.5 * deltaTime);
                    break;
                case STATUS_EFFECT.BURN:
                    this.takeDamage(1 * deltaTime);
                    break;
                case STATUS_EFFECT.BLEED:
                    this.takeDamage(0.3 * deltaTime);
                    break;
            }

            return effect.duration > 0;
        });
    }

    /**
     * Update quests
     */
    updateQuests() {
        this.activeQuests.forEach(quest => {
            quest.update();
        });
    }

    /**
     * Equip item
     */
    equip(item) {
        if (!item.type.includes('weapon') && !item.type.includes('armor') && 
            item.type !== 'helmet' && item.type !== 'boots' && 
            item.type !== 'ring' && item.type !== 'necklace') {
            return false;
        }

        let slot = null;
        
        if (item.type === 'weapon') slot = 'weapon';
        else if (item.type === 'armor') slot = 'armor';
        else if (item.type === 'helmet') slot = 'helmet';
        else if (item.type === 'boots') slot = 'boots';
        else if (item.type === 'ring') slot = 'ring';
        else if (item.type === 'necklace') slot = 'necklace';

        if (slot && this.equipment[slot]) {
            this.inventory.addItem(this.equipment[slot]);
        }

        this.equipment[slot] = item;
        
        // Apply bonuses
        if (item.bonuses) {
            for (let key in item.bonuses) {
                this.bonuses[key] = (this.bonuses[key] || 0) + item.bonuses[key];
            }
        }

        return true;
    }

    /**
     * Unequip item
     */
    unequip(slot) {
        if (!this.equipment[slot]) return false;

        const item = this.equipment[slot];
        
        // Remove bonuses
        if (item.bonuses) {
            for (let key in item.bonuses) {
                this.bonuses[key] -= item.bonuses[key];
            }
        }

        this.inventory.addItem(item);
        this.equipment[slot] = null;
        return true;
    }

    /**
     * Get total damage with bonuses
     */
    getTotalDamage() {
        let damage = this.calculateDamage();
        if (this.equipment.weapon) {
            damage += this.equipment.weapon.baseDamage;
        }
        return Math.round(damage);
    }

    /**
     * Get total defense with bonuses
     */
    getTotalDefense() {
        let defense = this.stats.defense + this.bonuses.defense;
        if (this.equipment.armor) {
            defense += this.equipment.armor.defense || 0;
        }
        if (this.equipment.helmet) {
            defense += this.equipment.helmet.defense || 0;
        }
        if (this.equipment.boots) {
            defense += this.equipment.boots.defense || 0;
        }
        return Math.round(defense);
    }

    /**
     * Save player data
     */
    toJSON() {
        return {
            position: { x: this.position.x, y: this.position.y },
            level: this.level,
            experience: this.experience,
            health: this.health,
            mana: this.mana,
            stamina: this.stamina,
            stats: this.stats,
            coins: this.coins,
            equipment: Object.fromEntries(
                Object.entries(this.equipment).map(([key, item]) => [key, item ? item.id : null])
            ),
            inventory: this.inventory.items,
            activeQuests: this.activeQuests.map(q => q.id),
            completedQuests: this.completedQuests
        };
    }

    /**
     * Load player data
     */
    fromJSON(data) {
        this.position = new Vector2(data.position.x, data.position.y);
        this.level = data.level;
        this.experience = data.experience;
        this.health = Math.min(data.health, this.maxHealth);
        this.mana = Math.min(data.mana, this.maxMana);
        this.stamina = Math.min(data.stamina, this.maxStamina);
        this.stats = data.stats;
        this.coins = data.coins;
        this.completedQuests = data.completedQuests || [];
    }
}
