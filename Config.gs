/**
 * Config.gs — Configuración y resolución de período.
 * Expone:
 *   leerConfig()          -> { clave: valor } desde la hoja CONFIG
 *   escribirConfig(k, v)  -> setea una clave en CONFIG
 *   resolverPeriodo(cfg)  -> { desde, hasta, etiqueta, prevDesde, prevHasta }
 * Regla: NADIE hace cuentas de fechas fuera de este módulo.
 * Se completa en: Paso 1.
 */
