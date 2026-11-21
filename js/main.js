// main.js — o jogo: estados (título, introdução, livre, painel, pausa, apresentação guiada), movimento em primeira pessoa, interacção, missão e ciclo de desenho.
(function () {
  const T = THREE, $ = (id) => document.getElementById(id), C = Sim.C, P = Paineis, F = Fis, E = Entrada, X = Conteudo;
  const Q = new URLSearchParams(location.search);
  const LS = { get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }, set(k, v) { try { localStorage.setItem(k, v); } catch (e) { } } };
  const renderer = new T.WebGLRenderer({ canvas: $('c'), antialias: true, powerPreference: 'high-performance' });
  let pr = Math.min(devicePixelRatio || 1, 1.25); renderer.setPixelRatio(pr); renderer.outputEncoding = T.sRGBEncoding;
  const scene = new T.Scene(), camera = new T.PerspectiveCamera(72, 1, 0.05, 90); scene.add(camera);
  let estado = 'titulo';
  const sim = new Sim(3600); sim.setAct(2600);
  const DEF = { f: 1.7e6, p0: 296e3, Q: 5, T0: 20 };
  const S = { sim, p: Object.assign({}, DEF), d: null, t: 0, sel: 1, q: 0, cen: 0, lang: LS.get('coalescer_lang') === 'en' ? 'en' : 'pt', mem: { on: null, off: null }, compare: false };
  I18N.lang = S.lang; const tr = (s) => I18N.t(s);
  function recompute() { S.d = F.derivar(S.p); sim.R = S.d.R * S.d.gain; sim.u = 0.06 * S.p.Q; }
  recompute();
  const O = World.build(scene, sim), hands = Maos.build(camera);
  window.__jogo = { S, sim, O, camera, hands };           // para testes
  World.relabel();

  const ovc = $('ovc'), ovx = ovc.getContext('2d');
  // ---- pós-processamento (brilho)
  let composer = null, bloom = null, useBloom = Q.get('bloom') !== '0';
  function buildComposer() {
    const w = innerWidth, h = innerHeight; composer = new T.EffectComposer(renderer); composer.setPixelRatio(pr); composer.setSize(w, h);
    composer.addPass(new T.RenderPass(scene, camera)); bloom = new T.UnrealBloomPass(new T.Vector2(w / 2, h / 2), 0.5, 0.55, 0.88); composer.addPass(bloom); composer.addPass(new T.ShaderPass(T.GammaCorrectionShader));
  }
  function resize() { const w = innerWidth, h = innerHeight; renderer.setPixelRatio(pr); renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); O.drops.mat.uniforms.uScale.value = h * pr / (2 * Math.tan(camera.fov * Math.PI / 360)); if (composer) { composer.setPixelRatio(pr); composer.setSize(w, h); bloom.setSize(w / 2, h / 2); } sizeOv(); }
  if (useBloom) buildComposer(); addEventListener('resize', resize); resize();

  // ---- estado
  let player = { x: 0, z: 9.6, yaw: 0, pitch: 0, y: 1.7 }, tabletUp = false, tabIdx = 0, ovId = null;
  let kiosque = LS.get('coalescer_quiosque') !== '0';
  const intro = { t: 0 };
  const STA = O.stations.map((s) => ({ id: s.id, x: s.pos.x, z: s.pos.z, nome: s.titulo, r: 2.7 }));
  STA.push({ id: 'projecto', x: -3.2, z: -9.0, nome: 'O PROJECTO', r: 4.2 });
  const NOMES = { parametros: 'abrir o Painel de Parâmetros', ondas: 'abrir o Painel de Ondas', vaso: 'abrir o Painel do Vaso', equipamentos: 'abrir os Equipamentos a minimizar', projecto: 'abrir o Projecto' };

  // ---- HUD
  function toast(msg, cor, ms) { const t = $('toast'); t.textContent = tr(msg); t.style.borderColor = cor || 'var(--gr)'; t.classList.add('show'); clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.remove('show'), ms || 2600); }
  function dicas(list) { $('dicas').innerHTML = list.map((d) => '<span class="dica"><b>' + d[0] + '</b>' + tr(d[1]) + '</span>').join(''); }
  const padMode = () => E.usingPad;
  function dicasLivre() {
    if (padMode()) dicas([['L', 'andar'], ['R', 'olhar'], ['✕', 'abrir'], ['□', 'método'], ['△', 'tablet'], ['R2', 'correr'], ['Touchpad', 'apresentação'], ['Share', 'foto'], ['Options', 'ajuda']]);
    else dicas([['WASD', 'andar'], ['Rato', 'olhar'], ['E', 'abrir'], ['R', 'método'], ['T', 'tablet'], ['Shift', 'correr'], ['G', 'apresentação'], ['F2', 'foto'], ['H', 'ajuda']]);
  }
  const M = { parametros: false, ligou: false, viu: false, ondas: false, vaso: false, equipamentos: false, won: false, onTime: 0 };
  const MISS = [
    { t: 'Abre o Painel de Parâmetros (aproxima-te e carrega ✕)', ok: () => M.parametros }, { t: 'Liga o método acústico (□): os painéis acendem-se nas paredes', ok: () => M.ligou },
    { t: 'Observa as gotas a juntarem-se dentro do vaso', ok: () => M.viu }, { t: 'Abre o Painel de Ondas', ok: () => M.ondas },
    { t: 'No Painel do Vaso, compara SEM e COM método', ok: () => !!(S.mem.on && S.mem.off) && M.vaso }, { t: 'Abre o tablet (△) e vê os equipamentos a minimizar', ok: () => M.equipamentos }
  ];
  function missao() {
    let first = true; const html = MISS.map((m) => { const ok = m.ok(), cls = ok ? 'ok' : (first ? 'now' : ''); if (!ok) first = false; return '<li class="' + cls + '"><i></i><span>' + tr(m.t) + '</span></li>'; }).join('');
    if (missao._h !== html) { $('mlista').innerHTML = html; missao._h = html; }
    if (!M.won && MISS.every((m) => m.ok())) { M.won = true; Som.win(); toast('Missão cumprida! Experimenta o cenário «Versão A» nos Parâmetros e vê o que acontece.', 'var(--or)', 6000); }
  }

  // ---- parâmetros e cenários
  function resetEstado() {
    sim.onTarget = 0; sim.on = 0; O.setWall(false); O.wall.k = 0; Object.assign(S.p, DEF); S.cen = 0; S.compare = false; O.setCompare(false); sim.speed = 2; recompute(); sim.clearStats(); S.mem = { on: null, off: null };
    Object.assign(M, { parametros: false, ligou: false, viu: false, ondas: false, vaso: false, equipamentos: false, won: false, onTime: 0 }); tabletUp = false; Som.setMethod(false);
    player.x = 0; player.z = 9.6; player.yaw = 0; player.pitch = 0;
  }
  function ligar(on) { if ((sim.onTarget > 0.5) !== on) toggleMethod(true); }
  function applyCenario(i) {
    const c = F.CENARIOS[i]; S.cen = i; if (i === 0) { recompute(); return; }
    S.p.f = c.f; S.p.p0 = c.p0; S.p.Q = c.Q; recompute(); sim.clearStats(); S.mem = { on: null, off: null }; ligar(true); Som.setMethod(true, S.p.f); toast('Cenário: ' + c.nome, 'var(--or)', 2200);
  }
  function adj(row, dir) {
    const p = S.p; let ch = true;
    if (row === 0) { toggleMethod(); ch = false; }
    else if (row === 1) { const i = F.FREQS.indexOf(p.f); p.f = F.FREQS[Math.max(0, Math.min(F.FREQS.length - 1, i + dir))]; S.cen = 0; }
    else if (row === 2) { p.p0 = Math.max(5e4, Math.min(5e5, p.p0 + dir * 2e4)); S.cen = 0; }
    else if (row === 3) { p.Q = Math.max(1, Math.min(10, p.Q + dir * 0.5)); S.cen = 0; }
    else if (row === 4) { applyCenario(Math.max(0, Math.min(F.CENARIOS.length - 1, S.cen + dir))); ch = false; }
    else if (row === 5) { const v = [1, 2, 4, 8], i = v.indexOf(sim.speed); sim.speed = v[Math.max(0, Math.min(3, i + dir))]; ch = false; }
    if (ch) { recompute(); sim.clearStats(); Som.setMethod(sim.onTarget > 0.5, p.f); }
    Som.tick();
  }
  function toggleMethod(quiet) {
    sim.onTarget = sim.onTarget > 0.5 ? 0 : 1; sim.clearStats(); recompute(); Som.setMethod(sim.onTarget > 0.5, S.p.f); O.setWall(sim.onTarget > 0.5);
    if (sim.onTarget > 0.5) { M.ligou = true; M.onTime = 0; }
    if (!quiet) { Som.ok(); if (sim.onTarget > 0.5) Som.power(); toast(sim.onTarget > 0.5 ? 'Método acústico LIGADO · painéis a acender' : 'Método acústico DESLIGADO', sim.onTarget > 0.5 ? 'var(--gr)' : 'var(--rd)', 2200); }
  }
  function toggleCompare() { S.compare = !S.compare; O.setCompare(S.compare); M.equipamentos = M.equipamentos || S.compare; Som.ok(); toast(S.compare ? 'Modo comparação: equipamentos convencionais a vermelho' : 'Modo comparação desligado', 'var(--rd)', 2200); }

  // ---- painéis em tela cheia
  function sizeOv() { const w = innerWidth - 8, h = innerHeight - (estado === 'tour' ? 250 : 90); let cw = w, ch = cw * 9 / 16; if (ch > h) { ch = h; cw = ch * 16 / 9; } ovc.width = Math.round(cw * Math.min(devicePixelRatio || 1, 1.25)); ovc.height = Math.round(ch * Math.min(devicePixelRatio || 1, 1.25)); ovc.style.width = cw + 'px'; ovc.style.height = ch + 'px'; }
  function legendaOv() {
    const pad = padMode(), k = (a, b) => '<kbd>' + (pad ? a : b) + '</kbd>';
    $('ovleg').innerHTML = k('L1', 'Z') + '/' + k('R1', 'C') + ' ' + tr('painel') + ' · ' + k('↑↓', '↑↓') + ' ' + tr('escolher') + ' · ' + k('◀▶', '←→') + ' ' + tr('ajustar') + ' · ' + k('□', 'R') + ' ' + tr('liga/desliga método') + ' · ' + k('Share', 'F2') + ' ' + tr('foto') + ' · ' + k('○', 'Backspace') + ' ' + tr('fechar');
    $('ovtabs').innerHTML = P.LISTA.map((p, i) => '<span class="' + (p.id === ovId ? 'on' : '') + '">' + (i + 1) + ' · ' + tr(p.nome) + '</span>').join('');
  }
  function showOv(id) { ovId = id; $('ov').classList.add('show'); const t = estado === 'tour'; $('ovtabs').style.display = t ? 'none' : 'flex'; $('ovleg').style.display = t ? 'none' : ''; sizeOv(); }
  function hideOv() { ovId = null; $('ov').classList.remove('show'); }
  function abrirPainel(id) { showOv(id); estado = 'painel'; if (document.pointerLockElement) document.exitPointerLock(); M[id] = true; legendaOv(); Som.ok(); tabletUp = false; $('hud').style.display = 'none'; }
  function fecharPainel() { hideOv(); estado = 'livre'; $('hud').style.display = ''; Som.back(); dicasLivre(); }
  function ciclo(dir) { const i = P.LISTA.findIndex((p) => p.id === ovId); const j = (i + dir + P.LISTA.length) % P.LISTA.length; ovId = P.LISTA[j].id; M[ovId] = true; legendaOv(); Som.tick(); }

  // ---- pausa / ajuda
  function pausa(show) {
    if (show) { estado = 'pausa'; $('pausa').classList.add('show'); if (document.pointerLockElement) document.exitPointerLock(); renderPausa(); } else { $('pausa').classList.remove('show'); estado = 'livre'; dicasLivre(); }
  }
  function renderPausa() {
    const linhas = [['Stick esquerdo', 'andar'], ['Stick direito', 'olhar à volta'], ['R2 (ou Shift)', 'correr'], ['✕ (E)', 'abrir o painel que estás a olhar · confirmar'], ['○ (Backspace)', 'fechar / voltar'], ['□ (R)', 'ligar / desligar o método acústico'], ['△ (T)', 'tirar / guardar o tablet'], ['L1 / R1 (Z / C)', 'painel anterior / seguinte'], ['Setas', 'escolher e ajustar valores'], ['Touchpad (G)', 'apresentação guiada'], ['Share (F2)', 'fotografia (guarda uma imagem)'], ['Options (H)', 'esta janela']];
    $('pcx').innerHTML = '<h2>' + tr('Ajuda e opções') + '</h2><table>' + linhas.map((r) => '<tr><td>' + r[0] + '</td><td>' + tr(r[1]) + '</td></tr>').join('') + '</table>'
      + '<p class="mini"><b>[K]</b> ' + tr('configurar o comando (carregar em cada botão)') + ' · <b>[Del]</b> ' + tr('repor o mapa original') + ' · ' + tr('mapa') + ': ' + tr(E.personalizado() ? 'personalizado' : 'original') + '</p>'
      + '<p class="mini"><b>[B]</b> ' + tr('brilho (bloom)') + ' ' + tr(bloom && useBloom ? 'ligado' : 'desligado') + ' · <b>[M]</b> ' + tr('som') + ' ' + tr(Som.on ? 'ligado' : 'desligado') + ' · <b>[F]</b> ' + tr('ecrã inteiro') + ' · <b>[Q]</b> ' + tr('modo quiosque') + ' ' + tr(kiosque ? 'ligado' : 'desligado') + ' · <b>[L]</b> ' + tr('idioma') + ': ' + S.lang.toUpperCase() + '</p>'
      + '<p class="mini">' + tr('Comando') + ': ' + (E.padName ? E.padName : tr('não detectado (carrega num botão do comando)')) + ' · ' + tr('botões premidos') + ': <span id="dbg">—</span></p><div id="eixos" class="mini"></div>'
      + '<div class="aviso" style="margin-top:8px">' + tr('Simulação de uma hipótese. Sem resultados experimentais. As razões de força vêm do modelo da Fase 4; a coalescência é esquemática.') + '</div><p class="mini">' + tr('Carrega Options (H) para voltar.') + '</p>';
  }

  // ---- assistente de configuração do comando (guarda no navegador)
  const PASSOS = [
    ['mx', 'Empurra o STICK ESQUERDO para a DIREITA', 'axis'], ['my', 'Empurra o STICK ESQUERDO para BAIXO', 'axis'],
    ['lx', 'Empurra o STICK DIREITO para a DIREITA', 'axis'], ['ly', 'Empurra o STICK DIREITO para BAIXO', 'axis'],
    ['a', 'Carrega em ✕ (abrir / confirmar)', 'btn'], ['b', 'Carrega em ○ (voltar / fechar)', 'btn'], ['x', 'Carrega em □ (ligar/desligar método)', 'btn'], ['y', 'Carrega em △ (tablet)', 'btn'],
    ['l1', 'Carrega em L1', 'btn'], ['r1', 'Carrega em R1', 'btn'], ['r2', 'Carrega em R2 (correr)', 'btn'], ['options', 'Carrega em OPTIONS (ajuda)', 'btn'],
    ['up', 'Carrega na seta ↑', 'btn'], ['down', 'Carrega na seta ↓', 'btn'], ['left', 'Carrega na seta ←', 'btn'], ['right', 'Carrega na seta →', 'btn'],
    ['share', 'Carrega em SHARE (fotografia) · N salta', 'btn'], ['touch', 'Carrega no TOUCHPAD (apresentação guiada) · N salta', 'btn']
  ];
  const calib = { i: 0, base: null, espera: true, novo: null, msg: '' };
  function iniciarCalib() {
    if (!E.raw()) { toast('Liga o comando e carrega num botão para o computador o detectar', 'var(--am)', 3500); return false; }
    calib.i = 0; calib.base = null; calib.espera = true; calib.ult = null; calib.est = 0; calib.msg = ''; calib.novo = { map: Object.assign({}, E.cfg.map), ax: JSON.parse(JSON.stringify(E.cfg.ax)) }; calib.volta = estado; estado = 'calib';
    $('titulo').classList.remove('show'); $('pausa').classList.add('show'); if (document.pointerLockElement) document.exitPointerLock(); renderCalib(); return true;
  }
  function renderCalib() {
    const p = PASSOS[calib.i]; const pct = Math.round(100 * calib.i / PASSOS.length);
    $('pcx').innerHTML = '<h2>' + tr('Configurar comando') + '</h2><p class="mini">' + (E.padName || '') + '</p><div style="font-size:1.6rem;font-weight:800;margin:14px 0">' + (calib.i + 1) + '/' + PASSOS.length + ' · ' + tr(p[1]) + '</div>'
      + '<div style="height:10px;background:#06121f;border-radius:9px;overflow:hidden"><div style="height:100%;width:' + pct + '%;background:var(--or)"></div></div>'
      + '<p class="mini" style="color:var(--am)">' + tr(calib.msg || (calib.espera ? 'Larga tudo e espera…' : 'À espera do botão…')) + '</p>'
      + '<p class="mini">' + tr('Teclado') + ': <b>N</b> ' + tr('salta este passo') + ' · <b>Esc</b> ' + tr('cancela') + '</p><div id="eixos" class="mini"></div>';
  }
  function fimCalib(ok) {
    if (ok) { E.cfg = calib.novo; E.guardar(); toast('Comando configurado e guardado neste navegador', 'var(--gr)', 3000); }
    $('pausa').classList.remove('show'); estado = calib.volta === 'titulo' ? 'titulo' : 'livre'; if (estado === 'titulo') $('titulo').classList.add('show'); else dicasLivre();
  }
  function passoCalib(dt) {
    const k = E.keys; if (k.Escape && !passoCalib._e) { passoCalib._e = 1; fimCalib(false); return; } if (!k.Escape) passoCalib._e = 0;
    if (k.KeyN && !passoCalib._n) { passoCalib._n = 1; avancaCalib(); return; } if (!k.KeyN) passoCalib._n = 0;
    if (calib.espera) {   // espera que tudo fique parado e solto durante 0,35 s; só então fixa a base
      const sn = E.base(); if (!sn) return; let mov = sn.b.some((x) => x);
      if (calib.ult) for (let i = 0; i < sn.a.length; i++) if (Math.abs(sn.a[i] - calib.ult.a[i]) > 0.08) mov = true;
      calib.ult = sn; calib.est = mov ? 0 : calib.est + dt; if (calib.est > 0.35) { calib.espera = false; calib.base = sn; renderCalib(); } return;
    }
    const p = PASSOS[calib.i], det = E.detectar(calib.base, p[2] === 'axis' ? 'axis' : 'btn'); if (!det) return;
    if (p[2] === 'axis') {
      if (det.b !== undefined) return;
      const usado = ['mx', 'my', 'lx', 'ly'].some((q) => q !== p[0] && calib.novo.ax[q].ax === det.ax && PASSOS.findIndex((z) => z[0] === q) < calib.i);
      if (usado) { calib.msg = 'Esse eixo já foi usado noutro stick. Tenta outra vez, só o stick pedido.'; calib.espera = true; calib.ult = null; calib.est = 0; renderCalib(); return; }
      calib.novo.ax[p[0]] = { ax: det.ax, d: det.d };
    } else calib.novo.map[p[0]] = det.b !== undefined ? det.b : { ax: det.ax, d: det.d };
    Som.tick(); avancaCalib();
  }
  function avancaCalib() { calib.i++; calib.msg = ''; if (calib.i >= PASSOS.length) { fimCalib(true); return; } calib.espera = true; calib.ult = null; calib.est = 0; renderCalib(); }
  function eixosVivos() { const g = E.raw(), d = $('eixos'); if (!d) return; if (!g) { d.textContent = tr('Comando não detectado.'); return; } d.innerHTML = tr('Eixos') + ': ' + g.axes.map((v, i) => '<b>' + i + '</b>=' + v.toFixed(2)).join(' · '); }

  // ---- movimento e colisões
  function mover(dt, s) {
    const sp = (s.run ? 4.3 : 2.3) * (tabletUp ? 0.7 : 1), fx = -Math.sin(player.yaw), fz = -Math.cos(player.yaw), rx = Math.cos(player.yaw), rz = -Math.sin(player.yaw);
    let vx = (fx * -s.my + rx * s.mx), vz = (fz * -s.my + rz * s.mx); const l = Math.hypot(vx, vz); if (l > 1) { vx /= l; vz /= l; }
    player.x += vx * sp * dt; player.z += vz * sp * dt;
    const b = O.bounds; player.x = Math.max(b.x0, Math.min(b.x1, player.x)); player.z = Math.max(b.z0, Math.min(b.z1, player.z));
    for (const c of O.colliders) {
      if (c.box) { const bx = c.box; if (player.x > bx.x0 - 0.4 && player.x < bx.x1 + 0.4 && player.z > bx.z0 - 0.4 && player.z < bx.z1 + 0.4) { const dl = [player.x - (bx.x0 - 0.4), bx.x1 + 0.4 - player.x, player.z - (bx.z0 - 0.4), bx.z1 + 0.4 - player.z], m = Math.min(...dl), k = dl.indexOf(m); if (k === 0) player.x = bx.x0 - 0.4; else if (k === 1) player.x = bx.x1 + 0.4; else if (k === 2) player.z = bx.z0 - 0.4; else player.z = bx.z1 + 0.4; } }
      else { const dx = player.x - c.x, dz = player.z - c.z, d = Math.hypot(dx, dz), m = c.r + 0.4; if (d < m && d > 1e-4) { player.x = c.x + dx / d * m; player.z = c.z + dz / d * m; } }
    }
    return Math.hypot(vx, vz) > 0.1;
  }
  function pontaCamera() { const dir = new T.Vector3(); camera.getWorldDirection(dir); return dir; }
  function proximo() {
    const dir = pontaCamera(); let best = null, bs = 1e9;
    for (const s of STA) { const dx = s.x - player.x, dz = s.z - player.z, d = Math.hypot(dx, dz); if (d > s.r) continue; const dot = (dir.x * dx + dir.z * dz) / Math.max(d, 1e-3) / Math.max(1e-3, Math.hypot(dir.x, dir.z)); if (dot < 0.55) continue; if (d < bs) { bs = d; best = s; } }
    return best;
  }

  // ---- introdução
  const CAPS = [[0.3, 'Uma unidade de processamento de petróleo.'], [3.2, 'Dentro deste vaso, a água e o óleo separam-se… devagar.'], [6.4, 'As gotículas mais pequenas quase não sobem.'], [9.6, 'E se um campo sonoro as ajudasse a juntar-se?'], [12.6, 'Entra. Liga o método. Observa.']];
  const KF = [[0, [-12, 6.5, 10], [0, 2.3, 0]], [6, [-2, 3.6, 7.5], [0, 2.3, 0]], [11, [3.5, 2.2, 6.5], [0, 2.2, 0]], [14.5, [0, 1.7, 9.6], [0, 2.0, 0]]];
  const sm = (x) => x * x * (3 - 2 * x);
  function camIntro(t) {
    let i = 0; while (i < KF.length - 2 && t > KF[i + 1][0]) i++; const a = KF[i], b = KF[i + 1], k = sm(Math.max(0, Math.min(1, (t - a[0]) / (b[0] - a[0]))));
    const p = a[1].map((v, j) => v + (b[1][j] - v) * k), tg = a[2].map((v, j) => v + (b[2][j] - v) * k); camera.position.set(p[0], p[1], p[2]); camera.lookAt(tg[0], tg[1], tg[2]);
  }
  function iniciarIntro() { estado = 'intro'; intro.t = 0; $('titulo').classList.remove('show'); Som.init(); $('hud').style.display = ''; $('missao').style.display = 'none'; $('dicas').innerHTML = ''; $('prompt').style.display = 'none'; dicas([[padMode() ? '✕' : 'E', 'saltar introdução']]); }
  function fimIntro() { estado = 'livre'; $('legenda').classList.remove('show'); $('missao').style.display = ''; dicasLivre(); toast('Aproxima-te de um painel (✕) ou carrega □ para ligar o método', 'var(--or)', 4200); }
  function comecar() { if (estado !== 'titulo') return; Som.init(); if (Q.get('direto') === '1') { estado = 'livre'; $('titulo').classList.remove('show'); $('missao').style.display = ''; dicasLivre(); return; } iniciarIntro(); }
  $('startb').addEventListener('click', comecar); $('titulo').addEventListener('click', (e) => { if (!e.target.closest('.lang')) comecar(); });
  $('c').addEventListener('click', () => { if (estado === 'livre' && !E.usingPad && !document.pointerLockElement && $('c').requestPointerLock) $('c').requestPointerLock(); Som.init(); });
  E.onPad = (on, id) => { toast(on ? 'Comando ligado' : 'Comando desligado', on ? 'var(--gr)' : 'var(--rd)', 2200); const pi = $('padinfo'); if (pi) pi.textContent = on ? tr('Comando detectado: ') + id : tr('Comando desligado.'); if (estado === 'livre') dicasLivre(); };

  // ---- apresentação guiada (também usada pelo modo quiosque)
  const tour = { i: -1, t: 0, kiosk: false, from: null, to: null, tot: X.TOUR.reduce((a, b) => a + b.d, 0), el: 0 };
  function poseAtual() { const d = pontaCamera(); return { p: [camera.position.x, camera.position.y, camera.position.z], t: [camera.position.x + d.x * 5, camera.position.y + d.y * 5, camera.position.z + d.z * 5] }; }
  function startTour(kiosk) {
    if (estado === 'painel') hideOv(); if (estado === 'pausa') $('pausa').classList.remove('show'); resetEstado(); estado = 'tour'; tour.i = -1; tour.t = 0; tour.kiosk = !!kiosk; tour.el = 0; Som.init();
    $('titulo').classList.remove('show'); $('hud').style.display = 'none'; hands.group.visible = false; tour.from = { p: X.TOUR[0].cam[0].slice(), t: X.TOUR[0].cam[1].slice() }; tour.to = tour.from; $('tcap').classList.add('show');
    $('thint').textContent = tr(padMode() ? 'Carrega em qualquer botão para sair' : 'Prime qualquer tecla para sair');
  }
  function acaoTour(fn) {
    if (fn === 'reset') resetEstado(); else if (fn === 'on') ligar(true); else if (fn === 'cenA') { S.compare = false; O.setCompare(false); applyCenario(1); } else if (fn === 'cenB') applyCenario(2); else if (fn === 'calor') applyCenario(3);
    else if (fn === 'compareOn') { S.compare = true; O.setCompare(true); } else if (fn === 'rapido') sim.speed = 8;
  }
  function proximoPasso() {
    tour.i++; if (tour.i >= X.TOUR.length) { if (tour.kiosk) { startTour(true); proximoPasso(); return; } fimTour(true); return; }
    const st = X.TOUR[tour.i]; tour.t = 0; tour.from = poseAtual(); if (tour.i === 0) tour.from = { p: st.cam[0].slice(), t: st.cam[1].slice() };
    tour.to = st.cam ? { p: st.cam[0], t: st.cam[1] } : tour.from; if (st.fn) acaoTour(st.fn); if (st.vel) sim.speed = st.vel;
    if (st.pane) showOv(st.pane); else hideOv();
    $('tcaptxt').textContent = st.cap[S.lang] || st.cap.pt; Som.tick();
  }
  function passoTour(dt) {
    tour.t += dt; tour.el += dt; if (tour.i < 0 || tour.t >= X.TOUR[tour.i].d) proximoPasso(); if (estado !== 'tour') return;
    const st = X.TOUR[tour.i], k = sm(Math.min(1, tour.t / Math.min(st.d * 0.6, 4.5))), a = tour.from, b = tour.to;
    const p = a.p.map((v, j) => v + (b.p[j] - v) * k), tg = a.t.map((v, j) => v + (b.t[j] - v) * k); camera.position.set(p[0], p[1], p[2]); camera.lookAt(tg[0], tg[1], tg[2]);
    $('tbar').style.width = Math.min(100, 100 * ((X.TOUR.slice(0, tour.i).reduce((s2, z) => s2 + z.d, 0) + tour.t) / tour.tot)) + '%';
    if (ovId && (tour.t * 1000 % 100) < dt * 1000 + 1) { /* o desenho do painel é feito em ecras() */ }
  }
  function fimTour(natural) {
    hideOv(); $('tcap').classList.remove('show'); estado = 'livre'; $('hud').style.display = ''; $('missao').style.display = ''; resetEstado(); dicasLivre(); Som.back();
    if (natural) toast('Apresentação terminada. Experimenta tu: aproxima-te de um painel.', 'var(--or)', 4000);
  }
  const atividade = (s) => Object.keys(s.pressed).length > 0 || Math.abs(s.mx) + Math.abs(s.my) + Math.abs(s.lx) + Math.abs(s.ly) > 0.4 || Math.abs(s.mlx) + Math.abs(s.mly) > 0.02;

  // ---- fotografia
  let shotReq = false;
  function fazerFoto() {
    const src = ovId ? ovc : $('c'), w = src.width, h = src.height, band = Math.round(Math.max(60, h * 0.075)), o = document.createElement('canvas'); o.width = w; o.height = h + band; const x = o.getContext('2d');
    x.drawImage(src, 0, 0, w, h); x.fillStyle = '#07182a'; x.fillRect(0, h, w, band); World.drawLogo(x, band * 0.3, h + band * 0.12, band * 0.76 / 240, '#ffffff', '#F28C28');
    const d = new Date(), pad2 = (n) => String(n).padStart(2, '0'), stamp = d.getFullYear() + pad2(d.getMonth() + 1) + pad2(d.getDate()) + '_' + pad2(d.getHours()) + pad2(d.getMinutes()) + pad2(d.getSeconds());
    x.textBaseline = 'alphabetic'; x.fillStyle = '#ffffff'; x.font = '700 ' + band * 0.3 + 'px Segoe UI, Arial'; x.fillText('COALESCER · ' + tr('simulador 3D') + ' · ' + F.fmtF(S.p.f) + ' · ×' + F.fmt(S.d.R, S.d.R < 10 ? 2 : 1) + ' · ' + tr(sim.onTarget > 0.5 ? 'método ligado' : 'método desligado') + ' · ' + F.OLEO.nome, band * 1.25, h + band * 0.45);
    x.fillStyle = '#e3b341'; x.font = '600 ' + band * 0.24 + 'px Segoe UI, Arial'; x.fillText(tr('SIMULAÇÃO · hipótese do projecto · não são medições') + '   ' + d.toLocaleString(S.lang === 'en' ? 'en-GB' : 'pt-PT'), band * 1.25, h + band * 0.82);
    const nome = 'coalescer_' + stamp + '.png';
    o.toBlob((b) => { const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = nome; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 5000); }, 'image/png');
    const f = $('flash'); f.classList.remove('go'); void f.offsetWidth; f.classList.add('go'); Som.beep(1200, 0.05, 0.06); toast(tr('Foto guardada') + ': ' + nome, 'var(--gr)', 3000);
  }

  // ---- idioma
  function setLang(l) {
    S.lang = l; I18N.lang = l; LS.set('coalescer_lang', l); World.relabel(); I18N.dom(); missao._h = null; tTab = 1; tScr = 1; tBig = 1;
    if (estado === 'pausa') renderPausa(); if (estado === 'livre') dicasLivre(); if (ovId && estado === 'painel') legendaOv(); if (estado === 'tour' && tour.i >= 0) $('tcaptxt').textContent = X.TOUR[tour.i].cap[l] || X.TOUR[tour.i].cap.pt;
    document.documentElement.lang = l === 'en' ? 'en' : 'pt-PT';
  }
  document.querySelectorAll('.lang [data-l]').forEach((e) => e.addEventListener('click', (ev) => { ev.stopPropagation(); setLang(e.dataset.l); }));
  I18N.dom();

  // ---- actualização dos ecrãs
  let tScr = 0, tBig = 0, tTab = 0, tOv = 0, tMem = 0, iScr = 0;
  function ecras(dt, forceAll) {
    tScr += dt; tBig += dt; tTab += dt; tOv += dt; tMem += dt;
    // pedestais: um ecrã de cada vez (cada um refresca a cada ~0,3 s) e em versão leve
    if (forceAll) { P.lite = true; for (const s of O.stations) { P.draw(s.id, s.canvas.ctx, 1024, 576, S, false); s.tex.needsUpdate = true; } }
    else if (tScr > 0.1) { tScr = 0; const s = O.stations[iScr++ % O.stations.length]; P.lite = true; P.draw(s.id, s.canvas.ctx, 1024, 576, S, false); s.tex.needsUpdate = true; }
    if ((tBig > 0.6 && O.wall.k > 0.01) || forceAll) { tBig = 0; P.lite = true; P.draw('equipamentos', O.wall.equip.ctx, 1024, 576, S, false); O.wall.equip.tex.needsUpdate = true; }
    if ((tabletUp && tTab > 0.3) || forceAll) { tTab = 0; P.lite = true; P.tablet(hands.ctx, S, 1024, 648, tabIdx); hands.tex.needsUpdate = true; }
    if (ovId && tOv > 0.08) { tOv = 0; P.lite = false; P.draw(ovId, ovx, ovc.width, ovc.height, S, true); }
    if (tMem > 0.5) { tMem = 0; const st = sim.stats(); if (st.ok && st.n >= 300) { (sim.onTarget > 0.5 ? S.mem.on = { cap: st.cap, d50: st.d50 } : S.mem.off = { cap: st.cap, d50: st.d50 }); } }
  }

  // ---- governador de qualidade: se o computador não aguenta, baixa os efeitos por degraus (nunca volta a subir)
  let nivel = 0, tNivel = 0, fNivel = 0, aquece = 2.5;
  function aplicarNivel(n) {
    nivel = n;
    if (n >= 1) useBloom = false;
    if (n >= 2) { pr = Math.min(pr, 0.85); sim.setAct(1800); O.lucesExtra.forEach((l) => { l.visible = false; }); }
    if (n >= 3) { pr = 0.65; sim.setAct(1200); }
    resize(); toast(n >= 3 ? 'Qualidade mínima, para o jogo correr fluido' : 'Qualidade reduzida, para o jogo correr fluido', 'var(--am)', 2600);
  }
  function governador(dt) {
    if (document.hidden) { tNivel = 0; fNivel = 0; return; }
    if (aquece > 0) { aquece -= dt; return; }       // ignora os primeiros segundos (compilação de shaders)
    tNivel += dt; fNivel++; if (tNivel < 2) return;
    const fps = fNivel / tNivel; tNivel = 0; fNivel = 0;
    if (fps < 42 && nivel < 3) { aplicarNivel(nivel + 1); aquece = 1.2; }
  }

  // ---- ciclo principal
  let last = performance.now(), frames = 0, tf = 0, lowCount = 0, repT = 0;
  const kedge = (code, key) => { if (E.keys[code] && !loop[key]) { loop[key] = 1; return true; } if (!E.keys[code]) loop[key] = 0; return false; };
  function loop(now) {
    requestAnimationFrame(loop);
    const dt = Math.min(0.05, (now - last) / 1000); last = now; S.t += dt; frames++; tf += dt;
    const s = E.poll();
    if (Object.keys(s.pressed).length && E.usingPad && Som.ctx && Som.ctx.state === 'suspended') Som.ctx.resume();
    const kL = kedge('KeyL', '_L'), kQ = kedge('KeyQ', '_Q');
    if (kL && estado !== 'calib') setLang(S.lang === 'pt' ? 'en' : 'pt');
    if (estado === 'titulo') { if (kedge('KeyK', '_k')) iniciarCalib(); if (s.pressed.touch) startTour(false); else if (s.pressed.a || s.pressed.options || s.pressed.n1) comecar(); }
    else if (estado === 'calib') { passoCalib(dt); eixosVivos(); }
    else if (estado === 'tour') { hands.group.visible = false; if (atividade(s)) fimTour(false); else passoTour(dt); }
    else if (estado === 'intro') {
      intro.t += dt; camIntro(intro.t); let cap = null; for (const c of CAPS) if (intro.t >= c[0]) cap = c; const lg = $('legenda'); if (cap) { lg.textContent = tr(cap[1]); lg.classList.toggle('show', intro.t < 15.5); }
      if (s.pressed.a || s.pressed.b || intro.t > 14.5) fimIntro();
      hands.group.visible = false;
    } else if (estado === 'livre') {
      hands.group.visible = true;
      const kl = tabletUp ? 0 : ((E.keys.ArrowRight ? 1 : 0) - (E.keys.ArrowLeft ? 1 : 0)), kp = tabletUp ? 0 : ((E.keys.ArrowDown ? 1 : 0) - (E.keys.ArrowUp ? 1 : 0));
      player.yaw -= (s.lx + kl) * 2.5 * dt + s.mlx; player.pitch = Math.max(-1.2, Math.min(1.2, player.pitch - ((s.ly + kp) * 1.8 * dt + s.mly)));
      const walking = mover(dt, s); camera.position.set(player.x, player.y + (walking ? Math.sin(S.t * (s.run ? 12 : 8)) * 0.025 : 0), player.z); camera.rotation.set(player.pitch, player.yaw, 0, 'YXZ');
      const near = proximo(); const prm = $('prompt'), mira = $('mira');
      if (tabletUp) { prm.style.display = 'none'; mira.classList.remove('on'); }
      else if (near) { prm.style.display = 'block'; prm.innerHTML = '<kbd>' + (padMode() ? '✕' : 'E') + '</kbd>' + tr(NOMES[near.id]); mira.classList.add('on'); } else { prm.style.display = 'none'; mira.classList.remove('on'); }
      hands.update(dt, walking, tabletUp, !!near && !tabletUp, S.t);
      if (s.pressed.x) toggleMethod();
      if (s.pressed.y) { tabletUp = !tabletUp; Som.ok(); if (tabletUp) tTab = 1; }
      if (s.pressed.options) pausa(true);
      if (s.pressed.touch) startTour(false);
      if (tabletUp) {
        const NC = P.LISTA.length + 1;
        if (s.pressed.right) { tabIdx = (tabIdx + 1) % NC; Som.tick(); tTab = 1; } if (s.pressed.left) { tabIdx = (tabIdx + NC - 1) % NC; Som.tick(); tTab = 1; }
        if (s.pressed.down) { tabIdx = (tabIdx + 4) % NC; Som.tick(); tTab = 1; } if (s.pressed.up) { tabIdx = (tabIdx + NC - 4) % NC; Som.tick(); tTab = 1; }
        if (s.pressed.a) { if (tabIdx < P.LISTA.length) abrirPainel(P.LISTA[tabIdx].id); else { toggleCompare(); tTab = 1; } }
        if (s.pressed.b) { tabletUp = false; Som.back(); }
      } else {
        if (s.pressed.a && near) abrirPainel(near.id);
        for (let i = 1; i <= P.LISTA.length; i++) if (s.pressed['n' + i]) abrirPainel(P.LISTA[i - 1].id);
        if (s.pressed.n8) toggleCompare();
      }
      if (sim.onTarget > 0.5) { M.onTime += dt * sim.speed; if (M.onTime > 18 && sim.stats().ok) M.viu = true; }
    } else if (estado === 'painel') {
      if (s.pressed.b) fecharPainel();
      if (s.pressed.l1) ciclo(-1); if (s.pressed.r1) ciclo(1); if (s.pressed.x) toggleMethod();
      for (let i = 1; i <= P.LISTA.length; i++) if (s.pressed['n' + i]) { ovId = P.LISTA[i - 1].id; M[ovId] = true; legendaOv(); }
      if (s.pressed.n8) toggleCompare();
      if (ovId === 'perguntas') { const nq = X.FAQ.length; if (s.pressed.up) { S.q = (S.q + nq - 1) % nq; Som.tick(); } if (s.pressed.down) { S.q = (S.q + 1) % nq; Som.tick(); } }
      else { if (s.pressed.up) { S.sel = (S.sel + 5) % 6; Som.tick(); } if (s.pressed.down) { S.sel = (S.sel + 1) % 6; Som.tick(); } }
      if (ovId === 'parametros' || ovId === 'ondas' || ovId === 'vaso') {
        const row = ovId === 'ondas' ? 1 : ovId === 'vaso' ? 3 : S.sel;
        if (s.pressed.left) { repT = 0.38; adj(row, -1); } if (s.pressed.right) { repT = 0.38; adj(row, 1); }
        if ((s.held.left || s.held.right) && row !== 0 && row !== 1 && row !== 4) { repT -= dt; if (repT <= 0) { repT = 0.08; adj(row, s.held.left ? -1 : 1); } }
      }
      legendaOv._t = (legendaOv._t || 0) + dt; if (legendaOv._t > 1) { legendaOv._t = 0; legendaOv(); }
    } else if (estado === 'pausa') {
      if (s.pressed.options || s.pressed.b) pausa(false);
      if (kedge('KeyB', '_B')) { useBloom = !useBloom; if (useBloom && !composer) buildComposer(); resize(); renderPausa(); }
      if (kedge('KeyM', '_M')) { Som.mute(Som.on); renderPausa(); }
      if (kedge('KeyF', '_F')) { if (!document.fullscreenElement) document.documentElement.requestFullscreen && document.documentElement.requestFullscreen(); else document.exitFullscreen(); }
      if (kQ) { kiosque = !kiosque; LS.set('coalescer_quiosque', kiosque ? '1' : '0'); renderPausa(); }
      if (kL) renderPausa();
      const d = $('dbg'); if (d) d.textContent = E.debug.length ? E.debug.join(', ') : '—'; eixosVivos();
      if (kedge('KeyK', '_k')) { $('pausa').classList.remove('show'); iniciarCalib(); }
      if (kedge('Delete', '_d')) { E.repor(); toast('Mapa do comando reposto', 'var(--am)', 2200); renderPausa(); }
    }
    // fotografia (Share / F2)
    if (s.pressed.share && estado !== 'calib' && estado !== 'pausa') shotReq = true;
    // modo quiosque: sem actividade durante 60 s (45 s no título) → apresentação automática
    if (kiosque && (estado === 'livre' || estado === 'painel' || estado === 'titulo') && now - E.ult > (estado === 'titulo' ? 45000 : 60000)) { E.ult = now; startTour(true); }
    // simulação e mundo
    sim.step(dt);
    World.update(O, sim, S.t, dt, sim.R); O.updateCompare(dt);
    ecras(dt, frames < 3);
    if (S.t - (loop._m || 0) > 0.25) { loop._m = S.t; missao(); }
    if (S.t - (loop._e || 0) > 0.25) { loop._e = S.t; $('estado').textContent = F.fmtF(S.p.f) + ' · ×' + F.fmt(S.d.R, S.d.R < 10 ? 2 : 1) + ' · ' + tr(sim.onTarget > 0.5 ? 'método ligado' : 'método desligado') + (Q.has('fps') ? ' · ' + Math.round(frames / Math.max(tf, 0.001)) + ' fps · nível ' + nivel : ''); frames = 0; tf = 0; }
    governador(dt);
    if (useBloom && composer) composer.render(); else renderer.render(scene, camera);
    if (shotReq) { shotReq = false; fazerFoto(); }
  }
  dicas([]); requestAnimationFrame(loop);
  // utilitários para testes
  window.__ctl = { iniciarCalib, comecar, abrirPainel, fecharPainel, toggleMethod, adj, pausa, startTour, applyCenario, setLang, fazerFoto, resetEstado, get estado() { return estado; }, get nivel() { return nivel; }, aplicarNivel, get tour() { return tour; }, set tab(v) { tabletUp = v; }, player, fimIntro, set kiosque(v) { kiosque = v; } };
})();
