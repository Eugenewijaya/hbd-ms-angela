/* ==========================================================================
   TYPEWRITER.JS - Snappy, Interactive Typewriter Effect Engine
   ========================================================================== */

(function () {
    let currentTypingTimer = null;
    let isCurrentlyTyping = false;
    let currentFullText = "";
    let currentTargetElement = null;
    let onCompleteCallback = null;

    /**
     * Start typing effect on an element
     * @param {HTMLElement|string} target - DOM Element or ID
     * @param {string} text - Text to type out
     * @param {Object} options - { speed: 20, enableSound: true, onComplete: fn }
     */
    function typeText(target, text, options = {}) {
        const el = typeof target === 'string' ? document.getElementById(target) : target;
        if (!el) return;

        // Stop any active typing
        stopTyping();

        currentTargetElement = el;
        currentFullText = text;
        onCompleteCallback = options.onComplete || null;
        isCurrentlyTyping = true;

        const speed = options.speed || 18; // snappy ms per character
        const enableSound = options.enableSound !== false;

        el.innerHTML = '<span class="typewriter-content"></span><span class="typewriter-cursor"></span>';
        const contentSpan = el.querySelector('.typewriter-content');

        let charIndex = 0;

        function step() {
            if (!isCurrentlyTyping) return;

            if (charIndex < currentFullText.length) {
                const char = currentFullText.charAt(charIndex);
                if (char === '\n') {
                    contentSpan.appendChild(document.createElement('br'));
                } else {
                    contentSpan.appendChild(document.createTextNode(char));
                }
                charIndex++;

                // Optional subtle typewriter audio (every 3 characters to be pleasant)
                if (enableSound && charIndex % 3 === 0 && window.audioApp) {
                    window.audioApp.playTypewriterClickSound();
                }

                currentTypingTimer = setTimeout(step, speed);
            } else {
                finishTyping();
            }
        }

        step();
    }

    /**
     * Immediately finish typing and display full text
     */
    function skipTyping() {
        if (!isCurrentlyTyping || !currentTargetElement) return;
        stopTyping();
        const formatted = currentFullText.replace(/\n/g, '<br>');
        currentTargetElement.innerHTML = `<span class="typewriter-content">${formatted}</span>`;
        if (typeof onCompleteCallback === 'function') {
            onCompleteCallback();
        }
    }

    function stopTyping() {
        if (currentTypingTimer) {
            clearTimeout(currentTypingTimer);
            currentTypingTimer = null;
        }
        isCurrentlyTyping = false;
    }

    function finishTyping() {
        stopTyping();
        // Remove blinking cursor after 1.5s
        if (currentTargetElement) {
            const cursor = currentTargetElement.querySelector('.typewriter-cursor');
            if (cursor) {
                setTimeout(() => {
                    if (cursor && cursor.parentNode) {
                        cursor.remove();
                    }
                }, 1500);
            }
        }
        if (typeof onCompleteCallback === 'function') {
            onCompleteCallback();
        }
    }

    // Expose Global API
    window.typewriter = {
        type: typeText,
        skip: skipTyping,
        stop: stopTyping,
        isTyping: () => isCurrentlyTyping
    };
})();
