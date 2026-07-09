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

        // Wiring Speed Controls
        const speedBtns = document.querySelectorAll('.speed-btn');
        speedBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const speed = parseFloat(btn.getAttribute('data-speed'));
                sm.updateState({ speedMultiplier: speed });
            });
        });

        // Wiring Toolbar
        const toolBtns = document.querySelectorAll('.tool-btn');
        toolBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const tool = btn.getAttribute('data-tool');
                sm.updateState({ currentTool: tool });
            });
        });

        // Input Handling for Canvas
        const canvas = document.getElementById('simCanvas');
        let isDrawing = false;

        const handleCanvasInput = (e) => {
            const state = sm.getState();
            if (state.currentTool === 'none') return;

            const rect = canvas.getBoundingClientRect();
            // Kalkulasi koordinat mouse relatif terhadap canvas (bukan viewport)
            // Scaling juga diperhitungkan jika CSS width tidak sama dengan canvas width
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;
            const x = (e.clientX - rect.left) * scaleX;
            const y = (e.clientY - rect.top) * scaleY;

            const gridX = Math.floor(x / state.gridSize);
            const gridY = Math.floor(y / state.gridSize);

            if (state.currentTool === 'road') {
                sm.addTile(gridX, gridY, 'road');
                if (!state.isRunning) renderer.draw(); // Force render jika sedang pause
            } else if (state.currentTool === 'traffic_light') {
                const key = `${gridX},${gridY}`;
                if (state.tiles[key] && state.tiles[key].type === 'road' && !state.trafficLights[key]) {
                    sm.addTrafficLight(gridX, gridY);
                    if (!state.isRunning) renderer.draw();
                }
            } else if (state.currentTool === 'vehicle') {
                const key = `${gridX},${gridY}`;
                if (state.tiles[key] && state.tiles[key].type === 'road') {
                    // Try to add vehicle. StateManager validates if tile is already occupied by a vehicle.
                    const added = sm.addVehicle(gridX, gridY);
                    if (added && !state.isRunning) renderer.draw();
                }
            } else if (state.currentTool === 'eraser') {
                sm.removeTile(gridX, gridY);
                sm.removeTrafficLight(gridX, gridY);
                sm.removeVehicle(gridX, gridY);
                if (!state.isRunning) renderer.draw();
            }
        };

        canvas.addEventListener('mousedown', (e) => {
            isDrawing = true;
            handleCanvasInput(e);
        });

        canvas.addEventListener('mousemove', (e) => {
            if (isDrawing) handleCanvasInput(e);
        });

        canvas.addEventListener('mouseup', () => {
            isDrawing = false;
        });

        canvas.addEventListener('mouseleave', () => {
            isDrawing = false;
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
            const statVehicles = document.getElementById('stat-vehicles');
            if (statVehicles) statVehicles.textContent = state.stats.activeVehicles;

            // Update toolbar active state
            toolBtns.forEach(btn => {
                if (btn.getAttribute('data-tool') === state.currentTool) {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            });

            // Update speed buttons active state
            speedBtns.forEach(btn => {
                if (parseFloat(btn.getAttribute('data-speed')) === state.speedMultiplier) {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            });
        });

        // Trigger render awal (saat pause pertama kali)
        renderer.draw();

        console.log("Simulator Phase 1 (Core Engine) initialized successfully.");
    } catch (error) {
        console.error("Critical Failure during initialization:", error);
        alert("Gagal memuat simulator. Cek konsol untuk detail error.");
    }
});
