/**
 * Campanas.gs — el cargador de temario de campañas destacadas (`_5`, 08/08/2026).
 *
 * **Por qué es un módulo propio y no una variante de `Reuniones.gs`.** Medido en la Parte 0:
 * `parsearLineaReunion_` **exige `|`** —`partes.length < 2` → "no se pudo parsear"— y **ninguna
 * línea de campañas lo tiene**: son `1) Egreso de cadetes (…)`. Compartir el parser habría
 * significado que el 100 % del bloque saliera sin parsear. **Es un apartamiento consciente, no
 * una diferencia accidental.**
 *
 * **El segundo apartamiento, también consciente:** `cargarTemarioReuniones_` hace **append
 * ciego** —`getRange(getLastRow() + 1, …)`, sin mirar lo que ya está—, así que recargar un
 * temario corregido duplica todo. Acá **no se pisa y no se duplica**: una fila que ya existe se
 * reporta y se saltea (`A.5`).
 *
 * **Lo que sí se hereda, porque ya estaba resuelto:** el paréntesis final va a `notas`. El
 * parser de reuniones ya lo hacía, y es justo el mecanismo que las campañas condicionales
 * necesitan — *"(en caso de que llegue el material)"* queda escrito donde una persona lo lee.
 *
 * ⚠ **El salto que hace difícil a este cargador**, y que no tiene el de reuniones: una reunión
 * se describe con lo que el temario dice; **una campaña tiene que engancharse con la base**. El
 * temario la nombra en castellano y la base la identifica con `ID Cuentas`. Medido sobre el
 * temario real: **cero de cuatro nombres matchean por texto** contra las tres columnas
 * candidatas, y sin embargo **tres de los cuatro están en la base con otro nombre**
 * —*"Egreso de cadetes"* es *"Egreso más de 1000 Cadetes"*—. Por eso existe la solapa de
 * equivalencias, y por eso el match por similitud **propone y no decide**.
 */

/* ═══════════════════════════════════════════════════════════════════════════════════════════
 * `2026-08-27_2` Parte B — **UN partidor, y el corte es POSICIONAL** (`D-45`)
 * ═══════════════════════════════════════════════════════════════════════════════════════════
 *
 * ⭐⭐ **Una línea, un ítem.** Las de arriba son reuniones; la línea que anuncia las campañas
 * **corta**; las de abajo son campañas. No hay bloques, no hay títulos que agrupen, no hay
 * heurística de contenido: hay un **estado** que arranca en `reuniones` y dos líneas que lo mueven.
 *
 * ⛔⛔ **Reemplaza a `partirTemarioEnBloques_`, que se comía el contenido.** Su heurística decía
 * que una línea sin `>`, sin `N)` y sin `|`, de menos de 60 caracteres, **es un encabezado**.
 * Medido el 27/08 contra el temario REAL —tres líneas, ninguna con marcas— devolvía **3 bloques
 * con `lineas: []`**: las tres líneas eran títulos y **ninguna era contenido**. El asistente
 * escribió **una** fila rota y perdió dos.
 *
 * ⛔ **Y el tercer temario real no se parece a ninguno de los dos anteriores:**
 *
 *     25/08 · dos semanas    1) JM | Uno a uno en Parque Avellaneda 12/08 (pre + post)
 *     27/08 · ejemplo        > Status Cercanía y M2 · 1) JM | … · > Campañas destacadas
 *     27/08 · REAL           Uno a uno en Coghlan (21/08)
 *                            Campaña Destacada
 *                            Operativo Movilidad Más Segura
 *
 * ⇒ **Ni `>`, ni `N)`, ni `|`, ni el plural son obligatorios.** Cualquier regla que exija uno de
 * los cuatro falla el lunes siguiente, y falla **escribiendo filas**, que es el modo caro.
 * ═══════════════════════════════════════════════════════════════════════════════════════════ */

/** El bloque del temario que alimenta el cargador de campañas. Los otros van a `REUNIONES` o a nada. */
var BLOQUE_CAMPANAS_ = 'campañas destacadas';

/**
 * El cuerpo de una línea para decidir si es separador: **sin la marca `>` y sin la numeración
 * `N)`**, normalizado.
 *
 * ⚠ **Los dos prefijos se sacan porque son decoración de formato, no contenido**, y el temario los
 * trae o no los trae según el día. `normalizar_('> Campañas destacadas')` conserva el `>` —medido
 * en A.2— así que sin este recorte el separador marcado no matchearía.
 */
function cuerpoDeLineaDeTemario_(linea) {
  return normalizar_(String(linea == null ? '' : linea)
    .replace(/^\s*>+\s*/, '')
    .replace(/^\s*\d+\s*[\)\.\-]\s*/, ''));
}

/**
 * ⭐⭐ **El partidor. Puro: no toca ninguna hoja.**
 *
 * Devuelve `{ reuniones: [linea], campanas: [linea], ignoradas: [{texto, motivo}] }`.
 *
 * **Los separadores, y son tres.** Una línea es separador sólo si **NO tiene `|`**:
 *
 *   | separador     | condición                                   | efecto                  |
 *   |---------------|---------------------------------------------|-------------------------|
 *   | campañas      | el cuerpo empieza con `campan`              | el estado pasa a campañas |
 *   | otros temas   | el cuerpo empieza con `otros tema`          | el estado pasa a descartar |
 *   | ⭐ encabezado | la línea arranca con `>` y no es de las dos | **no mueve el estado**  |
 *
 * ⛔⛔ **La condición «no tiene `|`» no es un detalle de forma: es lo único que separa el separador
 * de una reunión.** Medido en A.3: `4) M2 | Campañas y enviados de la semana` **es una reunión**
 * —`Campañas y enviados de la semana` está en `TIPOS_REUNION_CONOCIDOS_`— y su cuerpo **empieza con
 * `campan`**. Un separador ingenuo cortaría ahí y mandaría el resto del temario a `CAMPANAS`.
 *
 * ⚠ **El costo, declarado: si un día llega esa reunión SIN `|`, corta.** Se acepta y **se ve** —
 * la línea queda en `ignoradas` con motivo `separador`, y el paso 3 la muestra.
 *
 * ⭐ **La tercera fila es un agregado a la tabla del prompt, y va con su motivo.** El prompt define
 * dos separadores; con sólo esos, `> Status Cercanía y M2` —una línea que el usuario **marcó
 * explícitamente como encabezado**— caería como ítem de reuniones y escribiría una fila
 * `no se pudo parsear`. Reconocer el `>` **no es adivinar**: es leer una marca que la persona
 * escribió, y es la convención que este repo ya tenía declarada. **No mueve el estado** —eso lo
 * hacen sólo las dos de arriba— así que no inventa dónde termina un bloque.
 *
 * ⚠ **`Otros temas` se agrega aunque el usuario no lo pidió**, y por qué: sin el corte esas líneas
 * caen en el balde de campañas, y `cargarTemarioCampanas_` las escribe con `mostrar = 'sí'`
 * (`AJ-1`, *ante la duda entra*) — o sea que **nacen confirmadas y entran al deck si nadie las
 * destilda**. Es el mismo mecanismo, dos líneas de código.
 *
 * ⇒ **Y cuando ese encabezado NO viene, pasa igual: se acepta y se dice.** No se inventa una
 * heurística de contenido para adivinar dónde termina el bloque.
 *
 * ⭐ **La identidad que el banco fija:** `líneas no vacías = reuniones + campañas + ignoradas`.
 * Ninguna línea puede desaparecer del retorno. Es un control **por identidad y no por constante**:
 * no caduca cuando cambie el temario.
 */
function partirTemario_(texto) {
  var lineas = String(texto == null ? '' : texto).split('\n');
  var reuniones = [];
  var campanas = [];
  var ignoradas = [];
  var estado = 'reuniones';

  lineas.forEach(function (cruda) {
    var linea = String(cruda).trim();
    if (!linea) return;

    /* ⛔ La guarda que funda todo: con `|` es una reunión, nunca un separador. */
    if (linea.indexOf('|') === -1) {
      var cuerpo = cuerpoDeLineaDeTemario_(linea);
      if (cuerpo.indexOf('campan') === 0) {
        estado = 'campanas';
        ignoradas.push({ texto: linea, motivo: 'separador' });
        return;
      }
      if (cuerpo.indexOf('otros tema') === 0) {
        estado = 'descartar';
        ignoradas.push({ texto: linea, motivo: 'separador' });
        return;
      }
      /* ⭐ Un `>` explícito que no es ninguno de los dos: encabezado, no ítem. No mueve el estado. */
      if (/^\s*>/.test(linea)) {
        ignoradas.push({ texto: linea, motivo: 'encabezado' });
        return;
      }
    }

    if (estado === 'descartar') { ignoradas.push({ texto: linea, motivo: 'bloque descartado' }); return; }
    if (estado === 'campanas') { campanas.push(linea); return; }
    reuniones.push(linea);
  });

  return { reuniones: reuniones, campanas: campanas, ignoradas: ignoradas };
}

/**
 * Una línea de campaña: `N) Nombre (nota)`. Devuelve `{ orden, nombre, notas, texto_original }`.
 *
 * **Tolera el formato sucio y va a seguir teniendo que hacerlo**: `1)Semana JM` sin espacio
 * —`\s*` acepta cero—, espacios de más al final —`trim`—, y erratas en el nombre, que **no
 * importan acá** porque el match no va por texto sino por equivalencias.
 */
function parsearLineaCampana_(lineaCruda) {
  var textoOriginal = String(lineaCruda === null || lineaCruda === undefined ? '' : lineaCruda).trim();
  var salida = { orden: '', nombre: '', notas: '', texto_original: textoOriginal };
  if (!textoOriginal) return salida;

  var texto = textoOriginal;
  var numero = texto.match(/^(\d+)\s*\)\s*/);
  if (numero) {
    salida.orden = Number(numero[1]);
    texto = texto.slice(numero[0].length);
  }

  // El paréntesis final va a `notas`, igual que en reuniones. **No se interpreta** (`AJ-1`):
  // el parser no tiene cómo saber si dice "actualización: nuevo mail" o "en caso de que llegue
  // el material", y tratar de distinguirlos por el texto es adivinar.
  var paren = texto.match(/\(([^)]*)\)\s*$/);
  if (paren) {
    salida.notas = paren[1].trim();
    texto = texto.slice(0, paren.index).trim();
  }
  // La marca acordada para lo condicional. **No se exige**; si viene, se anota.
  var interrogante = texto.match(/\[\?\]\s*$/);
  if (interrogante) {
    salida.notas = (salida.notas ? salida.notas + ' · ' : '') + 'marcada [?] en el temario';
    texto = texto.slice(0, interrogante.index).trim();
  }

  salida.nombre = texto.trim();
  return salida;
}

/**
 * Puntaje de similitud entre el nombre del temario y el de la base: **qué porción de las
 * palabras del temario aparece en el nombre de la base**.
 *
 * **Por qué la cobertura del temario y no una distancia de edición.** El nombre de la base es
 * más largo y trae prefijos de nomenclatura —*"Seguridad I Operativo de saturación 1-11-14"*—,
 * así que cualquier medida simétrica lo castiga por longitud. Lo que importa es si **todo lo que
 * el temario dice** está en el nombre de la base.
 *
 * Se comparan valores normalizados (`normalizar_`, que pliega case y acentos) y se ignoran las
 * palabras de una o dos letras: `de`, `en`, `y`, `I` de la nomenclatura.
 */
function puntajeSimilitudCampana_(nombreTemario, nombreBase) {
  function palabras(s) {
    return normalizar_(String(s || '')).split(/[^a-z0-9°º]+/)
      .filter(function (p) { return p.length > 2; });
  }
  var a = palabras(nombreTemario);
  if (!a.length) return 0;
  var b = palabras(nombreBase);
  var enB = {};
  b.forEach(function (p) { enB[p] = true; });
  var comunes = a.filter(function (p) { return enB[p]; }).length;
  return comunes / a.length;
}

/**
 * Umbrales de la resolución por similitud. **Van en `CONFIG`, no acá**: son valores de negocio
 * que se ajustan mirando resultados, y cambiarlos no puede exigir `clasp push` (`D-01`).
 */
function umbralesSimilitudCampana_() {
  var cfg = leerConfig();
  var alto = Number(cfg.umbral_similitud_campana);
  var margen = Number(cfg.margen_similitud_campana);
  return {
    alto: isNaN(alto) || !alto ? 0.8 : alto,
    margen: isNaN(margen) || !margen ? 0.2 : margen
  };
}

/**
 * Resuelve un nombre de temario a un `ID Cuentas`. **La equivalencia manda; la similitud
 * propone** (`AJ-3`).
 *
 * Devuelve `{ id, via, confianza, candidatos }` con `via` en `equivalencia` | `similitud` |
 * `sin_resolver`.
 */
function resolverIdDeCampana_(nombreTemario, catalogo) {
  // 1 · La solapa de equivalencias: lo que una persona confirmó, gana siempre.
  var eq = equivalenciasDeCampana_();
  var clave = normalizar_(nombreTemario);
  if (eq[clave]) {
    return { id: eq[clave], via: 'equivalencia', confianza: 1, candidatos: [] };
  }

  // 2 · La similitud, que **propone**.
  var u = umbralesSimilitudCampana_();
  var puntuados = catalogo.map(function (c) {
    return { id: c.id, nombre: c.nombre, puntaje: puntajeSimilitudCampana_(nombreTemario, c.nombre) };
  }).filter(function (c) { return c.puntaje > 0; });
  puntuados.sort(function (a, b) { return b.puntaje - a.puntaje; });

  if (!puntuados.length) return { id: '', via: 'sin_resolver', confianza: 0, candidatos: [] };

  var mejor = puntuados[0];
  var segundo = puntuados[1] ? puntuados[1].puntaje : 0;

  // **Confianza alta = puntaje sobre el umbral Y separado del segundo.** El margen no es un
  // adorno: `"Operativo de saturación en 1-11-14"` matchea alto contra **cuatro** campañas de
  // saturación distintas, y sin margen el cargador elegiría una por orden de aparición.
  if (mejor.puntaje >= u.alto && (mejor.puntaje - segundo) >= u.margen) {
    return { id: mejor.id, via: 'similitud', confianza: mejor.puntaje, candidatos: puntuados.slice(0, 3) };
  }
  return { id: '', via: 'sin_resolver', confianza: mejor.puntaje, candidatos: puntuados.slice(0, 3) };
}

/** `{ nombre normalizado del temario: ID Cuentas }`, de la solapa que escribe una persona. */
function equivalenciasDeCampana_() {
  var hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('CAMPANAS_equivalencias');
  if (!hoja || hoja.getLastRow() < 2) return {};
  var datos = hoja.getDataRange().getValues();
  var headers = datos.shift();
  var iVar = headers.indexOf('variante_temario');
  var iId = headers.indexOf('id_cuentas');
  if (iVar === -1 || iId === -1) return {};
  var mapa = {};
  datos.forEach(function (f) {
    var v = normalizar_(f[iVar]);
    var id = String(f[iId] || '').trim();
    if (v && id) mapa[v] = id;
  });
  return mapa;
}

/**
 * El catálogo de campañas de la base: `{ id, nombre, desde, hasta }`.
 *
 * Sale de `digital/Seguimiento digital`, que es **fuente cruda** y la que el panel del equipo
 * usa para seleccionar. **`desde` y `hasta` salen de acá y no del temario** (`A.4`): el temario
 * dice **cuáles** van, la base dice **cuándo** fueron — la misma división que `R-17`.
 */
function catalogoDeCampanas_() {
  var ab = abrirHoja('digital', 'Seguimiento digital');
  if (!ab.ok) return { ok: false, motivo: ab.motivo };
  var h = ab.hoja;
  var n = h.getLastRow();
  if (n < 2) return { ok: false, motivo: 'digital/Seguimiento digital no tiene filas' };
  var d = h.getRange(2, 1, n - 1, 13).getValues();
  var lista = [];
  d.forEach(function (f) {
    var id = String(f[0] || '').trim();
    if (!id) return;
    // Col 2 y 3 son los dos nombres; se concatenan para el match porque el temario a veces
    // usa uno y a veces el otro.
    var nombre = String(f[1] || '').trim() || String(f[2] || '').trim();
    lista.push({ id: id, nombre: nombre, alterno: String(f[2] || '').trim(), desde: f[11], hasta: f[12] });
  });
  return { ok: true, lista: lista };
}

/**
 * El cargador. Escribe filas de `CAMPANAS` desde el texto del temario.
 *
 * **Ante la duda, la campaña entra** (`AJ-1`, decisión del usuario 08/08/2026, que supersede al
 * `A.2` del prompt): si el nombre se reconoce, la fila va con **`mostrar = sí`** y el paréntesis
 * a `notas`. **El motivo es que los dos errores no cuestan lo mismo:** una campaña que no salió
 * no tiene filas en la base, así que sus tokens salen como faltantes — **un hueco visible**. Una
 * campaña excluida de más es **una lámina que nadie sabe que falta**.
 */
function cargarTemarioCampanas_(textoPegado, periodoId, informeId) {
  var hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('CAMPANAS');
  if (!hoja) return { ok: false, motivo: 'La hoja CAMPANAS no existe. Corré "Instalar / reparar hojas" primero.' };

  /* ⭐⭐ `2026-08-27_2` Parte B.1 — **parte con `partirTemario_`, el partidor único.**
   *
   * ⛔⛔ Hasta hoy había **dos formas de decidir cuál es el bloque de campañas** —ésta y la del
   * asistente— y **la de acá ya fallaba**: comparaba el título **por igualdad** contra
   * `'campañas destacadas'`, así que el temario real del 27/08, que dice **`Campaña Destacada`**
   * en singular, **no matcheaba** (medido en A.2). *Dos formas de decidir lo mismo no fallan el
   * día que difieren: cargan otra cosa.*
   *
   * ⚠ **El contrato no cambia: sigue recibiendo el texto ENTERO**, sin recortes armados por el
   * llamador. Lo que cambia es cómo lo parte. */
  var partido = partirTemario_(textoPegado);
  var lineasDelBloque = partido.campanas;

  if (!lineasDelBloque.length) {
    /* ⛔ **Un cero se dice con su motivo, y los dos motivos son distintos**: «no hay separador» y
     * «hay separador y no quedó nada debajo» mandan a trabajos opuestos — revisar el título contra
     * revisar el pegado. */
    var huboSeparador = partido.ignoradas.some(function (x) { return x.motivo === 'separador'; });
    return {
      ok: false,
      motivo: huboSeparador
        ? 'Encontré la línea que anuncia las campañas, pero no quedó ninguna línea debajo de ella.'
        : 'No encontré ninguna línea que anuncie las campañas. Tiene que empezar con "Campaña" o ' +
          '"Campañas" —el singular y el plural sirven, con `>` o sin él— y **no puede tener `|`**. ' +
          'Líneas leídas como reuniones: ' + (partido.reuniones.length || 0) + '.'
    };
  }

  var cat = catalogoDeCampanas_();
  if (!cat.ok) return { ok: false, motivo: 'No se pudo leer el catálogo de campañas: ' + cat.motivo };

  var headers = hoja.getRange(1, 1, 1, hoja.getLastColumn()).getValues()[0];
  var datos = hoja.getDataRange().getValues();
  var iId = headers.indexOf('campana_id');
  var iPer = headers.indexOf('periodo_id');
  var existentes = {};
  for (var i = 1; i < datos.length; i++) {
    existentes[String(datos[i][iId]).trim() + '||' + String(datos[i][iPer]).trim()] = true;
  }

  var escritas = [], salteadas = [], sinId = [], sinParsear = [];
  var filas = [];

  lineasDelBloque.forEach(function (linea) {
    var p = parsearLineaCampana_(linea);
    if (!p.nombre) { sinParsear.push(linea); return; }

    var r = resolverIdDeCampana_(p.nombre, cat.lista);
    var campanaId = r.id || ('SIN_ID_' + normalizar_(p.nombre).replace(/[^a-z0-9]+/g, '_').slice(0, 28));
    if (existentes[campanaId + '||' + periodoId]) { salteadas.push(p.nombre); return; }

    var enBase = null;
    if (r.id) {
      cat.lista.forEach(function (c) { if (c.id === r.id) enBase = c; });
    }

    var nota = p.notas;
    if (r.via === 'similitud') {
      nota = (nota ? nota + ' · ' : '') + '⚠ id resuelto por SIMILITUD (' +
        Math.round(r.confianza * 100) + '%) contra "' + (enBase ? enBase.nombre : '') + '" — SIN CONFIRMAR';
    } else if (r.via === 'sin_resolver') {
      nota = (nota ? nota + ' · ' : '') + '⚠ SIN ID — completar `campana_id` a mano.' +
        (r.candidatos.length
          ? ' Candidatos: ' + r.candidatos.map(function (c) {
              return c.id + ' "' + String(c.nombre).slice(0, 34) + '" (' + Math.round(c.puntaje * 100) + '%)';
            }).join(' · ')
          : ' No apareció ninguna campaña parecida en la base.');
      sinId.push(p.nombre);
    }

    var fila = {
      periodo_id: periodoId,
      campana_id: campanaId,
      nombre: p.nombre,
      informe_id: informeId,
      base_id: 'digital',
      tipo: 'destacada',
      desde: enBase ? enBase.desde : '',
      hasta: enBase ? enBase.hasta : '',
      // `AJ-1` — ante la duda entra. El paréntesis no se interpreta.
      mostrar: 'sí',
      orden: p.orden,
      /* `2026-08-19_1` Parte A — **la clave de join de toda la sección de campañas.**
       *
       * **El hueco que cierra:** este cargador resuelve el `ID Cuentas` desde el 08/08 y lo escribe
       * en `campana_id`; la columna `id_cuenta` **nació el 18/08**, así que hasta hoy salía vacía y
       * `itemsDeSeccion_` pasaba `id_cuenta: c.id_cuenta` **en blanco** al ítem. **El temario ya
       * traía el id y el ítem no lo recibía.**
       *
       * **Por qué DOS columnas y no reusar `campana_id`, aunque hoy traigan el mismo valor:**
       *
       *   - **`campana_id` es la clave de la fila y tiene que existir siempre.** Cuando el nombre no
       *     resuelve vale `SIN_ID_<nombre>`, que **no es un id de cuenta**: usarla como join haría
       *     que el motor buscara `SIN_ID_egreso_de_cadetes` en la base y **encontrara cero filas sin
       *     poder decir por qué**.
       *   - **`id_cuenta` vacío significa exactamente una cosa: el temario no resolvió.** Es la
       *     señal que la lámina necesita para publicar un hueco visible en vez de un número.
       *
       * ⚠ **Y el caso que obliga a que sean dos y no un renombre:** una campaña puede entrar al
       * informe **sin id** (`AJ-1`, *ante la duda entra*), y esa fila **tiene que poder completarse
       * a mano después**. Con una sola columna, completar el id **cambiaría la clave de la fila**. */
      id_cuenta: r.id || '',
      notas: nota
    };
    filas.push(headers.map(function (h) { return (h in fila) ? fila[h] : ''; }));
    escritas.push(p.nombre + (r.id ? ' → ' + r.id + ' (' + r.via + ')' : ' → SIN ID'));
  });

  if (filas.length) {
    hoja.getRange(hoja.getLastRow() + 1, 1, filas.length, headers.length).setValues(filas);
    SpreadsheetApp.flush();
  }

  return {
    ok: true,
    escritas: escritas,
    sin_id: sinId,
    salteadas: salteadas,
    sin_parsear: sinParsear,
    /* ⭐ Lo que el partidor dejó afuera viaja con el reporte: el paso 3 lo muestra, y así una
     * línea que no llegó a ninguna hoja **no desaparece en silencio**. */
    ignoradas: partido.ignoradas,
    lineas_reuniones: partido.reuniones.length
  };
}

/**
 * Entrada del menú y de la API. Mismas guardas que `cargarTemario`: el texto y el `periodo_id`
 * son insumo, no confirmación — **si faltan, falla explícito** en vez de asumir (`D-10`).
 */
function cargarTemarioDeCampanas(texto, periodoId, informeId) {
  if (!texto || !String(texto).trim()) {
    throw new Error('cargarTemarioDeCampanas: falta el texto del temario. Desde el menú lo pide ' +
      'un prompt; por API entra por parámetro. Tiene que incluir el bloque "Campañas destacadas".');
  }
  if (!periodoId || !String(periodoId).trim()) {
    throw new Error('cargarTemarioDeCampanas: falta el periodo_id. Una fila sin período no entra ' +
      'a ningún informe (D-19). Períodos disponibles: ' + Object.keys(leerPeriodos()).join(', '));
  }
  periodoId = String(periodoId).trim();
  if (!leerPeriodos()[periodoId]) {
    throw new Error('cargarTemarioDeCampanas: el periodo_id "' + periodoId + '" no existe en ' +
      'PERIODOS. Cargalo ahí primero. Disponibles: ' + Object.keys(leerPeriodos()).join(', '));
  }
  informeId = String(informeId || '').trim();
  if (!informeId) {
    throw new Error('cargarTemarioDeCampanas: falta el informe_id (jm / secco). Sin él la fila ' +
      'no la reclama ningún informe.');
  }

  var r = cargarTemarioCampanas_(texto, periodoId, informeId);
  var ui = ui_();
  if (!r.ok) {
    ui.alert('No se pudo cargar', r.motivo, ui.ButtonSet.OK);
    return ui.texto();
  }

  // `A.6` — el reporte dice **qué pasó**, no que salió bien.
  /* ⭐ `2026-08-27_2` Parte B.1 — ya no hay «bloque leído»: el corte es POSICIONAL, así que lo que
   * hay para decir es **qué quedó de cada lado**, y qué línea no fue a ninguna hoja. */
  var lineas = [
    'Líneas tomadas como campañas: ' + (r.escritas.length + r.salteadas.length + r.sin_parsear.length),
    'Escritas: ' + r.escritas.length,
    'Sin id (hay que completar a mano): ' + r.sin_id.length,
    'Salteadas por existir: ' + r.salteadas.length,
    'Sin parsear: ' + r.sin_parsear.length,
    'Líneas que quedaron ARRIBA del corte (reuniones): ' + (r.lineas_reuniones || 0)
  ];
  if (r.escritas.length) lineas.push('', 'Filas: ' + r.escritas.join(' | '));
  if (r.sin_id.length) lineas.push('', '⚠ Sin id: ' + r.sin_id.join(' | '));
  if ((r.ignoradas || []).length) {
    lineas.push('', 'Líneas que no fueron a ninguna hoja: ' + r.ignoradas.map(function (x) {
      return '"' + x.texto + '" (' + x.motivo + ')';
    }).join(' · '));
  }

  ui.alert('Temario de campañas cargado', lineas.join('\n'), ui.ButtonSet.OK);
  return ui.texto();
}

/** Ítem de menú. Mismo patrón que `menuCargarTemarioReuniones_`: los tres datos por prompt. */
function menuCargarTemarioCampanas_() {
  var ui = ui_();
  var disponibles = Object.keys(leerPeriodos());
  if (!disponibles.length) {
    ui.alert('Sin períodos', 'Cargá al menos una fila en PERIODOS antes de cargar un temario.', ui.ButtonSet.OK);
    return ui.texto();
  }

  var rp = ui.prompt('Período del temario',
    '¿A qué período pertenecen estas campañas? Disponibles: ' + disponibles.join(', '),
    ui.ButtonSet.OK_CANCEL);
  if (rp.getSelectedButton() !== ui.Button.OK) return;

  var ri = ui.prompt('Informe',
    '¿Para qué informe? (' + Object.keys(leerInformes()).join(' / ') + ')',
    ui.ButtonSet.OK_CANCEL);
  if (ri.getSelectedButton() !== ui.Button.OK) return;

  var rt = ui.prompt('Cargar temario de campañas',
    'Pegá el temario completo. Se lee **sólo** el bloque "Campañas destacadas"; los otros ' +
    'bloques no se tocan. Las que no resuelvan su id quedan marcadas para completar a mano.',
    ui.ButtonSet.OK_CANCEL);
  if (rt.getSelectedButton() !== ui.Button.OK) return;

  return cargarTemarioDeCampanas(rt.getResponseText(), rp.getResponseText(), ri.getResponseText());
}

/**
 * `2026-08-27_1` — **la puerta para corregir un campo de una fila de `CAMPANAS` que ya existe.**
 *
 * Es a `CAMPANAS` lo que `curarCamposReuniones_` es a `REUNIONES`, y nace por la misma falta: el
 * único escritor de esta hoja (`cargarTemarioCampanas_`) **sólo agrega filas**. El paso 3 del
 * asistente tiene que poder escribir `mostrar` sobre una fila cargada, y hacerlo a mano en la
 * planilla lo dejaba fuera de todo registro.
 *
 * ⭐ **Se copia la forma que ya existe en vez de inventar una nueva** (`CLAUDE.md` §2, el grep
 * previo): misma firma, mismo retorno, misma angostura — **no crea filas, no borra filas, no toca
 * la clave** y devuelve el **antes y el después** de cada celda que cambió. Una fila que no existe
 * se reporta y no se crea: una corrida que no hizo nada tiene que fallar, no informar cero.
 *
 * ⚠ **La clave es `campana_id` + `periodo_id`, y no `nombre`.** Es exactamente la que
 * `cargarTemarioCampanas_` ya usa para saltear lo que existe, así que las dos miran lo mismo. El
 * nombre no sirve: el temario lo escribe en castellano, la base lo tiene con otra grafía, y está
 * medido que **cero de cuatro nombres matchean por texto**.
 *
 * `cambios` es `[{ campana_id: '…', periodo_id: '…', mostrar: 'sí' }]`.
 */
function curarCamposCampanas_(cambios) {
  var hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('CAMPANAS');
  if (!hoja) return { ok: false, motivo: 'La hoja CAMPANAS no existe.' };

  cambios = cambios || [];
  var datos = hoja.getDataRange().getValues();
  var headers = datos[0];
  var idxId = headers.indexOf('campana_id');
  var idxPer = headers.indexOf('periodo_id');
  if (idxId === -1 || idxPer === -1) {
    return { ok: false, motivo: 'CAMPANAS no tiene columna `campana_id` y/o `periodo_id`.' };
  }

  var claveDe = function (id, per) {
    return String(id === null || id === undefined ? '' : id).trim() + '||' +
      String(per === null || per === undefined ? '' : per).trim();
  };

  var filaDe = {};
  for (var f = 1; f < datos.length; f++) {
    var clave = claveDe(datos[f][idxId], datos[f][idxPer]);
    if (clave === '||') continue;
    // Igual que en `REUNIONES`: si dos filas comparten la clave gana la primera, y la segunda
    // queda sin tocar. Pisar dos filas con un solo cambio es lo que esto viene a evitar.
    if (!(clave in filaDe)) filaDe[clave] = f;
  }

  var aplicados = [];
  var sinFila = [];
  cambios.forEach(function (c) {
    var clave = claveDe(c.campana_id, c.periodo_id);
    if (!(clave in filaDe)) { sinFila.push(clave); return; }
    var fila = filaDe[clave];
    Object.keys(c).forEach(function (campo) {
      if (campo === 'campana_id' || campo === 'periodo_id') return;
      var col = headers.indexOf(campo);
      if (col === -1) { sinFila.push(clave + '.' + campo + ' (columna inexistente)'); return; }
      var anterior = datos[fila][col];
      if (String(anterior) === String(c[campo])) return; // ya estaba: no se escribe
      hoja.getRange(fila + 1, col + 1).setValue(c[campo]);
      aplicados.push({ clave: clave, campo: campo, anterior: anterior, nuevo: c[campo] });
    });
  });

  return { ok: true, aplicados: aplicados, sin_fila: sinFila, cambios_escritos: aplicados.length };
}
