# CIERRE POR LÁMINA — `jm`

> **Estado: vivo.** Se edita. Nace el 22/08/2026 con la Parte A del
> `docs/Prompts/2026-08-22_27_cierre_por_lamina_y_call_center.md`.
>
> **Qué pregunta contesta, y es una que no tenía dueño:** *¿qué láminas ya están cerradas, y qué
> le falta a cada una de las que no?* `D-38` dice que la fase `informe semanal` cierra cuando el
> usuario, **mirando un deck completo**, declara que los faltantes que quedan no son relevantes —
> y eso pide poder decir *"esta lámina ya está, aunque le falten cosas"*. Hasta hoy no había dónde.
>
> **Distinto de los dos que ya existen, y por eso no los reemplaza:**
> `VALIDACION_deck_generado_vs_equipo_2026-08-22.md` es **una foto fechada** que no se actualiza y
> está organizada **por bloque**; `PENDIENTES_consistencia.md` está organizado **por hueco**.
> Ninguno de los dos se toca.

---

## Los cuatro estados

| | |
|---|---|
| ✅ | **cerrada** — el usuario la miró y declaró que lo que falta no es relevante |
| 🟡 | **medida y entendida**, falta un paso mecánico ya definido |
| ⛔ | **abierta** — falta cablear, decidir o medir |
| ⏳ | hay un paso corriendo sobre ella |

⛔ **El ✅ lo pone el usuario, nunca Code.** Code puede mover una fila a 🟡 **con evidencia**, y ahí
para. Es la marca de verificación humana de `CLAUDE.md` aplicada acá.

⭐ **Y una lámina puede cerrarse con faltantes.** `D-38` no pide completitud: pide que el usuario
declare que lo que falta no es relevante. **Una fila ✅ con texto en «qué falta» es el caso normal,
no una contradicción.**

⚠ **Lo que no está medido va ⛔ con *«sin medir»*, nunca con una estimación.** Un ⛔ que dice *"sin
medir"* y uno que dice *"falta cablear"* mandan a trabajos distintos, y ésa es la mitad del valor
de esta tabla.

---

## Cómo leer la columna «lámina»

El número es **`LAMINAS.orden_plantilla`**, que es como habla la documentación del proyecto
—*"lámina 2"*, *"la lámina 10 escondida"*—. ⚠ **No es autoritativo** (`CLAUDE.md` §2): la posición
vive en la plantilla y el id en el registro. Y **no coincide con la numeración del deck expandido**,
porque las secciones repetibles duplican sus copias antes de que el deck se numere — por eso el
iceberg es la **6** acá y la **7** en el deck del equipo.

---

## El tablero

| lámina | `lamina_id` | estado | qué falta para el check | último cambio |
|---|---|---|---|---|
| **1** · Portada | `L-030` | ⛔ | **sin medir** — un solo token, `periodo`, y ninguna verificación lo mira | — |
| **2** · Resumen Ejecutivo JM | `L-031` | ⛔ | 21 tokens. **Los cuatro `cc_*`: `MAPEO` escrito, cableado FRENADO por `X-28`** — la columna y la operación están validadas, **qué cuentas entran no** · `contenidos_total` publica `1` → **pregunta al equipo** · `frecuencia` no publica → sin medir · los 8 `imp_*` y los 3 «N envíos» están 🟡, abajo | 22/08 |
| **3** · Resumen Ejecutivo GCBA | `L-032` | ⛔ | 19 tokens, los mismos de la 2 con prefijo `gcba_` **sin medir uno por uno** · `gcba_cc_*` sin cablear (equipo: 8 campañas · 19.788 · 7.308) · `gcba_sms_*` 🟡 | 22/08 |
| **4** · «Encuentros con vecinos» | `L-033` | 🟡 | **Cero tokens y `rol = equipo`: no hay nada que cablear.** Es un separador. Falta sólo que el usuario lo mire | — |
| **5** · ECV: alcance semanal | `L-034` | ⛔ | ⭐ **`ecv_inscriptos` = 2.333 y `ecv_encuentros` = 4 REPRODUCEN** contra `V-71`, con `ecv_barrios` confirmando la identidad de los sumandos. Falta: **`ecv_asistentes` = 485 sin validar** (abajo) · ⚠ **los 3 `cc_*` se van a PINTAR ACÁ SIN CONTROL** (abajo) · `ecv_barrio1-3` nombrados en el seed y **sin fila en `MARCADORES`** | 22/08 |
| **6** · Benchmarks / Iceberg | `L-035` `L-052` | ⛔ | ⭐⭐ **Las seis cifras del alcance cierran AL DÍGITO** —Mail 619, Digital 96, Difusión 10, Call+IVR 101+29=130, Inscriptos 855, Asistentes 186—. **Es la lámina más terminada del deck.** Falta: los **cuatro casilleros de IVR salen `-`** en la corrida con temario correcto y **exactos en la copia equivocada** → falta **medir** cuál de los dos candidatos es (anclaje o ventana de `R-11`) | 22/08 |
| **7** · Campañas · pie | `L-036` | ⛔ | 4 tokens `camp1-4`, tabla 7×8. **Sin medir** | — |
| **8** · «Comunicaciones M2» | `L-037` | 🟡 | Separador, `rol = equipo`, cero tokens. **Nada que cablear** | — |
| **9** · Directa · Status M2 | `L-038` | ⛔ | 8 tokens. ⭐ **El numerador coincide y el denominador no** (−9,6 % en enviados/entregados, con el numerador quieto) → falta **decidir** de qué universo sale el denominador | 22/08 |
| **10** · M2 *(escondida)* | `L-039` | ⛔ | 23 tokens. **Sin medir** — la lámina está `escondida = sí` | — |
| **11** · «Campañas destacadas GCBA» | `L-040` | ⛔ | Separador `rol = equipo`, pero ⛔ **se duplica por ítem de campaña** junto con la lámina de M2 digital | 22/08 |
| **12** · Campaña destacada | `L-041` | ⛔ | ⛔ **La campaña destacada no coincide con la del equipo y en la última corrida sale vacía** | 22/08 |
| **13** · Objetivo y período | `L-042` | ⛔ | Sin cablear — sale prácticamente entera en `/////` | 22/08 |
| **14** · Herramientas y audiencias | `L-043` | ⛔ | Sin cablear — ídem | 22/08 |
| **15** · Formatos digitales | `L-044` | ⛔ | Sin cablear — ídem | 22/08 |
| **16** · Resultados agregados | `L-045` | ⛔ | 11 tokens. Sin cablear | 22/08 |
| **17** · Desagregados · Digital | `L-046` | ⛔ | 9 tokens. Sin cablear | 22/08 |
| **18** · Desagregados · Mail | `L-047` | ⛔ | 14 tokens. Sin cablear. ⚠ Las celdas están **combinadas**, no vacías | 22/08 |
| **19** · Desagregados · Respuestas | `L-048` | ⛔ | 15 tokens. Sin cablear. `escondida = sí` | — |
| **20** · «Análisis y datos» | `L-049` | 🟡 | Separador, `rol = equipo`, cero tokens. **Nada que cablear** | — |
| **21** · Resumen Ejecutivo RRSS | `L-050` | ⛔ | 21 tokens. ⛔⛔ **Publica los datos de la semana pasada y NADA lo dice** — es un número plausible sin marca | 22/08 |
| **22** · MUCHAS GRACIAS | `L-051` | 🟡 | Cierre, `rol = equipo`, cero tokens. **Nada que cablear** | — |
| *(orden 8)* · «1 a 1» | `L-053` | ⛔ | `filtro = tipo=Uno a uno`, 32 tokens `u1_`. Nace con `D-37`. ⭐ **Las impresiones del PRE reproducen exacto** — `V-21` Google **17.401**, `V-23` Meta **25.099**, `V-25` Meta Retiro **18.015**. ⛔ **El único roto es `u1_prog_impresiones`, y es un agujero de FUENTE**: los 94.955 del **POST de San Cristóbal** no están en ninguna celda de los siete libros de los dos fixtures (`X-05`, `C-57`). **Distinto del problema del Resumen** — acá falta el dato, allá sobra universo | 22/08 |

**Conteo: 0 ✅ · 5 🟡 · 18 ⛔ · 0 ⏳**, sobre 23 filas de `LAMINAS` para `jm`.

---

## 🟡 En curso — lo que confirma la **próxima corrida**, no el log

⚠ **Esto no es ✅ y la distinción es el punto.** Los dos botones corrieron hoy y escribieron en
`MARCADORES`; **lo que ninguna escritura prueba es que el deck salga con el número esperado**. Eso
lo dice una corrida de `agosto_14_20` y nada más. Un valor que *debería* salir es una predicción,
no una medición.

### Los tres «N envíos» — `cablearEnviosComoConteo()`, 22/08 15:33

Seis celdas, tres marcadores × dos campos. **`CONTEO`, no `SUMA`**: publicaban **piezas**, no
envíos. Los entregados no se tocaron.

| | esperado | |
|---|---|---|
| Mail JM | **6** | el fixture del 20/08 da 6 · ✅ exacto |
| Mail GCBA | **73** | ⚠ el fixture da **61** — es la base sin terminar de cargar, no un desajuste de definición |
| SMS GCBA | **3** | el fixture da 3 · ✅ exacto |

### Los ocho `imp_*` — `marcarProgrammaticARevisar()`, 22/08 15:41

Las ocho filas ya tenían `formato = miles_revisar`; el lote **no escribió ninguna celda y eso es
correcto** (ver la corrección del veredicto, abajo).

**Esperado: los ocho publican su valor envuelto en guiones**, que es lo que `_revisar` declara —
*"este número no es de confiar"*—. ⛔ **No es un arreglo del número.**

⚠ **Y el marcado es por UNIVERSO, no por plataforma** — por eso son ocho y no dos. `A-06` da
**+15,6 %** en Google y `A-07` **+15,4 %** en Programmatic **sobre un fixture anterior al deck**, y
por `C-25` una métrica acumulativa medida sobre una foto anterior **no puede dar más** que lo
publicado: es universo, no desfasaje. La causa es común a las tres columnas —`2976-MAYPCCVC`,
*Campañas genéricas RDV JM*, `04/06 → 31/12`, **entra por las tres**—. ⛔ **Desmarcar Meta y Google
diría que el Resumen está bien, y no lo está.**

⭐ **Y la decisión que sigue abierta es del usuario, no de Code** — tres salidas, ninguna elegida:
**(a)** cambiar el rótulo a *"acumulado de las campañas de la semana"*, que hace correcto el número
que ya sale, cuesta cero código y no depende de nadie; **(b)** pedirle el dato semanal al equipo;
**(c)** publicar `/////`.

---

## Números que nacen sin validar

⚠ **Un número publicado sin caso no es un número verificado, y conviene que tenga su renglón** —
si no, el ✅ de al lado lo arrastra.

| | | |
|---|---|---|
| `ecv_asistentes` | **485** | **No tiene caso.** `V-43` dice 497, pero mide la **ventana de nueve días** y no el temario: son **dos universos distintos**, y restarlos es la trampa que ya anuló el cruce de `V-38`…`V-44`. Nace sin validar, en una lámina cuyos otros dos números **sí** reproducen |

---

## ⭐ El Call Center: la definición ya está medida, el cableado no

**Medido en la Parte 0 del `_27` (22/08).** Alcanza para escribir las filas; **no se escribieron**,
porque la corrección de premisa de abajo cambió el número esperado y eso lo mira el usuario primero.

**Son cuatro casilleros, no tres**, y el cuarto es el que decide la definición:

| token | en el deck | equipo JM | equipo GCBA |
|---|---|---|---|
| `cc_campanias` | `///// campañas de Call Center` | 3 | 8 |
| `cc_base` | `Base discada: /////` | 6.851 | 19.788 |
| `cc_contactados` | `Contactados: /////` | 1.616 | 7.308 |
| `cc_contact_pct` | `(/////%)` | 24 % | 37 % |

**Lo que la Parte 0 dejó resuelto:**

- ✅ **`looker/CC` tiene `Tipo de llamado`** — el freno del `0.4` no se dispara. Firma verificada:
  `ID Cuentas · Base enviada · Base barrida · Contactados · Efectivos · Tipo de llamado`.
- ✅ **`MAPEO` tiene cero filas para `looker/CC`** — `looker` sólo registra
  `resumen_metricas_dinamico` (27), `DIGITAL` (5) y `Cuentas` (3).
- ✅ **La forma se copia de `looker/DIGITAL`, y el mecanismo es el `_23`:** la solapa **no tiene
  fecha propia** y toma la ventana por **pertenencia**, declarando `clave_ventana` sobre su columna
  de cuenta.
- ⭐ **«Base discada» es `Base barrida`, no `Base enviada`** — `V-64`, `V-66` y `V-92`, sobre la
  única cuenta donde las dos columnas difieren. `V-66` lo decide por el **porcentaje**, que no se
  deriva del otro número publicado.
- ⭐ **El Resumen NO filtra por `Tipo de llamado`** (`V-92`): las «3 campañas» son las **tres**
  filas, `Reconfirmación` incluida. El filtro `Convocatoria + IVR convocatoria` de `V-91`/`S-01` es
  de la **lámina del iceberg**, que es otra.
- ⛔ **`cc_base_total` NO es un token del Resumen**: es un `campo_logico` de `reuniones/Agenda JM`
  que **`enc_base_total` ya lee** desde el `_44`. El control del `_27` lo nombraba por error.
- ⚠ **`cc_base`, `cc_contactados` y `cc_contact_pct` viven en DOS láminas** —la 2 y la 5—, así que
  cablear uno pinta las dos. **Los tres casos validados están etiquetados `resumen_ejecutivo_jm` y
  ninguno mide la lámina 5.** Hay que decidir si son el mismo universo **antes** de escribir la fila.

**Lo que la Parte B escribió, y es la mitad de abajo:** `MAPEO` para `looker/CC` —cuatro filas,
`clave_ventana` y `lcc_id_cuenta` en la col. A, `lcc_base_barrida` en la C, `lcc_contactados` en la
D— más `ventana_ref: 'Cuentas'` en `SOLAPAS`. **`Base enviada` no se mapea, a propósito.** Control:
`tools/probar-mapeo-cc.js`, 24 afirmaciones.

⭐ **Y el control de la definición cerró exacto**, contra el deck del equipo del 31/07 y la
`Base Looker` **del mismo archivo** (`V-105`): «2 campañas · Base discada 6.011 · Contactados 1.878
(31 %)», y `3289-JUNJDGAG` da 2 filas, 6.011, 1.878, 31,2 % → 31. **Cuatro de cuatro.**

### ⛔ Pero el cableado está FRENADO, y el motivo es `X-28`

**Ninguna regla escrita reproduce QUÉ CUENTAS entran.** Medido el 22/08:

| candidato | da | publicado |
|---|---|---|
| pertenencia sola (`ventana_ref` → `Cuentas`) | **18 cuentas · 22 filas · 100.197** | 2 · 6.011 |
| `nombre_campaña CONTIENE JM` — la clave de `V-64` | **2 cuentas · 5 filas · 13.965** | 2 · 6.011 |
| «las cuentas que el temario nombra» | ídem: julio nombra `3289` **y** `3387` | 2 · 6.011 |

⛔ **Y el filtro por nombre está mal por los dos lados a la vez:** deja entrar `3387-JULJDGGC`, que
también dice «JM», **y deja afuera la cuenta correcta de agosto** — `3488-AGOJDGAG` se llama
*"TE CUENTO | SALUD Eje Sur Viernes 14/8"* y **no dice «JM» en ninguna parte**.

⭐ **Lo que sí se observa en los dos decks: el bloque publica UNA SOLA CUENTA**, no un agregado de
la semana — julio `3289` (2 filas), agosto `3488` (3 filas). **En julio el temario tenía dos cuentas
con filas en `CC` y el deck usó una.** No hay regla que diga cuál, y **eso no se inventa**
(`CLAUDE.md` §4). Es pregunta al equipo.

⛔⛔ **Barrido a ciegas contra los dos períodos (22/08, tarde): 0 de 13 propiedades simples aciertan
en los dos.** Sobreviven 3 de 78 pares y 18 de 286 ternas, y **`JDGAG` está en las 21** — es el
candidato fuerte. Le falta sólo excluir a `3289` en agosto, **y `3289` está ahí por la deriva de
`fecha_fin`**. Los tres desempates que cierran —`Finalizada`, `duración ≤ 30 d`, `≤ 14 d`— aciertan
**por igual**, y dos períodos no los separan: **por eso no se escribió ninguna regla.**

⛔ **El tercer fixture no existe.** `Seguimiento Digital2026-08-06.zip` no trae `Base Looker` ni deck
de `jm`. **Lo que destraba `X-28` es un tercer `.zip` del equipo**, deck + `Base Looker` del mismo
día.

⚠⚠ **La trampa material, medida al paso, y explica el error del 22/08 mejor que el descuido:**
`3289-JUNJDGAG` tiene `fecha_fin` = **30/07** en el export del 31/07 y **20/08** en el del 20/08.
**La ventana de una cuenta se extiende**, así que en agosto una cuenta de **junio** cae dentro de la
ventana por pertenencia — y un filtro por nombre la elige antes que a la de agosto.

### ⚠ Y la lámina 5 queda pintada sin control

`cc_base`, `cc_contactados` y `cc_contact_pct` **viven también en la lámina 5**, así que el día que
se cableen **la 5 se pinta con ellos**. ⛔ **Los tres casos —`V-64`, `V-66`, `V-92`, y el `V-105` que
sale de ellos— están etiquetados `resumen_ejecutivo_jm` y NINGUNO mide la lámina 5.**

**Eso no la cierra de arrastre.** Un token verificado en una lámina no está verificado en la otra:
puede ser el mismo número por diseño o puede ser que la 5 quiera otro universo, y **hoy nadie lo
midió**. Cuando se cablee, la 5 sigue ⛔ con *"pintada sin control"* hasta que exista un caso que la
mida — es la forma de `CLAUDE.md` §4 —*un número correcto puede salir de las filas equivocadas*—
aplicada antes de que el número salga.

---

## Lo que este tablero NO contesta

- **Si el deck completo sale.** Lo medido es que el agregado por temario cuesta **35 s**; que una
  corrida real con seis encuentros entre en el techo de Apps Script **sigue sin medirse**. El
  testigo con dos encuentros tardó 192 s.
- **Si una lámina 🟡 se ve bien.** 🟡 dice que el número está entendido, no que la caja lo muestre
  como corresponde.
- **Nada sobre `secco`.** Este tablero es de `jm`. `secco` tiene 29 láminas y ninguna fila acá.
- ⛔⛔ **Y una advertencia que cruza el tablero entero, `X-29`: la `fecha_fin` de una cuenta se
  extiende sola.** Medido entre los dos fixtures: **27 de 959 cuentas se extendieron**, mediana 21
  días, máximo **157**. La ventana **14–20/08** pasa de **14 a 32 cuentas**, y **18 entran sólo por
  la deriva**. Afecta a **todo lo que use `ventana_ref: 'Cuentas'`** — hoy `looker/DIGITAL` y
  `looker/CC`, o sea los ocho `imp_*`, los cuatro `cc_*` y sus `gcba_*`. **No rompe: agranda**, y
  ninguna verificación del motor lo puede ver porque el motor hace lo que se le pidió.

---

## Historial de cambios

| fecha | qué |
|---|---|
| 22/08/2026 | Nace con la Parte A del `_27`. Estado inicial: 0 ✅ · 5 🟡 · 18 ⛔ |
| 22/08/2026 | Parte C del `_27`. **Ninguna fila se movió de estado, y eso es el resultado**: la 2 y la 5 siguen ⛔. Lo que cambió es el *«qué falta»* — el Call Center pasó de *"sin cablear"* a **`MAPEO` escrito y cableado frenado por `X-28`**, que es un bloqueo con nombre en vez de un hueco. Y la 5 queda anotada como **pintada sin control**, para que no se cierre de arrastre el día que se cablee la 2 |
