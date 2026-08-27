/**
 * tools/asistente-contexto.js — **el contexto compartido de los bancos del asistente lineal**
 * (`2026-08-27_1`, `D-44`).
 *
 * ⭐ **Carga los `.gs` REALES**: `Fuentes.gs` (el corte viernes-jueves), `Instalar.gs` (el escritor
 * de `PERIODOS`) y `PanelBackend.gs` (el asistente). Ninguna de las funciones que se mide se copia
 * ni se reescribe acá — `CLAUDE.md` §4: *cuando la lógica existe en un `.gs`, se extrae la función
 * real*. Lo único falseado es **la plataforma**: las hojas, `Utilities` y `Logger`.
 *
 * ⚠ **Esto NO es un banco**: no afirma nada y `tools/suites.js` no lo corre — su patrón es
 * `probar-*.js`. Es la mitad que los cuatro bancos del asistente comparten, y vive en un archivo
 * porque cuatro copias del mismo contexto es la figura de las tres listas duplicadas, con la
 * diferencia de que acá la duplicación **no** es el diseño.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const RAIZ = path.join(__dirname, '..');

/** Los encabezados vivos de cada hoja que los bancos falsean. */
const HEADERS = {
  PERIODOS: ['periodo_id', 'desde', 'hasta', 'notas'],
  REUNIONES: ['periodo_id', 'orden', 'eje', 'tipo', 'nombre', 'fecha', 'etapa', 'mostrar',
    'texto_original', 'notas'],
  CAMPANAS: ['periodo_id', 'campana_id', 'nombre', 'informe_id', 'base_id', 'tipo', 'desde',
    'hasta', 'mostrar', 'orden', 'id_cuenta', 'notas'],
  ANCLAJE_PENDIENTE: ['tipo', 'nombre_buscado', 'candidato_1', 'puntaje_1', 'candidato_2',
    'puntaje_2', 'candidato_3', 'puntaje_3', 'elegido', 'archivada']
};

/** Una hoja en memoria con la forma que usan los lectores del motor. */
function hoja(nombre, filasIniciales) {
  const cabecera = HEADERS[nombre];
  if (!cabecera) throw new Error('hoja(): no hay encabezados declarados para "' + nombre + '"');
  const filas = [cabecera.slice()].concat((filasIniciales || []).map((f) => f.slice()));

  return {
    __nombre: nombre,
    __filas: filas,
    getName: () => nombre,
    getLastRow: () => filas.length,
    getLastColumn: () => cabecera.length,
    getDataRange: () => ({ getValues: () => filas.map((f) => f.slice()) }),
    appendRow: (f) => { filas.push(f.slice()); },
    getRange: (fila, col, nFilas, nCols) => ({
      setValue: (v) => {
        while (filas.length < fila) filas.push([]);
        filas[fila - 1][col - 1] = v;
      },
      setValues: (m) => {
        m.forEach((f, i) => {
          const n = fila - 1 + i;
          while (filas.length <= n) filas.push([]);
          f.forEach((v, k) => { filas[n][col - 1 + k] = v; });
        });
      },
      getValues: () => {
        const out = [];
        for (let i = 0; i < (nFilas || 1); i++) {
          const o = filas[fila - 1 + i] || [];
          const l = [];
          for (let k = 0; k < (nCols || cabecera.length); k++) {
            l.push(o[col - 1 + k] !== undefined ? o[col - 1 + k] : '');
          }
          out.push(l);
        }
        return out;
      }
    })
  };
}

/**
 * El contexto con los tres `.gs` cargados.
 *
 * `hojas` es `{ PERIODOS: [...filas], REUNIONES: [...] }` — sólo las que el banco necesita. Una
 * hoja que no se declara **no existe**, que es lo que hace `getSheetByName` en la planilla real.
 *
 * `parchear` recibe `{archivo, texto}` y devuelve el texto mutado, para los controles negativos.
 * ⛔ **Si el parche no cambia nada, tira** — la guarda del 24/08: sin «después» no hay control.
 */
function contexto(hojas, parchear) {
  const creadas = {};
  Object.keys(hojas || {}).forEach((n) => { creadas[n] = hoja(n, hojas[n]); });

  const ctx = {
    console, Math, JSON, Date, String, Number, Object, Array, RegExp, isNaN, Error,
    parseInt, parseFloat, encodeURIComponent, decodeURIComponent,
    Logger: { log: () => {} },
    SpreadsheetApp: {
      getActiveSpreadsheet: () => ({
        getSheetByName: (n) => creadas[n] || null,
        insertSheet: (n) => { creadas[n] = hoja(n, []); return creadas[n]; }
      }),
      flush: () => {}
    },
    Utilities: {
      formatDate: (f, _tz, patron) => {
        const dd = (n) => (n < 10 ? '0' : '') + n;
        if (patron === 'yyyy-MM-dd') return f.getFullYear() + '-' + dd(f.getMonth() + 1) + '-' + dd(f.getDate());
        return f.getFullYear() + '-' + dd(f.getMonth() + 1) + '-' + dd(f.getDate()) + ' ' +
          dd(f.getHours()) + ':' + dd(f.getMinutes()) + ':' + dd(f.getSeconds());
      }
    },
    Session: { getScriptTimeZone: () => 'America/Argentina/Buenos_Aires' },
    /* De `Fuentes.gs` / `Parseo.gs`. Se falsean porque su cadena de dependencias arrastra media
     * planilla; lo que este banco mide no es cómo se parsea una fecha. */
    parsearFechaCelda_: (v) => {
      if (v instanceof Date) return v;
      const t = String(v == null ? '' : v).trim();
      let m = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(t);
      if (m) return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
      m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(t);
      if (m) return new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]));
      return null;
    },
    formatearFecha_: (f) => {
      const dd = (n) => (n < 10 ? '0' : '') + n;
      return dd(f.getDate()) + '/' + dd(f.getMonth() + 1) + '/' + f.getFullYear();
    },
    /* `Config.gs`. Los bancos que necesiten otro valor lo pisan después de crear el contexto. */
    leerConfig: () => ({ tope_dias_ventana_cuenta: '90' }),
    esVerdadero_: (v) => {
      const t = String(v == null ? '' : v).trim().toLowerCase();
      return t === 'sí' || t === 'si' || t === 'true' || t === 'x' || t === '1';
    },
    normalizar_: (v) => String(v == null ? '' : v).trim().toLowerCase()
      .normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, ' ')
  };
  vm.createContext(ctx);

  const cargar = (archivo, extraer) => {
    let texto = fs.readFileSync(path.join(RAIZ, archivo), 'utf8');
    if (extraer) {
      const trozos = extraer.map((re) => {
        const m = texto.match(re);
        if (!m) throw new Error('No se pudo extraer ' + re + ' de ' + archivo);
        return m[0];
      });
      texto = trozos.join('\n');
    }
    if (parchear) {
      const antes = texto;
      texto = parchear({ archivo, texto });
      /* ⛔ La guarda del 24/08: si el parche no aplicó, no hay «después» y el control mide el
       * código intacto — verde sin haber probado nada. */
      if (archivo === parchear.__archivo && texto === antes) {
        throw new Error('El parche de «romper a propósito» no matcheó nada en ' + archivo + '.');
      }
    }
    vm.runInContext(texto, ctx, { filename: archivo });
  };

  cargar('Fuentes.gs', [
    /function semanaR11_\([\s\S]*?\r?\n\}/,
    /function ultimaSemanaCerradaR11_\([\s\S]*?\r?\n\}/
  ]);
  /* ⭐ El parser de fechas del temario, REAL: `parsearLineaReunion_` lo usa para decidir si una
   * línea se pudo interpretar, y un parser propio acá mediría otra cosa. */
  cargar('Parseo.gs', [/function parsearFecha_\([\s\S]*?\r?\n\}/]);
  cargar('Instalar.gs');
  /* ⚠ Los dos cargadores de temario van enteros: lo que el paso 2 hace es **rutear** hacia ellos,
   * así que copiarlos sería el instrumento que reproduce lógica del motor y la reproduce peor. */
  cargar('Reuniones.gs');
  cargar('Campanas.gs');
  cargar('PanelBackend.gs');

  ctx.__hojas = creadas;
  return ctx;
}

/** Corre una expresión en el contexto, con los argumentos puestos en `__a`. */
function llamar(ctx, expresion, args) {
  ctx.__a = args || [];
  return vm.runInContext(expresion, ctx);
}

module.exports = { RAIZ, HEADERS, hoja, contexto, llamar, fs, path, vm };
