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
        .addItem('Diagnosticar carpeta de plantillas', 'menuDiagnosticarCarpetaPlantillas_')
        .addItem('Registrar plantillas', 'menuRegistrarPlantillas_')
        .addItem('Probar conexión a bases', 'probarConexionBases')
        .addItem('Probar lectura por ventana', 'menuProbarLectura_')
        .addItem('Detectar columnas de fecha', 'menuDetectarColumnasFecha_')
        .addItem('Promover fechas elegidas', 'menuPromoverFechasElegidas_')
        .addItem('Validar MAPEO (duplicados)', 'menuValidarMapeo_')
        .addItem('Cargar ejemplo', 'menuCargarEjemplo_')
    )
    .addSubMenu(
      ui.createMenu('Mantenimiento')
        .addItem('Inventario de plantillas', 'menuInventarioPlantillas_')
        .addItem('Fijar plantilla canónica de JM (una vez)', 'menuRepuntarPlantillaCanonicaJM_')
        .addItem('Armonizar tokens de plantillas', 'menuArmonizarPlantillas_')
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
