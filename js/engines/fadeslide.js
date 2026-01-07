// KARAGEN - Fade Slide Engine
// Words slide in from the side with fade effect

const FadeSlideEngine = {
    init: function (container) {
        container.innerHTML = '<div id="fadeslide-wrapper" class="fadeslide-container"></div>';
    },

    update: function (time, words) {
        const state = window.KaraState;
        const activeIdx = words.findIndex(w => time >= w.start && time <= w.end);
        const wrapper = document.getElementById('fadeslide-wrapper');

        if (activeIdx !== -1 && state.lastRenderedIdx !== activeIdx) {
            state.lastRenderedIdx = activeIdx;
            const w = words[activeIdx];

            // Clear old word with exit animation
            const oldWord = wrapper.querySelector('.fadeslide-word');
            if (oldWord) {
                gsap.to(oldWord, {
                    x: -100,
                    opacity: 0,
                    duration: 0.2,
                    onComplete: () => oldWord.remove()
                });
            }

            // Create new word
            const el = document.createElement('div');
            el.className = 'fadeslide-word';
            el.innerText = w.text;

            const len = w.text.length;
            el.style.fontSize = len < 5 ? '4rem' : len < 10 ? '3rem' : '2rem';

            wrapper.appendChild(el);

            // Animate in from right
            gsap.fromTo(el,
                { x: 100, opacity: 0 },
                { x: 0, opacity: 1, duration: 0.4, ease: 'power2.out' }
            );
        }
    }
};

// Export
if (typeof window !== 'undefined') {
    window.KaraEngines = window.KaraEngines || {};
    window.KaraEngines.fadeslide = FadeSlideEngine;
}
