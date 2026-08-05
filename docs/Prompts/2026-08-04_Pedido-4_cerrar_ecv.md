# Pedido — Cerrar la sección 1: el agregado semanal de encuentros

**Estado:** vivo · **Fecha:** 2026-08-04 · **Ubicación:** `docs/Prompts/2026-08-04_Pedido-4_cerrar_ecv.md`

> **Cambia el método.** Hasta ahora se avanzó a lo ancho: un poco de cada pieza. Desde acá se
> cierra **una sección por vez**, con sus números verificados, empezando por las que no iteran.
> Decisión del usuario, 04/08/2026.
>
> **Por qué esta primera.** De los 438 faltantes, **384 son "sin fila en `MARCADORES`"** — 88%. No
> es un problema de datos ni de motor: es cableado sin escribir. Y esta sección es la única que se
> puede cerrar entera hoy: **todo sale de `rdv`**, con solapa explícita. No depende del anclaje, ni
> de `digital`, ni del filtro JM/GCBA, ni del arreglo de la cuenta homónima.
>
> **Y ya tiene números verificados contra los que cerrar.** El corte vertical del 03/08, sobre la
> ventana 24–30/07, dio **2919 inscriptos · 686 asistentes · 12 encuentros**, con los cinco canales
> sumando 2865 (la diferencia de 54 son Mataderos y Palermo del 29, con canales sin cargar).
>
> **Va después del `Pedido-3`? No: va antes.** Esta sección no necesita el filtro.

---

## Parte 0 — Inventario y el problema de la repetición. Sólo lectura. Reportar y **PARAR**.

**0.1 · Los tokens `ecv_*`.** Del inventario de la plantilla de JM: cuáles son, en qué lámina está
cada uno, y cuáles tienen ya fila en `MARCADORES`. Reportar el número: cuántos hay y cuántos están
cableados.

**0.2 · La repetición, que es un error estructural.** `SECCIONES` declara `encuentro` con
`modo = repetible` sobre `REUNIONES` y `familia_tokens = ecv_,enc_`. Eso arrastra los **agregados**
a la repetición: en el deck generado, `ecv_inscriptos`, `ecv_asistentes` y `ecv_encuentros`
aparecen **cinco veces**, una por encuentro anclado. Son totales de la semana. Un total semanal
repetido cinco veces está mal por construcción, y ninguna corrida lo iba a marcar como error.

Reportar, token por token de la familia `ecv_`, cuál es **agregado semanal** y cuál es **por
encuentro**. La distinción se ve en el propio nombre y en la lámina: `ecv_encuentros` es un conteo
de la semana; `ecv_barrio` en singular y `ecv_poblacion` son de un encuentro. **Reportar la
clasificación completa, sin implementarla.**

**0.3 · La ventana.** Confirmar qué devuelve `resolverVentana({})` hoy y cuántas filas de
`rdv/RVD JM-CM - ES` caen dentro tras `D-21`. Si no da 24–30/07 y 12 filas, los números de
referencia de arriba no aplican y hay que decirlo antes de comparar nada.

**Reportar `0.1`–`0.3` y PARAR.**

---

## Parte A — Separar el agregado de lo repetible

Con la clasificación de `0.2`, partir en dos:

- una sección **`unica`** para los agregados semanales;
- la sección repetible sobre `REUNIONES` se queda **sólo** con lo que es de un encuentro.

Es configuración de `SECCIONES`, reversible, y el diff lo muestra. **Correr el diff antes y
después; la referencia es `protegidas (con diferencia): 0`.**

Si algún token queda ambiguo entre las dos, **no lo asignes**: dejalo donde está, listalo aparte y
seguí. Un token mal ubicado en la sección equivocada es el mismo error que estamos corrigiendo.

---

## Parte B — Cablear

Los tokens agregados, contra `rdv`, **solapa explícita** — `rdv` tiene dos solapas `fuente`, así
que no hay inferencia y una solapa vacía falla.

Sin nombres `prueba_`: acá van los **canónicos**, porque estos sí son los tokens del informe.

Lo que no se pueda cablear —porque no hay columna en `MAPEO`, o porque el dato no está en `rdv`—
se lista con el motivo y **no se inventa**. La sección se cierra con lo que se puede y lo que falta
queda dicho.

---

## Parte C — El separador de miles

El deck salió con `6161`, `2229`, `37763`. El informe publicado usa `6.161`. Es formato, no
aritmética.

Revisar el formateador y que los tokens de esta sección salgan con separador de miles. **Los
porcentajes y las fechas no se tocan.** Y cuidado con el formato `fraccion`, que se creó anoche
precisamente porque las cajas de JM ya traen su propio `%`.

**Control positivo:** un cero sale `0`, no vacío; un no numérico no sale `NaN`.

---

## Parte D — Cerrar contra los números

Generar el informe y comparar, token por token:

- `ecv_inscriptos` = **2919**
- `ecv_asistentes` = **686**
- `ecv_encuentros` = **12**
- la suma de los cinco `ecv_insc_*` = **2865**, y la diferencia contra `ecv_inscriptos` = **54**,
  que son Mataderos y Palermo del 29 con los canales sin cargar.

**Si un número no cierra, reportá la diferencia y pará. No ajustes nada para que cierre.**

Y verificar lo que la Parte A tenía que arreglar: que los agregados aparezcan **una sola vez** en
el deck, no cinco.

---

## Parte E — Que el anclaje quede registrado

Lo pide el hallazgo del día: el motor leyó la cuenta `3347-JULJDGAG` en vez de `3387-JULJDGGC`
—dos campañas homónimas— y **no hay forma de auditarlo desde el sistema**. `ANCLAJE_PENDIENTE` está
vacía y `VALORES` no tiene ni una fila, aunque `Valores.gs` existe y `registrarValorCalculado_`
está escrito.

Hacer que el anclaje escriba: por cada ítem, **qué `id_cuenta` se eligió, con qué score, y si hubo
más de un candidato**. Sin eso, el próximo error de cuenta se descubre igual que este —a mano,
comparando contra un informe publicado— y eso no escala.

**No arreglar el desempate acá.** El empate técnico es de `Union.gs` y va en la sección 3. Esta
parte es sólo dejar rastro.

---

## Qué NO hacer

- No tocar `enc_*`: es la sección 3, bloqueada por la cuenta homónima.
- No cambiar `ULTIMO` por `SUMA` todavía, aunque `VALIDACION §3.2` diga que IVR cierra por `SUMA`.
  Va con la sección 3, junto con el arreglo de la cuenta, y se mide el antes y el después.
- No implementar el filtro JM/GCBA: es el `Pedido-3`.
- No agregar columnas a `headers` antes que a `COLUMNAS_DELTA_`.
- No ajustar ningún número para que cierre.
- Sin trailer `Co-Authored-By`.

**Modelo:** Opus.
