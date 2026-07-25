/**
 * NPC with simple daily routine and dialogue
 */
class NPC {
	constructor(x, y, data = {}) {
		this.position = new Vector2(x, y);
		this.home = this.position.clone();
		this.name = data.name || data.role || 'NPC';
		this.role = data.role || 'villager';
		this.dialogue = data.dialogue || 'Hello.';
		this.icon = data.icon || '🙂';
		this.radius = 10;
		this.state = 'idle';
		this.walkTarget = null;
		this.speed = 1.2;
		this.memory = {};
	}

	update(deltaTime) {
		// simple schedule: wander near home, go inside at night
		const day = game && game.world ? game.world.timeOfDay : 0.5;
		if (day < 0.2 || day > 0.8) {
			// night: stay at home
			this.walkTarget = this.home;
			this.speed = 0.6;
		} else {
			// day: random wandering
			if (!this.walkTarget || Math.random() < 0.005) {
				this.walkTarget = new Vector2(this.home.x + Utils.randomFloat(-120,120), this.home.y + Utils.randomFloat(-120,120));
				this.speed = Utils.randomFloat(0.8,1.6);
			}
		}

		if (this.walkTarget) {
			const dir = Utils.getDirection(this.position, this.walkTarget);
			this.position = this.position.add(dir.multiply(this.speed * deltaTime));
			if (this.position.distance(this.walkTarget) < 5) this.walkTarget = null;
		}
	}

	draw(ctx, camera) {
		const screen = camera.worldToScreen(this.position);
		ctx.fillStyle = '#f5f5f5';
		ctx.beginPath();
		ctx.arc(screen.x, screen.y, this.radius, 0, Math.PI*2);
		ctx.fill();
		// name
		ctx.fillStyle = '#222';
		ctx.font = '12px sans-serif';
		ctx.fillText(this.name, screen.x - this.radius, screen.y - this.radius - 8);
	}

	toJSON() {
		return { name: this.name, role: this.role, x: this.position.x, y: this.position.y };
	}
}
