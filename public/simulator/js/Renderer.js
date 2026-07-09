/**
 * Renderer
 * Mengatur logic penggambaran visual di Canvas berdasarkan State yang diberikan.
 */
class Renderer {
    constructor(canvasId, stateManager) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.sm = stateManager;

        // Validasi edge-cases: jika canvas tidak ditemukan, lemparkan error jelas
        if (!this.canvas) {
            throw new Error(`Canvas dengan id '${canvasId}' tidak ditemukan.`);
        }

        // Set initial size
        this.resize();

        // Handle resize graceful
        window.addEventListener('resize', () => {
            this.resize();
            // Force 1 frame render saat di-resize (meskipun sedang pause)
            this.draw(); 
        });

        // Wiring ke StateManager renderPass
        this.sm.on('renderPass', () => this.draw());
    }

    resize() {
        const container = this.canvas.parentElement;
        this.canvas.width = container.clientWidth;
        this.canvas.height = container.clientHeight;

        // Update state ukuran map (agar engine tahu batasnya)
        this.sm.updateState({
            mapWidth: this.canvas.width,
            mapHeight: this.canvas.height
        });
    }

    draw() {
        const state = this.sm.getState();
        const ctx = this.ctx;
        const width = this.canvas.width;
        const height = this.canvas.height;
        const gridSize = state.gridSize;

        // Clear canvas
        ctx.fillStyle = '#222222'; // Base dark retro bg
        ctx.fillRect(0, 0, width, height);

        // Draw Grid Lines (Background)
        ctx.strokeStyle = '#333333';
        ctx.lineWidth = 1;

        ctx.beginPath();
        for (let x = 0; x <= width; x += gridSize) {
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
        }
        for (let y = 0; y <= height; y += gridSize) {
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
        }
        ctx.stroke();

        // Nanti akan menggambar tile jalan dan mobil (Fase 2 & 3)
    }
}
