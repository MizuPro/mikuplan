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

        // Hitung kepadatan/bottleneck (Heatmap data)
        const congestion = {};
        if (state.vehicles && state.vehicles.length > 0) {
            state.vehicles.forEach(v => {
                // Tambahkan heatmap jika mobil dalam status berhenti
                if (v.isStopped && v.currentKey) {
                    congestion[v.currentKey] = (congestion[v.currentKey] || 0) + 1;
                }
            });
        }

        // Render Tiles
        if (state.tiles) {
            Object.values(state.tiles).forEach(tile => {
                if (tile.type === 'road') {
                    ctx.fillStyle = '#555555'; // road color
                    ctx.fillRect(
                        tile.x * gridSize, 
                        tile.y * gridSize, 
                        gridSize, 
                        gridSize
                    );
                    
                    // Render overlay heatmap jika macet
                    const tileKey = `${tile.x},${tile.y}`;
                    if (congestion[tileKey]) {
                        // Intensitas merah naik seiring jumlah mobil yang berhenti di tile/area tersebut
                        const intensity = Math.min(congestion[tileKey] * 0.3, 0.8); 
                        ctx.fillStyle = `rgba(255, 50, 50, ${intensity})`;
                        ctx.fillRect(
                            tile.x * gridSize, 
                            tile.y * gridSize, 
                            gridSize, 
                            gridSize
                        );
                    }
                }
            });
        }

        // Render Traffic Lights
        if (state.trafficLights) {
            Object.values(state.trafficLights).forEach(light => {
                ctx.beginPath();
                // Draw circle in the middle of the tile
                const cx = (light.x * gridSize) + (gridSize / 2);
                const cy = (light.y * gridSize) + (gridSize / 2);
                const radius = gridSize / 3;
                
                ctx.arc(cx, cy, radius, 0, 2 * Math.PI, false);
                
                if (light.color === 'green') {
                    ctx.fillStyle = '#55ff55';
                } else if (light.color === 'yellow') {
                    ctx.fillStyle = '#ffff55';
                } else if (light.color === 'red') {
                    ctx.fillStyle = '#ff5555';
                }
                
                ctx.fill();
                ctx.lineWidth = 2;
                ctx.strokeStyle = '#222';
                ctx.stroke();
            });
        }

        // Render Vehicles
        if (state.vehicles && state.vehicles.length > 0) {
            state.vehicles.forEach(vehicle => {
                ctx.fillStyle = vehicle.color;
                
                // Centering vehicle in its grid/coordinate
                const offset = (gridSize - vehicle.width) / 2;
                
                ctx.fillRect(
                    vehicle.x + offset,
                    vehicle.y + offset,
                    vehicle.width,
                    vehicle.height
                );
            });
        }
    }
}
