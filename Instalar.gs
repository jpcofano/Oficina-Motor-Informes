/**
 * Instalar.gs — Setup inicial.
 * Crea las hojas de configuración por registros (CONFIG, BASES, INFORMES,
 * MARCADORES, MAPEO, CAMPANAS, PERIODOS, ...) con encabezados solamente — ninguna
 * fila de datos (Paso 2.11 Parte A: `HOJAS_CONFIG_` es esquema, no siembra) — y deja
 * el menú instalado.
 * Idempotente: si una hoja ya existe, no la pisa. Para MARCADORES/CAMPANAS,
 * si ya existen con el esquema viejo, inserta las columnas nuevas
 * (periodo_ref / desde / hasta) en su posición sin tocar filas cargadas.
 * También expone seedConfiguracion(): carga (upsert) los valores reales de
 * BASES/MAPEO/CONFIG/INFORMES/PERIODOS para no cargarlos a mano; diagnosticarCarpetaPlantillas_():
 * lista sin filtrar qué hay en la carpeta de plantillas; y
 * registrarPlantillasDesdeCarpeta(): recorre esa carpeta (hasta 2 niveles de
 * subcarpetas), matchea los Slides nativos contra INFORMES y completa
 * plantilla_id, reportando .pptx sin convertir y accesos directos; y
 * diagnosticoDrive(): confirma cuenta efectiva + contenido crudo de la
 * carpeta de plantillas por ID fijo, para descartar problemas de scope/
 * autorización antes de tocar registrarPlantillasDesdeCarpeta.
 * Se completa en: Paso 0 (v2) + Paso 0.5 + Paso 1.6 + Paso 1.6 (v2) + Paso 1.7
 * + Paso 1.8-B — ver docs/Prompts/Paso-0-v2.md, docs/Prompts/Paso-0.5.md,
 * docs/Prompts/Paso-1.6.md, docs/Prompts/Paso-1.6-v2.md, docs/Prompts/Paso-1.7.md,
 * docs/Prompts/Paso-1.8-B.md, Plan Inicial/_archivo/ARQUITECTURA_registros.md y
 * Plan Inicial/_archivo/Periodos_y_campanias.md.
 */

/**
 * Paso 1.8-B — diagnóstico de scopes/autorización.
 * Ver docs/Prompts/Paso-1.8-B.md. Temporal: cuando el registro de plantillas
 * funcione de punta a punta, se puede borrar o dejar como herramienta de
 * soporte.
 */
function diagnosticoDrive() {
  Logger.log('Cuenta efectiva: ' + Session.getEffectiveUser().getEmail());

  // Paso 2.15 Parte A: el ID estaba hardcodeado acá, con lo cual éste era el único
  // lugar que no se enteraba si la carpeta de plantillas cambiaba — un diagnóstico
  // que mira la carpeta equivocada y dice que todo está bien. Ahora sale de CONFIG,
  // como los otros tres consumidores (registrarPlantillasDesdeCarpeta,
  // menuDiagnosticarCarpetaPlantillas_, Armonizar.gs).
  var id = leerConfig().carpeta_plantillas;
  if (!id) {
    Logger.log('CONFIG.carpeta_plantillas está vacío — cargalo antes de diagnosticar.');
    return;
  }
  var carpeta = DriveApp.getFolderById(id);
  Logger.log('Carpeta: ' + carpeta.getName());

  var n = 0;
  var it = carpeta.getFiles();
  while (it.hasNext()) {
    var f = it.next();
    n++;
    Logger.log(f.getName() + ' | ' + f.getMimeType() + ' | ' + f.getId());
  }
  Logger.log('Total archivos: ' + n);

  var c = 0;
  var itc = carpeta.getFolders();
  while (itc.hasNext()) { c++; Logger.log('Subcarpeta: ' + itc.next().getName()); }
  Logger.log('Total subcarpetas: ' + c);
}

// Paso 2.11 Parte A — `HOJAS_CONFIG_` define el ESQUEMA (los `headers`), nada más.
// Antes tenía `ejemplos`: filas que se escribían una sola vez, al crear la hoja de
// cero, y que en la práctica eran datos reales (BASES/MAPEO/MARCADORES) leídos por
// el motor — una segunda fuente de verdad además de los `SEED_*` de más abajo, y las
// dos no siempre decían lo mismo (`m2.hoja_default` llegó a estar en desacuerdo
// consigo mismo entre `ejemplos` y `SEED_BASES_`). `instalar()` ya no escribe filas
// de datos: crea la hoja vacía (headers solamente) y el sembrador correspondiente
// (`seedConfiguracion()`, `sembrarClasificacionSolapas()`, `sembrarSecciones_()`, o
// uno de los `SEED_*` nuevos de más abajo) es la única fuente de las filas.
var HOJAS_CONFIG_ = {
  CONFIG: {
    headers: ['clave', 'valor']
  },
  BASES: {
    headers: ['base_id', 'nombre', 'sheet_id', 'hoja_default', 'fila_encabezado', 'modo_periodo', 'tipo', 'activo', 'notas']
  },
  INFORMES: {
    headers: ['informe_id', 'nombre', 'plantilla_id', 'periodicidad', 'familias', 'activo', 'notas']
  },
  // solapa/operacion/valor_fijo (DOC-2 Parte A): operacion reemplaza a calculo
  // (migración idempotente en migrarCalculoAOperacion_); valor_fijo es para
  // operacion=TEXTO; solapa entra en la clave de MAPEO y, si viene vacía, la
  // regla de resolución (docs/TOKENS.md, PROYECTO.md §3) decide si se infiere
  // o se exige. Sin sembrador: ver "No sembrar las ~200 filas de MARCADORES"
  // en `docs/Prompts/Paso-2.10_anclar_a_numeros_verificados.md` — bloqueado por
  // la armonización de plantillas, se carga a mano hasta que eso se resuelva.
  MARCADORES: {
    headers: ['marcador', 'familia', 'informe_id', 'base_id', 'solapa', 'campo_logico', 'periodo_ref', 'operacion', 'valor_fijo', 'formato', 'filtro', 'catalogo', 'separador', 'notas']
  },
  // solapa (Paso 2.3.2): entra en la clave junto con base_id + campo_logico.
  // Antes de esto, dos solapas de la misma base no podían mapear el mismo
  // campo_logico sin pisarse en silencio (ver docs/Prompts/Paso-2.3.2.md).
  // `tipo_esperado` (Paso 2.7 Parte F): numero/texto/fecha, o vacío = sin declarar
  // (no se chequea). `DIAG_BASES` solo avisa ⚠ cuando el tipo real difiere del
  // declarado — antes avisaba ⚠ toda columna texto/mixto sin importar si eso era
  // lo esperado, y con 35 avisos casi todos inocentes (`figura`, `*_id_cuenta`, …)
  // la gente aprendía a ignorarlos.
  // Paso 2.16 — `valores_incluidos`: lista blanca de valores de esa columna, separados
  // por coma. Vacío = sin filtro (entran todas las filas). Ver D-21.
  MAPEO: {
    headers: ['base_id', 'solapa', 'campo_logico', 'hoja', 'columna', 'tipo_esperado', 'valores_incluidos', 'notas']
  },
  // SOLAPAS (Paso 2.6): declara el uso de CADA solapa de cada base — el motor solo
  // sabía de las que aparecían en MAPEO, y el resto (backups, pivots, vistas con
  // período tipeado a mano) eran invisibles. `uso=fuente` es requisito para que
  // `buscarMapeo()` la deje leer (Config.gs); `fila_encabezado` vive acá (no en BASES)
  // porque es un atributo de la solapa, no de la base — ver docs/Prompts/Paso-2.6_registro_solapas.md
  // Parte B. `firma_encabezado` (Paso 2.11 Parte B): contenido legible de la fila que
  // `fila_encabezado` señala, lo escribe `inventariarSolapas()` (Solapas.gs) — sirve
  // para ver a simple vista si `fila_encabezado` apunta a títulos o a datos.
  // `origen` (Paso 2.7 Parte A): 'auto' (lo escribió inventariarSolapas) / 'seed'
  // (lo escribió la siembra propuesta) / 'manual' (lo tipeó una persona) — sin esto,
  // la siembra no puede distinguir un `uso=revisar` automático de uno elegido a mano,
  // y termina sin poder pisar nada (ver Solapas.gs y sembrarClasificacionSolapas()
  // abajo).
  // filas_crudas (Paso 2.10 Parte B): el valor viejo de filas_datos
  // (getLastRow()-1, cuenta relleno de fórmula como si fuera dato). Se
  // conserva al lado del filas_datos corregido porque la diferencia entre
  // ambas ES el diagnóstico — ver Solapas.gs inventariarSolapas().
  // `ventana_ref` (`_23`, 10/08): **de qué otra solapa de la misma base toma esta solapa su
  // ventana temporal**. Vacío = la solapa se recorta con su propia `fecha_periodo`, que es lo
  // que hacían todas hasta hoy. Vive acá y no en `MAPEO` porque no es una columna de la
  // solapa: es una propiedad de la solapa, del mismo grano que `uso` y `fila_encabezado`.
  // La **clave** del cruce sí es una columna, y por eso va en `MAPEO` (`clave_ventana`).
  // `campo_id_cuenta` (`_44`, `D-30`): **qué campo lógico de esta solapa lleva el `id_cuenta`**.
  // Vacío = la solapa no se selecciona por cuenta, que es el estado de todas hasta hoy. Guarda el
  // **campo lógico** y no la letra de columna, por lo mismo que `ventana_ref` guarda la solapa y
  // deja la clave en `MAPEO.clave_ventana`: la letra tiene dueño y es `MAPEO`.
  SOLAPAS: {
    headers: ['base_id', 'solapa', 'uso', 'origen', 'fila_encabezado', 'firma_encabezado', 'filas_datos', 'filas_crudas', 'filas_minimas', 'ventana_ref', 'campo_id_cuenta', 'notas']
  },
  // tipo (Paso 2.2) acepta: campana, uno_a_uno, tematico, primera_persona,
  // ministros, proveedor — ver Plan Inicial/PROYECTO.md §4.
  // Paso 2.15 Parte B — `periodo_id` primera: es clave foránea a PERIODOS, se lee como
  // identidad y no como dato suelto. Ver D-19 para qué hace el motor con una fila vacía.
  CAMPANAS: {
    headers: ['periodo_id', 'campana_id', 'nombre', 'informe_id', 'base_id', 'tipo', 'desde', 'hasta', 'mostrar', 'orden']
  },
  PERIODOS: {
    headers: ['periodo_id', 'desde', 'hasta', 'notas']
  },
  // Paso 2.9D — R-02: el temario define el universo del informe, no la fecha.
  // Curado a mano, mismo patrón que CAMPANAS.
  REUNIONES: {
    headers: ['periodo_id', 'orden', 'eje', 'tipo', 'nombre', 'fecha', 'etapa', 'mostrar', 'texto_original', 'notas']
  },
  // Paso 2.9G v2 — registro jerárquico de secciones (docs/SECCIONES.md, v2,
  // verificada contra tres informes publicados). Se siembra con `SEED_SECCIONES_` +
  // `sembrarSecciones_()` (abajo) — el árbol completo es demasiado para un ejemplo
  // de instalación.
  // Paso 3 (v3) Parte B (D-20) — `periodo_ref` antes de `notas`. **Esta lista se tocó
  // DESPUÉS de que `COLUMNAS_DELTA_.SECCIONES` existiera y de una corrida aplicada**: con la
  // entrada de delta puesta, la hoja ya no pasa por la rama que reescribe la fila 1, así que
  // agregar la columna acá no puede correr los encabezados sobre las filas curadas. Al
  // revés —headers primero, delta después— sí las corría. Ver el comentario de
  // `COLUMNAS_DELTA_.SECCIONES`.
  //
  // Para una planilla nueva esta lista es la que vale: `insertSheet` escribe estos headers
  // y no pasa por el delta.
  SECCIONES: {
    headers: ['seccion_id', 'padre', 'orden', 'nombre', 'informes', 'modo', 'itera_sobre', 'filtro', 'opcional', 'condicion', 'familia_tokens', 'estado', 'falta', 'periodo_ref', 'items_por_lamina', 'notas']
  },
  // Paso 2.9H — la "foto" de cada token calculado. Nunca se pisa: cada corrida
  // agrega una fila, así un informe pasado se puede reproducir (punteo del
  // 30/07). Ver Valores.gs.
  VALORES: {
    headers: ['periodo', 'informe_id', 'seccion_id', 'item', 'token', 'valor', 'fecha_calculo', 'origen_valor', 'parcial']
  },
  // Paso 2.9H — un token calculado para el mismo (periodo, item) ya dio un
  // valor distinto antes: no se decide sola (recalcular calla la divergencia
  // entre informes; congelar publica un número viejo). Queda acá hasta que la
  // persona completa `decision` (reusar/actualizar).
  VALORES_DIVERGENTES: {
    headers: ['item', 'token', 'valor_anterior', 'fecha_anterior', 'valor_nuevo', 'diferencia', 'parcial', 'decision']
  },
  // Paso 4 `A.5` — registro de CORRIDAS de generación. Va acá y no en `INFORMES`: esa hoja
  // es el registro de plantillas, y meterle el nivel de instancia conflaría las dos cosas.
  // **Es un insumo, no un log** (`D-07`): `mapa_tokens` guarda `token → objectId` serializado
  // para que la etapa 2 de `D-06` pueda escribir por identidad de elemento en vez de por
  // búsqueda de texto. Append: cada generación agrega una fila.
  CORRIDAS: {
    headers: ['corrida_id', 'informe_id', 'periodo_id', 'deck_id', 'fecha_generacion', 'tokens_reemplazados', 'faltantes', 'mapa_tokens']
  },
  // Paso 4 `B.7` (`D-12`) — se **pisa** en cada corrida, a propósito: es la lista de trabajo
  // de lo que falta cablear, no un historial. Si algún día hace falta la serie,
  // `tools/snapshot.js` ya la archivaría.
  FALTANTES: {
    headers: ['corrida_id', 'informe_id', 'token', 'base_id', 'solapa', 'campo_logico', 'motivo']
  },
  // `_5` (08/08) — la primera solapa de equivalencias de la planilla. Sigue la forma del
  // precedente `docs/PERSONAS_equivalencias.csv` —canónico / variante / dónde— adaptada al
  // caso: acá el "canónico" es el `ID Cuentas` de la base y la "variante" es como lo escribe
  // el temario.
  //
  // ⚠ **La escribe una persona, nunca el cargador** (`B.2`). El cargador la **lee**: si
  // resolviera solo y guardara lo que adivinó, el error se repetiría cada semana con más
  // confianza y dejaría de ser detectable. Un match por similitud es una hipótesis buena; una
  // fila acá es una afirmación que nadie va a volver a mirar.
  //
  // **La convención que se elija acá la van a heredar las siguientes** — es la primera.
  CAMPANAS_equivalencias: {
    headers: ['variante_temario', 'id_cuentas', 'nombre_en_la_base', 'confirmada_por', 'notas']
  },
  // `_11` Fase 2 de `D-23` (09/08) — el registro de láminas. Es `SOLAPAS` del lado del deck:
  // una fila por lámina de cada plantilla, con su identidad sellada en las notas del orador.
  //
  // **`cobertura`, no `estado`** (`11.1` §1). `SECCIONES` ya tiene una columna `estado` y
  // responde otra pregunta: aquélla es de **ejecución** —¿esta sección se emite?—, ésta es de
  // **cobertura** —¿los tokens de esta lámina tienen fuente validada?—. Valores: `cerrada`,
  // `parcial`, `abierta`. **`falta` sí se comparte** con `SECCIONES`, porque ahí significa lo
  // mismo en las dos: qué le falta a esa fila para estar completa. Se renombra donde la
  // semántica difiere, se comparte donde coincide.
  //
  // ⚠ **`orden_plantilla` es reportado, NUNCA autoritativo** (`A.2`). Está para que una
  // persona ubique la lámina en el deck. **Nada del motor puede decidir en base a ese número**:
  // insertar una lámina antes corre todos los de abajo, y es exactamente lo que rompió
  // `LAMINAS_CONGELADAS_` cuando guardaba números (`PLAN.md` §2). La identidad es `lamina_id`.
  //
  // **`escondida` se refleja, no se decide** (`B.3`): sale de `isSkipped()` y ninguna decisión
  // del motor puede depender de ella. Esconder o mostrar desde el motor **no está autorizado**
  // (`C-01` addendum 1).
  //
  // `seccion_id`, `modo`, `itera_sobre` y `filtro` vacíos significan **hereda de `SECCIONES`**,
  // no "sin declarar" (`PLAN.md` §2: las dos son configuración, celda vacía = hereda).
  LAMINAS: {
    headers: ['lamina_id', 'informe_id', 'seccion_id', 'orden_plantilla', 'escondida', 'origen',
      'modo', 'itera_sobre', 'filtro', 'rol', 'cobertura', 'falta', 'notas']
  }
};

// Columnas nuevas que Paso 0.5 suma sobre un esquema ya instalado. Si la hoja
// ya existe (sea del esquema viejo o nuevo), se asegura cada columna por nombre
// en su posición sin recrear la hoja ni tocar las filas ya cargadas.
var COLUMNAS_DELTA_ = {
  MARCADORES: [
    { nombre: 'periodo_ref', indice: 6 },
    // Orden importa: solapa se inserta antes de valor_fijo porque corre
    // primero en el forEach — desplaza campo_logico/periodo_ref/calculo una
    // posición, y valor_fijo asume esa posición ya corrida (ver DOC-2 Parte A).
    { nombre: 'solapa', indice: 5 },
    { nombre: 'valor_fijo', indice: 9 },
    // Filtro declarativo (08/08) — **al final del array a propósito**, por lo mismo que
    // explica la nota de `CAMPANAS`: las entradas se evalúan en orden y cada una asume el
    // esquema del momento en que corre. Entra por el delta y NO por la rama que reescribe
    // la fila 1, que habría pisado las 19 filas curadas.
    //
    // ⚠ **La columna terminó en el índice 9, entre `valor_fijo` y `formato`, no en el 10.**
    // Medido en la hoja viva después de aplicar: `… valor_fijo · filtro · formato · notas`.
    // El índice se cuenta sobre el esquema del momento, y `valor_fijo` acababa de insertar
    // en 9. **No importa —todo se lee por nombre, nunca por posición— y se deja como quedó**
    // en vez de moverla: mover una columna de una hoja curada por una preferencia estética
    // es exactamente el riesgo que `COLUMNAS_DELTA_` existe para evitar.
    { nombre: 'filtro', indice: 10 },
    // `LISTA` (08/08) — las dos van **al final del array**, por lo mismo que explica la nota
    // de `filtro` de arriba: cada entrada asume el esquema del momento en que corre, y una
    // entrada nueva adelante correría los índices de las que ya están.
    //
    // **Por qué dos columnas y no un valor adentro de la operación:** `R-18` vale para
    // cualquier lista `DISTINCT`, no sólo barrios, y la segunda categoría va a tener otro
    // catálogo y puede tener otro separador. Una operación con `rdv/Comunas` o con `', '`
    // adentro sirve para un token y para ninguno más — es exactamente lo que `D-01` mide.
    // `catalogo` se declara como `base/solapa`; `separador` vacío = `', '`.
    { nombre: 'catalogo', indice: 12 },
    { nombre: 'separador', indice: 13 }
  ],
  CAMPANAS: [
    { nombre: 'desde', indice: 6 },
    { nombre: 'hasta', indice: 7 },
    // Paso 2.15 Parte B (D-08/D-19): va AL FINAL del array aunque la columna quede
    // primera. Las entradas se evalúan en orden en el forEach de aplicarInstalacion_:
    // una entrada nueva adelante correría los índices 6 y 7 de las que ya están, que
    // asumen el esquema previo (mismo caso que documenta la nota de MARCADORES).
    { nombre: 'periodo_id', indice: 1 }
  ],
  // Paso 2.15 Parte B: REUNIONES entra al delta ANTES de que su `headers` gane
  // `periodo_id`. Sin esto cae en la rama `else` de aplicarInstalacion_, que reescribe
  // la fila 1 con los encabezados nuevos y NO mueve los datos: encabezados corridos
  // sobre siete filas curadas a mano, en silencio. Efecto buscado y verificado en la
  // Parte 0: deja de recibir la reescritura de encabezados en cada corrida.
  REUNIONES: [
    { nombre: 'periodo_id', indice: 1 }
  ],
  BASES: [
    { nombre: 'fila_encabezado', indice: 5 },
    { nombre: 'modo_periodo', indice: 6 }
  ],
  MAPEO: [
    { nombre: 'solapa', indice: 2 },
    // Paso 2.7 Parte F: se inserta antes de `notas` (que para MAPEO instalado sin
    // este delta está en la columna 6 antes de correr esto).
    { nombre: 'tipo_esperado', indice: 6 },
    // Paso 2.16: al FINAL del array, como la de CAMPANAS en el 2.15 — las entradas se
    // evalúan en orden y una nueva adelante correría los índices de las que ya están.
    // Índice 7 = antes de `notas`, que con `tipo_esperado` ya presente está en la 7.
    { nombre: 'valores_incluidos', indice: 7 }
  ],
  // Paso 2.7 Parte A: `origen` se inserta después de `uso` (columna 3) para una
  // hoja SOLAPAS instalada con el esquema del Paso 2.6, que todavía no la tenía.
  // Paso 2.10 Parte B: `filas_crudas` se inserta antes de `notas` — sea cual sea
  // el estado previo de la hoja, `origen` (si falta) ya corrió antes en este mismo
  // forEach y corrió `notas` a su posición final, así que el índice de acá asume
  // esquema con `origen` ya presente.
  SOLAPAS: [
    { nombre: 'origen', indice: 4 },
    { nombre: 'filas_crudas', indice: 8 },
    // `R-19` (08/08) — el piso de la capa 3, **al final del array** por lo mismo que explican
    // las notas de `MARCADORES` y `CAMPANAS`: cada entrada asume el esquema del momento.
    //
    // ⚠ **Nace vacía en todas las filas, y vacío significa SIN CHEQUEO.** No es un descuido:
    // el piso lo fija una persona que conoce la fuente, editando la celda y **sin tocar
    // código**. Sembrarla con un número inventado convertiría una corrida buena en un fallo el
    // día que la fuente encoja por un motivo legítimo.
    { nombre: 'filas_minimas', indice: 9 },
    // `_23` (10/08) — **al final del array y con índice 10**, por lo mismo que las anteriores:
    // cada entrada asume el esquema del momento, y para cuando ésta corre `filas_minimas` ya
    // ocupa la 9 y `notas` corrió a la 10. `insertColumnBefore(10)` la deja antes de `notas`,
    // que es la convención de toda la hoja.
    //
    // Nace vacía en las 100 y pico de filas, y **vacío significa «esta solapa tiene su propia
    // fecha»** — el estado de todas hasta hoy. La única que nace con valor es `looker/DIGITAL`,
    // porque no tiene ninguna columna temporal (`C-19`).
    { nombre: 'ventana_ref', indice: 10 },
    // `_44` (`D-30`) — **índice 11 y al final del array**, por la misma razón que las tres
    // anteriores: cada entrada asume el esquema del momento en que corre, y para cuando ésta
    // corre `ventana_ref` ya ocupa la 10 y `notas` corrió a la 11. `insertColumnBefore(11)` la
    // deja antes de `notas`, que es la convención de toda la hoja.
    //
    // Nace vacía en las 100 y pico de filas, y **vacío significa «esta solapa no se selecciona
    // por cuenta»** — el estado de todas hasta hoy, incluidas las de `digital`, que tienen su
    // propia rama en `datosDeMarcador_` y no pasan por ésta.
    { nombre: 'campo_id_cuenta', indice: 11 }
  ],
  // Paso 3 (v3) Parte B (D-20) — `SECCIONES` entra al delta **antes** de que su `headers`
  // gane `periodo_ref`, y esto no es una preferencia de estilo: sin entrada acá, la hoja
  // cae en la rama `else` de `aplicarInstalacion_`, que reescribe la fila 1 con
  // `HOJAS_CONFIG_.SECCIONES.headers` **sin mover los datos**. Con una columna nueva en esa
  // lista, eso corre todos los encabezados una posición sobre **34 filas curadas a mano**,
  // en silencio y sin fallar. Es el mismo modo de falla que midió el `Paso-2.15` en su 0.2
  // para `CAMPANAS`/`REUNIONES`.
  //
  // Índice 14 = **antes de `notas`**, que es la convención que ya usan
  // `MAPEO.valores_incluidos` y `SOLAPAS.filas_crudas`: `notas` queda siempre última.
  //
  // Se llama `periodo_ref` y NO `periodo_id`, a propósito y en contra de lo que podría
  // sugerir el paralelo con `CAMPANAS`/`REUNIONES`: son **opuestos**. `periodo_id` vacío
  // significa que la fila **no entra a ningún informe** (`D-19`); `periodo_ref` vacío
  // significa que la sección **usa el eslabón siguiente** de la cadena (`D-20`). Además
  // apunta a `PERIODOS` igual que `MARCADORES.periodo_ref`, que es el eslabón de arriba.
  //
  // `A.10`/`B.2` de las once respuestas (07/08) — `items_por_lamina` entra por el mismo
  // camino y por el mismo motivo: la hoja tiene 34 filas curadas a mano y la rama `else`
  // reescribiría la fila 1 corriendo todos los encabezados una posición, en silencio.
  // `indice: 15` = **antes de `notas`**, que sigue siendo siempre la última.
  //
  // Declara **cuántos ítems entran en una lámina** de una sección repetible. Vacío = el
  // comportamiento de hoy, una lámina por ítem. **Nadie la consume todavía**: es la entrada
  // de `T2.10`, que no está implementado ni aprobado.
  SECCIONES: [
    { nombre: 'periodo_ref', indice: 14 },
    { nombre: 'items_por_lamina', indice: 15 }
  ]
};

/**
 * Paso 2.11 Parte C — núcleo de `instalar()`, sin `alert()`: crea/repara hojas y corre
 * las migraciones one-off, y DEVUELVE el resultado en vez de mostrarlo. `instalar()`
 * (el ítem de menú) es ahora un wrapper de una línea; `menuAplicarConfiguracion_()`
 * llama a este núcleo directo para poder combinar su resultado con el de los otros tres
 * sembradores en un solo reporte, sin cuatro `alert()` en cadena.
 */
function aplicarInstalacion_(aplicar) {
  aplicar = (aplicar !== false);
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var creadas = [];
  var actualizadas = [];

  if (!aplicar) {
    // C.2-3: en modo cálculo no se crea ni repara nada — solo se simulan las
    // migraciones, que es lo que "Estado de configuración" necesita ver.
    creadas = [];
    actualizadas = [];
  } else Object.keys(HOJAS_CONFIG_).forEach(function (nombre) {
    var def = HOJAS_CONFIG_[nombre];
    var hoja = ss.getSheetByName(nombre);

    if (!hoja) {
      // Paso 2.11 Parte A: solo encabezados. Las filas de datos las escribe el
      // sembrador de esa hoja (seedConfiguracion(), sembrarClasificacionSolapas(),
      // sembrarSecciones_(), o uno de los SEED_* de más abajo) — no HOJAS_CONFIG_.
      hoja = ss.insertSheet(nombre);
      hoja.getRange(1, 1, 1, def.headers.length).setValues([def.headers]);
      hoja.setFrozenRows(1);
      creadas.push(nombre);
      return;
    }

    var delta = COLUMNAS_DELTA_[nombre];
    if (delta) {
      // Hoja preexistente con posible esquema viejo: solo insertar las
      // columnas que falten, sin pisar encabezados ni filas ya cargadas.
      var agregoColumna = false;
      delta.forEach(function (columna) {
        if (asegurarColumna_(hoja, columna.nombre, columna.indice)) {
          agregoColumna = true;
        }
      });
      if (agregoColumna) actualizadas.push(nombre);
    } else {
      hoja.getRange(1, 1, 1, def.headers.length).setValues([def.headers]);
      actualizadas.push(nombre);
    }
  });

  // C.2-3 — las migraciones dejaron de ser un contador opaco: cada una devuelve sus
  // `cambios` (clave, columna, anterior, nuevo, y `pisaManual` cuando corresponde) para
  // que salgan en el diff con `tipo = migracion`, igual que un cambio normal. Con
  // `aplicar = false` calculan sin escribir, que es lo que usa "Estado de configuración"
  // para incluir las migraciones pendientes sin aplicarlas.
  var vacia = { cambios: [] };
  var hojaMapeo = ss.getSheetByName('MAPEO');
  var backfill = hojaMapeo ? backfillSolapaMapeo_(hojaMapeo, aplicar) : { rellenadas: 0, sinHoja: [], cambios: [] };
  var alcanceObsoleto = hojaMapeo ? eliminarMapeoAlcanceDigitalObsoleto_(hojaMapeo, aplicar) : vacia;
  var lookerMapeo = hojaMapeo ? alinearMapeoLookerADinamico_(hojaMapeo, aplicar) : vacia;

  var hojaSolapas = ss.getSheetByName('SOLAPAS');
  var lookerSolapas = hojaSolapas ? alinearSolapasLookerADinamico_(hojaSolapas, aplicar) : vacia;
  // corregirNotaControlAnclaje_ retirada (Paso 2.11 C.2, 01/08/2026): SEED_SOLAPAS_ ya
  // trae la nota completa de digital/RDV JM 2 VECES, y la migración —que comparaba
  // contra su propia constante vieja, más corta— la revertía en cada corrida: el diff
  // reportaba el mismo cambio para siempre y el paso 4 del protocolo no podía pasar.
  // reclasificarSolapasM2Invertidas_ retirada (Paso 2.12 Parte 3, 02/08/2026): la
  // clasificación de `m2/M2 Directa` y `m2/M2 digital` la sostiene ahora `SEED_SOLAPAS_`
  // (`ignorar`, Parte 2), y esta migración las forzaba a `revisar` en cada corrida —
  // ping-pong permanente con el sembrador. La función no se borra; ver su encabezado.
  // Sale también de la lista de `migraciones` y del resumen: una migración que ya no
  // corre no puede seguir figurando entre las activas, aunque reporte cero.

  var hojaBases = ss.getSheetByName('BASES');
  var lookerBases = hojaBases ? alinearBasesHojaDefaultLooker_(hojaBases, aplicar) : vacia;

  var hojaMarcadores = ss.getSheetByName('MARCADORES');
  var operacion = hojaMarcadores ? migrarCalculoAOperacion_(hojaMarcadores, aplicar) : vacia;

  if (aplicar) limpiarHojaPorDefecto_(ss);

  // Cada migración con la hoja sobre la que escribe y un nombre corto para el reporte.
  var migraciones = [
    { hoja: 'MAPEO', nombre: 'backfill de solapa', cambios: backfill.cambios },
    { hoja: 'MAPEO', nombre: 'alcance digital obsoleto', cambios: alcanceObsoleto.cambios },
    { hoja: 'MAPEO', nombre: 'looker a dinamico (S-01)', cambios: lookerMapeo.cambios },
    { hoja: 'SOLAPAS', nombre: 'looker a dinamico (S-01)', cambios: lookerSolapas.cambios },
    { hoja: 'BASES', nombre: 'looker hoja_default (S-01)', cambios: lookerBases.cambios },
    { hoja: 'MARCADORES', nombre: 'calculo a operacion', cambios: operacion.cambios }
  ];

  return {
    creadas: creadas,
    actualizadas: actualizadas,
    backfill: backfill,
    eliminadasAlcance: alcanceObsoleto.cambios.length,
    movidasLooker: lookerMapeo.cambios.length / 2,
    tocadasSolapasLooker: lookerSolapas.cambios.length,
    alineoHojaDefaultLooker: lookerBases.cambios.length > 0,
    migroOperacion: operacion.cambios.length > 0,
    migraciones: migraciones
  };
}

/**
 * C.2-3 — convierte las migraciones a filas de `DIFF_CONFIGURACION`, con
 * `tipo = migracion` o `tipo = migracion (pisa manual)`. Una migración PUEDE escribir
 * sobre una fila `origen=manual` —para eso existe—, pero entonces lo dice: lo que no
 * puede pasar es que la misma fila salga como `protegida` y quede modificada igual.
 */
function filasDiffMigraciones_(migraciones) {
  var filas = [];
  (migraciones || []).forEach(function (m) {
    (m.cambios || []).forEach(function (c) {
      filas.push([
        m.hoja,
        c.pisaManual ? 'migracion (pisa manual)' : 'migracion',
        c.clave + '  [' + m.nombre + ']',
        c.columna,
        c.anterior === undefined ? '' : c.anterior,
        c.nuevo === undefined ? '' : c.nuevo
      ]);
    });
  });
  return filas;
}

/** Claves que una migración tocó en esa hoja, para no reportarlas como `protegida` a secas. */
function clavesTocadasPorMigracion_(migraciones, nombreHoja) {
  var set = {};
  (migraciones || []).forEach(function (m) {
    if (m.hoja !== nombreHoja) return;
    (m.cambios || []).forEach(function (c) { set[c.clave] = true; });
  });
  return set;
}

/**
 * Paso 2.11 Parte C — texto del resumen de `aplicarInstalacion_()`, separado para que
 * lo use tanto `instalar()` (su propio `alert()`) como `menuAplicarConfiguracion_()`
 * (un bloque más dentro del reporte combinado).
 */
function formatearResumenInstalacion_(r) {
  // C.2-2 tarea 3: "actualizada" tenía dos sentidos en la misma lista. Lo que hace
  // `instalar()` es verificar/reparar ESTRUCTURA (encabezados, columnas nuevas) — que
  // REUNIONES/VALORES/VALORES_DIVERGENTES aparecieran junto a hojas con cambios de
  // contenido daba a entender que se les había tocado un dato, y no es así. Los cambios
  // de contenido son las líneas del diff, no esta lista.
  return 'Hojas creadas: ' + (r.creadas.length ? r.creadas.join(', ') : 'ninguna') +
    '\nHojas verificadas/reparadas por instalar() (estructura, no contenido): ' +
    (r.actualizadas.length ? r.actualizadas.join(', ') : 'ninguna') +
    (r.backfill.rellenadas ? '\nMAPEO.solapa completada en ' + r.backfill.rellenadas + ' fila(s) desde MAPEO.hoja' : '') +
    (r.backfill.sinHoja.length
      ? '\n⚠️ MAPEO sin "hoja" cargada, no se pudo determinar solapa: ' + r.backfill.sinHoja.join(', ')
      : '') +
    (r.eliminadasAlcance ? '\nMAPEO: eliminada(s) ' + r.eliminadasAlcance + ' fila(s) digital/Digital/alcance (col E era Fecha de inicio, Paso 2.8/2.9)' : '') +
    (r.movidasLooker ? '\nMAPEO: ' + r.movidasLooker + ' fila(s) de looker alineadas a resumen_metricas_dinamico (S-01, Paso 2.9 Parte C)' : '') +
    (r.tocadasSolapasLooker ? '\nSOLAPAS: looker resumen_metricas_dinamico=fuente / resumen_metricas=derivada (S-01)' : '') +
    (r.alineoHojaDefaultLooker ? '\nBASES: looker.hoja_default = resumen_metricas_dinamico (S-01)' : '') +
    (r.migroOperacion ? '\nMARCADORES.calculo renombrada a operacion (valores conservados)' : '');
}

function instalar() {
  var resultado = aplicarInstalacion_();
  var ui = ui_();
  var texto = formatearResumenInstalacion_(resultado);
  ui.alert('Instalación completa', texto, ui.ButtonSet.OK);
  return texto;
}

/**
 * Paso 2.8 Parte A — migración idempotente: borra la fila digital/Digital/alcance
 * de MAPEO si existe. Esa fila salía del ejemplo sembrado por HOJAS_CONFIG_.MAPEO
 * al crear la hoja de cero (ya corregido arriba) y nunca estuvo en SEED_MAPEO_, así
 * que `seedConfiguracion()` no la iba a pisar ni a borrar por su cuenta. La columna
 * E de esa solapa es "Fecha de inicio" (`dig_fecha_inicio`), no alcance —
 * confirmado por `auditarAlcanceDigital_()` (Paso 2.7 Parte B); el alcance real de
 * digital ya está mapeado en `digital/Alcance/alc_alcance`. Si la fila no está
 * (ya se borró, o la hoja es nueva), no hace nada.
 */
// Paso 2.9 Parte E: comparación tolerante a mayúsculas/acentos/espacios
// (`normalizar_`, Parseo.gs) — el reporte del Paso 2.8 mostró la fila viva con
// `columna` vacía después de correr la migración anterior, señal de que el
// match exacto (`===`) no la encontró (probablemente espacios sueltos cargados
// a mano en algún momento).
function eliminarMapeoAlcanceDigitalObsoleto_(hoja, aplicar) {
  aplicar = (aplicar !== false);
  var datos = hoja.getDataRange().getValues();
  var headers = datos[0];
  var idxBaseId = headers.indexOf('base_id');
  var idxSolapa = headers.indexOf('solapa');
  var idxCampo = headers.indexOf('campo_logico');
  if (idxBaseId === -1 || idxSolapa === -1 || idxCampo === -1) return { eliminadas: 0, cambios: [] };

  var cambios = [];
  // De abajo hacia arriba y sin cortar en el primer match: si quedó más de una
  // fila duplicada (p. ej. de una corrida anterior de la migración que solo
  // borraba la primera), esta versión las borra todas en la misma corrida.
  for (var f = datos.length - 1; f >= 1; f--) {
    if (normalizar_(datos[f][idxBaseId]) === 'digital' &&
        normalizar_(datos[f][idxSolapa]) === 'digital' &&
        normalizar_(datos[f][idxCampo]) === 'alcance') {
      cambios.push({
        clave: 'digital||digital||alcance', columna: '(fila entera)',
        anterior: 'presente en la fila ' + (f + 1), nuevo: '(eliminada)'
      });
      if (aplicar) hoja.deleteRow(f + 1);
    }
  }
  return { eliminadas: cambios.length, cambios: cambios };
}

/**
 * Paso 2.9 Parte C — S-01: la fuente de `looker` es `resumen_metricas_dinamico`
 * (`=QUERY(Cuentas!A2:G; ...)`, consulta viva sobre `Cuentas`), no `resumen_metricas`
 * (pegado de valores que devolvió 899 de 903 filas sin fecha). Esto invierte la
 * decisión del Paso 2.8 Parte C, que había leído "tiene fórmulas = derivada" sin
 * contemplar que la fórmula puede consultar una TERCERA hoja en vez de derivar de
 * la otra — ver docs/SUPUESTOS.md S-01.
 *
 * Reemplaza a `moverFechaPeriodoLookerAResumenMetricas_` (Paso 2.8 Parte B), que
 * movía en sentido contrario y, si seguía corriendo en cada `instalar()`, iba a
 * revertir esta decisión sola en la próxima instalación. Mueve TODAS las filas de
 * `MAPEO` de looker que cuelgan de `resumen_metricas` de vuelta a
 * `resumen_metricas_dinamico` (no solo `fecha_periodo`) — no toca `columna`: las
 * dos hojas tienen el mismo orden de columnas. Idempotente: en una instalación ya
 * alineada no mueve nada.
 */
function alinearMapeoLookerADinamico_(hoja, aplicar) {
  aplicar = (aplicar !== false);
  var datos = hoja.getDataRange().getValues();
  var headers = datos[0];
  var idxBaseId = headers.indexOf('base_id');
  var idxSolapa = headers.indexOf('solapa');
  var idxHoja = headers.indexOf('hoja');
  var idxCampo = headers.indexOf('campo_logico');
  if (idxBaseId === -1 || idxSolapa === -1 || idxHoja === -1) return { movidas: 0, cambios: [] };

  var cambios = [];
  for (var f = 1; f < datos.length; f++) {
    if (datos[f][idxBaseId] === 'looker' && datos[f][idxSolapa] === 'resumen_metricas') {
      var clave = 'looker||resumen_metricas||' + (idxCampo === -1 ? '?' : datos[f][idxCampo]);
      cambios.push({ clave: clave, columna: 'solapa', anterior: 'resumen_metricas', nuevo: 'resumen_metricas_dinamico' });
      cambios.push({ clave: clave, columna: 'hoja', anterior: datos[f][idxHoja], nuevo: 'resumen_metricas_dinamico' });
      if (aplicar) {
        hoja.getRange(f + 1, idxSolapa + 1).setValue('resumen_metricas_dinamico');
        hoja.getRange(f + 1, idxHoja + 1).setValue('resumen_metricas_dinamico');
      }
    }
  }
  return { movidas: cambios.length / 2, cambios: cambios };
}

/**
 * Paso 2.9 Parte C, punto 1 — mismo criterio que `alinearMapeoLookerADinamico_`
 * pero sobre `SOLAPAS`: `resumen_metricas_dinamico` → `fuente`,
 * `resumen_metricas` → `derivada`. Idempotente.
 *
 * **Paso 2.11 Parte E (01/08/2026): dejó de escribir `notas` y `origen` pasó de
 * `manual` a `seed`.** El `origen=manual` se puso cuando `SEED_SOLAPAS_` todavía
 * mandaba estas dos filas a `revisar` — hoy el seed ya dice `fuente`/`derivada`
 * (`SEED_SOLAPAS_`, filas de `looker`), así que la protección no protegía nada y su
 * único efecto vivo era **congelar la peor versión de las notas**: la migración
 * escribía una corta, el seed quería las concretas, y `aplicarClasificacionSolapas_`
 * saltea toda fila `origen=manual` sin escribirla. Resultado: dos líneas
 * `protegida (habría cambiado)` sobre `notas` en cada corrida, para siempre.
 *
 * Con `origen: 'seed'`, la fila vuelve al sembrador: emite **una** línea de cambio
 * auditable (`origen: manual → seed`) y en la corrida siguiente el seed adopta las
 * dos filas con sus notas buenas. S-01 no queda sin sostén — pasa a sostenerlo
 * `SEED_SOLAPAS_`, que es el objetivo del Paso 2.11. Es el criterio de migración con
 * vencimiento de la Parte D: la que produce un estado que el seed ya sabe reproducir
 * deja de hacer falta.
 */
function alinearSolapasLookerADinamico_(hoja, aplicar) {
  aplicar = (aplicar !== false);
  var existentes = leerFilasSolapas_(hoja);
  var cambios = [];

  // C.2-3 (01/08/2026): antes escribía las tres celdas SIEMPRE, sin comparar, y
  // devolvía `tocadas=2` en cada corrida — por eso S-01 aparecía en el resumen de todas
  // las corridas del protocolo sin que se pudiera saber si estaba escribiendo algo o no.
  // Es el mismo vicio que la Parte C ya le sacó a `upsertPorClave_`: "escribí" sin
  // distinguir "escribí algo distinto". Ahora compara, y solo emite línea si cambia.
  [
    { clave: 'looker||resumen_metricas_dinamico', uso: 'fuente' },
    { clave: 'looker||resumen_metricas', uso: 'derivada' }
  ].forEach(function (caso) {
    var fila = existentes[caso.clave];
    if (!fila) return;
    // `origen === 'manual'` acá no distingue por sí solo si lo puso una persona o esta
    // misma migración en una corrida anterior; lo que decide es que además haya algo
    // distinto de lo que la migración quiere escribir.
    var eraManual = (fila.origen === 'manual');
    // `notas` NO va acá a propósito: es del seed (ver encabezado). Escribirla desde
    // dos lados es la duplicación que este paso elimina.
    var deseado = { uso: caso.uso, origen: 'seed' };
    Object.keys(deseado).forEach(function (columna) {
      if (String(fila[columna] === undefined ? '' : fila[columna]) === String(deseado[columna])) return;
      cambios.push({
        clave: caso.clave, columna: columna,
        anterior: fila[columna], nuevo: deseado[columna],
        pisaManual: eraManual
      });
      if (aplicar) hoja.getRange(fila.fila, fila.idx[columna] + 1).setValue(deseado[columna]);
    });
  });

  return { tocadas: cambios.length, cambios: cambios };
}

/**
 * Paso 2.9 Parte C, punto 3 — `BASES.hoja_default` de looker vuelve a
 * `resumen_metricas_dinamico`. Idempotente.
 */
function alinearBasesHojaDefaultLooker_(hoja, aplicar) {
  aplicar = (aplicar !== false);
  var datos = hoja.getDataRange().getValues();
  var headers = datos[0];
  var idxBaseId = headers.indexOf('base_id');
  var idxHojaDefault = headers.indexOf('hoja_default');
  if (idxBaseId === -1 || idxHojaDefault === -1) return { tocada: false, cambios: [] };

  for (var f = 1; f < datos.length; f++) {
    if (datos[f][idxBaseId] === 'looker' && datos[f][idxHojaDefault] !== 'resumen_metricas_dinamico') {
      if (aplicar) hoja.getRange(f + 1, idxHojaDefault + 1).setValue('resumen_metricas_dinamico');
      return {
        tocada: true,
        cambios: [{
          clave: 'looker', columna: 'hoja_default',
          anterior: datos[f][idxHojaDefault], nuevo: 'resumen_metricas_dinamico'
        }]
      };
    }
  }
  return { tocada: false, cambios: [] };
}

/**
 * Paso 2.9 Parte C.5 — SOLAPAS tenía la clasificación de `m2` invertida: `M2 Directa`
 * / `M2 digital` (26 / 67 filas, notas "acumulados") en `uso=fuente`, y `M2 periodo
 * DIRECTA` / `M2 periodo DIGITAL` (29.533 / 2.413 filas) en `uso=derivada`. Una vista
 * filtrada no puede tener mil veces más filas que su origen — misma inversión que
 * tuvo `looker` (S-01). No se decide sola acá: pasan a `uso=revisar` con la nota de
 * sospecha, pendiente de que alguien confirme contra la base viva. Idempotente.
 *
 * Paso 2.10 Parte C — `M2 periodo DIRECTA`/`DIGITAL` SALIERON de esta lista: no era
 * una inversión, es un `GROUP BY id_cuenta` sobre `M2 Directa` con período tipeado a
 * mano (verificado: los 18 `ID` de la vista son exactamente los 18 `ID cuentas`
 * distintos de `M2 Directa`). `SEED_SOLAPAS_` ya las clasifica `referencia` junto con
 * las otras cuatro solapas "periodo" — si siguieran acá, esta función las volvería a
 * `revisar` en cada instalación y pisaría esa clasificación.
 */
/**
 * ⚠ SIN USO desde el 02/08/2026 (Paso 2.12 Parte 3) — sólo las lee
 * `reclasificarSolapasM2Invertidas_`, que salió de `aplicarInstalacion_`. No se borran:
 * son el registro de qué dos solapas estuvieron bajo sospecha de inversión y con qué nota.
 */
var SOLAPAS_M2_INVERTIDAS_ = ['M2 Directa', 'M2 digital'];
var NOTA_M2_INVERTIDA_ = 'clasificación invertida, pendiente de confirmar (Paso 2.9 Parte C.5)';

/**
 * ⚠ MIGRACIÓN EJECUTADA. Fuera de `aplicarInstalacion_` desde el 02/08/2026
 * (Paso 2.12 Parte 3). **No volver a cablearla sin retirar antes la clasificación de
 * `SEED_SOLAPAS_`**, o las dos se pisan en cada corrida.
 *
 * Por qué se retiró: la sospecha que la justificaba está resuelta. `M2 Directa` y
 * `M2 digital` pasaron a `ignorar` en `SEED_SOLAPAS_` (Paso 2.12 Parte 2) —`m2` quedó
 * `sin_fuente` en el Paso 2.10 Parte C, así que hoy no hay a qué engancharlas—, y esta
 * función las forzaba a `revisar` **antes** de que corriera el sembrador. Resultado: cuatro
 * líneas de `migracion` y dos de `cambio` en cada corrida, para siempre, con el estado
 * final igual. Es el patrón de `corregirNotaControlAnclaje_`, retirada en el Paso 2.11
 * C.2 por romper la idempotencia.
 *
 * **El razonamiento ya estaba hecho y se había aplicado a la mitad del caso.** El
 * comentario de arriba (Paso 2.10 Parte C) explica que `M2 periodo DIRECTA`/`DIGITAL`
 * salieron de `SOLAPAS_M2_INVERTIDAS_` porque *"si siguieran acá, esta función las
 * volvería a `revisar` en cada instalación y pisaría esa clasificación"*. Exactamente eso
 * es lo que pasaba con el par que quedó en la lista, desde que la Parte 2 le dio una
 * clasificación al seed.
 */
function reclasificarSolapasM2Invertidas_(hoja, aplicar) {
  aplicar = (aplicar !== false);
  var existentes = leerFilasSolapas_(hoja);
  var cambios = [];

  SOLAPAS_M2_INVERTIDAS_.forEach(function (nombreSolapa) {
    var clave = 'm2||' + nombreSolapa;
    var fila = existentes[clave];
    if (!fila) return;
    if (fila.uso === 'revisar' && fila.notas === NOTA_M2_INVERTIDA_) return; // ya aplicado

    var eraManual = (fila.origen === 'manual');
    if (String(fila.uso) !== 'revisar') {
      cambios.push({ clave: clave, columna: 'uso', anterior: fila.uso, nuevo: 'revisar', pisaManual: eraManual });
    }
    if (String(fila.notas) !== NOTA_M2_INVERTIDA_) {
      cambios.push({ clave: clave, columna: 'notas', anterior: fila.notas, nuevo: NOTA_M2_INVERTIDA_, pisaManual: eraManual });
    }
    if (aplicar) {
      hoja.getRange(fila.fila, fila.idx.uso + 1).setValue('revisar');
      hoja.getRange(fila.fila, fila.idx.notas + 1).setValue(NOTA_M2_INVERTIDA_);
    }
  });

  return { tocadas: cambios.length, cambios: cambios };
}

/**
 * DOC-2 Parte A — migración idempotente `calculo` → `operacion` en MARCADORES.
 * Renombra el encabezado **en su lugar** (misma columna, mismos valores
 * cargados): no crea una columna nueva al lado, que dejaría dos verdades. Si
 * la hoja ya dice `operacion`, no hace nada; si nunca tuvo `calculo` (hoja
 * instalada de cero con el esquema nuevo), tampoco.
 */
function migrarCalculoAOperacion_(hoja, aplicar) {
  aplicar = (aplicar !== false);
  var ultimaColumna = Math.max(hoja.getLastColumn(), 1);
  var headers = hoja.getRange(1, 1, 1, ultimaColumna).getValues()[0];
  var idxCalculo = headers.indexOf('calculo');
  if (idxCalculo === -1) return { migrada: false, cambios: [] }; // ya migrada o instalación nueva

  if (aplicar) hoja.getRange(1, idxCalculo + 1).setValue('operacion');
  return {
    migrada: true,
    cambios: [{ clave: '(encabezado)', columna: 'calculo', anterior: 'calculo', nuevo: 'operacion' }]
  };
}

/**
 * Paso 2.3.2 — backfill de la columna `solapa` en MAPEO. Regla: `solapa` toma el
 * mismo valor que `hoja` de esa fila — es el dato real de qué solapa mapea esa
 * fila, ya cargado por el Paso 2.3 (incluidas las filas `dig_*`/`mail_*`/`sms_*`,
 * que ya apuntaban a su solapa real, no a `hoja_default`). Nunca cae a
 * `hoja_default`: una fila sin `hoja` cargada queda sin `solapa` y se reporta,
 * no se adivina (ver Paso-2.3.2.md, sección A). Idempotente: no toca filas que
 * ya tengan `solapa`.
 */
function backfillSolapaMapeo_(hoja, aplicar) {
  aplicar = (aplicar !== false);
  var datos = hoja.getDataRange().getValues();
  var headers = datos[0];
  var idxBaseId = headers.indexOf('base_id');
  var idxSolapa = headers.indexOf('solapa');
  var idxHoja = headers.indexOf('hoja');
  var idxCampo = headers.indexOf('campo_logico');
  if (idxSolapa === -1 || idxHoja === -1) return { rellenadas: 0, sinHoja: [], cambios: [] };

  var cambios = [];
  var sinHoja = [];

  for (var f = 1; f < datos.length; f++) {
    var fila = datos[f];
    if (!fila[idxBaseId]) continue; // fila vacía
    if (fila[idxSolapa] !== '' && fila[idxSolapa] !== null && fila[idxSolapa] !== undefined) continue;

    var valorHoja = fila[idxHoja];
    if (!valorHoja) {
      sinHoja.push(fila[idxBaseId] + '/' + fila[idxCampo]);
      continue;
    }
    cambios.push({
      clave: fila[idxBaseId] + '||(sin solapa)||' + (idxCampo === -1 ? '?' : fila[idxCampo]),
      columna: 'solapa', anterior: '', nuevo: valorHoja
    });
    if (aplicar) hoja.getRange(f + 1, idxSolapa + 1).setValue(valorHoja);
  }

  return { rellenadas: cambios.length, sinHoja: sinHoja, cambios: cambios };
}

function asegurarColumna_(hoja, nombreColumna, indiceDestino) {
  var ultimaColumna = Math.max(hoja.getLastColumn(), 1);
  var headers = hoja.getRange(1, 1, 1, ultimaColumna).getValues()[0];
  if (headers.indexOf(nombreColumna) !== -1) return false; // ya existe, no duplicar

  hoja.insertColumnBefore(indiceDestino);
  hoja.getRange(1, indiceDestino).setValue(nombreColumna);
  return true;
}

function limpiarHojaPorDefecto_(ss) {
  ['Hoja 1', 'Sheet1'].forEach(function (nombre) {
    var hoja = ss.getSheetByName(nombre);
    if (hoja && ss.getSheets().length > 1 && hoja.getLastRow() === 0 && hoja.getLastColumn() === 0) {
      ss.deleteSheet(hoja);
    }
  });
}

/**
 * Paso 1.7 — seed de configuración inicial (BASES + MAPEO + CONFIG).
 * Ver docs/Prompts/Paso-1.7.md y Plan Inicial/_archivo/M2_mapeo_y_config.md.
 */

// Paso 2.11 Parte A — antes vivía en HOJAS_CONFIG_.INFORMES.ejemplos. 'jm'/'secco'
// son identificadores durables, referenciados en todo SEED_MAPEO_/SEED_SOLAPAS_ —
// misma categoría que BASES/MAPEO, se aplica con el mismo mecanismo (upsertPorClave_
// en seedConfiguracion()).
// 03/08/2026 — `plantilla_id` pasa a declararse acá, con el ID real. Antes iba vacío
// porque el reparto declarado en `docs/ESCRITORES.md` le daba esa columna al registro de
// plantillas (`registrarPlantillasDesdeCarpeta` → `clasificarArchivoPlantilla_`). Ese
// reparto no se sostiene, por dos razones medidas el 03/08:
//
//   1. `upsertPorClave_` reescribe la fila ENTERA cuando alguna columna declarada
//      cambia, y escribe '' en las que el seed no declara. Con el seed en '', cualquier
//      "Aplicar configuración" borraba el `plantilla_id` que el registro había cargado.
//      Es por eso que la hoja viva llegó al 03/08 con las dos celdas vacías pese a que
//      `repuntarPlantillaCanonicaJM_` había corrido el 30/07 (la plantilla obsoleta
//      quedó renombrada en Drive, que es su otra mitad).
//   2. El registro de plantillas NO ve la plantilla de JM: `DriveApp` no la lista al
//      recorrer la carpeta, aunque la abre bien por ID. Verificado el 03/08 por los dos
//      lados (Drive API `files.list` y `diagnosticarCarpetaPlantillas_`).
//
// Los IDs de recurso viven en los `SEED_*` — mismo criterio que `SEED_BASES_.sheet_id` y
// que `SEED_CONFIG_DEFAULTS_`. Lo que sale de acá es el ID cableado en `Armonizar.gs`,
// que sí era un consumidor leyendo una constante en vez de la hoja de registro.
//
// La obsoleta de JM (`1JrHvs_p…`) NO se declara: vive renombrada `[OBSOLETA — no usar]`
// en la subcarpeta `_backups` de la carpeta de plantillas, y ese nombre es su registro.
var SEED_INFORMES_ = [
  { informe_id: 'jm', nombre: 'Informe semanal JM', plantilla_id: '117I0qn1XP1JCiz2mU32hUY1iiMUmrAAvHOsczd7u6jI', periodicidad: 'semanal', familias: 'ecv,enc,m2,camp,mail,gcba,rrss', activo: 'sí', notas: '22 slides' },
  { informe_id: 'secco', nombre: 'Seguimiento SECCO-SSCDI', plantilla_id: '1_ZKjWhL-bhCP8yHQ8PJ33ymyjSXu3thh7MKMOxB4-n8', periodicidad: 'mensual', familias: 'ecv,et,emin,m2,camp,conv,rep,rrss', activo: 'sí', notas: '29 slides' }
];

var SEED_BASES_ = [
  { base_id: 'rdv', nombre: 'RDV JM CM ES + funcionarios', sheet_id: '1ZpHO6Ru1uY2r9WfBF_yFtu5z7ip7F3Q6VOoRJN5vLAo', hoja_default: 'RVD JM-CM - ES', fila_encabezado: 1, modo_periodo: 'filtrar', tipo: 'google_sheets', activo: 'sí', notas: 'Encuentros' },
  { base_id: 'digital', nombre: 'Seguimiento Digital', sheet_id: '1LadILzFpyCrZRapxgDOFOldSoRawjKkWMaFci_ilhPY', hoja_default: 'Seguimiento digital', fila_encabezado: 1, modo_periodo: 'snapshot', tipo: 'google_sheets', activo: 'sí', notas: 'Campaña por canal. Paso 2.3: snapshot — sus solapas usan fecha de inicio de campaña (lead 3-7 días), el recorte por período lo hace el agregador vía link campaña↔encuentro, no ventana de fecha cruda.' },
  { base_id: 'looker', nombre: 'Base Looker', sheet_id: '1t6Ji4Cd5lTeBEBBVIoIJUOWjvsOzWBDZmKN163rHKaQ', hoja_default: 'resumen_metricas_dinamico', fila_encabezado: 1, modo_periodo: 'filtrar', tipo: 'google_sheets', activo: 'sí', notas: 'Consolidado. Fuente = resumen_metricas_dinamico (S-01, Paso 2.9 Parte C, 31/07): QUERY() viva sobre Cuentas; resumen_metricas es un pegado que devolvió 899 de 903 filas sin fecha — DOC-3 Parte A cerrada.' },
  // Paso 2.10 Parte C: hoja_default vacío a propósito — 'M2 periodo DIRECTA' pasó a
  // uso=referencia (banner de período tipeado a mano, no una fuente). Un default que
  // apunta a una solapa no-fuente hacía que los diagnósticos genéricos (probarConexionBases,
  // probarLecturaPeriodo) "leyeran" igual esa vista sin avisar — vacío falla ⚠ y visible
  // en vez de silencioso. m2 queda sin fuente activa para m2_* (ver SOLAPAS_M2_INVERTIDAS_
  // más arriba y Paso-2.10_PartesBC_verificado.md §2.3): el catálogo 'Cuentas M2' se
  // sobrescribe cada semana sin historia, así que ni siquiera apuntando ahí resolvería
  // el período del informe. Los tokens m2_* de MARCADORES usan overrides de solapa, no
  // este default, y van a emitir «FALTA:token» hasta que se decida una fuente real.
  { base_id: 'm2', nombre: 'M2 Reporte para Fede 2026', sheet_id: '1_GS01-TXrhez0GlpFf4bUjWLNQPfaW9BOFFXz0hZNvY', hoja_default: '', fila_encabezado: 3, modo_periodo: 'snapshot', tipo: 'google_sheets', activo: 'sí', notas: 'Directa + Digital en hojas separadas. Sin hoja_default (Paso 2.10 Parte C): m2 sin fuente activa para m2_*.' },
  { base_id: 'miba', nombre: 'Integración MiBA', sheet_id: '', hoja_default: '', fila_encabezado: 1, modo_periodo: 'filtrar', tipo: 'google_sheets', activo: 'no', notas: 'Parqueada' }
];

var SEED_MAPEO_ = [
  // rdv — hoja 'RVD JM-CM - ES'
  { base_id: 'rdv', campo_logico: 'figura', hoja: 'RVD JM-CM - ES', columna: 'A', notas: 'filtro por figura' },
  { base_id: 'rdv', campo_logico: 'barrio', hoja: 'RVD JM-CM - ES', columna: 'B', notas: '' },
  { base_id: 'rdv', campo_logico: 'evento', hoja: 'RVD JM-CM - ES', columna: 'C', notas: '' },
  // DOC-2 Parte C: 'fecha' → 'fecha_periodo' (Paso 2.3.1/2.3.2; leerFuente ya no busca
  // 'fecha', solo 'fecha_periodo' — sin uso vivo que justifique dejar la fila vieja
  // derogada). Alineado con la selección congelada en docs/FECHAS_seleccion.md: columna
  // E, sin advertencias ("limpia").
  { base_id: 'rdv', campo_logico: 'fecha_periodo', hoja: 'RVD JM-CM - ES', columna: 'E', notas: 'filtro de período' },
  // Paso 2.16 dejó `valores_incluidos` VACÍO acá: con este diseño **declarar ES conectar**
  // —`leerFuente` aplica toda lista blanca declarada—, así que cargarla cambia en el acto
  // lo que ve *cualquier* lectura de `rdv`, no sólo el matcher de `Union.gs`.
  //
  // **Declarado el 03/08/2026, decisión del usuario, con el impacto medido antes y después**
  // (`contarLecturaBase_('rdv')`, ventana de `CONFIG` 26/06 → 03/07). El valor queda en
  // `Realizada`; si la base resulta estar desactualizada puede ser `En agenda`, y eso se
  // revisa después.
  //
  // Quién lee `rdv` por `leerFuente` y por lo tanto ve la lista: el matcher
  // (`encontrarFilaRdvDeReunion_`, `Union.gs`) y dos diagnósticos (`probarLecturaPeriodo`,
  // `diagnosticarBaseColapso_`).
  //
  // `T2.9.4` (07/08) — **el matcher ya no filtra por su cuenta**: filtraba dos veces por lo
  // mismo con `VALOR_STATUS_REALIZADA_` cableado, y esa constante se retiró. **Esta celda es
  // ahora el único lugar donde se decide qué status entra**, que es lo que se buscaba: se
  // cambia editando la hoja, no con `clasp push`.
  // Quién NO la ve, y es la asimetría a mirar en el paso del matcher:
  // `verificarPrecondicionAnclaje_` (`Union.gs`) lee la solapa con `getDataRange()` directo.
  { base_id: 'rdv', campo_logico: 'status', hoja: 'RVD JM-CM - ES', columna: 'I', valores_incluidos: 'Realizada', notas: 'lista blanca — ver D-21. El consumidor duplicado de Union.gs se retira en el paso del matcher' },
  { base_id: 'rdv', campo_logico: 'inscriptos', hoja: 'RVD JM-CM - ES', columna: 'K', notas: '(resuelto)' },
  { base_id: 'rdv', campo_logico: 'insc_mail', hoja: 'RVD JM-CM - ES', columna: 'L', notas: '' },
  { base_id: 'rdv', campo_logico: 'insc_cc', hoja: 'RVD JM-CM - ES', columna: 'M', notas: '' },
  { base_id: 'rdv', campo_logico: 'insc_ivr', hoja: 'RVD JM-CM - ES', columna: 'N', notas: '' },
  { base_id: 'rdv', campo_logico: 'insc_digital', hoja: 'RVD JM-CM - ES', columna: 'O', notas: 'header real "RRSS" — duda resuelta' },
  { base_id: 'rdv', campo_logico: 'insc_dif', hoja: 'RVD JM-CM - ES', columna: 'P', notas: '' },
  { base_id: 'rdv', campo_logico: 'asistentes', hoja: 'RVD JM-CM - ES', columna: 'Q', notas: '' },
  { base_id: 'rdv', campo_logico: 'comuna', hoja: 'RVD JM-CM - ES', columna: 'AA', notas: '' },
  { base_id: 'rdv', campo_logico: 'poblacion', hoja: 'RVD JM-CM - ES', columna: 'AB', notas: 'habitantes' },

  // looker — hoja 'resumen_metricas_dinamico' (Paso 2.9 Parte C, 31/07 — S-01,
  // docs/SUPUESTOS.md: es una QUERY() viva sobre 'Cuentas', no un derivado de
  // 'resumen_metricas'. Invierte la lectura del Paso 2.8 Parte C, que había tomado
  // "tiene fórmulas → derivada" al pie de la letra sin ver que la fórmula consulta
  // una TERCERA hoja — con eso, 'resumen_metricas_dinamico' es la que crece con
  // 'Cuentas' y 'resumen_metricas' el pegado que queda viejo (899 de 903 filas sin
  // fecha). Las dos hojas tienen el mismo orden de columnas
  // (`compararResumenesLooker_`, Solapas.gs), así que las letras no cambian.
  // Una fila por campaña; prefijos = canal, no familia.
  // DOC-3 Parte C: faltaba id_cuenta (col A) — clave de join con Seguimiento Digital
  // que el Paso 2.4 necesita. Sin prefijo de canal (a diferencia de dig_id_cuenta,
  // mail_id_cuenta, …): looker tiene una sola solapa, no seis, no hace falta desambiguar.
  { base_id: 'looker', campo_logico: 'id_cuenta', hoja: 'resumen_metricas_dinamico', columna: 'A', notas: 'join con Seguimiento Digital (Paso 2.4)' },
  { base_id: 'looker', campo_logico: 'campana', hoja: 'resumen_metricas_dinamico', columna: 'B', notas: '' },
  { base_id: 'looker', campo_logico: 'fecha_inicio', hoja: 'resumen_metricas_dinamico', columna: 'C', notas: '' },
  { base_id: 'looker', campo_logico: 'fecha_fin', hoja: 'resumen_metricas_dinamico', columna: 'D', notas: '' },
  // Paso 2.9 Parte D (S-02): 'fecha' es el contrato viejo — leerFuente() ya solo
  // busca 'fecha_periodo' (verificado: no hay ningún buscarMapeo(..., 'fecha')
  // en el código). No se borra la fila, se marca derogada para que quede
  // constancia de por qué existió (apuntaba a fecha_inicio, columna C).
  { base_id: 'looker', campo_logico: 'fecha', hoja: 'resumen_metricas_dinamico', columna: 'C', notas: 'DEROGADA — ver S-02' },
  // fecha_periodo (Paso 2.8 Parte B/C): la escribió promoverFechasElegidas() (Fechas.gs)
  // contra la elección congelada en FECHAS_seleccion.md — misma columna que 'fecha'.
  { base_id: 'looker', campo_logico: 'fecha_periodo', hoja: 'resumen_metricas_dinamico', columna: 'C', notas: 'filtro de período (elegida en FECHAS_seleccion.md)' },
  { base_id: 'looker', campo_logico: 'eje', hoja: 'resumen_metricas_dinamico', columna: 'E', notas: '' },
  { base_id: 'looker', campo_logico: 'area', hoja: 'resumen_metricas_dinamico', columna: 'F', notas: '' },
  { base_id: 'looker', campo_logico: 'estado', hoja: 'resumen_metricas_dinamico', columna: 'G', notas: '' },
  { base_id: 'looker', campo_logico: 'dig_impresiones', hoja: 'resumen_metricas_dinamico', columna: 'H', notas: '' },
  { base_id: 'looker', campo_logico: 'dig_visualizaciones', hoja: 'resumen_metricas_dinamico', columna: 'I', notas: '' },
  { base_id: 'looker', campo_logico: 'dig_clics', hoja: 'resumen_metricas_dinamico', columna: 'J', notas: '' },
  { base_id: 'looker', campo_logico: 'alcance', hoja: 'resumen_metricas_dinamico', columna: 'K', notas: '' },
  { base_id: 'looker', campo_logico: 'frecuencia', hoja: 'resumen_metricas_dinamico', columna: 'M',
    notas: 'M=frecuencia_total; existe también meta_frecuencia en L — elección sin confirmar con el equipo (DOC-3 Parte C)' },
  { base_id: 'looker', campo_logico: 'mail_enviados', hoja: 'resumen_metricas_dinamico', columna: 'N', notas: '' },
  { base_id: 'looker', campo_logico: 'mail_entregados', hoja: 'resumen_metricas_dinamico', columna: 'O', notas: '' },
  { base_id: 'looker', campo_logico: 'mail_aperturas', hoja: 'resumen_metricas_dinamico', columna: 'P', notas: '' },
  { base_id: 'looker', campo_logico: 'mail_clics', hoja: 'resumen_metricas_dinamico', columna: 'Q', notas: '' },
  { base_id: 'looker', campo_logico: 'cc_contactados', hoja: 'resumen_metricas_dinamico', columna: 'T', notas: '' },
  { base_id: 'looker', campo_logico: 'cc_efectivos', hoja: 'resumen_metricas_dinamico', columna: 'U', notas: '' },
  { base_id: 'looker', campo_logico: 'ivr_audiencia', hoja: 'resumen_metricas_dinamico', columna: 'V', notas: '' },
  { base_id: 'looker', campo_logico: 'ivr_atendidos', hoja: 'resumen_metricas_dinamico', columna: 'X', notas: '' },
  { base_id: 'looker', campo_logico: 'ivr_escucha75', hoja: 'resumen_metricas_dinamico', columna: 'Y', notas: '' },
  { base_id: 'looker', campo_logico: 'ivr_marque1', hoja: 'resumen_metricas_dinamico', columna: 'Z', notas: '' },
  { base_id: 'looker', campo_logico: 'sms_enviados', hoja: 'resumen_metricas_dinamico', columna: 'AA', notas: '' },
  { base_id: 'looker', campo_logico: 'sms_entregados', hoja: 'resumen_metricas_dinamico', columna: 'AB', notas: '' },
  // DOC-3 Parte F: fuente encontrada para el token huérfano post_camp1-3 dinámico —
  // pieza_meta trae la URL del posteo de Facebook de la campaña (anteúltima columna).
  { base_id: 'looker', campo_logico: 'post_meta', hoja: 'resumen_metricas_dinamico', columna: 'AD', notas: 'URL del posteo de Facebook de la campaña — candidato para post_camp1-3 dinámico' },

  // ── `_23` (10/08) · la ventana por referencia ─────────────────────────────────────────
  // Medido el 10/08 antes de escribir estas filas: `looker/Cuentas` y `looker/DIGITAL`
  // estaban declaradas `uso=fuente` en `SOLAPAS` y **no tenían ninguna fila en `MAPEO`** —
  // las 27 filas de `looker` eran todas de `resumen_metricas_dinamico`. Las dos fallaban con
  // `«FALTA:fecha_periodo@looker/…»`, incluso `Cuentas`, que sí tiene las dos fechas.
  //
  // `Cuentas` es la solapa de referencia: es la que tiene fecha propia. 1011 filas, 1011
  // `id_cuentas` distintos, **cero repetidos** (medido 10/08) — el conjunto de pertenencia
  // sería inmune al doble conteo igual, pero el número queda escrito porque es la evidencia
  // de por qué se eligió pertenencia y no join.
  { base_id: 'looker', campo_logico: 'fecha_periodo', hoja: 'Cuentas', columna: 'C', notas: 'fecha_inicio — extremo izquierdo de la ventana (_23)' },
  { base_id: 'looker', campo_logico: 'fecha_fin_periodo', hoja: 'Cuentas', columna: 'D', notas: 'R-16 — extremo derecho del solape' },
  // `clave_ventana` es el campo lógico del cruce, y existe **de los dos lados con el mismo
  // nombre lógico y distinto encabezado real**: `Cuentas` la titula `id_cuentas` y `DIGITAL`
  // `Id cuentas`. Ése es justo el motivo de resolverla por `MAPEO` y no por texto de
  // encabezado. Es genérica a propósito y no se llama `id_cuenta`: el mecanismo no sabe de
  // cuentas, y el próximo par de solapas puede cruzarse por otra cosa (`D-01`).
  { base_id: 'looker', campo_logico: 'clave_ventana', hoja: 'Cuentas', columna: 'A', notas: 'clave del conjunto de pertenencia (_23) — encabezado real "id_cuentas"' },
  { base_id: 'looker', campo_logico: 'clave_ventana', hoja: 'DIGITAL', columna: 'A', notas: 'clave del conjunto de pertenencia (_23) — encabezado real "Id cuentas"' },

  // ── `_25` (10/08) · lo que `DIGITAL` necesita para los seis `imp_*` ────────────────────
  // Medido sobre la solapa viva ese día, 4903 filas: `A Id cuentas · B Plataforma ·
  // C Impresiones · D Visualizaciones · E Clics · F nombre_campaña · G eje · H area · I estado`.
  //
  // **Los `campo_logico` son los de los filtros de `R-23`/`R-24`, con la capitalización del
  // encabezado.** `Plataforma` e `Impresiones` rompen la convención minúscula del resto de la
  // hoja, y es a propósito: el filtro se escribe `Plataforma=Meta` en `MARCADORES` y en `R-24`,
  // y un campo lógico que no se lee igual que su filtro es una traducción más que nadie pidió.
  { base_id: 'looker', campo_logico: 'nombre_campaña', hoja: 'DIGITAL', columna: 'F', notas: 'corte JM/GCBA por R-23 — 36 filas vienen con la celda vacía' },
  { base_id: 'looker', campo_logico: 'estado', hoja: 'DIGITAL', columna: 'I', notas: 'filtro `estado=Activa` — las 36 sin estado quedan afuera y la traza las cuenta (_22 Parte D)' },
  { base_id: 'looker', campo_logico: 'Plataforma', hoja: 'DIGITAL', columna: 'B', notas: 'desglose de R-24 — ocho valores distintos, `Twitch ` con un espacio al final' },
  // `tipo_esperado = numero` **medido, no supuesto** (`B` del `_25`): 4888 celdas `number`, 15
  // vacías, **cero `string`**. Importa porque una columna de números que llega como texto hace
  // que la `SUMA` devuelva cero **sin fallar**, que es el modo de falla caro de este proyecto.
  { base_id: 'looker', campo_logico: 'Impresiones', hoja: 'DIGITAL', columna: 'C', notas: 'la métrica de los seis imp_* — medida numérica: 4888 number, 15 vacías, cero texto (10/08)' },

  // m2 — DIRECTA en 'M2 periodo DIRECTA', DIGITAL en 'M2 periodo DIGITAL'
  { base_id: 'm2', campo_logico: 'campana', hoja: 'M2 periodo DIRECTA', columna: 'B', notas: '' },
  // Paso 2.9 Parte D (S-02): 'fecha' es el contrato viejo, igual que en looker.
  { base_id: 'm2', campo_logico: 'fecha', hoja: 'M2 periodo DIRECTA', columna: 'C', notas: 'DEROGADA — ver S-02' },
  { base_id: 'm2', campo_logico: 'envios', hoja: 'M2 periodo DIRECTA', columna: 'D', notas: '' },
  { base_id: 'm2', campo_logico: 'entregados', hoja: 'M2 periodo DIRECTA', columna: 'E', notas: '' },
  { base_id: 'm2', campo_logico: 'aperturas', hoja: 'M2 periodo DIRECTA', columna: 'F', notas: '' },
  { base_id: 'm2', campo_logico: 'or', hoja: 'M2 periodo DIRECTA', columna: 'G', notas: '' },
  { base_id: 'm2', campo_logico: 'clics', hoja: 'M2 periodo DIRECTA', columna: 'H', notas: '' },
  { base_id: 'm2', campo_logico: 'ctor', hoja: 'M2 periodo DIRECTA', columna: 'I', notas: '' },
  { base_id: 'm2', campo_logico: 'impresiones', hoja: 'M2 periodo DIGITAL', columna: 'F', notas: '' },
  { base_id: 'm2', campo_logico: 'alcance_dig', hoja: 'M2 periodo DIGITAL', columna: 'G', notas: '' },
  { base_id: 'm2', campo_logico: 'views', hoja: 'M2 periodo DIGITAL', columna: 'I', notas: '' },
  { base_id: 'm2', campo_logico: 'clics_dig', hoja: 'M2 periodo DIGITAL', columna: 'K', notas: '' },
  { base_id: 'm2', campo_logico: 'campana_dig', hoja: 'M2 periodo DIGITAL', columna: 'B', notas: '' },
  { base_id: 'm2', campo_logico: 'estado', hoja: 'M2 periodo DIGITAL', columna: 'E', notas: '' },

  // DOC-3 Parte D — solapa 'Cuentas': pasa el criterio de fuente cruda (encabezado en
  // fila 1, sin banner), pero es la tabla de ATRIBUTOS de campaña, no la fuente de los
  // tokens m2_*: no tiene ninguna métrica (clics, visualizaciones, etc.). Se registra
  // como dimensión, no reemplaza a M2 periodo DIRECTA/DIGITAL.
  // Conflicto resuelto en Paso 2.11 Parte B: BASES.fila_encabezado de m2 es 3 (vale
  // para las dos hojas con banner de período), pero 'Cuentas' tiene el encabezado en la
  // fila 1 — antes era un conflicto sin resolver porque fila_encabezado era por base,
  // no por solapa (ver docs/Prompts/DOC-3_verificacion_bases_vivas.md Parte D punto 2).
  // Ahora `leerFuente` resuelve por `SOLAPAS.fila_encabezado` (`resolverFilaEncabezado_`,
  // Fuentes.gs), que para 'Cuentas' ya está en 1 desde el Paso 2.6 Parte D.
  { base_id: 'm2', campo_logico: 'id_cuenta', hoja: 'Cuentas', columna: 'A', notas: '' },
  { base_id: 'm2', campo_logico: 'campana', hoja: 'Cuentas', columna: 'D', notas: '' },
  // 'Estado campaña' (J) y 'Estado' (V) coexisten en esta solapa; se mapea J.
  { base_id: 'm2', campo_logico: 'estado', hoja: 'Cuentas', columna: 'J', notas: 'mapeada "Estado campaña" (J), no "Estado" (V) — las dos columnas coexisten en la hoja' },
  { base_id: 'm2', campo_logico: 'eje', hoja: 'Cuentas', columna: 'K', notas: '' },
  { base_id: 'm2', campo_logico: 'area', hoja: 'Cuentas', columna: 'L', notas: '' },

  // digital (Seguimiento Digital) — sembrado en el Paso 2.3. Snapshot: el
  // recorte por período lo hace el agregador (Paso 3) vía el link
  // campaña↔encuentro, no por ventana de fecha cruda (ver SEED_BASES_.digital).
  // El join entre solapas es por "ID Cuentas", que cada solapa mapea acá.

  // hoja 'Digital' — campaña digital
  { base_id: 'digital', campo_logico: 'clave', hoja: 'Digital', columna: 'A', notas: 'mismo valor que dig_campana; permite que el diagnóstico de "Probar lectura" (que corre sobre hoja_default) descarte filas sin campaña sin depender del prefijo por solapa' },
  { base_id: 'digital', campo_logico: 'dig_campana', hoja: 'Digital', columna: 'A', notas: '' },
  { base_id: 'digital', campo_logico: 'dig_jm_gcba', hoja: 'Digital', columna: 'B', notas: '' },
  { base_id: 'digital', campo_logico: 'dig_id_cuenta', hoja: 'Digital', columna: 'T', notas: 'join entre solapas' },
  { base_id: 'digital', campo_logico: 'dig_fecha_inicio', hoja: 'Digital', columna: 'E', notas: '' },
  { base_id: 'digital', campo_logico: 'dig_fecha_fin', hoja: 'Digital', columna: 'F', notas: '' },
  { base_id: 'digital', campo_logico: 'dig_impresiones', hoja: 'Digital', columna: 'H', notas: '' },
  { base_id: 'digital', campo_logico: 'dig_alcance', hoja: 'Digital', columna: 'I', notas: '' },
  { base_id: 'digital', campo_logico: 'dig_frecuencia', hoja: 'Digital', columna: 'J', notas: '' },
  { base_id: 'digital', campo_logico: 'dig_views', hoja: 'Digital', columna: 'K', notas: '' },
  { base_id: 'digital', campo_logico: 'dig_vtr', hoja: 'Digital', columna: 'L', notas: '' },
  { base_id: 'digital', campo_logico: 'dig_clics', hoja: 'Digital', columna: 'M', notas: '' },
  { base_id: 'digital', campo_logico: 'dig_ctr', hoja: 'Digital', columna: 'O', notas: '' },
  { base_id: 'digital', campo_logico: 'dig_impresiones_social', hoja: 'Digital', columna: 'U', notas: '' },

  // hoja 'Directa Mail'
  { base_id: 'digital', campo_logico: 'mail_id_cuenta', hoja: 'Directa Mail', columna: 'A', notas: 'join entre solapas' },
  { base_id: 'digital', campo_logico: 'mail_campana', hoja: 'Directa Mail', columna: 'H', notas: '' },
  // `mail_fecha` (Directa Mail, columna F) — DEROGADA y RETIRADA del seed el 03/08/2026,
  // decisión del usuario. Distinto de las derogaciones de `looker.fecha` y `m2.fecha` de más
  // arriba, que se conservan marcadas: aquéllas apuntaban a una columna que ningún otro
  // campo reclama, así que dejar constancia no cuesta nada. Ésta apuntaba a la **misma
  // columna F** que `fecha_periodo`, que es el contrato vivo (`S-02`) y el único que
  // `leerFuente` busca. Dos filas de `MAPEO` sobre la misma columna es la ambigüedad que ya
  // mordió con `SECCIONES.periodo_id`/`periodo_ref`: se retira en vez de marcarse.
  // El usuario ya la borró de la hoja; esto saca el seed, sin el cual `upsertPorClave_` la
  // repone en la corrida siguiente.
  // NO se toca el mapa de tipos de más abajo, donde `mail_fecha: 'fecha'` convive con
  // `dig_fecha_inicio`/`dig_fecha_fin`/`sms_fecha`: ese mapa lo consultan otros campos.
  { base_id: 'digital', campo_logico: 'mail_enviados', hoja: 'Directa Mail', columna: 'M', notas: '' },
  { base_id: 'digital', campo_logico: 'mail_entregados', hoja: 'Directa Mail', columna: 'N', notas: '' },
  { base_id: 'digital', campo_logico: 'mail_aperturas', hoja: 'Directa Mail', columna: 'O', notas: '' },
  { base_id: 'digital', campo_logico: 'mail_or', hoja: 'Directa Mail', columna: 'P', notas: '' },
  { base_id: 'digital', campo_logico: 'mail_clics', hoja: 'Directa Mail', columna: 'Q', notas: '' },
  { base_id: 'digital', campo_logico: 'mail_ctor', hoja: 'Directa Mail', columna: 'R', notas: '' },
  { base_id: 'digital', campo_logico: 'mail_area', hoja: 'Directa Mail', columna: 'T', notas: '' },
  // Paso 2.16 — la columna `Estado` (D) no estaba mapeada. Entra con su lista blanca:
  // sólo `Implementado` y `En curso` alimentan el informe. Medido el 02/08/2026 sobre
  // 2114 filas: entran 2073, quedan afuera 30 `Proyectado` y 11 con el estado vacío.
  // Lista blanca y no exclusión a propósito (D-21): con "todo lo que no sea Proyectado",
  // un estado nuevo entraría solo y en silencio.
  { base_id: 'digital', campo_logico: 'mail_estado', hoja: 'Directa Mail', columna: 'D', valores_incluidos: 'Implementado, En curso', notas: 'lista blanca — ver D-21' },
  // `Tipo de mail` (11/08) — la columna que distingue el envío de **convocatoria** de los de
  // confirmación y agradecimiento. Es lo que necesitaba el iceberg: `VALIDACION` §3.3 dice que
  // la lámina toma la convocatoria y **no** el total de la cuenta (271.701 en 5 envíos contra
  // los 44.043 publicados). Sin esta fila no había forma declarativa de decirlo.
  // **No lleva `valores_incluidos`**: filtrar acá sacaría las otras filas para toda la corrida,
  // y las láminas de confirmación/agradecimiento las van a necesitar. El corte va por
  // `MARCADORES.filtro`, que es por marcador (D-21 vs. el filtro declarativo del 08/08).
  { base_id: 'digital', campo_logico: 'mail_tipo', hoja: 'Directa Mail', columna: 'I', notas: 'Convocatoria / Confirmación / Agradecimiento — corte del envío de convocatoria (VALIDACION §3.3)' },
  // `Mail remitente` (16/08) — el corte JM/GCBA de mail. Sin esta fila las dos láminas del
  // Resumen Ejecutivo darían **idéntico**, que es el modo de falla que el prompt advierte.
  // Medido el 04/08 (`Pedido-1` 0.1 bis): 21 remitentes distintos, `jorge.macri@…` en 294
  // filas. **Es señal por envío y no por cuenta** — 136 de las 880 cuentas mandan desde dos
  // remitentes distintos—, así que el corte va por fila, que es lo que hace `MARCADORES.filtro`.
  // Sin `valores_incluidos`, por lo mismo que `mail_tipo`: filtrar acá sacaría las filas de
  // GCBA para toda la corrida, y la lámina de GCBA las necesita.
  { base_id: 'digital', campo_logico: 'mail_remitente', hoja: 'Directa Mail', columna: 'G', notas: 'corte JM/GCBA de mail — jorge.macri@buenosaires.gob.ar es JM, el resto GCBA (Pedido-1)' },

  // hoja 'Directa SMS'
  { base_id: 'digital', campo_logico: 'sms_id_cuenta', hoja: 'Directa SMS', columna: 'A', notas: 'join entre solapas' },
  { base_id: 'digital', campo_logico: 'sms_campana', hoja: 'Directa SMS', columna: 'E', notas: '' },
  { base_id: 'digital', campo_logico: 'sms_fecha', hoja: 'Directa SMS', columna: 'D', notas: '' },
  { base_id: 'digital', campo_logico: 'sms_enviados', hoja: 'Directa SMS', columna: 'F', notas: '' },
  { base_id: 'digital', campo_logico: 'sms_entregados', hoja: 'Directa SMS', columna: 'G', notas: '' },
  { base_id: 'digital', campo_logico: 'sms_ent_pct', hoja: 'Directa SMS', columna: 'H', notas: '' },
  { base_id: 'digital', campo_logico: 'sms_clics', hoja: 'Directa SMS', columna: 'I', notas: '' },

  // hoja 'Directa IVR' — sin fecha única (tiene Inicio D y Fin E)
  { base_id: 'digital', campo_logico: 'ivr_id_cuenta', hoja: 'Directa IVR', columna: 'A', notas: 'join entre solapas' },
  { base_id: 'digital', campo_logico: 'ivr_campana', hoja: 'Directa IVR', columna: 'I', notas: '' },
  { base_id: 'digital', campo_logico: 'ivr_inicio', hoja: 'Directa IVR', columna: 'D', notas: '' },
  { base_id: 'digital', campo_logico: 'ivr_fin', hoja: 'Directa IVR', columna: 'E', notas: '' },
  { base_id: 'digital', campo_logico: 'ivr_audiencia', hoja: 'Directa IVR', columna: 'J', notas: '' },
  { base_id: 'digital', campo_logico: 'ivr_llamados', hoja: 'Directa IVR', columna: 'K', notas: '' },
  { base_id: 'digital', campo_logico: 'ivr_atendidos', hoja: 'Directa IVR', columna: 'L', notas: '' },
  { base_id: 'digital', campo_logico: 'ivr_at_pct', hoja: 'Directa IVR', columna: 'M', notas: '' },
  { base_id: 'digital', campo_logico: 'ivr_e75', hoja: 'Directa IVR', columna: 'N', notas: '' },
  { base_id: 'digital', campo_logico: 'ivr_e75_pct', hoja: 'Directa IVR', columna: 'O', notas: '' },
  { base_id: 'digital', campo_logico: 'ivr_marque1', hoja: 'Directa IVR', columna: 'P', notas: '' },
  { base_id: 'digital', campo_logico: 'ivr_marque1_pct', hoja: 'Directa IVR', columna: 'Q', notas: '' },

  // hoja 'Alcance' — alcance/frecuencia por cuenta
  { base_id: 'digital', campo_logico: 'alc_id_cuenta', hoja: 'Alcance', columna: 'A', notas: 'join entre solapas' },
  { base_id: 'digital', campo_logico: 'alc_alcance', hoja: 'Alcance', columna: 'B', notas: '' },
  { base_id: 'digital', campo_logico: 'alc_frecuencia', hoja: 'Alcance', columna: 'C', notas: '' },

  // hoja maestra 'Seguimiento digital' — dimensión + pauta por plataforma
  { base_id: 'digital', campo_logico: 'sd_id_cuenta', hoja: 'Seguimiento digital', columna: 'A', notas: 'join entre solapas' },
  { base_id: 'digital', campo_logico: 'sd_campana_cuentas', hoja: 'Seguimiento digital', columna: 'B', notas: '' },
  { base_id: 'digital', campo_logico: 'sd_campana_digital', hoja: 'Seguimiento digital', columna: 'C', notas: '' },
  { base_id: 'digital', campo_logico: 'sd_fecha_inicio', hoja: 'Seguimiento digital', columna: 'L', notas: '' },
  // `R-14` (06/08/2026) — una campaña entra si su rango **se solapa** con la ventana, y sin
  // el extremo derecho no hay rango: con sólo `sd_fecha_inicio` lo único computable era
  // "empieza en la ventana", que es justo lo que la regla dice que no es. Encabezados reales
  // verificados el 07/08 contra la base: `M = "Fecha de fin"`, `N = "Estado"`.
  { base_id: 'digital', campo_logico: 'sd_fecha_fin', hoja: 'Seguimiento digital', columna: 'M', notas: 'el extremo derecho del rango de R-14' },
  { base_id: 'digital', campo_logico: 'sd_estado', hoja: 'Seguimiento digital', columna: 'N', notas: 'estado de la campaña en el momento del informe — valores libres, cargados a mano' },
  { base_id: 'digital', campo_logico: 'sd_pauta_google', hoja: 'Seguimiento digital', columna: 'T', notas: 'conteo de contenidos pauteados en Google, no monto' },
  { base_id: 'digital', campo_logico: 'sd_pauta_prog', hoja: 'Seguimiento digital', columna: 'U', notas: 'conteo de contenidos pauteados en Programmatic, no monto' },
  { base_id: 'digital', campo_logico: 'sd_pauta_meta', hoja: 'Seguimiento digital', columna: 'V', notas: 'conteo de contenidos pauteados en Meta, no monto' },

  // `A.2`/`B.4` (07/08) — la solapa `Digital 2026 acumulado`, fuente de la tabla de
  // comunicaciones post (lámina 7 de `jm`). Letras verificadas contra la base viva el 07/08.
  //
  // **Prefijo propio `acum_` y no `dig_`**, aunque la clave de `MAPEO` incluya la solapa y no
  // hubiera colisión: `dig_impresiones` sobre `Digital` son las impresiones **de un período**
  // y sobre esta solapa son **el acumulado de la campaña entera**. Dos cosas distintas con el
  // mismo nombre es exactamente la trampa que costó una noche el 07/08. Es además la
  // convención que ya usan `alc_`, `sd_`, `mail_`, `ivr_` y `sms_`: un prefijo por solapa.
  //
  // **VTR no está y es derivable** — `acum_views / acum_impresiones`. No se mapea una columna
  // que no existe ni se cablea el marcador: la propuesta va en el reporte (§1.8.2).
  { base_id: 'digital', campo_logico: 'acum_id_cuenta', hoja: 'Digital 2026 acumulado', columna: 'A', notas: 'join entre solapas' },
  { base_id: 'digital', campo_logico: 'acum_campana', hoja: 'Digital 2026 acumulado', columna: 'B', notas: '' },
  { base_id: 'digital', campo_logico: 'acum_fecha_inicio', hoja: 'Digital 2026 acumulado', columna: 'C', notas: 'extremo izquierdo del rango de R-14' },
  { base_id: 'digital', campo_logico: 'acum_fecha_fin', hoja: 'Digital 2026 acumulado', columna: 'D', notas: 'extremo derecho del rango de R-14' },
  { base_id: 'digital', campo_logico: 'acum_estado', hoja: 'Digital 2026 acumulado', columna: 'E', notas: '⚠ viene en MAYÚSCULAS (FINALIZADA/ACTIVA/PAUSADA/PENDIENTE) y R-10 no pliega el case' },
  { base_id: 'digital', campo_logico: 'acum_impresiones', hoja: 'Digital 2026 acumulado', columna: 'F', notas: '' },
  { base_id: 'digital', campo_logico: 'acum_views', hoja: 'Digital 2026 acumulado', columna: 'G', notas: 'el numerador del VTR derivable' },
  { base_id: 'digital', campo_logico: 'acum_clics', hoja: 'Digital 2026 acumulado', columna: 'H', notas: '' },
  { base_id: 'digital', campo_logico: 'acum_ctr', hoja: 'Digital 2026 acumulado', columna: 'I', notas: '' },
  { base_id: 'digital', campo_logico: 'acum_frecuencia', hoja: 'Digital 2026 acumulado', columna: 'J', notas: '' },
  { base_id: 'digital', campo_logico: 'acum_alcance', hoja: 'Digital 2026 acumulado', columna: 'K', notas: '' },
  // La fecha que gobierna el recorte por ventana de esta solapa: la de inicio, igual que en
  // `Digital`. Con `acum_fecha_fin` mapeado, `R-14` es computable acá.
  { base_id: 'digital', campo_logico: 'fecha_periodo', hoja: 'Digital 2026 acumulado', columna: 'C', notas: 'fecha_periodo = Fecha de inicio (A.2/B.4)' },

  // `R-16` (07/08) — el **extremo derecho** del rango, para las solapas que lo tienen.
  // `fecha_fin_periodo` es la contraparte declarativa de `fecha_periodo`: donde está, el
  // recorte entra por **solape**; donde no, sigue entrando por **punto** y la traza lo dice.
  //
  // **Está sólo en cuatro solapas, y las cuatro son de campaña.** `Directa Mail`,
  // `Directa SMS` y `rdv` **no la llevan a propósito**: una fila de mail es **un envío** y una
  // de `rdv` es **un encuentro** — tienen una sola fecha por naturaleza, y forzarles un fin
  // sería inventar un dato. `A.2` del prompt del 07/08 lo pide explícitamente: las filas sin
  // fecha de fin siguen como están y el motor lo dice.
  { base_id: 'digital', campo_logico: 'fecha_fin_periodo', hoja: 'Digital', columna: 'F', notas: 'R-16 — extremo derecho del solape' },
  { base_id: 'digital', campo_logico: 'fecha_fin_periodo', hoja: 'Directa IVR', columna: 'E', notas: 'R-16 — el caso que motivó la regla: las campañas de Orden Público arrancan el 22 y 23/07 y la ventana empieza el 24' },
  { base_id: 'digital', campo_logico: 'fecha_fin_periodo', hoja: 'Seguimiento digital', columna: 'M', notas: 'R-16 — extremo derecho del solape' },
  { base_id: 'digital', campo_logico: 'fecha_fin_periodo', hoja: 'Digital 2026 acumulado', columna: 'D', notas: 'R-16 — extremo derecho del solape' }
];

// Paso 2.3.2: `solapa` entra en la clave de MAPEO junto a `base_id` +
// `campo_logico`. Cada fila de arriba ya declara su `hoja` real (incluidas las
// `dig_*`/`mail_*`/`sms_*`, que ya apuntaban a su solapa real, no a
// `hoja_default`) — `solapa` es exactamente ese mismo valor, así que se deriva
// acá en vez de tipearlo dos veces por fila.
SEED_MAPEO_.forEach(function (fila) { fila.solapa = fila.hoja; });
// Paso 2.16: el default explícito. Sin esto, la clave falta en el objeto y `upsertPorClave_`
// la trata distinto según por dónde entre (compara sólo las claves presentes, pero al
// reescribir una fila entera la completa con ''). Declararla evita esa asimetría.
SEED_MAPEO_.forEach(function (fila) { if (fila.valores_incluidos === undefined) fila.valores_incluidos = ''; });

/**
 * Paso 2.7 Parte F — `tipo_esperado` por `campo_logico`, no por fila: el mismo
 * campo lógico tiene el mismo tipo de dato sin importar en qué base/solapa viva
 * (`campana` es texto en las cuatro bases). Solo cubre lo "obvio" que pidió el
 * prompt — identificadores/categóricos → texto, `fecha*` → fecha, lo que un
 * marcador va a sumar → numero. Lo que no está acá queda sin declarar (`''`) a
 * propósito: `DIAG_BASES` no avisa ⚠ sobre lo no declarado, solo lo lista aparte
 * como informativo — no hace falta adivinar el resto para que esto sirva.
 */
var TIPO_ESPERADO_POR_CAMPO_ = {
  // identificadores y categóricos — texto
  figura: 'texto', barrio: 'texto', evento: 'texto', status: 'texto', estado: 'texto',
  comuna: 'texto', eje: 'texto', area: 'texto', campana: 'texto', campana_dig: 'texto',
  clave: 'texto', id_cuenta: 'texto', clave_ventana: 'texto', dig_jm_gcba: 'texto', post_meta: 'texto', mail_area: 'texto',
  // `_25` — con la capitalización del encabezado de `looker/DIGITAL`; ver el seed.
  'nombre_campaña': 'texto', 'Plataforma': 'texto',
  dig_campana: 'texto', mail_campana: 'texto', sms_campana: 'texto', ivr_campana: 'texto',
  sd_campana_cuentas: 'texto', sd_campana_digital: 'texto', sd_estado: 'texto',
  acum_id_cuenta: 'texto', acum_campana: 'texto', acum_estado: 'texto',
  dig_id_cuenta: 'texto', mail_id_cuenta: 'texto', sms_id_cuenta: 'texto',
  ivr_id_cuenta: 'texto', alc_id_cuenta: 'texto', sd_id_cuenta: 'texto',

  // fecha
  fecha_periodo: 'fecha', fecha_fin_periodo: 'fecha', fecha_inicio: 'fecha', fecha_fin: 'fecha', fecha: 'fecha',
  dig_fecha_inicio: 'fecha', dig_fecha_fin: 'fecha', mail_fecha: 'fecha', sms_fecha: 'fecha',
  ivr_inicio: 'fecha', ivr_fin: 'fecha', sd_fecha_inicio: 'fecha', sd_fecha_fin: 'fecha',
  acum_fecha_inicio: 'fecha', acum_fecha_fin: 'fecha',

  // métricas que un marcador va a sumar — numero
  inscriptos: 'numero', insc_mail: 'numero', insc_cc: 'numero', insc_ivr: 'numero',
  insc_digital: 'numero', insc_dif: 'numero', asistentes: 'numero', poblacion: 'numero',
  dig_impresiones: 'numero', dig_visualizaciones: 'numero', dig_clics: 'numero',
  'Impresiones': 'numero', // `_25` — medida: 4888 `number`, cero `string`
  alcance: 'numero', frecuencia: 'numero',
  mail_enviados: 'numero', mail_entregados: 'numero', mail_aperturas: 'numero',
  mail_clics: 'numero', mail_or: 'numero', mail_ctor: 'numero',
  cc_contactados: 'numero', cc_efectivos: 'numero',
  ivr_audiencia: 'numero', ivr_atendidos: 'numero', ivr_escucha75: 'numero',
  ivr_marque1: 'numero', ivr_llamados: 'numero', ivr_at_pct: 'numero', ivr_e75: 'numero',
  ivr_e75_pct: 'numero', ivr_marque1_pct: 'numero',
  sms_enviados: 'numero', sms_entregados: 'numero', sms_ent_pct: 'numero', sms_clics: 'numero',
  envios: 'numero', entregados: 'numero', aperturas: 'numero', or: 'numero', clics: 'numero',
  ctor: 'numero', impresiones: 'numero', alcance_dig: 'numero', views: 'numero', clics_dig: 'numero',
  dig_alcance: 'numero', dig_frecuencia: 'numero', dig_views: 'numero', dig_vtr: 'numero',
  dig_ctr: 'numero', dig_impresiones_social: 'numero',
  alc_alcance: 'numero', alc_frecuencia: 'numero',
  sd_pauta_google: 'numero', sd_pauta_prog: 'numero', sd_pauta_meta: 'numero',
  acum_impresiones: 'numero', acum_views: 'numero', acum_clics: 'numero',
  acum_ctr: 'numero', acum_frecuencia: 'numero', acum_alcance: 'numero'
};
SEED_MAPEO_.forEach(function (fila) { fila.tipo_esperado = TIPO_ESPERADO_POR_CAMPO_[fila.campo_logico] || ''; });

// Paso 2.11 Parte A — antes vivía en HOJAS_CONFIG_.PERIODOS.ejemplos. Períodos
// nombrados reutilizables (referenciados por MARCADORES.periodo_ref, ej.
// 'm2_mensual') — misma categoría durable que BASES/MAPEO/INFORMES, mismo
// mecanismo de aplicación.
// Las tres semanas viernes-jueves de junio entran por el seed y no a mano porque **el seed es
// el único escritor declarado de `PERIODOS`** (`docs/ESCRITORES.md`). Nacen el 11/08 para la
// demo —mostrar que el motor corre cualquier semana, no sólo la de la ventana activa— y se
// quedan: una ventana con nombre es reusable, y `PERIODOS` existe justamente para eso.
//
// Junio de 2026 arranca lunes, así que los viernes caen 5, 12, 19 y 26. La cuarta semana no
// entra: 26/06–02/07 cruza el mes y deja de ser comparable con las otras tres.
var SEED_PERIODOS_ = [
  { periodo_id: 'm2_mensual', desde: '2026-06-01', hasta: '2026-06-30', notas: 'M2 dentro del JM' },
  { periodo_id: 'quincena_rrss', desde: '2026-06-16', hasta: '2026-06-30', notas: 'Análisis RRSS' },
  { periodo_id: 'junio_sem1', desde: '2026-06-05', hasta: '2026-06-11', notas: 'Semana vie-jue de junio — alta para la demo del 12/08' },
  { periodo_id: 'junio_sem2', desde: '2026-06-12', hasta: '2026-06-18', notas: 'Semana vie-jue de junio — alta para la demo del 12/08' },
  { periodo_id: 'junio_sem3', desde: '2026-06-19', hasta: '2026-06-25', notas: 'Semana vie-jue de junio — alta para la demo del 12/08' },
  // `_31.1` B.1 — la semana del informe que ya funcionaba **no tenía fila en `PERIODOS`**, y ésa
  // fue la razón por la que el `_30` B.2 quedó bloqueado: no existía el `periodo_id` contra el
  // cual filtrar `REUNIONES`. El nombre lleva el rango adentro a propósito: `julio_sem4` obligaba
  // a contar viernes para saber cuál es.
  { periodo_id: 'julio_24_30', desde: '2026-07-24', hasta: '2026-07-30', notas: 'Semana vie-jue del informe vigente — alta para la demo del 12/08' }
];

// Paso 2.11 Parte A — antes vivían en HOJAS_CONFIG_.CAMPANAS.ejemplos y
// HOJAS_CONFIG_.REUNIONES.ejemplos. A diferencia de INFORMES/PERIODOS, estas dos
// son curadas a mano y cambian cada semana (mismo patrón — ver R-02 en
// docs/REGLAS_NEGOCIO.md): un upsert automático en cada "Cargar config inicial"
// pisaría la campaña/reunión real de la semana con este dato de ejemplo si
// coincidiera la clave. Quedan movidas acá (fuera de HOJAS_CONFIG_, que ya no
// siembra nada) pero SIN sembrador automático — a la espera de que
// `menuCargarEjemplo_()` (Codigo.gs, hoy un stub) las use para una instalación
// de cero, con el humano confirmando antes de escribir.
var SEED_CAMPANAS_EJEMPLO_ = [
  { periodo_id: '', campana_id: 'serv_esenciales', nombre: 'Servicios esenciales', informe_id: 'secco', base_id: 'looker', tipo: 'campana', desde: '2026-06-02', hasta: '2026-06-15', mostrar: 'sí', orden: 1 },
  { periodo_id: '', campana_id: 'encuentros_min', nombre: 'Encuentros de ministros', informe_id: 'secco', base_id: 'rdv', tipo: 'ministros', desde: '2026-06-01', hasta: '2026-06-30', mostrar: 'sí', orden: 2 },
  { periodo_id: '', campana_id: 'prov_uber', nombre: 'Uber', informe_id: 'secco', base_id: 'digital', tipo: 'proveedor', desde: '2026-06-01', hasta: '2026-06-30', mostrar: 'no', orden: 3 }
];

// Paso 2.9D — R-02: el temario define el universo del informe, no la fecha.
// Rescatado de los comentarios de la plantilla SECCO — temario real del 24/07 al
// 30/07/2026 (docs/TEMARIO_Y_PLANTILLA_2026-07-31.md), el único ejemplo real que
// existe del formato en que el equipo piensa el informe. Ver nota de
// SEED_CAMPANAS_EJEMPLO_ arriba: sin sembrador automático, mismo motivo.
var SEED_REUNIONES_EJEMPLO_ = [
  { periodo_id: '', orden: 1, eje: 'JM', tipo: 'Uno a uno', nombre: 'San Cristóbal', fecha: '2026-07-23', etapa: 'pre', mostrar: 'sí', texto_original: 'JM | Uno a uno en San Cristóbal 23/07 (pre)', notas: '' },
  { periodo_id: '', orden: 2, eje: 'JM', tipo: 'Uno a uno', nombre: 'Retiro', fecha: '2026-07-24', etapa: 'pre', mostrar: 'sí', texto_original: '2) JM | Uno a uno en Retiro 24/07 (pre)', notas: '' },
  { periodo_id: '', orden: 3, eje: 'JM', tipo: 'Encuentro Temático', nombre: 'Orden Público', fecha: '2026-07-28', etapa: '', mostrar: 'sí', texto_original: 'JM | Encuentro Temático Orden Público 28/07', notas: '' },
  { periodo_id: '', orden: 4, eje: 'JM', tipo: 'Uno a uno', nombre: 'San Cristóbal', fecha: '2026-07-23', etapa: 'post', mostrar: 'sí', texto_original: 'JM | Uno a uno en San Cristóbal 23/07 (POST)', notas: '' },
  { periodo_id: '', orden: 5, eje: 'JM', tipo: 'Uno a uno', nombre: 'Retiro', fecha: '2026-07-24', etapa: 'post', mostrar: 'sí', texto_original: 'JM | Uno a uno en Retiro 24/07 (post)', notas: '' },
  { periodo_id: '', orden: 6, eje: 'Ministros', tipo: 'Agregado', nombre: 'Reuniones de la semana', fecha: '2026-07-24', etapa: '', mostrar: 'sí', texto_original: 'Ministros | Reuniones de la semana (24/07 al 30/07 inclusive - Acumulado)', notas: '24/07 al 30/07 inclusive' },
  { periodo_id: '', orden: 7, eje: 'M2', tipo: 'Agregado', nombre: 'Campañas y enviados de la semana', fecha: '2026-07-24', etapa: '', mostrar: 'sí', texto_original: '6) M2 | Campañas y enviados de la semana del 24/07 al 30/07', notas: '' }
];

/**
 * Paso 2.6 Parte D — clasificación PROPUESTA de las ~86 solapas reales de las
 * cuatro bases (relevamiento manual sobre los archivos vivos,
 * docs/Prompts/Paso-2.6_registro_solapas.md Parte D). **No es una decisión**:
 * todo lo que queda en `revisar` lo confirma el usuario, y cualquier fila se
 * puede reclasificar a mano después — por eso se aplica con
 * `sembrarClasificacionSolapas()`, una siembra explícita y separada de
 * `inventariarSolapas()` (Solapas.gs), que nunca toca `uso`.
 *
 * `fila_encabezado` por defecto toma el de la base (`FILA_ENCABEZADO_POR_BASE_`,
 * espejo de `SEED_BASES_`); se pisa puntualmente donde el relevamiento encontró
 * otra cosa (m2 / `Cuentas` y `Cuentas M2`: fila 1, aunque la base tiene
 * `fila_encabezado=3` — DOC-3 Parte D, PROYECTO.md §5bis regla 2).
 *
 * ⚠ Consecuencia real, no cosmética: sembrar esto deja `M2 periodo DIRECTA` /
 * `M2 periodo DIGITAL` (banner de período en fila 1 — viola el criterio de fuente
 * cruda) en `uso=referencia` (Paso 2.10 Parte C — antes decía `revisar`, ya resuelto:
 * no es una clasificación pendiente, es un período tipeado a mano y no reproducible)
 * aunque siguen mapeadas en `MAPEO`. `buscarMapeo()` va a fallar para esos campos con
 * `«FALTA:token»` — visible a propósito, hasta que se decida una fuente real para `m2`.
 * (La ambigüedad de las dos hojas de `looker` que tenía esta misma nota se resolvió
 * en Paso 2.8 Parte C — ver `filaSolapa_('looker', ...)` más abajo, ya con
 * `uso=fuente`/`derivada`.)
 */
// m2: 3 es el default histórico (acertaba para las dos vistas "M2 periodo *", que
// tienen banner de período en fila 1 y encabezados reales en fila 3), pero Paso 2.11
// Parte B midió que es la EXCEPCIÓN, no la regla — el resto de las solapas de m2 tiene
// encabezado en fila 1, como cualquier otra base. Por eso `SOLAPAS.fila_encabezado` es
// la fuente real (ver `resolverFilaEncabezado_`, Fuentes.gs); esto queda solo como
// default para una solapa de m2 que todavía no está declarada en `SOLAPAS`.
var FILA_ENCABEZADO_POR_BASE_ = { rdv: 1, digital: 1, looker: 1, m2: 3 };

// Paso 2.11 Parte B — `fila_encabezado = 0` significa "esta solapa no tiene fila de
// títulos, los datos arrancan en la fila 1" (caso `Mail per`, m2 y digital: es un
// recorte de columnas de otra tabla, pegado sin encabezado propio). Solo válido para
// solapas que NO son `fuente` — una fuente sin fila de títulos no tiene de dónde sacar
// nombres de columna para MAPEO. `resolverFilaEncabezado_` (Fuentes.gs) lo respeta tal
// cual (no cae al default de la base): un cero puesto a propósito no es "sin dato".
function filaSolapa_(baseId, solapa, uso, notas, opciones) {
  opciones = opciones || {};
  return {
    base_id: baseId,
    solapa: solapa,
    uso: uso,
    fila_encabezado: 'fila_encabezado' in opciones ? opciones.fila_encabezado : FILA_ENCABEZADO_POR_BASE_[baseId],
    firma_encabezado: '',
    filas_datos: 'filas_datos' in opciones ? opciones.filas_datos : '',
    // `_23` — vacío es el default y significa «esta solapa se recorta con su propia
    // `fecha_periodo`». Se declara sólo donde la solapa no tiene ninguna columna temporal.
    ventana_ref: 'ventana_ref' in opciones ? opciones.ventana_ref : '',
    // `_44` (`D-30`) — vacío es el default y significa «esta solapa no se selecciona por cuenta».
    // Se declara sólo donde el grano de la solapa ES la cuenta y un marcador de encuentro tiene
    // que quedarse con su fila.
    campo_id_cuenta: 'campo_id_cuenta' in opciones ? opciones.campo_id_cuenta : '',
    notas: notas
  };
}

function filasSolapa_(baseId, solapas, uso, notas, opciones) {
  return solapas.map(function (solapa) { return filaSolapa_(baseId, solapa, uso, notas, opciones); });
}

// Paso 2.10 Parte C — nota compartida por las seis solapas "periodo" (ver más abajo).
var NOTA_PERIODO_MANUAL_ = 'vista con período manual en celda editable — no es fuente; ver VALIDACION_2026-07-31 §1.2';

var SEED_SOLAPAS_ = [].concat(
  // rdv — "RDV JM CM ES + funcionarios"
  [
    filaSolapa_('rdv', 'RVD JM-CM - ES', 'fuente', 'base de encuentros, hoja_default'),
    filaSolapa_('rdv', 'RDV_otros_ministros', 'fuente', 'mapeada; base ajena, ojo con la firma'),
    filaSolapa_('rdv', 'RVD JM-CM - ES Back Up', 'ignorar', 'backup'),
    // Paso 2.12 Parte 2, Grupo B — sólo cambia `uso`; la nota queda igual, ver el bloque
    // de las otras siete más abajo.
    filaSolapa_('rdv', 'RDV_JM_CM_ES', 'ignorar', 'nombre casi idéntico al default — ¿duplicado?')
  ],
  filasSolapa_('rdv', ['Para Revisar', 'Copia de Para Revisar', 'Copia de Para Revisar 1'], 'ignorar', 'copias de trabajo'),
  filasSolapa_('rdv', ['Tabla dinámica 4', 'Tabla dinámica 14', 'Tabla dinámica 16', 'Tabla dinámica 18', 'Tabla dinámica 19', 'Tabla dinámica 20', 'Tabla dinámica 23'], 'ignorar', 'pivots'),
  filasSolapa_('rdv', ['Hoja 56', 'Hoja 59', 'Hoja 68', 'Hoja 78'], 'ignorar', 'hojas sueltas'),
  filasSolapa_('rdv', ['Aux_Maximos', 'Datos_Unpivot'], 'derivada', 'auxiliares de cálculo'),
  filasSolapa_('rdv', ['Visualiz_respuestas_GCBA', 'Visualiz_respuestas_JM', 'Visualiz_mail', 'Visualiz_SMS'], 'derivada', 'vistas'),
  filasSolapa_('rdv', ['Cantidad de reuniones por franja horaria'], 'derivada', 'agregado'),
  filasSolapa_('rdv', ['Desplegables', 'Organigrama', 'Mail propuesta'], 'ignorar', 'validaciones y material suelto'),
  filasSolapa_('rdv', ['Backup respuestas'], 'ignorar', 'backup'),
  // Paso 2.12 Parte 2, Grupo B — estas ocho ya estaban decididas en la planilla con
  // `origen=manual`, y el seed seguía diciendo `revisar`: la protección impedía pisarlas,
  // así que el diff emitía ocho líneas `protegida (habría cambiado)` en cada corrida. Acá
  // el seed se alinea con lo decidido. **`origen` no se toca**: son decisiones humanas y la
  // protección tiene que seguir existiendo — lo que se corrige es que el seed proponga otra
  // cosa. (Distinto del caso `looker` del 2.11 Parte E, donde el `manual` era vestigial y
  // la fila volvió al sembrador: mismo síntoma, causa opuesta, arreglo opuesto.)
  // La agrupación de seis se abre porque no van todas al mismo lado.
  // ⚠ **Las `notas` de estas ocho quedan textualmente como están.** No es descuido: el
  // diff compara `['uso', 'fila_encabezado', 'notas']`, y hoy las notas del seed coinciden
  // con las de la planilla — por eso las ocho líneas salían sobre `uso` solamente. Si acá
  // se escribieran notas mejores, el seed no podría aplicarlas (son `origen=manual`) y
  // quedarían ocho `protegida (habría cambiado)` sobre `notas` en cada corrida: el mismo
  // piso permanente que el 2.11 Parte E acaba de sacar del lado de `looker`.
  // Que digan "sin decidir" sobre filas ya decididas está mal y está anotado en
  // `docs/PENDIENTES_consistencia.md`; arreglarlo pide tocar la planilla o `origen`, y
  // ninguna de las dos cosas es de este paso.
  //
  // `RDV CONJUNTO`: `ignorar` por decisión del usuario del 02/08/2026 — podría ser una
  // solapa de control. Lo sostiene esa decisión, NO la edición de control positivo del
  // protocolo del 31/07, que puso el mismo valor por casualidad al probar el diff.
  filasSolapa_('rdv', ['Funcionarios / Ministros'], 'referencia', 'posible catálogo de personas — cruzar con PERSONAS_equivalencias.csv'),
  filasSolapa_('rdv', ['Comunas'], 'referencia', 'sin decidir'),
  filasSolapa_('rdv', ['PPTS', 'RDV CONJUNTO', 'Agenda', 'Seguimiento', 'Respuestas JM 📩'], 'ignorar', 'sin decidir'),

  // digital — "Seguimiento Digital"
  [filaSolapa_('digital', 'Digital', 'ignorar', 'R-22 (09/08): CONGELADA — sus 205 filas JM llegan a diciembre de 2025, cero datos de 2026. Era hoja_default; el default se movió a Seguimiento digital en la misma corrida')],
  filasSolapa_('digital', ['Directa Mail', 'Directa IVR', 'Directa SMS'], 'fuente', 'canales de directa'),
  [filaSolapa_('digital', 'Seguimiento digital', 'fuente', 'maestra de la unión del Paso 2.4')],
  [filaSolapa_('digital', 'Alcance', 'fuente', 'usada por Union.gs')],
  [filaSolapa_('digital', 'RDV', 'ignorar', '⚠ duplica la base rdv — si se lee, hay doble conteo')],
  // `A.2`/`B.4` (07/08) — **`Digital 2026 acumulado` pasa de `derivada` a `fuente`**, por
  // decisión del usuario. Es la fuente de la tabla de comunicaciones post (lámina 7 de `jm`).
  //
  // El motivo es medido, no de preferencia: `Digital` —que era la candidata— **no tiene
  // ninguna fila en la ventana del informe**; sus 897 fechas reales van de 2024-08-29 a
  // 2026-01-02 y la ventana es julio de 2026. Declararla fuente dejaba la lámina vacía por
  // construcción. `Digital 2026 acumulado` sí llega: 683 filas con `Estado` cargado.
  //
  // **Que siga siendo un acumulado no cambia**: lo que cambia es que ahora se lee. `derivada`
  // en este registro significa "no la leas", no "está mal calculada", y esta lámina la
  // necesita. Ver `CONFIG_INFORMES.md` §1.8.2, con las tres advertencias — no tiene columna
  // `JM | GCBA | POLICIA`, su `Estado` viene en MAYÚSCULAS, y le falta VTR (derivable).
  [filaSolapa_('digital', 'Digital 2026 acumulado', 'fuente', 'acumulado — fuente de la lámina de comunicaciones post (A.2/B.4, 07/08)')],
  [filaSolapa_('digital', 'm2 digital', 'derivada', 'acumulados')],
  // Paso 2.9 Parte C.4: NO es conjunto de control — es texto pegado (una foto a mano
  // del link Funcionario/Barrio/Fecha, no datos vivos ni una fórmula). Ver
  // docs/DISENO_match_temario.md §9, marcada inválida como fuente de validación.
  [filaSolapa_('digital', 'RDV JM 2 VECES', 'referencia',
    'texto pegado — no es fuente ni control. No usar (Paso 2.9 Parte C.4; ' +
    'antes decía "usar para validar el scoring/umbral 0.6", ver docs/DISENO_match_temario.md §9).',
    { filas_datos: 37 })],
    filasSolapa_('digital', ['Nomalización de barrios', 'Barrio Hab', 'Limpia Fun'], 'referencia', 'catálogos de normalización — útiles para el scoring del anclaje'),
  // Paso 2.12 Parte 2, Grupo A — decidido el 31/07 contra la firma de encabezados y los
  // conteos reales. Criterio general: ante la duda, `ignorar`.
  filasSolapa_('digital', ['Cuentas'], 'fuente', 'catálogo maestro: ID Cuentas es clave única real (3.453 filas, 3.453 distintos, cero vacíos) — la única columna así en las cuatro bases'),
  filasSolapa_('digital', ['CAMPAÑAS_DESGLOCE_DIGITAL'], 'ignorar', 'R-22 (09/08): CONGELADA — sus filas JM llegan al 17/04/2026, tres meses antes del informe. De las 436 que solapan la ventana 24-31/07, JM son cero'),
  // Las cinco de abajo estaban en `referencia` y bajan a `ignorar` por `R-22`: `referencia`
  // sugiere que sirven para consultar, y éstas no sirven para nada. Las tres de período
  // manual las veta `R-02`; las dos de `#REF!` están rotas.
  filasSolapa_('digital', ['Metricas informe', 'INFORME'], 'ignorar', 'R-22 (09/08): #REF! — fórmula rota que llega como texto'),
  filasSolapa_('digital', ['EDV'], 'referencia', 'funcionarios/figuras por fecha (confirmado por el usuario)'),
  filasSolapa_('digital', ['Filter unificado'], 'ignorar', 'la fila 1 son dos fechas — no tiene encabezados'),

  // Paso 2.10 Parte C — seis solapas "periodo" entre m2 y digital: el recorte de
  // fechas vive en dos celdas editables (fila 1, o fila 2 en las dos de más abajo),
  // no en una fórmula ni un filtro reproducible — mismo defecto que ya tenía
  // 'RDV JM 2 VECES'. Medido el 31/07: cinco ventanas de fecha DISTINTAS entre las
  // seis, ninguna la del período del informe (24-30/07). 'referencia', no 'ignorar':
  // a diferencia de un backup o duplicado, sí documentan un recorte real — solo que
  // no es el que hace falta y no se puede reproducir sin retipear las celdas a mano.
  // No son destino de MAPEO. m2/Mail per y digital/Mail per son hojas DISTINTAS con
  // el mismo nombre (una por base) — la clave compuesta (base_id, solapa) las separa.
  // 'M2 periodo DIRECTA'/'DIGITAL' sí tienen encabezado real en fila 3 (banner de
  // período en fila 1) — usan el default de FILA_ENCABEZADO_POR_BASE_, no se pisa acá.
  filasSolapa_('m2', ['M2 periodo DIRECTA', 'M2 periodo DIGITAL'], 'referencia', NOTA_PERIODO_MANUAL_),
  // Paso 2.11 Parte B — 'Mail per' (m2 y digital) no tiene fila de títulos: la fila 1
  // ya es dato (recorte de columnas de 'Directa mail'/'Directa Mail', pegado sin
  // encabezado propio). fila_encabezado=0, ver la nota de más arriba.
  [filaSolapa_('m2', 'Mail per', 'referencia', NOTA_PERIODO_MANUAL_, { fila_encabezado: 0 })],
  filasSolapa_('digital', ['Buscador por periodo digital', 'Buscador por periodo directa'], 'ignorar', 'R-22 (09/08): período tipeado a mano, vetada por R-02. ' + NOTA_PERIODO_MANUAL_),
  [filaSolapa_('digital', 'Mail per', 'ignorar', 'R-22 (09/08): período tipeado a mano, vetada por R-02. ' + NOTA_PERIODO_MANUAL_, { fila_encabezado: 0 })],

  // looker — "Base Looker"
  [
    filaSolapa_('looker', 'resumen_metricas_dinamico', 'fuente', 'Paso 2.9 Parte C (S-01): QUERY() viva sobre Cuentas, no deriva de resumen_metricas — hoja_default'),
    filaSolapa_('looker', 'resumen_metricas', 'derivada', 'Paso 2.9 Parte C (S-01): pegado de valores; devolvió 899 de 903 filas sin fecha'),
    filaSolapa_('looker', 'MAIL', 'ignorar', 'R-22 (09/08): sin columna de fecha y sin fila en MAPEO — ilegible para el motor', { filas_datos: 5748 }),
    filaSolapa_('looker', 'IVR', 'ignorar', 'R-22 (09/08): sin columna de fecha y sin fila en MAPEO — ilegible para el motor', { filas_datos: 190 }),
    filaSolapa_('looker', 'SMS', 'ignorar', 'R-22 (09/08): sin columna de fecha y sin fila en MAPEO — ilegible para el motor', { filas_datos: 86 }),
    filaSolapa_('looker', 'CC', 'fuente', 'detalle por canal, con ID cuentas', { filas_datos: 1299 }),
    // `_23` (10/08) — la única solapa del repo con `ventana_ref`. `C-19` midió que `DIGITAL`
    // **no tiene ninguna columna temporal**: `fecha_inicio` y `fecha_fin` viven en `Cuentas`.
    // Sin esta declaración `leerFuente` falla con `«FALTA:fecha_periodo@looker/DIGITAL»`, que
    // es el modo de falla correcto — pero deja la solapa ilegible y con ella los tres `imp_*`.
    filaSolapa_('looker', 'DIGITAL', 'fuente', 'detalle por canal, con ID cuentas · ventana por referencia a Cuentas (_23): no tiene columna temporal propia', { filas_datos: 4563, ventana_ref: 'Cuentas' }),
    filaSolapa_('looker', 'ALCANCE', 'ignorar', 'R-22 (09/08): sin columna de fecha y sin fila en MAPEO — ilegible para el motor', { filas_datos: 727 })
  ],
  // Paso 2.12 Parte 2, Grupo A.
  filasSolapa_('looker', ['Audiencias'], 'referencia', 'catálogo de segmentaciones'),
  filasSolapa_('looker', ['Cuentas'], 'fuente', 'TABLA DE DIMENSIÓN, no de métricas (1.2 del 09/08): se usa para id_cuentas, nombre_campaña y los cortes que dependan de ellos. NINGÚN marcador toma un número de acá — las métricas de looker salen de resumen_metricas_dinamico (S-01) y de ningún otro lado. Vuelve a fuente porque el join de CC y DIGITAL la necesita y sin ella falla antes de leer una fila'),
  filasSolapa_('looker', ['Desglose Alcance'], 'ignorar', 'looker/ALCANCE ya da el alcance por cuenta'),
  filasSolapa_('looker', ['URLs'], 'ignorar', 'links a piezas creativas; además tiene id_cuentas y nombre_campaña duplicados en el encabezado'),
  filasSolapa_('looker', ['Audiencias Conectadas'], 'ignorar', '1 fila de datos'),
  [filaSolapa_('looker', 'Desplegables', 'ignorar', 'validaciones')],

  // m2 — "M2 Reporte para Fede 2026"
  [
    filaSolapa_('m2', 'Cuentas M2', 'fuente', '353 filas, encabezado fila 1 — dimensión de campañas M2', { fila_encabezado: 1, filas_datos: 353 }),
    filaSolapa_('m2', 'Cuentas', 'ignorar', 'mismo universo que digital/Cuentas (3453 filas), que queda como fuente (Paso 2.12 Parte 2)', { fila_encabezado: 1, filas_datos: 3453 })
  ],
  // Paso 2.9 Parte C.5: 'M2 Directa'/'M2 digital' (26/67 filas, "acumulados") tuvieron
  // clasificación sospechada invertida frente a lo que se leía como su detalle, y
  // quedaron 'revisar' hasta confirmar contra la base viva.
  //
  // Paso 2.12 Parte 2 (02/08/2026) — pasan a 'ignorar', y la sospecha deja de estar
  // pendiente: NO se ignoran porque no sirvan, sino porque hoy **no hay a qué
  // engancharlas** — `m2` quedó `sin_fuente` en el Paso 2.10 Parte C. **Condición de
  // reversión:** si la lista curada de campañas M2 termina viviendo en `CAMPANAS`,
  // `M2 Directa` es el detalle que corresponde y vuelve a `fuente`.
  //
  // Para que esta clasificación se sostenga hubo que retirar antes
  // `reclasificarSolapasM2Invertidas_` de `aplicarInstalacion_` (Parte 3): forzaba estas
  // dos a 'revisar' antes de que corriera el sembrador, o sea ping-pong en cada corrida.
  // Es la razón por la que la Parte 3 se ejecutó ANTES que la Parte 2.
  //
  // 'M2 periodo DIRECTA'/'DIGITAL' salieron de este grupo en el Paso 2.10 Parte C: no son
  // un "detalle invertido", son las seis solapas "periodo" de más arriba.
  // Paso 2.11 Parte B — fila_encabezado: 1, no el default de m2 (3). Medido contra el
  // archivo del 31/07: primeras celdas reales 'ID cuentas · ID MailUp · Listado de
  // Mail' (M2 Directa) / 'ID Cuentas · Nombre campaña…' (M2 digital) en la fila 1.
  // Con encabezado en fila 3 (el default viejo), leerFuente tomaba una fila de DATOS
  // como si fueran títulos — no fallaba, devolvía columnas con nombres raros.
  filasSolapa_('m2', ['M2 Directa', 'M2 digital'], 'ignorar', 'sin fuente a la que engancharlas (m2 quedó sin_fuente, Paso 2.10 Parte C). Si la lista curada de campañas M2 vive en CAMPANAS, M2 Directa vuelve a fuente', { fila_encabezado: 1 }),
  // Paso 2.11 Parte B — mismo caso: encabezado real en fila 1 ('ID Cuentas · Nombre
  // campaña…' / 'ID Cuentas · Alcance · Frecuencia' / 'Id accion · Id cuentas · Año').
  // Paso 2.12 Parte 2, Grupo A — resuelto: manda la de `digital`. Las tres de `m2` son
  // copias exactas (mismo conteo de filas), así que se ignoran para no tener dos vivas
  // dando números casi iguales.
  filasSolapa_('m2', ['Seguimiento digital', 'Alcance', 'CAMPAÑAS_DESGLOCE_DIGITAL'], 'ignorar', 'copia exacta de la solapa homónima de digital, que queda como fuente (Paso 2.12 Parte 2)', { fila_encabezado: 1 }),
  // Paso 2.10 Parte C: espejo de digital/Directa Mail (2.106 vs 2.107 filas, mismas
  // métricas) — declarada 'derivada' para que no queden las dos vivas dando números
  // casi iguales. MAPEO sigue apuntando a digital/Directa Mail, no se toca acá.
  // Paso 2.11 Parte B — fila_encabezado: 1 ('ID Cuentas · ID MailUp · Listado de Mail').
  [filaSolapa_('m2', 'Directa mail', 'derivada', 'espejo de digital/Directa Mail — ver Paso 2.10 Parte C', { fila_encabezado: 1 })],
  // Paso 2.11 Parte B — fila_encabezado: 1 ('Id · Nombre de la campaña…').
  filasSolapa_('m2', ['Digital acumulado'], 'derivada', 'acumulados', { fila_encabezado: 1 })
);

/**
 * Aplica SEED_SOLAPAS_ sobre la hoja SOLAPAS. A diferencia de `inventariarSolapas()`
 * (Solapas.gs), esto SÍ pisa `uso`/`fila_encabezado`/`notas` de las filas que toca —
 * pero NUNCA una fila con `origen=manual` (Paso 2.7 Parte A regla 2): esa es la única
 * marca que protege una decisión humana de una re-siembra. Toda fila que sí escribe
 * queda con `origen='seed'` — incluidas las que el inventario había dejado en
 * `origen='auto'` (ese es justo el caso que destraba esta parte: antes, un
 * `uso=revisar` puesto por el inventario se confundía con uno puesto a mano y la
 * siembra no podía pisarlo).
 * Pensada para correr una vez después de la primera corrida de "Inventariar
 * solapas"; vive en su propio ítem de menú, separado de "Cargar config inicial".
 */
/**
 * Paso 2.11 Parte C — núcleo de `sembrarClasificacionSolapas()`, diff-aware (mismo
 * motivo que `upsertPorClave_`) y sin `alert()`.
 *
 * `filaObj` NO incluye `filas_datos` ni `firma_encabezado`: esas dos las escribe
 * `inventariarSolapas()` (Solapas.gs) contra el archivo vivo, y son las que estaban
 * rotas antes de esta parte — el objeto de `SEED_SOLAPAS_` casi siempre trae
 * `filas_datos: ''` (solo algunas filas de `looker`/`m2` tienen una estimación manual
 * vieja), así que escribir esas dos columnas en cada siembra las devolvía a blanco o a
 * un número de relevamiento desactualizado, pisando lo que `inventariarSolapas()` ya
 * había medido. Con la clasificación corriendo ahora dentro de "Aplicar configuración"
 * (pensada para poder correrse seguido, no una sola vez), ese pisado ya no es tolerable.
 */
function aplicarClasificacionSolapas_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var hoja = ss.getSheetByName('SOLAPAS');
  if (!hoja) {
    return { ok: false, motivo: 'La hoja SOLAPAS no existe. Corré "Instalar / reparar hojas" primero.' };
  }

  var existentes = leerFilasSolapas_(hoja);
  var protegidas = [];
  var objetosAAplicar = [];

  SEED_SOLAPAS_.forEach(function (obj) {
    var clave = obj.base_id + '||' + obj.solapa;
    var existente = existentes[clave];

    if (existente && existente.origen === 'manual') {
      // C.2-4 — no alcanza con decir "no la toqué": hay que decir QUÉ se salteó. Las diez
      // protegidas salían con `anterior`/`nuevo` vacíos, así que no se sabía cuáles
      // estaban por cambiar y cuáles ya coincidían con el seed. La Parte 2 del Paso 2.12
      // necesita justamente eso para `rdv/RDV CONJUNTO` y `rdv/Comunas`.
      var diferencias = [];
      ['uso', 'fila_encabezado', 'ventana_ref', 'campo_id_cuenta', 'notas'].forEach(function (columna) {
        if (!(columna in obj)) return;
        var actual = existente[columna];
        var deseado = obj[columna];
        if (normalizarParaComparar_(actual, '') === normalizarParaComparar_(deseado, '')) return;
        diferencias.push({ columna: columna, anterior: actual, nuevo: deseado });
      });
      protegidas.push({ clave: clave, diferencias: diferencias });
      return; // Parte A regla 2: nunca pisar una fila marcada a mano
    }

    /* `_23` (10/08) — **las cuatro columnas ajenas se devuelven tal cual, no se omiten.**
     *
     * El comentario de arriba de esta función dice, desde el 2.11 Parte C, que `filas_datos`
     * y `firma_encabezado` se dejan afuera del objeto *para no pisarlas*. Eso no era lo que
     * pasaba: `upsertPorClave_` reescribe **la fila entera** con
     * `headers.map(h => (h in obj) ? obj[h] : '')`, así que una columna omitida no se
     * conserva — se blanquea, y sólo en las filas que el seed cambia por otro motivo. Por eso
     * `looker/Cuentas` tiene hoy `firma_encabezado` y `filas_datos` vacíos (se le editó
     * `notas` el 09/08) y `looker/DIGITAL` los tiene cargados (nadie la tocó desde el último
     * inventario). Medido el 10/08, al ir a escribirle `ventana_ref` a `DIGITAL`.
     *
     * El reparto de `docs/ESCRITORES.md` no cambia: el dueño de estas cuatro sigue siendo
     * `inventariarSolapas()`. Lo que cambia es que este sembrador deja de destruirlas de
     * costado. **`upsertPorClave_` sigue igual**: el mismo agujero existe para cualquier otro
     * seed que omita una columna, y eso es un hallazgo con prompt propio, no un arreglo de
     * paso. */
    objetosAAplicar.push({
      base_id: obj.base_id,
      solapa: obj.solapa,
      uso: obj.uso,
      origen: 'seed',
      fila_encabezado: obj.fila_encabezado,
      firma_encabezado: existente ? existente.firma_encabezado : '',
      filas_datos: existente ? existente.filas_datos : '',
      filas_crudas: existente ? existente.filas_crudas : '',
      filas_minimas: existente ? existente.filas_minimas : '',
      // `_23` — entra a la lista de columnas sembradas, y **no** al grupo de `filas_datos`/
      // `firma_encabezado`: aquéllas las mide `inventariarSolapas()` contra el archivo vivo y
      // sembrarlas las pisaría. Ésta es una declaración estructural, del mismo tipo que `uso`,
      // así que el seed es su dueño y el `origen=manual` de arriba sigue siendo su escape.
      ventana_ref: obj.ventana_ref || '',
      // `_44` — misma categoría que `ventana_ref`: es una declaración estructural, del tipo de
      // `uso`, así que el seed es su dueño y el `origen=manual` de arriba sigue siendo su escape.
      campo_id_cuenta: obj.campo_id_cuenta || '',
      notas: obj.notas
    });
  });

  var resultado = upsertPorClave_(hoja, ['base_id', 'solapa'], objetosAAplicar);
  resultado.ok = true;
  resultado.protegidas = protegidas;
  // C.2-5: las protegidas SÍ están en el seed — se sacaron de `objetosAAplicar` a
  // propósito. Sin esta resta saldrían como `solo_en_hoja`, que es exactamente la
  // categoría contraria (lo que nadie declaró) y volvería a confundir dos cosas
  // distintas en el mismo reporte.
  var esProtegida = {};
  protegidas.forEach(function (p) { esProtegida[p.clave] = true; });
  resultado.soloEnHoja = (resultado.soloEnHoja || []).filter(function (s) { return !esProtegida[s.clave]; });
  return resultado;
}

function formatearResumenClasificacionSolapas_(r) {
  if (!r.ok) return r.motivo;
  return 'SOLAPAS — nuevas: ' + r.escritas + ', actualizadas: ' + r.actualizadas +
    (r.protegidas.length
      ? '\nProtegidas (origen=manual, no tocadas): ' + r.protegidas.length +
        ' — de esas, ' + r.protegidas.filter(function (p) { return p.diferencias && p.diferencias.length; }).length +
        ' tenían algo por cambiar (ver DIFF_CONFIGURACION)'
      : '') +
    '\n\nEs una propuesta, no una decisión: las filas en uso=revisar quedan pendientes de que el usuario decida.';
}

function sembrarClasificacionSolapas() {
  var ui = ui_();
  var resultado = aplicarClasificacionSolapas_();
  if (!resultado.ok) {
    ui.alert('No se pudo sembrar', resultado.motivo, ui.ButtonSet.OK);
    return;
  }
  ui.alert('Clasificación inicial sembrada', formatearResumenClasificacionSolapas_(resultado), ui.ButtonSet.OK);
}

var SEED_CONFIG_DEFAULTS_ = {
  informe_activo: 'jm',
  periodo_desde: '',
  periodo_hasta: '',
  carpeta_plantillas: '1Q5At-COhFbidKCfYrwXhN6kZAbuxgYpi',
  // Paso 2.15 Parte A (D-03): la carpeta de salidas es de `reporteseinformesgcba`
  // ("Salidas Reportes"), no la de `jpcofanogcba1` que estaba acá y nunca se usó.
  // Ojo: este default NO repunta la hoja — `seedConfigConfig_` sólo completa celdas
  // vacías (ver ahí), así que la fila viva se cambia aparte y nada avisa si divergen.
  carpeta_salida: '1LAEVlWZXoGjon2cnaMjGksV0THz3Ejlz',
  // Paso 2.15 Parte A: la carpeta donde vive el motor (la planilla de control está
  // adentro), que hasta hoy hacía de `carpeta_salida` — una clave para dos cosas.
  // **Sin lector**: existe para que el ID no se pierda al repuntar la salida, y para
  // que quede dicho que son dos carpetas distintas. Ver la tabla del RUNBOOK.
  carpeta_motor: '1EyTlfg16vpyrftpUXgacShFk8iSbX_fJ',
  // Paso 2.9F: el umbral de confianza del anclaje sale del código (era una
  // constante en Union.gs) y pasa a ser parámetro de negocio — cambiarlo ya no
  // exige clasp push. Ver umbralAnclajeReunion_() en Union.gs.
  umbral_anclaje_reunion: '0.6',
  // `R-19` (08/08) — los centinelas de la capa 1: si el encabezado de una solapa trae uno de
  // estos, el espejo se rompió y la lectura **falla** en vez de devolver cero filas.
  //
  // **Van en configuración y no en el código** por la misma razón que el umbral de arriba: es
  // una lista de valores que puede cambiar sin que cambie la lógica — Google puede sumar un
  // código de error mañana, y agregarlo no tiene por qué exigir `clasp push`.
  //
  // ⚠ **Vacío en `CONFIG` NO significa "sin chequeo": cae a esta lista.** Desactivar la guarda
  // tiene que ser una decisión escrita, no el efecto de una celda que alguien borró.
  centinelas_lectura: '#REF!,#N/A,#ERROR!,#VALUE!,#NAME?,#DIV/0!,Loading...',
  // `_5` (08/08) — los dos umbrales del match por similitud de campañas. Van acá porque son
  // valores que se ajustan **mirando resultados**, y bajar un umbral no puede exigir `clasp
  // push`. El margen no es un adorno: "Operativo de saturación en 1-11-14" puntúa alto contra
  // cuatro campañas de saturación distintas, y sin margen el cargador elegiría por orden de
  // aparición. Medidos contra el temario real del 24-30/07.
  umbral_similitud_campana: '0.8',
  margen_similitud_campana: '0.2',
  // `T2.9.2` (07/08) — las dos ventanas del anclaje, por el mismo argumento que el umbral:
  // cambiar un parámetro de negocio no puede exigir `clasp push` (`R-12`, `CLAUDE.md` §2).
  //
  // La corta **replica exactamente el valor de hoy**, 14: es la que disuelve el timeout
  // —puntuar 500 encuentros × 1297 cuentas no termina en seis minutos; contra 5-20
  // candidatos cercanos en fecha, sí—. Este paso no cambia ningún comportamiento.
  ventana_candidatos_anclaje_dias: '14',
  // La ampliada **nace vacía a propósito, y vacía significa "no ampliar"** — que es
  // literalmente lo que el motor hace hoy. `R-12` decide que hay que ampliar antes de
  // declarar `sin_link`, pero **cuántos días** es una decisión de negocio que nadie tomó, y
  // poner un número acá para que la clave "quede completa" sería inventarlo (`CLAUDE.md` §4).
  // La clave existe para que la decisión se tome editando una celda, no el código.
  ventana_candidatos_anclaje_ampliada_dias: '',
  // T2.1.1 (06/08): el reloj de la corrida. Mismo patrón que el umbral — helper
  // como único lector en Generador.gs, constante de módulo sólo como default.
  // Bajar `presupuesto_corrida_seg` a 60 desde la hoja es la forma barata de
  // probar el corte sin esperar a que la plataforma mate la corrida.
  //
  // 350 NO es un número medido: es el techo duro de Apps Script (360 s) menos lo
  // que el llamador de menú gasta antes de entrar (~2 s) y un colchón.
  presupuesto_corrida_seg: '350',
  // 30 sale del cierre medido en 0,8 s más la barrida final (~6 s reusando el
  // mapa de la etapa 2) más margen: tokensPorSlide_ dio 10,8 s y 26,9 s el mismo
  // día, y la reserva es lo único que no se puede quedar corto.
  reserva_cierre_seg: '30',
  // Re-medido el 06/08 después de T2.2.2, que bajó esta llamada de ~239 s a ~36:
  // tres muestras dieron 40,6 / 30,7 / 36,3 s, y 60 deja ~48% de margen sobre el
  // máximo observado. **El valor viejo era 240**, y dejarlo habría hecho que la
  // etapa 4 no entrara nunca con el motor ya arreglado: la corrida seguiría
  // cortando ahí sin motivo. Es atómico —resolverMarcadores no acepta resolver un
  // subconjunto—, así que la única decisión posible es entrar o no entrar.
  costo_resolucion_etapa4_seg: '60'
};

/**
 * Paso 2.11 Parte C — núcleo de `seedConfiguracion()`, sin `alert()` (mismo patrón que
 * `aplicarInstalacion_()`).
 */
function aplicarSeedConfiguracion_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var vacio = { escritas: 0, actualizadas: 0, cambios: [], nuevasClaves: [] };

  var hojaBases = ss.getSheetByName('BASES');
  var resultadoBases = hojaBases ? upsertPorClave_(hojaBases, ['base_id'], SEED_BASES_) : vacio;

  var hojaMapeo = ss.getSheetByName('MAPEO');
  var resultadoMapeo = hojaMapeo ? upsertPorClave_(hojaMapeo, ['base_id', 'solapa', 'campo_logico'], SEED_MAPEO_) : vacio;

  var hojaConfig = ss.getSheetByName('CONFIG');
  var resultadoConfig = hojaConfig ? seedConfigConfig_(hojaConfig) : vacio;

  // Paso 2.11 Parte A: INFORMES y PERIODOS son config durable (como BASES/MAPEO),
  // así que se aplican con el mismo upsertPorClave_. CAMPANAS y REUNIONES no —
  // ver la nota de SEED_CAMPANAS_EJEMPLO_ más arriba.
  var hojaInformes = ss.getSheetByName('INFORMES');
  var resultadoInformes = hojaInformes ? upsertPorClave_(hojaInformes, ['informe_id'], SEED_INFORMES_) : vacio;

  var hojaPeriodos = ss.getSheetByName('PERIODOS');
  var resultadoPeriodos = hojaPeriodos ? upsertPorClave_(hojaPeriodos, ['periodo_id'], SEED_PERIODOS_) : vacio;

  var pendientes = SEED_MAPEO_
    .filter(function (fila) { return !fila.columna; })
    .map(function (fila) { return fila.base_id + '/' + fila.campo_logico; });

  return {
    bases: resultadoBases,
    mapeo: resultadoMapeo,
    config: resultadoConfig,
    informes: resultadoInformes,
    periodos: resultadoPeriodos,
    pendientes: pendientes
  };
}

function formatearResumenSeedConfiguracion_(r) {
  return 'BASES — nuevas: ' + r.bases.escritas + ', actualizadas: ' + r.bases.actualizadas + '\n' +
    'MAPEO — nuevas: ' + r.mapeo.escritas + ', actualizadas: ' + r.mapeo.actualizadas + '\n' +
    'CONFIG — nuevas: ' + r.config.escritas + ', completadas: ' + r.config.actualizadas + '\n' +
    'INFORMES — nuevas: ' + r.informes.escritas + ', actualizadas: ' + r.informes.actualizadas + '\n' +
    'PERIODOS — nuevas: ' + r.periodos.escritas + ', actualizadas: ' + r.periodos.actualizadas +
    (r.pendientes.length
      ? '\n\n⚠️ Pendientes de confirmar columna en MAPEO: ' + r.pendientes.join(', ')
      : '');
}

function seedConfiguracion() {
  var resultado = aplicarSeedConfiguracion_();
  var ui = ui_();
  var texto = formatearResumenSeedConfiguracion_(resultado);
  ui.alert('Config inicial cargada', texto, ui.ButtonSet.OK);
  return texto;
}

/**
 * Paso 2.11 Parte C — compara `filaObjetos` contra lo que YA hay en `hoja`, por clave
 * compuesta, SIN escribir nada. Es la base de `upsertPorClave_` (que aplica el
 * resultado) y de `menuEstadoConfiguracion_()` (que solo lo muestra). Antes,
 * `upsertPorClave_` reescribía toda fila existente sin comparar — "actualizada" no
 * distinguía "cambió de verdad" de "se volvió a escribir lo mismo", así que correr
 * "Aplicar configuración" dos veces seguidas nunca podía dar "sin cambios" (el criterio
 * de aceptación de esta parte) y un conteo como "MAPEO — actualizadas: 106" no decía
 * nada sobre qué de esos 106 era real.
 * Compara solo las columnas que cada objeto declara (`h in obj`): un objeto que no trae
 * `notas` no compite con lo que haya en esa celda. Comparación por `String()` — no
 * marca cambio una diferencia de tipo (número vs texto) que Sheets ya resuelve sola —
 * salvo en las columnas declaradas en COLUMNAS_FECHA_REGISTRO_, que se comparan vía
 * `normalizarParaComparar_` (Paso 2.11 Parte C.2-1): el seed escribe string ISO, Sheets
 * lo reparsea a Date, y sin normalizar cada corrida veía Date contra string, reportaba
 * cambio y reescribía — el paso 4 del protocolo (idempotencia) no podía pasar nunca.
 */

// Paso 2.11 Parte C.2-1 — qué columnas de qué hoja de registro llevan fecha.
// Solo afecta la COMPARACIÓN del diff (nunca se escribe el valor normalizado).
var COLUMNAS_FECHA_REGISTRO_ = {
  PERIODOS: { desde: true, hasta: true },
  CAMPANAS: { desde: true, hasta: true },
  REUNIONES: { fecha: true }
};

/**
 * Lleva Date y string-fecha a la misma representación canónica (ISO yyyy-mm-dd,
 * sin hora, sin zona) para que el diff no vea cambio donde solo hay diferencia de
 * tipo. Estricta a propósito: un string solo se canonicaliza si es EXACTAMENTE una
 * fecha (`2026-06-01` o `1/06/2026`) — `'2026-06-01 v2'` queda como texto, porque
 * normalizarlo taparía un cambio real en una nota. Con tipoColumna distinto de
 * 'fecha' reproduce la comparación por String() de siempre.
 */
function normalizarParaComparar_(valor, tipoColumna) {
  if (valor === null || valor === undefined) return '';
  if (tipoColumna === 'fecha') {
    var y, m, d;
    if (valor instanceof Date && !isNaN(valor.getTime())) {
      y = valor.getFullYear(); m = valor.getMonth() + 1; d = valor.getDate();
    } else if (typeof valor === 'string') {
      var iso = valor.trim().match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
      var dmy = valor.trim().match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/);
      if (iso) { y = Number(iso[1]); m = Number(iso[2]); d = Number(iso[3]); }
      else if (dmy) { d = Number(dmy[1]); m = Number(dmy[2]); y = Number(dmy[3]); if (y < 100) y += 2000; }
    }
    if (y !== undefined) {
      return y + '-' + (m < 10 ? '0' : '') + m + '-' + (d < 10 ? '0' : '') + d;
    }
  }
  return String(valor);
}

function calcularDiffUpsert_(hoja, clavesNombres, filaObjetos) {
  var datos = hoja.getDataRange().getValues();
  var headers = datos[0];
  var indices = {};
  headers.forEach(function (h, i) { indices[h] = i; });
  var columnasFecha = COLUMNAS_FECHA_REGISTRO_[hoja.getName()] || {};

  function claveDeFila(fila) {
    return clavesNombres.map(function (k) { return fila[indices[k]]; }).join('||');
  }
  function claveDeObjeto(obj) {
    return clavesNombres.map(function (k) { return obj[k]; }).join('||');
  }

  var filaPorClave = {};
  for (var f = 1; f < datos.length; f++) {
    var clave = claveDeFila(datos[f]);
    if (clave) filaPorClave[clave] = f + 1; // número de fila real en la hoja (1-based)
  }

  var nuevas = [];
  var cambios = []; // { clave, fila, columna, anterior, nuevo }
  var clavesConCambios = {};
  var clavesDelSeed = {};

  filaObjetos.forEach(function (obj) {
    var clave = claveDeObjeto(obj);
    clavesDelSeed[clave] = true;
    var filaNum = filaPorClave[clave];

    if (!filaNum) {
      nuevas.push({ clave: clave, obj: obj });
      return;
    }

    var filaActual = datos[filaNum - 1];
    Object.keys(obj).forEach(function (h) {
      if (indices[h] === undefined) return;
      var anterior = filaActual[indices[h]];
      var nuevo = obj[h];
      var tipoColumna = columnasFecha[h] ? 'fecha' : '';
      if (normalizarParaComparar_(anterior, tipoColumna) !== normalizarParaComparar_(nuevo, tipoColumna)) {
        cambios.push({ clave: clave, fila: filaNum, columna: h, anterior: anterior, nuevo: nuevo });
        clavesConCambios[clave] = true;
      }
    });
  });

  // C.2-5 — lo que está en la hoja y NO en el seed. Un diff de upsert por clave reporta
  // cambiadas y agregadas y omite esto en silencio, que es justo donde viven las ediciones
  // a mano: la fila `ahhh` del control positivo vivió tres corridas sin que nadie la
  // nombrara. **No se borra nada** — solo se reporta.
  var soloEnHoja = [];
  Object.keys(filaPorClave).forEach(function (clave) {
    if (!clavesDelSeed[clave]) soloEnHoja.push({ clave: clave, fila: filaPorClave[clave] });
  });

  return {
    headers: headers,
    filaPorClave: filaPorClave,
    nuevas: nuevas,
    cambios: cambios,
    clavesConCambios: clavesConCambios,
    soloEnHoja: soloEnHoja
  };
}

/**
 * Upsert genérico por clave compuesta: si ya hay una fila con esa clave y algo
 * REALMENTE cambió, la reescribe; si no, no la toca (Paso 2.11 Parte C — antes
 * reescribía siempre, ver `calcularDiffUpsert_`). Si la clave no existe, la agrega al
 * final. No toca ni borra filas cuya clave no está en `filaObjetos` (respeta lo que
 * haya cargado el usuario).
 */
function upsertPorClave_(hoja, clavesNombres, filaObjetos) {
  var diff = calcularDiffUpsert_(hoja, clavesNombres, filaObjetos);
  var headers = diff.headers;

  if (diff.nuevas.length) {
    var filasNuevas = diff.nuevas.map(function (n) {
      return headers.map(function (h) { return (h in n.obj) ? n.obj[h] : ''; });
    });
    hoja.getRange(hoja.getLastRow() + 1, 1, filasNuevas.length, headers.length).setValues(filasNuevas);
  }

  var actualizadas = 0;
  filaObjetos.forEach(function (obj) {
    var clave = clavesNombres.map(function (k) { return obj[k]; }).join('||');
    if (!diff.clavesConCambios[clave]) return;
    var filaNum = diff.filaPorClave[clave];
    var valores = headers.map(function (h) { return (h in obj) ? obj[h] : ''; });
    hoja.getRange(filaNum, 1, 1, headers.length).setValues([valores]);
    actualizadas++;
  });

  return {
    escritas: diff.nuevas.length,
    actualizadas: actualizadas,
    cambios: diff.cambios,
    nuevasClaves: diff.nuevas.map(function (n) { return n.clave; }),
    soloEnHoja: diff.soloEnHoja // C.2-5: se reporta, nunca se borra
  };
}

/**
 * Paso 1.6 — registrar plantillas desde la carpeta de Drive.
 * Ver docs/Prompts/Paso-1.6.md y docs/Prompts/Paso-1.6-v2.md.
 * El folderId sale de CONFIG.carpeta_plantillas (leerConfig()), no de una
 * constante: agregar una base/carpeta no debe pedir clasp push.
 */

// Matcheo nombre de Slides -> informe_id. El primero que matchee gana, así que
// SECCO va antes de JM (un nombre con ambas palabras cae en SECCO).
var MATCHEO_PLANTILLAS_ = [
  { patron: /SECCO/i, informeId: 'secco' },
  { patron: /JM/i, informeId: 'jm' }
];

function matchearInformeId_(nombreArchivo) {
  for (var i = 0; i < MATCHEO_PLANTILLAS_.length; i++) {
    if (MATCHEO_PLANTILLAS_[i].patron.test(nombreArchivo)) {
      return MATCHEO_PLANTILLAS_[i].informeId;
    }
  }
  return null;
}

// Profundidad máxima de recorrido de subcarpetas (getFilesByType no es
// recursivo; las plantillas a veces terminan en una subcarpeta al compartir
// entre las dos cuentas).
var PROFUNDIDAD_MAX_PLANTILLAS_ = 2;

// MIME de acceso directo de Drive: no tiene constante en el enum MimeType.
var MIME_SHORTCUT_ = 'application/vnd.google-apps.shortcut';

function registrarPlantillasDesdeCarpeta(folderId) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var hojaInformes = ss.getSheetByName('INFORMES');
  if (!hojaInformes) {
    return { ok: false, motivo: 'La hoja INFORMES no existe. Corré "Instalar / reparar hojas" primero.' };
  }

  var carpeta;
  try {
    carpeta = DriveApp.getFolderById(folderId);
  } catch (e) {
    return { ok: false, motivo: 'No se pudo abrir la carpeta "' + folderId + '": ' + e.message };
  }

  var datos = hojaInformes.getDataRange().getValues();
  var headers = datos[0];
  var idxInformeId = headers.indexOf('informe_id');
  var idxPlantillaId = headers.indexOf('plantilla_id');

  var filaPorInformeId = {};
  for (var f = 1; f < datos.length; f++) {
    var id = datos[f][idxInformeId];
    if (id) filaPorInformeId[id] = f + 1;
  }

  var resultado = {
    ok: true,
    asignados: [],
    sinInforme: [],
    sinAsignar: [],
    pptxSinConvertir: [],
    accesosDirectos: [],
    conflictos: [],
    totalArchivosVistos: 0
  };

  recorrerCarpetaPlantillas_(carpeta, 0, filaPorInformeId, hojaInformes, idxPlantillaId, resultado);

  return resultado;
}

function recorrerCarpetaPlantillas_(carpeta, profundidad, filaPorInformeId, hojaInformes, idxPlantillaId, resultado) {
  var archivos = carpeta.getFiles();
  while (archivos.hasNext()) {
    var archivo = archivos.next();
    resultado.totalArchivosVistos++;
    clasificarArchivoPlantilla_(archivo, filaPorInformeId, hojaInformes, idxPlantillaId, resultado);
  }

  if (profundidad < PROFUNDIDAD_MAX_PLANTILLAS_) {
    var subcarpetas = carpeta.getFolders();
    while (subcarpetas.hasNext()) {
      recorrerCarpetaPlantillas_(subcarpetas.next(), profundidad + 1, filaPorInformeId, hojaInformes, idxPlantillaId, resultado);
    }
  }
}

function clasificarArchivoPlantilla_(archivo, filaPorInformeId, hojaInformes, idxPlantillaId, resultado) {
  var nombre = archivo.getName();
  var mime = archivo.getMimeType();

  if (mime === MimeType.MICROSOFT_POWERPOINT) {
    resultado.pptxSinConvertir.push(nombre);
    return;
  }
  if (mime === MIME_SHORTCUT_) {
    resultado.accesosDirectos.push(nombre);
    return;
  }
  if (mime !== MimeType.GOOGLE_SLIDES) {
    return; // cualquier otro tipo: ignorar en silencio
  }

  var informeId = matchearInformeId_(nombre);
  if (!informeId) {
    resultado.sinAsignar.push(nombre);
    return;
  }

  var filaNum = filaPorInformeId[informeId];
  if (!filaNum) {
    resultado.sinInforme.push(informeId + ' (' + nombre + ')');
    return;
  }

  var idActual = hojaInformes.getRange(filaNum, idxPlantillaId + 1).getValue();
  if (idActual && idActual !== archivo.getId()) {
    resultado.conflictos.push(informeId + ' — ya tiene "' + idActual + '", se encontró "' + archivo.getId() + '" (' + nombre + ')');
    return;
  }

  hojaInformes.getRange(filaNum, idxPlantillaId + 1).setValue(archivo.getId());
  resultado.asignados.push({ informeId: informeId, nombre: nombre, plantillaId: archivo.getId() });
}

/**
 * Paso 1.6 v2 (Parte B) — diagnóstico de la carpeta de plantillas.
 * `getFilesByType(GOOGLE_SLIDES)` falla en silencio si hay .pptx sin convertir,
 * accesos directos, o si las plantillas están en una subcarpeta. Este helper
 * recorre TODO (sin filtrar por tipo) para ver qué hay realmente antes de
 * intentar registrar.
 */
function diagnosticarCarpetaPlantillas_(folderId) {
  var carpeta;
  try {
    carpeta = DriveApp.getFolderById(folderId);
  } catch (e) {
    return { ok: false, motivo: 'No se pudo abrir la carpeta "' + folderId + '": ' + e.message };
  }

  var archivos = [];
  var iterArchivos = carpeta.getFiles();
  while (iterArchivos.hasNext()) {
    var archivo = iterArchivos.next();
    archivos.push(archivo.getName() + ' · ' + archivo.getMimeType() + ' · ' + archivo.getId());
  }

  var subcarpetas = [];
  var iterCarpetas = carpeta.getFolders();
  while (iterCarpetas.hasNext()) {
    var sub = iterCarpetas.next();
    subcarpetas.push(sub.getName() + ' · ' + sub.getId());
  }

  return { ok: true, nombreCarpeta: carpeta.getName(), archivos: archivos, subcarpetas: subcarpetas };
}

function menuDiagnosticarCarpetaPlantillas_() {
  var ui = ui_();
  var folderId = leerConfig().carpeta_plantillas;

  if (!folderId) {
    ui.alert('Falta configuración', 'Cargá "carpeta_plantillas" en CONFIG antes de diagnosticar.', ui.ButtonSet.OK);
    return;
  }

  var resultado = diagnosticarCarpetaPlantillas_(folderId);
  if (!resultado.ok) {
    ui.alert('No se pudo diagnosticar', resultado.motivo, ui.ButtonSet.OK);
    return;
  }

  var lineas = ['Carpeta: ' + resultado.nombreCarpeta, ''];
  lineas.push('Archivos (' + resultado.archivos.length + '):');
  lineas = lineas.concat(resultado.archivos.length ? resultado.archivos : ['(ninguno)']);
  lineas.push('');
  lineas.push('Subcarpetas (' + resultado.subcarpetas.length + '):');
  lineas = lineas.concat(resultado.subcarpetas.length ? resultado.subcarpetas : ['(ninguna)']);

  ui.alert('Diagnóstico de carpeta de plantillas', lineas.join('\n'), ui.ButtonSet.OK);
}

function menuRegistrarPlantillas_() {
  var ui = ui_();
  var folderId = leerConfig().carpeta_plantillas;

  if (!folderId) {
    ui.alert('Falta configuración', 'Cargá "carpeta_plantillas" en CONFIG antes de registrar plantillas.', ui.ButtonSet.OK);
    return;
  }

  var resultado = registrarPlantillasDesdeCarpeta(folderId);

  if (!resultado.ok) {
    ui.alert('No se pudo registrar', resultado.motivo, ui.ButtonSet.OK);
    return;
  }

  if (resultado.totalArchivosVistos === 0) {
    ui.alert('Plantillas registradas', 'La carpeta está vacía o el robot no ve su contenido.', ui.ButtonSet.OK);
    return;
  }

  var lineas = [];
  resultado.asignados.forEach(function (item) {
    lineas.push('✅ ' + item.informeId + ' ← ' + item.nombre);
  });
  resultado.pptxSinConvertir.forEach(function (nombre) {
    lineas.push('⚠ ' + nombre + ' es .pptx — convertir a Google Slides nativo (Drive → Abrir con Presentaciones de Google → Archivo → Guardar como Presentaciones de Google)');
  });
  resultado.accesosDirectos.forEach(function (nombre) {
    lineas.push('⚠ ' + nombre + ' es un acceso directo — poner el archivo real en la carpeta o compartirlo directo con el robot');
  });
  resultado.conflictos.forEach(function (item) {
    lineas.push('⚠ conflicto de ID en ' + item);
  });
  resultado.sinAsignar.forEach(function (nombre) {
    lineas.push('— Sin match de nombre: ' + nombre);
  });
  resultado.sinInforme.forEach(function (item) {
    lineas.push('— Sin fila en INFORMES para: ' + item);
  });

  var resumen = lineas.length ? lineas.join('\n') : 'No se encontraron Slides, .pptx ni accesos directos en la carpeta.';
  ui.alert('Plantillas registradas', resumen, ui.ButtonSet.OK);
}

/**
 * CONFIG es distinto: solo completa claves ausentes o vacías, nunca pisa un
 * valor que el usuario ya haya cargado a mano.
 */
function seedConfigConfig_(hoja) {
  var datos = hoja.getDataRange().getValues();
  var headers = datos[0];
  var idxClave = headers.indexOf('clave');
  var idxValor = headers.indexOf('valor');

  var filaPorClave = {};
  for (var f = 1; f < datos.length; f++) {
    var clave = datos[f][idxClave];
    if (clave) filaPorClave[clave] = f + 1;
  }

  var escritas = 0;
  var actualizadas = 0;
  var cambios = []; // Paso 2.11 Parte C — { clave, columna:'valor', anterior, nuevo }
  var nuevasClaves = [];

  Object.keys(SEED_CONFIG_DEFAULTS_).forEach(function (clave) {
    var valorDefault = SEED_CONFIG_DEFAULTS_[clave];
    var fila = filaPorClave[clave];

    if (!fila) {
      hoja.appendRow([clave, valorDefault]);
      escritas++;
      nuevasClaves.push(clave);
      return;
    }

    var valorActual = hoja.getRange(fila, idxValor + 1).getValue();
    if ((valorActual === '' || valorActual === null) && valorDefault !== '') {
      hoja.getRange(fila, idxValor + 1).setValue(valorDefault);
      cambios.push({ clave: clave, fila: fila, columna: 'valor', anterior: valorActual, nuevo: valorDefault });
      actualizadas++;
    }
  });

  return { escritas: escritas, actualizadas: actualizadas, cambios: cambios, nuevasClaves: nuevasClaves };
}

/**
 * Paso 2.9G v2 — árbol de `SECCIONES`, verificado contra tres informes
 * publicados (docs/SECCIONES.md). `laminas` NO es una columna: cuántas
 * láminas salen es el resultado de qué sub-secciones se activaron, no un dato
 * de configuración fijo.
 * `estado`: `activa` (el motor la emite) / `manual` (existe en informes
 * reales, hoy la llena una persona) / `revisar` (registrada, atributo sin
 * confirmar). Regla dura: ninguna fila con `estado` distinto de `activa`
 * puede tener `falta` vacío.
 */
function filaSeccion_(datos) {
  return {
    seccion_id: datos.id,
    padre: datos.padre || '',
    orden: datos.orden,
    nombre: datos.nombre,
    informes: datos.informes,
    modo: datos.modo,
    itera_sobre: datos.itera || '',
    filtro: datos.filtro || '',
    opcional: datos.opcional || 'no',
    condicion: datos.condicion || '',
    familia_tokens: datos.familia || '',
    estado: datos.estado || 'activa',
    falta: datos.falta || '',
    // `A.10`/`B.2` (07/08) — cuántos ítems entran en una lámina de esta sección.
    // **Vacío es un valor válido y significa el comportamiento de hoy**: una lámina por ítem.
    // Sólo se declara donde la lámina agrupa. Nadie lo consume todavía (`T2.10`).
    items_por_lamina: datos.itemsPorLamina || '',
    notas: datos.notas || ''
  };
}

var SEED_SECCIONES_ = [
  // Primer nivel
  filaSeccion_({ id: 'portada', orden: 1, nombre: 'Portada', informes: 'JM,SECCO', modo: 'unica' }),
  filaSeccion_({ id: 'indice', orden: 2, nombre: 'Índice', informes: 'SECCO', modo: 'unica' }),
  // `B.3` (07/08) — pasó de `repetible` a `unica`, y de `itera: entidad (JM / GCBA)` a nada.
  // **Está medido que no puede ser repetible**: los tokens de GCBA llevan **prefijo propio**
  // (`gcba_mail_envios`, `gcba_imp_total`…), así que las dos láminas no son una lámina modelo
  // iterada sobre dos entidades — son dos láminas con tokens distintos, la 2 y la 3.
  // **No cambia ningún comportamiento:** la fila nunca entró a `seccionesRepetiblesDe_`
  // porque no declara `familia_tokens`, así que `repetible` era una etiqueta que no hacía
  // nada y contradecía lo medido. Se corrige la etiqueta.
  filaSeccion_({ id: 'resumen_ejecutivo', orden: 3, nombre: 'Resumen Ejecutivo', informes: 'JM', modo: 'unica', estado: 'manual', falta: 'es redacción, no dato' }),
  filaSeccion_({ id: 'analisis_comparativo', orden: 4, nombre: 'Análisis comparativo Imagen (interanual)', informes: 'SECCO', modo: 'repetible', itera: 'red social', estado: 'manual', falta: 'sin marcar en la plantilla; fuente de la serie interanual' }),
  filaSeccion_({ id: 'semana_jm_conversacion', orden: 5, nombre: 'Semana JM — conversación X', informes: 'SECCO', modo: 'unica' }),
  filaSeccion_({ id: 'miba', orden: 6, nombre: 'Integración MiBA', informes: 'SECCO', modo: 'unica', estado: 'manual', falta: 'fuente sin definir en el motor; el bloque ya se publica lleno a mano' }),
  filaSeccion_({ id: 'portada_digital_directa', orden: 7, nombre: 'Portada Digital/Directa', informes: 'JM,SECCO', modo: 'unica' }),
  // `Pedido-4` Parte A (05/08) — la lámina del alcance semanal por herramienta. Hermana de
  // `encuentro` y en modo `agregado`: **que no itere sobre `REUNIONES` es todo el punto.**
  // `orden: 7.5` a propósito, para no renumerar ninguna fila curada — la sección va entre la
  // portada de Digital/Directa y el bloque de encuentro, que es donde está la lámina.
  // La familia lista los **10 tokens exactos** de agregado semanal puro en vez del prefijo
  // `ecv_`: el prefijo se llevaría también los 7 ambiguos y los 2 de encuentro, que viven en
  // la lámina del iceberg y no acá. Un token completo es un prefijo válido de sí mismo
  // (`tokenEsDeFamilia_` compara con `indexOf(f) === 0`), así que la semántica no cambia.
  // ⚠ `ecv_barrio` NO está en la lista y no puede estarlo: es prefijo de `ecv_barrio1/2/3`.
  filaSeccion_({ id: 'ecv_alcance_semanal', orden: 7.5, nombre: 'Encuentros con vecinos — alcance semanal por herramienta', informes: 'JM,SECCO', modo: 'agregado',
    familia: 'ecv_encuentros,ecv_barrios,ecv_barrio1,ecv_barrio2,ecv_barrio3,ecv_insc_mail_pct,ecv_insc_cc_pct,ecv_insc_ivr_pct,ecv_insc_digital_pct,ecv_insc_dif_pct',
    notas: 'los 10 de agregado semanal puro (Pedido-4 0bis.1). Los 7 ambiguos (ecv_inscriptos, ecv_asistentes, los cinco ecv_insc_*) quedan diferidos por la opción C del 05/08 y siguen en el bloque de encuentro' }),
  // `Pedido-4` Parte A (05/08) — la familia dice **con qué se reconoce el bloque modelo en
  // la plantilla**, y el bloque de encuentro se reconoce por `enc_`, no por `ecv_`. Decía
  // `ecv_,enc_`, y por eso `slidesModeloDe_` reclamaba también la lámina del **alcance
  // semanal** (que lleva `ecv_*` y ningún `enc_*`) y la duplicaba una vez por encuentro: en
  // el deck del 04/08, un total de la semana salió **cinco veces**. Los `ecv_` que sí viven
  // en la lámina del iceberg —los 7 ambiguos y los 2 de encuentro— siguen resolviéndose por
  // ítem sin estar en la familia: la pasada del Paso 5 recorre `tokensDeSlide_`, o sea
  // **todos** los tokens de la slide emitida, no sólo los de la familia.
  filaSeccion_({ id: 'encuentro', orden: 8, nombre: 'Bloque de encuentro', informes: 'JM,SECCO', modo: 'repetible', itera: 'REUNIONES', familia: 'enc_',
    notas: 'familia enc_ y no ecv_,enc_ (Pedido-4, 05/08): los ecv_ del iceberg se resuelven por ítem vía tokensDeSlide_, no por familia' }),
  // `A.9`/`A.10` (07/08) — **cuatro ranuras por lámina**, decisión del usuario. Es la única
  // sección que agrupa: su lámina es una tabla con cuatro filas, no una lámina por ítem.
  // `jm` ya tiene las cuatro; `secco` tiene tres y la cuarta **no se puede agregar todavía**
  // (`D-22`: el motor no sabe insertar filas en una tabla de Slides).
  filaSeccion_({ id: 'comunicaciones_post', orden: 9, nombre: 'Comunicaciones post', informes: 'JM,SECCO', modo: 'repetible', itera: 'REUNIONES', filtro: 'etapa=post', familia: 'post_', itemsPorLamina: '4' }),
  filaSeccion_({ id: 'impacto_comunicacional', orden: 10, nombre: 'Semana JM — Impacto comunicacional', informes: 'SECCO', modo: 'unica', estado: 'manual', falta: 'sin marcar en la plantilla' }),
  filaSeccion_({ id: 'ministros', orden: 11, nombre: 'Encuentros de ministros', informes: 'SECCO', modo: 'agregado', familia: 'emin_' }),
  filaSeccion_({ id: 'm2', orden: 12, nombre: 'M2', informes: 'JM,SECCO', modo: 'agregado', familia: 'm2_' }),
  filaSeccion_({ id: 'campana', orden: 13, nombre: 'Campaña destacada', informes: 'JM,SECCO', modo: 'repetible', itera: 'CAMPANAS', familia: 'camp_' }),
  filaSeccion_({ id: 'nuevos_proveedores', orden: 14, nombre: 'Nuevos Proveedores', informes: 'SECCO', modo: 'repetible', itera: 'proveedor', estado: 'manual', falta: 'sin marcar; falta base de Uber / Twitch / Mercado Libre' }),
  filaSeccion_({ id: 'analisis_tematico', orden: 15, nombre: 'Análisis temático ad-hoc', informes: 'SECCO', modo: 'repetible', itera: 'tema', estado: 'manual', falta: 'ad-hoc por tema, puede no ser automatizable' }),
  filaSeccion_({ id: 'otros_temas', orden: 16, nombre: 'Otros temas', informes: 'SECCO', modo: 'unica', estado: 'manual', falta: 'sin marcar en la plantilla' }),
  filaSeccion_({ id: 'cierre', orden: 17, nombre: 'Cierre', informes: 'JM,SECCO', modo: 'unica' }),

  // Hijos de 'campana' — largo variable (3 a 21 láminas según canales usados,
  // docs/SECCIONES.md Corrección 1).
  filaSeccion_({ id: 'campana_portada', padre: 'campana', orden: 1, nombre: 'Campaña — portada', informes: 'JM,SECCO', modo: 'unica' }),
  filaSeccion_({ id: 'campana_objetivo', padre: 'campana', orden: 2, nombre: 'Campaña — objetivo y período', informes: 'JM,SECCO', modo: 'unica' }),
  filaSeccion_({ id: 'campana_herramientas', padre: 'campana', orden: 3, nombre: 'Campaña — herramientas y audiencias', informes: 'JM,SECCO', modo: 'unica' }),
  filaSeccion_({ id: 'campana_formatos', padre: 'campana', orden: 4, nombre: 'Campaña — formatos digitales implementados', informes: 'JM,SECCO', modo: 'unica', opcional: 'sí', condicion: 'hubo piezas digitales', estado: 'revisar', falta: 'condición de activación inferida de 3 informes' }),
  filaSeccion_({ id: 'campana_agregados', padre: 'campana', orden: 5, nombre: 'Campaña — resultados agregados', informes: 'JM,SECCO', modo: 'unica', opcional: 'sí', condicion: 'ya hay resultados', estado: 'revisar', falta: 'condición de activación inferida de 3 informes' }),
  filaSeccion_({ id: 'campana_audiencia', padre: 'campana', orden: 6, nombre: 'Campaña — por audiencia', informes: 'JM,SECCO', modo: 'repetible', itera: 'AUDIENCIAS', opcional: 'sí', condicion: 'la campaña se segmenta por audiencia', estado: 'revisar', falta: 'condición de activación inferida de 3 informes' }),
  filaSeccion_({ id: 'campana_desag_digital', padre: 'campana', orden: 7, nombre: 'Campaña — desagregados Digital', informes: 'JM,SECCO', modo: 'unica', opcional: 'sí', condicion: 'hubo digital', estado: 'revisar', falta: 'condición de activación inferida de 3 informes' }),
  filaSeccion_({ id: 'campana_desag_mail', padre: 'campana', orden: 8, nombre: 'Campaña — desagregados Directa: envío de mail', informes: 'JM,SECCO', modo: 'unica', opcional: 'sí', condicion: 'hubo mail', estado: 'revisar', falta: 'condición de activación inferida de 3 informes' }),
  filaSeccion_({ id: 'campana_desag_respuestas', padre: 'campana', orden: 9, nombre: 'Campaña — desagregados Directa: respuestas', informes: 'JM,SECCO', modo: 'repetible', itera: 'remitente (JM / GCBA)', opcional: 'sí', condicion: 'hubo respuestas', estado: 'revisar', falta: 'condición de activación inferida de 3 informes' }),

  // Hijos de 'campana_audiencia' — Grandes Generadores (21 láminas) repite por
  // audiencia, no por campaña (docs/SECCIONES.md Corrección 2).
  filaSeccion_({ id: 'aud_formatos', padre: 'campana_audiencia', orden: 1, nombre: 'Audiencia — formatos y resultados', informes: 'JM,SECCO', modo: 'unica', opcional: 'sí', condicion: 'la audiencia usó formatos digitales', estado: 'revisar', falta: 'condición de activación inferida de 3 informes' }),
  filaSeccion_({ id: 'aud_directa', padre: 'campana_audiencia', orden: 2, nombre: 'Audiencia — directa', informes: 'JM,SECCO', modo: 'unica', opcional: 'sí', condicion: 'la audiencia recibió directa', estado: 'revisar', falta: 'condición de activación inferida de 3 informes' }),
  filaSeccion_({ id: 'aud_contacto_ciudadano', padre: 'campana_audiencia', orden: 3, nombre: 'Audiencia — contacto ciudadano', informes: 'JM,SECCO', modo: 'unica', opcional: 'sí', condicion: 'la audiencia tuvo call center', estado: 'revisar', falta: 'condición de activación inferida de 3 informes' }),

  // Hijos de 'encuentro' — ni siquiera dos Uno a uno tienen la misma cantidad
  // de láminas (docs/SECCIONES.md Corrección 6).
  filaSeccion_({ id: 'encuentro_portada', padre: 'encuentro', orden: 1, nombre: 'Encuentro — portada', informes: 'JM,SECCO', modo: 'unica' }),
  filaSeccion_({ id: 'encuentro_estrategia', padre: 'encuentro', orden: 2, nombre: 'Encuentro — estrategia', informes: 'JM,SECCO', modo: 'unica', opcional: 'sí', condicion: 'el tipo de encuentro tiene bloque de estrategia (temático/uno a uno)', estado: 'revisar', falta: 'condición de activación inferida de 3 informes' }),
  filaSeccion_({ id: 'encuentro_iceberg', padre: 'encuentro', orden: 3, nombre: 'Encuentro — iceberg', informes: 'JM,SECCO', modo: 'unica', opcional: 'sí', condicion: 'el encuentro tiene datos de convocatoria por canal', familia: 'enc_', estado: 'revisar', falta: 'ecv_* se usa para ECV y para Uno a uno — definir si es genérico' }),
  filaSeccion_({ id: 'encuentro_resultados', padre: 'encuentro', orden: 4, nombre: 'Encuentro — resultados', informes: 'JM,SECCO', modo: 'unica', opcional: 'sí', condicion: 'hay resultados post-encuentro', estado: 'revisar', falta: 'condición de activación inferida de 3 informes' }),

  // Hijos de 'm2' — Status semanal + Caudal semanal (2-3 láminas).
  filaSeccion_({ id: 'm2_status', padre: 'm2', orden: 1, nombre: 'M2 — status semanal', informes: 'JM,SECCO', modo: 'unica', familia: 'm2_' }),
  filaSeccion_({ id: 'm2_caudal', padre: 'm2', orden: 2, nombre: 'M2 — caudal semanal', informes: 'SECCO', modo: 'unica', familia: 'm2_' })
];

/**
 * Siembra `SEED_SECCIONES_` — SOLO agrega filas de `seccion_id` que todavía no
 * existen. A diferencia de `upsertPorClave_` (BASES/MAPEO), esta siembra NUNCA
 * pisa una fila existente, sea `manual`, `revisar` o lo que sea: no hay columna
 * `origen` en `SECCIONES` para distinguir "lo escribió la siembra" de "lo tocó
 * una persona", así que la regla simple y segura es "solo agregar lo que
 * falta". Correr `instalar()` dos veces no duplica ni pisa nada (Paso 2.9G,
 * test de aceptación).
 */
function sembrarSecciones_(hoja) {
  var datos = hoja.getDataRange().getValues();
  var headers = datos[0];
  var idxId = headers.indexOf('seccion_id');
  if (idxId === -1) return { nuevas: [] };

  var existentes = {};
  for (var f = 1; f < datos.length; f++) {
    if (datos[f][idxId]) existentes[datos[f][idxId]] = true;
  }

  var nuevas = SEED_SECCIONES_.filter(function (s) { return !existentes[s.seccion_id]; });
  if (nuevas.length) {
    var filas = nuevas.map(function (s) { return headers.map(function (h) { return (h in s) ? s[h] : ''; }); });
    hoja.getRange(hoja.getLastRow() + 1, 1, filas.length, headers.length).setValues(filas);
  }
  return { nuevas: nuevas.map(function (s) { return s.seccion_id; }) };
}

/**
 * Paso 3 (v3) `D.1` — el único escritor de `MARCADORES`, y hace falta explicarlo.
 *
 * **`MARCADORES` no tiene sembrador y no lo va a tener** (`D-17`): su dueño es la plantilla,
 * y las filas las siembra el `Paso-2.5` leyendo los `{{token}}` de los Slides con
 * `upsertSoloVacias_`. Esta función **no es ese sembrador** ni compite con él: es la puerta
 * para **curar filas puntuales** —retirar las tres de ejemplo, cargar y después retirar las
 * `prueba_*` del corte vertical—, que hasta hoy se hacían a mano en la planilla.
 *
 * Por qué existe en vez de editar la hoja a mano: una curación a mano no deja traza, no es
 * idempotente y no se puede repetir en otra planilla. Ésta reporta exactamente qué quitó y
 * qué agregó.
 *
 * `quitar` es una lista de `marcador` (se van todas sus filas, de cualquier `informe_id`).
 * `agregar` es una lista de objetos con las claves de los `headers` de la hoja; se escriben
 * **respetando el orden de columnas de la hoja viva**, no un orden asumido.
 *
 * **Idempotente:** quitar lo que no está no hace nada; agregar un `(marcador, informe_id)`
 * que ya existe lo **reemplaza**, no lo duplica — la clave es el par, como fija el
 * `Paso-2.13` Parte 3.
 */
function curarMarcadores_(quitar, agregar) {
  var hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('MARCADORES');
  if (!hoja) return { ok: false, motivo: 'La hoja MARCADORES no existe.' };

  quitar = quitar || [];
  agregar = agregar || [];

  var datos = hoja.getDataRange().getValues();
  var headers = datos[0];
  var idxMarcador = headers.indexOf('marcador');
  var idxInforme = headers.indexOf('informe_id');
  if (idxMarcador === -1) return { ok: false, motivo: 'MARCADORES no tiene columna `marcador`.' };

  var clavesAgregar = {};
  agregar.forEach(function (o) { clavesAgregar[o.marcador + '||' + (o.informe_id || '')] = true; });

  // Se recorre de abajo hacia arriba: borrar de arriba corre los índices de lo que falta.
  var quitadas = [];
  for (var f = datos.length - 1; f >= 1; f--) {
    var marcador = datos[f][idxMarcador];
    if (!marcador) continue;
    var clave = marcador + '||' + (idxInforme === -1 ? '' : datos[f][idxInforme]);
    var porNombre = quitar.indexOf(marcador) !== -1;
    var porReemplazo = clavesAgregar[clave];
    if (!porNombre && !porReemplazo) continue;
    quitadas.push({
      marcador: marcador,
      informe_id: idxInforme === -1 ? '' : datos[f][idxInforme],
      motivo: porNombre ? 'retirada' : 'reemplazada'
    });
    hoja.deleteRow(f + 1);
  }

  var agregadas = [];
  if (agregar.length) {
    var filas = agregar.map(function (o) {
      return headers.map(function (h) { return (h in o) ? o[h] : ''; });
    });
    hoja.getRange(hoja.getLastRow() + 1, 1, filas.length, headers.length).setValues(filas);
    agregadas = agregar.map(function (o) { return o.marcador + ' (' + (o.informe_id || '') + ')'; });
  }

  return {
    ok: true,
    quitadas: quitadas,
    agregadas: agregadas,
    filas_finales: Math.max(hoja.getLastRow() - 1, 0)
  };
}

/**
 * `Pedido-4` Parte A (05/08) — la puerta para **corregir un campo** de una sección que ya
 * existe. Misma necesidad y misma forma que `curarMarcadores_`, y por el mismo motivo:
 * `sembrarSecciones_` **sólo agrega** y nunca pisa una fila existente, así que cambiar
 * `encuentro.familia_tokens` de `ecv_,enc_` a `enc_` no tenía ningún camino en el código —
 * sólo la mano de una persona sobre la celda, que no deja traza ni se puede repetir en otra
 * planilla.
 *
 * **Deliberadamente angosta:** no crea filas, no borra filas y no toca `seccion_id`. Sólo
 * escribe los campos declarados de una sección que ya existe, y **devuelve el antes y el
 * después de cada celda que cambió**. Una sección que no existe se reporta y no se crea:
 * crear es trabajo del sembrador, y mezclarlos es como `upsertPorClave_` terminó pisando
 * filas curadas (`P0` en `PENDIENTES`).
 *
 * `cambios` es `[{ seccion_id: 'x', campo: valor, ... }]`.
 */
function curarSecciones_(cambios) {
  var hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('SECCIONES');
  if (!hoja) return { ok: false, motivo: 'La hoja SECCIONES no existe.' };

  cambios = cambios || [];
  var datos = hoja.getDataRange().getValues();
  var headers = datos[0];
  var idxId = headers.indexOf('seccion_id');
  if (idxId === -1) return { ok: false, motivo: 'SECCIONES no tiene columna `seccion_id`.' };

  var filaDe = {};
  for (var f = 1; f < datos.length; f++) {
    if (datos[f][idxId]) filaDe[datos[f][idxId]] = f;
  }

  var aplicados = [];
  var sinFila = [];
  cambios.forEach(function (c) {
    var id = c.seccion_id;
    if (!(id in filaDe)) { sinFila.push(id); return; }
    var f = filaDe[id];
    Object.keys(c).forEach(function (campo) {
      if (campo === 'seccion_id') return;
      var col = headers.indexOf(campo);
      if (col === -1) { sinFila.push(id + '.' + campo + ' (columna inexistente)'); return; }
      var anterior = datos[f][col];
      if (String(anterior) === String(c[campo])) return; // ya estaba: no se escribe
      hoja.getRange(f + 1, col + 1).setValue(c[campo]);
      aplicados.push({ seccion_id: id, campo: campo, anterior: anterior, nuevo: c[campo] });
    });
  });

  return { ok: true, aplicados: aplicados, sin_fila: sinFila, cambios_escritos: aplicados.length };
}

/**
 * `B.1` de las once respuestas (07/08) — la puerta para **corregir un campo** de un marcador
 * que ya existe. Es a `MARCADORES` lo que `curarSecciones_` es a `SECCIONES`, y nace por la
 * misma falta: `curarMarcadores_` **agrega y quita filas enteras**, y cambiar el `formato` de
 * nueve filas con esa herramienta las borra y las vuelve a escribir al final de la hoja —
 * mucho movimiento para cambiar una celda, y con riesgo de perder lo que no se le pase.
 *
 * **Deliberadamente angosta**, igual que su gemela: no crea filas, no borra filas y no toca
 * `marcador` ni `informe_id`. Sólo escribe los campos declarados de un marcador que ya existe,
 * y **devuelve el antes y el después de cada celda que cambió**. Un marcador que no existe se
 * reporta y no se crea: crear filas de `MARCADORES` es de la plantilla (`D-17`, `Paso-2.5`).
 *
 * La clave es `marcador` + `informe_id`, la misma que usa `curarMarcadores_`: el mismo nombre
 * de token puede estar cableado distinto en dos informes.
 *
 * `cambios` es `[{ marcador: 'x', informe_id: 'jm', formato: 'porcentaje_sin_signo' }]`.
 */
function curarCamposMarcadores_(cambios) {
  var hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('MARCADORES');
  if (!hoja) return { ok: false, motivo: 'La hoja MARCADORES no existe.' };

  cambios = cambios || [];
  var datos = hoja.getDataRange().getValues();
  var headers = datos[0];
  var idxMarcador = headers.indexOf('marcador');
  var idxInforme = headers.indexOf('informe_id');
  if (idxMarcador === -1) return { ok: false, motivo: 'MARCADORES no tiene columna `marcador`.' };

  var filaDe = {};
  for (var f = 1; f < datos.length; f++) {
    if (!datos[f][idxMarcador]) continue;
    var clave = datos[f][idxMarcador] + '||' + (idxInforme === -1 ? '' : datos[f][idxInforme]);
    filaDe[clave] = f;
  }

  var aplicados = [];
  var sinFila = [];
  cambios.forEach(function (c) {
    var clave = c.marcador + '||' + (c.informe_id || '');
    if (!(clave in filaDe)) { sinFila.push(clave); return; }
    var fila = filaDe[clave];
    Object.keys(c).forEach(function (campo) {
      if (campo === 'marcador' || campo === 'informe_id') return;
      var col = headers.indexOf(campo);
      if (col === -1) { sinFila.push(clave + '.' + campo + ' (columna inexistente)'); return; }
      var anterior = datos[fila][col];
      if (String(anterior) === String(c[campo])) return; // ya estaba: no se escribe
      hoja.getRange(fila + 1, col + 1).setValue(c[campo]);
      aplicados.push({ marcador: c.marcador, informe_id: c.informe_id || '', campo: campo, anterior: anterior, nuevo: c[campo] });
    });
  });

  return { ok: true, aplicados: aplicados, sin_fila: sinFila, cambios_escritos: aplicados.length };
}

/**
 * `A.7` / `B.1` de las once respuestas (07/08) — los nueve porcentajes que van **sin signo**.
 *
 * Las nueve cajas de las plantillas **traen su propio `%`**, verificado una por una contra el
 * deck de `jm-20260806-222554`; el caso que lo demuestra es `ivr_at_pct`, que estuvo a punto de
 * quedar afuera por suponer lo contrario sin mirar:
 * `Atendidos: «FALTA:ivr_atendidos» («FALTA:ivr_at_pct»%)`.
 *
 * Estaban con `formato = numero` como parche declarado desde el 05/08 —*"falta el formato
 * 'unidades de pct sin signo'"*— y `numero` redondea a **dos** decimales donde el resto del
 * deck muestra **uno**, así que la misma lámina mezclaba precisiones.
 *
 * **Cambia números publicados** (`25.42` → `25.4`) y por eso es una decisión del usuario, no
 * una migración de higiene: se ejecutó el 07/08 con su autorización explícita.
 *
 * Idempotente: `curarCamposMarcadores_` no escribe lo que ya está.
 */
var MARCADORES_PORCENTAJE_SIN_SIGNO_ = [
  'ecv_insc_mail_pct', 'ecv_insc_cc_pct', 'ecv_insc_ivr_pct', 'ecv_insc_digital_pct',
  'ecv_insc_dif_pct', 'enc_e75_pct', 'mail_or', 'gcba_mail_or', 'ivr_at_pct'
];

function migrarFormatoPorcentajeSinSigno_(informeId) {
  informeId = informeId || 'jm';
  return curarCamposMarcadores_(MARCADORES_PORCENTAJE_SIN_SIGNO_.map(function (m) {
    return { marcador: m, informe_id: informeId, formato: 'porcentaje_sin_signo' };
  }));
}

function menuSembrarSecciones_() {
  var ui = ui_();
  var hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('SECCIONES');
  if (!hoja) {
    ui.alert('No se pudo sembrar', 'La hoja SECCIONES no existe. Corré "Instalar / reparar hojas" primero.', ui.ButtonSet.OK);
    return;
  }
  var resultado = sembrarSecciones_(hoja);
  ui.alert('Secciones sembradas', 'Filas nuevas agregadas: ' + resultado.nuevas.length + ' (las existentes no se tocaron).', ui.ButtonSet.OK);
}

/**
 * Paso 2.11 Parte C — "Aplicar configuración": corre los cuatro sembradores en el
 * único orden en que tiene sentido correrlos (las hojas tienen que existir antes de
 * sembrarlas, y SOLAPAS antes que nada que dependa de `uso=fuente`) y arma UN reporte
 * combinado. Antes había cuatro ítems de menú sin orden escrito, y correr uno después
 * de otro podía revertir en silencio lo que el anterior acababa de aplicar — es
 * literalmente lo que le pasó a `m2.hoja_default` en el Paso 2.10 Parte C (ver
 * docs/Prompts/Paso-2.11_una_sola_fuente_de_verdad.md, "La evidencia").
 *
 * El reporte es un DIFF, no un conteo (tarea 2 del prompt): "MAPEO — actualizadas: 106"
 * no dice si eso es lo que se quería. El detalle completo (clave, columna, de qué valor
 * a qué valor) se escribe en la hoja `DIFF_CONFIGURACION` — un `alert()` con cientos de
 * líneas es el mismo modo de falla que ya rompió `diagnosticarColapso_()` por timeout
 * (Auditoria.gs) — y el `alert()` que ve el usuario es un resumen de conteos con
 * puntero a esa hoja.
 */
function menuAplicarConfiguracion_() {
  var ui = ui_();

  var resultadoInstalar = aplicarInstalacion_();
  var resultadoSeed = aplicarSeedConfiguracion_();
  var resultadoSolapas = aplicarClasificacionSolapas_();
  var hojaSecciones = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('SECCIONES');
  var resultadoSecciones = hojaSecciones ? sembrarSecciones_(hojaSecciones) : { nuevas: [] };

  var migraciones = resultadoInstalar.migraciones;
  var filasDiff = [].concat(
    filasDiffMigraciones_(migraciones),
    filasDiffParaHoja_('BASES', resultadoSeed.bases),
    filasDiffParaHoja_('MAPEO', resultadoSeed.mapeo),
    filasDiffParaHoja_('CONFIG', resultadoSeed.config),
    filasDiffParaHoja_('INFORMES', resultadoSeed.informes),
    filasDiffParaHoja_('PERIODOS', resultadoSeed.periodos),
    resultadoSolapas.ok
      ? filasDiffParaHoja_('SOLAPAS', resultadoSolapas, clavesTocadasPorMigracion_(migraciones, 'SOLAPAS'))
      : [],
    resultadoSecciones.nuevas.map(function (id) { return ['SECCIONES', 'nueva', id, '', '', '']; })
  );

  var ssActiva = SpreadsheetApp.getActiveSpreadsheet();
  var filasAlcance = construirBloqueAlcance_(ALCANCE_REGISTROS_, function (n) {
    return ssActiva.getSheetByName(n);
  });
  escribirDiffConfiguracion_(filasDiff, 'DIFF_CONFIGURACION', 'menuAplicarConfiguracion_', filasAlcance);

  var resumen =
    formatearResumenInstalacion_(resultadoInstalar) + '\n\n' +
    '— — —\n' +
    resumenDesagregado_(filasDiff) +
    (resultadoSeed.pendientes.length
      ? '\n\n⚠️ Pendientes de confirmar columna en MAPEO: ' + resultadoSeed.pendientes.join(', ')
      : '') +
    (filasDiff.length
      ? '\n\nDetalle completo (clave, columna, de qué valor a qué valor) en la hoja DIFF_CONFIGURACION.'
      : '\n\nSin cambios — la configuración de la planilla ya coincide con el código.') +
    '\n\nQué se auditó y qué no: bloque ALCANCE, arriba en esa misma hoja.';

  ui.alert('Aplicar configuración', resumen, ui.ButtonSet.OK);
  return resumen; // Paso 2.14: por API el reporte va en el retorno, no en la pantalla
}

/**
 * C.2-6 — un solo total es lo que trajo el problema hasta acá: "MAPEO — actualizadas:
 * 106" no distinguía nada, y "celdas cambiadas: 1" no decía si era un cambio real, una
 * migración o una protegida. Cada categoría se cuenta aparte.
 *
 * **No lista claves**: el detalle va a la hoja. Un `alert()` con cientos de líneas es el
 * mismo modo de falla que ya rompió `diagnosticarColapso_()` por timeout.
 */
function resumenDesagregado_(filasDiff) {
  var cuenta = function (predicado) {
    return filasDiff.filter(function (f) { return predicado(String(f[1])); }).length;
  };
  var categorias = [
    ['cambiadas', cuenta(function (t) { return t === 'cambio'; })],
    ['agregadas', cuenta(function (t) { return t === 'nueva'; })],
    ['migraciones', cuenta(function (t) { return t.indexOf('migracion') === 0; })],
    ['solo_en_hoja', cuenta(function (t) { return t === 'solo_en_hoja'; })],
    ['protegidas (con diferencia)', cuenta(function (t) { return t.indexOf('protegida (habría cambiado)') === 0; })],
    ['protegidas (sin diferencia)', cuenta(function (t) { return t.indexOf('protegida (sin diferencias)') === 0; })]
  ];
  var lineas = categorias.map(function (c) { return c[0] + ': ' + c[1]; });
  var totalReportado = categorias.reduce(function (a, c) { return a + c[1]; }, 0);
  // "sin cambios" no es una fila del diff: es la ausencia de las dos primeras categorías.
  // Se declara igual, para que el resumen no dependa de leer un cero entre otros.
  lineas.push('sin cambios: ' + ((categorias[0][1] + categorias[1][1] + categorias[2][1]) === 0 ? 'sí' : 'no'));
  // Cualquier tipo que no entre en las categorías de arriba se cuenta aparte en vez de
  // desaparecer del resumen — un total que no cierra tiene que verse.
  var sinCategoria = filasDiff.length - totalReportado;
  if (sinCategoria > 0) lineas.push('otras líneas (sin categoría): ' + sinCategoria);
  return lineas.join(' · ');
}

/**
 * Normaliza un resultado con forma de `upsertPorClave_` (`escritas`/`actualizadas`/
 * `cambios`/`nuevasClaves`, y opcionalmente `protegidas`) a filas para la hoja
 * `DIFF_CONFIGURACION`: `[hoja, tipo, clave, columna, anterior, nuevo]`.
 */
function filasDiffParaHoja_(nombreHoja, resultado, clavesDeMigracion) {
  if (!resultado) return [];
  clavesDeMigracion = clavesDeMigracion || {};
  var filas = [];
  (resultado.nuevasClaves || []).forEach(function (clave) {
    filas.push([nombreHoja, 'nueva', clave, '', '', '']);
  });
  (resultado.cambios || []).forEach(function (c) {
    filas.push([nombreHoja, 'cambio', c.clave, c.columna, c.anterior, c.nuevo]);
  });
  (resultado.protegidas || []).forEach(function (p) {
    // Compatibilidad: `protegidas` puede venir como string (formato viejo) o como
    // { clave, diferencias } (C.2-4).
    var clave = (typeof p === 'string') ? p : p.clave;
    var diferencias = (typeof p === 'string') ? null : (p.diferencias || []);
    // C.2-3: una fila que una migración modificó en ESTA corrida no puede reportarse
    // como `protegida` a secas — decía "no la toqué" sobre una fila que sí quedó
    // modificada, por otro camino, en la misma corrida.
    var sufijo = clavesDeMigracion[clave] ? ', pero modificada por una migración' : '';
    if (diferencias === null) {
      filas.push([nombreHoja, 'protegida (origen=manual)' + sufijo, clave, '', '', '']);
      return;
    }
    if (!diferencias.length) {
      // C.2-4: decirlo explícito. Celdas vacías eran ambiguas — no se distinguía
      // "no tenía nada por cambiar" de "no se calculó".
      filas.push([nombreHoja, 'protegida (sin diferencias)' + sufijo, clave, '', '', 'ya coincide con el seed']);
      return;
    }
    diferencias.forEach(function (d) {
      filas.push([
        nombreHoja, 'protegida (habría cambiado)' + sufijo, clave,
        d.columna, d.anterior, d.nuevo + '  (no aplicado: origen=manual)'
      ]);
    });
  });
  // C.2-5 — al final, para que no se mezclen con lo que sí cambió.
  (resultado.soloEnHoja || []).forEach(function (s) {
    filas.push([nombreHoja, 'solo_en_hoja', s.clave, '', 'fila ' + s.fila + ' de la hoja', '(no está en el seed — no se toca)']);
  });
  return filas;
}

var HEADERS_DIFF_CONFIGURACION_ = ['hoja', 'tipo', 'clave', 'columna', 'anterior', 'nuevo'];

/**
 * Paso 2.11 C.2-2 — qué hoja de registro audita el diff y cuál no, declarado.
 *
 * Sin esto, "BASES: cero líneas" y "BASES: no se audita" producen exactamente el mismo
 * output — y durante la verificación del protocolo hubo corridas donde no se podía
 * distinguir una cosa de la otra. `MARCADORES` está acá a propósito, con
 * `auditada = no · sin sembrador`: es un hallazgo abierto (Paso 2.13) y tiene que estar a
 * la vista, no implícito por ausencia.
 *
 * `seed` es una función y no el array directo porque Apps Script concatena todos los
 * `.gs` en un scope global y el orden de evaluación de los `var` no está garantizado:
 * referenciar `SEED_BASES_` en el literal daría `undefined` si esta tabla se evalúa antes.
 */
var ALCANCE_REGISTROS_ = [
  { hoja: 'BASES', auditada: true, seed: function () { return SEED_BASES_; } },
  { hoja: 'MAPEO', auditada: true, seed: function () { return SEED_MAPEO_; } },
  { hoja: 'CONFIG', auditada: true, seed: function () { return Object.keys(SEED_CONFIG_DEFAULTS_); } },
  { hoja: 'INFORMES', auditada: true, seed: function () { return SEED_INFORMES_; } },
  { hoja: 'PERIODOS', auditada: true, seed: function () { return SEED_PERIODOS_; } },
  { hoja: 'SOLAPAS', auditada: true, seed: function () { return SEED_SOLAPAS_; } },
  { hoja: 'SECCIONES', auditada: true, seed: function () { return SEED_SECCIONES_; } },
  { hoja: 'CAMPANAS', auditada: false, motivo: 'excluida a propósito — curada a mano, cambia cada semana (SEED_CAMPANAS_EJEMPLO_ existe pero sin sembrador automático)',
    seed: function () { return SEED_CAMPANAS_EJEMPLO_; } },
  { hoja: 'REUNIONES', auditada: false, motivo: 'excluida a propósito — ídem CAMPANAS (SEED_REUNIONES_EJEMPLO_ sin sembrador automático)',
    seed: function () { return SEED_REUNIONES_EJEMPLO_; } },
  { hoja: 'MARCADORES', auditada: false, motivo: 'sin sembrador — hallazgo abierto, Paso 2.13' },
  // `_11` (09/08) — cuarta no auditada, y por un motivo distinto de las otras tres: no es que
  // el seed no se haya escrito, es que **no puede existir**. El contenido de `LAMINAS` se
  // deriva de las plantillas —una fila por lámina, con el id que el sellador asignó—, así que
  // no hay valor declarado contra el cual diffear. `CAMPANAS` y `REUNIONES` se curan a mano;
  // `MARCADORES` espera un sembrador; ésta no espera nada.
  { hoja: 'LAMINAS', auditada: false, motivo: 'sin seed posible — su contenido se deriva de las plantillas' }
];

var HEADERS_ALCANCE_ = ['hoja', 'auditada', 'filas_en_hoja', 'filas_en_seed', 'motivo'];

/**
 * Construye el bloque de alcance. `obtenerHoja` se inyecta (no se toma de
 * `SpreadsheetApp` adentro) para que el control positivo pueda alimentarlo con hojas
 * sintéticas y verificar que discrimina — ver `probarBloqueDeAlcance_()`.
 */
function construirBloqueAlcance_(descriptores, obtenerHoja) {
  return descriptores.map(function (d) {
    var hoja = obtenerHoja(d.hoja);
    var filasEnHoja = hoja ? Math.max(hoja.getLastRow() - 1, 0) : '';
    var filasEnSeed = '';
    if (d.seed) {
      try { filasEnSeed = d.seed().length; } catch (e) { filasEnSeed = '(error al leer el seed)'; }
    }
    var motivo = d.motivo || '';
    if (!hoja) motivo = motivo ? motivo + ' · la hoja no existe' : 'la hoja no existe';
    return [d.hoja, (d.auditada && hoja) ? 'sí' : 'no', filasEnHoja, filasEnSeed, motivo];
  });
}

/**
 * Paso 2.11 C.2-2 — cabecera de corrida. Sin esto no se puede saber si lo que se está
 * mirando es de esta corrida o de la anterior: durante la verificación del protocolo hubo
 * que vaciar las dos hojas a mano tres veces por esto mismo.
 */
function cabeceraDeCorrida_(ejecutadoPor) {
  var tz = SpreadsheetApp.getActiveSpreadsheet().getSpreadsheetTimeZone();
  return [
    ['ejecutado_por', ejecutadoPor, '', '', ''],
    ['fecha_hora', Utilities.formatDate(new Date(), tz, 'yyyy-MM-dd HH:mm:ss'), '', '', ''],
    ['version_codigo', '(sin marca de versión — ver docs/PENDIENTES_consistencia.md, nota de API executable)', '', '', '']
  ];
}

/**
 * Escribe una hoja de reporte completa: cabecera de corrida, bloque de alcance y tabla de
 * diff. La hoja se limpia entera antes de escribir (C.2-2): filas de una corrida vieja
 * mezcladas con las nuevas es exactamente lo que hacía el output no interpretable.
 */
function escribirDiffConfiguracion_(filas, nombreHoja, ejecutadoPor, filasAlcance) {
  nombreHoja = nombreHoja || 'DIFF_CONFIGURACION';
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var hoja = ss.getSheetByName(nombreHoja);
  if (!hoja) hoja = ss.insertSheet(nombreHoja);
  hoja.clear();
  hoja.setFrozenRows(0);

  var bloques = [];
  bloques = bloques.concat(cabeceraDeCorrida_(ejecutadoPor || '(sin declarar)'));
  bloques.push(['', '', '', '', '']);
  bloques.push(['ALCANCE DE ESTA CORRIDA', '', '', '', '']);
  bloques.push(HEADERS_ALCANCE_);
  bloques = bloques.concat(filasAlcance || []);
  bloques.push(['', '', '', '', '']);
  bloques.push(['DETALLE', '', '', '', '']);

  var anchoBloque = 5;
  hoja.getRange(1, 1, bloques.length, anchoBloque).setValues(bloques);

  var filaHeaders = bloques.length + 1;
  hoja.getRange(filaHeaders, 1, 1, HEADERS_DIFF_CONFIGURACION_.length).setValues([HEADERS_DIFF_CONFIGURACION_]);
  if (filas.length) {
    hoja.getRange(filaHeaders + 1, 1, filas.length, HEADERS_DIFF_CONFIGURACION_.length).setValues(filas);
  }
  hoja.setFrozenRows(filaHeaders);
}

/**
 * Paso 2.11 Parte C — "Estado de configuración": SOLO LECTURA, no escribe ninguna hoja
 * de registro (si escribe la hoja `ESTADO_CONFIGURACION`, que es el propio diagnóstico,
 * mismo patrón que `DIAG_COLAPSO`/`DIAG_FECHAS`). Responde "¿en qué estado está esto?"
 * sin correr nada que modifique — para eso ya está "Aplicar configuración".
 * Por cada hoja de registro: filas totales, distribución de `origen` (solo `SOLAPAS`,
 * es la única con esa columna) y discrepancias entre el `SEED_*` del código y lo que hay
 * en la planilla (calculadas con los mismos `calcularDiff*_` que usa "Aplicar", sin
 * aplicar nada).
 */
function menuEstadoConfiguracion_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var ui = ui_();

  var filas = [];
  var lineasResumen = [];

  function agregarDiscrepancias_(nombreHoja, diff) {
    (diff.nuevas || []).forEach(function (n) {
      filas.push([nombreHoja, 'falta en la planilla', n.clave, '', '', '']);
    });
    (diff.cambios || []).forEach(function (c) {
      filas.push([nombreHoja, 'discrepancia', c.clave, c.columna, c.anterior, c.nuevo]);
    });
    // C.2-5 — también en sólo lectura: si "Aplicar" lo va a reportar, "Estado" tiene que
    // verlo, o las dos vistas vuelven a no coincidir.
    (diff.soloEnHoja || []).forEach(function (s) {
      filas.push([nombreHoja, 'solo_en_hoja', s.clave, '', 'fila ' + s.fila + ' de la hoja', '(no está en el seed — no se toca)']);
    });
  }

  function filasTotales_(nombreHoja) {
    var hoja = ss.getSheetByName(nombreHoja);
    return hoja ? Math.max(hoja.getLastRow() - 1, 0) : null;
  }

  [
    { nombre: 'BASES', claves: ['base_id'], seed: SEED_BASES_ },
    { nombre: 'MAPEO', claves: ['base_id', 'solapa', 'campo_logico'], seed: SEED_MAPEO_ },
    { nombre: 'INFORMES', claves: ['informe_id'], seed: SEED_INFORMES_ },
    { nombre: 'PERIODOS', claves: ['periodo_id'], seed: SEED_PERIODOS_ }
  ].forEach(function (registro) {
    var hoja = ss.getSheetByName(registro.nombre);
    var totales = filasTotales_(registro.nombre);
    if (!hoja) {
      lineasResumen.push(registro.nombre + ' — la hoja no existe');
      return;
    }
    var diff = calcularDiffUpsert_(hoja, registro.claves, registro.seed);
    agregarDiscrepancias_(registro.nombre, diff);
    lineasResumen.push(registro.nombre + ' — ' + totales + ' fila(s), ' +
      diff.nuevas.length + ' pendiente(s) de crear, ' + diff.cambios.length + ' discrepancia(s)');
  });

  // CONFIG: forma distinta (clave/valor, solo completa vacíos) — mismo cálculo que
  // seedConfigConfig_ pero sin escribir.
  var hojaConfig = ss.getSheetByName('CONFIG');
  if (hojaConfig) {
    var datosConfig = hojaConfig.getDataRange().getValues();
    var idxValorConfig = datosConfig[0].indexOf('valor');
    var idxClaveConfig = datosConfig[0].indexOf('clave');
    var filaPorClaveConfig = {};
    for (var fc = 1; fc < datosConfig.length; fc++) {
      if (datosConfig[fc][idxClaveConfig]) filaPorClaveConfig[datosConfig[fc][idxClaveConfig]] = fc;
    }
    var faltantesConfig = 0;
    Object.keys(SEED_CONFIG_DEFAULTS_).forEach(function (clave) {
      var f = filaPorClaveConfig[clave];
      if (f === undefined) {
        filas.push(['CONFIG', 'falta en la planilla', clave, '', '', SEED_CONFIG_DEFAULTS_[clave]]);
        faltantesConfig++;
        return;
      }
      var valorActual = datosConfig[f][idxValorConfig];
      if ((valorActual === '' || valorActual === null) && SEED_CONFIG_DEFAULTS_[clave] !== '') {
        filas.push(['CONFIG', 'discrepancia', clave, 'valor', valorActual, SEED_CONFIG_DEFAULTS_[clave]]);
        faltantesConfig++;
      }
    });
    lineasResumen.push('CONFIG — ' + Math.max(datosConfig.length - 1, 0) + ' fila(s), ' + faltantesConfig + ' sin completar');
  } else {
    lineasResumen.push('CONFIG — la hoja no existe');
  }

  // SOLAPAS: además de discrepancias contra SEED_SOLAPAS_, distribución de origen.
  var hojaSolapas = ss.getSheetByName('SOLAPAS');
  if (hojaSolapas) {
    var existentesSolapas = leerFilasSolapas_(hojaSolapas);
    var totalSolapas = Object.keys(existentesSolapas).length;
    var porOrigen = {};
    Object.keys(existentesSolapas).forEach(function (clave) {
      var o = existentesSolapas[clave].origen || '(sin origen)';
      porOrigen[o] = (porOrigen[o] || 0) + 1;
    });
    var distribucion = Object.keys(porOrigen).sort().map(function (o) { return o + ': ' + porOrigen[o]; }).join(', ');

    SEED_SOLAPAS_.forEach(function (obj) {
      var clave = obj.base_id + '||' + obj.solapa;
      var existente = existentesSolapas[clave];
      if (existente && existente.origen === 'manual') return; // protegida, no es discrepancia
      if (!existente) {
        filas.push(['SOLAPAS', 'falta en la planilla', clave, '', '', '']);
        return;
      }
      ['uso', 'fila_encabezado', 'notas'].forEach(function (campo) {
        var anterior = existente[campo];
        var nuevo = campo === 'notas' ? obj.notas : obj[campo];
        var comparableAnterior = (anterior === null || anterior === undefined) ? '' : String(anterior);
        var comparableNuevo = (nuevo === null || nuevo === undefined) ? '' : String(nuevo);
        if (comparableAnterior !== comparableNuevo) {
          filas.push(['SOLAPAS', 'discrepancia', clave, campo, anterior, nuevo]);
        }
      });
    });

    var discrepanciasSolapas = filas.filter(function (f) { return f[0] === 'SOLAPAS'; }).length;
    lineasResumen.push('SOLAPAS — ' + totalSolapas + ' fila(s) [' + distribucion + '], ' + discrepanciasSolapas + ' discrepancia(s)');
  } else {
    lineasResumen.push('SOLAPAS — la hoja no existe');
  }

  var hojaSecciones = ss.getSheetByName('SECCIONES');
  if (hojaSecciones) {
    var datosSecciones = hojaSecciones.getDataRange().getValues();
    var idxIdSeccion = datosSecciones[0].indexOf('seccion_id');
    var idsExistentes = {};
    for (var fs = 1; fs < datosSecciones.length; fs++) {
      if (datosSecciones[fs][idxIdSeccion]) idsExistentes[datosSecciones[fs][idxIdSeccion]] = true;
    }
    var faltantesSecciones = SEED_SECCIONES_.filter(function (s) { return !idsExistentes[s.seccion_id]; });
    faltantesSecciones.forEach(function (s) {
      filas.push(['SECCIONES', 'falta en la planilla', s.seccion_id, '', '', '']);
    });
    lineasResumen.push('SECCIONES — ' + Math.max(datosSecciones.length - 1, 0) + ' fila(s), ' + faltantesSecciones.length + ' pendiente(s) de crear');
  } else {
    lineasResumen.push('SECCIONES — la hoja no existe');
  }

  // C.2-3 — las migraciones pendientes entran en el cálculo, SIN aplicarlas
  // (`aplicarInstalacion_(false)` no escribe ni una celda). Sin esto, "cero
  // discrepancias" en sólo lectura no cubría lo que el apply sí iba a escribir: era
  // justamente la mitad que faltaba para que "Estado" y "Aplicar" dijeran lo mismo.
  var simulacion = aplicarInstalacion_(false);
  var filasMigracionesPendientes = filasDiffMigraciones_(simulacion.migraciones).map(function (f) {
    return [f[0], 'migracion pendiente', f[2], f[3], f[4], f[5]];
  });
  filas = filasMigracionesPendientes.concat(filas);
  lineasResumen.push('Migraciones pendientes (las aplicaría "Aplicar configuración"): ' +
    filasMigracionesPendientes.length + ' celda(s)');

  var filasAlcanceEstado = construirBloqueAlcance_(ALCANCE_REGISTROS_, function (n) {
    return ss.getSheetByName(n);
  });
  escribirDiffConfiguracion_(filas, 'ESTADO_CONFIGURACION', 'menuEstadoConfiguracion_', filasAlcanceEstado);

  var resumen = lineasResumen.join('\n') +
    (filas.length
      ? '\n\nDetalle completo en la hoja ESTADO_CONFIGURACION.'
      : '\n\n✅ Sin discrepancias entre el código y la planilla.') +
    '\n\nQué se auditó y qué no: bloque ALCANCE, arriba en esa misma hoja.';

  ui.alert('Estado de configuración', resumen, ui.ButtonSet.OK);
  return resumen; // Paso 2.14: por API el reporte va en el retorno, no en la pantalla
}
