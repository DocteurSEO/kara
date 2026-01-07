// KARAGEN - Flash Engine
// Bright flash when word changes

const FlashEngine = {
    init: function (container) {
        container.innerHTML = `
            <div id="flash-overlay" class="flash-overlay"></div>
            <div id="flash-wrapper" class="flash-container"></div>
        `;
    },

    update: function (time, words) {
        const state = window.KaraState;
        const activeIdx = words.findIndex(w => time >= w.start && time <= w.end);
        const wrapper = document.getElementById('flash-wrapper');
        const overlay = document.getElementById('flash-overlay');

        if (activeIdx !== -1 && state.lastRenderedIdx !== activeIdx) {
            state.lastRenderedIdx = activeIdx;
            const w = words[activeIdx];
            wrapper.innerHTML = '';

            // Flash effect
            gsap.fromTo(overlay,
                { opacity: 0.8, backgroundColor: 'white' },
                { opacity: 0, duration: 0.3, ease: 'power2.out' }
            );

            // Create word
            const el = document.createElement('div');
            el.className = 'flash-word';
            el.innerText = w.text;

            const len = w.text.length;
            el.style.fontSize = len < 5 ? '4rem' : len < 10 ? '3rem' : '2rem';

            wrapper.appendChild(el);

            // Word appears with glow
            gsap.fromTo(el,
                { scale: 1.3, opacity: 0, textShadow: '0 0 50px white' },
                {
                    scale: 1,
                    opacity: 1,
                    textShadow: '0 0 20px var(--primary)',
                    duration: 0.3,
                    ease: 'power2.out'
                }
            );
        }
    }
};

// Export
if (typeof window !== 'undefined') {
    window.KaraEngines = window.KaraEngines || {};
    window.KaraEngines.flash = FlashEngine;
}
