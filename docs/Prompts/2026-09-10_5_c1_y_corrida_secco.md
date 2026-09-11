# 2026-09-10_5 — C.1 contra el censo NUEVO, y la corrida de `secco`

> **Objetivo único:** cerrar la tanda. `C.1` escrita **una sola vez** contra la plantilla de ahora,
> y la corrida que verifica todo junto.
>
> **Subagente: ninguno.**
>
> ⛔⛔ **La plantilla cambió después del censo.** El usuario descruzó `L-018` en las **dos** y
> agregó la caja de Alcance. **La lista de 9 tokens se midió sobre la plantilla anterior y por lo
> tanto venció.** ⛔ No se escribe una sola fila contra ella.

| parte | modelo | effort | qué |
|---|---|---|---|
| **0** | Sonnet | **alto** | re-censar — reportar y parar |
| **A** | **Opus** | **alto** | `C.1`, una aplicación |
| **B** | **Opus** | **alto** | la corrida y sus preguntas |

---

## Parte 0 — re-correr el censo · SÓLO LECTURA · reportar y parar

⭐ **`clasp push` primero si hay algo sin subir** — `/dev` sirve HEAD, y un censo corrido antes del
push mide otra versión **sin fallar**.

**`censarCajasSecco()` y `censarCajasJm()`, y el `modifiedTime` de cada plantilla en la primera
línea.** ⛔ Si el sello de alguna **no es posterior** al censo anterior, la edición no llegó a esa
plantilla: **parar y decirlo**.

### 0.1 ⭐ Que `L-018` haya quedado bien — y que no haya quedado otra cosa mal

Bajo el rótulo **Audiencias** tienen que vivir `camp_audiencia1-3`, y bajo **Formatos**
`camp_formato1-3`. **En las dos plantillas.**

⚠ **Y lo que hay que mirar además, porque mover cajas en Slides rompe de maneras que no fallan:**

| qué | por qué |
|---|---|
| ningún token **duplicado** en la lámina | una caja copiada en vez de movida pinta el valor en dos lugares |
| ninguno **perdido** | la cuenta de tokens de `L-018` contra la del censo anterior, token por token |
| ninguno **partido** | un token cortado en dos runs de texto **no matchea y sale crudo** |

### 0.2 ⭐ La caja de Alcance de `L-012`: ¿declara token?

El usuario dice *«agregué la caja de alcance pero ese no se cablea por ahora»*. **Son dos cosas
distintas y hay que medir cuál es:**

| qué pasó | qué publica | qué hacer |
|---|---|---|
| agregó la **caja** sin token | nada, igual que hoy | nada |
| agregó la **caja con token** | ⛔ **`/////`** | ver abajo |

⛔ **Si declara token, la caja EMPEORA respecto de ayer:** pasa de vacía a mandar a cablear algo
que **no tiene fuente** —medido: no hay alcance deduplicado por ventana, es la forma de `C-85`—.
⇒ **Reportar y que lo decida el usuario.** ⛔ No escribirle fila ni sacarle el token.

### 0.3 La lista de `C.1`, **recontada**

Los tokens que publican `/////` **en láminas visibles** de `secco`, medidos ahora y **no heredados
de la corrida anterior**. La lista anterior decía 9 —los seis de `L-018`, `camp_bench_remitente`,
`camp_dig_insight`, `camp_mail_insight`—. ⭐ **Si ahora da otro número, gana el censo nuevo.**

⛔ **Uno por uno contra el censo. Nunca por prefijo.**

**⛔ Reportar y parar.**

---

## Parte A — Opus · `C.1`, **una sola aplicación**

`operacion = TEXTO` + `valor_fijo` = **el nombre del token sin llaves**. Decisión del usuario del
10/09: `/////` significa *«nadie lo cableó»* y estas cajas **las escribe una persona** — dos causas
no pueden compartir símbolo si piden trabajos distintos.

⛔ **Las cuatro guardas, ninguna opcional:**

1. ⛔ lista del **censo**, token por token, **nunca por prefijo**;
2. ⚠ **un token puede vivir en dos láminas** — escribir la fila lo pinta en las dos;
3. ⛔ **relectura desde la hoja**, y **no** desde el retorno del escritor. ⭐ Como en `C.3`: por el
   export directo, donde no interviene ningún `.gs`;
4. ⭐ el **`informe_id`** correcto — `secco` no es `jm`, y una migración a `*` sin medirla
   convertiría la decisión de un informe en la de los dos.

⛔ **`u1_total_alcance` y `u1_total_frecuencia` NO reciben fila** — su causa es *«el dato no existe
todavía»*, que es **otra**. ⛔ **Los 51 de las 🚫 tampoco**: sus láminas están escondidas, la
resolución no las visita, y serían filas inertes.

**Declarar `n de m` y la lista de nombres.** ⛔ Nombres, no conteos.

---

## Parte B — Opus · la corrida de `secco`

⛔ **`D-57`: se dispara y se lee de `CORRIDAS`.** El retorno no es el veredicto. Invariante:
**`corte ⇒ pendientes ≥ 1`**; si dice corte y `pendientes = 0`, el hallazgo es la fila.

### Las cinco preguntas, una por una en el reporte

1. ⭐ **`C-126`**: la caja rotulada **Aperturas** publica el GLOBAL de aperturas de mail de su
   propia `L-022`, y la rotulada **Clics** el TOTALES de clics de su propia `L-021`;
2. las **implementaciones** dejan de estar invertidas;
3. las cajas de `C.1` dicen el **nombre del token** y ya no `/////`;
4. `cc_campanias` publica, **entre guiones**;
5. `emin_lista` y `emin_encuentros` **sin** guiones.

⚠ **La 5 no se cierra hoy.** Sólo la corrida **siguiente** prueba que el `SIN VALIDAR` se fue de
verdad: `revisarASinValidar_` repone la marca **en la corrida posterior**, no en ésta.

### Los controles que no dependen del deck del equipo

⭐ **Las seis identidades del desagregado digital** — Meta + Google + Programmatic = TOTALES en
impresiones, vistas y clics, **en las dos campañas**. Cerraban 6 de 6; tienen que seguir.

⭐ **Las tres de `L-012`** — **`V-140`, `V-141`, `V-142`**, ya escritas en el CSV del 10/09:
`emin_or`, `emin_ctor`, `emin_ctr`, contra el **redondeo publicado** y no contra una banda.
⚠ Declarar **`3 de 3` y nombrar la caja que queda afuera** (Alcance, sin fuente), para que un
`3 de 3` no se lea como la lámina completa.

⚠ **Y `V-142` tiene de denominador justo el número que se mueve** — el camino del motor dio
`2.117.760` a las 12:11 y `2.152.615` después, **+1,6 % en el día**. Si en esta corrida el
denominador volvió a moverse, la identidad **tiene que cerrar igual**: eso es lo que la hace
exigible en cada corrida. ⛔ Si no cierra, el hallazgo **no** es el drift.

⛔ **Y lo que ninguna identidad prueba: consistente no es correcto.** Las nueve cierran igual de
bien si el universo entero está mal. Son control de **coherencia**, no de universo.

### ⚠ Qué se puede atribuir y qué no

**El único cambio que mueve un número publicado es `C-126`**, y ni siquiera mueve el valor: mueve
el casillero. Todo lo demás llena huecos. ⛔ **Si aparece una diferencia en una caja que no es de
las tres de `C-126` ni de las que llenan hueco, NO se atribuye a esta tanda**: se reporta como
hallazgo nuevo y se mide aparte.

---

## ⛔ Hard stops

1. ⛔ **Ninguna fila de `C.1` contra el censo viejo.**
2. ⛔ **Si `L-018` no quedó bien en las dos, no se escribe `C.1`** — se reporta qué falta.
3. ⛔ **La caja de Alcance no recibe fila ni pierde su token** sin decisión del usuario.
4. ⛔ **Ninguna verificación desde el retorno del escritor.**
5. ⛔ **`u1_total_*` no reciben fila.** ⛔ **`imp_prog` no se toca.** ⛔ **Ningún ✅ en el tablero.**
6. **Commits separados:** configuración (A) y evidencia + documentación (B).
