Adventure RPG - Open World

This is a single-project HTML/CSS/JavaScript Adventure RPG prototype.

How to run

- Open `index.html` in a browser (Chrome/Edge recommended).
- Or serve the folder with a simple static server:

```bash
# Python 3
python -m http.server 8000
# then open http://localhost:8000
```

Project structure

- `index.html` — main page and UI scaffolding
- `css/` — styles (UI, responsive, animations)
- `js/` — game systems: `game.js`, `main.js`, `world.js`, `player.js`, `ui.js`, `npc.js`, `combat.js`, `particles.js`, `audio.js`, `save.js`, `inventory.js`, `quest.js`, `utils.js`
- `assets/` — place images and audio here (SFX/music placeholders referenced in `js/audio.js`)

Notes

- The project intentionally organizes systems into separate files for clarity.
- Many systems are implemented as working prototypes (AI, combat, particles, save/load).
- Replace or add assets in `assets/` and update the code where `AudioManager.load(...)` is called.

Next steps

- Add art and audio assets
- Expand enemy behaviors, quests and craft recipes
- Polish UI flows and animations

If you'd like, I can run through and implement more advanced features (fishing, farming, mounts, building) next.