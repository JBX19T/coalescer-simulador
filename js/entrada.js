// entrada.js — comando (PS4/DualShock 4 pela Gamepad API), teclado e rato, tudo convertido nas mesmas acções.
// Mapa "standard" do Chrome/Edge: 0 ✕, 1 ○, 2 □, 3 △, 4 L1, 5 R1, 6 L2, 7 R2, 8 Share, 9 Options, 10 L3, 11 R3, 12 ↑, 13 ↓, 14 ←, 15 →, 17 Touchpad.
(function (root) {
  const I = { keys: {}, mdx: 0, mdy: 0, locked: false, padName: '', padIndex: -1, usingPad: false, debug: [], _prev: {}, _kp: {}, onPad: null };
  const ACOES = ['a', 'b', 'x', 'y', 'l1', 'r1', 'l2', 'r2', 'share', 'options', 'l3', 'r3', 'up', 'down', 'left', 'right', 'ps', 'touch'];
  const BTN = { a: 0, b: 1, x: 2, y: 3, l1: 4, r1: 5, l2: 6, r2: 7, share: 8, options: 9, l3: 10, r3: 11, up: 12, down: 13, left: 14, right: 15, ps: 16, touch: 17 };
  const AX0 = { mx: { ax: 0, d: 1 }, my: { ax: 1, d: 1 }, lx: { ax: 2, d: 1 }, ly: { ax: 3, d: 1 } };
  const KEY = 'coalescer_comando_v1';
  // I.cfg = { map: {acção: índice de botão | {ax,d}}, ax: {mx,my,lx,ly} }; guardado no navegador
  function carregar() { try { const j = JSON.parse(localStorage.getItem(KEY)); if (j && j.map && j.ax) return j; } catch (e) { } return { map: Object.assign({}, BTN), ax: JSON.parse(JSON.stringify(AX0)) }; }
  I.cfg = carregar();
  I.guardar = function () { try { localStorage.setItem(KEY, JSON.stringify(I.cfg)); return true; } catch (e) { return false; } };
  I.repor = function () { I.cfg = { map: Object.assign({}, BTN), ax: JSON.parse(JSON.stringify(AX0)) }; try { localStorage.removeItem(KEY); } catch (e) { } };
  I.personalizado = function () { try { return !!localStorage.getItem(KEY); } catch (e) { return false; } };
  function lido(g, m) { if (typeof m === 'number') { const b = g.buttons[m]; return !!(b && (b.pressed || b.value > 0.5)); } if (m && typeof m === 'object') { const v = (g.axes[m.ax] || 0) * m.d; return v > 0.6; } return false; }
  function eixo(g, a) { return dz((g.axes[a.ax] || 0) * a.d); }
  const KEYMAP = { a: ['KeyE', 'Enter', 'Space'], b: ['Backspace', 'KeyQ', 'Escape'], x: ['KeyR'], y: ['KeyT'], l1: ['KeyZ', 'PageUp'], r1: ['KeyC', 'PageDown'], options: ['KeyH', 'F1'], touch: ['KeyG'], share: ['F2', 'KeyP'], up: ['ArrowUp'], down: ['ArrowDown'], left: ['ArrowLeft'], right: ['ArrowRight'] };
  const NUM = ['Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit5', 'Digit6', 'Digit7', 'Digit8'];
  I.ult = performance.now();   // instante da última actividade (para o modo quiosque)
  addEventListener('keydown', (e) => { I.ult = performance.now(); if (e.code.startsWith('Arrow') || e.code === 'Space' || e.code === 'F1') e.preventDefault(); I.keys[e.code] = true; I.usingPad = false; });
  addEventListener('keyup', (e) => { I.keys[e.code] = false; });
  addEventListener('blur', () => { I.keys = {}; });
  document.addEventListener('mousemove', (e) => { if (Math.abs(e.movementX) + Math.abs(e.movementY) > 2) I.ult = performance.now(); if (I.locked) { I.mdx += e.movementX; I.mdy += e.movementY; } });
  document.addEventListener('pointerlockchange', () => { I.locked = !!document.pointerLockElement; });
  addEventListener('gamepadconnected', (e) => { I.padName = e.gamepad.id; I.padIndex = e.gamepad.index; I.usingPad = true; if (I.onPad) I.onPad(true, e.gamepad.id); });
  addEventListener('gamepaddisconnected', (e) => { if (e.gamepad.index === I.padIndex) { I.padName = ''; I.padIndex = -1; if (I.onPad) I.onPad(false, e.gamepad.id); } });
  I.mouseDown = false; addEventListener('mousedown', () => { I.mouseDown = true; I.ult = performance.now(); }); addEventListener('mouseup', () => { I.mouseDown = false; });

  function pad() {
    const gps = navigator.getGamepads ? navigator.getGamepads() : []; let g = null;
    for (const p of gps) { if (p && p.connected) { if (!g || p.index === I.padIndex) g = p; } }
    if (g && I.padIndex < 0) { I.padIndex = g.index; I.padName = g.id; if (I.onPad) I.onPad(true, g.id); }
    return g;
  }
  const dz = (v) => Math.abs(v) < 0.16 ? 0 : (v - Math.sign(v) * 0.16) / 0.84;

  // devolve o estado deste fotograma: movimento, olhar, botões premidos agora (held) e botões que acabaram de ser premidos (pressed)
  I.poll = function () {
    const held = {}, s = { mx: 0, my: 0, lx: 0, ly: 0, held, pressed: {}, run: false, pad: false };
    const g = pad();
    if (g) {
      s.pad = true; s.mx = eixo(g, I.cfg.ax.mx); s.my = eixo(g, I.cfg.ax.my); s.lx = eixo(g, I.cfg.ax.lx); s.ly = eixo(g, I.cfg.ax.ly);
      for (const a of ACOES) held[a] = lido(g, I.cfg.map[a]);
      if (g.buttons.some((b) => b && b.pressed)) I.usingPad = true;
      s.run = typeof I.cfg.map.r2 === 'number' ? (g.buttons[I.cfg.map.r2] ? g.buttons[I.cfg.map.r2].value > 0.4 : false) : lido(g, I.cfg.map.r2);
      I.debug = g.buttons.map((b, i) => (b && b.pressed ? i : -1)).filter((i) => i >= 0);
      if (Math.abs(s.mx) + Math.abs(s.my) + Math.abs(s.lx) + Math.abs(s.ly) > 0.3) { I.usingPad = true; I.ult = performance.now(); }
      if (g.buttons.some((b) => b && b.pressed)) I.ult = performance.now();
    }
    // teclado/rato
    const K = I.keys; let kx = (K.KeyD ? 1 : 0) - (K.KeyA ? 1 : 0), ky = (K.KeyS ? 1 : 0) - (K.KeyW ? 1 : 0);
    if (kx || ky) { s.mx = kx; s.my = ky; }
    if (K.ShiftLeft || K.ShiftRight) s.run = true;
    for (const a in KEYMAP) for (const code of KEYMAP[a]) if (K[code]) held[a] = true;
    if (I.mouseDown && I.locked) held.a = true;
    NUM.forEach((c, i) => { held['n' + (i + 1)] = !!K[c]; });
    const ml = 0.0022; s.mlx = I.mdx * ml; s.mly = I.mdy * ml; I.mdx = 0; I.mdy = 0;
    for (const a in held) { if (held[a] && !I._prev[a]) s.pressed[a] = true; I._prev[a] = held[a]; }
    return s;
  };
  // ---- captura de um botão/eixo para o assistente de configuração
  I.raw = function () { return pad(); };
  I.base = function () { const g = pad(); if (!g) return null; return { b: g.buttons.map((x) => !!(x && (x.pressed || x.value > 0.5))), a: g.axes.slice() }; };
  // devolve {b:i} ou {ax,d} quando algo muda em relação à base; kind: 'axis' (só eixos), 'button' (botões, ou eixos como botão)
  I.detectar = function (base, kind) {
    const g = pad(); if (!g || !base) return null;
    if (kind !== 'axis') for (let i = 0; i < g.buttons.length; i++) { const b = g.buttons[i], p = !!(b && (b.pressed || b.value > 0.5)); if (p && !base.b[i]) return { b: i }; }
    let best = null, bd = 0.7; for (let i = 0; i < g.axes.length; i++) { const d = (g.axes[i] || 0) - (base.a[i] || 0); if (Math.abs(d) > bd) { bd = Math.abs(d); best = { ax: i, d: Math.sign(d) }; } }
    return best;
  };
  I.solto = function (base) { const g = pad(); if (!g) return true; for (let i = 0; i < g.buttons.length; i++) { const b = g.buttons[i]; if (b && (b.pressed || b.value > 0.3)) return false; } for (let i = 0; i < g.axes.length; i++) if (Math.abs((g.axes[i] || 0) - ((base && base.a[i]) || 0)) > 0.35) return false; return true; };
  root.Entrada = I;
})(window);
