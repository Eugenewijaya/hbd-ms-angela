/* ==========================================================================
   app.js — kontroler utama: cover boarding pass, navigasi bertahap (step dock
   muncul di akhir), foto Ms. Angela, kolase 2 kolom amplop tertutup 11 staf +
   modal typewriter, serta halaman harapan & kue.
   ========================================================================== */
(function () {
    const SC = (window.SC = window.SC || {});

    const STICKERS = [
        "assets/stickers/asterisk-navy.png",
        "assets/stickers/asterisk-sky.png",
        "assets/stickers/starburst.png",
        "assets/stickers/bolt.png",
        "assets/stickers/star.png",
        "assets/stickers/plane.png"
    ];
    const ROTS = ["-1.3deg", "1.1deg", "-0.7deg", "1.4deg", "-1.0deg", "0.8deg"];
    const TINTS = ["", "letter--sky", "letter--paper"];

    let currentPage = "ucapan";
    let currentLetter = 0;
    let coverOpened = false;
    let openingTyped = false;
    let allUnlocked = false;

    /* ---------- Inisial nama ---------- */
    function initials(name) {
        const clean = String(name).replace(/^(Miss|Ms\.?|Mr\.?|Aa|Teh)\s+/i, "").trim();
        const parts = clean.split(/\s+/);
        return (parts[0] ? parts[0][0] : "S") + (parts[1] ? parts[1][0] : "");
    }

    /* ---------- 1. Cover Boarding Pass ---------- */
    function openCover() {
        if (coverOpened) return;
        coverOpened = true;

        const cover = SC.$("#cover");
        SC.audio.open();
        SC.audio.play();
        SC.fx.burst(75);
        SC.scene.setTheme("page");

        if (cover) cover.classList.add("is-opening");

        setTimeout(() => {
            document.body.classList.remove("is-cover");
            if (cover) cover.classList.add("is-gone");
            startOpeningNote();
        }, 620);
    }

    function startOpeningNote() {
        if (openingTyped) return;
        openingTyped = true;
        const el = SC.$("#openingType");
        const skipBtn = SC.$("#skipOpeningBtn");
        if (!el) return;
        if (skipBtn) skipBtn.hidden = false;
        SC.typewriter.type(el, SC.opening, {
            speed: 16,
            done() {
                if (skipBtn) skipBtn.hidden = true;
            }
        });
    }

    /* ---------- 2. Navigasi 4 Halaman (Dock muncul di akhir) ---------- */
    function goTo(pageId) {
        if (!pageId || pageId === currentPage) return;
        if (currentPage === "photobooth" && pageId !== "photobooth" && SC.booth) {
            SC.booth.leave();
        }
        currentPage = pageId;
        SC.audio.flip();

        SC.$$(".page").forEach((sec) => {
            sec.classList.toggle("is-active", sec.dataset.page === pageId);
        });
        SC.$$("[data-nav]").forEach((btn) => {
            if (btn.dataset.nav === pageId) btn.setAttribute("aria-current", "page");
            else btn.removeAttribute("aria-current");
        });

        // Munculkan navigasi 01..04 di footer HANYA setelah mencapai halaman terakhir (Photobooth)
        if (pageId === "photobooth" && !allUnlocked) {
            allUnlocked = true;
            const dock = SC.$("#stepDock");
            if (dock) dock.hidden = false;
        }

        window.scrollTo({ top: 0, behavior: "smooth" });

        if (pageId === "harapan") {
            SC.fx.burst(55);
        }
    }

    /* ---------- 3. Foto Profil Ms. Angela (Tampil Penuh dari Aset) ---------- */
    function initPhotoCard() {
        const card = SC.$("#photoCard");
        try { localStorage.removeItem("sc_angela_photo"); } catch (e) { /* storage dibatasi */ }

        if (card && window.matchMedia("(pointer: fine)").matches && !SC.reducedMotion) {
            card.addEventListener("pointermove", (e) => {
                const r = card.getBoundingClientRect();
                const x = (e.clientX - r.left) / r.width - 0.5;
                const y = (e.clientY - r.top) / r.height - 0.5;
                card.style.transform = `perspective(800px) rotateX(${(-y * 6).toFixed(2)}deg) rotateY(${(x * 6).toFixed(2)}deg)`;
            });
            card.addEventListener("pointerleave", () => {
                card.style.transform = "";
            });
        }
    }

    /* ---------- 4. Kolase 2 Kolom Menurun (11 Amplop Surat Tertutup) ---------- */
    function renderCollage() {
        const colL = SC.$("#colLeft");
        const colR = SC.$("#colRight");
        if (!colL || !colR) return;
        colL.innerHTML = "";
        colR.innerHTML = "";

        SC.staff.forEach((item, i) => {
            const btn = document.createElement("button");
            btn.type = "button";
            const tint = TINTS[i % TINTS.length];
            btn.className = "letter" + (tint ? " " + tint : "");
            btn.style.setProperty("--rot", ROTS[i % ROTS.length]);
            btn.style.setProperty("--i", i);
            btn.setAttribute("aria-label", "Buka surat dari " + item.author);

            const stickerSrc = STICKERS[i % STICKERS.length];
            const stickerPos = i % 2 === 0 ? "tr" : "tl";

            btn.innerHTML = `
                <span class="letter__flap" aria-hidden="true"></span>
                <span class="letter__seal" aria-hidden="true">${SC.icon("star")}</span>
                <img class="sticker ${stickerPos}" src="${stickerSrc}" alt="" loading="lazy">
                <span class="letter__no">SURAT #${String(i + 1).padStart(2, "0")}</span>
                <span class="letter__from">DARI</span>
                <span class="letter__name">${SC.esc(item.author)}</span>
                <span class="letter__cta">Buka Surat &rarr;</span>
            `;
            btn.addEventListener("click", () => openLetterModal(i));

            if (i % 2 === 0) colL.appendChild(btn);
            else colR.appendChild(btn);
        });
    }

    /* ---------- 5. Modal Surat Staf (Typewriter) ---------- */
    function openLetterModal(idx) {
        currentLetter = (idx + SC.staff.length) % SC.staff.length;
        const modal = SC.$("#letterModal");
        if (!modal) return;
        modal.classList.add("is-open");
        modal.setAttribute("aria-hidden", "false");
        SC.audio.open();
        updateLetterModal();
    }

    function updateLetterModal() {
        const item = SC.staff[currentLetter];
        if (!item) return;
        const countEl = SC.$("#modalCount");
        const nameEl = SC.$("#modalName");
        const avatarEl = SC.$("#modalAvatar");
        const bodyEl = SC.$("#modalMessage");
        const skipBtn = SC.$("#skipTypeBtn");

        if (countEl) countEl.textContent = `SURAT ${String(currentLetter + 1).padStart(2, "0")} / ${String(SC.staff.length).padStart(2, "0")}`;
        if (nameEl) nameEl.textContent = item.author;
        if (avatarEl) avatarEl.textContent = initials(item.author).toUpperCase();
        if (skipBtn) skipBtn.hidden = false;

        if (bodyEl) {
            SC.typewriter.type(bodyEl, item.message, {
                speed: 15,
                done() {
                    if (skipBtn) skipBtn.hidden = true;
                }
            });
        }
    }

    function closeLetterModal() {
        const modal = SC.$("#letterModal");
        if (!modal || !modal.classList.contains("is-open")) return;
        SC.typewriter.stop();
        SC.audio.tap();
        modal.classList.remove("is-open");
        modal.setAttribute("aria-hidden", "true");
    }

    function stepLetter(dir) {
        SC.audio.flip();
        currentLetter = (currentLetter + dir + SC.staff.length) % SC.staff.length;
        updateLetterModal();
    }

    /* ---------- 6. Halaman Harapan & Tiup Lilin ---------- */
    function initWishes() {
        const box = SC.$("#wishesBody");
        if (box && Array.isArray(SC.wishes)) {
            const last = SC.wishes.length - 1;
            box.innerHTML = SC.wishes.map((p, i) => {
                if (i === 0) return `<p class="sign">${SC.esc(p)}</p>`;
                if (i === last) return `<p class="quote">&ldquo;${SC.esc(p)}&rdquo;</p>`;
                return `<p>${SC.esc(p)}</p>`;
            }).join("");
        }

        const cake = SC.$("#cakeBox");
        const blowBtn = SC.$("#blowBtn");
        const hint = SC.$("#cakeHint");
        const unlock = SC.$("#unlockBanner");

        function blow() {
            if (!cake) return;
            const already = cake.classList.contains("is-out");
            cake.classList.add("is-out");
            if (hint) hint.textContent = "Lilin sudah ditiup — selamat ulang tahun, Ms. Angela!";
            if (blowBtn) blowBtn.querySelector("span").textContent = already ? "Tabur Confetti Lagi" : "Rayakan Lagi";
            if (unlock) unlock.classList.add("is-on");
            SC.audio.chime();
            SC.fx.burst(110);
        }

        if (blowBtn) blowBtn.addEventListener("click", blow);
        if (cake) {
            const svg = cake.querySelector(".cake__svg");
            if (svg) {
                svg.style.cursor = "pointer";
                svg.addEventListener("click", blow);
            }
        }
    }

    /* ---------- 7. Boot ---------- */
    function init() {
        SC.fx.init();
        SC.audio.init();
        SC.scene.init(SC.$("#scene"));
        initPhotoCard();
        renderCollage();
        initWishes();
        if (SC.booth) SC.booth.init();

        const openBtn = SC.$("#openBtn");
        const ticket = SC.$("#ticket");
        if (openBtn) openBtn.addEventListener("click", openCover);
        if (ticket) ticket.addEventListener("click", openCover);

        const skipOpen = SC.$("#skipOpeningBtn");
        if (skipOpen) skipOpen.addEventListener("click", () => SC.typewriter.skip());

        SC.$$("[data-nav]").forEach((b) => b.addEventListener("click", () => goTo(b.dataset.nav)));
        SC.$$("[data-goto]").forEach((b) => b.addEventListener("click", () => goTo(b.dataset.goto)));

        const closeBtn = SC.$("#closeModal");
        const prevBtn = SC.$("#prevLetter");
        const nextBtn = SC.$("#nextLetter");
        const skipBtn = SC.$("#skipTypeBtn");
        const letterModal = SC.$("#letterModal");
        if (closeBtn) closeBtn.addEventListener("click", closeLetterModal);
        if (prevBtn) prevBtn.addEventListener("click", () => stepLetter(-1));
        if (nextBtn) nextBtn.addEventListener("click", () => stepLetter(1));
        if (skipBtn) skipBtn.addEventListener("click", () => SC.typewriter.skip());
        if (letterModal) {
            letterModal.addEventListener("click", (e) => { if (e.target === letterModal) closeLetterModal(); });
        }

        window.addEventListener("keydown", (e) => {
            if (letterModal && letterModal.classList.contains("is-open")) {
                if (e.key === "Escape") closeLetterModal();
                else if (e.key === "ArrowRight") stepLetter(1);
                else if (e.key === "ArrowLeft") stepLetter(-1);
                else if (e.key === " " && SC.typewriter.isTyping()) { e.preventDefault(); SC.typewriter.skip(); }
            }
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
