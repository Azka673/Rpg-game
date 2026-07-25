/**
 * Simple Inventory system
 */
class Inventory {
	constructor(owner, size = 40) {
		this.owner = owner;
		this.size = size;
		this.items = []; // { id, name, type, qty, rarity, bonuses }
	}

	addItem(item) {
		// stackable check
		if (item.stackable) {
			const existing = this.items.find(i => i.id === item.id);
			if (existing) { existing.qty += item.qty || 1; return true; }
		}

		if (this.items.length >= this.size) return false;
		this.items.push(Object.assign({ qty: 1 }, item));
		return true;
	}

	removeItem(itemId, qty = 1) {
		const idx = this.items.findIndex(i => i.id === itemId);
		if (idx === -1) return false;
		const item = this.items[idx];
		if (item.qty > qty) { item.qty -= qty; return true; }
		this.items.splice(idx, 1);
		return true;
	}

	find(itemId) {
		return this.items.find(i => i.id === itemId);
	}

	toJSON() {
		return this.items;
	}

	fromJSON(arr) {
		this.items = arr || [];
	}
}
