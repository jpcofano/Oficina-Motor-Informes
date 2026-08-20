# 2026-08-20_7 — Cerrar para generar: las 49 `*` y la desconfianza declarada

> **Estado:** no ejecutado · **reemplaza:** al `2026-08-20_4`, cuya Parte 0 ya corrió y cuyos
> números están abajo · **subagente:** ninguno
>
> **Objetivo único:** que los dos decks se puedan generar hoy, con cada número diciendo cuánto se
> confía en él.
>
> ⛔ **No se valida nada en este prompt.** La validación es otro frente y va después.

---

## La decisión que lo funda — usuario, 20/08/2026

⭐ **Un número que existe y no está validado se publica entre guiones. No se retiene.**

| situación | qué sale |
|---|---|
| hay número y está validado | el número |
| **hay número y no está validado** | **`-1.234-`** — sufijo `_revisar` |
| no hay fuente para el token | `/////` — sin fila en `MARCADORES` |
| hay fila y falló | `---` |
| se preguntó y no había dato | `-` |

**Por qué esto no contradice el principio de siempre.** *Plausible pero equivocado* sigue siendo el
enemigo — pero **un número entre guiones ya no es plausible: se declara sospechoso en la cara del
deck.** El mecanismo que faltaba para publicar sin mentir ya existe desde el 19/08 y está sin usar.

⛔ **Lo que sigue deteniéndose:** un token cuya **fuente no existe** (`m2_campanias`) o cuya
columna candidata **cambia de significado entre exports**. Ahí no hay número que desconfiar. La
diferencia es simple: *desconfiar de un número* contra *inventar uno*.

---

## Lo que ya está medido — no se vuelve a medir

Los dos censos autoritativos corrieron el 20/08 a las 13:02 y 13:11, con el instrumento calibrado
contra la lectura por conector (19 de 19 láminas idénticas, cero tokens perdidos):

```
jm      343 tokens leídos · 221 sin fila · 24 láminas
secco                       118 sin fila · 29 láminas
```

| cruce | tokens | reparto |
|---|---|---|
| ⭐ **secco con fila `jm` ya escrita** | **49** | `enc_` 20 · `ecv_` 13 · `camp_` 9 · `m2_` 7 |
| sin fila en las dos plantillas | 56 | 44 son `camp_` |
| sólo secco | 62 | `conv_` 13 · `rep_` 11 · `emin_` 10 · `et_` 9 |
| sólo jm | 203 | `camp_` 50 · `u1_` 32 · `post_` 29 · `m2_` 23 · `gcba_` 19 |

**`gcba_*` son 19 y ninguno está en secco. `emin_*` son 10 y sólo están en secco.** Las dos
afirmaciones del usuario quedaron confirmadas con instrumento.

---

## Parte 0 — verificar las premisas. Sólo lectura. **Reportar y seguir.**

> **Modelo: Sonnet · effort medio.**

1. **`MARCADORES` hoy**: cuántas filas, cuántas por `informe_id`, y **cuántas tienen `SIN VALIDAR`
   en `notas`**. Al snapshot del 20/08 eran 87 · todas `jm` · **32 sin validar**, y sólo **3**
   llevan formato `_revisar`. **Confirmar contra la hoja viva**, que se movió hoy.
2. **La lista de los 49**, reconstruida desde los dos censos y `MARCADORES`, no desde esta tabla.
   Reportarla entera antes de tocar nada.
3. **Los formatos en uso** y que el sufijo `_revisar` es recursivo sobre cualquiera de ellos —
   `miles`, `numero`, `porcentaje_sin_signo`, `fraccion`. Si algún formato base no lo soporta,
   reportarlo: son los que no van a poder declarar desconfianza.
4. **Cuántos de los 49 tienen `SIN VALIDAR`**, que es el cruce que decide cuántos de los dos
   cambios caen sobre la misma fila.

---

## Parte A — las 49 `*`

> **Modelo: Opus · effort alto.** Hace que SECCO publique números donde hoy publica hueco.

**Se aplica token por token, no en bloque.** El criterio es el de siempre y no cambió: **el token
existe en las dos plantillas Y mide el mismo hecho.** Estar en la lista de 49 prueba lo primero;
**lo segundo se mira**.

⛔ **El caso que hay que buscar activamente:** un token que en cada plantilla cae en una **sección
distinta**. Es el modo de falla que rompió `enc_audiencia` con un renombre global. Los que caigan
ahí **se reportan y se quedan en `jm`** — esa lista es una salida del prompt, no un residuo.

**El control, y el primero solo no sirve:**

| # | control | qué prueba |
|---|---|---|
| 1 | los valores de `jm` **idénticos**, testigo antes y después, misma sesión | que no se rompió nada |
| 2 ⭐ | **`secco` pasa de 0 marcadores resueltos a N**, con N escrito **antes** de correr | **que el cambio se aplicó** |

⚠ El control 1 daría verde tanto si el cambio se aplicó como si no. Es la regla del 19/08 —*un
testigo que no mide el cambio no es testigo del cambio*—. **El que distingue es el 2.**

⚠ **Los 49 quedan validados para `jm` y NO para `secco`:** otra ventana, otro corte. **Cada uno
que pase a `*` recibe en `notas` que su validación es de `jm` solamente**, con sello de texto para
no duplicar entre corridas.

---

## Parte B — la desconfianza declarada

> **Modelo: Sonnet · effort alto.** Es mecánico: una lista medida y un sufijo.

**Todo marcador con `SIN VALIDAR` en `notas` pasa a formato `*_revisar`.**

1. **El sufijo se compone sobre el formato existente** — `miles` → `miles_revisar`,
   `porcentaje_sin_signo` → `porcentaje_sin_signo_revisar`. El formateador ya es recursivo sobre el
   base y no hay que tocarlo.
2. **Los tres que ya lo llevan no se tocan.** Idempotencia, no doble sufijo.
3. ⭐ **`m2_envios` entra acá y se queda como está en todo lo demás.** Publica 25 donde el deck
   dice 26, y **eso es exactamente un número no validado, no un número roto**. Cambiarle la
   operación con la evidencia de hoy sería moverlo hacia otro número que tampoco es el publicado.
   **Entre guiones y adelante.**
4. ⛔ **`m2_campanias` NO se cablea.** Ninguna columna reproduce el 12, y la candidata cambió de
   grano entre el export del 31/07 (11 proyectos) y el del 06/08 (18 envíos) sobre las mismas 25
   filas. **Sale `/////`, que es la verdad: nadie lo cableó porque no hay de dónde.**
5. **Se retira el sufijo cuando un caso `V-` valide la fila**, y no antes. Escribirlo como la
   condición de salida evita que `_revisar` se vuelva permanente por olvido.

⛔ **No se toca ninguna operación, ninguna dimensión, ningún filtro.** Esta parte cambia **una
columna**: `formato`.

---

## Parte C — verificar

> **Modelo: Sonnet · effort medio.**

1. Los dos controles de la Parte A, con el 2 **leído primero**: si `secco` sigue en 0, lo demás no
   significa nada.
2. **Un conteo por símbolo esperado, escrito antes de generar**: cuántos tokens de cada deck
   deberían salir como número, entre guiones, `/////`, `---` y `-`. ⭐ **Es el control que hoy no
   existe:** sin él, un deck lleno de `/////` es indistinguible de un deck que no cableó nada.
3. `node tools/listas.js` · snapshots versionados antes y después · catálogo regenerado.
4. **La generación la corre el usuario**, con los dos números esperados a la vista.

---

## Parte D — la documentación

> **Modelo: Sonnet · effort medio.**

1. **`docs/PLAN.md`** — la política de la desconfianza declarada, como decisión numerada del
   usuario del 20/08: *un número no validado se publica entre guiones; uno sin fuente no se
   publica*. Es la que va a gobernar todo el cableado que falta.
2. **`docs/CONFIG_INFORMES.md`** — la tabla de los cinco estados visibles del deck, junto a la de
   los cuatro símbolos que ya está escrita.
3. **`docs/PLAN.md`** — el cruce de los cuatro números (49 · 56 · 62 · 203) con su fecha y la nota
   de que el instrumento calibró. **Los 56 compartidos sin fila son el lote más rentable que queda**
   y conviene que esté escrito dónde.
4. `docs/BITACORA.md` · `docs/HANDOFF_CODE.md`.

## Lo que este prompt **no** hace

- ⛔ No valida ningún número ni cierra ningún caso.
- ⛔ No cablea los 56 compartidos ni los 62 de secco.
- ⛔ No toca plantillas: la diferencia de granularidad entre `jm` y `secco` es `C-01`, del equipo.
- ⛔ No cambia la operación de `m2_envios`.
