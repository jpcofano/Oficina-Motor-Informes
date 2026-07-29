/**
 * Codigo.gs — Punto de entrada del proyecto.
 * Responsabilidad: menú de la planilla (onOpen) y ruteo a cada módulo.
 * NO contiene lógica de negocio.
 * Se completa en: Paso 0 (menú) y se amplía en pasos siguientes.
 */

function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('▶ Motor de Informes')
    .addItem('Abrir panel', 'menuAbrirPanel_')
    .addItem('Generar informe', 'menuGenerarInforme_')
    .addSubMenu(
      ui.createMenu('Configuración')
        .addItem('Instalar / reparar hojas', 'instalar')
        .addItem('Cargar config inicial', 'seedConfiguracion')
        .addItem('Registrar plantillas', 'menuRegistrarPlantillas_')
        .addItem('Probar conexión a bases', 'probarConexionBases')
        .addItem('Cargar ejemplo', 'menuCargarEjemplo_')
    )
    .addToUi();
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
