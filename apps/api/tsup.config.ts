import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: true,
  // Bundle semua package workspace (@kit/*) ke dist agar output bisa dijalankan
  // `node dist/index.js` (termasuk Docker CMD). Tanpa ini, @kit/* di-externalize
  // dan Node ESM gagal me-resolve relative import tanpa ekstensi di source TS.
  noExternal: [/^@kit\//],
});