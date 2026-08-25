# `L-036` — el `Período` sale del desglose: las dos piezas de motor y los cuatro `post_periodo*`

**Decisión del usuario, 25/08.** La columna `Período` se cablea contra
`digital/CAMPAÑAS_DESGLOCE_DIGITAL`, filtrado por POST, con **una fila por plataforma que se
agrega**. Es la salida que paga los dos bloqueos; las otras dos —publicar la fecha del encuentro, o
declararlo fuera de alcance— quedan descartadas.

**Estado de la lámina:** 24 de 32 tokens cableados. `post_formato1-4` está **fuera de alcance**
(`CONFIG_INFORMES` §2.3 bis). **Estos cuatro son los últimos.**

⛔⛔ **El riesgo central de este trabajo, y todo lo de abajo está ordenado alrededor de él.** La
lámina va a indexar **dos listas de filas construidas por separado** con el mismo `valor_fijo: n`:
una de `reuniones/Agenda JM | Post` y otra del desglose. **Si las dos listas no tienen los mismos
elementos en el mismo orden, la ranura 2 muestra el período de un encuentro y los números de otro —
y nada falla.**

Y ya se sabe que **pueden** diferir: San Cristóbal tiene **0 filas POST en el desglose** y en
`Agenda JM | Post` cae por `campos_metrica_post` (`alc_real` e `imp_totales` en 0). **Hoy coinciden
por dos caminos distintos que nadie coordinó.** Coincidir por casualidad no es un contrato.

---

## Parte 0 — leer el motor, reportar y parar

**Modelo: Sonnet. Effort alto** —es lectura de código con cuidado, no decisión—. **No escribe nada.**

Actualizá el clon. Leé `CLAUDE.md` —el árbol, el ruteo y §4—, `docs/PLAN.md`,
`docs/CONFIG_INFORMES.md` y `docs/PENDIENTES_consistencia.md` (en particular el bloque *SE CAE* del
25/08, cuyo análisis conservado es la base de las Partes 1 y 2).

Contestá estas seis, cada una citando el código que la sostiene:

1. **Cómo se compacta hoy la lista.** `filasDeSolapaDelTemario_` recorre los ítems y hace `return`
   —saltea— en `sin_cuenta`, `sin_fila` y `sin_metrica`, y sólo entonces `filas.push(suyas[0])`.
   ⛔ **La posición en `filas` no es la posición del ítem.** Confirmalo o desmentilo, y decí contra
   qué largo resuelve `opFILA` su índice `n`.
2. **Qué dispara la guarda por marcador.** La rama compara `opciones.base_temario === fila.base_id`
   y `opciones.hoja_temario === solapa`. ⚠ **Si esa comparación no da, el marcador cae a la cadena
   general y lee la solapa entera** — que es lo que publicó el Recap de CABA con 2.463.980
   habitantes. Decí exactamente qué pasaría hoy con un marcador que apunte a una **segunda** solapa
   no declarada en `CONFIG`.
3. **Si el criterio de POST ya existe como dimensión.** `DIMENSIONES_.etapa` filtra por `~=Post` y se
   corrigió el 25/08 —partición verificada 4.843 + 318 = 5.161—. ⭐ **No inventes un `filtro` nuevo
   si la dimensión ya expresa esto**: el corte dimensional vive en `dimensiones`, y `filtro` está
   reservado para guardas técnicas. Decí cuál corresponde acá y por qué.
4. **Qué campos del desglose están mapeados y con qué tipo:** `des_id_cuenta`, `des_campana`,
   `des_fecha_inicio`, `des_fecha_fin`, `des_impresiones`, `des_visualizaciones`. ⚠ **Y si las dos
   fechas llegan como `Date` o como texto.** Es la trampa que ya mordió en `2026-08-25_1`: el serial
   del `.xlsx` no es lo que Apps Script entrega.
5. **Si el desglose declara `campo_id_cuenta` en `SOLAPAS`.** Sin eso, `filasDeSolapaDelTemario_`
   devuelve `vacio` con motivo y **no hay recorte por temario posible** (`D-30`).
6. **Cuántas filas POST tiene cada encuentro del temario de `julio_24_30`** — medido contra el
   fixture del 20/08, con el sha verificado antes de citar. Lo publicado hasta hoy dice Retiro **5**,
   Orden Público **3**, San Cristóbal **0**; confirmalo o corregilo.

⭐ **Control positivo, y frená si no da:** una lámina que hoy publica bien por la rama del temario,
leída por el mismo camino. Si esa tampoco resuelve, el instrumento está roto y **no hay hallazgo**.

**Reportá y pará.**

---

## Parte 1 — la pieza B: el temario declara VARIAS solapas

**Modelo: Opus. Effort alto.** Mueve el riesgo del universo ancho.

`CONFIG` tiene `base_agregado_post` y `solapa_agregado_post` **en singular**, y
`opciones.filas_temario` es **un solo objeto**. Con dos fuentes eso no alcanza.

**Qué hacer:**

- `CONFIG` pasa a admitir **una lista** de pares `base|solapa` para el agregado post. Sembrado con
  seed, con la regla de siempre: **la hoja gana, el seed sólo siembra lo ausente**.
- `opciones.filas_temario` pasa a ser un **mapa por `base|solapa`**, y la rama por marcador busca su
  entrada por esa clave.

⛔⛔ **Y acá está la parte que hay que hacer bien, porque es la que puede publicar un universo
ancho.** Hoy, si la comparación de la guarda no da, el marcador **no entra a la rama** y cae a leer
la solapa entera. Con dos solapas declaradas ese modo de falla se multiplica.

> **Lo que dispara la guarda tiene que ser que la solapa esté DECLARADA en la lista, no que tenga
> filas.** Declarada y sin filas → `«FALTA:…@post_sin_temario»` con su diagnóstico, que es lo que
> ya hace hoy. **Nunca** caída a la cadena general.

**El banco de esta parte tiene que ejercitar el caso negativo**: una solapa declarada que devuelve
cero filas **no** publica un número. Un banco que sólo prueba el camino feliz no prueba esta pieza.

Un commit.

---

## Parte 2 — la pieza A: agregar las filas, y no perder la posición del ítem

**Modelo: Opus. Effort alto.** Es donde vive el riesgo de desalineación.

### 2.1 · La agregación

`filasDeSolapaDelTemario_` hace `suyas[0]`. Sobre `Agenda JM | Post` está bien —una fila por
encuentro—; sobre el desglose **varias por encuentro es lo normal**.

Cuando la solapa lo pide, la función devuelve **una fila sintética** por encuentro:

- **suma** para los campos de `CONFIG.campos_agregar_post`;
- **`min` / `max`** para el par de fechas, que **no se suman**. ⚠ El período **cruza meses**: las dos
  filas de Google ads de Retiro son `mes = JULIO` y `mes = AGOSTO` con el mismo `Fecha inicio`, así
  que un recorte por `Mes` partiría el encuentro.

⭐ **Va por `CONFIG`, no hardcodeado**, porque cuáles se agregan y cómo es un parámetro de negocio.

⚠ **La tensión se declara, no se esquiva:** agregar es aritmética, y *toda la aritmética vive en
`Marcadores.gs`*. El argumento para que viva acá es que **no es el cálculo del marcador sino la
preparación de su fila** —el mismo rol que `unirDigitalPorCuenta`—, y el marcador sigue haciendo su
`FILA` sobre el resultado. **Escribilo en el código como comentario y en `PLAN.md` como decisión: es
una excepción a una regla, y una excepción sin motivo escrito es una trampa con fecha.**

### 2.2 · ⛔⛔ La alineación, que es el punto entero

**Las dos listas se indexan con el mismo `n`.** Hoy la lista se **compacta**: cada `sin_cuenta`,
`sin_fila` o `sin_metrica` saltea el ítem y acorta la lista. Dos solapas que descartan encuentros
distintos producen dos listas de largo distinto **y la ranura `n` deja de ser el mismo encuentro**.

> **La lista de encuentros es UNA —la del temario— y las dos solapas se consultan por `id_cuenta`,
> nunca por posición.** Una solapa sin fila para ese id da `sin_datos` **en su columna**, y no
> corre las demás.

Elegí la implementación —conservar el hueco en `filas`, o resolver el índice contra los ítems y no
contra el largo de `filas`— y **decí cuál elegiste y por qué**.

⭐ **Y el banco que fija esto es el que importa más que los otros:** un encuentro presente en una
solapa y ausente en la otra **no puede** correr las ranuras. San Cristóbal es el caso real y está
medido: 0 filas en el desglose, descartado por métrica en `Agenda JM | Post`. **Construí también el
caso donde sólo una lo descarta** —que hoy no pasa y mañana sí—, porque ése es el que rompe.

Un commit.

---

## Parte 3 — `MAPEO` y los cuatro `post_periodo*`

**Modelo: Opus. Effort alto.** Mueve una celda publicable.

- Las filas de `MAPEO` que falten, cada una con su `encabezado` como testigo de integridad (`D-31`).
- El corte de POST **por donde la Parte 0 haya dicho** —`dimensiones` si la dimensión `etapa` ya lo
  expresa, y no un `filtro` nuevo—.
- ⭐ **El período es texto compuesto, así que va con `FILA_TEXTO`**, la operación que nació en
  `2026-08-25_1`: la plantilla vive en `campo_logico`, que es configuración, y cambiar la forma del
  rango no exige `clasp push`. **Elegí la fila con el mismo `opFILA` que las otras seis columnas** —
  ése es el requisito, no la comodidad.
- `valor_fijo: n` **entero pelado** (`C-83`).
- ⛔ **Los cuatro van a `MARCADORES_POST_L036_TODOS_`.** Esa lista **crece y no se poda**.
- **`COLUMNAS_POST_L036_` declara su alcance**: siete columnas cableadas de una tabla de ocho, con
  `Formato` fuera de alcance nombrado ahí mismo. Es el hueco de método de la vuelta anterior y no
  se repite.

### El control, que ya existe y no depende del equipo

⭐⭐ `Agenda JM | Post` **es un agregado derivado del desglose y cierra al dígito** (`ADDENDUM 2`):
`col17` Meta, `col22` Google, `col27` Programmatic, `col12` el total. Entonces:

> **La suma de las filas POST del desglose para un encuentro tiene que dar `Agenda JM | Post` col J
> (impresiones) y col M (visualizaciones) para ese mismo encuentro.**

**Ése es el control de que las dos fuentes están alineadas fila por fila**, y no depende del deck del
equipo ni de una foto de la base. Dejalo como afirmación de banco, no como una medición de una vez.

Corré `node tools/suites.js` y reportá el veredicto **por exit code**.

Un commit.

---

## Parte 4 — documentación

**Modelo: Sonnet.** Rutear por `CLAUDE.md` §7.

- **`docs/PENDIENTES_consistencia.md`** — el bloque *SE CAE* del 25/08 se anota **reabierto y
  resuelto**, con fecha: los bloqueos A y B volvieron al declarar dos fuentes, y este prompt los
  cerró. No editar el texto viejo.
- **`docs/PLAN.md`** — la decisión de arquitectura de 2.1 (aritmética de preparación fuera de
  `Marcadores.gs`) como `D-NN` nueva, con su motivo.
- **`docs/FUENTE_post_reuniones_2026-08-25.md`** — ADDENDUM: el `Período` sale del desglose agregado,
  y por qué no podía salir de `Agenda JM | Post` (ninguna de las 29 columnas trae fecha de inicio ni
  de fin; sólo `Fecha`, la del encuentro).
- **`docs/CIERRE_POR_LAMINA.md`** — `L-036` pasa a **28 de 32**, con `post_formato1-4` contados como
  fuera de alcance y **no** como faltantes. ⛔ El ✅ lo pone el usuario.
- **`docs/BITACORA.md`** y **`docs/HANDOFF_CODE.md`** — la vuelta entera.

Commit de documentación separado.
