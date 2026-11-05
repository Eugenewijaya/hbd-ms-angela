/* ==========================================================================
   scene.js — latar 3D ringan (Three.js r128): bintang low-poly, pesawat kertas,
   dan awan lembut. Dibuat hemat: geometry dibagi pakai, tanpa shadow, DPR dibatasi,
   FPS menyesuaikan perangkat, otomatis berhenti saat tab tersembunyi/di-pause.
   ========================================================================== */
(function () {
    const SC = (window.SC = window.SC || {});

    const THEMES = {
        // di halaman pembuka (latar navy)
        cover: { star: [0xb2d4ff, 0xffffff, 0x80b8f3], plane: [0xffffff, 0xb2d4ff], cloud: 0xb2d4ff, cloudOp: 0.11, objOp: 0.95 },
        // di halaman konten (latar kertas terang)
        page: { star: [0x013375, 0x80b8f3, 0xb2d4ff], plane: [0x013375, 0x1a4d96], cloud: 0xb2d4ff, cloudOp: 0.4, objOp: 0.5 }
    };

    let canvas, renderer, scene, camera;
    let running = false, userPaused = false, raf = 0, lastT = 0, time = 0;
    let aspect = 1, theme = "cover", quality = SC.tier;
    let frames = 0, dtSum = 0, mx = 0, my = 0;
    const stars = [], planes = [], clouds = [];
    const FOV = 50, CAM_Z = 26;
    const tmpColor = { c: null };

    const rand = (a, b) => a + Math.random() * (b - a);
    const halfH = (z) => Math.tan((FOV * Math.PI) / 360) * (CAM_Z - z);

    /* ---------- Geometri bersama ---------- */
    function starGeometry() {
        const s = new THREE.Shape();
        for (let i = 0; i < 10; i++) {
            const r = i % 2 ? 0.46 : 1, a = (i * Math.PI) / 5 + Math.PI / 2;
            const x = Math.cos(a) * r, y = Math.sin(a) * r;
            i ? s.lineTo(x, y) : s.moveTo(x, y);
        }
        s.closePath();
        const g = new THREE.ExtrudeGeometry(s, { depth: 0.38, bevelEnabled: false });
        g.center();
        return g;
    }

    function planeGeometry() {
        // pesawat kertas sederhana: hidung (+z), dua sayap, lunas
        const N = [0, 0, 1.7], L = [-1.05, 0.2, -1.0], R = [1.05, 0.2, -1.0], T = [0, 0.0, -0.8], K = [0, -0.38, -0.9];
        const v = [].concat(N, L, T, N, T, R, N, K, T);
        const g = new THREE.BufferGeometry();
        g.setAttribute("position", new THREE.Float32BufferAttribute(v, 3));
        g.computeVertexNormals();
        return g;
    }

    function cloudTexture() {
        const c = document.createElement("canvas");
        c.width = 256; c.height = 128;
        const x = c.getContext("2d");
        const puffs = [[70, 78, 46], [118, 60, 54], [170, 74, 48], [100, 88, 40], [150, 90, 42], [200, 90, 30], [48, 92, 28]];
        puffs.forEach(([px, py, r]) => {
            const g = x.createRadialGradient(px, py, 0, px, py, r);
            g.addColorStop(0, "rgba(255,255,255,1)"); g.addColorStop(0.6, "rgba(255,255,255,.75)"); g.addColorStop(1, "rgba(255,255,255,0)");
            x.fillStyle = g; x.beginPath(); x.arc(px, py, r, 0, Math.PI * 2); x.fill();
        });
        const t = new THREE.CanvasTexture(c);
        return t;
    }

    /* ---------- Penempatan (dihitung ulang saat resize) ---------- */
    function place() {
        stars.forEach((o) => {
            o.base.x = o.nx * halfH(o.base.z) * aspect;
            o.base.y = o.ny * halfH(o.base.z);
            o.mesh.position.set(o.base.x, o.base.y, o.base.z);
        });
        planes.forEach((o) => { o.baseY = o.ny * halfH(o.mesh.position.z) * 0.9; });
        clouds.forEach((o) => { o.mesh.position.y = o.ny * halfH(o.mesh.position.z); });
    }

    function build() {
        const th = THEMES[theme];
        const count = quality === "low" ? { s: 9, p: 3, c: 5 } : { s: 16, p: 6, c: 8 };
        const sGeo = starGeometry(), pGeo = planeGeometry(), cTex = cloudTexture();

        for (let i = 0; i < count.s; i++) {
            const mat = new THREE.MeshLambertMaterial({ color: th.star[i % th.star.length], transparent: true, opacity: th.objOp });
            const m = new THREE.Mesh(sGeo, mat);
            const z = rand(-14, 3), sc = rand(0.55, 1.3) * (1 + (-z) * 0.03);
            m.scale.setScalar(sc);
            scene.add(m);
            stars.push({ mesh: m, nx: rand(-1, 1), ny: rand(-1, 1), base: { x: 0, y: 0, z }, rx: rand(-0.6, 0.6), ry: rand(0.3, 0.9), ph: rand(0, 6.28), fl: rand(0.5, 1) });
        }

        for (let i = 0; i < count.p; i++) {
            const mat = new THREE.MeshLambertMaterial({ color: th.plane[i % th.plane.length], side: THREE.DoubleSide, transparent: true, opacity: th.objOp });
            const m = new THREE.Mesh(pGeo, mat);
            m.rotation.order = "YXZ";
            m.rotation.y = Math.PI / 2;
            m.position.set(rand(-1, 1) * 20, 0, rand(-8, 4));
            m.scale.setScalar(rand(0.8, 1.5));
            scene.add(m);
            planes.push({ mesh: m, ny: rand(-0.9, 0.9), baseY: 0, v: rand(1.1, 2.4), ph: rand(0, 6.28) });
        }

        for (let i = 0; i < count.c; i++) {
            const mat = new THREE.SpriteMaterial({ map: cTex, color: th.cloud, transparent: true, opacity: th.cloudOp, depthWrite: false });
            const s = new THREE.Sprite(mat);
            const w = rand(12, 22);
            s.scale.set(w, w * 0.5, 1);
            s.position.set(rand(-1, 1) * 30, 0, rand(-26, -12));
            scene.add(s);
            clouds.push({ mesh: s, ny: rand(-1, 1), v: rand(0.18, 0.45) });
        }
        place();
    }

    function resize() {
        if (!renderer) return;
        const w = window.innerWidth, h = window.innerHeight;
        aspect = w / h;
        const dpr = Math.min(window.devicePixelRatio || 1, quality === "low" ? 1 : 1.5);
        renderer.setPixelRatio(dpr);
        renderer.setSize(w, h, false);
        camera.aspect = aspect;
        camera.updateProjectionMatrix();
        place();
    }

    /* ---------- Loop ---------- */
    function lerpTo(o, mat, targetColor, targetOp, k) {
        if (!tmpColor.c) tmpColor.c = new THREE.Color();
        tmpColor.c.setHex(targetColor);
        mat.color.lerp(tmpColor.c, k);
        mat.opacity += (targetOp - mat.opacity) * k;
    }

    function frame(now) {
        raf = requestAnimationFrame(frame);
        const dt = Math.min((now - lastT) / 1000, 0.1);
        if (quality === "low" && now - lastT < 32) return; // ~30fps pada perangkat ringan
        lastT = now;
        time += dt;

        // turunkan kualitas otomatis bila perangkat terasa berat
        frames++; dtSum += dt;
        if (frames === 120) {
            if (quality === "high" && dtSum / frames > 0.027) { quality = "low"; setLow(); }
            frames = 0; dtSum = 0;
        }

        const th = THEMES[theme], k = Math.min(1, dt * 5);
        stars.forEach((o, i) => {
            const m = o.mesh;
            m.rotation.x += o.rx * dt; m.rotation.y += o.ry * dt;
            m.position.y = o.base.y + Math.sin(time * o.fl + o.ph) * 0.7;
            lerpTo(o, m.material, th.star[i % th.star.length], th.objOp, k);
        });
        const edge = halfH(0) * aspect + 6;
        planes.forEach((o, i) => {
            const m = o.mesh;
            m.position.x += o.v * dt;
            if (m.position.x > edge) { m.position.x = -edge; o.ny = rand(-0.9, 0.9); o.baseY = o.ny * halfH(m.position.z) * 0.9; }
            m.position.y = o.baseY + Math.sin(time * 0.8 + o.ph) * 0.9;
            m.rotation.z = Math.sin(time * 0.8 + o.ph) * 0.25;
            m.rotation.x = Math.cos(time * 0.8 + o.ph) * 0.08;
            lerpTo(o, m.material, th.plane[i % th.plane.length], th.objOp, k);
        });
        clouds.forEach((o) => {
            const s = o.mesh;
            s.position.x += o.v * dt;
            const lim = halfH(s.position.z) * aspect + 14;
            if (s.position.x > lim) s.position.x = -lim;
            lerpTo(o, s.material, th.cloud, th.cloudOp, k);
        });

        camera.position.x += (mx * 1.4 - camera.position.x) * Math.min(1, dt * 3);
        camera.position.y += (-my * 0.9 - camera.position.y) * Math.min(1, dt * 3);
        camera.lookAt(0, 0, 0);
        renderer.render(scene, camera);
    }

    function setLow() {
        // buang sebagian objek & turunkan resolusi
        [stars, planes, clouds].forEach((arr) => {
            const keep = Math.ceil(arr.length / 2);
            while (arr.length > keep) { const o = arr.pop(); scene.remove(o.mesh); if (o.mesh.material) o.mesh.material.dispose(); }
        });
        resize();
    }

    function sync() {
        const should = !userPaused && !document.hidden && renderer;
        if (should && !running) { running = true; lastT = performance.now(); raf = requestAnimationFrame(frame); }
        else if (!should && running) { running = false; cancelAnimationFrame(raf); }
    }

    /* ---------- API ---------- */
    function init(c) {
        canvas = c;
        if (!canvas || !window.THREE || SC.reducedMotion) return false;
        try {
            renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: quality === "high", powerPreference: "low-power" });
        } catch (e) { renderer = null; return false; }
        renderer.setClearColor(0x000000, 0);
        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 100);
        camera.position.z = CAM_Z;
        scene.add(new THREE.AmbientLight(0xffffff, 0.82));
        const d = new THREE.DirectionalLight(0xffffff, 0.85);
        d.position.set(6, 10, 14);
        scene.add(d);

        aspect = window.innerWidth / window.innerHeight;
        build();
        resize();

        let t = 0;
        window.addEventListener("resize", () => { clearTimeout(t); t = setTimeout(resize, 150); }, { passive: true });
        window.addEventListener("pointermove", (e) => { mx = (e.clientX / window.innerWidth - 0.5) * 2; my = (e.clientY / window.innerHeight - 0.5) * 2; }, { passive: true });
        document.addEventListener("visibilitychange", sync);
        canvas.addEventListener("webglcontextlost", (e) => { e.preventDefault(); running = false; cancelAnimationFrame(raf); });
        canvas.addEventListener("webglcontextrestored", sync);
        sync();
        return true;
    }

    SC.scene = {
        init,
        setTheme(name) { if (THEMES[name]) theme = name; },
        pause() { userPaused = true; sync(); },
        resume() { userPaused = false; sync(); }
    };
})();
