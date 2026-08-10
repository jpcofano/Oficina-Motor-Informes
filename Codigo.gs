/**
 * Codigo.gs — Punto de entrada del proyecto.
 * Responsabilidad: menú de la planilla (onOpen) y ruteo a cada módulo.
 * NO contiene lógica de negocio.
 * Se completa en: Paso 0 (menú) y se amplía en pasos siguientes.
 */

// ============================================================================
// MENÚ — declaración única
// ----------------------------------------------------------------------------
// El menú se declara acá y se construye por recorrido. Agregar un ítem es
// agregar una fila a esta tabla: onOpen() no se toca nunca más.
//
// Convención de etiquetas: la etiqueta dice QUÉ hace el ítem. El paso que lo
// creó vive en el encabezado de la función y en docs/BITACORA.md, no en la
// etiqueta (una sola fuente de verdad). Única excepción: el submenú "Archivo",
// donde el paso ES la identidad del caso cerrado.
//
// Estructura: { t: etiqueta, f: función }  |  { t: etiqueta, items: [...] }  |  '---'
// ============================================================================

var MENU_ = {
  t: '▶ Motor de Informes',
  items: [
    { t: 'Abrir panel',      f: 'menuAbrirPanel_' },
    { t: 'Generar informe',  f: 'menuGenerarInforme_' },
    '---',

    // --- Configuración -----------------------------------------------------
    // "Aplicar configuración" corre los cuatro sembradores en el único orden
    // que tiene sentido y reporta un diff combinado (Paso 2.11 Parte C). Los
    // cuatro individuales viven en "Avanzado": sirven para depurar una hoja
    // puntual, pero correrlos sueltos y en cualquier orden es lo que revertía
    // la Parte C sin avisar.
    { t: 'Configuración', items: [
      { t: 'Aplicar configuración',        f: 'menuAplicarConfiguracion_' },
      { t: 'Estado de configuración',      f: 'menuEstadoConfiguracion_' },
      '---',
      { t: 'Registrar plantillas',         f: 'menuRegistrarPlantillas_' },
      { t: 'Promover fechas elegidas',     f: 'menuPromoverFechasElegidas_' },
      { t: 'Cargar temario de reuniones',  f: 'menuCargarTemarioReuniones_' },
      { t: 'Cargar temario de campañas',  f: 'menuCargarTemarioCampanas_' },
      { t: 'Cargar ejemplo',               f: 'menuCargarEjemplo_' },
      '---',
      { t: 'Avanzado', items: [
        { t: 'Instalar / reparar hojas',           f: 'instalar' },
        { t: 'Cargar config inicial',              f: 'seedConfiguracion' },
        { t: 'Sembrar clasificación de solapas',   f: 'sembrarClasificacionSolapas' },
        { t: 'Sembrar árbol de secciones',         f: 'menuSembrarSecciones_' }
      ]}
    ]},

    // --- Datos: lo que decide una persona y después se escribe --------------
    // "Consolidar mapeos de looker" retirado (Paso 2.11 Parte E, 01/08/2026): la
    // consolidación S-01 ya está aplicada y la sostienen tres migraciones idempotentes
    // dentro de instalar(). El ítem quedaba como única vía de invocación de
    // consolidarMapeoLooker_, y su diagnóstico devuelve la dirección INVERTIDA — un
    // click revertía S-01. La función no se borra; ver su encabezado en Solapas.gs.
    { t: 'Datos y decisiones', items: [
      { t: 'Revisar divergencias de valores', f: 'menuRevisarDivergenciasValores_' }
    ]},

    // --- Diagnóstico: las cuatro pruebas de uso diario arriba, el resto agrupado
    { t: 'Diagnóstico', items: [
      { t: 'Probar conexión a bases',    f: 'probarConexionBases' },
      { t: 'Probar lectura por ventana', f: 'menuProbarLectura_' },
      { t: 'Probar unión y anclaje',     f: 'menuProbarUnionYAnclaje_' },
      // Los dos hacen cosas distintas y por eso la etiqueta lo dice (Paso 3 v3, D.0.5):
      // el del 2.9E lee UNA fila de `rdv` cableada a mano; el de prueba recorre `MARCADORES`.
      { t: 'Calcular corte vertical (Paso 2.9E)', f: 'menuCorteVerticalRetiro2407_' },
      { t: 'Calcular marcadores de prueba',       f: 'menuCalcularMarcadoresPrueba_' },
      '---',
      { t: 'Solapas', items: [
        { t: 'Listar solapas y tipos',              f: 'menuDiagnosticarBases_' },
        { t: 'Inventariar solapas',                 f: 'menuInventariarSolapas_' },
        { t: 'Auditoría de solapas',                f: 'menuAuditarSolapas_' },
        { t: 'Verificar nombres de solapa fuente',  f: 'menuVerificarNombresSolapasFuente_' }
      ]},
      { t: 'Fechas y mapeo', items: [
        { t: 'Detectar columnas de fecha',                f: 'menuDetectarColumnasFecha_' },
        { t: 'Validar MAPEO (duplicados)',                f: 'menuValidarMapeo_' },
        { t: 'Tipos de fechas de ventana (solo lectura)', f: 'menuDiagnosticoTiposFechasConfig_' }
      ]},
      { t: 'Correr pruebas del diff', f: 'menuCorrerPruebasDiff_' },
      { t: 'Looker y alcance', items: [
        { t: 'Comparar resúmenes de looker',    f: 'menuCompararResumenesLooker_' },
        // "Auditar fórmulas de resúmenes" retirado con el anterior (Paso 2.11 Parte E):
        // muestra la misma recomendación invertida y remata mandando a correr la
        // consolidación. Retirar uno solo dejaba un consejo equivocado sin salida.
        { t: 'Auditar digital / alcance',       f: 'menuAuditarAlcanceDigital_' }
      ]},
      // Instrumentos de casos ya cerrados. No se borran: sirven para reabrir un
      // caso, no para el uso diario. Acá el paso SÍ va en la etiqueta.
      { t: 'Archivo (casos cerrados)', items: [
        { t: 'Corte de filas en m2 (2.8 D)',        f: 'menuDiagnosticarCorteFilasM2_' },
        { t: 'Filas sin clave en digital (2.8 E)',  f: 'menuDiagnosticarFilasSinClaveDigital_' },
        { t: 'Colapso del lector (2.9 A)',          f: 'menuDiagnosticarColapso_' }
      ]}
    ]},

    // --- Plantillas: todo lo que toca Slides, junto ---------------------------
    { t: 'Plantillas', items: [
      { t: 'Inventario de plantillas',            f: 'menuInventarioPlantillas_' },
      { t: 'Diagnosticar carpeta de plantillas',  f: 'menuDiagnosticarCarpetaPlantillas_' },
      // "Fijar plantilla canónica de JM" retirado el 03/08/2026 junto con
      // `repuntarPlantillaCanonicaJM_` (`Armonizar.gs`): era una migración de un solo uso
      // que ya corrió, y el ID que cableaba vive ahora en `INFORMES.plantilla_id`.
      { t: 'Armonizar tokens de plantillas',      f: 'menuArmonizarPlantillas_' },
      // `_11` — escribe sobre la plantilla viva, y el nombre lo dice (`B.6`). Pide confirmación
      // previa con el detalle, a diferencia de "Armonizar", que informa después.
      { t: 'Sellar plantillas (escribe las notas)', f: 'menuSellarPlantillas_' },
      // `C.5` — el control de cierre. Sólo lectura: dice si la hoja y las plantillas coinciden,
      // no repara. Va al lado del sellador porque es su verificación.
      { t: 'Verificar LAMINAS contra las plantillas', f: 'menuVerificarLaminas_' }
    ]}
  ]
};

/**
 * onOpen — construye el menú desde MENU_.
 * Si la tabla queda mal, igual tiene que haber menú: cae a uno mínimo y deja
 * el error en el log. Un onOpen() que tira excepción deja la planilla sin menú.
 */
function onOpen() {
  // Paso 2.14 — acá SÍ va la UI real, no `ui_()`: `onOpen` sólo corre al abrir la
  // planilla, así que siempre hay UI, y necesita `createMenu`, que el sustituto no
  // expone a propósito (un menú sin planilla no significa nada). Es la categoría
  // "construcción de menú": no aplica la generalización.
  var ui = SpreadsheetApp.getUi();
  try {
    construirMenu_(ui, MENU_).addToUi();
  } catch (e) {
    ui.createMenu(MENU_.t + ' (degradado)')
      .addItem('Abrir panel', 'menuAbrirPanel_')
      .addItem('Instalar / reparar hojas', 'instalar')
      .addToUi();
    console.error('onOpen: menú degradado — ' + (e && e.message ? e.message : e));
  }
}

/**
 * construirMenu_ — recorre un nodo de MENU_ y devuelve un Menu de Apps Script.
 * No usa el nodo para nada más: no valida, no lee hojas, no calcula.
 */
function construirMenu_(ui, nodo) {
  var menu = ui.createMenu(nodo.t);
  var items = nodo.items || [];
  for (var i = 0; i < items.length; i++) {
    var it = items[i];
    if (it === '---') { menu.addSeparator(); continue; }
    if (it.items) { menu.addSubMenu(construirMenu_(ui, it)); continue; }
    menu.addItem(it.t, it.f);
  }
  return menu;
}

/**
 * ¿Hay interfaz de planilla en este contexto? (Paso 1.8.)
 * Sobre HTTP —la API de pruebas de Api.gs— no la hay, y `SpreadsheetApp.getUi()`
 * tira excepción en vez de devolver null. No hay otra forma de consultarlo que
 * intentarlo.
 *
 * ⚠ **Esta es la sonda, y su forma no se toca** (Paso 2.14). Es el **único lugar
 * del repo donde `SpreadsheetApp.getUi()` puede tirar a propósito**: acá la
 * excepción es el resultado que se busca, no una falla. En cualquier otro lado se
 * pide la UI con `ui_()`, que ya contempla las dos ramas. Si alguien agrega otro
 * `try { getUi() }` suelto, la garantía se pierde: pasa a haber dos lugares donde
 * una excepción significa cosas distintas.
 */
function hayUi_() {
  try {
    SpreadsheetApp.getUi();
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Paso 2.14 — lo que se pidió mostrar en esta corrida, en orden.
 *
 * Se llena SIEMPRE, haya UI o no: con planilla el texto se muestra *y* se anota;
 * sobre HTTP sólo se anota. Así ningún camino pierde información — que es el punto
 * del paso. Vive a nivel de módulo porque una corrida de Apps Script es de a una
 * por invocación; `Api.gs` lo vacía antes de cada llamada y lo devuelve después,
 * igual que hace con la `traza`.
 */
var UI_DICHO_ = [];

/**
 * Paso 2.14 — la UI, o un sustituto que anota en vez de mostrar.
 *
 * Reemplaza a `var ui = SpreadsheetApp.getUi()` en las 31 funciones de menú. Con
 * planilla delega en la UI real y no cambia nada de lo que ve una persona; sobre
 * HTTP no rompe y guarda el texto en `UI_DICHO_`.
 *
 * **Las dos degradaciones, que son decisiones y no descuidos:**
 *
 * - `alert` sin UI devuelve `null`. Un `alert(…, YES_NO)` usado como confirmación
 *   compara contra `ui.Button.YES`, así que sin UI la comparación falla y el
 *   llamador **corta**. Un confirm que no se puede hacer degrada a *no
 *   confirmado*, nunca a "sí" — que era la preocupación central de este paso.
 * - `prompt` sin UI **tira**. No hay a quién preguntarle y no se inventa una
 *   respuesta. Si una función necesita un dato del usuario para correr por API,
 *   ese dato entra por parámetro: ver `cargarTemario()` en `Reuniones.gs`.
 */
function ui_() {
  var real = hayUi_() ? SpreadsheetApp.getUi() : null;

  return {
    hayUi: !!real,
    texto: function () { return UI_DICHO_.join('\n\n———\n\n'); },

    alert: function () {
      // Apps Script acepta alert(msg), alert(msg, botones) y alert(titulo, msg, botones).
      var partes = [];
      for (var i = 0; i < arguments.length && i < 2; i++) {
        if (typeof arguments[i] === 'string') partes.push(arguments[i]);
      }
      UI_DICHO_.push(partes.join('\n\n'));
      return real ? real.alert.apply(real, arguments) : null;
    },

    prompt: function () {
      if (!real) {
        throw new Error('Se pidió un dato por pantalla y no hay planilla. Sobre HTTP el ' +
          'dato entra por parámetro — ver el encabezado de ui_() en Codigo.gs.');
      }
      return real.prompt.apply(real, arguments);
    },

    ButtonSet: real ? real.ButtonSet : { OK: null, OK_CANCEL: null, YES_NO: null },
    Button: real ? real.Button : { OK: 'OK', YES: 'YES', NO: 'NO', CANCEL: 'CANCEL' }
  };
}

/**
 * Paso 2.14 — aviso liviano (`toast`) con la misma garantía que `ui_()`: se anota
 * siempre y se muestra sólo si hay planilla. Devuelve el texto.
 */
function anunciar_(titulo, texto) {
  UI_DICHO_.push(titulo + '\n\n' + texto);
  if (hayUi_()) SpreadsheetApp.getActiveSpreadsheet().toast(texto, titulo);
  return titulo + '\n\n' + texto;
}

function menuAbrirPanel_() {
  return anunciar_('Abrir panel', 'próximamente');
}

/**
 * Pasos 4 y 5 — deja de ser un "próximamente". Genera el informe de
 * `CONFIG.informe_activo` de punta a punta: copia, secciones repetibles y tokens fijos.
 * La implementación vive en `Generador.gs`, que es el dueño del reemplazo en Slides.
 */
function menuGenerarInforme_() {
  return menuGenerarInformeCompleto_();
}

function menuCargarEjemplo_() {
  return anunciar_('Cargar ejemplo', 'próximamente');
}
