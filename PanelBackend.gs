/**
 * PanelBackend.gs — Funciones que Panel.html invoca vía google.script.run.
 * Sin lógica de negocio: orquesta módulos y devuelve datos planos.
 * Expone:
 *   panel_getPeriodos()             -> períodos cerrados detectados en los datos
 *   panel_getCamposFuente(fuente)   -> encabezados de la hoja (para los dropdowns)
 *   panel_getPreview(informe, per)  -> tabla marcador/valor/estado/traza
 *   panel_addMarcador(def)          -> agrega una fila a MARCADORES
 *   panel_generar(informe, per)     -> link del deck generado
 * Se completa en: Pasos 6-8.
 */

function abrirPanel() {
  // TODO (Paso 6): HtmlService.createHtmlOutputFromFile('Panel') como sidebar.
}
