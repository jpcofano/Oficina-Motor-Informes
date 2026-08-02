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
      { t: 'Calcular corte vertical',    f: 'menuCorteVerticalRetiro2407_' },
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
      { t: 'Armonizar tokens de plantillas',      f: 'menuArmonizarPlantillas_' },
      { t: 'Fijar plantilla canónica de JM',      f: 'menuRepuntarPlantillaCanonicaJM_' }
    ]}
  ]
};

/**
 * onOpen — construye el menú desde MENU_.
 * Si la tabla queda mal, igual tiene que haber menú: cae a uno mínimo y deja
 * el error en el log. Un onOpen() que tira excepción deja la planilla sin menú.
 */
function onOpen() {
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
 * tira excepción en vez de devolver null. Una función de menú que quiera ser
 * invocable desde afuera pregunta acá antes de alertar. No hay otra forma de
 * consultarlo que intentarlo.
 */
function hayUi_() {
  try {
    SpreadsheetApp.getUi();
    return true;
  } catch (e) {
    return false;
  }
}

function menuAbrirPanel_() {
  SpreadsheetApp.getActiveSpreadsheet().toast('próximamente', 'Abrir panel');
}

function menuGenerarInforme_() {
  SpreadsheetApp.getActiveSpreadsheet().toast('próximamente', 'Generar informe');
}

function menuCargarEjemplo_() {
  SpreadsheetApp.getActiveSpreadsheet().toast('próximamente', 'Cargar ejemplo');
}
