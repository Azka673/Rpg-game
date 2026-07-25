/*
 * Audio Manager
 * - Simple wrapper around HTMLAudioElement for music and SFX
 */
const AudioManager = (function(){
	const sounds = {};
	let music = null;
	let masterVolume = 1;
	let musicVolume = 0.7;
	let sfxVolume = 0.9;

	function load(name, src, loop = false) {
		const a = new Audio(src);
		a.loop = loop;
		a.preload = 'auto';
		sounds[name] = a;
	}

	function playSound(name, opts = {}) {
		const s = sounds[name];
		if (!s) return;
		try {
			const clone = s.cloneNode();
			clone.volume = (opts.volume ?? 1) * sfxVolume * masterVolume;
			clone.play().catch(()=>{});
		} catch (e) {
			// fallback
			s.volume = (opts.volume ?? 1) * sfxVolume * masterVolume;
			s.currentTime = 0;
			s.play().catch(()=>{});
		}
	}

	function playMusic(name) {
		if (music && music.name === name) return;
		if (music) { music.pause(); }
		const s = sounds[name];
		if (!s) return;
		music = s;
		music.loop = true;
		music.volume = musicVolume * masterVolume;
		music.play().catch(()=>{});
		music.name = name;
	}

	function stopMusic() {
		if (music) music.pause();
	}

	function setVolumes({ master, music: m, sfx: s }) {
		if (master !== undefined) masterVolume = Utils.clamp(master, 0, 1);
		if (m !== undefined) musicVolume = Utils.clamp(m, 0, 1);
		if (s !== undefined) sfxVolume = Utils.clamp(s, 0, 1);
		if (music) music.volume = musicVolume * masterVolume;
	}

	return {
		load,
		playSound,
		playMusic,
		stopMusic,
		setVolumes
	};
})();
