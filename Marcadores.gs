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
/* ⭐⭐ `2026-08-26` — **el núcleo compartido de `CUENTA_DISTINTOS` y `LISTA_CRUDA`.**
 *
 * Una cuenta los valores distintos y la otra los publica. **Tienen que ser los mismos**, y la única
 * forma de garantizarlo es que salgan del mismo código — el mismo argumento que hizo que `ELEMENTO`
 * llamara a `conjuntoDeLista_` en vez de copiarlo.
 *
 * ⛔⛔ **Y por eso NO se reusó el núcleo de `LISTA`, que era el candidato obvio: los dos
 * normalizadores son distintos y dan resultados distintos.**
 *
 * | | normalizador | qué hace |
 * |---|---|---|
 * | `calcularConjuntoDeLista_` | `normalizar_` (`Parseo.gs`) | **pliega case y saca acentos** |
 * | esto | `normalizarValorDeclarado_` (`R-10`) | los **preserva** |
 *
 * Medido sobre el fixture del 06/08: `R-10` lleva **1.400 grafías crudas a 1.375**, y plegar además
 * el case **colapsaría 4 más** — campañas que el equipo escribe distinto **a propósito**. Con el
 * núcleo de `LISTA`, `m2_camp_lista` publicaría un largo distinto del que `m2_campanias` cuenta en
 * el banner de la misma lámina, y no fallaría nada: un número y una lista de otro largo, uno al lado
 * del otro. `tools/probar-lista-cruda.js` exige la identidad, y su control negativo **la pone en
 * rojo** si alguien cambia este normalizador por el otro.
 *
 * ⛔⛔ **Y una corrección medida el mismo día, porque cambia cómo se razona el riesgo: los dos
 * normalizadores NO están ordenados por severidad. Cada uno junta lo que el otro separa.**
 * `normalizar_` pliega case y acentos **y no toca los espacios internos**; `R-10` colapsa los
 * espacios **y preserva case y acentos**. Sobre el fixture del banco: `normalizar_` junta
 * `Poda pre` con `PODA PRE` y las dos grafías de `Vacunación antirrábica` (−2), **y parte**
 * ` Poda  pre ` en un nombre aparte por el espacio doble (+1) — 4 contra 5. ⇒ **No es «publicaría
 * de menos»: publicaría OTRO conjunto**, y la divergencia contra el banner no tendría una dirección
 * conocida. Es la misma forma que el instrumento que saltea un tramo (`CLAUDE.md` §4): no da un
 * número más chico, da otro número, y por eso no se puede corregir mentalmente.
 *
 * ⭐ **Publica la forma NORMALIZADA, no la primera grafía cruda**, y eso es deliberado: `R-10` sólo
 * colapsa espacios internos y recorta bordes, así que lo publicado es el nombre **tal como lo
 * escribe el equipo**, sin espacios de más. Publicar la primera variante cruda daría el mismo
 * conteo y arrastraría los dobles espacios al deck. Y como la lista **es** el conjunto de claves,
 * *cantidad de líneas === CUENTA_DISTINTOS* queda cierto **por construcción**, no por coincidencia.
 *
 * ⚠ **No canoniza nada**: no hay catálogo y no puede haberlo (`X-18`). Dos grafías que difieren en
 * una tilde son **dos nombres**, y acá eso es correcto: el equipo poda y reescribe en su deck.
 */
function distintosDeCampo_(ctx) {
  var valores = valoresDeCtx_(ctx);
  var vacias = 0;
  var vistos = {};
  var distintos = [];

  valores.forEach(function (v) {
    var crudo = (v === undefined || v === null) ? '' : String(v);
    var clave = normalizarValorDeclarado_(crudo);
    if (clave === '') { vacias++; return; }
    if (clave in vistos) return;
    vistos[clave] = true;
    distintos.push(clave);
  });

  return { valores: valores, vacias: vacias, distintos: distintos };
}

function opCUENTA_DISTINTOS(ctx) {
  var d = distintosDeCampo_(ctx);
  var valores = d.valores, vacias = d.vacias;
  var cuantos = d.distintos.length;

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
 * `2026-08-26` — **`LISTA_CRUDA`, la decimotercera: los valores distintos, SIN catálogo.**
 * Decisión del usuario para `m2_camp_lista` (`L-038`).
 *
 * ⛔⛔ **Por qué es una operación nueva y no `LISTA` con el catálogo relajado.** `LISTA` publica
 * **contra un catálogo por diseño**: un valor que no matchea **queda fuera y viaja en `rechazados`**
 * — nunca llega al deck. Eso es correcto para `ecv_barrios`, donde un barrio que no existe es un
 * error. Acá **cualquier nombre nuevo de campaña es legítimo**, así que un catálogo no marcaría un
 * error: **borraría campañas reales del informe, en silencio**.
 *
 * Y no hay catálogo posible, medido: la única otra columna de nombres de campaña del repo es la B de
 * `m2/M2 periodo DIRECTA`, y `C-68` midió que **la misma campaña aparece con cuatro grafías
 * distintas en cuatro solapas** — un catálogo cruzado rechazaría por ortografía. Un catálogo de la
 * **misma** columna que se publica no rechaza nada nunca: es decorativo.
 *
 * ⚠ **Relajar la guarda de `LISTA` habría sido peor que agregar esto, y no por costo:** *catálogo
 * vacío es error, no «nada matcheó»*. Si `rdv/Comunas` no abre, hoy sale un `FALTA` ruidoso; con la
 * guarda relajada saldría la lista de barrios **crudos**, que se lee perfecta. Es convertir una falla
 * ruidosa en un valor plausible. Y `opCUENTA_DISTINTOS` ya había tomado esta decisión el 20/08, para
 * este mismo marcador: *«no se toca opLISTA… unificarlas ataría el conteo a que exista catálogo»*.
 *
 * ⛔⛔ **SIN TOPE, y es una decisión editorial, no un olvido** (usuario, 26/08). Se publican **todos**
 * los nombres: no hay corte, no hay «y N más», no hay límite configurable. La lista existe **para que
 * el equipo edite**, y una lista recortada le esconde justo lo que tiene que decidir — un deck que
 * muestra 10 de 30 bajo un banner que dice 30 **miente sin fallar**. ⚠ **La consecuencia va escrita y
 * no descubierta: con ~30 nombres la caja crece y puede empujar lo que tiene debajo.** Es el precio de
 * la decisión, no un bug a reportar.
 *
 * **El orden es alfabético con `localeCompare('es')`, igual que `LISTA`**, y por el mismo motivo: el
 * orden de aparición depende de en qué fila quedó cada dato y **cambia entre corridas sin que cambie
 * el dato**.
 *
 * **`separador` es la cadena que une**, igual que en `LISTA`. ⚠ La columna está **sobrecargada** y
 * conviene saberlo: en `ELEMENTO` es el número de cajas y en la familia `FILA` es el campo de orden.
 * Para `m2_camp_lista` es un **salto de línea real**, que en Slides abre párrafo y hereda el bullet.
 *
 * ⚠ **Lo que esta operación NO distingue, dicho para que no se descubra en un deck:** *cero filas* y
 * *filas con todas las celdas vacías* publican **lo mismo** —vacío—, mientras que `CUENTA_DISTINTOS`
 * las separa en `-` y `0`. Una lista no tiene cómo escribir «cero elementos». **El discriminador
 * existe y es su hermano**: `m2_campanias` lee el mismo universo, y su `0` contra `-` dice cuál de
 * las dos pasó. La traza de acá también lo dice, con los tres números.
 */
function opLISTA_CRUDA(ctx) {
  var d = distintosDeCampo_(ctx);
  var valores = d.valores, vacias = d.vacias;

  var publicados = d.distintos.slice().sort(function (a, b) { return a.localeCompare(b, 'es'); });

  var separador = (ctx.separador === undefined || ctx.separador === null || ctx.separador === '')
    ? ', ' : String(ctx.separador);

  // Mismo criterio que `CUENTA_DISTINTOS`: cero FILAS es `sin_datos`, y el despachador lo baja.
  var valor = valores.length ? publicados.join(separador) : '';

  var traza = 'LISTA_CRUDA de "' + ctx.campo_logico + '" sobre ' + valores.length +
    ' fila(s) de ' + ctx.base_id + (ctx.solapa ? '/' + ctx.solapa : '') +
    ' · ' + publicados.length + ' publicado(s), SIN catálogo: no hay rechazo posible' +
    (vacias ? ' · ' + vacias + ' celda(s) vacía(s), no son rechazo' : '') +
    ' · normalizado por R-10 (espacios y bordes; NO se pliega case ni acentos)' +
    ' · separador ' + JSON.stringify(separador) +
    trazaDeVentana_(ctx);

  return {
    valor: valor, traza: traza, filas: valores.length,
    vacias: vacias, publicados: publicados.length
  };
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
 *   - **`valor_fijo = 2`** → el segundo elemento. **ENTERO PELADO, siempre.**
 *   - **`separador = 3`**  → hay **tres cajas**. Opcional; habilita el control de desborde, y
 *                            cualquiera de los tres marcadores lo detecta **sin saber nada de sus
 *                            hermanos**.
 *
 * ⛔⛔ **La forma `'2/3'` NO se puede usar, y costó una corrida el 22/08: Sheets la convierte en
 * FECHA.** Se escribió `'1/3'` y el motor leyó `"Sun Mar 01 2026"`. Ver el bloque del parseo.
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

  /* ⛔⛔ **`2026-08-22` — EL ÍNDICE VA COMO ENTERO PELADO, Y LA FORMA `N/M` NO SE PUEDE USAR.**
   *
   * **El bug, encontrado por `diagBarriosIndexados()` y no deducido del símbolo:** se escribió
   * `valor_fijo = '1/3'` y **Sheets lo interpretó como FECHA**. El motor lo leyó como
   * `"Sun Mar 01 2026 00:00:00 GMT-0300"`, `Number(partes[0])` dio `NaN`, y los tres
   * `ecv_barrio*` publicaron `---`. **El catálogo resolvía `ok=true` en las cuatro filas y
   * `ELEMENTO` funcionaba**: lo que estaba roto era el valor que llegó a la celda.
   *
   * ⭐⭐ **Y el corolario es más grande que este bug: `valor_fijo` viaja por una CELDA DE SHEETS**,
   * así que **todo lo que se escriba ahí pasa por la interpretación automática de tipos**. `'3-1'`,
   * `'1-2'`, `'01'`, `'1/3'` — la próxima operación que use cualquiera de esas formas **se come lo
   * mismo**. La regla está escrita al lado de la columna, en `Instalar.gs`, y en `CLAUDE.md` §4.
   *
   * **Entonces: el índice es un entero y nada más.** El total de cajas —que habilita el control de
   * desborde— se declara **en `separador`**, también como entero pelado.
   *
   * ⚠ **Sí, `separador` se llama así por `LISTA` y acá significa otra cosa, y eso es deuda
   * declarada.** Se eligió igual porque: **(1)** es una columna que ya existe y ya viaja al
   * contexto, y agregar una nueva cuesta tocar N lectores (`CLAUDE.md` §2, y el `_44` es el
   * precedente); **(2)** un entero es **inmune** a la coerción de Sheets, que es justamente lo que
   * acaba de romper; **(3)** `LISTA` y `ELEMENTO` nunca comparten fila. **Si aparece una tercera
   * operación que necesite las dos cosas, ahí sí hace falta la columna.** */
  var crudoIndice = ctx.valor_fijo;
  if (crudoIndice instanceof Date) {
    throw new Error('ELEMENTO: `valor_fijo` llegó como FECHA (' + crudoIndice +
      '). Sheets convierte a fecha lo que parece una — `1/3`, `3-1`, `1-2`. ' +
      'El índice se escribe como ENTERO PELADO: 1, 2, 3. El total de cajas va en `separador`.');
  }
  var indice = Number(String(crudoIndice === undefined || crudoIndice === null ? '' : crudoIndice).trim());
  if (!indice || indice < 1 || Math.floor(indice) !== indice) {
    throw new Error('ELEMENTO necesita el índice en `MARCADORES.valor_fijo` como ENTERO ≥ 1, y ' +
      'llegó ' + JSON.stringify(crudoIndice) + '. ⛔ NO se escribe `2/3`: Sheets lo convierte en ' +
      'fecha. El total de cajas —opcional, habilita el control de desborde— va en `separador`. ' +
      'Y el índice NO va en el nombre del token (`D-33`).');
  }

  var crudoCajas = ctx.separador;
  var cajas = 0;
  if (crudoCajas !== undefined && crudoCajas !== null && String(crudoCajas).trim() !== '') {
    if (crudoCajas instanceof Date) {
      throw new Error('ELEMENTO: `separador` llegó como FECHA. El total de cajas es un entero.');
    }
    cajas = Number(String(crudoCajas).trim());
    if (!cajas || cajas < 1 || Math.floor(cajas) !== cajas) {
      throw new Error('ELEMENTO: `separador` declara el total de cajas y llegó ' +
        JSON.stringify(crudoCajas) + '. Tiene que ser un entero ≥ 1, o vacío para desactivar el ' +
        'control de desborde.');
    }
    if (cajas < indice) {
      throw new Error('ELEMENTO: `separador` declara ' + cajas + ' caja(s) y `valor_fijo` pide la ' +
        indice + '. El total tiene que ser ≥ al índice.');
    }
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

/* ===================== La décima: `FILA` (23/08/2026, `X-35`) ==========================
 *
 * **El campo X de la N-ésima FILA de una lista de entidades**, sin colapsar y con un orden
 * declarado. `FILA` es a `ULTIMO` lo que `ELEMENTO` es a `LISTA`: aquélla elige **una** fila entre
 * varias; ésta **las enumera todas**.
 *
 * ### ⛔⛔ Por qué NO es "el orden de la hoja", y esto hay que leerlo antes de tocar nada
 *
 * La propuesta natural era *«la N-ésima en el orden en que la fuente las trae»* — y **el orden de
 * la fuente hoy coincide con el de la fecha**, medido sobre `3488-AGOJDGAG` el 23/08. **Se
 * descartó, y el motivo es que `opULTIMO` ya recorrió ese camino y volvió.** El `_39` (12/08) sacó
 * a `ULTIMO` de elegir por posición **sobre esta misma solapa**, y su comentario lo dice: *«sin
 * fecha, elegir por posición es elegir por el orden de la hoja, que es exactamente lo que el bloque
 * de arriba vino a matar»*. Una planilla de carga manual se reordena y el número cambia sin que
 * salte nada.
 *
 * ⇒ **`FILA` ordena por un campo DECLARADO —nunca por posición— y falla ruidoso si nadie lo
 * declaró.** No hay default: un default sería el orden de la hoja con otro nombre.
 *
 * ### Los dos invariantes, que son distintos y sólo uno está en juego
 *
 * | | |
 * |---|---|
 * | ⭐ **coherencia de fila** — los nueve campos de `env1` salen de la **misma** fila | **imprescindible**, y es lo que `X-35` reporta roto en `ELEMENTO` |
 * | **identidad de fila** — que `env1` sea el envío que el equipo llama 1 | **con empate de fecha NO está determinada por los datos** |
 *
 * **Medido el 23/08 sobre el fixture del 20/08:** de 508 cuentas con 2+ filas en
 * `digital/Directa Mail`, **144 (28 %) tienen fechas repetidas** — `3488-AGOJDGAG` entre ellas, con
 * dos envíos el 07/08. **Ninguna implementación puede dar identidad de fila ahí**, porque el dato
 * no la tiene.
 *
 * ⭐⭐ **Por eso el empate NO devuelve hueco** —que sería la doctrina de `ULTIMO` trasladada—: eso
 * dejaría **sin tabla al 28 % de las cuentas, incluida aquella contra la que se verifica todo lo
 * demás**. Una operación que no se puede probar contra el único caso medido no es más rigurosa: es
 * no verificable. Se desempata **por el índice de origen**, que es determinista y compartido, **y
 * la traza lo declara cuando ocurre**.
 *
 * ⚠ **El límite de eso, y hay que tenerlo escrito porque es fácil leerlo de más:** que el equipo
 * combine la celda de fecha cuando dos envíos comparten día dice que **la permutación es invisible
 * en su deck**, no que sea inocua. `R-32` ya lo fija — **un token indexado publica una POSICIÓN, no
 * una cosa** —, así que **comparar `camp_env1_aud` entre dos corridas puede estar comparando envíos
 * distintos** si el empate se desempató al revés. No es un bug de esta operación: es lo que
 * significa un índice.
 *
 * ### Contrato
 *
 *   - **`valor_fijo` = N**, **entero pelado y 1-based**. ⛔ Nada de `2/5`: Sheets lo convierte en
 *     fecha (`C-83`, costó una corrida el 22/08).
 *   - **`separador` = el campo lógico por el que ordenar** (ej. `mail_fecha`). Va en configuración
 *     y no en el código, porque **la próxima tabla ordena por otra cosa**.
 *   - **`campo_logico`** es el campo que se publica — el mismo mecanismo que el resto.
 *   - **N mayor que la cantidad de filas es `sin_datos`, no error.** El deck tiene cinco casilleros
 *     y la campaña puede tener tres envíos; eso es *"no hay tanto envío"*, y el símbolo `-` lo dice
 *     mejor que un `---`.
 *
 * ⚠ **`ctx.ordenPor` lo arma el despachador**, igual que `ctx.fechas`: resolver qué columna es un
 * campo lógico es **acceso a datos** y vive en `Generador.gs`. Acá sólo se ordena y se elige, que
 * es la parte que sí es de este módulo (la regla de oro de `CLAUDE.md` §2).
 */

/* ⚠ **Memo propio, y NO se reusa `claveConjuntoLista_`.** Dos motivos. **(1)** Esa clave incluye
 * `ctx.campo_logico`, y acá los nueve marcadores de una fila tienen campos **distintos**: cada uno
 * tendría su entrada y su propio orden, que es exactamente lo que hay que evitar. **(2)** Esa clave
 * menciona `ctx.filtro` y `ctx.dimensiones`, **que el despachador no pone en `ctx`** — quedan
 * `undefined` (verificado el 23/08 en `Generador.gs`; anotado aparte, no se toca desde acá).
 *
 * ⭐ En vez de enumerar componentes y esperar no olvidar ninguno, la clave es una **huella de las
 * filas mismas** más el campo de orden. Eso *garantiza* las mismas filas en vez de *parecerse* a
 * ellas, que es lo que `CLAUDE.md` §4 exige de la clave de una caché.
 *
 * ⚠ **Y memoiza por el motivo de `R-31`, no por velocidad:** la base se mueve durante la corrida,
 * así que dos lecturas pueden ver universos distintos y publicar filas que no son consecutivas. El
 * conjunto ordenado se arma **una vez y se reparte**. */
var cacheFilasOrdenadas_ = {};

function huellaDeFilas_(filas, campoOrden) {
  var partes = [campoOrden, String(filas.length)];
  filas.forEach(function (f, i) {
    var claves = Object.keys(f).sort();
    partes.push(i + ':' + claves.map(function (k) { return k + '=' + String(f[k]); }).join('\u0001'));
  });
  return partes.join('\u0002');
}

function filasOrdenadas_(ctx) {
  var campoOrden = String(ctx.separador === undefined || ctx.separador === null ? '' : ctx.separador).trim();
  var filas = ctx.filas || [];
  var clave = huellaDeFilas_(filas, campoOrden);
  if (Object.prototype.hasOwnProperty.call(cacheFilasOrdenadas_, clave)) {
    return cacheFilasOrdenadas_[clave];
  }

  var orden = (ctx.ordenPor && ctx.ordenPor.valores) || null;

  /* Decorar → ordenar → desdecorar. **El índice va en la comparación, no en un `sort` estable**:
   * apoyarse en la estabilidad del motor sería una premisa sin testigo, y acá el desempate es lo
   * que garantiza que los nueve marcadores coincidan. */
  var decoradas = filas.map(function (f, i) {
    return { fila: f, i: i, orden: orden ? orden[i] : null };
  });

  var empates = 0;
  decoradas.sort(function (a, b) {
    var va = a.orden, vb = b.orden;
    var na = (va === null || va === undefined || va === '');
    var nb = (vb === null || vb === undefined || vb === '');
    // Las filas sin valor de orden van al final, y entre ellas por índice.
    if (na && nb) return a.i - b.i;
    if (na) return 1;
    if (nb) return -1;
    var ca = (va instanceof Date) ? va.getTime() : va;
    var cb = (vb instanceof Date) ? vb.getTime() : vb;
    if (ca < cb) return -1;
    if (ca > cb) return 1;
    empates++;
    return a.i - b.i;
  });

  var salida = { filas: decoradas.map(function (d) { return d.fila; }), empates: empates, campo: campoOrden };
  cacheFilasOrdenadas_[clave] = salida;
  return salida;
}

function opFILA(ctx) {
  var campoOrden = String(ctx.separador === undefined || ctx.separador === null ? '' : ctx.separador).trim();

  /* ⛔ **Sin campo de orden declarado no se ordena por posición: se falla.** Un default acá sería
   * el orden de la hoja con otro nombre, que es lo que el `_39` sacó de `ULTIMO`. */
  if (!campoOrden) {
    return {
      valor: '',
      ambiguo: true,
      traza: '«FALTA:@fila_sin_orden» — `FILA` necesita el campo lógico de orden en ' +
        '`MARCADORES.separador` (ej. `mail_fecha`). **No hay default**: ordenar por la posición de ' +
        'la hoja es lo que el `_39` sacó de ULTIMO el 12/08, y una planilla de carga manual se ' +
        'reordena sin que salte nada.',
      filas: (ctx.filas || []).length
    };
  }

  var crudo = ctx.valor_fijo;
  var n = (typeof crudo === 'number') ? crudo : parseInt(String(crudo === undefined || crudo === null ? '' : crudo).trim(), 10);
  /* ⛔ `C-83` — Sheets convierte `1/3` en FECHA y `01` pierde el cero. El índice va **entero
   * pelado**, y si llegó otra cosa se dice con el valor crudo adelante, que es lo que permitió
   * diagnosticar el caso de `ecv_barrio1-3` sin deducir nada. */
  if (!(n >= 1) || String(n) !== String(crudo).trim()) {
    return {
      valor: '',
      ambiguo: true,
      traza: '«FALTA:@fila_indice_invalido» — `FILA` necesita el índice en `MARCADORES.valor_fijo` ' +
        'como **entero pelado y 1-based**. Llegó ' + JSON.stringify(crudo) + ' [' + (typeof crudo) +
        ']. ⚠ Formas que Sheets se come: `1/3` y `3-1` → fecha, `01` → pierde el cero (`C-83`).',
      filas: (ctx.filas || []).length
    };
  }

  if (!ctx.ordenPor || !ctx.ordenPor.valores) {
    return {
      valor: '',
      ambiguo: true,
      traza: '«FALTA:@fila_orden_no_mapeado» — `separador` declara ordenar por `' + campoOrden +
        '` y el despachador no pudo resolver esa columna en ' + ctx.base_id +
        (ctx.solapa ? '/' + ctx.solapa : '') + '. Sin los valores de orden **no se ordena por ' +
        'posición**: se falla.',
      filas: (ctx.filas || []).length
    };
  }

  var orden = filasOrdenadas_(ctx);
  var total = orden.filas.length;

  /* **Más índice que filas es `sin_datos`, no error.** El deck tiene cinco casilleros y la campaña
   * puede tener tres envíos: eso no es un fallo, es que no hay tanto envío. El símbolo `-` lo dice
   * y el `---` mentiría sobre la causa. */
  if (n > total) {
    return {
      valor: '',
      sin_datos: true,
      traza: 'FILA ' + n + ' de "' + ctx.campo_logico + '": la fuente tiene **' + total +
        ' fila(s)** para este recorte, así que no hay una ' + n + '.ª. Ordenado por `' + campoOrden +
        '`' + trazaDeVentana_(ctx),
      filas: total
    };
  }

  var elegida = orden.filas[n - 1];
  var clave = ctx.encabezado;
  var valor = (clave && (clave in elegida)) ? elegida[clave] : '';

  var avisoEmpate = orden.empates
    ? ' ⚠ **' + orden.empates + ' empate(s) en `' + campoOrden + '` desempatados por orden de ' +
      'origen** — determinista y compartido por todos los marcadores de esta tabla, pero `R-32` ' +
      'vale: este token publica una POSICIÓN, así que comparar esta celda entre dos corridas ' +
      'puede estar comparando entidades distintas.'
    : '';

  return {
    valor: valor,
    /* ⭐ `2026-08-25_1` — **la fila elegida viaja en el resultado.** Es aditivo: ningún consumidor
     * de `FILA` la mira. La necesita `FILA_TEXTO`, que compone su texto desde varios campos de
     * **esta misma fila** — y pedírsela a `opFILA` es lo que garantiza que el nombre y los números
     * de esa fila del deck sean del mismo encuentro. La alternativa era repetir acá la lógica de
     * orden, que es exactamente el instrumento que reproduce lo que ya existe y lo reproduce peor. */
    filaElegida: elegida,
    traza: 'FILA ' + n + ' de ' + total + ', ordenadas por `' + campoOrden + '`, campo "' +
      ctx.campo_logico + '" (col ' + ctx.columna + ') de ' + ctx.base_id +
      (ctx.solapa ? '/' + ctx.solapa : '') + avisoEmpate + trazaDeVentana_(ctx),
    filas: total
  };
}

/**
 * ⭐⭐ `2026-08-25_1` — **`FILA_TEXTO`: el texto de la N-ésima fila, compuesto desde VARIOS campos.**
 *
 * **Por qué existe, medido:** `L-036` rotula su primera columna `Campañas`, y **ninguna de las 29
 * columnas de `reuniones/Agenda JM | Post` trae un nombre de campaña** — se barrió la solapa entera
 * buscando `nombre`, `campaña`, `evento` y `encuentro`: cero. **El nombre se compone** de
 * `Funcionario` (B), `Tipo` (D), `Barrio / Comuna` (C) y `Fecha` (E), y el deck del equipo lo
 * publica así: *«Uno a uno en Retiro (24/07)»*.
 *
 * ⛔⛔ **Elige la fila con EXACTAMENTE el mismo mecanismo que `FILA`, y eso no es comodidad: es el
 * requisito.** Las otras cinco columnas de la tabla son `FILA` ordenadas por `fecha_periodo`. Si el
 * nombre se resolviera por otro camino —otra fuente, otro orden, otro índice— **la fila 2 del deck
 * mostraría el nombre de un encuentro y los números de otro, y nada fallaría.** Por eso reusa
 * `opFILA` en vez de repetir su lógica: **no hay forma de que se desalineen si es el mismo código.**
 *
 * ⭐ **La plantilla vive en `campo_logico`, que es configuración pura** (`D-01`): cambiar el texto
 * publicado **no exige `clasp push`**. Es la misma idea que `RATIO` con `numerador/denominador`,
 * generalizada — ahí el `campo_logico` ya declara varios campos.
 *
 *     campo_logico = '{figura} — {tipo_encuentro} en {barrio} ({fecha_periodo:dd/MM})'
 *
 * **Dos formas y nada más:** `{campo}` publica el valor crudo; `{campo:dd/MM}` lo formatea como
 * fecha. ⚠ **El formato es explícito y no se infiere del tipo**: adivinar que una celda «parece
 * fecha» es cómo `valor_fijo = '1/3'` terminó siendo una fecha (`C-83`).
 *
 * ⚠ **Un campo que no resuelve deja su hueco VISIBLE**, no vacío: `{barrio}` sin mapeo publica
 * `«?barrio»`. Un nombre al que le falta una parte **tiene que verse**, porque «Uno a uno en (24/07)»
 * se lee como un dato y es un token roto.
 */
function opFILA_TEXTO(ctx) {
  var plantilla = String(ctx.campo_logico || '');
  var campos = (ctx.plantilla && ctx.plantilla.campos) || null;
  if (!campos) {
    return {
      valor: '',
      ambiguo: true,
      traza: '«FALTA:@plantilla_sin_resolver» — `FILA_TEXTO` necesita que el despachador resuelva ' +
        'los campos de la plantilla "' + plantilla + '". Llegó sin `ctx.plantilla`.',
      filas: (ctx.filas || []).length
    };
  }

  /* ⭐ La fila la elige `opFILA`, con el MISMO índice y el MISMO orden que las otras cinco columnas
   * de la tabla. Se le pasa el `ctx` tal cual: lo único que se usa de su resultado es **cuál** fila
   * salió, y para eso alcanza con que su `clave` sea la del primer campo. */
  var elegida = opFILA(ctx);
  if (elegida.ambiguo) return elegida;   // el motivo ya viene armado por `opFILA`

  var fila = elegida.filaElegida;
  if (!fila) {
    return {
      valor: '', ambiguo: true,
      traza: '«FALTA:@fila_texto_sin_fila» — `opFILA` no devolvió `filaElegida`. ' + elegida.traza,
      filas: (ctx.filas || []).length
    };
  }

  var faltantes = [];
  var texto = plantilla.replace(/\{([^}:]+)(?::([^}]*))?\}/g, function (todo, nombre, fmt) {
    var campo = campos[String(nombre).trim()];
    if (!campo || !campo.clave) { faltantes.push(String(nombre).trim()); return '«?' + nombre + '»'; }
    var crudo = (campo.clave in fila) ? fila[campo.clave] : '';
    if (crudo === '' || crudo === null || crudo === undefined) {
      faltantes.push(String(nombre).trim() + ' (celda vacía)');
      return '«?' + nombre + '»';
    }
    if (!fmt) return String(crudo);
    /* El único formato soportado es la fecha, y se declara. `parsearFechaCelda_` ya entiende el
     * serial de Sheets y el texto `dd/mm/aaaa` — es el mismo lector que usan los dos consumidores
     * que comparan fechas, así que no hay un parser nuevo (`CLAUDE.md` §2: cuatro ya son señal). */
    var f = (crudo instanceof Date) ? crudo : parsearFechaCelda_(crudo);
    if (!f) { faltantes.push(String(nombre).trim() + ' (no es fecha)'); return '«?' + nombre + '»'; }
    return Utilities.formatDate(f, Session.getScriptTimeZone(), String(fmt).trim());
  });

  return {
    valor: texto,
    traza: 'FILA_TEXTO sobre ' + elegida.traza +
      (faltantes.length ? ' ⚠ campos sin resolver: ' + faltantes.join(', ') : ''),
    filas: elegida.filas
  };
}

/**
 * ⭐⭐ `2026-08-25_3` — **`GRUPO_TEXTO`: el texto del N-ésimo GRUPO, agregando sobre sus filas.**
 *
 * **Por qué existe, y por qué no es `FILA_TEXTO` con otra cara.** La columna `Período` de `L-036`
 * publica *«24/07 — 06/08»* para un encuentro cuyo desglose tiene **cinco filas**, una por
 * plataforma, con cinco pares de fechas distintos. La unidad de la tabla es **el encuentro**; la
 * unidad de la fuente es **la fila de plataforma**. `opFILA` hace `orden.filas[n-1]` — **indexa
 * filas**, así que `FILA` y `FILA_TEXTO` publicarían las fechas de *una* plataforma como si fueran
 * las del encuentro. Son operaciones distintas y quedan **intactas**: las usan 41 marcadores.
 *
 * ⛔⛔ **La identidad del grupo es `id_cuenta`, NO `fecha_periodo`** (`D-30`). Es la corrección que
 * el usuario marcó y el caso es real: dentro de `julio_24_30` hay **dos encuentros el 29/07**
 * —`3389` Nueva Pompeya y `3420` Caballito—. Agrupados por fecha caerían en **un solo grupo**, y el
 * período publicado abarcaría los dos: un rango más ancho, plausible, y de dos encuentros.
 * `fecha_periodo` es el campo de **orden**; `id_cuenta` es el de **identidad**. No son
 * intercambiables aunque en la mayoría de las semanas den lo mismo.
 *
 * ### El índice es la RANURA, no la posición entre los grupos presentes
 *
 * ⭐ El grupo se elige por `__temario_slot__`, que `temarioPorSolapas_` selló en cada fila **antes**
 * de que ninguna solapa se recortara. Ahí ya se ordenó por `fecha_periodo` **con `filasOrdenadas_`,
 * el mismo comparador que usan las seis columnas numéricas de la tabla** — así que el orden de los
 * grupos y el de las filas de `Agenda JM | Post` no se parecen: **son el mismo**.
 *
 * ⛔ **Tomar «el n-ésimo grupo presente» sería el bug.** Un encuentro sin filas en el desglose
 * correría todas las ranuras siguientes y la ranura 3 mostraría el período de un encuentro al lado
 * de los números de otro, **sin fallar**. Con la ranura, ese encuentro deja **un hueco en su lugar**.
 *
 * ⚠ **El desempate entre dos encuentros del mismo día está declarado y es compartido:** el orden de
 * origen en la lista única, que es **el orden del temario**. Es el `a.i - b.i` de `filasOrdenadas_`.
 * `R-32` sigue valiendo: con empate, la ranura publica una **posición**, no una cosa — lo que esto
 * garantiza es que las ocho columnas de esa ranura hablen del **mismo** encuentro.
 *
 * ### Contrato
 *
 *   - **`valor_fijo` = N**, entero pelado y 1-based — la ranura. `C-83`: nada de `2/5`.
 *   - **`separador`** = el campo lógico por el que se ordenaron los grupos (`fecha_periodo`). **Sin
 *     él se falla**, misma doctrina que `FILA`: no hay orden por defecto.
 *   - **`campo_logico`** = la plantilla, con el agregador en la ranura del formato:
 *
 *         '{des_fecha_inicio:min:dd/MM} — {des_fecha_fin:max:dd/MM}'
 *
 *     ⭐ **La sintaxis reusa `camposDePlantilla_` sin tocarla**: el regex ya parte `{nombre:resto}`,
 *     así que `min:dd/MM` viaja entero como «formato» y lo interpreta esta operación. Un agregador
 *     nuevo no exige cambiar el despachador.
 *   - **Agregadores:** `min` y `max` sobre fechas, `suma` y `conteo` sobre números. Ninguno más, y
 *     un agregador desconocido **deja hueco visible** en vez de adivinar.
 *   - **Ranura sin grupo → `sin_datos`**, no error: es *«ese encuentro no tuvo desglose»*.
 *
 * ⚠ **Sólo corre sobre filas selladas por el temario.** Sin `__temario_slot__` no hay ranura que
 * respetar, y **inventar una ordenando lo que llegó sería exactamente el bug de arriba**: se falla
 * con motivo propio.
 */
var CLAVE_SLOT_GRUPO_ = '__temario_slot__';
var CLAVE_ID_GRUPO_ = '__temario_id__';
var AGREGADORES_GRUPO_ = ['min', 'max', 'suma', 'conteo'];

function opGRUPO_TEXTO(ctx) {
  var plantilla = String(ctx.campo_logico || '');
  var filas = ctx.filas || [];
  var campos = (ctx.plantilla && ctx.plantilla.campos) || null;

  if (!campos) {
    return {
      valor: '', ambiguo: true, filas: filas.length,
      traza: '«FALTA:@plantilla_sin_resolver» — `GRUPO_TEXTO` necesita que el despachador resuelva ' +
        'los campos de la plantilla "' + plantilla + '". Llegó sin `ctx.plantilla`.'
    };
  }

  var campoOrden = String(ctx.separador === undefined || ctx.separador === null ? '' : ctx.separador).trim();
  if (!campoOrden) {
    return {
      valor: '', ambiguo: true, filas: filas.length,
      traza: '«FALTA:@grupo_sin_orden» — `GRUPO_TEXTO` necesita en `MARCADORES.separador` el campo ' +
        'lógico por el que se ordenaron los grupos (`fecha_periodo`). **No hay default**: un orden ' +
        'implícito es el orden de la hoja con otro nombre.'
    };
  }

  var crudo = ctx.valor_fijo;
  var n = (typeof crudo === 'number') ? crudo : parseInt(String(crudo === undefined || crudo === null ? '' : crudo).trim(), 10);
  if (!(n >= 1) || String(n) !== String(crudo).trim()) {
    return {
      valor: '', ambiguo: true, filas: filas.length,
      traza: '«FALTA:@grupo_indice_invalido» — la ranura va en `MARCADORES.valor_fijo` como ' +
        '**entero pelado y 1-based**. Llegó ' + JSON.stringify(crudo) + ' [' + (typeof crudo) + ']. ' +
        '⚠ Formas que Sheets se come: `1/3` y `3-1` → fecha, `01` → pierde el cero (`C-83`).'
    };
  }

  /* ⛔ La guarda que hace que esta operación no pueda publicar un grupo corrido. */
  var selladas = filas.filter(function (f) { return f && f[CLAVE_SLOT_GRUPO_] !== undefined; });
  if (!selladas.length) {
    return {
      valor: '', ambiguo: true, filas: filas.length,
      traza: '«FALTA:@grupo_sin_ranura» — ninguna de las ' + filas.length + ' fila(s) trae ' +
        '`' + CLAVE_SLOT_GRUPO_ + '`. `GRUPO_TEXTO` sólo corre sobre filas selladas por el TEMARIO ' +
        '(`temarioPorSolapas_`): la ranura se calcula **una vez, sobre la lista única**, antes de ' +
        'que ninguna solapa se recorte. ⛔ Ordenar acá lo que llegó daría «el n-ésimo grupo ' +
        'PRESENTE», que corre las ranuras cuando un encuentro falta en esta solapa y publica el ' +
        'período de un encuentro al lado de los números de otro, sin fallar.'
    };
  }

  /* Agrupar por `id_cuenta` — la IDENTIDAD. La ranura es la misma para todas las filas del grupo,
   * porque se selló por encuentro. */
  var porRanura = {};
  var ranuras = [];
  selladas.forEach(function (f) {
    var r = f[CLAVE_SLOT_GRUPO_];
    if (!porRanura[r]) { porRanura[r] = { filas: [], id: f[CLAVE_ID_GRUPO_] }; ranuras.push(r); }
    porRanura[r].filas.push(f);
  });

  var grupo = porRanura[n];
  if (!grupo) {
    ranuras.sort(function (a, b) { return a - b; });
    return {
      valor: '', sin_datos: true, filas: filas.length,
      traza: 'GRUPO_TEXTO ranura ' + n + ': **ningún grupo la ocupa**. Las ranuras con filas en ' +
        ctx.base_id + (ctx.solapa ? '/' + ctx.solapa : '') + ' son [' + ranuras.join(', ') + '] ' +
        'sobre ' + selladas.length + ' fila(s). ⭐ Esto NO corre las demás: la ranura ' + n + ' es ' +
        'un encuentro del temario que no tiene filas acá, y su casillero queda vacío **en su ' +
        'lugar**. Ordenado por `' + campoOrden + '`.'
    };
  }

  var faltantes = [];
  var texto = plantilla.replace(/\{([^}:]+)(?::([^}]*))?\}/g, function (todo, nombre, resto) {
    var clave = String(nombre).trim();
    var campo = campos[clave];
    if (!campo || !campo.clave) { faltantes.push(clave); return '«?' + clave + '»'; }

    var partes = String(resto || '').split(':');
    var agregador = String(partes[0] || '').trim().toLowerCase();
    var fmt = partes.slice(1).join(':').trim();
    if (AGREGADORES_GRUPO_.indexOf(agregador) === -1) {
      faltantes.push(clave + ' (agregador "' + agregador + '" desconocido; hay ' +
        AGREGADORES_GRUPO_.join('/') + ')');
      return '«?' + clave + '»';
    }

    var valores = [];
    grupo.filas.forEach(function (f) {
      var v = (campo.clave in f) ? f[campo.clave] : '';
      if (v === '' || v === null || v === undefined) return;
      valores.push(v);
    });
    if (!valores.length) { faltantes.push(clave + ' (sin valores en el grupo)'); return '«?' + clave + '»'; }

    if (agregador === 'conteo') return String(valores.length);
    if (agregador === 'suma') {
      var nums = valores.filter(function (v) { return typeof v === 'number' && !isNaN(v); });
      if (!nums.length) { faltantes.push(clave + ' (ningún valor numérico)'); return '«?' + clave + '»'; }
      return String(nums.reduce(function (a, b) { return a + b; }, 0));
    }

    /* `min` / `max` sobre fechas. Se reusa `parsearFechaCelda_`, el mismo lector que ya usan los dos
     * consumidores que comparan fechas — no hay un parser nuevo (`CLAUDE.md` §2). */
    var fechas = [];
    valores.forEach(function (v) {
      var f = (v instanceof Date) ? v : parsearFechaCelda_(v);
      if (f) fechas.push(f);
    });
    if (!fechas.length) { faltantes.push(clave + ' (ningún valor es fecha)'); return '«?' + clave + '»'; }
    var elegida = fechas.reduce(function (a, b) {
      if (agregador === 'min') return b.getTime() < a.getTime() ? b : a;
      return b.getTime() > a.getTime() ? b : a;
    });
    if (!fmt) return String(elegida);
    return Utilities.formatDate(elegida, Session.getScriptTimeZone(), fmt);
  });

  return {
    valor: texto,
    traza: 'GRUPO_TEXTO ranura ' + n + ' de ' + ranuras.length + ' grupo(s) presentes, agrupados ' +
      'por `id_cuenta` (' + grupo.id + ') sobre ' + grupo.filas.length + ' fila(s) de ' + ctx.base_id +
      (ctx.solapa ? '/' + ctx.solapa : '') + '. ⭐ La ranura viene sellada por el TEMARIO y no se ' +
      'recalcula acá: se ordenó por `' + campoOrden + '` con el mismo comparador que las columnas ' +
      'numéricas de esta tabla' + (faltantes.length ? ' ⚠ campos sin resolver: ' + faltantes.join(', ') : '') +
      trazaDeVentana_(ctx),
    filas: grupo.filas.length
  };
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
  ELEMENTO: opELEMENTO,
  /* `2026-08-23` (`X-35`) — la décima. El campo X de la N-ésima FILA, **sin colapsar** y con el
   * orden declarado en `separador`. `ELEMENTO` no sirve para una tabla por filas: colapsa
   * repetidos y ordena alfabéticamente **por columna**, así que cada celda de la fila 1 puede
   * venir de un envío distinto. Ver su comentario, que explica por qué NO ordena por posición. */
  FILA: opFILA,
  /* `2026-08-25_1` — la undécima. El TEXTO de la N-ésima fila, compuesto desde varios campos con
   * una plantilla en `campo_logico`. **Reusa `opFILA` para elegir la fila**, que es lo que
   * garantiza que el nombre y los números de esa fila del deck sean del mismo encuentro. */
  FILA_TEXTO: opFILA_TEXTO,
  /* `2026-08-25_3` — la duodécima. El TEXTO del N-ésimo GRUPO, agregando sobre sus filas. **No es
   * `FILA_TEXTO` con otra cara:** `opFILA` indexa FILAS y acá la unidad es el grupo —un encuentro
   * con cinco filas de plataforma—. La identidad del grupo es `id_cuenta` (`D-30`) y el índice es
   * la RANURA sellada por el temario, no la posición entre los grupos presentes. Ver su comentario. */
  GRUPO_TEXTO: opGRUPO_TEXTO,
  /* `2026-08-26` — la decimotercera. Los valores DISTINTOS de un campo, **sin catálogo**. No es
   * `LISTA` con la guarda floja: `LISTA` publica contra un catálogo y **descarta lo que no matchea**,
   * que acá borraría campañas legítimas. Comparte núcleo con `CUENTA_DISTINTOS` —`distintosDeCampo_`,
   * con `R-10`— y **no con `LISTA`**, cuyo normalizador produce OTRO conjunto de nombres y haría que
   * la lista y el banner de la misma lámina no coincidan. Ver su comentario. */
  LISTA_CRUDA: opLISTA_CRUDA,
  /* `2026-09-03` — la decimocuarta. El TEXTO de TODAS las filas, una por fila, unidas por
   * `separador`. **No es `FILA_TEXTO` sin índice ni `LISTA_CRUDA` con plantilla**: aquélla publica
   * UNA fila y ésta las publica todas, y `LISTA_CRUDA` **deduplica**, que acá borraría encuentros.
   * Ver su comentario. */
  LISTA_TEXTO: opLISTA_TEXTO
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


/* ══════════════════════════════════════════════════════════════════════════════════════════
 * ⭐⭐ `2026-09-03` — **`LISTA_TEXTO`, la decimocuarta: el texto de TODAS las filas.**
 *
 * `emin_lista` la necesita, y **ninguna de las trece anteriores sirve**. Medido antes de
 * escribirla, que es lo que la justifica:
 *
 *   · **`LISTA_CRUDA`** toma **un** `campo_logico` y **DEDUPLICA**. Con `figura` sola sobre la
 *     semana del 03/09 publicaría **5** donde hay **7 encuentros**: *«Seguridad en tu barrio»*
 *     aparece **tres veces** —Comuna 1 Sur, Comuna 2 y Comuna 3, el mismo día— y colapsaría a una.
 *     ⛔ **Y el número no fallaría**: publicaría una lista corta y plausible.
 *   · **`FILA_TEXTO`** compone con plantilla pero publica **UNA** fila, la N-ésima. Sirve para una
 *     tabla de N casilleros, **no para una lista en una caja**, y acá la cantidad de encuentros
 *     **cambia cada semana** — 6, 7, 8. Una tabla de N fijo publicaría huecos o cortaría.
 *   · **`ELEMENTO`** es lo mismo un escalón más abajo y además colapsa repetidos.
 *
 * ⇒ **Todas las filas, en el orden de la solapa, sin deduplicar, unidas por `separador`.**
 *
 * ══ POR QUÉ NO DEDUPLICA, QUE ES LA DECISIÓN QUE LA DEFINE ═════════════════════════════════
 *
 * ⛔ **Dos encuentros distintos pueden producir el mismo texto, y siguen siendo dos.** Es el caso
 * de arriba: tres filas de *«Seguridad en tu barrio»* el mismo día. Deduplicar convertiría **el
 * problema del texto** —que no distingue— en **una pérdida de filas**, que es peor y silenciosa.
 * ⭐ **La plantilla es la que tiene que distinguirlos**, y para eso está el condicional.
 *
 * ══ EL CONDICIONAL, Y DÓNDE VIVE SU LITERAL ════════════════════════════════════════════════
 *
 * ⭐⭐ `{campo=VALOR?alterno}` — **si `campo` vale `VALOR`, se publica `alterno`.**
 *
 *     campo_logico = '{figura=Seguridad en tu barrio?barrio} {fecha:dd/MM}'
 *
 * ⛔ **El literal vive en la fila de `MARCADORES`, NO en el `.gs`** (decisión del usuario). El caso
 * es real y está medido: `Agenda funcionarios` carga *«Seguridad en tu barrio»* **en la columna
 * `Funcionario`** —no es una persona, es el nombre del ciclo—, así que la lámina tiene que mostrar
 * **el barrio**. Con el literal en el código, un segundo ciclo exigiría `clasp push`, que es
 * exactamente lo que `D-01` mide.
 *
 * ⚠ **La comparación se normaliza de los dos lados** con `normalizarValorDeclarado_` (`R-10`):
 * una celda tipeada a mano trae espacios de más, y comparar crudo contra el literal fallaría **en
 * silencio** — la lista saldría con el nombre del ciclo repetido y nadie sabría por qué.
 *
 * ══ EL ORDEN ═══════════════════════════════════════════════════════════════════════════════
 *
 * ⚠ **Es el orden de la solapa, y se DECLARA en la traza en vez de suponerse.** No se ordena
 * alfabéticamente como `LISTA`/`LISTA_CRUDA`: una lista de encuentros que arranca por *«Gabino»*
 * no dice nada, y la solapa se carga a mano en orden cronológico. ⛔ **Si algún día dejara de
 * estarlo, la traza es lo que lo delata** — por eso dice de dónde salió el orden y no se calla.
 * ══════════════════════════════════════════════════════════════════════════════════════════ */
function opLISTA_TEXTO(ctx) {
  var plantilla = String(ctx.campo_logico || '');
  var campos = (ctx.plantilla && ctx.plantilla.campos) || null;
  var filas = (ctx.filas || []);

  if (!campos) {
    return {
      valor: '', ambiguo: true,
      traza: '«FALTA:@plantilla_sin_resolver» — `LISTA_TEXTO` necesita que el despachador resuelva ' +
        'los campos de la plantilla "' + plantilla + '". Llegó sin `ctx.plantilla`.',
      filas: filas.length
    };
  }

  /* ⛔ Cero filas NO es una lista vacía: es un universo vacío, y eso se dice. Publicar `''` haría
   * que «no hubo encuentros» y «el recorte los dejó a todos afuera» se vean igual. */
  if (!filas.length) {
    return {
      valor: '', ambiguo: true,
      traza: '«FALTA:@lista_sin_filas» — `LISTA_TEXTO` no recibió ninguna fila. No es una lista ' +
        'vacía: es un universo vacío, y las dos cosas mandan a trabajos distintos.',
      filas: 0
    };
  }

  var faltantes = {};
  var condicionales = 0;

  function pintarFila(fila) {
    return plantilla.replace(/\{([^}:]+)(?::([^}]*))?\}/g, function (todo, cuerpo, fmt) {
      var p = partirTokenDePlantilla_(cuerpo);
      var nombre = p.campo;

      /* ⭐ El condicional. Se evalúa ANTES de leer el valor a publicar, porque puede cambiar
       * **cuál campo** se lee, no sólo cómo se lo muestra. */
      if (p.igual !== null && p.alterno) {
        var cmpCampo = campos[nombre];
        var cmpCrudo = (cmpCampo && cmpCampo.clave && (cmpCampo.clave in fila)) ? fila[cmpCampo.clave] : '';
        /* ⚠ Los DOS lados normalizados (`R-10`): la celda viene tipeada a mano. */
        if (normalizarValorDeclarado_(cmpCrudo) === normalizarValorDeclarado_(p.igual)) {
          nombre = p.alterno;
          condicionales++;
        }
      }

      var campo = campos[nombre];
      if (!campo || !campo.clave) { faltantes[nombre] = 'sin mapeo'; return '«?' + nombre + '»'; }
      var crudo = (campo.clave in fila) ? fila[campo.clave] : '';
      if (crudo === '' || crudo === null || crudo === undefined) {
        faltantes[nombre] = 'celda vacía';
        return '«?' + nombre + '»';
      }
      if (!fmt) return String(crudo);
      /* Mismo lector de fechas que el resto del motor — no hay un parser nuevo (`CLAUDE.md` §2). */
      var f = (crudo instanceof Date) ? crudo : parsearFechaCelda_(crudo);
      if (!f) { faltantes[nombre] = 'no es fecha'; return '«?' + nombre + '»'; }
      return Utilities.formatDate(f, Session.getScriptTimeZone(), String(fmt).trim());
    });
  }

  var textos = filas.map(pintarFila);
  /* ⚠ `separador` es la cadena que une, igual que en `LISTA` y `LISTA_CRUDA`. Sin declararlo, el
   * default es un salto de línea: una lista de encuentros se lee en renglones, no en una fila. */
  var sep = (ctx.separador === '' || ctx.separador === null || ctx.separador === undefined)
    ? '\n' : String(ctx.separador);

  var avisos = Object.keys(faltantes).sort()
    .map(function (n) { return n + ' (' + faltantes[n] + ')'; });

  return {
    valor: textos.join(sep),
    traza: 'LISTA_TEXTO sobre ' + filas.length + ' fila(s) de ' + ctx.base_id + '/' + ctx.solapa +
      ', en el ORDEN DE LA SOLAPA (no alfabético)' +
      (condicionales ? ' · ' + condicionales + ' condicional(es) aplicado(s)' : '') +
      /* ⭐ El cero se dice, igual que el hallazgo: «ninguno aplicó» descarta una causa y una lista
       * vacía de avisos no descarta nada. */
      (plantillaSinCondicional_(plantilla) ? '' : (condicionales ? '' : ' · ⚠ ningún condicional aplicó')) +
      trazaDeVentana_(ctx) +
      (avisos.length ? ' ⚠ campos sin resolver: ' + avisos.join(', ') : ''),
    filas: filas.length
  };
}

/** ¿La plantilla NO tiene ningún condicional? Sirve para no avisar de algo que no se pidió. */
function plantillaSinCondicional_(plantilla) {
  var hay = false;
  String(plantilla || '').replace(/\{([^}:]+)(?::[^}]*)?\}/g, function (todo, cuerpo) {
    var p = partirTokenDePlantilla_(cuerpo);
    if (p.igual !== null && p.alterno) hay = true;
    return todo;
  });
  return !hay;
}
