#!/usr/bin/env node
/**
 * tools/probar-ministros.js — las nueve filas de ministros (`2026-09-01_4` Parte B).
 *
 * ⭐⭐ **Lo que este banco existe para afirmar, y es lo único que no se ve leyendo la tabla:**
 * los tres `PCT` son el **RATIO DE LAS SUMAS**, no la **suma de los ratios**. Las dos definiciones
 * dan **el mismo número con una sola fila** — por eso el caso se arma con **dos filas de valores
 * distintos**, que es lo único que las separa. Un fixture cuyo dato satisface las dos afirmaciones
 * no distingue entre ellas (`Pruebas.gs:456`, `CLAUDE.md` §4).
 *
 * ⚠ **Se extrae `opRATIO`/`opPCT` REALES de `Marcadores.gs`, no se reimplementan.** Reproducir la
 * lógica del motor en node es el error que este repo ya cometió cuatro veces.
 *
 * ⛔ **Lo que este banco NO afirma, dicho para que el verde no se lea de más:** que los nueve
 * números sean correctos. Nacen **PROPUESTA** — el fixture del 28/08 no llega a la semana del
 * informe— y **el control es una corrida**. Acá se prueba la **definición**, no el valor.
 *
 * Uso:  node tools/probar-ministros.js
 */

'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const RAIZ = path.join(__dirname, '..');

let fallas = 0;
function afirmar(condicion, mensaje) {
  if (condicion) console.log('  ✅ ' + mensaje);
  else { fallas++; console.log('  ⛔ ' + mensaje); }
}

/* ── Las dos tablas REALES, extraídas de `Instalar.gs` ─────────────────────────────────── */
function tablasReales() {
  const src = fs.readFileSync(path.join(RAIZ, 'Instalar.gs'), 'utf8');
  const trozos = [];
  for (const nombre of ['FILAS_MINISTROS_', 'MAPEO_MINISTROS_']) {
    const i = src.indexOf('var ' + nombre + ' = [');
    if (i === -1) throw new Error('no encontré `' + nombre + '` en Instalar.gs');
    const fin = src.indexOf('\n];', i);
    if (fin === -1) throw new Error('no encontré el cierre de `' + nombre + '`');
    trozos.push(src.slice(i, fin + 3));
  }
  const i = src.indexOf('var PORCENTAJES_NO_MAPEADOS_MINISTROS_ = [');
  if (i === -1) throw new Error('no encontré `PORCENTAJES_NO_MAPEADOS_MINISTROS_` en Instalar.gs');
  trozos.push(src.slice(i, src.indexOf('\n];', i) + 3));
  const ctx = { };
  vm.createContext(ctx);
  vm.runInContext(trozos.join('\n'), ctx);
  return { filas: ctx.FILAS_MINISTROS_, mapeo: ctx.MAPEO_MINISTROS_,
    pct: ctx.PORCENTAJES_NO_MAPEADOS_MINISTROS_ };
}

/* ── `opRATIO` / `opPCT` REALES, extraídos de `Marcadores.gs` ──────────────────────────── */
function opsReales() {
  const src = fs.readFileSync(path.join(RAIZ, 'Marcadores.gs'), 'utf8');
  const i = src.indexOf('function opRATIO(ctx) {');
  const j = src.indexOf('\n}', src.indexOf('function opPCT(ctx) {'));
  if (i === -1 || j === -1) throw new Error('no encontré `opRATIO`/`opPCT` en Marcadores.gs');
  const ctx = { trazaDeVentana_: () => '' };   // única dependencia, y no participa del número
  vm.createContext(ctx);
  vm.runInContext(src.slice(i, j + 2), ctx);
  return ctx;
}

const T = tablasReales();
const OPS = opsReales();

console.log('═══ A · las nueve filas, y son nueve ═══');
{
  const esperados = ['emin_encuentros', 'emin_alcance', 'emin_alcance_semanal', 'emin_aperturas',
    'emin_clics_ctor', 'emin_clics_ctr', 'emin_or', 'emin_ctor', 'emin_ctr'];
  afirmar(T.filas.length === 10, 'son 10 filas (hay ' + T.filas.length + ')');
  esperados.forEach(m => afirmar(T.filas.some(f => f.marcador === m), '  está `' + m + '`'));
  /* ⭐⭐ `2026-09-03` — **la afirmación se DA VUELTA con su motivo, no se afloja.** Decía
   * «`emin_lista` NO está — espera la operación con plantilla». **Era cierta y dejó de serlo**: la
   * operación `LISTA_TEXTO` existe desde hoy y la ventana quedó decidida, así que la fila entra.
   * ⭐ Y se le SUBE la exigencia: no alcanza con que exista, tiene que usar la operación correcta
   * y llevar el condicional — cablearla con `LISTA_CRUDA` publicaría 5 donde hay 7, sin fallar. */
  const lista = T.filas.find(f => f.marcador === 'emin_lista');
  afirmar(!!lista, '⭐⭐ `emin_lista` SÍ está — la operación existe y la ventana quedó decidida');
  afirmar(!!lista && lista.operacion === 'LISTA_TEXTO',
    '⭐ y usa `LISTA_TEXTO`, no `LISTA_CRUDA` — aquélla deduplica y publicaría 5 donde hay 7');
  afirmar(!!lista && /\{figura=Seguridad en tu barrio\?barrio\}/.test(lista.campo_logico),
    '⭐⭐ y lleva el condicional CON el literal en la celda: ' + (lista ? lista.campo_logico : ''));
  afirmar(!!lista && /_revisar$/.test(lista.formato), '   y nace con `_revisar` como las otras nueve');
}

console.log('\n═══ B · ⛔ las nueve nacen con `_revisar`, sin excepción ═══');
{
  /* ⭐ En el `_1` hubo excepción porque `V-49` existía y se reprodujo. Acá **no hay caso para
   * esta fuente**, así que `D-56` no permite levantar nada. */
  const sinMarca = T.filas.filter(f => !/_revisar$/.test(f.formato));
  afirmar(sinMarca.length === 0,
    '⭐⭐ las ' + T.filas.length + ' llevan `_revisar` (sin marca: ' + (sinMarca.map(f => f.marcador).join(', ') || 'ninguna') + ')');
  afirmar(T.filas.filter(f => f.formato === 'entero_revisar').length === 6, 'seis `entero_revisar`');
  afirmar(T.filas.filter(f => f.formato === 'porcentaje_revisar').length === 3, 'tres `porcentaje_revisar`');
  afirmar(T.filas.filter(f => f.formato === 'texto_revisar').length === 1, 'y un `texto_revisar` — `emin_lista`');
}

console.log('\n═══ C · ⭐⭐ los PCT son RATIO DE LAS SUMAS — con DOS filas, que es lo que separa ═══');
{
  const pct = T.filas.filter(f => f.operacion === 'PCT');
  afirmar(pct.length === 3, 'son tres PCT');
  pct.forEach(f => afirmar(f.campo_logico.indexOf('/') !== -1,
    '  `' + f.marcador + '` declara `numerador/denominador`: ' + f.campo_logico));

  /* ⛔⛔ EL CASO QUE DISTINGUE. Dos filas con ratios MUY distintos:
   *      fila 1 → 50/100 = 50 %      fila 2 → 5/900 = 0,56 %
   *   ratio de las sumas  = 55/1000 = 5,5 %      ← lo que el motor hace
   *   suma de los ratios / 2 = (50 + 0,56)/2 = 25,3 %   ← lo que haría SUM(I)
   * Con UNA sola fila los dos dan lo mismo, y el caso no probaría nada. */
  const r = OPS.opPCT({ valoresNumerador: [50, 5], valoresDenominador: [100, 900], campo_logico: 'ap/ent' });
  const promedioDeRatios = (50 / 100 + 5 / 900) / 2 * 100;
  afirmar(Math.abs(r.valor - 5.5) < 1e-9,
    '⭐⭐ `opPCT` REAL da 5,5 % = SUMA(50,5)/SUMA(100,900) — el ratio de las SUMAS');
  afirmar(Math.abs(promedioDeRatios - 25.28) < 0.01, '   la suma/promedio de los ratios daría 25,28 %');
  afirmar(Math.abs(r.valor - promedioDeRatios) > 19,
    '⭐⭐ y DIFIEREN por más de 19 puntos ⇒ el fixture SÍ distingue las dos definiciones');

  /* Control del control: con UNA fila coinciden, que es por qué hacen falta dos. */
  const una = OPS.opPCT({ valoresNumerador: [50], valoresDenominador: [100], campo_logico: 'ap/ent' });
  afirmar(Math.abs(una.valor - 50) < 1e-9,
    '⚠ con UNA sola fila las dos definiciones dan 50 % — por eso el caso lleva dos');
}

console.log('\n═══ D · ⛔ las columnas de `%` NO se mapean — mapearlas invita a sumarlas ═══');
{
  ['I', 'K', 'S'].forEach(c => afirmar(!T.mapeo.some(m => m.columna === c),
    '  la columna `' + c + '` (un `%`) NO está en MAPEO'));
  const nums = T.mapeo.filter(m => m.tipo_esperado === 'numero').map(m => m.columna).sort();
  afirmar(nums.join(',') === 'F,G,H,J,Q,R', 'las numéricas son exactamente F,G,H,J,Q,R (dio ' + nums.join(',') + ')');

  /* ⭐⭐ El motivo tiene que estar EN LA FILA, no sólo en el reporte (usuario, 03/09). Un reporte
   * se lee una vez; la fila la lee quien esté por mapear esa columna. */
  afirmar(T.pct.length === 3, 'las tres `%` están declaradas con su motivo (' + T.pct.length + ')');
  T.pct.forEach(x => afirmar(!T.mapeo.some(m => m.columna === x.columna),
    '  `' + x.columna + '` (' + x.encabezado + ') declarada como NO mapeada, y no está en MAPEO'));

  /* ⛔ Cada PCT nombra SU columna en `notas` — y se cruza contra la tabla, uno por uno. */
  const notaDe = m => String(T.filas.find(f => f.marcador === m).nota || '');
  [['emin_or', 'I'], ['emin_ctor', 'K'], ['emin_ctr', 'S']].forEach(([mk, col]) => {
    const n = notaDe(mk);
    afirmar(n.indexOf('columna ' + col) !== -1,
      '⭐ `' + mk + '` lleva el motivo en su fila, nombrando la columna ' + col);
    afirmar(/NO se mapea a proposito/.test(n), '   y dice que NO se mapea a propósito');
  });
  /* ⚠ Los seis que no son PCT no llevan nota: la nota es del caso, no decoración. */
  /* ⭐ Cuatro desde el 03/09: los tres PCT más `emin_lista`, que declara dónde vive su literal. */
  afirmar(T.filas.filter(f => f.nota).length === 4,
    '⚠ llevan nota propia sólo los tres PCT y `emin_lista` — no se decoró a los otros seis');
}

console.log('\n═══ E · ⚠ por LETRA, y el encabezado byte a byte ═══');
{
  /* ⛔ El caso que motiva el banco: `R` lleva un SALTO DE LÍNEA adentro del título. */
  const r = T.mapeo.find(m => m.columna === 'R');
  afirmar(!!r && r.campo_logico === 'clics_meta', '`R` es `clics_meta`');
  afirmar(!!r && r.encabezado === 'Clics\nMeta',
    '⭐⭐ su `encabezado` es exactamente "Clics\\nMeta" — CON el salto, byte a byte');
  afirmar(!!r && r.encabezado !== 'Clics Meta',
    '⛔ y NO es "Clics Meta": así lo muestra `SOLAPAS.firma_encabezado`, que colapsa por `R-10`');

  /* Toda fila declara letra Y encabezado — `D-31`, y escribir una sin la otra deja el hueco. */
  T.mapeo.forEach(m => afirmar(/^[A-Z]$/.test(m.columna) && String(m.encabezado).trim() !== '',
    '  `' + m.campo_logico + '` lleva letra (' + m.columna + ') Y encabezado'));

  /* ⭐⭐ El corte de la ventana: `ventana_ref = propia` lo manda al `fecha_periodo` de la solapa,
   * y ése tiene que ser el ENVÍO —columna E—, no la fecha del encuentro. */
  /* ⭐⭐ `2026-09-03` — **dada vuelta con su motivo.** Decía «`fecha_periodo` es la columna E — el
   * corte es por ENVÍO», y era cierta hasta hoy. El corte pasó a `D` (el encuentro) con la ventana
   * viernes a viernes, y con eso **el desplazamiento −3 se cae entero**: era un rodeo para
   * compensar una ventana cortada un día antes de tiempo.
   * ⛔ **Y la afirmación negativa que hace falta al lado:** que ya NO corte por `E`. Sin ella,
   * volver a apuntar `fecha_periodo` a `E` no rompería nada. */
  const fp = T.mapeo.find(m => m.campo_logico === 'fecha_periodo');
  afirmar(!!fp && fp.columna === 'D',
    '⭐⭐ `fecha_periodo` es la columna D (Fecha, el ENCUENTRO) — el corte ya no es por envío');
  afirmar(!!fp && fp.columna !== 'E',
    '⛔ y NO es la E: si volviera, publicaría 7 con OTRAS siete y el conteo no lo diría');
  afirmar(T.mapeo.some(m => m.campo_logico === 'fecha' && m.columna === 'D'),
    '   `fecha` (D) es la que usa la plantilla de `emin_lista`');
  /* ⛔ `E` no se desmapea: cambia cuál se usa para cortar, no qué existe (decisión del usuario). */
  afirmar(T.mapeo.some(m => m.campo_logico === 'fecha_envio' && m.columna === 'E'),
    '⭐ `E` sigue mapeada, como `fecha_envio` — cambia cuál corta, no qué existe');

  /* ⭐ `2026-09-03` — las once, ya completas. */
  afirmar(T.mapeo.length === 12, 'son DOCE filas de MAPEO (hay ' + T.mapeo.length + ')');
  [['id', 'A'], ['barrio', 'C'], ['enviados', 'F']].forEach(([c, col]) =>
    afirmar(T.mapeo.some(m => m.campo_logico === c && m.columna === col),
      '  `' + c + '` en la columna ' + col));
  /* ⚠ `D` aparece DOS veces a propósito —`fecha_periodo` y `fecha`—: dos nombres lógicos con
   * consumidores distintos sobre la misma columna. Lo que no puede repetirse es el `campo_logico`. */
  const letras = T.mapeo.map(m => m.columna);
  afirmar(letras.filter(x => x === 'D').length === 2,
    '⚠ `D` se declara dos veces a propósito: `fecha_periodo` (corta) y `fecha` (la plantilla)');
  const campos = T.mapeo.map(m => m.campo_logico);
  afirmar(new Set(campos).size === campos.length, '⚠ ningún `campo_logico` se repite');
}

console.log('\n═══ E bis · ⭐⭐ `SOLAPAS.ventana_ref` se escribe, y con la constante REAL ═══');
{
  const src = fs.readFileSync(path.join(RAIZ, 'Instalar.gs'), 'utf8');
  const i = src.indexOf('function escribirVentanaPropiaMinistros_');
  const cuerpo = src.slice(i, i + 3000);
  afirmar(i !== -1, 'existe `escribirVentanaPropiaMinistros_`');
  /* ⛔ La constante sale de `Fuentes.gs`: escribir el literal `'propia'` acá sería el valor que un
   * día cambia de un lado solo. */
  afirmar(/setValue\(VENTANA_PROPIA_\)/.test(cuerpo),
    '⭐⭐ escribe `VENTANA_PROPIA_`, la constante de `Fuentes.gs` — no el literal');
  afirmar(/var VENTANA_PROPIA_ = 'propia';/.test(fs.readFileSync(path.join(RAIZ, 'Fuentes.gs'), 'utf8')),
    '   y esa constante existe y vale `propia`');
  afirmar(/no se pisa/.test(cuerpo), '⚠ no pisa otro valor: lo reporta y para');
  afirmar(/getRange\(fila, iV \+ 1\)\.getValue\(\)/.test(cuerpo),
    '⭐⭐ RELEE de la hoja, no del retorno del escritor — son dos afirmaciones distintas');
  afirmar(/ya estaba \(idempotente\)/.test(cuerpo), '   y ya-estaba es éxito, no error');

  /* ⛔⛔ Y va DENTRO del mismo wrapper: separarlo crearía el estado intermedio que rompe. */
  const w = src.slice(src.indexOf('function cablearMinistros_'), src.indexOf('function escribirVentanaPropiaMinistros_'));
  afirmar(/escribirVentanaPropiaMinistros_\(\)/.test(w),
    '⭐⭐ `cablearMinistros_` la llama: filas cableadas SIN su ventana es el estado que rompe');
  afirmar(/universo más ancho/.test(w),
    '   y el fallo dice que sin ventana los nueve leen un universo más ancho');

  /* ⭐⭐ EL ORDEN, que es lo único que hace que la guarda sirva (03/09). Con `ventana_ref` al
   * final, un fallo dejaba las 9 filas y las 11 de MAPEO YA escritas y sin recorte — el estado
   * exacto que el wrapper dice evitar. Un `ok:false` que deja el daño hecho es un aviso, no una
   * guarda. Se afirma por POSICIÓN porque es lo único que lo distingue. */
  const pos = t => w.indexOf(t);
  afirmar(pos('var bk = backupMarcadores_') !== -1 && pos('var ventana = escribirVentanaPropiaMinistros_') !== -1,
    'están el backup y la ventana');
  afirmar(pos('var bk = backupMarcadores_') < pos('var ventana = escribirVentanaPropiaMinistros_'),
    '  el backup va ANTES que la ventana');
  afirmar(pos('var ventana = escribirVentanaPropiaMinistros_') < pos('hoja.getRange(existentes[x.marcador]'),
    '⭐⭐ la VENTANA va antes de escribir la primera fila de MARCADORES');
  afirmar(pos('var ventana = escribirVentanaPropiaMinistros_') < pos('hojaMap.appendRow'),
    '⭐⭐ y antes de la primera de MAPEO');
  /* ⛔ Y el aborto devuelve CERO escritas, no el total: decir 9 ahí sería mentir. */
  afirmar(/motivo: 'ventana_ref: ' \+ ventana\.motivo, backup: bk\.nombre,\s*\r?\n?\s*marcadores: 0, mapeo: 0/.test(w),
    '⭐ y si falla devuelve `marcadores: 0, mapeo: 0` — no el total, que sería mentira');

  /* ⭐ El wrapper suelto, para correrlo y verificarlo antes del resto. Sin `_` y SIN parámetros,
   * que son las dos condiciones para que aparezca en el desplegable del editor. */
  afirmar(/function ventanaPropiaDeMinistros\(\) \{/.test(src),
    '⭐ existe `ventanaPropiaDeMinistros()` — público y SIN parámetros');
  afirmar(/inerte/.test(src.slice(src.indexOf('function ventanaPropiaDeMinistros'))),
    '   y dice que correrlo solo es inerte: nadie lee esa ventana todavía');
}

console.log('\n═══ F · ⭐ cruce contra la firma REAL de la solapa (snapshot de `SOLAPAS`) ═══');
{
  /* ⚠ Evidencia FECHADA: la firma sale del snapshot y vale para su día. Lo que se cruza es la
   * correspondencia letra→título, que es lo que un `encabezado` inventado rompería. */
  const snaps = fs.readdirSync(path.join(RAIZ, 'docs', '_snapshots'))
    .filter(f => /^SOLAPAS_.*\.tsv$/.test(f)).sort();
  afirmar(snaps.length > 0, 'hay al menos un snapshot de SOLAPAS');
  if (snaps.length) {
    const ultimo = snaps[snaps.length - 1];
    const txt = fs.readFileSync(path.join(RAIZ, 'docs', '_snapshots', ultimo), 'utf8');
    const cab = txt.split(/\r?\n/)[0].split('\t');
    const iFirma = cab.indexOf('firma_encabezado'), iSol = cab.indexOf('solapa');
    const fila = txt.split(/\r?\n/).slice(1)
      .map(l => l.split('\t')).find(c => c[iSol] === 'Agenda funcionarios');
    afirmar(!!fila, 'la solapa `Agenda funcionarios` está en ' + ultimo);
    if (fila) {
      const titulos = fila[iFirma].split(' · ').map(s => s.trim());
      console.log('     (firma de ' + ultimo + ': ' + titulos.length + ' columnas)');
      T.mapeo.forEach(m => {
        const pos = m.columna.charCodeAt(0) - 65;          // A→0
        /* ⭐ Se compara NORMALIZADO, y ésa es la corrección: la firma ya viene colapsada por
         * `R-10`, así que exigirle el `\n` de `R` la haría fallar por una diferencia que es
         * del snapshot y no del mapeo. El byte a byte se afirma arriba, contra la constante. */
        const esperado = String(m.encabezado).replace(/\s+/g, ' ').trim();
        afirmar(titulos[pos] === esperado,
          '  ' + m.columna + ' → "' + esperado + '"' +
          (titulos[pos] === esperado ? '' : ' ⛔ la firma dice "' + titulos[pos] + '"'));
      });
    }
  }
}

console.log('\n═══ G · control NEGATIVO — el banco PUEDE fallar ═══');
{
  /* ⛔ Sin esto, «todas pasaron» y «el banco no mide nada» se ven igual (`CLAUDE.md` §4). */
  const antes = fallas;
  const mutada = T.filas.map(f => Object.assign({}, f, { formato: f.formato.replace('_revisar', '') }));
  const sinMarca = mutada.filter(f => !/_revisar$/.test(f.formato));
  afirmar(sinMarca.length === T.filas.length,
    '⭐ quitándoles `_revisar` a las ' + T.filas.length + ', el criterio de la sección B las detecta a todas');
  afirmar(fallas === antes, '   y la mutación no ensució el conteo real');

  /* ⭐⭐ Y la mutación OCURRIÓ: sin esta guarda el negativo correría sobre el dato intacto. */
  afirmar(mutada[0].formato !== T.filas[0].formato,
    '⭐⭐ la mutación se aplicó de verdad (el formato cambió), no corrió sobre el original');
}

console.log('');
if (fallas) { console.log('⛔ ' + fallas + ' afirmación(es) FALLARON'); process.exit(1); }
console.log('✅ todas las afirmaciones pasaron');
console.log('⚠ Lo que este verde NO dice: que los nueve números sean correctos. Nacen PROPUESTA');
console.log('  y el control es una corrida — `emin_encuentros` tiene que dar 7.');
