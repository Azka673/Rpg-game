/**
 * Particle system - lightweight particle manager
 */
class Particle {
	constructor(position, velocity, life, color, size = 3) {
		this.position = position.clone();
		this.velocity = velocity.clone();
		this.life = life;
		this.maxLife = life;
		this.color = color;
		this.size = size;
		this.isDead = false;
	}

	update(deltaTime) {
		this.position = this.position.add(this.velocity.multiply(deltaTime));
		this.life -= deltaTime;
		if (this.life <= 0) this.isDead = true;
	}

	draw(ctx, camera) {
		const screen = camera.worldToScreen(this.position);
		ctx.save();
		const alpha = Math.max(0, this.life / this.maxLife);
		ctx.globalAlpha = alpha;
		ctx.fillStyle = this.color;
		ctx.beginPath();
		ctx.arc(screen.x, screen.y, this.size, 0, Math.PI * 2);
		ctx.fill();
		ctx.restore();
	}
}

class ParticleManager {
	constructor(world) {
		this.world = world;
		this.particles = [];
	}

	create(type, position, direction = 0) {
		switch(type) {
			case 'slash':
				for (let i=0;i<8;i++) {
					const v = Vector2.fromAngle(direction + Utils.randomFloat(-0.8,0.8), Utils.randomFloat(30,80));
					this.particles.push(new Particle(position.clone(), v, 0.6, '#ffd27f', 2 + Math.random()*2));
				}
				break;
			case 'magic':
				for (let i=0;i<14;i++) {
					const v = Vector2.fromAngle(Utils.randomFloat(0,Math.PI*2), Utils.randomFloat(10,60));
					this.particles.push(new Particle(position.clone(), v, 1.0, '#ff6b6b', 2 + Math.random()*3));
				}
				break;
			case 'ultimate':
				for (let i=0;i<40;i++) {
					const v = Vector2.fromAngle(Utils.randomFloat(0,Math.PI*2), Utils.randomFloat(40,180));
					this.particles.push(new Particle(position.clone(), v, 1.4, '#f5f3ce', 3 + Math.random()*4));
				}
				break;
			default:
				this.particles.push(new Particle(position.clone(), Vector2.fromAngle(Utils.randomFloat(0,Math.PI*2), Utils.randomFloat(10,80)), 0.8, '#ffffff', 2));
		}
	}

	update(deltaTime) {
		this.particles.forEach((p, i) => {
			p.update(deltaTime);
			if (p.isDead) this.particles.splice(i,1);
		});
	}

	draw(ctx, camera) {
		this.particles.forEach(p => p.draw(ctx, camera));
	}
}

