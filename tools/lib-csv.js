/**
 * tools/lib-csv.js — **un solo lector de CSV para los instrumentos de `tools/`.**
 *
 * ⛔⛔ **Existe por una contradicción que este repo se produjo a sí mismo en una noche.** El
 * `2026-09-05_1` dejó dos instrumentos que leen **los mismos cuatro** `casos_validacion_*.csv`
 * con **métodos opuestos y motivos escritos que se contradicen**:
 *
 *   · `medir-casos-exactos-con-revisar.js` (Parte H) escribió un lector carácter a carácter y lo
 *     justificó así: *«partir por `\n` rompería si alguna nota tiene un salto adentro de las
 *     comillas»*.
 *   · `probar-caso-id.js` (Parte G) partió por `\n` y por la primera coma, y lo justificó al revés:
 *     *«un parser de CSV completo sería reimplementar lo que no hace falta»*.
 *
 * ⚠ **Y el laxo era el que la suite corre en cada corrida.** Las dos afirmaciones no pueden ser
 * ciertas a la vez, y **nada las comparaba** — es la familia de *«un comentario que afirma un
 * contrato es una premisa sin testigo»* (`CLAUDE.md` §4), con dos comentarios que se desmienten.
 *
 * ⭐ **Medido antes de decidir cuál gana:** hoy **no hay** ningún campo con salto de línea embebido
 * en los cuatro archivos —los dos lectores coinciden en **290** registros—, así que el laxo
 * funciona **por el estado de los datos**, no por su diseño. ⛔ Eso es un hueco justificado por el
 * estado actual, y esta biblioteca es el evento que lo cierra en vez de esperarlo.
 *
 * ⚠ **Esto NO viola «las tres listas duplicadas a propósito» de `CLAUDE.md` §2.** Aquéllas se
 * duplican porque `tools/` tiene que ser el **contra-qué independiente** del motor. Acá los dos
 * consumidores **no se verifican entre sí**: contestan preguntas distintas sobre el mismo archivo.
 * Compartir el lector no les quita independencia de nada.
 */

'use strict';

/**
 * Parte un CSV respetando comillas dobles, comillas escapadas (`""`) y **saltos de línea dentro de
 * un campo**. Devuelve un array de arrays de strings.
 */
function parsear(texto) {
  const filas = [];
  let campo = '', fila = [], enComillas = false;
  for (let i = 0; i < texto.length; i++) {
    const c = texto[i];
    if (enComillas) {
      if (c === '"') { if (texto[i + 1] === '"') { campo += '"'; i++; } else enComillas = false; }
      else campo += c;
    } else if (c === '"') enComillas = true;
    else if (c === ',') { fila.push(campo); campo = ''; }
    else if (c === '\n') { fila.push(campo); filas.push(fila); fila = []; campo = ''; }
    else if (c !== '\r') campo += c;
  }
  if (campo !== '' || fila.length) { fila.push(campo); filas.push(fila); }
  return filas;
}

/**
 * ⭐ **El denominador, que es lo que faltaba.** Cuenta cuántos registros ve el lector estricto y
 * cuántas líneas físicas tiene el archivo. **Si difieren, hay al menos un salto embebido** — y ese
 * es justo el caso en que partir por `\n` produce una fila fantasma.
 *
 * ⚠ Sirve para que un instrumento pueda **declarar cuánto midió** en vez de sólo cuánto encontró:
 * *«no descarté nada»* y *«descarté cinco y no lo dije»* se ven idénticos sin esto (`CLAUDE.md` §4).
 */
function universo(texto) {
  const registros = parsear(texto).filter(f => f.length > 1 || (f[0] || '').trim() !== '');
  const lineas = texto.split(/\r?\n/).filter(l => l.trim() !== '');
  return { registros: registros.length, lineas_fisicas: lineas.length,
    saltos_embebidos: lineas.length !== registros.length };
}

module.exports = { parsear, universo };
