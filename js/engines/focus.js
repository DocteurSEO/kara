// KARAGEN - Focus Engine
// Single large word with scale animation

const FocusEngine = {
    init: function (container) {
        container.innerHTML = '<div id="focus-wrapper" class="focus-container"></div>';
    },

    update: function (time, words) {
        const state = window.KaraState;
        const activeIdx = words.findIndex(w => time >= w.start && time <= w.end);
        const wrapper = document.getElementById('focus-wrapper');

        if (activeIdx !== -1 && state.lastRenderedIdx !== activeIdx) {
            state.lastRenderedIdx = activeIdx;
            const w = words[activeIdx];
            wrapper.innerHTML = '';

            const el = document.createElement('div');
            el.innerText = w.text;
            const len = w.text.length;
            const size = len < 5 ? '5rem' : len < 10 ? '3.5rem' : '2.5rem';
            el.className = 'focus-word';
            el.style.fontSize = size;
            el.style.color = '#fff';
            el.style.textShadow = '0 0 30px var(--primary)';
            wrapper.appendChild(el);

            gsap.fromTo(el,
                { scale: 0.5, opacity: 0 },
                { scale: 1, opacity: 1, duration: 0.3, ease: 'back.out(1.5)' }
            );
        }
    }
};

// Export
if (typeof window !== 'undefined') {
    window.KaraEngines = window.KaraEngines || {};
    window.KaraEngines.focus = FocusEngine;
}
