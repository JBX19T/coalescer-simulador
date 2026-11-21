// fisica.js — grandezas derivadas que os painéis mostram. Usa as equações do modelo simplificado da Fase 4 (modelo.js).
// ESTATUTO: SIMULAÇÃO de uma hipótese. Os valores vêm de um modelo 1-D ideal (onda estacionária), não de medições.
(function (root) {
  const M = root.Modelo, F = {};
  F.RHO_W = 998; F.RHO_O = 900; F.C_OIL = 1450; F.MU = 1e-3; F.CP = 4180;
  F.AREA_MODULO = 1.2;          // m², HIPÓTESE de escala (ilustrativa)
  F.REFL = 0.9;                 // reflectividade em amplitude da cavidade, HIPÓTESE
  F.EFIC = 0.5;                 // rendimento eléctrico→acústico, HIPÓTESE

  F.OLEO = { nome: 'Crude médio', rho: 900, c: 1450 };   // valores do projecto, típicos de um crude médio; a confirmar
  // cenários prontos (um toque): Versão A, Versão B e «aquece demais»
  F.CENARIOS = [
    { id: 'livre', nome: 'Livre (ajustas tu)' },
    { id: 'A', nome: 'Versão A · banho 40 kHz', f: 40e3, p0: 95e3, Q: 5 },
    { id: 'B', nome: 'Versão B · célula 1,7 MHz', f: 1.7e6, p0: 296e3, Q: 5 },
    { id: 'calor', nome: 'E se aquece demais?', f: 1.7e6, p0: 450e3, Q: 1 }
  ];
  F.FREQS = [20e3, 40e3, 100e3, 400e3, 1e6, 1.7e6, 2e6];
  F.FREQ_NOMES = ['20 kHz', '40 kHz · Versão A', '100 kHz', '400 kHz', '1 MHz', '1,7 MHz · Versão B', '2 MHz'];

  // p: {f (Hz), p0 (Pa), Q (L/s), T0 (°C)}
  F.derivar = function (p) {
    const T = p.T0 || 20, cW = M.cWater(T), k = M.waveNumber(p.f, cW), E = M.EfromP(p.p0, F.RHO_W, cW);
    const Phi = M.contrast(F.RHO_O, F.C_OIL, F.RHO_W, cW), dRho = F.RHO_W - F.RHO_O;
    const R = 3 * Math.abs(Phi) * k * E / (dRho * M.g);                         // F_acústica,máx / flutuação (independente do raio)
    const lam2 = cW / (2 * p.f);                                                  // meio comprimento de onda
    const tau15 = M.tauBand(F.MU, Phi, p.f, cW, 1.5e-6, E);                      // tempo de arrumação para a = 1,5 µm
    const tau5 = M.tauBand(F.MU, Phi, p.f, cW, 5e-6, E);
    const pa = p.p0, pl = pa / 2;                                                 // pressão lançada ≈ pa/2 (reflexão total, HIPÓTESE)
    const Pac = (pl * pl / (2 * F.RHO_W * cW)) * F.AREA_MODULO;                   // W acústicos
    const Pel = Pac / F.EFIC;                                                     // W eléctricos
    const dT = Pel / (F.RHO_W * (p.Q / 1000) * F.CP);                             // K, balanço de energia
    const gain = M.cavityRelGain(Math.max(1, Math.round(p.f * 2 * 2.2e-3 / cW)), F.REFL, p.f, cW, 3.0, dT);
    return { T, cW, k, E, Phi, R, lam2, tau15, tau5, Pac, Pel, dT, gain, MI: M.MI(pa, p.f), lambda: cW / p.f };
  };
  F.fmt = function (x, n) { return (x === null || x === undefined || !isFinite(x)) ? '—' : Number(x).toLocaleString('pt-PT', { minimumFractionDigits: n, maximumFractionDigits: n }); };
  F.fmtF = function (f) { return f >= 1e6 ? F.fmt(f / 1e6, 2) + ' MHz' : F.fmt(f / 1e3, 0) + ' kHz'; };
  F.fmtLen = function (m) { return m >= 1 ? F.fmt(m, 2) + ' m' : m >= 1e-3 ? F.fmt(m * 1e3, 2) + ' mm' : F.fmt(m * 1e6, 1) + ' µm'; };
  F.fmtP = function (w) { return w >= 1e3 ? F.fmt(w / 1e3, 2) + ' kW' : F.fmt(w, 0) + ' W'; };
  F.fmtT = function (s) { return s >= 3600 ? F.fmt(s / 3600, 1) + ' h' : s >= 60 ? F.fmt(s / 60, 1) + ' min' : F.fmt(s, 1) + ' s'; };
  root.Fis = F;
})(window);
