/*
  Home page stand-in animation.
  Plays only when there is no hero video or image (see content/site.js).
  A side-view spine drifts between an upright and a slumped posture while the
  T1 slope is read off live, the way it would be on a lateral radiograph.
  You do not need to edit this file.
*/
window.HeroPlaceholder = function (canvas) {
  "use strict";
  var ctx = canvas.getContext("2d");
  var DEG = Math.PI / 180;
  var PERIOD = 18000; // ms for upright -> slumped -> upright

  // name, depth (front to back), height, disc gap below, bend upright, bend slumped.
  // Bend is the change in tilt at the disc below each body, in degrees:
  // negative leans back (lordosis), positive leans forward (kyphosis).
  var LEVELS = [
    ["L5", 35, 27, 10, -18, -14], ["L4", 35, 27, 10, -16, -12], ["L3", 34, 27, 9, -11, -8],
    ["L2", 33, 26, 9, -8, -6], ["L1", 32, 25, 8, -5, -4],
    ["T12", 31, 24, 6, 1, 2], ["T11", 30, 23, 5, 2, 3], ["T10", 29, 22, 5, 3, 4],
    ["T9", 28, 21, 5, 4, 5], ["T8", 27, 20, 4.5, 5, 6], ["T7", 26, 19.5, 4.5, 5, 6.5],
    ["T6", 25, 19, 4.5, 5, 6.5], ["T5", 24, 18.5, 4, 5, 6], ["T4", 23, 18, 4, 4, 5],
    ["T3", 21, 17.5, 4, 4, 4], ["T2", 20, 17, 4, 3, 3], ["T1", 19, 16.5, 4, 2, 2],
    ["C7", 17, 14.5, 5, -1, -2], ["C6", 16.5, 13.5, 5, -2, -4], ["C5", 16, 13, 5, -2, -4.5],
    ["C4", 16, 13, 5, -2, -4.5], ["C3", 16, 13, 5, -2, -4], ["C2", 16, 19, 5, -2, -3]
  ];
  var SACRAL_SLOPE = [40, 29]; // upright, slumped

  function lerp(a, b, t) { return a + (b - a) * t; }

  // Build the chain of vertebrae for posture t (0 upright, 1 slumped).
  // World units are roughly millimetres; x points forward, y points up.
  function pose(t) {
    var a = lerp(SACRAL_SLOPE[0], SACRAL_SLOPE[1], t) * DEG;
    var x = 0, y = 0, bodies = [];
    var sacrum = { a: a };
    LEVELS.forEach(function (L) {
      var bend = lerp(L[4], L[5], t) * DEG;
      var mid = a + bend / 2;
      x += Math.sin(mid) * L[3]; y += Math.cos(mid) * L[3];
      a += bend;
      var x1 = x + Math.sin(a) * L[2], y1 = y + Math.cos(a) * L[2];
      bodies.push({ name: L[0], d: L[1], h: L[2], a: a, x0: x, y0: y, x1: x1, y1: y1 });
      x = x1; y = y1;
    });
    var ah = a * 0.4;
    var head = {
      x: x + 66 * Math.sin(ah) + 15 * Math.cos(ah),
      y: y + 66 * Math.cos(ah) - 15 * Math.sin(ah),
      r: 60
    };
    return { bodies: bodies, head: head, sacrum: sacrum };
  }

  // Frame the head down to about T10 so both extremes of the sway stay in
  // view. Everything lower runs off the bottom of the screen and fades out.
  var LOWEST_FRAMED = 7; // index of T10 in LEVELS
  function extent() {
    var minX = 1e9, maxX = -1e9, minY = 1e9, maxY = -1e9;
    [0, 1].forEach(function (t) {
      var p = pose(t);
      p.bodies.forEach(function (b, i) {
        if (i < LOWEST_FRAMED) { return; }
        minX = Math.min(minX, b.x0 - b.d * 1.6, b.x1 - b.d * 1.6);
        maxX = Math.max(maxX, b.x0 + b.d, b.x1 + b.d);
        minY = Math.min(minY, b.y0);
      });
      minX = Math.min(minX, p.head.x - p.head.r);
      maxX = Math.max(maxX, p.head.x + p.head.r + 120); // room for the readout
      maxY = Math.max(maxY, p.head.y + p.head.r);
    });
    return { minX: minX, maxX: maxX, minY: minY, maxY: maxY };
  }
  var BOX = extent();

  var W = 0, H = 0, dpr = 1, s = 1, ox = 0, oy = 0, narrow = false;

  function resize() {
    var rect = canvas.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = Math.max(1, rect.width); H = Math.max(1, rect.height);
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    narrow = W < 900;
    var bw = BOX.maxX - BOX.minX, bh = BOX.maxY - BOX.minY;
    s = Math.min((H * 0.9) / bh, (W * (narrow ? 0.92 : 0.5)) / bw);
    var cx = W * (narrow ? 0.54 : 0.7);
    ox = cx - s * (BOX.minX + bw / 2);
    oy = H * (narrow ? 0.13 : 0.07) + s * BOX.maxY; // top of the head sits just below the top edge
  }
  function X(x) { return ox + s * x; }
  function Y(y) { return oy - s * y; }

  var BONE = "rgba(222, 234, 238, 0.85)";
  var BONE_FILL = "rgba(222, 234, 238, 0.07)";
  var BONE_FAINT = "rgba(222, 234, 238, 0.38)";
  var MARK = "rgba(242, 193, 46, 0.95)";

  function drawBody(b, i) {
    var w = b.d * s, hh = b.h * s, k = w * 0.07, r = Math.min(w, hh) * 0.16;
    ctx.save();
    ctx.translate(X((b.x0 + b.x1) / 2), Y((b.y0 + b.y1) / 2));
    ctx.rotate(b.a);

    // spinous process: long and steep in the chest, short in the neck, longest at C7
    var len = w * 0.95, drop = hh * 0.25;
    if (i >= 5 && i <= 16) { len = w * 1.05; drop = hh * 1.0; }
    if (i >= 17) { len = w * 0.8; drop = hh * 0.35; }
    if (b.name === "C7") { len = w * 1.3; drop = hh * 0.4; }
    ctx.strokeStyle = BONE_FAINT;
    ctx.beginPath();
    ctx.moveTo(-w / 2 - w * 0.22, 0);
    ctx.lineTo(-w / 2 - w * 0.22 - len, drop);
    ctx.stroke();

    ctx.strokeStyle = BONE; ctx.fillStyle = BONE_FILL;
    ctx.beginPath();
    ctx.moveTo(-w / 2 + r, -hh / 2);
    ctx.lineTo(w / 2 - r, -hh / 2);
    ctx.quadraticCurveTo(w / 2, -hh / 2, w / 2, -hh / 2 + r);
    ctx.quadraticCurveTo(w / 2 - k, 0, w / 2, hh / 2 - r);
    ctx.quadraticCurveTo(w / 2, hh / 2, w / 2 - r, hh / 2);
    ctx.lineTo(-w / 2 + r, hh / 2);
    ctx.quadraticCurveTo(-w / 2, hh / 2, -w / 2, hh / 2 - r);
    ctx.quadraticCurveTo(-w / 2 + k, 0, -w / 2, -hh / 2 + r);
    ctx.quadraticCurveTo(-w / 2, -hh / 2, -w / 2 + r, -hh / 2);
    ctx.closePath();
    ctx.fill(); ctx.stroke();
    ctx.restore();
  }

  function drawSacrum(a) {
    ctx.save();
    ctx.translate(X(0), Y(0));
    ctx.rotate(a);
    var top = 36 * s, bot = 13 * s, len = 62 * s;
    ctx.strokeStyle = BONE; ctx.fillStyle = BONE_FILL;
    ctx.beginPath();
    ctx.moveTo(-top / 2, 0); ctx.lineTo(top / 2, 0);
    ctx.quadraticCurveTo(top * 0.3, len * 0.55, bot / 2 - top * 0.2, len);
    ctx.lineTo(-bot / 2 - top * 0.2, len);
    ctx.quadraticCurveTo(-top * 0.42, len * 0.5, -top / 2, 0);
    ctx.closePath();
    ctx.fill(); ctx.stroke();
    ctx.restore();
  }

  function drawSlope(t1) {
    var ex = Math.cos(t1.a), ey = -Math.sin(t1.a);          // along the endplate, forward
    var px = t1.x1 - ex * t1.d / 2, py = t1.y1 - ey * t1.d / 2; // back corner of the endplate
    var L = 82, cx = X(px), cy = Y(py);
    ctx.save();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = MARK; ctx.fillStyle = MARK;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(cx, cy); ctx.lineTo(cx + L * s, cy);                   // horizontal
    ctx.moveTo(cx, cy); ctx.lineTo(X(px + ex * L), Y(py + ey * L));   // endplate, extended
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx, cy, 44 * s, 0, t1.a, false);
    ctx.stroke();
    var size = Math.max(14, Math.min(21, 15 * s + 6));
    ctx.font = "italic " + size + "px 'TeX Gyre Pagella', 'Palatino Linotype', Palatino, Georgia, serif";
    ctx.textBaseline = "middle";
    ctx.fillText("T1 slope " + Math.round(t1.a / DEG) + "°", cx + (L + 9) * s, cy + (L * Math.sin(t1.a) * s) / 2);
    ctx.restore();
  }

  function draw(t) {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var fx = X((BOX.minX + BOX.maxX) / 2), fy = H * 0.45;
    var g = ctx.createRadialGradient(fx, fy, 0, fx, fy, Math.max(W, H) * 0.8);
    g.addColorStop(0, "#19353f"); g.addColorStop(1, "#0b1a23");
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);

    var p = pose(t);
    ctx.globalAlpha = narrow ? 0.6 : 1;
    ctx.lineWidth = 1.25; ctx.lineJoin = "round"; ctx.lineCap = "round";
    ctx.shadowColor = "rgba(140, 200, 222, 0.4)"; ctx.shadowBlur = 12;

    drawSacrum(p.sacrum.a);
    p.bodies.forEach(drawBody);

    ctx.strokeStyle = BONE_FAINT;
    ctx.beginPath();
    ctx.arc(X(p.head.x), Y(p.head.y), p.head.r * s, 0, Math.PI * 2);
    ctx.stroke();

    drawSlope(p.bodies[16]);
    ctx.globalAlpha = 1; ctx.shadowBlur = 0;

    // fade the lower spine into the background, clear of the headline
    var fade = ctx.createLinearGradient(0, H * 0.56, 0, H * 0.9);
    fade.addColorStop(0, "rgba(11, 26, 35, 0)"); fade.addColorStop(1, "rgba(11, 26, 35, 1)");
    ctx.fillStyle = fade; ctx.fillRect(0, H * 0.56, W, H * 0.44);
  }

  var raf = 0, elapsed = PERIOD * 0.15, last = 0;
  function phase() { return 0.5 - 0.5 * Math.cos((2 * Math.PI * elapsed) / PERIOD); }
  function tick(now) {
    if (last) { elapsed += Math.min(now - last, 100); }
    last = now;
    draw(phase());
    raf = requestAnimationFrame(tick);
  }

  var api = {
    running: false,
    start: function () {
      if (api.running) { return; }
      api.running = true; last = 0; resize();
      raf = requestAnimationFrame(tick);
    },
    stop: function () {
      api.running = false;
      cancelAnimationFrame(raf);
    },
    redraw: function () { resize(); draw(phase()); }
  };

  window.addEventListener("resize", api.redraw);
  if (document.fonts && document.fonts.ready) { document.fonts.ready.then(function () { if (!api.running) { api.redraw(); } }); }
  api.redraw();
  return api;
};
