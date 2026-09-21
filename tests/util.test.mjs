// Pruebas de las funciones puras de js/util.js
// Correr con:  node --test tests/
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  escapar, sinAcentos, isoDe, lunesDe, semanasSeguidas, formatoKilos,
  puntosPorEjercicio, revisarPeso,
} from '../js/util.js';

test('escapar: el texto de una persona nunca se vuelve HTML', () => {
  assert.equal(escapar('<img src=x onerror="alert(1)">'),
    '&lt;img src=x onerror=&quot;alert(1)&quot;&gt;');
  assert.equal(escapar("O'Hara & Hijos"), 'O&#39;Hara &amp; Hijos');
  assert.equal(escapar(null), '');
  assert.equal(escapar(undefined), '');
  assert.equal(escapar(42), '42');
});

test('sinAcentos: buscar sin importar acentos ni mayúsculas', () => {
  assert.equal(sinAcentos('Jéssica PÉREZ'), 'jessica perez');
  assert.ok(sinAcentos('Músculo Glúteo').includes('gluteo'));
  assert.equal(sinAcentos(null), '');
});

test('lunesDe: cualquier día cae en el lunes de su semana', () => {
  assert.equal(lunesDe('2026-09-21'), '2026-09-21'); // lunes
  assert.equal(lunesDe('2026-09-20'), '2026-09-14'); // domingo
  assert.equal(lunesDe('2026-09-17'), '2026-09-14'); // jueves
  assert.equal(lunesDe('2026-03-01'), '2026-02-23'); // cruza de mes
  assert.equal(isoDe(new Date(2026, 0, 5)), '2026-01-05');
});

test('semanasSeguidas: la semana en curso no rompe la racha', () => {
  const hoy = '2026-09-17'; // jueves
  // entrenó las dos semanas anteriores, esta todavía no
  assert.equal(semanasSeguidas(['2026-09-08', '2026-09-01'], hoy), 2);
  // y también esta semana
  assert.equal(semanasSeguidas(['2026-09-15', '2026-09-08', '2026-09-01'], hoy), 3);
  // un hueco corta la racha
  assert.equal(semanasSeguidas(['2026-09-15', '2026-09-01'], hoy), 1);
  assert.equal(semanasSeguidas([], hoy), 0);
  // varias veces en una misma semana cuentan como una
  assert.equal(semanasSeguidas(['2026-09-14', '2026-09-15', '2026-09-16'], hoy), 1);
});

test('formatoKilos: toneladas desde mil kilos', () => {
  assert.equal(formatoKilos(850), '850 kg');
  assert.equal(formatoKilos(999.6), '1000 kg');
  assert.equal(formatoKilos(32200), '32.2 t');
});

test('puntosPorEjercicio: la serie más pesada de cada fecha', () => {
  const fechaDeSesion = { s1: '2026-09-01', s2: '2026-09-08' };
  const series = [
    { sesion_id: 's1', ejercicio_slug: 'prensa', serie: 1, peso: 60, reps: 15, hecho: true },
    { sesion_id: 's1', ejercicio_slug: 'prensa', serie: 2, peso: 80, reps: 10, hecho: true },
    { sesion_id: 's2', ejercicio_slug: 'prensa', serie: 1, peso: 85, reps: 8, hecho: true },
    { sesion_id: 's2', ejercicio_slug: 'prensa', serie: 2, peso: 999, reps: 1, hecho: false }, // no marcada
  ];
  const [prensa] = puntosPorEjercicio(series, fechaDeSesion);
  assert.equal(prensa.unidad, 'kg');
  assert.deepEqual(prensa.puntos.map((p) => [p.fecha, p.valor, p.reps]),
    [['2026-09-01', 80, 10], ['2026-09-08', 85, 8]]);
});

test('puntosPorEjercicio: sin peso nunca, se sigue por repeticiones', () => {
  const [abs] = puntosPorEjercicio([
    { sesion_id: 's1', ejercicio_slug: 'crunch', serie: 1, peso: null, reps: 20, hecho: true },
    { sesion_id: 's1', ejercicio_slug: 'crunch', serie: 2, peso: 0, reps: 25, hecho: true },
  ], { s1: '2026-09-01' });
  assert.equal(abs.unidad, 'reps');
  assert.equal(abs.puntos[0].valor, 25);
});

test('puntosPorEjercicio: ignora series de sesiones que no conoce', () => {
  assert.deepEqual(puntosPorEjercicio(
    [{ sesion_id: 'otra', ejercicio_slug: 'x', serie: 1, peso: 10, reps: 1, hecho: true }], {}), []);
});

test('revisarPeso: pregunta ante un dedo de más (388 en vez de 38)', () => {
  const anteriores = { 'ext:1': { peso: 15 }, 'ext:2': { peso: 20 }, 'ext:3': { peso: 25 }, 'ext:4': { peso: 30 } };
  const r = (peso, registros = {}) => revisarPeso(peso, 'ext', 4, anteriores, registros);
  assert.equal(r(35).exagerado, false);
  assert.equal(r(55).exagerado, false);   // casi el doble, pero se sube de peso así
  assert.equal(r(60).exagerado, true);    // el doble de 30 y 30 kg más
  assert.equal(r(388).exagerado, true);
  assert.equal(r(388).referencia, 30);    // la serie 4 de la vez pasada sí cuenta
  assert.equal(r(0).exagerado, false);
  assert.equal(r(null).exagerado, false);
  // la serie que se está marcando hoy no es su propia referencia
  assert.equal(r(60, { 'ext:4': { peso: 60 } }).exagerado, true);
  // otro ejercicio no influye
  assert.equal(revisarPeso(100, 'prensa', 1, anteriores, {}).exagerado, false);
});

test('revisarPeso: sin referencia, sólo lo absurdo', () => {
  assert.equal(revisarPeso(150, 'x', 1).exagerado, false);
  assert.equal(revisarPeso(301, 'x', 1).exagerado, true);
});
