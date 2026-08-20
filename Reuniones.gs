/**
 * Reuniones.gs — Paso 2.9D: el temario de reuniones (llega por WhatsApp, hoy se
 * transcribe a mano) como registro de configuración. Mismo patrón que CAMPANAS:
 * curado a mano — el motor PROPONE el parseo de una línea cruda, la persona
 * confirma con `mostrar`. R-02 (docs/REGLAS_NEGOCIO.md): el temario define el
 * universo del informe, no la fecha.
 *
 * Expone:
 *   leerReuniones_() -> filas con mostrar='sí', ordenadas por orden. Mismo
 *     contrato que leerCampanas() (Config.gs) — **y recién desde el 18/08/2026**.
 *     ⚠ Esta línea afirmaba lo mismo desde antes y era FALSA: `leerCampanas()`
 *     devolvía un mapa indexado por `campana_id` y **perdía filas repetidas en
 *     silencio**, mientras que ésta siempre devolvió una lista. La afirmación
 *     describía el diseño que se quería, no el que había, y sobrevivió sin que
 *     nada la contradijera. Hoy las dos hojas son listas de lo que se publica.
 *   parsearLineaReunion_(lineaCruda) -> objeto fila propuesto. SIEMPRE conserva
 *     `texto_original`; si no pudo interpretar, deja el resto vacío y
 *     `notas='no se pudo parsear'`. Nunca marca `mostrar='sí'` sola — eso lo
 *     decide la persona.
 *   cargarTemarioReuniones_(textoPegado) -> parsea cada línea no vacía y la
 *     agrega a REUNIONES con `mostrar=''`.
 *   menuCargarTemarioReuniones_() -> pide el texto por prompt de UI.
 *
 * Formato esperado de una línea: "[N)] eje | tipo nombre fecha (etapa)".
 * Ver docs/Prompts/Paso-2.9D.md y docs/TEMARIO_Y_PLANTILLA_2026-07-31.md.
 */

var TIPOS_REUNION_CONOCIDOS_ = [
  'Encuentro Temático',
  'Primera persona',
  'Uno a uno',
  'Reuniones de la semana',
  'Campañas y enviados de la semana',
  'ECV'
];

// `eje` -> `tipo` por defecto cuando el texto no trae uno de los TIPOS_REUNION_CONOCIDOS_
// de arriba. Ministros y M2 son bloques agregados de período, no encuentros
// individuales (docs/Prompts/Paso-2.9D.md, contexto).
var TIPO_AGREGADO_POR_EJE_ = { Ministros: 'Agregado', M2: 'Agregado' };

function leerReuniones_() {
  var hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('REUNIONES');
  if (!hoja) return [];

  var datos = hoja.getDataRange().getValues();
  var headers = datos.shift();
  var idx = {};
  headers.forEach(function (h, i) { idx[h] = i; });
  if (idx.eje === undefined || idx.mostrar === undefined) return [];

  return datos
    .filter(function (fila) { return fila[idx.eje] && esVerdadero_(fila[idx.mostrar]); })
    .sort(function (a, b) { return (Number(a[idx.orden]) || 0) - (Number(b[idx.orden]) || 0); })
    .map(function (fila) {
      var obj = {};
      headers.forEach(function (h, i) { obj[h] = fila[i]; });
      return obj;
    });
}

/**
 * Parsea una línea cruda del temario. Devuelve SIEMPRE un objeto con
 * `texto_original` completo; si no se puede interpretar eje/tipo/nombre/fecha,
 * el resto de los campos queda vacío y `notas='no se pudo parsear'` — no lanza,
 * no adivina, y `mostrar` sale siempre `''` (la persona confirma).
 */
function parsearLineaReunion_(lineaCruda) {
  var textoOriginal = String(lineaCruda === null || lineaCruda === undefined ? '' : lineaCruda).trim();
  // Paso 2.15 Parte B: `periodo_id` sale acá vacío a propósito — no se deduce de la
  // fecha de la línea. Con ventanas variables (R-11 Addendum 1) la fecha no determina
  // el período, así que lo pone el llamador o no lo pone nadie.
  var propuesta = { periodo_id: '', orden: '', eje: '', tipo: '', nombre: '', fecha: '', etapa: '', mostrar: '', texto_original: textoOriginal, notas: '' };
  if (!textoOriginal) return propuesta;

  var texto = textoOriginal;

  var numero = texto.match(/^(\d+)\)\s*/);
  if (numero) {
    propuesta.orden = Number(numero[1]);
    texto = texto.slice(numero[0].length);
  }

  var partes = texto.split('|');
  if (partes.length < 2) {
    propuesta.notas = 'no se pudo parsear';
    return propuesta;
  }
  propuesta.eje = partes[0].trim();
  var resto = partes.slice(1).join('|').trim();

  var parenFinal = resto.match(/\(([^)]*)\)\s*$/);
  var dentroParen = '';
  if (parenFinal) {
    dentroParen = parenFinal[1].trim();
    resto = resto.slice(0, parenFinal.index).trim();
  }
  if (/^pre$/i.test(dentroParen)) {
    propuesta.etapa = 'pre';
  } else if (/^post$/i.test(dentroParen)) {
    propuesta.etapa = 'post';
  } else if (dentroParen) {
    propuesta.notas = dentroParen; // ej. "24/07 al 30/07 inclusive - Acumulado"
  }

  var tipoEncontrado = TIPOS_REUNION_CONOCIDOS_
    .filter(function (t) { return resto.toLowerCase().indexOf(t.toLowerCase()) !== -1; })
    .sort(function (a, b) { return b.length - a.length; })[0]; // el más largo/específico primero

  var nombreYFecha = resto;
  if (tipoEncontrado) {
    propuesta.tipo = tipoEncontrado;
    var idxTipo = resto.toLowerCase().indexOf(tipoEncontrado.toLowerCase());
    nombreYFecha = resto.slice(idxTipo + tipoEncontrado.length).trim();
  } else if (TIPO_AGREGADO_POR_EJE_[propuesta.eje]) {
    propuesta.tipo = TIPO_AGREGADO_POR_EJE_[propuesta.eje];
  }

  var anioDefecto = new Date().getFullYear();
  var fecha = parsearFecha_(nombreYFecha, anioDefecto);
  var matchFecha = nombreYFecha.match(/\d{1,2}[\/\-]\d{1,2}(?:[\/\-]\d{2,4})?/);

  if (fecha) {
    propuesta.fecha = fecha;
    var nombre = matchFecha ? nombreYFecha.slice(0, matchFecha.index) : nombreYFecha;
    nombre = nombre.replace(/^(en el|en la|en|del|de la|de)\s+/i, '').trim();
    propuesta.nombre = nombre || nombreYFecha.trim();
  } else {
    propuesta.nombre = nombreYFecha.trim();
    propuesta.notas = (propuesta.notas ? propuesta.notas + ' | ' : '') + 'no se encontró fecha';
  }

  if (!propuesta.tipo && !fecha) {
    // Ni tipo conocido ni fecha: no hay con qué proponer nada, es la línea la
    // que no se pudo interpretar, no un dato parcial.
    propuesta.notas = 'no se pudo parsear';
  }

  return propuesta;
}

/**
 * `2026-08-19_2` Parte C (20/08/2026) — **la clave que identifica una fila de `REUNIONES`.**
 *
 * Pura y sin planilla a propósito: es lo que hace verificable el salteo (`tools/probar-temario-reuniones.js`).
 *
 * ⭐ **`etapa` es parte de la clave, y NO es un detalle: sin ella la clave declara duplicado un
 * encuentro que tiene `pre` y `post`.** El prompt proponía `periodo_id + eje + nombre + fecha` y su
 * propio gate mandaba parar si esa clave ya colisionaba en la hoja. **Colisiona**, medido el
 * 20/08 sobre las 13 filas vivas: `San Cristóbal 23/07` y `Retiro 24/07` aparecen **dos veces cada
 * uno**, y las dos veces son legítimas — una fila `pre` y una `post`. Con `etapa` adentro son
 * **13 claves distintas sobre 13 filas, cero colisiones**.
 *
 * ⚠ **Es el mismo hecho que la decisión del usuario sobre el proponedor** —*emite DOS líneas cuando
 * el encuentro tiene pre y post, no una con "(pre + post)"*—: si el temario los escribe separados,
 * la clave tiene que poder separarlos.
 *
 * **La fecha se normaliza a `yyyy-MM-dd` porque los dos lados llegan distintos:** de la hoja viene
 * un `Date` de Sheets y del parser viene un `Date` construido, y comparar `Date` contra `Date` con
 * `===` no matchea nunca. El resto de los campos se colapsa con la forma de `R-10` —espacios
 * internos a uno y `trim()`, **preservando mayúsculas y acentos**—, que es lo que ya hace
 * `normalizarValorDeclarado_` y no hace falta un quinto normalizador.
 */
function claveReunion_(fila) {
  var texto = function (v) {
    return String(v === null || v === undefined ? '' : v).replace(/\s+/g, ' ').trim();
  };
  var fecha = fila.fecha;
  if (fecha instanceof Date && !isNaN(fecha.getTime())) fecha = formatearFecha_(fecha);
  else fecha = texto(fecha).slice(0, 10);

  return [
    texto(fila.periodo_id),
    texto(fila.eje),
    texto(fila.nombre),
    fecha,
    texto(fila.etapa)
  ].join('||');
}

/**
 * `2026-08-19_2` Parte C — separa las propuestas en **las que hay que escribir** y **las que ya
 * están**. Pura: recibe las claves existentes y no toca la hoja.
 *
 * `existentes` es un objeto `{ clave: true }`. Devuelve `{ nuevas, salteadas }`, donde `salteadas`
 * lleva el objeto entero para poder reportarlo con nombre.
 *
 * ⚠ **Dedupe también DENTRO del texto pegado**, no sólo contra la hoja. Si alguien pega la misma
 * línea dos veces —o aprieta *Proponer* y pega encima de lo que ya había— el append ciego escribía
 * las dos. Que la segunda entre porque "todavía no estaba en la hoja" sería el mismo bug con otro
 * origen.
 */
function separarReunionesNuevas_(propuestas, existentes) {
  var vistas = {};
  var nuevas = [];
  var salteadas = [];
  (propuestas || []).forEach(function (p) {
    var k = claveReunion_(p);
    if (existentes[k] || vistas[k]) { salteadas.push(p); return; }
    vistas[k] = true;
    nuevas.push(p);
  });
  return { nuevas: nuevas, salteadas: salteadas };
}

/**
 * Agrega a REUNIONES una fila por cada línea no vacía de `textoPegado`, con
 * `mostrar=''` siempre — la persona confirma cuáles entran al informe.
 *
 * ⭐ `2026-08-19_2` Parte C (20/08/2026) — **saltea lo que ya existe.** Antes era un append ciego
 * —`getRange(getLastRow() + 1, …)` sin mirar nada— y el comentario decía *"no pisa filas
 * existentes, solo agrega"*: cierto, y por eso mismo **cargar dos veces el mismo temario dejaba
 * trece filas duplicadas**. Con el gesto detrás de un menú y un `prompt` de texto casi no pasaba;
 * el panel lo pone a un clic, y **abaratar un gesto destructivo sin arreglarlo primero es lo que
 * lo hace pasar**.
 *
 * **Copia el comportamiento que `cargarTemarioCampanas_` ya tenía** —fila existente se reporta y
 * no se escribe— en vez de inventar uno nuevo. Lo que cambia es la clave, porque `CAMPANAS` tiene
 * `campana_id` y `REUNIONES` no tiene identificador propio: ver `claveReunion_`.
 *
 * ⛔ **No toca `parsearLineaReunion_` ni el criterio de `mostrar`.** Que este cargador deje
 * `mostrar` vacío y `cargarTemarioCampanas_` ponga `sí` son dos criterios distintos para el mismo
 * gesto, y unificarlos es decisión del usuario, no de acá.
 */
function cargarTemarioReuniones_(textoPegado, periodoId) {
  var hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('REUNIONES');
  if (!hoja) return { ok: false, motivo: 'La hoja REUNIONES no existe. Corré "Instalar / reparar hojas" primero.' };

  var lineas = String(textoPegado || '').split('\n').map(function (l) { return l.trim(); }).filter(function (l) { return l.length > 0; });
  if (!lineas.length) return { ok: true, agregadas: 0, sinParsear: 0 };

  var headers = hoja.getRange(1, 1, 1, hoja.getLastColumn()).getValues()[0];
  var sinParsear = 0;
  var propuestas = lineas.map(function (linea) {
    var propuesta = parsearLineaReunion_(linea);
    // Paso 2.15 Parte B: el período lo pone el llamador, que ya lo validó contra
    // PERIODOS. Acá no se valida de nuevo ni se completa con un default.
    propuesta.periodo_id = periodoId;
    if (propuesta.notas === 'no se pudo parsear' || propuesta.notas.indexOf('no se encontró fecha') !== -1) sinParsear++;
    return propuesta;
  });

  // Las claves de lo que ya está. Se arman con los mismos nombres de columna que usa la
  // propuesta, así que un cambio de encabezado rompe de los dos lados a la vez y no de uno solo.
  var datos = hoja.getDataRange().getValues();
  var existentes = {};
  for (var i = 1; i < datos.length; i++) {
    var fila = {};
    headers.forEach(function (h, j) { fila[h] = datos[i][j]; });
    existentes[claveReunion_(fila)] = true;
  }

  var reparto = separarReunionesNuevas_(propuestas, existentes);

  if (reparto.nuevas.length) {
    var filas = reparto.nuevas.map(function (p) {
      return headers.map(function (h) { return (h in p) ? p[h] : ''; });
    });
    hoja.getRange(hoja.getLastRow() + 1, 1, filas.length, headers.length).setValues(filas);
  }

  return {
    ok: true,
    agregadas: reparto.nuevas.length,
    sinParsear: sinParsear,
    // Se reportan con nombre, no con un conteo: "3 salteadas" no deja saber si salteó las que
    // correspondía. `cargarTemarioCampanas_` ya devuelve su lista igual.
    salteadas: reparto.salteadas.map(function (p) {
      return (p.nombre || p.texto_original || '(sin nombre)') + (p.etapa ? ' (' + p.etapa + ')' : '');
    })
  };
}

/**
 * Paso 2.14 — el trabajo, con el texto por parámetro. Invocable por API.
 *
 * El `prompt` del ítem de menú no era una guarda de confirmación: era **el insumo
 * del paso**. Sobre HTTP no hay a quién pedirle el temario, y no se inventa — si
 * falta el texto, **falla explícito**. Ésa es la diferencia con un `confirm`, que
 * degrada solo a "no confirmado" (ver `ui_()` en `Codigo.gs`).
 */
function cargarTemario(texto, periodoId) {
  if (!texto || !String(texto).trim()) {
    throw new Error('cargarTemario: falta el texto del temario. Desde el menú lo pide un ' +
      'prompt; por API entra por parámetro — una línea por reunión.');
  }
  // Paso 2.15 Parte B (D-19): el período es obligatorio y NO se asume el vigente.
  // Sin `periodo_id` la fila entra sin período y la curaduría de esta semana pisa la
  // de la anterior sin dejar rastro — el modo de falla que D-08 vino a cerrar. Falla
  // explícito, como con el texto: cuando falta una definición, el motor no la inventa
  // (D-10).
  if (!periodoId || !String(periodoId).trim()) {
    throw new Error('cargarTemario: falta el periodo_id. Una fila sin período no entra a ' +
      'ningún informe (D-19), y asumir el vigente en silencio es justo lo que periodo_id ' +
      'viene a evitar. Períodos disponibles: ' + Object.keys(leerPeriodos()).join(', '));
  }
  periodoId = String(periodoId).trim();
  if (!leerPeriodos()[periodoId]) {
    throw new Error('cargarTemario: el periodo_id "' + periodoId + '" no existe en PERIODOS. ' +
      'Cargalo ahí primero — el motor no crea períodos. Disponibles: ' +
      Object.keys(leerPeriodos()).join(', '));
  }

  var ui = ui_();
  var resultado = cargarTemarioReuniones_(texto, periodoId);
  if (!resultado.ok) {
    ui.alert('No se pudo cargar', resultado.motivo, ui.ButtonSet.OK);
    return ui.texto();
  }

  ui.alert(
    'Temario cargado',
    'Período: ' + periodoId + '\nFilas agregadas: ' + resultado.agregadas +
      (resultado.sinParsear ? '\n⚠ ' + resultado.sinParsear + ' no se pudieron interpretar del todo — revisar notas y texto_original.' : '') +
      '\n\nNinguna quedó con mostrar=sí: confirmá a mano cuáles entran al informe.',
    ui.ButtonSet.OK
  );
  return ui.texto();
}

/**
 * Envoltorio de menú: consigue el texto con el `prompt` y delega. Con planilla se
 * comporta igual que siempre; sin planilla no se llega acá (el ítem de menú no
 * existe sobre HTTP) y quien quiera correrlo por API llama a `cargarTemario(texto)`.
 */
function menuCargarTemarioReuniones_() {
  var ui = ui_();

  // Paso 2.15 Parte B: el período se pide primero. Si se pidiera después del texto,
  // cancelar acá tiraría un temario ya pegado.
  var disponibles = Object.keys(leerPeriodos());
  if (!disponibles.length) {
    ui.alert('Falta configuración', 'No hay ninguna fila en PERIODOS. Cargá el período ' +
      'antes de cargar el temario: una reunión sin período no entra a ningún informe (D-19).',
      ui.ButtonSet.OK);
    return;
  }
  var respuestaPeriodo = ui.prompt(
    'Período del temario',
    '¿A qué período pertenecen estas reuniones?\nDisponibles: ' + disponibles.join(', '),
    ui.ButtonSet.OK_CANCEL
  );
  if (respuestaPeriodo.getSelectedButton() !== ui.Button.OK) return;

  var respuesta = ui.prompt(
    'Cargar temario de reuniones',
    'Pegá el texto del temario (una línea por reunión). Se agrega a REUNIONES con mostrar vacío — confirmás cada una a mano.',
    ui.ButtonSet.OK_CANCEL
  );
  if (respuesta.getSelectedButton() !== ui.Button.OK) return;

  return cargarTemario(respuesta.getResponseText(), respuestaPeriodo.getResponseText());
}

/**
 * `_31.1` B.2 — la puerta para **corregir un campo** de una fila de `REUNIONES` que ya existe.
 *
 * Es a `REUNIONES` lo que `curarCamposMarcadores_` es a `MARCADORES`, y nace por la misma falta:
 * el único escritor declarado de esta hoja (`cargarTemarioReuniones_`, `docs/ESCRITORES.md`)
 * **sólo agrega filas**. Un backfill de `periodo_id` sobre las 7 filas que ya están no tenía
 * camino, y hacerlo a mano en la planilla lo dejaba fuera de todo registro.
 *
 * **Deliberadamente angosta:** no crea filas, no borra filas, no toca `texto_original` —que es la
 * clave— y **devuelve el antes y el después de cada celda que cambió**. Una fila que no existe se
 * reporta y no se crea.
 *
 * **La clave es `texto_original` y no `orden`**: `cargarTemarioReuniones_` deja `orden` vacío
 * cuando la línea no trae el prefijo `N)`, así que como clave no es única ni estable. El texto
 * pegado sí lo es: es exactamente la línea que originó la fila.
 *
 * `cambios` es `[{ texto_original: '…', periodo_id: 'julio_24_30', mostrar: 'sí' }]`.
 */
function curarCamposReuniones_(cambios) {
  var hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('REUNIONES');
  if (!hoja) return { ok: false, motivo: 'La hoja REUNIONES no existe.' };

  cambios = cambios || [];
  var datos = hoja.getDataRange().getValues();
  var headers = datos[0];
  var idxTexto = headers.indexOf('texto_original');
  if (idxTexto === -1) return { ok: false, motivo: 'REUNIONES no tiene columna `texto_original`.' };

  var filaDe = {};
  for (var f = 1; f < datos.length; f++) {
    var clave = String(datos[f][idxTexto] || '').trim();
    if (!clave) continue;
    // Si dos filas comparten el texto, gana la primera y la segunda queda sin tocar: pisar dos
    // filas con un solo cambio sería exactamente lo que esta función viene a evitar.
    if (!(clave in filaDe)) filaDe[clave] = f;
  }

  var aplicados = [];
  var sinFila = [];
  cambios.forEach(function (c) {
    var clave = String(c.texto_original || '').trim();
    if (!(clave in filaDe)) { sinFila.push(clave); return; }
    var fila = filaDe[clave];
    Object.keys(c).forEach(function (campo) {
      if (campo === 'texto_original') return;
      var col = headers.indexOf(campo);
      if (col === -1) { sinFila.push(clave + '.' + campo + ' (columna inexistente)'); return; }
      var anterior = datos[fila][col];
      if (String(anterior) === String(c[campo])) return; // ya estaba: no se escribe
      hoja.getRange(fila + 1, col + 1).setValue(c[campo]);
      aplicados.push({ texto_original: clave, campo: campo, anterior: anterior, nuevo: c[campo] });
    });
  });

  return { ok: true, aplicados: aplicados, sin_fila: sinFila, cambios_escritos: aplicados.length };
}
