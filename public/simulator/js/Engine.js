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

        // Logic Tick (dikali speed multiplier)
        const state = this.sm.getState();
        const effectiveDt = this.deltaTime * state.speedMultiplier;
        this.tick(effectiveDt);

        // Render pass trigger via Event (Context Wiring)
        this.sm.emit('renderPass', effectiveDt);

        // Lanjut ke frame berikutnya jika masih running
        if (this.sm.getState().isRunning) {
            this.animationFrameId = requestAnimationFrame(() => this.loop());
        }
    }

    tick(dt) {
        // AI / Physics update placeholder
        try {
            const state = this.sm.getState();
            let lightsChanged = false;
            const newLights = { ...state.trafficLights };

            for (const key in newLights) {
                const light = newLights[key];
                light.timer += dt; // direct mutation for performance

                let duration = 5; // default for green/red
                if (light.color === 'yellow') duration = 2;

                if (light.timer >= duration) {
                    light.timer = 0;
                    // Copy the object to trigger reactivity correctly if needed
                    const newLight = { ...light };
                    if (newLight.color === 'green') newLight.color = 'yellow';
                    else if (newLight.color === 'yellow') newLight.color = 'red';
                    else if (newLight.color === 'red') newLight.color = 'green';
                    
                    newLights[key] = newLight;
                    lightsChanged = true;
                }
            }

            if (lightsChanged) {
                this.sm.updateState({ trafficLights: newLights });
            }

            // Logika gerak mobil
            if (state.vehicles.length > 0) {
                const newVehicles = [];
                let countChanged = false;

                for (let i = 0; i < state.vehicles.length; i++) {
                    const v = { ...state.vehicles[i] };
                    
                    // Hitung titik tengah mobil saat ini
                    let cx = v.x + (v.width / 2);
                    let cy = v.y + (v.height / 2);
                    let gridX = Math.floor(cx / state.gridSize);
                    let gridY = Math.floor(cy / state.gridSize);
                    let currentKey = `${gridX},${gridY}`;
                    
                    const tileCenterX = (gridX * state.gridSize) + (state.gridSize / 2);
                    const tileCenterY = (gridY * state.gridSize) + (state.gridSize / 2);
                    const distToCenter = Math.hypot(cx - tileCenterX, cy - tileCenterY);

                    // Pathfinding & Turning Logic: Jika berada sangat dekat dengan pusat tile
                    if (distToCenter <= (v.speed * dt) && v.lastDecisionTile !== currentKey) {
                        // Snap posisi ke tengah untuk mencegah drift/bergeser keluar jalur
                        v.x = tileCenterX - (v.width / 2);
                        v.y = tileCenterY - (v.height / 2);
                        v.lastDecisionTile = currentKey;

                        const availableDirs = [];
                        const checkDir = (dir, dx, dy, opposite) => {
                            if (v.direction === opposite) return; // Jangan langsung putar balik
                            if (state.tiles[`${gridX + dx},${gridY + dy}`] && state.tiles[`${gridX + dx},${gridY + dy}`].type === 'road') {
                                availableDirs.push(dir);
                            }
                        };
                        
                        checkDir('up', 0, -1, 'down');
                        checkDir('down', 0, 1, 'up');
                        checkDir('left', -1, 0, 'right');
                        checkDir('right', 1, 0, 'left');

                        if (availableDirs.length > 0) {
                            // Pilih arah secara acak dari yang tersedia (Intersection behavior)
                            v.direction = availableDirs[Math.floor(Math.random() * availableDirs.length)];
                        } else {
                            // Dead end (Jalan buntu), coba putar balik
                            let opposite = 'down';
                            if (v.direction === 'down') opposite = 'up';
                            else if (v.direction === 'left') opposite = 'right';
                            else if (v.direction === 'right') opposite = 'left';
                            
                            v.direction = opposite;
                        }
                    }

                    // Collision Avoidance: Pengecekan sensor depan
                    let sensorX = v.x;
                    let sensorY = v.y;
                    let sensorW = v.width;
                    let sensorH = v.height;
                    const lookAhead = state.gridSize * 0.8; // Safe distance

                    if (v.direction === 'right') {
                        sensorX = v.x + v.width;
                        sensorW = lookAhead;
                    } else if (v.direction === 'left') {
                        sensorX = v.x - lookAhead;
                        sensorW = lookAhead;
                    } else if (v.direction === 'down') {
                        sensorY = v.y + v.height;
                        sensorH = lookAhead;
                    } else if (v.direction === 'up') {
                        sensorY = v.y - lookAhead;
                        sensorH = lookAhead;
                    }

                    let shouldStop = false;

                    // Traffic Light Check: Berhenti jika grid di depan ada lampu merah/kuning
                    let sensorCX = sensorX + (sensorW / 2);
                    let sensorCY = sensorY + (sensorH / 2);
                    let sensorGridX = Math.floor(sensorCX / state.gridSize);
                    let sensorGridY = Math.floor(sensorCY / state.gridSize);
                    let sensorGridKey = `${sensorGridX},${sensorGridY}`;

                    // Cek jika sensor memasuki area grid baru di depannya
                    if (sensorGridKey !== currentKey) {
                        const tl = state.trafficLights[sensorGridKey];
                        if (tl && (tl.color === 'red' || tl.color === 'yellow')) {
                            shouldStop = true; // Rem otomatis
                        }
                    }

                    // Pengecekan kendaraan lain
                    for (let j = 0; j < state.vehicles.length; j++) {
                        if (i === j) continue;
                        const other = state.vehicles[j];
                        
                        // Box overlap check
                        const isOverlap = (sensorX < other.x + other.width && 
                                           sensorX + sensorW > other.x && 
                                           sensorY < other.y + other.height && 
                                           sensorY + sensorH > other.y);
                        
                        if (isOverlap) {
                            // Edge-case Race Condition Handling (Intersection Deadlock)
                            let overrideStop = false;
                            if (other.direction !== v.direction) {
                                // Jika berada di persimpangan dan arah berbeda, gunakan ID sbg penentu prioritas
                                if (v.id > other.id) {
                                    overrideStop = true; // Mobil ini punya prioritas, tetap jalan
                                }
                            }
                            
                            if (!overrideStop) {
                                shouldStop = true;
                                break;
                            }
                        }
                    }

                    // Lakukan pergerakan sesuai direction yang aktif JIKA aman
                    v.isStopped = shouldStop;
                    if (!shouldStop) {
                        if (v.direction === 'right') v.x += v.speed * dt;
                        else if (v.direction === 'left') v.x -= v.speed * dt;
                        else if (v.direction === 'down') v.y += v.speed * dt;
                        else if (v.direction === 'up') v.y -= v.speed * dt;
                    }
                    
                    // Update ulang cx dan cy setelah bergerak
                    cx = v.x + (v.width / 2);
                    cy = v.y + (v.height / 2);
                    gridX = Math.floor(cx / state.gridSize);
                    gridY = Math.floor(cy / state.gridSize);
                    currentKey = `${gridX},${gridY}`;
                    v.currentKey = currentKey; // Simpan posisi grid terbaru untuk render heatmap

                    // Jika masih di atas jalan, mobil dilestarikan
                    if (state.tiles[currentKey] && state.tiles[currentKey].type === 'road') {
                        newVehicles.push(v);
                    } else {
                        // Mobil keluar sepenuhnya dari sistem jalan (misal jalan dihapus user di depannya)
                        countChanged = true;
                    }
                }

                this.sm.updateState({ vehicles: newVehicles });
                
                if (countChanged) {
                    this.sm.updateState({ 
                        stats: { ...state.stats, activeVehicles: newVehicles.length }
                    });
                }
            }
        } catch (error) {
            console.error("Simulation tick error (Anti Happy-Path caught this):", error);
        }
    }
}
