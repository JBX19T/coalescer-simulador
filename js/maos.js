// maos.js — as mãos (luvas azuis com punho laranja) em primeira pessoa e o tablet que seguram.
(function (root) {
  const T = THREE, M = {};
  M.build = function (camera) {
    const g = new T.Group(); camera.add(g);
    const glove = new T.MeshStandardMaterial({ color: 0x1a4f86, roughness: 0.55, metalness: 0.05, emissive: 0x06182c, emissiveIntensity: 0.35 }), cuff = new T.MeshStandardMaterial({ color: 0xF28C28, roughness: 0.5, emissive: 0x7a3a00, emissiveIntensity: 0.5 }), dark = new T.MeshStandardMaterial({ color: 0x0a1520, roughness: 0.4, metalness: 0.7 });
    function mao(lado) {
      const h = new T.Group(), s = lado; const palm = new T.Mesh(new T.BoxGeometry(0.085, 0.028, 0.095), glove); h.add(palm);
      const arm = new T.Mesh(new T.CylinderGeometry(0.036, 0.046, 0.42, 14), glove); arm.rotation.x = Math.PI / 2; arm.position.z = 0.27; h.add(arm);
      const ring = new T.Mesh(new T.TorusGeometry(0.043, 0.008, 8, 20), cuff); ring.position.z = 0.1; h.add(ring);
      const fingers = [];
      for (let i = 0; i < 4; i++) { const f = new T.Group(); f.position.set(-0.03 + i * 0.02, 0, -0.045); const a = new T.Mesh(new T.BoxGeometry(0.017, 0.02, 0.04), glove); a.position.z = -0.02; f.add(a); const b = new T.Group(); b.position.z = -0.04; const bb = new T.Mesh(new T.BoxGeometry(0.016, 0.018, 0.034), glove); bb.position.z = -0.017; b.add(bb); f.add(b); f.userData.b = b; h.add(f); fingers.push(f); }
      const th = new T.Group(); th.position.set(s * 0.045, 0, -0.01); th.rotation.y = s * 0.7; const tm = new T.Mesh(new T.BoxGeometry(0.02, 0.02, 0.05), glove); tm.position.z = -0.025; th.add(tm); h.add(th);
      h.userData = { fingers, th }; g.add(h); return h;
    }
    const L = mao(-1), R = mao(1);
    // tablet
    const tab = new T.Group(); g.add(tab);
    const body = new T.Mesh(new T.BoxGeometry(0.34, 0.215, 0.012), dark); tab.add(body);
    const c = document.createElement('canvas'); c.width = 1024; c.height = 648; const tex = new T.CanvasTexture(c); tex.anisotropy = 4; tex.encoding = T.sRGBEncoding;
    const scr = new T.Mesh(new T.PlaneGeometry(0.32, 0.2025), new T.MeshBasicMaterial({ map: tex, toneMapped: false })); scr.position.z = 0.0068; tab.add(scr);
    const rim = new T.Mesh(new T.BoxGeometry(0.345, 0.22, 0.004), new T.MeshBasicMaterial({ color: 0xF28C28 })); rim.position.z = -0.006; tab.add(rim);
    const o = { group: g, L, R, tab, canvas: c, ctx: c.getContext('2d'), tex, up: 0, bob: 0, reach: 0 };
    function curl(h, k) { h.userData.fingers.forEach((f, i) => { f.rotation.x = -k * (0.9 + i * 0.05); f.userData.b.rotation.x = -k * 1.1; }); h.userData.th.rotation.x = -k * 0.4; }
    o.update = function (dt, walking, tabletOn, reachOn, t) {
      o.up += ((tabletOn ? 1 : 0) - o.up) * Math.min(1, dt * 7); o.reach += ((reachOn ? 1 : 0) - o.reach) * Math.min(1, dt * 9);
      o.bob += dt * (walking ? 9 : 1.6); const bx = Math.sin(o.bob * 0.5) * (walking ? 0.012 : 0.003), by = Math.abs(Math.sin(o.bob * 0.5)) * (walking ? 0.014 : 0.003) + Math.sin(t * 1.3) * 0.002;
      const u = o.up, e = u * u * (3 - 2 * u);
      // tablet: abaixo do ecrã quando guardado, à frente do rosto quando levantado
      tab.visible = u > 0.02; tab.position.set(0, -0.62 + 0.5 * e + by, -0.52 + 0.1 * e); tab.rotation.set(-0.15 - 0.2 * (1 - e), 0, 0);
      // mãos: relaxadas em baixo; com o tablet seguram-no pelos cantos
      const lrest = [-0.26 + bx, -0.4 + by, -0.5], rrest = [0.26 + bx, -0.4 + by, -0.5], ltab = [-0.185, -0.17 + by * 0.2, -0.46], rtab = [0.185, -0.17 + by * 0.2, -0.46];
      const lp = lrest.map((v, i) => v + (ltab[i] - v) * e), rp = rrest.map((v, i) => v + (rtab[i] - v) * e);
      L.position.set(lp[0], lp[1], lp[2]); R.position.set(rp[0], rp[1] + 0.05 * o.reach * (1 - e), rp[2] - 0.16 * o.reach * (1 - e));
      L.rotation.set(-0.5 * (1 - e) + 0.2 * e, 0.3 * (1 - e) - 0.5 * e, 0.12 * (1 - e)); R.rotation.set(-0.5 * (1 - e) - 0.25 * o.reach * (1 - e) + 0.2 * e, -0.3 * (1 - e) + 0.5 * e, -0.12 * (1 - e));
      curl(L, 0.35 + 0.55 * e); curl(R, o.reach * (1 - e) > 0.2 ? 0.1 : 0.35 + 0.55 * e);
    };
    return o;
  };
  root.Maos = M;
})(window);
