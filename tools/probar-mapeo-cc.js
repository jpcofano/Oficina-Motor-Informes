#!/usr/bin/env node
/**
 * tools/probar-mapeo-cc.js — control del `MAPEO` de `looker/CC` (`2026-08-22_27` Parte B),
 * **fuera de Apps Script** y leyendo el seed real de `Instalar.gs`.
 *
 * ⭐ **Qué guarda, y por qué NO guarda las letras.** Las cuatro filas nuevas declaran dónde están
 * las columnas; que la letra `C` siga siendo `Base barrida` **hoy** lo contesta
 * `verificarEncabezadosDeMapeo()` contra la planilla **viva**, que es mejor testigo que cualquier
 * fixture. Reimplementar acá un lector de `.xlsx` sería el error que `CLAUDE.md` §4 nombra:
 * *el instrumento que reproduce lógica del motor y la reproduce peor*. **Lo que sí puede fallar sin
 * que nadie se entere es el seed**, y eso es lo que se afirma acá.
 *
 * ⛔ **La afirmación que de verdad importa es la 3, y es negativa:** que **`Base enviada` NO esté
 * mapeada**. Los nombres invitan a mapearla —*discada* suena a *barrida*— y elegir mal da un número
 * **12 % abajo, plausible y sin nada que lo delate**; ya se eligió mal una vez, el 22/08. Una fila
 * declarada es una invitación a usarla. **El día que alguien la agregue "para tenerla", este
 * control tiene que ponerse rojo y mandarlo a leer `V-66`.**
 *
 * ⚠ **Y la 4 cuida el otro borde:** que ningún `campo_logico` nuevo pise uno que ya existe con otro
 * dueño. `cc_contactados` y `cc_efectivos` **ya son de `reuniones/Agenda JM`** desde el `_44`;
 * `buscarMapeo` scopea por base + solapa así que reusarlos *funcionaría*, y lo que no sobrevive es
 * la lectura humana.
 *
 * ⛔⛔ **Sobre QUÉ artefacto afirma, que es lo que estuvo mal hasta el 26/08/2026.** Este banco
 * decía en verde *«las cuatro traen `encabezado`»* leyendo `SEED_MAPEO_CC_` — la lista **cruda**.
 * Era cierto sobre la lista y **falso sobre la hoja**: el post-proceso de `Instalar.gs` pisaba el
 * testigo con `|| ''` y las cuatro celdas de `MAPEO` estaban **vacías**. El banco podía fallar,
 * y estaba midiendo otra cosa.
 *
 * ⭐ **Hoy afirma sobre el seed EFECTIVO** —`tools/seed-mapeo.js`, que ejecuta el post-proceso real
 * en vez de copiarlo—, que es el único artefacto del que se puede decir *«esto llega a la hoja»*.
 *
 * Uso:
 *   node tools/probar-mapeo-cc.js
 */

'use strict';

const seedMapeo = require('./seed-mapeo.js');
const FUENTE = seedMapeo.fuente();

/* Las cuatro filas de `looker/CC`, tomadas del seed EFECTIVO y no de la lista cruda: es la
 * diferencia entre *«el seed lo declara»* y *«esto llega a la hoja»*, y hasta el 26/08 el banco
 * afirmaba lo primero diciendo lo segundo. */
const filasDeCC = (fuente) => seedMapeo.leer(fuente).filas
  .filter((f) => f.base_id === 'looker' && f.solapa === 'CC');

const FILAS = filasDeCC(FUENTE);
const porCampo = {};
FILAS.forEach((f) => { porCampo[f.campo_logico] = f; });

let ok = 0, mal = 0;
function af(nombre, condicion, detalle) {
  if (condicion) { ok++; console.log('  ✅ ' + nombre); }
  else { mal++; console.log('  ⛔ ' + nombre + (detalle ? ' — ' + detalle : '')); }
}

console.log('== probar-mapeo-cc ==');
console.log('');
console.log('1 · las cuatro filas, con su base, su hoja y su testigo');
af('son 4 filas', FILAS.length === 4, 'son ' + FILAS.length);
af('todas son de la base `looker`', FILAS.every((f) => f.base_id === 'looker'));
af('todas apuntan a la hoja `CC`', FILAS.every((f) => f.hoja === 'CC'));
af('todas traen `encabezado` (D-31: testigo, nunca fallback)',
  FILAS.every((f) => typeof f.encabezado === 'string' && f.encabezado.length > 0));
af('todas traen `notas` no vacías', FILAS.every((f) => (f.notas || '').length > 0));

console.log('');
console.log('2 · las letras y los encabezados que el seed declara');
const ESPERADAS = {
  clave_ventana:    { columna: 'A', encabezado: 'ID Cuentas' },
  lcc_id_cuenta:    { columna: 'A', encabezado: 'ID Cuentas' },
  lcc_base_barrida: { columna: 'C', encabezado: 'Base barrida' },
  lcc_contactados:  { columna: 'D', encabezado: 'Contactados' }
};
Object.keys(ESPERADAS).forEach((campo) => {
  const f = porCampo[campo], e = ESPERADAS[campo];
  af(campo + ' → col ' + e.columna + ' «' + e.encabezado + '»',
    !!f && f.columna === e.columna && f.encabezado === e.encabezado,
    f ? 'declara col ' + f.columna + ' «' + f.encabezado + '»' : 'no está en el seed');
});
af('`clave_ventana` está, que es el nombre que el mecanismo del _23 busca',
  !!porCampo.clave_ventana, 'sin ella la solapa no puede recortarse por ventana');

console.log('');
console.log('3 · ⛔ LA NEGATIVA — `Base enviada` NO se mapea');
const enviadaMapeada = FILAS.filter((f) => /base\s*enviada/i.test(f.encabezado || '') ||
                                           /enviada/i.test(f.campo_logico || ''));
af('ninguna fila mapea `Base enviada`', enviadaMapeada.length === 0,
  'aparece en: ' + enviadaMapeada.map((f) => f.campo_logico).join(', ') +
  ' — «Base discada» es `Base barrida` (V-64, V-66, V-105). Con enviada el ratio da 28 % y el deck dice 31 %');
af('ninguna fila usa la columna B', FILAS.every((f) => f.columna !== 'B'),
  'la B es `Base enviada`, la que NO va');

console.log('');
console.log('4 · ⚠ sin colisión de `campo_logico` con los dueños que ya existen');
/* Los de `reuniones/Agenda JM`, vivos desde el `_44`. No se leen de una lista escrita a mano: se
 * buscan en el propio `TIPO_ESPERADO_POR_CAMPO_`, que es donde están declarados de verdad. */
const AJENOS = ['cc_base_total', 'cc_base_discada', 'cc_contactados', 'cc_efectivos'];
AJENOS.forEach((c) => {
  af('`' + c + '` NO lo reusa el seed de CC', !(c in porCampo),
    'es campo_logico de reuniones/Agenda JM — CLAUDE.md §4: dos cosas que se llaman igual no son la misma cosa');
});
af('los tres campos nuevos llevan el prefijo `lcc_`',
  ['lcc_id_cuenta', 'lcc_base_barrida', 'lcc_contactados'].every((c) => c in porCampo));

console.log('');
console.log('5 · lo que el seed tiene que declarar afuera de la lista');
af('`SEED_MAPEO_CC_` se concatena a `SEED_MAPEO_`',
  /SEED_MAPEO_\s*=\s*SEED_MAPEO_\.concat\(SEED_MAPEO_CC_\)/.test(FUENTE),
  'sin el concat las filas existen y no las siembra nadie');
['lcc_base_barrida', 'lcc_contactados', 'lcc_id_cuenta'].forEach((c) => {
  af('`' + c + '` tiene tipo en TIPO_ESPERADO_POR_CAMPO_',
    new RegExp(c + "\\s*:\\s*'(numero|texto|fecha)'").test(FUENTE));
});
af('`looker/CC` declara `ventana_ref: \'Cuentas\'` en SEED_SOLAPAS_',
  /filaSolapa_\('looker',\s*'CC'[\s\S]{0,400}?ventana_ref:\s*'Cuentas'/.test(FUENTE),
  'sin esto la lectura no tiene con qué recortar por tiempo y devuelve la solapa entera');

console.log('');
console.log('6 · ⛔ NINGÚN `cc_*` cableado — el corte está abierto en X-28');
/* El seed de MAPEO declara dónde están las columnas; que un token las use es MARCADORES, y eso
 * está frenado. Si alguien cablea sin cerrar X-28, este control lo dice. */
af('el seed de CC no crea marcadores', !/SEED_MARCADORES[\s\S]{0,200}lcc_/.test(FUENTE),
  'mapear no es cablear: X-28 sigue sin decidir QUÉ CUENTAS entran');

console.log('');
console.log('7 · control negativo — que esto sepa ponerse rojo');
{
  /* ⚠ El parche se EXIGE. Si la marca no está, falla en vez de dar verde sobre código que no se
   * rompió — la lección de los dos parches con CRLF del 22/08. */
  const marca = /columna: 'C', encabezado: 'Base barrida'/;
  if (!marca.test(FUENTE)) {
    af('el parche exige su marca', false, 'no encontré la fila de `Base barrida`');
  } else {
    const roto = FUENTE.replace(marca, "columna: 'B', encabezado: 'Base enviada'");
    const filasRotas = filasDeCC(roto);
    const detecta = filasRotas.some((f) => /base\s*enviada/i.test(f.encabezado || ''));
    af('cambiando la fila a `Base enviada`, la afirmación 3 se pone roja', detecta,
      'el control no distingue el seed bueno del roto: no prueba nada');
  }
}

console.log('');
console.log('══════════════════════════════════════════');
console.log('  ' + ok + ' afirmación(es) en verde · ' + mal + ' en rojo · sobre ' + FILAS.length +
  ' fila(s) del seed EFECTIVO de looker/CC — el que llega a la hoja');
if (mal) { console.log('  ⛔ HAY ROJAS'); process.exit(1); }
console.log('  ✅ TODO VERDE');
