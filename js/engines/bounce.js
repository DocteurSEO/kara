// KARAGEN - Bounce Engine
// Elastic bounce animation from top

const BounceEngine = {
    init: function (container) {
        container.innerHTML = '<div id="bounce-wrapper" class="bounce-container"></div>';
    },

    update: function (time, words) {
        const state = window.KaraState;
        const activeIdx = words.findIndex(w => time >= w.start && time <= w.end);
        const wrapper = document.getElementById('bounce-wrapper');

        if (activeIdx !== -1 && state.lastRenderedIdx !== activeIdx) {
            state.lastRenderedIdx = activeIdx;
            const w = words[activeIdx];
            wrapper.innerHTML = '';

            const el = document.createElement('div');
            el.className = 'bounce-word';
            el.innerText = w.text;

            // Adjust size based on word length
            const len = w.text.length;
            el.style.fontSize = len < 5 ? '4rem' : len < 10 ? '3rem' : '2rem';

            wrapper.appendChild(el);

            gsap.fromTo(el,
                { y: -100, scale: 1.5, opacity: 0 },
                { y: 0, scale: 1, opacity: 1, duration: 0.4, ease: 'bounce.out' }
            );
        }
    }
};

// Export
if (typeof window !== 'undefined') {
    window.KaraEngines = window.KaraEngines || {};
    window.KaraEngines.bounce = BounceEngine;
}
