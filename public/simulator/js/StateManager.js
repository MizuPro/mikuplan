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
            tiles: [],
            stats: {
                fps: 0,
                activeVehicles: 0
            }
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
}

// Global instance untuk wiring
window.simState = new StateManager();
