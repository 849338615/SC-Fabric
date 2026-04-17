/**
 * Sidechain hero hex lattice.
 * Layered canvas animation: depth vignette, idle breathing,
 * magnetic cursor repulsion + constellation links, click shockwaves,
 * data-flow particles, and a tracking hex reticle.
 */
const { useEffect, useRef } = React;

const HEX_SIZE = 62;
const MOUSE_RADIUS = 310;
const MAX_PARTICLES = 24;
const TAU = Math.PI * 2;
const SQRT3 = Math.sqrt(3);

// Brand palette — vivid blue → cyan → teal. A three-stop curve keeps saturation
// high across the whole range instead of dipping through a muddy middle.
const PAL_BLUE = [70, 110, 255];
const PAL_AZUR = [40, 170, 255];
const PAL_CYAN = [20, 220, 245];
const PAL_TEAL = [0, 240, 185];

const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const lerp = (a, b, t) => a + (b - a) * t;
const easeOutCubic = (t) => { const u = 1 - t; return 1 - u * u * u; };

// Pre-computed unit hex vertices (rotation = 0, pointy-top). Eliminates
// 12 trig calls per hex per frame when used instead of inline cos/sin.
const HEX_COS = new Float64Array(6);
const HEX_SIN = new Float64Array(6);
for (let i = 0; i < 6; i++) {
  const a = (Math.PI / 3) * i - Math.PI / 6;
  HEX_COS[i] = Math.cos(a);
  HEX_SIN[i] = Math.sin(a);
}
const MOUSE_RADIUS_SQ = MOUSE_RADIUS * MOUSE_RADIUS;

const lerpColor = (a, b, t) => [
  lerp(a[0], b[0], t),
  lerp(a[1], b[1], t),
  lerp(a[2], b[2], t)
];

const paletteAt = (t) => {
  const k = clamp(t, 0, 1);
  let c;
  if (k < 0.34) {
    c = lerpColor(PAL_BLUE, PAL_AZUR, k / 0.34);
  } else if (k < 0.67) {
    c = lerpColor(PAL_AZUR, PAL_CYAN, (k - 0.34) / 0.33);
  } else {
    c = lerpColor(PAL_CYAN, PAL_TEAL, (k - 0.67) / 0.33);
  }
  return [Math.round(c[0]), Math.round(c[1]), Math.round(c[2])];
};

// Hover palette — electric blue → rich purple → luminous teal. Shares anchor
// hues with the idle ramp but routes through violet instead of azure/cyan,
// and pushes saturation/brightness higher so hovered cells read as a charged
// version of the idle palette rather than a competing colour family.
const HOT_BLUE = [95, 130, 255];
const HOT_PURP = [175, 80, 255];
const HOT_TEAL = [40, 255, 205];

const hoverPaletteAt = (t) => {
  const k = clamp(t, 0, 1);
  let c;
  if (k < 0.5) {
    c = lerpColor(HOT_BLUE, HOT_PURP, k / 0.5);
  } else {
    c = lerpColor(HOT_PURP, HOT_TEAL, (k - 0.5) / 0.5);
  }
  return [Math.round(c[0]), Math.round(c[1]), Math.round(c[2])];
};

const HexLattice = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let width = 0;
    let height = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    const hexWidth = SQRT3 * HEX_SIZE;
    const hexHeight = 2 * HEX_SIZE;
    const vertDist = hexHeight * 0.75;

    const mouse = { x: 0, y: 0, inside: false };
    const smoothMouse = { x: 0, y: 0, active: false };

    let hexagons = [];
    let ripples = [];
    let particles = [];
    const active = [];
    let quietRects = [];
    let vigGrad = null;
    let time = 0;
    let lastFrame = performance.now();
    let rafId = 0;

    // Hero text "quiet zones": rectangles where hover intensity is suppressed
    // so the vibrant hot palette never competes with the headline white text.
    const QUIET_SELECTORS = [
      '#hero h1',
      '#hero .hero-badge',
      '#hero .hero-nav-bar',
      '#hero .hero-bottom-heading',
      '#hero .hero-bottom-sub'
    ];
    const QUIET_FEATHER = 90;
    const QUIET_FLOOR = 0.22;

    const computeQuietRects = () => {
      quietRects = [];
      const parent = canvas.parentElement;
      if (!parent) return;
      const pr = parent.getBoundingClientRect();
      for (const sel of QUIET_SELECTORS) {
        const els = document.querySelectorAll(sel);
        els.forEach((el) => {
          const r = el.getBoundingClientRect();
          if (r.width === 0 || r.height === 0) return;
          quietRects.push({
            x: r.left - pr.left - 6,
            y: r.top - pr.top - 4,
            w: r.width + 12,
            h: r.height + 8
          });
        });
      }
    };

    const quietFactorAt = (cx, cy) => {
      if (!quietRects.length) return 1;
      let nearest = Infinity;
      for (let i = 0; i < quietRects.length; i++) {
        const q = quietRects[i];
        const dx = Math.max(q.x - cx, 0, cx - (q.x + q.w));
        const dy = Math.max(q.y - cy, 0, cy - (q.y + q.h));
        const outside = Math.hypot(dx, dy);
        let sd;
        if (outside > 0) {
          sd = outside;
        } else {
          // Inside — negative signed distance to nearest edge.
          sd = -Math.min(cx - q.x, q.x + q.w - cx, cy - q.y, q.y + q.h - cy);
        }
        if (sd < nearest) nearest = sd;
      }
      if (nearest <= 0) return QUIET_FLOOR;
      if (nearest >= QUIET_FEATHER) return 1;
      const t = nearest / QUIET_FEATHER;
      const eased = t * t * (3 - 2 * t);
      return QUIET_FLOOR + (1 - QUIET_FLOOR) * eased;
    };

    const resize = () => {
      const parent = canvas.parentElement || canvas;
      const rect = parent.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      // Cache vignette gradient — only changes on resize, not every frame.
      vigGrad = ctx.createLinearGradient(0, 0, 0, height);
      vigGrad.addColorStop(0, 'rgba(19, 19, 24, 0.62)');
      vigGrad.addColorStop(0.22, 'rgba(19, 19, 24, 0)');
      vigGrad.addColorStop(0.78, 'rgba(19, 19, 24, 0)');
      vigGrad.addColorStop(1, 'rgba(19, 19, 24, 0.88)');
      computeQuietRects();
      buildGrid();
    };

    const buildGrid = () => {
      hexagons = [];
      const cols = Math.ceil(width / hexWidth) + 2;
      const rows = Math.ceil(height / vertDist) + 2;
      const cx0 = width / 2;
      const cy0 = height * 0.46;
      const maxDist = Math.hypot(width * 0.58, height * 0.62);

      for (let row = -1; row < rows; row++) {
        for (let col = -1; col < cols; col++) {
          const offset = (row & 1) === 0 ? 0 : hexWidth / 2;
          const cx = col * hexWidth + offset;
          const cy = row * vertDist;
          const dx = cx - cx0;
          const dy = cy - cy0;
          const dist = Math.hypot(dx, dy);
          const falloff = clamp(1 - dist / maxDist, 0, 1);
          const tx = clamp(cx / Math.max(1, width), 0, 1);
          const [r, g, b] = paletteAt(tx);
          hexagons.push({
            cx, cy, dx, dy, dist,
            tx, r, g, b,
            depth: 0.35 + Math.random() * 0.65,
            phase: Math.random() * TAU,
            pulseSpeed: 0.35 + Math.random() * 0.55,
            baseAlpha: 0.04 + Math.pow(falloff, 1.3) * 0.16,
            quiet: quietFactorAt(cx, cy),
            lift: 0,
            flash: 0
          });
        }
      }

      particles = [];
      if (!prefersReduced && hexagons.length) {
        for (let i = 0; i < MAX_PARTICLES; i++) particles.push(newParticle());
      }
    };

    const newParticle = () => ({
      hex: Math.floor(Math.random() * hexagons.length),
      edge: Math.floor(Math.random() * 6),
      t: Math.random(),
      speed: 0.35 + Math.random() * 0.35,
      life: 1.0 + Math.random() * 1.4,
      age: 0
    });

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      mouse.x = x;
      mouse.y = y;
      mouse.inside = x >= 0 && x <= width && y >= 0 && y <= height;
    };
    const handleMouseLeave = () => { mouse.inside = false; };

    const handleClick = (e) => {
      if (prefersReduced) return;
      const rect = canvas.getBoundingClientRect();
      ripples.push({
        cx: e.clientX - rect.left,
        cy: e.clientY - rect.top,
        r: 0,
        maxR: Math.max(width, height) * 0.55,
        life: 1
      });
      if (ripples.length > 5) ripples.shift();
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mouseout', handleMouseLeave);
    canvas.addEventListener('click', handleClick);
    window.addEventListener('resize', resize);
    let ro = null;
    if (typeof ResizeObserver !== 'undefined' && canvas.parentElement) {
      ro = new ResizeObserver(resize);
      ro.observe(canvas.parentElement);
    }

    // Fast hex path using pre-computed unit vertices — zero trig per call.
    const tracePath = (cx, cy, size) => {
      ctx.beginPath();
      ctx.moveTo(cx + size * HEX_COS[0], cy + size * HEX_SIN[0]);
      ctx.lineTo(cx + size * HEX_COS[1], cy + size * HEX_SIN[1]);
      ctx.lineTo(cx + size * HEX_COS[2], cy + size * HEX_SIN[2]);
      ctx.lineTo(cx + size * HEX_COS[3], cy + size * HEX_SIN[3]);
      ctx.lineTo(cx + size * HEX_COS[4], cy + size * HEX_SIN[4]);
      ctx.lineTo(cx + size * HEX_COS[5], cy + size * HEX_SIN[5]);
      ctx.closePath();
    };

    const vertexAt = (cx, cy, size, i) => {
      const vi = ((i % 6) + 6) % 6;
      return [cx + size * HEX_COS[vi], cy + size * HEX_SIN[vi]];
    };

    const frame = (now) => {
      if (!heroVisible) { rafId = 0; return; }
      rafId = requestAnimationFrame(frame);
      const dt = Math.min(0.05, (now - lastFrame) / 1000);
      lastFrame = now;
      time += dt;

      // Silky cursor — lag the raw pointer so the interaction feels weighted.
      if (mouse.inside) {
        if (!smoothMouse.active) {
          smoothMouse.x = mouse.x;
          smoothMouse.y = mouse.y;
          smoothMouse.active = true;
        } else {
          const k = 1 - Math.pow(0.001, dt);
          smoothMouse.x = lerp(smoothMouse.x, mouse.x, k);
          smoothMouse.y = lerp(smoothMouse.y, mouse.y, k);
        }
      } else {
        smoothMouse.active = false;
      }

      // Depth parallax: cells drift subtly with the cursor, scaled by per-cell depth.
      const parX = smoothMouse.active ? (smoothMouse.x - width / 2) * 0.018 : 0;
      const parY = smoothMouse.active ? (smoothMouse.y - height / 2) * 0.018 : 0;

      ctx.clearRect(0, 0, width, height);

      // Matte dark base — matches --color-bg (#131318) on the rest of the site
      // so the hero reads as the same background, letting the hex grid pop on
      // its own rather than sitting on a blue ambient wash.

      active.length = 0;

      // Hoist per-frame constants out of the hot loop.
      const liftK = 1 - Math.pow(0.0002, dt);
      const flashDecay = Math.pow(0.015, dt);

      // 3) Hex cells
      for (let i = 0; i < hexagons.length; i++) {
        const hex = hexagons[i];

        const breathe = Math.sin(time * hex.pulseSpeed + hex.phase) * 0.5 + 0.5;

        let target = 0;
        let mdx = 0;
        let mdy = 0;
        if (smoothMouse.active) {
          mdx = hex.cx - smoothMouse.x;
          mdy = hex.cy - smoothMouse.y;
          const md2 = mdx * mdx + mdy * mdy;
          if (md2 < MOUSE_RADIUS_SQ) {
            const md = Math.sqrt(md2);
            target = easeOutCubic(1 - md / MOUSE_RADIUS);
          }
        }
        hex.lift += (target - hex.lift) * liftK;

        for (let r = 0; r < ripples.length; r++) {
          const rp = ripples[r];
          const rpDx = hex.cx - rp.cx;
          const rpDy = hex.cy - rp.cy;
          const rd = Math.sqrt(rpDx * rpDx + rpDy * rpDy);
          const front = Math.abs(rd - rp.r);
          if (front < 45) {
            const k = (1 - front / 45) * rp.life;
            if (k > hex.flash) hex.flash = k;
          }
        }
        hex.flash *= flashDecay;

        // Visible lift/flash are gated by the typography quiet factor so
        // hover intensity dims behind hero text without freezing the physics.
        const vLift = hex.lift * hex.quiet;
        const vFlash = hex.flash * hex.quiet;

        // Magnetic repulsion — closer cells push harder outward along the cursor ray.
        let ox = 0;
        let oy = 0;
        if (vLift > 0.01) {
          const d = Math.hypot(mdx, mdy) || 1;
          const push = vLift * 11;
          ox = (mdx / d) * push;
          oy = (mdy / d) * push;
        }

        const drawCx = hex.cx + ox + parX * hex.depth;
        const drawCy = hex.cy + oy + parY * hex.depth;
        const activity = vLift + vFlash;
        const scale = 1 + vLift * 0.1 + vFlash * 0.08;
        const size = (HEX_SIZE - 2) * scale;

        const edgeAlpha = hex.baseAlpha * (0.55 + breathe * 0.35) + activity * 0.55;
        const fillAlpha = hex.baseAlpha * 0.22 + activity * 0.2;

        // Colour — fast-path when neither the scan wave nor the cursor is
        // touching this cell: reuse the palette colour baked at build time.
        const blend = easeOutCubic(clamp(vLift, 0, 1));
        let cr, cg, cb;
        let zoneTx = 0.5;
        if (smoothMouse.active) {
          zoneTx = clamp((hex.cx - smoothMouse.x) / (MOUSE_RADIUS * 2) + 0.5, 0, 1);
        }
        if (blend < 0.001) {
          cr = hex.r; cg = hex.g; cb = hex.b;
        } else {
          const hoverCol = hoverPaletteAt(zoneTx);
          cr = Math.round(lerp(hex.r, hoverCol[0], blend));
          cg = Math.round(lerp(hex.g, hoverCol[1], blend));
          cb = Math.round(lerp(hex.b, hoverCol[2], blend));
        }

        // Fill pass — always lay down the solid idle base so cells never
        // vanish; overlay the radial glow on top for active cells.
        tracePath(drawCx, drawCy, size);
        ctx.fillStyle = `rgba(${cr}, ${cg}, ${cb}, ${fillAlpha * 0.45})`;
        ctx.fill();
        if (activity > 0.03) {
          const bk = Math.min(1, activity * 0.32);
          const hr = Math.round(lerp(cr, 255, bk));
          const hg = Math.round(lerp(cg, 255, bk));
          const hb = Math.round(lerp(cb, 255, bk));
          const grd = ctx.createRadialGradient(drawCx, drawCy, 0, drawCx, drawCy, size);
          grd.addColorStop(0, `rgba(${hr}, ${hg}, ${hb}, ${Math.min(0.9, fillAlpha * (0.7 + activity))})`);
          grd.addColorStop(1, `rgba(${cr}, ${cg}, ${cb}, 0)`);
          ctx.fillStyle = grd;
          ctx.fill();
        }

        // Stroke pass — separate threshold so edge-of-hover cells keep the
        // solid idle stroke instead of switching to the dim gradient outline.
        tracePath(drawCx, drawCy, size);
        if (activity > 0.22) {
          const bk = Math.min(1, activity * 0.32);
          const hr = Math.round(lerp(cr, 255, bk));
          const hg = Math.round(lerp(cg, 255, bk));
          const hb = Math.round(lerp(cb, 255, bk));
          ctx.strokeStyle = `rgba(${hr}, ${hg}, ${hb}, ${clamp(edgeAlpha * 1.4, 0, 0.95)})`;
          ctx.lineWidth = 1.1 + activity * 0.7;
          ctx.shadowBlur = 16 * Math.min(1, activity);
          ctx.shadowColor = `rgba(${cr}, ${cg}, ${cb}, 0.8)`;
        } else {
          ctx.strokeStyle = `rgba(${cr}, ${cg}, ${cb}, ${edgeAlpha * 0.72})`;
          ctx.lineWidth = 0.85;
          ctx.shadowBlur = 0;
        }
        ctx.stroke();
        ctx.shadowBlur = 0;

        if (vLift > 0.55) {
          ctx.beginPath();
          ctx.arc(drawCx, drawCy, 1.4 + vLift * 1.4, 0, TAU);
          ctx.fillStyle = `rgba(235, 250, 255, ${vLift})`;
          ctx.fill();
        }

        if (vLift > 0.18) {
          active.push(drawCx, drawCy, vLift, zoneTx);
        }
      }

      // 4) Constellation links between active cells near the cursor.
      if (active.length >= 8) {
        const maxLinkDist = hexWidth * 1.28;
        const maxLinkSq = maxLinkDist * maxLinkDist;
        for (let i = 0; i < active.length; i += 4) {
          for (let j = i + 4; j < active.length; j += 4) {
            const ax = active[i], ay = active[i + 1], al = active[i + 2], atx = active[i + 3];
            const bx = active[j], by = active[j + 1], bl = active[j + 2], btx = active[j + 3];
            const ddx = ax - bx;
            const ddy = ay - by;
            const d2 = ddx * ddx + ddy * ddy;
            if (d2 < maxLinkSq) {
              const d = Math.sqrt(d2);
              const k = (1 - d / maxLinkDist) * Math.min(al, bl);
              const [lr, lg, lb] = hoverPaletteAt((atx + btx) * 0.5);
              ctx.beginPath();
              ctx.moveTo(ax, ay);
              ctx.lineTo(bx, by);
              ctx.strokeStyle = `rgba(${lr}, ${lg}, ${lb}, ${k * 0.85})`;
              ctx.lineWidth = 0.55 + k * 1.1;
              ctx.stroke();
            }
          }
        }
      }

      // 5) Click shockwaves — tinted by the origin's palette position.
      for (let i = ripples.length - 1; i >= 0; i--) {
        const rp = ripples[i];
        rp.r += dt * 520;
        rp.life = 1 - rp.r / rp.maxR;
        if (rp.life <= 0) { ripples.splice(i, 1); continue; }
        const [rr, rg, rb] = paletteAt(rp.cx / Math.max(1, width));
        ctx.beginPath();
        ctx.arc(rp.cx, rp.cy, rp.r, 0, TAU);
        ctx.strokeStyle = `rgba(${rr}, ${rg}, ${rb}, ${rp.life * 0.42})`;
        ctx.lineWidth = 1.4 * rp.life + 0.2;
        ctx.shadowBlur = 22 * rp.life;
        ctx.shadowColor = `rgba(${rr}, ${rg}, ${rb}, 0.75)`;
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      // 6) Data-flow particles travelling along hex edges.
      if (!prefersReduced && hexagons.length) {
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          p.age += dt;
          p.t += dt * p.speed;
          while (p.t >= 1) {
            p.t -= 1;
            p.edge = (p.edge + (Math.random() < 0.5 ? 1 : -1) + 6) % 6;
          }
          if (p.age > p.life + 1) {
            particles[i] = newParticle();
            continue;
          }
          const hex = hexagons[p.hex];
          if (!hex) { particles[i] = newParticle(); continue; }
          const vertSize = HEX_SIZE - 2;
          const [ax, ay] = vertexAt(hex.cx + parX * hex.depth, hex.cy + parY * hex.depth, vertSize, p.edge);
          const [bx, by] = vertexAt(hex.cx + parX * hex.depth, hex.cy + parY * hex.depth, vertSize, p.edge + 1);
          const x = lerp(ax, bx, p.t);
          const y = lerp(ay, by, p.t);
          const fade = Math.min(1, 1 - Math.abs((p.age / p.life) - 0.5) * 2);
          const alpha = fade * 0.95;
          const pr = Math.round(lerp(hex.r, 255, 0.55));
          const pg = Math.round(lerp(hex.g, 255, 0.55));
          const pb = Math.round(lerp(hex.b, 255, 0.55));
          ctx.beginPath();
          ctx.arc(x, y, 1.4, 0, TAU);
          ctx.fillStyle = `rgba(${pr}, ${pg}, ${pb}, ${alpha})`;
          ctx.shadowBlur = 9;
          ctx.shadowColor = `rgba(${hex.r}, ${hex.g}, ${hex.b}, 0.95)`;
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      }

      // 7) Edge vignette — cached gradient from resize(), no per-frame alloc.
      ctx.fillStyle = vigGrad;
      ctx.fillRect(0, 0, width, height);
    };

    let heroVisible = true;
    const heroIO = new IntersectionObserver(([entry]) => {
      heroVisible = entry.isIntersecting;
      if (heroVisible && !document.hidden) {
        lastFrame = performance.now();
        if (!rafId) rafId = requestAnimationFrame(frame);
      }
    }, { threshold: 0 });
    if (canvas.parentElement) heroIO.observe(canvas.parentElement);

    const onVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(rafId);
        rafId = 0;
      } else if (heroVisible) {
        lastFrame = performance.now();
        rafId = requestAnimationFrame(frame);
      }
    };
    document.addEventListener('visibilitychange', onVisibility);

    resize();
    lastFrame = performance.now();
    rafId = requestAnimationFrame(frame);

    // Hero text dimensions can shift after web fonts swap in. Recompute the
    // quiet zones (and rebuild) once fonts are ready so the protected region
    // matches the final glyph metrics.
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => { resize(); }).catch(() => {});
    }

    return () => {
      cancelAnimationFrame(rafId);
      heroIO.disconnect();
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseout', handleMouseLeave);
      canvas.removeEventListener('click', handleClick);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVisibility);
      if (ro) ro.disconnect();
    };
  }, []);

  return React.createElement('canvas', {
    ref: canvasRef,
    style: {
      display: 'block',
      width: '100%',
      height: '100%',
      background: 'transparent'
    }
  });
};

window.addEventListener('DOMContentLoaded', () => {
  const rootNode = document.getElementById('hero-react-bg');
  if (rootNode) {
    const root = ReactDOM.createRoot(rootNode);
    root.render(React.createElement(HexLattice));
  }
});
