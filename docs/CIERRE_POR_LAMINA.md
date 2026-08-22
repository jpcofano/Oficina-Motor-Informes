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
| **2** · Resumen Ejecutivo JM | `L-031` | ⛔ | 21 tokens. **Cablear los cuatro `cc_*`** (definición ya medida, abajo) · `contenidos_total` publica `1` → **pregunta al equipo** · `frecuencia` no publica → sin medir · los 8 `imp_*` y los 3 «N envíos» están 🟡, abajo | 22/08 |
| **3** · Resumen Ejecutivo GCBA | `L-032` | ⛔ | 19 tokens, los mismos de la 2 con prefijo `gcba_` **sin medir uno por uno** · `gcba_cc_*` sin cablear (equipo: 8 campañas · 19.788 · 7.308) · `gcba_sms_*` 🟡 | 22/08 |
| **4** · «Encuentros con vecinos» | `L-033` | 🟡 | **Cero tokens y `rol = equipo`: no hay nada que cablear.** Es un separador. Falta sólo que el usuario lo mire | — |
| **5** · ECV: alcance semanal | `L-034` | ⛔ | ⭐ **`ecv_inscriptos` = 2.333 y `ecv_encuentros` = 4 REPRODUCEN** contra `V-71`, con `ecv_barrios` confirmando la identidad de los sumandos. Falta: **`ecv_asistentes` = 485 sin validar** (abajo) · los 3 `cc_*` sin cablear · `ecv_barrio1-3` nombrados en el seed y **sin fila en `MARCADORES`** | 22/08 |
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
| *(orden 8)* · «1 a 1» | `L-053` | ⛔ | `filtro = tipo=Uno a uno`. Nace con `D-37`; **sin medir** — es la lámina de 32 tokens `u1_` que **ninguna sección declaraba** | 21/08 |

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
*"este número no es de confiar"*—. ⛔ **No es un arreglo del número**: Programmatic sigue **3,6 a
7,2×** por encima de lo que publica el equipo, porque `looker/DIGITAL` trae **estado acumulado** y
el rótulo del deck promete la semana.

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

**El control de cableado, que es contra el deck del 31/07 y no contra el de agosto:** `V-64` y
`V-92` dan `cc_base` = **6.011** y `cc_contactados` = **1.878**, `exacto` contra lo publicado. El
fixture de agosto da 7.096 / 1.710 contra 6.851 / 1.616 —**+3,6 % y +5,8 %**, la solapa de estado
acumulando entre el armado del deck y el export— y **un ±% no sirve de control**.

---

## Lo que este tablero NO contesta

- **Si el deck completo sale.** Lo medido es que el agregado por temario cuesta **35 s**; que una
  corrida real con seis encuentros entre en el techo de Apps Script **sigue sin medirse**. El
  testigo con dos encuentros tardó 192 s.
- **Si una lámina 🟡 se ve bien.** 🟡 dice que el número está entendido, no que la caja lo muestre
  como corresponde.
- **Nada sobre `secco`.** Este tablero es de `jm`. `secco` tiene 29 láminas y ninguna fila acá.

---

## Historial de cambios

| fecha | qué |
|---|---|
| 22/08/2026 | Nace con la Parte A del `_27`. Estado inicial: 0 ✅ · 5 🟡 · 18 ⛔ |
