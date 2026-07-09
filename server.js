#!/usr/bin/env node
const express = require('express');
const stateManager = require('./stateManager');
const path = require('path');
const lockfile = require('proper-lockfile');
const fs = require('fs').promises;

const app = express();
const PORT = process.env.PORT || 6767;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/state', async (req, res) => {
  try {
    const state = await stateManager.readState();
    res.json(state);
  } catch (err) {
    console.error('Error reading state:', err);
    res.status(500).json({ error: 'Gagal membaca state dari server.' });
  }
});

app.post('/api/state', async (req, res) => {
  try {
    const newState = req.body;
    
    // Validasi dasar agar tidak menulis data kosong/corrupt dari client
    if (!newState || typeof newState !== 'object' || Object.keys(newState).length === 0) {
      return res.status(400).json({ error: 'Data state tidak valid atau kosong.' });
    }
    
    await stateManager.writeState(newState);
    res.json({ success: true, state: newState });
  } catch (err) {
    console.error('Error writing state:', err);
    res.status(500).json({ error: 'Gagal menulis state ke server.' });
  }
});

// Fungsi untuk menginisialisasi folder AI skills (.agents) di workspace aktif pengguna
async function initWorkspaceSkills() {
  const targetDir = path.join(process.cwd(), '.agents');
  const sourceDir = path.join(__dirname, '.agents');

  try {
    // Cek apakah target .agents/skills/mikuplan sudah terpasang
    await fs.access(path.join(targetDir, 'skills', 'mikuplan'));
  } catch (err) {
    if (err.code === 'ENOENT') {
      console.log('[mikuplan] Menginisialisasi AI skills (.agents) di project Anda...');
      try {
        await fs.cp(sourceDir, targetDir, { recursive: true });
        console.log('[mikuplan] AI skills (.agents) berhasil diinstal. Reload/restart IDE Anda agar terdeteksi.');
      } catch (copyErr) {
        console.error('[mikuplan] Gagal menginisialisasi AI skills:', copyErr.message);
      }
    }
  }
}

// Penanganan Graceful Shutdown
let server;
function startServer() {
  // Jalankan inisialisasi AI skills di background
  initWorkspaceSkills().catch(err => {
    console.error('[mikuplan] Gagal inisialisasi workspace skills:', err.message);
  });

  server = app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
  });
  return server;
}

const shutdown = async () => {
  console.log('Sinyal shutdown diterima. Menutup server...');
  if (server) {
    server.close(async () => {
      console.log('Server HTTP ditutup.');
      try {
        const isLocked = await lockfile.check(stateManager.STATE_FILE);
        if (isLocked) {
          console.log('File state masih terkunci. Pembersihan lockfile otomatis berjalan.');
        }
      } catch (err) {
        // abaikan
      }
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// Jalankan server hanya jika dieksekusi secara langsung (bukan via require/import untuk test)
if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };
