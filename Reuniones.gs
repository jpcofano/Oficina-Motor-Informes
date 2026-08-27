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
  /* ⛔⛔ `2026-08-27_2` Parte D.1 (`D-46`) - **el criterio pasa de `eje` a `texto_original`.**
   *
   * **Lo que estaba mal, y costo la primera corrida real del asistente:** el filtro era
   * `fila[eje] && esVerdadero_(mostrar)` -las DOS condiciones-. Una linea de temario que el parser
   * no interpretaba quedaba con `eje` vacio, se podia tildar, se le escribia `mostrar = 'si'`
   * y **nunca llegaba al anclaje**. El mensaje de fallo culpaba al periodo, que era inocente.
   *
   * ⭐⭐ **Por que `texto_original` y no otra cosa:** es lo unico que **toda** fila de temario
   * tiene por construccion -el parser lo conserva siempre, incluso cuando no interpreta nada- y es
   * exactamente lo que hace de clave de curacion en el paso 3 del asistente. No es un campo nuevo
   * ni una columna inventada: es el registro de la linea que origino la fila.
   *
   * ⭐ **Y el universo lo declara el TEMARIO, no el eje** (`R-02`): ahi puede ir cualquier
   * reunion. Verificado contra la hoja VIVA antes de tocarlo -gate A.8 del `2026-08-27_2`-:
   * **0 filas con `texto_original` vacio sobre 11**, asi que ninguna fila viva cambia de lado.
   *
   * ⚠ **La columna `eje` NO se borra**: sigue existiendo, se escribe cuando el temario la trae,
   * la muestra el panel y la lee `TIPO_AGREGADO_POR_EJE_` para **descartar** los agregados. Lo que
   * cambia es que **no decide**. */
  if (idx.texto_original === undefined || idx.mostrar === undefined) return [];

  return datos
    .filter(function (fila) { return fila[idx.texto_original] && esVerdadero_(fila[idx.mostrar]); })
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

  /* ⭐⭐ `2026-08-27_2` Parte C.3 - **sin `|` la linea es un encuentro IGUAL, y `eje` queda
   * VACIO.** Es el temario real del 27/08: `Uno a uno en Coghlan (21/08)` trae tipo conocido y
   * fecha, y el eje simplemente no viene. Antes esto devolvia `no se pudo parsear` con todo en
   * blanco, y esa fila **no llegaba nunca al anclaje** porque `leerReuniones_` filtraba por `eje`.
   *
   * ⛔ **NO se completa con un default**, y esa es la decision del usuario (`D-46`): el universo
   * del informe lo declara **el temario** (`R-02`), no el eje. Un default -`JM`, el `informe_id`,
   * lo que sea- seria un dato inventado que ademas **entra en la clave de dedupe** y haria que la
   * misma reunion pegada con y sin `|` cuente como dos.
   *
   * ⚠ **`no se pudo parsear` deja de dispararse por falta de eje.** Se dispara mas abajo, cuando
   * no hay **ni tipo conocido ni fecha**, que es la condicion que ya existia y sigue siendo la
   * correcta: ahi si no hay con que proponer nada. */
  var partes = texto.split('|');
  var resto = texto.trim();
  if (partes.length >= 2) {
    propuesta.eje = partes[0].trim();
    resto = partes.slice(1).join('|').trim();
  }

  /* ⭐⭐ `2026-08-27_2` Parte C.1 - **se reconocen TODOS los parentesis finales, no el ultimo.**
   *
   * Antes se miraba **uno solo**, y por eso `JM | Uno a uno en Coghlan (21/08) (pre + post)`
   * producia `nombre = "Coghlan ("` -medido en A.4-: el `(pre + post)` se sacaba, el `(21/08)`
   * quedaba, y el recorte por posicion de la fecha cortaba en medio del parentesis. */
  var parentesis = [];
  var masParentesis = true;
  while (masParentesis) {
    var m = resto.match(/\(([^)]*)\)\s*$/);
    if (!m) { masParentesis = false; break; }
    parentesis.unshift(m[1].trim());
    resto = resto.slice(0, m.index).trim();
  }
  /* ⛔⛔ `2026-08-25` — **el temario ya NO escribe `etapa`, y la anotación se reconoce para poder
   * DESCARTARLA.** Decisión del usuario, con la regla que la funda:
   *
   *   ⭐ **EL TEMARIO DICE QUÉ ENCUENTROS ENTRAN; LAS BASES DICEN QUÉ ETAPAS TUVO CADA UNO.**
   *
   * **Lo que había, y por qué estaba mal:** buscaba `(pre)` o `(post)` **exactos**, y todo lo demás
   * caía a `notas`. Medido el 25/08 contra los dos primeros temarios REALES que tuvimos
   * (`docs/TEMARIOS_reales_2026-08-25.md`): la forma que llega es **`(pre + post)` junto, en UNA
   * línea por encuentro**, y muchas veces no se aclara nada. **Ninguna de las dos semanas usa la
   * forma que el parser esperaba.**
   *
   * ⇒ Las dos filas por encuentro que había en `REUNIONES` **no salieron de ningún temario**:
   * alguien lo partió a mano para que este `if` produjera algo. **Se estaba razonando sobre el
   * efecto y tomándolo por la causa.**
   *
   * ⚠ **Por qué se reconoce en vez de ignorarse:** si no se reconociera, `pre + post` seguiría
   * cayendo a `notas` y **ensuciaría una columna que significa otra cosa** —ahí van los rangos
   * como *"24/07 al 30/07 inclusive - Acumulado"*—. Reconocer la anotación es lo que permite
   * descartarla sin perderla: **el texto entero sobrevive en `texto_original`**, que es el registro
   * de lo que se pegó.
   *
   * ⚠ **Y una línea SIN paréntesis es un encuentro igual**, que es el caso más frecuente. Eso ya
   * funcionaba y no cambia; lo que cambia es que ahora **es el caso normal y no el degradado**. */
  /* ⭐⭐ `2026-08-27_2` Parte C.1 - **un parentesis que ES una fecha es LA FECHA.**
   *
   * Antes todo lo que no fuera `pre`/`post` caia a `notas`, asi que
   * `Uno a uno en Coghlan (21/08)` salia **sin fecha** y con `notas = "21/08 | no se encontro
   * fecha"` (A.4). El dato estaba en la linea y el parser lo tiraba.
   *
   * ⚠⚠ **«ES una fecha», no «CONTIENE una fecha», y la diferencia es una regresion medida:**
   * `Ministros | Reuniones de la semana (24/07 al 30/07 inclusive - Acumulado)` **contiene** una
   * fecha, y tomarla convertiria en fecha lo que hoy es -correctamente- una **nota**. El patron
   * exige que el parentesis sea la fecha **y nada mas**. */
  var fechaDeParentesis = '';
  parentesis.forEach(function (dentro) {
    if (!dentro) return;
    if (/^(pre|post)(\s*\+\s*(pre|post))?$/i.test(dentro)) return;  // anotacion de etapa: se descarta
    if (!fechaDeParentesis && /^\d{1,2}[\/\-]\d{1,2}([\/\-]\d{2,4})?$/.test(dentro)) {
      fechaDeParentesis = dentro;
      return;
    }
    propuesta.notas = propuesta.notas
      ? propuesta.notas + ' | ' + dentro
      : dentro; // ej. "24/07 al 30/07 inclusive - Acumulado"
  });

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
  /* ⭐ `2026-08-27_2` Parte C.1 - si el texto no traia fecha, la del parentesis vale. Se parsea
   * con `parsearFecha_`, el mismo lector: un segundo parser de fechas seria el quinto de este
   * repo. */
  if (!fecha && fechaDeParentesis) fecha = parsearFecha_(fechaDeParentesis, anioDefecto);
  var matchFecha = nombreYFecha.match(/\d{1,2}[\/\-]\d{1,2}(?:[\/\-]\d{2,4})?/);

  /* ⭐⭐ `2026-08-27_2` Parte C.2 - **el recorte del nombre sale de la rama `if (fecha)`.**
   *
   * La preposicion inicial y el separador se recortan **siempre**, haya fecha o no. Antes vivian
   * adentro del `if`, asi que una linea sin fecha dejaba `nombre = "en Coghlan"` -medido en A.4- y
   * **ese nombre viaja a tres lugares**: la clave de confirmacion del anclaje, la etiqueta del
   * item y `FALTANTES`. */
  if (fecha) propuesta.fecha = fecha;
  {
    var nombre = matchFecha ? nombreYFecha.slice(0, matchFecha.index) : nombreYFecha;
    /* ⭐ `2026-08-25` — **`con` entra a la lista, y el caso es `Primera persona con Pareto`**, que
     * quedó cargado como **`"con Pareto"`**. Misma familia que el `: Salud` de abajo: el tipo
     * matchea y **lo que queda del texto se toma tal cual**, preposición incluida.
     *
     * ⚠ **La lista es explícita y NO un patrón tipo «sacá la primera palabra corta»**, y eso es
     * deliberado: hay barrios que empiezan con una palabra corta —`La Boca`, `El Talar`— y un
     * patrón se los come. **Crece con evidencia**: cada preposición entra cuando aparece en un
     * temario real, no antes.
     *
     * ⚠ **Y `con` no toca `Constitución`**: el `\s+` exige que la preposición sea una palabra
     * entera. Sin él, `Con|stitución` se cortaría — que es el error simétrico y peor, porque
     * produce un nombre que **casi** parece bien. */
    nombre = nombre.replace(/^(en el|en la|en|del|de la|de|con)\s+/i, '').trim();
    /* ⛔⛔ `2026-08-25` — **el separador entre el tipo y el nombre se recorta ACÁ, en el origen.**
     *
     * `JM | Encuentro Temático: Salud 14/08` producía **`nombre = ": Salud"`**, con los dos puntos
     * adentro: el tipo matchea, y lo que queda del texto se tomaba tal cual. Es el mismo `: Salud`
     * sucio que se veía en `FALTANTES` como `enc_alcance_pct @: Salud` y que estaba anotado como
     * *«el parseo del nombre sigue roto y a propósito»*. **Lo que faltaba era el origen**, y son
     * los temarios reales del 25/08 los que lo mostraron: unas líneas usan `:` entre el tipo y el
     * nombre y otras no.
     *
     * ⭐ **Se arregla en el parser y no en los consumidores**, y eso no es preferencia: el nombre
     * viaja a **tres** lugares —la clave de confirmación del anclaje, la etiqueta del ítem y
     * `FALTANTES`— y limpiarlo en cada uno sería el quinto normalizador que `CLAUDE.md` §2 pide no
     * escribir.
     *
     * ⚠ **Y la asimetría que esto elimina, que conviene tener escrita:** `Union.gs` ya recortaba
     * este separador **para buscar** (`emparejarReunionConCuenta_`) y **no para la clave de
     * confirmación** (`nombreBuscado` de `anclarEncuentros`). O sea que la búsqueda usaba el
     * nombre limpio y la confirmación guardaba el sucio. No era un bug —la clave sólo tiene que
     * ser consistente consigo misma— pero era una diferencia sin motivo. Con el nombre limpio
     * desde el origen, **las dos miran lo mismo**.
     *
     * El juego de caracteres es el mismo que ya usa `Union.gs`, a propósito: dos recortes del
     * mismo separador que difieran es peor que uno solo. */
    nombre = nombre.replace(/^[\s:;,.\/|\-–—]+|[\s:;,.\/|\-–—]+$/g, '').trim();
    propuesta.nombre = nombre || nombreYFecha.trim();
  }
  if (!fecha) {
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

  /* ⛔⛔ `2026-08-27_2` Parte D.4 (`D-46`) - **`eje` sale de la clave.**
   *
   * El parrafo de arriba explica por que `etapa` esta adentro; esto explica por que `eje` ya no.
   * **Decision del usuario del 27/08:** el universo lo declara el temario, no el eje, y una misma
   * reunion puede llegar **con `|` y sin `|`** segun como se pego esa semana -el temario real del
   * 27/08 no lo trae-. Con `eje` en la clave, esas dos formas de la misma reunion contarian como
   * dos filas distintas y el dedupe no las juntaria.
   *
   * ⭐ **Gate corrido contra la hoja VIVA antes de sacarlo** (A.7 del `2026-08-27_2`):
   * **11 claves distintas sobre 11 filas, con y sin `eje`, cero colisiones.** Es el mismo gate que
   * se corrio el 20/08 cuando se **agrego** `etapa`. */
  return [
    texto(fila.periodo_id),
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

  /* ⭐ `2026-08-27_2` Parte B.1 - **parte con `partirTemario_`, el partidor unico.**
   *
   * ⚠ **El contrato no cambia: sigue recibiendo el texto ENTERO**, sin recortes armados por el
   * llamador. Antes tomaba **todas** las lineas del pegado, asi que con el formato unico las de
   * campanias entraban tambien a `REUNIONES`; ahora toma **las que quedaron arriba del corte**. */
  var partido = partirTemario_(textoPegado);
  var lineas = partido.reuniones;
  var ignoradas = partido.ignoradas.slice();
  if (!lineas.length) {
    return { ok: true, agregadas: 0, sinParsear: 0, sinParsearDetalle: [], salteadas: [],
      ignoradas: ignoradas };
  }

  var headers = hoja.getRange(1, 1, 1, hoja.getLastColumn()).getValues()[0];
  var sinParsear = 0;
  /* ⭐⭐ `2026-08-27_1` — **las líneas que no se pudieron interpretar viajan CON NOMBRE.**
   *
   * El conteo ya estaba y el panel lo pintaba —*«3 sin parsear»*—, pero **no deja saber cuáles**,
   * así que nadie podía señalarlas. La nota que las marca ya se escribía en la fila desde siempre
   * (`notas = 'no se pudo parsear'`) **y no la leía nadie**. Es puro agregado al retorno: ningún
   * llamador existente cambia de comportamiento. */
  var sinParsearDetalle = [];
  var propuestas = [];
  lineas.forEach(function (linea) {
    var propuesta = parsearLineaReunion_(linea);
    // Paso 2.15 Parte B: el período lo pone el llamador, que ya lo validó contra
    // PERIODOS. Acá no se valida de nuevo ni se completa con un default.
    propuesta.periodo_id = periodoId;

    /* ⭐ `2026-08-27_2` Parte B.2 - **los ejes AGREGADOS no son reuniones y se descartan.**
     *
     * `Ministros | ...` y `M2 | ...` son bloques agregados de periodo, no encuentros individuales
     * (`R-21`: no iteran `REUNIONES`). Vienen **con `|`**, asi que el partidor los deja del lado
     * de reuniones a proposito - el que sabe que no son encuentros es este cargador, que ya tiene
     * el `eje` parseado.
     *
     * ⚠ **Y es el UNICO uso de `eje` que sobrevive a `D-46`**, porque es de **descarte** y no
     * de seleccion: `eje` decide que **no** entra, nunca que entra. */
    if (TIPO_AGREGADO_POR_EJE_[propuesta.eje]) {
      ignoradas.push({ texto: propuesta.texto_original, motivo: 'eje agregado' });
      return;
    }

    if (propuesta.notas === 'no se pudo parsear' || propuesta.notas.indexOf('no se encontró fecha') !== -1) {
      sinParsear++;
      sinParsearDetalle.push({ texto: propuesta.texto_original, motivo: propuesta.notas });
    }
    propuestas.push(propuesta);
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
    // ⭐ Cuáles, no cuántas. Ver el comentario de arriba.
    sinParsearDetalle: sinParsearDetalle,
    // Se reportan con nombre, no con un conteo: "3 salteadas" no deja saber si salteó las que
    // correspondía. `cargarTemarioCampanas_` ya devuelve su lista igual.
    salteadas: reparto.salteadas.map(function (p) {
      return (p.nombre || p.texto_original || '(sin nombre)') + (p.etapa ? ' (' + p.etapa + ')' : '');
    }),
    /* ⭐ Lo que no llego a ninguna hoja viaja con el reporte -el corte, el bloque descartado, los
     * encabezados y los ejes agregados-, para que el paso 3 lo muestre. Una linea que desaparece
     * en silencio es lo que este prompt vino a cerrar. */
    ignoradas: ignoradas
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
