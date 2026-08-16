# Paso 0 (v2) — `instalar()` + `onOpen()` con registros extensibles

> Reemplaza al Paso-0 anterior. Cambio clave: las hojas de config pasan de 5 a **6**
> (se agrega `BASES`), y CONFIG deja de tener IDs de bases/plantillas.
> NO calcular nada. NO leer bases en vivo. Solo estructura y menú.
> Regla de oro: la aritmética vive SOLO en `Marcadores.gs` — no tocar acá.

Contexto: motor de informes GCBA, Apps Script vinculado a la planilla de control
"Motor de Informes". Diseño por **registros**: el motor descubre bases y plantillas
leyendo hojas-registro, nunca las nombra en el código. Detalle completo en
`Plan Inicial/ARQUITECTURA_registros.md`.

1. Ubicá los stubs que declaran `instalar()` y `onOpen()` por los encabezados de
   los `.gs`. Respetá firmas/contratos ya escritos; si difieren de lo de abajo,
   mandá lo del contrato.

2. `onOpen()`: menú "▶ Motor de Informes" con el ítem "Instalar / reparar hojas"
   → llama a `instalar()`. Futuros ítems del panel como placeholders (toast
   "próximamente").

3. `instalar()`: crear de forma IDEMPOTENTE **6 hojas** con encabezados y 1–2 filas
   de ejemplo:

   - **CONFIG** (clave/valor, solo global):
     `periodo_desde`, `periodo_hasta`, `informe_activo`, `carpeta_salida`.

   - **BASES** (una fila por fuente en vivo):
     `base_id | nombre | sheet_id | hoja_default | tipo | activo | notas`
     Filas ejemplo: `rdv`, `digital`, `looker`, `m2` (activo=sí, sheet_id vacío
     para completar a mano), y `miba` (activo=no, parqueada).

   - **INFORMES** (una fila por plantilla/informe):
     `informe_id | nombre | plantilla_id | periodicidad | familias | activo | notas`
     Filas ejemplo: `jm` (semanal), `secco` (mensual).

   - **MARCADORES** (un token por fila):
     `marcador | familia | informe_id | base_id | campo_logico | calculo | formato | notas`
     Ejemplos: `ecv_inscriptos` (informe_id `*`, base `rdv`), `camp_alcance`
     (`*`, `looker`), `m2_envios` (`jm`, `m2`).

   - **MAPEO** (campo lógico → columna, por base):
     `base_id | campo_logico | hoja | columna | notas`
     Ejemplos: `rdv/inscriptos`, `digital/alcance`.

   - **CAMPANAS** (campañas seleccionables):
     `campana_id | nombre | informe_id | base_id | tipo | mostrar | orden`
     Ejemplos: `serv_esenciales` (tipo `destacada`), `encuentros_min`
     (`encuentro_ministros`), `prov_uber` (`proveedor`, mostrar=no).

   Idempotencia: si la hoja existe, reescribí encabezados sin duplicarla y sin
   pisar filas cargadas por el usuario. Borrá "Hoja 1"/"Sheet1" si quedó vacía.
   Al terminar, toast/alert con resumen (hojas creadas vs. actualizadas).

No toques `Marcadores.gs`. No agregues lógica de cálculo ni lectura de bases en vivo.

Prueba del usuario: recargar la planilla → ver el menú → "Instalar / reparar hojas"
→ aparecen las **6** hojas con ejemplos. Correr dos veces seguidas no duplica nada.
Al cerrar el paso: commit `Paso 0 ✅ — instalar() + onOpen() (6 hojas registro)`.

---

## Addendum — 16/08/2026 · `secco` es **semanal**, no mensual

> **El cuerpo no se edita** (`CLAUDE.md` §7: un prompt ejecutado es evidencia congelada). Esto
> corrige un dato del cuerpo que venció.

La línea de ejemplo de `INFORMES` dice *"Filas ejemplo: `jm` (semanal), `secco` (mensual)"*.
**`secco` es semanal**, declarado por el usuario el 16/08/2026, y el seed de `Instalar.gs` ya está
corregido.

**La corrección es documental y no cambia comportamiento:** medido el 16/08, la columna
`INFORMES.periodicidad` **no tiene un solo lector en el código**. La ventana real la resuelve la
cadena de `D-20`, y hoy los dos informes caen en `CONFIG`.

Queda anotado acá porque este prompt es de dónde salió el valor original, y **la próxima vez que
alguien lo lea como referencia del seed va a encontrar la corrección al lado**, en vez de propagar
el valor viejo.
