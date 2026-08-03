# Paso 2.5 — Sembrar `MARCADORES` desde los tokens de las plantillas

**Estado:** vivo · **Actualizado:** 2026-08-02 · **Reemplaza:** el texto anterior de este
mismo archivo (nunca ejecutado, se edita en el lugar — no lleva addendum).

> **Regla de oro:** este paso NO calcula nada. Lee los `{{token}}` de las plantillas de
> Slides y escribe filas de config. La aritmética llega en el Paso 3.
>
> **Un commit por parte.**

## Qué cambió respecto de la versión anterior

- **Se agregó Parte 0**: el bloqueo declarado abajo hay que verificarlo, no asumirlo.
- **Bloques repetibles** (`docs/TOKENS.md §3`): el prompt deduplicaba por nombre de token
  entre slides, pero no contemplaba que un token de bloque repetible es **una** fila, no una
  por instancia. Era el punto vivo del P2 de `PENDIENTES_consistencia.md`.
- **Choque con el `Paso-2.13`**, que hay que resolver antes de correr cualquiera de los dos.
- **Headless**: el 2.14 generalizó `hayUi_()`; los dos reportes tienen que devolverse por
  respuesta, no sólo por `alert`.
- **`ESCRITORES.md`**: este paso crea el primer escritor vivo de `MARCADORES`.

> El P2 de `PENDIENTES` también decía que la tabla de columnas usaba `calculo`. **Ya está
> corregido en este archivo** — dice `operacion` e incluye `valor_fijo`. Reportarlo al cerrar
> para que el pendiente se actualice.

---

## Parte 0 — Verificación de premisas. Sólo lectura. Reportar y **PARAR**.

**0.1 · El bloqueo.** Este paso declara que no se corre hasta que la armonización de
plantillas (`Paso-2.2.2` Parte D, sobre la JM canónica) esté verificada. **Verificar contra
`BITACORA.md` si cerró.** Si no cerró, este paso no arranca: sembrar antes es sembrar ~200
filas de tokens que todavía pueden cambiar de nombre, y deshacerlo es a mano, fila por fila.

> **Corrido el 03/08/2026 — ❌ NO cerró, y es lo que para el paso.** Verificado contra la
> plantilla viva, no contra la bitácora: `inventariarPresentacion_('jm', '117I0qn1…')`
> devuelve **los cinco tokens viejos** de `TOKENS_VIEJOS_DIAGNOSTICO_` —`enc_audiencia_ivr`,
> `enc_audiencia_pauta`, `enc_clics`, `rrss_prom`, `m2_clics_a`— más el literal `135` suelto.
> El encabezado de `docs/TOKENS.md` dice lo mismo con todas las letras.
>
> **Y esa lista de cinco es una muestra, no un censo:** la lista de renombres real de JM
> (`RENOMBRES_ARMONIZACION_POR_INFORME_`, `Armonizar.gs`) tiene **21 entradas**. Sembrar
> ahora crea hasta 21 filas destinadas a cambiar de nombre.
>
> *(Corrección del 03/08/2026, mismo día: acá decía **23** y en otros lados **25**. Son
> **21** — 5 no-`m2` y 16 `m2`—, contadas por el código y no a ojo. Es la nota de método 1 de
> `docs/PLAN.md`: una cifra redonda que se lee como medida.)*
>
> **Quién lo destraba, y no es Code:** el `P1` de la caja `{{m2_salud_camp}}` huérfana
> (`docs/PENDIENTES_consistencia.md`). Son dos opciones excluyentes y es **decisión del
> usuario**, no criterio técnico (`C-01`). Aplicar `m2_camp4`→`m2_salud_camp` con esa caja
> ahí deja **dos cajas con el mismo token** — la regresión de `enc_audiencia` otra vez.
>
> **`SECCO` sí está armonizada** (cero tokens viejos de la muestra). El bloqueo es de **JM**,
> que es justamente el único informe del Tramo 2.

**0.2 · `INFORMES.plantilla_id`.** `SEED_INFORMES_` (`Instalar.gs`, buscar por nombre) los
tiene vacíos. Verificar contra la planilla viva si la hoja los tiene cargados. Sin
`plantilla_id` no hay de dónde leer tokens.

> **Verificado el 03/08/2026 (auditoría de premisas): la hoja viva también los tiene
> vacíos**, en `jm` y en `secco`. Este paso **no puede correr**: la Parte A saltearía los dos
> informes. El bloqueo es cargar los dos `plantilla_id`.
>
> **✅ RESUELTO el mismo 03/08, más tarde.** Los dos están cargados y los declara
> `SEED_INFORMES_`, no la hoja sola: `jm` → `117I0qn1…` (`JM_marcada`, 22 slides, 158 tokens
> distintos), `secco` → `1_ZKjWhL…` (`SECCO_marcada`, 29 slides, 119 tokens). Verificado con
> `inventarioPlantillas()`, que las abre leyendo `INFORMES`. **Esta premisa ya no bloquea** —
> la que bloquea es la 0.1.

**0.3 · El choque con el `Paso-2.13` — ✅ RESUELTO el 02/08/2026. Ganan las plantillas.**

**Decidido en `docs/PLAN.md` `D-17`.** Este paso ya no está bloqueado y el `Paso-2.13`
tiene su Parte 1 sin efecto: **`SEED_MARCADORES_` no se hace.**

El planteo se conserva entero, porque es el argumento que va a hacer falta si alguien lo
reabre —y porque el caso vale por sí mismo: fue la única vez que se vieron **dos dueños para
la misma hoja antes** de que ocurriera, en vez de descubrirlos después con un censo.

`Paso-2.13` proponía `SEED_MARCADORES_` — un arreglo en código como fuente de las filas de
`MARCADORES`. Este paso las siembra **desde las plantillas**. Lo que se pesó:

- **A favor de las plantillas — ganó.** La plantilla **ya es** la fuente de verdad de qué
  tokens existen: si un token no está en la lámina, no hay nada que reemplazar. Con
  `SEED_MARCADORES_` en código, agregar un informe exige editar un `.gs`, que es exactamente
  el número que `D-01` mide y quiere bajar. Y un seed sería una segunda copia de un dato que
  ya vive en otro lado, con el ciclo de divergencia de siempre.
- **A favor del seed en código — no alcanzó.** Su fuerza era la idempotencia y el diff
  auditable, que `Paso-2.11 C.2` costó tres corridas de protocolo conseguir para las otras
  hojas. **Pero la idempotencia acá no la da el seed: la da `upsertSoloVacias_`**, que sólo
  completa celdas vacías y nunca pisa lo que una persona configuró. Con eso el argumento
  queda cubierto sin pagar el costo de `D-01`.

**Qué queda por hacer en esta parte 0.3:** nada. Se deja escrito para no volver a discutirlo
sin evidencia nueva.

**0.4 · Reportar y parar.**

---

## Por qué

`MARCADORES` tiene hoy 3 filas de ejemplo y necesita ~200 (JM ≈110 tokens, SECCO similar).
Cargarlas a mano es un día de trabajo y propenso a errores de tipeo que **no fallan
ruidosamente**: un token mal escrito queda sin reemplazar en el deck y nadie se entera.

Este paso invierte el trabajo: en vez de escribir 200 filas, se revisan 200 ya creadas.

**Lo que el helper NO hace:** decidir de dónde sale cada token. `base_id`, `campo_logico` y
`operacion` quedan **vacíos a propósito** — eso es criterio humano y se completa en el Paso
3. El helper sólo garantiza que no falte ni sobre ningún token.

---

## Parte A — `sembrarMarcadoresDesdePlantillas()`

En `Instalar.gs`, junto a `seedConfiguracion`, y al menú como **"Sembrar marcadores desde
plantillas"**.

**1. Recorrer `INFORMES`** (vía `leerInformes()`), filas con `activo=sí` y `plantilla_id`
cargado. Si una activa no tiene `plantilla_id`, avisar y saltearla.

**2. Por cada plantilla**, abrirla con `SlidesApp.openById(plantilla_id)` y extraer todos
los `{{token}}`:

- Recorrer `getSlides()`, y en cada slide `getShapes()`, `getTables()` (celda por celda) y
  `getGroups()` **recursivamente** — hay tokens dentro de tablas y grupos, no sólo en cajas
  sueltas.
- Texto con `getText().asString()`, patrón `/\{\{([^}]+)\}\}/g`.
- Guardar el **número de slide** (1-based) de la primera aparición.
- **Deduplicar por nombre de token**: repetido en varias slides es **una sola** fila.

**2-bis. Bloques repetibles (`docs/TOKENS.md §3`).** Un token que vive dentro de un bloque
repetible —el de encuentro, y el de campaña que emite el Paso 5— es **una fila** en
`MARCADORES`, no una por instancia. La instancia la resuelve el motor en tiempo de corrida
iterando la hoja curada; `MARCADORES` describe el token, no sus apariciones. Detectar el
caso y anotarlo en `notas` (p. ej. `bloque repetible: encuentro`), porque un humano leyendo
la hoja necesita saber por qué ese token no tiene período propio.

**3. Escribir en `MARCADORES`**, clave **`(informe_id, marcador)`**:

| columna | valor |
|---|---|
| `marcador` | el token sin llaves, p. ej. `ecv_inscriptos` |
| `familia` | prefijo hasta el primer `_`. Sin `_`, familia = el token entero |
| `informe_id` | el de la plantilla |
| `base_id` | **vacío** |
| `solapa` | **vacío** (criterio humano — `docs/TOKENS.md §4`) |
| `campo_logico` | **vacío** |
| `periodo_ref` | **vacío** |
| `operacion` | **vacío** |
| `valor_fijo` | **vacío** |
| `formato` | **vacío** |
| `notas` | `slide N`, más la marca de bloque repetible si aplica |

> **Usar `upsertSoloVacias_` (función nueva, se implementa acá), no `upsertPorClave_`.**
> `upsertPorClave_` reescribe la fila entera: si un humano ya cargó `base_id`, se lo borra.
> **No modificar `upsertPorClave_`** — `seedConfiguracion` depende de que pise la fila
> entera, y tocarlo acá rompe ese contrato (`Paso-2.4.md`, Reconciliación 4).
> `upsertSoloVacias_` sólo completa celdas vacías y nunca pisa valores cargados.

**Y esto vale más que como detalle de implementación.** `SOLAPAS` resuelve el mismo problema
—distinguir lo que puso el seed de lo que puso una persona— con la columna `origen`, y eso
terminó haciendo dos trabajos a la vez (procedencia y protección), que es el P2 abierto.
`upsertSoloVacias_` lo resuelve con una **regla de comportamiento** en vez de una bandera:
no hay columna que mantener, no hay `protegida (habría cambiado)` permanente, y el paso se
puede correr cuantas veces haga falta. Dejarlo escrito en el encabezado de la función.

**4. Reporte final** — **devuelto en la respuesta**, no sólo por `alert`:

- Por informe: tokens encontrados, filas nuevas, filas ya existentes.
- **Tokens sin `base_id`**: el marcador de avance real.
- **Filas huérfanas**: marcadores en la hoja cuyo token ya no está en la plantilla.
  **No borrarlas**: listarlas para que el usuario decida. Puede ser una plantilla que
  cambió, o un token mal escrito.

→ **Commit A:** `Paso 2.5 ✅ — sembrar MARCADORES desde tokens de plantillas`

---

## Parte B — Reporte de cobertura de configuración

Ítem **"Ver cobertura de configuración"**: por informe, cuántos marcadores están
**completos** (`base_id` + `campo_logico` + `operacion`) y cuántos **pendientes**, con los
primeros ~20 pendientes.

**`solapa` entra en la condición de "completo" sólo cuando la base tenga más de una solapa
mapeada en `MAPEO`** (`docs/TOKENS.md §4`): con una sola solapa se infiere y no cuenta como
pendiente; con varias —`digital`, y `rdv` desde que tiene `RDV_otros_ministros`— un marcador
sin `solapa` **sí** cuenta. Sin eso el reporte miente diciendo "completo" sobre un marcador
que en runtime va a fallar con `«FALTA:token@sin_solapa»`.

**Frontera con `FALTANTES` (`D-12`), para no construir dos tableros:** cobertura responde
*qué falta cablear* y se mira antes de correr; `FALTANTES` responde *qué falló al correr* y
lo escribe el Paso 4. No se fusionan.

→ **Commit B:** `Paso 2.5 ✅ — reporte de cobertura de configuración`

---

## Al cerrar — `ESCRITORES.md`

Este paso crea el **primer escritor vivo de `MARCADORES`**: hasta hoy su único escritor era
una migración de renombre (`AUD-3`, censo de la Parte E). Declarar `sembrarMarcadoresDesdePlantillas()`
y `upsertSoloVacias_` con su contrato: **sólo completa vacías, nunca pisa**.

---

## Prueba del usuario

1. `INFORMES` tiene `plantilla_id` en `jm` y `secco`.
2. Menú → **"Sembrar marcadores desde plantillas"**.
3. En `MARCADORES`: ~110 filas de `jm` más las de `secco`, con `familia` y `notas` completos,
   y `base_id`/`campo_logico` vacíos.
4. **Test de no-destrucción:** completar a mano `base_id=rdv` y `campo_logico=inscriptos` en
   `ecv_inscriptos`, y **volver a correr el helper**. Esos valores siguen ahí. Si se
   borraron, el punto 3 está mal implementado.
5. **Test de bloque repetible:** un token del bloque de encuentro aparece **una sola vez**,
   con su marca en `notas`.
6. Menú → **"Ver cobertura de configuración"**: casi todo pendiente.

---

## Nota sobre los tokens que no salen de una base

Varios son de carga manual o de fuente indefinida (insights, títulos de campaña, temas de
conversación, MiBA). Van a quedar sin `base_id` **para siempre**, y está bien: se resuelven
con `operacion=TEXTO` leyendo `valor_fijo`. No tratarlos como pendientes de cableado. Detalle
en `docs/CONFIG_INFORMES.md`.

Los de MiBA además están en `PLAN.md §3` como planificado y bloqueado: van a emitir
`«FALTA:miba_*»` en cada corrida hasta que se defina la fuente. **Es lo esperado, no una
falla.**

---

## Qué NO hacer

- No correr sin resolver 0.1 y 0.3.
- No modificar `upsertPorClave_`.
- No borrar filas huérfanas.
- No cablear `base_id` ni `campo_logico` — eso es el Paso 3.
- Sin trailer `Co-Authored-By`.
