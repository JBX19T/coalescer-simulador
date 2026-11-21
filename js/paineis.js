// paineis.js — os cinco painéis (desenhados em canvas 2D, usados nos ecrãs 3D, no tablet e em tela cheia).
// Tudo o que aqui aparece vem da SIMULAÇÃO / modelo simplificado do projecto. Nada é medição.
(function (root) {
  const C = Sim.C, F = Fis;
  const K = { bg: '#07182a', panel: '#0e2740', panel2: '#12304d', line: '#27476a', fg: '#f2f6fa', mut: '#9fb3c8', or: '#F28C28', cy: '#4fc3f7', gr: '#4cd97b', am: '#e3b341', rd: '#ff5a4d' };
  const P = {};
  P.LISTA = [
    { id: 'parametros', nome: 'Parâmetros', cor: K.or, desc: 'Frequência, pressão, vazão e o que daí resulta' },
    { id: 'ondas', nome: 'Ondas', cor: K.cy, desc: 'Oscilação, onda estacionária e ressonância' },
    { id: 'vaso', nome: 'Vaso', cor: K.gr, desc: 'O que acontece dentro do vaso, ao vivo' },
    { id: 'equipamentos', nome: 'Equipamentos', cor: K.rd, desc: 'O que poderia diminuir (hipótese)' },
    { id: 'projecto', nome: 'O projecto', cor: K.am, desc: 'A pergunta, o método e a honestidade' },
    { id: 'perguntas', nome: 'Perguntas', cor: '#c792ea', desc: 'Perguntas previsíveis do júri' },
    { id: 'limites', nome: 'Limites', cor: '#ffb74d', desc: 'O que isto não prova' }
  ];
  P.PARAMS = ['metodo', 'freq', 'p0', 'Q', 'vel'];

  function rr(c, x, y, w, h, r) { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }
  const TR = (s) => (root.I18N ? root.I18N.t(s) : s);
  function tx(c, s, x, y, size, col, w, al) { s = TR(s); c.font = (w || 600) + ' ' + size + 'px "Segoe UI", Arial, sans-serif'; c.fillStyle = col || K.fg; c.textAlign = al || 'left'; c.textBaseline = 'alphabetic'; c.fillText(s, x, y); }
  function wrap(c, s, x, y, maxW, lh, size, col, w) { s = TR(s); c.font = (w || 400) + ' ' + size + 'px "Segoe UI", Arial, sans-serif'; c.fillStyle = col || K.mut; c.textAlign = 'left'; const words = s.split(' '); let line = '', yy = y; for (const wd of words) { const t = line ? line + ' ' + wd : wd; if (c.measureText(t).width > maxW && line) { c.fillText(line, x, yy); line = wd; yy += lh; } else line = t; } if (line) { c.fillText(line, x, yy); yy += lh; } return yy; }
  function card(c, x, y, w, h, hl, col) { const g = c.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, K.panel2); g.addColorStop(1, K.panel); rr(c, x, y, w, h, 18); c.fillStyle = g; c.fill(); c.lineWidth = hl ? 4 : 1.5; c.strokeStyle = hl ? (col || K.or) : K.line; c.stroke(); if (hl) { c.shadowColor = col || K.or; c.shadowBlur = 22; c.stroke(); c.shadowBlur = 0; } }
  function bar(c, x, y, w, h, f, col) { rr(c, x, y, w, h, h / 2); c.fillStyle = '#06121f'; c.fill(); c.strokeStyle = K.line; c.lineWidth = 1; c.stroke(); if (f > 0) { rr(c, x, y, Math.max(h, w * Math.min(1, f)), h, h / 2); c.fillStyle = col; c.fill(); } }
  function logo(c, x, y, s) { World.drawLogo(c, x, y, s, '#ffffff', '#F28C28'); }
  function header(c, titulo, cor, S) {
    c.fillStyle = '#081b2e'; c.fillRect(0, 0, 1600, 92); c.fillStyle = cor; c.fillRect(0, 90, 1600, 4);
    logo(c, 26, 12, 0.26); tx(c, titulo, 100, 62, 40, K.fg, 800);
    const on = S.sim.onTarget > 0.5; const lab = TR(on ? 'MÉTODO LIGADO' : 'MÉTODO DESLIGADO'); c.font = '800 24px "Segoe UI"'; const w = c.measureText(lab).width + 50;
    rr(c, 1574 - w, 26, w, 42, 21); c.fillStyle = on ? 'rgba(76,217,123,.15)' : 'rgba(255,90,77,.15)'; c.fill(); c.strokeStyle = on ? K.gr : K.rd; c.lineWidth = 2; c.stroke(); tx(c, lab, 1574 - w / 2, 56, 24, on ? K.gr : K.rd, 800, 'center');
    const w2 = 330; rr(c, 1574 - w - w2 - 14, 26, w2, 42, 21); c.fillStyle = 'rgba(227,179,65,.12)'; c.fill(); c.strokeStyle = K.am; c.stroke(); tx(c, 'SIMULAÇÃO · hipótese do projecto', 1574 - w - w2 / 2 - 14, 56, 21, K.am, 700, 'center');
  }
  function footer(c, S, txt) { c.fillStyle = '#081b2e'; c.fillRect(0, 862, 1600, 38); tx(c, txt || 'Valores de um modelo 1-D simplificado e de uma simulação esquemática. Não são medições; o tamanho real das gotas só se obtém ao microscópio.', 24, 888, 19, K.mut, 500); }
  const colR = (R) => R < 1 ? K.rd : R < 5 ? K.am : K.gr;

  // ---------------------------------------------------------------- 1. Parâmetros
  P.parametros = function (c, S, full) {
    const d = S.d, p = S.p, sim = S.sim; c.fillStyle = K.bg; c.fillRect(0, 0, 1600, 900); header(c, 'PAINEL DE PARÂMETROS', K.or, S);
    const cen = F.CENARIOS[S.cen || 0];
    const rows = [
      ['Método acústico', sim.onTarget > 0.5 ? 'LIGADO' : 'DESLIGADO', sim.onTarget, sim.onTarget > 0.5 ? K.gr : K.rd, '□ liga / desliga'],
      ['Frequência', F.fmtF(p.f), (Math.log10(p.f) - Math.log10(2e4)) / (Math.log10(2e6) - Math.log10(2e4)), K.or, F.FREQ_NOMES[F.FREQS.indexOf(p.f)] || ''],
      ['Pressão acústica p₀', F.fmt(p.p0 / 1e3, 0) + ' kPa', (p.p0 - 5e4) / 4.5e5, K.cy, 'E = ' + F.fmt(d.E, 1) + ' J/m³'],
      ['Vazão', F.fmt(p.Q, 1) + ' L/s', (p.Q - 1) / 9, K.gr, 'u = ' + F.fmt(sim.u, 2) + ' m/s (esquemático)'],
      ['Cenário pronto', cen.nome, (S.cen || 0) / (F.CENARIOS.length - 1), '#c792ea', 'um toque: ◀ ▶'],
      ['Velocidade da simulação', '×' + sim.speed, Math.log2(sim.speed) / 3, K.am, 'só afecta o tempo do ecrã']
    ];
    for (let i = 0; i < rows.length; i++) {
      const y = 116 + i * 112, sel = full && S.sel === i; card(c, 30, y, 800, 100, sel, rows[i][3]);
      tx(c, rows[i][0], 56, y + 34, 22, K.mut, 700); tx(c, rows[i][1], 56, y + 82, rows[i][1].length > 18 ? 34 : 46, K.fg, 800); tx(c, rows[i][4], 800, y + 34, 19, K.mut, 500, 'right');
      bar(c, 520, y + 58, 280, 16, rows[i][2], rows[i][3]);
      if (sel) { tx(c, '◀  ▶', 800, y + 92, 20, rows[i][3], 800, 'right'); }
    }
    // coluna direita: derivados
    card(c, 860, 118, 710, 190, true, colR(d.R)); tx(c, 'RAZÃO  F acústica / flutuação', 886, 156, 22, K.mut, 700);
    tx(c, '×' + F.fmt(d.R, d.R < 10 ? 2 : 1), 886, 250, 100, colR(d.R), 800);
    const veredito = d.R < 1 ? 'A força é MENOR que a flutuação: não prende as gotas' : d.R < 5 ? 'Prende, mas pouco: camadas fracas' : 'A força DOMINA: as gotas arrumam-se em camadas';
    wrap(c, veredito, 1190, 190, 360, 30, 24, colR(d.R), 700);
    const tiles = [
      ['λ/2 (distância entre camadas)', F.fmtLen(d.lam2), K.cy], ['Contraste acústico Φ', F.fmt(d.Phi, 3), K.mut],
      ['Tempo de arrumação (a = 1,5 µm)', F.fmtT(d.tau15), d.tau15 < 30 ? K.gr : d.tau15 < 600 ? K.am : K.rd], ['Potência eléctrica (módulo)', F.fmtP(d.Pel), K.fg],
      ['Aquecimento da água ΔT', F.fmt(d.dT, 2) + ' K', d.dT < 1 ? K.gr : d.dT < 3 ? K.am : K.rd], ['Ganho de ressonância', F.fmt(d.gain * 100, 0) + ' %', d.gain > 0.8 ? K.gr : d.gain > 0.4 ? K.am : K.rd],
      ['Índice mecânico (proxy)', F.fmt(d.MI, 2), K.mut], ['Comprimento de onda λ', F.fmtLen(d.lambda), K.mut]
    ];
    for (let i = 0; i < tiles.length; i++) { const x = 860 + (i % 2) * 360, y = 330 + ((i / 2) | 0) * 118; card(c, x, y, 350, 106, false); tx(c, tiles[i][0], x + 20, y + 34, 18, K.mut, 600); tx(c, tiles[i][1], x + 20, y + 84, 38, tiles[i][2], 800); }
    tx(c, 'R = 3·|Φ|·k·E / (Δρ·g)     k = 2πf/c     E = p₀² / (4ρc²)     ΔT = P / (ρ·Q·cₚ)', 30, 806, 21, K.mut, 500);
    tx(c, 'Óleo: ' + F.OLEO.nome + ' · ρ = ' + F.OLEO.rho + ' kg/m³ · c = ' + F.OLEO.c + ' m/s (valores a confirmar)', 30, 840, 19, K.am, 600);
    footer(c, S, 'Hipóteses de escala: módulo de ' + F.AREA_MODULO + ' m², rendimento ' + (F.EFIC * 100) + ' %, reflexão ' + F.REFL + '. Ver painel «Limites».');
  };

  // ---------------------------------------------------------------- 2. Ondas
  P.ondas = function (c, S, full) {
    const d = S.d, p = S.p, t = S.t, on = S.sim.on; c.fillStyle = K.bg; c.fillRect(0, 0, 1600, 900); header(c, 'PAINEL DE ONDAS', K.cy, S);
    // osciloscópio
    card(c, 30, 118, 770, 330, false); tx(c, 'OSCILAÇÃO DA PRESSÃO (câmara lenta)', 54, 154, 20, K.mut, 700); tx(c, F.fmtF(p.f), 770, 156, 44, K.or, 800, 'right');
    c.save(); rr(c, 54, 176, 722, 230, 10); c.clip(); c.fillStyle = '#06121f'; c.fillRect(54, 176, 722, 230);
    c.strokeStyle = '#1b3a58'; c.lineWidth = 1; for (let i = 1; i < 8; i++) { c.beginPath(); c.moveTo(54 + i * 90, 176); c.lineTo(54 + i * 90, 406); c.stroke(); } for (let i = 1; i < 4; i++) { c.beginPath(); c.moveTo(54, 176 + i * 57.5); c.lineTo(776, 176 + i * 57.5); c.stroke(); }
    c.strokeStyle = K.or; c.lineWidth = 4; c.shadowColor = K.or; c.shadowBlur = 12; c.beginPath(); const amp = 90 * Math.min(1, Math.sqrt(p.p0 / 4.5e5)) * (0.15 + 0.85 * on);
    for (let x = 0; x <= 722; x += 3) { const y = 291 - amp * Math.sin((x / 722) * 6.283 * 5 - t * 4); x ? c.lineTo(54 + x, y) : c.moveTo(54 + x, y); } c.stroke(); c.shadowBlur = 0; c.restore();
    tx(c, '5 períodos · 1 período = ' + F.fmt(1e6 / p.f, 2) + ' µs reais', 54, 438, 18, K.mut, 500);
    // onda estacionária
    card(c, 830, 118, 740, 330, false); tx(c, 'ONDA ESTACIONÁRIA NA CÉLULA', 854, 154, 20, K.mut, 700); tx(c, 'antinodos a cada λ/2 = ' + F.fmtLen(d.lam2), 1550, 156, 22, K.cy, 700, 'right');
    c.save(); rr(c, 854, 176, 692, 230, 10); c.clip(); c.fillStyle = '#06121f'; c.fillRect(854, 176, 692, 230); const NL = 6;
    for (let i = 0; i < NL; i++) { const yy = 176 + 230 * (i + 0.5) / NL; c.strokeStyle = 'rgba(79,195,247,' + (0.15 + 0.5 * on) + ')'; c.lineWidth = 8 * (0.3 + on * 0.7); c.beginPath(); c.moveTo(854, yy); c.lineTo(1546, yy); c.stroke(); }
    c.strokeStyle = K.cy; c.lineWidth = 3; c.beginPath(); for (let y = 0; y <= 230; y += 2) { const e = Math.abs(Math.cos(y / 230 * Math.PI * NL)) * 120 * (0.2 + 0.8 * on) * Math.abs(Math.cos(t * 5)); c.lineTo(1200 + e, 176 + y); } c.stroke(); c.beginPath(); for (let y = 0; y <= 230; y += 2) { const e = Math.abs(Math.cos(y / 230 * Math.PI * NL)) * 120 * (0.2 + 0.8 * on) * Math.abs(Math.cos(t * 5)); c.lineTo(1200 - e, 176 + y); } c.stroke();
    const rg = (i) => (Math.sin(i * 12.9898) * 43758.5453) % 1;
    for (let i = 0; i < 90; i++) { const r = Math.abs(rg(i)), li = (r * NL) | 0, x = 870 + ((r * 977 + i * 31) % 660), y0 = 176 + 230 * ((Math.abs(rg(i + 7))) % 1), yl = 176 + 230 * (li + 0.5) / NL, y = y0 + (yl - y0) * on; c.fillStyle = K.or; c.beginPath(); c.arc(x, y, 5, 0, 6.3); c.fill(); }
    c.restore(); tx(c, 'figura ampliada · as gotas (laranja) vão para os antinodos', 854, 438, 18, K.mut, 500);
    // ressonância
    card(c, 30, 470, 770, 380, false); tx(c, 'RESSONÂNCIA vs. AQUECIMENTO', 54, 506, 20, K.mut, 700);
    const gx = 70, gy = 530, gw = 700, gh = 270; c.strokeStyle = '#1b3a58'; c.lineWidth = 1; for (let i = 0; i <= 4; i++) { c.beginPath(); c.moveTo(gx, gy + gh * i / 4); c.lineTo(gx + gw, gy + gh * i / 4); c.stroke(); }
    const nmode = Math.max(1, Math.round(p.f * 2 * 2.2e-3 / d.cW)); c.strokeStyle = K.cy; c.lineWidth = 4; c.beginPath();
    for (let i = 0; i <= 120; i++) { const dT = i / 120 * 12, g = Modelo.cavityRelGain(nmode, F.REFL, p.f, d.cW, 3.0, dT); const x = gx + gw * i / 120, y = gy + gh - gh * Math.min(1, g); i ? c.lineTo(x, y) : c.moveTo(x, y); } c.stroke();
    const mx = gx + gw * Math.min(1, d.dT / 12), my = gy + gh - gh * Math.min(1, d.gain); c.fillStyle = d.gain > 0.8 ? K.gr : d.gain > 0.4 ? K.am : K.rd; c.beginPath(); c.arc(mx, my, 12, 0, 6.3); c.fill(); c.strokeStyle = '#fff'; c.lineWidth = 2; c.stroke();
    tx(c, 'ΔT da água (K) →', gx + gw, gy + gh + 28, 18, K.mut, 500, 'right'); tx(c, 'ganho', gx, gy - 6, 18, K.mut, 500); tx(c, 'agora: ΔT = ' + F.fmt(d.dT, 2) + ' K · ganho ' + F.fmt(d.gain * 100, 0) + ' %', gx + 10, gy + 30, 24, K.fg, 700);
    tx(c, 'O calor muda a velocidade do som e desafina a cavidade.', 54, 842, 18, K.mut, 500);
    // comparação de frequências
    card(c, 830, 470, 740, 380, false); tx(c, 'PORQUE 1,7 MHz E NÃO 40 kHz?  (mesma pressão para todas)', 854, 506, 20, K.mut, 700);
    tx(c, 'Frequência', 860, 546, 17, K.mut, 700); tx(c, 'λ/2', 1130, 546, 17, K.mut, 700); tx(c, 'F ac. / flutuação', 1270, 546, 17, K.mut, 700);
    for (let i = 0; i < F.FREQS.length; i++) { const f = F.FREQS[i], dd = F.derivar({ f, p0: p.p0, Q: p.Q, T0: p.T0 }), y = 584 + i * 36, cur = f === p.f; if (cur) { rr(c, 846, y - 24, 708, 32, 8); c.fillStyle = 'rgba(242,140,40,.18)'; c.fill(); }
      tx(c, F.fmtF(f), 860, y, 22, cur ? K.or : K.fg, 700); tx(c, F.fmtLen(dd.lam2), 1130, y, 22, K.fg, 500); tx(c, '×' + F.fmt(dd.R, dd.R < 10 ? 2 : 1), 1270, y, 22, colR(dd.R), 800); bar(c, 1370, y - 17, 170, 14, Math.min(1, Math.log10(1 + dd.R) / 2), colR(dd.R)); }
    footer(c, S);
  };

  // ---------------------------------------------------------------- 3. Vaso
  P.vaso = function (c, S, full) {
    const sim = S.sim, st = sim.stats(), d = S.d; c.fillStyle = K.bg; c.fillRect(0, 0, 1600, 900); header(c, 'PAINEL DO VASO SEPARADOR', K.gr, S);
    // vista longitudinal
    const vx = 30, vy = 118, vw = 1030, vh = 470; card(c, vx, vy, vw, vh, false); tx(c, 'INTERIOR DO VASO · vista lateral (ao vivo)', vx + 24, vy + 36, 20, K.mut, 700);
    const X = (x) => vx + 30 + (x - C.X0) / (C.X1 - C.X0) * (vw - 60), Y = (y) => vy + vh - 40 - (y - 0.7) / (3.1 - 0.7) * (vh - 100);
    c.save(); rr(c, vx + 30, Y(3.1), vw - 60, Y(0.7) - Y(3.1), 40); c.clip(); c.fillStyle = '#0a3350'; c.fillRect(vx, Y(2.5), vw, Y(0.7) - Y(2.5)); c.fillStyle = '#6b3a00'; c.fillRect(vx, Y(3.1), vw, Y(2.5) - Y(3.1)); c.fillStyle = 'rgba(217,138,28,.55)'; c.fillRect(vx, Y(3.1), vw, Y(2.5) - Y(3.1));
    const ch0 = X(C.CX0), ch1 = X(C.CX1); c.fillStyle = 'rgba(79,195,247,' + (0.08 + 0.1 * sim.on) + ')'; c.fillRect(ch0, Y(C.Y1), ch1 - ch0, Y(C.Y0) - Y(C.Y1));
    for (let i = 0; i < C.NL; i++) { c.strokeStyle = 'rgba(79,195,247,' + (0.55 * sim.on) + ')'; c.lineWidth = 2; c.beginPath(); c.moveTo(ch0, Y(C.layerY(i))); c.lineTo(ch1, Y(C.layerY(i))); c.stroke(); }
    const stp = P.lite ? 3 : 1, cores = ['#ffc272', '#ffa53a', '#ff7a2f'];      // versão leve: 1 gota em 3; desenho em lote por cor
    for (let k = 0; k < 3; k++) { c.fillStyle = cores[k]; c.beginPath(); for (let i = 0; i < sim.nAct; i += stp) { const r = sim.r[i], kk = r > 12 ? 2 : r > 7 ? 1 : 0; if (kk !== k) continue; const q = 1.4 + r * 0.22, px = X(sim.x[i]), py = Y(sim.y[i]); c.rect(px - q, py - q, q * 2, q * 2); } c.fill(); }
    c.restore(); c.strokeStyle = '#9fb8d0'; c.lineWidth = 4; rr(c, vx + 30, Y(3.1), vw - 60, Y(0.7) - Y(3.1), 40); c.stroke();
    c.strokeStyle = sim.onTarget > 0.5 ? K.cy : K.mut; c.lineWidth = 3; c.setLineDash([10, 8]); c.strokeRect(ch0, Y(C.Y1) - 6, ch1 - ch0, Y(C.Y0) - Y(C.Y1) + 12); c.setLineDash([]);
    tx(c, 'câmara acústica', (ch0 + ch1) / 2, Y(C.Y1) - 14, 20, sim.onTarget > 0.5 ? K.cy : K.mut, 700, 'center'); tx(c, 'ENTRADA ▶', X(C.X0) + 16, Y(0.9), 20, K.fg, 700); tx(c, 'zona de decantação', X(3.0), Y(0.9), 18, K.mut, 600, 'center');
    tx(c, 'ÓLEO', vx + vw - 60, Y(2.8), 20, '#ffd9a0', 800, 'right'); tx(c, 'ÁGUA', vx + vw - 60, Y(1.7), 20, '#9fd2f2', 800, 'right');
    tx(c, 'camadas ampliadas ' + F.fmt(C.DY / d.lam2, 0) + '× · fora de escala', vx + 24, vy + vh - 12, 18, K.am, 600);
    // KPIs
    const kx = 1090, ky = 118;
    card(c, kx, ky, 480, 220, true, K.gr); tx(c, 'ÓLEO CAPTADO (nesta simulação)', kx + 24, ky + 38, 20, K.mut, 700);
    tx(c, st.ok ? F.fmt(st.cap * 100, 0) + ' %' : 'a medir…', kx + 24, ky + 128, 84, st.ok ? K.gr : K.mut, 800);
    tx(c, 'das gotas que chegam ao fim do vaso', kx + 24, ky + 170, 20, K.mut, 500); tx(c, st.ok ? 'D50 à saída ' + F.fmt(st.d50, 0) + ' µm (entrada ≈ 9 µm)' : 'espera ' + st.n + '/40 gotas', kx + 24, ky + 200, 22, K.fg, 700);
    card(c, kx, ky + 236, 480, 230, false); tx(c, 'SEM MÉTODO  vs  COM MÉTODO', kx + 24, ky + 272, 20, K.mut, 700);
    const m = S.mem; const row = (lab, o, y, col) => { tx(c, lab, kx + 24, y, 22, col, 700); tx(c, o ? F.fmt(o.cap * 100, 0) + ' % captado' : '— (liga/desliga com □)', kx + 190, y, 22, o ? K.fg : K.mut, 700); if (o) { tx(c, 'D50 ' + F.fmt(o.d50, 0) + ' µm', kx + 456, y, 20, K.mut, 600, 'right'); bar(c, kx + 24, y + 12, 430, 12, o.cap, col); } };
    row('Sem', m.off, ky + 318, K.rd); row('Com', m.on, ky + 392, K.gr);
    if (m.on && m.off) { const g = m.off.cap > 0.005 ? m.on.cap / m.off.cap : null; tx(c, g ? 'Nesta simulação: ×' + F.fmt(g, 1) + ' mais óleo captado' : '', kx + 24, ky + 440, 22, K.or, 800); tx(c, 'modelo de brinquedo, não é previsão', kx + 24, ky + 460, 15, K.am, 600); }
    // histograma
    card(c, 30, 610, 1030, 240, false); tx(c, 'DISTRIBUIÇÃO DE TAMANHOS À SAÍDA (diâmetro, µm)', 54, 644, 20, K.mut, 700);
    const bins = new Array(14).fill(0); for (const e of sim.events) { const b = Math.min(13, Math.floor(e.d / 4)); bins[b]++; } const mx = Math.max(1, ...bins), n = sim.events.length || 1;
    for (let i = 0; i < 14; i++) { const h = 130 * bins[i] / mx, x = 70 + i * 70; c.fillStyle = i * 4 < 12 ? K.cy : K.or; rr(c, x, 800 - h, 56, h, 6); c.fill(); tx(c, (i * 4) + '–' + (i * 4 + 4), x + 28, 828, 15, K.mut, 500, 'center'); }
    tx(c, 'azul: pequenas · laranja: grandes, sobem depressa', 1040, 828, 15, K.mut, 500, 'right');
    card(c, 1090, 724, 480, 126, false); wrap(c, 'Gotas dentro da câmara arrumam-se em camadas, juntam-se e depois, fora do campo, sobem para a camada de óleo muito mais depressa (v ∝ raio²).', 1112, 756, 440, 26, 19, K.mut, 500);
    footer(c, S, 'Simulação esquemática (modelo de brinquedo com as razões de força do projecto). O que sai daqui não é previsão nem medição.');
  };

  // ---------------------------------------------------------------- 4. Equipamentos
  P.equipamentos = function (c, S, full) {
    c.fillStyle = K.bg; c.fillRect(0, 0, 1600, 900); header(c, 'EQUIPAMENTOS A MINIMIZAR', K.rd, S); const on = S.sim.onTarget > 0.5;
    const box = (x, y, w, h, t1, t2, col, dash) => { rr(c, x, y, w, h, 14); c.fillStyle = 'rgba(14,39,64,.95)'; c.fill(); c.lineWidth = 3; c.strokeStyle = col; if (dash) c.setLineDash([10, 7]); c.stroke(); c.setLineDash([]); tx(c, t1, x + w / 2, y + 40, 22, K.fg, 800, 'center'); if (t2) tx(c, t2, x + w / 2, y + 70, 17, col, 700, 'center'); };
    const arrow = (x1, y, x2, col) => { c.strokeStyle = col || K.mut; c.lineWidth = 4; c.beginPath(); c.moveTo(x1, y); c.lineTo(x2 - 10, y); c.stroke(); c.fillStyle = col || K.mut; c.beginPath(); c.moveTo(x2, y); c.lineTo(x2 - 16, y - 9); c.lineTo(x2 - 16, y + 9); c.fill(); };
    tx(c, 'TREM DE TRATAMENTO CONVENCIONAL', 40, 150, 24, K.mut, 800);
    const names = ['Vaso separador', 'Hidrociclones', 'Flotação', 'Água tratada']; for (let i = 0; i < 4; i++) { box(40 + i * 380, 170, 300, 100, names[i], i === 0 ? 'volume grande' : i === 3 ? '' : 'a jusante', i === 3 ? K.cy : K.mut); if (i < 3) arrow(340 + i * 380, 220, 420 + i * 380); }
    box(40, 290, 300, 70, 'Demulsificante químico', '', K.mut); c.strokeStyle = K.mut; c.setLineDash([8, 6]); c.beginPath(); c.moveTo(190, 290); c.lineTo(190, 270); c.stroke(); c.setLineDash([]);
    tx(c, 'COM O MÓDULO COALESCER (HIPÓTESE)', 40, 430, 24, K.or, 800);
    box(40, 450, 300, 100, 'Vaso + módulo', 'volume menor?', K.or); arrow(340, 500, 420, K.or); box(420, 450, 300, 100, 'Hidrociclones', 'carga menor?', K.or, true); arrow(720, 500, 800, K.or); box(800, 450, 300, 100, 'Flotação', 'carga menor?', K.or, true); arrow(1100, 500, 1180, K.or); box(1180, 450, 300, 100, 'Água tratada', '', K.cy);
    box(40, 570, 300, 84, 'Demulsificante', 'dose menor?', K.or, true);
    // tabela
    card(c, 30, 660, 1540, 190, false); tx(c, 'O QUE TERIA DE SER PROVADO PARA CADA «MENOR»', 54, 696, 20, K.mut, 800);
    const lin = [['Vaso: gotas maiores sobem mais depressa → menos tempo de residência', 'Medir o tamanho das gotas (microscópio) e o tempo de separação, com e sem ultrassons.'], ['Hidrociclones / flotação: menos óleo fino chega a jusante', 'Medir o óleo na água à saída, em ensaio de bancada e depois piloto.'], ['Demulsificante: a coalescência acústica poderia substituir parte da dose', 'Comparar a dose necessária com e sem o campo, na mesma emulsão.']];
    for (let i = 0; i < 3; i++) { const y = 734 + i * 38; tx(c, '•', 54, y, 22, K.or, 800); tx(c, lin[i][0], 80, y, 19, K.fg, 700); tx(c, '→ ' + lin[i][1], 1560, y, 17, K.mut, 500, 'right'); }
    // aviso
    rr(c, 1150, 575, 420, 66, 12); c.fillStyle = 'rgba(227,179,65,.12)'; c.fill(); c.strokeStyle = K.am; c.lineWidth = 2; c.stroke(); tx(c, 'Nenhum número aqui: só as', 1360, 603, 19, K.am, 800, 'center'); tx(c, 'medições dirão quanto reduz.', 1360, 628, 19, K.am, 800, 'center');
    footer(c, S, 'Todas as reduções são hipóteses a confirmar. Em modo comparação (△ no tablet) os equipamentos convencionais ficam a vermelho na sala.');
  };

  // ---------------------------------------------------------------- 5. O projecto
  P.projecto = function (c, S, full) {
    c.fillStyle = K.bg; c.fillRect(0, 0, 1600, 900); header(c, 'O PROJECTO', K.am, S);
    logo(c, 60, 130, 1.15); tx(c, 'COALESCER', 330, 220, 96, K.fg, 800); tx(c, 'COALESCÊNCIA ACÚSTICA DE GOTÍCULAS', 336, 268, 26, K.mut, 700);
    tx(c, 'Será que o som consegue juntar gotículas de óleo?', 60, 400, 46, K.or, 800);
    const y = wrap(c, 'Estudamos se um campo ultrassónico altera o tamanho das gotículas numa emulsão de óleo em água. Gotas maiores sobem mais depressa e separam-se melhor. Este simulador mostra a ideia dentro de um vaso separador.', 60, 450, 900, 36, 25, K.fg, 500);
    card(c, 60, 560, 900, 270, false); tx(c, 'ESTADO REAL DO PROJECTO', 90, 600, 20, K.am, 800);
    ['Projecto aprovado; ensaios de bancada por começar.', 'Ainda não há resultados experimentais.', 'A 40 kHz esperamos efeito pequeno ou nulo (força ≈ 5 % da flutuação).', 'A ≈ 1,7 MHz o cálculo dá ≈ 20×, por confirmar; calor e ressonância são os riscos.', 'Este simulador é uma ilustração da hipótese, não uma prova.'].forEach((s, i) => tx(c, '• ' + s, 90, 644 + i * 36, 22, i === 4 ? K.am : K.fg, i === 4 ? 800 : 500));
    card(c, 1000, 130, 570, 700, false); tx(c, 'COMANDO PS4', 1030, 176, 22, K.or, 800);
    [['Stick esq.', 'andar'], ['Stick dir.', 'olhar'], ['R2', 'correr'], ['✕', 'abrir painel / confirmar'], ['○', 'fechar / voltar'], ['□', 'ligar/desligar método'], ['△', 'tablet'], ['L1 / R1', 'painel anterior / seguinte'], ['Setas', 'escolher e ajustar'], ['Touchpad', 'apresentação guiada'], ['Share', 'fotografia']].forEach((r, i) => { const yy = 222 + i * 58; rr(c, 1030, yy - 30, 170, 42, 10); c.fillStyle = '#06121f'; c.fill(); tx(c, r[0], 1115, yy - 1, 22, K.fg, 800, 'center'); tx(c, r[1], 1220, yy - 1, 22, K.mut, 600); });
    tx(c, 'Teclado: WASD · rato · E · Backspace · R · T · Z/C · G apresentação · F2 foto · H ajuda', 1030, 820, 17, K.mut, 500);
    footer(c, S, 'Projecto de Oscilações e Ondas · Engenharia Petrolífera · ISPTEC · José Mussango, Dadilson Miguel, Idiana João');
  };


  // ---------------------------------------------------------------- 6. Perguntas do júri
  const LG = (S, o) => (o && (o[S.lang || 'pt'] || o.pt)) || '';
  P.perguntas = function (c, S, full) {
    const X = Conteudo, q = (S.q || 0) % X.FAQ.length, it = X.FAQ[q], tag = X.TAGS[it.tag];
    c.fillStyle = K.bg; c.fillRect(0, 0, 1600, 900); header(c, 'PERGUNTAS DO JÚRI', '#c792ea', S);
    for (let i = 0; i < X.FAQ.length; i++) {
      const y = 112 + i * 74, sel = i === q; rr(c, 30, y, 560, 66, 14); c.fillStyle = sel ? 'rgba(199,146,234,.18)' : '#0e2740'; c.fill(); c.lineWidth = sel ? 3 : 1.5; c.strokeStyle = sel ? '#c792ea' : K.line; c.stroke();
      tx(c, String(i + 1), 56, y + 42, 26, sel ? '#c792ea' : K.mut, 800, 'center'); c.save(); c.beginPath(); c.rect(80, y, 500, 66); c.clip();
      wrap(c, LG(S, X.FAQ[i].q), 80, y + 28, 500, 24, 19, sel ? K.fg : K.mut, sel ? 800 : 600); c.restore();
    }
    card(c, 620, 112, 950, 730, true, '#c792ea');
    tx(c, 'PERGUNTA ' + (q + 1) + ' DE ' + X.FAQ.length, 650, 156, 18, K.mut, 800);
    let y = wrap(c, LG(S, it.q), 650, 214, 890, 46, 38, K.fg, 800);
    rr(c, 650, y + 4, 90, 5, 2); c.fillStyle = '#c792ea'; c.fill();
    y = wrap(c, LG(S, it.a), 650, y + 62, 890, 40, 27, '#dbe6f1', 500);
    const t = LG(S, tag); c.font = '800 20px "Segoe UI"'; const w = c.measureText(t).width + 40; rr(c, 650, 760, w, 42, 21); c.fillStyle = 'rgba(0,0,0,.25)'; c.fill(); c.strokeStyle = tag.cor; c.lineWidth = 2; c.stroke(); tx(c, t, 650 + w / 2, 788, 20, tag.cor, 800, 'center');
    tx(c, full ? '↑ ↓  escolhe a pergunta' : '↑ ↓ no ecrã inteiro', 1550, 800, 19, K.mut, 600, 'right');
    footer(c, S, 'Respostas curtas e honestas: o que é cálculo, o que é hipótese e o que falta medir.');
  };

  // ---------------------------------------------------------------- 7. Limites
  P.limites = function (c, S, full) {
    const X = Conteudo; c.fillStyle = K.bg; c.fillRect(0, 0, 1600, 900); header(c, 'O QUE ISTO NÃO PROVA', '#ffb74d', S);
    card(c, 30, 112, 940, 736, true, K.rd); tx(c, 'NÃO PROVA / LIMITES', 60, 156, 24, K.rd, 800);
    let y = 196; X.LIMITES_NAO.forEach((o) => { tx(c, '✕', 62, y + 6, 26, K.rd, 800); y = wrap(c, LG(S, o), 98, y + 4, 840, 30, 22, K.fg, 500) + 14; });
    card(c, 1000, 112, 570, 440, true, K.gr); tx(c, 'O QUE MOSTRA', 1030, 156, 24, K.gr, 800);
    y = 196; X.LIMITES_SIM.forEach((o) => { tx(c, '✓', 1032, y + 6, 26, K.gr, 800); y = wrap(c, LG(S, o), 1068, y + 4, 470, 30, 22, K.fg, 500) + 18; });
    card(c, 1000, 572, 570, 276, false); tx(c, 'ESTADO REAL', 1030, 612, 20, K.am, 800);
    wrap(c, 'Projecto aprovado. Ainda sem resultados experimentais. O próximo passo é o ensaio de bancada da Versão A, com pares de amostras, mesma temperatura, ordem aleatória e contagem às cegas.', 1030, 656, 510, 32, 22, K.fg, 500);
    footer(c, S, 'Se alguém perguntar «isto é real?»: é uma ilustração de uma hipótese, com os limites aqui escritos.');
  };

  // ---------------------------------------------------------------- faixa do ecrã grande
  P.faixa = function (c, S, W, H) {
    const sim = S.sim, st = sim.stats(); c.fillStyle = '#07182a'; c.fillRect(0, 0, W, H); c.fillStyle = K.or; c.fillRect(0, H - 14, W, 14);
    logo(c, 40, 30, 0.9); tx(c, 'COALESCER', 270, 150, 120, K.fg, 800); tx(c, sim.onTarget > 0.5 ? 'MÉTODO ACÚSTICO LIGADO' : 'MÉTODO ACÚSTICO DESLIGADO', 280, 220, 36, sim.onTarget > 0.5 ? K.gr : K.rd, 800);
    const items = [['ÓLEO CAPTADO', st.ok ? F.fmt(st.cap * 100, 0) + ' %' : '…', K.gr], ['D50 À SAÍDA', st.ok ? F.fmt(st.d50, 0) + ' µm' : '…', K.or], ['F ac. / FLUTUAÇÃO', '×' + F.fmt(S.d.R, S.d.R < 10 ? 1 : 0), colR(S.d.R)]];
    items.forEach((it, i) => { const x = 960 + (i % 3) * 300; tx(c, it[0], x, 120, 24, K.mut, 700); tx(c, it[1], x, 215, 84, it[2], 800); });
    tx(c, 'SIMULAÇÃO · hipótese do projecto · não são medições', 1860, 600, 26, K.am, 800, 'right');
  };

  // ---------------------------------------------------------------- tablet (menu com miniaturas)
  P.tablet = function (c, S, W, H, idx) {
    c.fillStyle = '#06121f'; c.fillRect(0, 0, W, H); logo(c, 16, 10, 0.16); tx(c, 'TABLET · painéis de análise', 70, 44, 26, K.fg, 800); tx(c, 'D-pad escolhe · ✕ abre · △ guarda', W - 16, 44, 19, K.mut, 600, 'right');
    const n = P.LISTA.length, gap = 14, cw = (W - gap * 5) / 4, ch = cw * 0.5625;
    for (let i = 0; i < n; i++) {
      const col = i % 4, row = (i / 4) | 0, x = gap + col * (cw + gap), y = 72 + row * (ch + 62), it = P.LISTA[i];
      c.save(); c.translate(x, y); c.scale(cw / 1600, ch / 900); rr(c, 0, 0, 1600, 900, 30); c.clip(); P[it.id](c, S, false); c.restore();
      rr(c, x, y, cw, ch, 10); c.lineWidth = i === idx ? 6 : 2; c.strokeStyle = i === idx ? it.cor : K.line; c.stroke(); tx(c, (i + 1) + ' · ' + it.nome, x + 4, y + ch + 28, 22, i === idx ? it.cor : K.fg, 800);
    }
    const ex = gap + 3 * (cw + gap), ey = 72 + (ch + 62); rr(c, ex, ey, cw, ch, 10); c.fillStyle = '#0e2740'; c.fill(); c.strokeStyle = idx === n ? K.rd : K.line; c.lineWidth = idx === n ? 6 : 2; c.stroke();
    tx(c, S.compare ? 'COMPARAÇÃO: LIGADA' : 'COMPARAÇÃO: DESLIGADA', ex + cw / 2, ey + ch / 2 - 2, 20, S.compare ? K.rd : K.mut, 800, 'center'); tx(c, 'equipamentos a vermelho', ex + cw / 2, ey + ch / 2 + 24, 15, K.mut, 500, 'center'); tx(c, (n + 1) + ' · comparar', ex + 4, ey + ch + 28, 22, idx === n ? K.rd : K.fg, 800);
  };

  // desenha um painel (por id) escalado para qualquer tamanho 16:9
  P.draw = function (id, ctx, W, H, S, full) { ctx.save(); ctx.scale(W / 1600, H / 900); P[id](ctx, S, full); ctx.restore(); };
  root.Paineis = P;
})(window);
