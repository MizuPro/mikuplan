/**
 * Engine
 * Menangani Game Loop utama, pengaturan waktu (tick rate) dan FPS calculation.
 */
class Engine {
    constructor(stateManager) {
        this.sm = stateManager;
        this.lastTime = performance.now();
        this.deltaTime = 0;
        this.fpsTimer = 0;
        this.frames = 0;
        this.animationFrameId = null;

        // Graceful handling: jeda saat tab disembunyikan
        document.addEventListener("visibilitychange", () => {
            if (document.hidden) {
                this.pause();
                console.log("Tab is hidden, pausing engine gracefully.");
            }
        });
    }

    start() {
        if (!this.sm.getState().isRunning) {
            this.sm.updateState({ isRunning: true });
            this.lastTime = performance.now();
            this.loop();
        }
    }

    pause() {
        if (this.sm.getState().isRunning) {
            this.sm.updateState({ isRunning: false });
            if (this.animationFrameId) {
                cancelAnimationFrame(this.animationFrameId);
                this.animationFrameId = null;
            }
        }
    }

    loop() {
        const now = performance.now();
        this.deltaTime = (now - this.lastTime) / 1000; // in seconds
        this.lastTime = now;

        // FPS Calculation
        this.frames++;
        this.fpsTimer += this.deltaTime;
        if (this.fpsTimer >= 1.0) {
            this.sm.updateState({ 
                stats: { 
                    ...this.sm.getState().stats,
                    fps: this.frames 
                } 
            });
            this.frames = 0;
            this.fpsTimer = 0;
        }

        // Logic Tick (akan diimplementasikan di Fase 3 untuk Physics & AI)
        this.tick(this.deltaTime);

        // Render pass trigger via Event (Context Wiring)
        this.sm.emit('renderPass', this.deltaTime);

        // Lanjut ke frame berikutnya jika masih running
        if (this.sm.getState().isRunning) {
            this.animationFrameId = requestAnimationFrame(() => this.loop());
        }
    }

    tick(dt) {
        // AI / Physics update placeholder
        // Pada MVP fase awal, kita pastikan function ini error-safe
        try {
            // Logika gerak mobil nanti disini
        } catch (error) {
            console.error("Simulation tick error (Anti Happy-Path caught this):", error);
        }
    }
}
