#!/usr/bin/env node
const express = require('express');
const stateManager = require('./stateManager');
const path = require('path');
const lockfile = require('proper-lockfile');
const fs = require('fs').promises;
const pkg = require('./package.json');

const app = express();
let PORT = process.env.PORT || 6767;

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

app.get('/api/tasks', async (req, res) => {
  try {
    const mainPlanPath = path.join(__dirname, 'docs', 'MAIN_PLAN.md');
    let data;
    try {
      data = await fs.readFile(mainPlanPath, 'utf8');
    } catch (readErr) {
      if (readErr.code === 'ENOENT') {
        return res.json([]);
      }
      throw readErr;
    }

    const lines = data.split('\n');
    const phases = [];
    let currentPhase = null;

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('## ')) {
        currentPhase = {
          title: trimmed.substring(3).trim(),
          tasks: []
        };
        phases.push(currentPhase);
      } else if (trimmed.startsWith('- [ ]') || trimmed.startsWith('- [x]') || trimmed.startsWith('- [/]')) {
        if (currentPhase) {
          const completed = trimmed.startsWith('- [x]');
          const inProgress = trimmed.startsWith('- [/]');
          const text = trimmed.substring(5).trim();
          currentPhase.tasks.push({ text, completed, inProgress });
        }
      }
    }
    res.json(phases);
  } catch (err) {
    console.error('Error reading/parsing tasks:', err);
    res.status(500).json({ error: 'Gagal membaca daftar tugas.' });
  }
});

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
  const args = process.argv.slice(2);

  // 1. Tampilkan Help / Panduan Bantuan
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
PRD-Planner (mikuplan) - Tool Perencanaan PRD MVP

Penggunaan:
  mikuplan [opsi]
  mp [opsi]

Opsi:
  -v, --version       Tampilkan versi program saat ini
  -h, --help          Tampilkan panduan bantuan ini
  -p, --port <port>   Tentukan port server kustom (default: 6767)

Contoh:
  mikuplan -p 8080    Menjalankan server perencanaan di port 8080
    `);
    process.exit(0);
  }

  // 2. Tampilkan Version
  if (args.includes('--version') || args.includes('-v')) {
    console.log(`v${pkg.version}`);
    process.exit(0);
  }

  // 3. Kustomisasi Port
  const portIndex = args.findIndex(arg => arg === '--port' || arg === '-p');
  if (portIndex !== -1 && args[portIndex + 1]) {
    const parsedPort = parseInt(args[portIndex + 1], 10);
    if (!isNaN(parsedPort) && parsedPort > 0 && parsedPort <= 65535) {
      PORT = parsedPort;
    } else {
      console.error(`Error: Port '${args[portIndex + 1]}' tidak valid (harus angka 1 - 65535).`);
      process.exit(1);
    }
  }

  startServer();
}

module.exports = { app, startServer };
