# HANDOFF CODE — estado actual

> Lo escribe **solo Claude Code**, y se **reescribe** entero cada vez: es un puntero al
> presente, no un historial. La historia está en `docs/BITACORA.md`.

**Última actualización:** 2026-08-09, al cerrar la corrida nocturna `_9` (seis tareas `N1`–`N6`)
· último commit al escribirlo: `0377f2e`

## Dónde estamos

**La noche fue de medición y de instrumentos, no de cableado.** Se corrió la Parte 0 del `_6` y
después las seis tareas de la nocturna `_9`. **Ni un marcador cableado, ni una plantilla tocada**
— las dos cosas estaban vetadas por el encabezado del `_9`.

**Lo único que cambió de código son 57 líneas de `Union.gs`** (`N4`+`N5`), y no cambian el
comportamiento del motor: hacen visible lo que la unión venía descartando en silencio.

## Lo primero que hay que leer: la respuesta de `N2`

**Los tokens de las láminas 2 y 3 de `JM` NO leen de `looker`. `MARCADORES` no tiene una sola
fila de `looker`** — 51 filas: 37 de `digital`, 14 de `rdv`.

**Así que el `_8` sirve como está: su trabajo es cablear.** Pero **una premisa suya se cae y hay
que leerla antes de correrlo**: el `_8` da por resueltos ocho tokens de la lámina 2, y **tres de
esos ocho —`cc_base`, `cc_contactados`, `cc_contact_pct`— no tienen fila en `MARCADORES`**, así
que no publican en ninguna lámina. La cuenta de *"trece tokens nuevos, no veintiuno"* da mal: los
que faltan en la lámina 2 son **ocho**.

Detalle completo, con la tabla token por token, en `docs/BITACORA.md` → *"`N2` — de qué base leen
las láminas 2 y 3 de `JM`"*.

## Dos correcciones a datos que estaban circulando

- **⚠ `looker` NO es ilegible.** Se dijo lo contrario en un reporte del 08/08 y de ahí pasó al
  `_9`. **`looker/resumen_metricas_dinamico` lee 949 filas, 26 en la ventana del informe, cero
  sin fecha.** El fallo original fue una llamada mal construida (ventana con fechas en texto), no
  un mapeo faltante. Lo real: las **otras seis** solapas `fuente` de `looker` no tienen ni una
  fila en `MAPEO` **ni ninguna columna de fecha**.
- **⚠ La lámina 6 no falla "por la ventana".** La bitácora del 07/08 decía que `3354-JULJDGAG` y
  `3346-JULJDGAG` *"no tienen filas para esta ventana"*. **La ventana no interviene**: `digital`
  es `snapshot`. No tienen filas, sin más. Corregido por addendum fechado. **La misma frase quedó
  copiada en el `_8`, que está sin ejecutar.**

## Qué sigue

1. **`_8` · cerrar las láminas 1 a 6 de `JM`.** Listo para correr, con las dos correcciones de
   arriba leídas primero. Son **16 tokens** los que faltan (8 + 8 con `gcba_`), y `N2` ya midió
   de dónde saldrían — pero **tres decisiones son tuyas**, abajo.
2. **`_6` Partes A–D · la etapa de una campaña.** La Parte 0 corrió y dejó siete correcciones en
   el addendum `6.1`. **No tiene luz verde**: depende de decisiones tuyas.
3. **`_11` · Fase 2, el sellador.** Sigue frenado a propósito, y ahora hay un motivo más: ver
   "Esperando decisión tuya".
4. **`_7` · el sembrador de `MARCADORES`.** Sin arrancar. Ojo con `D-17`.

## Esperando decisión tuya

**Las tres de `N2`, que bloquean el cableado del `_8`:**

- **¿De dónde sale `cc_base`?** Aparecieron dos candidatas en `looker/CC`: `Base enviada` y
  `Base barrida`. **Son dos, así que no se elige sola.** Sin `cc_base` tampoco sale
  `cc_contact_pct`, que es un cociente.
- **¿`imp_prog` es `DV360`?** Y qué pasa con TikTok, Mercado Libre, Twitter, Twitch y Uber, que
  tienen impresiones y no tienen token. ⚠ `Uber` trae **0,58 impresiones en 5 filas** — dato
  sucio, mirarlo antes de sumarlo.
- **¿`imp_*` sale de `digital/CAMPAÑAS_DESGLOCE_DIGITAL` o de `looker/DIGITAL`?** Las dos tienen
  `Plataforma` e `Impresiones`. **Dos fuentes para el mismo número se decide antes de cablear.**

**Las de la unión (`_6`):** qué hacer con las huérfanas, la forma del registro si
`unirDigitalPorCuenta` deja de pisar, qué señal define el universo M2 (`Eje` da 599 filas y
`Tipo de mail` da 718, **no empatan**), y qué sección pinta un ítem `durante`.

**`looker`:** o pasa a `snapshot` —y las seis solapas se vuelven legibles, pero
`resumen_metricas_dinamico` pierde su filtro por ventana— o esas seis bajan a `revisar`/`ignorar`.

**`N5` a medias:** las huérfanas ya salen en el diagnóstico, pero **no llegan al informe de
corrida** porque no existe tal artefacto y `filasDigitalDeEncuentro` tira el diagnóstico. Falta
decidir por dónde sale y a dónde va.

**Y dos archivos que quedaron fuera del repo:** `2026-08-08_7_sembrador_de_marcadores.md` y
`NOTAS_ORADOR_SECCO_8_y_25.md` llegaron adjuntos pero no estaban entre los tres que pediste
copiar, así que **no se copiaron**. Siguen en `Downloads`. El segundo importa: si las notas ya se
borraron de `SECCO_marcada`, ese archivo es **la única copia** de su contenido — y el repo hoy
dice lo contrario (`R-19`/`C-01` addendum 1 y el `_11` las dan por presentes, como caso de
prueba).

## Lo medido esta noche, y no hay que volver a medirlo

- **La unión descarta el 71,1 % de `digital/Digital`** (922 filas de 1297; sólo **38** matchean)
  y el **29,2 % de `Directa Mail`** (631 de 2162). Anotado como `P0` y `P1` en `PENDIENTES`.
- **77 filas de la maestra se pisan** por id repetido: 840 filas con id, 763 ids distintos.
- **Las 5 huérfanas de `digital/Alcance` tienen `id_cuenta = "#N/A"`** — fórmula rota que llega
  como texto, el caso de `R-19`. Lo encontró el instrumento de `N5` en su primera corrida.
- **La etapa de una campaña vive en `I` / `mail_tipo`**, ya mapeada, con vocabulario cerrado
  `M2 | Pre` / `M2 | Post` / `M2 | Durante`. **No en `H` / `mail_campana`**, que la trae en 24 de
  2162 filas. **`durante` existe en los datos.**
- **El 58,3 % de las filas M2 de mail no declara etapa**, así que `pre` por ausencia no es
  asumible en ningún lado.
- **`digital/CAMPAÑAS_DESGLOCE_DIGITAL`** es `uso = fuente`, 4889 filas, legible, y **cero filas
  en `MAPEO`**. Tiene `Plataforma` (8 valores) e `Impresiones`.
- **`parsearFiltro_` no se rompe con el `|`**: `mail_tipo=M2 | Post` parsea bien. Filtrar por
  etapa se puede escribir hoy en `MARCADORES`, sin tocar `.gs`. El límite es que acepta **un solo**
  `campo=valor`, sin OR.
- **Las seis solapas `fuente` de `looker` no tienen ninguna columna de fecha.** No es que la
  candidata sea ambigua: no existe.

## Qué mirar antes de tocar algo

- **`MARCADORES` no se puede leer por `tools/api.js registros`** (no tiene lector en
  `API_LECTORES_`). Se lee con `node tools/snapshot.js`, que no pasa por ningún `.gs`, o con
  `llamar fn=leerMarcadores_`.
- **`leerFuente` con una ventana armada a mano falla** si las fechas van como texto:
  `formatearFecha_` exige `Date`. El error sale como `Utilities.formatDate` y **se parece a un
  problema de datos sin serlo**. Es el error que produjo el falso "looker ilegible".
- **Antes de escribir un filtro, verificar que su campo esté en `MAPEO`** — un filtro propio con
  campo no mapeado **no filtra: falla**. El heredado con campo ausente se ignora en silencio.
- **Un número correcto puede salir de las filas equivocadas.** `CLAUDE.md` §4.
- **Dos cosas que se llaman igual no son la misma cosa.** Casos vivos: `REVISAR` (estado de
  marcador **y** origen de columna en `Fechas.gs`); `Seguimiento Digital` (nombre de la base
  `digital`, **y** nombre de una solapa, **y** `hoja_default` es `Digital`, una tercera cosa).
- **`tools/api.js` no reintenta por defecto.** Si el transporte devuelve HTML, verificar si llegó
  a correr antes de repetir.
- **Seis láminas están escondidas** —entre ellas la 10, con 23 de los 31 tokens `m2_`— y por
  `D-21` no entran al mapa de la corrida.

## Números de referencia — **remedidos el 09/08 01:29–01:47**

`MARCADORES` en **51 filas** y 14 columnas (el handoff anterior decía 44 y el `_9` decía 52
contando el encabezado: **las dos citas estaban corridas**). `SECCIONES` en 36 filas. `MAPEO` en
140. `REUNIONES` en 7 filas. `CAMPANAS` en 3. Plantilla `jm`: 22 láminas, 172 tokens.
**Las operaciones del motor son siete.**

Unión digital, ventana `2026-07-24 → 2026-07-30`: maestra 979 filas / 840 con id / **763 cuentas**
/ 77 pisadas. Anclaje: **5 anclados, 0 sinLink, 0 baja confianza**.
