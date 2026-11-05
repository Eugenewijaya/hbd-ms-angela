/* ==========================================================================
   PHOTOBOOTH.JS - 9:16 Portrait Online Photobooth Studio for Ms. Angela
   ========================================================================== */

(function () {
    let videoStream = null;
    let currentFacingMode = 'user'; // 'user' or 'environment'
    let capturedImage = null; // Image element or ImageBitmap
    let currentTemplate = 'star-champs';
    let currentFilter = 'filter-normal';
    let placedStickers = []; // [{ id, emoji, x, y, size }]
    let isCameraRunning = false;

    // Canvas Size: 1080 x 1920 (Standard HD 9:16 Portrait for Instagram Story)
    const CANVAS_WIDTH = 1080;
    const CANVAS_HEIGHT = 1920;

    function initPhotobooth() {
        setupStickersTray();
        setupEventListeners();
    }

    // Set up sticker picker buttons
    function setupStickersTray() {
        const tray = document.getElementById('stickers-tray');
        if (!tray || typeof photoboothStickers === 'undefined') return;

        tray.innerHTML = photoboothStickers.map(s => `
            <button onclick="addPhotoboothSticker('${s.emoji}')" class="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-white border-2 border-slate-200 hover:border-starCoral shadow-sm hover:scale-110 active:scale-95 transition-all text-xl sm:text-2xl flex items-center justify-center shrink-0" title="${s.label}">
                ${s.emoji}
            </button>
        `).join('');
    }

    // Setup Event Listeners
    function setupEventListeners() {
        // Custom text caption update
        const captionInput = document.getElementById('photobooth-custom-text');
        if (captionInput) {
            captionInput.addEventListener('input', () => {
                const liveCaption = document.getElementById('live-frame-caption');
                if (liveCaption) {
                    liveCaption.textContent = captionInput.value.trim() || 'Ms. Angela Tersayang ✨';
                }
            });
        }
    }

    // Start Webcam
    async function startCamera() {
        stopCamera();
        const video = document.getElementById('photobooth-video');
        const imgPreview = document.getElementById('photobooth-img-preview');
        const placeholder = document.getElementById('photobooth-placeholder');

        if (!video) return;

        try {
            const constraints = {
                video: {
                    facingMode: currentFacingMode,
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                },
                audio: false
            };

            videoStream = await navigator.mediaDevices.getUserMedia(constraints);
            video.srcObject = videoStream;
            await video.play();

            video.style.display = 'block';
            if (currentFacingMode === 'user') {
                video.classList.add('mirror-mode');
            } else {
                video.classList.remove('mirror-mode');
            }

            if (imgPreview) imgPreview.style.display = 'none';
            if (placeholder) placeholder.style.display = 'none';

            isCameraRunning = true;
            capturedImage = null;

            document.getElementById('btn-capture').classList.remove('hidden');
            document.getElementById('btn-retake').classList.add('hidden');
            document.getElementById('btn-switch-cam').classList.remove('hidden');
        } catch (err) {
            console.warn('Camera access denied or unavailable:', err);
            if (window.triggerSpeechPop) {
                window.triggerSpeechPop('Kamera tidak aktif atau izin ditolak. Anda bisa upload foto lewat tombol "Pilih Foto"! 📷');
            }
        }
    }

    // Stop Webcam
    function stopCamera() {
        if (videoStream) {
            videoStream.getTracks().forEach(track => track.stop());
            videoStream = null;
        }
        isCameraRunning = false;
        const video = document.getElementById('photobooth-video');
        if (video) {
            video.srcObject = null;
        }
    }

    // Switch between Front & Rear Camera
    function switchCamera() {
        currentFacingMode = (currentFacingMode === 'user') ? 'environment' : 'user';
        startCamera();
    }

    // Capture Photo with 3-2-1 Countdown & Flash
    function takePhotoWithCountdown() {
        const overlay = document.getElementById('countdown-overlay');
        const countNum = document.getElementById('countdown-number');
        const flashScreen = document.getElementById('camera-flash-screen');

        if (!overlay || !countNum) return;

        let count = 3;
        overlay.style.display = 'flex';
        countNum.textContent = count;
        countNum.classList.add('countdown-pop');

        if (window.audioApp) window.audioApp.playTone(600, 0.15, 'sine', 0, 0.15);

        const timer = setInterval(() => {
            count--;
            if (count > 0) {
                countNum.classList.remove('countdown-pop');
                void countNum.offsetWidth;
                countNum.textContent = count;
                countNum.classList.add('countdown-pop');
                if (window.audioApp) window.audioApp.playTone(600, 0.15, 'sine', 0, 0.15);
            } else {
                clearInterval(timer);
                overlay.style.display = 'none';

                // Camera Shutter Sound & Flash
                if (window.audioApp) {
                    window.audioApp.playCameraShutterSound();
                    window.audioApp.playTone(900, 0.25, 'triangle', 0, 0.2);
                }

                if (flashScreen) {
                    flashScreen.classList.remove('camera-flash-active');
                    void flashScreen.offsetWidth;
                    flashScreen.classList.add('camera-flash-active');
                }

                captureCurrentFrame();
            }
        }, 850);
    }

    // Capture the current video frame onto a static image
    function captureCurrentFrame() {
        const video = document.getElementById('photobooth-video');
        const imgPreview = document.getElementById('photobooth-img-preview');
        if (!video) return;

        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = video.videoWidth || 720;
        tempCanvas.height = video.videoHeight || 1280;
        const ctx = tempCanvas.getContext('2d');

        // Apply mirror if user facing
        if (currentFacingMode === 'user') {
            ctx.translate(tempCanvas.width, 0);
            ctx.scale(-1, 1);
        }
        ctx.drawImage(video, 0, 0, tempCanvas.width, tempCanvas.height);

        const dataUrl = tempCanvas.toDataURL('image/png');
        const img = new Image();
        img.onload = () => {
            capturedImage = img;
            if (imgPreview) {
                imgPreview.src = dataUrl;
                imgPreview.style.display = 'block';
            }
            video.style.display = 'none';
            stopCamera();

            document.getElementById('btn-capture').classList.add('hidden');
            document.getElementById('btn-retake').classList.remove('hidden');
            document.getElementById('btn-switch-cam').classList.add('hidden');

            if (window.launchConfettiBurst) window.launchConfettiBurst(40);
        };
        img.src = dataUrl;
    }

    // Retake Photo
    function retakePhoto() {
        capturedImage = null;
        startCamera();
    }

    // Handle File Upload from Gallery / Disk
    function handlePhotoUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function (e) {
            const img = new Image();
            img.onload = function () {
                capturedImage = img;
                const imgPreview = document.getElementById('photobooth-img-preview');
                const video = document.getElementById('photobooth-video');
                const placeholder = document.getElementById('photobooth-placeholder');

                if (imgPreview) {
                    imgPreview.src = e.target.result;
                    imgPreview.style.display = 'block';
                }
                if (video) video.style.display = 'none';
                if (placeholder) placeholder.style.display = 'none';

                stopCamera();

                document.getElementById('btn-capture').classList.add('hidden');
                document.getElementById('btn-retake').classList.remove('hidden');
                document.getElementById('btn-switch-cam').classList.add('hidden');

                if (window.audioApp) window.audioApp.playChimeBurst();
                if (window.launchConfettiBurst) window.launchConfettiBurst(35);
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    // Select Template
    function setTemplate(templateId) {
        currentTemplate = templateId;
        const frame = document.getElementById('photobooth-frame');
        if (!frame) return;

        frame.className = `photobooth-frame-9-16 relative w-full ${currentFilter}`;

        // Update pills active state
        document.querySelectorAll('.template-pill').forEach(btn => {
            if (btn.dataset.template === templateId) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        // Update decorative elements inside the preview
        updatePreviewTemplateDecorations();
        if (window.audioApp) window.audioApp.playPaperFlipSound();
    }

    // Update overlay decorations for preview
    function updatePreviewTemplateDecorations() {
        const overlay = document.getElementById('template-overlay-content');
        if (!overlay) return;

        const customCaption = document.getElementById('photobooth-custom-text')?.value || 'Ms. Angela Tersayang ✨';

        if (currentTemplate === 'star-champs') {
            overlay.innerHTML = `
                <div class="flex items-center justify-between w-full">
                    <span class="bg-white/95 px-3 py-1 rounded-full text-[11px] font-display font-bold text-starCoral shadow-md border border-rose-200">
                        🌟 Star Champs Therapy
                    </span>
                    <span class="text-xl">🎂🎈</span>
                </div>
                <div class="mt-auto text-center w-full pb-2">
                    <div class="bg-white/95 backdrop-blur-sm rounded-2xl p-3 shadow-lg border-2 border-starYellow">
                        <p class="font-hand text-2xl font-bold text-slate-800 leading-tight">
                            "Happy Birthday Ms. Angela!"
                        </p>
                        <p id="live-frame-caption" class="text-xs font-display font-semibold text-starCoral mt-0.5">
                            ${customCaption}
                        </p>
                    </div>
                </div>
            `;
        } else if (currentTemplate === 'aesthetic-polaroid') {
            overlay.innerHTML = `
                <div class="flex justify-center w-full">
                    <div class="washi-tape px-6 py-1 rounded-sm -rotate-2">
                        <span class="font-hand font-bold text-xs text-amber-900">STAR CHAMPS • 2026</span>
                    </div>
                </div>
                <div class="mt-auto text-center w-full pb-1">
                    <p class="font-hand text-3xl font-bold text-slate-800 tracking-wide">
                        Ms. Angela ✨
                    </p>
                    <p id="live-frame-caption" class="font-hand text-sm text-slate-600">
                        ${customCaption}
                    </p>
                </div>
            `;
        } else if (currentTemplate === 'therapy-wonderland') {
            overlay.innerHTML = `
                <div class="flex items-center justify-between w-full">
                    <span class="bg-sky-500 text-white px-3 py-1 rounded-full text-[11px] font-display font-bold shadow-md">
                        💬 Speech Therapy Wonderland
                    </span>
                    <span class="text-xl">🧩🌸</span>
                </div>
                <div class="mt-auto text-center w-full pb-2">
                    <div class="bg-white/95 rounded-2xl p-2.5 shadow-lg border-2 border-emerald-300">
                        <p class="font-display font-bold text-sm text-teal-700">
                            "Membuka Suara, Merajut Senyuman"
                        </p>
                        <p id="live-frame-caption" class="text-xs font-hand text-slate-600 mt-0.5">
                            ${customCaption}
                        </p>
                    </div>
                </div>
            `;
        } else if (currentTemplate === 'golden-gala') {
            overlay.innerHTML = `
                <div class="flex justify-between items-center w-full">
                    <span class="bg-amber-400 text-slate-900 px-3.5 py-1 rounded-full text-xs font-display font-bold shadow-md">
                        👑 Ms. Angela Celebration
                    </span>
                    <span class="text-xl">✨⭐</span>
                </div>
                <div class="mt-auto text-center w-full pb-2">
                    <div class="bg-slate-900/90 text-white rounded-2xl p-3 shadow-xl border-2 border-starYellow">
                        <p class="font-display font-bold text-base text-starYellow">
                            Happy Birthday Leader! 🏆
                        </p>
                        <p id="live-frame-caption" class="text-xs text-slate-200 mt-0.5">
                            ${customCaption}
                        </p>
                    </div>
                </div>
            `;
        }
    }

    // Select Filter
    function setFilter(filterClass) {
        currentFilter = filterClass;
        const frame = document.getElementById('photobooth-frame');
        if (frame) {
            frame.className = `photobooth-frame-9-16 relative w-full ${filterClass}`;
        }
        document.querySelectorAll('.filter-btn').forEach(btn => {
            if (btn.dataset.filter === filterClass) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
        if (window.audioApp) window.audioApp.playPaperFlipSound();
    }

    // Add Sticker to Photobooth Live Viewfinder
    function addSticker(emoji) {
        const stickersContainer = document.getElementById('stickers-overlay-container');
        if (!stickersContainer) return;

        const stickerId = Date.now();
        // Place near center with slight random offset
        const xPercent = 40 + (Math.random() - 0.5) * 20;
        const yPercent = 40 + (Math.random() - 0.5) * 20;

        const stickerEl = document.createElement('div');
        stickerEl.id = `sticker-${stickerId}`;
        stickerEl.className = 'photobooth-sticker-item select-none';
        stickerEl.style.left = `${xPercent}%`;
        stickerEl.style.top = `${yPercent}%`;
        stickerEl.style.fontSize = '2.5rem';
        stickerEl.innerHTML = `
            <span class="inline-block hover:scale-125 transition-transform drop-shadow-md cursor-grab">${emoji}</span>
            <button onclick="removePhotoboothSticker(${stickerId}, event)" class="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center shadow">✕</button>
        `;

        stickersContainer.appendChild(stickerEl);
        makeElementDraggable(stickerEl);

        placedStickers.push({
            id: stickerId,
            emoji: emoji,
            xPercent: xPercent,
            yPercent: yPercent,
            element: stickerEl
        });

        if (window.audioApp) window.audioApp.playTone(800, 0.1, 'sine', 0, 0.1);
    }

    function removeSticker(id, event) {
        if (event) event.stopPropagation();
        const el = document.getElementById(`sticker-${id}`);
        if (el) el.remove();
        placedStickers = placedStickers.filter(s => s.id !== id);
    }

    // Make sticker draggable by mouse or touch
    function makeElementDraggable(el) {
        let isDragging = false;
        let startX, startY;
        let startLeft, startTop;

        const parent = el.parentElement;

        function onStart(e) {
            isDragging = true;
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;

            startX = clientX;
            startY = clientY;
            startLeft = el.offsetLeft;
            startTop = el.offsetTop;

            document.addEventListener('mousemove', onMove);
            document.addEventListener('mouseup', onEnd);
            document.addEventListener('touchmove', onMove, { passive: false });
            document.addEventListener('touchend', onEnd);
        }

        function onMove(e) {
            if (!isDragging) return;
            if (e.cancelable) e.preventDefault();

            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;

            const dx = clientX - startX;
            const dy = clientY - startY;

            let newLeft = startLeft + dx;
            let newTop = startTop + dy;

            // Constrain inside parent bounds
            newLeft = Math.max(0, Math.min(newLeft, parent.clientWidth - el.clientWidth));
            newTop = Math.max(0, Math.min(newTop, parent.clientHeight - el.clientHeight));

            el.style.left = `${(newLeft / parent.clientWidth) * 100}%`;
            el.style.top = `${(newTop / parent.clientHeight) * 100}%`;
        }

        function onEnd() {
            isDragging = false;
            document.removeEventListener('mousemove', onMove);
            document.removeEventListener('mouseup', onEnd);
            document.removeEventListener('touchmove', onMove);
            document.removeEventListener('touchend', onEnd);
        }

        el.addEventListener('mousedown', onStart);
        el.addEventListener('touchstart', onStart, { passive: false });
    }

    // Render High-Resolution 1080x1920 (9:16) Canvas
    async function renderHighResCanvas() {
        const canvas = document.getElementById('photobooth-export-canvas') || document.createElement('canvas');
        canvas.id = 'photobooth-export-canvas';
        canvas.width = CANVAS_WIDTH;
        canvas.height = CANVAS_HEIGHT;
        const ctx = canvas.getContext('2d');

        // 1. Draw Background / Photo Layer
        ctx.fillStyle = '#FFF8E7';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        let sourceImg = capturedImage;
        if (!sourceImg) {
            const preview = document.getElementById('photobooth-img-preview');
            if (preview && preview.src && preview.src !== window.location.href) {
                sourceImg = preview;
            } else {
                // If no photo taken yet, use default ms angela illustration
                sourceImg = document.getElementById('angela-photo') || new Image();
            }
        }

        if (sourceImg && sourceImg.complete && sourceImg.naturalWidth !== 0) {
            // Apply filter onto context
            applyFilterToContext(ctx, currentFilter);

            // Draw image scaled to cover 1080x1920 with inner margins
            const margin = 50;
            const photoW = CANVAS_WIDTH - (margin * 2);
            const photoH = CANVAS_HEIGHT - (margin * 2);

            drawImageCover(ctx, sourceImg, margin, margin, photoW, photoH);

            // Reset filter
            ctx.filter = 'none';
        }

        // 2. Draw Frame Template Graphics
        drawTemplateGraphics(ctx, currentTemplate);

        // 3. Draw Placed Stickers
        drawPlacedStickers(ctx);

        return canvas;
    }

    // Helper: Draw Image Cover (like CSS object-fit: cover)
    function drawImageCover(ctx, img, x, y, w, h) {
        const imgRatio = (img.naturalWidth || img.width) / (img.naturalHeight || img.height);
        const canvasRatio = w / h;
        let sWidth, sHeight, sx, sy;

        if (imgRatio > canvasRatio) {
            sHeight = img.naturalHeight || img.height;
            sWidth = sHeight * canvasRatio;
            sx = ((img.naturalWidth || img.width) - sWidth) / 2;
            sy = 0;
        } else {
            sWidth = img.naturalWidth || img.width;
            sHeight = sWidth / canvasRatio;
            sx = 0;
            sy = ((img.naturalHeight || img.height) - sHeight) / 2;
        }

        ctx.drawImage(img, sx, sy, sWidth, sHeight, x, y, w, h);
    }

    // Apply Filter string to Canvas 2D context
    function applyFilterToContext(ctx, filterClass) {
        switch (filterClass) {
            case 'filter-warm':
                ctx.filter = 'sepia(0.2) saturate(1.3) brightness(1.05)';
                break;
            case 'filter-pastel':
                ctx.filter = 'contrast(0.92) brightness(1.08) saturate(1.2) hue-rotate(5deg)';
                break;
            case 'filter-rosy':
                ctx.filter = 'saturate(1.25) hue-rotate(-12deg) brightness(1.03)';
                break;
            case 'filter-vintage':
                ctx.filter = 'sepia(0.45) contrast(1.1) brightness(0.95)';
                break;
            case 'filter-bw':
                ctx.filter = 'grayscale(1) contrast(1.15)';
                break;
            default:
                ctx.filter = 'none';
        }
    }

    // Draw Template Graphics on 1080x1920 Canvas
    function drawTemplateGraphics(ctx, templateId) {
        const customCaption = document.getElementById('photobooth-custom-text')?.value.trim() || 'Ms. Angela Tersayang ✨';

        if (templateId === 'star-champs') {
            // Border & Dashed Outline
            ctx.lineWidth = 36;
            ctx.strokeStyle = '#FFFFFF';
            ctx.strokeRect(18, 18, CANVAS_WIDTH - 36, CANVAS_HEIGHT - 36);

            ctx.lineWidth = 12;
            ctx.strokeStyle = '#FF6B8B';
            ctx.setLineDash([24, 18]);
            ctx.strokeRect(48, 48, CANVAS_WIDTH - 96, CANVAS_HEIGHT - 96);
            ctx.setLineDash([]);

            // Header Banner
            drawPillBadge(ctx, 80, 80, 460, 80, '#FFFFFF', '#06D6A0', '🌟 STAR CHAMPS THERAPY', 26);

            // Bottom Celebration Card
            const cardY = CANVAS_HEIGHT - 280;
            drawRoundedRect(ctx, 80, cardY, CANVAS_WIDTH - 160, 200, 36, 'rgba(255, 255, 255, 0.96)', '#FFD166', 8);

            ctx.textAlign = 'center';
            ctx.fillStyle = '#2B2D42';
            ctx.font = 'bold 54px Fredoka, sans-serif';
            ctx.fillText('"Happy Birthday Ms. Angela!" 🎉', CANVAS_WIDTH / 2, cardY + 80);

            ctx.fillStyle = '#FF6B8B';
            ctx.font = '600 36px "Plus Jakarta Sans", sans-serif';
            ctx.fillText(customCaption, CANVAS_WIDTH / 2, cardY + 145);

        } else if (templateId === 'aesthetic-polaroid') {
            // Polaroid Border: Bottom thick strip
            ctx.lineWidth = 44;
            ctx.strokeStyle = '#FFFFFF';
            ctx.strokeRect(22, 22, CANVAS_WIDTH - 44, CANVAS_HEIGHT - 44);

            // Thick bottom
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, CANVAS_HEIGHT - 320, CANVAS_WIDTH, 320);

            // Top Washi Tape
            ctx.save();
            ctx.translate(CANVAS_WIDTH / 2, 70);
            ctx.rotate(-0.03);
            ctx.fillStyle = 'rgba(255, 209, 102, 0.9)';
            ctx.fillRect(-220, -30, 440, 60);
            ctx.fillStyle = '#78350F';
            ctx.font = 'bold 28px "Patrick Hand", cursive';
            ctx.textAlign = 'center';
            ctx.fillText('STAR CHAMPS • FOREVER FAMILY • 2026', 0, 10);
            ctx.restore();

            // Bottom Polaroid Signature
            ctx.textAlign = 'center';
            ctx.fillStyle = '#2B2D42';
            ctx.font = 'bold 72px "Patrick Hand", cursive';
            ctx.fillText('Ms. Angela Tersayang ✨', CANVAS_WIDTH / 2, CANVAS_HEIGHT - 170);

            ctx.fillStyle = '#64748B';
            ctx.font = '36px "Patrick Hand", cursive';
            ctx.fillText(customCaption, CANVAS_WIDTH / 2, CANVAS_HEIGHT - 95);

        } else if (templateId === 'therapy-wonderland') {
            // Speech Therapy Wonderland
            ctx.lineWidth = 36;
            ctx.strokeStyle = '#E0F4FF';
            ctx.strokeRect(18, 18, CANVAS_WIDTH - 36, CANVAS_HEIGHT - 36);

            ctx.lineWidth = 10;
            ctx.strokeStyle = '#06D6A0';
            ctx.strokeRect(48, 48, CANVAS_WIDTH - 96, CANVAS_HEIGHT - 96);

            drawPillBadge(ctx, 80, 80, 520, 80, '#4EA8DE', '#FFFFFF', '💬 SPEECH THERAPY WONDERLAND', 26);

            const cardY = CANVAS_HEIGHT - 270;
            drawRoundedRect(ctx, 80, cardY, CANVAS_WIDTH - 160, 190, 32, '#FFFFFF', '#4EA8DE', 6);

            ctx.textAlign = 'center';
            ctx.fillStyle = '#065F46';
            ctx.font = 'bold 46px Fredoka, sans-serif';
            ctx.fillText('"Membuka Suara, Merajut Senyuman" 🧩', CANVAS_WIDTH / 2, cardY + 75);

            ctx.fillStyle = '#334155';
            ctx.font = '600 34px "Patrick Hand", cursive';
            ctx.fillText(customCaption, CANVAS_WIDTH / 2, cardY + 135);

        } else if (templateId === 'golden-gala') {
            // Elegant Golden Gala
            ctx.lineWidth = 36;
            ctx.strokeStyle = '#FFF8E7';
            ctx.strokeRect(18, 18, CANVAS_WIDTH - 36, CANVAS_HEIGHT - 36);

            ctx.lineWidth = 12;
            ctx.strokeStyle = '#FFD166';
            ctx.strokeRect(48, 48, CANVAS_WIDTH - 96, CANVAS_HEIGHT - 96);

            drawPillBadge(ctx, 80, 80, 480, 80, '#FFD166', '#1E293B', '👑 MS. ANGELA CELEBRATION', 26);

            const cardY = CANVAS_HEIGHT - 270;
            drawRoundedRect(ctx, 80, cardY, CANVAS_WIDTH - 160, 190, 32, 'rgba(30, 41, 59, 0.94)', '#FFD166', 6);

            ctx.textAlign = 'center';
            ctx.fillStyle = '#FFD166';
            ctx.font = 'bold 50px Fredoka, sans-serif';
            ctx.fillText('Happy Birthday Leader! 🏆✨', CANVAS_WIDTH / 2, cardY + 75);

            ctx.fillStyle = '#FFFFFF';
            ctx.font = '500 34px "Plus Jakarta Sans", sans-serif';
            ctx.fillText(customCaption, CANVAS_WIDTH / 2, cardY + 135);
        }
    }

    // Helper: Draw Placed Stickers onto Canvas
    function drawPlacedStickers(ctx) {
        placedStickers.forEach(sticker => {
            const el = sticker.element;
            if (!el) return;

            const parent = el.parentElement;
            if (!parent) return;

            // Compute relative position in percentage
            const leftPercent = parseFloat(el.style.left) || 0;
            const topPercent = parseFloat(el.style.top) || 0;

            const x = (leftPercent / 100) * CANVAS_WIDTH;
            const y = (topPercent / 100) * CANVAS_HEIGHT;

            ctx.font = '96px "Segoe UI Emoji", "Apple Color Emoji", sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(sticker.emoji, x + 48, y + 48);
        });
    }

    // Canvas Draw Helpers
    function drawRoundedRect(ctx, x, y, width, height, radius, fill, stroke, strokeWidth) {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();

        if (fill) {
            ctx.fillStyle = fill;
            ctx.fill();
        }
        if (stroke && strokeWidth) {
            ctx.lineWidth = strokeWidth;
            ctx.strokeStyle = stroke;
            ctx.stroke();
        }
    }

    function drawPillBadge(ctx, x, y, w, h, bg, textCol, label, fontSize) {
        drawRoundedRect(ctx, x, y, w, h, h / 2, bg, '#FFFFFF', 4);
        ctx.fillStyle = textCol;
        ctx.font = `bold ${fontSize}px Fredoka, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(label, x + (w / 2), y + (h / 2));
    }

    // Download HQ 9:16 PNG
    async function downloadPhoto() {
        if (window.audioApp) window.audioApp.playChimeBurst();

        const canvas = await renderHighResCanvas();
        const dataUrl = canvas.toDataURL('image/png');

        const link = document.createElement('a');
        link.download = `HBD-MsAngela-Photobooth-9x16-${Date.now()}.png`;
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        if (window.launchConfettiBurst) window.launchConfettiBurst(60);
        if (window.triggerSpeechPop) {
            window.triggerSpeechPop('Foto 9:16 berhasil didownload! Siap diposting di IG Story 🎉');
        }
    }

    // Share directly to Instagram Stories / WhatsApp / Social Media
    async function shareToInstagram() {
        if (window.audioApp) window.audioApp.playChimeBurst();

        const canvas = await renderHighResCanvas();

        canvas.toBlob(async (blob) => {
            if (!blob) return;

            const file = new File([blob], `HBD-MsAngela-Story.png`, { type: 'image/png' });

            // Check if Web Share API with Files is supported (iOS Safari, Android Chrome)
            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                try {
                    await navigator.share({
                        title: 'Happy Birthday Ms. Angela! 🌟',
                        text: 'Selamat ulang tahun Ms. Angela! Penuh doa dan cinta dari keluarga besar Star Champs! 🎈🎂 #HBDMsAngela #StarChamps',
                        files: [file]
                    });
                    if (window.launchConfettiBurst) window.launchConfettiBurst(50);
                } catch (err) {
                    if (err.name !== 'AbortError') {
                        openInstagramGuideModal(blob);
                    }
                }
            } else {
                // Desktop or unsupported browser fallback: download & show guide
                downloadPhoto();
                openInstagramGuideModal(blob);
            }
        }, 'image/png');
    }

    // Open Instagram Share Guide Modal
    function openInstagramGuideModal(blob) {
        const modal = document.getElementById('instagram-guide-modal');
        if (!modal) return;
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    }

    function closeInstagramGuideModal() {
        const modal = document.getElementById('instagram-guide-modal');
        if (!modal) return;
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }

    function copyInstagramCaption() {
        const caption = "Selamat Ulang Tahun Ms. Angela tersayang! 🎂✨ Terima kasih sudah jadi sosok yang hangat, sabar mendampingi anak-anak belajar bicara, dan memimpin kami semua di Star Champs! We love you Ms! 💛🌟 #HBDMsAngela #StarChamps #SpeechTherapy";
        navigator.clipboard.writeText(caption).then(() => {
            if (window.triggerSpeechPop) {
                window.triggerSpeechPop('Teks ucapan berhasil dicopy ke clipboard! 📋✨');
            }
        });
    }

    // Expose Global API
    window.photobooth = {
        init: initPhotobooth,
        startCamera,
        stopCamera,
        switchCamera,
        takePhoto: takePhotoWithCountdown,
        retakePhoto,
        handleUpload: handlePhotoUpload,
        setTemplate,
        setFilter,
        addSticker,
        removeSticker,
        downloadPhoto,
        shareToInstagram,
        closeShareGuide: closeInstagramGuideModal,
        copyCaption: copyInstagramCaption
    };

    window.addPhotoboothSticker = addSticker;
    window.removePhotoboothSticker = removeSticker;
})();
