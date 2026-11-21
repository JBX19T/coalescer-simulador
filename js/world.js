// world.js — o mundo 3D: sala industrial, vaso separador (corte transparente), módulo acústico, pedestais, equipamentos convencionais, mãos e tablet.
// ILUSTRAÇÃO: o módulo acústico dentro do vaso é uma hipótese de posicionamento do projecto.
(function (root) {
  const T = THREE, C = Sim.C;
  const NAVY = 0x0B1F33, ORANGE = 0xF28C28, CYAN = 0x4fc3f7;
  const W = {};

  // ------------------------------------------------------------- utilitários
  const stdMat = (color, rough, metal, extra) => new T.MeshStandardMaterial(Object.assign({ color, roughness: rough === undefined ? 0.6 : rough, metalness: metal || 0 }, extra || {}));
  const basic = (color, extra) => new T.MeshBasicMaterial(Object.assign({ color }, extra || {}));
  function add(parent, geo, mat, x, y, z) { const m = new T.Mesh(geo, mat); m.position.set(x || 0, y || 0, z || 0); parent.add(m); return m; }
  const box = (p, w, h, d, mat, x, y, z) => add(p, new T.BoxGeometry(w, h, d), mat, x, y, z);
  const cyl = (p, r1, r2, h, mat, x, y, z, seg) => add(p, new T.CylinderGeometry(r1, r2, h, seg || 32), mat, x, y, z);
  function canvasTex(w, h) { const cv = document.createElement('canvas'); cv.width = w; cv.height = h; const ctx = cv.getContext('2d'); const tex = new T.CanvasTexture(cv); tex.anisotropy = 4; tex.encoding = T.sRGBEncoding; return { cv, ctx, tex, w, h }; }
  W.LABELS = [];
  function pintar(L) {
    const t = (window.I18N ? window.I18N.t(L.text) : L.text), c = L.c, x = c.ctx; x.clearRect(0, 0, c.w, c.h);
    if (L.bg) { x.fillStyle = L.bg; x.beginPath(); x.roundRect ? x.roundRect(4, 4, c.w - 8, c.h - 8, 22) : x.rect(4, 4, c.w - 8, c.h - 8); x.fill(); }
    x.fillStyle = L.color || '#fff'; let fs = (L.h || 128) * 0.42; x.font = '700 ' + fs + 'px Segoe UI, Arial'; while (x.measureText(t).width > c.w - 30 && fs > 14) { fs -= 2; x.font = '700 ' + fs + 'px Segoe UI, Arial'; }
    x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(t, c.w / 2, c.h / 2 + 2); c.tex.needsUpdate = true;
  }
  function label(text, color, w, h, scale, bg) {
    const c = canvasTex(w || 512, h || 128), L = { text, color, w, h, bg, c }; pintar(L); W.LABELS.push(L);
    const s = new T.Sprite(new T.SpriteMaterial({ map: c.tex, transparent: true, depthWrite: false })); s.scale.set(scale || 2, (scale || 2) * (c.h / c.w), 1); return s;
  }
  W.relabel = function () { for (const L of W.LABELS) pintar(L); };
  W.label = label; W.canvasTex = canvasTex;

  // logótipo (gota + 2 ondas) desenhado num canvas
  const DROP = 'M100 8 C100 8 28 96 28 156 A72 72 0 0 0 172 156 C172 96 100 8 100 8 Z';
  W.drawLogo = function (ctx, x, y, s, gota, onda) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s); const p = new Path2D(DROP); ctx.fillStyle = gota; ctx.fill(p); ctx.clip(p);
    ctx.strokeStyle = onda; ctx.lineWidth = 12; ctx.lineCap = 'round';
    for (const yy of [132, 170]) { ctx.beginPath(); ctx.moveTo(10, yy); for (let i = 0; i < 4; i++) { const x0 = 10 + i * 45; ctx.quadraticCurveTo(x0 + 11.25 + (i % 2 ? 0 : 0), yy + (i % 2 ? 44 : -44), x0 + 22.5, yy); ctx.quadraticCurveTo(x0 + 33.75, yy + (i % 2 ? -44 : 44), x0 + 45, yy); } ctx.stroke(); }
    ctx.restore();
  };

  // segmento de círculo (secção do vaso entre duas alturas relativas ao eixo), extrudido ao longo de x
  function segmento(R, hl, hh, len) {
    const bl = Math.asin(Math.max(-1, Math.min(1, hl / R))), bh = Math.asin(Math.max(-1, Math.min(1, hh / R))), pts = [], N = 40;
    for (let i = 0; i <= N; i++) { const a = Math.PI - bh + (bh - bl) * i / N; pts.push(new T.Vector2(R * Math.cos(a), R * Math.sin(a))); }
    for (let i = 0; i <= N; i++) { const a = bl + (bh - bl) * i / N; pts.push(new T.Vector2(R * Math.cos(a), R * Math.sin(a))); }
    const sh = new T.Shape(pts); const g = new T.ExtrudeGeometry(sh, { depth: len, bevelEnabled: false, steps: 1 });
    g.translate(0, 0, -len / 2); g.rotateY(Math.PI / 2); return g;
  }

  // ------------------------------------------------------------- construção
  W.build = function (scene, sim, H) {
    const O = { stations: [], colliders: [], ghosts: [], glow: [], tex: [] };
    O.compare = 0; O.compareTarget = 0;
    scene.background = new T.Color(0x050c14); scene.fog = new T.Fog(0x050c14, 18, 46);
    const root3 = new T.Group(); scene.add(root3);

    // ---- luzes
    scene.add(new T.HemisphereLight(0x7f9cc0, 0x141a22, 0.75));
    const sun = new T.DirectionalLight(0xdde8ff, 0.55); sun.position.set(6, 12, 8); scene.add(sun);
    const lOrange = new T.PointLight(ORANGE, 0.0, 9, 2); lOrange.position.set(0, 2.2, 0); scene.add(lOrange); O.lOrange = lOrange;
    const lCyan = new T.PointLight(CYAN, 0.9, 14, 2); lCyan.position.set(-6, 3.5, 4); scene.add(lCyan);
    const lCyan2 = new T.PointLight(CYAN, 0.9, 14, 2); lCyan2.position.set(6, 3.5, 4); scene.add(lCyan2);
    const lKey = new T.PointLight(0xfff0dd, 1.1, 20, 2); lKey.position.set(0, 7.5, 3); scene.add(lKey); O.lucesExtra = [lCyan, lCyan2];

    // ---- sala
    const floorC = canvasTex(1024, 1024), fx = floorC.ctx; fx.fillStyle = '#0d151f'; fx.fillRect(0, 0, 1024, 1024);
    fx.strokeStyle = '#1d2d40'; fx.lineWidth = 3; for (let i = 0; i <= 8; i++) { fx.beginPath(); fx.moveTo(i * 128, 0); fx.lineTo(i * 128, 1024); fx.moveTo(0, i * 128); fx.lineTo(1024, i * 128); fx.stroke(); }
    fx.fillStyle = 'rgba(255,255,255,.015)'; for (let i = 0; i < 1800; i++) fx.fillRect(Math.random() * 1024, Math.random() * 1024, 2, 2);
    floorC.tex.wrapS = floorC.tex.wrapT = T.RepeatWrapping; floorC.tex.repeat.set(6, 4.4);
    const floor = add(root3, new T.PlaneGeometry(30, 22), stdMat(0xffffff, 0.35, 0.3, { map: floorC.tex }), 0, 0, 0.5); floor.rotation.x = -Math.PI / 2;
    const wallM = stdMat(0x0f2036, 0.8, 0.1);
    box(root3, 30, 9, 0.3, wallM, 0, 4.5, -11); box(root3, 0.3, 9, 22, wallM, -15, 4.5, 0.5); box(root3, 0.3, 9, 22, wallM, 15, 4.5, 0.5); box(root3, 30, 9, 0.3, wallM, 0, 4.5, 12);
    box(root3, 30, 0.3, 22, stdMat(0x08121e, 0.9), 0, 9, 0.5);
    // faixas luminosas nas paredes e tecto
    // faixas luminosas: só nos cantos e junto ao chão, para não tapar o logótipo nem o ecrã grande
    for (const sx of [-14.2, 14.2]) { box(root3, 0.12, 6.5, 0.06, basic(sx < 0 ? ORANGE : CYAN), sx, 4.2, -10.8); }
    box(root3, 28, 0.06, 0.05, basic(0x1f4f7a), 0, 0.35, -10.82); box(root3, 28, 0.04, 0.05, basic(ORANGE), 0, 0.22, -10.82);
    for (let i = -2; i <= 2; i++) { box(root3, 0.1, 0.06, 20, basic(0x7f9fc8), i * 6.4, 8.85, 0.5); }
    // marcações no chão (amarelo de segurança à volta do vaso)
    const mk = (w, d, x, z) => { const m = box(root3, w, 0.01, d, basic(0xe3b341), x, 0.006, z); return m; };
    mk(12.2, 0.12, 0, 3.1); mk(12.2, 0.12, 0, -3.1); mk(0.12, 6.3, -6.1, 0); mk(0.12, 6.3, 6.1, 0);
    // vigas e tubos de parede
    for (const sx of [-1, 1]) { cyl(root3, 0.18, 0.18, 21, stdMat(0x394b5f, 0.4, 0.8), sx * 14.4, 6.2, 0.5, 20).rotation.x = Math.PI / 2; cyl(root3, 0.12, 0.12, 21, stdMat(ORANGE, 0.5, 0.4), sx * 14.4, 5.6, 0.5, 20).rotation.x = Math.PI / 2; }
    // logótipo grande na parede do fundo
    const logoC = canvasTex(2048, 700), lx = logoC.ctx; lx.clearRect(0, 0, 2048, 700); W.drawLogo(lx, 150, 40, 2.6, '#ffffff', '#F28C28');
    lx.fillStyle = '#fff'; lx.font = '800 250px Segoe UI, Arial'; lx.textBaseline = 'alphabetic'; lx.fillText('COALESCER', 640, 430);
    lx.fillStyle = '#9fb3c8'; lx.font = '600 62px Segoe UI, Arial'; lx.fillText('COALESCÊNCIA ACÚSTICA DE GOTÍCULAS', 650, 540); logoC.tex.needsUpdate = true;
    const logoM = add(root3, new T.PlaneGeometry(9, 3.07), new T.MeshBasicMaterial({ map: logoC.tex, transparent: true }), -3.2, 7.3, -10.8);

    // ---- vaso separador (casco transparente + cabeças + selas)
    const V = new T.Group(); root3.add(V); V.position.set(0, 2.3, 0); O.vessel = V;
    const R = 1.6, L = 9.0;
    const shellM = new T.MeshPhysicalMaterial({ color: 0x9cc7e8, roughness: 0.08, metalness: 0.0, transparent: true, opacity: 0.13, side: T.DoubleSide, depthWrite: false, clearcoat: 1 });
    const shell = add(V, new T.CylinderGeometry(R, R, L, 56, 1, true), shellM, 0, 0, 0); shell.rotation.z = Math.PI / 2; shell.renderOrder = 5;
    const steel = stdMat(0x5b6f84, 0.35, 0.85), steelD = stdMat(0x2a3a4c, 0.5, 0.8);
    for (const sx of [-1, 1]) {
      const head = add(V, new T.SphereGeometry(R, 40, 24, 0, Math.PI * 2, 0, Math.PI / 2), stdMat(0x6a7f95, 0.35, 0.8, { side: T.DoubleSide }), sx * L / 2, 0, 0); head.rotation.z = -sx * Math.PI / 2; head.scale.set(1, 0.42, 1);
    }
    for (let i = -3; i <= 3; i++) { const t = add(V, new T.TorusGeometry(R + 0.01, 0.035, 10, 56), steel, i * 1.5, 0, 0); t.rotation.y = Math.PI / 2; }
    for (const sx of [-2.8, 2.8]) { box(root3, 0.6, 0.9, 1.9, steelD, sx, 0.45, 0); box(root3, 0.7, 0.08, 2.1, steel, sx, 0.92, 0); }
    // líquidos
    const hw = 2.5 - 2.3, ho = 3.1 - 2.3;
    const waterM = new T.MeshStandardMaterial({ color: 0x1d78b5, roughness: 0.1, metalness: 0, transparent: true, opacity: 0.28, depthWrite: false, emissive: 0x06304f, emissiveIntensity: 0.6 });
    const oilM = new T.MeshStandardMaterial({ color: 0xd98a1c, roughness: 0.15, transparent: true, opacity: 0.6, depthWrite: false, emissive: 0x6b3a00, emissiveIntensity: 0.5 });
    add(V, segmento(R * 0.985, -R, hw, L - 0.2), waterM, 0, 0, 0).renderOrder = 2;
    O.oilPad = add(V, segmento(R * 0.985, hw, ho, L - 0.2), oilM, 0, 0, 0); O.oilPad.renderOrder = 3;
    // bocais, tubagens e válvulas
    const pipeM = stdMat(0x7f93a8, 0.35, 0.85), red = stdMat(0xd43b2f, 0.5, 0.2);
    function tubo(p, x, y, z, r, len, axis) { const c = cyl(p, r, r, len, pipeM, x, y, z, 24); if (axis === 'x') c.rotation.z = Math.PI / 2; if (axis === 'z') c.rotation.x = Math.PI / 2; return c; }
    function flange(p, x, y, z, r, axis) { const c = cyl(p, r * 1.35, r * 1.35, 0.07, steelD, x, y, z, 24); if (axis === 'x') c.rotation.z = Math.PI / 2; if (axis === 'z') c.rotation.x = Math.PI / 2; return c; }
    // entrada (esquerda)
    tubo(V, -5.6, -0.7, 0, 0.22, 2.2, 'x'); flange(V, -4.75, -0.7, 0, 0.22, 'x'); flange(V, -6.4, -0.7, 0, 0.22, 'x');
    tubo(root3, -6.4, 1.0, 0, 0.22, 3.0); cyl(root3, 0.3, 0.3, 0.12, steelD, -6.4, 0.1, 0, 24);
    // bomba
    const pump = new T.Group(); root3.add(pump); pump.position.set(-7.4, 0, -1.6); cyl(pump, 0.35, 0.35, 0.5, stdMat(NAVY, 0.4, 0.5), 0, 0.5, 0, 28).rotation.z = Math.PI / 2; box(pump, 0.9, 0.12, 0.7, steelD, 0, 0.06, 0); cyl(pump, 0.42, 0.42, 0.7, stdMat(0x1c4a73, 0.35, 0.6), 0.65, 0.55, 0, 28).rotation.z = Math.PI / 2; tubo(pump, -0.3, 0.8, 0, 0.12, 1.0);
    tubo(root3, -6.9, 1.6, -1.6, 0.14, 1.1, 'x'); tubo(root3, -7.4, 0.9, -1.6, 0.14, 1.4); tubo(root3, -7.0, 0.55, -0.8, 0.14, 1.6, 'z');
    // saída de água (direita, em baixo) e de óleo (topo)
    tubo(root3, 4.3, 0.08, 0, 0.0, 0.001); tubo(V, 4.0, -R - 0.45, 0, 0.2, 0.9); flange(V, 4.0, -R - 0.02, 0, 0.2, 'y'); tubo(root3, 5.2, 0.12, 0, 0.2, 3.0, 'x');
    tubo(V, 3.4, R + 0.5, 0, 0.16, 1.0); flange(V, 3.4, R + 0.05, 0, 0.16, 'y'); tubo(root3, 4.4, 4.5 + 0.0, 0, 0.16, 2.1, 'x');
    tubo(V, -3.0, R + 0.4, 0, 0.12, 0.8); tubo(root3, -3.4, 4.3, 0, 0.12, 0.8, 'x');
    // volante vermelho de válvulas
    for (const [x, y, z] of [[5.7, 0.55, 0], [3.9, 4.35, 0.0], [-6.4, 0.5, 0.45]]) { const v = new T.Mesh(new T.TorusGeometry(0.17, 0.025, 8, 24), red); v.position.set(x, y, z); v.rotation.x = Math.PI / 2; root3.add(v); cyl(root3, 0.025, 0.025, 0.2, red, x, y - 0.1, z, 8); }
    // manómetros
    for (const sx of [-1.4, 1.2]) { const gc = canvasTex(256, 256), g = gc.ctx; g.fillStyle = '#e8eef5'; g.beginPath(); g.arc(128, 128, 120, 0, 6.3); g.fill(); g.strokeStyle = '#0B1F33'; g.lineWidth = 6; g.beginPath(); g.arc(128, 128, 112, 0, 6.3); g.stroke(); for (let i = 0; i < 11; i++) { const a = Math.PI * 0.8 + i * Math.PI * 1.4 / 10; g.beginPath(); g.moveTo(128 + Math.cos(a) * 92, 128 + Math.sin(a) * 92); g.lineTo(128 + Math.cos(a) * 108, 128 + Math.sin(a) * 108); g.stroke(); } g.strokeStyle = '#d43b2f'; g.lineWidth = 7; g.beginPath(); g.moveTo(128, 128); g.lineTo(128 + Math.cos(Math.PI * 1.35) * 86, 128 + Math.sin(Math.PI * 1.35) * 86); g.stroke(); gc.tex.needsUpdate = true;
      const gm = add(V, new T.CircleGeometry(0.22, 32), new T.MeshBasicMaterial({ map: gc.tex }), sx, R + 0.56, 0.0); gm.rotation.y = 0; gm.position.z = 0.05; gm.rotation.x = 0; const st = tubo(V, sx, R + 0.2, 0, 0.04, 0.4); }
    // passadiço
    const pl = box(root3, 8.2, 0.08, 1.1, stdMat(0x2a3a4c, 0.5, 0.7), 0, 4.65, -1.7); for (let i = -4; i <= 4; i++) box(root3, 0.05, 1.0, 0.05, steel, i * 1.0, 5.15, -2.2);
    box(root3, 8.2, 0.05, 0.05, basic(ORANGE), 0, 5.65, -2.2); for (const sx of [-4, 4]) box(root3, 0.14, 4.6, 0.14, steelD, sx, 2.3, -1.9);

    // ---- módulo acústico (câmara de coalescência) dentro do vaso
    const MOD = new T.Group(); root3.add(MOD); O.module = MOD;
    const cw = C.CX1 - C.CX0, cd = C.Z1 - C.Z0;
    const frameM = stdMat(0x394b5f, 0.35, 0.9);
    for (const sx of [C.CX0, C.CX1]) for (const sz of [C.Z0, C.Z1]) box(MOD, 0.07, 1.62, 0.07, frameM, sx, 1.6, sz);
    box(MOD, cw + 0.1, 0.06, cd + 0.1, frameM, 0, 0.82, 0); box(MOD, cw + 0.1, 0.06, cd + 0.1, stdMat(0x9fb8d0, 0.1, 0.5, { transparent: true, opacity: 0.55 }), 0, 2.38, 0);
    // transdutores (discos) na placa de baixo
    O.discs = [];
    for (let i = 0; i < 8; i++) for (let j = 0; j < 4; j++) { const d = cyl(MOD, 0.17, 0.17, 0.03, stdMat(0x222a33, 0.4, 0.6, { emissive: 0xF28C28, emissiveIntensity: 0 }), C.CX0 + 0.2 + i * 0.4, 0.86, C.Z0 + 0.15 + j * 0.37, 24); O.discs.push(d); }
    // planos das camadas (nodos/antinodos) — esquemáticos e AMPLIADOS
    const layC = canvasTex(512, 64), lc = layC.ctx; const lg = lc.createLinearGradient(0, 0, 0, 64); lg.addColorStop(0, 'rgba(79,195,247,0)'); lg.addColorStop(0.5, 'rgba(79,195,247,.9)'); lg.addColorStop(1, 'rgba(79,195,247,0)'); lc.fillStyle = lg; lc.fillRect(0, 0, 512, 64);
    lc.strokeStyle = 'rgba(255,255,255,.35)'; lc.lineWidth = 2; lc.beginPath(); for (let x = 0; x <= 512; x += 4) { const y = 32 + Math.sin(x / 512 * 6.283 * 6) * 10; x ? lc.lineTo(x, y) : lc.moveTo(x, y); } lc.stroke(); layC.tex.wrapS = T.RepeatWrapping; layC.tex.repeat.set(3, 1); layC.tex.needsUpdate = true;
    O.layers = [];
    for (let i = 0; i < C.NL; i++) { const m = new T.MeshBasicMaterial({ map: layC.tex, transparent: true, opacity: 0, depthWrite: false, blending: T.AdditiveBlending, side: T.DoubleSide }); const p = new T.Mesh(new T.PlaneGeometry(cw, cd), m); p.rotation.x = -Math.PI / 2; p.position.set(0, C.layerY(i), 0); MOD.add(p); O.layers.push(p); }
    O.layerTex = layC.tex;
    // rótulo do módulo
    const lm = label('MÓDULO DE COALESCÊNCIA ACÚSTICA', '#F28C28', 1024, 128, 3.2, 'rgba(7,24,42,.85)'); lm.position.set(0, 3.0 - 0.0, 1.4); lm.position.y = 0.35; lm.position.z = 1.95; O.labelModule = lm; root3.add(lm); lm.position.set(0, 0.28, 2.05);
    const lm2 = label('janela ampliada · fora de escala', '#9fb3c8', 640, 96, 2.0, 'rgba(7,24,42,.7)'); lm2.position.set(0, 0.04, 2.05); root3.add(lm2);

    // ---- gotículas
    const n = sim.n, pos = new Float32Array(n * 3), siz = new Float32Array(n), heat = new Float32Array(n);
    const geo = new T.BufferGeometry(); geo.setAttribute('position', new T.BufferAttribute(pos, 3)); geo.setAttribute('aSize', new T.BufferAttribute(siz, 1)); geo.setAttribute('aHeat', new T.BufferAttribute(heat, 1));
    const dm = new T.ShaderMaterial({
      uniforms: { uScale: { value: 400 } }, transparent: true, depthWrite: false,
      vertexShader: 'attribute float aSize; attribute float aHeat; varying float vH; uniform float uScale; void main(){ vH=aHeat; vec4 mv=modelViewMatrix*vec4(position,1.0); gl_PointSize=max(2.0, aSize*uScale/-mv.z); gl_Position=projectionMatrix*mv; }',
      fragmentShader: 'varying float vH; void main(){ vec2 c=gl_PointCoord*2.0-1.0; float d=dot(c,c); if(d>1.0) discard; float h=1.0-d; vec3 base=mix(vec3(1.0,0.5,0.08), vec3(0.95,0.25,0.02), vH); vec3 col=base*(0.5+0.75*h)+vec3(1.0,0.9,0.7)*pow(max(0.0,1.0-length(c-vec2(-0.3,0.3))*2.4),2.0)*0.45; gl_FragColor=vec4(col, 0.95*smoothstep(1.0,0.82,d)); }'
    });
    const pts = new T.Points(geo, dm); pts.frustumCulled = false; pts.renderOrder = 4; root3.add(pts); pts.position.set(0, 0, 0);
    O.drops = { pts, pos, siz, heat, geo, mat: dm };

    // ---- pedestais (lecterns) com ecrãs
    function pedestal(id, titulo, x, z, accent) {
      const g = new T.Group(); root3.add(g); g.position.set(x, 0, z); g.rotation.y = Math.atan2(0 - x, 9 - z);   // ecrã virado para o jogador
      box(g, 1.5, 0.12, 0.9, steelD, 0, 0.06, 0); box(g, 0.5, 0.95, 0.4, stdMat(0x13283f, 0.5, 0.6), 0, 0.55, 0);
      const scr = new T.Group(); scr.position.set(0, 1.12, 0.05); scr.rotation.x = -0.45; g.add(scr);
      box(scr, 1.42, 0.86, 0.06, stdMat(0x0a1520, 0.4, 0.7), 0, 0, -0.04);
      const c = canvasTex(1024, 576); const screen = add(scr, new T.PlaneGeometry(1.32, 0.7425), new T.MeshBasicMaterial({ map: c.tex, toneMapped: false }), 0, 0, 0.0); screen.position.z = 0.0;
      box(scr, 1.46, 0.04, 0.07, basic(accent), 0, 0.45, -0.04); box(scr, 1.46, 0.04, 0.07, basic(accent), 0, -0.45, -0.04);
      const centro = id === 'vaso'; const sg = label(titulo, '#ffffff', 640, 128, centro ? 1.25 : 1.9, 'rgba(7,24,42,.9)'); sg.position.set(0, centro ? 1.95 : 2.85, 0); g.add(sg); if (!centro) { [-0.5, 0.5].map(px => box(g, 0.04, 1.35, 0.04, steel, px, 2.15, 0)); box(g, 1.1, 0.04, 0.04, basic(accent), 0, 2.45, 0); }
      const st = { id, titulo, group: g, pos: new T.Vector3(x, 0, z), canvas: c, tex: c.tex, accent, w: 1024, h: 576, sign: sg };
      O.stations.push(st); O.colliders.push({ x, z, r: 0.75 }); return st;
    }
    pedestal('parametros', 'PAINEL DE PARÂMETROS', -5.2, 3.7, ORANGE);
    pedestal('vaso', 'PAINEL DO VASO', 0, 4.9, 0x4cd97b);
    pedestal('ondas', 'PAINEL DE ONDAS', 5.2, 3.7, CYAN);
    // ---- painéis suspensos (por cima do vaso) e de parede (laterais): acendem-se quando o método é ligado
    const eqC = canvasTex(1024, 576); O.wall = { k: 0, target: 0, panels: [], equip: eqC };
    const texOf = { parametros: O.stations.find((q) => q.id === 'parametros').tex, vaso: O.stations.find((q) => q.id === 'vaso').tex, ondas: O.stations.find((q) => q.id === 'ondas').tex, equipamentos: eqC.tex };
    function painel(id, titulo, accent, x, y, z, rotY, w, cabos) {
      const g = new T.Group(); g.position.set(x, y, z); g.rotation.y = rotY; root3.add(g); const h = w * 9 / 16, inner = new T.Group(); g.add(inner);
      box(inner, w + 0.25, h + 0.25, 0.12, stdMat(0x0a1520, 0.4, 0.7), 0, 0, -0.07);
      const smat = new T.MeshBasicMaterial({ map: texOf[id], toneMapped: false, transparent: true, opacity: 0 }); inner.add(new T.Mesh(new T.PlaneGeometry(w, h), smat));
      box(inner, w + 0.25, 0.08, 0.14, basic(accent), 0, h / 2 + 0.17, -0.05); box(inner, w + 0.25, 0.08, 0.14, basic(accent), 0, -h / 2 - 0.17, -0.05);
      const lab = label(titulo, '#ffffff', 640, 128, Math.min(2.6, w * 0.6), 'rgba(7,24,42,.92)'); lab.position.set(0, -h / 2 - 0.6, 0); g.add(lab);
      if (cabos) { const len = 9 - (y + h / 2 + 0.2); for (const sx of [-1, 1]) box(g, 0.035, len, 0.035, steel, sx * w * 0.4, h / 2 + 0.2 + len / 2, -0.07); }
      g.visible = false; O.wall.panels.push({ g, inner, smat, lab });
    }
    const AZ = (x, z) => Math.atan2(0 - x, 9.6 - z);
    painel('parametros', 'PARÂMETROS', ORANGE, -7.5, 6.3, -3.5, AZ(-7.5, -3.5), 4.4, true); painel('vaso', 'VASO', 0x4cd97b, -2.5, 6.3, -3.5, AZ(-2.5, -3.5), 4.4, true);
    painel('equipamentos', 'EQUIPAMENTOS', 0xff5a4d, 2.5, 6.3, -3.5, AZ(2.5, -3.5), 4.4, true); painel('ondas', 'ONDAS', CYAN, 7.5, 6.3, -3.5, AZ(7.5, -3.5), 4.4, true);
    painel('parametros', 'PARÂMETROS', ORANGE, -14.68, 3.5, 4.0, Math.PI / 2, 4.2, false); painel('vaso', 'VASO', 0x4cd97b, -14.68, 3.5, -3.2, Math.PI / 2, 4.2, false);
    painel('ondas', 'ONDAS', CYAN, 14.68, 3.5, 4.0, -Math.PI / 2, 4.2, false); painel('equipamentos', 'EQUIPAMENTOS', 0xff5a4d, 14.68, 3.5, -3.2, -Math.PI / 2, 4.2, false);
    O.setWall = function (on) { O.wall.target = on ? 1 : 0; };

    // ---- equipamentos convencionais (a minimizar, hipótese)
    const ghostSolid = stdMat(0x6b7b8c, 0.55, 0.5), ghostHolo = new T.MeshBasicMaterial({ color: 0xff3b30, transparent: true, opacity: 0.3, blending: T.AdditiveBlending, depthWrite: false });
    O.ghostSolid = ghostSolid; O.ghostHolo = ghostHolo;
    const eq = (nome, x, z, build) => {
      const g = new T.Group(); g.position.set(x, 0, z); root3.add(g); build(g);
      const items = []; g.traverse(o => { if (o.isMesh) items.push(o); });
      const lab = label(nome, '#ff8a80', 900, 128, 3.0, 'rgba(60,10,8,.88)'); lab.position.set(0, 5.0, 0); lab.visible = false; g.add(lab);
      O.ghosts.push({ g, items, lab, nome }); O.colliders.push({ x, z, r: 1.4 }); return g;
    };
    eq('HIDROCICLONES · carga menor (a confirmar)', -10.5, 0.5, (g) => { for (let i = 0; i < 4; i++) { const x = -1.2 + i * 0.8; cyl(g, 0.35, 0.35, 1.8, ghostSolid, x, 2.6, 0, 20); cyl(g, 0.35, 0.06, 1.6, ghostSolid, x, 1.0, 0, 20); } box(g, 3.6, 0.15, 0.9, ghostSolid, 0, 3.6, 0); box(g, 0.4, 3.6, 0.4, ghostSolid, -1.8, 1.8, 0); });
    eq('FLOTAÇÃO · carga menor (a confirmar)', -1.5, -8, (g) => { box(g, 5.0, 1.6, 2.2, ghostSolid, 0, 1.2, 0); box(g, 5.0, 0.3, 2.2, ghostSolid, 0, 2.2, 0); for (let i = 0; i < 3; i++) cyl(g, 0.12, 0.12, 1.2, ghostSolid, -1.5 + i * 1.5, 2.8, 0, 12); });
    eq('DEMULSIFICANTE QUÍMICO · dose menor (a confirmar)', 10.5, 0.5, (g) => { for (let i = 0; i < 2; i++) cyl(g, 0.8, 0.8, 2.2, ghostSolid, -1.0 + i * 2.0, 1.2, 0, 28); box(g, 4, 0.2, 1.6, ghostSolid, 0, 0.1, 0); cyl(g, 0.12, 0.12, 2.4, ghostSolid, 0, 2.3, 0, 10).rotation.z = Math.PI / 2; });
    // vaso convencional maior (contorno)
    const big = new T.Group(); root3.add(big); big.position.set(0, 2.3, 0); const bigPts = [], RR = 2.25, HL = 5.75;
    for (let k = 0; k <= 9; k++) { const x = -HL + k * HL * 2 / 9; for (let i = 0; i < 40; i++) { const a1 = i / 40 * 6.2832, a2 = (i + 1) / 40 * 6.2832; bigPts.push(x, Math.cos(a1) * RR, Math.sin(a1) * RR, x, Math.cos(a2) * RR, Math.sin(a2) * RR); } }
    for (const a of [0, 1.5708, 3.1416, 4.7124]) bigPts.push(-HL, Math.cos(a) * RR, Math.sin(a) * RR, HL, Math.cos(a) * RR, Math.sin(a) * RR);
    const bigGeo = new T.BufferGeometry(); bigGeo.setAttribute('position', new T.Float32BufferAttribute(bigPts, 3));
    const bigWire = new T.LineSegments(bigGeo, new T.LineBasicMaterial({ color: 0xff5a4d, transparent: true, opacity: 0.0, depthWrite: false })); big.add(bigWire); O.bigWire = bigWire;
    const bl = label('VASO CONVENCIONAL · mais volume e tempo de residência (a confirmar)', '#ff8a80', 1400, 128, 4.2, 'rgba(60,10,8,.88)'); bl.position.set(0, 5.6, 0.0); bl.visible = false; root3.add(bl); O.bigLabel = bl;
    box(root3, 10, 0.01, 0.06, basic(0xff5a4d), 0, 0.01, 3.1).visible = false;

    // ---- mundo: rótulos flutuantes de entrada/saída
    const li = label('ENTRADA · emulsão óleo/água', '#9fb3c8', 800, 96, 2.6, 'rgba(7,24,42,.8)'); li.position.set(-6.4, 3.0, 0); root3.add(li);
    const lo = label('ÓLEO ▲', '#F28C28', 400, 96, 1.3, 'rgba(7,24,42,.8)'); lo.position.set(4.4, 5.2, 0); root3.add(lo);
    const lw = label('ÁGUA ▼', '#4fc3f7', 400, 96, 1.3, 'rgba(7,24,42,.8)'); lw.position.set(5.2, 1.0, 0.8); root3.add(lw);

    O.colliders.push({ x: 0, z: 0, r: 0, box: { x0: -5, x1: 5, z0: -2.2, z1: 2.2 } });
    O.bounds = { x0: -13.5, x1: 13.5, z0: -9.5, z1: 10.8 };
    O.setCompare = function (v) { O.compareTarget = v ? 1 : 0; };
    O.updateCompare = function (dt) {
      O.compare += (O.compareTarget - O.compare) * Math.min(1, dt * 3);
      const c = O.compare;
      for (const gh of O.ghosts) { const holo = c > 0.5; for (const m of gh.items) m.material = holo ? ghostHolo : ghostSolid; gh.lab.visible = c > 0.5; }
      O.bigWire.material.opacity = 0.7 * c; O.bigLabel.visible = c > 0.5; ghostHolo.opacity = 0.18 + 0.12 * c;
    };
    return O;
  };

  // ---- atualização por frame: gotas, camadas, luzes
  W.update = function (O, sim, t, dt, R) {
    const d = O.drops, n = sim.nAct, pos = d.pos, siz = d.siz, heat = d.heat; d.geo.setDrawRange(0, n);
    for (let i = 0; i < n; i++) { pos[i * 3] = sim.x[i]; pos[i * 3 + 1] = sim.y[i]; pos[i * 3 + 2] = sim.z[i]; siz[i] = sim.r[i] * C.VIS * 2.2; heat[i] = Math.min(1, Math.max(0, (sim.r[i] - 5) / 14)); }
    d.geo.attributes.position.needsUpdate = true; d.geo.attributes.aSize.needsUpdate = true; d.geo.attributes.aHeat.needsUpdate = true;
    const on = sim.on, act = on * Math.min(1, R / 3);
    for (const l of O.layers) l.material.opacity = act * 0.6;
    O.layerTex.offset.x = (t * 0.15) % 1;
    O.lOrange.intensity = on * 2.2; O.lOrange.color.setHex(0xF28C28);
    for (let i = 0; i < O.discs.length; i++) O.discs[i].material.emissiveIntensity = on * (0.7 + 0.3 * Math.sin(t * 6 + i));
    const w = O.wall; w.k += (w.target - w.k) * Math.min(1, dt * 2.4); if (Math.abs(w.target - w.k) < 0.002) w.k = w.target;
    for (let i = 0; i < w.panels.length; i++) { const p = w.panels[i], kk = Math.max(0, Math.min(1, w.k * 1.6 - (i % 4) * 0.12)), e = kk * kk * (3 - 2 * kk);
      p.g.visible = kk > 0.01; p.inner.scale.y = 0.03 + 0.97 * e; p.smat.opacity = e; p.lab.material.opacity = e; }
  };
  root.World = W;
})(window);
