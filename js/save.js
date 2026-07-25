/**
 * Save system - localStorage based with export/import (cloud-ready)
 */
const SaveManager = (function(){
	const KEY = 'adventure_rpg_save_v1';

	function saveGame(gameState) {
		try {
			const json = JSON.stringify(gameState);
			localStorage.setItem(KEY, json);
			return true;
		} catch (e) {
			console.error('Save failed', e);
			return false;
		}
	}

	function loadGame() {
		try {
			const json = localStorage.getItem(KEY);
			if (!json) return null;
			return JSON.parse(json);
		} catch (e) {
			console.error('Load failed', e);
			return null;
		}
	}

	function exportSave() {
		const data = localStorage.getItem(KEY) || '';
		const blob = new Blob([data], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = 'adventure_rpg_save.json';
		a.click();
		URL.revokeObjectURL(url);
	}

	function importSave(file, cb) {
		const reader = new FileReader();
		reader.onload = () => {
			try {
				const json = reader.result;
				const parsed = JSON.parse(json);
				localStorage.setItem(KEY, JSON.stringify(parsed));
				if (cb) cb(true);
			} catch (e) { if (cb) cb(false); }
		};
		reader.readAsText(file);
	}

	return { saveGame, loadGame, exportSave, importSave };
})();
