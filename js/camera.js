/**
 * Camera - follows the player and provides screen conversion helpers
 */
class Camera {
	constructor(canvas) {
		this.canvas = canvas;
		this.x = 0;
		this.y = 0;
		this.shake = { x:0, y:0 };
		this.follow = null;
	}

	followEntity(entity) {
		this.follow = entity;
	}

	update(deltaTime) {
		if (this.follow) {
			// Smooth follow
			const targetX = this.follow.position.x;
			const targetY = this.follow.position.y;
			this.x = Utils.lerp(this.x, targetX, 0.12);
			this.y = Utils.lerp(this.y, targetY, 0.12);
		}
	}

	worldToScreen(pos) {
		return new Vector2(
			pos.x - this.x + this.canvas.width / 2,
			pos.y - this.y + this.canvas.height / 2
		);
	}

	screenToWorld(pos) {
		return new Vector2(
			pos.x + this.x - this.canvas.width / 2,
			pos.y + this.y - this.canvas.height / 2
		);
	}
}
