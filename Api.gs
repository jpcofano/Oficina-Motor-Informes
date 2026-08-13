/**
 * Api.gs — API de pruebas sobre la URL /dev (Paso 1.8).
 *
 * Objetivo: poder invocar funciones del motor contra HEAD desde afuera de la
 * planilla y leer el resultado como JSON, sin deploy versionado.
 *
 * Regla de oro: acá NO se calcula nada. Este módulo enruta, autentica y
 * serializa. Si un cálculo aparece en este archivo, está mal — va a
 * Marcadores.gs.
 *
 * Por qué /dev y no /exec: /dev sirve el último `clasp push` sin republicar, y
 * Google exige sesión con permiso de edición sobre el script antes de que corra
 * una línea de este código. Esa exigencia es la que hace tolerable la acción
 * `llamar` con nombre de función dinámico. Ver docs/RUNBOOK.md § API de pruebas
 * y docs/ENTORNO.local.md (fuera de git) para URLs y cuentas.
 *
 * Apps Script no lee headers HTTP custom: el `Authorization: Bearer` lo consume
 * la infraestructura de Google antes de llegar acá. El token de aplicación va
 * por query string o por body, nunca por header.
 */

/**
 * Clave de `CONFIG` con los mails habilitados (Barrera 1), separados por comas. Sin mail en
 * esa lista no corre nada.
 *
 * `_46` (13/08/2026): la lista **salió del código**. Era `API_AUTORIZADOS_`, un array con un
 * solo mail cableado acá, y sumar a alguien exigía `clasp push` — lo contrario de `D-01`.
 * Mismo argumento que `umbral_anclaje_reunion` en el Paso 2.9F: es un parámetro de
 * operación, no lógica. Es además la **pieza 1 de `D-16`**; las piezas 2 y 3 —el panel
 * filtrando informes por usuario, y el acceso al dato— siguen abiertas.
 *
 * ⚠ **Diferencia con `umbralAnclajeReunion_()`, y es la que importa: acá NO hay default de
 * código.** Aquél cae a una constante si la celda está vacía, porque un umbral ausente es un
 * problema de calibración. Ésta es la puerta de entrada al motor: hoja ilegible, clave
 * ausente o lista vacía **deniegan las tres**. Un default acá convertiría un error de lectura
 * en un acceso concedido, que es exactamente el modo de falla que una barrera no puede tener.
 *
 * **Riesgo que esto acepta, dicho y no dado por obvio:** quien pueda editar la planilla de
 * control puede agregarse a la lista. Es tolerable —quien edita la planilla ya tiene los
 * datos que el informe publica— pero es una decisión tomada, no una consecuencia inadvertida.
 */
var API_CLAVE_AUTORIZADOS_ = 'mails_autorizados';

/**
 * Versión del contrato de esta API, no del código del motor. NO sirve como
 * marca de frescura del código desplegado (P0 en PENDIENTES_consistencia.md):
 * sobre /dev no hace falta, porque /dev es HEAD.
 */
var API_VERSION_ = '1.8';

var API_ACCIONES_ = ['ping', 'version', 'registros', 'bases', 'llamar'];

/** Recursión: llamarse a sí misma cuelga el pedido, no lo resuelve. */
var API_PROHIBIDAS_ = ['doGet', 'doPost', 'manejarPedido_'];

/**
 * Lectores de hoja de registro para la acción `registros`. Api.gs no lee celdas:
 * delega en el lector que ya es dueño de esa hoja.
 */
var API_LECTORES_ = {
  CONFIG: 'leerConfig',
  BASES: 'leerBases',
  INFORMES: 'leerInformes',
  PERIODOS: 'leerPeriodos',
  CAMPANAS: 'leerCampanas',
  MAPEO: 'leerMapeo',
  SOLAPAS: 'leerSolapas',
  REUNIONES: 'leerReuniones_',
  SECCIONES: 'leerSecciones_'
};

/**
 * ⚠ **`doGet` es uno solo en todo el proyecto, y ahora lo pelean dos consumidores.**
 *
 * Apps Script concatena los `.gs` en un scope global: **un segundo `doGet` en otro archivo no
 * daría error, pisaría a éste en silencio** (`CLAUDE.md` §1). Así que el panel como web app no
 * puede traerse el suyo — tiene que entrar por acá.
 *
 * El despacho va **por la presencia de `accion`** y no por un parámetro nuevo tipo `?vista=panel`:
 * la API ya exige `accion` en todos sus llamados y **rechaza el vacío por su propia barrera**
 * (`accion: (vacía)` es justamente el síntoma de "el body se perdió" que documenta `tools/api.js`).
 * Con eso, todo lo que hoy funciona sigue funcionando sin cambiarle una línea al cliente, y una
 * visita de navegador —que nunca lleva `accion`— cae en el panel.
 *
 * `doPost` no se toca: el panel no postea, usa `google.script.run`.
 */
function doGet(e) {
  var params = (e && e.parameter) || {};
  if (Object.prototype.hasOwnProperty.call(params, 'accion')) {
    return manejarPedido_(e);
  }
  return servirPanel_();
}

/**
 * El panel como web app (`doGet` sin `accion`).
 *
 * **Con la misma barrera de mail que la API**, y no es simetría: `appsscript.json` declara hoy
 * `access: ANYONE_ANONYMOUS`, así que sin esto **cualquiera con la URL de `/exec` podría disparar
 * una generación** que corre con la cuenta del que desplegó. La barrera de token de la API no
 * aplica acá —un navegador no la lleva— así que la de mail es la única que queda.
 *
 * Sobre un usuario anónimo `Session.getActiveUser().getEmail()` devuelve `''` y la barrera lo
 * rechaza, que es el comportamiento correcto. **Lo que hay que arreglar al desplegar es el
 * `access`**, no esto: ver el reporte del `_45`.
 */
function servirPanel_() {
  // La traza no viaja al navegador —el panel no es un cliente JSON— pero **sí tiene que
  // quedar en algún lado**: los motivos que `apiListaAutorizados_` distingue no sirven de
  // nada si acá se tiran. Van al log de ejecuciones.
  var traza = [];
  var barrera = apiBarrera1_(traza);

  if (!barrera.ok) {
    // `_48` A.1 — el diagnóstico del rechazo, y la asimetría es deliberada: **el mail va al
    // log, el motivo va a la pantalla**. El motivo no dice nada de nadie —es una categoría,
    // no una identidad— así que mostrarlo no filtra quién está en la lista, y ahorra el ida
    // y vuelta de pedirle a la persona rechazada que alguien más le lea el log.
    //
    // `getEffectiveUser` es **la medición que decide el caso**, no un adorno: con
    // `executeAs: USER_DEPLOYING` la ejecución corre como el dueño. Si el activo viene
    // vacío y el efectivo trae al dueño, el mail nunca llegó a la barrera y la lista de
    // `CONFIG` es inocente. Si los dos vienen iguales y poblados, el problema es otro.
    var efectivo = '';
    try {
      efectivo = Session.getEffectiveUser().getEmail();
    } catch (err) {
      efectivo = '(no legible)';
    }
    console.log('panel — acceso denegado · motivo=' + barrera.motivo +
      ' · activo=«' + (barrera.mail || '') + '»' +
      ' · efectivo=«' + efectivo + '»' +
      ' · ' + traza.join(' | '));
    return apiPantallaDeRechazo_(barrera.motivo);
  }

  console.log('panel — acceso concedido · ' + barrera.mail);
  return HtmlService.createHtmlOutputFromFile('Panel')
    .setTitle('Motor de Informes')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * La pantalla de rechazo, con el motivo en un código corto que la persona rechazada puede
 * leer y repetir. **Ningún mail acá** — ni el suyo ni los de la lista.
 *
 * Los textos están escritos para quien los va a leer, no para nosotros: `CLAUDE.md` no tiene
 * regla sobre esto todavía, pero el `_48` Parte C la instala para el resto del panel —
 * nada de nombres de decisiones, casos ni tokens en la interfaz.
 */
function apiPantallaDeRechazo_(motivo) {
  var QUE_PASO_ = {
    'sin identidad': 'Google no nos dijo con qué cuenta entraste.',
    'fuera de lista': 'Tu cuenta no está habilitada.',
    'clave ausente': 'Falta cargar la lista de cuentas habilitadas.',
    'lista vacía': 'La lista de cuentas habilitadas está vacía.',
    'config ilegible': 'No pudimos leer la configuración.'
  };
  var texto = QUE_PASO_[motivo] || 'No pudimos verificar tu acceso.';

  return HtmlService.createHtmlOutput(
    '<div style="font:15px/1.6 Roboto,Arial,sans-serif;color:#202124;padding:32px;max-width:520px">' +
    '<p style="color:#c5221f;font-weight:500;margin:0 0 8px">No pudimos abrirte el panel.</p>' +
    '<p style="margin:0 0 16px">' + texto + '</p>' +
    '<p style="color:#5f6368;font-size:13px;margin:0">Pasale este código a quien administra el ' +
    'motor: <code style="background:#f1f3f4;padding:2px 6px;border-radius:3px">' + motivo +
    '</code></p></div>'
  ).setTitle('Motor de Informes');
}

function doPost(e) {
  return manejarPedido_(e);
}

/**
 * Único punto de entrada real. Todo adentro de try/catch: una excepción no
 * atrapada devuelve HTML y rompe al cliente, que espera JSON siempre.
 */
function manejarPedido_(e) {
  var t0 = new Date().getTime();
  var traza = [];
  var accion = '';

  try {
    var pedido = apiPedido_(e, traza);
    accion = String(pedido.accion || '');
    traza.push('accion: ' + (accion || '(vacía)'));

    var mail = apiBarrera1_(traza);
    if (!mail.ok) return apiError_(accion, mail.error, traza, t0);

    var token = apiBarrera2_(pedido, traza);
    if (!token.ok) return apiError_(accion, token.error, traza, t0);

    return apiDespachar_(accion, pedido, mail.mail, traza, t0);
  } catch (err) {
    traza.push('excepción: ' + apiEnmascarar_(String(err && err.message)));
    var sobre = {
      ok: false,
      accion: accion,
      error: apiEnmascarar_(String(err && err.message ? err.message : err)),
      traza: traza,
      ms: new Date().getTime() - t0
    };
    if (err && err.stack) sobre.stack = apiEnmascarar_(String(err.stack));
    return apiSalida_(sobre);
  }
}

// ============================================================================
// Pedido
// ============================================================================

/**
 * Pedido unificado: body JSON si vino y parsea; `e.parameter` para lo que falte.
 * El body gana sobre el query string en las claves que trae.
 */
function apiPedido_(e, traza) {
  var pedido = {};
  e = e || {};

  var params = e.parameter || {};
  Object.keys(params).forEach(function (k) { pedido[k] = params[k]; });
  if (Object.keys(params).length) traza.push('query string: ' + Object.keys(params).length + ' parámetro(s)');

  if (e.postData && e.postData.contents) {
    try {
      var cuerpo = JSON.parse(e.postData.contents);
      if (cuerpo && typeof cuerpo === 'object') {
        Object.keys(cuerpo).forEach(function (k) { pedido[k] = cuerpo[k]; });
        traza.push('body JSON: ' + Object.keys(cuerpo).length + ' clave(s)');
      }
    } catch (err) {
      traza.push('body presente pero no es JSON válido — se ignora');
    }
  }

  return pedido;
}

// ============================================================================
// Las dos barreras — se evalúan siempre, en este orden, antes de cualquier acción
// ============================================================================

/**
 * Quinto normalizador del repo, y el motivo va escrito porque `CLAUDE.md` §2 lo exige:
 * ninguno de los cuatro que ya existen sirve para un mail.
 *
 *   - `normalizar_` (Parseo.gs) **pliega acentos**, y un mail no es texto libre — plegarlos
 *     cambiaría la identidad que se está comparando.
 *   - `normalizarValorDeclarado_` (Fuentes.gs, la forma de `R-10`) **preserva mayúsculas**, y
 *     acá hay que plegarlas: nadie escribe su mail con la misma capitalización dos veces, y
 *     el motivo de `R-10` para preservarlas —quince pares de encabezados que son columnas
 *     distintas— no existe entre dos direcciones que sólo difieren en el case.
 *   - `normalizarParaComparar_` (Instalar.gs) canonicaliza fechas; `normalizarIdCuenta_`
 *     (Union.gs) es sólo `trim`, que acá se queda corto.
 *
 * Entonces: `trim` + minúsculas, y nada más. No colapsa espacios interiores a propósito —
 * un mail no los tiene, y colapsarlos escondería una celda mal cargada en vez de rechazarla.
 */
function normalizarMailAutorizado_(valor) {
  return String(valor === null || valor === undefined ? '' : valor).trim().toLowerCase();
}

/**
 * Lectura real de la lista blanca desde `CONFIG`. Separada de `apiListaAutorizados_` para
 * que las pruebas puedan inyectar los modos de falla sin tocar la planilla.
 *
 * ⚠ **`apiHojaControl_` va primero, y no es adorno.** `leerConfig()` resuelve la hoja con
 * `SpreadsheetApp.getActiveSpreadsheet()`, y en contexto web app eso puede ser `null` —
 * `servirPanel_` llama a la barrera sin ninguna planilla atada. Sin esta línea el rechazo
 * llegaría como `TypeError` desde adentro de `leerConfig`: falla cerrada igual, pero
 * indistinguible en la traza de cualquier otra excepción (`_46` A.2, `_46.1`).
 *
 * Devuelve `null` —no `''`— cuando la clave no está, para que el llamador pueda separar
 * "la clave no existe" de "la clave está vacía".
 */
function apiLeerMailsDeConfig_(traza) {
  apiHojaControl_(traza);
  var config = leerConfig();
  return Object.prototype.hasOwnProperty.call(config, API_CLAVE_AUTORIZADOS_)
    ? config[API_CLAVE_AUTORIZADOS_]
    : null;
}

/**
 * Resuelve la lista blanca, con los tres modos de falla terminando en rechazo.
 *
 * **Cada uno deja su propio motivo en la traza**, y ésa es la mitad del trabajo: sin eso,
 * "no pude leer la hoja" y "la lista quedó vacía" se ven iguales desde afuera y se
 * investigan igual, cuando una es un problema de plataforma y la otra una celda borrada.
 *
 * **Nunca devuelve `ok` por no haber podido verificar.** Es lo mismo que hace `apiBarrera2_`
 * con `API_TOKEN` ausente, y por el mismo motivo.
 *
 * `leer` se inyecta desde `Pruebas.gs`; en producción es `apiLeerMailsDeConfig_`.
 */
function apiListaAutorizados_(traza, leer) {
  leer = leer || apiLeerMailsDeConfig_;

  var crudo;
  try {
    crudo = leer(traza);
  } catch (err) {
    traza.push('barrera 1: no se pudo leer CONFIG — ' +
      apiEnmascarar_(String(err && err.message ? err.message : err)));
    return { ok: false, motivo: 'config ilegible' };
  }

  if (crudo === null || crudo === undefined) {
    traza.push('barrera 1: CONFIG no tiene la clave `' + API_CLAVE_AUTORIZADOS_ + '`');
    return { ok: false, motivo: 'clave ausente' };
  }

  var mails = String(crudo).split(',').map(normalizarMailAutorizado_).filter(Boolean);
  if (!mails.length) {
    traza.push('barrera 1: `' + API_CLAVE_AUTORIZADOS_ + '` está vacía — nadie autorizado');
    return { ok: false, motivo: 'lista vacía' };
  }

  return { ok: true, mails: mails };
}

/**
 * Barrera 1 — identidad. Sobre /dev, Google ya validó el Bearer y devuelve el
 * mail de quien llama; sobre /exec anónimo devuelve string vacío.
 *
 * El orden importa: sin mail se rechaza **antes** de ir a la planilla. Un anónimo no puede
 * costar una lectura de `CONFIG`.
 */
function apiBarrera1_(traza) {
  var mail = '';
  try {
    mail = Session.getActiveUser().getEmail();
  } catch (err) {
    traza.push('barrera 1: no se pudo leer la identidad');
  }

  if (!mail) {
    traza.push('barrera 1: sin mail');
    return { ok: false, error: 'no autorizado', motivo: 'sin identidad' };
  }

  var lista = apiListaAutorizados_(traza);
  // El motivo de la lista viaja tal cual: `clave ausente` y `lista vacía` son problemas de
  // la configuración, no de quien llama, y colapsarlos con "fuera de lista" manda a
  // investigar a la persona equivocada.
  //
  // El `mail` viaja en los rechazos **para el log de `servirPanel_`**, no para la respuesta:
  // `manejarPedido_` sólo lee `.error`, así que nunca sale por HTTP.
  if (!lista.ok) return { ok: false, error: 'no autorizado', motivo: lista.motivo, mail: mail };

  if (lista.mails.indexOf(normalizarMailAutorizado_(mail)) === -1) {
    // Se nombra el mail recibido a propósito: quien llama ya conoce su propia
    // identidad, y sin esto el rechazo no distingue "no estás en la lista" de
    // "Google no me dio tu mail".
    traza.push('barrera 1: mail fuera de la lista — ' + mail +
      ' (la lista tiene ' + lista.mails.length + ')');
    return { ok: false, error: 'no autorizado', motivo: 'fuera de lista', mail: mail };
  }

  traza.push('barrera 1: ok');
  // El mail vuelve **sin normalizar**: es la identidad que devolvió Google, y `ping` la
  // reporta para que quien llama pueda verificar con qué cuenta entró.
  return { ok: true, mail: mail };
}

/**
 * Barrera 2 — token de aplicación contra la propiedad de script API_TOKEN.
 * Propiedad ausente rechaza: nunca dejar pasar por ausencia.
 */
function apiBarrera2_(pedido, traza) {
  var esperado = PropertiesService.getScriptProperties().getProperty('API_TOKEN');
  if (!esperado) {
    traza.push('barrera 2: API_TOKEN no está seteado en las propiedades del script');
    return { ok: false, error: 'no autorizado' };
  }

  if (!apiIgualesEnTiempoFijo_(String(pedido.token || ''), esperado)) {
    traza.push('barrera 2: token inválido');
    return { ok: false, error: 'no autorizado' };
  }

  traza.push('barrera 2: ok');
  return { ok: true };
}

/**
 * Comparación de longitud fija: recorre todos los caracteres acumulando
 * diferencias, sin cortar en el primer mismatch.
 */
function apiIgualesEnTiempoFijo_(a, b) {
  var largo = Math.max(a.length, b.length);
  var dif = a.length ^ b.length;
  for (var i = 0; i < largo; i++) {
    // charCodeAt fuera de rango devuelve NaN; `|| 0` lo neutraliza sin cortar el bucle.
    dif = dif | ((a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0));
  }
  return dif === 0;
}

/** El token no se escribe nunca: ni en la traza, ni en un error, ni en el stack. */
function apiEnmascarar_(texto) {
  if (!texto) return texto;
  var secreto = PropertiesService.getScriptProperties().getProperty('API_TOKEN');
  if (!secreto) return texto;
  return String(texto).split(secreto).join('«token»');
}

// ============================================================================
// Acciones
// ============================================================================

function apiDespachar_(accion, pedido, mail, traza, t0) {
  if (accion === 'ping') {
    return apiOk_(accion, { pong: true, mail: mail, fecha: new Date() }, traza, t0);
  }

  if (accion === 'version') {
    var libro = apiHojaControl_(traza);
    return apiOk_(accion, {
      api: API_VERSION_,
      script_id: ScriptApp.getScriptId(),
      hoja_control: { id: libro.getId(), nombre: libro.getName() },
      zona_horaria: libro.getSpreadsheetTimeZone(),
      mail: mail
    }, traza, t0);
  }

  if (accion === 'registros') {
    return apiRegistros_(accion, pedido, traza, t0);
  }

  if (accion === 'bases') {
    apiHojaControl_(traza);
    traza.push('llama: diagnosticoBases_');
    return apiOk_(accion, diagnosticoBases_(), traza, t0);
  }

  if (accion === 'llamar') {
    return apiLlamar_(accion, pedido, traza, t0);
  }

  return apiError_(accion, 'acción desconocida — válidas: ' + API_ACCIONES_.join(', '), traza, t0);
}

/** Dump de una hoja de registro, vía el lector dueño de esa hoja. */
function apiRegistros_(accion, pedido, traza, t0) {
  var hoja = String(pedido.hoja || '').toUpperCase();
  if (!hoja) {
    return apiError_(accion, 'falta el parámetro `hoja` — válidas: ' + Object.keys(API_LECTORES_).join(', '), traza, t0);
  }
  if (!Object.prototype.hasOwnProperty.call(API_LECTORES_, hoja)) {
    return apiError_(accion, 'hoja sin lector: ' + hoja + ' — válidas: ' + Object.keys(API_LECTORES_).join(', '), traza, t0);
  }

  apiHojaControl_(traza);
  var nombreLector = API_LECTORES_[hoja];
  var lector = apiGlobal_(nombreLector);
  if (typeof lector !== 'function') {
    return apiError_(accion, 'el lector ' + nombreLector + ' no existe en este código', traza, t0);
  }

  traza.push('lector: ' + nombreLector);
  // SECCIONES es la única que se lee por informe.
  var argumento = hoja === 'SECCIONES' ? [pedido.informe_id] : [];
  return apiOk_(accion, lector.apply(null, argumento), traza, t0);
}

/** Invoca una función del motor por nombre. Ver §1.4 del prompt del Paso 1.8. */
function apiLlamar_(accion, pedido, traza, t0) {
  var nombre = String(pedido.fn || '');
  if (!nombre) return apiError_(accion, 'falta el parámetro `fn`', traza, t0);

  if (API_PROHIBIDAS_.indexOf(nombre) !== -1) {
    return apiError_(accion, 'función no invocable desde la API: ' + nombre, traza, t0);
  }

  var fn = apiGlobal_(nombre);
  if (typeof fn !== 'function') {
    return apiError_(accion, 'funcion no encontrada: ' + nombre, traza, t0);
  }

  var args = pedido.args;
  if (args === undefined || args === null || args === '') args = [];
  if (typeof args === 'string') {
    try {
      args = JSON.parse(args);
    } catch (err) {
      return apiError_(accion, '`args` vino como texto y no es JSON válido', traza, t0);
    }
  }
  if (!Array.isArray(args)) return apiError_(accion, '`args` tiene que ser un array', traza, t0);

  apiHojaControl_(traza);
  // Nombre y cantidad, nunca los valores.
  traza.push('llama: ' + nombre + ' con ' + args.length + ' arg(s)');

  // Paso 2.14 — lo que la función haya querido mostrar por pantalla viaja en la
  // respuesta. Se vacía ANTES de llamar: si no, una corrida arrastra lo dicho por
  // la anterior. Es el mismo criterio que la `traza`, que también es por pedido.
  UI_DICHO_ = [];
  var resultado = fn.apply(null, args);
  if (UI_DICHO_.length) traza.push('dicho por pantalla: ' + UI_DICHO_.length + ' mensaje(s)');

  var sobre = apiOk_(accion, resultado, traza, t0);
  return UI_DICHO_.length ? apiSalida_(apiConDicho_(sobre, UI_DICHO_)) : sobre;
}

/**
 * Agrega `dicho` al sobre ya armado. Separado para no tocar `apiOk_`, que lo usan
 * las otras cuatro acciones y no muestran nada por pantalla.
 */
function apiConDicho_(sobre, dicho) {
  var texto = sobre.getContent();
  var obj = JSON.parse(texto);
  obj.dicho = dicho.slice();
  return obj;
}

function apiGlobal_(nombre) {
  var alcance = typeof globalThis === 'undefined' ? this : globalThis;
  return alcance[nombre];
}

/**
 * Sobre HTTP no hay planilla activa: los módulos del motor leen todo con
 * SpreadsheetApp.getActiveSpreadsheet(), así que si el binding del contenedor no
 * alcanza, hay que atarla explícitamente. El id vive en las propiedades del
 * script (HOJA_CONTROL_ID), no en el código.
 */
function apiHojaControl_(traza) {
  var libro = SpreadsheetApp.getActiveSpreadsheet();
  if (libro) {
    traza.push('hoja de control: por binding del contenedor');
    return libro;
  }

  var id = PropertiesService.getScriptProperties().getProperty('HOJA_CONTROL_ID');
  if (!id) {
    throw new Error('No hay hoja de control: getActiveSpreadsheet() devolvió null y la propiedad HOJA_CONTROL_ID no está seteada');
  }

  libro = SpreadsheetApp.openById(id);
  SpreadsheetApp.setActiveSpreadsheet(libro);
  traza.push('hoja de control: abierta por HOJA_CONTROL_ID');
  return libro;
}

// ============================================================================
// Salida
// ============================================================================

function apiOk_(accion, resultado, traza, t0) {
  return apiSalida_({
    ok: true,
    accion: accion,
    resultado: serializar_(resultado, 0),
    traza: traza,
    ms: new Date().getTime() - t0
  });
}

function apiError_(accion, error, traza, t0) {
  return apiSalida_({
    ok: false,
    accion: accion,
    error: apiEnmascarar_(error),
    traza: traza,
    ms: new Date().getTime() - t0
  });
}

/** Apps Script no permite setear status HTTP: todo sale 200, el estado va adentro. */
function apiSalida_(sobre) {
  return ContentService
    .createTextOutput(JSON.stringify(sobre))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Serialización defensiva. Lo que no sobrevive a JSON.stringify (Spreadsheet,
 * Range, Presentation) se nombra en vez de romper el pedido entero.
 *
 * Nota operativa: una función `void` devuelve `null` acá. Para probar una por la
 * API hay que hacer que retorne algo — está documentado en el RUNBOOK.
 */
function serializar_(valor, profundidad) {
  profundidad = profundidad || 0;

  if (valor === null || valor === undefined) return null;

  var tipo = typeof valor;
  if (tipo === 'string' || tipo === 'boolean') return valor;
  if (tipo === 'number') return isFinite(valor) ? valor : String(valor);
  if (valor instanceof Date) return valor.toISOString();
  if (tipo === 'function') return '[función]';

  if (profundidad >= 5) return '[profundidad máxima]';

  if (Array.isArray(valor)) {
    return valor.map(function (item) { return serializar_(item, profundidad + 1); });
  }

  if (tipo === 'object') {
    var proto = Object.getPrototypeOf(valor);
    if (proto !== Object.prototype && proto !== null) {
      return '[objeto no serializable] ' + Object.prototype.toString.call(valor);
    }
    var salida = {};
    Object.keys(valor).forEach(function (clave) {
      salida[clave] = serializar_(valor[clave], profundidad + 1);
    });
    return salida;
  }

  return String(valor);
}
