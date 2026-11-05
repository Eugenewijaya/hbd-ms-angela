/* ==========================================================================
   typewriter.js — efek mengetik. Aman untuk emoji (iterasi per code point).
   ========================================================================== */
(function () {
    const SC = (window.SC = window.SC || {});

    let timer = 0, active = null; // { el, chars, node, caret, i, speed, done }

    function pause(ch) {
        if (ch === "\n") return 220;
        if (ch === "." || ch === "!" || ch === "?") return 170;
        if (ch === ",") return 80;
        return 0;
    }

    function stop() {
        clearTimeout(timer);
        timer = 0;
    }

    function finish() {
        if (!active) return;
        stop();
        const a = active;
        a.node.data = a.chars.join("");
        if (a.caret.parentNode) a.caret.remove();
        active = null;
        if (a.done) a.done();
    }

    /**
     * @param {HTMLElement} el
     * @param {string} text
     * @param {{speed?:number, done?:Function}} [opts]
     */
    function type(el, text, opts) {
        stop();
        if (active && active.caret.parentNode) active.caret.remove();
        opts = opts || {};
        const chars = Array.from(text);
        el.textContent = "";
        el.setAttribute("aria-label", text);

        if (SC.reducedMotion) {
            el.textContent = text;
            if (opts.done) opts.done();
            return;
        }

        const node = document.createTextNode("");
        const caret = document.createElement("span");
        caret.className = "type-caret";
        caret.setAttribute("aria-hidden", "true");
        el.append(node, caret);

        const speed = opts.speed || (chars.length > 400 ? 14 : 20);
        active = { el, chars, node, caret, i: 0, speed, done: opts.done };

        (function step() {
            const a = active;
            if (!a || a.node !== node) return;
            // ketik 1–2 karakter per tick agar tetap halus di teks panjang
            const n = a.chars.length > 500 ? 2 : 1;
            let extra = 0;
            for (let k = 0; k < n && a.i < a.chars.length; k++) {
                const ch = a.chars[a.i++];
                a.node.data += ch;
                extra += pause(ch);
            }
            if (a.i >= a.chars.length) return finish();
            timer = setTimeout(step, a.speed + extra);
        })();
    }

    SC.typewriter = { type, skip: finish, stop: () => { stop(); if (active && active.caret.parentNode) active.caret.remove(); active = null; }, isTyping: () => !!active };
})();
