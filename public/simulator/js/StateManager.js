/**
 * StateManager
 * Bertanggung jawab atas penyimpanan state simulasi secara client-side
 * dan mengimplementasikan Observer Pattern / Event Emitter sederhana.
 */
class StateManager {
    constructor() {
        this.state = {
            isRunning: false,
            gridSize: 32,
            mapWidth: 0,
            mapHeight: 0,
            vehicles: [],
            tiles: {}, // Using object dictionary for O(1) grid lookups "x,y"
            trafficLights: {}, // "x,y" -> { x, y, color: 'green', timer: 0 }
            stats: {
                fps: 0,
                activeVehicles: 0
            },
            currentTool: 'none', // 'none', 'road', 'traffic_light', 'eraser'
            speedMultiplier: 1
        };
        this.listeners = {};
    }

    // Mendengarkan event tertentu
    on(event, callback) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(callback);
    }

    // Memicu event untuk memberi tahu komponen upstream/downstream
    emit(event, data) {
        if (this.listeners[event]) {
            this.listeners[event].forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in listener for event ${event}:`, error);
                }
            });
        }
    }

    // Mengambil state terkini (read-only copy lebih aman, tapi untuk FPS kita kembalikan ref langsung sementara)
    getState() {
        return this.state;
    }

    // Mengubah state dan memancarkan event perubahan
    updateState(updates) {
        if (!updates || typeof updates !== 'object') {
            console.warn("Invalid state update rejected:", updates);
            return;
        }

        this.state = { ...this.state, ...updates };
        this.emit('stateChanged', this.state);
    }

    // --- Helper Methods untuk Mutasi Terkontrol ---

    addTile(gridX, gridY, type) {
        const key = `${gridX},${gridY}`;
        // Jangan mutasi state langsung, buat copy untuk reaktivitas
        const newTiles = { ...this.state.tiles };
        newTiles[key] = { x: gridX, y: gridY, type: type };
        this.updateState({ tiles: newTiles });
    }

    removeTile(gridX, gridY) {
        const key = `${gridX},${gridY}`;
        if (this.state.tiles[key]) {
            const newTiles = { ...this.state.tiles };
            delete newTiles[key];
            this.updateState({ tiles: newTiles });
        }
    }

    addTrafficLight(gridX, gridY) {
        const key = `${gridX},${gridY}`;
        const newLights = { ...this.state.trafficLights };
        // Initial state is green, with 0 timer
        newLights[key] = { x: gridX, y: gridY, color: 'green', timer: 0 };
        this.updateState({ trafficLights: newLights });
    }

    removeTrafficLight(gridX, gridY) {
        const key = `${gridX},${gridY}`;
        if (this.state.trafficLights[key]) {
            const newLights = { ...this.state.trafficLights };
            delete newLights[key];
            this.updateState({ trafficLights: newLights });
        }
    }

    addVehicle(gridX, gridY) {
        // Validasi: Cek apakah sudah ada mobil di grid ini
        const isOccupied = this.state.vehicles.some(v => 
            Math.floor(v.x / this.state.gridSize) === gridX && 
            Math.floor(v.y / this.state.gridSize) === gridY
        );

        if (isOccupied) {
            console.warn("Edge-case: Tidak bisa meletakkan mobil di atas mobil lain.");
            return false;
        }

        // Auto-detect arah berdasarkan jalan di sekitarnya
        let initialDirection = 'right';
        const dirs = [];
        if (this.state.tiles[`${gridX},${gridY - 1}`]?.type === 'road') dirs.push('up');
        if (this.state.tiles[`${gridX},${gridY + 1}`]?.type === 'road') dirs.push('down');
        if (this.state.tiles[`${gridX - 1},${gridY}`]?.type === 'road') dirs.push('left');
        if (this.state.tiles[`${gridX + 1},${gridY}`]?.type === 'road') dirs.push('right');
        
        if (dirs.length > 0) {
            // Jika ada jalur ke kanan, prioritas kanan, dsb.
            if (dirs.includes('right')) initialDirection = 'right';
            else if (dirs.includes('down')) initialDirection = 'down';
            else if (dirs.includes('up')) initialDirection = 'up';
            else if (dirs.includes('left')) initialDirection = 'left';
        }

        const newVehicle = {
            id: Date.now() + Math.random(),
            x: gridX * this.state.gridSize,
            y: gridY * this.state.gridSize,
            width: this.state.gridSize * 0.6,
            height: this.state.gridSize * 0.6,
            color: '#00ccff',
            speed: 50, // pixels per second
            direction: initialDirection
        };

        const newVehicles = [...this.state.vehicles, newVehicle];
        this.updateState({ 
            vehicles: newVehicles,
            stats: { ...this.state.stats, activeVehicles: newVehicles.length }
        });
        return true;
    }

    removeVehicle(gridX, gridY) {
        const newVehicles = this.state.vehicles.filter(v => 
            !(Math.floor(v.x / this.state.gridSize) === gridX && 
              Math.floor(v.y / this.state.gridSize) === gridY)
        );

        if (newVehicles.length !== this.state.vehicles.length) {
            this.updateState({ 
                vehicles: newVehicles,
                stats: { ...this.state.stats, activeVehicles: newVehicles.length }
            });
        }
    }
}

// Global instance untuk wiring
window.simState = new StateManager();
