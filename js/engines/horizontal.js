// KARAGEN - Horizontal Engine
// Horizontal scrolling with centered active word

const HorizontalEngine = {
    init: function (container, words) {
        const state = window.KaraState;
        container.className = 'lyrics-stage';
        container.innerHTML = '<div class="horizontal-stage"><div id="horizontal-wrapper" class="horizontal-container"></div></div>';

        const wrapper = document.getElementById('horizontal-wrapper');
        state.domElements = [];

        words.forEach((w, i) => {
            const el = document.createElement('span');
            el.innerText = w.text;
            el.className = 'horizontal-word';
            el.dataset.index = i;
            wrapper.appendChild(el);
            state.domElements.push(el);
        });
    },

    update: function (time, words) {
        const state = window.KaraState;
        const activeIdx = words.findIndex(w => time >= w.start && time <= w.end);
        const wrapper = document.getElementById('horizontal-wrapper');
        const stage = wrapper.parentElement;

        let targetIdx = activeIdx !== -1 ? activeIdx : (words.findIndex(w => w.start > time) - 1);
        if (targetIdx < 0) targetIdx = 0;

        state.domElements.forEach((el, i) => {
            const distance = Math.abs(i - targetIdx);

            if (i === activeIdx) {
                el.classList.add('active');
            } else {
                el.classList.remove('active');
            }

            el.style.opacity = distance > 5 ? 0.15 : Math.max(0.3, 1 - (distance * 0.15));
        });

        const targetEl = state.domElements[targetIdx];
        if (targetEl && stage) {
            const stageWidth = stage.offsetWidth;
            const desiredX = (stageWidth / 2) - targetEl.offsetLeft - (targetEl.offsetWidth / 2);
            gsap.to(wrapper, { x: desiredX, duration: 0.5, ease: "power2.out" });
        }
    }
};

// Export
if (typeof window !== 'undefined') {
    window.KaraEngines = window.KaraEngines || {};
    window.KaraEngines.horizontal = HorizontalEngine;
}
