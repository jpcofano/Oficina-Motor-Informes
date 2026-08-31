# `2026-08-31_2` · El ámbito que falta — trece marcadores que publican lo mismo en las dos láminas

**Destino:** `docs/Prompts/`. **Estado:** no ejecutado.

⛔⛔ **Mueve números publicados de `L-031` y `L-032`.** Partes B y C en **Opus, effort alto**.

---

## 0 · El defecto, y por qué van juntos

Dos bloques de tokens, encontrados por caminos distintos, con **la misma forma**: el marcador de
JM no pide ámbito, así que lee la solapa entera; el de GCBA lee lo mismo. **Las dos láminas
publican el mismo número.**

| bloque | marcadores JM sin `dimensiones` | gemelo GCBA |
|---|---|---|
| **IVR** | `ivr_campanias` · `ivr_llamados` · `ivr_atendidos` · `ivr_at_pct` · `ivr_75` · `ivr_75_pct` · `ivr_marque1` | `gcba_ivr_llamados` · `gcba_ivr_atendidos` · `gcba_ivr_at_pct` — **con** `ambito=gcba` |
| **pauta** | `pauta_meta` · `pauta_google` · `pauta_prog` | `gcba_pauta_*` — **también sin** `dimensiones` |

Es la misma clase de hueco que tenían los ocho `imp_*` antes del 30/08. **Que hayan aparecido dos
bloques por caminos independientes es el motivo por el que la Parte 0 barre los 220 en vez de
arreglar estos trece.**

⛔⚠ **Lo que este prompt NO arregla, y hay que decirlo antes de empezar:** en `pauta_*` el corte es
un defecto y la **magnitud es otro**. `SUMA` sobre una columna `sd_*` —un flag `0`/`1`— devuelve
**cuántas campañas tuvieron pauta**, mientras la caja promete «contenidos implementados». Poner el
ámbito hace que JM y GCBA dejen de ser iguales; **no hace que el número signifique lo que la
lámina dice.** Eso queda abierto y se declara en la Parte D.

---

## Parte 0 — El barrido y el bloqueante · **sólo lectura** · Sonnet · effort alto

**P1 · ⛔⛔ El bloqueante: por qué `gcba_ivr_llamados` publica el global teniendo `ambito=gcba`.**

Medido sobre la planilla del 30/08 — los datos están bien y el cableado también:

```
digital/Directa IVR · col G «Vocero» · 63 filas
   'JM' 54 · 'GCBA' 6 · 'JM ' 1 · 'GCBA ' 2
MAPEO        : ivr_vocero → col G ✅
DIMENSIONES_ : jm = ivr_vocero=JM   ·   gcba = ivr_vocero!=JM ✅
```

`ivr_vocero!=JM` debería dar **8** filas —⛔ **corregido: eran 9 y son 8**, el comparador recorta
espacios (`R-10`), así que `'JM '` queda en JM: **55 / 8**—. El deck del 31/08 publica el total,
10.032 llamados, en **las dos** láminas.

**Correr la traza de `gcba_ivr_llamados`** y reportar qué dice el filtro: cuántas filas de
cuántas, sobre qué columna. Tres hipótesis en orden:

1. ⛔ **DESCARTADA el 31/08** — *«la plantilla de `L-032` no usa el token»*. **El
   `CORRIDAS.mapa_tokens` la cierra: el slide 3 pinta `gcba_ivr_llamados`.**
   ⚠ La justificación original de esta hipótesis citaba `TOKENS.md` §178, **y esa cita estaba
   vencida**: `BITACORA:16584-85` la deja vieja y el propio §178 se declara *«sin medir uno por
   uno»*. **Se retira del prompt.**
2. Una guarda de `leerFuente` no aplica el filtro sobre esa solapa.
3. `ivr_vocero` resuelve a otra columna en tiempo de corrida.

⛔ **Si la causa es (1), agregarle `ambito=jm` a los siete NO alcanza** y el prompt cambia de
objeto: hay que hablar con el equipo (`C-01`). **Reportar y parar antes de tocar nada.**

**P2 · El barrido de los 220.** Listar **todos** los pares `x` / `gcba_x` de `MARCADORES` y marcar
en cuáles el de JM no pide `ambito` y el de GCBA sí, o ninguno de los dos. ⭐ **Declarar el conteo
aunque dé exactamente trece** — un cero o un trece declarados son un dato; un silencio no.

⚠ Reportar también los `gcba_x` **sin** gemelo JM y los `x` con gemelo faltante, que es cómo se ve
un hueco deliberado —`ivr_campanias` no tiene `gcba_ivr_campanias` y `BITACORA` dice que es a
propósito—. **Un hueco deliberado y uno olvidado se ven igual en la hoja.**

**P3 · Los `sd_*`.** Confirmar las seis filas con `SUMA` sobre `sd_*` y sus conteos de unos
(medido: 22 · 43 · 36 sobre 978 filas). **No arreglar la magnitud acá.**

**P4 · La trampa del espacio.** `'JM '` con espacio final es 1 fila y con `=JM` cae en GCBA sin
fallar. Reportar si el comparador recorta espacios. Si no lo hace, **es un número mal, no un caso
borde** — y decide si el arreglo es la condición o la planilla.

⛔ **Terminar acá: reportar y parar.**

---

## Parte A — Testigo ANTES · Sonnet · effort normal

Como los anteriores, **con la ventana en el encabezado**. Registrar los trece marcadores, sus
gemelos GCBA, y los conteos de filas de cada uno.

⭐ **El control positivo de esta vuelta:** hoy `ivr_llamados` y `gcba_ivr_llamados` valen lo mismo,
y `pauta_meta` y `gcba_pauta_meta` también. **Si después del cambio siguen idénticos, el cambio no
llegó** — igual que `gcba_frecuencia` contra `camp_frecuencia` en la vuelta anterior.

---

## Parte B — El cambio · **Opus** · effort alto

`dimensiones = ambito=jm` en los marcadores de JM que la Parte 0 confirme, y `ambito=gcba` en los
gemelos que no lo tengan. **Filas de `MARCADORES`, no código.**

⭐ **Con relectura de la hoja**, como en la mudanza: un escritor que informa lo que escribió no
verifica nada.

⛔⛔ **ANTES de la Parte B: los huecos se justifican UNO POR UNO y por escrito.** El §P2 nombra
**un** hueco deliberado y **son cuatro** —`ivr_campanias`, `ivr_75`, `ivr_75_pct`, `ivr_marque1`—;
sólo el primero tiene justificación en `BITACORA:16621`. **Un hueco sin justificación escrita no se
distingue de un olvido**, y el próximo que lo lea va a tener que adivinar de nuevo. Decidir y
escribir los tres restantes es parte de esta Parte B.

⚠ `ivr_campanias` no tiene gemelo y el hueco es deliberado. **Ponerle `ambito=jm` igual** —pasa a
contar sólo las campañas de JM, que es lo que la caja dice— pero **declararlo**, porque cambia el
«3 campañas de IVR» de `L-031` y la lámina de GCBA se queda sin ese dato. Si el usuario prefiere
que GCBA lo tenga, es un marcador nuevo y va aparte.

---

## Parte C — Testigo DESPUÉS y corrida · **Opus** · effort alto

Testigo en la misma sesión, y corrida del informe `jm` con **`periodo_id = 2026_agosto_21_28`** —
la ventana del equipo, **no** el default de `R-11`.

**Responder:**

- ¿`ivr_llamados` y `gcba_ivr_llamados` se separaron? **Tienen que dar 55 + 8 = 63.**
  ⛔ **Corregido: no «9 + 54».** El comparador recorta espacios, así que `'JM '` queda en JM
  (P4). **No hay fila de más en GCBA y P4 no deja pendiente.**
- ¿`pauta_*` y `gcba_pauta_*` se separaron?
- ¿Se movió algún marcador que no esté en la lista? Si sí, **parar**.
- ¿Las láminas publican ahora números distintos donde antes publicaban el mismo?

---

## Parte D — Documentación · Sonnet · effort normal

`docs/` con el resultado, y **primera línea con las dos cosas juntas**:

- ✅ IVR y pauta ya discriminan JM de GCBA.
- ⛔ **`pauta_*` sigue publicando otra magnitud:** cuenta campañas con pauta, no contenidos
  implementados. El corte se arregló; el significado no. **Que esté en la misma pantalla**, para
  que nadie lea «pauta arreglado».

**Y lo que sigue abierto:** el duplicado de la campaña destacada (`P0`) · la magnitud de `pauta_*`
· `enc_alcance` · el default de `R-11` · el testigo sin período · las dos columnas de estado del
desglose · la ventana 21–27 que ajusta mejor sin causa conocida · el `P0` del `Libro` · el `P2`
del `||` · las tres familias de `sin_datos` · las filas sin `Id cuentas` · y que las láminas
publican acumulado **sin rotularlo**, por decisión de no tocar la plantilla del equipo.

---

## Resultado de la Parte 0 (31/08/2026) — ⛔ **P1 no se resuelve desde disco, y las tres hipótesis no se sostienen**

*Medido sobre `Motor_de_Informes_2026-08-30.xlsx` y `Seguimiento_Digital_2026-08-30.xlsx`, huellas
verificadas.*

### P4 — ⛔ resuelto, y **su premisa es falsa**: el comparador SÍ recorta

`valorPasaFiltro_` normaliza **los dos lados** con `normalizarValorDeclarado_`, que hace
`replace(/\s+/g,' ').trim()` — el `trim()` es deliberado (`R-10`). Ejecutada la lógica:

| celda | `ivr_vocero=JM` | `ivr_vocero!=JM` |
|---|---|---|
| `'JM'` · `'JM '` | ✅ pasa | ✗ |
| `'GCBA'` · `'GCBA '` | ✗ | ✅ pasa |

⇒ **`ivr_vocero=JM` da 55 y `ivr_vocero!=JM` da 8.** ⛔ **No 54 + 9: el `'JM '` con espacio queda
en JM.** La cifra «debería dar 9» del §P1 y el «9 + 54» de la Parte C **están mal en 1 fila**.
**No hay número mal ni caso borde**: el recorte funciona.

### P3 — ✅ confirmado

**6** marcadores con `SUMA` sobre `sd_*` —los tres `pauta_*` y los tres `gcba_pauta_*`—, **no hay
otros** entre los 220. Unos: **22 · 43 · 36** sobre 978 filas.

### P2 — el barrido, con los conteos declarados

**220 marcadores · 17 `gcba_*` · 15 pares completos `x`/`gcba_x`.**

| | cuántos |
|---|---|
| pares donde alguno no pide `ambito` | **6** |
| …IVR (JM sin ámbito, GCBA con) | 3 — `ivr_llamados` · `ivr_atendidos` · `ivr_at_pct` |
| …pauta (**ninguno** de los dos) | 3 — `pauta_meta` · `pauta_google` · `pauta_prog` |
| **marcadores afectados en total** | ⭐ **13** — exactamente los del §0 |
| `gcba_x` sin gemelo JM | **2** — `gcba_sms_entregados` · `gcba_sms_envios` |
| `ambito=jm` sin gemelo `gcba_` | 21 — los `ecv_*` y `enc_evento`, todos de `rdv` |

⭐ **La vista por pares muestra 6 y la de marcadores 13, y las dos son correctas:** cuatro `ivr_*`
de JM **no tienen gemelo**, así que no aparecen como par.

⛔⛔ **Y ahí está el hallazgo de P2, que es justo lo que pedía:** el prompt nombra **un** hueco
deliberado —`ivr_campanias`, confirmado en `BITACORA:16621`—. **Son CUATRO**: `ivr_campanias`,
`ivr_75`, `ivr_75_pct`, `ivr_marque1`. **Sólo uno está justificado; los otros tres se ven igual en
la hoja.**

### P1 — ⛔⛔ el bloqueante: **el cableado está completo y las tres hipótesis se caen**

| pieza | estado |
|---|---|
| datos · col G `Vocero` | ✅ 63 filas → **55 JM / 8 GCBA** normalizados |
| `MAPEO.ivr_vocero` | ✅ **col G**, presente |
| `SOLAPAS` · `digital\|Directa IVR` | ✅ `uso = fuente` |
| `DIMENSIONES_.ambito` | ✅ `jm = ivr_vocero=JM` · `gcba = ivr_vocero!=JM` |

⛔ **Hipótesis (1) se cae, y al revés de como está planteada.** `BITACORA:16584-16585`: `L-032`
**ya tiene** los tres `gcba_ivr_*` **desde el 29/08**, y ese mismo texto dice que **`TOKENS.md`
§178 quedó viejo**. ⚠ La cita del prompt a §178 está **vencida** — y aquel §178 **se declara a sí
mismo «sin medir uno por uno»** para todo lo que no sean los cuatro `gcba_imp_*`.

⭐⭐ **Lo que el repo sí registra es lo contrario:** `HANDOFF_CODE` (29/08) — *«`L-031` no cambió:
los `ivr_*` de JM **siguen sin caja** en la plantilla. Lo que el usuario agregó está en `L-032`»*.
Y también: *«el bloque de JM de IVR **contiene** al de GCBA: los `ivr_*` de `L-031` tienen
`dimensiones` vacío, y ausente significa «todas» — agregan las 63 filas»*.

⛔ **Y ahí aparece una inconsistencia entre la observación y el registro, que es el verdadero
resultado de esta Parte 0:** si `L-031` **no tiene caja** de IVR y `L-032` tiene
`gcba_ivr_llamados` con `ambito=gcba` (**8 filas**), **el deck no puede publicar 10.032 en las dos
láminas**. Algo cambió entre el 29 y el 31 — y **la plantilla es del equipo, así que puede haber
cambiado sin que el repo se entere** (`C-01`).

⭐ **El instrumento correcto ya existe y el propio handoff lo nombra dos veces:
`diagDondeVivenLosIvr()`** (`Auditoria.gs:4913`), que lee la **plantilla viva** y dice dónde vive
cada token — con su lista sacada de `MARCADORES` y no escrita a mano. **Es lo que hay que correr,
no una traza nueva.**

⛔ **PARADO. No se tocó nada.** Y la conclusión operativa del §P1 se mantiene aunque por otro
motivo: **agregarle `ambito=jm` a los siete todavía no está habilitado** — pero no porque falte el
token en `L-032`, sino porque **no se sabe qué caja está publicando qué en la plantilla de hoy**.

---

## ⭐⭐ P1 · Cerrada la mitad estructural con `CORRIDAS.mapa_tokens` (31/08/2026)

**El chequeo es dato registrado de la corrida, no una reconstrucción.** `mapa_tokens` de
`jm-20260828-193948` — **239 tokens**, cada uno con su slide y su `objectId`:

| token | slides |
|---|---|
| **`gcba_ivr_llamados`** | **3** |
| `gcba_ivr_atendidos` · `gcba_ivr_at_pct` | 3 |
| `ivr_llamados` · `ivr_at_pct` | **2** |
| `ivr_atendidos` | 2 · 5 |
| ⭐ `ivr_campanias` | **2 Y 3** |
| `ivr_75` · `ivr_75_pct` · `ivr_marque1` | 5 |

**Slide 2 = 21 tokens · slide 3 = 23 tokens**, y los 23 incluyen los tres `gcba_ivr_*`.

⇒ ⛔ **La hipótesis (1) queda descartada: el slide 3 SÍ usa `gcba_ivr_llamados`.** Ese token lleva
`ambito=gcba` → `ivr_vocero!=JM` → **debería dar 8 filas y da 63**. **La causa es (2) o (3): el
filtro de dimensión no se está aplicando.**

⭐ Y el mapa **confirma dos cosas más de una sola vez:** `ivr_campanias` está en **el slide 2 y en
el 3**, que es exactamente el «3 campañas de IVR» repetido que se observó; y `diagDondeVivenLosIvr()`
acierta en lo que midió — su límite era la **lista**, que no incluía los `gcba_ivr_*`.

### ⛔ Dos citas documentales que el mapa desmiente — y la segunda la traje yo

1. `TOKENS.md` §178 —*«sin `gcba_ivr_*`»*— **ya se sabía vieja**.
2. ⛔⛔ **`HANDOFF_CODE` (29/08): *«`L-031` no cambió: los `ivr_*` de JM siguen sin caja en la
   plantilla»*. FALSO** — el mapa pone `ivr_llamados`, `ivr_at_pct`, `ivr_atendidos` y
   `ivr_campanias` en el **slide 2**. **Cité el handoff como evidencia y era otra referencia
   envejecida**, un paso después de señalar el mismo error en `TOKENS.md`. **La cita no es la
   fuente, tampoco cuando la cita es un handoff propio.**

### ⚠ Lo que esto NO cierra, y qué falta

**Por qué da 63.** El traductor `condicionesDeDimensiones_` (`Fuentes.gs:1976`) **falla fuerte** si
la dimensión no está definida para `base|solapa` —devuelve `ok:false` con motivo—, y
`digital|Directa IVR` **sí está definida**. Y un `ivr_vocero` sin `MAPEO` daría
`«FALTA:…@filtro_campo_no_mapeado»`, no 63. ⇒ **Ninguno de los dos caminos conocidos produce «63 en
silencio»**, así que el modo de falla todavía no tiene nombre.

### ⚠ Qué contesta el `mapa_tokens` y qué NO — dicho en los dos sentidos, para que nadie lo cite mal

El que se leyó es el de **`jm-20260828-193948`**, porque el artefacto de configuración en disco es
del 30/08 y **la corrida del 31 no está**.

| ✅ **SÍ contesta** | ⛔ **NO contesta** |
|---|---|
| **qué token pinta qué caja** — token → slide → `objectId` | **qué VALOR publicó** esa caja |
| que el slide 3 usa `gcba_ivr_llamados` | si el filtro se aplicó en la corrida del 31 |
| que `ivr_campanias` está en el 2 **y** en el 3 | cuántas filas entraron |
| que `ivr_llamados` está en el slide 2 | qué decía `MARCADORES` el 31 |

⭐ **Es estructural, y por eso vale aunque sea de otra corrida:** la asignación token → caja **la
fija la plantilla**, no la ventana ni el dato. ⛔ **Pero de ahí no se sigue ningún número**, y
citarlo como si hubiera contestado el valor sería exactamente el error que este prompt viene
corrigiendo dos veces.

### ⛔⛔ La hipótesis (4), que ninguno de los dos había nombrado

> **(4) La fila VIVA de `MARCADORES` ya no dice `ambito=gcba`.**

⭐ **Es la más barata de descartar y la única que explica «63 en silencio» sin inventar un modo de
falla nuevo:** con la celda vacía el marcador **lee todo y no falla**, que es exactamente lo que se
observa. Y es plausible — **`MARCADORES` se edita a mano**.

⚠ **Toda la evidencia de que ese marcador lleva `ambito=gcba` sale de un `.xlsx` del 30/08.** Es la
misma clase de cita fechada que ya falló dos veces en este prompt.

⛔ **Se descarta PRIMERO.** Por eso el testigo ahora imprime el `dimensiones` que lee de la **hoja
viva** para cada marcador de su lista, antes de la traza.

### ⛔ Y si la corrida no NOMBRA la causa, la Parte B no arranca

**Un defecto con causa desconocida no se arregla: se tapa.** Los dos caminos conocidos —
`condicionesDeDimensiones_` falla fuerte si la dimensión no está definida, y un campo sin `MAPEO`
da `«FALTA:…»`— **no producen «63 en silencio»**. Si la hipótesis (4) queda descartada y la traza
tampoco lo explica, **estamos ante un modo de falla sin nombre**.

⚠ **Eso es peor que tenerlo identificado**, y vale aunque los números se separen: poner
`ambito=jm` a los siete podría hacer que las láminas muestren cifras distintas **sin que nadie sepa
por qué la de GCBA estaba mal**. **La Parte B sigue sin habilitarse.**

⭐ **El paso barato que lo cierra, y no necesita instrumento nuevo:** correr el testigo con la lista
**extendida a los tres `gcba_ivr_*`**. `testigoDeMarcadores_` ya imprime `filtro N/M` por marcador,
así que la traza va a decir **`8/63`** —el filtro se aplica— o **`— /63`** —no se aplica—, y eso
distingue (2) de (3) de una.

---

## ⛔⛔ P1 · CERRADA (31/08/2026) — el filtro anda, y el defecto es otro y peor

**La corrida del testigo con los seis de IVR y el `dimensiones` vivo lo cierra entero.**

### Hipótesis (4) — ⛔ descartada

La hoja **viva** dice `gcba_ivr_llamados → dimensiones="ambito=gcba"`. La celda está.
(Y `ivr_llamados → dimensiones=""`, como se esperaba.)

### ⭐⭐ El filtro SÍ se aplica — y el par junto lo demuestra

```
gcba_ivr_llamados   10032   filtro 8/63  · ventana 1/8
ivr_llamados        10032   filtro —     · ventana 1/63
```

**`ivr_vocero!=JM` da 8 de 63: el filtro funciona perfecto.** ⇒ **hipótesis (2) y (3) también
descartadas.** ⛔ **No hay ningún «modo de falla sin nombre».**

⭐⭐ **Los dos publican 10.032 porque terminan sumando LA MISMA ÚNICA FILA.** La ventana recorta a
**1** fila de IVR, y esa fila **es de GCBA** — así que `ivr_llamados` la toma por ser la única, y
`gcba_ivr_llamados` la toma porque además pasa su filtro. **La aritmética del propio log lo dice:
`1/8` y `1/63` son la misma fila.**

### ⛔⛔ Y eso INVIERTE el diagnóstico del §0

**Medido sobre `Seguimiento_Digital_2026-08-30.xlsx`, `digital/Directa IVR`, solape:**

| ventana | filas | **JM** | GCBA |
|---|---|---|---|
| **21–27** (`R-11`) | 1 | **0** | 1 — `3513-AGOINFGJ`, 10.032 llamados |
| **21–28** (equipo) | 3 | **0** | 3 |

⛔ **No hay NINGUNA campaña de IVR de JM en la ventana. Ni en la del motor ni en la del equipo.**

⇒ **El defecto no es «las dos láminas publican lo mismo por falta de corte». Es que `L-031` —la
lámina de JM— publica una campaña de GCBA como si fuera de JM.** Es el modo de falla más caro de
este repo: **el número plausible**. `10.032` llamados y `89,19 %` de atendidos se ven perfectos.

### ⛔ Lo que esto le hace a la Parte B — **no arranca como está escrita**

Ponerle `ambito=jm` a `ivr_llamados`, `ivr_atendidos`, `ivr_at_pct` y `ivr_campanias` **es
correcto** —dejan de publicar dato ajeno— **y deja a `L-031` con `sin_datos` en esas cuatro cajas**,
porque el universo correcto tiene **cero filas**.

⚠ **Eso es una decisión de producto, no un arreglo técnico**, y hay que tomarla con el dato a la
vista: la lámina de JM pasa de publicar **tres cifras equivocadas** a publicar **tres huecos
correctos**. **No se descubre después de la corrida.**

⭐ **Y el resto del prompt no depende de esto:** los seis `pauta_*` siguen siendo un caso distinto
—ahí sí hay dato de los dos lados— y pueden ir por separado.

### ⚠ Dos cosas más que la corrida deja anotadas

1. **`3508-AGOSALGC` aparece DOS VECES** en la ventana 21–28, las dos con `Llamados Realizados`
   **vacío**. Filas duplicadas en una planilla de terceros.
2. **Los canarios se movieron fuerte** —`u1_total_impresiones` 303.000.546 → **316.441.195**,
   `camp_meta_impresiones` 43.904.278 → **44.091.433**, `camp_frecuencia` 6,287895 → **7,5721502**—.
   **Ninguno lleva `ambito`**, así que es **deriva de la fuente** entre tomas, no efecto de nada de
   esto. ✅ Y `gcba_frecuencia` sigue **idéntico** a `camp_frecuencia`, como corresponde.
3. ✅ **La mudanza de los `imp_*` quedó confirmada del otro lado:** ahora leen
   `des_impresiones` del desglose, la conservación cierra —**28 + 289 = 317**— y la identidad
   `meta+google+prog = total` cierra en los dos ámbitos. Y la traza muestra **«2 con la celda
   vacía»**: las dos filas sin `Id cuentas` cayendo en GCBA por negación, **visibles**.

---

## Parte B — ⭐ IVR listo · ⛔ **`pauta_*` BLOQUEADO, y no por lo que el prompt suponía**

### IVR — `aplicarAmbitoARevisarIvr()` (`Instalar.gs`)

`dimensiones = ambito=jm` **y** el `formato` a su variante `_revisar`, en los siete, **por
`curarCamposMarcadores_`** y con **relectura de la hoja** —hacen falta las dos columnas por fila, y
que una entre no dice nada de la otra—.

| marcador | formato hoy | → |
|---|---|---|
| `ivr_campanias` | `numero` | `numero_revisar` |
| `ivr_llamados` · `ivr_atendidos` · `ivr_75` · `ivr_marque1` | `miles` | `miles_revisar` |
| `ivr_at_pct` · `ivr_75_pct` | `porcentaje_sin_signo` | `porcentaje_sin_signo_revisar` |

✅ Las tres variantes **ya existen y las usan 25 marcadores** (`miles_revisar` 15 ·
`porcentaje_sin_signo_revisar` 6 · `numero_revisar` 4). **No se inventa nada.**

⚠⚠ **Las dos cosas se aplican juntas y hacen cosas distintas:** `ambito=jm` arregla **el universo**;
`_revisar` **avisa** que la cifra está en observación. ⛔ **El `_revisar` NO corrige de dónde sale el
número.**

⚠⚠ **Y esta semana las cajas quedan vacías igual**, porque con `ambito=jm` el universo tiene **cero
filas**: no hay número que envolver. **Un hueco en la Parte C no significa que el formato no se
aplicó.** Se va a ver en las semanas que sí haya IVR de JM — **55 de las 63 filas de la solapa son
de JM**.

### ⭐ Los cuatro huecos de gemelo, decididos uno por uno

**Evidencia: el `mapa_tokens` de `jm-20260828-193948`** — porque un hueco deliberado y uno olvidado
se ven igual en la hoja.

| marcador | vive en | veredicto |
|---|---|---|
| `ivr_campanias` | slides **2 y 3** | ✅ **deliberado** — `BITACORA:16621` |
| `ivr_75` · `ivr_75_pct` · `ivr_marque1` | **sólo slide 5** | ✅ **estructural, no olvido** — la lámina 5 es «Encuentros con vecinos», **de JM y sin gemela de GCBA** |

⚠ `ivr_atendidos` vive en los slides **2 y 5**: el cambio le mueve el valor en **las dos láminas**,
y en las dos corresponde porque las dos son de JM.

### ⛔⛔ `pauta_*` — bloqueado, y el motivo es de otra clase

**`DIMENSIONES_.ambito` NO tiene entrada para `digital|Seguimiento digital`.** Verificado.
⇒ Con `dimensiones = ambito=jm`, `condicionesDeDimensiones_` devuelve `ok:false`
—*«`ambito=jm` no está definida para `digital|Seguimiento digital`»*— y **los seis publicarían
`«FALTA:…»` en vez de un número**.

⛔ **Eso contradice el §Parte B de este prompt: no es «filas de `MARCADORES`, no código».** Agregar
la entrada **es `Fuentes.gs` y pide `clasp push`**.

⚠ **Y antes hay que MEDIR qué columna dice el ámbito en esa solapa, no suponerla.** La candidata
obvia es **col E `JM | GCBA | POLICIA`** —`GCBA` 883 · vacío 64 · `JM` 29 · `LINDA` 2 sobre 978
filas—, **pero es la misma columna que se descartó el 27/08 en el desglose** por contradecir al
nombre en 530 de 620 filas. **Usarla acá sin medirla sería reabrir una decisión cerrada por la
puerta de atrás.**

⇒ **`pauta_*` va a prompt propio**, con su Parte 0 de medición. ⚠ Y su **magnitud** sigue siendo
otro problema, ya declarado: `SUMA` sobre un flag cuenta campañas con pauta, no contenidos
implementados.
