# ECHOS — browser version (10.04.26)

> *A procedural world built from sound and stone.*

Atmospheric 2D exploration in the browser. A figure with a backpack wanders across ancient stone, past burning fires and weathered ruins. Everything rendered in code via Canvas 2D API — no sprites, no game engine, no dependencies.

**[Play live →](https://DaniilKoronkevich.github.io/echos-js)**

---

## Run locally

```bash
# Any static server works:
npx serve .
# or
python3 -m http.server 8080
# then open http://localhost:8080
```

No build step. No bundler. Pure ES modules.

---

## Structure

```
echos_10_04_26/
├── index.html                    ← entry point, overlay, volume mixer
├── sw.js                         ← service worker (cache busting)
│
├── engine/
│   ├── Engine.js                 ← game loop, world loading, resize
│   ├── AudioManager.js           ← spatial audio, ResonanceAudio HRTF
│   ├── InputManager.js           ← keyboard + touch input
│   └── Renderer.js               ← canvas context, clear, grain/vignette
│
├── worlds/
│   ├── WorldBase.js              ← base class: stone texture, lore, fires
│   ├── world_01.js               ← world 1: player, objects, audio wiring
│   └── world_01_config.json      ← lore texts, fire positions
│
└── sources/
    ├── audio/
    │   ├── fires/                ← 13 fire recordings (.opus)
    │   ├── bubbles/              ← bubble/lore audio (.opus/.ogg)
    │   └── ambient/              ← world ambient loop (.ogg)
    └── photo/
        └── stone_texture.jpg     ← tiling ground texture
```

---

## How it works

See **[TUTORIAL.md](./TUTORIAL.md)** for a full code walkthrough — Canvas API, bezier curves, spatial audio, the animation loop.

---

## Godot port

The same project ported to Godot 4 (GDScript) lives at:
**[github.com/DaniilKoronkevich/echos-godot](https://github.com/DaniilKoronkevich/echos-godot)**

---

*Field recordings · Spatial audio · Canvas 2D · Vanilla JS*
