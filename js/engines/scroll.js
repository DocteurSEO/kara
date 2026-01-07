// KARAGEN - Scroll Engine
// Vertical scrolling list of words

const ScrollEngine = {
    init: function (container, words) {
        const state = window.KaraState;
        container.className = 'lyrics-stage flex-col';
        container.innerHTML = '<div id="scroll-wrapper" class="scroll-container"></div>';

        const wrapper = document.getElementById('scroll-wrapper');
        state.domElements = [];

        words.forEach((w, i) => {
            const el = document.createElement('div');
            el.innerText = w.text;
            el.className = 'scroll-word';
            el.dataset.index = i;
            wrapper.appendChild(el);
            state.domElements.push(el);
        });
    },

    update: function (time, words, stage) {
        const state = window.KaraState;
        const activeIdx = words.findIndex(w => time >= w.start && time <= w.end);
        let targetIdx = activeIdx !== -1 ? activeIdx : (words.findIndex(w => w.start > time) - 1);
        if (targetIdx < 0) targetIdx = 0;

        const wrapper = document.getElementById('scroll-wrapper');

        state.domElements.forEach((el, i) => {
            if (i === activeIdx) el.classList.add('active');
            else el.classList.remove('active');

            const dist = Math.abs(i - targetIdx);
            el.style.opacity = dist > 4 ? 0.1 : 1 - (dist * 0.15);
        });

        const targetEl = state.domElements[targetIdx];
        if (targetEl && stage) {
            const desiredY = (stage.offsetHeight / 2) - (targetEl.offsetTop + targetEl.offsetHeight / 2);
            gsap.to(wrapper, { y: desiredY, duration: 0.5, ease: "power2.out" });
        }
    }
};

// Export
if (typeof window !== 'undefined') {
    window.KaraEngines = window.KaraEngines || {};
    window.KaraEngines.scroll = ScrollEngine;
}
