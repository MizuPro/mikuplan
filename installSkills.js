#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

/**
 * Menyalin file/folder secara rekursif.
 * Melakukan overwrite agar definisi skill selalu sinkron dengan versi paket yang terinstal.
 */
function copyDirRecursive(src, dest) {
  try {
    fs.mkdirSync(dest, { recursive: true });
    const entries = fs.readdirSync(src, { withFileTypes: true });
    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);
      if (entry.isDirectory()) {
        copyDirRecursive(srcPath, destPath);
      } else {
        // Melakukan overwrite file skill agar ter-update ke versi terbaru
        fs.copyFileSync(srcPath, destPath);
      }
    }
  } catch (err) {
    console.error(`[mikuplan] Gagal menyalin direktori dari ${src} ke ${dest}:`, err.message);
    throw err;
  }
}

function install() {
  // INIT_CWD diatur oleh npm saat proses install dijalankan
  const initCwd = process.env.INIT_CWD;
  const parentDir = path.resolve(__dirname, '..', '..');
  const targetRoot = initCwd || parentDir;

  // Jangan salin jika targetRoot adalah folder package mikuplan itu sendiri (development mode)
  try {
    const pkgJsonPath = path.join(targetRoot, 'package.json');
    if (fs.existsSync(pkgJsonPath)) {
      const pkg = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'));
      if (pkg.name === 'mikuplan' && path.resolve(targetRoot) === path.resolve(__dirname)) {
        console.log('[mikuplan] Development mode terdeteksi, melewati penyalinan AI skills.');
        return;
      }
    }
  } catch (e) {
    // Abaikan jika berkas package.json tidak ada atau tidak valid
  }

  const sourceDir = path.join(__dirname, '.agents');
  const targetDir = path.join(targetRoot, '.agents');

  if (!fs.existsSync(sourceDir)) {
    console.warn(`[mikuplan] Folder sumber .agents tidak ditemukan di ${sourceDir}`);
    return;
  }

  try {
    console.log(`[mikuplan] Menyalin AI skills ke workspace root: ${targetDir}`);
    copyDirRecursive(sourceDir, targetDir);
    console.log(`[mikuplan] Penyalinan AI skills berhasil dilakukan.`);
  } catch (err) {
    // Jangan biarkan proses instalasi npm gagal jika hanya penyalinan skills bermasalah (contoh: permission error)
    console.warn(`[mikuplan] Peringatan: Gagal melakukan inisialisasi AI skills otomatis. Silakan salin folder .agents secara manual.`);
  }
}

install();
