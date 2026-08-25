# `L-036` — el `Período` desde el desglose, y la lámina cierra

**Continúa al `2026-08-25_2`, cuya Parte 0 ya se ejecutó y cuyo reporte está aceptado.** Este prompt
es autocontenido: reemplaza sus Partes 1 a 4 y no hace falta releerlo.

**Estado:** 24 de 32 tokens cableados. `post_formato1-4` **fuera de alcance** (`CONFIG_INFORMES`
§2.3 bis). **Los cuatro `post_periodo*` son los últimos.**

## De dónde sale cada columna — decidido, y es el marco de todo lo de abajo

| columna | fuente |
|---|---|
| `Campañas` | `reuniones/Agenda JM \| Post` — compuesto B+C+D+E con `FILA_TEXTO` |
| `Habitantes` · `Alcance` | ídem — F y G |
| `Impresiones` · `Visualizaciones` · `VTR%` | ídem — J, M, N |
| `Formato` | ⛔ fuera de alcance |
| **`Período`** | **`digital/CAMPAÑAS_DESGLOCE_DIGITAL` — y es lo ÚNICO que sale de ahí** |

⛔ ⭐⭐ **No hay nada que sumar.** Lo único que hay que hacer con las N filas de plataforma de un
encuentro es `min(des_fecha_inicio)` y `max(des_fecha_fin)`. **No crees `CONFIG.campos_agregar_post`**
— si aparece en algún borrador, sacalo — y **la regla de oro no se toca**: esa agregación vive en
`Marcadores.gs`, como toda la aritmética.

## ⛔⛔ El riesgo central, y todo lo de abajo está ordenado alrededor de él

La lámina indexa **dos listas de filas construidas por separado** con el mismo `valor_fijo: n`. Si no
tienen los mismos elementos **en el mismo orden**, la ranura 2 muestra el período de un encuentro y
los números de otro — **y nada falla**.

Y pueden diferir por **dos** motivos, no uno:

1. **El largo.** `filasDeSolapaDelTemario_` **compacta**: `sin_cuenta`, `sin_fila` y `sin_metrica`
   saltean el ítem antes del `filas.push`.
2. **El orden.** `opFILA` llama a `filasOrdenadas_`, que **reordena por `separador`**. Dos solapas
   ordenadas por campos distintos desalinean **aunque tengan los mismos elementos**.

San Cristóbal ya diferencia a las dos fuentes —0 filas POST en el desglose, descartado por
`campos_metrica_post` en la solapa—. **Hoy coinciden por dos caminos que nadie coordinó. Coincidir
por casualidad no es un contrato.**

---

## Parte A — verificar las premisas nuevas, reportar y parar

**Modelo: Sonnet. Effort alto** — es lectura de código con cuidado, no decisión. **No escribe nada.**

Actualizá el clon. Leé `CLAUDE.md` —el árbol, el ruteo y §2 y §4—, `docs/PLAN.md`,
`docs/CONFIG_INFORMES.md` y `docs/PENDIENTES_consistencia.md`.

Contestá, citando el código:

1. **¿`FILA_TEXTO` se puede extender para componer un rango `min`–`max`, o hay que crear una
   operación nueva?** ⛔ **No cambies su semántica para los consumidores que ya publican**
   (`post_camp1-4`). Decí cuál de las dos elegís **y por qué**.
2. **¿Qué le llega hoy a una operación en `ctx.filas`?** Necesito saber si la operación puede recibir
   **las N filas de un encuentro** —el grupo entero— o si el contrato es una fila por posición. De
   eso depende toda la Parte 3.
3. **¿`filasOrdenadas_` mantiene juntas las filas que comparten el valor de orden**, y qué decide el
   orden **dentro** del grupo? El desempate importa: la operación tiene que tomar el grupo entero, no
   la primera.
4. **Confirmá que del desglose no hace falta nada más que el período** — que `des_impresiones` y
   `des_visualizaciones` no quedaron cableados a ningún `post_*` por una vuelta anterior.
5. **`DIMENSIONES_.etapa.post`** — reportá su declaración exacta para
   `digital|CAMPAÑAS_DESGLOCE_DIGITAL`. Es lo que va en `dimensiones`; **no se inventa un `filtro`**.

⭐ **Control positivo, y frená si no da:** una lámina que hoy publica bien por la rama del temario,
leída por el mismo camino. Si esa tampoco resuelve, el instrumento está roto y **no hay hallazgo**.

**Reportá y pará.**

---

## Parte 1 — el temario declara VARIAS solapas

**Modelo: Opus. Effort alto.** Mueve el riesgo del universo ancho.

`CONFIG` tiene `base_agregado_post` y `solapa_agregado_post` **en singular**, y
`opciones.filas_temario` es **un solo objeto**. Con dos fuentes no alcanza.

- `CONFIG` pasa a admitir **una lista** de pares `base|solapa`. Sembrado con seed, con la regla de
  siempre: **la hoja gana, el seed sólo siembra lo ausente**.
- `opciones.filas_temario` pasa a **mapa por `base|solapa`**, y la rama por marcador busca su entrada
  por esa clave.

⛔⛔ **Y acá está lo que puede publicar un universo ancho.** Hoy, si la comparación
`opciones.base_temario === fila.base_id && opciones.hoja_temario === solapa` no da, el marcador **no
entra a la rama** y sigue a la cadena general: `leerFuente` sobre la solapa entera. Es lo que publicó
el **Recap de CABA con 2.463.980 habitantes**. Con dos solapas declaradas ese modo de falla se
multiplica.

> **Lo que dispara la guarda tiene que ser que la solapa esté DECLARADA en la lista, no que tenga
> filas.** Declarada y sin filas → `«FALTA:…@post_sin_temario»` con su diagnóstico —que es lo que ya
> hace hoy—. **Nunca** caída a la cadena general.

⭐ **Y la lista única de la Parte 2 viaja en `opciones`**: se calcula **una vez por corrida**, no una
vez por marcador.

**El banco de esta parte tiene que ejercitar el caso negativo:** una solapa declarada que devuelve
cero filas **no** publica un número. Un banco que sólo prueba el camino feliz no prueba esta pieza.

Un commit.

---

## Parte 2 — una sola lista de encuentros, y join por `id_cuenta`

**Modelo: Opus. Effort alto.** Es donde vive el riesgo de desalineación.

**Decisión del usuario:** `n` significa **el n-ésimo encuentro que tuvo POST**, y la lista es **una
sola** para todas las columnas de la lámina. Se evaluaron tres semánticas —la n-ésima fila con datos,
el n-ésimo encuentro del temario, y ésta—; ganó ésta porque un hueco en el medio de la tabla no
distingue *«no tuvo POST»* de *«algo falló»*.

### La construcción, en este orden

1. **Se construye UNA lista de encuentros calificados**, una vez por corrida: los ítems del temario,
   recortados por el criterio que **ya existe** —`campos_metrica_post` sobre
   `reuniones/Agenda JM | Post`—, ordenados por la fecha del encuentro.
   ⚠ **Quién califica lo decide esa solapa**, porque es la única con fila por cada encuentro aunque
   sea en ceros. **Escribilo como limitación, no como supuesto.**
2. **Cada solapa se joinea a esa lista por `id_cuenta`.** Nunca por posición, nunca por su propio
   orden. Una solapa sin fila para ese id da `sin_datos` **en sus columnas** y **no corre las
   demás**.

### ⭐⭐ Y lo que hace que esto NO toque `opFILA`

⛔ **`FILA` la usan otros 41 marcadores fuera de `L-036`. Su semántica no se cambia.** Y `separador`
tampoco puede quedar vacío: `filasOrdenadas_` falla con `«FALTA:@fila_sin_orden»`.

> **Las filas del desglose llevan el `fecha_periodo` del encuentro, copiado de la lista única.** Las
> dos solapas se ordenan entonces **por el mismo campo con los mismos valores**, así que
> `filasOrdenadas_` produce la misma secuencia en las dos.

⭐ **El orden lo define la lista única y viaja en la fila.** `opFILA` y `FILA_TEXTO` quedan
**intactos** y los otros 41 marcadores no se enteran. Si encontrás un motivo por el que esto no se
sostiene, **reportalo y pará** en vez de inventar una operación.

⚠ **Del lado del desglose son VARIAS filas por encuentro, no una sintética** — y las N llevan todas
el mismo `fecha_periodo`, así que `filasOrdenadas_` las deja juntas. **Verificalo, no lo supongas**
(Parte A · 3).

### Los tres bancos que fijan esto

⭐ Son el trabajo, no el accesorio. Sin ellos la alineación vuelve a ser una coincidencia.

1. **Las dos solapas producen la misma secuencia de `id_cuenta`** después de `filasOrdenadas_`. Es el
   testigo directo de la alineación.
2. **Un encuentro presente en una solapa y ausente en la otra no corre las ranuras.** San Cristóbal
   es el caso real, pero hoy **las dos lo descartan**. ⭐ **Construí también el caso donde sólo una lo
   descarta**: ése es el que rompe, y hoy no ocurre.
3. **Un encuentro con 5 filas de plataforma publica UN período**, el `min`–`max` de las cinco. Retiro
   es el caso real y está medido.

Un commit.

---

## Parte 3 — la operación del rango, `MAPEO`, y los cuatro `post_periodo*`

**Modelo: Opus. Effort alto.** Mueve una celda publicable.

- **La operación del rango vive en `Marcadores.gs`** —extendiendo `FILA_TEXTO` o como operación
  nueva, según lo que decidas en la Parte A—. Toma las filas del n-ésimo encuentro y compone `min` de
  la fecha de inicio y `max` de la de fin.
  ⚠ **Las fechas llegan como `Date`**, no como el serial del `.xlsx`. Es la trampa que ya mordió en
  `2026-08-25_1`: se copió el formato de almacenamiento en vez del dato que le llega al motor.
- **La plantilla del rango vive en `campo_logico`**, como hace `FILA_TEXTO` — así cambiar la forma no
  exige `clasp push`. **Arrancá con `24/07 — 06/08`.**
- **Las filas de `MAPEO`** que falten, cada una con su `encabezado` como testigo de integridad
  (`D-31`).
- **El corte POST va en `dimensiones`**, con la declaración que ya existe. ⛔ **No inventes un
  `filtro`**: el corte dimensional vive en `dimensiones` y `filtro` está reservado para guardas
  técnicas.
- `valor_fijo: n` **entero pelado** (`C-83` — Sheets convierte `1/4` en fecha). **Separador
  `fecha_periodo`**, igual que las otras seis.
- ⛔ **Los cuatro van a `MARCADORES_POST_L036_TODOS_`.** Esa lista **crece y no se poda**: derivarla
  de `COLUMNAS_POST_L036_` dejó ocho huérfanos el 25/08 y el reversor informó éxito.
- **`COLUMNAS_POST_L036_` declara su alcance**: siete columnas de una tabla de ocho, con `Formato`
  fuera de alcance nombrado ahí mismo.

### El control, que ya existe y no depende del equipo

⭐⭐ `Agenda JM | Post` **es un agregado derivado del desglose y cierra al dígito** (`ADDENDUM 2` de
`FUENTE_post`): `col17` Meta, `col22` Google, `col27` Programmatic, `col12` el total. Entonces:

> **La suma de las filas POST del desglose para un encuentro tiene que dar `Agenda JM | Post` col J
> (impresiones) y col M (visualizaciones) para ese mismo encuentro.**

**Ése es el control de que las dos fuentes están alineadas fila por fila**, y no depende del deck del
equipo ni de una foto de la base. ⭐ **Y es el detector de la limitación de la Parte 2·1**: si algún
día un encuentro tiene filas en el desglose y ceros en la solapa, queda afuera de la lista y **esta
identidad no cierra**. Dejalo como afirmación de banco, no como una medición de una vez.

Corré `node tools/suites.js` y reportá el veredicto **por exit code**.

Un commit.

---

## Parte 4 — documentación

**Modelo: Sonnet.** Rutear por `CLAUDE.md` §7; no reconstruyas la tabla de memoria.

- **`docs/PLAN.md`** — dos entradas:
  - la **semántica de `n`** para `L-036` como `D-NN`, con las tres opciones evaluadas, por qué ganó
    ésta, y la limitación escrita: **la lista de encuentros la decide `Agenda JM | Post`**;
  - ⭐ que la **excepción a la regla de oro se evaluó y se descartó**, con el motivo: el precedente
    invocado —`unirDigitalPorCuenta`— **pisa y no calcula**, así que no sostenía la excepción, y con
    el diseño final no hay ninguna suma. **Una excepción descartada con motivo es lo que evita que
    la próxima vuelta la vuelva a proponer.**
- **`docs/PENDIENTES_consistencia.md`** — el bloque *SE CAE* del 25/08 se anota **reabierto y
  resuelto**, con fecha: los bloqueos A y B volvieron al declarar dos fuentes y este prompt los
  cerró. **No editar el texto viejo.**
- **`docs/FUENTE_post_reuniones_2026-08-25.md`** — ADDENDUM con dos cosas:
  - ⛔ **Orden Público tiene 4 filas POST, no 3.** El conteo viejo quedó publicado y citado: **se
    corrige por addendum, no se edita.**
  - el `Período` sale del desglose, y por qué no podía salir de `Agenda JM | Post`: **ninguna de las
    29 columnas trae fecha de inicio ni de fin**, sólo `Fecha`, la del encuentro.
- **`docs/CIERRE_POR_LAMINA.md`** — `L-036` pasa a **28 de 32**, con `post_formato1-4` contados como
  fuera de alcance y **no** como faltantes. ⛔ El ✅ lo pone el usuario, nunca vos.
  ⚠ **Y una nota en la sección de `R-31`:** la inestabilidad por cambio se midió sobre
  `looker/DIGITAL`, **no sobre `reuniones`**. El usuario declaró (25/08) que esta base también se
  mueve — lo que deja a `L-036` **fuera de los controles por igualdad exacta**. Registralo ahí, que
  es donde se organiza qué se puede controlar así.
- **`docs/BITACORA.md`** y **`docs/HANDOFF_CODE.md`** — la vuelta entera.

Commit de documentación separado.
