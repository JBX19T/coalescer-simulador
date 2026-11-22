// toque.js — controlos de ecrã táctil (telemóvel/tablet): joystick flutuante à esquerda, arrastar à direita para olhar,
// botões com os mesmos símbolos do comando (✕ □ △ ○). Tudo entra em Entrada.poll() como se fosse o comando/teclado.
(function (root) {
  const E = root.Entrada, body = document.body, $ = (id) => document.getElementById(id);
  const T = E.toque = { on: false, mx: 0, my: 0, run: false, dx: 0, dy: 0, n: {}, min: {} };

  // ---- HTML dos botões (a visibilidade de cada um depende de body[data-e] = estado do jogo e body[data-t] = tablet levantado)
  const B = (id, a, glifo, leg, cls) => '<div class="tb ' + (cls || '') + '" id="' + id + '" data-a="' + a + '"><b>' + glifo + '</b>' + (leg ? '<small data-i18n>' + leg + '</small>' : '') + '</div>';
  const F = (id, f, glifo, leg, cls) => '<div class="tb ' + (cls || '') + '" id="' + id + '" data-f="' + f + '"><b>' + glifo + '</b>' + (leg ? '<small data-i18n>' + leg + '</small>' : '') + '</div>';
  $('toque').innerHTML =
    '<div id="joy"><i></i></div><div id="joydica" data-i18n>andar</div>'
    + B('bA', 'a', '✕', 'abrir', 'big') + B('bX', 'x', '□', 'método') + B('bY', 'y', '△', 'tablet') + B('bB', 'b', '○', 'fechar', 'big')
    + B('bL', 'l1', 'L1', '', 'sm') + B('bR', 'r1', 'R1', '', 'sm')
    + B('bU', 'up', '▲', '', 'sq') + B('bD', 'down', '▼', '', 'sq') + B('bLf', 'left', '◀', '', 'sq') + B('bRt', 'right', '▶', '', 'sq')
    + '<div id="gm">' + B('bMenu', 'options', '☰', 'ajuda', 'pill') + B('bTour', 'touch', '▶', 'apresentação', 'pill') + B('bFoto', 'share', '◉', 'foto', 'pill') + '</div>'
    + F('bZ', 'zoom', '⤢', 'ampliar', 'pill') + B('bSkip', 'a', '›', 'saltar', 'pill') + B('bTitTour', 'touch', '▶', 'apresentação', 'pill')
    + '<div id="gs">' + B('bCont', 'b', '✕', 'continuar', 'pill') + F('bLang', 'lang', '🌐', 'idioma', 'pill') + F('bSom', 'mute', '♪', 'som', 'pill') + F('bFull', 'full', '⛶', 'ecrã inteiro', 'pill') + '</div>';

  function ligar() {
    if (T.on) return; T.on = true; body.classList.add('touch'); E.usingPad = false;
    if (root.I18N && root.I18N.dom) root.I18N.dom();
    dispatchEvent(new Event('resize'));
  }
  T.ligar = ligar;
  // telemóvel/tablet: ponteiro grosso, OU só há ponteiros grossos, OU o navegador diz que é móvel (alguns navegadores integrados não declaram pointer:coarse)
  const mm = (q) => { try { return matchMedia(q).matches; } catch (e) { return false; } }, UA = navigator.userAgent || '';
  const movel = mm('(pointer:coarse)') || (mm('(any-pointer:coarse)') && !mm('(any-pointer:fine)')) || /Android|iPhone|iPad|iPod|Mobile/i.test(UA) || (/Macintosh/.test(UA) && navigator.maxTouchPoints > 1);
  if (movel || /[?&]toque\b/.test(location.search)) ligar();   // ?toque força os controlos tácteis (testes)
  addEventListener('pointerdown', (e) => { if (e.pointerType === 'touch') ligar(); }, true);

  const agora = () => performance.now();
  // um toque curto fica "pendente" até Entrada.poll() o ler pelo menos uma vez (o fotograma pode demorar mais do que o toque)
  const pulso = (a) => { T.min[a] = true; };
  T.held = function (a) { return (T.n[a] > 0) || !!T.min[a]; };
  // botões premidos agora, por dedo (pointerId → {a, el}); se o botão desaparecer enquanto está premido (mudança de estado), larga-se sozinho
  const premidos = new Map();
  function largar(id) { const r = premidos.get(id); if (!r) return; premidos.delete(id); T.n[r.a] = Math.max(0, (T.n[r.a] || 0) - 1); r.el.classList.remove('dn'); }
  T.limpar = function () { T.min = {}; for (const [id, r] of premidos) if (!r.el.getClientRects().length) largar(id); };
  const largarTudo = () => { for (const id of Array.from(premidos.keys())) largar(id); };

  function fullscreen() {
    const d = document, el = d.documentElement;
    if (d.fullscreenElement) { d.exitFullscreen && d.exitFullscreen(); return; }
    const p = el.requestFullscreen && el.requestFullscreen({ navigationUI: 'hide' });
    if (p && p.then) p.then(() => { try { screen.orientation && screen.orientation.lock && screen.orientation.lock('landscape').catch(() => { }); } catch (e) { } }).catch(() => { });
  }
  function tecla(code) { E.keys[code] = true; setTimeout(() => { E.keys[code] = false; }, 90); }
  function fn(f) { if (f === 'full') fullscreen(); else if (f === 'lang') tecla('KeyL'); else if (f === 'mute') tecla('KeyM'); else if (f === 'zoom' && E.onZoom) E.onZoom(); }

  // ---- botões
  const cont = $('toque');
  cont.addEventListener('pointerdown', (e) => {
    const b = e.target.closest('[data-a],[data-f]'); if (!b) return; e.preventDefault(); E.ult = agora();
    try { b.setPointerCapture(e.pointerId); } catch (x) { }
    if (b.dataset.f) { fn(b.dataset.f); b.classList.add('dn'); setTimeout(() => b.classList.remove('dn'), 160); return; }
    const a = b.dataset.a; largar(e.pointerId); T.n[a] = (T.n[a] || 0) + 1; premidos.set(e.pointerId, { a, el: b }); b.classList.add('dn'); pulso(a);
  });
  for (const ev of ['pointerup', 'pointercancel', 'lostpointercapture']) addEventListener(ev, (e) => largar(e.pointerId), true);
  addEventListener('blur', largarTudo); document.addEventListener('visibilitychange', largarTudo);
  cont.addEventListener('contextmenu', (e) => e.preventDefault());

  // ---- joystick (metade esquerda) e olhar (resto), só no estado livre; em introdução/apresentação, um toque sai
  const cv = $('c'), joy = $('joy'), knob = joy.firstChild, J = { id: null, x0: 0, y0: 0 }, L = { id: null, x: 0, y: 0 }, R = 56;
  const estado = () => body.dataset.e || 'titulo';
  cv.addEventListener('pointerdown', (e) => {
    if (e.pointerType !== 'touch') return; e.preventDefault(); E.ult = agora(); try { cv.setPointerCapture(e.pointerId); } catch (x) { }
    const st = estado(); if (st === 'tour' || st === 'intro') { pulso('b', 160); return; }
    if (st !== 'livre') return;
    if (e.clientX < innerWidth * 0.42 && J.id === null) { J.id = e.pointerId; J.x0 = e.clientX; J.y0 = e.clientY; joy.style.left = e.clientX + 'px'; joy.style.top = e.clientY + 'px'; joy.classList.add('on'); knob.style.transform = 'translate(0,0)'; }
    else if (L.id === null) { L.id = e.pointerId; L.x = e.clientX; L.y = e.clientY; }
  });
  cv.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'touch') return;
    if (e.pointerId === J.id) {
      let dx = e.clientX - J.x0, dy = e.clientY - J.y0; const len = Math.hypot(dx, dy) || 1, k = Math.min(1, len / R);
      const kx = dx / len * Math.min(len, R), ky = dy / len * Math.min(len, R); knob.style.transform = 'translate(' + kx + 'px,' + ky + 'px)';
      const m = k < 0.14 ? 0 : (k - 0.14) / 0.86; T.mx = dx / len * m; T.my = dy / len * m; T.run = len > R * 1.35; E.ult = agora();
    } else if (e.pointerId === L.id) { T.dx += (e.clientX - L.x) * 0.0046; T.dy += (e.clientY - L.y) * 0.0046; L.x = e.clientX; L.y = e.clientY; E.ult = agora(); }
  });
  const fim = (e) => {
    if (e.pointerId === J.id) { J.id = null; T.mx = 0; T.my = 0; T.run = false; joy.classList.remove('on'); }
    if (e.pointerId === L.id) L.id = null;
  };
  cv.addEventListener('pointerup', fim); cv.addEventListener('pointercancel', fim);
  cv.addEventListener('touchstart', (e) => e.preventDefault(), { passive: false });

  // ecrã inteiro ao tocar para começar (só em dispositivos tácteis; o utilizador sai com o gesto normal do sistema)
  $('titulo').addEventListener('click', (e) => { if (T.on && !e.target.closest('.lang')) { try { fullscreen(); } catch (x) { } } });
})(window);
