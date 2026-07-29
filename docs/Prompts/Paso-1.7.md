# Paso 1.7 — Seed de configuración inicial (BASES + MAPEO + CONFIG)

> Requiere Pasos 0 y 0.5 (las hojas existen). Este helper CARGA los valores reales en
> `BASES`, `MAPEO` y `CONFIG` para no hacerlo a mano. Es idempotente (upsert por clave).
> NO calcular, NO tocar `Marcadores.gs`. Va en `Instalar.gs`.

Contexto: motor GCBA por registros. Los IDs de las bases vivas ya están confirmados.
Detalle de M2 en `Plan Inicial/M2_mapeo_y_config.md`.

Implementá `seedConfiguracion()` (y sumala al menú como "Cargar config inicial") que
escriba, con **upsert** (si la fila/clave existe la actualiza, no duplica; no pisa
filas que el usuario haya agregado):

## BASES
| base_id | nombre | sheet_id | hoja_default | tipo | activo | notas |
|---|---|---|---|---|---|---|
| rdv | RDV JM CM ES + funcionarios | 1ZpHO6Ru1uY2r9WfBF_yFtu5z7ip7F3Q6VOoRJN5vLAo | RVD JM-CM - ES | google_sheets | sí | Encuentros |
| digital | Seguimiento Digital | 1LadILzFpyCrZRapxgDOFOldSoRawjKkWMaFci_ilhPY | Digital | google_sheets | sí | Campaña por canal |
| looker | Base Looker | 1t6Ji4Cd5lTeBEBBVIoIJUOWjvsOzWBDZmKN163rHKaQ | resumen_metricas | google_sheets | sí | Consolidado |
| m2 | M2 Reporte para Fede 2026 | 1_GS01-TXrhez0GlpFf4bUjWLNQPfaW9BOFFXz0hZNvY | M2 periodo DIRECTA | google_sheets | sí | Directa + Digital en hojas separadas |
| miba | Integración MiBA | | | google_sheets | no | Parqueada |

> Si en el Paso 2 se agregan las columnas `fila_encabezado` / `modo_periodo` a BASES,
> setear para `m2`: `fila_encabezado=3`, `modo_periodo=snapshot`; el resto default
> (`fila_encabezado=1`, `modo_periodo=filtrar`).

## MAPEO (arranque; se completa a medida que se necesiten campos)
| base_id | campo_logico | hoja | columna | notas |
|---|---|---|---|---|
| rdv | inscriptos | RVD JM-CM - ES | *(a confirmar)* | verificar col real |
| rdv | fecha | RVD JM-CM - ES | *(a confirmar)* | col de fecha para filtrar |
| m2 | campana | M2 periodo DIRECTA | B | |
| m2 | fecha | M2 periodo DIRECTA | C | |
| m2 | envios | M2 periodo DIRECTA | D | |
| m2 | entregados | M2 periodo DIRECTA | E | |
| m2 | aperturas | M2 periodo DIRECTA | F | |
| m2 | or | M2 periodo DIRECTA | G | |
| m2 | clics | M2 periodo DIRECTA | H | |
| m2 | ctor | M2 periodo DIRECTA | I | |
| m2 | impresiones | M2 periodo DIGITAL | F | |
| m2 | alcance_dig | M2 periodo DIGITAL | G | |
| m2 | views | M2 periodo DIGITAL | I | |
| m2 | clics_dig | M2 periodo DIGITAL | K | |
| m2 | campana_dig | M2 periodo DIGITAL | B | |

## CONFIG (solo si están vacías; NO pisar si el usuario ya cargó)
| clave | valor |
|---|---|
| informe_activo | jm |
| periodo_desde | *(dejar vacío para que lo cargue el usuario)* |
| periodo_hasta | *(vacío)* |
| carpeta_salida | *(vacío)* |

Reporte final (alert/log): filas escritas/actualizadas por hoja, y aviso de los campos
`*(a confirmar)*` que quedan pendientes de completar.

Las columnas de RDV (`inscriptos`, `fecha`) las dejo sin número porque hay que
confirmarlas contra la hoja real — al correr "Probar conexión"/"Probar lectura" se ven
los encabezados y se completan.

Prueba del usuario: correr "Cargar config inicial" → `BASES` con las 5 bases, `MAPEO`
con las filas de M2 cargadas, sin duplicar si se corre dos veces.
Al cerrar: commit `Paso 1.7 ✅ — seed de configuración (BASES + MAPEO + CONFIG)`.
