// KARAGEN - Main Application
// Entry point and event handlers

(function () {
    'use strict';

    const state = window.KaraState;
    const utils = window.KaraUtils;
    const visualizer = window.KaraVisualizer;
    const engines = window.KaraEngines;

    // UI References
    const ui = {
        stage: document.getElementById('lyrics-stage'),
        inputs: {
            audio: document.getElementById('input-audio'),
            json: document.getElementById('input-json'),
            video: document.getElementById('input-video'),
            anim: document.getElementById('select-animation')
        },
        labels: {
            audio: document.getElementById('label-audio'),
            json: document.getElementById('label-json'),
            video: document.getElementById('label-video')
        },
        video: document.getElementById('bg-layer-video'),
        audio: document.getElementById('audio-player'),
        setup: document.getElementById('setup-screen'),
        app: document.getElementById('ui-layer'),
        progress: document.getElementById('progress-fill'),
        seekBar: document.getElementById('seek-bar'),
        btnPlay: document.getElementById('btn-play-pause'),
        btnRec: document.getElementById('btn-export')
    };

    // --- MAIN LOOP ---
    function loop() {
        requestAnimationFrame(loop);

        // Progress bar
        if (!ui.audio.paused) {
            const pct = (ui.audio.currentTime / ui.audio.duration * 100) || 0;
            ui.progress.style.width = pct + "%";
        }

        // Visualizer
        visualizer.renderVisuals();

        // Lyrics engine
        const syncedTime = ui.audio.currentTime + state.syncOffset;
        const engine = engines[state.mode];
        if (engine && engine.update) {
            engine.update(syncedTime, state.words, ui.stage);
        }
    }

    // --- EVENT HANDLERS ---

    // Play/Pause
    ui.btnPlay.onclick = () => {
        if (ui.audio.paused) {
            ui.audio.play();
            ui.btnPlay.innerText = "⏸";
            state.isPlaying = true;
        } else {
            ui.audio.pause();
            ui.btnPlay.innerText = "▶";
            state.isPlaying = false;
        }
    };

    // Seek
    ui.seekBar.onclick = (e) => {
        const rect = ui.seekBar.getBoundingClientRect();
        const pos = (e.clientX - rect.left) / rect.width;
        ui.audio.currentTime = pos * ui.audio.duration;
    };

    // Restart
    document.getElementById('btn-restart').onclick = () => {
        ui.audio.currentTime = 0;
        ui.audio.play();
        ui.btnPlay.innerText = "⏸";
    };

    // Sync offset
    const syncValueEl = document.getElementById('sync-value');

    function updateSyncDisplay() {
        const sign = state.syncOffset >= 0 ? '+' : '';
        syncValueEl.innerText = sign + state.syncOffset.toFixed(1) + 's';
    }

    document.getElementById('btn-sync-minus').onclick = () => {
        state.syncOffset -= 0.1;
        updateSyncDisplay();
    };

    document.getElementById('btn-sync-plus').onclick = () => {
        state.syncOffset += 0.1;
        updateSyncDisplay();
    };

    // Fullscreen
    document.getElementById('btn-fullscreen').onclick = () => {
        const wrapper = document.getElementById('phone-wrapper');
        if (!document.fullscreenElement) {
            wrapper.requestFullscreen().catch(err => console.error('Fullscreen error:', err));
        } else {
            document.exitFullscreen();
        }
    };

    // Color picker (primary)
    document.querySelectorAll('#color-picker .color-option').forEach(option => {
        option.onclick = () => {
            document.querySelectorAll('#color-picker .color-option').forEach(o => o.classList.remove('selected'));
            option.classList.add('selected');
            state.primaryColor = option.dataset.color;
            document.documentElement.style.setProperty('--primary', state.primaryColor);
        };
    });

    // Wave color picker
    document.querySelectorAll('#wave-color-picker .color-option').forEach(option => {
        option.onclick = () => {
            document.querySelectorAll('#wave-color-picker .color-option').forEach(o => o.classList.remove('selected'));
            option.classList.add('selected');
            state.waveColor = option.dataset.color;
        };
    });

    // Toggle controls
    const btnToggle = document.getElementById('btn-toggle-controls');
    const controlsPanel = document.getElementById('controls');
    let controlsVisible = true;

    btnToggle.onclick = () => {
        controlsVisible = !controlsVisible;
        if (controlsVisible) {
            controlsPanel.classList.remove('hidden');
            btnToggle.classList.add('controls-visible');
        } else {
            controlsPanel.classList.add('hidden');
            btnToggle.classList.remove('controls-visible');
        }
    };

    // Export / Recording
    ui.btnRec.onclick = async () => {
        if (state.isRecording) {
            state.recorder.stop();
            ui.btnRec.innerHTML = "<span>🔴</span> REC";
            ui.btnRec.classList.remove('bg-red-600');
            ui.btnRec.classList.add('bg-purple-600');
            state.isRecording = false;
        } else {
            try {
                alert("Choisissez l'onglet 'KARAGEN' dans la fenêtre suivante.");
                const stream = await navigator.mediaDevices.getDisplayMedia({
                    video: { displaySurface: "browser" },
                    audio: true
                });

                state.recorder = new MediaRecorder(stream);
                state.recordedChunks = [];

                state.recorder.ondataavailable = (e) => {
                    if (e.data.size > 0) state.recordedChunks.push(e.data);
                };

                state.recorder.onstop = () => {
                    const blob = new Blob(state.recordedChunks, { type: "video/mp4" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.style.display = "none";
                    a.href = url;
                    a.download = "karaoke_export.mp4";
                    document.body.appendChild(a);
                    a.click();
                    window.URL.revokeObjectURL(url);
                    stream.getTracks().forEach(track => track.stop());
                };

                state.recorder.start();
                state.isRecording = true;
                ui.btnRec.innerHTML = "<span>⏹</span> STOP";
                ui.btnRec.classList.remove('bg-purple-600');
                ui.btnRec.classList.add('bg-red-600');

                if (ui.audio.paused) ui.btnPlay.click();

            } catch (e) {
                console.error(e);
                alert("Erreur d'enregistrement: " + e.message);
            }
        }
    };

    // File inputs
    ui.inputs.audio.onchange = (e) => {
        ui.labels.audio.innerText = e.target.files[0]?.name || "...";
    };

    ui.inputs.json.onchange = (e) => {
        ui.labels.json.innerText = e.target.files[0]?.name || "...";
    };

    ui.inputs.video.onchange = (e) => {
        const f = e.target.files[0];
        if (f) {
            ui.video.src = URL.createObjectURL(f);
            ui.video.classList.remove('hidden');
            ui.labels.video.innerText = f.name;
        }
    };

    // START button
    document.getElementById('btn-start').onclick = async () => {
        const fa = ui.inputs.audio.files[0];
        const fj = ui.inputs.json.files[0];
        if (!fa || !fj) return alert("Fichier manquant");

        // Get settings
        state.mode = ui.inputs.anim.value;
        state.waveType = document.getElementById('select-wave-type').value;

        // Parse lyrics
        const text = await fj.text();
        state.words = utils.parseContent(text, fj.name.endsWith('.json'));

        // Setup audio
        ui.audio.src = URL.createObjectURL(fa);
        if (ui.video.src) ui.video.play();

        // Show app
        ui.setup.style.display = 'none';
        ui.app.style.display = 'flex';

        // Initialize
        visualizer.initAudio(ui.audio);
        visualizer.initVisuals();

        // Initialize engine
        const engine = engines[state.mode];
        if (engine && engine.init) {
            engine.init(ui.stage, state.words);
        }

        // Start playback
        ui.audio.play();
        state.isPlaying = true;

        // Start loop
        loop();
    };

})();
