# Paso 1 — Lector de registros + conexión a bases en vivo (con caché)

> Requiere Paso 0 hecho (las 6 hojas existen). NO calcular nada todavía: este paso
> lee registros y abre bases; la aritmética sigue solo en `Marcadores.gs` (no tocar).
> Toda la apertura de bases y el caché van en `Fuentes.gs` (acceso a datos), NO en
> `Marcadores.gs`.

Contexto: motor GCBA por registros. El motor descubre bases y plantillas leyendo las
hojas-registro y las referencia por ID lógico (`base_id`, `informe_id`). Detalle en
`Plan Inicial/ARQUITECTURA_registros.md`. Respetá las firmas/contratos de los stubs.

1. **Lectores de registro** (donde indique el contrato; probablemente `Config.gs`/`Fuentes.gs`):
   - `leerBases()` → objeto `{ base_id: {nombre, sheet_id, hoja_default, tipo, activo, notas} }`
     leyendo la hoja `BASES`.
   - `leerInformes()` → `{ informe_id: {nombre, plantilla_id, periodicidad, familias, activo} }`
     leyendo `INFORMES`.
   - Ignorar filas vacías; `activo` como booleano (sí/no, TRUE/FALSE).

2. **Apertura de bases con caché** (en `Fuentes.gs`):
   - `abrirBase(base_id)`:
     a. Resuelve `base_id` en el registro de `BASES`.
     b. Si no existe, está `activo=no`, o `sheet_id` vacío → devolver un resultado
        de estado con `ok=false` y un motivo claro (NO tirar excepción cruda).
     c. Abre la Google Sheet en vivo con `SpreadsheetApp.openById(sheet_id)`.
     d. **Caché por corrida**: mantené un objeto/módulo con las bases ya abiertas;
        si `abrirBase` se llama otra vez con el mismo `base_id`, devolvé la instancia
        cacheada en vez de reabrir. (Ej.: una variable a nivel de módulo o
        `CacheService` no — con un objeto en memoria por ejecución alcanza.)
   - `abrirHoja(base_id, nombre_hoja?)`: usa `abrirBase` y devuelve la hoja pedida
     (o `hoja_default` si no se pasa nombre). Estado `ok=false` si la hoja no existe.

3. **Prueba de conexión** (ítem de menú "Probar conexión a bases"):
   - Para cada base con `activo=sí`, intentar `abrirBase` y, si abre, listar los
     nombres de sus hojas y la cantidad de filas de `hoja_default`.
   - Mostrar un resumen legible (alert/log) con estado por base: ✅ nombre + hojas +
     filas, o ⚠️ base + motivo (sheet_id vacío, no encontrada, sin permiso…).
   - Este resumen es la primera versión de la trazabilidad "de dónde salen los datos".

No leas columnas de datos para cálculo todavía, no reemplaces marcadores, no toques
`Marcadores.gs`. Solo registros, apertura con caché y el reporte de estado.

Prueba del usuario: cargar a mano en `BASES` el `sheet_id` real de RDV (Sheet nativa)
→ correr "Probar conexión a bases" → ver ✅ RDV con sus hojas y filas, y ⚠️ en las
que falte el ID. Correrlo dos veces no reabre RDV (caché).
Al cerrar: commit `Paso 1 ✅ — lector de registros + abrirBase con caché`.
