// KARAGEN - Flip Engine
// Word does a 3D flip to appear

const FlipEngine = {
    init: function (container) {
        container.innerHTML = '<div id="flip-wrapper" class="flip-container"></div>';
    },

    update: function (time, words) {
        const state = window.KaraState;
        const activeIdx = words.findIndex(w => time >= w.start && time <= w.end);
        const wrapper = document.getElementById('flip-wrapper');

        if (activeIdx !== -1 && state.lastRenderedIdx !== activeIdx) {
            state.lastRenderedIdx = activeIdx;
            const w = words[activeIdx];

            // Remove old word with flip out
            const oldWord = wrapper.querySelector('.flip-word');
            if (oldWord) {
                gsap.to(oldWord, {
                    rotationX: 90,
                    opacity: 0,
                    duration: 0.2,
                    ease: 'power2.in',
                    onComplete: () => oldWord.remove()
                });
            }

            // Create new word
            const el = document.createElement('div');
            el.className = 'flip-word';
            el.innerText = w.text;

            const len = w.text.length;
            el.style.fontSize = len < 5 ? '4rem' : len < 10 ? '3rem' : '2rem';

            wrapper.appendChild(el);

            // Flip in animation
            gsap.fromTo(el,
                { rotationX: -90, opacity: 0, transformPerspective: 500 },
                { rotationX: 0, opacity: 1, duration: 0.4, ease: 'back.out(1.5)' }
            );
        }
    }
};

// Export
if (typeof window !== 'undefined') {
    window.KaraEngines = window.KaraEngines || {};
    window.KaraEngines.flip = FlipEngine;
}
