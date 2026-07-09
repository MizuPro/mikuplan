/**
 * Main Entry Point
 * Melakukan Context-First Wiring, menghubungkan StateManager, UI, Engine, dan Renderer.
 */
document.addEventListener("DOMContentLoaded", () => {
    try {
        // Ambil instance global StateManager
        const sm = window.simState;
        
        // Inisiasi Renderer dan Engine
        const renderer = new Renderer('simCanvas', sm);
        const engine = new Engine(sm);

        // Wiring UI Controls
        const btnPlay = document.getElementById('btn-play');
        const btnPause = document.getElementById('btn-pause');
        const statusInd = document.getElementById('status-indicator');
        const statFps = document.getElementById('stat-fps');
        
        btnPlay.addEventListener('click', () => {
            engine.start();
        });

        btnPause.addEventListener('click', () => {
            engine.pause();
        });

        // Dengarkan perubahan state untuk update UI secara reaktif
        sm.on('stateChanged', (state) => {
            if (state.isRunning) {
                statusInd.textContent = "Running";
                statusInd.classList.add("running");
            } else {
                statusInd.textContent = "Paused";
                statusInd.classList.remove("running");
            }

            // Update stats
            statFps.textContent = state.stats.fps;
        });

        // Trigger render awal (saat pause pertama kali)
        renderer.draw();

        console.log("Simulator Phase 1 (Core Engine) initialized successfully.");
    } catch (error) {
        console.error("Critical Failure during initialization:", error);
        alert("Gagal memuat simulator. Cek konsol untuk detail error.");
    }
});
