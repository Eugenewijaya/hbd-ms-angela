/* ==========================================================================
   MAIN.JS - Central App Controller (Navigation, Envelope, Staff Modals, AAC)
   ========================================================================== */

let currentPopupStaffIndex = 0;
let envelopeOpened = false;
let selectedAacSentence = [];
let toastTimeout = null;

/* --------------------------------------------------------------------------
   1. ENVELOPE OPENING ANIMATION (STAGE 0 -> PAGE 1)
-------------------------------------------------------------------------- */
function openBirthdayEnvelope() {
    if (envelopeOpened) return;
    envelopeOpened = true;

    // Start background music & unlock audio context
    if (window.audioApp) {
        window.audioApp.startMusic();
        window.audioApp.playChimeBurst();
    }

    launchConfettiBurst(70);

    const envBox = document.getElementById('envelope-box');
    const waxSeal = document.getElementById('wax-seal');
    const slidingPaper = document.getElementById('sliding-paper');
    const envStage = document.getElementById('envelope-stage');
    const mainContent = document.getElementById('main-content');

    if (waxSeal) {
        waxSeal.style.opacity = '0';
        waxSeal.style.transform = 'translate(-50%, -50%) scale(0.4)';
    }

    if (envBox) {
        envBox.classList.add('envelope-open');
    }

    // Snappy transition (no slow easing)
    setTimeout(() => {
        if (slidingPaper) slidingPaper.classList.add('paper-burst-expand');
    }, 450);

    setTimeout(() => {
        if (envStage) {
            envStage.style.opacity = '0';
            envStage.style.pointerEvents = 'none';
        }
        if (mainContent) {
            mainContent.style.opacity = '1';
        }
        setTimeout(() => {
            if (envStage) envStage.classList.add('hidden');
        }, 350);

        // Start typewriter on initial polaroid note
        startInitialPrayerTypewriter();
    }, 850);
}

/* --------------------------------------------------------------------------
   2. STEP-BY-STEP PAGE NAVIGATION (1 to 5)
-------------------------------------------------------------------------- */
function goToStepPage(pageNumber) {
    if (window.audioApp) window.audioApp.playPaperFlipSound();

    const allPages = document.querySelectorAll('.step-page');
    allPages.forEach(p => p.classList.remove('active-page'));

    const target = document.getElementById(`page-${pageNumber}`);
    if (target) {
        target.classList.add('active-page');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Special trigger per page
    if (pageNumber === 4) {
        launchConfettiBurst(50);
    } else if (pageNumber === 5) {
        // Activate photobooth camera if desired
        if (window.photobooth) {
            window.photobooth.setTemplate('star-champs');
        }
        launchConfettiBurst(45);
    }
}

/* --------------------------------------------------------------------------
   3. TYPEWRITER TRIGGERS
-------------------------------------------------------------------------- */
function startInitialPrayerTypewriter() {
    const prayerBox = document.getElementById('typewriter-initial-prayer');
    if (!prayerBox || !window.typewriter) return;

    const text = "Selamat ulang tahun ya, Ms. Angela! 🌷 Di hari yang spesial ini, kami semua mengirimkan doa paling tulus. Semoga Tuhan senantiasa melimpahkan kesehatan, umur panjang yang berkah, ketenangan hati, dan kebahagiaan tak putus di setiap langkah. Terima kasih atas ketulusan, kesabaran, dan ilmu terapi wicara yang Ms. curahkan setiap hari—membantu anak-anak berani bersuara dan tersenyum bahagia. Tetap jadi sosok yang hangat buat keluarga besar Star Champs! ✨";
    window.typewriter.type(prayerBox, text, { speed: 20 });
}

/* --------------------------------------------------------------------------
   4. POLAROID TILT & PHOTO UPLOAD
-------------------------------------------------------------------------- */
function handlePolaroidUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        const img = document.getElementById('angela-photo');
        if (img) img.src = e.target.result;

        // Also update photobooth default preview
        const pbImg = document.getElementById('photobooth-img-preview');
        if (pbImg) pbImg.src = e.target.result;

        if (window.audioApp) window.audioApp.playChimeBurst();
        launchConfettiBurst(45);
        triggerSpeechPop("Foto Polaroid Ms. Angela berhasil dipasang! 📸✨");
    };
    reader.readAsDataURL(file);
}

function initPolaroidTilt() {
    const card = document.getElementById('polaroid-tilt');
    if (!card) return;

    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = ((y - centerY) / centerY) * -6;
        const rotateY = ((x - centerX) / centerX) * 6;
        card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
    });

    card.addEventListener('mouseleave', () => {
        card.style.transform = `perspective(900px) rotateX(0deg) rotateY(0deg) rotate(-1.5deg) scale(1)`;
    });
}

/* --------------------------------------------------------------------------
   5. AAC VISUAL COMMUNICATION BOARD
-------------------------------------------------------------------------- */
function renderAacBoard() {
    const grid = document.getElementById('aac-board-grid');
    if (!grid || typeof aacSymbols === 'undefined') return;

    grid.innerHTML = aacSymbols.map((sym, idx) => `
        <button id="aac-card-${idx}" onclick="selectAacSymbol(${idx})" class="group relative ${sym.categoryColor} border-3 rounded-3xl p-3 sm:p-4 shadow-md hover:shadow-xl hover:-translate-y-1.5 transition-all flex flex-col items-center justify-between min-h-[150px] select-none overflow-hidden">
            <span class="text-[10px] font-display font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white/90 shadow-sm mb-1.5">
                ${sym.badgeText}
            </span>
            <div class="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center my-1">
                <img src="${sym.imgUrl}" 
                     alt="${sym.label}" 
                     class="w-full h-full object-contain drop-shadow-md group-hover:scale-110 transition-transform duration-200"
                     onerror="this.onerror=null; this.src='${sym.fallbackImg}';">
            </div>
            <span class="font-display font-bold text-xs sm:text-sm mt-1 text-center leading-tight">
                ${sym.label}
            </span>
        </button>
    `).join('');
}

function selectAacSymbol(index) {
    if (typeof aacSymbols === 'undefined') return;
    const sym = aacSymbols[index];

    const cardEl = document.getElementById(`aac-card-${index}`);
    if (cardEl) {
        cardEl.classList.remove('aac-card-pop');
        void cardEl.offsetWidth;
        cardEl.classList.add('aac-card-pop');
    }

    if (window.audioApp) {
        window.audioApp.playTone(sym.freq, 0.28, 'triangle', 0, 0.16);
    }

    if (selectedAacSentence.length >= 6) {
        selectedAacSentence.shift();
    }
    selectedAacSentence.push(sym);
    renderAacSentenceStrip();

    const activeImg = document.getElementById('aac-active-img');
    const outputText = document.getElementById('aac-output-text');
    if (activeImg) {
        activeImg.src = sym.imgUrl;
        activeImg.onerror = () => { activeImg.src = sym.fallbackImg; };
    }
    if (outputText) {
        outputText.textContent = sym.voicePhrase;
    }
}

function renderAacSentenceStrip() {
    const strip = document.getElementById('aac-sentence-strip');
    if (!strip) return;

    if (selectedAacSentence.length === 0) {
        strip.innerHTML = `
            <div id="aac-empty-hint" class="flex items-center gap-3 text-slate-400 font-display text-xs sm:text-sm">
                <span class="text-2xl animate-bounce">👇</span>
                <span>Ketuk kartu gambar di bawah untuk menyusun kartu visual AAC...</span>
            </div>
        `;
        return;
    }

    strip.innerHTML = selectedAacSentence.map((item) => `
        <div class="aac-card-pop flex items-center gap-2 bg-white px-3 py-1.5 rounded-2xl border-2 border-sky-300 shadow-sm">
            <img src="${item.imgUrl}" alt="${item.label}" class="w-7 h-7 object-contain" onerror="this.onerror=null; this.src='${item.fallbackImg}';">
            <span class="font-display font-bold text-xs text-slate-800">${item.label}</span>
        </div>
    `).join('');
}

function playAacSentence() {
    if (selectedAacSentence.length === 0) {
        triggerSpeechPop("Pilih beberapa gambar di papan AAC dulu ya! 🖼️");
        return;
    }
    selectedAacSentence.forEach((sym, i) => {
        setTimeout(() => {
            if (window.audioApp) window.audioApp.playTone(sym.freq, 0.25, 'triangle', 0, 0.15);
        }, i * 240);
    });
    const combined = selectedAacSentence.map(s => s.label).join(' + ');
    triggerSpeechPop(`Pesan AAC: "${combined}" buat Ms. Angela! 🌟`);
    launchConfettiBurst(35);
}

function clearAacSentence() {
    if (window.audioApp) window.audioApp.playPaperFlipSound();
    selectedAacSentence = [];
    renderAacSentenceStrip();
}

/* --------------------------------------------------------------------------
   6. 11 STAFF MINI-ENVELOPES & TYPEWRITER POP-UP MODAL
-------------------------------------------------------------------------- */
function renderStaffEnvelopesGrid() {
    const grid = document.getElementById('staff-envelopes-grid');
    if (!grid || typeof staffLetters === 'undefined') return;

    const cardsHtml = staffLetters.map((item, idx) => `
        <div onclick="openStaffLetterModal(${idx})" class="mini-envelope group flex flex-col justify-between ${item.cardBg}">
            <!-- Mini Envelope Top Flap -->
            <div class="mini-envelope-flap"></div>
            <!-- Star Wax Seal -->
            <div class="mini-envelope-seal">⭐</div>

            <div class="pt-6">
                <!-- Header with Staff Avatar & Name -->
                <div class="flex items-center gap-3 mb-2.5">
                    <div class="w-12 h-12 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center p-1.5 shrink-0 group-hover:scale-110 transition-transform">
                        <img src="${item.imgUrl}" alt="${item.author}" class="w-full h-full object-contain" onerror="this.onerror=null; this.outerHTML='<span class=\\'text-2xl\\'>${item.fallbackEmoji || '💌'}</span>';">
                    </div>
                    <div>
                        <h3 class="font-display font-bold text-lg text-slate-800 leading-tight group-hover:text-starCoral transition-colors">
                            ${item.author}
                        </h3>
                        <span class="text-[11px] font-display font-semibold text-slate-400">Surat #${idx + 1}</span>
                    </div>
                </div>

                <!-- Short Preview of Message -->
                <p class="font-hand text-base sm:text-lg text-slate-600 line-clamp-2 leading-relaxed">
                    "${item.message}"
                </p>
            </div>

            <!-- Click to open prompt -->
            <div class="mt-4 pt-2.5 border-t border-dashed border-slate-200 flex items-center justify-between">
                <span class="text-[11px] font-display font-semibold text-slate-400">Amplop Tertutup</span>
                <span class="px-3 py-1 rounded-full bg-starCoral/10 group-hover:bg-starCoral text-starCoral group-hover:text-white font-display font-bold text-xs transition flex items-center gap-1">
                    <span>💌 Buka Surat</span>
                    <span class="group-hover:translate-x-0.5 transition-transform">➔</span>
                </span>
            </div>
        </div>
    `).join('');

    // Slot 12: Add New Letter Card
    const addCardHtml = `
        <div onclick="openAddLetterModal()" class="cursor-pointer group relative bg-white/75 hover:bg-white rounded-3xl p-6 border-3 border-dashed border-starMint shadow-md hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col items-center justify-center text-center min-h-[190px]">
            <div class="w-14 h-14 rounded-full bg-teal-100 group-hover:bg-starMint text-teal-800 group-hover:text-white flex items-center justify-center text-2xl mb-3 transition-colors shadow-sm">
                ✍️
            </div>
            <h3 class="font-display font-bold text-lg text-slate-800">Tambah Surat Doa Baru</h3>
            <p class="text-xs text-slate-500 mt-1 max-w-xs">
                Ketik surat dan doa tambahanmu untuk Ms. Angela di sini!
            </p>
        </div>
    `;

    grid.innerHTML = cardsHtml + addCardHtml;
}

function openStaffLetterModal(index) {
    currentPopupStaffIndex = index;
    if (window.audioApp) window.audioApp.playChimeBurst();

    const modal = document.getElementById('letter-popup-modal');
    if (!modal) return;

    modal.classList.remove('hidden');
    modal.classList.add('flex');

    updateStaffModalContent();
}

function updateStaffModalContent() {
    const item = staffLetters[currentPopupStaffIndex];
    const box = document.getElementById('letter-popup-box');
    const badge = document.getElementById('popup-counter-badge');
    const authorName = document.getElementById('popup-author-name');
    const authorRole = document.getElementById('popup-author-role');
    const avatarImg = document.getElementById('popup-avatar-img');
    const msgContainer = document.getElementById('popup-letter-message');

    if (box) {
        box.classList.remove('letter-modal-animate');
        void box.offsetWidth;
        box.classList.add('letter-modal-animate');
    }

    if (badge) badge.textContent = `Doa Staf ${currentPopupStaffIndex + 1} dari ${staffLetters.length}`;
    if (authorName) authorName.textContent = item.author;
    if (authorRole) authorRole.textContent = `${item.role} • ${item.badge}`;

    if (avatarImg) {
        avatarImg.style.display = 'block';
        avatarImg.src = item.imgUrl;
        avatarImg.onerror = function () {
            this.style.display = 'none';
        };
    }

    // Trigger Typewriter effect on staff letter message
    if (msgContainer && window.typewriter) {
        window.typewriter.type(msgContainer, `"${item.message}"`, {
            speed: 18,
            enableSound: true
        });
    }
}

function skipStaffTypewriter() {
    if (window.typewriter) {
        window.typewriter.skip();
    }
}

function nextPopupLetter() {
    if (window.audioApp) window.audioApp.playPaperFlipSound();
    currentPopupStaffIndex = (currentPopupStaffIndex + 1) % staffLetters.length;
    updateStaffModalContent();
}

function prevPopupLetter() {
    if (window.audioApp) window.audioApp.playPaperFlipSound();
    currentPopupStaffIndex = (currentPopupStaffIndex - 1 + staffLetters.length) % staffLetters.length;
    updateStaffModalContent();
}

function closeLetterPopup() {
    if (window.audioApp) window.audioApp.playPaperFlipSound();
    if (window.typewriter) window.typewriter.stop();

    const modal = document.getElementById('letter-popup-modal');
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }
}

/* --------------------------------------------------------------------------
   7. ADD NEW STAFF LETTER FORM
-------------------------------------------------------------------------- */
function openAddLetterModal() {
    const modal = document.getElementById('add-letter-modal');
    if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    }
}

function closeAddLetterModal() {
    const modal = document.getElementById('add-letter-modal');
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }
}

function saveNewLetter() {
    const authorInput = document.getElementById('new-letter-author')?.value.trim();
    const badgeInput = document.getElementById('new-letter-badge')?.value.trim();
    const bodyInput = document.getElementById('new-letter-body')?.value.trim();

    if (!authorInput || !bodyInput) {
        triggerSpeechPop("Isi nama dan pesan doanya dulu ya! ✍️");
        return;
    }

    staffLetters.push({
        id: staffLetters.length + 1,
        author: authorInput,
        role: "Star Champs Team",
        imgUrl: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Smilies/Love%20Letter.png",
        fallbackEmoji: "💌",
        badge: badgeInput || "Doa Terbaik 💌",
        cardBg: "bg-[#FFFDF7]",
        borderColor: "border-amber-300",
        message: bodyInput
    });

    renderStaffEnvelopesGrid();
    closeAddLetterModal();
    openStaffLetterModal(staffLetters.length - 1);
    launchConfettiBurst(40);

    // Reset inputs
    document.getElementById('new-letter-author').value = '';
    document.getElementById('new-letter-badge').value = '';
    document.getElementById('new-letter-body').value = '';
}

/* --------------------------------------------------------------------------
   8. CANDLE BLOWING & FINALE CELEBRATION (PAGE 4)
-------------------------------------------------------------------------- */
function blowCandleFinale() {
    const flame = document.getElementById('candle-flame');
    const hint = document.getElementById('candle-hint');
    const celebrationText = document.getElementById('finale-celebration-text');
    const blowBtn = document.getElementById('blow-btn');
    const photoboothBanner = document.getElementById('photobooth-unlock-banner');

    if (flame) flame.style.display = 'none';
    if (hint) hint.textContent = '✨ Lilin telah ditiup! Harapan terindah meluncur untuk Ms. Angela! ✨';
    if (celebrationText) celebrationText.classList.remove('hidden');
    if (photoboothBanner) photoboothBanner.classList.remove('hidden');

    if (blowBtn) {
        blowBtn.innerHTML = '<span>🌟</span> Rayakan Terus! (Tabur Confetti Lagi 🎉)';
    }

    if (window.audioApp) window.audioApp.playChimeBurst();
    launchConfettiBurst(120);
}

/* --------------------------------------------------------------------------
   9. INTERACTIVE WALKING PARADE TOAST NOTIFICATION
-------------------------------------------------------------------------- */
function triggerSpeechPop(text) {
    if (window.audioApp) window.audioApp.playPaperFlipSound();

    const toast = document.getElementById('speech-toast');
    const toastText = document.getElementById('speech-toast-text');
    if (!toast || !toastText) return;

    toastText.textContent = text;
    toast.style.opacity = '1';
    toast.style.transform = 'translate(-50%, 0)';

    if (toastTimeout) clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translate(-50%, 16px)';
    }, 3200);
}

/* --------------------------------------------------------------------------
   10. 2D CONFETTI PARTICLE ENGINE
-------------------------------------------------------------------------- */
const confettiCanvas = document.getElementById('confetti-canvas');
const confettiCtx = confettiCanvas ? confettiCanvas.getContext('2d') : null;
let confettiParticles = [];

function resizeConfettiCanvas() {
    if (!confettiCanvas) return;
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
}

window.addEventListener('resize', resizeConfettiCanvas);

function launchConfettiBurst(count = 50) {
    if (!confettiCanvas) return;
    const colors = ['#FFD166', '#FF6B8B', '#4EA8DE', '#06D6A0', '#9B5DE5', '#FF9F1C', '#FFFFFF'];
    for (let i = 0; i < count; i++) {
        confettiParticles.push({
            x: window.innerWidth / 2 + (Math.random() - 0.5) * 200,
            y: window.innerHeight * 0.42 + (Math.random() - 0.5) * 100,
            vx: (Math.random() - 0.5) * 16,
            vy: -Math.random() * 15 - 5,
            size: Math.random() * 9 + 5,
            color: colors[Math.floor(Math.random() * colors.length)],
            rotation: Math.random() * 360,
            rotationSpeed: (Math.random() - 0.5) * 14,
            gravity: 0.32,
            opacity: 1
        });
    }
}

function updateConfetti() {
    if (confettiCtx && confettiCanvas) {
        confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
        for (let i = confettiParticles.length - 1; i >= 0; i--) {
            const p = confettiParticles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vy += p.gravity;
            p.rotation += p.rotationSpeed;
            p.opacity -= 0.01;

            if (p.opacity <= 0 || p.y > confettiCanvas.height + 30) {
                confettiParticles.splice(i, 1);
                continue;
            }

            confettiCtx.save();
            confettiCtx.globalAlpha = Math.max(0, p.opacity);
            confettiCtx.translate(p.x, p.y);
            confettiCtx.rotate((p.rotation * Math.PI) / 180);
            confettiCtx.fillStyle = p.color;
            confettiCtx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.65);
            confettiCtx.restore();
        }
    }
    requestAnimationFrame(updateConfetti);
}

/* --------------------------------------------------------------------------
   11. INITIALIZATION ON WINDOW LOAD
-------------------------------------------------------------------------- */
window.onload = function () {
    // 1. Initialize 3D Scene
    if (window.initThreeScene) {
        window.initThreeScene();
    }

    // 2. Initialize Audio Manager
    if (window.audioApp) {
        window.audioApp.init();
    }

    // 3. Initialize Photobooth
    if (window.photobooth) {
        window.photobooth.init();
    }

    // 4. Confetti Engine
    resizeConfettiCanvas();
    updateConfetti();

    // 5. Interactions & Data Grids
    initPolaroidTilt();
    renderAacBoard();
    renderStaffEnvelopesGrid();
};

// Expose functions globally for HTML inline onclick calls
window.openBirthdayEnvelope = openBirthdayEnvelope;
window.goToStepPage = goToStepPage;
window.handlePolaroidUpload = handlePolaroidUpload;
window.selectAacSymbol = selectAacSymbol;
window.playAacSentence = playAacSentence;
window.clearAacSentence = clearAacSentence;
window.openStaffLetterModal = openStaffLetterModal;
window.closeLetterPopup = closeLetterPopup;
window.nextPopupLetter = nextPopupLetter;
window.prevPopupLetter = prevPopupLetter;
window.skipStaffTypewriter = skipStaffTypewriter;
window.openAddLetterModal = openAddLetterModal;
window.closeAddLetterModal = closeAddLetterModal;
window.saveNewLetter = saveNewLetter;
window.blowCandleFinale = blowCandleFinale;
window.triggerSpeechPop = triggerSpeechPop;
window.launchConfettiBurst = launchConfettiBurst;
