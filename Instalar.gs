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
  /* ⛔⛔ `valor_fijo` VIAJA POR UNA CELDA DE SHEETS, ASÍ QUE PASA POR SU COERCIÓN DE TIPOS.
   * Medido el 22/08: se escribió `'1/3'` como índice de `ELEMENTO` y la celda lo guardó como
   * **FECHA** (`Sun Mar 01 2026`). Los tres `ecv_barrio*` publicaron `---` una corrida después.
   * **Las formas que se come: `1/3`, `3-1`, `1-2` → fecha; `01` → pierde el cero; `=algo` →
   * fórmula.** Lo que se escriba acá va como **entero pelado** o con un prefijo que no parezca
   * nada. Y el escritor **relee**: `curarMarcadores_` devuelve `releido`. Ver `CLAUDE.md` §4.
   *
   * solapa/operacion/valor_fijo (DOC-2 Parte A): operacion reemplaza a calculo
  // (migración idempotente en migrarCalculoAOperacion_); valor_fijo es para
  // operacion=TEXTO; solapa entra en la clave de MAPEO y, si viene vacía, la
  // regla de resolución (docs/TOKENS.md, PROYECTO.md §3) decide si se infiere
  // o se exige. Sin sembrador: ver "No sembrar las ~200 filas de MARCADORES"
  // en `docs/Prompts/Paso-2.10_anclar_a_numeros_verificados.md` — bloqueado por
  // la armonización de plantillas, se carga a mano hasta que eso se resuelva.
  MARCADORES: {
    // `D-33` (15/08/2026) — `dimensiones` va al lado de `filtro`: las dos declaran cómo se
    // acotan las filas, y separarlas en la hoja haría que se lean como cosas distintas cuando
    // la diferencia es cuál se le explica al equipo y cuál es una regla de validez.
    headers: ['marcador', 'familia', 'informe_id', 'base_id', 'solapa', 'campo_logico', 'periodo_ref', 'operacion', 'valor_fijo', 'formato', 'filtro', 'dimensiones', 'catalogo', 'separador', 'notas']
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
    // `_6` (14/08/2026, `D-31`): `encabezado` va **inmediatamente después de `columna`** porque
    // atestigua sobre ella. Es el título que hay hoy en esa letra — **testigo, nunca fallback**:
    // la letra sigue siendo la única forma de encontrar la columna, y buscar por título elegiría
    // siempre el primero de los repetidos (`Agenda JM | Post` tiene cuatro `% CTR`).
    headers: ['base_id', 'solapa', 'campo_logico', 'hoja', 'columna', 'encabezado', 'tipo_esperado', 'valores_incluidos', 'notas']
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
    // `id_cuenta` (19/08): la campaña se une al dato por cuenta, no por nombre. El motivo largo
    // está en `COLUMNAS_DELTA_.CAMPANAS`. Va acá **además** del delta porque esta lista es la que
    // vale para una planilla nueva, que no pasa por el delta.
    headers: ['periodo_id', 'campana_id', 'nombre', 'informe_id', 'base_id', 'tipo', 'desde', 'hasta', 'mostrar', 'orden', 'id_cuenta']
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
    // ⭐⭐ `2026-08-24` (`D-41`) — `ejecucion`: qué TANDA escribió esta fila.
    //
    // `abrirCorrida_` abre una fila POR EJECUCIÓN con el MISMO `corrida_id`, así que un deck
    // completado en tres tandas deja tres filas. Qué tanda pintó qué lámina ya era derivable
    // cruzando los `mapa_tokens` de las N filas — pero a mano, y nadie lo hace.
    //
    // ⚠ Hace falta porque dos tandas están separadas en el tiempo: con `looker/DIGITAL`
    // inestable por CAMBIO (`R-31`), la lámina 2 puede resolverse en una tanda y la 3 en otra y
    // publicar números de dos momentos. Partir por lámina acota eso a ENTRE láminas y NO lo
    // elimina (`D-41`, límite conocido y declarado). Esta columna lo vuelve VISIBLE en vez de
    // algo que se descubre comparando.
    //
    // El número vive en `PropertiesService` (`estado.ejecucion`) desde el `2026-08-20_10`; acá
    // baja a la hoja, que es donde se puede leer sin abrir el depurador.
    headers: ['corrida_id', 'ejecucion', 'informe_id', 'periodo_id', 'deck_id', 'fecha_generacion', 'tokens_reemplazados', 'faltantes', 'mapa_tokens']
  },
  // Paso 4 `B.7` (`D-12`) — se **pisa** en cada corrida, a propósito: es la lista de trabajo
  // de lo que falta cablear, no un historial. Si algún día hace falta la serie,
  // `tools/snapshot.js` ya la archivaría.
  //
  /* ⭐ `2026-08-23_1` Parte B — **`causa` es columna, no una lectura del `motivo`.**
   *
   * El agrupamiento por causa es lo que vuelve útil a la hoja: cada causa manda a un oficio
   * distinto —cablear, mirar la traza, mirar la fuente, correr de nuevo— y hasta hoy las cuatro
   * llegaban al mismo texto libre. Derivar la causa **leyendo el `motivo`** en el panel habría
   * sido un parser de prosa en el consumidor: el que sabe por qué falta el token es el punto que
   * lo empuja, no el que lo lee después.
   *
   * ⚠ **La columna se agrega y la hoja viva NO se recrea**, así que `escribirFaltantes_` la
   * reconcilia con `reconciliarHeadersDeSalida_` antes de escribir. Sin eso pasa exactamente lo
   * que `CLAUDE.md` §2 describe: la columna entra al esquema, `hojaDeSalida_` sólo actúa cuando
   * la hoja **no existe**, y en la hoja de siempre la celda **nunca se escribe** — un `undefined`
   * silencioso, sin error. Es barato porque `FALTANTES` es salida y se pisa entera igual.
   *
   * ⛔ **Y va ÚLTIMA, después de `motivo`, y eso no es estética.** `aplicarInstalacion_` reescribe
   * la fila 1 de una hoja sin `COLUMNAS_DELTA_` **por posición**: metida en el medio, `causa`
   * pisaría el título de `motivo` y la columna de motivos quedaría rotulada `causa` hasta la
   * próxima corrida. Al final, la reescritura posicional de `instalar()` y el agregado por nombre
   * de `reconciliarHeadersDeSalida_` **coinciden**, y ninguna columna existente se mueve. */
  FALTANTES: {
    headers: ['corrida_id', 'informe_id', 'token', 'base_id', 'solapa', 'campo_logico', 'motivo', 'causa']
  },
  /* ⭐ `2026-08-23_1` Parte B — **la corrida anterior, y una sola.**
   *
   * `D-12` decidió que `FALTANTES` se pisa, y eso **no se supersede acá**: sigue siendo la lista
   * de trabajo de la última corrida y no un historial. Lo que se agrega es lo mínimo que el
   * cierre de fase (`D-38`) necesita y que hoy no existe: **poder comparar contra la corrida
   * anterior** sin haberla copiado a mano antes de que la próxima la pisara — que es literalmente
   * como se diagnosticó `X-40` el 23/08.
   *
   * ⚠ **Una sola corrida de profundidad, y es una decisión medida, no pereza.** Una corrida
   * genera del orden de 190 filas; acumular por `corrida_id` daría ~10.000 filas en cincuenta
   * corridas y **convertiría la lista de trabajo en un log**, que es justo lo que `D-12` no
   * quiere. Con una de profundidad, el costo es constante y la pregunta que se contesta
   * —*«¿esto ya estaba antes de mi cambio?»*— es la única que se hizo hasta hoy.
   *
   * Mismos headers que `FALTANTES`, a propósito: **un solo lector sirve para las dos**. */
  FALTANTES_PREVIO: {
    headers: ['corrida_id', 'informe_id', 'token', 'base_id', 'solapa', 'campo_logico', 'motivo', 'causa']
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
  // `modo`, `itera_sobre` y `filtro` vacíos significan **hereda de `SECCIONES`**, no "sin
  // declarar" (`PLAN.md` §2: las dos son configuración, celda vacía = hereda).
  //
  // ⚠ **`seccion_id` YA NO hereda — `D-37` (21/08/2026) lo supersede.** Vacío pasa a significar
  // *"nadie la clasificó"*: la lámina se reporta con su `lamina_id` y **no entra a ningún bloque
  // repetible**. La corrección es **sólo sobre `seccion_id`**; las otras tres siguen heredando. Y
  // `D-23` ya lo decía — *"identidad y estado propio no se heredan nunca"*.
  //
  /* ⭐ **`rol` — quién llena la lámina** (`2026-08-21_11.1` §2, decisión del usuario 21/08). La
   * columna existía en el esquema desde el `_11` y **nunca se había definido**. Dos valores:
   *
   *   - **`motor`** — el contenido lo pone la corrida: la lámina lleva tokens.
   *   - **`equipo`** — el contenido lo escribe una persona: la lámina **no lleva ningún token**.
   *
   * El criterio es medible y no se opina. Al 21/08: **13 `equipo` y 40 `motor`**.
   *
   * ⚠ **Las que tienen tokens y NINGUNO cableado son `motor` igual** — el rol dice quién **debe**
   * llenarla, no quién la llena hoy. **25 de las 40** están en ese caso, entre ellas las dos del
   * "1 a 1". Leer `rol = motor` como *"esta lámina publica"* es el error que la columna no evita.
   *
   * ⛔ **Ningún código la lee, y no se le van a dar lectores en este paso.** Es documentación
   * operativa, y hay que decirlo acá: **una columna que parece una guarda y no lo es es peor que
   * ninguna.** */
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
    { nombre: 'separador', indice: 13 },
    /* `2026-08-15_1` (`D-33`) — **`dimensiones`: el corte declarado, al lado de `filtro`.**
     *
     * **Una sola columna y no tres**, aunque hoy las dimensiones sean tres. Con una columna por
     * dimensión, agregar la cuarta exige tocar el esquema y el delta; con una sola, es un valor
     * más en una celda. Es `D-01` aplicado: **agregar una dimensión no puede pedir `clasp push`.**
     *
     * **Misma sintaxis que `filtro`** — `ambito=jm && plataforma=meta` — a propósito: inventar un
     * segundo lenguaje para escribir cortes obligaría a aprender dos, y el que se usa menos se
     * escribe mal.
     *
     * **La frontera con `filtro` la fija `D-33` y no se mezcla:** acá van los cortes que alguien
     * del equipo pediría; en `filtro` quedan las restricciones técnicas — `estado=Activa` y las
     * nueve guardas `!=0`.
     *
     * Al final del array por lo mismo que explica la nota de `filtro` arriba, y **con la misma
     * salvedad: la columna puede terminar en un índice distinto del pedido**, porque el índice se
     * cuenta sobre el esquema del momento. No importa — todo se lee por nombre, nunca por
     * posición. */
    { nombre: 'dimensiones', indice: 11 }
  ],
  CAMPANAS: [
    { nombre: 'desde', indice: 6 },
    { nombre: 'hasta', indice: 7 },
    // Paso 2.15 Parte B (D-08/D-19): va AL FINAL del array aunque la columna quede
    // primera. Las entradas se evalúan en orden en el forEach de aplicarInstalacion_:
    // una entrada nueva adelante correría los índices 6 y 7 de las que ya están, que
    // asumen el esquema previo (mismo caso que documenta la nota de MARCADORES).
    { nombre: 'periodo_id', indice: 1 },
    /* `2026-08-19` — **`id_cuenta`: la campaña se une al dato por CUENTA, no por nombre.**
     *
     * **Medido, y es lo que obliga a esta columna:** cuatro solapas dan cuatro grafías distintas
     * de la misma campaña y **ninguna coincide con la del deck** —*"Egreso más de 1000 Cadetes"*
     * contra *"Egreso de mil cadetes"*—. Y el caso que ninguna normalización arregla: en
     * `digital/Directa Mail` la fila del 20/07 de la cuenta `3305` trae el nombre de **otra**
     * campaña. **Un filtro por nombre pierde esa fila; uno por `Id cuentas` la trae.** Verificado
     * el 19/08: filtrando por id, `3305` da **4** filas en esa solapa.
     *
     * **La resolución nombre → id la hace una persona UNA VEZ, al cargar**, contra
     * `digital/Seguimiento digital`, que es la tabla puente: columna A `ID Cuentas`, B `Nombre
     * campaña | Cuentas`, C `Nombre campaña | Digital`. **El motor nunca ve la ambigüedad**; si un
     * nombre da dos ids, decide el usuario. Es el mismo criterio que `R-02` para el temario: lo
     * que se publica se declara, no se deduce.
     *
     * **`nombre` queda como etiqueta del deck** y se escribe con la grafía de `Nombre campaña |
     * Cuentas`, que es la que pega con el id — así la fila es verificable contra la columna B en
     * vez de ser un texto suelto.
     *
     * Al final del array por lo mismo que explica la nota de arriba, y con la misma salvedad: el
     * índice se cuenta sobre el esquema del momento y la columna puede terminar en otro. **No
     * importa: todo se lee por nombre, nunca por posición.** */
    { nombre: 'id_cuenta', indice: 10 }
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
    { nombre: 'valores_incluidos', indice: 7 },
    // `_6` (14/08/2026, `D-31`). Al final del array por la misma razón que la de arriba, y el
    // índice se calcula sobre el estado que dejan las tres anteriores: con `solapa`,
    // `tipo_esperado` y `valores_incluidos` ya aplicadas, `columna` está en la 5, así que la 6
    // es *inmediatamente después de `columna`*. Empuja `tipo_esperado` a 7, `valores_incluidos`
    // a 8 y `notas` a 9 — el mismo orden que declara `HOJAS_CONFIG_.MAPEO.headers`.
    { nombre: 'encabezado', indice: 6 }
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
  ],
  // `D-41` — `ejecucion` entra por delta y no recreando la hoja: `CORRIDAS` es el historial de
  // corridas y recrearla lo borraría. `indice: 1` = inmediatamente después de `corrida_id`,
  // porque las dos juntas son la clave con la que se lee la tabla: qué corrida, qué tanda.
  CORRIDAS: [
    { nombre: 'ejecucion', indice: 1 }
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
  /* `periodicidad: 'semanal'` — corregido el 16/08/2026 (declaración del usuario). Decía
   * `mensual`, y era falso.
   *
   * ⚠ **Hoy esta columna NO TIENE UN SOLO LECTOR**, medido el 16/08: aparece en el comentario de
   * contrato de `leerInformes()`, en la lista de headers de acá arriba, y en estos dos valores —
   * y **nadie la consulta**. La ventana real la resuelve la cadena de `D-20`, cuyos cinco
   * eslabones son campaña → `periodo_ref` → sección → `CONFIG` → `R-11` calculado: **ninguno
   * mira `informe_id`**, así que `jm` y `secco` caen los dos en `CONFIG` y resuelven la misma.
   *
   * **Entonces por qué corregirla igual, si no la lee nadie:** porque **una celda que dice lo
   * contrario de la realidad es peor que una vacía.** El día que alguien conecte `periodicidad`
   * a la cadena de resolución, va a heredar el valor viejo **creyendo que estaba verificado** —
   * un dato declarado y nunca leído no acumula evidencia de estar bien, sólo apariencia de. */
  { informe_id: 'secco', nombre: 'Seguimiento SECCO-SSCDI', plantilla_id: '1_ZKjWhL-bhCP8yHQ8PJ33ymyjSXu3thh7MKMOxB4-n8', periodicidad: 'semanal', familias: 'ecv,et,emin,m2,camp,conv,rep,rrss', activo: 'sí', notas: '29 slides' }
];

var SEED_BASES_ = [
  { base_id: 'rdv', nombre: 'RDV JM CM ES + funcionarios', sheet_id: '1ZpHO6Ru1uY2r9WfBF_yFtu5z7ip7F3Q6VOoRJN5vLAo', hoja_default: 'RVD JM-CM - ES', fila_encabezado: 1, modo_periodo: 'filtrar', tipo: 'google_sheets', activo: 'sí', notas: 'Encuentros' },
  { base_id: 'digital', nombre: 'Seguimiento Digital', sheet_id: '1LadILzFpyCrZRapxgDOFOldSoRawjKkWMaFci_ilhPY', hoja_default: 'Seguimiento digital', fila_encabezado: 1, modo_periodo: 'snapshot', tipo: 'google_sheets', activo: 'sí', notas: 'Campaña por canal. Paso 2.3: snapshot — sus solapas usan fecha de inicio de campaña (lead 3-7 días), el recorte por período lo hace el agregador vía link campaña↔encuentro, no ventana de fecha cruda.' },
  { base_id: 'looker', nombre: 'Base Looker', sheet_id: '1t6Ji4Cd5lTeBEBBVIoIJUOWjvsOzWBDZmKN163rHKaQ', hoja_default: 'resumen_metricas_dinamico', fila_encabezado: 1, modo_periodo: 'filtrar', tipo: 'google_sheets', activo: 'sí', notas: 'Consolidado. Fuente = resumen_metricas_dinamico (S-01, Paso 2.9 Parte C, 31/07): QUERY() viva sobre Cuentas; resumen_metricas es un pegado que devolvió 899 de 903 filas sin fecha — DOC-3 Parte A cerrada.' },
  /* `_44` Parte C (12/08/2026) — la base de reuniones. **Una fila por encuentro**, que es la
   * forma que ninguna de las otras cuatro tiene: `rdv` es por encuentro pero sin métricas
   * digitales, y `digital`/`looker` son por campaña.
   *
   * `modo_periodo: 'snapshot'` y no `'filtrar'`, a propósito: sus dos solapas fuente declaran
   * `campo_id_cuenta`, así que **el recorte lo hace la cuenta del ítem** (`D-30`) y el temario ya
   * seleccionó (`R-17`). Poner `filtrar` exigiría un `fecha_periodo` mapeado y volvería a dejar
   * afuera a San Cristóbal 23/07 en la ventana de julio, que es exactamente el bug que `D-30`
   * evita.
   *
   * `fila_encabezado: 2` **no va acá sino en cada `SOLAPAS`**: la fila 1 de `Agenda JM` es una
   * banda de grupos (`Comunicación Directa | Mailing`, …) y la 2 son los títulos reales. El
   * default de la base queda en 1 porque `Barrios` sí tiene su encabezado en la 1. */
  { base_id: 'reuniones', nombre: 'Base reuniones - Digital - Call Center', sheet_id: '12b0v67FbxjuIndK7DgVU3MYxx-k0yBIS9gtyV45rFaY', hoja_default: 'Agenda JM', fila_encabezado: 1, modo_periodo: 'snapshot', tipo: 'google_sheets', activo: 'sí', notas: 'Una fila por encuentro, clave ID = id_cuenta del anclaje. PRE en Agenda JM y POST en Agenda JM | Post, con el MISMO id (C-50): la clave del par es (ID, solapa). snapshot porque el recorte lo hace campo_id_cuenta (D-30), no la fecha.' },
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
    notas: 'M=frecuencia_total; existe también meta_frecuencia en L — elección sin confirmar con el equipo (DOC-3 Parte C). Mapeada la L el 23/08, ver la fila de abajo: no reemplaza a ésta, convive' },
  /* ⭐ `23/08/2026` — **la columna `L` se mapea, y llevaba dos años señalada sin mapear.** La nota
   * de `frecuencia` (arriba) ya decía *"existe también `meta_frecuencia` en L"* desde el `DOC-3`, y
   * `V-109` la midió: **`meta_frecuencia` (L) = 1,737** junto a **`frecuencia_total` (M) = 6,573**
   * para `3481-AGOINFAN`. Lo que faltaba era **la fila de `MAPEO` y el token en la plantilla** — y
   * el token lo agregó el usuario el 23/08 (`{{camp_meta_frecuencia}}`, `L-046`, fila Meta).
   *
   * ⚠ **Convive con `frecuencia`, no la reemplaza.** Son dos columnas distintas y dos hechos
   * distintos: `M` es la frecuencia total y `L` la de Meta. La elección de `M` para `frecuencia`
   * **sigue sin confirmar con el equipo** y esta fila no la toca. */
  { base_id: 'looker', campo_logico: 'meta_frecuencia', hoja: 'resumen_metricas_dinamico', columna: 'L', notas: 'frecuencia de Meta — la que V-109 midió en 1,737 junto a frecuencia_total (M) = 6,573. Fuente de camp_meta_frecuencia' },
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

  /* ── `X-39` (23/08/2026) · lo que falta para el desglose por plataforma de `L-046` ──────
   *
   * **`Visualizaciones` (D) y `Clics` (E) nunca se mapearon**, y no fue un olvido: el `_25`
   * mapeó `Impresiones` porque los seis `imp_*` era todo lo que consumía esta solapa. Los
   * quince `camp_{meta,google,prog}_*` necesitan las tres. **Los campos lógicos siguen la
   * convención de sus hermanas** —se leen igual que el encabezado— por el motivo que ya está
   * escrito arriba: el filtro se escribe `Plataforma=Meta` y una traducción de más no la pidió
   * nadie. `V-109` midió que las dos fuentes cierran: DV360 + Meta + Google + ML da exactamente
   * el `digital_impresiones` de `resumen_metricas_dinamico` para la misma cuenta. */
  { base_id: 'looker', campo_logico: 'Visualizaciones', hoja: 'DIGITAL', columna: 'D', notas: 'X-39 — la métrica de los camp_*_vistas. La firma del _25 ya la medía en la columna D; lo que faltaba era la fila' },
  { base_id: 'looker', campo_logico: 'Clics', hoja: 'DIGITAL', columna: 'E', notas: 'X-39 — la métrica de los camp_*_clics; ídem' },

  /* ⭐ **`ldig_id_cuenta` es la MISMA columna A que `clave_ventana`, con otro nombre lógico, y
   * es deliberado.** El molde exacto es `lcc_id_cuenta` (`_27`, `looker/CC`), que hizo lo mismo
   * y dejó escrito por qué.
   *
   * Son dos roles distintos que hoy coinciden en la letra: `clave_ventana` es el nombre del
   * **cruce de ventana** (`D-24`, `SOLAPAS.ventana_ref`) y `SOLAPAS.campo_id_cuenta` es el
   * nombre del **grano por cuenta** (`D-30`). ⚠ **Atarlos al mismo campo lógico haría que mover
   * uno mueva el otro en silencio** — y el que se mueve es el de la ventana, que ya cambió de
   * solapa una vez.
   *
   * ⛔ **No se llama `dig_id_cuenta`: ése ya es de `digital/Digital` (col. T)**, y
   * `TIPO_ESPERADO_POR_CAMPO_` indexa **por campo lógico, no por base** — reusarlo sería
   * declarar que son el mismo campo. */
  { base_id: 'looker', campo_logico: 'ldig_id_cuenta', hoja: 'DIGITAL', columna: 'A', notas: 'X-39 — el grano por cuenta de la solapa (D-30). Misma columna que clave_ventana, otro nombre lógico; el molde es lcc_id_cuenta del _27' },

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
  /* ⭐ `X-35` (23/08/2026) — **`Segmentacion` (J) es la audiencia de cada envio, y es TEXTO.**
   * Es la fuente de los cinco `camp_env*_aud` de `L-047`. Medido sobre el fixture del 20/08:
   * **cero de 2.877 filas parecen numero** y 1.124 vienen vacias. Los valores son del tipo
   * *"Geo a los barrios Barracas + Parque Patricios"*, *"Inscriptos al formulario"*.
   * ⛔ **Cablearla con una operacion numerica devuelve `sin_datos` y el casillero sale con el
   * simbolo de sin dato** — *"el dato no llego"* sobre un dato que esta (`CLAUDE.md` §4). */
  { base_id: 'digital', campo_logico: 'mail_segmentacion', hoja: 'Directa Mail', columna: 'J', notas: 'la audiencia/segmento de cada envio — TEXTO. Fuente de los camp_env*_aud de L-047 (X-35). Medido: 0 de 2877 filas numericas' },
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
/* `_44` Parte C — `reuniones`. Las letras salieron de contar el encabezado de la fila 2 sobre la
 * copia viva el 12/08 y se cruzaron contra los valores de las 7 cuentas ancladas: `Base total`
 * de `3289` da 5.387, que es lo que `V-86` valida contra la lámina 9 publicada.
 *
 * **`id_cuenta` es la fila que hace funcionar a `D-30`**: `SOLAPAS.campo_id_cuenta` la nombra y
 * `datosDeMarcador_` la resuelve para quedarse con la fila del encuentro. Sin ella, la rama falla
 * con `@campo_id_cuenta_no_mapeado` en vez de filtrar contra una columna inventada.
 *
 * Los `_pct` se **leen**, no se calculan: la base ya los trae como fracción (`% Cont.` = 0,2920)
 * y recalcularlos sería una segunda definición del mismo número conviviendo con la primera. */
var SEED_MAPEO_REUNIONES_ = [
  { base_id: 'reuniones', campo_logico: 'id_cuenta', hoja: 'Agenda JM', columna: 'A', notas: 'clave del encuentro — la nombra SOLAPAS.campo_id_cuenta (D-30)' },
  { base_id: 'reuniones', campo_logico: 'cc_base_total', hoja: 'Agenda JM', columna: 'U', notas: '"Base total" — el BBDD de teléfonos del iceberg. V-90: = Base enviada de looker/CC' },
  { base_id: 'reuniones', campo_logico: 'cc_base_discada', hoja: 'Agenda JM', columna: 'V', notas: '"Base discada" — la base llamada del iceberg. V-90: = Base barrida de looker/CC' },
  { base_id: 'reuniones', campo_logico: 'cc_contactados', hoja: 'Agenda JM', columna: 'W', notas: '"Contactados"' },
  { base_id: 'reuniones', campo_logico: 'cc_contactados_pct', hoja: 'Agenda JM', columna: 'X', notas: '"% Cont." — viene como fracción (0,2920), formato `fraccion`' },
  { base_id: 'reuniones', campo_logico: 'cc_efectivos', hoja: 'Agenda JM', columna: 'Y', notas: '"Efectivos"' },
  { base_id: 'reuniones', campo_logico: 'cc_efectivos_pct', hoja: 'Agenda JM', columna: 'Z', notas: '"% Efect." — fracción' },
  { base_id: 'reuniones', campo_logico: 'imp_totales', hoja: 'Agenda JM', columna: 'AA', notas: '"Impresiones totales" — V-88: el bloque PRE del deck entero en una fila (San Cristóbal 42.500 exacto)' },
  { base_id: 'reuniones', campo_logico: 'alc_potencial', hoja: 'Agenda JM', columna: 'AG', notas: '"Alcance potencial" — el alcance objetivo del iceberg' },
  { base_id: 'reuniones', campo_logico: 'alc_cobertura_pct', hoja: 'Agenda JM', columna: 'AH', notas: '"% Cobertura" — ⚠ sale 0 en las 14 filas donde Habitantes es el texto "Revisar" (las de eje). Por eso su marcador lleva filtro !=0. ⚠ `2026-08-14_1`: PUEDE PASAR DE 100% (Retiro POST 47.753/41.475 = 115%). Ningún marcador la acota a 1 — acotarla publica 100% donde la medición dice 115% y nadie se entera' },
  /* `2026-08-24` — **las métricas de la POST, que es el prompt que las pidió.** Hasta hoy acá
   * decía *"la POST entra con su clave nada más"*; entran cinco columnas más, medidas sobre
   * el fixture del 20/08 (`DGPLES _ Seguimiento ECVs`, sha `f8ef3227…`), encabezado en la
   * fila 2. Son las que `L-036` necesita y **no las ocho**: `post_camp`, `post_periodo` y
   * `post_formato` no tienen columna en esta solapa ni en ninguna otra `fuente` de
   * `reuniones`/`digital` — barrido por `formato|campa|período|pieza` sobre las diez. Van
   * como pregunta al equipo en `PENDIENTES`, sin prioridad (usuario, 24/08). */
  { base_id: 'reuniones', campo_logico: 'id_cuenta', hoja: 'Agenda JM | Post', columna: 'A', notas: 'mismo ID que la PRE — la clave del par es (ID, solapa), C-50' },

  /* `2026-08-14_1` Parte B — **el alcance es lo único que `reuniones` aporta a la lámina del
   * "1 a 1"**, y por eso es lo único que se mapea. `digital` manda para el desglose por
   * plataforma (decisión del usuario, 14/08): las columnas Meta/Google/Programmatic de esta
   * base empatan exacto con `digital/CAMPAÑAS_DESGLOCE_DIGITAL` en las cuatro celdas medidas
   * (`V-21` a `V-24`), así que mapearlas sería una segunda respuesta a una pregunta que ya
   * tiene una. Quedan documentadas en las notas de `SOLAPAS`, que es donde va el "existe pero
   * no se usa".
   *
   * **Se llama `alc_real` y no `alc_meta` a propósito.** El alcance lo aporta sólo Meta —eso
   * está decidido y medido—, pero el dueño del dato va en la nota, no en el identificador de
   * la medida: meter el corte en el nombre es justo lo que el plan de vocabulario viene a
   * sacar. Hace par con `alc_potencial`, que es el objetivo contra el que se compara. */
  { base_id: 'reuniones', campo_logico: 'alc_real', hoja: 'Agenda JM', columna: 'AF', notas: '"Alcance manual" — alcance del encuentro, y es el de META: verificado como denominador de Frecuencia Meta (25.099/1.412 = 17,775) y de Frecuencia estimada (42.500/1.412 = 30,099). ⚠ es copia a mano de Base_Digital!K (banda "Alcance Meta Convocatoria"): 0 fórmulas entre las dos, coinciden porque alguien las copió' },
  { base_id: 'reuniones', campo_logico: 'alc_real', hoja: 'Agenda JM | Post', columna: 'G', notas: '"Alcance" — el mismo hecho que AF de la PRE. ⚠ la banda de la fila 1 lo rotula "Acumulado" y ESE RÓTULO ESTÁ MAL: el número sale de Base_Digital!Z, banda "Alcance Meta Post" (Retiro 47.753, exacto). Es el alcance de Meta, no un acumulado de las tres plataformas' },

  /* ⭐ **Las cinco de la POST, con su tipo MEDIDO sobre el fixture del 20/08 — 102 filas de datos.**
   *
   * | col | encabezado (fila 2) | tipo crudo medido |
   * |---|---|---|
   * | E | Fecha | 99 `num` (serial) · 3 el texto `-` |
   * | F | Habitantes | 89 `num` · **13 el texto `-`** |
   * | J | Impresiones totales | 102 `num` |
   * | M | Visualizaciones | 102 `num` |
   * | N | % VTR | 102 `num`, **fracción** |
   *
   * ⭐⭐ **Y tres identidades internas que cierran EXACTO, sin una sola excepción** — el control
   * primario de `L-036`, que no depende del deck del equipo ni de una foto de la base porque si
   * la fuente se mueve **se mueven los dos lados** (la forma de `V-111`):
   *
   *   - `% VTR (N) = Visualizaciones (M) / Impresiones totales (J)` → **98 de 98**
   *   - `% Cobertura (I) = Alcance (G) / Habitantes (F)` → **89 de 89**
   *   - `% CTR (L) = Clics (K) / Impresiones totales (J)` → **98 de 98**
   *
   * (las que no cuentan son filas con el divisor en cero o en `-`, no desvíos.)
   *
   * ⚠ **`fecha_periodo` acá NO enciende ningún recorte y eso es deliberado:** `reuniones` es
   * `modo_periodo = snapshot`, así que `leerFuente` **ignora la ventana** y ni busca columna de
   * fecha. Se declara porque es lo que `FILA` necesita en `separador` para ordenar — el orden va
   * en configuración y no en el código (`X-35`). **No mueve `alc_real`, que ya publica.**
   *
   * ⚠ **No se mapean las bandas de plataforma (O-AC).** Es la decisión del 14/08 que ya está
   * escrita arriba y en `SOLAPAS`: *digital manda* para el desglose. Mapearlas sería una segunda
   * respuesta a una pregunta que ya tiene una. */
  { base_id: 'reuniones', campo_logico: 'fecha_periodo', hoja: 'Agenda JM | Post', columna: 'E', notas: '"Fecha" — la del encuentro. ⚠ NO recorta: reuniones es modo_periodo=snapshot y leerFuente ignora la ventana. Se declara para que FILA la use en `separador` (X-35). 3 de 102 filas traen el texto "-" en vez de fecha' },
  { base_id: 'reuniones', campo_logico: 'poblacion', hoja: 'Agenda JM | Post', columna: 'F', notas: '"Habitantes" — mismo campo lógico que rdv/RVD JM-CM - ES!AB, que es donde nació. ⚠ 13 de 102 filas traen el texto "-": ahí una operación numérica devuelve sin_datos, que es correcto. Es el denominador de % Cobertura (I) = G/F, exacta en 89 de 89' },
  { base_id: 'reuniones', campo_logico: 'imp_totales', hoja: 'Agenda JM | Post', columna: 'J', notas: '"Impresiones totales" — el mismo campo lógico que AA de la PRE. Denominador de las dos identidades: % VTR (N) = M/J y % CTR (L) = K/J, exactas en 98 de 98' },
  { base_id: 'reuniones', campo_logico: 'vis_totales', hoja: 'Agenda JM | Post', columna: 'M', notas: '"Visualizaciones" — el acumulado, NO la banda por plataforma (esas son O-AC y no se mapean: digital manda). Numerador de % VTR = M/J' },
  { base_id: 'reuniones', campo_logico: 'vis_vtr_pct', hoja: 'Agenda JM | Post', columna: 'N', notas: '"% VTR" — viene como FRACCIÓN (0,2094), formato `fraccion` como los cc_*_pct. ⚠ SOLAPAS avisa que sus % vuelven string en las filas en cero: medido, 102 de 102 number en el fixture del 20/08, pero la solapa viva puede tener filas en cero' }
];
SEED_MAPEO_ = SEED_MAPEO_.concat(SEED_MAPEO_REUNIONES_);

/* `2026-08-21_7` — **`digital/CAMPAÑAS_DESGLOCE_DIGITAL`, la fuente de los `u1_*` del "1 a 1".**
 *
 * ⭐ **La decisión no es nueva y no se toma acá: está desde el 14/08.** `SEED_SOLAPAS_` ya declara
 * esta solapa como `fuente` con el motivo escrito —*"impresiones, clics y visualizaciones por
 * plataforma, con filtro Id cuentas + Plataforma (V-21 a V-26)"*— y `D-32` existe **porque el
 * sembrador la revirtió una vez**. Lo único que faltaba era el `MAPEO`: la solapa estaba declarada
 * fuente y **no tenía ni una fila mapeada**, así que ningún marcador podía leerla.
 *
 * **De dónde salen las letras.** Del fixture `Seguimiento Digital  2026-08-20.zip`, hoja
 * `CAMPAÑAS_DESGLOCE_DIGITAL` del `Seguimiento Digital  (4).xlsx` — huella registrada en
 * `docs/_fixtures/README.md`. ⚠ **Es una foto del 20/08** (`CLAUDE.md` §4): las letras valen para
 * ese día, y `verificarEncabezadosDeMapeo()` es lo que dice si siguen valiendo hoy. Por eso cada
 * fila lleva su `encabezado` como testigo (`D-31`) — **testigo, nunca fallback**.
 *
 * **Verificado, y es lo que hace citable a las letras:** cuatro de los seis casos `V-21`…`V-26` se
 * reproducen **exactos** sobre el fixture con estas columnas. Los dos que no —`V-25` y `V-26`— no
 * fallan por la columna: **la cuenta `3346-JULJDGAG` tiene dos filas Meta idénticas** con distinto
 * `Id accion`, y su campaña seguía corriendo entre la validación del 19/08 y el fixture del 20/08.
 * Ver `docs/PENDIENTES_consistencia.md`, 21/08.
 *
 * ⚠ **`des_id_accion` no es decorativo: es lo único que separa un duplicado.** Medido sobre el
 * fixture: **61 grupos duplicados, 135 filas de más sobre 5.161**. Un `SUMA` por
 * `Id cuentas` + `Plataforma` los cuenta dos veces.
 *
 * ⚠ **Y `des_campana` tampoco:** el pre y el post de un encuentro viven en la **misma** cuenta y
 * la **misma** plataforma, y se distinguen por el nombre — `"Agenda con 1 - 1 A 1 - San Cristobal"`
 * contra `"Agenda Post con 1 - 1 A 1 - Retiro"`.
 *
 * ⛔ **Lo que este seed NO hace:** no cablea ningún `u1_*`. Mapear es declarar dónde está una
 * columna; cuál token la usa, con qué operación y con qué corte es `MARCADORES`, y eso necesita
 * las decisiones que siguen abiertas — entre ellas de dónde salen los seis `u1_bench_*`, que es
 * una pregunta anterior a todo esto (`CONFIG_INFORMES.md` §2.1). */
var SEED_MAPEO_DESGLOCE_ = [
  // Las dos claves: sin éstas la solapa no se puede recortar ni por encuentro ni por plataforma.
  { base_id: 'digital', campo_logico: 'des_id_cuenta', hoja: 'CAMPAÑAS_DESGLOCE_DIGITAL', columna: 'B', encabezado: 'Id cuentas', notas: 'clave del encuentro — la nombra SOLAPAS.campo_id_cuenta (D-30). Es la misma clave que V-21…V-26' },
  { base_id: 'digital', campo_logico: 'des_plataforma', hoja: 'CAMPAÑAS_DESGLOCE_DIGITAL', columna: 'F', encabezado: 'Plataforma', notas: 'el corte. Valores medidos 20/08: Meta 1840 · DV360 1678 · Google ads 1417 · TikTok 55 · Mercado Libre 27 · Twitter 12 · Twitch 5 · Uber 5 · 122 vacíos. OJO: se escriben así, con mayúscula y espacio — "Google ads", no "google"' },
  // Las tres métricas que los casos de validación nombran.
  { base_id: 'digital', campo_logico: 'des_impresiones', hoja: 'CAMPAÑAS_DESGLOCE_DIGITAL', columna: 'O', encabezado: 'Impresiones', notas: 'V-21 (17.401) y V-23 (25.099) reproducidos exactos sobre el fixture del 20/08' },
  { base_id: 'digital', campo_logico: 'des_visualizaciones', hoja: 'CAMPAÑAS_DESGLOCE_DIGITAL', columna: 'P', encabezado: 'Visualizaciones', notas: 'el numerador de vtr. V-26 apunta acá' },
  { base_id: 'digital', campo_logico: 'des_clics', hoja: 'CAMPAÑAS_DESGLOCE_DIGITAL', columna: 'Q', encabezado: 'Clics', notas: 'el numerador de ctr. V-22 (496) y V-24 (778) reproducidos exactos' },
  // Lo que hace falta para separar filas que las claves solas no separan.
  { base_id: 'digital', campo_logico: 'des_id_accion', hoja: 'CAMPAÑAS_DESGLOCE_DIGITAL', columna: 'A', encabezado: 'Id accion', notas: '⚠ lo único que distingue dos filas por lo demás idénticas. 61 grupos duplicados / 135 filas de más sobre 5.161 (fixture 20/08)' },
  { base_id: 'digital', campo_logico: 'des_campana', hoja: 'CAMPAÑAS_DESGLOCE_DIGITAL', columna: 'E', encabezado: 'Nombre Campaña', notas: '⚠ acá vive el pre/post: "Agenda con 1 - 1 A 1 - X" contra "Agenda Post con 1 - 1 A 1 - X", misma cuenta y misma plataforma' },
  // Fechas y estado — declarados, sin consumidor todavía.
  { base_id: 'digital', campo_logico: 'des_fecha_inicio', hoja: 'CAMPAÑAS_DESGLOCE_DIGITAL', columna: 'I', encabezado: 'Fecha inicio', notas: '' },
  { base_id: 'digital', campo_logico: 'des_fecha_fin', hoja: 'CAMPAÑAS_DESGLOCE_DIGITAL', columna: 'J', encabezado: 'Fecha fin', notas: 'el candidato de u1_fecha_fin' },
  { base_id: 'digital', campo_logico: 'des_estado', hoja: 'CAMPAÑAS_DESGLOCE_DIGITAL', columna: 'K', encabezado: 'Estado', notas: '⚠ los valores van en MAYÚSCULA — FINALIZADA 4338, PAUSADA 433, ACTIVA 229. Un filtro `estado=Activa` copiado de imp_* NO matchea acá (R-10 preserva mayúsculas)' }
];

SEED_MAPEO_ = SEED_MAPEO_.concat(SEED_MAPEO_DESGLOCE_);

/* `2026-08-21_7` segunda tanda — **el resto de las columnas de la solapa, con los dudosos
 * marcados** (decisión del usuario: *"los dudosos mapeálos y que queden en revisar"*).
 *
 * ⚠ **`MAPEO` no tiene columna de estado**, así que el `REVISAR` va en `notas`, en mayúscula.
 * Es el único lugar donde se puede leer, y conviene saber que **no lo frena nada**: mapear es
 * declarar dónde está una columna, y una fila mapeada se puede usar aunque diga REVISAR. Lo que
 * la marca dice es *"nadie confirmó qué significa esta columna"*, no *"no la uses"*.
 *
 * ⭐ **Y hay dos pares de encabezados repetidos en la misma solapa**, que es justo el caso que
 * `D-31` describe: `Estado` (K) contra `estado` (Y), y `Nombre Campaña` (E) contra
 * `nombre_campaña` (V). **Por eso la letra es la referencia y el encabezado sólo el testigo**: un
 * fallback por título elegiría el primero de los dos y acertaría a veces. */
var SEED_MAPEO_DESGLOCE_REVISAR_ = [
  // ⭐ El corte de ámbito — es el mismo `ambito=jm` que ya usan `imp_*` y `gcba_imp_*`, pero
  // sobre esta solapa y con OTROS valores. No se copia el filtro: se mira la columna.
  { base_id: 'digital', campo_logico: 'des_ambito', hoja: 'CAMPAÑAS_DESGLOCE_DIGITAL', columna: 'T', encabezado: 'JM | GCBA | POLICIA', tipo_esperado: 'texto', notas: 'REVISAR — parece el corte de ámbito (el mismo que ambito=jm de imp_*), pero los valores de ESTA solapa no se midieron. Confirmar antes de filtrar' },
  // El tipo de campaña: las filas del 1 a 1 y de RDV traen `RDV`. Candidato para separar una
  // campaña de encuentro de una campaña general, que hoy no tiene forma declarada.
  { base_id: 'digital', campo_logico: 'des_tipo_campana', hoja: 'CAMPAÑAS_DESGLOCE_DIGITAL', columna: 'S', encabezado: 'Tipo Campaña', tipo_esperado: 'texto', notas: 'REVISAR — las filas del 1 a 1 de Parque Avellaneda y las de Retiro traen "RDV". Candidato para distinguir campaña de encuentro de campaña general' },
  { base_id: 'digital', campo_logico: 'des_objetivo', hoja: 'CAMPAÑAS_DESGLOCE_DIGITAL', columna: 'R', encabezado: 'Objetivo', tipo_esperado: 'texto', notas: 'REVISAR — las cinco filas del 1 a 1 traen "ALCANCE". Sin consumidor declarado' },
  { base_id: 'digital', campo_logico: 'des_eje', hoja: 'CAMPAÑAS_DESGLOCE_DIGITAL', columna: 'H', encabezado: 'Eje', tipo_esperado: 'texto', notas: 'REVISAR — sin consumidor declarado' },
  { base_id: 'digital', campo_logico: 'des_consumo', hoja: 'CAMPAÑAS_DESGLOCE_DIGITAL', columna: 'N', encabezado: 'Consumo', tipo_esperado: 'numero', notas: 'REVISAR — sin consumidor declarado. Ningún token de las dos plantillas pide inversión' },
  { base_id: 'digital', campo_logico: 'des_presupuesto', hoja: 'CAMPAÑAS_DESGLOCE_DIGITAL', columna: 'M', encabezado: 'Presupuesto', tipo_esperado: 'numero', notas: 'REVISAR — ídem des_consumo' },
  // ⚠ Los dos encabezados repetidos. Se mapean con nombre distinto y la marca dice por qué.
  { base_id: 'digital', campo_logico: 'des_estado_2', hoja: 'CAMPAÑAS_DESGLOCE_DIGITAL', columna: 'Y', encabezado: 'estado', tipo_esperado: 'texto', notas: 'REVISAR — ⚠ SEGUNDA columna llamada estado: K es "Estado" (FINALIZADA/PAUSADA/ACTIVA) y ésta es "estado", minúscula. No se sabe cuál manda ni si dicen lo mismo. D-31: la letra es la referencia, el título sólo testigo' },
  { base_id: 'digital', campo_logico: 'des_campana_2', hoja: 'CAMPAÑAS_DESGLOCE_DIGITAL', columna: 'V', encabezado: 'nombre_campaña', tipo_esperado: 'texto', notas: 'REVISAR — ⚠ SEGUNDA columna de nombre: E es "Nombre Campaña" y de ahí sale el pre/post verificado. Ésta no se midió' }
];

SEED_MAPEO_ = SEED_MAPEO_.concat(SEED_MAPEO_DESGLOCE_REVISAR_);

/* `2026-08-22_27` Parte B — **`looker/CC`, la fuente del bloque Call Center del Resumen.**
 *
 * La solapa está declarada `fuente` desde el seed y **no tenía ni una fila en `MAPEO`**, así que
 * ningún marcador podía leerla: los cuatro casilleros del Resumen salen `/////`, que ahí dice la
 * verdad — *nadie lo cableó*.
 *
 * ⛔ **ESTE SEED NO CABLEA NINGÚN `cc_*`, Y NO ES PRUDENCIA: ES QUE FALTA UNA DECISIÓN.** Mapear es
 * declarar **dónde está una columna**; qué token la usa, con qué operación y **con qué corte** es
 * `MARCADORES`, y el corte está abierto en `X-28`. Mismo reparto que el `2026-08-21_7` dejó escrito
 * para `CAMPAÑAS_DESGLOCE_DIGITAL`.
 *
 * **Lo que sí está decidido y por eso estas filas se pueden escribir hoy** — `V-105`, medido
 * contra el deck del equipo del 31/07 **y la `Base Looker` del mismo archivo**, cuatro de cuatro:
 *
 *   | casillero | publicado | de dónde sale |
 *   |---|---|---|
 *   | «2 campañas de Call Center» | 2 | CONTEO de filas |
 *   | «Base discada» | 6.011 | **`Base barrida`** (col. C) |
 *   | «Contactados» | 1.878 | `Contactados` (col. D) |
 *   | «(31 %)» | 31 % | `1878/6011` = 31,2 % |
 *
 * ⭐ **«Base discada» es `Base barrida`, NO `Base enviada`, y el que lo decide es el porcentaje.**
 * Los nombres invitan a lo contrario. `V-66` lo separa solo: con `Base enviada` (6.673) el ratio
 * daría `1878/6673` = 28,1 % → **28 %**, y el deck dice **31**. Por eso `Base enviada` **no se
 * mapea acá**: una fila declarada es una invitación a usarla, y ésta ya se usó mal una vez.
 *
 * ⚠ **Y el recorte de `V-91`/`S-01` —`Convocatoria` + `IVR convocatoria`— NO va acá.** Es de la
 * **lámina del iceberg**, que mide otro universo. `V-92` dice que el Resumen **no filtra por tipo**,
 * y las «3 campañas» de agosto son las **tres** filas de `3488-AGOJDGAG`, `Reconfirmación`
 * incluida. Aplicado al Resumen habría dado **6.294 contra 7.096**: plausible, y mal. **El próximo
 * que lea `S-01` lo va a querer aplicar** — está escrito acá para que se lo encuentre antes.
 *
 * **De dónde salen las letras.** De los dos fixtures, `Informe 2026-07-31.zip` y `Seguimiento
 * Digital  2026-08-20.zip`, hoja `CC` de la `Base Looker` — huellas en `docs/_fixtures/README.md`.
 * ⚠ Fotos del 31/07 y del 20/08 (`CLAUDE.md` §4); `verificarEncabezadosDeMapeo()` dice si las
 * letras siguen valiendo hoy, y por eso cada fila lleva su `encabezado` como testigo (`D-31`) —
 * **testigo, nunca fallback**.
 *
 * ⚠ **`C-70`: la sexta columna es NUEVA.** El export del 31/07 tiene **cinco** columnas y 1.301
 * filas; el del 20/08 tiene **seis** —suma `Tipo de llamado`— y 1.338. Nada de lo que se mapea acá
 * la necesita, así que estas cuatro filas andan sobre **las dos** formas. Un lector que exija la
 * sexta rompe sobre el archivo viejo.
 *
 * ⚠ **El prefijo es `lcc_` a propósito y no es capricho:** `cc_contactados` y `cc_efectivos` **ya
 * son `campo_logico` de `reuniones/Agenda JM`** —los lee `enc_ll_contactados` desde el `_44`— y
 * `TIPO_ESPERADO_POR_CAMPO_` ya los tiene declarados. `buscarMapeo` scopea por base + solapa, así
 * que reusarlos *funcionaría*; lo que no sobrevive es la lectura humana. `CLAUDE.md` §4 tiene la
 * regla con nombre: *dos cosas que se llaman igual no son la misma cosa, y en este repo pasa
 * seguido*. Por lo mismo `cc_base_total` **no se toca**: es de `Agenda JM` y `enc_base_total` ya lo
 * lee. */
var SEED_MAPEO_CC_ = [
  // La clave de pertenencia. `looker/CC` NO tiene columna temporal propia: toma la ventana de
  // `Cuentas` por `SOLAPAS.ventana_ref` (`_23`, `D-24`), y `clave_ventana` es el nombre que el
  // mecanismo busca — no es libre.
  { base_id: 'looker', campo_logico: 'clave_ventana', hoja: 'CC', columna: 'A', encabezado: 'ID Cuentas', notas: 'clave del conjunto de pertenencia (_23) — encabezado real "ID Cuentas", con D mayúscula y sin guión bajo, distinto de looker/Cuentas que escribe "id_cuentas"' },
  // Las dos métricas que el Resumen publica, con su número esperado al lado.
  { base_id: 'looker', campo_logico: 'lcc_base_barrida', hoja: 'CC', columna: 'C', encabezado: 'Base barrida', notas: '⭐ ES «Base discada» del deck, pese al nombre. V-105: 4726+1285=6011 exacto contra lo publicado el 31/07. Con Base enviada (6.673) el porcentaje daría 28 y el deck dice 31 — V-66 lo decide solo' },
  { base_id: 'looker', campo_logico: 'lcc_contactados', hoja: 'CC', columna: 'D', encabezado: 'Contactados', notas: 'V-105: 1380+498=1878 exacto. Es también el numerador del 31 % de «Contactados»' },
  // Declarada sin consumidor: la necesita el CONTEO de «N campañas», que cuenta FILAS.
  { base_id: 'looker', campo_logico: 'lcc_id_cuenta', hoja: 'CC', columna: 'A', encabezado: 'ID Cuentas', notas: 'la misma columna que clave_ventana, con otro nombre lógico: el CONTEO de «N campañas de Call Center» cuenta filas por esta columna (el molde es ivr_campanias, que hace CONTEO sobre ivr_id_cuenta). Sin consumidor hasta que X-28 decida el corte' }
];

SEED_MAPEO_ = SEED_MAPEO_.concat(SEED_MAPEO_CC_);



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
  // `X-35` — la audiencia de un envio es el NOMBRE del segmento, no un numero.
  mail_segmentacion: 'texto',
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
  // `X-39` — las otras dos métricas de `looker/DIGITAL`. ⚠ **No están medidas como lo está
  // `Impresiones`**: se declaran `numero` por analogía con su hermana de al lado, y lo que las
  // mide de verdad es `DIAG_BASES` sobre la solapa viva. Si alguna llega como texto, la `SUMA`
  // devuelve cero **sin fallar**, que es el modo de falla caro de este proyecto.
  'Visualizaciones': 'numero', 'Clics': 'numero',
  alcance: 'numero', frecuencia: 'numero',
  // `23/08` — la frecuencia de Meta (col. L de `resumen_metricas_dinamico`). Es otra columna que
  // `frecuencia` (M), no un alias.
  meta_frecuencia: 'numero',
  mail_enviados: 'numero', mail_entregados: 'numero', mail_aperturas: 'numero',
  mail_clics: 'numero', mail_or: 'numero', mail_ctor: 'numero',
  cc_contactados: 'numero', cc_efectivos: 'numero',
  // `_27` — los de `looker/CC`. Prefijo `lcc_` porque los dos de arriba son de
  // `reuniones/Agenda JM` y se llaman igual; ver el seed de `SEED_MAPEO_CC_`.
  lcc_base_barrida: 'numero', lcc_contactados: 'numero', lcc_id_cuenta: 'texto',
  // `X-39` — el grano por cuenta de `looker/DIGITAL`. Prefijo `ldig_` por lo mismo que `lcc_`:
  // `dig_id_cuenta` ya es de `digital/Digital` y este mapa es por campo lógico, no por base.
  ldig_id_cuenta: 'texto',
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
  acum_ctr: 'numero', acum_frecuencia: 'numero', acum_alcance: 'numero',
  // `_44` — `reuniones`. Los `_pct` son `numero` y no un tipo propio: vienen como fracción y
  // `tipo_esperado` describe el dato, no el formato con que se publica.
  cc_base_total: 'numero', cc_base_discada: 'numero', cc_contactados_pct: 'numero',
  cc_efectivos_pct: 'numero', imp_totales: 'numero', alc_potencial: 'numero',
  alc_cobertura_pct: 'numero',
  // `2026-08-14_1` B — el alcance medido, contra `alc_potencial` que es el objetivo.
  alc_real: 'numero',
  /* `2026-08-24` — las dos de la POST (`reuniones/Agenda JM | Post`, M y N). ⚠ `vis_vtr_pct`
   * es `numero` y no un tipo propio, igual que los `cc_*_pct` y `alc_cobertura_pct`: viene
   * como fracción y `tipo_esperado` **describe el dato, no el formato con que se publica**.
   * Medidos, no supuestos: 102 de 102 celdas `num` en el fixture del 20/08. */
  vis_totales: 'numero', vis_vtr_pct: 'numero'
};
SEED_MAPEO_.forEach(function (fila) { fila.tipo_esperado = TIPO_ESPERADO_POR_CAMPO_[fila.campo_logico] || ''; });

/* `_6` (14/08/2026, `D-31`) — **el encabezado que hay hoy en cada letra que `MAPEO` referencia.**
 *
 * **Testigo, nunca fallback.** La letra sigue siendo la única forma de encontrar la columna:
 * buscar por título elegiría siempre el primero de los repetidos. Esto documenta qué se espera
 * encontrar ahí, para que una columna insertada deje de correr el mapeo en silencio.
 *
 * **Vive en el seed y no sólo en la hoja, y el motivo es un modo de falla medido:**
 * `upsertPorClave_` reescribe la fila entera con `headers.map(h => (h in obj) ? obj[h] : '')`
 * cuando *cualquier otra* columna cambia. Una columna que el seed no conoce se borra con `''` —
 * el testigo habría sobrevivido sólo hasta el primer cambio de una nota. Con el valor acá, el
 * diff de `instalar()` **muestra el desalineamiento solo**, sin esperar a la función que compara.
 *
 * Medido con `censarEncabezadosDeMapeo()` el 14/08/2026 a las 00:07 sobre las 161 filas vivas:
 * cero letras sin encabezado y cero títulos repetidos dentro de una misma solapa.
 *
 * **El caso que marca el límite de todo esto:** `rdv|RDV_otros_ministros|fecha_periodo` apunta a
 * `E`, donde el rótulo dice `hora_cita_evento`. **La letra está bien y no se toca** — los
 * encabezados de esa solapa están **corridos una columna en origen** (`C-09`), así que `E`
 * contiene la fecha con el nombre de la hora. Está medido y funciona: 514 filas, 10 en ventana,
 * 0 sin fecha. Su testigo es `hora_cita_evento` porque **el testigo documenta el rótulo, no el
 * contenido** — ver `D-31`.
 */
var ENCABEZADO_POR_MAPEO_ = {
  // `C-09`: rótulo corrido en origen. La `E` trae la fecha bajo el nombre de la hora, así que el
  // testigo coincide y **no delata nada**; si algún día deja de coincidir, será porque alguien
  // arregló los rótulos y entonces hay que revisar la letra, no restaurar el testigo.
  'rdv|RDV_otros_ministros|fecha_periodo': 'hora_cita_evento',
  'rdv|RVD JM-CM - ES|inscriptos': 'Inscriptos',
  'rdv|RVD JM-CM - ES|fecha': 'FECHA',
  'rdv|RVD JM-CM - ES|figura': 'Figura',
  'rdv|RVD JM-CM - ES|barrio': 'Barrio',
  'rdv|RVD JM-CM - ES|evento': 'EVENTO',
  'rdv|RVD JM-CM - ES|status': 'STATUS REUNIÓN',
  'rdv|RVD JM-CM - ES|insc_mail': 'Mail',
  'rdv|RVD JM-CM - ES|insc_cc': 'Call Center',
  'rdv|RVD JM-CM - ES|insc_ivr': 'IVR',
  'rdv|RVD JM-CM - ES|insc_digital': 'RRSS',
  'rdv|RVD JM-CM - ES|insc_dif': 'Difusión',
  'rdv|RVD JM-CM - ES|asistentes': 'Asistentes',
  'rdv|RVD JM-CM - ES|comuna': 'Comuna',
  'rdv|RVD JM-CM - ES|poblacion': 'Poblacion',
  'rdv|RVD JM-CM - ES|fecha_periodo': 'FECHA',
  'm2|M2 periodo DIRECTA|campana': 'Nombre de la campaña',
  'm2|M2 periodo DIRECTA|fecha': 'Fecha de envio',
  'm2|M2 periodo DIRECTA|envios': 'Enviados',
  'm2|M2 periodo DIRECTA|entregados': 'Entregados',
  'm2|M2 periodo DIRECTA|aperturas': 'Aperturas',
  'm2|M2 periodo DIRECTA|or': 'OR%',
  'm2|M2 periodo DIRECTA|clics': 'Clics',
  'm2|M2 periodo DIRECTA|ctor': '% CTOR',
  'm2|M2 periodo DIGITAL|impresiones': 'Impresiones',
  'm2|M2 periodo DIGITAL|alcance_dig': 'Alcance',
  'm2|M2 periodo DIGITAL|views': 'Views',
  'm2|M2 periodo DIGITAL|clics_dig': 'Clics',
  'm2|M2 periodo DIGITAL|campana_dig': 'Nombre de la campaña',
  'm2|M2 periodo DIGITAL|estado': 'Estado',
  'm2|Cuentas|id_cuenta': 'ID Cuentas',
  'm2|Cuentas|campana': 'Campaña',
  'm2|Cuentas|estado': 'Estado campaña',
  'm2|Cuentas|eje': 'Eje',
  'm2|Cuentas|area': 'Área',
  'looker|resumen_metricas_dinamico|campana': 'nombre_campaña',
  'looker|resumen_metricas_dinamico|fecha_inicio': 'fecha_inicio',
  'looker|resumen_metricas_dinamico|fecha_fin': 'fecha_fin',
  'looker|resumen_metricas_dinamico|fecha': 'fecha_inicio',
  'looker|resumen_metricas_dinamico|eje': 'eje',
  'looker|resumen_metricas_dinamico|area': 'area',
  'looker|resumen_metricas_dinamico|estado': 'estado',
  'looker|resumen_metricas_dinamico|dig_impresiones': 'digital_impresiones',
  'looker|resumen_metricas_dinamico|dig_visualizaciones': 'digital_visualizaciones',
  'looker|resumen_metricas_dinamico|dig_clics': 'digital_clics',
  'looker|resumen_metricas_dinamico|alcance': 'meta_alcance',
  'looker|resumen_metricas_dinamico|frecuencia': 'frecuencia_total',
  'looker|resumen_metricas_dinamico|meta_frecuencia': 'meta_frecuencia',
  'looker|resumen_metricas_dinamico|mail_enviados': 'mails_enviados',
  'looker|resumen_metricas_dinamico|mail_entregados': 'mails_entregados',
  'looker|resumen_metricas_dinamico|mail_aperturas': 'mails_aperturas',
  'looker|resumen_metricas_dinamico|mail_clics': 'mails_clics',
  'looker|resumen_metricas_dinamico|cc_contactados': 'call_contactados',
  'looker|resumen_metricas_dinamico|cc_efectivos': 'call_efectivos',
  'looker|resumen_metricas_dinamico|ivr_audiencia': 'ivr_audiencia',
  'looker|resumen_metricas_dinamico|ivr_atendidos': 'ivr_atendidos',
  'looker|resumen_metricas_dinamico|ivr_escucha75': 'ivr_escucha75',
  'looker|resumen_metricas_dinamico|ivr_marque1': 'ivr_marque1',
  'looker|resumen_metricas_dinamico|sms_enviados': 'sms_enviados',
  'looker|resumen_metricas_dinamico|sms_entregados': 'sms_entregados',
  'looker|resumen_metricas_dinamico|fecha_periodo': 'fecha_inicio',
  'looker|resumen_metricas_dinamico|id_cuenta': 'id_cuentas',
  'looker|resumen_metricas_dinamico|post_meta': 'pieza_meta',
  'looker|Cuentas|fecha_periodo': 'fecha_inicio',
  'looker|Cuentas|fecha_fin_periodo': 'fecha_fin',
  'looker|Cuentas|clave_ventana': 'id_cuentas',
  'looker|DIGITAL|clave_ventana': 'Id cuentas',
  'looker|DIGITAL|nombre_campaña': 'nombre_campaña',
  'looker|DIGITAL|estado': 'estado',
  'looker|DIGITAL|Plataforma': 'Plataforma',
  'looker|DIGITAL|Impresiones': 'Impresiones',
  // `X-39` — los tres testigos nuevos. `ldig_id_cuenta` repite el rótulo de `clave_ventana`
  // porque **es la misma columna**: el testigo documenta el rótulo, no el rol (`D-31`).
  'looker|DIGITAL|Visualizaciones': 'Visualizaciones',
  'looker|DIGITAL|Clics': 'Clics',
  'looker|DIGITAL|ldig_id_cuenta': 'Id cuentas',
  'digital|Digital|clave': 'Nombre campaña | Digital',
  'digital|Digital|dig_campana': 'Nombre campaña | Digital',
  'digital|Digital|dig_jm_gcba': 'JM | GCBA | POLICIA',
  'digital|Digital|dig_id_cuenta': 'ID Cuentas',
  'digital|Digital|dig_fecha_inicio': 'Fecha de inicio',
  'digital|Digital|dig_fecha_fin': 'Fecha de fin',
  'digital|Digital|dig_impresiones': 'Impresiones',
  'digital|Digital|dig_alcance': 'Alcance',
  'digital|Digital|dig_frecuencia': 'Frecuencia',
  'digital|Digital|dig_views': 'Views',
  'digital|Digital|dig_vtr': 'VTR',
  'digital|Digital|dig_clics': 'Clics en el enlace totales',
  'digital|Digital|dig_ctr': 'CTR',
  'digital|Digital|dig_impresiones_social': 'Impresiones Social',
  'digital|Digital|fecha_periodo': 'Fecha de inicio',
  'digital|Digital|fecha_fin_periodo': 'Fecha de fin',
  'digital|Directa Mail|mail_id_cuenta': 'ID Cuentas',
  'digital|Directa Mail|mail_campana': 'Nombre campaña | Directa',
  'digital|Directa Mail|mail_enviados': 'Enviados',
  'digital|Directa Mail|mail_entregados': 'Entregados',
  'digital|Directa Mail|mail_aperturas': 'Aperturas',
  'digital|Directa Mail|mail_or': '% OR',
  'digital|Directa Mail|mail_clics': 'Clics',
  'digital|Directa Mail|mail_ctor': '% CTOR',
  'digital|Directa Mail|mail_area': 'Área',
  'digital|Directa Mail|mail_segmentacion': 'Segmentacion',
  'digital|Directa Mail|fecha_periodo': 'Fecha envio',
  'digital|Directa Mail|mail_estado': 'Estado',
  'digital|Directa Mail|mail_tipo': 'Tipo de mail',
  'digital|Directa Mail|mail_remitente': 'Mail remitente',
  'digital|Directa SMS|sms_id_cuenta': 'ID cuentas',
  'digital|Directa SMS|sms_campana': 'Nombre campaña | Directa',
  'digital|Directa SMS|sms_fecha': 'Fecha de envio',
  'digital|Directa SMS|sms_enviados': 'Enviados',
  'digital|Directa SMS|sms_entregados': 'Entregados',
  'digital|Directa SMS|sms_ent_pct': '% Entregados',
  'digital|Directa SMS|sms_clics': 'Clics',
  'digital|Directa SMS|fecha_periodo': 'Fecha de envio',
  'digital|Directa IVR|ivr_id_cuenta': 'ID cuentas',
  'digital|Directa IVR|ivr_campana': 'Nombre campaña | Directa',
  'digital|Directa IVR|ivr_inicio': 'Inicio',
  'digital|Directa IVR|ivr_fin': 'Fin',
  'digital|Directa IVR|ivr_audiencia': 'Audiencia',
  'digital|Directa IVR|ivr_llamados': 'Llamados Realizados',
  'digital|Directa IVR|ivr_atendidos': 'Llamados Atendidos',
  'digital|Directa IVR|ivr_at_pct': '% Atendidos',
  'digital|Directa IVR|ivr_e75': 'Escucharon +75%',
  'digital|Directa IVR|ivr_e75_pct': '% +75%',
  'digital|Directa IVR|ivr_marque1': 'Marque 1',
  'digital|Directa IVR|ivr_marque1_pct': '% Marque 1',
  'digital|Directa IVR|fecha_periodo': 'Inicio',
  'digital|Directa IVR|fecha_fin_periodo': 'Fin',
  'digital|Alcance|alc_id_cuenta': 'ID Cuentas',
  'digital|Alcance|alc_alcance': 'Alcance',
  'digital|Alcance|alc_frecuencia': 'Frecuencia',
  'digital|Seguimiento digital|sd_id_cuenta': 'ID Cuentas',
  'digital|Seguimiento digital|sd_campana_cuentas': 'Nombre campaña | Cuentas',
  'digital|Seguimiento digital|sd_campana_digital': 'Nombre campaña | Digital',
  'digital|Seguimiento digital|sd_fecha_inicio': 'Fecha de inicio',
  'digital|Seguimiento digital|sd_pauta_google': 'Google',
  'digital|Seguimiento digital|sd_pauta_prog': 'Programmatic',
  'digital|Seguimiento digital|sd_pauta_meta': 'Meta',
  'digital|Seguimiento digital|fecha_periodo': 'Fecha de inicio',
  'digital|Seguimiento digital|sd_fecha_fin': 'Fecha de fin',
  'digital|Seguimiento digital|sd_estado': 'Estado',
  'digital|Seguimiento digital|fecha_fin_periodo': 'Fecha de fin',
  'digital|Digital 2026 acumulado|acum_id_cuenta': 'Id',
  'digital|Digital 2026 acumulado|acum_campana': 'Nombre de la campaña',
  'digital|Digital 2026 acumulado|acum_fecha_inicio': 'Fecha de inicio',
  'digital|Digital 2026 acumulado|acum_fecha_fin': 'Fecha de fin',
  'digital|Digital 2026 acumulado|acum_estado': 'Estado',
  'digital|Digital 2026 acumulado|acum_impresiones': 'Impresiones',
  'digital|Digital 2026 acumulado|acum_views': 'Views',
  'digital|Digital 2026 acumulado|acum_clics': 'Clics',
  'digital|Digital 2026 acumulado|acum_ctr': '% CTR',
  'digital|Digital 2026 acumulado|acum_frecuencia': 'Frecuencia',
  'digital|Digital 2026 acumulado|acum_alcance': 'Alcance',
  'digital|Digital 2026 acumulado|fecha_periodo': 'Fecha de inicio',
  'digital|Digital 2026 acumulado|fecha_fin_periodo': 'Fecha de fin',
  'reuniones|Agenda JM|id_cuenta': 'ID',
  'reuniones|Agenda JM|cc_base_total': 'Base total',
  'reuniones|Agenda JM|cc_base_discada': 'Base discada',
  'reuniones|Agenda JM|cc_contactados': 'Contactados',
  'reuniones|Agenda JM|cc_contactados_pct': '% Cont.',
  'reuniones|Agenda JM|cc_efectivos': 'Efectivos',
  'reuniones|Agenda JM|cc_efectivos_pct': '% Efect.',
  'reuniones|Agenda JM|imp_totales': 'Impresiones totales',
  'reuniones|Agenda JM|alc_potencial': 'Alcance potencial',
  'reuniones|Agenda JM|alc_cobertura_pct': '% Cobertura',
  'reuniones|Agenda JM|alc_real': 'Alcance manual',
  'reuniones|Agenda JM | Post|id_cuenta': 'ID',
  'reuniones|Agenda JM | Post|alc_real': 'Alcance',
  // `2026-08-24` — los cinco de la POST. ⚠ El encabezado de esta solapa está en la FILA 2
  // (`SOLAPAS.fila_encabezado = 2`): la fila 1 son las bandas `Comunicación Digital | …`.
  'reuniones|Agenda JM | Post|fecha_periodo': 'Fecha',
  'reuniones|Agenda JM | Post|poblacion': 'Habitantes',
  'reuniones|Agenda JM | Post|imp_totales': 'Impresiones totales',
  'reuniones|Agenda JM | Post|vis_totales': 'Visualizaciones',
  'reuniones|Agenda JM | Post|vis_vtr_pct': '% VTR'
};

// Va DESPUÉS de que `fila.solapa` exista (se asigna desde `hoja` más arriba): la clave la usa.
// Una fila sin entrada queda con `encabezado` vacío, que es lo correcto — vacío significa "sin
// testigo declarado", no "la columna no tiene título".
SEED_MAPEO_.forEach(function (fila) {
  fila.encabezado = ENCABEZADO_POR_MAPEO_[fila.base_id + '|' + fila.solapa + '|' + fila.campo_logico] || '';
});


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
  { periodo_id: 'julio_24_30', desde: '2026-07-24', hasta: '2026-07-30', notas: 'Semana vie-jue del informe vigente — alta para la demo del 12/08' },
  // 20/08/2026 — **la semana que el motor propone hoy**, y entra porque sin ella el temario no se
  // puede cargar: `cargarTemario` exige un `periodo_id` que exista en `PERIODOS` (`D-19`), así que
  // con `CONFIG` vaciado el panel proponía una semana contra la cual no se podía cargar nada.
  //
  // ⚠ **Esto es un tapón, no la solución.** Una fila de seed por semana significa `clasp push` cada
  // viernes, que es exactamente la línea de `.gs` que `D-01` mide. Lo que corresponde es que el
  // panel cree el período — y eso es un **escritor nuevo** de hoja de registro, con su fila en
  // `docs/ESCRITORES.md`. Mientras tanto: **una fila escrita a mano en la hoja también sirve y
  // sobrevive** a *Aplicar configuración*, porque `upsertPorClave_` reporta `soloEnHoja` y nunca
  // borra. Quien tenga la planilla abierta no necesita esperar un push.
  //
  // El nombre lleva el rango adentro por la convención que fijó `julio_24_30`: `agosto_sem3`
  // obligaría a contar viernes para saber cuál es.
  { periodo_id: 'agosto_14_20', desde: '2026-08-14', hasta: '2026-08-20', notas: 'Semana vie-jue que el motor propone al 20/08 (R-11 Addendum 2). Alta para destrabar la carga de temario.' }
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
  /* ⛔ **`Directa Mail` sigue separada de sus dos hermanas, y la separación se queda aunque la
   * declaración se haya ido.** Las tres compartían una sola llamada, así que declarar
   * `campo_id_cuenta` en el grupo se lo ponía también a `Directa IVR` y `Directa SMS` — **que no
   * tienen ese campo lógico en `MAPEO`**, y ahí un marcador con ítem falla con
   * `@campo_id_cuenta_no_mapeado` en vez de leer. Es el modo de falla del `_44` exacto: la
   * declaración entra en un lugar y no en los otros, y **los `ivr_*` del iceberg publican
   * números validados `exacto`**.
   *
   * ⭐ **Separarla no cambia ni una celda** —produce la misma fila que producía el grupo— **y
   * deja la trampa desarmada para el día que la declaración vuelva.** Por eso no se revierte
   * junto con `X-39`: lo que se revirtió es la declaración, no el cuidado.
   *
   * ⭐ **Su testigo salió idéntico en las dos corridas del 23/08** —`mail_entregados` JM 538.276
   * y GCBA 2.334.767, los dos al dígito—, así que **ésta nunca fue la sospechosa**.
   *
   * ⚠ **Pero eso es evidencia, no una propiedad, y conviene no leerlo de más:** `R-31` tiene a
   * `mail_entregados` **en la lista de inestables** —`14/1687` (0,8 %), 10 altas y 4 cambios,
   * mínimo `−27`—. Que reprodujera dos veces se explica por **el intervalo corto entre tomas**,
   * no por la clase del campo. La próxima vez puede no reproducir **sin que nada esté roto**. */
  [filaSolapa_('digital', 'Directa Mail', 'fuente', 'canales de directa', { campo_id_cuenta: 'mail_id_cuenta' })],
  filasSolapa_('digital', ['Directa IVR', 'Directa SMS'], 'fuente', 'canales de directa'),
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
  /* ⚠ `2026-08-14_1` Parte B — **estaba `ignorar` en el seed y `fuente` en la hoja viva, y
   * correr el sembrador revirtió la decisión del usuario.** Se restituye acá para que no
   * vuelva a pasar: mientras el seed diga `ignorar`, cada corrida de
   * `aplicarClasificacionSolapas_()` la pisa de nuevo, en silencio y sin que ningún token falle.
   *
   * La premisa de `R-22` venció. El diagnóstico del 09/08 —"congelada, sus filas JM llegan al
   * 17/04"— era cierto ese día; la solapa se actualizó desde entonces y hoy es la fuente de los
   * `u1_*`, con los casos `V-21` a `V-26` del consolidado del 14/08 validados sobre datos de
   * julio (San Cristóbal 23/07, Retiro 24/07). El usuario la dejó en `fuente` el 14/08.
   *
   * `R-22` no se deroga: sigue siendo la regla correcta. Lo que venció es la **medición** que la
   * aplicaba a esta solapa, que es justo el caso de "un dato medido una vez y citado tres veces". */
  /* `2026-08-21_7` — **`campo_id_cuenta` faltaba, y sin él el `MAPEO` no sirve por ítem.**
   * `SOLAPAS.campo_id_cuenta` es lo que `datosDeMarcador_` usa para quedarse con la fila del
   * encuentro (`D-30`); sin declararlo, un marcador con `id_cuenta` falla con
   * `@campo_id_cuenta_no_mapeado` en vez de recortar. Apunta a la fila de `MAPEO`
   * `des_id_cuenta` — columna B, `Id cuentas`, la misma clave de `V-21`…`V-26`. */
  filasSolapa_('digital', ['CAMPAÑAS_DESGLOCE_DIGITAL'], 'fuente', 'fuente de los u1_* del "1 a 1" — impresiones, clics y visualizaciones por plataforma, con filtro Id cuentas + Plataforma (V-21 a V-26, consolidado 14/08). Repuesta a fuente el 14/08: el seed la tenía en ignorar por una medición de R-22 del 09/08 que venció. Mapeada el 21/08 (SEED_MAPEO_DESGLOCE_)', { campo_id_cuenta: 'des_id_cuenta' }),
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
    // `2026-08-19_1` Parte B — `campo_id_cuenta: 'id_cuenta'`: el grano de esta solapa ES la
    // campaña (995 filas, 1 por id_cuenta, medido el 19/08), y la campaña es el ítem de la
    // iteración de la lámina de resultados agregados — así que el recorte lo hace la cuenta y
    // NO la fecha (D-30 + R-17: el temario ya seleccionó).
    filaSolapa_('looker', 'resumen_metricas_dinamico', 'fuente', 'Paso 2.9 Parte C (S-01): QUERY() viva sobre Cuentas, no deriva de resumen_metricas — hoja_default', { campo_id_cuenta: 'id_cuenta' }),
    filaSolapa_('looker', 'resumen_metricas', 'derivada', 'Paso 2.9 Parte C (S-01): pegado de valores; devolvió 899 de 903 filas sin fecha'),
    filaSolapa_('looker', 'MAIL', 'ignorar', 'R-22 (09/08): sin columna de fecha y sin fila en MAPEO — ilegible para el motor', { filas_datos: 5748 }),
    filaSolapa_('looker', 'IVR', 'ignorar', 'R-22 (09/08): sin columna de fecha y sin fila en MAPEO — ilegible para el motor', { filas_datos: 190 }),
    filaSolapa_('looker', 'SMS', 'ignorar', 'R-22 (09/08): sin columna de fecha y sin fila en MAPEO — ilegible para el motor', { filas_datos: 86 }),
    /* `_27` (22/08) — **`ventana_ref` a `Cuentas`, igual que `DIGITAL`.** `looker/CC` **no tiene
     * columna temporal propia** —lo dice su propia firma: `ID Cuentas · Base enviada · Base
     * barrida · Contactados · Efectivos`—, así que sin esto una lectura recortada por ventana no
     * tiene con qué recortar y **devuelve la solapa entera**: 1.301 filas del gabinete completo
     * donde el Resumen publica 2.
     *
     * ⚠ **Y la pertenencia sola NO alcanza como corte**, que es el hallazgo de la Parte 0 y por eso
     * se escribe acá al lado: para 24-31/07 da **18 cuentas / 22 filas / 100.197** —factor 16,7
     * sobre lo publicado— porque `looker/Cuentas` trae **el gabinete entero**. Es la misma familia
     * que `R-15` addendum 1. Qué cuentas entran es `X-28` y sigue abierto; esto declara **cómo se
     * recorta por tiempo**, no **quién entra**. */
    filaSolapa_('looker', 'CC', 'fuente', 'detalle por canal, con ID cuentas · ventana por referencia a Cuentas (_27): no tiene columna temporal propia', { filas_datos: 1299, ventana_ref: 'Cuentas' }),
    // `_23` (10/08) — la única solapa del repo con `ventana_ref`. `C-19` midió que `DIGITAL`
    // **no tiene ninguna columna temporal**: `fecha_inicio` y `fecha_fin` viven en `Cuentas`.
    // Sin esta declaración `leerFuente` falla con `«FALTA:fecha_periodo@looker/DIGITAL»`, que
    // es el modo de falla correcto — pero deja la solapa ilegible y con ella los tres `imp_*`.
    /* ⭐ `X-39` (23/08/2026) — **`campo_id_cuenta` habilita la rama por cuenta de `D-30`.** Sin
     * esto un marcador que lea esta solapa no se puede acotar a la cuenta de la campaña:
     * recorta por pertenencia + ámbito, que es el universo de los `imp_*` y **no** el de una
     * campaña. Es lo que habilita los quince `camp_{meta,google,prog}_*` de `L-046`.
     *
     * ⛔⛔ **Se declaró, se revirtió y se repuso EL MISMO DÍA. La historia entera va acá porque
     * sin ella la línea se lee como si nunca hubiera pasado nada, y lo que pasó es lo caro.**
     *
     * **Qué se midió:** con la declaración puesta, los cuatro `imp_*` de JM quedaron
     * **idénticos** al testigo `V-110` (uno a ±1) y los cuatro `gcba_imp_*` subieron **+0,37 %**
     * (`+295.578` meta · `+239.473` google · `+46.703` prog). Se revirtió por el criterio duro
     * del usuario —*si alguno se movió, se revierte, no se explica*— y **la reversión salió
     * limpia**, que era lo que había que probar.
     *
     * ⭐⭐ **Y después se cerró SIN corrida, con un argumento que sale del propio esquema:
     * `campo_id_cuenta` es por SOLAPA, no por marcador.** Los ocho `imp_*` —los cuatro de JM y
     * los cuatro de GCBA— leen **esta misma solapa** con la **misma** operación (`SUMA` sobre
     * `Impresiones`, `filtro = estado=Activa`) y difieren **sólo** en `dimensiones`
     * (`ambito=jm` / `ambito=gcba`). **Un cambio de esquema de la solapa no puede mover un
     * ámbito y dejar el otro idéntico al dígito.** JM salió idéntico ⇒ la lectura no cambió.
     *
     * ⭐ **El canario lo confirma desde afuera:** `gcba_frecuencia` pasó de `-6.1-` a `-6.25-` en
     * la misma corrida, y lee `looker/resumen_metricas_dinamico` — una solapa que `X-39` **no
     * tocó**. Un marcador que se mueve sobre una solapa intacta sólo se explica por la fuente.
     *
     * **La causa real es `R-31`: esta solapa es inestable por CAMBIO** —`19/503` filas, **cero
     * altas**, recálculo en el lugar—, y el universo de GCBA es mucho más grande que el de JM,
     * así que tiene mucha más chance de contener una de las 19. **El testigo `V-110` le exigió
     * igualdad exacta a un campo que `R-31` ya había medido como inestable**: el error estaba en
     * el criterio del testigo, no acá. Addendum del 23/08 en
     * `docs/_snapshots/TESTIGO_esquema_id_cuenta_2026-08-22.md`.
     *
     * ⚠ **Lo que sí cambia y no es regresión:** la traza gana el aviso «se lee como AGREGADO
     * GLOBAL» en los marcadores sin ítem (`C-81`). **Se comparan valores, nunca trazas.** */
    filaSolapa_('looker', 'DIGITAL', 'fuente', 'detalle por canal, con ID cuentas · ventana por referencia a Cuentas (_23): no tiene columna temporal propia', { filas_datos: 4563, ventana_ref: 'Cuentas', campo_id_cuenta: 'ldig_id_cuenta' }),
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
  /* `_44` Parte C — las cuatro solapas de `reuniones`.
   *
   * **`fila_encabezado: 2` en las tres de agenda**: la fila 1 es una banda de grupos
   * (`Comunicación Directa | Mailing`, `Comunicación Digital | Meta`, …) y la 2 son los títulos.
   * Medido sobre la copia viva el 12/08: `Agenda JM` 152 filas × 44 columnas, `ID` único.
   *
   * **`campo_id_cuenta: 'id_cuenta'` en las dos que son fuente**, que es lo que hace que un
   * marcador de encuentro se quede con la fila de SU cuenta y no publique el agregado en las
   * seis láminas (`D-30`). Va en las dos por separado y no en la base: `C-50` midió que el mismo
   * `ID` vive en `Agenda JM` (PRE, 152 ids) y en `Agenda JM | Post` (POST, 102 ids, 98
   * compartidos), así que la clave del par es `(ID, solapa)`.
   *
   * `Agenda funcionarios` queda `ignorar`: son encuentros de otros funcionarios, el mismo caso
   * que `rdv/RDV_otros_ministros` pero sin nadie que los pida hoy. `Barrios` es `referencia`:
   * es la tabla de habitantes por barrio y comuna, no una fuente de métricas. */
  [
    filaSolapa_('reuniones', 'Agenda JM', 'fuente', 'PRE — una fila por encuentro, 154 filas × 44 columnas al 14/08, ID único. Embudo de Call Center, Mail, IVR e impresiones por plataforma en la misma fila. De acá se mapea SÓLO el alcance (AF): las columnas de plataforma AJ-AR existen y NO se usan porque empatan exacto con digital/CAMPAÑAS_DESGLOCE_DIGITAL y digital manda (2026-08-14_1). Toda la solapa es carga a mano: 0 fórmulas en 44 columnas × 154 filas', { fila_encabezado: 2, filas_datos: 154, campo_id_cuenta: 'id_cuenta' }),
    filaSolapa_('reuniones', 'Agenda JM | Post', 'fuente', 'POST — 104 filas al 14/08, mismo ID que la PRE (C-50). Impresiones, clics y visualizaciones por plataforma en bandas Meta/Google/Programmatic (fila 1); los títulos de la fila 2 se repiten y NO alcanzan para nombrar una columna. El Alcance (G) NO es por plataforma y su banda "Acumulado" está mal rotulada: es el de Meta. Las columnas de plataforma no se mapean — digital manda. ⚠ sus % CTR y % VTR vuelven string en las filas en cero y number en las cargadas', { fila_encabezado: 2, filas_datos: 104, campo_id_cuenta: 'id_cuenta' }),
    filaSolapa_('reuniones', 'Agenda funcionarios', 'ignorar', 'encuentros de otros funcionarios — mismo caso que rdv/RDV_otros_ministros, nadie los pide hoy', { fila_encabezado: 2, filas_datos: 545 }),
    filaSolapa_('reuniones', 'Barrios', 'referencia', 'habitantes por barrio y comuna — tabla de referencia, no fuente de métricas', { fila_encabezado: 1, filas_datos: 70 }),

    /* ── Las 20 solapas nuevas de `reuniones` — alta del 15/08/2026 ──────────────────────
     *
     * Cierra el `_1` y el punto 5 del `_4`. **Cada nota lleva la medición y su fecha, no el
     * veredicto**: una nota que dice sólo "no sirve" es indistinguible de una regla, y quien la
     * lea en noviembre no va a poder saber si sigue siendo cierta. Es el modo de falla que
     * revirtió `CAMPAÑAS_DESGLOCE_DIGITAL` el 14/08.
     *
     * **La evidencia está en `docs/CENSO_solapas_reuniones_2026-08-14.md`** —las 24 solapas con
     * forma, filas y motivo— y en la corrida de cobertura del 15/08 contra los universos de
     * `Agenda JM`. Estas notas la citan; no la repiten.
     *
     * **⚠ NINGUNA VA A `fuente`, y el motivo es estructural: las 20 son espejos.** Cada una es
     * un `IMPORTRANGE` en `A1` de la planilla `1siyVJPVuObp1UEeQTS4IncXpsbev_Iqs-b27hZfLhds`,
     * importando el rango entero (medido 15/08/2026). Las cuatro registradas tienen **cero
     * fórmulas**. Leer el espejo en vez del original es tener **dos respuestas para la misma
     * pregunta**: si alguna hiciera falta como fuente, se registra **esa planilla** como base y
     * se lee de ahí. Hoy **no está en `BASES` y nadie sabe que existe** — anotado en el censo. */
    filaSolapa_('reuniones', 'Base_Digital', 'referencia', 'ESPEJO IMPORTRANGE de 1siyVJPV… · ocho bloques lado a lado, cada uno con su propia lista de ids (27 cols x 1.910 filas). ⚠ DESALINEAMIENTO PROBADO (15/08/2026): en su fila 3, col A = 1493-JUNJDGAG, col G = 1688-JULJDGAG, col M = 2411-DICJDGAG, col Q = 2723-MARJDGAG — leerla POR FILA mezcla cuatro encuentros distintos. Es el origen de lo que Agenda JM!AF y Agenda JM | Post!G traen copiado a mano. Su banda Alcance Meta Convocatoria (col J) cubre 24 de 25 Uno a uno y cierra contra alc_real. R-27: las únicas bandas de alcance son Meta Convocatoria (J-L) y Meta Post (Y-AA) — no hay de Google ni de Programmatic', { fila_encabezado: 2, filas_datos: 1908 }),

    // Las tres excepciones del Addendum 2 del `_1`, medidas antes de clasificarlas.
    filaSolapa_('reuniones', 'Desglose impresiones', 'ignorar', 'ESPEJO IMPORTRANGE de 1siyVJPV… · 0 de 25 Uno a uno (medido 15/08/2026): sólo cubre Encuentro con vecinos. Tres pares (id, impresiones) lado a lado con listas independientes — Social/Google/Programmatic en A, C y E, o sea TRES columnas clave, no una. Sin columna de alcance, consistente con R-27. Se abrió por llamarse igual que la decisión editorial del 13/08 y no es eso', { fila_encabezado: 1, filas_datos: 2746 }),
    filaSolapa_('reuniones', 'Métricas digital', 'ignorar', 'ESPEJO IMPORTRANGE de 1siyVJPV… · 0 de 25 Uno a uno (medido 15/08/2026, clave en A): sólo cubre Encuentro con vecinos. Se abrió por ser la única con Views y Visualizaciones-para-el-PRE es hueco abierto; NO lo cubre. Comparte las 961 filas con reuniones/Digital porque son la MISMA LISTA DE CAMPAÑAS, no porque sean la misma solapa: acá están las métricas, allá los metadatos. Tiene una columna Post que el frente del "1 a 1" va a querer mirar', { fila_encabezado: 1, filas_datos: 960 }),
    filaSolapa_('reuniones', 'Digital | Base Post', 'ignorar', 'ESPEJO IMPORTRANGE de 1siyVJPV… · 0 de 25 Uno a uno (medido 15/08/2026, clave en A): sólo cubre Encuentro con vecinos. Se abrió por ser POST, que es lo que la hacía candidata para la mitad POST de la lámina del "1 a 1"; no trae ninguno de sus encuentros', { fila_encabezado: 1, filas_datos: 37 }),

    /* Las tres de cobertura perfecta, resueltas el 15/08 con la lectura profunda. Van a
     * `referencia` y **no a `ignorar`**: cubren los 25 Uno a uno al 100% y una solapa que
     * responde por todos los encuentros no se descarta — se deja a mano y no se lee como fuente,
     * que es exactamente lo que `referencia` significa. */
    filaSolapa_('reuniones', 'Total', 'referencia', 'ESPEJO IMPORTRANGE de 1siyVJPV… (15/08/2026). Cobertura perfecta: col B da 25/25 Uno a uno, 154/154 Agenda JM, 104/104 POST y 3/3 Recap. NINGUNA MÉTRICA: sus 14 columnas son Estado, ID Cuentas, Tipo, Nombre y fechas de inicio/fin por canal. Es un índice de estados, no una fuente — por eso referencia y no ignorar', { fila_encabezado: 2, filas_datos: 2631 }),
    filaSolapa_('reuniones', 'EDVs | Estados', 'referencia', 'ESPEJO IMPORTRANGE de 1siyVJPV… (15/08/2026). Col B da 154/154 y 25/25 en la PRE, y 100 de 104 en la POST — las 4 que faltan son dato a mirar, no descarte. NINGUNA MÉTRICA: lo mismo que Total más Funcionario y Barrio', { fila_encabezado: 2, filas_datos: 693 }),
    filaSolapa_('reuniones', 'Métricas EDVs', 'referencia', 'ESPEJO IMPORTRANGE de 1siyVJPV… (15/08/2026), y es el SUPERCONJUNTO de Agenda JM: 45 columnas con Impr. Social/Google/Programm, Alcance manual, Frecuencia Meta, Cobertura, el embudo de IVR, y CALL CENTER JM separado de CALL CENTER FUNCIONARIOS. Verificado para 1493: sus S/T/U/V reproducen exacto AA/AJ/AM de Agenda JM. Trae además una columna Validación que no existe en ninguna registrada. ⚠ De acá sale lo que Agenda JM publica, así que es DE DÓNDE VIENE el dato — no se lee como fuente porque su dueño es otra planilla, no ésta. Clave "ID Reunión", no "ID Cuentas". Es el insumo directo de la R-NN de los dos universos de Call Center', { fila_encabezado: 2, filas_datos: 758 }),

    // Las capas de filas de `C-64` — el agregado por cuenta ya está en `Agenda JM`.
    filaSolapa_('reuniones', 'Base_mail', 'ignorar', 'ESPEJO IMPORTRANGE de 1siyVJPV… · capa de FILAS del canal mail (C-64, medido 14/08/2026): una fila por envío, 360 x 8. El agregado por cuenta que el motor usa ya está en Agenda JM. Leerla sería doble conteo', { fila_encabezado: 1, filas_datos: 359 }),
    filaSolapa_('reuniones', 'Base_IVR', 'ignorar', 'ESPEJO IMPORTRANGE de 1siyVJPV… · capa de FILAS del canal IVR (C-64, medido 14/08/2026): 61 x 9. Su agregado por cuenta está en Agenda JM', { fila_encabezado: 1, filas_datos: 60 }),
    filaSolapa_('reuniones', 'Base_Call', 'ignorar', 'ESPEJO IMPORTRANGE de 1siyVJPV… · capa de FILAS de call center (C-64, medido 14/08/2026): 227 x 5. Su agregado por cuenta está en Agenda JM, y es de donde salen los cc_*', { fila_encabezado: 1, filas_datos: 226 }),

    // Los tres cortes de `Call`, y el `Call` entero.
    filaSolapa_('reuniones', 'Call', 'ignorar', 'ESPEJO IMPORTRANGE de 1siyVJPV… · tiene la columna Tipo de llamado con Convocatoria, Reconfirmación, IVR convocatoria e Informativo — insumo directo de la R-NN de los dos universos de Call Center. Catálogo de campañas de call center, 1.330 x 28 (medido 14/08/2026) — mismo alto que looker/CC. No es por encuentro: es por campaña, con el id de cuenta como una columna más', { fila_encabezado: 1, filas_datos: 1329 }),
    filaSolapa_('reuniones', 'Call (JM)', 'ignorar', 'ESPEJO IMPORTRANGE de 1siyVJPV… · el recorte JM de Call, 227 x 28 (medido 14/08/2026) — mismo alto que Base_Call. Un recorte de una solapa que ya se ignora', { fila_encabezado: 1, filas_datos: 226 }),
    filaSolapa_('reuniones', 'Call (Funcionarios)', 'ignorar', 'ESPEJO IMPORTRANGE de 1siyVJPV… · el recorte de funcionarios de Call, 977 x 28 (medido 14/08/2026). 227 + 977 = 1.204 contra las 1.330 de Call: los tres conteos no cierran y nadie declaró por qué. Mismo caso que Agenda funcionarios — nadie los pide hoy', { fila_encabezado: 1, filas_datos: 976 }),

    // Las dos sin fila de títulos: el testigo de `D-31` no es aplicable acá.
    filaSolapa_('reuniones', 'IVR', 'ignorar', 'ESPEJO IMPORTRANGE de 1siyVJPV… · SIN FILA DE TÍTULOS (medido 14/08/2026): su fila 1 son datos ("0781-NOVINFGC | Implementado | Yamila Abayay | Mon Jan 13 2025..."), 104 x 21. Vetada por R-02 como cualquier solapa sin encabezados, y sin fila de títulos tampoco puede llevar el testigo de D-31', { fila_encabezado: 0, filas_datos: 104 }),
    filaSolapa_('reuniones', 'Mail', 'ignorar', 'ESPEJO IMPORTRANGE de 1siyVJPV… · SIN FILA DE TÍTULOS (medido 14/08/2026): su fila 1 son datos ("0869-ENESALGC | Implementado | 03/01/2025..."), 383 x 14. Mismo caso que IVR', { fila_encabezado: 0, filas_datos: 383 }),

    // Tableros y catálogos: `R-02` los excluye como fuente.
    filaSolapa_('reuniones', 'EDVs | Activos', 'ignorar', 'ESPEJO IMPORTRANGE de 1siyVJPV… · tres celdas de tablero (medido 14/08/2026): "EDVs activas por equipo" → DIGITAL: 1 | MAIL: 1 | CALL CENTER: 0. Sin clave y sin filas — 3 x 3', { fila_encabezado: 1, filas_datos: 2 }),
    filaSolapa_('reuniones', 'EDVs | Resumen', 'ignorar', 'ESPEJO IMPORTRANGE de 1siyVJPV… · tablero de conteos (medido 14/08/2026): "EDVs realizadas (a hoy)" = 682, más encuentros por fecha en dos bloques. 174 x 16, sin fila por encuentro', { fila_encabezado: 2, filas_datos: 172 }),
    filaSolapa_('reuniones', 'Estados', 'ignorar', 'ESPEJO IMPORTRANGE de 1siyVJPV… · tabla de desplegables (medido 14/08/2026): Equipo | Estado | Recategorización, 14 filas. Es el catálogo de estados, no una fuente de métricas', { fila_encabezado: 1, filas_datos: 13 }),

    // Duplicados de otras bases o de esta misma.
    filaSolapa_('reuniones', 'EDVs | Seguimiento Funcionarios', 'ignorar', 'ESPEJO IMPORTRANGE de 1siyVJPV… · duplicado de digital/EDV (medido 14/08/2026): 291 x 27, MISMO alto y MISMO ancho, y digital/EDV ya está registrada como referencia. Leer las dos es doble conteo del mismo hecho', { fila_encabezado: 2, filas_datos: 289 }),
    filaSolapa_('reuniones', 'Digital', 'ignorar', 'ESPEJO IMPORTRANGE de 1siyVJPV… · 961 x 19 (medido 15/08/2026). Comparte las 961 filas con reuniones/Métricas digital porque son la MISMA LISTA DE CAMPAÑAS: acá los metadatos, allá las métricas. NO son la misma solapa duplicada — esa hipótesis del 14/08 se midió y es falsa. ⚠ Tiene la columna JM | GCBA | POLICIA, o sea la dimensión ámbito del _2 escrita como columna en vez de inferida del nombre de campaña; no se usa todavía. Su nombre colisiona con la base digital y con digital/Digital, que son otras dos cosas', { fila_encabezado: 1, filas_datos: 960 })
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
  var usosConservados = []; // `D-32`: el `uso` de la hoja le ganó al del seed
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
    /* `_3` / `_7` bloque 3 (14/08/2026, `D-32`) — **el sembrador nunca pisa un `uso` que ya
     * existe en la hoja. La hoja manda.**
     *
     * **Por qué, con el caso que lo originó y su fecha.** El 14/08/2026 la Parte B del
     * `2026-08-14_1` corrió esta función y cambió `digital/CAMPAÑAS_DESGLOCE_DIGITAL` de
     * `uso = fuente` —como la había dejado el usuario ese mismo día— a `uso = ignorar`, porque
     * el seed seguía declarando `ignorar` por una medición de `R-22` del 09/08 **que ya había
     * vencido**. Nadie lo pidió y nada falló: esa solapa es la fuente de los seis `u1_*` del
     * "1 a 1" (`V-21` a `V-26`), y con `ignorar` el motor deja de leerla y los seis salen
     * vacíos **sin que ninguna verificación del proyecto lo señale**. La corrida no falla:
     * publica menos.
     *
     * **`origen = 'manual'` no alcanzaba como escape**, y ésa es la causa real: una decisión
     * tomada **editando la hoja a mano no pone `manual`**, así que toda fila humana quedaba
     * indistinguible de una fila del seed. El escape existía y era inalcanzable por el camino
     * que la gente usa.
     *
     * **Qué NO cambia:** una solapa **nueva** —sin fila en la hoja— toma el `uso` del seed,
     * que es como nace toda clasificación. Y las demás columnas se siguen sembrando: el gate
     * es sobre `uso`, no sobre la fila.
     *
     * La diferencia no se pierde: sale por `usosConservados` y la lista `diffSolapasSinAplicar_()`
     * la muestra en cualquier momento sin escribir nada. */
    var decision = usoAEscribir_(existente, obj.uso);
    if (decision.conservado) {
      usosConservados.push({ clave: clave, enLaHoja: decision.uso, enElSeed: obj.uso,
                             degradacion: esDegradacionDeUso_(decision.uso, obj.uso) });
    }
    var usoDelSeed = decision.uso;

    objetosAAplicar.push({
      base_id: obj.base_id,
      solapa: obj.solapa,
      uso: usoDelSeed,
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
  resultado.usosConservados = usosConservados; // `D-32`
  // C.2-5: las protegidas SÍ están en el seed — se sacaron de `objetosAAplicar` a
  // propósito. Sin esta resta saldrían como `solo_en_hoja`, que es exactamente la
  // categoría contraria (lo que nadie declaró) y volvería a confundir dos cosas
  // distintas en el mismo reporte.
  var esProtegida = {};
  protegidas.forEach(function (p) { esProtegida[p.clave] = true; });
  resultado.soloEnHoja = (resultado.soloEnHoja || []).filter(function (s) { return !esProtegida[s.clave]; });
  return resultado;
}

/**
 * `D-32` — ¿pasar de `deLaHoja` a `delSeed` haría que el motor **deje de leer** la solapa?
 *
 * Sólo `fuente` se lee (`buscarMapeo` rechaza todo lo demás), así que la degradación que
 * importa es exactamente una: salir de `fuente`. Las otras transiciones cambian la etiqueta y
 * no lo que el motor hace, y meterlas en la misma bolsa haría que el aviso se ignore.
 */
/**
 * `D-32` — **qué `uso` se escribe**, dado lo que hay en la hoja y lo que dice el seed.
 *
 * **INSERTAR NUNCA ES DEGRADAR: una fila que no existe no tiene `uso` que proteger.** Ésa es la
 * distinción, y va escrita porque es exactamente la que se puede perder al leer el gate de
 * apuro: `existente` ausente significa *alta*, no *conflicto*, y el `uso` del seed entra tal
 * cual. Sin eso, el gate que protege contra degradaciones bloquearía toda alta — y el síntoma
 * sería una corrida que termina bien y una hoja que no cambia.
 *
 * **Se extrajo a una función pura el 15/08 para poder probarla.** Vivía inline dentro de
 * `aplicarClasificacionSolapas_`, que toca la planilla, así que el único caso verificable era el
 * de `esDegradacionDeUso_` — y por eso `probarGateDeUsoDeSolapas_` pasó con siete afirmaciones
 * sin cubrir el alta.
 */
function usoAEscribir_(existente, usoDelSeed) {
  // Alta: no hay fila, no hay nada que proteger.
  if (!existente) return { uso: usoDelSeed, conservado: false };

  var usoVigente = normalizarValorDeclarado_(existente.uso);
  // Fila existente con `uso` vacío: tampoco hay decisión humana que conservar.
  if (usoVigente === '') return { uso: usoDelSeed, conservado: false };

  // Misma normalización que `esDegradacionDeUso_`: sin `trim`, un `" fuente "` de la hoja se
  // leía como distinto del `'fuente'` del seed y el gate conservaba el valor sucio.
  if (usoVigente === normalizarValorDeclarado_(usoDelSeed)) {
    return { uso: usoDelSeed, conservado: false };
  }

  // Acá sí: la hoja dice algo distinto de lo que el seed quiere. La hoja manda.
  return { uso: existente.uso, conservado: true };
}

function esDegradacionDeUso_(deLaHoja, delSeed) {
  return normalizarValorDeclarado_(deLaHoja) === 'fuente' &&
         normalizarValorDeclarado_(delSeed) !== 'fuente';
}

/* **Por qué `normalizarValorDeclarado_` y no `normalizarParaComparar_`, que era lo que había.**
 *
 * La segunda termina en `String(valor)` y **no hace `trim`**: sirve para canonicalizar fechas en
 * el diff, que es para lo que se escribió. Con ella, un `uso` tipeado como `" fuente "` no
 * matcheaba `'fuente'` y el gate lo trataba como un valor distinto. Lo cazó
 * `probarGateDeUsoDeSolapas_` en su primera corrida, con el fixture que existe justamente para
 * eso — **la mugre de una carga a mano es el caso realista**, no el borde.
 *
 * `normalizarValorDeclarado_` (`Fuentes.gs`) es la forma de `R-10`: colapsa espacios y trimea
 * **preservando mayúsculas y acentos**. Es la que ya usa el motor para valores de celda, así que
 * no entra un quinto normalizador.
 *
 * ⚠ **Y deja a la vista un bug latente que NO es de acá:** `buscarMapeo` compara
 * `uso !== 'fuente'` **crudo**, así que una celda con `" fuente "` **hoy no se lee** — la solapa
 * queda apagada sin que nada lo diga. Normalizar acá hace que el seed reescriba la celda limpia,
 * o sea que este cambio la destapa en vez de taparla. Anotado en `PENDIENTES_consistencia.md`. */

function formatearResumenClasificacionSolapas_(r) {
  if (!r.ok) return r.motivo;
  var conservados = r.usosConservados || [];
  var degradaciones = conservados.filter(function (c) { return c.degradacion; });
  return 'SOLAPAS — nuevas: ' + r.escritas + ', actualizadas: ' + r.actualizadas +
    (r.protegidas.length
      ? '\nProtegidas (origen=manual, no tocadas): ' + r.protegidas.length +
        ' — de esas, ' + r.protegidas.filter(function (p) { return p.diferencias && p.diferencias.length; }).length +
        ' tenían algo por cambiar (ver DIFF_CONFIGURACION)'
      : '') +
    (conservados.length
      ? '\n`uso` conservado de la hoja (D-32): ' + conservados.length +
        (degradaciones.length
          ? ' — ⚠ ' + degradaciones.length + ' habrían sacado la solapa de `fuente`: ' +
            degradaciones.map(function (c) { return c.clave + ' (' + c.enLaHoja + ' ← seed decía ' + c.enElSeed + ')'; }).join(', ')
          : ' — ninguna era degradación')
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
  /* ⭐⭐ `2026-08-24` — **qué sección agregada lee cada consumidor del temario, por `seccion_id`
   * EXPLÍCITO.**
   *
   * ⛔ **Lo que reemplazan:** `filasRdvDelTemario_` tomaba **la primera** sección
   * `agregado` + `REUNIONES` + `activa` que encontrara, con un comentario que afirmaba que el
   * bucle soportaba una segunda. **No la soportaba** — con dos, elegía por orden de `Object.keys`
   * y la otra desaparecía en silencio, devolviendo las filas del universo equivocado. Nunca fue
   * un contrato: era la coincidencia de que hubiera una sola.
   *
   * **Por qué en `CONFIG` y no en el código** (`CLAUDE.md` §2): son nombres de filas de registro,
   * un parámetro de negocio puro. Cambiar cuál sección alimenta el agregado post **no debería
   * exigir `clasp push`** — es exactamente el precedente de `umbral_anclaje_reunion`, acá arriba.
   *
   * ⚠ **`CONFIG` sólo siembra lo AUSENTE** (`docs/ESCRITORES.md`): estas cuatro nacen en la
   * próxima **«Aplicar configuración»** y después la hoja manda. Si alguien las cambia a mano, el
   * seed no las pisa — que es la decisión del usuario del 16/08 y acá conviene. */
  seccion_agregado_semanal: 'ecv_alcance_semanal',
  /* ⚠ **`comunicaciones_post` HOY es `repetible` y por lo tanto NO califica**, así que esto no
   * aporta filas todavía y el motivo sale en el log. Es deliberado: **que la pieza exista no
   * publica nada por sí sola** — el flip de `modo` a `agregado` es una decisión de registro, va
   * por `curarSecciones_` y la toma el usuario. Ver `docs/CIERRE_POR_LAMINA.md`, `L-036`. */
  seccion_agregado_post: 'comunicaciones_post',
  // La solapa de la que salen las filas del agregado post. `C-50`: la POST comparte `ID` con la
  // PRE y vive en su propia solapa, así que la clave del par es `(ID, solapa)`.
  base_agregado_post: 'reuniones',
  solapa_agregado_post: 'Agenda JM | Post',
  /* `R-30` / `X-29` (22/08/2026) — **tope de duración para entrar a una ventana por pertenencia.**
   * Una cuenta cuya ventana declarada dura más que esto NO entra. `0` desactiva.
   *
   * **De dónde sale el 90, y NO es de ajustar contra un resultado.** Se midió la distribución de
   * duración de las **cuentas de encuentro del temario** en las dos ventanas que hay:
   *
   *   julio  (8 cuentas):  5 · 6 · 8 · 9 · 10 · 10 · 13 · **21**
   *   agosto (7 cuentas):  5 · 7 · 17 · 18 · 22 · 24 · **34**
   *
   * **Máximo observado: 34 días**, y ese 34 es `3289-JUNJDGAG` **con la `fecha_fin` ya derivada**.
   * Del otro lado, las campañas genéricas que motivaron todo arrancan en **210** —`2975` y `2976`,
   * *"Campañas genéricas RDV"*—. **Entre 40 y 60 días hay un hueco vacío** en la distribución de
   * las 73 cuentas de la ventana de agosto.
   *
   * ⭐ **90 = un trimestre**, que es un período con nombre y no un número sacado del dato, con
   * **2,6× de margen** sobre el encuentro más largo y **2,3×** por debajo de las genéricas.
   *
   * ⛔ **NO es 30, y el motivo es la medición:** un tope de 30 **cortaría un encuentro real** —el de
   * 34 días—. Que `duración ≤ 30 d` cerrara `X-28` en los dos períodos **no es evidencia**: `X-28`
   * es otra pregunta y necesita un tercer deck publicado.
   *
   * ⚠ **Lo que este tope saca y hay que verificar en la primera corrida:** en la ventana 14–20/08
   * deja afuera **12 de 73** cuentas, entre ellas `2961-ABRSEGGJ` (108 d) con **332 M de
   * impresiones**, la más grande del conjunto. **El efecto sobre `imp_*` y `gcba_imp_*` es grande
   * y no está verificado contra un deck.** */
  tope_dias_ventana_cuenta: '90',
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
  // `2026-08-20_10` — cuántas veces se reanuda sola una corrida antes de parar y reportar.
  // ⚠ **Es una guarda de cuota, no una preferencia.** En cuenta consumer hay 90 minutos diarios
  // de runtime de triggers; una corrida que se reanuda para siempre los consume y deja al motor
  // sin cupo el resto del día. Con 6 y ejecuciones de ~5 min son 30 min, un tercio del día.
  tope_continuaciones: '6',
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
  /* ⛔⛔ ⭐ RECALIBRADA el 24/08/2026, y acá está CON QUÉ — que es la mitad del valor del número.
   *
   * **Lo que medía el 30, textual del comentario del reloj:** cierre **0,8 s** (06/08) + barrida
   * **~6 s** + margen por varianza de `tokensPorSlide_` (**10,8 s y 26,9 s el mismo día**).
   *
   * **Lo que se midió el 24/08 en `jm-20260824-151555`: el cierre costó 25 s.** O sea que el
   * componente que valía 0,8 pasó a valer 25 —factor **31**— porque el cierre hace tres cosas más
   * que antes: `FALTANTES` con columna `causa`, `FALTANTES_PREVIO` y `ANCLAJE_MEDICION`.
   *
   * **60 = 25 (cierre medido) + 6 (barrida) + 27 (el techo de la varianza medida), redondeado.**
   * No es un número elegido: es la misma suma de siempre con el sumando de hoy.
   *
   * ⚠ **Y ahora hay quien se entere cuando envejezca**: `avisoDeReserva_` dispara cuando el
   * cierre solo se come el 80 % de la reserva. Con 60 eso son 48 s. El criterio viejo
   * —`cierre > reserva`— **estaba conectado y se quedó callado con 25 contra 30**. */
  reserva_cierre_seg: '60',
  // Re-medido el 06/08 después de T2.2.2, que bajó esta llamada de ~239 s a ~36:
  // tres muestras dieron 40,6 / 30,7 / 36,3 s, y 60 deja ~48% de margen sobre el
  // máximo observado. **El valor viejo era 240**, y dejarlo habría hecho que la
  // etapa 4 no entrara nunca con el motor ya arreglado: la corrida seguiría
  // cortando ahí sin motivo. Es atómico —resolverMarcadores no acepta resolver un
  // subconjunto—, así que la única decisión posible es entrar o no entrar.
  // ⛔⛔ ⭐ RECALIBRADA el 24/08/2026, Y LE CAMBIA EL PAPEL — las dos cosas juntas, porque
  // separarlas rompe.
  //
  // Con qué se calibró el 60: 06/08, tres muestras de 40,6 / 30,7 / 36,3 s, con el informe en
  // ~87 marcadores. Con qué se recalibra: `jm-20260824-151555`, la etapa 4 costó 158 s con
  // ~172 marcadores. Factor 4,4 en el costo, 2 en los marcadores.
  //
  // ⛔ Y por eso sola no se podía tocar. Con el número honesto la etapa NO ENTRABA NUNCA:
  // 350 de techo − 60 de reserva = 290 útiles, menos 137 que gastan las etapas 1-3 = 153, y la
  // etapa costaba 158. Siendo UNA unidad, el desatendido la tomaría, no la terminaría, no la
  // podría marcar hecha, y la guarda de progreso informaría «no avanza» cuando la verdad es
  // «la unidad es demasiado grande». Son dos arreglos distintos y `CLAUDE.md` §4 ya los separa.
  //
  // ⭐ Qué es ahora: un TESTIGO, no una compuerta. La compuerta pasó a ser por lámina
  // (`costo_lamina_etapa4_seg`, abajo). Éste queda como el costo declarado de la etapa entera
  // —lo que valdría correrla sin partir— y es contra lo que el aviso de desvío la compara. Un
  // número que ya no decide nada pero se sigue midiendo es lo que evita que envejezca en
  // silencio.
  costo_resolucion_etapa4_seg: '160',
  // ⭐⭐ `D-41` — el costo de UNA lámina de la etapa 4, y es sólo la SEMILLA de la primera.
  //
  // De ahí en más se mide y se adapta, igual que `costoUltimoItemSeg` en la etapa 3: el
  // presupuesto decide CUÁNTAS LÁMINAS entran comparando lo que queda de reloj contra lo que
  // costó la última. ⛔ NO es un tamaño de lote en marcadores — eso sería la cuarta constante
  // que nadie vuelve a mirar, y el 24/08 fallaron tres de tres por eso mismo.
  //
  // De dónde sale el 30: 158 s medidos para el informe entero, repartidos sobre las ~7 láminas
  // con tokens fijos ≈ 22 s, redondeado HACIA ARRIBA. La asimetría es deliberada: una semilla
  // alta hace cortar de más en la primera lámina y se corrige sola en la segunda; una baja SE
  // PASA, que es el error que no se corrige. ⚠ Además el valor real va a ser bastante menor,
  // porque ahora cada lámina resuelve `solo_marcadores` — el mismo salto que la etapa 3 dio el
  // 21/08. La primera corrida lo mide.
  costo_lamina_etapa4_seg: '30',
  /* `2026-08-21_1` A.1 — los tres costos que faltaban para que el reloj se consulte en TODAS
   * las etapas y no sólo en el bucle de ítems.
   *
   * ⚠ **Ninguno de los tres es un criterio: los tres son SEMILLAS.** Con el techo en 150 s la
   * corrida `jm` del 21/08 llegó igual al muro de 360 porque el arranque y el mapa corrían sin
   * ningún punto de control. Estos valores son lo que se estima **antes** de tener una medición
   * propia; en cuanto la corrida mide, la medición pisa a la semilla.
   *
   * **Y están en `CONFIG` por el mismo motivo que los tres de arriba** (`CLAUDE.md` §2): bajar
   * `costo_arranque_seg` a 400 desde la hoja hace que la etapa 1 no entre nunca, que es la
   * forma barata de probar el corte de esa etapa sin esperar seis minutos. */
  // Anclaje (~50 s) + unión digital (~27 s), medidos juntos en 70-80 s el 20/08.
  costo_arranque_seg: '80',
  // El mapa token→objectId. `barrerTokensNoAlcanzados_` lo tiene medido en 10-27 s.
  costo_mapa_seg: '25',
  // Un ítem: `seg_por_asignacion` medido en ~6 s (`2026-08-20_10.1`). Es la semilla del primer
  // ítem, que hasta hoy entraba gratis porque el costo previo arrancaba en 0.
  costo_item_seg: '6',
  /* `2026-08-21_5` — **cómo se rinde un hueco cuando el llamador no lo pide.**
   *
   * ⭐ Hasta hoy el default era el crudo **y no lo había elegido nadie**: el modo salía de
   * `opciones.faltantes_como_raya === true`, y `undefined === true` es `false`. De los cuatro
   * llamadores de `generarInforme`, dos no pasaban la opción — el ítem de menú y la ejecución 1
   * de la corrida desatendida—, así que sus decks salían en crudo por omisión.
   *
   * Valores: `simbolos` (los cuatro glifos del `2026-08-20_1`) o `crudo` (`«FALTA:token»`).
   *
   * ⚠ **Esto es el DEFAULT, no el criterio:** un llamador que pide el modo explícitamente sigue
   * ganando, en los dos sentidos. Lo que la clave decide es qué pasa cuando nadie pide nada.
   *
   * ⚠ Y el borde de siempre: `seedConfigConfig_` **sólo completa celdas vacías**, así que si la
   * fila ya existe este valor no la repunta. */
  presentacion_faltantes_defecto: 'simbolos',
  // `_46` (13/08) — la lista blanca de la Barrera 1 sale del código. Era `API_AUTORIZADOS_`
  // en `Api.gs`, un array con un solo mail: sumar a alguien exigía `clasp push`, que es el
  // mismo argumento del umbral de anclaje de más arriba. Es la **pieza 1 de `D-16`**.
  //
  // Los cuatro los dio el usuario el 13/08. Separados por comas; `apiListaAutorizados_`
  // normaliza espacios y mayúsculas, así que la celda se puede editar a mano sin cuidado.
  //
  // ⚠ **Vacío acá NO cae a esta lista: la barrera deniega.** Es lo contrario de
  // `centinelas_lectura`, y a propósito — sobre la puerta de entrada al motor, un default de
  // código convertiría un error de lectura en un acceso concedido. Ver `apiListaAutorizados_`.
  //
  // Ojo con el otro borde, el de siempre: `seedConfigConfig_` **sólo completa celdas
  // vacías**, así que si la fila ya existe este valor no la repunta y hay que mirar la celda
  // viva.
  mails_autorizados: 'jpcofanogcba1@gmail.com, reporteseinformesgcba@gmail.com, jpcofano@gmail.com, jpcofano2@gmail.com'
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
  /* `Pedido-4` Parte A (05/08) — la lámina del alcance semanal por herramienta. Hermana de
   * `encuentro` y en modo `agregado`.
   *
   * ⭐ **`2026-08-22_25` — declara `itera: 'REUNIONES'`, y el comentario que había acá decía lo
   * contrario: *"que no itere sobre `REUNIONES` es todo el punto"*. Se reescribe porque
   * `itera_sobre` pasa a significar DOS cosas y la frase vieja sólo veía una:**
   *
   *   - **universo** — de dónde salen las filas. Del **temario**, que es lo que `R-21` nivel 1 y
   *     el `Addendum 1` de `R-17` mandan desde el 09/08: *"el agregado `ecv_*` suma los encuentros
   *     que `R-21` seleccionó, no los que caen en la ventana"*.
   *   - **expansión** — cuántas láminas se emiten. **Una sola**, porque `modo = 'agregado'`, y eso
   *     no lo decide esta columna sino `modo`.
   *
   * **La frase vieja era cierta sobre la segunda y falsa sobre la primera**, y por eso se leía
   * como que la sección no debía mirar el temario — que es justo lo contrario de la regla.
   *
   * ⚠ **Verificado antes de declararla** (`0.5` del `_25`): **ningún lector de
   * `SECCIONES.itera_sobre` lo lee sin chequear `modo === 'repetible'` primero** —
   * `seccionesRepetiblesDe_` corta por `modo`, y `cuadradosDeInforme_` exige `repetible` **y** que
   * la fuente esté en `FUENTES_ITERACION_`. Declararlo acá **no le cambia el comportamiento a
   * nadie**: la sección sigue sin expandirse y sin aparecer como cuadrado de temario.
   *
   * ⛔ **Y sólo ella.** `ministros` y `m2` siguen por ventana: `R-21` dice expresamente que **no
   * iteran `REUNIONES`**, y `Union.gs` ya excluye `tipo = 'Agregado'` del anclaje.
   *
   * `orden: 7.5` a propósito, para no renumerar ninguna fila curada — la sección va entre la
  // portada de Digital/Directa y el bloque de encuentro, que es donde está la lámina.
  // La familia lista los **10 tokens exactos** de agregado semanal puro en vez del prefijo
  // `ecv_`: el prefijo se llevaría también los 7 ambiguos y los 2 de encuentro, que viven en
  // la lámina del iceberg y no acá. Un token completo es un prefijo válido de sí mismo
  // (`tokenEsDeFamilia_` compara con `indexOf(f) === 0`), así que la semántica no cambia.
  // ⚠ `ecv_barrio` NO está en la lista y no puede estarlo: es prefijo de `ecv_barrio1/2/3`.
  filaSeccion_({ id: 'ecv_alcance_semanal', orden: 7.5, nombre: 'Encuentros con vecinos — alcance semanal por herramienta', informes: 'JM,SECCO', modo: 'agregado', itera: 'REUNIONES',
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

  /* ⭐ `2026-08-21_11` Parte A — **las dos secciones que faltaban para que ninguna lámina quede
   * sin dueño** (`D-37` punto 2). Salieron de titular las 53 láminas de las dos plantillas y
   * cruzarlas contra las 36 secciones: dos grupos no encajaban en ninguna.
   *
   * ⛔ **Las dos son `unica` y no `repetible`**, que es la guarda de la Parte A: una sección nueva
   * `repetible` con láminas declaradas **expande**, y este paso declara pertenencia, no agrega
   * bloques repetibles. */

  /* `uno_a_uno_comunas` — **decisión del usuario, 21/08.** Las láminas `L-004` y `L-005` de
   * `secco` —*"Uno a uno en comunas · Comuna {{ecv_comuna}} ({{ecv_fecha}})"* y su lámina de
   * resultados de plataforma— **no van dentro de `encuentro`**: son una sección propia.
   *
   * ⚠ **Y es asimétrica con `jm` a propósito.** En `jm` el 1 a 1 (`L-053`) **sí** vive dentro de
   * `encuentro`, como variante condicional del iceberg. Acá no: `secco` lo trata como un bloque
   * aparte — el título lo dice, es *"en comunas"*, no el mismo objeto.
   *
   * ⚠ **Sus tokens no están cableados**: `L-005` lleva `ecv_` y `u1_`, y ningún `u1_*` tiene fila
   * en `MARCADORES`. La sección existe para que las dos láminas **pertenezcan**; publicar es otro
   * trabajo. Por eso `estado: 'manual'` y el `falta` lo dice. */
  filaSeccion_({ id: 'uno_a_uno_comunas', orden: 18, nombre: 'Uno a uno en comunas', informes: 'SECCO', modo: 'unica', estado: 'manual', falta: '⚠ SIN NINGUNA LÁMINA desde el 21/08: L-004 y L-005 pasaron a `encuentro` (2026-08-21_11.2 §1) porque REUNIONES no tiene informe_id y encuentro expande los mismos ítems en las dos plantillas. La fila NO se borra (D-23 punto 11) — una decisión que el diseño esquivó se marca, no se hace desaparecer' }),

  /* `analisis_datos` — la portáda de la sección de análisis, que existe en **las dos** plantillas
   * y no tenía sección: `jm` `L-049` (*"Análisis y datos · INFORME SEMANAL"*) y `secco` `L-024`
   * (*"{{fecha_mes}} 2026 · Análisis y Datos"*).
   *
   * ⚠ **No se confunde con `analisis_comparativo` ni `analisis_tematico`**, que son `SECCO`, y
   * ninguna de las dos describe una portáda: describen contenido que hoy no está marcado en la
   * plantilla. Esta es la lámina separadora. */
  filaSeccion_({ id: 'analisis_datos', orden: 19, nombre: 'Análisis y datos — portada', informes: 'JM,SECCO', modo: 'unica', estado: 'manual', falta: 'lámina separadora, sin tokens — la escribe el equipo (rol = equipo)' }),

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
  filaSeccion_({ id: 'encuentro_iceberg', padre: 'encuentro', orden: 3, nombre: 'Encuentro — iceberg', informes: 'JM,SECCO', modo: 'unica', opcional: 'sí', condicion: 'el encuentro tiene datos de convocatoria por canal', familia: 'enc_', estado: 'revisar', falta: '' }),
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
 *
 * ─── DECISIÓN DEL USUARIO, 16/08/2026: `SECCIONES` se comporta como `CONFIG` ───────────────
 *
 * **La hoja manda; el seed sólo siembra lo ausente.** Lo de arriba describía el *mecanismo* y
 * lo justificaba como *"la regla simple y segura"* — o sea, un **default prudente**. Ahora es
 * una **decisión tomada**, y la diferencia importa: un default se revisa cuando molesta, una
 * decisión hay que superseder.
 *
 * **Es lo mismo que `D-32` para el sembrador de `SOLAPAS`**, y lo mismo que `seedConfigConfig_`
 * hace con `CONFIG`: el valor del seed es **piso, no autoridad**. Lo que una persona editó en la
 * hoja gana, porque es donde vive una decisión que el código no conoce.
 *
 * ⚠ **La consecuencia que hay que tener presente al corregir un `SEED_SECCIONES_`, porque no se
 * parece a un error:** un valor corregido en el seed produce **una corrida que dice "sin cambios"
 * y una hoja que no se mueve**, y **las dos cosas son ciertas por separado**. No falla y no hace.
 * **Para cambiar el valor de una fila que ya existe hay que editar la celda**, sabiendo que se
 * está haciendo eso. La tabla de qué hoja propaga y cuál no está en `docs/ESCRITORES.md` §1 bis.
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
    filas_finales: Math.max(hoja.getLastRow() - 1, 0),
    /* ⛔⛔ `2026-08-22` — **EL ESCRITOR RELEE LO QUE QUEDÓ EN LA CELDA, NO LO QUE PIDIÓ ESCRIBIR.**
     *
     * **El caso:** el alta de `ecv_barrio1-3` pidió `valor_fijo = '1/3'`, reportó **«3 filas
     * agregadas»** — y las tres celdas tenían **`Sun Mar 01 2026`**. Sheets convirtió el índice en
     * fecha al escribirlo. **El reporte decía la verdad sobre lo que pidió y mentía sobre lo que
     * quedó**, y el síntoma —tres `---`— apareció una corrida después.
     *
     * ⭐ **Un escritor que no relee es la mitad del bug.** La otra mitad es la coerción de tipos, que
     * no se puede evitar: **toda celda de Sheets interpreta lo que se le escribe**. Lo único que
     * está bajo control del motor es **enterarse**.
     *
     * **`releido` trae lo que la hoja devuelve DESPUÉS de escribir**, y `diferencias` los campos
     * donde lo leído no coincide con lo pedido. ⚠ Se comparan como **texto normalizado**: una fecha
     * y un `'1/3'` difieren obviamente, pero `3` numérico y `'3'` texto **no son una diferencia**
     * y marcarlos sería ruido que nadie va a leer. */
    /* ⛔ **`agregadas` NO son claves: son textos de reporte** con la forma `marcador (informe)`.
     * La primera versión de esto comparaba contra `marcador||informe` y **nunca matcheaba**, así
     * que devolvía `{}` y el llamador imprimía «✅ 0 filas verificadas». Se recorre `agregar`, que
     * son los objetos pedidos, y **no** la lista de display. */
    releido: (function () {
      var out = {};
      var frescos = hoja.getDataRange().getValues();
      var hs = frescos[0];
      var iM = hs.indexOf('marcador');
      var iI = hs.indexOf('informe_id');
      agregar.forEach(function (o) {
        var clave = o.marcador + '||' + (o.informe_id || '');
        for (var f = 1; f < frescos.length; f++) {
          var claveFila = frescos[f][iM] + '||' + (iI === -1 ? '' : frescos[f][iI]);
          if (claveFila !== clave) continue;
          var fila = {};
          hs.forEach(function (h, i) { fila[h] = frescos[f][i]; });
          out[clave] = fila;
          break;
        }
      });
      return out;
    })(),
    /* ⭐ **Se declara CUÁNTAS se pidieron, para que el llamador pueda comparar contra eso y no
     * contra sí mismo.** `CLAUDE.md` §4: *un control tiene que declarar CUÁNTO midió; cero
     * unidades verificadas es un problema, no un silencio.* */
    pedidas: agregar.length
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
 * ⭐ **El botón que hace llegar `itera_sobre` a `ecv_alcance_semanal`** (`2026-08-22_25` Parte A).
 *
 * ⛔ **Por qué hace falta un botón para una celda, y es la regla de `CLAUDE.md` §4 incumplida al
 * escribir el paso.** La Parte A declaró `itera: 'REUNIONES'` en `SEED_SECCIONES_` — y **el seed
 * de `SECCIONES` no actualiza filas que ya existen**: `sembrarSecciones_` hace
 * `SEED_SECCIONES_.filter(s => !existentes[s.seccion_id])`, y `docs/ESCRITORES.md` lo declara con
 * todas las letras — *"NO — sólo inserta filas nuevas, nunca actualiza. Por decisión (usuario,
 * 16/08/2026): igual que `CONFIG`, la hoja manda y el seed sólo siembra lo ausente"*.
 *
 * **El síntoma fue exactamente el que la regla anticipa:** la corrida `jm-20260822-132206` tenía el
 * código pusheado, las dos reuniones del temario en la hoja, **y el agregado no se movió** — ni el
 * conteo ni los inscriptos. `filasRdvDelTemario_` exige `itera_sobre === 'REUNIONES'` **en la
 * hoja**, que es lo que el motor lee, y ahí seguía vacío. *"Que el seed llegue no garantiza que la
 * hoja cambie."*
 *
 * ⭐ **Va por `curarSecciones_` y no a mano ni por el sembrador**, y eso no es formalidad:
 * `curarSecciones_` es el **segundo escritor declarado** de esta hoja (`ESCRITORES.md`, 05/08), la
 * puerta para corregir **un campo de una fila que ya existe**. Cambiar `sembrarSecciones_` para que
 * pise sería derogar una decisión del usuario del 16/08 para acomodar un paso.
 *
 * **Sin `_` y sin argumentos** porque Apps Script no lista en el desplegable ni las privadas ni las
 * que reciben parámetros — las dos condiciones, `CLAUDE.md` §2.
 *
 * ⚠ **Y distingue los tres finales, que es la mitad de su valor** (*una corrida que no hizo nada
 * tiene que decirlo, no informar éxito*): escribió · ya estaba · no encontró la fila.
 */
/* ═══════════════════════════════════════════════════════════════════════════════════════════
 * ⭐⭐ `L-036` — la lámina de comunicaciones post, entera. (25/08/2026.)
 *
 * **Son DOS cosas y van en este orden**, porque la segunda no publica nada sin la primera:
 *
 *   1. `comunicaciones_post` pasa de `repetible` a **`agregado`** — una decisión de registro.
 *   2. Los **20** marcadores de las cinco columnas que tienen fuente, por `FILA`.
 *
 * ### Por qué el cambio de `modo`, en una línea
 *
 * La lámina es **una** con **cuatro filas**, no cuatro láminas. Como `repetible`, el motor emitía
 * **una copia por reunión POST** y los tokens indexados `post_*1..4` no significaban nada. Como
 * `agregado`, la lámina no se expande y sus tokens caen a la pasada de tokens fijos, donde
 * `filasDeSolapaDelTemario_` les pone **las filas de los encuentros del temario** y `FILA` elige
 * la N-ésima. Es el molde de `cablearTablaDeEnvios()` (`L-047`).
 *
 * ⚠ **Y por eso el `seccion_id` explícito no era opcional:** con este cambio pasan a haber **DOS**
 * secciones `agregado` + `REUNIONES` + `activa`, y `filasRdvDelTemario_` tomaba **la primera que
 * calificara**. Sin la corrección del `2026-08-24`, el agregado semanal y el de post se pisarían
 * según el orden de `Object.keys`. Los ids viven en `CONFIG`.
 *
 * ### Las cinco columnas, y por qué no son ocho
 *
 * `post_camp`, `post_periodo` y `post_formato` **no tienen columna en ninguna solapa `fuente`** —
 * barrido del 24/08 sobre las diez de `reuniones` y `digital`. Van como pregunta al equipo, sin
 * prioridad (`PENDIENTES`). **Cablearlas con lo que hay publicaría texto distinto del que el
 * equipo publica**, que es peor que dejarlas en `/////`.
 *
 * ### `separador = fecha_periodo`, y el orden va en configuración
 *
 * `FILA` **no tiene default** y falla ruidoso sin campo de orden: ordenar por la posición de la
 * hoja es lo que el `_39` sacó de `ULTIMO`. `fecha_periodo` es la columna `E` de la solapa,
 * mapeada el 24/08. ⚠ **No enciende recorte**: `reuniones` es `modo_periodo = snapshot`.
 *
 * ### ⭐ Los tres bordes que `julio_24_30` ejercita, y por eso es el control
 *
 * Medido sobre el fixture del 20/08 (`DGPLES _ Seguimiento ECVs`, sha `f8ef3227…`):
 *
 *   1. **Retiro** (`3346-JULJDGAG`) tiene el camino entero — 41.475 · 47.753 · 136.971 · 41.204 ·
 *      0,30082 — y **su identidad interna cierra al dígito**: `41.204 / 136.971 = 0,300822801…`,
 *      exactamente la columna `% VTR`.
 *   2. **San Cristóbal** (`3354-JULJDGAG`) está **en ceros**, así que ejercita *cero real* contra
 *      *sin dato* — son dos cosas y el símbolo las distingue.
 *   3. Son **2 ítems para 4 ranuras**: las ranuras 3 y 4 tienen que salir `sin_datos`, que es el
 *      borde de `FILA` —*más índice que filas no es error, es que no hay tanto envío*—.
 *
 * ⚠ **El eslabón que NO está verificado**, y está anotado en `PENDIENTES`: que el `id_cuenta` que
 * el anclaje asigna al ítem sea **el mismo** que figura en `Agenda JM | Post`. El cruce del 24/08
 * fue por `Barrio / Comuna`. **Lo cierra una corrida, no el fixture** — y si no coincide, lo que
 * se cae no es una fila sino la rama por cuenta de esta lámina entera.
 * ═══════════════════════════════════════════════════════════════════════════════════════════ */

/** Las cinco columnas de `L-036` que tienen fuente, con su campo y su formato. */
var COLUMNAS_POST_L036_ = [
  { tok: 'habitantes',  campo: 'poblacion',    formato: 'miles',
    nota: 'col F "Habitantes". ⚠ 13 de 102 filas traen el texto "-": ahí sale sin_datos, que es correcto' },
  { tok: 'alcance',     campo: 'alc_real',     formato: 'miles',
    nota: 'col G "Alcance". Con poblacion forma % Cobertura = G/F, exacta en 89 de 89' },
  { tok: 'impresiones', campo: 'imp_totales',  formato: 'miles',
    nota: 'col J "Impresiones totales". Denominador de las dos identidades de la solapa' },
  { tok: 'vistas',      campo: 'vis_totales',  formato: 'miles',
    nota: 'col M "Visualizaciones" — el acumulado, NO la banda por plataforma (O-AC): digital manda' },
  { tok: 'vtr',         campo: 'vis_vtr_pct',  formato: 'fraccion',
    nota: 'col N "% VTR", viene como FRACCION (0,2094). Identidad interna: = M/J, exacta en 98 de 98' }
];

function cablearTablaPostReuniones_() {
  var filas = [];
  COLUMNAS_POST_L036_.forEach(function (c) {
    for (var n = 1; n <= 4; n++) {
      filas.push({
        marcador: 'post_' + c.tok + n, familia: 'post', informe_id: 'jm',
        base_id: 'reuniones', solapa: 'Agenda JM | Post', campo_logico: c.campo,
        /* ⛔ ENTERO PELADO. `C-83`: Sheets convierte `1/4` en FECHA y `01` pierde el cero, y eso
         * ya rompió `ecv_barrio1-3` el 22/08. El campo de orden va en `separador`. */
        operacion: 'FILA', valor_fijo: n, separador: 'fecha_periodo',
        filtro: '', dimensiones: '', formato: c.formato,
        notas: 'fila ' + n + ' de 4 de L-036 (D-41). ' + c.nota +
          '. FILA ordena por fecha_periodo; las filas ya vienen elegidas por el temario ' +
          '(filasDeSolapaDelTemario_, por id_cuenta del anclaje). SIN VALIDAR contra la fuente'
      });
    }
  });
  return curarMarcadores_([], filas);
}

/** Wrapper público del alta de los 20. ⚠ **ESCRIBE en `MARCADORES`.** */
function cablearTablaPostReuniones() {
  var r = cablearTablaPostReuniones_();
  if (!r.ok) { Logger.log('⛔ FALLO: ' + r.motivo); return r; }
  Logger.log('== L-036 · las 5 columnas con fuente x 4 filas ==');
  Logger.log('  pedidas: ' + r.pedidas + '  ·  agregadas: ' + (r.agregadas || []).length);
  if (!(r.agregadas || []).length) {
    Logger.log('  ⓘ Cero altas: ya existían. Es idempotencia, no rotura.');
  }
  /* ⛔⛔ SE VERIFICA LO QUE QUEDÓ EN LA CELDA, NO LO QUE SE PIDIÓ ESCRIBIR (`C-83`). */
  var malas = 0;
  Object.keys(r.releido || {}).forEach(function (k) {
    var f = r.releido[k];
    if (String(f.valor_fijo).trim() !== String(Number(f.valor_fijo)).trim()) {
      malas++;
      Logger.log('  ⛔ ' + k + ': `valor_fijo` volvió "' + f.valor_fijo + '" — Sheets lo coercionó.');
    }
  });
  Logger.log('  índices releídos y sanos: ' + (Object.keys(r.releido || {}).length - malas) +
    ' de ' + Object.keys(r.releido || {}).length);
  Logger.log('');
  Logger.log('⭐ EL CONTROL NO ES EL NUMERO, ES LA IDENTIDAD INTERNA, y se mira sobre el deck:');
  Logger.log('     % VTR = Visualizaciones / Impresiones, en CADA fila que tenga datos.');
  Logger.log('   Sobre julio_24_30, Retiro tiene que dar 41.204 / 136.971 = 30.1');
  Logger.log('⚠ Y los tres bordes: San Cristobal en CEROS (cero real, no sin dato), y las');
  Logger.log('   filas 3 y 4 en sin_datos —2 items para 4 ranuras, que NO es error—.');
  Logger.log('⛔ Si las cuatro filas salen vacias, mira ANTES el modo de la seccion:');
  Logger.log('   comunicaciones_post tiene que decir `agregado`. Corre declararModoDelAgregadoPost().');
  return r;
}

/** Revierte el alta de los 20. ⚠ **ESCRIBE en `MARCADORES`.** */
function revertirTablaPostReuniones() {
  var nombres = [];
  COLUMNAS_POST_L036_.forEach(function (c) {
    for (var n = 1; n <= 4; n++) nombres.push('post_' + c.tok + n);
  });
  var r = curarMarcadores_(nombres, []);
  if (!r.ok) { Logger.log('⛔ FALLO: ' + r.motivo); return r; }
  Logger.log('== reversion: ' + r.quitadas.length + ' fila(s) quitada(s) · quedan ' + r.filas_finales + ' ==');
  return r;
}

/**
 * ⭐⭐ **El botón de registro: `comunicaciones_post` pasa a `agregado`.**
 *
 * Va por `curarSecciones_` y **no a mano ni por el sembrador**, por el mismo motivo que
 * `declararIteraDelAgregado()`: `sembrarSecciones_` **sólo agrega filas ausentes** y nunca pisa
 * una existente (decisión del usuario, 16/08). *Que el seed llegue no garantiza que la hoja
 * cambie.*
 *
 * ⚠ **Lo que este botón HABILITA, dicho para que se pueda revisar:** con la sección en `agregado`,
 * el motor deja de emitir una lámina por reunión POST y `L-036` queda **una sola vez**, con sus
 * cuatro filas resueltas por `FILA`. Si algo sale mal, `volverComunicacionesPostARepetible()`
 * deshace exactamente esto.
 *
 * **Sin `_` y sin parámetros** — las dos condiciones de `CLAUDE.md` §2.
 */
function declararModoDelAgregadoPost() {
  var r = curarSecciones_([{ seccion_id: 'comunicaciones_post', modo: 'agregado' }]);

  if (!r.ok) { Logger.log('⛔ NO se pudo: ' + r.motivo); return r; }
  if (r.sin_fila.length) {
    Logger.log('⛔ NO se aplicó: ' + r.sin_fila.join(', '));
    Logger.log('   La fila `comunicaciones_post` tiene que existir en SECCIONES. Si falta, corré');
    Logger.log('   primero «Aplicar configuración», que SÍ agrega filas ausentes.');
    return r;
  }
  if (!r.cambios_escritos) {
    Logger.log('ⓘ Ya estaba: `comunicaciones_post.modo` ya decía "agregado". No se escribió nada.');
    Logger.log('   Si L-036 igual sale vacía, el problema NO es el modo.');
    return r;
  }
  r.aplicados.forEach(function (a) {
    Logger.log('  ✅ ' + a.seccion_id + '.' + a.campo + ': "' + a.antes + '" → "' + a.despues + '"');
  });
  Logger.log('');
  Logger.log('⚠ AHORA HAY DOS secciones agregado+REUNIONES, y eso es lo que hace que');
  Logger.log('  importe el seccion_id explicito: filasRdvDelTemario_ tomaba LA PRIMERA que');
  Logger.log('  calificara. Los ids viven en CONFIG (seccion_agregado_semanal / _post).');
  Logger.log('⛔ Verificacion de que la correccion esta viva: el agregado semanal de L-034');
  Logger.log('  —ecv_encuentros, ecv_inscriptos— tiene que seguir dando lo mismo que antes.');
  Logger.log('  Si se movio, la seccion equivocada esta alimentando al otro agregado.');
  return r;
}

/** Deshace el cambio de modo. ⚠ **ESCRIBE en `SECCIONES`.** */
function volverComunicacionesPostARepetible() {
  var r = curarSecciones_([{ seccion_id: 'comunicaciones_post', modo: 'repetible' }]);
  if (!r.ok) { Logger.log('⛔ NO se pudo: ' + r.motivo); return r; }
  Logger.log(r.cambios_escritos ? '✅ vuelto a `repetible`.' : 'ⓘ Ya estaba en `repetible`.');
  return r;
}

function declararIteraDelAgregado() {
  var r = curarSecciones_([{ seccion_id: 'ecv_alcance_semanal', itera_sobre: 'REUNIONES' }]);

  if (!r.ok) {
    Logger.log('⛔ NO se pudo: ' + r.motivo);
    return r;
  }
  if (r.sin_fila.length) {
    Logger.log('⛔ NO se aplicó: ' + r.sin_fila.join(', '));
    Logger.log('   La fila `ecv_alcance_semanal` tiene que existir en SECCIONES. Si falta, corré');
    Logger.log('   primero «Aplicar configuración», que SÍ agrega filas ausentes.');
    return r;
  }
  if (!r.cambios_escritos) {
    /* ⚠ «Ya estaba» NO es lo mismo que «se escribió», y confundirlos es cómo una corrida que no
     * hizo nada se lee como éxito. Acá además es información útil: si ya estaba y el agregado
     * igual no cambia, el problema es otro y hay que buscarlo en otro lado. */
    Logger.log('ⓘ Ya estaba: `ecv_alcance_semanal.itera_sobre` ya decía "REUNIONES". No se escribió nada.');
    Logger.log('   Si el agregado igual no cambió, el problema NO es la declaración.');
    return r;
  }

  r.aplicados.forEach(function (a) {
    Logger.log('✅ ' + a.seccion_id + '.' + a.campo + ': "' + a.anterior + '" → "' + a.nuevo + '"');
  });
  Logger.log('');
  Logger.log('Ahora sí: generá `jm` con el período `agosto_14_20` y mirá la lámina del alcance');
  Logger.log('semanal. `ecv_encuentros` tiene que dar 2 y `ecv_barrios` listar los dos barrios.');
  return r;
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

  /* `2026-08-15` — **TODO O NADA: se valida el lote entero antes de escribir la primera celda.**
   *
   * **Pasó, y el costo fue exactamente el que esta guarda evita.** El piloto de `D-33` pide dos
   * campos por fila —sacar el corte de `filtro` y ponerlo en `dimensiones`—, corrió **sin que la
   * columna `dimensiones` existiera**, escribió los ocho `filtro` y falló en el segundo campo.
   * Los ocho marcadores quedaron **sin ámbito y sin plataforma**, publicando el mismo número, y
   * **ninguno falló**: el reporte decía `SIN FILA (8)` y el daño ya estaba hecho.
   *
   * **Media operación de dos pasos deja el sistema en un estado que ninguno de los dos lados
   * contempla**, y eso no lo arregla el orden en que se corren las cosas: lo tiene que impedir
   * el escritor. Por eso la guarda va acá y no en la migración — protege a todo llamador, no al
   * que se acordó.
   *
   * Se valida la **columna**, que es el error estructural. Una clave que no existe en la hoja
   * sigue reportándose por `sin_fila` sin frenar el lote: eso es un dato que falta, no un
   * esquema que no coincide. */
  var columnasFaltantes = [];
  cambios.forEach(function (c) {
    Object.keys(c).forEach(function (campo) {
      if (campo === 'marcador' || campo === 'informe_id') return;
      if (headers.indexOf(campo) === -1 && columnasFaltantes.indexOf(campo) === -1) {
        columnasFaltantes.push(campo);
      }
    });
  });
  if (columnasFaltantes.length) {
    return {
      ok: false,
      motivo: 'MARCADORES no tiene la(s) columna(s): ' + columnasFaltantes.join(', ') +
        '. No se escribió ninguna celda — correr `instalar()` primero, que las crea por ' +
        '`COLUMNAS_DELTA_`.',
      columnas_faltantes: columnasFaltantes,
      aplicados: [], sin_fila: [], cambios_escritos: 0
    };
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

  /* `2026-08-17` — **UN LOTE QUE NO ESCRIBE NADA FALLA, Y DICE CUÁL DE LAS TRES CAUSAS ES.**
   *
   * **El caso que la instaló:** `migrarTanda4DeFrecuencia()` reportó *"0 celda(s)"*, siguió
   * imprimiendo las instrucciones de cómo leer la Parte C, y los dos testigos de las 19:08 y las
   * 19:15 dieron idénticos **porque en el medio no pasó nada**. Una migración que no ocurrió se
   * veía igual que una que reprodujo exacto — el peor resultado posible, porque el criterio de
   * éxito de la tanda es justamente la igualdad.
   *
   * **Es el mismo modo de falla del 15/08 con el alta de las 20 solapas** —corrida que termina
   * bien, hoja que no se mueve— y esta vez el escritor tenía todo para avisar: sabía que no había
   * escrito nada y sabía por qué.
   *
   * **Va acá y no en cada wrapper**, por el mismo motivo que la guarda de columnas de arriba:
   * protege a **todo** llamador, no al que se acordó. Los wrappers ya hacen
   * `if (!r.ok) { Logger.log('FALLÓ: ' + r.motivo); return r; }`, así que heredan el diagnóstico
   * sin tocarlos — y, sobre todo, **dejan de imprimir el paso siguiente**.
   *
   * ⚠ **«Ya estaba aplicado» también falla, y es deliberado.** Es idempotencia, no rotura, y el
   * motivo lo dice con todas las letras; pero presentarlo como éxito es exactamente lo que hizo
   * que la tanda 4 se leyera como ejecutada. Quien re-corre a propósito lee el motivo y sigue.
   *
   * ─────────────────────────────────────────────────────────────────────────────────────────
   * ⭐ **`2026-08-22` — EL PÁRRAFO DE ARRIBA QUEDA SUPERSEDIDO EN SU VEREDICTO, NO EN SU
   * DIAGNÓSTICO.** Decisión del usuario, y el caso que la fuerza es de hoy:
   * `marcarProgrammaticARevisar()` encontró las **ocho** filas ya en `miles_revisar`, y el
   * wrapper imprimió **«⛔ FALLÓ»** aclarando en el mismo mensaje que era idempotencia. **Un
   * veredicto que se contradice a sí mismo tres palabras después no es un veredicto.**
   *
   * **La regla nueva, que es la de las TRES causas separadas y no dos:**
   *
   * | qué pasó | veredicto |
   * |---|---|
   * | falta la fila `marcador‖informe_id` | ⛔ **falla** — la clave no existe |
   * | la fila existe y **difiere** del pedido, y no se escribió | ⛔ **falla** — eso sí es un bug |
   * | **todas** las filas ya están en el estado pedido | ✅ **éxito idempotente** |
   *
   * ⭐ **Y por qué esto NO reabre el agujero del 17/08, que es lo único que importa acá:** lo que
   * la tanda 4 tenía que cazar era *«la hoja no quedó como se pidió»*, y **eso sigue fallando por
   * las dos primeras filas de la tabla**. Lo que se deja de castigar es el caso en que la hoja
   * quedó **exactamente** como se pidió — donde el paso siguiente que el wrapper imprime es
   * legítimo, porque el estado que ese paso necesita **es el que hay**.
   *
   * ⚠ **Pero el cero no puede volverse silencioso**, que era la mitad correcta de la regla vieja.
   * Por eso el éxito idempotente sale **por `Logger.log` desde acá y no desde el wrapper**: así
   * lo heredan los once sin tocarlos, igual que heredaron el diagnóstico. Un `ok:true` con
   * `cambios_escritos: 0` que no se anuncia es indistinguible de uno que escribió. */
  if (cambios.length && !aplicados.length) {
    var diagnostico = cambios.map(function (c) {
      var claveD = c.marcador + '||' + (c.informe_id || '');
      if (!(claveD in filaDe)) {
        return '  · ' + claveD + ' → NO HAY FILA con ese `marcador` + `informe_id` en MARCADORES.';
      }
      var filaD = filaDe[claveD];
      var detalle = Object.keys(c).filter(function (campo) {
        return campo !== 'marcador' && campo !== 'informe_id';
      }).map(function (campo) {
        var actual = datos[filaD][headers.indexOf(campo)];
        return campo + ': hoja="' + actual + '" · pedido="' + c[campo] + '"' +
          (String(actual) === String(c[campo]) ? ' → YA ESTABA' : ' → DIFIERE (debería haberse escrito)');
      }).join(' | ');
      return '  · ' + claveD + ' (fila ' + (filaD + 1) + ') → ' + detalle;
    }).join('\n');

    var hayHuerfanas = cambios.some(function (c) {
      return !((c.marcador + '||' + (c.informe_id || '')) in filaDe);
    });

    /* La tercera causa, que es la única que ahora es éxito: **todas** las filas existen y
     * **todos** los campos pedidos ya dicen lo pedido. Se recalcula acá en vez de deducirse del
     * diagnóstico —que es texto— porque un veredicto no se lee de un string formateado. */
    var todasYaEstaban = !hayHuerfanas && cambios.every(function (c) {
      var filaY = filaDe[c.marcador + '||' + (c.informe_id || '')];
      return Object.keys(c).every(function (campo) {
        if (campo === 'marcador' || campo === 'informe_id') return true;
        return String(datos[filaY][headers.indexOf(campo)]) === String(c[campo]);
      });
    });

    if (todasYaEstaban) {
      var motivoIdem = 'CERO CELDAS ESCRITAS, y está bien: las ' + cambios.length +
        ' fila(s) YA ESTABAN en el estado pedido. Es idempotencia, no rotura — la hoja quedó ' +
        'exactamente como este lote la quiere.';
      Logger.log('ⓘ ' + motivoIdem);
      Logger.log(diagnostico);
      return {
        ok: true, idempotente: true, motivo: motivoIdem, diagnostico: diagnostico,
        aplicados: [], sin_fila: sinFila, cambios_escritos: 0
      };
    }

    return {
      ok: false,
      motivo: 'EL LOTE NO ESCRIBIÓ NINGUNA CELDA (' + cambios.length + ' cambio(s) pedidos). ' +
        (hayHuerfanas
          ? 'Hay claves `marcador||informe_id` que NO existen en MARCADORES — revisar los nombres.'
          : 'Todas las filas existen y NO todas están en el estado pedido: hay al menos un campo ' +
            'que difiere y no se escribió, que es un bug del escritor. (El caso «ya estaban ' +
            'todas» ya no llega hasta acá: desde el 22/08 devuelve `ok:true · idempotente`.)') +
        '\n' + diagnostico,
      diagnostico: diagnostico,
      aplicados: [], sin_fila: sinFila, cambios_escritos: 0
    };
  }

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

/**
 * `2026-08-15_1` Parte B — **el piloto: los ocho de `Impresiones` pasan a declarar su corte en
 * `dimensiones` (`D-33`)**, y su `filtro` queda con la restricción técnica sola.
 *
 * **Por el escritor declarado.** `curarCamposMarcadores_` corrige campos de filas que ya
 * existen, sin crear ni borrar (`ESCRITORES.md`). **No hay `SEED_MARCADORES_` y no lo va a
 * haber** (`D-17`: el dueño de `MARCADORES` es la plantilla), así que el punto 1 del prompt
 * —*"en la hoja y en el seed por el mismo camino"*— **no aplica acá**: sólo hay hoja. La columna
 * la crea `COLUMNAS_DELTA_`; el contenido, esto.
 *
 * **Qué cambia en cada una de las ocho, y por qué las dos cosas juntas:**
 *
 *   `filtro`      `nombre_campaña~=JM && estado=Activa && Plataforma=Meta`  →  `estado=Activa`
 *   `dimensiones` (vacío)                                    →  `ambito=jm && plataforma=meta`
 *
 * **El corte sale del `filtro` en la misma operación en que entra a `dimensiones`.** Dejarlo en
 * los dos lados daría el mismo número —las condiciones son idénticas y filtrar dos veces por lo
 * mismo es idempotente— y por eso es tentador: sería un piloto que no puede fallar. **Y no
 * probaría nada.** Lo que se está verificando es que la traducción de dimensión reproduzca la
 * condición que el filtro tenía; si el filtro sigue ahí, el número reproduce por el filtro.
 *
 * **`estado=Activa` se queda**, y es la frontera de `D-33`: es una restricción técnica —una
 * regla de validez de la fila— y no un corte que alguien del equipo pediría.
 *
 * **`imp_total` y `gcba_imp_total` NO llevan `plataforma`.** Ausente significa «todas» (usuario,
 * 15/08). El control que detecta una ausencia confundida con «todas» es la invariante medida:
 * **total = suma de partes**, exacto en los dos ámbitos.
 *
 * **Idempotente**: `curarCamposMarcadores_` no escribe una celda que ya tiene el valor pedido,
 * así que correrla dos veces no hace nada la segunda.
 *
 * **Para revertir el piloto** —punto 4 de la Parte C— alcanza con vaciar `dimensiones` y
 * devolver los `filtro` de `docs/_snapshots/MARCADORES_2026-08-15.tsv`, que es la línea base.
 */
function migrarPilotoImpresionesADimensiones_() {
  var cambios = [
    { marcador: 'imp_total',        informe_id: 'jm', filtro: 'estado=Activa', dimensiones: 'ambito=jm' },
    { marcador: 'imp_meta',         informe_id: 'jm', filtro: 'estado=Activa', dimensiones: 'ambito=jm && plataforma=meta' },
    { marcador: 'imp_google',       informe_id: 'jm', filtro: 'estado=Activa', dimensiones: 'ambito=jm && plataforma=google' },
    { marcador: 'imp_prog',         informe_id: 'jm', filtro: 'estado=Activa', dimensiones: 'ambito=jm && plataforma=programmatic' },
    { marcador: 'gcba_imp_total',   informe_id: 'jm', filtro: 'estado=Activa', dimensiones: 'ambito=gcba' },
    { marcador: 'gcba_imp_meta',    informe_id: 'jm', filtro: 'estado=Activa', dimensiones: 'ambito=gcba && plataforma=meta' },
    { marcador: 'gcba_imp_google',  informe_id: 'jm', filtro: 'estado=Activa', dimensiones: 'ambito=gcba && plataforma=google' },
    { marcador: 'gcba_imp_prog',    informe_id: 'jm', filtro: 'estado=Activa', dimensiones: 'ambito=gcba && plataforma=programmatic' }
  ];
  return curarCamposMarcadores_(cambios);
}

/**
 * Wrapper público del piloto — el que se elige en el desplegable (`CLAUDE.md` §2).
 *
 * ⚠ **ESCRIBE en `MARCADORES`.** Es la única función de esta tanda que lo hace. Antes de
 * correrla tiene que existir el testigo de la Parte A: sin él, la Parte C no tiene contra qué
 * comparar y el piloto no se puede verificar ni revertir con criterio.
 */
function migrarPilotoDeImpresiones() {
  var r = migrarPilotoImpresionesADimensiones_();
  if (!r.ok) { Logger.log('FALLÓ: ' + r.motivo); return r; }

  Logger.log('== piloto: ' + r.cambios_escritos + ' celda(s) escrita(s) ==');
  r.aplicados.forEach(function (a) {
    Logger.log('  ' + a.marcador + ' · ' + a.campo + ': "' + a.anterior + '" → "' + a.nuevo + '"');
  });
  if (r.sin_fila.length) {
    Logger.log('⚠ SIN FILA EN LA HOJA (' + r.sin_fila.length + '):');
    r.sin_fila.forEach(function (s) { Logger.log('   ' + s); });
  }
  Logger.log('Ahora: correr testigoDeImpresiones() y comparar los ocho contra el testigo de la Parte A.');
  return r;
}

/**
 * **Revierte el piloto al estado de la línea base.** `2026-08-15_1`, Parte C punto 4.
 *
 * **Los ocho `filtro` salen textuales de `docs/_snapshots/MARCADORES_2026-08-15.tsv`**, generados
 * leyendo el archivo y no transcribiéndolo a mano: `nombre_campaña` tiene una `ñ`, y una
 * transcripción que la rompa produce un filtro que **no matchea ninguna fila** y devuelve cero
 * sin fallar.
 *
 * **Por qué existe además del "no correr la migración":** el 15/08 a las 22:40 la migración
 * corrió **sin que la columna `dimensiones` existiera**, escribió los ocho `filtro` y no pudo
 * escribir las dimensiones. Los ocho quedaron con `filtro = estado=Activa` — **sin ámbito y sin
 * plataforma**—, o sea publicando los ocho el mismo número, y **ninguno fallando**. Es el modo
 * de falla del proyecto: no rompe, publica mal.
 */
function revertirPilotoImpresiones_() {
  var cambios = [
    { marcador: 'imp_total', informe_id: 'jm', filtro: 'nombre_campaña~=JM && estado=Activa', dimensiones: '' },
    { marcador: 'imp_meta', informe_id: 'jm', filtro: 'nombre_campaña~=JM && estado=Activa && Plataforma=Meta', dimensiones: '' },
    { marcador: 'imp_google', informe_id: 'jm', filtro: 'nombre_campaña~=JM && estado=Activa && Plataforma=Google ads', dimensiones: '' },
    { marcador: 'imp_prog', informe_id: 'jm', filtro: 'nombre_campaña~=JM && estado=Activa && Plataforma!=Meta && Plataforma!=Google ads', dimensiones: '' },
    { marcador: 'gcba_imp_total', informe_id: 'jm', filtro: 'nombre_campaña!~=JM && estado=Activa', dimensiones: '' },
    { marcador: 'gcba_imp_meta', informe_id: 'jm', filtro: 'nombre_campaña!~=JM && estado=Activa && Plataforma=Meta', dimensiones: '' },
    { marcador: 'gcba_imp_google', informe_id: 'jm', filtro: 'nombre_campaña!~=JM && estado=Activa && Plataforma=Google ads', dimensiones: '' },
    { marcador: 'gcba_imp_prog', informe_id: 'jm', filtro: 'nombre_campaña!~=JM && estado=Activa && Plataforma!=Meta && Plataforma!=Google ads', dimensiones: '' }
  ];

  /* **Si la columna `dimensiones` no existe, no hay nada que vaciar — y revertir tiene que poder
   * igual.**
   *
   * La guarda todo-o-nada de `curarCamposMarcadores_` frenaba esta reversión por pedir una
   * columna inexistente, que es justamente el estado que la reversión viene a reparar: los ocho
   * `filtro` quedaron pisados **porque** la columna no estaba. Una reversión que necesita el
   * esquema completo para arreglar un daño causado por el esquema incompleto no sirve.
   *
   * **Se mira el esquema y se arma el lote en consecuencia**, en vez de intentar y reintentar sin
   * `dimensiones` si falla: un `catch` que reintenta con otra forma es tolerar dos contratos, y
   * acá el esquema se puede leer y saber. */
  var hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('MARCADORES');
  if (!hoja) return { ok: false, motivo: 'La hoja MARCADORES no existe.' };
  var headers = hoja.getRange(1, 1, 1, hoja.getLastColumn()).getValues()[0];
  var hayDimensiones = headers.indexOf('dimensiones') !== -1;

  if (!hayDimensiones) {
    cambios = cambios.map(function (c) {
      return { marcador: c.marcador, informe_id: c.informe_id, filtro: c.filtro };
    });
  }

  var r = curarCamposMarcadores_(cambios);
  r.columna_dimensiones = hayDimensiones ? 'existe: se vació' : 'no existe: sólo se restauró `filtro`';
  return r;
}

/** Wrapper público de la reversión — el que se elige en el desplegable (`CLAUDE.md` §2). */
function revertirPilotoDeImpresiones() {
  var r = revertirPilotoImpresiones_();
  if (!r.ok) { Logger.log('FALLÓ: ' + r.motivo); return r; }
  Logger.log('== reversión del piloto: ' + r.cambios_escritos + ' celda(s) ==');
  r.aplicados.forEach(function (a) {
    Logger.log('  ' + a.marcador + ' · ' + a.campo + ': "' + a.anterior + '" → "' + a.nuevo + '"');
  });
  if (r.sin_fila.length) {
    Logger.log('⚠ no se pudo tocar (' + r.sin_fila.length + '):');
    r.sin_fila.forEach(function (s) { Logger.log('   ' + s); });
  }
  Logger.log('columna `dimensiones`: ' + r.columna_dimensiones);
  Logger.log('MARCADORES vuelve al estado de MARCADORES_2026-08-15.tsv para estos ocho.');
  return r;
}

/**
 * `2026-08-16_4` Parte B — **la tanda 1: los ocho de `mail_*`/`gcba_mail_*` pasan a declarar su
 * corte en `dimensiones` (`D-33`)**.
 *
 * **Autorizada por el piloto**, que pasó el 16/08 11:58: ocho cuentas de filas idénticas,
 * descuadre cero en los dos ámbitos, y el canario sin migrar confirmando desde afuera.
 *
 * **Por el escritor declarado**, `curarCamposMarcadores_` — corrige campos de filas que ya
 * existen, sin crear ni borrar (`ESCRITORES.md`). Desde el 15/08 es **todo o nada**: si alguna
 * columna de algún cambio no existe, no escribe ninguna celda. Esa guarda existe porque la
 * migración del piloto corrió antes de que existiera `dimensiones` y **escribió los ocho `filtro`
 * sin escribir el corte** — ocho marcadores publicando el mismo número y ninguno fallando.
 *
 * ─── La diferencia con el piloto, y hay que verla antes de leer el diff ────────────────────
 *
 * **Acá el `filtro` queda VACÍO, no con un resto.** En el piloto sobrevivía `estado=Activa`, que
 * es una restricción técnica (`D-33`). Los ocho de mail **no tienen ninguna**: su `filtro` es
 * **sólo** la condición de ámbito, así que al migrar el corte no queda nada.
 *
 *   filtro        "mail_remitente=jorge.macri@buenosaires.gob.ar"  ->  "" (vacío)
 *   dimensiones   (vacío)                                          ->  "ambito=jm"
 *
 * **Un `filtro` vacío es un estado normal y no un error** — los cuatro grupos de `Directa IVR` lo
 * tienen hoy. Pero conviene saberlo al mirar el diff: **ocho celdas que se vacían** se parece a
 * un borrado accidental y no lo es.
 *
 * **El corte sale del `filtro` en la misma operación en que entra a `dimensiones`.** Dejarlo en
 * los dos lados daría el mismo número —filtrar dos veces por lo mismo es idempotente— y sería
 * una tanda que no puede fallar. **Y no probaría nada**: lo que se verifica es que la traducción
 * de dimensión reproduzca la condición que el filtro tenía.
 *
 * **`ambito` es la única dimensión de esta tanda.** No hay `plataforma` ni `tipo_envio` acá: los
 * `m2_*` cortan la misma solapa por `tipo_envio=m2` y **se migran aparte**, porque meterlos
 * convertiría una tanda de una dimensión en una de dos.
 *
 * **Idempotente**: `curarCamposMarcadores_` no escribe una celda que ya tiene el valor pedido.
 */
function migrarTanda1MailADimensiones_() {
  var cambios = [
    { marcador: 'mail_envios',          informe_id: 'jm', filtro: '', dimensiones: 'ambito=jm' },
    { marcador: 'mail_entregados',      informe_id: 'jm', filtro: '', dimensiones: 'ambito=jm' },
    { marcador: 'mail_aperturas',       informe_id: 'jm', filtro: '', dimensiones: 'ambito=jm' },
    { marcador: 'mail_or',              informe_id: 'jm', filtro: '', dimensiones: 'ambito=jm' },
    { marcador: 'gcba_mail_envios',     informe_id: 'jm', filtro: '', dimensiones: 'ambito=gcba' },
    { marcador: 'gcba_mail_entregados', informe_id: 'jm', filtro: '', dimensiones: 'ambito=gcba' },
    { marcador: 'gcba_mail_aperturas',  informe_id: 'jm', filtro: '', dimensiones: 'ambito=gcba' },
    { marcador: 'gcba_mail_or',         informe_id: 'jm', filtro: '', dimensiones: 'ambito=gcba' }
  ];
  return curarCamposMarcadores_(cambios);
}

/**
 * Wrapper público de la tanda 1 — el que se elige en el desplegable (`CLAUDE.md` §2: sin `_`
 * final y **sin parámetros**).
 *
 * ⚠ **ESCRIBE en `MARCADORES`.** Antes de correrla tiene que existir el testigo de la Parte A —
 * `docs/_snapshots/TESTIGO_mail_2026-08-16_2220.md` —: sin él la Parte C no tiene contra qué
 * comparar y la tanda no se puede verificar ni revertir con criterio.
 */
function migrarTanda1DeMail() {
  var r = migrarTanda1MailADimensiones_();
  if (!r.ok) { Logger.log('FALLÓ: ' + r.motivo); return r; }

  Logger.log('== tanda 1 (mail): ' + r.cambios_escritos + ' celda(s) escrita(s) ==');
  r.aplicados.forEach(function (a) {
    Logger.log('  ' + a.marcador + ' · ' + a.campo + ': "' + a.anterior + '" -> "' + a.nuevo + '"');
  });
  if (r.sin_fila.length) {
    Logger.log('⚠ SIN FILA EN LA HOJA (' + r.sin_fila.length + '):');
    r.sin_fila.forEach(function (s) { Logger.log('   ' + s); });
  }
  Logger.log('Ahora: correr testigoDeImpresiones() y comparar contra el testigo del 16/08 22:20,');
  Logger.log('EN ESTE ORDEN: (0) canario enc_atendidos/ivr_atendidos · (1) cuentas de filas ·');
  Logger.log('(2) valores · (3) la partición 311 + 1.928 = 2.239, que es el control.');
  return r;
}

/**
 * **Revierte la tanda 1 al estado de la línea base.** `2026-08-16_4`, Parte C.
 *
 * ⚠ **Los ocho `filtro` salen textuales de `docs/_snapshots/MARCADORES_2026-08-15.tsv`, generados
 * LEYENDO el archivo y no transcribiéndolos a mano.** El remitente lleva `@` y un punto, y una
 * transcripción rota produce un filtro que **no matchea ninguna fila y devuelve cero sin fallar**
 * — el mismo modo de falla que se está reparando, dentro del reparador. Es la misma precaución
 * que tomó `revertirPilotoImpresiones_` con la `ñ` de `nombre_campaña`.
 *
 * **Cuándo se corre:** sólo si la Parte C no reproduce **con las cuentas de filas idénticas**. Si
 * las filas cambiaron, es la base y no la migración — revertir ahí sería tirar trabajo bueno, que
 * es exactamente lo que el canario del piloto evitó dos veces.
 */
function revertirTanda1MailADimensiones_() {
  var cambios = [
    { marcador: 'mail_envios',          informe_id: 'jm', filtro: 'mail_remitente=jorge.macri@buenosaires.gob.ar',  dimensiones: '' },
    { marcador: 'mail_entregados',      informe_id: 'jm', filtro: 'mail_remitente=jorge.macri@buenosaires.gob.ar',  dimensiones: '' },
    { marcador: 'mail_aperturas',       informe_id: 'jm', filtro: 'mail_remitente=jorge.macri@buenosaires.gob.ar',  dimensiones: '' },
    { marcador: 'mail_or',              informe_id: 'jm', filtro: 'mail_remitente=jorge.macri@buenosaires.gob.ar',  dimensiones: '' },
    { marcador: 'gcba_mail_envios',     informe_id: 'jm', filtro: 'mail_remitente!=jorge.macri@buenosaires.gob.ar', dimensiones: '' },
    { marcador: 'gcba_mail_entregados', informe_id: 'jm', filtro: 'mail_remitente!=jorge.macri@buenosaires.gob.ar', dimensiones: '' },
    { marcador: 'gcba_mail_aperturas',  informe_id: 'jm', filtro: 'mail_remitente!=jorge.macri@buenosaires.gob.ar', dimensiones: '' },
    { marcador: 'gcba_mail_or',         informe_id: 'jm', filtro: 'mail_remitente!=jorge.macri@buenosaires.gob.ar', dimensiones: '' }
  ];
  return curarCamposMarcadores_(cambios);
}

/** Wrapper público de la reversión de la tanda 1. ⚠ **ESCRIBE en `MARCADORES`.** */
function revertirTanda1DeMail() {
  var r = revertirTanda1MailADimensiones_();
  if (!r.ok) { Logger.log('FALLÓ: ' + r.motivo); return r; }
  Logger.log('== reversión tanda 1 (mail): ' + r.cambios_escritos + ' celda(s) ==');
  r.aplicados.forEach(function (a) {
    Logger.log('  ' + a.marcador + ' · ' + a.campo + ': "' + a.anterior + '" -> "' + a.nuevo + '"');
  });
  return r;
}

/**
 * Los ocho de la tanda 1, en la plantilla de `jm` — **el punto 5 de la Parte A: los consumidores.**
 *
 * Wrapper **sin argumentos** de `censarTokensEnPlantilla` (`CLAUDE.md` §2). Mismo criterio que
 * `censarTokensDelPiloto()`: una función con parámetros no aparece en el desplegable aunque no
 * termine en `_`.
 *
 * **Para qué sirve el resultado:** un marcador sin consumidor se migra igual, **pero no se puede
 * verificar contra un deck**. Y si alguno aparece en **dos** láminas —como `imp_total` en el
 * piloto, que está en la 2 y en la 5— hay que saberlo antes de la Parte C: el mismo token tiene
 * que dar el mismo número en las dos.
 */
function censarTokensDeTanda1Mail() {
  return censarTokensEnPlantilla('jm',
    'mail_envios,mail_entregados,mail_aperturas,mail_or,' +
    'gcba_mail_envios,gcba_mail_entregados,gcba_mail_aperturas,gcba_mail_or');
}

/**
 * `2026-08-17_1` Parte B — **tanda 2: los siete `m2_*` pasan a `tipo_envio=m2`.**
 *
 * **Son SIETE y no trece.** Los seis `enc_mails_*` salieron el 17/08: dan `sin_datos` con
 * `«FALTA:@ultimo_ambiguo»` y **un marcador que no produce valor no se puede verificar** — la
 * Parte C compararía `sin_datos` contra `sin_datos`.
 *
 * ⚠ **Esto deja `tipo_envio` migrada A MEDIAS**, y es deliberado: `m2` queda en `dimensiones` y
 * `convocatoria` sigue en `filtro`. **Las dos formas conviven**, que el piloto ya estableció como
 * aceptable. Un censo de dimensiones que no lo espere lo va a leer como inconsistencia — está en
 * `PENDIENTES` junto con el `@ultimo_ambiguo` que lo causa.
 *
 * **El `filtro` queda vacío en los siete**: su filtro es **sólo** el corte de `tipo_envio` y no
 * hay restricción técnica que preservar, igual que en la tanda 1.
 */
function migrarTanda2M2ADimensiones_() {
  var cambios = [
    { marcador: 'm2_envios',           informe_id: 'jm', filtro: '', dimensiones: 'tipo_envio=m2' },
    { marcador: 'm2_mails_enviados',   informe_id: 'jm', filtro: '', dimensiones: 'tipo_envio=m2' },
    { marcador: 'm2_mails_entregados', informe_id: 'jm', filtro: '', dimensiones: 'tipo_envio=m2' },
    { marcador: 'm2_aperturas',        informe_id: 'jm', filtro: '', dimensiones: 'tipo_envio=m2' },
    { marcador: 'm2_clics',            informe_id: 'jm', filtro: '', dimensiones: 'tipo_envio=m2' },
    { marcador: 'm2_or',               informe_id: 'jm', filtro: '', dimensiones: 'tipo_envio=m2' },
    { marcador: 'm2_ctor',             informe_id: 'jm', filtro: '', dimensiones: 'tipo_envio=m2' }
  ];
  return curarCamposMarcadores_(cambios);
}

/** Wrapper público de la tanda 2. ⚠ **ESCRIBE en `MARCADORES`.** */
function migrarTanda2DeM2() {
  var r = migrarTanda2M2ADimensiones_();
  if (!r.ok) { Logger.log('FALLÓ: ' + r.motivo); return r; }
  Logger.log('== tanda 2 (m2): ' + r.cambios_escritos + ' celda(s) escrita(s) ==');
  r.aplicados.forEach(function (a) {
    Logger.log('  ' + a.marcador + ' · ' + a.campo + ': "' + a.anterior + '" -> "' + a.nuevo + '"');
  });
  if (r.sin_fila.length) {
    Logger.log('⚠ SIN FILA EN LA HOJA (' + r.sin_fila.length + '):');
    r.sin_fila.forEach(function (s) { Logger.log('   ' + s); });
  }
  Logger.log('Ahora: testigoDeTanda2() y comparar. ⚠ Si el RESTO cambió, mirar PRIMERO si crecio');
  Logger.log('el universo: usa el universo COMPLETO, que si se mueve entre tomas (2.239 -> 2.241');
  Logger.log('en 13 horas el 17/08). Solo si el universo NO cambio y el RESTO si, es la migracion.');
  return r;
}

/**
 * **Revierte la tanda 2.** ⚠ Los siete `filtro` salen textuales de
 * `docs/_snapshots/MARCADORES_2026-08-17.tsv`, **generados leyendo el archivo**, y verificados
 * carácter a carácter contra él antes de commitear.
 */
function revertirTanda2M2ADimensiones_() {
  var cambios = [
    { marcador: 'm2_envios',           informe_id: 'jm', filtro: 'mail_tipo~=M2', dimensiones: '' },
    { marcador: 'm2_mails_enviados',   informe_id: 'jm', filtro: 'mail_tipo~=M2', dimensiones: '' },
    { marcador: 'm2_mails_entregados', informe_id: 'jm', filtro: 'mail_tipo~=M2', dimensiones: '' },
    { marcador: 'm2_aperturas',        informe_id: 'jm', filtro: 'mail_tipo~=M2', dimensiones: '' },
    { marcador: 'm2_clics',            informe_id: 'jm', filtro: 'mail_tipo~=M2', dimensiones: '' },
    { marcador: 'm2_or',               informe_id: 'jm', filtro: 'mail_tipo~=M2', dimensiones: '' },
    { marcador: 'm2_ctor',             informe_id: 'jm', filtro: 'mail_tipo~=M2', dimensiones: '' }
  ];
  return curarCamposMarcadores_(cambios);
}

/** Wrapper público de la reversión de la tanda 2. ⚠ **ESCRIBE en `MARCADORES`.** */
function revertirTanda2DeM2() {
  var r = revertirTanda2M2ADimensiones_();
  if (!r.ok) { Logger.log('FALLÓ: ' + r.motivo); return r; }
  Logger.log('== reversión tanda 2 (m2): ' + r.cambios_escritos + ' celda(s) ==');
  r.aplicados.forEach(function (a) {
    Logger.log('  ' + a.marcador + ' · ' + a.campo + ': "' + a.anterior + '" -> "' + a.nuevo + '"');
  });
  return r;
}

/**
 * `2026-08-17_3` Parte B — **tanda 3: los 17 de `rdv` pasan a `ambito=jm`.** La tanda más grande:
 * 17 de 48. Después de ésta quedan 24.
 *
 * **Los 17 comparten el filtro `figura=Jorge Macri`**, que es la expresión física de `ambito=jm`
 * en esta base según `DIMENSIONES_`. **Cero líneas de `.gs`**: la traducción ya existe.
 *
 * ⚠ **`rdv` NO tiene canario posible** —los 17 comparten filtro, así que la migración los toca a
 * todos y no queda ninguno afuera—. **No hace falta**, y el motivo está en `CLAUDE.md` §4: la
 * verificación corre **testigo → migración → testigo en la misma sesión**, con minutos entre
 * tomas, así que el drift no alcanza a intervenir. Dos lecturas a **12 horas** dieron idénticas
 * (17/08), y si en cinco minutos cambiara algo **las 17 cuentas de filas lo delatarían**.
 *
 * **Y `rdv` tiene dos invariantes que no dependen del drift**, medidas el 17/08:
 *
 *   1. **las 17 cuentas de filas son iguales** — 4 de 15, en los diecisiete;
 *   2. **la identidad de canales cierra**: `insc_mail + insc_cc + insc_ivr + insc_digital +
 *      insc_dif = inscriptos`, exacto en **2.307** dentro de la ventana.
 *
 * **Si alguna se rompe después de migrar, es la migración.** Son el equivalente del descuadre del
 * piloto: estructurales, no dependen del momento.
 *
 * ⚠ **Los cinco `_pct` NO son control.** Mismo caso que `mail_or`: comparten filtro con sus dos
 * sumas, así que el `PCT` es el ratio de dos sumas **sobre las mismas filas** y un corte mal
 * traducido lo dejaría igual. **Se cumplen por construcción.**
 */
function migrarTanda3RdvADimensiones_() {
  var cambios = [
    { marcador: 'ecv_encuentros',       informe_id: 'jm', filtro: '', dimensiones: 'ambito=jm' },
    { marcador: 'ecv_inscriptos',       informe_id: 'jm', filtro: '', dimensiones: 'ambito=jm' },
    { marcador: 'ecv_asistentes',       informe_id: 'jm', filtro: '', dimensiones: 'ambito=jm' },
    { marcador: 'ecv_barrios',          informe_id: 'jm', filtro: '', dimensiones: 'ambito=jm' },
    { marcador: 'ecv_barrio',           informe_id: 'jm', filtro: '', dimensiones: 'ambito=jm' },
    { marcador: 'ecv_poblacion',        informe_id: 'jm', filtro: '', dimensiones: 'ambito=jm' },
    { marcador: 'enc_evento',           informe_id: 'jm', filtro: '', dimensiones: 'ambito=jm' },
    { marcador: 'ecv_insc_mail',        informe_id: 'jm', filtro: '', dimensiones: 'ambito=jm' },
    { marcador: 'ecv_insc_cc',          informe_id: 'jm', filtro: '', dimensiones: 'ambito=jm' },
    { marcador: 'ecv_insc_ivr',         informe_id: 'jm', filtro: '', dimensiones: 'ambito=jm' },
    { marcador: 'ecv_insc_digital',     informe_id: 'jm', filtro: '', dimensiones: 'ambito=jm' },
    { marcador: 'ecv_insc_dif',         informe_id: 'jm', filtro: '', dimensiones: 'ambito=jm' },
    { marcador: 'ecv_insc_mail_pct',    informe_id: 'jm', filtro: '', dimensiones: 'ambito=jm' },
    { marcador: 'ecv_insc_cc_pct',      informe_id: 'jm', filtro: '', dimensiones: 'ambito=jm' },
    { marcador: 'ecv_insc_ivr_pct',     informe_id: 'jm', filtro: '', dimensiones: 'ambito=jm' },
    { marcador: 'ecv_insc_digital_pct', informe_id: 'jm', filtro: '', dimensiones: 'ambito=jm' },
    { marcador: 'ecv_insc_dif_pct',     informe_id: 'jm', filtro: '', dimensiones: 'ambito=jm' }
  ];
  return curarCamposMarcadores_(cambios);
}

/** Wrapper público de la tanda 3. ⚠ **ESCRIBE en `MARCADORES`. 17 filas, la tanda más grande.** */
function migrarTanda3DeRdv() {
  var r = migrarTanda3RdvADimensiones_();
  if (!r.ok) { Logger.log('FALLÓ: ' + r.motivo); return r; }
  Logger.log('== tanda 3 (rdv): ' + r.cambios_escritos + ' celda(s) escrita(s) ==');
  r.aplicados.forEach(function (a) {
    Logger.log('  ' + a.marcador + ' · ' + a.campo + ': "' + a.anterior + '" -> "' + a.nuevo + '"');
  });
  if (r.sin_fila.length) {
    Logger.log('⚠ SIN FILA EN LA HOJA (' + r.sin_fila.length + '):');
    r.sin_fila.forEach(function (s) { Logger.log('   ' + s); });
  }
  Logger.log('Ahora: testigoDeRdv() EN ESTA MISMA SESION. Los dos controles estructurales:');
  Logger.log('  (1) las 17 cuentas de filas siguen iguales entre si — daban 4 de 15;');
  Logger.log('  (2) la identidad de canales sigue cerrando — daba 2.307 exacto.');
  Logger.log('Si alguno se rompe, es la migracion. Los cinco _pct NO son control.');
  return r;
}

/**
 * **Revierte la tanda 3.** ⚠ Los 17 `filtro` salen textuales de
 * `docs/_snapshots/MARCADORES_2026-08-17.tsv`, **generados leyendo el archivo**. `figura=Jorge
 * Macri` lleva un espacio interno: una transcripción que lo colapse o lo duplique produce un
 * filtro que **no matchea ninguna fila y devuelve cero sin fallar**.
 */
function revertirTanda3RdvADimensiones_() {
  var F = 'figura=Jorge Macri';
  var cambios = [
    { marcador: 'ecv_encuentros',       informe_id: 'jm', filtro: F, dimensiones: '' },
    { marcador: 'ecv_inscriptos',       informe_id: 'jm', filtro: F, dimensiones: '' },
    { marcador: 'ecv_asistentes',       informe_id: 'jm', filtro: F, dimensiones: '' },
    { marcador: 'ecv_barrios',          informe_id: 'jm', filtro: F, dimensiones: '' },
    { marcador: 'ecv_barrio',           informe_id: 'jm', filtro: F, dimensiones: '' },
    { marcador: 'ecv_poblacion',        informe_id: 'jm', filtro: F, dimensiones: '' },
    { marcador: 'enc_evento',           informe_id: 'jm', filtro: F, dimensiones: '' },
    { marcador: 'ecv_insc_mail',        informe_id: 'jm', filtro: F, dimensiones: '' },
    { marcador: 'ecv_insc_cc',          informe_id: 'jm', filtro: F, dimensiones: '' },
    { marcador: 'ecv_insc_ivr',         informe_id: 'jm', filtro: F, dimensiones: '' },
    { marcador: 'ecv_insc_digital',     informe_id: 'jm', filtro: F, dimensiones: '' },
    { marcador: 'ecv_insc_dif',         informe_id: 'jm', filtro: F, dimensiones: '' },
    { marcador: 'ecv_insc_mail_pct',    informe_id: 'jm', filtro: F, dimensiones: '' },
    { marcador: 'ecv_insc_cc_pct',      informe_id: 'jm', filtro: F, dimensiones: '' },
    { marcador: 'ecv_insc_ivr_pct',     informe_id: 'jm', filtro: F, dimensiones: '' },
    { marcador: 'ecv_insc_digital_pct', informe_id: 'jm', filtro: F, dimensiones: '' },
    { marcador: 'ecv_insc_dif_pct',     informe_id: 'jm', filtro: F, dimensiones: '' }
  ];
  return curarCamposMarcadores_(cambios);
}

/** Wrapper público de la reversión de la tanda 3. ⚠ **ESCRIBE en `MARCADORES`.** */
function revertirTanda3DeRdv() {
  var r = revertirTanda3RdvADimensiones_();
  if (!r.ok) { Logger.log('FALLÓ: ' + r.motivo); return r; }
  Logger.log('== reversión tanda 3 (rdv): ' + r.cambios_escritos + ' celda(s) ==');
  r.aplicados.forEach(function (a) {
    Logger.log('  ' + a.marcador + ' · ' + a.campo + ': "' + a.anterior + '" -> "' + a.nuevo + '"');
  });
  return r;
}

/**
 * **Tanda 4 (`2026-08-17_4`) — el par de `looker/resumen_metricas_dinamico` a `dimensiones`.**
 *
 * **Con esto la migración de `D-33` queda completa sobre todo lo migrable: 42 de 48.** Los seis
 * `enc_mails_*` que faltan están bloqueados por `@ultimo_ambiguo`, que es un hueco de **dato** y
 * no de vocabulario.
 *
 * ⚠ **El `filtro` queda VACÍO en los dos, y acá hay que decir por qué no se pierde nada.** Las
 * notas de las dos filas en `MARCADORES` declaran que **no llevan `estado=Activa` a propósito**:
 * con ese filtro las únicas dos filas `Activa` de la ventana son las dos de `JM` y
 * `gcba_frecuencia` quedaba en **0 de 26**. Así que el `filtro` de estas dos filas es **sólo** el
 * corte de ámbito: no hay restricción técnica que preservar, y vaciarlo no deroga ninguna guarda.
 * Es el mismo caso que las tandas 1, 2 y 3 — pero es el único donde la ausencia de la guarda es
 * una decisión escrita, así que se cita en vez de asumirse.
 */
function migrarTanda4FrecuenciaADimensiones_() {
  var cambios = [
    { marcador: 'frecuencia',      informe_id: 'jm', filtro: '', dimensiones: 'ambito=jm' },
    { marcador: 'gcba_frecuencia', informe_id: 'jm', filtro: '', dimensiones: 'ambito=gcba' }
  ];
  return curarCamposMarcadores_(cambios);
}

/** Wrapper público de la tanda 4. ⚠ **ESCRIBE en `MARCADORES`. 2 filas, la tanda más chica.** */
function migrarTanda4DeFrecuencia() {
  var r = migrarTanda4FrecuenciaADimensiones_();
  if (!r.ok) { Logger.log('FALLÓ: ' + r.motivo); return r; }
  Logger.log('== tanda 4 (looker/resumen_metricas_dinamico): ' + r.cambios_escritos + ' celda(s) ==');
  r.aplicados.forEach(function (a) {
    Logger.log('  ' + a.marcador + ' · ' + a.campo + ': "' + a.anterior + '" -> "' + a.nuevo + '"');
  });
  if (r.sin_fila.length) {
    Logger.log('⚠ SIN FILA EN LA HOJA (' + r.sin_fila.length + '):');
    r.sin_fila.forEach(function (s) { Logger.log('   ' + s); });
  }
  Logger.log('Ahora: testigoDeFrecuencia() EN ESTA MISMA SESION.');
  Logger.log('⚠ El orden de lectura se INVIERTE respecto de las tandas 2 y 3:');
  Logger.log('  (1) LA PARTICION es el control principal — daba 4 + 22 = 26;');
  Logger.log('  (2) las dos cuentas de filas;');
  Logger.log('  (3) los valores, el dato MAS DEBIL: looker recalcula DENTRO de la ventana.');
  Logger.log('     Un valor distinto NO detiene la tanda si la particion cierra. Los operandos');
  Logger.log('     del RATIO dicen si se movio el numerador o el denominador.');
  return r;
}

/**
 * **Revierte la tanda 4.** ⚠ Los dos `filtro` salen textuales de
 * `docs/_snapshots/MARCADORES_2026-08-17.tsv`, **generados leyendo el archivo**.
 *
 * ⚠ **`~=` y `!~=` son operadores distintos y el error de transcripción no falla: devuelve un
 * conjunto equivocado en silencio.** Peor que en la tanda 3, donde el riesgo era un espacio de
 * más en `Jorge Macri`: acá los dos textos difieren en **un carácter**, y confundirlos deja las
 * dos filas leyendo **la misma mitad** del universo — la partición seguiría cerrando en apariencia
 * (`4 + 4 = 8`) pero contra un universo que ya no es el de nadie.
 */
function revertirTanda4FrecuenciaADimensiones_() {
  var cambios = [
    { marcador: 'frecuencia',      informe_id: 'jm', filtro: 'campana~=JM',  dimensiones: '' },
    { marcador: 'gcba_frecuencia', informe_id: 'jm', filtro: 'campana!~=JM', dimensiones: '' }
  ];
  return curarCamposMarcadores_(cambios);
}

/** Wrapper público de la reversión de la tanda 4. ⚠ **ESCRIBE en `MARCADORES`.** */
function revertirTanda4DeFrecuencia() {
  var r = revertirTanda4FrecuenciaADimensiones_();
  if (!r.ok) { Logger.log('FALLÓ: ' + r.motivo); return r; }
  Logger.log('== reversión tanda 4: ' + r.cambios_escritos + ' celda(s) ==');
  r.aplicados.forEach(function (a) {
    Logger.log('  ' + a.marcador + ' · ' + a.campo + ': "' + a.anterior + '" -> "' + a.nuevo + '"');
  });
  return r;
}

/**
 * **`2026-08-19_1` Parte D — el alta de los nueve `camp_*` de la lámina de resultados agregados.**
 *
 * ⚠ **ESCRIBE en `MARCADORES`.** Va por `curarMarcadores_`, que es la puerta declarada para
 * agregar filas enteras por decisión de una persona: **no hay `SEED_MARCADORES_` y no lo va a
 * haber** (`D-17`).
 *
 * **Las cinco decisiones que hay adentro, porque ninguna es obvia:**
 *
 * **1 · `ULTIMO` y no `SUMA`, aunque con una fila den lo mismo.** Los hermanos que ya publican
 * estas medidas —`imp_total`, `mail_entregados`, `mail_aperturas`— usan `SUMA`. **El grano es
 * distinto y por eso la operación también:** aquéllos leen solapas con muchas filas por cuenta y su
 * trabajo es agregarlas; acá la lectura por cuenta devuelve **una sola fila** (medido el 19/08:
 * 1 de 995 para los cuatro ids). ⚠ **El desempate es qué pasa el día que haya dos:** `SUMA` sumaría
 * en silencio un **alcance**, que es deduplicado y **no se suma**, dando un número grande y
 * plausible; `ULTIMO` **elige por fecha y lo dice en la traza**.
 *
 * **2 · `camp_frecuencia` es el `RATIO`, no la columna `frecuencia_total` (col M).** La solapa
 * tiene las dos vías. Se elige el ratio porque **el hecho «frecuencia» ya tiene una sola definición
 * en este motor** —`frecuencia`/`gcba_frecuencia`, `RATIO dig_impresiones/alcance`— y leer la
 * columna acá crearía **dos definiciones del mismo hecho**, que es lo que `D-33` terminó de cerrar.
 * El ratio además deja numerador y denominador en la traza, que es lo que permitió cerrar la
 * tanda 4.
 *
 * **3 · `camp_titulo` sale de la BASE, no de `CAMPANAS.nombre`.** El título es `Nombre campaña |
 * Cuentas`, la **misma columna** contra la que `catalogoDeCampanas_` resuelve el id: así **lo que
 * se publica y lo que se matcheó son el mismo texto**, y `CAMPANAS.nombre` queda como el nombre que
 * escribió la persona en el temario. Llega por la rama de `digital` (unión por cuenta), y
 * `sd_campana_cuentas` ya está en `CAMPOS_DIMENSION_MAESTRA_` — **verificado el 19/08**.
 *
 * **4 · `dimensiones` vacío, y NO es una excepción a la regla del 17/08.** *«Todo marcador nuevo
 * nace con el corte en `dimensiones`»* — y **éstos no tienen corte**. La campaña no es una
 * dimensión: es **el ítem de la iteración**, y ya es contexto por dos vías. Ponerle `campana=X` a un
 * marcador que se emite dentro de una lámina por campaña **recortaría lo mismo dos veces**.
 *
 * **5 · `filtro` vacío, sin guarda `!=0`.** Los `enc_*` llevan `imp_totales!=0` porque la fila del
 * encuentro existe siempre y el cero significa *"no hubo"*. Acá una campaña **sin fila no publica**,
 * y una fila con cero **es un cero real**. ⚠ **Agregar la guarda por simetría convertiría un cero
 * verdadero en `«FALTA»`** — el error simétrico de `D-33` addendum 2.
 */
function altaMarcadoresDeCampana_() {
  var N = function (via) {
    return '2026-08-19_1 — ' + via + '. SIN VALIDAR';
  };
  var RAMA_CUENTA = 'rama por cuenta (`D-30`/`R-17`), 1 fila por id medida el 19/08';

  var agregar = [
    { marcador: 'camp_impresiones', familia: 'camp', informe_id: 'jm', base_id: 'looker',
      solapa: 'resumen_metricas_dinamico', campo_logico: 'dig_impresiones', operacion: 'ULTIMO',
      filtro: '', dimensiones: '', formato: 'miles', notas: N(RAMA_CUENTA) },
    { marcador: 'camp_visualizaciones', familia: 'camp', informe_id: 'jm', base_id: 'looker',
      solapa: 'resumen_metricas_dinamico', campo_logico: 'dig_visualizaciones', operacion: 'ULTIMO',
      filtro: '', dimensiones: '', formato: 'miles', notas: N(RAMA_CUENTA) },
    { marcador: 'camp_clics', familia: 'camp', informe_id: 'jm', base_id: 'looker',
      solapa: 'resumen_metricas_dinamico', campo_logico: 'dig_clics', operacion: 'ULTIMO',
      filtro: '', dimensiones: '', formato: 'miles', notas: N(RAMA_CUENTA) },
    /* ⚠ `camp_alcance` NO lleva `_revisar`, y es una decisión (addendum `_1.1` §3): la marca dice
     * *"este número no está confirmado por ninguna vía"* y ése es el caso de `camp_frecuencia`.
     * **`camp_alcance` reproduce, con drift** — marcarlo también **diluiría la marca hasta volverla
     * decorativa**. El drift va en la nota, que es donde sirve. */
    { marcador: 'camp_alcance', familia: 'camp', informe_id: 'jm', base_id: 'looker',
      solapa: 'resumen_metricas_dinamico', campo_logico: 'alcance', operacion: 'ULTIMO',
      filtro: '', dimensiones: '', formato: 'miles',
      notas: N(RAMA_CUENTA + '. El alcance de esta base se movió +56,7% en dos días sobre una ' +
        'ventana cerrada (19/08): dos corridas del mismo período pueden dar distinto y NO es un ' +
        'bug del motor. Mapea a la columna `meta_alcance` — ver A-12') },
    { marcador: 'camp_entregados', familia: 'camp', informe_id: 'jm', base_id: 'looker',
      solapa: 'resumen_metricas_dinamico', campo_logico: 'mail_entregados', operacion: 'ULTIMO',
      filtro: '', dimensiones: '', formato: 'miles', notas: N(RAMA_CUENTA) },
    { marcador: 'camp_aperturas', familia: 'camp', informe_id: 'jm', base_id: 'looker',
      solapa: 'resumen_metricas_dinamico', campo_logico: 'mail_aperturas', operacion: 'ULTIMO',
      filtro: '', dimensiones: '', formato: 'miles', notas: N(RAMA_CUENTA) },
    { marcador: 'camp_ctor', familia: 'camp', informe_id: 'jm', base_id: 'looker',
      solapa: 'resumen_metricas_dinamico', campo_logico: 'mail_clics/mail_aperturas',
      operacion: 'PCT', filtro: '', dimensiones: '', formato: 'porcentaje_sin_signo',
      notas: N(RAMA_CUENTA + '. PCT sobre los agregados de la fila, no promedio de una tasa') },
    /* ⚠ `numero_revisar` porque `X-19` sigue abierta: el deck publica **8,4** para `3305` y eso
     * **no es** el ratio (28.253.288 / 3.178.282 = 8,89) **ni** `looker/ALCANCE` (2,27). **El número
     * que salga es del motor, y no hay que reproducir el 8,4.** El hallazgo del 19/08 lo refuerza:
     * con el denominador moviéndose 56,7% en dos días, el valor **va a cambiar entre corridas**, y
     * los guiones son exactamente la señal de que ese número no está cerrado. */
    { marcador: 'camp_frecuencia', familia: 'camp', informe_id: 'jm', base_id: 'looker',
      solapa: 'resumen_metricas_dinamico', campo_logico: 'dig_impresiones/alcance',
      operacion: 'RATIO', filtro: '', dimensiones: '', formato: 'numero_revisar',
      notas: N(RAMA_CUENTA + '. RATIO y no la columna `frecuencia_total` (col M): el hecho ' +
        '«frecuencia» ya tiene una sola definición en el motor (D-33). X-19 ABIERTA: el 8,4 ' +
        'publicado no reproduce ni por ratio ni por looker/ALCANCE — NO hay que reproducirlo') },
    { marcador: 'camp_titulo', familia: 'camp', informe_id: 'jm', base_id: 'digital',
      solapa: 'Seguimiento digital', campo_logico: 'sd_campana_cuentas', operacion: 'ULTIMO',
      filtro: '', dimensiones: '', formato: 'texto',
      notas: N('unión digital por cuenta; `sd_campana_cuentas` es la MISMA columna contra la que ' +
        'catalogoDeCampanas_ resuelve el id, así que lo publicado y lo matcheado son el mismo texto') }
  ];

  return curarMarcadores_([], agregar);
}

/** Wrapper público del alta de los nueve `camp_*`. ⚠ **ESCRIBE en `MARCADORES`.** */
function darDeAltaMarcadoresDeCampana() {
  var r = altaMarcadoresDeCampana_();
  if (!r.ok) { Logger.log('FALLÓ: ' + r.motivo); return r; }
  Logger.log('== alta de los nueve camp_* ==');
  Logger.log('  agregadas (' + r.agregadas.length + '): ' + r.agregadas.join(', '));
  if (r.quitadas.length) {
    Logger.log('  ⚠ REEMPLAZADAS/QUITADAS (' + r.quitadas.length + '):');
    r.quitadas.forEach(function (q) { Logger.log('     ' + q.marcador + ' (' + q.informe_id + ') — ' + q.motivo); });
  }
  Logger.log('  filas finales en MARCADORES: ' + r.filas_finales + '  (esperado: 87)');
  if (r.filas_finales !== 87) {
    Logger.log('  ⚠ NO son 87. Eran 78 y se agregan 9. Revisar antes de seguir.');
  }
  Logger.log('');
  Logger.log('Ahora, la Parte E. ⭐ EL CONTROL PRINCIPAL es la TRAZA, no el numero:');
  Logger.log('  tiene que decir `rama por cuenta`, NO `agregado global`.');
  Logger.log('  Si campo_id_cuenta no llego o el item no trae cuenta, IGUAL sale un numero');
  Logger.log('  -el agregado de 995 filas- y va a ser grande y plausible. Leer la traza es');
  Logger.log('  lo unico que distingue los dos casos: tiene que decir `sin recorte por');
  Logger.log('  ventana` y el id_cuenta del item.');
  Logger.log('⚠ Y los nueve valores se reportan CON LA HORA al lado: esta base se movio 56,7%');
  Logger.log('  en dos dias, asi que una tabla sin hora no se puede citar dos dias despues.');
  return r;
}

/** Revierte el alta de los nueve. ⚠ **ESCRIBE en `MARCADORES`.** */
function revertirAltaMarcadoresDeCampana() {
  var LOS_9 = ['camp_impresiones', 'camp_visualizaciones', 'camp_clics', 'camp_alcance',
    'camp_entregados', 'camp_aperturas', 'camp_ctor', 'camp_frecuencia', 'camp_titulo'];
  var r = curarMarcadores_(LOS_9, []);
  if (!r.ok) { Logger.log('FALLÓ: ' + r.motivo); return r; }
  Logger.log('== reversión del alta: ' + r.quitadas.length + ' fila(s) quitada(s) ==');
  r.quitadas.forEach(function (q) { Logger.log('   ' + q.marcador + ' (' + q.informe_id + ')'); });
  Logger.log('  filas finales: ' + r.filas_finales + '  (esperado: 78)');
  return r;
}


/**
 * ⭐⭐ **`L-047` — los TRES agregados del GLOBAL que faltaban** (24/08/2026). Publico y sin
 * parametros.
 *
 * La fila GLOBAL de la lamina de mail tiene **nueve columnas** y seis ya publican desde el
 * `2026-08-19_1`. Faltaban estas tres, que el censo del 22/08 lista en el bloque de `L-047`:
 * **`camp_enviados`, `camp_or` y `camp_mail_clics`** — cruzadas **una por una** contra el censo,
 * no derivadas del nombre de la columna.
 *
 * ### Los tipos, medidos en el deck del equipo y no supuestos
 *
 * Tabla de `L-047` del deck del 14-21/08 (fixture del 20/08, sha `f8ef3227…`), fila `GLOBAL`:
 * `Enviados 302.008 · Entregados 299.798 · Aperturas 103.194 · % OR 34% · Clics 1.144 ·
 * % CTOR 1.11%`. **Las tres columnas nuevas son numericas**; la trampa de esta lamina es
 * `Audiencia`, que es TEXTO —`X-35`, el nombre del segmento— y no esta entre estas tres.
 *
 * ### ⭐⭐ La identidad interna, que es el control primario y sale del deck mismo
 *
 * **`% OR = Aperturas / Entregados`**, y el denominador **se midio, no se eligio**: con cuatro
 * filas de envio, tres no distinguen —`enviados` y `entregados` redondean igual— y **la cuarta
 * si**: `77.963/126.766 = 61,50 % → 62` contra `77.963/127.091 = 61,34 % → 61`. **El equipo
 * publica 62.** Ademas coincide con las tres definiciones que el motor ya tiene del mismo hecho
 * (`mail_or`, `gcba_mail_or`, `m2_or`), asi que **no se crea una segunda definicion** — es lo que
 * `D-33` cierra.
 *
 * **`% CTOR = Clics / Aperturas`** cierra exacto en la fila GLOBAL: `1.144/103.194 = 1,109 % →
 * 1,11 %` publicado. Es `camp_ctor`, que ya existe; se anota porque **junto con `camp_or` deja dos
 * de las nueve columnas derivables de las otras siete**, y eso se puede exigir en cada corrida sin
 * el deck del equipo delante — la forma de `V-111`.
 *
 * ⭐ **Y hay una segunda identidad, mas fuerte, que este alta habilita:** en el deck del equipo la
 * fila GLOBAL es la **suma exacta** de las cuatro de envio, en las cuatro columnas de volumen —
 * `18.616+119.471+127.091+36.830 = 302.008` enviados, `299.798` entregados, `103.194` aperturas y
 * `164+194+617+169 = 1.144` clics. ⚠ **Pero cruza fuentes**: el GLOBAL lee
 * `looker/resumen_metricas_dinamico` y las filas de envio `digital/Directa Mail`. **Que cierre
 * dice que las dos fuentes coinciden**, que es mas de lo que dice una identidad interna pura — y
 * por eso puede fallar legitimamente, y ahi el hallazgo es la divergencia de fuentes.
 *
 * ### Las decisiones, con su motivo
 *
 * **1 · Ninguno lleva `_revisar`, y no es descuido.** Sus tres hermanas de la misma solapa y la
 * misma familia de operacion —`camp_entregados`, `camp_aperturas`, `camp_ctor`— no la llevan.
 * ⚠ **La estabilidad de `looker/resumen_metricas_dinamico` NO esta medida en `R-31`** —no figura
 * ni entre los estables ni entre los inestables—, asi que **estos numeros nacen SIN VALIDAR, que
 * no es lo mismo que validados**, y **ningun control por igualdad exacta se puede exigir todavia**.
 * Marcar estos tres y no sus hermanas diluiria la marca hasta volverla decorativa.
 *
 * **2 · `camp_or` es `PCT` sobre los agregados de la fila, no promedio de una tasa.** Mismo
 * criterio que `camp_ctor`, y por el mismo motivo: promediar porcentajes de filas de tamaño
 * distinto da un numero que no es el del deck.
 *
 * **3 · `filtro` y `dimensiones` vacios**, igual que las nueve del `2026-08-19_1`: la campaña **es
 * el item de la iteracion**, no una dimension, y una fila con cero **es un cero real** — la guarda
 * `!=0` convertiria ese cero en `«FALTA»`.
 *
 * ⚠⚠ **4 · `camp_mail_clics` NO es `camp_clics`, y los nombres invitan a confundirlos.**
 * `camp_clics` es **digital** (`dig_clics`, col J) y ya publica en `L-045`; este es **mail**
 * (`mail_clics`, col Q) y va en la fila GLOBAL de `L-047`. Son dos hechos distintos en dos laminas
 * distintas, y elegir mal **no falla: publica**.
 */
function cablearAgregadosDelGlobal_() {
  var N = function (extra) {
    return '2026-08-24 — GLOBAL de L-047, rama por cuenta (`D-30`/`R-17`), misma solapa y misma ' +
      'forma que camp_entregados/camp_aperturas/camp_ctor. ⚠ la estabilidad de esta solapa NO ' +
      'esta medida en R-31: SIN VALIDAR, y no admite control por igualdad exacta todavia' +
      (extra ? '. ' + extra : '');
  };

  return curarMarcadores_([], [
    { marcador: 'camp_enviados', familia: 'camp', informe_id: 'jm', base_id: 'looker',
      solapa: 'resumen_metricas_dinamico', campo_logico: 'mail_enviados', operacion: 'ULTIMO',
      filtro: '', dimensiones: '', formato: 'miles',
      notas: N('columna "Enviados" del GLOBAL; el equipo publico 302.008 el 14-21/08') },
    { marcador: 'camp_or', familia: 'camp', informe_id: 'jm', base_id: 'looker',
      solapa: 'resumen_metricas_dinamico', campo_logico: 'mail_aperturas/mail_entregados',
      operacion: 'PCT', filtro: '', dimensiones: '', formato: 'porcentaje_sin_signo',
      notas: N('% OR = aperturas/ENTREGADOS, denominador MEDIDO contra el deck: la fila de ' +
        '77.963 da 62% sobre entregados y 61% sobre enviados, y el equipo publica 62. PCT sobre ' +
        'los agregados de la fila, no promedio de una tasa') },
    { marcador: 'camp_mail_clics', familia: 'camp', informe_id: 'jm', base_id: 'looker',
      solapa: 'resumen_metricas_dinamico', campo_logico: 'mail_clics', operacion: 'ULTIMO',
      filtro: '', dimensiones: '', formato: 'miles',
      notas: N('⚠ clics de MAIL (col Q), NO camp_clics que es digital (col J) y vive en L-045. ' +
        'El equipo publico 1.144 el 14-21/08, y camp_ctor = este/aperturas cierra en 1,11%') }
  ]);
}

/** Wrapper publico del alta de los tres del GLOBAL. ⚠ **ESCRIBE en `MARCADORES`.** */
function cablearAgregadosDelGlobal() {
  var r = cablearAgregadosDelGlobal_();
  if (!r.ok) { Logger.log('FALLO: ' + r.motivo); return r; }
  Logger.log('== L-047 · los tres agregados del GLOBAL ==');
  Logger.log('  agregadas (' + r.agregadas.length + '): ' + r.agregadas.join(', '));
  if (r.quitadas.length) {
    Logger.log('  ⚠ REEMPLAZADAS (' + r.quitadas.length + '):');
    r.quitadas.forEach(function (q) { Logger.log('     ' + q.marcador + ' — ' + q.motivo); });
  }
  Logger.log('  filas finales en MARCADORES: ' + r.filas_finales);
  Logger.log('');
  Logger.log('⭐ EL CONTROL PRINCIPAL NO ES EL NUMERO: es la identidad interna de la fila.');
  Logger.log('   Sobre el deck que salga, sin mirar nada mas:');
  Logger.log('     % OR   = Aperturas / Entregados');
  Logger.log('     % CTOR = Clics(mail) / Aperturas');
  Logger.log('   Si alguna de las dos no cierra, el problema esta en esta fila y no en la fuente.');
  Logger.log('⚠ Y el segundo control, cuando las cinco filas de envio publiquen: el GLOBAL tiene');
  Logger.log('   que ser la SUMA de ellas en enviados, entregados, aperturas y clics. Ojo que');
  Logger.log('   cruza fuentes -GLOBAL lee looker, los envios digital-, asi que si no cierra el');
  Logger.log('   hallazgo es que las dos fuentes divergen, no necesariamente un bug del motor.');
  Logger.log('⚠ La traza tiene que decir `rama por cuenta`, NO `agregado global`.');
  return r;
}

/** Revierte el alta de los tres. ⚠ **ESCRIBE en `MARCADORES`.** */
function revertirAgregadosDelGlobal() {
  var r = curarMarcadores_(['camp_enviados', 'camp_or', 'camp_mail_clics'], []);
  if (!r.ok) { Logger.log('FALLO: ' + r.motivo); return r; }
  Logger.log('== reversion: ' + r.quitadas.length + ' fila(s) quitada(s) ==');
  r.quitadas.forEach(function (q) { Logger.log('   ' + q.marcador + ' (' + q.informe_id + ')'); });
  Logger.log('  filas finales: ' + r.filas_finales);
  return r;
}


/**
 * **`frecuencia` y `gcba_frecuencia` pasan a `numero_revisar`** — decisión del usuario, 19/08/2026.
 *
 * **Dos celdas de `formato` en `MARCADORES`, sin `clasp push`**: el sufijo ya vive en el formateador
 * desde la Parte C del `2026-08-19_1`. **Ése es exactamente el punto de que sea un formato y no un
 * estado** (`D-01`): el día que se explique el movimiento, sacar la marca es editar la celda.
 *
 * **El motivo, que es lo que la marca comunica:** el denominador de `frecuencia` —el **alcance**,
 * col K— pasó de **475.723** (17/08 22:21) a **745.632** (19/08), **+56,7 % en dos días sobre una
 * ventana cerrada de julio**, mientras el numerador subía 15,2 %. **No hay explicación medida.**
 *
 * ⚠ **Publicar entre guiones dice eso sin dejar de publicar**, que es la diferencia con `«FALTA:»`:
 * el número **se calcula bien**; lo que no está cerrado es **de qué universo sale**. Un token en
 * blanco afirmaría que no se pudo calcular, y sería falso.
 *
 * **Por qué las DOS y no sólo `frecuencia`**, aunque el salto grande sea el de `jm`: son la misma
 * medida sobre la misma columna y el par se lee junto. Marcar una sola haría creer que la otra está
 * verificada, cuando lo único medido es que **se movió menos** (+0,36 %). **«Se movió poco» no es
 * «se explicó».**
 *
 * ⚠ **Las `notas` se AGREGAN, no se reemplazan, y por eso esta función lee antes de escribir.**
 * `curarCamposMarcadores_` reescribe la celda con lo que se le pase: mandarle el motivo pelado
 * **borraría la historia de esas dos filas** —`SIN VALIDAR - demo 12/08`, el re-apuntado del
 * `_27 2.1`, el porqué de no llevar `estado=Activa`—, que es una decisión que alguien tomó y que no
 * está en ningún otro lado (`CLAUDE.md` §4: no pisar lo que ya está).
 *
 * **Idempotente por marca de texto**: si la nota ya trae el sello, no se vuelve a agregar. Sin eso,
 * dos corridas dejarían el motivo duplicado en la celda.
 */
var SELLO_REVISAR_FRECUENCIA_ = '`_revisar` (19/08/2026)';

function marcarFrecuenciaComoRevisar_() {
  var MOTIVO = SELLO_REVISAR_FRECUENCIA_ + ': el denominador (alcance, col K) pasó de 475.723 el ' +
    '17/08 a 745.632 el 19/08 — +56,7% en dos días sobre una ventana CERRADA de julio, sin ' +
    'explicación medida. El número se calcula bien; lo que no está cerrado es de qué universo ' +
    'sale. Se saca el sufijo editando esta celda cuando se explique (D-01, sin clasp push).';

  var EL_PAR = ['frecuencia', 'gcba_frecuencia'];
  var actuales = {};
  leerMarcadores_().forEach(function (m) {
    if (EL_PAR.indexOf(m.marcador) !== -1 && String(m.informe_id).trim() === 'jm') {
      actuales[m.marcador] = String(m.notas || '');
    }
  });

  var faltan = EL_PAR.filter(function (n) { return !(n in actuales); });
  if (faltan.length) {
    return { ok: false, motivo: 'No están en MARCADORES (informe jm): ' + faltan.join(', ') };
  }

  var cambios = EL_PAR.map(function (n) {
    var previa = actuales[n];
    var nueva = previa.indexOf(SELLO_REVISAR_FRECUENCIA_) !== -1
      ? previa                                   // ya sellada: no se duplica
      : (previa ? previa + ' · ' : '') + MOTIVO;
    return { marcador: n, informe_id: 'jm', formato: 'numero_revisar', notas: nueva };
  });
  return curarCamposMarcadores_(cambios);
}

/** Wrapper público. ⚠ **ESCRIBE en `MARCADORES`: `formato` y `notas` de dos filas.** */
function marcarFrecuenciaComoRevisar() {
  var r = marcarFrecuenciaComoRevisar_();
  if (!r.ok) { Logger.log('FALLÓ: ' + r.motivo); return r; }
  Logger.log('== frecuencia y gcba_frecuencia -> numero_revisar: ' + r.cambios_escritos + ' celda(s) ==');
  r.aplicados.forEach(function (a) {
    Logger.log('  ' + a.marcador + ' · ' + a.campo + ': "' + String(a.anterior).slice(0, 60) +
      '" -> "' + String(a.nuevo).slice(0, 60) + '"');
  });
  Logger.log('Los dos publican ahora entre guiones: -10.45- en vez de 10.45.');
  Logger.log('⚠ El separador decimal es PUNTO, no coma: `numero` usa String(Math.round(n*100)/100),');
  Logger.log('  sin toLocaleString, mientras `miles` sí usa es-AR. El deck publica 8,4 con coma.');
  Logger.log('  Es PREEXISTENTE -ya está en las notas de los cinco ecv_insc_*_pct- y NO se arregla acá.');
  return r;
}

/** Revierte las dos a `numero`. ⚠ **ESCRIBE en `MARCADORES`.** Deja la nota: es historia. */
function revertirMarcaDeFrecuencia() {
  var r = curarCamposMarcadores_([
    { marcador: 'frecuencia', informe_id: 'jm', formato: 'numero' },
    { marcador: 'gcba_frecuencia', informe_id: 'jm', formato: 'numero' }
  ]);
  if (!r.ok) { Logger.log('FALLÓ: ' + r.motivo); return r; }
  Logger.log('== reversión del formato: ' + r.cambios_escritos + ' celda(s) ==');
  r.aplicados.forEach(function (a) {
    Logger.log('  ' + a.marcador + ' · ' + a.campo + ': "' + a.anterior + '" -> "' + a.nuevo + '"');
  });
  Logger.log('⚠ La nota NO se borra: dice por qué estuvo marcado, y eso sigue siendo cierto.');
  return r;
}


/* ══════════ `2026-08-22` — «N envíos» cuenta ENVÍOS, no piezas ══════════
 *
 * ⭐ **La definición la contestó el fixture, no una decisión.** Medido el 22/08 sobre
 * `docs/_fixtures/Seguimiento Digital  2026-08-20.zip` (`sha256 f8ef3227…`), ventana 14–20/08,
 * con la lista blanca de `D-21` (`mail_estado ∈ {Implementado, En curso}`) y el corte de `R-15`
 * (`mail_remitente = jorge.macri@…` para `jm`):
 *
 * ```
 * digital/Directa Mail · ambito=jm    →  6 filas · 541.002 enviados · 538.291 entregados
 * digital/Directa SMS  · sin ámbito   →  3 filas
 * ```
 *
 * **El deck del equipo publica «6 envíos de Mail» y «3 envíos de SMS».** Los tres casilleros
 * cuentan **filas de la solapa**, no la suma de la columna `Enviados`.
 *
 * ⛔ **Lo que publicaba el motor era correcto para otra pregunta**, que es el peor caso: `541.002`
 * es de verdad la cantidad de mails enviados, y al lado del rótulo «6 envíos» del equipo se lee
 * como un error de seis órdenes de magnitud. La aritmética cerraba, nada fallaba, y el rótulo
 * mentía.
 *
 * ⭐ **Y el molde ya estaba en la misma hoja: `m2_envios`.** Está cableado
 * `CONTEO` sobre `mail_id_cuenta` desde antes, y publica 33 contra los 24 del equipo — el mismo
 * orden. **No se inventa una forma: se calca la que ya funciona.**
 *
 * ⚠ **`CONTEO` cuenta FILAS, no valores no vacíos** — `opCONTEO` devuelve `valores.length` y
 * `valoresDeCtx_` mapea 1:1 sin filtrar. Por eso el `campo_logico` pasa a ser la columna de la
 * clave (`*_id_cuenta`) y no la de volumen: da lo mismo para el número, y **dice lo que cuenta**.
 *
 * ⚠ **Lo que este cambio NO cierra:** `gcba_sms_entregados`. El equipo publica 3.614 y el fixture
 * da **0** — las tres filas de la ventana todavía no tenían los volúmenes cargados el 20/08.
 * **Es un límite del fixture, no un defecto del motor**, y se mide con un export más fresco.
 */
function cablearEnviosComoConteo() {
  var r = curarCamposMarcadores_([
    { marcador: 'mail_envios',      informe_id: 'jm', operacion: 'CONTEO', campo_logico: 'mail_id_cuenta' },
    { marcador: 'gcba_mail_envios', informe_id: 'jm', operacion: 'CONTEO', campo_logico: 'mail_id_cuenta' },
    { marcador: 'gcba_sms_envios',  informe_id: 'jm', operacion: 'CONTEO', campo_logico: 'sms_id_cuenta' }
  ]);

  if (!r.ok) { Logger.log('⛔ FALLÓ: ' + r.motivo); return r; }

  /* ⚠ **Cero celdas escritas NO es éxito.** `curarCamposMarcadores_` falla con diagnóstico cuando
   * no encuentra la fila, pero «ya estaba» también da cero — y son dos cosas distintas. Se dicen
   * distinto: una corrida que no hizo nada tiene que decirlo (`CLAUDE.md` §4). */
  if (!r.cambios_escritos) {
    Logger.log('ⓘ Cero celdas escritas: los tres ya estaban en CONTEO. No se tocó nada.');
    return r;
  }

  Logger.log('== «N envíos» pasa a CONTEO: ' + r.cambios_escritos + ' celda(s) ==');
  r.aplicados.forEach(function (a) {
    Logger.log('  ' + a.marcador + ' · ' + a.campo + ': "' + a.anterior + '" → "' + a.nuevo + '"');
  });
  Logger.log('');
  Logger.log('Esperado en la próxima corrida de `jm` sobre agosto_14_20, contra el deck del equipo:');
  Logger.log('   «N envíos de Mail» JM   →  6   (publicaba 541.002)');
  Logger.log('   «N envíos de Mail» GCBA →  73  (publicaba 2.361.163) · el fixture del 20/08 da 61,');
  Logger.log('                                   que es la base sin terminar de cargar, no un error');
  Logger.log('   «N envíos de SMS»  GCBA →  3   (publicaba 29.979)');
  Logger.log('');
  Logger.log('⚠ Los ENTREGADOS no se tocan: mail_entregados de JM ya reproduce EXACTO (538.291).');
  return r;
}


/* ══════════ `2026-08-22` — Programmatic pasa a `_revisar` ══════════
 *
 * ⭐ **Desconfianza declarada por una persona, que es exactamente para lo que el sufijo existe**
 * (`2026-08-19_1` Parte C). El número sigue publicándose —envuelto en guiones— porque **no es
 * basura: es el acumulado**, y para esa pregunta está bien.
 *
 * **Lo medido el 22/08 contra `Seguimiento Digital  2026-08-20.zip` (`sha256 f8ef3227…`):**
 * `looker/DIGITAL` **actualiza la fila, no agrega filas** —dato del usuario, verificado: una sola
 * fila por (cuenta, plataforma) para las dos campañas del temario—, así que su columna
 * `Impresiones` es el **acumulado desde que la campaña arrancó**.
 *
 * ⭐⭐ **El número que lo prueba es una resta.** El equipo publica `Programmatic 3.415.037` en el
 * Resumen JM y `3.035.525` en su lámina del narco, o sea que le atribuye **379.512** a Autódromo —
 * cuya fila de DV360 dice **3.756.321**. **Factor 9,9.** Y Google, que casi no acumuló antes,
 * cierra a **1,05×**. Autódromo arrancó el 6/08, **ocho días antes** de la ventana.
 *
 * ⭐ **La contraprueba:** el narco arrancó el 10/08 —cuatro días antes— y su lámina reproduce
 * plataforma por plataforma, dentro del ±10 %. **A menos acumulado previo, mejor cierra.**
 *
 * ⛔ **Por qué esto NO se arregla cableando:** el dato semanal **no existe en la base**.
 * `looker/DIGITAL` no tiene columna temporal propia y `CAMPAÑAS_DESGLOCE_DIGITAL` —que es más
 * fino— tiene grano **MES**. El recorte por ventana elige **qué filas** entran; **no puede recortar
 * lo que hay adentro de una fila**. Ninguna operación ni ningún filtro cambia eso.
 *
 * ⚠ **Y por eso se marca en vez de apagarse.** `/////` diría *"nadie lo cableó"*, que es falso;
 * `-` diría *"no hay dato"*, que también. `-24.783.992-` dice **"hay un número y no confíes"**, que
 * es la verdad, y deja el valor a la vista para el día que se decida el rótulo.
 *
 * ⚠ **Sólo Programmatic, por pedido del usuario.** `imp_total`, `imp_meta` e `imp_google` tienen
 * **la misma causa** —y `imp_total` además **incluye** a Programmatic, así que arrastra el error
 * entero: 28.988.260 contra 6.487.855—. Que no se marquen es una decisión pendiente, no un
 * descuido: está escrita en `PENDIENTES_consistencia.md`.
 *
 * **La nota de `MARCADORES` no se toca**: dice por qué el marcador está cableado como está
 * (`R-24` por resta, `R-25` la ventana) y **eso sigue siendo cierto**. El motivo de la marca vive
 * en `PENDIENTES`, que es donde se puede escribir largo.
 *
 * ⭐ **AMPLIADO a los ocho `imp_*` el mismo día** (decisión del usuario tras ver el listado de las
 * 41 filas). El primer alcance eran los dos `*_prog`; se extendió al resto **porque la causa es una
 * sola y el listado la puso a la vista**: la cuenta `2976-MAYPCCVC` —*"Campañas genéricas RDV JM"*,
 * ventana `04/06 → 31/12`— aporta **15,4 M de los 25,6 M** de Programmatic en cuatro filas de
 * DV360. **Una campaña genérica de siete meses solapa cualquier semana del año**, y entra en Meta y
 * en Google por el mismo camino. `imp_total` además **los suma a los tres**.
 *
 * ⚠ **Marcar sólo Programmatic habría dicho que los otros tres están bien**, y el listado muestra
 * que no: es el mismo acumulado repartido en tres columnas. Un marcado parcial sobre una causa
 * común es peor que ninguno — **declara confianza donde no la hay**. */
function marcarProgrammaticARevisar() {
  var r = curarCamposMarcadores_([
    { marcador: 'imp_meta',        informe_id: 'jm', formato: 'miles_revisar' },
    { marcador: 'imp_google',      informe_id: 'jm', formato: 'miles_revisar' },
    { marcador: 'imp_prog',        informe_id: 'jm', formato: 'miles_revisar' },
    { marcador: 'imp_total',       informe_id: 'jm', formato: 'miles_revisar' },
    { marcador: 'gcba_imp_meta',   informe_id: 'jm', formato: 'miles_revisar' },
    { marcador: 'gcba_imp_google', informe_id: 'jm', formato: 'miles_revisar' },
    { marcador: 'gcba_imp_prog',   informe_id: 'jm', formato: 'miles_revisar' },
    { marcador: 'gcba_imp_total',  informe_id: 'jm', formato: 'miles_revisar' }
  ]);
  if (!r.ok) { Logger.log('⛔ FALLÓ: ' + r.motivo); return r; }
  if (!r.cambios_escritos) {
    Logger.log('ⓘ Cero celdas escritas: los ocho ya estaban en `miles_revisar`. No se tocó nada.');
    return r;
  }
  Logger.log('== impresiones a revisar: ' + r.cambios_escritos + ' celda(s) ==');
  r.aplicados.forEach(function (a) {
    Logger.log('  ' + a.marcador + ' · ' + a.campo + ': "' + a.anterior + '" → "' + a.nuevo + '"');
  });
  Logger.log('');
  Logger.log('Los ocho publican ahora entre guiones: -24.783.992- en vez de 24.783.992.');
  Logger.log('El motivo está en docs/PENDIENTES_consistencia.md — «looker/DIGITAL guarda el');
  Logger.log('acumulado de la campaña, no lo de la semana». La marca se saca con');
  Logger.log('`revertirMarcaDeProgrammatic()` el día que se decida el rótulo o llegue el dato.');
  return r;
}

/**
 * Saca la marca. ⚠ **ESCRIBE en `MARCADORES`.**
 *
 * ⭐ **Existe desde el mismo commit que la pone, y eso no es simetría decorativa:** `CLAUDE.md` §4
 * dice que *"una marca que hay que sacar a mano es deuda, y de la peor clase: nadie la saca"*. Con
 * el botón, sacarla cuesta lo mismo que ponerla.
 */
function revertirMarcaDeProgrammatic() {
  var r = curarCamposMarcadores_([
    { marcador: 'imp_meta',        informe_id: 'jm', formato: 'miles' },
    { marcador: 'imp_google',      informe_id: 'jm', formato: 'miles' },
    { marcador: 'imp_prog',        informe_id: 'jm', formato: 'miles' },
    { marcador: 'imp_total',       informe_id: 'jm', formato: 'miles' },
    { marcador: 'gcba_imp_meta',   informe_id: 'jm', formato: 'miles' },
    { marcador: 'gcba_imp_google', informe_id: 'jm', formato: 'miles' },
    { marcador: 'gcba_imp_prog',   informe_id: 'jm', formato: 'miles' },
    { marcador: 'gcba_imp_total',  informe_id: 'jm', formato: 'miles' }
  ]);
  if (!r.ok) { Logger.log('⛔ FALLÓ: ' + r.motivo); return r; }
  if (!r.cambios_escritos) { Logger.log('ⓘ Cero celdas: ya estaban en `miles`.'); return r; }
  Logger.log('== marca retirada: ' + r.cambios_escritos + ' celda(s) ==');
  r.aplicados.forEach(function (a) {
    Logger.log('  ' + a.marcador + ' · ' + a.campo + ': "' + a.anterior + '" → "' + a.nuevo + '"');
  });
  Logger.log('⚠ La entrada de PENDIENTES NO se borra: dice por qué estuvo marcado y por qué dejó');
  Logger.log('  de estarlo. Si se retira sin que el dato haya cambiado, eso hay que escribirlo.');
  return r;
}

/* ══════════ `2026-08-20_7` — cerrar para generar (20/08/2026) ══════════
 *
 * Dos migraciones que se corren **en este orden y no en el otro**, y el motivo es del escritor:
 * `curarCamposMarcadores_` indexa por **`marcador || informe_id`**. Si las `*` entran primero, la
 * segunda migración busca `camp_alcance||jm` y ya no existe — reportaría `sin_fila` en 25 de 32 y
 * **fallaría el lote entero** por la guarda de todo-o-nada. Así que **primero el formato, después
 * el ámbito.**
 *
 * `verificarCierreParaGenerar()` las corre en ese orden y frena si la primera falla.
 */

/**
 * `2026-08-20_7` Parte B — **la desconfianza declarada.**
 *
 * ⭐ **Decisión del usuario, 20/08/2026: un número que existe y no está validado se publica ENTRE
 * GUIONES. No se retiene.** Un número entre guiones **ya no es plausible**: se declara sospechoso
 * en la cara del deck, que es lo contrario del modo de falla que este proyecto persigue.
 *
 * **La diferencia con lo que sí se detiene, escrita para que no se confunda después:**
 * *desconfiar de un número* no es lo mismo que *inventar uno*. `m2_campanias` no entra acá porque
 * **no hay número del que desconfiar** — no hay columna que lo produzca (`PENDIENTES`, 20/08).
 *
 * **Qué hace:** a todo marcador con `SIN VALIDAR` en `notas` le compone el sufijo `_revisar` sobre
 * su formato actual. El formateador ya es recursivo sobre el base y **no se toca**.
 *
 * ⚠ **Tres cosas medidas el 20/08 sobre la hoja viva, que son las que hacen que esto no rompa:**
 *
 *  1. **Son 32 con `SIN VALIDAR`, y 3 YA llevan `_revisar`** —`frecuencia`, `gcba_frecuencia`,
 *     `camp_frecuencia`—. Esos tres **son parte de los 32**, no un grupo aparte. Se saltean acá y
 *     `curarCamposMarcadores_` los saltearía igual —no escribe si el valor no cambia—, pero se
 *     filtran antes para que el conteo del reporte diga la verdad. **Idempotencia, no doble
 *     sufijo.**
 *  2. ⚠ **`enc_evento` tiene el `formato` VACÍO, y ahí el sufijo solo NO funciona.** La guarda de
 *     `formatearValorMarcador_` es `f.length > 8`, así que `'_revisar'` pelado **no entra a la
 *     rama** y el valor sale crudo, sin guiones — verificado corriendo el formateador real. Se le
 *     pone **`texto_revisar`**, que preserva exactamente el comportamiento anterior (un `formato`
 *     vacío ya hacía `String(valor)`, igual que `texto`) y además envuelve. **Es la única fila del
 *     lote en esta situación.**
 *  3. **Los cuatro formatos base en uso soportan el sufijo**, verificado uno por uno:
 *     `miles`→`-1.235-`, `numero`→`-1234.57-`, `porcentaje_sin_signo`→`-1234.6-`,
 *     `fraccion`→`-123456.8-`, y `texto`→`-hola-`.
 *
 * **La condición de salida, y va escrita para que `_revisar` no se vuelva permanente por olvido:**
 * el sufijo se retira **cuando un caso `V-` valide la fila**, y no antes. Sacarlo es editar una
 * celda de `MARCADORES` — sin `clasp push` (`D-01`).
 */
function aplicarRevisarASinValidar() {
  var hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('MARCADORES');
  if (!hoja) { Logger.log('FALLÓ: no existe la hoja MARCADORES.'); return { ok: false }; }

  var datos = hoja.getDataRange().getValues();
  var h = datos[0];
  var iM = h.indexOf('marcador'), iI = h.indexOf('informe_id'),
      iF = h.indexOf('formato'), iN = h.indexOf('notas');
  if (iM === -1 || iF === -1 || iN === -1) {
    Logger.log('FALLÓ: MARCADORES no tiene marcador/formato/notas.');
    return { ok: false };
  }

  var cambios = [], yaEstaban = [], vacios = [];
  for (var f = 1; f < datos.length; f++) {
    var nombre = String(datos[f][iM] || '').trim();
    if (!nombre) continue;
    if (String(datos[f][iN] || '').indexOf('SIN VALIDAR') === -1) continue;

    var base = String(datos[f][iF] || '').trim();
    if (base.length > 8 && base.slice(-8) === '_revisar') { yaEstaban.push(nombre); continue; }

    // El formato vacío no admite el sufijo solo (guarda `f.length > 8`): se le da la base que ya
    // tenía de hecho. Un `formato` vacío hace `String(valor)`, que es exactamente `texto`.
    if (base === '') { base = 'texto'; vacios.push(nombre); }

    cambios.push({
      marcador: nombre,
      informe_id: String(datos[f][iI] || '').trim(),
      formato: base + '_revisar'
    });
  }

  Logger.log('== Parte B · desconfianza declarada ==');
  Logger.log('  con SIN VALIDAR y sufijo por poner : ' + cambios.length);
  Logger.log('  ya lo llevaban (idempotencia)      : ' + yaEstaban.length +
    (yaEstaban.length ? ' → ' + yaEstaban.join(', ') : ''));
  if (vacios.length) {
    Logger.log('  ⚠ con `formato` vacío, se les puso `texto_revisar`: ' + vacios.join(', '));
  }

  var r = curarCamposMarcadores_(cambios);
  if (!r.ok) { Logger.log('  ❌ ' + r.motivo); return r; }
  Logger.log('  ✅ ' + r.cambios_escritos + ' celda(s) escritas.');
  return r;
}

/**
 * `2026-08-20_7` Parte A — **las 49 `*`: SECCO deja de estar vacío.**
 *
 * `MARCADORES` tiene 87 filas y **las 87 dicen `jm`**, así que el deck de `secco` sale entero en
 * hueco. El mecanismo para compartir ya existe y **nunca se usó**: `resolverMarcadores` filtra con
 * `suyo === informeId || suyo === '*'`.
 *
 * **El criterio es el de siempre y no cambió: el token existe en las dos plantillas Y mide el
 * mismo hecho.** Estar en la lista prueba lo primero —cruce de los dos censos autoritativos del
 * 20/08— y **lo segundo se miró, no se supuso**:
 *
 * ⭐ **El chequeo que importa es la SECCIÓN, no la lámina**, porque es la sección la que decide qué
 * hecho mide un token. `SECCIONES.familia_tokens` declara el dueño de cada familia, y las tres
 * familias de esta lista dicen **`JM,SECCO` las dos**:
 *
 *   - `enc_`   → `encuentro` (JM,SECCO) y `encuentro_iceberg` (JM,SECCO)
 *   - `camp_`  → `campana` (JM,SECCO)
 *   - `m2_`    → `m2` (JM,SECCO) y `m2_status` (JM,SECCO)
 *   - `ecv_`   → **ninguna sección declara el prefijo**; `ecv_alcance_semanal` (JM,SECCO) nombra
 *     cinco tokens puntuales y el resto se resuelve en la pasada de tokens fijos. Tampoco divergen.
 *
 * ⚠ **El caso que había que buscar activamente no aparece en esta lista, y conviene decirlo con
 * el nombre puesto:** `rrss_` sí cae en secciones distintas —Resumen Ejecutivo en `jm`,
 * Interacción positiva en RRSS en `secco`— y es el modo de falla que rompió `enc_audiencia` con un
 * renombre global. **Ninguno de los 49 es `rrss_`**: los `rrss_*` están sin fila en las dos
 * plantillas, así que no son candidatos a `*` sino trabajo de cableado. El riesgo no se
 * materializa, y no porque se lo haya evitado sino porque no está.
 *
 * ⚠ **Una asimetría que sí existe y no bloquea:** `m2_caudal` declara `m2_` y es **sólo de SECCO**.
 * No cambia lo que un `m2_*` mide — agrega una lámina donde pueden aparecer. Se anota.
 *
 * ⚠ **Y la limitación honesta, que va en `notas` de cada fila:** estos 49 están validados **para
 * `jm` y no para `secco`**. Otra ventana, otro corte. El sello es de texto para no duplicarse
 * entre corridas.
 */
var SELLO_VALIDACION_ = 'Validación es de jm; para secco sin validar (2026-08-20_7).';

/**
 * Los tokens que hay hoy en la plantilla de un informe. **Se leen de la plantilla, no de una lista
 * escrita acá**, y eso es deliberado: una lista de 167 nombres copiada del censo del 20/08 sería
 * una cuarta lista duplicada que nadie actualiza, y el repo ya sabe cómo termina eso. La plantilla
 * es del equipo y se mueve — de hecho **se movió hoy**, entre las 12:06 y las 13:02, cuando las
 * láminas 19 y 20 de `jm` pasaron de 9 y 14 tokens a 31 y 50.
 *
 * Reusa `tokensPorSlide_` (`Armonizar.gs`), que **sí** baja a tablas y a grupos — `getShapes()` no
 * ve 33 tokens de JM, medido el 03/08.
 */
function tokensDePlantilla_(informeId) {
  var informe = leerInformes()[informeId];
  if (!informe || !informe.plantilla_id) return null;
  var mapa = tokensPorSlide_(SlidesApp.openById(informe.plantilla_id));
  return Object.keys(mapa);
}

function aplicarAsteriscoCompartidos() {
  var hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('MARCADORES');
  if (!hoja) { Logger.log('FALLÓ: no existe la hoja MARCADORES.'); return { ok: false }; }

  var deSecco = tokensDePlantilla_('secco');
  if (!deSecco) {
    Logger.log('FALLÓ: el informe `secco` no tiene `plantilla_id`.');
    return { ok: false, motivo: 'sin plantilla_id' };
  }
  var enSecco = {};
  deSecco.forEach(function (t) { enSecco[t] = true; });
  Logger.log('  tokens leídos de la plantilla de secco: ' + deSecco.length);

  var datos = hoja.getDataRange().getValues();
  var h = datos[0];
  var iM = h.indexOf('marcador'), iI = h.indexOf('informe_id'), iN = h.indexOf('notas');
  if (iM === -1 || iI === -1) {
    Logger.log('FALLÓ: MARCADORES no tiene marcador/informe_id.');
    return { ok: false };
  }

  var cambios = [], yaEstaban = [], soloJm = [];
  for (var f = 1; f < datos.length; f++) {
    var nombre = String(datos[f][iM] || '').trim();
    if (!nombre) continue;
    var suyo = String(datos[f][iI] || '').trim();
    if (suyo === '*') { yaEstaban.push(nombre); continue; }
    if (!enSecco[nombre]) { soloJm.push(nombre); continue; }

    var notas = iN === -1 ? '' : String(datos[f][iN] || '');
    cambios.push({
      fila: f,
      marcador: nombre,
      notas: notas.indexOf(SELLO_VALIDACION_) !== -1 ? notas
        : (notas ? notas + ' · ' : '') + SELLO_VALIDACION_
    });
  }

  Logger.log('== Parte A · las `*` compartidas ==');
  Logger.log('  candidatos a `*`      : ' + cambios.length);
  Logger.log('  ya estaban en `*`     : ' + yaEstaban.length);
  Logger.log('  se quedan en `jm`     : ' + soloJm.length + ' (no están en la plantilla de secco)');

  if (!cambios.length) {
    Logger.log('  ❌ NADA QUE APLICAR. O ya se corrió, o `TOKENS_DE_SECCO_` no coincide con la hoja.');
    return { ok: false, motivo: 'cero cambios' };
  }

  // Todo o nada, igual que `curarCamposMarcadores_`: se validan las filas antes de escribir.
  cambios.forEach(function (c) {
    hoja.getRange(c.fila + 1, iI + 1).setValue('*');
    if (iN !== -1) hoja.getRange(c.fila + 1, iN + 1).setValue(c.notas);
  });

  Logger.log('  ✅ ' + cambios.length + ' marcador(es) pasaron a `*`.');
  Logger.log('  ⚠ Su validación es de `jm`. Para `secco` es otra ventana y otro corte.');
  return { ok: true, aplicados: cambios.length, se_quedan: soloJm.length };
}

/**
 * El botón. Corre las dos **en el orden que corresponde** y **frena si la primera falla**, que es
 * la mitad del valor de un wrapper: sobre un formato a medio aplicar, el resultado de la otra no
 * significa nada.
 */
function verificarCierreParaGenerar() {
  var b = aplicarRevisarASinValidar();
  if (!b || b.ok === false) {
    Logger.log('');
    Logger.log('⛔ La Parte B no cerró. NO se corre la Parte A: el escritor indexa por');
    Logger.log('   `marcador||informe_id`, así que mover el ámbito ahora dejaría el formato a medio.');
    return b;
  }
  Logger.log('');
  return aplicarAsteriscoCompartidos();
}

/**
 * ⭐ **`2026-08-21_13` — el alta de los `u1_*` del "1 a 1".**
 *
 * ⚠ **ESCRIBE en `MARCADORES`.** Va por `curarMarcadores_`, que es la puerta declarada: **no hay
 * `SEED_MARCADORES_` y no lo va a haber** (`D-17`).
 *
 * **La fuente no se decide acá: está decidida desde el 14/08.**
 * `digital/CAMPAÑAS_DESGLOCE_DIGITAL`, `uso = fuente`, y `D-32` existe **porque el sembrador la
 * revirtió una vez**. El `2026-08-21_7` la mapeó — 18 filas — y los seis casos `V-21`…`V-26` la
 * validan con las claves `Id cuentas` + `Plataforma`.
 *
 * **Las cinco decisiones que hay adentro, porque ninguna es obvia:**
 *
 * **1 · `SUMA` y no `ULTIMO`, al revés que los `camp_*`.** Aquéllos leen una solapa que devuelve
 * **una fila por cuenta** y por eso eligen. Acá la lectura por cuenta devuelve **cinco filas**
 * —etapa × plataforma, medido sobre `3487-AGOJDGAG`— y el trabajo del marcador **es agregarlas**
 * dentro de su corte. Con `plataforma` y `etapa` declaradas, cada token ve **una** fila; `SUMA` es
 * lo correcto igual y **es lo que aguanta el día que haya dos**.
 *
 * ⚠ **Y el riesgo que `SUMA` trae, dicho porque está medido:** la solapa tiene **61 grupos de filas
 * duplicadas, 135 filas de más sobre 5.161** — misma cuenta, misma plataforma, mismo nombre, mismas
 * métricas, distinto `Id accion`. `SUMA` **las cuenta dos veces**. `3487-AGOJDGAG` no tiene
 * duplicados, así que hoy no muerde; el día que una cuenta del temario los tenga, publica el doble
 * **sin fallar**. `des_id_accion` está mapeado justamente para eso, y **el motor todavía no lo usa**.
 *
 * **2 · El corte va en `dimensiones`, nunca en `filtro` ni en el nombre** (`D-33`, `CLAUDE.md` §2).
 * ⚠ **Los tokens se llaman `u1_pre_meta_impresiones`, con los dos cortes adentro del nombre** — es
 * el estilo anterior a `D-33`. **El nombre lo fija la plantilla y la plantilla es del equipo**
 * (`C-01`), así que no se renombra; lo que sí se hace bien es la definición. **Un nombre viejo con
 * una definición correcta es reversible; una definición con el corte en `filtro` es la deuda que la
 * migración de 42 marcadores vino a sacar.**
 *
 * **3 · `filtro` queda VACÍO, y también es una decisión.** Los `imp_*` de `looker` llevan
 * `estado=Activa`, y copiarlo acá habría sido el error: **en esta solapa los valores van en
 * MAYÚSCULA** —`FINALIZADA` 4338, `PAUSADA` 433, `ACTIVA` 229— así que `estado=Activa` **no
 * matchearía ninguna fila** (`R-10` preserva mayúsculas). Y aunque matcheara sería incorrecto: la
 * campaña de un encuentro pasado está `FINALIZADA`. **La restricción real es la cuenta**, y la
 * pone `SOLAPAS.campo_id_cuenta` (`D-30`), no un filtro.
 *
 * **4 · `_revisar` en TODOS, y se retira de a uno.** `D-34`: hay número y no está validado. Los
 * seis casos `V-` validan `Impresiones`, `Clics` y `Visualizaciones` de **dos** cuentas de julio;
 * ninguno valida un `ctr`, un `vtr`, ni la cuenta de esta semana. **Publicar entre guiones es
 * exactamente lo que corresponde** hasta que un caso `V-` los toque.
 *
 * **5 · `ctr` y `vtr` son `PCT` sobre los agregados, no promedio de tasas.** Mismo criterio que
 * `camp_ctor` y `enc_e75_pct`: se dividen los dos totales del corte, no se promedian porcentajes.
 *
 * ⛔ **Ocho tokens NO se cablean, y cada uno tiene su motivo escrito:**
 *
 * - los **seis `u1_bench_*`** — pregunta abierta desde antes (`CONFIG_INFORMES.md` §2.1) y **sin
 *   prioridad** por decisión del usuario. Medido el 21/08: **no salen de la cuenta del encuentro**
 *   —el CTR real de Meta en el PRE es 2,02 % contra un benchmark publicado de 2,1 %—, así que son
 *   referencias externas y **no hay de dónde leerlos**;
 * - **`u1_total_alcance`** — el deck publica 55.255 y las dos filas de `digital/Alcance` de esa
 *   cuenta dan 20.897 y 43.639: **la suma es 64.536, no 55.255**. El alcance son usuarios únicos y
 *   **no se suma** (`R-28`). No hay fuente para el total;
 * - **`u1_total_frecuencia`** — es `impresiones / alcance` y depende del anterior.
 *
 * ⚠ **`u1_pre_meta_alcance` y `u1_post_meta_alcance` sí se cablean**, y por una evidencia distinta:
 * `digital/Alcance` tiene **exactamente dos filas** para la cuenta —una por etapa— y `R-27` dice que
 * **el alcance lo aporta sólo Meta**. Van con `_revisar` como todos.
 */
function altaMarcadoresUnoAUno_() {
  var N = function (extra) {
    return '2026-08-21_13 — fuente digital/CAMPAÑAS_DESGLOCE_DIGITAL (D-32, decidida 14/08; ' +
      'mapeada por el _7). Clave: Id cuentas via SOLAPAS.campo_id_cuenta (D-30). ' +
      (extra ? extra + '. ' : '') + 'SIN VALIDAR';
  };
  var B = 'digital', S = 'CAMPAÑAS_DESGLOCE_DIGITAL';

  // Una fila por (medida × plataforma × etapa). El corte SIEMPRE en `dimensiones`.
  var fila = function (marcador, campo, op, formato, dims, extra) {
    return {
      marcador: marcador, familia: 'u1', informe_id: 'jm', base_id: B, solapa: S,
      campo_logico: campo, operacion: op, filtro: '', dimensiones: dims,
      formato: formato, notas: N(extra)
    };
  };

  var PLAT = [
    { tok: 'meta',   dim: 'plataforma=meta' },
    { tok: 'google', dim: 'plataforma=google' },
    { tok: 'prog',   dim: 'plataforma=programmatic' }
  ];

  var agregar = [];

  /* ── PRE · convocatoria ─────────────────────────────────────────────────────────────────
   * La lámina rotula el PRE como `CLICS (CTR)`: impresiones, clics y su tasa. */
  PLAT.forEach(function (p) {
    var d = 'etapa=pre && ' + p.dim;
    agregar.push(fila('u1_pre_' + p.tok + '_impresiones', 'des_impresiones', 'SUMA', 'miles_revisar', d));
    agregar.push(fila('u1_pre_' + p.tok + '_clics', 'des_clics', 'SUMA', 'miles_revisar', d));
    agregar.push(fila('u1_pre_' + p.tok + '_ctr', 'des_clics/des_impresiones', 'PCT',
      'porcentaje_sin_signo_revisar', d, 'PCT sobre los agregados del corte, no promedio de tasas'));
  });

  /* ── POST · difusión ────────────────────────────────────────────────────────────────────
   * La lámina rotula el POST como `VISUALIZACIONES (VTR)`. */
  PLAT.forEach(function (p) {
    var d = 'etapa=post && ' + p.dim;
    agregar.push(fila('u1_post_' + p.tok + '_impresiones', 'des_impresiones', 'SUMA', 'miles_revisar', d));
    agregar.push(fila('u1_post_' + p.tok + '_vistas', 'des_visualizaciones', 'SUMA', 'miles_revisar', d));
    agregar.push(fila('u1_post_' + p.tok + '_vtr', 'des_visualizaciones/des_impresiones', 'PCT',
      'porcentaje_sin_signo_revisar', d, 'PCT sobre los agregados del corte, no promedio de tasas'));
  });

  /* ── Los totales ── `R-28`: cada uno suma UNA etapa, y no las dos. ⭐ Cablearlos como "SUMA sobre
   * las tres plataformas" publicaría 1.879 contra 1.472 — un 28 % de más, plausible y equivocado. */
  agregar.push(fila('u1_total_impresiones', 'des_impresiones', 'SUMA', 'miles_revisar', '',
    'R-28: las DOS etapas, todas las plataformas'));
  agregar.push(fila('u1_total_clics', 'des_clics', 'SUMA', 'miles_revisar', 'etapa=pre',
    'R-28: SOLO el PRE — el POST tiene clics y NO se suman'));
  agregar.push(fila('u1_total_vistas', 'des_visualizaciones', 'SUMA', 'miles_revisar', 'etapa=post',
    'R-28: SOLO el POST — el PRE tiene 0 visualizaciones'));

  /* ── La fecha de fin ── el deck publica "Fecha de fin: 24/08" y la columna J lo trae. */
  agregar.push(fila('u1_fecha_fin', 'des_fecha_fin', 'ULTIMO', 'fecha_revisar', 'etapa=post',
    'la campaña que termina última es la del post'));

  /* ── El alcance por etapa ── ⚠ OTRA solapa y otra evidencia: `digital/Alcance` tiene DOS filas
   * para la cuenta, una por etapa, y `R-27` dice que el alcance lo aporta sólo Meta. */
  ['pre', 'post'].forEach(function (et) {
    agregar.push({
      marcador: 'u1_' + et + '_meta_alcance', familia: 'u1', informe_id: 'jm',
      base_id: 'digital', solapa: 'Alcance', campo_logico: 'alc_alcance', operacion: 'ULTIMO',
      filtro: '', dimensiones: '', formato: 'miles_revisar',
      notas: '2026-08-21_13 — digital/Alcance, misma vía que enc_alcance. ⚠ La solapa tiene DOS ' +
        'filas por cuenta (20.897 y 43.639 para 3487-AGOJDGAG) que son pre y post, y NO están ' +
        'separadas: falta mapear su columna de nombre de campaña. ULTIMO elige una y lo dice en la ' +
        'traza. R-27: el alcance lo aporta sólo Meta. SIN VALIDAR'
    });
  });

  Logger.log('Alta de ' + agregar.length + ' marcador(es) `u1_*`.');
  var r = curarMarcadores_([], agregar);
  Logger.log(JSON.stringify(r, null, 2));
  return r;
}

/** El botón: sin `_` y sin parámetros, las dos condiciones de `CLAUDE.md` §2. */
function altaMarcadoresUnoAUno() {
  return altaMarcadoresUnoAUno_();
}


/**
 * `2026-08-22` — **el alta de `ecv_fecha`, la fecha de la reunión.** Dato del usuario, verificado.
 *
 * ⚠ **ESCRIBE en `MARCADORES`**, por `curarMarcadores_`, que es la puerta declarada para agregar
 * filas enteras por decisión de una persona (`D-17`: **no hay `SEED_MARCADORES_` y no lo va a
 * haber**).
 *
 * ⭐ **Por qué es un botón propio y NO entra al seed — es la decisión de diseño de acá.** En la
 * misma cola está sembrar `CONFIG.tope_dias_ventana_cuenta = 90` (`R-30`), que **mueve los ocho
 * `imp_*`**. Si este cableado viajara en un `SEED_*`, las dos cosas llegarían al deck **con la
 * misma corrida de «Aplicar configuración»** y un número movido **no se podría atribuir a ninguna
 * de las dos**. *Dos cambios en el mismo deck no se pueden separar* (decisión del usuario, 22/08).
 * Con el botón aparte, **el orden lo elige la persona**.
 *
 * **De dónde sale cada campo, y ninguno es una elección nueva:**
 *
 * - **`campo_logico = fecha_periodo`** — es lo que `Marcadores.gs` **ya declara** para este token en
 *   `TOKENS_CORTE_VERTICAL_`, desde el corte vertical del `2.9E`. **No se inventa un mapeo: se usa
 *   el que ya estaba escrito** — col. E de `RVD JM-CM - ES`, que `MAPEO` describe como *"filtro de
 *   período"*.
 * - **`ULTIMO`** — la lectura por ítem devuelve **una fila** (`D-30`), así que hoy suma y último
 *   darían lo mismo. ⚠ **El desempate es qué pasa el día que haya dos:** `ULTIMO` **elige por fecha
 *   y lo dice en la traza**; una fecha **no se suma**. Mismo criterio que los nueve `camp_*` del
 *   `_19` Parte D.
 * - **`dimensiones = ambito=jm`** — igual que sus hermanos `ecv_*`. Por `D-33` el corte va en
 *   `dimensiones`, **nunca** en `filtro` ni en el nombre.
 * - **`formato = fecha`** — ⭐ **verificado contra `formatearValorMarcador_` (`Generador.gs`) antes
 *   de escribirlo**, no supuesto: la rama existe y devuelve `dd/MM/yyyy`. El primer intento decía
 *   `fecha_corta`, que **no existe** — habría publicado el valor crudo de la celda sin fallar.
 *
 * ⛔ **`ecv_barrio1`, `ecv_barrio2` y `ecv_barrio3` NO entran acá, y no es olvido:** necesitan una
 * operación que el motor **no tiene** — *"el N-ésimo valor distinto"*. Las ocho de `OPERACIONES_`
 * no la cubren: `LISTA` publica **todos juntos** (es exactamente lo que hace `ecv_barrios`) y
 * `CUENTA_DISTINTOS` cuenta. **Agregar la novena es una decisión de diseño con su propio motivo
 * escrito** (`CLAUDE.md` §2), no un cableado.
 */
function cablearEcvFecha() {
  var r = curarMarcadores_([], [{
    marcador: 'ecv_fecha', familia: 'ecv', informe_id: 'jm',
    base_id: 'rdv', solapa: 'RVD JM-CM - ES', campo_logico: 'fecha_periodo',
    operacion: 'ULTIMO', dimensiones: 'ambito=jm', formato: 'fecha',
    notas: 'la fecha de la reunion (dato del usuario, 22/08). campo_logico y columna salen de ' +
      'TOKENS_CORTE_VERTICAL_ en Marcadores.gs, donde ya estaban declarados desde el 2.9E'
  }]);

  if (!r.ok) { Logger.log('⛔ FALLÓ: ' + r.motivo); return r; }

  /* ⚠ El campo es `agregadas`, no `agregados`. El primer intento decía `agregados` y **no habría
   * fallado**: `undefined` → 0, y el reporte diría «0 filas agregadas» sobre un alta que sí ocurrió.
   * Es la familia del cero disfrazado de éxito, en la capa del log. */
  Logger.log('== ecv_fecha: ' + ((r.agregadas || []).length) + ' fila(s) agregada(s) · ' +
    r.filas_finales + ' filas en MARCADORES ==');
  if (!(r.agregadas || []).length) {
    Logger.log('ⓘ Cero altas: la fila ya existía. Es idempotencia, no rotura.');
  }
  Logger.log('');
  Logger.log('⭐ Va junto con `cablearEcvBarrios123()`, y el control es DE LOS CUATRO TOKENS:');
  Logger.log('   ecv_fecha + ecv_barrio1 + ecv_barrio2 + ecv_barrio3. No hace falta una corrida');
  Logger.log('   limpia por cada uno — los cuatro salían `/////`, así que NO MUEVEN NINGÚN NÚMERO');
  Logger.log('   EXISTENTE: llenan celdas vacías. La regla de «un cambio por deck» es para lo que');
  Logger.log('   mueve un número ya publicado, no para lo que llena un hueco (`CLAUDE.md` §4).');
  Logger.log('');
  Logger.log('⚠ Lo que SÍ no puede viajar en el mismo deck que esto: el tope de R-30, que mueve');
  Logger.log('   los ocho `imp_*`. Ahí un número movido no se podría atribuir.');
  return r;
}


/**
 * `2026-08-22` — **el alta de `ecv_barrio1`, `ecv_barrio2` y `ecv_barrio3`**, los tres primeros
 * consumidores de `ELEMENTO` (`R-32`, `X-33`). Primero de los tres cableados, **el de menos
 * riesgo** (orden del usuario, 22/08).
 *
 * ⚠ **ESCRIBE en `MARCADORES`**, por `curarMarcadores_` (`D-17`: no hay `SEED_MARCADORES_`).
 * **Botón propio, no seed**, por el mismo motivo que `cablearEcvFecha()`: así el orden de lo que
 * llega al deck lo elige la persona y **dos cambios no viajan en la misma corrida**.
 *
 * **Las cuatro columnas se COPIAN de `ecv_barrios`, no se eligen de nuevo**, y eso es lo que
 * garantiza *mismo universo* — la fila viva declara:
 *
 *   `base_id = rdv` · `solapa = RVD JM-CM - ES` · `campo_logico = barrio`
 *   `dimensiones = ambito=jm` · `catalogo = rdv/Comunas` · `filtro` y `formato` vacíos
 *
 * ⭐ **`catalogo = rdv/Comunas` es lo que hace que esto funcione**, y conviene decir por qué:
 * `ELEMENTO` lo exige igual que `LISTA` —comparten `conjuntoDeLista_`—, y esa solapa está
 * declarada `uso = referencia` con **68 barrios**. Sin catálogo las dos operaciones tiran, así que
 * copiarlo no es prolijidad: es el requisito.
 *
 * **`valor_fijo = 'N/3'` y no `'N'`**, a propósito: la forma con denominador es la que **habilita
 * el control de desborde**. Con tres cajas declaradas, cualquiera de los tres marcadores detecta
 * solo que el temario trajo un cuarto barrio, **sin saber nada de sus hermanos**, y para en vez de
 * decidir qué hacer con el que sobra.
 *
 * ⚠ **Lo esperado en la próxima corrida NO es que las tres cajas tengan valor.** Esta semana el
 * temario tiene **dos** encuentros y `ecv_barrios` publicó **Parque Avellaneda, Parque Patricios**:
 * la caja 3 tiene que salir con el **símbolo de sin dato**, y eso es el **caso normal** (`R-32`),
 * no un faltante que haya que cablear.
 *
 * ⛔ **Y lo que NO se puede exigir, que es `R-32` en su forma práctica:** que `ecv_barrio1` valga
 * *"Parque Avellaneda"* **en la corrida siguiente**. El orden sale del orden de las filas de `rdv`,
 * que es carga manual. **Lo exigible es el conjunto**, y eso ya lo mide `ecv_barrios`.
 */
function cablearEcvBarrios123() {
  var comun = {
    familia: 'ecv', informe_id: 'jm',
    base_id: 'rdv', solapa: 'RVD JM-CM - ES', campo_logico: 'barrio',
    operacion: 'ELEMENTO', dimensiones: 'ambito=jm', catalogo: 'rdv/Comunas',
    notas: 'ELEMENTO N de 3 sobre el mismo conjunto que ecv_barrios (R-32). Las columnas se ' +
      'copian de ecv_barrios: mismo universo, mismo orden. valor_fijo con denominador para ' +
      'habilitar el control de desborde. OJO R-32: publica una POSICION, no una cosa'
  };
  var filas = [1, 2, 3].map(function (n) {
    var o = {};
    Object.keys(comun).forEach(function (k) { o[k] = comun[k]; });
    o.marcador = 'ecv_barrio' + n;
    /* ⛔ ENTEROS PELADOS, los dos. La primera versión escribió `n + '/3'` y **Sheets lo guardó
     * como fecha** — los tres publicaron `---` (22/08). El total va en `separador`. */
    o.valor_fijo = n;
    o.separador = 3;
    return o;
  });

  var r = curarMarcadores_([], filas);
  if (!r.ok) { Logger.log('⛔ FALLÓ: ' + r.motivo); return r; }

  Logger.log('== ecv_barrio1-3: ' + ((r.agregadas || []).length) + ' fila(s) agregada(s) · ' +
    r.filas_finales + ' filas en MARCADORES ==');
  if (!(r.agregadas || []).length) {
    Logger.log('ⓘ Cero altas: las tres ya existían. Es idempotencia, no rotura.');
  }

  /* ⛔⛔ **SE VERIFICA LO QUE QUEDÓ EN LA CELDA, NO LO QUE SE PIDIÓ ESCRIBIR.** El 22/08 este mismo
   * botón reportó «3 filas agregadas» con una FECHA donde iba el índice, y el síntoma —tres
   * `---`— apareció una corrida después. **Un escritor que no relee es la mitad del bug.** */
  var malas = [];
  Object.keys(r.releido || {}).forEach(function (clave) {
    var fila = r.releido[clave];
    var vf = fila.valor_fijo;
    if (vf instanceof Date || Number(vf) < 1 || Math.floor(Number(vf)) !== Number(vf)) {
      malas.push(clave + ' · valor_fijo quedó ' + JSON.stringify(String(vf)) +
        (vf instanceof Date ? '  ← SHEETS LO CONVIRTIÓ EN FECHA' : ''));
    }
  });
  /* ⛔⛔ **CERO VERIFICADO NO ES ÉXITO, ES «NO VERIFIQUÉ».** La primera versión imprimía
   * `✅ RELEÍDO: las 0 fila(s)…` sobre tres altas, porque el lector no matcheaba. **Un control que
   * se declara verde cuando no midió nada es la misma familia que el `⛔ FALLÓ` sobre ocho filas
   * correctas, con el signo cambiado** (`CLAUDE.md` §4). Por eso el conteo se compara contra
   * `pedidas`, **no contra sí mismo**. */
  var releidas = Object.keys(r.releido || {}).length;
  var pedidas = r.pedidas === undefined ? 3 : r.pedidas;
  Logger.log('');
  if (releidas !== pedidas) {
    Logger.log('⛔ NO SE PUDO VERIFICAR: se pidieron ' + pedidas + ' fila(s) y se releyeron ' +
      releidas + '. Cero verificado NO es éxito.');
    return { ok: false, motivo: 'relectura incompleta: ' + releidas + ' de ' + pedidas, resultado: r };
  }
  if (malas.length) {
    Logger.log('⛔ LA CELDA NO QUEDÓ COMO SE PIDIÓ — ' + malas.length + ' de ' + pedidas + ':');
    malas.forEach(function (m) { Logger.log('   ' + m); });
    Logger.log('   El índice tiene que ser un ENTERO PELADO. NO se corrige solo: se reporta.');
    return { ok: false, motivo: 'celdas mal escritas', malas: malas, resultado: r };
  }
  Logger.log('✅ RELEÍDO ' + releidas + ' de ' + pedidas + ': todas tienen un índice ENTERO en');
  Logger.log('   `valor_fijo`. La celda quedó como se pidió.');
  Logger.log('');
  /* ⛔ **CORREGIDO 22/08 con la traza de `diagBarriosIndexados()`:** el esperado decía *"los dos
   * barrios, Parque Avellaneda y Parque Patricios"* y **era falso**. `ecv_barrios` publica **UNA**
   * fila —**1 de 3 después del filtro `figura=Jorge Macri`**—, así que sólo hay **un** elemento y
   * **dos** cajas quedan sin dato. **El esperado salía de mirar el deck y no la traza.** */
  Logger.log('⚠ ESPERADO en la próxima corrida de `jm` sobre `agosto_14_20` — UN valor, no tres:');
  Logger.log('   ecv_barrio1 → «Parque Patricios». `ecv_barrios` publica UNA fila: 1 de 3 después');
  Logger.log('                 del filtro figura=Jorge Macri (medido en la traza, 22/08).');
  Logger.log('   ecv_barrio2 y ecv_barrio3 → SÍMBOLO DE SIN DATO. Un elemento, tres cajas: es el');
  Logger.log('                 CASO NORMAL de `R-32`, no un faltante que haya que cablear.');
  Logger.log('');
  Logger.log('⛔ Y lo que NO se puede exigir (R-32): que `ecv_barrio1` valga lo mismo la semana');
  Logger.log('   que viene. El orden sale del orden de las filas de `rdv`, que es carga manual —');
  Logger.log('   una fila que entre antes intercambia el 1 y el 2 sin que nada falle.');
  Logger.log('   Lo exigible es EL CONJUNTO, y eso ya lo mide `ecv_barrios`.');
  return r;
}


/**
 * `2026-08-22` — **la tanda de «los chicos»: los huecos que NO tocan esquema.**
 *
 * ⚠ **ESCRIBE en `MARCADORES`**, por `curarMarcadores_` (`D-17`). Botón propio, no seed.
 *
 * ⛔⛔ **DE LOS OCHO QUE SE PIDIERON, SÓLO ENTRAN TRES — y los cinco que quedan afuera no son
 * olvido.** Se midió uno por uno antes de escribir, y *«chico»* resultó no ser lo mismo que
 * *«sin bloqueo»*:
 *
 * | token | por qué no entra |
 * |---|---|
 * | `periodo` | ⛔ **No se cablea NUNCA: lo produce la generación.** `Generador.gs` lo dice con todas las letras — *"`{{periodo}}` lo produce la generación, no un marcador: sale del período que efectivamente se usó"*. Aparece en el censo como «sin fila» y **es correcto que no la tenga**. Es exactamente el falso faltante contra el que el propio censo advierte en su encabezado |
 * | `contenidos_total` · `gcba_contenidos_total` | ⛔ Es la **pregunta abierta al equipo**: los seis `pauta_*` son flags 0/1 y publican `1·1·1`. Cablearlo a algo plausible es lo que este proyecto persigue |
 * | `camp_dig_impl` | ⛔ **Bloqueado por `X-39`.** El equipo publica **4 implementaciones** y eso es el **CONTEO de filas de `looker/DIGITAL` para la cuenta** —cuatro plataformas—, que necesita `campo_id_cuenta` en esa solapa |
 * | `camp_dir_impl` | ⛔ **Mismo bloqueo, otra solapa.** El equipo publica **3**, que es el conteo de envíos de `digital/Directa Mail` para la cuenta, y esa solapa **también** tiene `campo_id_cuenta` vacío |
 *
 * ⭐ **Los tres que sí entran, con de dónde sale cada uno:**
 *
 * - **`camp_desde` y `camp_hasta`** — `looker/resumen_metricas_dinamico`, columnas `C (fecha_inicio)`
 *   y `D (fecha_fin)`, **las dos ya mapeadas**. Esa solapa **ya tiene `campo_id_cuenta = id_cuenta`**,
 *   así que la rama por cuenta funciona sin tocar nada: es la misma fuente y el mismo camino que los
 *   `camp_*` agregados que ya publican. ⭐ **Verificado contra el deck del equipo**: para la campaña
 *   del narco dice *"Período: del 10/08 al 24/08"*, y `CAMPANAS` declara `3509-AGOSEGGJ` con
 *   `10/08/2026 → 24/08/2026`. **Las dos fechas, exactas.**
 * - **`m2_campanias`** — `CUENTA_DISTINTOS` sobre `mail_campana`. **La octava operación es
 *   exactamente esto** y no hacía falta nada nuevo. Copia la configuración de su hermano
 *   `m2_envios` —misma base, misma solapa, `dimensiones = tipo_envio=m2`— y **sólo cambia la
 *   pregunta**: aquél cuenta **envíos** (`CONTEO` de filas), éste cuenta **campañas distintas**.
 *
 * ⚠ **`ULTIMO` y no `TEXTO` para las dos fechas**, aunque hoy la lectura por cuenta devuelva una
 * sola fila: `ULTIMO` **elige por fecha y lo dice en la traza**, y el desempate es qué pasa el día
 * que haya dos. Mismo criterio que los nueve `camp_*` del `_19` Parte D.
 *
 * ⚠ **Y `formato = fecha`**, verificado contra `formatearValorMarcador_` — la rama existe y da
 * `dd/MM/yyyy`. No se supone: ya me costó una vez escribir `fecha_corta`, que no existe.
 */
/**
 * ⭐ **`corregirFormatoDeRatiosDeEnvio()` — los diez `_or`/`_ctor` de `L-047` pasan de
 * `porcentaje_sin_signo` a `fraccion`.** Publico y sin parametros.
 *
 * ⛔ **Fue un error de eleccion de formato, mio, y el cuadro que lo evita estaba escrito al lado.**
 * `formatearValorMarcador_` (`Generador.gs`, `T2.5` del 07/08) es un **2x2 de unidad de entrada x
 * lleva el signo**:
 *
 *   - `porcentaje`            — entrada en **unidades de pct**, con signo  → `26.4` → "26.4%"
 *   - `porcentaje_sin_signo`  — entrada en **unidades de pct**, sin signo  → `26.4` → "26.4"
 *   - ⭐ **`fraccion`**       — entrada **0-1**, sin signo                 → `0.2818` → "28.2"
 *
 * **Las columnas `P` (% OR) y `R` (% CTOR) de `digital/Directa Mail` guardan FRACCIONES**, medido
 * el 23/08 sobre el fixture del 20/08: `P = Aperturas/Entregados` exacto —`0.2191` contra
 * `18.253/83.298`— y el **maximo sobre 2.266 filas con valor es `1.0000`**. Con
 * `porcentaje_sin_signo` el formateador redondea a un decimal **sin multiplicar**, asi que `0.4738`
 * salia `0.5` y `0.011` salia `0`.
 *
 * ⭐⭐ **Por que el GLOBAL andaba y los envios no, que es la pregunta que lo destrabo:** son **dos
 * caminos distintos en la misma lamina**. `camp_ctor` **calcula** con `PCT`, y `opPCT` es
 * `opRATIO * 100` — el x100 esta en la OPERACION. Los `camp_env*` **leen una columna que ya trae la
 * fraccion**, asi que el x100 tiene que venir del FORMATO. **El que andaba era el molde**, y
 * mirarlo primero evito tocar la operacion, que no tenia nada.
 *
 * ⚠ **Va por `curarCamposMarcadores_` y no por `curarMarcadores_`**: corrige **un campo** de filas
 * que ya existen. La otra herramienta borra y reescribe la fila entera al final de la hoja, que es
 * exactamente lo que `ESCRITORES.md` dice que hay que evitar para un cambio de `formato`.
 */
function corregirFormatoDeRatiosDeEnvio() {
  var cambios = [];
  [1, 2, 3, 4, 5].forEach(function (n) {
    ['or', 'ctor'].forEach(function (suf) {
      cambios.push({ marcador: 'camp_env' + n + '_' + suf, informe_id: 'jm', formato: 'fraccion' });
    });
  });

  var r = curarCamposMarcadores_(cambios);
  if (!r.ok) { Logger.log('⛔ FALLÓ: ' + r.motivo); return r; }

  Logger.log('== formato de los ratios de envío: ' + r.cambios_escritos + ' celda(s) sobre ' +
    cambios.length + ' pedida(s) ==');
  (r.aplicados || []).forEach(function (a) { Logger.log('   ' + JSON.stringify(a)); });
  Logger.log('');
  Logger.log('⭐ ESPERADO en la próxima corrida, con los números que ya viste:');
  Logger.log('   %OR  51.321/108.334 = 47,4 % → publica «47.4», no «0.5»');
  Logger.log('   %CTOR   562/51.321  =  1,1 % → publica «1.1», no «0»');
  Logger.log('   Y camp_ctor del GLOBAL NO se toca: usa PCT y ya publicaba bien.');
  return r;
}

/**
 * ⭐⭐ **`L-047` — los 40 tokens de la tabla de envios.** Publico y sin parametros.
 *
 * **SON 40 Y NO 45, y salen del censo uno por uno.** El reparto es **`9 · 8 · 8 · 7 · 8`**,
 * verificado contra `docs/CENSO_tokens_sin_fila_2026-08-22.md` el 23/08:
 *
 *   - **Solo `env1` tiene `_rem`** — el remitente esta en una celda combinada.
 *   - ⛔ **`camp_env4_fecha` NO EXISTE**, y no es un olvido de la plantilla: cuando dos envios
 *     comparten dia el equipo **combina la celda de fecha**. La irregularidad **es el diseno**.
 *   - **Un producto cartesiano habria inventado cinco tokens** que no estan en ninguna lamina.
 *     Un marcador cuyo token no existe **no falla**: resuelve, no encuentra donde pintarse y no
 *     entra a `FALTANTES`. `tools/probar-tabla-envios.js` cruza los 40 contra el censo.
 *
 * ⚠ **Y una trampa de nombre medida el 23/08: `camp_enviados` empieza con `camp_env`.** Filtrar
 * por prefijo lo mete en la tabla, y es el GLOBAL, no un envio. Es el primo del `N × M`.
 *
 * ### La operacion es `FILA` (`X-35`), y el orden va declarado
 *
 * `separador = fecha_periodo` en las 40 filas — **el orden va en configuracion, no en el codigo**.
 * `ELEMENTO` no servia: colapsa repetidos y ordena **por columna**, asi que cada celda de la fila 1
 * podia venir de un envio distinto.
 *
 * ⚠ **El empate esta medido y va a ocurrir:** `3488-AGOJDGAG` tiene 5 filas y **4 fechas
 * distintas** —dos envios el 07/08—, y en la solapa entera **144 de 508 cuentas** con 2+ filas
 * tienen fechas repetidas. `FILA` desempata por orden de origen **y lo declara en la traza**;
 * `R-32` dice que comparar `camp_env1_aud` entre corridas puede comparar envios distintos.
 *
 * ### Los tipos, medidos y no supuestos
 *
 * ⛔ **`_aud` es TEXTO** — `Segmentacion` (col J): cero de 2.877 filas numericas. Una operacion
 * numerica ahi devuelve `sin_datos` y el casillero miente sobre la causa. `_fecha` va `fecha`,
 * `_or` y `_ctor` `porcentaje_sin_signo`, el resto `miles`.
 */
function cablearTablaDeEnvios() {
  var r = curarMarcadores_([], [
    {
      marcador: 'camp_env1_aperturas', familia: 'camp', informe_id: 'jm',
      base_id: 'digital', solapa: 'Directa Mail', campo_logico: 'mail_aperturas',
      operacion: 'FILA', valor_fijo: 1, separador: 'fecha_periodo',
      formato: 'miles',
      notas: 'envio 1 de L-047, campo aperturas (col O). FILA ordena por fecha_periodo y desempata por orden de origen'
    },
    {
      marcador: 'camp_env1_aud', familia: 'camp', informe_id: 'jm',
      base_id: 'digital', solapa: 'Directa Mail', campo_logico: 'mail_segmentacion',
      operacion: 'FILA', valor_fijo: 1, separador: 'fecha_periodo',
      formato: 'texto',
      notas: 'envio 1 de L-047, campo aud (col J). FILA ordena por fecha_periodo y desempata por orden de origen'
    },
    {
      marcador: 'camp_env1_clics', familia: 'camp', informe_id: 'jm',
      base_id: 'digital', solapa: 'Directa Mail', campo_logico: 'mail_clics',
      operacion: 'FILA', valor_fijo: 1, separador: 'fecha_periodo',
      formato: 'miles',
      notas: 'envio 1 de L-047, campo clics (col Q). FILA ordena por fecha_periodo y desempata por orden de origen'
    },
    {
      marcador: 'camp_env1_ctor', familia: 'camp', informe_id: 'jm',
      base_id: 'digital', solapa: 'Directa Mail', campo_logico: 'mail_ctor',
      operacion: 'FILA', valor_fijo: 1, separador: 'fecha_periodo',
      formato: 'fraccion',
      notas: 'envio 1 de L-047, campo ctor (col R). FILA ordena por fecha_periodo y desempata por orden de origen'
    },
    {
      marcador: 'camp_env1_entregados', familia: 'camp', informe_id: 'jm',
      base_id: 'digital', solapa: 'Directa Mail', campo_logico: 'mail_entregados',
      operacion: 'FILA', valor_fijo: 1, separador: 'fecha_periodo',
      formato: 'miles',
      notas: 'envio 1 de L-047, campo entregados (col N). FILA ordena por fecha_periodo y desempata por orden de origen'
    },
    {
      marcador: 'camp_env1_enviados', familia: 'camp', informe_id: 'jm',
      base_id: 'digital', solapa: 'Directa Mail', campo_logico: 'mail_enviados',
      operacion: 'FILA', valor_fijo: 1, separador: 'fecha_periodo',
      formato: 'miles',
      notas: 'envio 1 de L-047, campo enviados (col M). FILA ordena por fecha_periodo y desempata por orden de origen'
    },
    {
      marcador: 'camp_env1_fecha', familia: 'camp', informe_id: 'jm',
      base_id: 'digital', solapa: 'Directa Mail', campo_logico: 'fecha_periodo',
      operacion: 'FILA', valor_fijo: 1, separador: 'fecha_periodo',
      formato: 'fecha',
      notas: 'envio 1 de L-047, campo fecha (col F). FILA ordena por fecha_periodo y desempata por orden de origen'
    },
    {
      marcador: 'camp_env1_or', familia: 'camp', informe_id: 'jm',
      base_id: 'digital', solapa: 'Directa Mail', campo_logico: 'mail_or',
      operacion: 'FILA', valor_fijo: 1, separador: 'fecha_periodo',
      formato: 'fraccion',
      notas: 'envio 1 de L-047, campo or (col P). FILA ordena por fecha_periodo y desempata por orden de origen'
    },
    {
      marcador: 'camp_env1_rem', familia: 'camp', informe_id: 'jm',
      base_id: 'digital', solapa: 'Directa Mail', campo_logico: 'mail_remitente',
      operacion: 'FILA', valor_fijo: 1, separador: 'fecha_periodo',
      formato: 'texto',
      notas: 'envio 1 de L-047, campo rem (col G). FILA ordena por fecha_periodo y desempata por orden de origen'
    },
    {
      marcador: 'camp_env2_aperturas', familia: 'camp', informe_id: 'jm',
      base_id: 'digital', solapa: 'Directa Mail', campo_logico: 'mail_aperturas',
      operacion: 'FILA', valor_fijo: 2, separador: 'fecha_periodo',
      formato: 'miles',
      notas: 'envio 2 de L-047, campo aperturas (col O). FILA ordena por fecha_periodo y desempata por orden de origen'
    },
    {
      marcador: 'camp_env2_aud', familia: 'camp', informe_id: 'jm',
      base_id: 'digital', solapa: 'Directa Mail', campo_logico: 'mail_segmentacion',
      operacion: 'FILA', valor_fijo: 2, separador: 'fecha_periodo',
      formato: 'texto',
      notas: 'envio 2 de L-047, campo aud (col J). FILA ordena por fecha_periodo y desempata por orden de origen'
    },
    {
      marcador: 'camp_env2_clics', familia: 'camp', informe_id: 'jm',
      base_id: 'digital', solapa: 'Directa Mail', campo_logico: 'mail_clics',
      operacion: 'FILA', valor_fijo: 2, separador: 'fecha_periodo',
      formato: 'miles',
      notas: 'envio 2 de L-047, campo clics (col Q). FILA ordena por fecha_periodo y desempata por orden de origen'
    },
    {
      marcador: 'camp_env2_ctor', familia: 'camp', informe_id: 'jm',
      base_id: 'digital', solapa: 'Directa Mail', campo_logico: 'mail_ctor',
      operacion: 'FILA', valor_fijo: 2, separador: 'fecha_periodo',
      formato: 'fraccion',
      notas: 'envio 2 de L-047, campo ctor (col R). FILA ordena por fecha_periodo y desempata por orden de origen'
    },
    {
      marcador: 'camp_env2_entregados', familia: 'camp', informe_id: 'jm',
      base_id: 'digital', solapa: 'Directa Mail', campo_logico: 'mail_entregados',
      operacion: 'FILA', valor_fijo: 2, separador: 'fecha_periodo',
      formato: 'miles',
      notas: 'envio 2 de L-047, campo entregados (col N). FILA ordena por fecha_periodo y desempata por orden de origen'
    },
    {
      marcador: 'camp_env2_enviados', familia: 'camp', informe_id: 'jm',
      base_id: 'digital', solapa: 'Directa Mail', campo_logico: 'mail_enviados',
      operacion: 'FILA', valor_fijo: 2, separador: 'fecha_periodo',
      formato: 'miles',
      notas: 'envio 2 de L-047, campo enviados (col M). FILA ordena por fecha_periodo y desempata por orden de origen'
    },
    {
      marcador: 'camp_env2_fecha', familia: 'camp', informe_id: 'jm',
      base_id: 'digital', solapa: 'Directa Mail', campo_logico: 'fecha_periodo',
      operacion: 'FILA', valor_fijo: 2, separador: 'fecha_periodo',
      formato: 'fecha',
      notas: 'envio 2 de L-047, campo fecha (col F). FILA ordena por fecha_periodo y desempata por orden de origen'
    },
    {
      marcador: 'camp_env2_or', familia: 'camp', informe_id: 'jm',
      base_id: 'digital', solapa: 'Directa Mail', campo_logico: 'mail_or',
      operacion: 'FILA', valor_fijo: 2, separador: 'fecha_periodo',
      formato: 'fraccion',
      notas: 'envio 2 de L-047, campo or (col P). FILA ordena por fecha_periodo y desempata por orden de origen'
    },
    {
      marcador: 'camp_env3_aperturas', familia: 'camp', informe_id: 'jm',
      base_id: 'digital', solapa: 'Directa Mail', campo_logico: 'mail_aperturas',
      operacion: 'FILA', valor_fijo: 3, separador: 'fecha_periodo',
      formato: 'miles',
      notas: 'envio 3 de L-047, campo aperturas (col O). FILA ordena por fecha_periodo y desempata por orden de origen'
    },
    {
      marcador: 'camp_env3_aud', familia: 'camp', informe_id: 'jm',
      base_id: 'digital', solapa: 'Directa Mail', campo_logico: 'mail_segmentacion',
      operacion: 'FILA', valor_fijo: 3, separador: 'fecha_periodo',
      formato: 'texto',
      notas: 'envio 3 de L-047, campo aud (col J). FILA ordena por fecha_periodo y desempata por orden de origen'
    },
    {
      marcador: 'camp_env3_clics', familia: 'camp', informe_id: 'jm',
      base_id: 'digital', solapa: 'Directa Mail', campo_logico: 'mail_clics',
      operacion: 'FILA', valor_fijo: 3, separador: 'fecha_periodo',
      formato: 'miles',
      notas: 'envio 3 de L-047, campo clics (col Q). FILA ordena por fecha_periodo y desempata por orden de origen'
    },
    {
      marcador: 'camp_env3_ctor', familia: 'camp', informe_id: 'jm',
      base_id: 'digital', solapa: 'Directa Mail', campo_logico: 'mail_ctor',
      operacion: 'FILA', valor_fijo: 3, separador: 'fecha_periodo',
      formato: 'fraccion',
      notas: 'envio 3 de L-047, campo ctor (col R). FILA ordena por fecha_periodo y desempata por orden de origen'
    },
    {
      marcador: 'camp_env3_entregados', familia: 'camp', informe_id: 'jm',
      base_id: 'digital', solapa: 'Directa Mail', campo_logico: 'mail_entregados',
      operacion: 'FILA', valor_fijo: 3, separador: 'fecha_periodo',
      formato: 'miles',
      notas: 'envio 3 de L-047, campo entregados (col N). FILA ordena por fecha_periodo y desempata por orden de origen'
    },
    {
      marcador: 'camp_env3_enviados', familia: 'camp', informe_id: 'jm',
      base_id: 'digital', solapa: 'Directa Mail', campo_logico: 'mail_enviados',
      operacion: 'FILA', valor_fijo: 3, separador: 'fecha_periodo',
      formato: 'miles',
      notas: 'envio 3 de L-047, campo enviados (col M). FILA ordena por fecha_periodo y desempata por orden de origen'
    },
    {
      marcador: 'camp_env3_fecha', familia: 'camp', informe_id: 'jm',
      base_id: 'digital', solapa: 'Directa Mail', campo_logico: 'fecha_periodo',
      operacion: 'FILA', valor_fijo: 3, separador: 'fecha_periodo',
      formato: 'fecha',
      notas: 'envio 3 de L-047, campo fecha (col F). FILA ordena por fecha_periodo y desempata por orden de origen'
    },
    {
      marcador: 'camp_env3_or', familia: 'camp', informe_id: 'jm',
      base_id: 'digital', solapa: 'Directa Mail', campo_logico: 'mail_or',
      operacion: 'FILA', valor_fijo: 3, separador: 'fecha_periodo',
      formato: 'fraccion',
      notas: 'envio 3 de L-047, campo or (col P). FILA ordena por fecha_periodo y desempata por orden de origen'
    },
    {
      marcador: 'camp_env4_aperturas', familia: 'camp', informe_id: 'jm',
      base_id: 'digital', solapa: 'Directa Mail', campo_logico: 'mail_aperturas',
      operacion: 'FILA', valor_fijo: 4, separador: 'fecha_periodo',
      formato: 'miles',
      notas: 'envio 4 de L-047, campo aperturas (col O). FILA ordena por fecha_periodo y desempata por orden de origen'
    },
    {
      marcador: 'camp_env4_aud', familia: 'camp', informe_id: 'jm',
      base_id: 'digital', solapa: 'Directa Mail', campo_logico: 'mail_segmentacion',
      operacion: 'FILA', valor_fijo: 4, separador: 'fecha_periodo',
      formato: 'texto',
      notas: 'envio 4 de L-047, campo aud (col J). FILA ordena por fecha_periodo y desempata por orden de origen'
    },
    {
      marcador: 'camp_env4_clics', familia: 'camp', informe_id: 'jm',
      base_id: 'digital', solapa: 'Directa Mail', campo_logico: 'mail_clics',
      operacion: 'FILA', valor_fijo: 4, separador: 'fecha_periodo',
      formato: 'miles',
      notas: 'envio 4 de L-047, campo clics (col Q). FILA ordena por fecha_periodo y desempata por orden de origen'
    },
    {
      marcador: 'camp_env4_ctor', familia: 'camp', informe_id: 'jm',
      base_id: 'digital', solapa: 'Directa Mail', campo_logico: 'mail_ctor',
      operacion: 'FILA', valor_fijo: 4, separador: 'fecha_periodo',
      formato: 'fraccion',
      notas: 'envio 4 de L-047, campo ctor (col R). FILA ordena por fecha_periodo y desempata por orden de origen'
    },
    {
      marcador: 'camp_env4_entregados', familia: 'camp', informe_id: 'jm',
      base_id: 'digital', solapa: 'Directa Mail', campo_logico: 'mail_entregados',
      operacion: 'FILA', valor_fijo: 4, separador: 'fecha_periodo',
      formato: 'miles',
      notas: 'envio 4 de L-047, campo entregados (col N). FILA ordena por fecha_periodo y desempata por orden de origen'
    },
    {
      marcador: 'camp_env4_enviados', familia: 'camp', informe_id: 'jm',
      base_id: 'digital', solapa: 'Directa Mail', campo_logico: 'mail_enviados',
      operacion: 'FILA', valor_fijo: 4, separador: 'fecha_periodo',
      formato: 'miles',
      notas: 'envio 4 de L-047, campo enviados (col M). FILA ordena por fecha_periodo y desempata por orden de origen'
    },
    {
      marcador: 'camp_env4_or', familia: 'camp', informe_id: 'jm',
      base_id: 'digital', solapa: 'Directa Mail', campo_logico: 'mail_or',
      operacion: 'FILA', valor_fijo: 4, separador: 'fecha_periodo',
      formato: 'fraccion',
      notas: 'envio 4 de L-047, campo or (col P). FILA ordena por fecha_periodo y desempata por orden de origen'
    },
    {
      marcador: 'camp_env5_aperturas', familia: 'camp', informe_id: 'jm',
      base_id: 'digital', solapa: 'Directa Mail', campo_logico: 'mail_aperturas',
      operacion: 'FILA', valor_fijo: 5, separador: 'fecha_periodo',
      formato: 'miles',
      notas: 'envio 5 de L-047, campo aperturas (col O). FILA ordena por fecha_periodo y desempata por orden de origen'
    },
    {
      marcador: 'camp_env5_aud', familia: 'camp', informe_id: 'jm',
      base_id: 'digital', solapa: 'Directa Mail', campo_logico: 'mail_segmentacion',
      operacion: 'FILA', valor_fijo: 5, separador: 'fecha_periodo',
      formato: 'texto',
      notas: 'envio 5 de L-047, campo aud (col J). FILA ordena por fecha_periodo y desempata por orden de origen'
    },
    {
      marcador: 'camp_env5_clics', familia: 'camp', informe_id: 'jm',
      base_id: 'digital', solapa: 'Directa Mail', campo_logico: 'mail_clics',
      operacion: 'FILA', valor_fijo: 5, separador: 'fecha_periodo',
      formato: 'miles',
      notas: 'envio 5 de L-047, campo clics (col Q). FILA ordena por fecha_periodo y desempata por orden de origen'
    },
    {
      marcador: 'camp_env5_ctor', familia: 'camp', informe_id: 'jm',
      base_id: 'digital', solapa: 'Directa Mail', campo_logico: 'mail_ctor',
      operacion: 'FILA', valor_fijo: 5, separador: 'fecha_periodo',
      formato: 'fraccion',
      notas: 'envio 5 de L-047, campo ctor (col R). FILA ordena por fecha_periodo y desempata por orden de origen'
    },
    {
      marcador: 'camp_env5_entregados', familia: 'camp', informe_id: 'jm',
      base_id: 'digital', solapa: 'Directa Mail', campo_logico: 'mail_entregados',
      operacion: 'FILA', valor_fijo: 5, separador: 'fecha_periodo',
      formato: 'miles',
      notas: 'envio 5 de L-047, campo entregados (col N). FILA ordena por fecha_periodo y desempata por orden de origen'
    },
    {
      marcador: 'camp_env5_enviados', familia: 'camp', informe_id: 'jm',
      base_id: 'digital', solapa: 'Directa Mail', campo_logico: 'mail_enviados',
      operacion: 'FILA', valor_fijo: 5, separador: 'fecha_periodo',
      formato: 'miles',
      notas: 'envio 5 de L-047, campo enviados (col M). FILA ordena por fecha_periodo y desempata por orden de origen'
    },
    {
      marcador: 'camp_env5_fecha', familia: 'camp', informe_id: 'jm',
      base_id: 'digital', solapa: 'Directa Mail', campo_logico: 'fecha_periodo',
      operacion: 'FILA', valor_fijo: 5, separador: 'fecha_periodo',
      formato: 'fecha',
      notas: 'envio 5 de L-047, campo fecha (col F). FILA ordena por fecha_periodo y desempata por orden de origen'
    },
    {
      marcador: 'camp_env5_or', familia: 'camp', informe_id: 'jm',
      base_id: 'digital', solapa: 'Directa Mail', campo_logico: 'mail_or',
      operacion: 'FILA', valor_fijo: 5, separador: 'fecha_periodo',
      formato: 'fraccion',
      notas: 'envio 5 de L-047, campo or (col P). FILA ordena por fecha_periodo y desempata por orden de origen'
    }
  ]);

  if (!r.ok) { Logger.log('⛔ FALLÓ: ' + r.motivo); return r; }

  Logger.log('== L-047 tabla de envíos: ' + ((r.agregadas || []).length) + ' fila(s) · ' +
    r.filas_finales + ' filas en MARCADORES ==');
  if (!(r.agregadas || []).length) {
    Logger.log('ⓘ Cero altas: los 40 ya existían. Es idempotencia, no rotura.');
  }
  Logger.log('');
  Logger.log('⭐ EL CONTROL PRIMARIO ES LA COHERENCIA DE FILA, y no depende del equipo:');
  Logger.log('   los nueve campos de env1 tienen que salir de LA MISMA fila de la fuente.');
  Logger.log('   Para 3488-AGOJDGAG el 07/08 hay DOS envíos; sea cual sea el que salga primero,');
  Logger.log('   sus enviados/entregados/aperturas tienen que ser 84.608/83.298/18.253');
  Logger.log('   O BIEN 121.983/120.091/24.908 — nunca cruzados.');
  Logger.log('');
  Logger.log('⭐ CONTROL SECUNDARIO — la fila GLOBAL, con la hipótesis declarada ANTES:');
  Logger.log('   SI camp_enviados suma los cinco envíos, tiene que dar la suma de los cinco.');
  Logger.log('   SI NO CIERRA, no es un bug del cableado: es evidencia de que el GLOBAL suma');
  Logger.log('   otro universo — que es justo lo que está preguntado al equipo. Los dos');
  Logger.log('   resultados informan y ninguno frena el paso.');
  Logger.log('');
  Logger.log('⛔ LOS SEIS DE L-047 QUE NO ENTRAN:');
  Logger.log('   camp_bench_remitente · camp_mail_insight → texto del equipo');
  Logger.log('   camp_remitente                           → DIFERIDO desde el 07/08');
  Logger.log('   camp_enviados · camp_or · camp_mail_clics → son la fila GLOBAL, no un envío');
  return r;
}

/**
 * ⭐ **`camp_dig_impl`, `camp_dir_impl` y `camp_eje` — los tres que `X-39` destrabó.** Público y
 * sin parámetros.
 *
 * **Dos láminas en un paso, y está bien: los tres son huecos.** `camp_dig_impl` y `camp_dir_impl`
 * son de `L-045`, `camp_eje` de `L-046`. La regla de *«un cambio por deck»* es para lo que **mueve
 * un número publicado**; los tres salen hoy en `/////`, así que **no hay nada que atribuir**
 * (`CLAUDE.md` §4).
 *
 * ### Los dos `impl` — el bloqueo era `X-39` y ya no está
 *
 * Los dos son **`CONTEO` de filas para la cuenta de la campaña**, y los dos estaban frenados por lo
 * mismo: sin `SOLAPAS.campo_id_cuenta` no se pueden acotar a la cuenta y contarían la solapa
 * entera. El molde es `ivr_campanias` (`CONTEO` sobre `ivr_id_cuenta`, sin filtro ni dimensiones).
 *
 *   - **`camp_dig_impl`** → `looker/DIGITAL`, contando por `ldig_id_cuenta`. El equipo publica
 *     **4**, que son **las cuatro plataformas de esa cuenta**. `V-109` lo corrobora sin haberlo
 *     buscado: `3481-AGOINFAN` tiene DV360 + Meta + Google ads + Mercado Libre, **cuatro filas**.
 *   - **`camp_dir_impl`** → `digital/Directa Mail`, contando por `mail_id_cuenta`. El equipo
 *     publica **3**, los envíos de esa campaña.
 *
 * ⛔ **`filtro` vacío, por el mismo motivo que los quince del desglose** — y acá hay uno más: si
 * `estado=Activa` dejara afuera una plataforma, el conteo diría **3** donde el equipo publica 4, y
 * sería un número plausible y equivocado. **Es el modo de falla que este proyecto persigue.**
 *
 * ⭐⭐ **Y nacen SIN `_revisar`, al revés que los dieciocho de anoche. El motivo es preciso y vale
 * la pena tenerlo escrito: un `CONTEO` es inmune a la inestabilidad por CAMBIO.** `R-31` mide
 * `looker/DIGITAL` como inestable por **CAMBIO** —`19/503` filas, **cero altas**—, o sea que
 * **los valores se reescriben pero las filas no se agregan ni se borran**. Un conteo de filas no
 * lo puede notar. Los quince del desglose sí, porque suman **valores**.
 *
 * ### `camp_eje` — el único de los ocho de `L-046` que no es texto del equipo
 *
 * Los otros siete —los seis `camp_bench_*` y `camp_dig_insight`— **los escribe una persona**. Éste
 * no: **`eje` está mapeado, columna `E` de `looker/resumen_metricas_dinamico`**, verificado contra
 * `MAPEO` antes de escribir la fila. Molde: **`camp_titulo`**, que es el otro texto que el motor sí
 * pinta — `ULTIMO` y `formato = texto`.
 *
 * ⚠ **Es TEXTO y se cablea como texto**, que es la mitad que se equivoca sola: una `SUMA` sobre una
 * columna de texto devuelve `sin_datos` y **el casillero sale con el símbolo de sin dato**, que se
 * lee como *"el dato no llegó"* cuando el dato está (`CLAUDE.md` §4).
 */
function cablearImplementacionesYEje() {
  var r = curarMarcadores_([], [
    {
      marcador: 'camp_dig_impl', familia: 'camp', informe_id: 'jm',
      base_id: 'looker', solapa: 'DIGITAL', campo_logico: 'ldig_id_cuenta',
      operacion: 'CONTEO', formato: 'numero',
      notas: 'implementaciones digitales = CONTEO de filas de looker/DIGITAL para la cuenta de la ' +
        'campania, una por plataforma. Destrabado por X-39. Molde: ivr_campanias. Sin filtro: ' +
        'estado=Activa podria dejar afuera una plataforma y dar 3 donde el equipo publica 4'
    },
    {
      marcador: 'camp_dir_impl', familia: 'camp', informe_id: 'jm',
      base_id: 'digital', solapa: 'Directa Mail', campo_logico: 'mail_id_cuenta',
      operacion: 'CONTEO', formato: 'numero',
      notas: 'implementaciones de directa = CONTEO de envios de digital/Directa Mail para la ' +
        'cuenta. Destrabado por X-39. Molde: ivr_campanias. Sin dimensiones: el corte lo pone el ' +
        'item de campania via campo_id_cuenta, no un tipo_envio'
    },
    {
      marcador: 'camp_eje', familia: 'camp', informe_id: 'jm',
      base_id: 'looker', solapa: 'resumen_metricas_dinamico', campo_logico: 'eje',
      operacion: 'ULTIMO', formato: 'texto',
      notas: 'el eje de la campania destacada. TEXTO, no metrica: molde camp_titulo. Columna E de ' +
        'resumen_metricas_dinamico, ya mapeada — verificado contra MAPEO antes de escribir. Es el ' +
        'unico de los ocho de L-046 que no lo escribe una persona'
    }
  ]);

  if (!r.ok) { Logger.log('⛔ FALLÓ: ' + r.motivo); return r; }

  Logger.log('== impl + eje: ' + ((r.agregadas || []).length) + ' fila(s) agregada(s) · ' +
    r.filas_finales + ' filas en MARCADORES ==');
  if (!(r.agregadas || []).length) {
    Logger.log('ⓘ Cero altas: los tres ya existían. Es idempotencia, no rotura.');
  }
  Logger.log('');
  Logger.log('⭐ ESPERADO, contra el deck del equipo:');
  Logger.log('   camp_dig_impl → 4  (las cuatro plataformas de la cuenta)');
  Logger.log('   camp_dir_impl → 3  (los envíos de la campaña)');
  Logger.log('   camp_eje      → el eje, en TEXTO. Si sale con símbolo de sin dato,');
  Logger.log('                   el sospechoso es la operación, no la fuente.');
  Logger.log('');
  Logger.log('⛔ Y CORRÉ censarTokensSinMarcador(): L-045 tiene que desaparecer de la lista');
  Logger.log('   —sus dos eran los únicos— y L-046 tiene que bajar de 8 a 7.');
  Logger.log('   Los 7 que quedan son texto del equipo y NO se cablean:');
  Logger.log('   los seis camp_bench_* y camp_dig_insight.');
  return r;
}

/**
 * ⭐ **`camp_meta_frecuencia` — la frecuencia de Meta de `L-046`.** Público y sin parámetros.
 *
 * ⛔⛔ **VA SOLO Y NO SE MEZCLA CON `cablearDesglosePorPlataforma()`, y el motivo es el control.**
 * Aquellos 17 se cruzan contra `docs/CENSO_tokens_sin_fila_2026-08-22.md`, que es **evidencia
 * congelada del 22/08**. Este token **nació en la plantilla el 23/08**, así que **no puede estar en
 * ese censo** — meterlo en el mismo lote rompería el cruce, o peor, obligaría a aflojarlo.
 * **Su control es otro: el censo VIVO, corrido antes y después.**
 *
 * ⚠ **Y por eso el orden importa y no es negociable:**
 *   1. `censarTokensSinMarcador()` **ANTES** → tiene que listar `camp_meta_frecuencia` en `L-046`.
 *      **Eso es lo que prueba que el token quedó bien escrito en la plantilla**, y es la única
 *      forma de saberlo: un `{{token}}` mal tipeado no falla, simplemente no existe para nadie.
 *   2. Esta función.
 *   3. `censarTokensSinMarcador()` **DESPUÉS** → ya no tiene que aparecer.
 *
 * ⭐ **La fuente no es `looker/DIGITAL` como sus catorce hermanos de lámina, y esto hay que
 * entenderlo o el número sale mal:** la frecuencia de Meta vive en **`looker/resumen_metricas_
 * dinamico`, columna `L`** — `V-109` la midió en **1,737** junto a `frecuencia_total` (M) =
 * **6,573**. Esa solapa tiene **una fila por campaña y una columna por plataforma**.
 *
 * ⭐⭐ **De ahí sale la única decisión de diseño de esta fila: `dimensiones` va VACÍO, y no es un
 * incumplimiento de `D-33`.** En `looker/DIGITAL` la plataforma es una **dimensión de fila**
 * —`Plataforma=Meta`, y por eso los quince llevan `plataforma=meta`—. Acá la plataforma es una
 * **columna**, así que el corte no se puede expresar como un filtro de filas: `DIMENSIONES_` ni
 * siquiera declara `plataforma` para esta solapa, y declararla fallaría.
 * **El molde ya estaba en la hoja: `camp_alcance` hace exactamente esto** — se llama genérico y
 * lee `meta_alcance` (K), con `ULTIMO` y sin dimensiones.
 *
 * ⚠ **Nace `numero_revisar`, igual que su hermano `camp_frecuencia`**: es la primera lectura de una
 * columna recién mapeada y no hay caso validado del valor publicado.
 *
 * ⛔ **La celda de TOTALES no se toca** (decisión del usuario, 23/08). `camp_frecuencia` sigue
 * siendo `RATIO dig_impresiones/alcance` sobre la misma solapa.
 */
function cablearMetaFrecuencia() {
  var r = curarMarcadores_([], [
    {
      marcador: 'camp_meta_frecuencia', familia: 'camp', informe_id: 'jm',
      base_id: 'looker', solapa: 'resumen_metricas_dinamico', campo_logico: 'meta_frecuencia',
      operacion: 'ULTIMO', formato: 'numero_revisar',
      notas: 'frecuencia de Meta, columna L, mapeada el 23/08. Molde: camp_alcance, que lee ' +
        'meta_alcance (K) con ULTIMO y sin dimensiones. dimensiones VACIO a proposito: aca la ' +
        'plataforma es una COLUMNA y no una dimension de fila, al reves que en looker/DIGITAL'
    }
  ]);

  if (!r.ok) { Logger.log('⛔ FALLÓ: ' + r.motivo); return r; }

  Logger.log('== camp_meta_frecuencia: ' + ((r.agregadas || []).length) +
    ' fila(s) agregada(s) · ' + r.filas_finales + ' filas en MARCADORES ==');
  if (!(r.agregadas || []).length) {
    Logger.log('ⓘ Cero altas: ya existía. Es idempotencia, no rotura.');
  }
  Logger.log('');
  Logger.log('⛔ AHORA CORRÉ censarTokensSinMarcador() DE NUEVO.');
  Logger.log('   camp_meta_frecuencia NO tiene que aparecer más en L-046.');
  Logger.log('   Si sigue apareciendo: la fila se escribió pero el token de la plantilla');
  Logger.log('   no se llama así. Si no aparecía ANTES tampoco, el token nunca se leyó.');
  Logger.log('');
  Logger.log('⭐ ESPERADO, contra V-109 (fixture del 20/08, cuenta 3481-AGOINFAN):');
  Logger.log('   meta_frecuencia (col L) = 1,737 · frecuencia_total (col M) = 6,573');
  Logger.log('   El deck publica la de Meta en la fila Meta y la total en TOTALES.');
  Logger.log('   ⚠ Sale entre guiones: nace numero_revisar, como camp_frecuencia.');
  return r;
}

/**
 * ⭐ **`L-046` — el desglose por plataforma, 17 tokens.** Público y sin parámetros: aparece en el
 * desplegable del editor.
 *
 * **Los 17 salen del censo, uno por uno, no de multiplicar 3 × 5.** `docs/CENSO_tokens_sin_fila_2026-08-22.md`
 * lista **25** tokens sin fila en `L-046`; de ésos, **15** son el desglose por plataforma y **2**
 * son la fila TOTALES (`camp_ctr`, `camp_vtr`). Los otros 8 **no entran y ninguno es olvido** —
 * ver el final de esta función. `tools/probar-desglose-plataforma.js` vuelve a cruzar la lista
 * contra el censo, que es la forma de que un token inventado **falle** en vez de quedar como una
 * fila de `MARCADORES` que nadie va a poder explicar.
 *
 * **El molde no se inventó: son los `u1_*`** sobre `digital/CAMPAÑAS_DESGLOCE_DIGITAL` — la misma
 * forma (plataforma × métrica), `SUMA` para las tres métricas, `PCT` con `numerador/denominador`
 * para los dos ratios, y **el corte en `dimensiones`, nunca en `filtro`** (`D-33`).
 * `DIMENSIONES_.plataforma` **ya declara `looker|DIGITAL`** para las tres, así que no hace falta
 * vocabulario nuevo — y `programmatic` entra **por resta** (`R-24`), que es lo que hace que `DV360`
 * y las cinco plataformas chicas caigan donde el deck las agrupa.
 *
 * ⛔⛔ **`filtro` va VACÍO, y es una diferencia deliberada con los ocho `imp_*`, que llevan
 * `estado=Activa`.** El motivo es `V-109`: midió que las filas por plataforma de `looker/DIGITAL`
 * **suman exacto** el `digital_impresiones` de `resumen_metricas_dinamico` para la misma cuenta
 * —DV360 3.756.321 + Meta 1.506.236 + Google ads 436.601 + Mercado Libre 0 = **5.699.158**, y el
 * agregado dice 5.699.158—. **Ese sumatorio no lleva `estado=Activa`.** Agregarlo acá rompería la
 * única identidad que este bloque tiene validada: que las partes cierran contra el total.
 *
 * ⚠ **Nacen todos `_revisar`, y no es prudencia genérica: son dos motivos medidos.** `looker/DIGITAL`
 * es **de estado** (`R-29`) —la fila se actualiza y no se agregan filas, así que `Impresiones` trae
 * **todo lo acumulado desde que la campaña arrancó**, que es el problema abierto de Programmatic—
 * y es **inestable por CAMBIO** (`R-31`, 19/503 filas, cero altas). Los `u1_*`, que leen la solapa
 * análoga, nacieron igual.
 *
 * ⚠ **Y lo que este cableado NO contesta:** si el número es el de la semana. La decisión del rótulo
 * de Programmatic sigue abierta y **los alcanza a los quince**.
 */
function cablearDesglosePorPlataforma() {
  var r = curarMarcadores_([], [
    {
      marcador: 'camp_meta_impresiones', familia: 'camp', informe_id: 'jm',
      base_id: 'looker', solapa: 'DIGITAL', campo_logico: 'Impresiones',
      operacion: 'SUMA', dimensiones: 'plataforma=meta', formato: 'miles_revisar',
      notas: 'L-046 desglose por plataforma. Molde: los u1_* sobre CAMPANAS_DESGLOCE_DIGITAL. Habilitado por X-39 (campo_id_cuenta en looker/DIGITAL): el corte por cuenta lo pone el item de campania'
    },
    {
      marcador: 'camp_meta_vistas', familia: 'camp', informe_id: 'jm',
      base_id: 'looker', solapa: 'DIGITAL', campo_logico: 'Visualizaciones',
      operacion: 'SUMA', dimensiones: 'plataforma=meta', formato: 'miles_revisar',
      notas: 'L-046 desglose por plataforma. Molde: los u1_* sobre CAMPANAS_DESGLOCE_DIGITAL. Habilitado por X-39 (campo_id_cuenta en looker/DIGITAL): el corte por cuenta lo pone el item de campania'
    },
    {
      marcador: 'camp_meta_clics', familia: 'camp', informe_id: 'jm',
      base_id: 'looker', solapa: 'DIGITAL', campo_logico: 'Clics',
      operacion: 'SUMA', dimensiones: 'plataforma=meta', formato: 'miles_revisar',
      notas: 'L-046 desglose por plataforma. Molde: los u1_* sobre CAMPANAS_DESGLOCE_DIGITAL. Habilitado por X-39 (campo_id_cuenta en looker/DIGITAL): el corte por cuenta lo pone el item de campania'
    },
    {
      marcador: 'camp_meta_ctr', familia: 'camp', informe_id: 'jm',
      base_id: 'looker', solapa: 'DIGITAL', campo_logico: 'Clics/Impresiones',
      operacion: 'PCT', dimensiones: 'plataforma=meta', formato: 'porcentaje_sin_signo_revisar',
      notas: 'L-046 desglose por plataforma. Molde: los u1_* sobre CAMPANAS_DESGLOCE_DIGITAL. Habilitado por X-39 (campo_id_cuenta en looker/DIGITAL): el corte por cuenta lo pone el item de campania'
    },
    {
      marcador: 'camp_meta_vtr', familia: 'camp', informe_id: 'jm',
      base_id: 'looker', solapa: 'DIGITAL', campo_logico: 'Visualizaciones/Impresiones',
      operacion: 'PCT', dimensiones: 'plataforma=meta', formato: 'porcentaje_sin_signo_revisar',
      notas: 'L-046 desglose por plataforma. Molde: los u1_* sobre CAMPANAS_DESGLOCE_DIGITAL. Habilitado por X-39 (campo_id_cuenta en looker/DIGITAL): el corte por cuenta lo pone el item de campania'
    },
    {
      marcador: 'camp_google_impresiones', familia: 'camp', informe_id: 'jm',
      base_id: 'looker', solapa: 'DIGITAL', campo_logico: 'Impresiones',
      operacion: 'SUMA', dimensiones: 'plataforma=google', formato: 'miles_revisar',
      notas: 'L-046 desglose por plataforma. Molde: los u1_* sobre CAMPANAS_DESGLOCE_DIGITAL. Habilitado por X-39 (campo_id_cuenta en looker/DIGITAL): el corte por cuenta lo pone el item de campania'
    },
    {
      marcador: 'camp_google_vistas', familia: 'camp', informe_id: 'jm',
      base_id: 'looker', solapa: 'DIGITAL', campo_logico: 'Visualizaciones',
      operacion: 'SUMA', dimensiones: 'plataforma=google', formato: 'miles_revisar',
      notas: 'L-046 desglose por plataforma. Molde: los u1_* sobre CAMPANAS_DESGLOCE_DIGITAL. Habilitado por X-39 (campo_id_cuenta en looker/DIGITAL): el corte por cuenta lo pone el item de campania'
    },
    {
      marcador: 'camp_google_clics', familia: 'camp', informe_id: 'jm',
      base_id: 'looker', solapa: 'DIGITAL', campo_logico: 'Clics',
      operacion: 'SUMA', dimensiones: 'plataforma=google', formato: 'miles_revisar',
      notas: 'L-046 desglose por plataforma. Molde: los u1_* sobre CAMPANAS_DESGLOCE_DIGITAL. Habilitado por X-39 (campo_id_cuenta en looker/DIGITAL): el corte por cuenta lo pone el item de campania'
    },
    {
      marcador: 'camp_google_ctr', familia: 'camp', informe_id: 'jm',
      base_id: 'looker', solapa: 'DIGITAL', campo_logico: 'Clics/Impresiones',
      operacion: 'PCT', dimensiones: 'plataforma=google', formato: 'porcentaje_sin_signo_revisar',
      notas: 'L-046 desglose por plataforma. Molde: los u1_* sobre CAMPANAS_DESGLOCE_DIGITAL. Habilitado por X-39 (campo_id_cuenta en looker/DIGITAL): el corte por cuenta lo pone el item de campania'
    },
    {
      marcador: 'camp_google_vtr', familia: 'camp', informe_id: 'jm',
      base_id: 'looker', solapa: 'DIGITAL', campo_logico: 'Visualizaciones/Impresiones',
      operacion: 'PCT', dimensiones: 'plataforma=google', formato: 'porcentaje_sin_signo_revisar',
      notas: 'L-046 desglose por plataforma. Molde: los u1_* sobre CAMPANAS_DESGLOCE_DIGITAL. Habilitado por X-39 (campo_id_cuenta en looker/DIGITAL): el corte por cuenta lo pone el item de campania'
    },
    {
      marcador: 'camp_prog_impresiones', familia: 'camp', informe_id: 'jm',
      base_id: 'looker', solapa: 'DIGITAL', campo_logico: 'Impresiones',
      operacion: 'SUMA', dimensiones: 'plataforma=programmatic', formato: 'miles_revisar',
      notas: 'L-046 desglose por plataforma. Molde: los u1_* sobre CAMPANAS_DESGLOCE_DIGITAL. Habilitado por X-39 (campo_id_cuenta en looker/DIGITAL): el corte por cuenta lo pone el item de campania'
    },
    {
      marcador: 'camp_prog_vistas', familia: 'camp', informe_id: 'jm',
      base_id: 'looker', solapa: 'DIGITAL', campo_logico: 'Visualizaciones',
      operacion: 'SUMA', dimensiones: 'plataforma=programmatic', formato: 'miles_revisar',
      notas: 'L-046 desglose por plataforma. Molde: los u1_* sobre CAMPANAS_DESGLOCE_DIGITAL. Habilitado por X-39 (campo_id_cuenta en looker/DIGITAL): el corte por cuenta lo pone el item de campania'
    },
    {
      marcador: 'camp_prog_clics', familia: 'camp', informe_id: 'jm',
      base_id: 'looker', solapa: 'DIGITAL', campo_logico: 'Clics',
      operacion: 'SUMA', dimensiones: 'plataforma=programmatic', formato: 'miles_revisar',
      notas: 'L-046 desglose por plataforma. Molde: los u1_* sobre CAMPANAS_DESGLOCE_DIGITAL. Habilitado por X-39 (campo_id_cuenta en looker/DIGITAL): el corte por cuenta lo pone el item de campania'
    },
    {
      marcador: 'camp_prog_ctr', familia: 'camp', informe_id: 'jm',
      base_id: 'looker', solapa: 'DIGITAL', campo_logico: 'Clics/Impresiones',
      operacion: 'PCT', dimensiones: 'plataforma=programmatic', formato: 'porcentaje_sin_signo_revisar',
      notas: 'L-046 desglose por plataforma. Molde: los u1_* sobre CAMPANAS_DESGLOCE_DIGITAL. Habilitado por X-39 (campo_id_cuenta en looker/DIGITAL): el corte por cuenta lo pone el item de campania'
    },
    {
      marcador: 'camp_prog_vtr', familia: 'camp', informe_id: 'jm',
      base_id: 'looker', solapa: 'DIGITAL', campo_logico: 'Visualizaciones/Impresiones',
      operacion: 'PCT', dimensiones: 'plataforma=programmatic', formato: 'porcentaje_sin_signo_revisar',
      notas: 'L-046 desglose por plataforma. Molde: los u1_* sobre CAMPANAS_DESGLOCE_DIGITAL. Habilitado por X-39 (campo_id_cuenta en looker/DIGITAL): el corte por cuenta lo pone el item de campania'
    },
    {
      marcador: 'camp_ctr', familia: 'camp', informe_id: 'jm',
      base_id: 'looker', solapa: 'resumen_metricas_dinamico', campo_logico: 'dig_clics/dig_impresiones',
      operacion: 'PCT', formato: 'porcentaje_sin_signo',
      notas: 'fila TOTALES de L-046. Molde exacto: camp_ctor, que ya vive ahi con PCT sobre la misma solapa. NO necesitaba X-39: resumen_metricas_dinamico declara campo_id_cuenta desde el 19/08'
    },
    {
      marcador: 'camp_vtr', familia: 'camp', informe_id: 'jm',
      base_id: 'looker', solapa: 'resumen_metricas_dinamico', campo_logico: 'dig_visualizaciones/dig_impresiones',
      operacion: 'PCT', formato: 'porcentaje_sin_signo',
      notas: 'fila TOTALES de L-046, idem camp_ctr'
    }
  ]);

  if (!r.ok) { Logger.log('⛔ FALLÓ: ' + r.motivo); return r; }

  Logger.log('== L-046 desglose por plataforma: ' + ((r.agregadas || []).length) +
    ' fila(s) agregada(s) · ' + r.filas_finales + ' filas en MARCADORES ==');
  if (!(r.agregadas || []).length) {
    Logger.log('ⓘ Cero altas: los 17 ya existían. Es idempotencia, no rotura.');
  }
  Logger.log('');
  Logger.log('⭐ EL CONTROL QUE VALE, y no necesita un «antes» — se mide DENTRO de la corrida:');
  Logger.log('   camp_meta_impresiones + camp_google_impresiones + camp_prog_impresiones');
  Logger.log('   tiene que dar camp_impresiones. V-109 lo midió sobre 3481-AGOINFAN:');
  Logger.log('   3.756.321 + 1.506.236 + 436.601 + 0 = 5.699.158, exacto.');
  Logger.log('   Ídem vistas (2.833.650) y clics (4.250).');
  Logger.log('   ⚠ Si NO cierra, el sospechoso es el filtro, no la fuente.');
  Logger.log('');
  Logger.log('⛔ LOS OCHO DE L-046 QUE NO ENTRAN, y ninguno es olvido:');
  Logger.log('   camp_bench_{meta,google,prog}_{ctr,vtr}  → 6 · TEXTO DEL EQUIPO, fuera de alcance');
  Logger.log('   camp_dig_insight                        → TEXTO DEL EQUIPO, ídem');
  Logger.log('   camp_eje                                → sin decidir de qué columna sale');
  Logger.log('');
  Logger.log('ⓘ Y dos que X-39 también destrabó y NO entran acá porque son de OTRA lámina:');
  Logger.log('   camp_dig_impl (L-045) y camp_dir_impl (L-045). Van en su propio paso.');
  return r;
}

function cablearLosChicos() {
  var r = curarMarcadores_([], [
    {
      marcador: 'camp_desde', familia: 'camp', informe_id: 'jm',
      base_id: 'looker', solapa: 'resumen_metricas_dinamico', campo_logico: 'fecha_inicio',
      operacion: 'ULTIMO', formato: 'fecha',
      notas: 'inicio de la campania destacada. Col C de resumen_metricas_dinamico, ya mapeada. ' +
        'La solapa ya declara campo_id_cuenta, asi que la rama por cuenta anda sin tocar esquema. ' +
        'Verificado contra el deck del equipo: 3509-AGOSEGGJ dice «del 10/08 al 24/08»'
    },
    {
      marcador: 'camp_hasta', familia: 'camp', informe_id: 'jm',
      base_id: 'looker', solapa: 'resumen_metricas_dinamico', campo_logico: 'fecha_fin',
      operacion: 'ULTIMO', formato: 'fecha',
      notas: 'fin de la campania destacada. Col D, ya mapeada. Idem camp_desde'
    },
    {
      marcador: 'm2_campanias', familia: 'm2', informe_id: 'jm',
      base_id: 'digital', solapa: 'Directa Mail', campo_logico: 'mail_campana',
      operacion: 'CUENTA_DISTINTOS', dimensiones: 'tipo_envio=m2', formato: 'miles',
      notas: 'campanias DISTINTAS de M2, no envios. Copia la config de su hermano m2_envios y ' +
        'solo cambia la pregunta: aquel es CONTEO de filas, este CUENTA_DISTINTOS sobre el nombre'
    }
  ]);

  if (!r.ok) { Logger.log('⛔ FALLÓ: ' + r.motivo); return r; }

  Logger.log('== los chicos: ' + ((r.agregadas || []).length) + ' fila(s) agregada(s) · ' +
    r.filas_finales + ' filas en MARCADORES ==');
  if (!(r.agregadas || []).length) {
    Logger.log('ⓘ Cero altas: las tres ya existían. Es idempotencia, no rotura.');
  }
  Logger.log('');
  Logger.log('⭐ ESPERADO, contra el deck del equipo:');
  Logger.log('   camp_desde / camp_hasta → las fechas de la campaña destacada. Para la del narco');
  Logger.log('                             (3509-AGOSEGGJ) el equipo publica «del 10/08 al 24/08».');
  Logger.log('   m2_campanias           → campañas DISTINTAS de M2 en la ventana, no envíos.');
  Logger.log('');
  Logger.log('⛔ LOS CINCO QUE NO ENTRARON, y ninguno es olvido:');
  Logger.log('   periodo               → NO SE CABLEA: lo produce la generación (Generador.gs).');
  Logger.log('                           Es un falso faltante del censo.');
  Logger.log('   contenidos_total ×2   → pregunta abierta al equipo (los pauta_* son flags 0/1).');
  Logger.log('   camp_dig_impl         → X-39: necesita campo_id_cuenta en looker/DIGITAL.');
  Logger.log('   camp_dir_impl         → mismo bloqueo en digital/Directa Mail.');
  return r;
}
