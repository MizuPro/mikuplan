const express = require('express');
const stateManager = require('./stateManager');
const path = require('path');
const lockfile = require('proper-lockfile');

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

// Penanganan Graceful Shutdown
let server;
function startServer() {
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
