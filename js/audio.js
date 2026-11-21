// audio.js — sons sintetizados (ilustrativos): ambiente industrial, tom do módulo, cliques. Sem ficheiros externos.
(function (root) {
  const A = { ctx: null, on: true, tone: null, toneGain: null, amb: null };
  A.init = function () {
    if (A.ctx) { if (A.ctx.state === 'suspended') A.ctx.resume(); return; }
    try {
      const c = A.ctx = new (window.AudioContext || window.webkitAudioContext)(); const master = A.master = c.createGain(); master.gain.value = 0.7; master.connect(c.destination);
      // ambiente: ruído filtrado + zumbido grave
      const buf = c.createBuffer(1, c.sampleRate * 2, c.sampleRate), d = buf.getChannelData(0); let b = 0; for (let i = 0; i < d.length; i++) { b = 0.98 * b + 0.02 * (Math.random() * 2 - 1); d[i] = b * 6; }
      const src = c.createBufferSource(); src.buffer = buf; src.loop = true; const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 380; const ag = c.createGain(); ag.gain.value = 0.18; src.connect(lp); lp.connect(ag); ag.connect(master); src.start();
      const hum = c.createOscillator(); hum.type = 'sawtooth'; hum.frequency.value = 55; const hg = c.createGain(); hg.gain.value = 0.015; const hf = c.createBiquadFilter(); hf.type = 'lowpass'; hf.frequency.value = 220; hum.connect(hf); hf.connect(hg); hg.connect(master); hum.start();
      // tom do método (frequência audível ilustrativa)
      const o = A.tone = c.createOscillator(); o.type = 'sine'; o.frequency.value = 660; const o2 = c.createOscillator(); o2.type = 'sine'; o2.frequency.value = 663; const tg = A.toneGain = c.createGain(); tg.gain.value = 0; o.connect(tg); o2.connect(tg); tg.connect(master); o.start(); o2.start();
    } catch (e) { A.ctx = null; }
  };
  A.setMethod = function (on, f) { if (!A.ctx || !A.toneGain) return; A.toneGain.gain.setTargetAtTime(A.on && on ? 0.035 : 0, A.ctx.currentTime, 0.25); if (f) { const v = 330 + 330 * (Math.log10(f / 2e4) / 2); A.tone.frequency.setTargetAtTime(v, A.ctx.currentTime, 0.2); } };
  A.beep = function (f, d, v, type) { if (!A.ctx || !A.on) return; const c = A.ctx, o = c.createOscillator(), g = c.createGain(); o.type = type || 'sine'; o.frequency.value = f; g.gain.setValueAtTime(v || 0.08, c.currentTime); g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + (d || 0.12)); o.connect(g); g.connect(A.master); o.start(); o.stop(c.currentTime + (d || 0.12) + 0.02); };
  A.ok = () => { A.beep(660, 0.09); setTimeout(() => A.beep(990, 0.14), 70); };
  A.back = () => { A.beep(520, 0.08); setTimeout(() => A.beep(390, 0.12), 60); };
  A.power = () => { [220, 330, 440, 660, 880].forEach((f, i) => setTimeout(() => A.beep(f, 0.25, 0.06, 'triangle'), i * 120)); };
  A.tick = () => A.beep(880, 0.04, 0.05);
  A.win = () => { [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => A.beep(f, 0.22, 0.09), i * 110)); };
  A.mute = function (m) { A.on = !m; if (A.master) A.master.gain.value = m ? 0 : 0.7; };
  root.Som = A;
})(window);
