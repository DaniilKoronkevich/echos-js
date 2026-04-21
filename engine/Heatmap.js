// ─────────────────────────────────────────────────────────────────────────────
//  Heatmap — anonymous local tracking of player movement + bubble visits
//
//  Storage: localStorage key "echos_heatmap_v1"
//  Grid: 96×68 cells (world 4200×3000 → ~43px per cell)
//  Bubble visits: counters per bubble id
//  All data stays on the user's device — nothing is sent anywhere.
//
//  Public API:
//    heatmap.record(wx, wy)          call every ~60 frames
//    heatmap.recordBubble(id)        call when entering a bubble
//    heatmap.draw(ctx, renderer)     overlay on HUD canvas (toggle with H)
//    heatmap.toggle()                show/hide overlay
//    heatmap.exportJSON()            returns shareable JSON string
//    heatmap.stats()                 returns { totalSteps, bubbleVisits }
// ─────────────────────────────────────────────────────────────────────────────

const KEY    = 'echos_heatmap_v1';
const COLS   = 96;
const ROWS   = 68;
const WW     = 4200;
const WH     = 3000;

export class Heatmap {
  constructor() {
    this._grid    = new Uint32Array(COLS * ROWS);
    this._bubbles = {};     // { id: count }
    this._visible = false;
    this._max     = 1;

    this._load();
    this._bindKey();
  }

  // ── Persistence ─────────────────────────────────────────────────────────────
  _load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return;
      const data = JSON.parse(raw);
      if (data.grid)    this._grid    = new Uint32Array(data.grid);
      if (data.bubbles) this._bubbles = data.bubbles;
      this._recalcMax();
    } catch(_) {}
  }

  _save() {
    try {
      localStorage.setItem(KEY, JSON.stringify({
        grid:    Array.from(this._grid),
        bubbles: this._bubbles,
        version: 1,
        updated: Date.now(),
      }));
    } catch(_) {}
  }

  _recalcMax() {
    this._max = Math.max(1, ...this._grid);
  }

  // ── Recording ────────────────────────────────────────────────────────────────
  record(wx, wy) {
    const col = Math.min(COLS - 1, Math.floor(wx / WW * COLS));
    const row = Math.min(ROWS - 1, Math.floor(wy / WH * ROWS));
    const idx = row * COLS + col;
    this._grid[idx]++;
    if (this._grid[idx] > this._max) this._max = this._grid[idx];
    // Save every 60 calls (~60 seconds at 1 call/sec)
    this._recordCount = (this._recordCount || 0) + 1;
    if (this._recordCount % 60 === 0) this._save();
  }

  recordBubble(id) {
    this._bubbles[id] = (this._bubbles[id] || 0) + 1;
    this._save();
  }

  // ── Keyboard toggle ──────────────────────────────────────────────────────────
  _bindKey() {
    window.addEventListener('keydown', e => {
      if (e.code === 'KeyH') this.toggle();
    });
  }

  toggle() { this._visible = !this._visible; }

  // ── Draw overlay ─────────────────────────────────────────────────────────────
  draw(ctx, renderer) {
    if (!this._visible) return;
    const { CW, CH } = renderer;

    // Minimap area — same position as existing minimap (top-right)
    const MW  = 200, MH = Math.round(200 * WH / WW);
    const MX  = CW - MW - 14, MY = 14;

    ctx.save();
    ctx.globalAlpha = 0.92;

    // Background
    ctx.fillStyle = 'rgba(0,0,0,0.72)';
    ctx.fillRect(MX - 6, MY - 6, MW + 12, MH + 52);

    // Grid cells
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const v = this._grid[r * COLS + c];
        if (v === 0) continue;
        const norm = Math.sqrt(v / this._max);   // sqrt for perceptual scaling
        const hue  = 200 - norm * 200;            // blue → red
        const px = MX + c / COLS * MW;
        const py = MY + r / ROWS * MH;
        const pw = MW / COLS + 0.5;
        const ph = MH / ROWS + 0.5;
        ctx.fillStyle = `hsla(${hue},90%,60%,${0.15 + norm * 0.72})`;
        ctx.fillRect(px, py, pw, ph);
      }
    }

    // World border
    ctx.strokeStyle = 'rgba(255,255,255,0.18)';
    ctx.lineWidth = 1;
    ctx.strokeRect(MX, MY, MW, MH);

    // Bubble visit markers
    const BUBBLE_POS = {
      1: { x: 300  / WW, y: 300  / WH, label: 'I'   },
      2: { x: 3900 / WW, y: 300  / WH, label: 'II'  },
      3: { x: 2100 / WW, y: 2700 / WH, label: 'III' },
    };
    Object.entries(BUBBLE_POS).forEach(([id, b]) => {
      const bx = MX + b.x * MW, by = MY + b.y * MH;
      const visits = this._bubbles[id] || 0;
      const r = visits > 0 ? 5 : 3;
      ctx.beginPath(); ctx.arc(bx, by, r, 0, Math.PI * 2);
      ctx.fillStyle = visits > 0 ? 'rgba(255,200,100,0.90)' : 'rgba(255,255,255,0.20)';
      ctx.fill();
      if (visits > 0) {
        ctx.font = '8px monospace';
        ctx.fillStyle = 'rgba(255,255,255,0.80)';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(visits + 'x', bx, by + 6);
      }
    });

    // Stats
    const stats = this.stats();
    ctx.font = '400 9px -apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial, sans-serif';
    ctx.fillStyle = 'rgba(200,190,160,0.55)';
    ctx.textAlign = 'left'; ctx.textBaseline = 'top';
    ctx.fillText(`steps: ${stats.totalSteps}`, MX, MY + MH + 8);
    ctx.fillText(`visits: I×${this._bubbles[1]||0}  II×${this._bubbles[2]||0}  III×${this._bubbles[3]||0}`, MX, MY + MH + 20);
    ctx.font = '400 8px monospace';
    ctx.fillStyle = 'rgba(200,190,160,0.28)';
    ctx.fillText('H — toggle  ·  local only', MX, MY + MH + 34);

    ctx.restore();
  }

  // ── Helpers ──────────────────────────────────────────────────────────────────
  stats() {
    const totalSteps = this._grid.reduce((a, b) => a + b, 0);
    return { totalSteps, bubbleVisits: { ...this._bubbles } };
  }

  exportJSON() {
    return JSON.stringify({
      heatmap: Array.from(this._grid),
      bubbles: this._bubbles,
      cols: COLS, rows: ROWS,
      worldSize: [WW, WH],
      exported: new Date().toISOString(),
    }, null, 2);
  }

  reset() {
    this._grid.fill(0);
    this._bubbles = {};
    this._max = 1;
    localStorage.removeItem(KEY);
  }
}
