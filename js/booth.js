/* ==========================================================================
   booth.js — photobooth: 3 pose -> frame "Star Champs Air" (FLIGHT KRWC001)
   Mendukung:
   - Live kamera & foto langsung tampil di dalam jendela frame Star Champs Air
   - Upload pintar (otomatis mengisi slot yang kosong terlebih dahulu)
   - Fitur Crop (Zoom 100%-280% & Geser/Pan via tombol atau drag langsung di frame)
   - Fitur Move Frame (Pindah / Tukar hasil foto antar slot Pose 1, 2, dan 3)
   ========================================================================== */
(function () {
    const SC = (window.SC = window.SC || {});
    const F = window.SC_FRAME;

    const FILTERS = {
        normal: {},
        warm: { sat: 1.15, sepia: 0.14, bright: 1.04, contrast: 1.03, tint: [1.04, 1, 0.94] },
        cool: { sat: 1.05, contrast: 1.06, bright: 1.03, tint: [0.95, 1, 1.07] },
        film: { sat: 0.88, sepia: 0.28, contrast: 1.1, bright: 0.98, tint: [1.02, 1, 0.96] },
        mono: { gray: 1, contrast: 1.15, bright: 1.02 }
    };

    const PER = F.shotsPerStrip || 3;
    const AR = F.slots[0].w / F.slots[0].h;

    // Setiap item: { src: canvas, zoom: number, panX: number, panY: number, cropped: canvas, filtered: canvas }
    let photos = new Array(PER).fill(null);
    let active = 0, filter = "normal", facing = "user";
    let stream = null, session = false, counting = false;
    let frameImg = null, frameReady = false;
    let camStickerImg = null, camStickerReady = false;
    let renderQueued = false, liveRaf = 0;
    let dragState = null;
    const el = {};

    /* ---------- util canvas ---------- */
    function mkCanvas(w, h) {
        const c = document.createElement("canvas");
        c.width = Math.max(1, Math.round(w));
        c.height = Math.max(1, Math.round(h));
        return c;
    }

    function clamp(v, min, max) {
        return Math.max(min, Math.min(max, v));
    }

    /** Simpan gambar sumber utuh (maks 1400px) agar bisa di-crop & digeser kapan saja */
    function captureSource(src, sw, sh, mirror) {
        const maxDim = 1400;
        const scale = Math.min(1, maxDim / Math.max(sw, sh));
        const ow = Math.max(1, Math.round(sw * scale));
        const oh = Math.max(1, Math.round(sh * scale));
        const c = mkCanvas(ow, oh);
        const x = c.getContext("2d");
        if (mirror) {
            x.translate(ow, 0);
            x.scale(-1, 1);
        }
        x.drawImage(src, 0, 0, sw, sh, 0, 0, ow, oh);
        return c;
    }

    /** Potong sumber sesuai zoom (1.0..2.8) & panX/panY (-1..1) ke ukuran slot */
    function cropFromSource(srcCanvas, zoom, panX, panY, outW, outH) {
        const sw = srcCanvas.width;
        const sh = srcCanvas.height;
        const targetAr = outW / outH;

        let baseW = sw;
        let baseH = sw / targetAr;
        if (baseH > sh) {
            baseH = sh;
            baseW = sh * targetAr;
        }

        const z = clamp(zoom || 1, 1, 3);
        const cw = baseW / z;
        const ch = baseH / z;

        const maxDx = Math.max(0, (sw - cw) / 2);
        const maxDy = Math.max(0, (sh - ch) / 2);

        // panX > 0 menggeser gambar ke kanan di dalam frame (sx bergerak ke kiri)
        const sx = clamp((sw - cw) / 2 - clamp(panX || 0, -1, 1) * maxDx, 0, sw - cw);
        const sy = clamp((sh - ch) / 2 - clamp(panY || 0, -1, 1) * maxDy, 0, sh - ch);

        const c = mkCanvas(outW, outH);
        const x = c.getContext("2d");
        x.imageSmoothingEnabled = true;
        x.imageSmoothingQuality = "high";
        x.drawImage(srcCanvas, sx, sy, cw, ch, 0, 0, outW, outH);
        return c;
    }

    /** gambar sumber video langsung ke kotak (dx, dy, dw, dh) secara cover */
    function drawCoverInto(ctx, src, sw, sh, dx, dy, dw, dh, mirror) {
        if (!sw || !sh) return;
        const targetAr = dw / dh;
        let cw = sw, ch = sw / targetAr;
        if (ch > sh) { ch = sh; cw = sh * targetAr; }
        ctx.save();
        if (mirror) {
            ctx.translate(dx + dw, dy);
            ctx.scale(-1, 1);
            ctx.drawImage(src, (sw - cw) / 2, (sh - ch) / 2, cw, ch, 0, 0, dw, dh);
        } else {
            ctx.drawImage(src, (sw - cw) / 2, (sh - ch) / 2, cw, ch, dx, dy, dw, dh);
        }
        ctx.restore();
    }

    function applyFilter(croppedCanvas, name, outW, outH) {
        const c = mkCanvas(outW, outH), x = c.getContext("2d");
        x.drawImage(croppedCanvas, 0, 0, outW, outH);
        const f = FILTERS[name];
        if (!f || !Object.keys(f).length) return c;
        const img = x.getImageData(0, 0, outW, outH), d = img.data;
        const sat = f.sat == null ? 1 : f.sat, sep = f.sepia || 0, gray = f.gray || 0;
        const br = f.bright == null ? 1 : f.bright, ct = f.contrast == null ? 1 : f.contrast;
        const t = f.tint || [1, 1, 1];
        for (let i = 0; i < d.length; i += 4) {
            let r = d[i], g = d[i + 1], b = d[i + 2];
            if (sep) {
                const tr = 0.393 * r + 0.769 * g + 0.189 * b, tg = 0.349 * r + 0.686 * g + 0.168 * b, tb = 0.272 * r + 0.534 * g + 0.131 * b;
                r += (tr - r) * sep; g += (tg - g) * sep; b += (tb - b) * sep;
            }
            if (sat !== 1 || gray) {
                const l = 0.299 * r + 0.587 * g + 0.114 * b;
                r = l + (r - l) * sat; g = l + (g - l) * sat; b = l + (b - l) * sat;
                if (gray) { r += (l - r) * gray; g += (l - g) * gray; b += (l - b) * gray; }
            }
            d[i] = ((r * t[0] * br) - 128) * ct + 128;
            d[i + 1] = ((g * t[1] * br) - 128) * ct + 128;
            d[i + 2] = ((b * t[2] * br) - 128) * ct + 128;
        }
        x.putImageData(img, 0, 0);
        return c;
    }

    /* ---------- komposisi frame (live kamera & foto langsung di dalam frame) ---------- */
    function compose(ctx, opts) {
        const isLivePreview = !opts || opts.label !== false;
        ctx.fillStyle = "#f4f4f1";
        ctx.fillRect(0, 0, F.width, F.height);

        const hasLiveVideo = isLivePreview && stream && el.video && el.video.videoWidth > 0;

        F.slots.forEach((s, k) => {
            const idx = k % PER;
            const p = photos[idx];
            const isActiveSlot = idx === active;

            ctx.save();
            ctx.beginPath();
            ctx.rect(s.x - 3, s.y - 3, s.w + 6, s.h + 6);
            ctx.clip();

            if (p && !(hasLiveVideo && isActiveSlot && counting)) {
                ctx.drawImage(p.filtered, s.x - 3, s.y - 3, s.w + 6, s.h + 6);
            } else if (hasLiveVideo && (isActiveSlot || !p)) {
                drawCoverInto(
                    ctx,
                    el.video,
                    el.video.videoWidth,
                    el.video.videoHeight,
                    s.x - 3,
                    s.y - 3,
                    s.w + 6,
                    s.h + 6,
                    facing === "user"
                );
                if (!isActiveSlot) {
                    ctx.fillStyle = "rgba(1, 51, 117, 0.32)";
                    ctx.fillRect(s.x - 3, s.y - 3, s.w + 6, s.h + 6);
                }
            } else {
                const g = ctx.createLinearGradient(0, s.y, 0, s.y + s.h);
                g.addColorStop(0, "#cfe6ff");
                g.addColorStop(0.68, "#eaf4ff");
                g.addColorStop(0.69, "#b7d875");
                g.addColorStop(1, "#7ca82b");
                ctx.fillStyle = g;
                ctx.fillRect(s.x - 3, s.y - 3, s.w + 6, s.h + 6);

                ctx.fillStyle = "rgba(255,255,255,0.9)";
                const cx = s.x + s.w * 0.5, cy = s.y + s.h * 0.28;
                ctx.beginPath();
                ctx.arc(cx - 34, cy + 8, 26, 0, Math.PI * 2);
                ctx.arc(cx, cy - 4, 34, 0, Math.PI * 2);
                ctx.arc(cx + 36, cy + 8, 24, 0, Math.PI * 2);
                ctx.fill();

                if (isLivePreview) {
                    if (camStickerReady && isActiveSlot) {
                        const cw = 84, ch = cw * (camStickerImg.height / camStickerImg.width);
                        ctx.drawImage(camStickerImg, s.x + (s.w - cw) / 2, s.y + s.h * 0.36, cw, ch);
                    }
                    ctx.fillStyle = isActiveSlot ? "#013375" : "rgba(1,51,117,.65)";
                    ctx.font = "700 26px 'IBM Plex Mono', monospace";
                    ctx.textAlign = "center";
                    ctx.textBaseline = "middle";
                    ctx.fillText("POSE " + (idx + 1) + (isActiveSlot ? " • SIAP" : ""), s.x + s.w / 2, s.y + s.h * 0.72);
                }
            }
            ctx.restore();

            ctx.strokeStyle = isLivePreview && isActiveSlot ? "#013375" : F.border;
            ctx.lineWidth = isLivePreview && isActiveSlot ? 6 : 4;
            ctx.strokeRect(s.x + 2, s.y + 2, s.w - 4, s.h - 4);
        });

        if (frameReady) ctx.drawImage(frameImg, 0, 0, F.width, F.height);
    }

    function renderPreview() {
        renderQueued = false;
        if (!el.preview) return;
        compose(el.preview.getContext("2d"), { label: true });
    }

    function queueRender() {
        if (!renderQueued) {
            renderQueued = true;
            requestAnimationFrame(renderPreview);
        }
    }

    function startLivePreviewLoop() {
        stopLivePreviewLoop();
        let last = 0;
        function tick(now) {
            if (!stream) { liveRaf = 0; return; }
            if (now - last > 40) {
                last = now;
                renderPreview();
            }
            liveRaf = requestAnimationFrame(tick);
        }
        liveRaf = requestAnimationFrame(tick);
    }

    function stopLivePreviewLoop() {
        if (liveRaf) {
            cancelAnimationFrame(liveRaf);
            liveRaf = 0;
        }
    }

    /* ---------- state foto, crop & move ---------- */
    function rebuildPhotoSlot(idx) {
        const p = photos[idx];
        if (!p) return;
        const s = F.slots[idx];
        p.cropped = cropFromSource(p.src, p.zoom, p.panX, p.panY, s.w, s.h);
        p.filtered = applyFilter(p.cropped, filter, s.w, s.h);
        drawThumb(idx);
    }

    function setPhoto(idx, srcCanvas) {
        photos[idx] = {
            src: srcCanvas,
            zoom: 1,
            panX: 0,
            panY: 0,
            cropped: null,
            filtered: null
        };
        rebuildPhotoSlot(idx);
        updateSlotTools();
        queueRender();
    }

    function clearPhoto(idx) {
        photos[idx] = null;
        drawThumb(idx);
        // Langsung pilih slot yang baru dihapus agar upload/jepret berikutnya mengisi slot kosong ini!
        selectSlot(idx);
        updateButtons();
        queueRender();
    }

    /** Pindahkan atau tukar foto dari slot aktif ke slot target */
    function movePhotoTo(targetIdx) {
        if (targetIdx < 0 || targetIdx >= PER || targetIdx === active) return;
        if (!photos[active] && !photos[targetIdx]) {
            selectSlot(targetIdx);
            return;
        }
        const temp = photos[targetIdx];
        photos[targetIdx] = photos[active];
        photos[active] = temp;

        if (photos[active]) rebuildPhotoSlot(active);
        else drawThumb(active);

        if (photos[targetIdx]) rebuildPhotoSlot(targetIdx);
        else drawThumb(targetIdx);

        selectSlot(targetIdx);
        updateButtons();
        SC.audio.flip();
        SC.toast(temp ? `Foto ditukar dengan Pose ${targetIdx + 1}` : `Foto dipindahkan ke Pose ${targetIdx + 1}`);
    }

    function setCropZoom(newZoom) {
        const p = photos[active];
        if (!p) return;
        p.zoom = clamp(newZoom, 1, 2.8);
        rebuildPhotoSlot(active);
        updateSlotTools();
        queueRender();
    }

    function adjustCropPan(dx, dy) {
        const p = photos[active];
        if (!p) return;
        // Jika gambar memiliki rasio persis sama dengan slot dan zoom masih 1, naikkan sedikit zoom agar bisa digeser
        const sw = p.src.width, sh = p.src.height;
        const s = F.slots[active];
        const targetAr = s.w / s.h;
        let baseW = sw, baseH = sw / targetAr;
        if (baseH > sh) { baseH = sh; baseW = sh * targetAr; }
        if (p.zoom < 1.15) {
            const needX = Math.abs(dx) > 0 && (sw - baseW / p.zoom) < sw * 0.08;
            const needY = Math.abs(dy) > 0 && (sh - baseH / p.zoom) < sh * 0.08;
            if (needX || needY) p.zoom = 1.2;
        }
        p.panX = clamp(p.panX + dx, -1, 1);
        p.panY = clamp(p.panY + dy, -1, 1);
        rebuildPhotoSlot(active);
        updateSlotTools();
        queueRender();
    }

    function resetCrop() {
        const p = photos[active];
        if (!p) return;
        p.zoom = 1;
        p.panX = 0;
        p.panY = 0;
        rebuildPhotoSlot(active);
        updateSlotTools();
        queueRender();
        SC.audio.tap();
    }

    function refilterAll() {
        photos.forEach((p, i) => {
            if (p) {
                const s = F.slots[i];
                p.filtered = applyFilter(p.cropped, filter, s.w, s.h);
                drawThumb(i);
            }
        });
        queueRender();
    }

    function drawThumb(idx) {
        const b = el.shots[idx];
        if (!b) return;
        const old = b.querySelector("canvas");
        if (old) old.remove();
        b.classList.toggle("is-filled", !!photos[idx]);
        if (photos[idx]) {
            const c = mkCanvas(240, 240 / AR);
            c.getContext("2d").drawImage(photos[idx].filtered, 0, 0, c.width, c.height);
            b.prepend(c);
        }
    }

    function updateSlotTools() {
        if (!el.slotTools) return;
        const p = photos[active];
        el.slotTools.classList.toggle("is-empty", !p);
        if (el.slotEditLabel) {
            el.slotEditLabel.textContent = `ATUR POSE ${active + 1}` + (p ? "" : " (KOSONG)");
        }
        if (el.slotUploadLabel) {
            el.slotUploadLabel.textContent = p ? `Ganti Foto Pose ${active + 1}` : `Upload ke Pose ${active + 1}`;
        }
        const zPct = p ? Math.round(p.zoom * 100) : 100;
        if (el.cropZoom) el.cropZoom.value = String(zPct);
        if (el.cropZoomVal) el.cropZoomVal.textContent = zPct + "%";

        if (el.moveBtns) {
            el.moveBtns.forEach((btn) => {
                const t = Number(btn.dataset.moveTo);
                btn.disabled = !p || t === active;
                if (t === active) {
                    btn.textContent = `Pose ${t + 1} (Aktif)`;
                } else if (photos[t]) {
                    btn.textContent = `Tukar ⇄ Pose ${t + 1}`;
                } else {
                    btn.textContent = `Pindah → Pose ${t + 1}`;
                }
            });
        }
    }

    function selectSlot(i) {
        active = clamp(i, 0, PER - 1);
        el.shots.forEach((b, k) => b.classList.toggle("is-active", k === active));
        el.chip.textContent = "Pose " + (active + 1) + " / " + PER;
        updateSlotTools();
        queueRender();
    }

    function nextSlot() {
        // Prioritaskan mencari slot yang masih kosong
        for (let k = 1; k <= PER; k++) {
            const n = (active + k) % PER;
            if (!photos[n]) return selectSlot(n);
        }
        // Jika semua slot sudah terisi, tetap di slot yang baru saja diisi agar mudah di-crop/atur
        updateSlotTools();
        queueRender();
    }

    /* ---------- kamera ---------- */
    async function startCamera() {
        stopCamera();
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            SC.toast("Kamera butuh koneksi aman (HTTPS). Gunakan tombol Upload Foto.", 4500);
            return false;
        }
        try {
            stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: { ideal: facing }, width: { ideal: 1280 }, height: { ideal: 960 } },
                audio: false
            });
        } catch (err) {
            const msg = err && err.name === "NotAllowedError"
                ? "Izin kamera ditolak. Aktifkan izin kamera atau gunakan tombol Upload Foto."
                : "Kamera tidak tersedia. Gunakan tombol Upload Foto.";
            SC.toast(msg, 4500);
            return false;
        }
        el.video.srcObject = stream;
        el.video.classList.toggle("is-mirror", facing === "user");
        try { await el.video.play(); } catch (e) { /* autoplay dipicu gesture */ }
        el.video.hidden = false;
        el.idle.hidden = true;
        el.camBtn.hidden = true;
        el.flipBtn.hidden = false;
        updateButtons();
        startLivePreviewLoop();
        return true;
    }

    function stopCamera() {
        stopLivePreviewLoop();
        if (stream) {
            stream.getTracks().forEach((t) => t.stop());
            stream = null;
        }
        if (el.video) {
            el.video.srcObject = null;
            el.video.hidden = true;
        }
        if (el.idle) el.idle.hidden = false;
        if (el.camBtn) {
            el.camBtn.hidden = false;
            el.flipBtn.hidden = true;
        }
        session = false;
        counting = false;
        if (el.count) el.count.classList.remove("is-on");
        updateButtons();
        queueRender();
    }

    function flip() {
        facing = facing === "user" ? "environment" : "user";
        startCamera();
    }

    function shoot(idx) {
        const v = el.video;
        if (!v.videoWidth) return;
        SC.audio.shutter();
        el.flash.classList.remove("is-on");
        void el.flash.offsetWidth;
        el.flash.classList.add("is-on");
        setPhoto(idx, captureSource(v, v.videoWidth, v.videoHeight, facing === "user"));
    }

    async function countdown(n) {
        counting = true;
        updateButtons();
        el.count.classList.add("is-on");
        for (let i = n; i > 0; i--) {
            if (!stream || (!session && !counting)) break;
            el.countNum.textContent = i;
            el.countNum.style.animation = "none";
            void el.countNum.offsetWidth;
            el.countNum.style.animation = "";
            SC.audio.beep();
            await SC.wait(900);
            if (!stream || !counting) break;
        }
        el.count.classList.remove("is-on");
        const ok = !!stream && counting;
        counting = false;
        updateButtons();
        return ok;
    }

    async function singleShot() {
        if (session || counting) {
            counting = false;
            session = false;
            return;
        }
        if (!stream && !(await startCamera())) return;
        // Jika slot aktif sudah terisi dan masih ada slot kosong, arahkan ke slot kosong?
        // Tidak, tombol mengatakan "Jepret Pose (active+1)", jadi memotret di slot active.
        if (await countdown(3)) {
            shoot(active);
            nextSlot();
            updateButtons();
            SC.fx.burst(24, centerOf(el.vf));
        }
    }

    async function runSession() {
        if (session) {
            session = false;
            counting = false;
            updateButtons();
            return;
        }
        if (!stream && !(await startCamera())) return;
        session = true;
        updateButtons();
        for (let i = 0; i < PER; i++) photos[i] = null;
        for (let i = 0; i < PER; i++) drawThumb(i);
        for (let i = 0; i < PER && session; i++) {
            selectSlot(i);
            if (!(await countdown(3)) || !session) break;
            shoot(i);
            await SC.wait(800);
        }
        const done = session && photos.every(Boolean);
        session = false;
        updateButtons();
        if (done) {
            SC.audio.chime();
            SC.fx.burst(60, centerOf(el.preview));
            SC.toast("3 pose sudah masuk ke dalam frame Star Champs Air!");
        }
    }

    function centerOf(node) {
        const r = node.getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    }

    /* ---------- upload (pintar mengisi slot yang kosong / target) ---------- */
    function loadImage(file) {
        return new Promise((res, rej) => {
            const url = URL.createObjectURL(file), im = new Image();
            im.onload = () => { res(im); setTimeout(() => URL.revokeObjectURL(url), 1000); };
            im.onerror = () => { URL.revokeObjectURL(url); rej(new Error("gagal memuat gambar")); };
            im.src = url;
        });
    }

    /** Urutan slot target saat pengguna menekan tombol "Upload Foto" utama */
    function getSmartUploadOrder() {
        const order = [];
        // 1. Jika slot aktif sedang kosong, utamakan slot aktif terlebih dahulu
        if (!photos[active]) order.push(active);
        // 2. Masukkan semua slot lain yang masih kosong (agar tidak menimpa Pose 1 bila ada yang kosong!)
        for (let k = 0; k < PER; k++) {
            if (!photos[k] && !order.includes(k)) order.push(k);
        }
        // 3. Baru masukkan slot yang sudah terisi mulai dari active
        for (let k = 0; k < PER; k++) {
            const idx = (active + k) % PER;
            if (!order.includes(idx)) order.push(idx);
        }
        return order;
    }

    async function onUpload(e) {
        const files = Array.from(e.target.files || []).filter((f) => f.type.startsWith("image/")).slice(0, PER);
        e.target.value = "";
        if (!files.length) return;

        const targetOrder = getSmartUploadOrder();
        let lastFilled = active, ok = 0;

        for (let k = 0; k < files.length; k++) {
            const slotIdx = targetOrder[k % PER];
            try {
                const im = await loadImage(files[k]);
                setPhoto(slotIdx, captureSource(im, im.naturalWidth, im.naturalHeight, false));
                lastFilled = slotIdx;
                ok++;
            } catch (err) {
                SC.toast("Salah satu foto tidak bisa dibaca.");
            }
        }
        if (ok) {
            // Pilih slot yang baru saja diisi supaya pengguna bisa langsung crop / geser fotonya!
            selectSlot(lastFilled);
            updateButtons();
            SC.audio.chime();
            SC.toast(`Foto masuk ke Pose ${lastFilled + 1}. Silakan atur crop atau posisi.`);
        }
    }

    /** Upload khusus untuk mengganti/mengisi slot aktif saat ini */
    async function onUploadSingleSlot(e) {
        const file = (e.target.files || [])[0];
        e.target.value = "";
        if (!file || !file.type.startsWith("image/")) return;
        try {
            const im = await loadImage(file);
            setPhoto(active, captureSource(im, im.naturalWidth, im.naturalHeight, false));
            selectSlot(active);
            updateButtons();
            SC.audio.chime();
            SC.toast(`Pose ${active + 1} berhasil diperbarui!`);
        } catch (err) {
            SC.toast("Foto tidak bisa dibaca.");
        }
    }

    /* ---------- ekspor ---------- */
    function stripCanvas() {
        const c = mkCanvas(F.width, F.height);
        compose(c.getContext("2d"), { label: false });
        return c;
    }

    const imgCache = {};
    function loadAsset(src) {
        if (imgCache[src]) return imgCache[src];
        imgCache[src] = new Promise((res) => {
            const i = new Image();
            i.onload = () => res(i);
            i.onerror = () => res(null);
            i.src = src;
        });
        return imgCache[src];
    }

    async function storyCanvas() {
        const W = 1080, H = 1920;
        const c = mkCanvas(W, H), x = c.getContext("2d");
        const g = x.createRadialGradient(W / 2, H * 0.45, 80, W / 2, H * 0.45, H * 0.75);
        g.addColorStop(0, "#0f4c9e");
        g.addColorStop(0.45, "#013375");
        g.addColorStop(1, "#001a3d");
        x.fillStyle = g;
        x.fillRect(0, 0, W, H);

        x.save();
        x.translate(W / 2, H * 0.45);
        x.fillStyle = "rgba(178,212,255,.07)";
        for (let a = 0; a < 24; a++) {
            x.rotate((Math.PI * 2) / 24);
            x.beginPath();
            x.moveTo(0, 0);
            x.lineTo(1500, -60);
            x.lineTo(1500, 60);
            x.closePath();
            x.fill();
        }
        x.restore();

        const fh = 1480, fw = fh * (F.width / F.height), fx = (W - fw) / 2, fy = 220;
        x.save();
        x.shadowColor = "rgba(0,10,30,.6)";
        x.shadowBlur = 50;
        x.shadowOffsetY = 24;
        x.fillStyle = "#f4f4f1";
        x.fillRect(fx, fy, fw, fh);
        x.restore();
        x.drawImage(stripCanvas(), fx, fy, fw, fh);

        try {
            await document.fonts.load("700 56px 'Barlow Condensed'");
            await document.fonts.load("500 28px 'IBM Plex Mono'");
        } catch (e) { /* font opsional */ }

        x.textAlign = "center";
        x.textBaseline = "middle";
        x.fillStyle = "#b2d4ff";
        x.font = "700 64px 'Barlow Condensed', sans-serif";
        x.fillText("STAR CHAMPS  ★  AIR", W / 2, 130);
        x.fillStyle = "#80b8f3";
        x.font = "500 28px 'IBM Plex Mono', monospace";
        x.fillText("FLIGHT KRWC001  ·  HBD MS. ANGELA  ·  03 NOV", W / 2, H - 150);

        const [a, b] = await Promise.all([
            loadAsset("assets/stickers/asterisk-sky.png"),
            loadAsset("assets/stickers/starburst.png")
        ]);
        if (a) x.drawImage(a, 36, 60, 110, (110 * a.height) / a.width);
        if (b) x.drawImage(b, W - 150, H - 250, 110, (110 * b.height) / b.width);
        return c;
    }

    function toBlob(canvas) {
        return new Promise((res) => canvas.toBlob(res, "image/png"));
    }

    function save(blob, name) {
        const url = URL.createObjectURL(blob), a = document.createElement("a");
        a.href = url;
        a.download = name;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 5000);
    }

    function hasPhoto() {
        if (photos.some(Boolean)) return true;
        SC.toast("Ambil atau upload minimal satu foto dulu.");
        return false;
    }

    async function downloadStrip() {
        if (!hasPhoto()) return;
        save(await toBlob(stripCanvas()), "star-champs-air-krwc001-frame.png");
        SC.audio.chime();
        SC.toast("Frame Star Champs Air tersimpan.");
    }

    async function downloadStory() {
        if (!hasPhoto()) return;
        save(await toBlob(await storyCanvas()), "star-champs-air-krwc001-story-9x16.png");
        SC.audio.chime();
        SC.toast("Format Story 9:16 tersimpan.");
    }

    async function share() {
        if (!hasPhoto()) return;
        const blob = await toBlob(await storyCanvas());
        const file = new File([blob], "star-champs-air-krwc001-story.png", { type: "image/png" });
        const data = {
            files: [file],
            title: "Happy Birthday Ms. Angela — Star Champs Air",
            text: "Selamat ulang tahun, Ms. Angela! #StarChamps"
        };
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
            try {
                await navigator.share(data);
                SC.fx.burst(50);
                return;
            } catch (err) {
                if (err && err.name === "AbortError") return;
            }
        }
        save(blob, "star-champs-air-krwc001-story.png");
        SC.toast("Foto tersimpan. Buka Instagram, buat Story baru, lalu pilih foto ini.", 5000);
    }

    function reset() {
        session = false;
        counting = false;
        for (let i = 0; i < PER; i++) {
            photos[i] = null;
            drawThumb(i);
        }
        selectSlot(0);
        updateButtons();
    }

    function setFilter(name) {
        if (!FILTERS[name]) return;
        filter = name;
        el.filterBtns.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.filter === name)));
        el.vf.dataset.filter = name;
        refilterAll();
    }

    function updateButtons() {
        if (!el.sessionBtn) return;
        const cam = !!stream;
        el.sessionBtn.querySelector("span").textContent = session ? "Batalkan sesi" : "Mulai sesi " + PER + " foto";
        el.shotBtn.disabled = session;
        el.shotBtn.hidden = !cam;
        el.shotBtn.querySelector("span").textContent = counting ? "Batalkan" : "Jepret Pose " + (active + 1);
    }

    /* ---------- Klik & Drag langsung pada jendela slot di Frame Preview ---------- */
    function hitSlot(clientX, clientY) {
        const rect = el.preview.getBoundingClientRect();
        const px = ((clientX - rect.left) / rect.width) * F.width;
        const py = ((clientY - rect.top) / rect.height) * F.height;
        for (let k = 0; k < F.slots.length; k++) {
            const s = F.slots[k];
            if (px >= s.x && px <= s.x + s.w && py >= s.y && py <= s.y + s.h) {
                return { slotIdx: k % PER, slot: s, rect };
            }
        }
        return null;
    }

    function onPreviewPointerDown(e) {
        const hit = hitSlot(e.clientX, e.clientY);
        if (!hit) return;
        const { slotIdx, slot, rect } = hit;
        if (slotIdx !== active) {
            selectSlot(slotIdx);
            updateButtons();
            SC.audio.tap();
        }
        const p = photos[slotIdx];
        if (!p) return;

        // Pastikan gambar punya ruang geser bila user mulai men-drag
        const sw = p.src.width, sh = p.src.height;
        const targetAr = slot.w / slot.h;
        let baseW = sw, baseH = sw / targetAr;
        if (baseH > sh) { baseH = sh; baseW = sh * targetAr; }

        dragState = {
            pointerId: e.pointerId,
            slotIdx,
            startX: e.clientX,
            startY: e.clientY,
            startPanX: p.panX,
            startPanY: p.panY,
            scaleX: (rect.width * (slot.w / F.width)) * 0.45,
            scaleY: (rect.height * (slot.h / F.height)) * 0.45,
            moved: false,
            tightAr: (sw - baseW) < sw * 0.05 && (sh - baseH) < sh * 0.05
        };
        try { el.preview.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
    }

    function onPreviewPointerMove(e) {
        if (!dragState || e.pointerId !== dragState.pointerId) return;
        const dxPx = e.clientX - dragState.startX;
        const dyPx = e.clientY - dragState.startY;
        if (!dragState.moved && Math.hypot(dxPx, dyPx) < 4) return;
        dragState.moved = true;
        e.preventDefault();

        const p = photos[dragState.slotIdx];
        if (!p) return;
        if (dragState.tightAr && p.zoom < 1.15) {
            p.zoom = 1.2;
        }
        p.panX = clamp(dragState.startPanX + dxPx / Math.max(40, dragState.scaleX), -1, 1);
        p.panY = clamp(dragState.startPanY + dyPx / Math.max(40, dragState.scaleY), -1, 1);
        rebuildPhotoSlot(dragState.slotIdx);
        updateSlotTools();
        queueRender();
    }

    function onPreviewPointerUp(e) {
        if (!dragState || e.pointerId !== dragState.pointerId) return;
        try { el.preview.releasePointerCapture(e.pointerId); } catch (err) { /* ignore */ }
        dragState = null;
    }

    function onPreviewWheel(e) {
        const hit = hitSlot(e.clientX, e.clientY);
        if (!hit) return;
        const p = photos[hit.slotIdx];
        if (!p) return;
        e.preventDefault();
        if (hit.slotIdx !== active) selectSlot(hit.slotIdx);
        const delta = e.deltaY < 0 ? 0.1 : -0.1;
        setCropZoom(p.zoom + delta);
    }

    /* ---------- init ---------- */
    function init() {
        const root = SC.$("#booth");
        if (!root || !F) return;
        el.vf = SC.$("#vf");
        el.video = SC.$("#vfVideo");
        el.idle = SC.$("#vfIdle");
        el.chip = SC.$("#vfChip");
        el.count = SC.$("#vfCount");
        el.countNum = SC.$("#vfCount span");
        el.flash = SC.$("#vfFlash");
        el.camBtn = SC.$("#btnCam");
        el.flipBtn = SC.$("#btnFlip");
        el.sessionBtn = SC.$("#btnSession");
        el.shotBtn = SC.$("#btnShot");
        el.shots = SC.$$(".shot", root);
        el.filterBtns = SC.$$("[data-filter]", root);
        el.preview = SC.$("#previewCanvas");

        el.slotTools = SC.$("#slotTools");
        el.slotEditLabel = SC.$("#slotEditLabel");
        el.slotUploadLabel = SC.$("#slotUploadLabel");
        el.cropZoom = SC.$("#cropZoom");
        el.cropZoomVal = SC.$("#cropZoomVal");
        el.moveBtns = SC.$$("[data-move-to]", root);
        el.panBtns = SC.$$("[data-pan]", root);

        root.style.setProperty("--slot-ar", AR.toFixed(4));
        el.preview.width = F.width;
        el.preview.height = F.height;
        el.preview.style.cursor = "grab";
        el.preview.addEventListener("pointerdown", onPreviewPointerDown);
        el.preview.addEventListener("pointermove", onPreviewPointerMove);
        el.preview.addEventListener("pointerup", onPreviewPointerUp);
        el.preview.addEventListener("pointercancel", onPreviewPointerUp);
        el.preview.addEventListener("wheel", onPreviewWheel, { passive: false });

        el.camBtn.addEventListener("click", startCamera);
        el.flipBtn.addEventListener("click", flip);
        el.sessionBtn.addEventListener("click", runSession);
        el.shotBtn.addEventListener("click", singleShot);
        SC.$("#btnUpload").addEventListener("change", onUpload);
        SC.$("#btnUploadSlot").addEventListener("change", onUploadSingleSlot);
        SC.$("#btnCropReset").addEventListener("click", resetCrop);
        SC.$("#btnZoomOut").addEventListener("click", () => {
            const p = photos[active];
            if (p) setCropZoom(p.zoom - 0.15);
        });
        SC.$("#btnZoomIn").addEventListener("click", () => {
            const p = photos[active];
            if (p) setCropZoom(p.zoom + 0.15);
        });
        el.cropZoom.addEventListener("input", () => {
            setCropZoom(Number(el.cropZoom.value) / 100);
        });
        el.panBtns.forEach((b) => {
            b.addEventListener("click", () => {
                const [dx, dy] = b.dataset.pan.split(",").map(Number);
                adjustCropPan(dx, dy);
            });
        });
        el.moveBtns.forEach((b) => {
            b.addEventListener("click", () => {
                movePhotoTo(Number(b.dataset.moveTo));
            });
        });

        SC.$("#btnDl").addEventListener("click", downloadStrip);
        SC.$("#btnStory").addEventListener("click", downloadStory);
        SC.$("#btnShare").addEventListener("click", share);
        SC.$("#btnReset").addEventListener("click", reset);
        el.filterBtns.forEach((b) => b.addEventListener("click", () => setFilter(b.dataset.filter)));
        el.shots.forEach((b, i) => {
            b.addEventListener("click", (e) => {
                if (e.target.closest(".shot__clear")) {
                    e.stopPropagation();
                    clearPhoto(i);
                    return;
                }
                selectSlot(i);
                updateButtons();
            });
        });
        document.addEventListener("visibilitychange", () => {
            if (document.hidden && stream) stopCamera();
        });

        camStickerImg = new Image();
        camStickerImg.onload = () => { camStickerReady = true; queueRender(); };
        camStickerImg.src = "assets/stickers/camera.png";

        frameImg = new Image();
        frameImg.onload = () => { frameReady = true; queueRender(); };
        frameImg.onerror = () => SC.toast("Frame tidak ditemukan di " + F.src);
        frameImg.src = F.src;

        selectSlot(0);
        updateButtons();
        queueRender();
        if (document.fonts && document.fonts.ready) document.fonts.ready.then(queueRender);
    }

    SC.booth = { init, stopCamera, leave: stopCamera };
})();
