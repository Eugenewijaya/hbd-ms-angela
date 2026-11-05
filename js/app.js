/* ==========================================================================
   app.js — kontroler utama: cover boarding pass, navigasi 4 halaman,
   foto Ms. Angela, kolase 2 kolom doa 11 staf + modal typewriter, harapan & kue.
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
    const ROTS = ["-1.4deg", "1.2deg", "-0.8deg", "1.5deg", "-1.1deg", "0.9deg"];
    const TINTS = ["", "letter--sky", "letter--paper"];

    let currentPage = "ucapan";
    let currentLetter = 0;
    let coverOpened = false;
    let openingTyped = false;

    /* ---------- Inisialisasi nama ---------- */
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

    /* ---------- 2. Navigasi 4 Halaman ---------- */
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

        window.scrollTo({ top: 0, behavior: "smooth" });

        if (pageId === "harapan") {
            SC.fx.burst(40);
        }
    }

    /* ---------- 3. Foto Ms. Angela (Tanpa SVG) ---------- */
    function initPhotoCard() {
        const input = SC.$("#photoInput");
        const img = SC.$("#photoImg");
        const empty = SC.$("#photoEmpty");
        const card = SC.$("#photoCard");

        function showPhoto(src) {
            if (!img) return;
            img.onload = () => {
                img.hidden = false;
                if (empty) empty.hidden = true;
            };
            img.onerror = () => {
                img.hidden = true;
                if (empty) empty.hidden = false;
            };
            img.src = src;
        }

        // Cek apakah ada foto tersimpan di browser
        try {
            const saved = localStorage.getItem("sc_angela_photo");
            if (saved) showPhoto(saved);
        } catch (e) { /* storage dibatasi */ }

        if (input) {
            input.addEventListener("change", (e) => {
                const file = e.target.files && e.target.files[0];
                e.target.value = "";
                if (!file || !file.type.startsWith("image/")) return;
                const reader = new FileReader();
                reader.onload = (ev) => {
                    const dataUrl = ev.target.result;
                    showPhoto(dataUrl);
                    try { localStorage.setItem("sc_angela_photo", dataUrl); } catch (err) { /* kuota penuh */ }
                    SC.audio.chime();
                    SC.fx.burst(40);
                    SC.toast("Foto Ms. Angela berhasil dipasang.");
                };
                reader.readAsDataURL(file);
            });
        }

        // Efek tilt halus pada desktop
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

    /* ---------- 4. Kolase 2 Kolom Menurun (11 Staf) ---------- */
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
            btn.style.setProperty("--lines", i % 3 === 0 ? 4 : 3);
            btn.setAttribute("aria-label", "Buka surat dari " + item.author);

            const stickerSrc = STICKERS[i % STICKERS.length];
            const stickerPos = i % 2 === 0 ? "tr" : "tl";

            btn.innerHTML = `
                <span class="letter__flap" aria-hidden="true"></span>
                <span class="letter__seal" aria-hidden="true">${SC.icon("star")}</span>
                <img class="sticker ${stickerPos}" src="${stickerSrc}" alt="" loading="lazy">
                <span class="letter__no">SURAT ${String(i + 1).padStart(2, "0")} / ${String(SC.staff.length).padStart(2, "0")}</span>
                <span class="letter__name">${SC.esc(item.author)}</span>
                <span class="letter__peek">${SC.esc(item.message)}</span>
                <span class="letter__cta">Buka Surat &rarr;</span>
            `;
            btn.addEventListener("click", () => openLetterModal(i));

            // Baris menurun dalam 2 kolom: genap di kiri, ganjil di kanan
            if (i % 2 === 0) colL.appendChild(btn);
            else colR.appendChild(btn);
        });

        // Tombol tambah surat di kolom kanan (karena 11 item: kiri 6, kanan 5)
        const addBtn = document.createElement("button");
        addBtn.type = "button";
        addBtn.className = "letter letter--add";
        addBtn.innerHTML = `
            <span class="plus" aria-hidden="true">${SC.icon("plus")}</span>
            <span class="letter__name">Tulis Surat Baru</span>
            <span class="letter__no">Tambahkan ucapan ke kolase</span>
        `;
        addBtn.addEventListener("click", openAddModal);
        (SC.staff.length % 2 === 0 ? colL : colR).appendChild(addBtn);
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

    /* ---------- 6. Modal Tambah Surat ---------- */
    function openAddModal() {
        const m = SC.$("#addModal");
        if (!m) return;
        SC.audio.tap();
        m.classList.add("is-open");
        m.setAttribute("aria-hidden", "false");
        const input = SC.$("#addName");
        if (input) setTimeout(() => input.focus(), 60);
    }

    function closeAddModal() {
        const m = SC.$("#addModal");
        if (!m) return;
        m.classList.remove("is-open");
        m.setAttribute("aria-hidden", "true");
    }

    function onAddSubmit(e) {
        e.preventDefault();
        const nameEl = SC.$("#addName");
        const msgEl = SC.$("#addMessage");
        const author = nameEl ? nameEl.value.trim() : "";
        const message = msgEl ? msgEl.value.trim() : "";
        if (!author || !message) {
            SC.toast("Mohon isi nama dan pesan terlebih dahulu.");
            return;
        }
        SC.staff.push({ author, message });
        if (nameEl) nameEl.value = "";
        if (msgEl) msgEl.value = "";
        renderCollage();
        closeAddModal();
        openLetterModal(SC.staff.length - 1);
        SC.fx.burst(45);
    }

    /* ---------- 7. Halaman Harapan & Tiup Lilin ---------- */
    function initWishes() {
        const box = SC.$("#wishesBody");
        if (box && Array.isArray(SC.wishes)) {
            box.innerHTML = SC.wishes.map((p, i) =>
                i === 0 ? `<p class="sign">${SC.esc(p)}</p>` : `<p>${SC.esc(p)}</p>`
            ).join("");
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

    /* ---------- 8. Boot ---------- */
    function init() {
        SC.fx.init();
        SC.audio.init();
        SC.scene.init(SC.$("#scene"));
        initPhotoCard();
        renderCollage();
        initWishes();
        if (SC.booth) SC.booth.init();

        // Event cover
        const openBtn = SC.$("#openBtn");
        const ticket = SC.$("#ticket");
        if (openBtn) openBtn.addEventListener("click", openCover);
        if (ticket) ticket.addEventListener("click", openCover);

        // Skip ketik di halaman 1
        const skipOpen = SC.$("#skipOpeningBtn");
        if (skipOpen) skipOpen.addEventListener("click", () => SC.typewriter.skip());

        // Navigasi
        SC.$$("[data-nav]").forEach((b) => b.addEventListener("click", () => goTo(b.dataset.nav)));
        SC.$$("[data-goto]").forEach((b) => b.addEventListener("click", () => goTo(b.dataset.goto)));

        // Modal surat
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

        // Modal tambah surat
        const closeAdd = SC.$("#closeAddModal");
        const addForm = SC.$("#addForm");
        const addModal = SC.$("#addModal");
        if (closeAdd) closeAdd.addEventListener("click", closeAddModal);
        if (addForm) addForm.addEventListener("submit", onAddSubmit);
        if (addModal) {
            addModal.addEventListener("click", (e) => { if (e.target === addModal) closeAddModal(); });
        }

        // Shortcut keyboard untuk aksesibilitas
        window.addEventListener("keydown", (e) => {
            if (letterModal && letterModal.classList.contains("is-open")) {
                if (e.key === "Escape") closeLetterModal();
                else if (e.key === "ArrowRight") stepLetter(1);
                else if (e.key === "ArrowLeft") stepLetter(-1);
                else if (e.key === " " && SC.typewriter.isTyping()) { e.preventDefault(); SC.typewriter.skip(); }
            } else if (addModal && addModal.classList.contains("is-open") && e.key === "Escape") {
                closeAddModal();
            }
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
