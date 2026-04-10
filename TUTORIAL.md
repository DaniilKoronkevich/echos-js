# ECHOS — Code Tutorial

A walkthrough of how the browser version works. Written for someone who knows JS basics but hasn't built a canvas game before.

---

## 1. The entry point: index.html

`index.html` does three things:

**Overlay** — the black screen you see before clicking. It's a `<div id="overlay">` with CSS. When you click, it's hidden and `engine.start()` is called.

**Canvas** — `<canvas id="c">` is where everything is drawn. It fills the whole window and resizes on window resize.

**Volume mixer** — the `<div id="vol-panel">` in the bottom right. Range inputs write to `window._COSMOS_VOL` object which AudioManager reads every frame.

The game boots in a `<script type="module">`:
```js
import { Engine }   from './engine/Engine.js';
import { WorldOne } from './worlds/world_01.js';

const engine = new Engine('c');
engine.loadWorld(new WorldOne());
// starts on click/keydown
```

---

## 2. The game loop: Engine.js

`Engine` owns the canvas and runs `requestAnimationFrame`. Every frame:

```js
tick(ts) {
  const delta = (ts - this._last) / 1000;  // seconds since last frame
  this._last = ts;
  this._world.update(delta, ts);            // update world logic
  this._world.draw(this._ctx, ts);          // draw everything
  requestAnimationFrame(t => this.tick(t)); // schedule next frame
}
```

`delta` (time between frames) keeps movement frame-rate independent. At 60fps delta ≈ 0.016s, at 30fps delta ≈ 0.033s. Multiply velocity by delta and the character moves the same distance per second regardless of fps.

---

## 3. Drawing: Canvas 2D API

Everything is drawn with the browser's built-in Canvas 2D context (`ctx`). No WebGL, no libraries.

Key pattern — **save / transform / draw / restore**:
```js
ctx.save();
ctx.translate(x, y);   // move origin to character position
ctx.rotate(lean);       // tilt the whole drawing
ctx.scale(facing, 1);  // flip horizontally for left/right direction
// ... draw body, backpack, legs, arms, head ...
ctx.restore();          // undo all transforms
```

**Bezier curves** — the character body parts and fire flames are drawn as bezier paths:
```js
ctx.beginPath();
ctx.moveTo(x0, y0);
ctx.bezierCurveTo(cx1, cy1, cx2, cy2, x1, y1); // cubic bezier
ctx.fill();
```

**Rounded rectangles** — the torso and backpack use `ctx.roundRect()`:
```js
ctx.beginPath();
ctx.roundRect(x, y, width, height, radius);
ctx.fill();
ctx.stroke();
```

---

## 4. The character: world_01.js → `_drawPlayer()`

The character has no sprite. It's ~150 lines of canvas draw calls.

**Animation** uses `sin()` waves:
```js
const walk  = sin(time * 5.0) * 0.22 * S;   // leg swing
const bob   = sin(time * 5.0) * 2.6;         // vertical bounce
const lean  = vel.x * 0.0005;                // tilt on movement
const breath = sin(time * 1.4) * 7;          // idle breathing
```

**Facing direction** — flipped by `ctx.scale(-1, 1)` when moving left. This mirrors all draw calls so you never need left-facing versions of anything.

**Z-order** — things drawn first appear behind. Order: shadow → backpack → legs → torso → arms → neck → head → hair → face.

---

## 5. The stone world: WorldBase.js

**Tiled texture** — the stone background is drawn by repeating `stone_texture.jpg`:
```js
const pat = ctx.createPattern(stoneImg, 'repeat');
ctx.fillStyle = pat;
ctx.fillRect(-WORLD/2, -WORLD/2, WORLD, WORLD);
```

**Camera** — the world is centered on the player by translating the entire canvas:
```js
ctx.save();
ctx.translate(
  canvas.width/2  - player.x,
  canvas.height/2 - player.y
);
// draw everything in world space
ctx.restore();
```

**Grain / vignette post-FX** — applied after drawing everything else, in screen space:
```js
// grain: random per-pixel noise each frame
// vignette: radial dark gradient from edges
```

---

## 6. Fires: WorldBase.js → `_drawFire()`

Each fire is a bezier shape drawn in two layers (outer + inner flame).

```js
_drawFire(ctx, x, y, t) {
  const sway = sin(t * 2.3 + seed) * 4;    // wind movement
  const height = 40 + sin(t * 3.1) * 6;    // flickering height

  ctx.save();
  ctx.translate(x, y);
  ctx.scale(2.8, 2.8);   // fire scale

  // outer flame (dark)
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.bezierCurveTo(w, 0, w + sway, -h*0.6, sway*0.5, -h);
  ctx.bezierCurveTo(-w + sway, -h*0.6, -w, 0, 0, 0);
  ctx.fill();

  // inner flame (bright)
  // ... same but smaller and lighter color
  ctx.restore();
}
```

**Proximity activation** — fires within range of the player are `active = true`. Active fires play audio. Fires outside range are drawn dimmer and don't play sound.

---

## 7. Spatial audio: AudioManager.js

Audio uses the **Web Audio API** with **ResonanceAudio** (Google's HRTF library) when available, falling back to basic stereo pan.

```js
// Create a source at world position (x, y)
const source = resonanceScene.createSource();
source.setPosition(x, 0, y);   // x=left/right, y=depth (we use 0), z=forward/back

// Connect OGG/Opus audio
const audioSrc = audioCtx.createBufferSource();
audioSrc.buffer = loadedBuffer;
audioSrc.connect(source.input);
audioSrc.start();
```

**Listener** follows the player:
```js
resonanceScene.setListenerPosition(player.x, 0, player.y);
resonanceScene.setListenerOrientation(...);  // from player direction
```

**Volume** — the global `window._COSMOS_VOL` object controls gain nodes for each audio category (world, fires, bubbles) and is updated by the UI sliders in real-time.

---

## 8. Lore bubbles

Walking near certain world objects triggers a "bubble" — a floating text panel that plays an audio fragment. The bubble fades in/out, pauses the world, plays the audio. All handled in `world_01.js → _checkBubbles()`.

---

## 9. Adding a new world

Create `worlds/world_02.js`:
```js
import { WorldBase } from './WorldBase.js';

export class WorldTwo extends WorldBase {
  constructor() {
    super();
    this.fires = [/* your fire positions */];
    this.lore  = [/* your lore texts */];
  }

  update(delta, t) {
    super.update(delta, t);  // handles player, camera, base audio
    // your custom logic
  }

  draw(ctx, t) {
    super.draw(ctx, t);  // ground, fires, lore
    // your custom draw calls
  }
}
```

In `index.html`:
```js
import { WorldTwo } from './worlds/world_02.js';
engine.loadWorld(new WorldTwo());
```

---

## 10. Key numbers

| Constant | Value | Meaning |
|---|---|---|
| `WORLD` | 4000px | Total world size |
| `PLAYER_SPEED` | 280 px/s | Max movement speed |
| `FRICTION` | 0.88^frame | Exponential slowdown |
| `FIRE_RADIUS` | 180px | Proximity activation range |
| `CAM_SMOOTH` | 0.08 | Camera lag factor |
| `FIRE_SCALE` | 2.8 | ctx.scale for fire drawing |
