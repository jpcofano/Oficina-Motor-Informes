/**
 * Generador.gs — Copia la plantilla de Slides y reemplaza marcadores.
 * Expone:
 *   generarInforme(informeId, periodo) -> { url, id, cobertura }
 * Copia PLANTILLA -> reemplaza {{marcador}} por valorFormateado ->
 * resalta en amarillo los de estado 'sin_datos' (no los deja en blanco) ->
 * guarda en la carpeta de Drive -> devuelve link + % de cobertura.
 * Se completa en: Paso 4 (reemplazo) y Paso 5 (resaltado + cobertura).
 */
