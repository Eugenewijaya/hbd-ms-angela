/* ==========================================================================
   AUDIO.JS - Audio Manager (hbd.mp3 + Web Audio API Synthesizer Fallback)
   ========================================================================== */

(function () {
    let audioCtx = null;
    let bgmAudioElement = null;
    let isPlaying = false;
    let synthLoopTimeout = null;
    let synthTimeouts = [];
    let isUsingFallbackSynth = false;

    // Web Audio Context Getter (unlocked on first user interaction)
    function getAudioContext() {
        if (!audioCtx) {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            if (AudioContextClass) {
                audioCtx = new AudioContextClass();
            }
        }
        if (audioCtx && audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
        return audioCtx;
    }

    // Play single synthesized tone (used for SFX & Synth fallback)
    function playTone(freq, duration = 0.25, type = 'triangle', delay = 0, volume = 0.12) {
        try {
            const ctx = getAudioContext();
            if (!ctx) return;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = type;
            osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);

            gain.gain.setValueAtTime(0.0001, ctx.currentTime + delay);
            gain.gain.exponentialRampToValueAtTime(volume, ctx.currentTime + delay + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + delay + duration);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start(ctx.currentTime + delay);
            osc.stop(ctx.currentTime + delay + duration + 0.02);
        } catch (e) {
            // Audio context not ready yet
        }
    }

    // Sound Effects
    function playChimeBurst() {
        const notes = [523.25, 659.25, 783.99, 1046.50];
        notes.forEach((f, idx) => playTone(f, 0.32, 'triangle', idx * 0.07, 0.15));
    }

    function playPaperFlipSound() {
        playTone(440, 0.08, 'sine', 0, 0.08);
        playTone(587.33, 0.1, 'triangle', 0.04, 0.08);
    }

    function playCameraShutterSound() {
        playTone(300, 0.05, 'square', 0, 0.18);
        playTone(900, 0.08, 'sine', 0.05, 0.22);
    }

    function playTypewriterClickSound() {
        playTone(1200 + Math.random() * 400, 0.03, 'sine', 0, 0.03);
    }

    // Initialize Background Music Engine
    function initAudioManager() {
        bgmAudioElement = new Audio('assets/audio/hbd.mp3');
        bgmAudioElement.loop = true;
        bgmAudioElement.volume = 0.75;

        // Fallback to Web Audio Synthesizer if hbd.mp3 cannot be loaded (e.g. not placed yet)
        bgmAudioElement.addEventListener('error', function () {
            console.log('assets/audio/hbd.mp3 not found or failed to load. Using Web Audio Music Box Fallback.');
            isUsingFallbackSynth = true;
            if (isPlaying) {
                startSynthHappyBirthdayLoop();
            }
        });

        setupMusicWidgetUI();
    }

    // Start Playing Music
    function startMusic() {
        if (isPlaying) return;
        getAudioContext();

        if (!isUsingFallbackSynth && bgmAudioElement) {
            bgmAudioElement.play()
                .then(() => {
                    isPlaying = true;
                    updateMusicWidgetUI(true);
                })
                .catch((err) => {
                    // Browser blocked or file failed, try synth
                    console.log('Audio element play deferred or fallback active:', err);
                    isUsingFallbackSynth = true;
                    isPlaying = true;
                    startSynthHappyBirthdayLoop();
                    updateMusicWidgetUI(true);
                });
        } else {
            isPlaying = true;
            startSynthHappyBirthdayLoop();
            updateMusicWidgetUI(true);
        }
    }

    // Pause Music
    function pauseMusic() {
        isPlaying = false;
        if (bgmAudioElement) {
            bgmAudioElement.pause();
        }
        stopSynthLoop();
        updateMusicWidgetUI(false);
    }

    // Toggle Music
    function toggleMusic() {
        if (isPlaying) {
            pauseMusic();
        } else {
            startMusic();
        }
    }

    // Web Audio Music Box "Happy Birthday" Melody Synthesizer Loop
    function startSynthHappyBirthdayLoop() {
        stopSynthLoop();
        if (!isPlaying) return;

        // Song notes: [Frequency, Duration (s), Offset (s)]
        const song = [
            [392.00, 0.3, 0.0], [392.00, 0.3, 0.38], [440.00, 0.55, 0.75], [392.00, 0.55, 1.45], [523.25, 0.55, 2.15], [493.88, 0.9, 2.85],
            [392.00, 0.3, 4.0], [392.00, 0.3, 4.38], [440.00, 0.55, 4.75], [392.00, 0.55, 5.45], [587.33, 0.55, 6.15], [523.25, 0.9, 6.85],
            [392.00, 0.3, 8.0], [392.00, 0.3, 8.38], [783.99, 0.55, 8.75], [659.25, 0.55, 9.45], [523.25, 0.55, 10.15], [493.88, 0.55, 10.85], [440.00, 0.85, 11.55],
            [698.46, 0.3, 12.8], [698.46, 0.3, 13.18], [659.25, 0.55, 13.55], [523.25, 0.55, 14.25], [587.33, 0.55, 14.95], [523.25, 1.1, 15.65]
        ];

        song.forEach(([freq, dur, offset]) => {
            const t = setTimeout(() => {
                if (isPlaying) {
                    playTone(freq, dur, 'triangle', 0, 0.1);
                    playTone(freq * 2, dur * 0.7, 'sine', 0, 0.03); // gentle harmonic overtone
                }
            }, offset * 1000);
            synthTimeouts.push(t);
        });

        // Continuous Loop every ~17.5 seconds
        synthLoopTimeout = setTimeout(() => {
            if (isPlaying) {
                startSynthHappyBirthdayLoop();
            }
        }, 17500);
    }

    function stopSynthLoop() {
        if (synthLoopTimeout) {
            clearTimeout(synthLoopTimeout);
            synthLoopTimeout = null;
        }
        synthTimeouts.forEach(t => clearTimeout(t));
        synthTimeouts = [];
    }

    // UI Controller Setup
    function setupMusicWidgetUI() {
        const widget = document.getElementById('floating-music-widget');
        if (!widget) return;

        widget.addEventListener('click', toggleMusic);
    }

    function updateMusicWidgetUI(playing) {
        const widget = document.getElementById('floating-music-widget');
        const text = document.getElementById('music-status-text');
        if (!widget) return;

        if (playing) {
            widget.classList.add('music-playing');
            if (text) text.textContent = "BGM Nyala 🎵";
        } else {
            widget.classList.remove('music-playing');
            if (text) text.textContent = "BGM Jeda ⏸️";
        }
    }

    // Auto-unlock music on any first user click or tap anywhere
    ['click', 'touchstart', 'keydown'].forEach(evt => {
        window.addEventListener(evt, () => {
            getAudioContext();
        }, { once: true });
    });

    // Expose Global API
    window.audioApp = {
        init: initAudioManager,
        startMusic,
        pauseMusic,
        toggleMusic,
        playChimeBurst,
        playPaperFlipSound,
        playCameraShutterSound,
        playTypewriterClickSound,
        playTone
    };
})();
