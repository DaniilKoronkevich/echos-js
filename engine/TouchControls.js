// ─────────────────────────────────────────────────────────────────────────────
//  TouchControls — draws virtual joystick and action button on a HUD canvas
//  Only rendered when a touch device is detected.
// ─────────────────────────────────────────────────────────────────────────────

export class TouchControls {
  constructor() {
    this._canvas = document.createElement('canvas');
    this._canvas.style.cssText = `
      position:fixed; inset:0; width:100%; height:100%;
      pointer-events:none; z-index:5;
    `;
    document.body.appendChild(this._canvas);
    this._ctx = this._canvas.getContext('2d');
    this._resize();
    window.addEventListener('resize', () => this._resize());
    this._visible = false;
  }

  _resize() {
    this._canvas.width  = window.innerWidth;
    this._canvas.height = window.innerHeight;
  }

  // Call every HUD frame, passing InputManager
  draw(input) {
    const touches = input.getTouches();
    const hasTouches = Object.keys(touches).length > 0;

    // Show only if touch is being used
    if (!hasTouches && !this._visible) return;
    if (hasTouches) this._visible = true;

    const ctx = this._ctx;
    const W = this._canvas.width;
    const H = this._canvas.height;
    ctx.clearRect(0, 0, W, H);

    const DEAD = 8, MAX = 55;

    // ── Left joystick ──────────────────────────────────────────────────────────
    let leftTouch = null;
    Object.values(touches).forEach(t => { if (t.side === 'left') leftTouch = t; });

    if (leftTouch) {
      const bx = leftTouch.startX, by = leftTouch.startY;
      const cx = leftTouch.curX,   cy = leftTouch.curY;
      const dx = cx - bx, dy = cy - by;
      const d  = Math.hypot(dx, dy);

      // Base ring
      ctx.beginPath(); ctx.arc(bx, by, MAX, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255,255,255,0.12)';
      ctx.lineWidth = 1.5; ctx.stroke();

      // Knob position (clamped to MAX)
      const kd  = Math.min(d, MAX);
      const ang = Math.atan2(dy, dx);
      const kx  = bx + Math.cos(ang) * kd;
      const ky  = by + Math.sin(ang) * kd;

      // Knob
      ctx.beginPath(); ctx.arc(kx, ky, 22, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,0.10)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.28)';
      ctx.lineWidth = 1.5; ctx.stroke();

      // Direction indicator line
      if (d > DEAD) {
        ctx.beginPath();
        ctx.moveTo(bx, by);
        ctx.lineTo(kx, ky);
        ctx.strokeStyle = 'rgba(255,255,255,0.18)';
        ctx.lineWidth = 1; ctx.stroke();
      }
    }

    // ── Right action button ────────────────────────────────────────────────────
    let rightTouch = null;
    Object.values(touches).forEach(t => { if (t.side === 'right') rightTouch = t; });

    const rx = W * 0.82, ry = H * 0.75;
    // Ghost button always shown on right side as hint
    ctx.beginPath(); ctx.arc(rx, ry, 28, 0, Math.PI * 2);
    ctx.fillStyle = rightTouch ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.04)';
    ctx.fill();
    ctx.strokeStyle = rightTouch ? 'rgba(255,255,255,0.42)' : 'rgba(255,255,255,0.14)';
    ctx.lineWidth = 1.5; ctx.stroke();

    // Label
    ctx.font = '400 9px -apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial, sans-serif';
    ctx.fillStyle = rightTouch ? 'rgba(255,255,255,0.80)' : 'rgba(255,255,255,0.22)';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('enter', rx, ry);
  }
}
