/**
 * Core Game class - initializes world, player, systems and runs loop
 */
class Game {
	constructor(canvas) {
		this.canvas = canvas;
		this.ctx = canvas.getContext('2d');
		this.world = new World(2000, 1600);
		this.player = new Player(this.world.spawnPoint.x, this.world.spawnPoint.y);
		this.camera = new Camera(this.canvas);
		this.camera.followEntity(this.player);
		this.ui = new UIManager();
		this.particles = new ParticleManager(this.world);
		this.questManager = new QuestManager(this.player);
		this.settings = { screenShake: true };

		// wire world particle usage
		this.world.particles = this.particles.particles;

		// attach to global for convenience
		window.game = this;

		this._last = performance.now();
		this._running = false;
	}

	start() {
		this._running = true;
		requestAnimationFrame(this._tick.bind(this));
	}

	_tick(ts) {
		const dt = Math.min(0.05, (ts - this._last) / 1000);
		this._last = ts;
		this.update(dt);
		this.render();
		if (this._running) requestAnimationFrame(this._tick.bind(this));
	}

	update(dt) {
		this.player.update(dt);
		this.world.update(dt);
		this.camera.update(dt);
		this.particles.update(dt);
		this.ui.update(dt);
		this.questManager.update();

		// update projectiles
		for (let i = this.world.projectiles.length-1;i>=0;i--) {
			const p = this.world.projectiles[i];
			p.update(dt);
			if (p.isOutOfBounds(this.world.width, this.world.height)) this.world.projectiles.splice(i,1);
		}
	}

	render() {
		const ctx = this.ctx;
		ctx.clearRect(0,0,this.canvas.width,this.canvas.height);

		// sky
		ctx.fillStyle = this.world.getSkyColor();
		ctx.fillRect(0,0,this.canvas.width,this.canvas.height);

		// draw world
		this.world.draw(ctx, this.camera);
		// draw player
		this.player.draw(ctx, this.camera);
		// draw particles
		this.particles.draw(ctx, this.camera);
	}

	saveGame() {
		const state = {
			player: this.player.toJSON(),
			world: this.world.toJSON()
		};
		SaveManager.saveGame(state);
		this.ui.showNotification('Game Saved', 'success');
	}

	loadGame() {
		const data = SaveManager.loadGame();
		if (!data) { this.ui.showNotification('No save found', 'error'); return; }
		if (data.player) this.player.fromJSON(data.player);
		this.ui.showNotification('Game Loaded', 'success');
	}
}

