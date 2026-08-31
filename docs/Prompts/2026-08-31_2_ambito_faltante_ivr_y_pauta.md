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

`ivr_vocero!=JM` debería dar **9** filas. El deck del 31/08 publica el total, 10.032 llamados, en
**las dos** láminas.

**Correr la traza de `gcba_ivr_llamados`** y reportar qué dice el filtro: cuántas filas de
cuántas, sobre qué columna. Tres hipótesis en orden:

1. **La plantilla de `L-032` no usa el token.** El marcador existe y nadie lo llama — misma figura
   que el `||` sin usuarios y que `VALORES` declarada y vacía. ⚠ `TOKENS.md` §178 registraba esa
   lámina como «sin `gcba_ivr_*`» medido contra la plantilla viva el 16/08, y `HANDOFF_CODE` dice
   que sumó cuatro tokens el 29/08. **Verificar contra la plantilla, no contra el documento.**
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

⚠ `ivr_campanias` no tiene gemelo y el hueco es deliberado. **Ponerle `ambito=jm` igual** —pasa a
contar sólo las campañas de JM, que es lo que la caja dice— pero **declararlo**, porque cambia el
«3 campañas de IVR» de `L-031` y la lámina de GCBA se queda sin ese dato. Si el usuario prefiere
que GCBA lo tenga, es un marcador nuevo y va aparte.

---

## Parte C — Testigo DESPUÉS y corrida · **Opus** · effort alto

Testigo en la misma sesión, y corrida del informe `jm` con **`periodo_id = 2026_agosto_21_28`** —
la ventana del equipo, **no** el default de `R-11`.

**Responder:**

- ¿`ivr_llamados` y `gcba_ivr_llamados` se separaron? ¿Suman 63 filas entre los dos, o 9 + 54?
  ⚠ Con `'JM '` de por medio pueden dar 54 + 9, y **esa fila de más en GCBA es el hallazgo de P4**.
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
