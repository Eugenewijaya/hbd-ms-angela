/* ==========================================================================
   audio.js — musik latar assets/audio/hbd.mp3 (+ fallback synth bila file
   tidak ada) dan efek suara UI yang halus.
   ========================================================================== */
(function () {
    const SC = (window.SC = window.SC || {});
    const SRC = "assets/audio/hbd.mp3";

    let ctx = null, bgm = null, playing = false, useSynth = false;
    let synthMaster = null, synthTimer = 0;

    function ac() {
        if (!ctx) {
            const C = window.AudioContext || window.webkitAudioContext;
            if (C) ctx = new C();
        }
        if (ctx && ctx.state === "suspended") ctx.resume();
        return ctx;
    }

    function tone(freq, dur, type, delay, vol, dest) {
        const c = ac();
        if (!c) return;
        const t0 = c.currentTime + (delay || 0);
        const o = c.createOscillator(), g = c.createGain();
        o.type = type || "triangle";
        o.frequency.setValueAtTime(freq, t0);
        g.gain.setValueAtTime(0.0001, t0);
        g.gain.exponentialRampToValueAtTime(vol || 0.1, t0 + 0.015);
        g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
        o.connect(g); g.connect(dest || c.destination);
        o.start(t0); o.stop(t0 + dur + 0.03);
    }

    /* ---------- Efek suara ---------- */
    const sfx = {
        tap() { tone(660, 0.07, "sine", 0, 0.06); },
        flip() { tone(440, 0.06, "sine", 0, 0.05); tone(587, 0.08, "triangle", 0.04, 0.05); },
        open() { [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone(f, 0.3, "triangle", i * 0.07, 0.1)); },
        beep() { tone(720, 0.12, "sine", 0, 0.1); },
        shutter() { tone(260, 0.05, "square", 0, 0.08); tone(900, 0.09, "sine", 0.04, 0.12); },
        chime() { [659.25, 880, 1174.66].forEach((f, i) => tone(f, 0.35, "triangle", i * 0.09, 0.09)); }
    };

    /* ---------- Fallback: melodi "Happy Birthday" kotak musik ---------- */
    const SONG = [
        [392.0, .3, 0], [392.0, .3, .38], [440.0, .55, .75], [392.0, .55, 1.45], [523.25, .55, 2.15], [493.88, .9, 2.85],
        [392.0, .3, 4.0], [392.0, .3, 4.38], [440.0, .55, 4.75], [392.0, .55, 5.45], [587.33, .55, 6.15], [523.25, .9, 6.85],
        [392.0, .3, 8.0], [392.0, .3, 8.38], [783.99, .55, 8.75], [659.25, .55, 9.45], [523.25, .55, 10.15], [493.88, .55, 10.85], [440.0, .85, 11.55],
        [698.46, .3, 12.8], [698.46, .3, 13.18], [659.25, .55, 13.55], [523.25, .55, 14.25], [587.33, .55, 14.95], [523.25, 1.1, 15.65]
    ];
    const SONG_LEN = 17.5;

    function startSynth() {
        stopSynth();
        const c = ac();
        if (!c) return;
        synthMaster = c.createGain();
        synthMaster.gain.value = 0.9;
        synthMaster.connect(c.destination);
        SONG.forEach(([f, d, t]) => {
            tone(f, d, "triangle", t + 0.05, 0.09, synthMaster);
            tone(f * 2, d * 0.7, "sine", t + 0.05, 0.025, synthMaster);
        });
        synthTimer = setTimeout(() => { if (playing && useSynth) startSynth(); }, SONG_LEN * 1000);
    }

    function stopSynth() {
        clearTimeout(synthTimer);
        synthTimer = 0;
        if (synthMaster) {
            try { synthMaster.gain.setValueAtTime(0, ctx.currentTime); synthMaster.disconnect(); } catch (e) { /* noop */ }
            synthMaster = null;
        }
    }

    /* ---------- Kontrol musik ---------- */
    function fallback() {
        useSynth = true;
        if (playing) startSynth();
    }

    function play() {
        ac();
        if (useSynth) { playing = true; startSynth(); return; }
        playing = true;
        const p = bgm.play();
        if (p && p.catch) {
            p.catch((err) => {
                if (err && err.name === "NotAllowedError") { playing = false; }
                else fallback();
            });
        }
    }

    function pause() {
        playing = false;
        if (bgm) bgm.pause();
        stopSynth();
    }

    function toggle() { playing ? pause() : play(); }

    function init() {
        bgm = new Audio();
        bgm.loop = true;
        bgm.preload = "auto";
        bgm.volume = 0.7;
        bgm.addEventListener("error", fallback);
        bgm.src = SRC;
        // hemat baterai: jeda saat tab disembunyikan, lanjut saat kembali
        let wasPlaying = false;
        document.addEventListener("visibilitychange", () => {
            if (document.hidden) { wasPlaying = playing; if (playing) pause(); }
            else if (wasPlaying) { wasPlaying = false; play(); }
        });
    }

    SC.audio = Object.assign({ init, play, pause, toggle, isPlaying: () => playing }, sfx);
})();
