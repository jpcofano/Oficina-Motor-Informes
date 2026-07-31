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
        .addSeparator()
        .addItem('Promover fechas elegidas', 'menuPromoverFechasElegidas_')
        .addItem('Sembrar clasificación inicial de solapas', 'sembrarClasificacionSolapas')
        .addItem('Cargar ejemplo', 'menuCargarEjemplo_')
    )
    .addSubMenu(
      ui.createMenu('Diagnóstico y pruebas')
        .addItem('Probar conexión a bases', 'probarConexionBases')
        .addItem('Probar lectura por ventana', 'menuProbarLectura_')
        .addItem('Probar unión y anclaje', 'menuProbarUnionYAnclaje_')
        .addSeparator()
        .addItem('Diagnosticar carpeta de plantillas', 'menuDiagnosticarCarpetaPlantillas_')
        .addItem('Listar solapas y tipos', 'menuDiagnosticarBases_')
        .addItem('Inventariar solapas', 'menuInventariarSolapas_')
        .addItem('Auditoría de solapas (AUD-1)', 'menuAuditarSolapas_')
        .addSeparator()
        .addItem('Detectar columnas de fecha', 'menuDetectarColumnasFecha_')
        .addItem('Validar MAPEO (duplicados)', 'menuValidarMapeo_')
        .addItem('Comparar resúmenes de looker (Parte G)', 'menuCompararResumenesLooker_')
        .addItem('Auditar digital/Digital/alcance (Parte B)', 'menuAuditarAlcanceDigital_')
        .addItem('Auditar fórmulas de looker (Parte D)', 'menuAuditarFormulasResumenesLooker_')
        .addItem('Diagnosticar corte de filas en m2 (Paso 2.8 Parte D)', 'menuDiagnosticarCorteFilasM2_')
    )
    .addSubMenu(
      ui.createMenu('Consolidaciones (decisión + escritura)')
        .addItem('Consolidar mapeos de looker (Parte D)', 'menuConsolidarMapeoLooker_')
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
