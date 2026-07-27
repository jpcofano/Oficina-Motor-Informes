/**
 * Marcadores.gs — EL CORAZÓN. Resuelve cada marcador definido en MARCADORES.
 * Expone:
 *   resolverMarcadores(informeId, periodo) -> {
 *     marcador: { valor, valorFormateado, estado, traza }
 *   }
 *   estado : 'ok' | 'sin_datos' | 'error'
 *   traza  : texto legible del cálculo ("SUMA de Inscriptos sobre 13 filas")
 * Operaciones: SUMA, CONTEO, RATIO, ULTIMO (stock), TEXTO.
 * Toda la aritmética del informe vive acá y en ningún otro lado.
 * Se completa en: Paso 3.
 */
