// KARAGEN - Typewriter Engine
// Character by character reveal

const TypewriterEngine = {
    init: function (container) {
        container.innerHTML = '<div id="typewriter-wrapper" class="typewriter-container"></div>';
    },

    update: function (time, words) {
        const state = window.KaraState;
        const activeIdx = words.findIndex(w => time >= w.start && time <= w.end);
        const wrapper = document.getElementById('typewriter-wrapper');

        if (activeIdx !== -1 && state.lastRenderedIdx !== activeIdx) {
            state.lastRenderedIdx = activeIdx;
            const w = words[activeIdx];
            wrapper.innerHTML = '';

            const wordEl = document.createElement('div');
            wordEl.className = 'typewriter-word';

            // Create individual character spans
            w.text.split('').forEach((char, i) => {
                const charSpan = document.createElement('span');
                charSpan.className = 'typewriter-char';
                charSpan.innerText = char;
                wordEl.appendChild(charSpan);

                gsap.to(charSpan, {
                    opacity: 1,
                    delay: i * 0.05,
                    duration: 0.1,
                    ease: 'power2.out',
                    onStart: () => charSpan.classList.add('visible')
                });
            });

            wrapper.appendChild(wordEl);
        }
    }
};

// Export
if (typeof window !== 'undefined') {
    window.KaraEngines = window.KaraEngines || {};
    window.KaraEngines.typewriter = TypewriterEngine;
}
