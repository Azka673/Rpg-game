/**
 * Quest system - simple quest objects and manager
 */
class Quest {
	constructor(id, title, description, objectives = []) {
		this.id = id;
		this.title = title;
		this.description = description;
		this.objectives = objectives; // [{type:'kill', target:'goblin', count:3, progress:0}]
		this.completed = false;
	}

	update() {
		if (this.completed) return;
		this.completed = this.objectives.every(o => (o.progress || 0) >= o.count);
	}

	toJSON() {
		return { id: this.id, title: this.title, description: this.description, objectives: this.objectives, completed: this.completed };
	}
}

class QuestManager {
	constructor(player) {
		this.player = player;
		this.quests = {};
	}

	addQuest(q) {
		this.quests[q.id] = q;
		this.player.availableQuests.push(q.id);
	}

	acceptQuest(id) {
		const q = this.quests[id];
		if (!q) return;
		this.player.activeQuests.push(q);
		const idx = this.player.availableQuests.indexOf(id);
		if (idx >= 0) this.player.availableQuests.splice(idx,1);
	}

	update() {
		Object.values(this.quests).forEach(q => q.update());
	}
}

