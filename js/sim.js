// sim.js — simulação esquemática de gotículas dentro do vaso separador.
// ESTATUTO: modelo de brinquedo (visual) com a física do projecto nas razões de força; a escala das camadas está AMPLIADA.
// O número de gotas captadas e o D50 que daqui saem são resultados DESTA simulação, não medições nem previsões.
// Desempenho: grelha espacial em arrays tipados (sem alocações), pesquisa de vizinhos em 1/3 das gotas por passo, número de gotas activas ajustável.
(function (root) {
  const X0 = -4.4, X1 = 4.4, CX0 = -1.6, CX1 = 1.6;      // vaso e câmara acústica (m)
  const Y0 = 0.9, Y1 = 2.3, NL = 7, DY = (Y1 - Y0) / NL; // câmara: camadas
  const YOIL = 2.5, YMIN = 0.75, Z0 = -0.7, Z1 = 0.7;
  const VIS = 0.0042;                                    // m de raio visual por µm
  const rnd = Math.random;
  const layerY = (i) => Y0 + DY * (i + 0.5);
  const TS = 8192, TM = TS - 1, SUB = 3;                 // buckets da grelha; fracção de gotas verificadas por passo

  class Sim {
    constructor(n) {
      this.n = n || 2400; this.nAct = this.n;
      this.x = new Float32Array(this.n); this.y = new Float32Array(this.n); this.z = new Float32Array(this.n);
      this.r = new Float32Array(this.n);         // raio em µm
      this.trap = new Uint8Array(this.n);        // 1 = presa numa camada
      this.on = 0; this.onTarget = 0; this.R = 20; this.u = 0.30; this.speed = 2;
      this.events = [];                           // {cap:boolean, d:diâmetro µm}
      this.nCap = 0; this.nOut = 0; this.t = 0; this.nMerge = 0; this.resetEv = 0; this.ph = 0;
      this.head = new Int32Array(TS); this.nxt = new Int32Array(this.n);
      for (let i = 0; i < this.n; i++) { this.spawn(i, true); }
    }
    setAct(k) { this.nAct = Math.max(600, Math.min(this.n, k | 0)); }
    spawn(i, fill) {
      this.x[i] = fill ? X0 + rnd() * (X1 - X0) : X0 + rnd() * 0.3;
      this.y[i] = 0.9 + rnd() * 1.4; this.z[i] = Z0 + rnd() * (Z1 - Z0);
      const g = (rnd() + rnd() + rnd() + rnd() - 2) * 0.55;       // ~normal
      this.r[i] = Math.min(9, Math.max(2, 4.5 * Math.exp(g * 0.6)));
      this.trap[i] = 0;
    }
    clearStats() { this.events.length = 0; this.nCap = 0; this.nOut = 0; this.resetEv++; }
    vB(r) { return 0.016 * (r / 5) * (r / 5); }
    stats() {
      const ev = this.events, n = ev.length; if (n < 40) return { ok: false, n };
      let cap = 0; const ds = [];
      for (const e of ev) { if (e.cap) cap++; ds.push(e.d); }
      ds.sort((a, b) => a - b);
      return { ok: true, n, cap: cap / n, d50: ds[(ds.length / 2) | 0], d90: ds[(ds.length * 0.9) | 0] };
    }
    inletD50() { return 9; }
    step(dtReal) {
      const dt = Math.min(dtReal, 0.05) * this.speed; this.t += dt;
      this.on += (this.onTarget - this.on) * Math.min(1, dtReal * 1.6);
      const on = this.on, Rv = Math.min(this.R, 40), eqOff = Rv > 1.0 ? Math.asin(1 / Rv) * DY / (2 * Math.PI) : 0;
      const n = this.nAct, x = this.x, y = this.y, z = this.z, r = this.r, trap = this.trap, u = this.u;
      // 1) movimento
      for (let i = 0; i < n; i++) {
        let xi = x[i] + u * dt, yi = y[i], ri = r[i];
        const vb = this.vB(ri);
        const inCh = xi > CX0 && xi < CX1 && yi > Y0 - DY * 0.5 && yi < Y1 + DY * 0.5;
        if (inCh && on > 0.02 && Rv > 1.0) {
          // arrumação nos antinodos: relaxação para yeq com taxa ~ k·v0 (modelo exacto 1-D, ver modelo.js)
          let li = Math.round((yi - Y0 - DY / 2) / DY); li = Math.max(0, Math.min(NL - 1, li));
          const yeq = layerY(li) + eqOff, kk = on * Rv * vb * (2 * Math.PI / DY) * Math.sqrt(Math.max(0, 1 - 1 / (Rv * Rv))) * 2.0;
          yi += (yeq - yi) * (1 - Math.exp(-kk * dt)) + vb * dt * (1 - on);
          trap[i] = Math.abs(yi - yeq) < DY * 0.12 ? 1 : 0;
          z[i] += Math.sin(this.t * 0.7 + i) * 0.0008;
        } else {
          yi += vb * dt; trap[i] = 0;
        }
        z[i] = Math.max(Z0, Math.min(Z1, z[i] + (rnd() - 0.5) * 0.0015 * dt * 30));
        x[i] = xi; y[i] = yi;
      }
      // 2) coalescência: grelha espacial em arrays tipados; verifica 1/SUB das gotas por passo (probabilidades e atracção escaladas)
      const cs = 0.16, inv = 1 / cs, head = this.head, nxt = this.nxt; head.fill(-1);
      for (let i = 0; i < n; i++) { const k = (((x[i] * inv) | 0) * 73856093 ^ ((y[i] * inv) | 0) * 19349663 ^ ((z[i] * inv) | 0) * 83492791) & TM; nxt[i] = head[k]; head[k] = i; }
      const kinetic = 0.55 + 0.45 * rnd(), dts = dt * SUB; this.ph = (this.ph + 1) % SUB;
      for (let i = this.ph; i < n; i += SUB) {
        if (x[i] < X0 || x[i] > X1 || y[i] > YOIL) continue;
        const gx = (x[i] * inv) | 0, gy = (y[i] * inv) | 0, gz = (z[i] * inv) | 0;
        let best = -1, bd = 1e9, cnt = 0;
        for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) for (let dz = -1; dz <= 1; dz++) {
          const k = ((gx + dx) * 73856093 ^ (gy + dy) * 19349663 ^ (gz + dz) * 83492791) & TM;
          for (let j = head[k]; j >= 0; j = nxt[j]) {
            if (j === i) continue; if (++cnt > 60) break;
            const ex = x[i] - x[j], ey = y[i] - y[j], ez = z[i] - z[j]; const d = ex * ex + ey * ey + ez * ez; if (d < bd) { bd = d; best = j; }
          }
        }
        if (best < 0) continue;
        const j = best, d = Math.sqrt(bd), touch = (r[i] + r[j]) * VIS;
        // atracção secundária só entre gotas presas na mesma camada (força de Bjerknes, esquemático)
        if (trap[i] && trap[j] && on > 0.2 && d < 0.30) {
          const f = 0.9 * on * dts * (1 + Rv * 0.04); const iv = 1 / Math.max(d, 1e-4);
          x[i] -= (x[i] - x[j]) * iv * Math.min(f * 0.06, d * 0.4); z[i] -= (z[i] - z[j]) * iv * Math.min(f * 0.06, d * 0.4);
        }
        const mf = (trap[i] && trap[j] && on > 0.2) ? 1.35 : 0.6;     // alcance de fusão: maior dentro da camada
        if (d < touch * mf && (j !== i)) {
          const p = trap[i] && trap[j] && on > 0.2 ? Math.min(0.95, 0.9 * SUB * 0.5) : 0.04 * kinetic * dts;
          if (rnd() < p) { r[i] = Math.cbrt(r[i] ** 3 + r[j] ** 3); this.nMerge++; this.spawn(j, false); x[j] = X0; }
        }
      }
      // 3) fim de vida: captadas no óleo ou saída pela água
      for (let i = 0; i < n; i++) {
        if (y[i] >= YOIL) { this.push(true, r[i]); this.spawn(i, false); }
        else if (x[i] >= X1) { this.push(false, r[i]); this.spawn(i, false); }
      }
    }
    push(cap, r) { this.events.push({ cap, d: 2 * r }); if (this.events.length > 500) this.events.shift(); if (cap) this.nCap++; else this.nOut++; }
  }
  Sim.C = { X0, X1, CX0, CX1, Y0, Y1, NL, DY, YOIL, YMIN, Z0, Z1, VIS, layerY };
  root.Sim = Sim;
})(window);
