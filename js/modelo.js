// modelo.js — implementação em JavaScript, INDEPENDENTE, das equações da Fase 4 (modelo simplificado).
// Estatuto: MODELO SIMPLIFICADO (campo estacionário ideal 1-D; sem coalescência). Não é uma simulação validada experimentalmente.
// Unidades SI. Valores marcados "HIP" são hipóteses.
(function (root) {
  const g = 9.81, kB = 1.380649e-23;
  const M = {};
  M.g = g; M.kB = kB;

  // --- propriedades do meio (HIP) ---
  M.cWater = (T) => 1482 + 3.0 * (T - 20);        // HIP: dc/dT ≈ +3 m/s/K
  M.cOilMotor = (T) => 1485 - 3.2 * (T - 8);       // PTB (Wilkens & Reimann 2007): ~1485 m/s a 8 °C, ~1025 m/s a 150 °C; interpolação linear

  // --- física da onda ---
  M.waveNumber = (f, c) => (2 * Math.PI * f) / c;
  M.EfromP = (pa, rho, c) => (pa * pa) / (4 * rho * c * c);              // J/m3, onda estacionária
  M.PfromE = (E, rho, c) => Math.sqrt(4 * rho * c * c * E);              // Pa
  M.MI = (pa, f) => pa / 1e6 / Math.sqrt(f / 1e6);                       // índice mecânico (proxy; limiar não verificado)

  // --- força de radiação e deriva ---
  M.contrast = (rhoO, cO, rhoW, cW) => {                                 // Φ = (1/3)[(5ρ̃−2)/(2ρ̃+1) − κ̃]
    const rt = rhoO / rhoW, bt = (1 / (rhoO * cO * cO)) / (1 / (rhoW * cW * cW));
    return ((5 * rt - 2) / (2 * rt + 1) - bt) / 3;
  };
  M.Frad = (Phi, k, a, E) => 4 * Math.PI * Math.abs(Phi) * k * a ** 3 * E;
  M.Fg = (a, drho) => (4 / 3) * Math.PI * a ** 3 * drho * g;
  M.vStokes = (a, drho, mu) => (2 * drho * g * a * a) / (9 * mu);
  M.v0 = (mu, Phi, k, a, E) => (2 / 3) * Math.abs(Phi) * k * a * a * E / mu;   // velocidade máxima de deriva
  M.tauBand = (mu, Phi, f, c, a, E) => { const k = M.waveNumber(f, c); return (3 * mu) / (4 * Math.abs(Phi) * k * k * a * a * E); };

  // Passo ANALÍTICO exato de dθ/dt = −k v0 sin 2θ (θ = k x): tan θ' = tan θ · exp(−2 k v0 dt). Devolve θ' em (−π/2, π/2) relativo ao antinodo mais próximo.
  M.stepTheta = (theta, kv0, dt) => Math.atan(Math.tan(theta) * Math.exp(-2 * kv0 * dt));

  // --- cavidade (Airy) ---
  M.airyGain = (phi, r) => 1 / ((1 - r) ** 2 + 4 * r * Math.sin(phi / 2) ** 2);
  M.cavityRelGain = (n, r, f0, c20, dcdT, dT) => {
    const L = (n * c20) / (2 * f0), phi = (4 * Math.PI * f0 * L) / (c20 + dcdT * dT);
    return M.airyGain(phi, r) / M.airyGain(0, r);
  };
  M.EacFromLaunched = (P, A, rhoRt, r2, rho, c) => {
    const I = P / A, p0 = Math.sqrt(2 * rho * c * I), pf = p0 / (1 - rhoRt), pa = pf * (1 + r2);
    return M.EfromP(pa, rho, c);
  };
  M.PlaunchedForE = (E, A, rhoRt, r2, rho, c) => {
    const pa = M.PfromE(E, rho, c), pf = pa / (1 + r2), p0 = pf * (1 - rhoRt);
    return (p0 * p0 / (2 * rho * c)) * A;
  };

  // --- térmica (célula cúbica, HIP) ---
  M.thermal = (V_L, h, rho = 998, cp = 4180) => {
    const V = V_L / 1000, s = Math.cbrt(V), As = 6 * s * s, C = V * rho * cp;
    return { As, C, dTperW: 1 / (h * As), tauTh: C / (h * As) };
  };

  // --- números aleatórios (para o simulador) ---
  M.randn = () => { let u = 0, v = 0; while (u === 0) u = Math.random(); while (v === 0) v = Math.random(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };

  if (typeof module !== 'undefined') module.exports = M; else root.Modelo = M;
})(typeof window !== 'undefined' ? window : globalThis);
