// KARAGEN - Classic Engine
// Vertical scroll karaoke style

const ClassicEngine = {
    init: function (container, words) {
        const state = window.KaraState;
        container.className = 'lyrics-stage';
        container.innerHTML = '<div class="classic-stage"><div id="classic-wrapper" class="classic-container"></div></div>';

        const wrapper = document.getElementById('classic-wrapper');
        state.domElements = [];
        state.classicLastActive = -1;

        // Pre-render ALL words vertically
        words.forEach((w, i) => {
            const el = document.createElement('div');
            el.innerText = w.text;
            el.className = 'classic-word';
            el.dataset.index = i;
            wrapper.appendChild(el);
            state.domElements.push(el);
        });
    },

    update: function (time, words, stage) {
        const state = window.KaraState;
        const activeIdx = words.findIndex(w => time >= w.start && time <= w.end);
        const wrapper = document.getElementById('classic-wrapper');

        // Find target index
        let targetIdx = activeIdx !== -1 ? activeIdx : (words.findIndex(w => w.start > time) - 1);
        if (targetIdx < 0) targetIdx = 0;

        // Update classes and opacity
        state.domElements.forEach((el, i) => {
            const distance = Math.abs(i - targetIdx);

            if (i === activeIdx) {
                el.classList.add('active');
            } else {
                el.classList.remove('active');
            }

            el.style.opacity = distance > 4 ? 0.15 : Math.max(0.35, 1 - (distance * 0.18));
        });

        // Smooth scroll
        const targetEl = state.domElements[targetIdx];
        if (targetEl && wrapper) {
            const desiredY = -(targetEl.offsetTop - (wrapper.offsetHeight / 2) + (targetEl.offsetHeight / 2));
            gsap.to(wrapper, { y: desiredY, duration: 0.5, ease: "power2.out" });
        }
    }
};

// Export
if (typeof window !== 'undefined') {
    window.KaraEngines = window.KaraEngines || {};
    window.KaraEngines.classic = ClassicEngine;
}
