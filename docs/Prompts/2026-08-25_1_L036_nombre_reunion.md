# `L-036` — la columna `Campañas` sale `/////`: el nombre del encuentro no está cableado

**Contexto.** Los 20 marcadores de `L-036` ya están cableados y el diagnóstico del 25/08 16:56 lo
confirma: `20 de 20` con fila en `MARCADORES`, `20 de 20` en el mapa de la corrida
`jm-20260825-164524`, control positivo `3 de 3` en las dos preguntas. La lámina publica.

Lo que sigue en `/////` es otro conjunto: `post_camp1..4`, `post_formato1..4` —y `post_periodo1..4`,
que el log no alcanzó a listar—. **Esos nunca entraron a `COLUMNAS_POST_L036_`**, que tiene cinco
columnas × 4 filas = los 20. `FALTANTES` los reporta como `sin_fila`, que es correcto.

Este prompt cablea **el nombre del encuentro** (`post_camp1..4`). Nada más.

⛔ **El riesgo específico de esta lámina, y es el que decide el diseño.** Las cinco columnas
cableadas usan `operacion: FILA` con `separador: 'fecha_periodo'`. Si el nombre se resolviera desde
otra fuente, otra solapa o con otro orden, **la fila 2 del deck mostraría el nombre de un encuentro
y los números de otro, y nada fallaría**. El nombre tiene que salir de la **misma fila** de la misma
solapa, ordenada por el **mismo** separador.

---

## Parte 0 — medir contra el fixture, reportar y parar

**Modelo: Sonnet. Sólo lectura. No escribe en ninguna hoja, no toca ningún `.gs`.**

Antes de nada: actualizá el clon y leé `CLAUDE.md` —el árbol, la tabla de ruteo y **§4, los tres
caminos de verificación**—, `docs/PLAN.md`, `docs/CONFIG_INFORMES.md` y
`docs/PENDIENTES_consistencia.md`.

⭐ **Esta parte se mide por el camino del FIXTURE, no contra la planilla viva.** El archivo es
`DGPLES _ Seguimiento ECVs (1).xlsx`, dentro de `Seguimiento Digital  2026-08-20.zip` en
`docs/_fixtures/` —fuera de git, en disco—. Es el mismo del que salió el `MAPEO` de esta solapa el
24/08, cuando pasó de 2 campos a 7.

**Tres reglas del camino, y ninguna es opcional:**

1. ⛔ **Verificá el `sha256` contra la tabla de huellas del `README.md` de la carpeta ANTES de citar
   un solo número.** El de este `.zip` es
   `f8ef3227fc6cc73ef5879948451093f8e7a278c0baf1f4341d187958f0f8cc87`. Si no coincide, **pará y
   reportá**: un archivo sin huella es anónimo y lo medido sobre él no es reproducible.
2. **Identificá el `.xlsx` por su lista de SOLAPAS, no por el nombre del archivo.**
   `BASES.reuniones.nombre` dice *Base reuniones - Digital - Call Center* y el archivo se llama
   `DGPLES _ Seguimiento ECVs`. Tiene que dar 24 de 24 contra `SEED_SOLAPAS_`. Buscarlo por nombre
   costó tres días.
3. **Es una foto del 20/08 y su fecha es parte del resultado.** Lo que se mide es qué columna existe
   con qué título **ese día**. Que el motor la lea así lo dice otra cosa —el testigo `encabezado` de
   `D-31`—, no este fixture.

### 0.1 · El encabezado de `reuniones/Agenda JM | Post`

La solapa tiene `fila_encabezado: 2`. Hoy están mapeados `id_cuenta` (A), `fecha_periodo` (E,
*"Fecha"*), `poblacion` (F), `alc_real` (G), `imp_totales` (J), `vis_totales` (M, por posición) y
`vis_vtr_pct` (N, por posición). **Las columnas B, C y D no están mapeadas ni documentadas en
ninguna parte del repo.**

Reportá, para las columnas **A a N**: índice, letra, título de la fila 2, y el valor que traen
**Retiro** y **San Cristóbal** —las dos filas que ya se usaron como testigo en
`docs/FUENTE_post_reuniones_2026-08-25.md`—.

⭐ **Control positivo, y frená si no cierra.** Del mismo archivo y por el mismo lector, reportá
`poblacion` (F) y `alc_real` (G). Retiro tiene que dar **41.475** y **47.753**; San Cristóbal
**41.240** y **0**. **Si no dan eso, estás leyendo otra cosa y NO hay hallazgo: reportá que el
control falló y pará.** No sigas con B/C/D.

### 0.2 · Cuál de esas columnas es el nombre del encuentro

Con lo medido, decí explícitamente:

- **qué columna trae el nombre del encuentro** (el texto que la lámina rotula `Campañas`), o que
  ninguna lo trae;
- si hay una columna de **Formato**, o si se confirma lo anotado en `PENDIENTES_consistencia.md`
  —que el `Formato` sale de `Nomenclatura`, en otra base, y no hay extractor—;
- si el título del nombre está **una sola vez** o se repite por plataforma como pasa con
  `Visualizaciones` (M/R/W/AB). Si se repite, **decilo y no propongas mapeo por título**: es el caso
  de `D-31` ADDENDUM 2 y va `por_posicion`.

### 0.3 · El formato de un marcador de texto

Los cinco cableados usan `miles` y `fraccion`. `formatearValorMarcador_` acepta `texto` y `fecha`.
Confirmá, **leyendo el `.gs` y no de memoria**, que `FILA` devuelve el valor crudo sin coerción
numérica cuando el campo es texto, y que `texto` lo publica tal cual.

**Reportá todo esto y pará.** No escribas nada.

⚠ **Lo que esta parte NO puede contestar, y no lo intentes:** las 26 filas de `FALTANTES` de la
corrida `jm-20260825-164524`. Eso es estado de la hoja viva y es el camino del usuario.

---

## Parte 1 — cablear los cuatro `post_camp*`

**Modelo: Opus. Effort alto.** Mueve una celda publicable y su modo de falla es un nombre alineado
con los números de otro encuentro.

⛔ **Sólo si la Parte 0 identificó la columna del nombre con su control positivo verde.** Si ninguna
columna lo trae, **no inventes fuente**: reportá y pará. Que el nombre venga del temario o del
anclaje es una decisión del usuario, no una salida de emergencia.

1. **La fila de `MAPEO`.** Campo lógico nuevo para el nombre, con su `encabezado` como testigo de
   integridad (`D-31`) — que es lo que atrapa que el fixture sea del 20/08 y la solapa se haya
   movido desde entonces. Va también en el bloque de testigos de encabezado que ya tienen las otras
   siete de esta solapa. Si el título se repite, `por_posicion: 'sí'` con la nota de por qué.
2. **Los cuatro marcadores**, agregados a `COLUMNAS_POST_L036_` con el mismo patrón que los otros
   cinco: `operacion: 'FILA'`, `valor_fijo: n` **entero pelado** (`C-83` — Sheets convierte `1/4` en
   fecha), `separador: 'fecha_periodo'`, `formato: 'texto'`.
3. ⛔ **Agregalos a `MARCADORES_POST_L036_TODOS_`.** Esa lista **crece y no se poda**: es literal
   justamente porque derivarla de `COLUMNAS_POST_L036_` dejó ocho huérfanos el 25/08, y el reversor
   informó éxito.
4. **Los bancos.** `tools/probar-tabla-post.js` afirma hoy sobre 20; `tools/probar-mapeo-post.js`
   sobre el mapeo de esta solapa. Actualizalos con el motivo escrito. ⭐ **Si alguno se pone rojo
   porque el estado cambió, no lo aflojes: dalo vuelta y subile la exigencia** —el caso del 25/08
   está en `BITACORA.md`—. Que el marcador exista no alcanza: el banco tiene que exigir que declare
   el separador y el formato, porque cablearlo sin eso publicaría un nombre corrido de fila **sin
   fallar**.
5. Corré `node tools/suites.js` y reportá el veredicto **por exit code**.
6. En el reporte, decí qué tiene que verse en la próxima corrida y qué separa los casos: `/////`
   ya no puede salir; si sale `---`, resolvió y falló; si las filas 3 y 4 salen en `sin_datos` **eso
   es correcto** —dos ítems para cuatro ranuras—.

⛔ **No toques `post_formato*` ni `post_periodo*`**, y los dos motivos son distintos:

- **`post_formato*` — FUERA DE ALCANCE**, decisión del usuario del 25/08. No se cablea. Se declara
  en la Parte 2; no vuelve a aparecer como hueco.
- **`post_periodo*` — el usuario decidió que sale de `digital/CAMPAÑAS_DESGLOCE_DIGITAL`**
  (`des_fecha_inicio` I, `des_fecha_fin` J, ya mapeados). ⛔ **Eso no es un cableado: reabre el
  bloqueo B de `PENDIENTES_consistencia.md`**, que figura como *SE CAE* únicamente porque las cinco
  columnas estaban en una sola solapa. Con dos fuentes vuelve tal cual, y su modo de falla es el que
  publicó el Recap de CABA con 2.463.980 habitantes. **No entra acá.**

Un commit para el cableado, separado del de documentación.

---

## Parte 2 — documentación

**Modelo: Sonnet.**

Ruteá según `CLAUDE.md` §7; no reconstruyas la tabla de memoria. Va, como mínimo:

- **`docs/BITACORA.md`** — el hallazgo de `8e327a4` (el sembrador que ningún *Aplicar configuración*
  llamaba), el resultado del diagnóstico, y este cableado. **Hoy la bitácora no lo tiene.**
- **`docs/HANDOFF_CODE.md`** y **`docs/PENDIENTES_consistencia.md`** — misma omisión.
- **`docs/CONFIG_INFORMES.md`** — ⭐ **`post_formato1..4` queda FUERA DE ALCANCE para `jm`**,
  decisión del usuario del 25/08. Es una decisión editorial y ahí es donde vive. El motivo medido ya
  está en `PENDIENTES`: el `Formato` sale de `Nomenclatura`, en otra base, y **cambia por
  plataforma** —`Video` en Google y `Banners` en DV360 para la misma campaña—, así que una fila por
  encuentro no puede tener un solo formato.
- **`docs/CIERRE_POR_LAMINA.md`** — el estado de `L-036` después de esta corrida, con los cuatro
  `post_formato*` contados como **fuera de alcance** y no como faltantes. ⛔ El ✅ de la lámina lo
  pone el usuario, no vos.
- **`docs/FUENTE_post_reuniones_2026-08-25.md`** — el encabezado A–N medido en la Parte 0, **con el
  sha del fixture y su fecha al lado**. Ese doc ya tiene dos ADDENDUM; si esto contradice algo, va
  como ADDENDUM 3, no como edición.

⭐ **Y anotá el hueco de método que dejó esto**, que vale más que la lámina: `COLUMNAS_POST_L036_`
declara cinco columnas de una tabla de **ocho**, y nada en el repo dice que las otras tres no están.
Un cableado parcial sin un lugar donde conste que es parcial se lee como completo.

Commit de documentación separado.
