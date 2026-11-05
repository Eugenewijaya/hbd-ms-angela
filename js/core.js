/* ==========================================================================
   core.js — namespace SC, helper kecil, toast, deteksi performa perangkat
   ========================================================================== */
(function () {
    const SC = (window.SC = window.SC || {});

    SC.$ = (sel, root) => (root || document).querySelector(sel);
    SC.$$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));

    SC.esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

    SC.icon = (name, cls) => `<svg class="i ${cls || ""}" aria-hidden="true"><use href="#i-${name}"/></svg>`;

    SC.reducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    /** Perkiraan kemampuan perangkat -> dipakai untuk menurunkan beban animasi 3D */
    SC.tier = (function () {
        const cores = navigator.hardwareConcurrency || 4;
        const mem = navigator.deviceMemory || 4;
        const saveData = navigator.connection && navigator.connection.saveData;
        return cores <= 4 || mem <= 3 || saveData ? "low" : "high";
    })();

    SC.wait = (ms) => new Promise((r) => setTimeout(r, ms));

    /* ---------- Toast ---------- */
    let toastTimer = 0;
    SC.toast = function (msg, ms) {
        const el = SC.$("#toast");
        if (!el) return;
        el.textContent = msg;
        el.classList.add("is-on");
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => el.classList.remove("is-on"), ms || 3200);
    };
})();
