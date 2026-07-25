/**
 * UI Manager - updates HUD, panels, notifications
 */
class UIManager {
	constructor() {
		this.healthFill = document.getElementById('healthFill');
		this.manaFill = document.getElementById('manaFill');
		this.staminaFill = document.getElementById('staminaFill');
		this.healthText = document.getElementById('healthText');
		this.manaText = document.getElementById('manaText');
		this.staminaText = document.getElementById('staminaText');
		this.expFill = document.getElementById('expFill');
		this.playerLevel = document.getElementById('playerLevel');

		this.notifications = document.getElementById('notifications');
		this.floatingDamage = document.getElementById('floatingDamage');

		this.panels = document.querySelectorAll('.panel');
		this.bindUI();
	}

	bindUI() {
		document.querySelectorAll('.panel .close-btn').forEach(btn => btn.addEventListener('click', (e)=>{
			e.target.closest('.panel').classList.add('hidden');
		}));

		document.getElementById('inventoryBtn').addEventListener('click', ()=>{
			document.getElementById('inventoryPanel').classList.toggle('hidden');
			this.renderInventory();
		});
		document.getElementById('mapBtn').addEventListener('click', ()=> document.getElementById('mapPanel').classList.toggle('hidden'));
		document.getElementById('statsBtn').addEventListener('click', ()=> document.getElementById('statsPanel').classList.toggle('hidden'));
		document.getElementById('questBtn').addEventListener('click', ()=> document.getElementById('questPanel').classList.toggle('hidden'));
		document.getElementById('settingsBtn').addEventListener('click', ()=> document.getElementById('settingsPanel').classList.toggle('hidden'));

		// Save/load buttons
		document.getElementById('saveGameBtn').addEventListener('click', ()=> game.saveGame());
		document.getElementById('loadGameBtn').addEventListener('click', ()=> game.loadGame());
		document.getElementById('newGameBtn').addEventListener('click', ()=> location.reload());
	}

	update(deltaTime) {
		if (!game || !game.player) return;
		const p = game.player;
		this.healthFill.style.width = `${(p.health / p.maxHealth) * 100}%`;
		this.manaFill.style.width = `${(p.mana / p.maxMana) * 100}%`;
		this.staminaFill.style.width = `${(p.stamina / p.maxStamina) * 100}%`;
		this.healthText.textContent = `${Math.round(p.health)}/${p.maxHealth}`;
		this.manaText.textContent = `${Math.round(p.mana)}/${p.maxMana}`;
		this.staminaText.textContent = `${Math.round(p.stamina)}/${p.maxStamina}`;
		this.playerLevel.textContent = p.level;
		this.expFill.style.width = `${(p.experience / p.expToNextLevel) * 100}%`;
	}

	showFloatingDamage(position, text, type='damage') {
		const el = document.createElement('div');
		el.className = `floating-text ${type}`;
		el.textContent = text;
		const screen = game.camera.worldToScreen(position);
		el.style.left = `${screen.x}px`;
		el.style.top = `${screen.y}px`;
		this.floatingDamage.appendChild(el);
		setTimeout(()=> el.classList.add('rise'), 20);
		setTimeout(()=> el.remove(), 1500);
	}

	showNotification(text, type='info', timeout=3000) {
		const n = document.createElement('div');
		n.className = `notification ${type}`;
		n.textContent = text;
		this.notifications.appendChild(n);
		setTimeout(()=> n.classList.add('visible'), 20);
		setTimeout(()=> { n.classList.remove('visible'); n.remove(); }, timeout);
	}

	renderInventory() {
		const grid = document.getElementById('inventoryGrid');
		grid.innerHTML = '';
		if (!game || !game.player) return;
		game.player.inventory.items.forEach(item => {
			const it = document.createElement('div');
			it.className = 'inv-item';
			it.textContent = item.name || item.id;
			grid.appendChild(it);
		});
	}
}
