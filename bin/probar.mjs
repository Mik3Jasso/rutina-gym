#!/usr/bin/env node
// Corre las pruebas de lógica y recuerda cómo correr las otras dos.
//   node bin/probar.mjs
import { spawnSync } from 'node:child_process';
import { readdirSync } from 'node:fs';

const archivos = readdirSync('tests').filter((f) => f.endsWith('.test.mjs')).map((f) => `tests/${f}`);
const r = spawnSync(process.execPath, ['--test', ...archivos], { stdio: 'inherit' });

console.log(`
Además:
  • Pantallas: con el servidor local (python3 -m http.server 8000) abre
    http://localhost:8000/tests/ui/  — dice cuántas pasaron.
  • Permisos de la base: pega tests/base.sql en el SQL Editor de Supabase.
    Todo se deshace al final; cada fila dice ok o FALLA.
`);
process.exit(r.status ?? 1);
