# 2026-08-17_1 — Tanda 2: `tipo_envio` en `digital/Directa Mail`

> **Estado:** no ejecutado · **reemplaza:** nada · **subagente:** ninguno
>
> **Aprobada por el usuario, 17/08/2026.** El piloto y la tanda 1 están cerrados: **16 de 48
> migrados**.
>
> **Objetivo único:** que los trece marcadores de `enc_mails_*` y `m2_*` declaren su corte de
> `tipo_envio` en `dimensiones` en vez de en el `filtro`, **sin que cambie un solo número**.

---

## Por qué éstos trece, y por qué son la tanda barata

| valor de `tipo_envio` | marcadores | filtro de hoy |
|---|---|---|
| ~~`convocatoria`~~ | ~~`enc_mails_enviados`, `enc_mails_entregados`, `enc_aperturas`, `enc_clics_ctor`, `enc_or`, `enc_ctor`~~ | **SALEN — ver abajo** |
| `m2` | `m2_envios`, `m2_mails_enviados`, `m2_mails_entregados`, `m2_aperturas`, `m2_clics`, `m2_or`, `m2_ctor` | `mail_tipo~=M2` |

> ## ⚠ Corrección del 17/08 — la tanda son **SIETE**, no trece
>
> **Los seis `enc_mails_*` no publican.** Dan `sin_datos` con `«FALTA:@ultimo_ambiguo»`: dos filas
> de `Directa Mail` comparten la fecha más alta con valores distintos y `opULTIMO` **se niega a
> elegir**, que es el comportamiento correcto (guarda del `_39`).
>
> **Un marcador que hoy no produce valor no se puede migrar y verificar:** la Parte C compararía
> `sin_datos` contra `sin_datos`, **reproduce trivialmente y no prueba nada.**
>
> **Se siguen MIDIENDO igual** —dan la cuenta de filas del lado `convocatoria` de la cobertura, y
> esa parte sí funciona: el filtro corre y recorta; lo que falla es la operación, después.
>
> ⚠ **Esto deja `tipo_envio` migrada A MEDIAS**, con `m2` en `dimensiones` y `convocatoria`
> todavía en `filtro`. **Las dos formas conviven**, que el piloto ya estableció como aceptable —
> pero hay que saberlo, porque un censo de dimensiones que no lo espere lo va a leer como
> inconsistencia.
>
> **El `@ultimo_ambiguo` es hallazgo propio y está en `PENDIENTES`**: es una pregunta del dominio
> —cuál de las dos filas vale— **y no bloquea la migración**.

**Cuatro cosas la hacen la siguiente, y las cuatro están medidas:**

1. **Misma base y solapa que la tanda 1** — `digital/Directa Mail`, cuya **ventana cerrada de
   julio** dio idéntica: los ocho de mail no cambiaron ni un dígito entre las 22:20 y las 23:31,
   mientras `looker` movía `imp_total` de 34.289.779 a 34.293.287 en la misma hora.
   - ⚠ **Precisión del 17/08: `digital` NO está quieta.** Entre el 16/08 23:31 y el 17/08 12:54 el
     universo de `Directa Mail` pasó de **2.239 a 2.241** y `convocatoria` de **359 a 361**. **Las
     dos filas nuevas caen fuera de la ventana** — en ventana sigue dando 11 y 25, y los siete
     `m2_*` son idénticos. **Lo estable es la ventana cerrada, no la base**, y es lo único que la
     verificación necesita.
2. **El canario ya está probado**: `enc_atendidos`/`ivr_atendidos` (`digital/Directa IVR`, filtro
   vacío, no se migran en ninguna tanda). Dio 71.234 · 2 de 60 en las dos tomas de la tanda 1.
3. **Una sola dimensión**, como la tanda 1.
4. **`DIMENSIONES_` ya tiene los dos valores definidos** para ese `base|solapa` —
   `convocatoria: 'mail_tipo=Convocatoria'` y `m2: 'mail_tipo~=M2'`. **Cero líneas de `.gs`.**

---

## ⚠ El control es MÁS DÉBIL que el de la tanda 1, y hay que leerlo sabiendo eso

**`tipo_envio` NO particiona el universo.** La tanda 1 tuvo un control fuerte porque `ambito` era
**disjunto y exhaustivo**: `mail_remitente=…` y `mail_remitente!=…` son complementarios, así que
`311 + 1.928 = 2.239` tenía que cerrar exacto. **Acá no hay nada equivalente**: `convocatoria` y
`m2` son **dos subconjuntos** del mismo universo de 2.239 y **no lo cubren**.

**El control que sí hay, y es el que se usa:** los tres números —`filas(convocatoria)`,
`filas(m2)` y **el resto que no cae en ninguno**— salen del mismo universo de 2.239. **Si la
dimensión traduce bien, el resto no se mueve.** Si traduce mal, alguno de los tres cambia y el
resto lo delata.

**Es más débil y se escribe así, porque un control débil presentado como fuerte es peor que no
tenerlo:**

| | tanda 1 | tanda 2 |
|---|---|---|
| propiedad | disjunto **y exhaustivo** | disjunto, **no exhaustivo** |
| qué detecta | cualquier corte mal traducido rompe la suma | un corte mal traducido mueve el resto |
| qué NO detecta | — | **un error que mueva los dos subconjuntos y el resto en la misma proporción** |

**Lo compensan filas + valores exactos**, que alcanzan porque **la ventana cerrada de `digital` es
estable**. **El control principal de esta tanda son los valores idénticos**, y el resto es el
respaldo.

### ⚠ El `RESTO` SÍ se mueve entre tomas, y hay que saberlo antes de leerlo como una falla

**Éste es el borde que distingue este control del de la tanda 1, y es lo que más fácil se lee
mal.** La partición de la tanda 1 usaba **sólo cuentas en ventana** —311 y 1.928 sobre 2.239— y
por eso era estable. **La cobertura de esta tanda usa el UNIVERSO COMPLETO, que sí crece.**

Medido el 17/08: en **13 horas** el universo pasó de **2.239 a 2.241** y `convocatoria` de **359 a
361**. Un `RESTO` distinto entre la Parte A y la Parte C **es lo esperable, no una anomalía**.

**Cómo se lee, y el orden importa:**

1. **¿Cambió el universo?** Si creció, **el `RESTO` puede cambiar sin que nada esté mal**. Mirar
   entonces si `convocatoria` y `m2` se movieron **en la misma cantidad** que el universo.
2. **¿Se movió `m2`, que es lo que se está migrando?** Si el universo creció y `m2` no, la
   migración no está en discusión.
3. **Sólo si el universo NO cambió y el `RESTO` sí**, la dimensión traduce distinto. **Ése es el
   único caso que acusa a la migración.**

**Es la misma disciplina que el piloto: primero se descarta que se movió la fuente.** Sin este
paso, el crecimiento normal de la base se lee como una migración rota.

### La disjunción entre `convocatoria` y `m2`: **resuelta por construcción, no hace falta medirla**

**Verificado en el código el 17/08** (`OPERADORES_FILTRO_` y `cumpleCondicion_`, `Generador.gs`):
`=` es **igualdad estricta** (`v === esperado`) y `~=` es **substring** (`indexOf !== -1`).

Entonces `mail_tipo=Convocatoria` exige que la celda sea **exactamente** `Convocatoria`, y
`mail_tipo~=M2` exige que **contenga** `M2`. **`Convocatoria` no contiene `M2`**, así que
**ninguna fila puede caer en los dos**. La disjunción no depende de qué valores traiga la columna.

⚠ **Lo que sí hay que medir es la COBERTURA**, que es otra cosa: cuántas filas quedan fuera de los
dos. Y un caso concreto a mirar: una celda como `Convocatoria M2` **no entra en `convocatoria`**
—no es igualdad estricta— pero **sí en `m2`**. Si aparece, hay que decirlo: no rompe la
disjunción, pero cambia qué significa cada conjunto.

---

## Parte A — el testigo, **sólo lectura**

**No editar nada. Termina en reportar y parar.**

1. **El canario primero**: `enc_atendidos` y `ivr_atendidos`, valor **y cuenta de filas**. Si
   divergen entre sí, parar — el problema es el instrumento.
2. **Los trece valores**, con **la cuenta de filas de cada uno**, y **cada valor atribuido a su
   token nominalmente**. Los dos requisitos que el testigo del piloto no pudo cumplir.
3. **Los tres números del control, TODOS DE LA MISMA ETAPA.** ⚠ **Acá se rompió el 17/08 y hay que
   saber cómo:** la traza tiene **dos** etapas que dicen `N de M` —la del **filtro**
   (`359 de 2239`) y la del **recorte por ventana** (`11 de 359`)— y el instrumento tomaba
   `quedan` de una y `universo` de la otra. Reportó `11 + 25 + 323 = 359`: **una suma que cierra y
   no significa nada**, el mismo patrón que el cuadre de `D-31` la semana anterior.
   - **Se usa la etapa de FILTRO en los tres**, y el motivo es que es la única donde el universo
     existe: el `M` del filtro **es** el total de la solapa. **Después de la ventana el universo no
     lo publica ningún marcador** —haría falta uno sin filtro sobre esa solapa y no hay—.
   - **Consecuencia a tener presente:** el control mide la traducción de la dimensión **antes** de
     la ventana. Es lo que se quiere —la dimensión traduce un corte, no una fecha— pero **no dice
     nada del recorte temporal**, y eso lo cubren los valores.
   - El resto sale por diferencia y **se escribe explícito**, con la comprobación al lado.
4. **Guardar en `docs/_snapshots/TESTIGO_tipo_envio_AAAA-MM-DD_HHMM.md`, con la HORA.**
5. **Los consumidores**: `censarTokensEnPlantilla` con los trece. ⚠ **Escribir el wrapper sin
   argumentos** —`censarTokensDeTanda2()`— porque una función con parámetros **no aparece en el
   desplegable** (`CLAUDE.md` §2). En la tanda 1 aparecieron **tres** tokens repetidos en dos
   láminas; si acá pasa, el mismo token tiene que dar el mismo número en las dos.

**Reportar y parar.**

---

## Parte B — estructurar

1. **Poblar `dimensiones` en los trece**, por `curarCamposMarcadores_` — todo o nada desde el
   15/08.
2. **El `filtro` queda VACÍO en los trece**, igual que en la tanda 1: su filtro es **sólo** el
   corte de `tipo_envio` y no hay restricción técnica que preservar. **Trece celdas que se vacían
   se parecen a un borrado accidental y no lo son.**
3. **La reversión, con los filtros generados LEYENDO `docs/_snapshots/MARCADORES_2026-08-15.tsv`**,
   no transcribiéndolos, y **verificados carácter a carácter** contra él antes de commitear. Es lo
   que se hizo en la tanda 1.
4. **Wrappers públicos sin `_` y sin parámetros**: `migrarTanda2DeTipoEnvio()` y
   `revertirTanda2DeTipoEnvio()`.

⚠ **No tocar el corte de `ambito` de los ocho ya migrados**, que viven en la misma solapa.

---

## Parte C — verificar

| # | qué | qué significa |
|---|---|---|
| 0 | **canario** | si se movió, `digital` está en tránsito y no se lee nada |
| 1 | **cuentas de filas** de los trece | si cambiaron, es la base |
| 2 | **los valores** | **acá se exige igualdad exacta**: la ventana cerrada de `digital` es estable |
| 3 | **`filas(convocatoria)`, `filas(m2)` y el resto** | el respaldo — ⚠ **mirar primero si creció el universo**: el resto se mueve solo, ver arriba |

**Contra `docs/_snapshots/MARCADORES_2026-08-15.tsv`**, la línea base, no contra la corrida
anterior.

**Si reproduce:** escribirlo en `PLAN.md` con la ventana, las dos tomas con hora y el criterio, y
**regenerar el catálogo** — `node tools/snapshot.js` primero y después `node tools/catalogo.js`,
**en ese orden**: el catálogo lee snapshots, así que sin uno nuevo regenera lo mismo y **parece
actualizado sin serlo**.

**Si no reproduce con las filas idénticas:** revertir y reportar. **No se ajusta hasta que dé.**

---

## Lo que este prompt **no** hace

- **No renombra ningún token.** Es lo que permite comparar.
- **No migra los 17 de `rdv`** — necesitan resolver antes contra qué se verifican (`2026-08-17_2`).
- **No migra `frecuencia`/`gcba_frecuencia`**, que van últimos.
- **No toca `ambito`** en los ocho de mail ya migrados.
- **No toca plantillas.**
