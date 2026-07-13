const test = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const fs = require('fs').promises;
const path = require('path');
const lockfile = require('proper-lockfile');
const { app } = require('../server');
const stateManager = require('../stateManager');

const STATE_FILE = stateManager.STATE_FILE;
const BACKUP_FILE = `${STATE_FILE}.backup-test`;
const uploadedDesignFiles = [];

// Helper untuk penundaan (delay)
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

test.before(async () => {
  // Backup state.json yang asli jika ada
  try {
    await fs.access(STATE_FILE);
    const content = await fs.readFile(STATE_FILE, 'utf8');
    await fs.writeFile(BACKUP_FILE, content, 'utf8');
  } catch (err) {
    // Abaikan jika file tidak ada
  }
});

test.after(async () => {
  // Bersihkan lockfile dan hapus file test, kembalikan backup
  try {
    await lockfile.unlock(STATE_FILE).catch(() => {});
  } catch (err) {}
  
  try {
    await fs.unlink(STATE_FILE).catch(() => {});
    await fs.unlink(`${STATE_FILE}.tmp`).catch(() => {});
    await Promise.all(uploadedDesignFiles.map(file => fs.unlink(file).catch(() => {})));
  } catch (err) {}

  try {
    await fs.access(BACKUP_FILE);
    const content = await fs.readFile(BACKUP_FILE, 'utf8');
    await fs.writeFile(STATE_FILE, content, 'utf8');
    await fs.unlink(BACKUP_FILE);
  } catch (err) {
    // Abaikan jika backup tidak ada
  }
  
  // Bersihkan berkas .corrupted hasil test jika ada
  try {
    const parentDir = path.dirname(STATE_FILE);
    const dir = await fs.readdir(parentDir);
    for (const file of dir) {
      if (file.includes('state.json.corrupted-')) {
        await fs.unlink(path.join(parentDir, file));
      }
    }
  } catch (err) {}
});

test.describe('PRD-Planner Integration Tests', () => {
  
  test('GET /api/state - harus mengembalikan default state jika file tidak ada', async () => {
    // Pastikan file dihapus terlebih dahulu
    try {
      await fs.unlink(STATE_FILE);
    } catch (err) {}

    const res = await request(app)
      .get('/api/state')
      .expect('Content-Type', /json/)
      .expect(200);

    assert.strictEqual(res.body.state, 1);
    assert.strictEqual(res.body.workflowVersion, 2);
    assert.strictEqual(res.body.ideAwal, "");
    assert.deepStrictEqual(res.body.kuesioner.pertanyaan, []);
    assert.deepStrictEqual(res.body.referensiDesign.files, []);
  });

  test('POST /api/state - harus menyimpan state baru ke file', async () => {
    const newState = {
      workflowVersion: 2,
      state: 2,
      ideAwal: "Aplikasi Padel Booking MVP",
      kuesioner: {
        pertanyaan: ["Siapa target user?", "Fitur apa saja?"],
        jawaban: ["Pemain padel lokal", "Booking slot, bayar via QR"],
        currentIndex: 2
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

    const postRes = await request(app)
      .post('/api/state')
      .send(newState)
      .expect('Content-Type', /json/)
      .expect(200);

    assert.strictEqual(postRes.body.success, true);

    // Verifikasi bahwa perubahan tersimpan secara fisik
    const getRes = await request(app)
      .get('/api/state')
      .expect(200);

    assert.strictEqual(getRes.body.state, 2);
    assert.strictEqual(getRes.body.ideAwal, "Aplikasi Padel Booking MVP");
    assert.strictEqual(getRes.body.kuesioner.currentIndex, 2);
  });

  test('POST /api/state - harus mengembalikan error 400 jika payload tidak valid', async () => {
    await request(app)
      .post('/api/state')
      .send({})
      .expect(400);
  });

  test('Auto-recovery - harus memulihkan state jika JSON corrupt', async () => {
    // Tulis JSON rusak secara paksa ke file
    await fs.writeFile(STATE_FILE, "{ corrupt_json: ", 'utf8');

    const res = await request(app)
      .get('/api/state')
      .expect(200);

    // Harus kembali ke default state
    assert.strictEqual(res.body.state, 1);
    
    // Pastikan file corrupted dicadangkan
    const parentDir = path.dirname(STATE_FILE);
    const files = await fs.readdir(parentDir);
    const corruptFileExists = files.some(f => f.startsWith('state.json.corrupted-'));
    assert.strictEqual(corruptFileExists, true);
  });

  test('Locking & Retry Mechanism - harus menunggu lock dilepas lalu sukses melakukan penulisan', async () => {
    // Inisialisasi awal
    await fs.writeFile(STATE_FILE, JSON.stringify(stateManager.DEFAULT_STATE, null, 2), 'utf8');
    
    // Kunci file secara manual
    const releaseLock = await lockfile.lock(STATE_FILE);

    // Kirim request update state secara asinkronus (terhambat lock)
    const updatePromise = request(app)
      .post('/api/state')
      .send({
        workflowVersion: 2,
        state: 3,
        ideAwal: "Testing Concurrency Lock"
      });

    // Tunggu sebentar untuk memastikan request berjalan dan tertahan
    await delay(300);

    // Lepaskan lock
    await releaseLock();

    // Tunggu request selesai
    const res = await updatePromise;
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);

    // Baca ulang dan pastikan data tersimpan
    const checkRes = await request(app).get('/api/state');
    assert.strictEqual(checkRes.body.ideAwal, "Testing Concurrency Lock");
    assert.strictEqual(checkRes.body.state, 3);
  });

  test('Migrasi workflow lama - harus menggeser Struktur lama dari state 3 ke state 4', () => {
    const migrated = stateManager.normalizeState({
      state: 3,
      ideAwal: 'Proyek workflow lama',
      mindmap: { title: 'Legacy', nodes: [{ id: 'node1' }] }
    });

    assert.strictEqual(migrated.workflowVersion, 2);
    assert.strictEqual(migrated.state, 4);
    assert.strictEqual(migrated.referensiDesign.completed, true);
    assert.strictEqual(migrated.referensiDesign.skipped, true);
    assert.strictEqual(migrated.referensiDesign.inferred, true);
  });

  test('POST /api/design-references - harus menyimpan design.md pada tahap 3', async () => {
    await fs.writeFile(STATE_FILE, JSON.stringify({
      ...stateManager.DEFAULT_STATE,
      state: 3
    }, null, 2), 'utf8');

    const res = await request(app)
      .post('/api/design-references')
      .attach('files', Buffer.from('# Design minimalis'), 'design.md')
      .expect('Content-Type', /json/)
      .expect(200);

    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.files.length, 1);
    assert.strictEqual(res.body.files[0].name, 'design.md');
    assert.match(res.body.files[0].path, /^references\/design\//);

    const savedPath = path.join(__dirname, '..', ...res.body.files[0].path.split('/'));
    uploadedDesignFiles.push(savedPath);
    assert.strictEqual(await fs.readFile(savedPath, 'utf8'), '# Design minimalis');
  });

  test('POST /api/design-references - harus menolak upload di luar tahap 3', async () => {
    await fs.writeFile(STATE_FILE, JSON.stringify(stateManager.DEFAULT_STATE, null, 2), 'utf8');

    await request(app)
      .post('/api/design-references')
      .attach('files', Buffer.from('# Design'), 'design.md')
      .expect(409);
  });

  test('POST /api/design-references - harus menolak format tidak didukung tanpa meninggalkan file parsial', async () => {
    await fs.writeFile(STATE_FILE, JSON.stringify({
      ...stateManager.DEFAULT_STATE,
      state: 3
    }, null, 2), 'utf8');

    const designDir = path.join(__dirname, '..', 'references', 'design');
    await fs.mkdir(designDir, { recursive: true });
    const before = (await fs.readdir(designDir)).sort();

    await request(app)
      .post('/api/design-references')
      .attach('files', Buffer.from('# Valid sementara'), 'design.md')
      .attach('files', Buffer.from('binary'), 'design.exe')
      .expect(400);

    const after = (await fs.readdir(designDir)).sort();
    assert.deepStrictEqual(after, before);
  });

  test('GET / - harus menyajikan UI workflow enam tahap', async () => {
    const res = await request(app)
      .get('/')
      .expect('Content-Type', /html/)
      .expect(200);

    assert.match(res.text, /id="screen-design-reference"/);
    assert.match(res.text, /data-step="6"/);
    assert.match(res.text, /3 \/ REFERENSI DESIGN/);
  });

  test('GET /api/tasks - harus memparsing docs/MAIN_PLAN.md dengan benar', async () => {
    const docsDir = path.join(__dirname, '..', 'docs');
    const mainPlanPath = path.join(docsDir, 'MAIN_PLAN.md');
    
    let planBackup = null;
    try {
      planBackup = await fs.readFile(mainPlanPath, 'utf8');
    } catch (err) {}

    try {
      await fs.mkdir(docsDir, { recursive: true });

      const testContent = `
# Plan
## Fase Test 1
- [x] Task Selesai
- [ ] Task Belum
- [/] Task Jalan
`;
      await fs.writeFile(mainPlanPath, testContent, 'utf8');

      const res = await request(app)
        .get('/api/tasks')
        .expect('Content-Type', /json/)
        .expect(200);

      assert.strictEqual(res.body.length, 1);
      assert.strictEqual(res.body[0].title, "Fase Test 1");
      assert.strictEqual(res.body[0].tasks.length, 3);
      assert.strictEqual(res.body[0].tasks[0].text, "Task Selesai");
      assert.strictEqual(res.body[0].tasks[0].completed, true);
      assert.strictEqual(res.body[0].tasks[0].inProgress, false);
      assert.strictEqual(res.body[0].tasks[1].text, "Task Belum");
      assert.strictEqual(res.body[0].tasks[1].completed, false);
      assert.strictEqual(res.body[0].tasks[1].inProgress, false);
      assert.strictEqual(res.body[0].tasks[2].text, "Task Jalan");
      assert.strictEqual(res.body[0].tasks[2].completed, false);
      assert.strictEqual(res.body[0].tasks[2].inProgress, true);

    } finally {
      if (planBackup !== null) {
        await fs.writeFile(mainPlanPath, planBackup, 'utf8');
      } else {
        await fs.unlink(mainPlanPath).catch(() => {});
      }
    }
  });
});
