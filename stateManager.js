const lockfile = require('proper-lockfile');
const fs = require('fs').promises;
const path = require('path');

const STATE_FILE = path.join(process.cwd(), 'state.json');
const TEMP_FILE = path.join(process.cwd(), 'state.json.tmp');

const DEFAULT_STATE = {
  workflowVersion: 2,
  state: 1,
  ideAwal: "",
  kuesioner: {
    pertanyaan: [],
    jawaban: [],
    currentIndex: 0
  },
  referensiDesign: {
    deskripsi: "",
    files: [],
    completed: false,
    skipped: false
  },
  mindmap: null,
  prd: null
};

/**
 * Menambahkan field workflow terbaru dan memigrasikan nomor state versi lama.
 * Workflow v1: Struktur=3, PRD=4, Eksekusi=5.
 * Workflow v2: Referensi Design=3, Struktur=4, PRD=5, Eksekusi=6.
 */
function normalizeState(rawState) {
  const source = rawState && typeof rawState === 'object' ? rawState : {};
  const isLegacyWorkflow = !Number.isInteger(source.workflowVersion) || source.workflowVersion < 2;
  let currentStep = Number.isInteger(source.state) ? source.state : DEFAULT_STATE.state;

  if (isLegacyWorkflow && currentStep >= 3) {
    currentStep = Math.min(currentStep + 1, 6);
  }

  const migratedPastDesignStep = isLegacyWorkflow && currentStep >= 4;

  return {
    ...DEFAULT_STATE,
    ...source,
    workflowVersion: 2,
    state: currentStep,
    kuesioner: {
      ...DEFAULT_STATE.kuesioner,
      ...(source.kuesioner || {})
    },
    referensiDesign: {
      ...DEFAULT_STATE.referensiDesign,
      ...(source.referensiDesign || {}),
      ...(migratedPastDesignStep && !source.referensiDesign
        ? { completed: true, skipped: true, inferred: true }
        : {})
    }
  };
}

// Helper untuk penundaan (delay)
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Mencoba mendapatkan lock pada file secara aman dengan retry dan exponential backoff.
 */
async function acquireLock(filePath, retries = 5, initialDelay = 100) {
  let attempt = 0;
  while (true) {
    try {
      const release = await lockfile.lock(filePath, {
        stale: 10000
      });
      return release;
    } catch (err) {
      attempt++;
      if (attempt > retries) {
        throw new Error(`Gagal mendapatkan lock pada file ${filePath} setelah ${retries} percobaan. Error: ${err.message}`);
      }
      const backoffDelay = initialDelay * Math.pow(2, attempt - 1);
      console.warn(`[Lockfile] Percobaan lock #${attempt} gagal untuk ${filePath}. Mencoba lagi dalam ${backoffDelay}ms...`);
      await delay(backoffDelay);
    }
  }
}

/**
 * Memastikan file state.json ada dan isinya valid.
 * Jika tidak ada atau corrupt, akan dibuat/direset menggunakan default state.
 */
async function ensureFileExists() {
  try {
    await fs.access(STATE_FILE);
    const content = await fs.readFile(STATE_FILE, 'utf8');
    if (!content.trim()) {
      await fs.writeFile(STATE_FILE, JSON.stringify(DEFAULT_STATE, null, 2), 'utf8');
      return;
    }
    JSON.parse(content);
  } catch (err) {
    if (err.code === 'ENOENT') {
      console.log(`[stateManager] state.json tidak ditemukan, membuat file default.`);
      await fs.writeFile(STATE_FILE, JSON.stringify(DEFAULT_STATE, null, 2), 'utf8');
    } else if (err instanceof SyntaxError || err.name === 'SyntaxError') {
      const backupPath = `${STATE_FILE}.corrupted-${Date.now()}`;
      console.error(`[stateManager] state.json rusak (invalid JSON). Memindahkan ke ${backupPath} dan me-reset ke default.`);
      try {
        await fs.rename(STATE_FILE, backupPath);
      } catch (renameErr) {
        console.error(`[stateManager] Gagal mencadangkan file rusak: ${renameErr.message}`);
      }
      await fs.writeFile(STATE_FILE, JSON.stringify(DEFAULT_STATE, null, 2), 'utf8');
    } else {
      throw err;
    }
  }
}

/**
 * Membaca state secara aman dengan file locking.
 */
async function readState() {
  await ensureFileExists();
  const release = await acquireLock(STATE_FILE);
  try {
    const content = await fs.readFile(STATE_FILE, 'utf8');
    return normalizeState(JSON.parse(content));
  } catch (parseErr) {
    console.error(`[stateManager] Gagal parse JSON saat membaca: ${parseErr.message}`);
    // Jika parse gagal di sini, kembalikan default state daripada crash
    return normalizeState(DEFAULT_STATE);
  } finally {
    await release();
  }
}

/**
 * Menulis state secara atomik (write-then-rename) dan aman menggunakan file locking.
 */
async function writeState(newState) {
  await ensureFileExists();
  const release = await acquireLock(STATE_FILE);
  try {
    const content = JSON.stringify(normalizeState(newState), null, 2);
    // Tulis ke file temporary terlebih dahulu
    await fs.writeFile(TEMP_FILE, content, 'utf8');
    // Rename secara atomik
    await fs.rename(TEMP_FILE, STATE_FILE);
  } catch (err) {
    console.error(`[stateManager] Gagal menulis state: ${err.message}`);
    try {
      await fs.unlink(TEMP_FILE);
    } catch (unlinkErr) {
      // Abaikan jika file temp memang tidak ada
    }
    throw err;
  } finally {
    await release();
  }
}

module.exports = {
  readState,
  writeState,
  STATE_FILE,
  DEFAULT_STATE,
  normalizeState
};
