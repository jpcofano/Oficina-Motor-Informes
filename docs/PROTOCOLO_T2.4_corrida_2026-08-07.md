# PROTOCOLO `T2.4` — los cuatro objetivos contra un deck real (07/08/2026)

> **Documento congelado.** Evidencia de una verificación puntual: qué se corrió, con qué
> instrumento y qué devolvió. No se edita — si se vuelve a correr, se escribe un archivo nuevo.
>
> **`reemplaza:` nada.**
>
> Pedido por `docs/PLAN.md` §2, `T2.4`. Ejecutado dentro de
> `docs/Prompts/2026-08-07_3_corrida_nocturna.md`, que lo manda primero.
> Deck: `jm-20260806-222554` (`1MH2hFWjcTHjrlZu-NkUxlnbUiuIIR6aAxgjIJ5GxrNg`), la corrida
> **completa** verificada pieza por pieza contra otra en `PROTOCOLO_T2.2.3_corrida_2026-08-07.md`.
> **Trabajamos en español.**

---

## Resultado por objetivo

| objetivo | veredicto |
|---|---|
| 1 · `SUMA` sobre cero filas devuelve `sin_datos`, no `0` | ✅ **verificado**, con control negativo en la misma corrida |
| 2 · `ULTIMO` por fecha | ✅ **el mecanismo funciona** · ❌ **el número esperado no sale, y el motivo es un dato, no un bug** |
| 3 · el agregado global de `digital` | ✅ **verificado donde hay filas** · queda expuesto que en tres solapas la ventana da cero |
| 4 · el sembrado del Resumen Ejecutivo | ✅ **verificado en el deck**: 11 de 24 con valor, y los 11 son correctos |

`resolverMarcadores('jm')` sobre los **43** marcadores: **17 `ok` · 26 `sin_datos` · 0 `error`**.

---

## 1 · `SUMA` sobre cero filas — verificado, y con control negativo

Todas las `SUMA` que caen sobre cero filas devuelven `sin_datos` y **lo dicen en la traza**:

> `SUMA: ninguna fila aportó un valor numérico a "ivr_audiencia" (col J) sobre 0 fila(s) de
> digital/Directa IVR — **sin dato, no cero**`

Alcanza a `enc_audiencia`, `enc_atendidos`, `enc_e75`, `enc_marque1`, `ivr_llamados`,
`ivr_atendidos`, `pauta_google/meta/prog`, `gcba_pauta_google/meta/prog`, `imp_total`,
`gcba_imp_total`.

**El control negativo salió en la misma corrida y es lo que le da valor a la prueba:**
`ivr_campanias` es un `CONTEO` sobre **las mismas cero filas** y devuelve **`0`**, no
`sin_datos`. La asimetría es la documentada —`CONTEO` cuenta filas, y cero filas *es* cero— y
está viva: un cambio que hubiera roto la distinción se habría visto acá.

## 2 · `ULTIMO` por fecha — el mecanismo funciona; el número esperado, no

**El objetivo estaba escrito como *"`ULTIMO` por fecha (`enc_mails_enviados` = 44.043)"*. Ese
número no sale hoy, y hay que decir por qué antes de que alguien lo lea como una regresión.**

`enc_mails_enviados` devuelve `«FALTA:@ultimo_ambiguo»`:

> ÚLTIMO por fecha: **2 filas comparten la fecha más alta (28/07/2026) con valores distintos
> (85935 / 104362)** en "mail_enviados". No se elige: un número plausible de la fila
> equivocada es peor que un hueco.
> · recorte por ventana sobre "Fecha envio": **11 de 346** fila(s)
> · filtro `mail_tipo=Convocatoria` sobre "Tipo de mail" (col I) → **346 de 2138** fila(s), 506
> con la celda vacía

Las tres piezas del cableado **funcionan**: el filtro por tipo corre (346 de 2138), el recorte
por ventana corre (11 de 346), y `ULTIMO` compara por fecha. Lo que pasa es que **dentro de la
ventana hay un empate real al 28/07 con dos valores distintos**, y el motor está construido
para no elegir en ese caso.

Los cinco `enc_*` de `Directa Mail` caen igual, sobre las mismas 11 filas:
`enc_mails_entregados` (85559 / 103359), `enc_aperturas` (21170 / 33527), `enc_clics_ctor`
(203 / 330), `enc_or` (0,2474 / 0,3244), `enc_ctor` (0,00959 / 0,00984).

**Qué NO se hizo, a propósito:** no se cambió la regla de desempate. El empate es un hecho de
los datos y elegir uno de los dos es exactamente la decisión que `ULTIMO` tiene prohibido
tomar. **Qué falta decidir:** cuál de las dos filas del 28/07 es la que la lámina publica, o
qué campo adicional las desempata. Es decisión de dominio.

`enc_impresiones` y `enc_alcance` (los otros dos `ULTIMO`, sobre `digital/Digital`) caen por
otra causa: **cero filas tras el recorte** — ver el punto 3.

## 3 · El agregado global de `digital` — verificado donde hay filas

Funciona, sin `id_cuenta`, recortando por la `fecha_periodo` de cada solapa:

| solapa | filas en ventana | resultado |
|---|---|---|
| `Directa Mail` · JM | **7** de 296 (filtro remitente → 296 de 2138) | `mail_envios` 838.571 · `mail_entregados` 831.577 · `mail_aperturas` 211.357 · `mail_or` 25,42 % |
| `Directa Mail` · GCBA | **80** de 1842 | `gcba_mail_envios` 3.839.688 · `gcba_mail_entregados` 3.795.831 · `gcba_mail_aperturas` 1.084.516 · `gcba_mail_or` 28,57 % |
| `Directa SMS` | **1** de 48 | `gcba_sms_envios` 54.552 · `gcba_sms_entregados` 51.706 |
| `Directa IVR` | **0** de 58 *(recorte sobre "Inicio")* | todo `sin_datos`, salvo el `CONTEO` que da 0 |
| `Seguimiento digital` | **0** de 979 *(recorte sobre `fecha_periodo`, **979 sin fecha**)* | todo `sin_datos` |
| `Digital` | **0** de 1297 *(recorte sobre "Fecha de inicio", 400 sin fecha)* | todo `sin_datos` |

Las tres últimas son **exactamente los tres grupos de `T2.6`**, y esta corrida deja a la vista
que **no tienen la misma causa**: `Seguimiento digital` recorta a cero porque **las 979 filas no
tienen fecha en la columna que gobierna**; `Digital` e IVR recortan a cero **teniendo fecha**.

## 4 · El sembrado del Resumen Ejecutivo — verificado en el deck

**11 de los 24 marcadores del Resumen Ejecutivo tienen valor, y los 11 están pintados en el
deck.** Leídos del archivo, no del valor de retorno:

| lámina | caja | dice |
|---|---|---|
| 2 · Resumen Ejecutivo JM | envíos de Mail | `838.571 envíos de Mail` |
| 2 | Mails entregados | `Mails entregados: 831.577` |
| 2 | Aperturas | `Aperturas: 211.357 (25.42%)` |
| 3 · Resumen Ejecutivo GCBA | envíos de Mail | `3.839.688 envíos de Mail` |
| 3 | Aperturas | `Aperturas: 1.084.516 (28.57%)` |
| 3 | envíos de SMS | `54.552 envíos de SMS` |
| 3 | SMS entregados | `SMS entregados: 51.706` |
| 5 | encuentros | `15` |

Los 13 restantes salen `«FALTA:…»` por las causas del punto 3 (IVR, pauta, impresiones,
frecuencia).

**El formato es el correcto:** los `_or` y `_pct` están cableados como `numero` justamente
porque la caja de la lámina ya trae su `%`, y en el deck se lee `(25.42%)` — un solo signo. Es
el bug que el 04/08 se arregló en `fraccion` y que acá no reaparece.

## Un hallazgo que no estaba pedido y hay que ver

**La lámina 5 publica un porcentaje sin su numerador.** Textual, del deck:

> `Mail: «FALTA:ecv_insc_mail»(59.9%)  Digital: «FALTA:ecv_insc_digital»(29.28%)  …`

`ecv_insc_mail_pct` resuelve (`59,9`), pero `ecv_insc_mail` **no tiene fila en `MARCADORES`**.
El `_pct` está cableado y el número que lo genera no. Es el modo de falla más visible que dio
esta corrida: la caja queda leíble y absurda, con el porcentaje correcto al lado de un hueco.
Los cinco pares `ecv_insc_*` están igual.

**No se cableó nada** — el prompt lo prohíbe explícitamente. Queda como el ítem más barato y
más visible de la cola.

## Cómo se reproduce

```
node tools/api.js llamar fn=eval args='["resolverMarcadores(\"jm\", {})"]' --crudo
```

y la lectura del deck, por `fn=eval`, con `piezasDeTextoDeSlide_` sobre
`SlidesApp.openById('<deck_id>')`. El `deck_id` sale de la columna `deck_id` de `CORRIDAS`,
nunca de la fecha de modificación: todos los decks de la carpeta se llaman igual.
