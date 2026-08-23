/**
 * Marcadores.gs — EL CORAZÓN. Toda la aritmética del informe vive acá y en
 * ningún otro módulo (Fuentes.gs/Union.gs leen y ensamblan filas; Parseo.gs
 * normaliza texto; nadie más suma, promedia ni calcula ratios).
 *
 * Paso 2.9 Parte E — corte vertical: en vez del despachador genérico completo
 * de docs/Prompts/Paso-3-v2.md (que lee MARCADORES fila por fila), este primer
 * corte cablea a mano los diez tokens del bloque "alcance objetivo e
 * inscriptos" (`ecv_*`) para una sola reunión — "Uno a uno en Retiro,
 * 24/07/2026, pre" — y valida la cadena completa hasta `VISTA_PREVIA`. El
 * despachador genérico (Parte C de Paso-3-v2) queda para cuando se sID cablear
 * MARCADORES completo.
 *
 * Expone:
 *   opSUMA(ctx) / opCONTEO(ctx) / opULTIMO(ctx) / opRATIO(ctx) / opPCT(ctx) /
 *     opTEXTO(ctx) -> { valor, traza, filas }. Quien arma `ctx` es responsable de
 *     resolver MAPEO y de traer los datos ya leídos y ya filtrados; estas
 *     funciones solo hacen la cuenta, nunca abren una base.
 *   despacharOperacion_(nombre, ctx) -> { ok, valor, traza, filas } | { ok, motivo }
 *     — resuelve por MAPA EXPLÍCITO (`OPERACIONES_`), nunca por `eval` ni contra
 *     el global, y soporta el escape hatch `FN:` contra `FUNCIONES_PROPIAS_`.
 *     Paso 3 (v3) Parte A.
 *   corteVerticalRetiro2407_() -> corre los diez tokens y escribe VISTA_PREVIA
 *     (10 filas de token + 3 de control). Ítem de menú "Calcular corte vertical
 *     (Paso 2.9E)".
 *
 * ⚠ Simplificación deliberada de este corte (documentada, no oculta): los diez
 * tokens se leen DIRECTO de la fila de `rdv` ya emparejada al encuentro (match
 * por barrio + fecha + status=Realizada). El diseño completo de Paso 2.9E pide
 * que `ecv_insc_mail/digital/cc/ivr` salgan de las solapas de canal
 * (`digital/Directa Mail`, `digital/Digital`, `looker/CC`, `digital/Directa
 * IVR`) vía la cuenta/campaña anclada a ese encuentro — no se cableó así acá
 * porque determinar CUÁL cuenta digital corresponde a "Retiro 24/07" requiere
 * inspeccionar la base viva de `digital`, que no está disponible en este
 * entorno de edición. Usar las columnas ya mapeadas de `rdv`
 * (`insc_mail`/`insc_cc`/`insc_ivr`/`insc_digital`/`insc_dif`, sembradas desde
 * el Paso 1.9) ejercita la cadena completa `REUNIONES` → anclaje →
 * `Marcadores.gs` → `VISTA_PREVIA` con datos reales y trazables — que es el
 * objetivo del corte — dejando pendiente, marcado en el código y en el commit,
 * migrar esos cuatro tokens a fuente de canal cuando se confirme el link.
 */

/* ============ Paso 3 (v3) Parte A — contrato de `ctx` y despacho ============
 *
 * Las seis operaciones ya existían desde el corte vertical del `Paso-2.9E`. Lo que agrega
 * esta parte es el contrato que el `Paso-3-v3` declara y que el despachador de la Parte C
 * necesita, sin romper al llamador que ya hay (`corteVerticalRetiro2407_`):
 *
 *   ctx = { marcador, base_id, solapa, campo_logico, columna, ventana, filas | valores,
 *           encabezado, valor_fijo }
 *
 * **`filas` y `valores` son dos formas de lo mismo, y se aceptan las dos a propósito.**
 * `valores` es el arreglo de la columna ya extraído — es lo que pasa el corte vertical, que
 * lee una fila sola—. `filas` son los objetos que devuelve `leerFuente()`, YA leídos y YA
 * filtrados por ventana y por `MAPEO.valores_incluidos` (`Paso-2.16`): el despachador pide
 * los datos y confía. De `filas` se extrae con `ctx.encabezado`, que es el **nombre** de la
 * columna, no su letra.
 *
 * **Por qué el nombre y no la letra:** resolver letra → encabezado es leer `MAPEO`, y estas
 * funciones **no resuelven `MAPEO` ni abren bases** — sólo hacen la cuenta. `ctx.columna` va
 * igual, pero sólo para la traza: quien la lee necesita saber de qué columna salió el
 * número.
 */

/** El arreglo de valores sobre el que opera, venga como `valores` o como `filas`. */
function valoresDeCtx_(ctx) {
  if (ctx.valores) return ctx.valores;
  if (!ctx.filas) return [];
  var clave = ctx.encabezado;
  return ctx.filas.map(function (fila) {
    return clave && (clave in fila) ? fila[clave] : '';
  });
}

/** ` , 26/06–02/07` para la traza, o vacío si el `ctx` no trae ventana. */
function trazaDeVentana_(ctx) {
  if (!ctx.ventana || !ctx.ventana.desde || !ctx.ventana.hasta) return '';
  return ', ' + formatearFecha_(ctx.ventana.desde) + '–' + formatearFecha_(ctx.ventana.hasta);
}

/**
 * SUMA de una columna ya resuelta. Ignora celdas vacías o no numéricas (no las
 * cuenta como 0 silenciosamente en el numerador, pero sí en el total de filas
 * — la traza distingue las dos cosas).
 */
function opSUMA(ctx) {
  var valores = valoresDeCtx_(ctx);
  var suma = 0;
  var conValor = 0;
  valores.forEach(function (valor) {
    if (valor === '' || valor === null || valor === undefined) return;
    var numero = Number(valor);
    if (isNaN(numero)) return;
    suma += numero;
    conValor++;
  });

  /* ── El criterio, y por qué (13/08) ───────────────────────────────────────
   * **Un agregado sin nada que agregar no vale cero: no tiene valor.** Si ninguna
   * fila aportó un número, `SUMA` devuelve `sin_datos` y **no `0`**.
   *
   * Se midió en el deck: las cuatro slides de encuentro sin filas de IVR mostraban
   * **`0`** en `enc_atendidos`, `enc_audiencia` y `enc_marque1`, donde `ULTIMO` sí
   * ponía `«FALTA»`. Eran **16 ceros falsos**, y subieron "tokens con valor" de 18 a
   * 34: el conteo mejoraba por un artefacto. **Un cero de audiencia se lee como "no
   * llamamos a nadie", no como "no hay dato"** — el mismo modo de falla que la cuenta
   * `3347`, que sobrevivió tres semanas porque el número parecía razonable.
   *
   * **No aplica a `CONTEO`, y la distinción es la que importa:** "cuántos encuentros
   * hubo" con cero filas **es** cero, y es un dato. "Cuánta audiencia" con cero filas
   * es *no sé*. Por eso el arreglo es de `SUMA` y no de las seis operaciones.
   *
   * **El corte es `conValor`, no `valores.length`**, y eso distingue tres casos que
   * antes se veían iguales: cero filas → sin dato; filas con la celda vacía → sin
   * dato; **filas con un `0` escrito → cero, que sí es un dato** y se devuelve.
   * ──────────────────────────────────────────────────────────────────────── */
  if (conValor === 0) {
    return {
      valor: '',
      traza: 'SUMA: ninguna fila aportó un valor numérico a "' + ctx.campo_logico + '" (col ' + ctx.columna +
        ') sobre ' + valores.length + ' fila(s) de ' + ctx.base_id + (ctx.solapa ? '/' + ctx.solapa : '') +
        ' — sin dato, no cero' + trazaDeVentana_(ctx),
      filas: valores.length
    };
  }

  return {
    valor: suma,
    traza: 'SUMA de "' + ctx.campo_logico + '" (col ' + ctx.columna + ') sobre ' + valores.length + ' fila(s) de ' +
      ctx.base_id + (ctx.solapa ? '/' + ctx.solapa : '') + ' (' + conValor + ' con valor numérico)' + trazaDeVentana_(ctx),
    filas: valores.length
  };
}

function opCONTEO(ctx) {
  var valores = valoresDeCtx_(ctx);
  return {
    valor: valores.length,
    traza: 'CONTEO de filas de ' + ctx.base_id + (ctx.solapa ? '/' + ctx.solapa : '') + trazaDeVentana_(ctx),
    filas: valores.length
  };
}

/**
 * Último valor no vacío del arreglo (recorrido de atrás hacia adelante) — para
 * stocks, para bases `snapshot`, y para una lectura DIRECTA de una sola fila
 * (`ctx.valores` con un único elemento: "último de 1" es exactamente ese valor,
 * con la traza dejando ver que la base fue 1 fila, no una agregación).
 */
function opULTIMO(ctx) {
  var valores = valoresDeCtx_(ctx);

  // `ULTIMO` por FECHA (12/08) — antes era "la última posición del array", o sea **el orden
  // de filas de la hoja**. Con el filtro `mail_tipo=Convocatoria` quedan tres filas —22/07
  // ×2 y 25/07— y el número correcto (44.043) salía sólo porque la del 25/07 está última.
  // Las del 22/07 son **201.515** y **25.560**: reordenar la hoja cambiaba el número a uno
  // grande, plausible y con el rótulo correcto al lado, sin que saltara nada. Es el mismo
  // modo de falla que la cuenta `3347`, que sobrevivió tres semanas por eso.
  //
  // `ctx.fechas` lo arma el despachador (resolver qué columna es la fecha es **estructura**,
  // y vive en `Generador.gs`; acá sólo se elige, que es la parte que sí es de este módulo).
  // Si no viene, se cae al comportamiento viejo **y la traza lo dice** — hay marcadores sobre
  // solapas sin fecha mapeada que hoy funcionan así y no se rompen por esto.
  var fechas = ctx.fechas;
  if (fechas && fechas.length === valores.length) {
    var candidatos = [];
    for (var f = 0; f < valores.length; f++) {
      var v = valores[f];
      if (v === '' || v === null || v === undefined) continue;
      if (!fechas[f]) continue;
      candidatos.push({ valor: v, fecha: fechas[f] });
    }

    if (candidatos.length) {
      candidatos.sort(function (a, b) { return b.fecha.getTime() - a.fecha.getTime(); });
      var tope = candidatos[0].fecha.getTime();
      var empatados = candidatos.filter(function (c) { return c.fecha.getTime() === tope; });
      var distintos = {};
      empatados.forEach(function (c) { distintos[String(c.valor)] = true; });

      // Empate real: misma fecha máxima y **valores distintos**. No se elige. Si los valores
      // empatados son idénticos no hay nada que decidir y elegir cualquiera es lo mismo.
      if (Object.keys(distintos).length > 1) {
        return {
          valor: '',
          ambiguo: true,
          traza: '«FALTA:@ultimo_ambiguo» — ÚLTIMO por fecha: ' + empatados.length + ' filas comparten la fecha ' +
            'más alta (' + Utilities.formatDate(candidatos[0].fecha, Session.getScriptTimeZone(), 'dd/MM/yyyy') +
            ') con valores distintos (' + Object.keys(distintos).join(' / ') + ') en "' + ctx.campo_logico +
            '". No se elige: un número plausible de la fila equivocada es peor que un hueco' + trazaDeVentana_(ctx),
          filas: valores.length
        };
      }

      return {
        valor: candidatos[0].valor,
        traza: 'ÚLTIMO por fecha de "' + ctx.campo_logico + '" (col ' + ctx.columna + '): se eligió la fila del ' +
          Utilities.formatDate(candidatos[0].fecha, Session.getScriptTimeZone(), 'dd/MM/yyyy') + ', la más alta de ' +
          candidatos.length + ' fila(s) con valor y fecha, sobre ' + valores.length + ' fila(s) de ' +
          ctx.base_id + (ctx.solapa ? '/' + ctx.solapa : '') + trazaDeVentana_(ctx),
        filas: valores.length
      };
    }
  }

  /* `_39` (12/08) — **sin fecha, elegir por posición es elegir por el orden de la hoja**, que es
   * exactamente lo que el bloque de arriba vino a matar para el caso CON fecha. Faltaba cerrar la
   * otra mitad.
   *
   * El caso que lo trajo: `digital/Alcance` no tiene columna de fecha —ni mapeada ni en la hoja—
   * y sus cuentas traen **dos filas idénticas en las seis columnas salvo el número**.
   * `3387-JULJDGGC` (Orden Público) da `66.345` y `457.883`, y `D-06` valida el primero
   * (`65576`, nota *"base 31/07 = 66345"*). Por posición se publicaba el segundo: 7× más grande,
   * plausible, y con el rótulo correcto al lado.
   *
   * **Mismo criterio y mismo umbral que el empate por fecha: valores distintos, no se elige.** Si
   * las filas con valor traen todas lo mismo, no hay nada que decidir y sigue de largo — por eso
   * los `ULTIMO` de una sola fila (los de `rdv` por ítem) no cambian.
   *
   * Radio de acción, medido antes de escribir esto: `rdv/RVD JM-CM - ES` (col E) y
   * `digital/Directa Mail` (col F) **sí** tienen `fecha_periodo`, así que van por la rama de
   * arriba y no llegan acá. `digital/Alcance` es la única solapa sin fecha con un marcador
   * `ULTIMO` encima. */
  var conValor = valores.filter(function (v) { return v !== '' && v !== null && v !== undefined; });
  var distintosSinFecha = {};
  conValor.forEach(function (v) { distintosSinFecha[String(v)] = true; });
  if (Object.keys(distintosSinFecha).length > 1) {
    return {
      valor: '',
      ambiguo: true,
      traza: '«FALTA:@ultimo_sin_fecha_ambiguo» — ÚLTIMO sin fecha utilizable sobre "' + ctx.campo_logico +
        '" (col ' + ctx.columna + '): ' + conValor.length + ' fila(s) con valores distintos (' +
        Object.keys(distintosSinFecha).join(' / ') + ') en ' + ctx.base_id + (ctx.solapa ? '/' + ctx.solapa : '') +
        '. No se elige: elegir por posición es elegir por el orden de la hoja' + trazaDeVentana_(ctx),
      filas: valores.length
    };
  }

  for (var i = valores.length - 1; i >= 0; i--) {
    var valor = valores[i];
    if (valor !== '' && valor !== null && valor !== undefined) {
      return {
        valor: valor,
        traza: 'ÚLTIMO por POSICIÓN (sin fecha utilizable, y las ' + conValor.length + ' fila(s) con valor ' +
          'traen el mismo) de "' + ctx.campo_logico + '" (col ' + ctx.columna +
          ') sobre ' + valores.length + ' fila(s) de ' + ctx.base_id + (ctx.solapa ? '/' + ctx.solapa : '') +
          trazaDeVentana_(ctx),
        filas: valores.length
      };
    }
  }
  return {
    valor: '',
    traza: 'ÚLTIMO: ninguna fila con valor no vacío en "' + ctx.campo_logico + '" sobre ' + valores.length + ' fila(s)' +
      trazaDeVentana_(ctx),
    filas: valores.length
  };
}

/**
 * `campo_logico` para RATIO/PCT viene como `numerador/denominador` (Paso-3-v2
 * Parte A). Acá no se resuelve MAPEO: el llamador ya trajo `ctx.valoresNumerador`
 * / `ctx.valoresDenominador` resueltos (cada uno una SUMA propia).
 */
function opRATIO(ctx) {
  // Paso 3 (v3): el contrato exige los dos arreglos resueltos. Si falta alguno, se dice
  // cuál — un TypeError acá sale en la traza como "Cannot read properties of undefined",
  // que no le dice nada a quien mira el informe.
  if (!ctx.valoresNumerador || !ctx.valoresDenominador) {
    throw new Error('RATIO/PCT necesita `valoresNumerador` y `valoresDenominador` ya resueltos; ' +
      'falta ' + (!ctx.valoresNumerador ? '`valoresNumerador`' : '`valoresDenominador`') +
      '. `campo_logico` se declara como "numerador/denominador" y lo resuelve el despachador, no esta función.');
  }

  var numerador = ctx.valoresNumerador.reduce(function (acc, v) { var n = Number(v); return acc + (isNaN(n) ? 0 : n); }, 0);
  var denominador = ctx.valoresDenominador.reduce(function (acc, v) { var n = Number(v); return acc + (isNaN(n) ? 0 : n); }, 0);
  var valor = denominador ? numerador / denominador : '';

  // Los nombres son para la traza. Si el llamador no los pasa, se parten de `campo_logico`,
  // que el prompt declara con la forma `numerador/denominador`.
  var partes = String(ctx.campo_logico || '').split('/');
  var nombreNum = ctx.numeradorNombre || partes[0] || 'numerador';
  var nombreDen = ctx.denominadorNombre || partes[1] || 'denominador';

  return {
    valor: valor,
    traza: 'RATIO ' + nombreNum + '/' + nombreDen + ' = ' + numerador + '/' + denominador +
      (denominador ? '' : ' (denominador vacío o cero)') + trazaDeVentana_(ctx),
    filas: Math.max(ctx.valoresNumerador.length, ctx.valoresDenominador.length)
  };
}

function opPCT(ctx) {
  var ratio = opRATIO(ctx);
  return {
    valor: ratio.valor === '' ? '' : ratio.valor * 100,
    traza: 'PCT — ' + ratio.traza,
    filas: ratio.filas
  };
}

/**
 * Valor literal cargado a mano — no sale de ninguna base.
 *
 * ⚠ **`TEXTO` no arma listas.** Lee un literal de `valor_fijo` y nada más. Una caja que
 * enumera —los doce nombres de campaña de la lámina M2— **no tiene operación todavía**:
 * ninguna de las seis devuelve un arreglo concatenado, y meter esa lista en `valor_fijo`
 * sería curaduría manual disfrazada de configuración, que cambia cada semana. Está anotado
 * como `P1` en `docs/PENDIENTES_consistencia.md`, con sus candidatos.
 */
function opTEXTO(ctx) {
  return { valor: ctx.valor_fijo, traza: 'TEXTO literal (valor_fijo)', filas: 0 };
}

/**
 * Mapa explícito `operacion -> función`. **Nunca `eval`, y nunca `this[nombre]`**: en Apps
 * Script todos los `.gs` comparten un único scope global, así que resolver por nombre contra
 * el global convierte una celda de `MARCADORES` en la capacidad de invocar cualquier función
 * del proyecto — incluidas las que escriben. Un mapa es la lista blanca.
 */
/**
 * `LISTA` — valores distintos, publicados con el canon de un catálogo. Implementa `R-18` y su
 * addendum 1, y **nada más**: lo que no está en la regla no está acá.
 *
 * **Es genérica y no sabe de barrios.** El catálogo llega por `ctx.catalogo`
 * (`{ lista, resolver, origen }`) y el separador por `ctx.separador`: los dos los arma el
 * despachador leyendo `MARCADORES`. Una operación con `'rdv'` o con `', '` adentro sirve para
 * un token y para ninguno más, que es justo lo que `D-01` mide.
 *
 * **El `resolver` es opcional y existe por las variantes ortográficas.** Sin él, un valor
 * matchea si su forma normalizada coincide con la de alguna entrada del catálogo. Con él
 * —`parsearBarrio_` para barrios— además se cubren las variantes que no colapsan por
 * `normalizar_`, que **no toca puntuación ni espacios internos** (`Villa Gral. Mitre`).
 *
 * **Los cuatro estados de `R-18` addendum 1, y por qué se distinguen:**
 *  - cero filas → valor vacío, y el despachador lo baja a `sin_datos`;
 *  - **celda vacía → NO es un no-match**: no entra a la lista, no cuenta como rechazo, y se
 *    cuenta en la traza. Contarla como rechazo mandaría el token a revisión por un motivo
 *    falso y escondería los rechazos reales entre ruido;
 *  - valor que no matchea → **queda fuera de la lista y viaja en `rechazados`**, para que el
 *    despachador lo lleve a `FALTANTES`. **Nunca llega al deck.**
 *
 * ⚠ **Catálogo vacío es `error`, no "nada matcheó".** `catalogoBarriosDesdeBase_` devuelve
 * lista vacía **con motivo** cuando la hoja no abre, y sin esta guarda ese fallo sería
 * indistinguible de "todos los valores están mal": los cuatro barrios buenos irían a rechazo
 * y el informe diría que el dato está sucio cuando el problema es de acceso.
 */
/* ⭐ `2026-08-22` — **el núcleo compartido de `LISTA` y `ELEMENTO`, extraído a propósito.**
 *
 * `ELEMENTO` devuelve *"el N-ésimo de lo que `LISTA` publicaría entero"*, y la decisión del usuario
 * dice **mismo universo, mismo orden, mismo cálculo**. La única forma de garantizar eso es que
 * **las dos llamen al mismo código**: una copia paralela sería el error que este repo ya cometió
 * cuatro veces —*el instrumento que reproduce lógica del motor y la reproduce peor*
 * (`CLAUDE.md` §4)— y acá el síntoma sería peor que un instrumento malo: **dos tokens de la misma
 * caja publicando elementos de listas distintas**.
 *
 * ⚠ **Y memoiza, que es el requisito 1 y no es una optimización.** Si `camp1` y `camp2` recalculan
 * la lista cada uno, **dos lecturas pueden ver universos distintos** —la base se mueve durante la
 * corrida, `R-31`— y publicar elementos **que no son consecutivos**. El conjunto se arma **una vez
 * y se reparte**. Es la misma forma del arreglo que el `_28` resultó no necesitar.
 *
 * ⚠⚠ **La clave del memo tiene que garantizar LAS MISMAS FILAS, no parecerse** —la trampa que
 * `CLAUDE.md` §4 nombra para las cachés—: por eso incluye base, solapa, campo, filtro, dimensiones,
 * catálogo **y los dos extremos de la ventana**. Meter menos haría que dos conjuntos distintos
 * compartan entrada, que es un valor movido y no una optimización.
 */
var cacheConjuntoLista_ = {};

function claveConjuntoLista_(ctx) {
  var v = ctx.ventana || {};
  return [
    ctx.base_id, ctx.solapa, ctx.campo_logico, ctx.filtro, ctx.dimensiones,
    (ctx.catalogo && ctx.catalogo.origen) || '',
    v.desde ? String(v.desde) : '', v.hasta ? String(v.hasta) : ''
  ].join('||');
}

function conjuntoDeLista_(ctx) {
  var clave = claveConjuntoLista_(ctx);
  if (Object.prototype.hasOwnProperty.call(cacheConjuntoLista_, clave)) {
    return cacheConjuntoLista_[clave];
  }
  var r = calcularConjuntoDeLista_(ctx);
  cacheConjuntoLista_[clave] = r;
  return r;
}

function calcularConjuntoDeLista_(ctx) {
  var catalogo = ctx.catalogo;
  if (!catalogo || !catalogo.lista || !catalogo.lista.length) {
    throw new Error('LISTA/ELEMENTO necesita un catálogo con al menos una entrada' +
      (catalogo && catalogo.motivo ? ' — ' + catalogo.motivo : '') +
      '. Se declara en `MARCADORES.catalogo` con la forma `base/solapa`.');
  }

  // Índice del catálogo por clave normalizada: es el match barato y el que cubre el caso común.
  var canonPorClave = {};
  catalogo.lista.forEach(function (c) {
    var k = normalizar_(c);
    if (k && !(k in canonPorClave)) canonPorClave[k] = c;
  });

  var valores = valoresDeCtx_(ctx);
  var vacias = 0;
  var rechazados = [];
  var publicadosPorClave = {};
  var repetidos = 0;

  valores.forEach(function (v) {
    var crudo = (v === undefined || v === null) ? '' : String(v).trim();
    if (crudo === '') { vacias++; return; }

    var clave = normalizar_(crudo);
    var canon = canonPorClave[clave];
    if (!canon && typeof catalogo.resolver === 'function') {
      canon = catalogo.resolver(crudo, catalogo.lista) || '';
    }
    if (!canon) { rechazados.push(crudo); return; }

    var claveCanon = normalizar_(canon);
    if (claveCanon in publicadosPorClave) { repetidos++; return; }
    publicadosPorClave[claveCanon] = canon;
  });

  // Alfabético sobre la forma publicada, con comparación de castellano: es lo que hace la
  // lista reproducible entre corridas. El orden de aparición depende de en qué fila quedó
  // cada dato y cambia sin que cambie el dato.
  var publicados = Object.keys(publicadosPorClave).map(function (k) { return publicadosPorClave[k]; });
  publicados.sort(function (a, b) { return a.localeCompare(b, 'es'); });

  return {
    publicados: publicados, valores: valores, vacias: vacias,
    rechazados: rechazados, repetidos: repetidos, catalogo: catalogo
  };
}

function opLISTA(ctx) {
  var c = conjuntoDeLista_(ctx);
  var catalogo = c.catalogo, publicados = c.publicados, valores = c.valores;
  var vacias = c.vacias, rechazados = c.rechazados, repetidos = c.repetidos;

  var separador = (ctx.separador === undefined || ctx.separador === null || ctx.separador === '')
    ? ', ' : String(ctx.separador);

  var traza = 'LISTA de "' + ctx.campo_logico + '" sobre ' + valores.length + ' fila(s) de ' +
    ctx.base_id + (ctx.solapa ? '/' + ctx.solapa : '') +
    ' · catálogo ' + (catalogo.origen || '(sin origen)') + ' con ' + catalogo.lista.length + ' entrada(s)' +
    ' · ' + publicados.length + ' publicado(s)' +
    (repetidos ? ' · ' + repetidos + ' repetido(s) colapsado(s)' : '') +
    (vacias ? ' · ' + vacias + ' celda(s) vacía(s), no son rechazo' : '') +
    (rechazados.length
      ? ' · ⚠ ' + rechazados.length + ' fuera del catálogo, NO publicado(s): ' + rechazados.join(' | ')
      : '') +
    trazaDeVentana_(ctx);

  return {
    valor: publicados.join(separador),
    traza: traza,
    filas: valores.length,
    rechazados: rechazados
  };
}

/**
 * `2026-08-20_5` Parte A (20/08/2026) — **cuenta valores DISTINTOS.** Es la octava operación, y la
 * primera que responde *"¿cuántas cosas distintas hay?"* en vez de *"cuánto suma"* o *"cuántas
 * filas hay"*.
 *
 * **Es genérica y no sabe de campañas ni de M2.** El campo lo declara la fila de `MARCADORES`,
 * igual que las siete que ya existen. Una operación con `'m2'` adentro serviría para un token y
 * para ninguno más, que es lo que `D-01` mide.
 *
 * **Las cuatro decisiones de comportamiento, y ninguna se infiere:**
 *
 * **1 · La celda vacía NO cuenta como valor distinto.** Mismo criterio que `opLISTA`, donde una
 * vacía **no es un rechazo y no entra a la lista**. Contarla como una campaña más sería inventar
 * una — y con 713 celdas vacías sobre 2.886 filas en `digital/Directa Mail` (medido sobre el
 * fixture del 06/08), no es un caso de borde: es el 25 % del universo.
 *
 * **2 · La normalización es la de `R-10`:** colapsar espacios internos a uno y recortar bordes,
 * **preservando mayúsculas y acentos**. Se reusa `normalizarValorDeclarado_` (`Fuentes.gs`), que
 * ya es exactamente esa forma — **no se escribe un quinto normalizador**, que es lo que `CLAUDE.md`
 * §2 pide mirar antes de agregar uno.
 *   ⚠ **Y la contracara, que es una decisión y no un descuido:** plegar mayúsculas colapsaría
 *   campañas que el equipo escribe distinto a propósito. Medido sobre el fixture: normalizar con
 *   `R-10` lleva 1.400 grafías crudas a **1.375**; plegar además el case colapsaría **4 más**.
 *   Esos 4 no se colapsan acá. Si alguna vez hay que hacerlo, es otra decisión con su medición.
 *
 * **3 · Cero filas devuelve vacío, no `0`.** El despachador lo baja a `sin_datos`, y ésa es la
 * diferencia que importa: **`0` afirma "no hubo ninguna campaña"** y `sin_datos` dice "no había
 * filas". Es la misma distinción que `R-18` addendum 1 sostiene entre `sin_datos` y `REVISAR`, y
 * la que los cuatro símbolos del deck publican distinto desde el `2026-08-20_1` — un `0` publicado
 * y un `-` son dos afirmaciones distintas sobre el mundo.
 *   ⚠ **Ojo con el caso que se parece y no es el mismo:** filas que existen pero traen **todas** la
 *   celda vacía. Ahí sí hubo filas, así que **no es `sin_datos`**: el valor es `0` y la traza dice
 *   cuántas vacías salteó. Un token que publica `0` con la traza diciendo *"84 fila(s), 84
 *   vacía(s)"* manda a mirar la columna; uno que publica `-` manda a mirar el filtro. Son dos
 *   trabajos distintos.
 *
 * **4 · La traza dice cuántas filas leyó, cuántas vacías salteó y cuántos distintos publicó.** Sin
 * los tres números, un conteo que da de más es indistinguible de uno correcto — y en esta columna
 * **da de más seguro**: `C-68` midió que la misma campaña aparece con cuatro grafías distintas en
 * cuatro solapas, y que hay al menos una fila donde el nombre es el de **otra** campaña.
 *
 * ⛔ **No se toca `opLISTA`.** Comparten idea y no código: aquélla publica una lista canonizada
 * **contra un catálogo**, ésta cuenta. Unificarlas ataría el conteo a que exista catálogo, y el
 * caso que motiva esta operación —`m2_campanias`— no tiene ninguno.
 */
function opCUENTA_DISTINTOS(ctx) {
  var valores = valoresDeCtx_(ctx);
  var vacias = 0;
  var distintos = {};

  valores.forEach(function (v) {
    var crudo = (v === undefined || v === null) ? '' : String(v);
    var clave = normalizarValorDeclarado_(crudo);
    if (clave === '') { vacias++; return; }
    distintos[clave] = true;
  });

  var cuantos = Object.keys(distintos).length;

  // Cero FILAS es `sin_datos` (valor vacío); cero distintos habiendo filas es un `0` legítimo.
  // La diferencia la decide `valores.length`, no `cuantos`.
  var valor = valores.length ? cuantos : '';

  var traza = 'CUENTA_DISTINTOS de "' + ctx.campo_logico + '" sobre ' + valores.length +
    ' fila(s) de ' + ctx.base_id + (ctx.solapa ? '/' + ctx.solapa : '') +
    ' · ' + cuantos + ' distinto(s)' +
    (vacias ? ' · ' + vacias + ' celda(s) vacía(s), no cuentan' : '') +
    ' · normalizado por R-10 (espacios y bordes; NO se pliega case ni acentos)' +
    trazaDeVentana_(ctx);

  return { valor: valor, traza: traza, filas: valores.length, vacias: vacias, distintos: cuantos };
}


/**
 * `2026-08-22` — **`ELEMENTO`, la novena operación: el N-ésimo de lo que `LISTA` publicaría entero.**
 * Decisión del usuario, 22/08. Resuelve `X-33` **con una sola pieza**.
 *
 * **Mismo universo, mismo orden, mismo cálculo** — lo único que cambia es que se toma uno. Por eso
 * llama a `conjuntoDeLista_`, **el mismo código que usa `LISTA`**, y no a una copia.
 *
 * ⭐⭐ **Y por eso NO hace falta que el motor sepa paginar.** La lámina de cuatro cajas se llena con
 * `post_camp1..4` y listo. **El agrupamiento de a cuatro no se implementa** (decisión del usuario):
 * paginar es lo caro —duplicar láminas por grupo, con la trampa de que `duplicate()` **hereda el
 * `#lamina:` de las notas del orador**— y **hoy no hay ningún caso real con más de cuatro**. Se
 * decide cuando aparezca uno.
 *
 * **Cómo se declara, sin columna nueva:** el índice va en **`MARCADORES.valor_fijo`**, que ya está
 * en el esquema y ya viaja al contexto. ⭐ **No va en el nombre del token** — `D-33` es explícito en
 * que el nombre no lleva parámetros —, y **no se agrega una columna**, que según `CLAUDE.md` §2
 * cuesta tocar N lectores y ya salió mal tres veces.
 *
 *   - `valor_fijo = '2'`     → el segundo elemento. **Sin control de desborde.**
 *   - `valor_fijo = '2/3'`   → el segundo **de tres cajas**. ⭐ **Con control de desborde**, y es la
 *                              forma recomendada: cualquiera de los tres marcadores puede detectar
 *                              que hay más elementos que cajas, sin saber nada de sus hermanos.
 *
 * **Los dos bordes, y son opuestos a propósito:**
 *
 * **1 · MENOS elementos que cajas es el CASO NORMAL, no un error.** Esta semana hay **dos barrios y
 * tres cajas**. La caja sobrante devuelve `valor: ''`, que el despachador baja a `sin_datos` y el
 * deck pinta con el **símbolo de sin dato que ya existe**. ⛔ **No se inventa un símbolo nuevo**
 * (decisión del usuario) — sería la familia del glifo que no distingue causas, otra vez.
 *
 * **2 · MÁS elementos que cajas: se reporta y se PARA.** Que la última caja junte dos, o que el
 * resto se pierda, es **decisión editorial** y no la toma el motor. Tira, y el despachador lo baja
 * a `error` con el motivo — que sale con el símbolo de falló, distinto del de sin dato, que es
 * justamente la distinción que hace falta.
 *
 * ⚠⚠ **EL LÍMITE, y va escrito acá y en `R-32` porque no se ve en el resultado:** el orden lo fija
 * `localeCompare('es')` sobre el valor publicado, pero **de qué filas sale el conjunto lo fija el
 * orden de las filas de la fuente**, y en `rdv` eso es **carga manual**. **Una fila que entre antes
 * puede intercambiar el 1 y el 2 sin que nada falle** — la lista sigue siendo la misma, cambia
 * cuál caja muestra cuál. **No bloquea, pero tiene que estar dicho**: si alguien compara el token
 * `1` entre dos corridas, está comparando posiciones, no cosas.
 */
function opELEMENTO(ctx) {
  var c = conjuntoDeLista_(ctx);
  var publicados = c.publicados;

  var crudo = String(ctx.valor_fijo === undefined || ctx.valor_fijo === null ? '' : ctx.valor_fijo).trim();
  if (crudo === '') {
    throw new Error('ELEMENTO necesita el índice en `MARCADORES.valor_fijo`. Formas válidas: ' +
      '`2` (el segundo, sin control de desborde) o `2/3` (el segundo de tres cajas, con control). ' +
      'El índice arranca en 1 y NO va en el nombre del token (`D-33`).');
  }

  var partes = crudo.split('/');
  var indice = Number(partes[0]);
  var cajas = partes.length > 1 ? Number(partes[1]) : 0;

  if (!indice || indice < 1 || Math.floor(indice) !== indice) {
    throw new Error('ELEMENTO: `valor_fijo` = "' + crudo + '" no declara un índice entero ≥ 1.');
  }
  if (partes.length > 1 && (!cajas || cajas < indice)) {
    throw new Error('ELEMENTO: `valor_fijo` = "' + crudo + '" declara ' + cajas + ' caja(s) y pide ' +
      'la ' + indice + '. El total tiene que ser ≥ al índice.');
  }

  /* Borde 2 — más elementos que cajas. Va ANTES de resolver el valor: si el conjunto no entra,
   * publicar los primeros N sería tomar la decisión editorial en silencio. */
  if (cajas && publicados.length > cajas) {
    throw new Error('ELEMENTO: hay ' + publicados.length + ' elemento(s) y sólo ' + cajas +
      ' caja(s) declarada(s) en `valor_fijo`. Sobran ' + (publicados.length - cajas) + '. ' +
      'QUÉ HACER CON EL RESTO ES DECISIÓN EDITORIAL —¿la última caja junta dos?, ¿el resto se ' +
      'pierde?— y el motor no la toma. Los elementos son: ' + publicados.join(' | '));
  }

  /* Borde 1 — menos elementos que cajas: NORMAL. `''` → el despachador lo baja a `sin_datos` y
   * el deck usa el símbolo de sin dato que ya existe. */
  var valor = (indice <= publicados.length) ? publicados[indice - 1] : '';

  var traza = 'ELEMENTO ' + indice + (cajas ? ' de ' + cajas + ' caja(s)' : '') +
    ' sobre la LISTA de "' + ctx.campo_logico + '" · ' + publicados.length + ' elemento(s): ' +
    (publicados.join(' | ') || '(ninguno)') +
    (valor === '' ? ' · ⚠ la caja ' + indice + ' queda SIN DATO, que es el caso normal cuando hay ' +
      'menos elementos que cajas' : ' · publica "' + valor + '"') +
    ' · orden alfabético `es` — ⚠ el orden de las filas de la fuente puede intercambiar posiciones ' +
    'entre corridas (`R-32`)' +
    ' · ' + c.valores.length + ' fila(s) de ' + ctx.base_id + (ctx.solapa ? '/' + ctx.solapa : '') +
    (c.repetidos ? ' · ' + c.repetidos + ' repetido(s) colapsado(s)' : '') +
    (c.rechazados.length ? ' · ⚠ ' + c.rechazados.length + ' fuera del catálogo' : '') +
    trazaDeVentana_(ctx);

  return { valor: valor, traza: traza, filas: c.valores.length, rechazados: c.rechazados };
}

/**
 * Las operaciones que necesitan que el despachador les traiga el CATALOGO ya leido.
 *
 * Se declara como MAPA, igual que `OPERACIONES_`, para que la lista sea exacta por construccion
 * y no una condicion suelta en `Generador.gs` que hay que acordarse de tocar. El 22/08 la
 * condicion decia `=== 'LISTA'` a secas y `ELEMENTO` —que comparte `conjuntoDeLista_`— habria
 * tirado en la primera corrida por un catalogo que estaba bien declarado.
 */
var OPERACIONES_CON_CATALOGO_ = { LISTA: true, ELEMENTO: true };

function operacionNecesitaCatalogo_(operacion) {
  return !!OPERACIONES_CON_CATALOGO_[String(operacion || '').trim()];
}

var OPERACIONES_ = {
  SUMA: opSUMA,
  CONTEO: opCONTEO,
  ULTIMO: opULTIMO,
  RATIO: opRATIO,
  PCT: opPCT,
  TEXTO: opTEXTO,
  LISTA: opLISTA,
  // `2026-08-20_5` (20/08/2026) — la octava. Cuenta valores distintos; ver su comentario.
  CUENTA_DISTINTOS: opCUENTA_DISTINTOS,
  // `2026-08-22` — la novena. El N-ésimo de lo que `LISTA` publicaría entero; ver su comentario.
  ELEMENTO: opELEMENTO
};

/**
 * Escape hatch del `Paso-3-v3`: `operacion = FN:nombreDeLaFuncion`, con la misma firma y
 * viviendo también en este módulo. **Es la excepción.** Si al terminar JM hay más de un
 * puñado de `FN:`, falta una operación genérica y conviene agregarla en vez de multiplicar
 * funciones — la regla está en el prompt y se repite acá porque es donde se va a leer.
 */
var PREFIJO_FN_ = 'FN:';

/**
 * Resuelve el nombre de operación de una fila de `MARCADORES` y la ejecuta.
 * Devuelve `{ ok, valor, traza, filas }` o `{ ok: false, motivo }`.
 *
 * No decide qué operación va: la lee de la configuración. No lee bases ni resuelve `MAPEO`.
 */
function despacharOperacion_(nombreOperacion, ctx) {
  var nombre = String(nombreOperacion || '').trim();
  if (!nombre) {
    return { ok: false, motivo: 'La fila de MARCADORES no declara `operacion`' };
  }

  var fn;
  if (nombre.indexOf(PREFIJO_FN_) === 0) {
    var propio = nombre.slice(PREFIJO_FN_.length).trim();
    // El escape hatch tampoco resuelve contra el global: se declara acá.
    fn = FUNCIONES_PROPIAS_[propio];
    if (!fn) {
      return {
        ok: false,
        motivo: 'operacion "' + nombre + '": no hay una función "' + propio + '" declarada en `FUNCIONES_PROPIAS_` ' +
          '(Marcadores.gs). Las que hay: ' + (Object.keys(FUNCIONES_PROPIAS_).join(', ') || '(ninguna)')
      };
    }
  } else {
    fn = OPERACIONES_[nombre];
    if (!fn) {
      return {
        ok: false,
        motivo: 'operacion "' + nombre + '" desconocida. Las genéricas son: ' + Object.keys(OPERACIONES_).join(', ') +
          '; para una propia, `' + PREFIJO_FN_ + 'nombre`'
      };
    }
  }

  var resultado;
  try {
    resultado = fn(ctx);
  } catch (e) {
    // Resiliencia: un token que falla no corta la corrida (Parte C del prompt). Acá se
    // convierte la excepción en un motivo legible; quien despacha decide qué hacer con él.
    return { ok: false, motivo: 'operacion "' + nombre + '" falló: ' + (e && e.message ? e.message : e) };
  }

  return {
    ok: true,
    valor: resultado.valor,
    traza: resultado.traza,
    filas: resultado.filas,
    // `LISTA` es la única que lo trae hoy. Viaja por acá y no por la traza porque el
    // despachador necesita **la lista**, no el texto: con ella emite una fila de `FALTANTES`
    // por valor rechazado aunque el token haya publicado bien el resto.
    rechazados: resultado.rechazados || []
  };
}

/**
 * Funciones propias del escape hatch `FN:`. **Vacío a propósito**: cada entrada acá es una
 * operación que no se pudo expresar con las seis genéricas, y esa lista es la medición de
 * `D-01` para el despachador — si crece, falta una genérica.
 */
var FUNCIONES_PROPIAS_ = {};

/**
 * Encuentra, dentro de `rdv/RVD JM-CM - ES`, la fila `Realizada` cuyo barrio
 * contiene "Retiro" el 24/07/2026 — el caso cableado a mano de Paso 2.9E.
 * Delega en `encontrarFilaRdvDeReunion_()` (Union.gs), la misma función que usa
 * el anclaje (Paso 2.9F) para no duplicar el matching REUNIONES→rdv en dos
 * archivos.
 */
function encontrarEncuentroRetiro2407_() {
  return encontrarFilaRdvDeReunion_({ nombre: 'Retiro', fecha: new Date(2026, 6, 24, 12, 0, 0) });
}

/**
 * Lee un `campo_logico` de `rdv` DIRECTO de la fila ya encontrada (una sola
 * fila: `ctx.valores` de un elemento) usando `opULTIMO` — "último de 1" es
 * exactamente esa celda, y la traza deja ver que la base fue 1 fila, no una
 * agregación. Si el campo no está mapeado o la celda vino vacía, devuelve
 * `«FALTA:token»` — no rompe la corrida (Paso 2.9E, "Resiliencia").
 */
function calcularTokenDirectoRdv_(token, hojaRdv, filaObjeto, campoLogico) {
  var campo = buscarMapeo('rdv', hojaRdv, campoLogico);
  if (!campo.ok) {
    return { token: token, valor: '«FALTA:' + token + '»', base: 'rdv', solapa: hojaRdv, columna: '', operacion: 'ÚLTIMO', filas: 0 };
  }

  var valorCrudo = valorPorColumna_(filaObjeto, 'rdv', hojaRdv, campo.columna);
  var resultado = opULTIMO({ campo_logico: campoLogico, columna: campo.columna, base_id: 'rdv', solapa: hojaRdv, valores: [valorCrudo] });

  return {
    token: token,
    valor: (resultado.valor === '' ? '«FALTA:' + token + '»' : resultado.valor),
    base: 'rdv',
    solapa: hojaRdv,
    columna: campo.columna,
    operacion: 'ÚLTIMO',
    filas: resultado.filas
  };
}

var HEADERS_VISTA_PREVIA_ = ['reunion', 'token', 'valor', 'base', 'solapa', 'columna', 'operacion', 'filas'];

// campo_logico (rdv) -> token ecv_* — los diez del bloque de alcance objetivo
// e inscriptos (docs/Prompts/Paso-2.9E.md).
var TOKENS_CORTE_VERTICAL_ = [
  { campo: 'comuna', token: 'ecv_comuna' },
  { campo: 'fecha_periodo', token: 'ecv_fecha' },
  { campo: 'insc_mail', token: 'ecv_insc_mail' },
  { campo: 'insc_digital', token: 'ecv_insc_digital' },
  { campo: 'insc_cc', token: 'ecv_insc_cc' },
  { campo: 'insc_dif', token: 'ecv_insc_dif' },
  { campo: 'insc_ivr', token: 'ecv_insc_ivr' },
  { campo: 'inscriptos', token: 'ecv_inscriptos' },
  { campo: 'asistentes', token: 'ecv_asistentes' },
  { campo: 'poblacion', token: 'ecv_poblacion' }
];

function corteVerticalRetiro2407_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var hoja = ss.getSheetByName('VISTA_PREVIA');
  if (!hoja) hoja = ss.insertSheet('VISTA_PREVIA');
  hoja.clear();
  hoja.getRange(1, 1, 1, HEADERS_VISTA_PREVIA_.length).setValues([HEADERS_VISTA_PREVIA_]);
  hoja.setFrozenRows(1);

  var reunionEtiqueta = 'Retiro 24/07 pre';

  var encuentro = encontrarEncuentroRetiro2407_();
  if (!encuentro.ok) {
    hoja.getRange(2, 1, 1, HEADERS_VISTA_PREVIA_.length)
      .setValues([[reunionEtiqueta, '(todos)', '«FALTA:encuentro» — ' + encuentro.motivo, 'rdv', '', '', '', 0]]);
    return { ok: false, motivo: encuentro.motivo };
  }

  var valoresPorToken = {};
  var filasHoja = TOKENS_CORTE_VERTICAL_.map(function (t) {
    var resultado = calcularTokenDirectoRdv_(t.token, encuentro.hoja, encuentro.fila, t.campo);
    valoresPorToken[t.token] = (typeof resultado.valor === 'number') ? resultado.valor : NaN;
    return [reunionEtiqueta, resultado.token, resultado.valor, resultado.base, resultado.solapa, resultado.columna, resultado.operacion, resultado.filas];
  });
  hoja.getRange(2, 1, filasHoja.length, HEADERS_VISTA_PREVIA_.length).setValues(filasHoja);

  // Validación (Paso 2.9E, "Validación"): los diez se controlan entre sí.
  var sumaCanales = ['ecv_insc_mail', 'ecv_insc_digital', 'ecv_insc_cc', 'ecv_insc_dif', 'ecv_insc_ivr']
    .reduce(function (acc, t) { return acc + (isNaN(valoresPorToken[t]) ? 0 : valoresPorToken[t]); }, 0);
  var inscriptos = valoresPorToken['ecv_inscriptos'];
  var asistentes = valoresPorToken['ecv_asistentes'];
  var poblacion = valoresPorToken['ecv_poblacion'];

  var check1 = !isNaN(inscriptos) && sumaCanales === inscriptos;
  var check2 = !isNaN(asistentes) && !isNaN(inscriptos) && asistentes < inscriptos;
  var check3 = !isNaN(inscriptos) && !isNaN(poblacion) && inscriptos < poblacion;

  var filasControl = [
    [reunionEtiqueta, 'control: suma canales = ecv_inscriptos', (check1 ? '✅ ' : '⚠ ') + sumaCanales + ' vs ' + inscriptos, '', '', '', 'CONTROL', ''],
    [reunionEtiqueta, 'control: asistentes < inscriptos', (check2 ? '✅ ' : '⚠ ') + asistentes + ' vs ' + inscriptos, '', '', '', 'CONTROL', ''],
    [reunionEtiqueta, 'control: inscriptos << poblacion', (check3 ? '✅ ' : '⚠ ') + inscriptos + ' vs ' + poblacion, '', '', '', 'CONTROL', '']
  ];
  hoja.getRange(2 + filasHoja.length, 1, filasControl.length, HEADERS_VISTA_PREVIA_.length).setValues(filasControl);

  return { ok: true, filas: filasHoja.length, controles: filasControl.length, cierraSuma: check1 };
}

function menuCorteVerticalRetiro2407_() {
  var ui = ui_();
  var resultado = corteVerticalRetiro2407_();

  if (!resultado.ok) {
    ui.alert('No se pudo calcular el corte vertical', resultado.motivo, ui.ButtonSet.OK);
    return;
  }

  ui.alert(
    'Corte vertical (Paso 2.9E)',
    'VISTA_PREVIA: ' + resultado.filas + ' tokens + ' + resultado.controles + ' fila(s) de control.\n' +
      (resultado.cierraSuma
        ? '✅ La suma de canales cierra contra ecv_inscriptos.'
        : '⚠ La suma de canales NO cierra contra ecv_inscriptos — ver el detalle en VISTA_PREVIA, no se ajustó el total.'),
    ui.ButtonSet.OK
  );
}
