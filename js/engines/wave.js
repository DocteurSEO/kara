// KARAGEN - Wave Engine
// Smooth wave effect with active word highlight

const WaveEngine = {
    init: function (container, words) {
        const state = window.KaraState;
        container.innerHTML = '<div id="wave-wrapper" class="wave-container"></div>';

        const wrapper = document.getElementById('wave-wrapper');
        state.domElements = [];
        state.waveLastActive = -1;

        words.forEach((w, i) => {
            const el = document.createElement('span');
            el.innerText = w.text;
            el.className = 'wave-word';
            el.dataset.index = i;
            wrapper.appendChild(el);
            state.domElements.push(el);
        });
    },

    update: function (time, words) {
        const state = window.KaraState;
        const activeIdx = words.findIndex(w => time >= w.start && time <= w.end);

        // Only animate when active word changes
        if (activeIdx !== state.waveLastActive) {
            state.waveLastActive = activeIdx;

            state.domElements.forEach((el, i) => {
                const isActive = i === activeIdx;
                const distance = Math.abs(i - (activeIdx === -1 ? 0 : activeIdx));

                if (isActive) {
                    el.classList.add('active');
                    gsap.to(el, {
                        y: -15,
                        scale: 1.15,
                        duration: 0.3,
                        ease: 'power2.out'
                    });
                } else {
                    el.classList.remove('active');
                    gsap.to(el, {
                        y: 0,
                        scale: 1,
                        duration: 0.4,
                        ease: 'power2.out'
                    });
                }

                const newOpacity = distance > 6 ? 0.2 : Math.max(0.3, 1 - (distance * 0.12));
                gsap.to(el, { opacity: newOpacity, duration: 0.3 });
            });
        }
    }
};

// Export
if (typeof window !== 'undefined') {
    window.KaraEngines = window.KaraEngines || {};
    window.KaraEngines.wave = WaveEngine;
}
