/* ==========================================================================
   fx.js — confetti 2D ringan. Loop hanya berjalan saat ada partikel.
   ========================================================================== */
(function () {
    const SC = (window.SC = window.SC || {});
    const COLORS = ["#013375", "#1a4d96", "#80b8f3", "#b2d4ff", "#ffffff", "#ffc857"];

    let canvas, ctx, w = 0, h = 0, parts = [], raf = 0, dpr = 1;

    function resize() {
        if (!canvas) return;
        dpr = Math.min(window.devicePixelRatio || 1, 1.5);
        w = window.innerWidth; h = window.innerHeight;
        canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function init() {
        canvas = SC.$("#confetti");
        if (!canvas) return;
        ctx = canvas.getContext("2d");
        resize();
        let t = 0;
        window.addEventListener("resize", () => { clearTimeout(t); t = setTimeout(resize, 150); }, { passive: true });
    }

    function loop() {
        ctx.clearRect(0, 0, w, h);
        for (let i = parts.length - 1; i >= 0; i--) {
            const p = parts[i];
            p.vy += 0.34; p.vx *= 0.992; p.x += p.vx; p.y += p.vy; p.rot += p.vr; p.life -= 0.012;
            if (p.life <= 0 || p.y > h + 24) { parts.splice(i, 1); continue; }
            ctx.save();
            ctx.globalAlpha = Math.min(1, p.life * 1.6);
            ctx.translate(p.x, p.y); ctx.rotate(p.rot);
            ctx.fillStyle = p.c;
            if (p.star) {
                ctx.beginPath();
                for (let k = 0; k < 8; k++) { const r = k % 2 ? p.s * 0.45 : p.s; const a = (Math.PI / 4) * k; ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); }
                ctx.closePath(); ctx.fill();
            } else {
                ctx.fillRect(-p.s / 2, -p.s / 3, p.s, p.s * 0.66);
            }
            ctx.restore();
        }
        if (parts.length) raf = requestAnimationFrame(loop);
        else { raf = 0; ctx.clearRect(0, 0, w, h); }
    }

    /**
     * @param {number} count jumlah partikel
     * @param {{x?:number,y?:number}} origin titik asal (px), default tengah-atas
     */
    function burst(count, origin) {
        if (!ctx || SC.reducedMotion) return;
        const n = Math.round((count || 60) * (SC.tier === "low" ? 0.6 : 1));
        const ox = origin && origin.x != null ? origin.x : w / 2;
        const oy = origin && origin.y != null ? origin.y : h * 0.45;
        for (let i = 0; i < n; i++) {
            const a = Math.random() * Math.PI * 2, sp = 5 + Math.random() * 11;
            parts.push({
                x: ox + (Math.random() - 0.5) * 60, y: oy + (Math.random() - 0.5) * 30,
                vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 6,
                s: 6 + Math.random() * 7, c: COLORS[(Math.random() * COLORS.length) | 0],
                rot: Math.random() * 6, vr: (Math.random() - 0.5) * 0.4, life: 1, star: Math.random() < 0.28
            });
        }
        if (parts.length > 260) parts.splice(0, parts.length - 260);
        if (!raf) raf = requestAnimationFrame(loop);
    }

    SC.fx = { init, burst };
})();
