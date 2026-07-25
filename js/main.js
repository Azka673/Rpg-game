/**
 * Entry point - initialize canvas and start game
 */
document.addEventListener('DOMContentLoaded', () => {
	const canvas = document.getElementById('gameCanvas');
	function resize() {
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;
	}
	window.addEventListener('resize', resize);
	resize();

	// create game
	const g = new Game(canvas);

	// setup simple input
	const keys = {};
	window.addEventListener('keydown', (e)=> { keys[e.key.toLowerCase()] = true; });
	window.addEventListener('keyup', (e)=> { keys[e.key.toLowerCase()] = false; });
	canvas.addEventListener('mousemove', (e) => {
		const rect = canvas.getBoundingClientRect();
		const mouse = new Vector2(e.clientX - rect.left, e.clientY - rect.top);
		const worldPos = g.camera.screenToWorld(mouse);
		// update player direction
		g.player.direction = Utils.getAngle(g.player.position, worldPos);
	});
	canvas.addEventListener('mousedown', (e) => {
		// left click attack
		g.player.attack();
	});

	// keyboard abilities
	setInterval(()=>{
		const dir = new Vector2(0,0);
		if (keys['w'] || keys['arrowup']) dir.y -= 1;
		if (keys['s'] || keys['arrowdown']) dir.y += 1;
		if (keys['a'] || keys['arrowleft']) dir.x -= 1;
		if (keys['d'] || keys['arrowright']) dir.x += 1;
		if (dir.length() > 0) g.player.move(dir.normalize());
		if (keys['e']) g.player.fireArrow();
		if (keys['q']) g.player.castFireball();
		if (keys[' ']) g.player.castUltimate();
	}, 60);

	// attach to window for console debugging
	window.gameInstance = g;

	// start
	g.start();
});
