// ─────────────────────────────────────────────────────────────────────────────
//  InputManager — keyboard + touch joystick
//  Touch: left-half drag = movement joystick, right-half tap = Enter/Esc
// ─────────────────────────────────────────────────────────────────────────────

export class InputManager {
  constructor() {
    this._held     = new Set();
    this._just     = new Set();
    this._released = new Set();

    // Touch state
    this._touchVx  = 0;
    this._touchVy  = 0;
    this._touches  = {};   // id → { startX, startY, curX, curY, side }

    this._bindKeyboard();
    this._bindTouch();
  }

  // ── Keyboard ────────────────────────────────────────────────────────────────
  _bindKeyboard() {
    window.addEventListener('keydown', e => {
      if (!this._held.has(e.code)) this._just.add(e.code);
      this._held.add(e.code);
      this._released.delete(e.code);
    });
    window.addEventListener('keyup', e => {
      this._held.delete(e.code);
      this._just.delete(e.code);
      this._released.add(e.code);
    });
    window.addEventListener('mousedown', () => {
      this._just.add('MouseLeft');
      this._held.add('MouseLeft');
    });
    window.addEventListener('mouseup', () => {
      this._held.delete('MouseLeft');
    });
  }

  // ── Touch ────────────────────────────────────────────────────────────────────
  _bindTouch() {
    const onStart = (e) => {
      e.preventDefault();
      this._just.add('MouseLeft');   // dismiss intro
      this._held.add('MouseLeft');
      Array.from(e.changedTouches).forEach(t => {
        const side = t.clientX < window.innerWidth / 2 ? 'left' : 'right';
        this._touches[t.identifier] = {
          startX: t.clientX, startY: t.clientY,
          curX: t.clientX,   curY: t.clientY,
          side,
        };
        // Right-side tap = Enter (enter / exit bubble)
        if (side === 'right') {
          this._just.add('Enter');
          this._held.add('Enter');
        }
      });
    };

    const onMove = (e) => {
      e.preventDefault();
      Array.from(e.changedTouches).forEach(t => {
        const s = this._touches[t.identifier];
        if (!s) return;
        s.curX = t.clientX;
        s.curY = t.clientY;
      });
      this._updateTouchMovement();
    };

    const onEnd = (e) => {
      e.preventDefault();
      this._held.delete('MouseLeft');
      Array.from(e.changedTouches).forEach(t => {
        const s = this._touches[t.identifier];
        if (!s) return;
        if (s.side === 'right') {
          this._held.delete('Enter');
          this._released.add('Enter');
        }
        delete this._touches[t.identifier];
      });
      this._updateTouchMovement();
    };

    window.addEventListener('touchstart',  onStart, { passive: false });
    window.addEventListener('touchmove',   onMove,  { passive: false });
    window.addEventListener('touchend',    onEnd,   { passive: false });
    window.addEventListener('touchcancel', onEnd,   { passive: false });
  }

  _updateTouchMovement() {
    let vx = 0, vy = 0;
    const DEAD = 8;     // pixels deadzone
    const MAX  = 55;    // pixels for full speed
    Object.values(this._touches).forEach(s => {
      if (s.side !== 'left') return;
      const dx = s.curX - s.startX;
      const dy = s.curY - s.startY;
      const d  = Math.hypot(dx, dy);
      if (d < DEAD) return;
      const norm = Math.min(1, (d - DEAD) / (MAX - DEAD));
      vx += (dx / d) * norm;
      vy += (dy / d) * norm;
    });
    // Clamp and normalise diagonal
    const len = Math.hypot(vx, vy);
    if (len > 1) { vx /= len; vy /= len; }
    this._touchVx = vx;
    this._touchVy = vy;
  }

  // ── Public API ───────────────────────────────────────────────────────────────
  held(code)        { return this._held.has(code); }
  justPressed(code) { return this._just.has(code); }
  justReleased(code){ return this._released.has(code); }
  anyJustPressed()  { return this._just.size > 0; }

  // Returns merged keyboard + touch vector
  movement() {
    let vx = this._touchVx;
    let vy = this._touchVy;
    if (this.held('ArrowLeft')  || this.held('KeyA')) vx -= 1;
    if (this.held('ArrowRight') || this.held('KeyD')) vx += 1;
    if (this.held('ArrowUp')    || this.held('KeyW')) vy -= 1;
    if (this.held('ArrowDown')  || this.held('KeyS')) vy += 1;
    const len = Math.hypot(vx, vy);
    if (len > 1) { vx /= len; vy /= len; }
    return { vx, vy };
  }

  // Returns active touch info for joystick UI rendering
  getTouches() { return this._touches; }

  flush() {
    this._just.clear();
    this._released.clear();
  }
}
