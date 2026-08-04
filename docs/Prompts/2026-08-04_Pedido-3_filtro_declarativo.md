# Pedido — El filtro declarativo: por marcador y por sección

**Estado:** vivo · **Fecha:** 2026-08-04 · **Ubicación:** `docs/Prompts/2026-08-04_Pedido-3_filtro_declarativo.md`

> **Orden:** va después del `Pedido-2` (validar el deck) y de la Parte E del `Pedido-1`.
>
> **Qué resuelve.** Hoy el único filtro es `MAPEO.valores_incluidos`, que se aplica **al leer la
> solapa, para toda la corrida**. Por eso las láminas de resumen de JM y de GCBA no pueden
> convivir: `mail_envios` y `gcba_mail_envios` leen la misma solapa y necesitan mitades
> distintas del mismo universo.
>
> **Decisiones del usuario, 04/08/2026:**
> - **JM es `jorge.macri@buenosaires.gob.ar`. Todo el resto es GCBA**, incluidas las direcciones
>   que aparezcan en el futuro. No hay lista declarada de las otras veinte.
> - **Cada fila de `digital/Directa Mail` es un envío.**
> - **La lámina de agregados de campaña es JM+GCBA junta**, y no lleva corte.
> - **La lámina de desagregados muestra el remitente por fila**, en la primera columna de su
>   tabla. El remitente ahí es un dato, no un filtro.
> - **Se implementan los dos niveles de filtro**: por marcador y por sección.

---

## Parte 0 — Verificación. Sólo lectura. Reportar y **PARAR**.

**0.1 · `SECCIONES.filtro` ya existe y ya se usa.** `comunicaciones_post` la lleva con el valor
`etapa=post`. Reportar: el esquema vivo de `SECCIONES`, cuántas filas tienen `filtro` con valor,
con qué sintaxis, y —lo que más importa— **si algún código la lee hoy o está declarada y muerta**.

**0.2 · `MARCADORES` no tiene columna de filtro.** Confirmarlo contra la hoja viva.

**0.3 · La pauta digital sí tiene señal.** `digital/Digital` columna B está mapeada como
`dig_jm_gcba`. Reportar sus valores distintos con conteo y cuántas cuentas cubre. Es la fuente del
corte para los tokens de pauta e impresiones — **distinta del vocero**, que clasifica quién habla
en el audio y no de quién es la campaña.

**0.4 · Los tokens de remitente que faltan en la plantilla.** En la tabla de envíos de la lámina
de desagregados, sólo el **primer** envío tiene token de remitente; los envíos 2 a 5 tienen fecha
y audiencia pero no remitente. Reportar el inventario exacto de esa tabla: qué token hay en cada
celda y cuáles faltan.

**0.5 · El remitente suelto de esa misma lámina.** Hay un token de remitente **fuera** de la
tabla. Si cada fila ya dice quién envió, no está claro qué debería mostrar ese. Reportar dónde
está y qué literal tiene hoy la caja. **No cablearlo.**

**0.6 · Cuántos envíos tiene una campaña, de verdad.** La tabla de desagregados tiene **cinco**
filas fijas. El usuario pidió que entren todos los envíos y que, si no entran, la lámina se repita.
**Antes de construir eso hay que saber si hace falta.**

Sobre `digital/Directa Mail`, donde cada fila es un envío, agrupando por `id_cuenta`: reportar el
**máximo** de envíos de una cuenta, la distribución (cuántas cuentas con 1, 2, 3, 4, 5, y cuántas
con más de 5), y el máximo **dentro de la ventana** del informe, que es el que manda. Si ninguna
cuenta pasa de cinco en una ventana, la Parte G no se hace y se anota por qué.

**Reportar `0.1`–`0.6` y PARAR.**

---

## Parte A — La columna `filtro` en `MARCADORES`

Una columna nueva, con la misma sintaxis que ya usa `SECCIONES`: `campo=valor`, más la negación
`campo!=valor`.

**Usar `!=`, no `≠`.** El símbolo matemático se rompe al copiar, pegar y exportar una hoja, y el
corte de GCBA es precisamente una negación — es la forma que más se va a escribir.

**Orden crítico, y no es negociable:** la columna entra **primero a `COLUMNAS_DELTA_`, y recién
después a los `headers`**. Al revés, la corrida intermedia cae en la rama sin delta y reescribe la
fila 1 sobre las filas curadas. Es lo que pasó con `SECCIONES` y `periodo_ref`. Correr el diff
antes y después; la referencia es `protegidas (con diferencia): 0`.

**Celda vacía = sin filtro**, igual que `valores_incluidos`. Las filas existentes no cambian de
comportamiento.

---

## Parte B — Aplicarlo en el despachador

El filtro se aplica **después de leer**, sobre las filas del `ctx`, no dentro de `leerFuente` —
que es lo que hace `valores_incluidos` y lo que impide que dos marcadores lean mitades distintas
de la misma solapa.

- El `campo` se resuelve por `buscarMapeo` sobre la base y solapa del marcador. Si no existe,
  falla con motivo propio, no con excepción.
- La comparación **normaliza los dos lados** con `normalizarValorDeclarado_`, que es el canónico.
  No escribir uno nuevo.
- La traza dice qué filtro se aplicó y **cuántas filas quedaron de cuántas**. Sin eso, un filtro
  mal escrito devuelve cero y se lee igual que un dato faltante.
- Un filtro que deja **cero filas** sale `sin_datos` con el motivo, no `0`.

**Control positivo:** dos marcadores sobre la misma base y solapa, uno con `=` y otro con `!=`
sobre el mismo campo, tienen que sumar el total sin filtro.

---

## Parte C — Cablear el corte que ya se puede

**Mail.** Los ocho tokens de las dos láminas de resumen: los de JM con
`mail_remitente=jorge.macri@buenosaires.gob.ar`, los de GCBA con `mail_remitente!=` la misma
dirección. El `campo_logico` real de la columna G de `digital/Directa Mail` lo dice `MAPEO`, no
este prompt.

**Pauta e impresiones.** Los tokens que salgan de `digital/Digital`, con `dig_jm_gcba`.

**SMS.** Todo GCBA por decisión del usuario: **sin filtro**, y anotado en la nota de la fila para
que nadie lo lea como un olvido.

**Call center: no se cablea el corte.** `cc_*` sale de `looker/resumen_metricas_dinamico` y ahí no
hay columna que diga de quién es cada fila. Ver la Parte F.

---

## Parte D — `SECCIONES.filtro`, heredado

Los marcadores de una sección heredan su filtro. **El marcador gana si declara el suyo.** En una
sección repetible, la iteración inyecta el valor de la vuelta.

Si `0.1` muestra que `SECCIONES.filtro` está declarada pero **nunca se lee**, esta parte es
implementarla, no extenderla — y `comunicaciones_post` con `etapa=post` es el primer caso que
tiene que empezar a funcionar. Reportar si empieza.

---

## Parte E — Los tokens de remitente que faltan en la plantilla

Agregar el token de remitente a los envíos 2 a 5 de la tabla de desagregados, siguiendo la
convención del que ya existe para el primero. **Va por la armonización**, que el usuario autorizó
el 04/08 para la plantilla de JM, con su backup obligatorio.

**Sólo JM.** SECCO no se toca.

**No cablear el remitente suelto de esa lámina** — es la pregunta de `0.5`.

---

## Parte F — El call center, contra el informe publicado

Criterio del usuario, 04/08: **si el número cierra contra el informe publicado, está bien; si no,
es un problema metodológico y hay que decirlo.**

Sumar todo `cc_*` de la ventana sin cortar por entidad y comparar contra lo que el informe
publicado muestra en su lámina de GCBA. Reportar la diferencia. **No cablear nada** hasta saber
si cierra: si cierra, el "total" ya incluía a JM y eso es lo que el equipo publica; si no cierra,
falta una fuente y se anota como pendiente.

---

---

## Parte G — Desborde de la tabla de envíos. **Condicional a `0.6`.**

Pedido del usuario, 04/08: la lámina de desagregados tiene que mostrar **todos** los envíos, y si
no entran en la tabla, **repetirse en otra lámina**.

**Si `0.6` muestra que ninguna cuenta supera cinco envíos en una ventana: no se hace.** Se anota
el número medido en `PENDIENTES_consistencia.md` como `P2`, con la fecha, para que cuando alguien
vuelva sobre esto sepa que se midió y no se olvidó.

**Si alguna lo supera**, la lámina pasa de `modo = unica` a repetible, y **eso es un tipo de
iteración nuevo**: no itera sobre una tabla de configuración como `REUNIONES` o `CAMPANAS`, sino
sobre **tandas de cinco filas de datos**. No inventarlo entero acá: reportar cuántas láminas harían
falta en el peor caso medido, proponer cómo se declara en `SECCIONES`, y **parar**. Cambiar el modo
de iteración toca la maquinaria del Paso 5 y lo decide el usuario.

En los dos casos, dejar dicho qué pasa con los envíos que hoy no entran: **se pierden en silencio**.
Una lámina que muestra cinco de siete envíos sin decirlo es peor que una que falta.

---

## Qué NO hacer

- No usar `≠`: la sintaxis es `!=`.
- No mover el filtro dentro de `leerFuente`.
- No agregar la columna a `headers` antes que a `COLUMNAS_DELTA_`.
- No escribir un normalizador nuevo.
- No cablear el corte de call center.
- No construir el desborde de la tabla sin el número de `0.6`.
- No tocar la plantilla de SECCO.
- Sin trailer `Co-Authored-By`.

**Modelo:** Opus.
