# `D-33` quedó a medias — medir qué falta para cerrarla, y dejarlo documentado

**Contexto, y va escrito porque este análisis ya se hizo dos veces y conviene no repetirlo.**

`D-33` (14-15/08) migró 42 de 48 marcadores al vocabulario **`medida + dimensión`**. Resolvió un
problema real y bien: la dimensión *«ámbito JM/GCBA»* estaba escrita de **cuatro formas** según la
base —`figura=Jorge Macri`, `mail_remitente=…`, `dig_jm_gcba=JM`, `campana~=JM`— en un `filtro` de
texto libre, y el corte además vivía en el nombre del token.

⭐ **El argumento que la fundamentó sigue siendo el correcto:** el motor ya sabía que una medida se
llama distinto en cada base —para eso está `MAPEO`—; del lado de los cortes no había nada
equivalente. **`D-33` les dio a las dimensiones lo que `MAPEO` ya le daba a las medidas.**

⛔⛔ **Lo que NO cambió, y es lo que hay que medir: la unidad de cableado.**

| | un semantic layer (dbt · LookML · Cube) | el motor hoy |
|---|---|---|
| la **medida** | se define una vez | ✅ `campo_logico` + `MAPEO` |
| la **dimensión** | se define una vez, con sus valores | ✅ `DIMENSIONES_` |
| **la combinación** | **la produce la CONSULTA al pedirla** | ⛔ **una fila y un nombre por cada una** |

`imp_meta` · `imp_google` · `imp_prog` son tres celdas del cubo con tres filas y tres nombres. Eso
**funciona** mientras cada combinación tenga su nombre propio. **Se rompe cuando dos láminas quieren
la misma medida con cortes distintos**, porque el nombre es uno solo:

> `cc_base`, `cc_contactados` y `cc_contact_pct` viven en `L-031` **y** en `L-034`. `MARCADORES`
> tiene clave `marcador + informe_id` —**no hay `lamina_id`**, verificado: las 15 columnas son
> `marcador · familia · informe_id · base_id · solapa · campo_logico · periodo_ref · operacion ·
> valor_fijo · formato · filtro · dimensiones · catalogo · separador · notas`— y
> `resolverMarcadores` filtra sólo por `informe_id === informeId || '*'`. **Una fila pinta las dos
> láminas con el mismo número.**

Y los dos universos ya están declarados y son distintos: `L-034` es **el agregado de las reuniones
del temario** (decisión del usuario, 26/08 — el deck lo muestra: `ENCUENTROS: 2`, Parque Avellaneda
y Parque Patricios); `L-031` es **una sola campaña de Call Center**.

⚠ **Y la migración `2026-08-20_7` no resuelve esto**: `aplicarAsteriscoCompartidos()` pone
`informe_id = '*'` para compartir entre **informes** (`jm` y `secco`). Es el eje opuesto.

⭐ **El eslabón que falta, en los términos de la industria: en un semantic layer el corte lo aporta
la CONSULTA. Acá la consulta es `{{cc_base}}` en la plantilla, y una plantilla no puede llevar
contexto.** La mitad ya existe —`LAMINAS.filtro` decide *qué lámina se emite*— y lo que no existe es
que la lámina declare *con qué dimensiones se resuelven sus tokens*.

---

## Parte 0 — medir el tamaño. Sólo lectura, reportar y parar.

**Modelo: Sonnet, effort alto.** No toques `MARCADORES`, ni `LAMINAS`, ni ningún `.gs`.

**La pregunta única: ¿cuántos tokens compartidos necesitan cortes distintos, y cuántos publican lo
mismo en todas sus láminas?** De eso depende si corresponde una pieza de motor o cuatro tokens
nuevos.

1. **Los 27 tokens que viven en más de una lámina** —ya los mediste en el censo del 26/08—.
   Para cada uno, repartilos en tres montones y **contá los tres**:

   | montón | qué es |
   |---|---|
   | **A · mismo hecho** | publica lo mismo en todas sus láminas y está bien así — `camp_titulo` en ocho es el caso |
   | **B · corte distinto** | dos láminas quieren la misma medida con universos distintos. Los `cc_*` son el caso conocido |
   | **C · no clasificable** | decilo, no lo fuerces |

   ⭐ Para decidir entre A y B, la pregunta operativa es: **¿las dos láminas publicarían el mismo
   número?** Si el deck de `agosto_14_20` ya las muestra, mirá el deck; si no, decilo.

2. **Qué costaría que `LAMINAS` declare dimensiones.** Ya tiene 15 columnas y `filtro` entre ellas.
   Reportá, medido:
   - dónde entraría el corte en la cadena — `datosDeMarcador_` ya recibe `opciones` con
     `seccion_id` y `filtro_seccion`, así que el contexto **ya viaja**;
   - ⚠ **qué pasa con el pintado.** `replaceAllText('{{token}}')` corre sobre la lámina, pero la
     resolución hoy es por informe. Si dos láminas resuelven el mismo token distinto, **hay que
     resolver por lámina y no por informe** — decí si `solo_marcadores` alcanza o si hace falta más;
   - la checklist de `CLAUDE.md` §2 para dar de alta una columna: `SEED_*`, `COLUMNAS_DELTA_`,
     `upsertPorClave_`, y las tres listas duplicadas de `Instalar.gs` / `tools/escritores.js` /
     `tools/snapshot.js` con `tools/listas.js` fallando si no coinciden.

3. **La alternativa barata, para poder compararlas.** Renombrar en la plantilla los tokens del
   montón B — ⭐ es lo que el proyecto **ya hace**: `L-032` publica *«los mismos de la 2 con prefijo
   `gcba_`»*. Cuántos tokens serían, y en qué láminas.

⭐ **Control positivo, y frená si no da:** un token del montón A cuyo valor ya está verificado en
las dos láminas donde vive. Si tu método lo clasifica en B, está midiendo mal.

⛔ **No propongas cuál elegir.** Reportá los tres montones con sus conteos y los dos costos. La
decisión es del usuario.

---

## Parte 1 — documentar el análisis, para que no se repita

**Modelo: Sonnet.** Va **aunque la Parte 0 no cierre**, y es la mitad del valor de esta vuelta.

⛔ Este análisis se hizo **dos veces** —el 14/08 al fundamentar `D-33` y hoy— y las dos veces hubo
que reconstruir por qué `imp_*` funciona y `cc_*` no. **Que quede escrito es el punto.**

Va a **`docs/PLAN.md`**, al lado de `D-33`, como su estado — no como una `D-NN` nueva: no hay
decisión todavía, hay un diagnóstico. Con estas cuatro cosas:

- **qué resolvió `D-33`** — las cuatro expresiones físicas del mismo corte, y la simetría con
  `MAPEO` que la fundamentó;
- ⛔ **qué NO resolvió** — la unidad de cableado sigue siendo *un token = una fila = un número*, y
  la tabla de las tres capas de arriba;
- ⭐ **por qué `imp_*` funciona y `cc_*` no** — tres nombres para tres celdas del cubo contra un
  nombre para dos; **es la misma arquitectura, y el caso que la rompe es que la CONSULTA no puede
  aportar el corte**;
- **la evidencia**: `MARCADORES` sin `lamina_id`, `resolverMarcadores` filtrando sólo por informe, y
  que `2026-08-20_7` es el eje de informes y no el de láminas.

⚠ Y que `L-034` **no se puede cerrar sin resolver esto**, aunque los resúmenes queden para después:
comparten los tokens. Eso hoy no está escrito en ningún lado y es lo que hace que la lámina parezca
independiente cuando no lo es.

`node tools/suites.js`, veredicto por exit code. Un commit.
