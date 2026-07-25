/**
 * Combat utilities: Projectile and basic hit detection
 */
class Projectile {
	constructor(position, direction, type = 'arrow', speed = 400) {
		this.position = position.clone();
		this.direction = direction.normalize();
		this.type = type;
		this.speed = speed;
		this.isDead = false;
		this.radius = type === 'arrow' ? 4 : 8;
		this.owner = null;
	}

	update(deltaTime) {
		const move = this.direction.multiply(this.speed * deltaTime);
		this.position = this.position.add(move);

		// check collision with enemies
		if (game && game.world) {
			game.world.enemies.forEach((enemy) => {
				if (!enemy || enemy.health <= 0) return;
				if (Utils.circlesCollide(this.position, this.radius, enemy.position, enemy.radius)) {
					// apply damage
					const dmg = this.type === 'fireball' ? 30 : 12;
					enemy.takeDamage(dmg, this.direction);
					this.isDead = true;
				}
			});
		}
	}

	draw(ctx, camera) {
		const screen = camera.worldToScreen(this.position);
		ctx.save();
		if (this.type === 'arrow') ctx.fillStyle = '#b5651d';
		else if (this.type === 'fireball') ctx.fillStyle = '#ff6b6b';
		else ctx.fillStyle = '#fff';
		ctx.beginPath();
		ctx.arc(screen.x, screen.y, this.radius, 0, Math.PI*2);
		ctx.fill();
		ctx.restore();
	}

	isOutOfBounds(w, h) {
		return this.position.x < 0 || this.position.y < 0 || this.position.x > w || this.position.y > h || this.isDead;
	}
}
