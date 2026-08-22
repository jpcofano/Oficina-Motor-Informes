# 2026-08-22_25 — El agregado del temario, `R-21` nivel 1, y la regla de no revalidar

> **Estado:** no ejecutado · **subagente:** ninguno
>
> **Supersede la §3 del `Addendum_2026-08-22_Paso-22_R21_no_es_diseno.md`** (la Parte A
> reencuadrada), que no llegó a correr. El resto de ese addendum sigue vigente y **no se edita**.
>
> **Objetivo único:** que el agregado semanal de `ecv_*` tome su universo del **temario** y no de la
> ventana, que es lo que `R-21` nivel 1 y el `Addendum 1` de `R-17` mandan **desde el 09/08/2026**.
>
> ⛔ **Nada de esto es diseño abierto.** La regla está escrita, el caso testigo está medido y los
> números esperados están en el CSV de casos. Si en algún punto este prompt parece pedir una
> decisión de diseño, la instrucción es **citar la regla y parar**, no elegir.

---

## Lo que hay que leer antes de escribir una línea

1. **`R-21` entera**, incluida su sección *"Estado de implementación"*. Fue escrita para este momento
   y dice qué falta y dónde.
2. **`R-17` `Addendum 1`** — *"el agregado `ecv_*` suma los encuentros que `R-21` seleccionó, no los
   que caen en la ventana"*.
3. **`docs/casos_validacion_2026-08-19.csv`**, bloque `agregado_semana_jm`: `V-38`…`V-44` y
   `C-01`/`C-02`.

⭐ **El punto 3 es el que cambia este paso respecto de todo lo que se intentó antes.** Los siete
números esperados **ya están medidos y validados como `exacto`**, con el universo correcto declarado
en la nota de `V-38`: *"universo del TEMARIO (5 encuentros)"*. `V-44` fija `ecv_encuentros = 5`.

Y `C-01`/`C-02` son el par `contradice` que documenta lo que el motor publica **hoy**, con la
ventana: `2307` y `4`.

**Entonces el control de este paso no es medir: es reproducir.** El cambio tiene que mover al motor
de `C-01`/`C-02` hacia `V-38`/`V-44`. Un número nuevo inventado acá **no es evidencia de nada**.

---

## Parte 0 — medir. Sólo lectura. **Reportar y parar.**

> **Modelo: Sonnet · effort alto.** Alto para leer el camino con cuidado, no para decidir.

**0.1 · ¿El control de valores se puede correr sin adjunto?** `V-38`…`V-44` son de la semana
23–31/07. Reportar si `REUNIONES` **todavía** tiene las filas de esos cinco encuentros
—San Cristóbal 23/07, Retiro 24/07, Villa Urquiza 27/07, Belgrano 28/07, Caballito 29/07— con
`mostrar = sí`, y si `rdv` conserva sus filas.

⛔ **Si no están, decirlo y parar acá para esa mitad.** El control de valores pasaría a necesitar el
fixture `Informe 2026-07-31.zip`, que está `[local]` y lo adjunta el usuario. No inventar un
sustituto ni degradar el control a "parecido".

**0.2 · `periodo_id` en `REUNIONES`.** Cuántas filas lo tienen cargado y cuántas vacío, **separando
las de julio de las de agosto**. Es lo que decide si el filtro de la Parte B deja el deck en cero.

⛔ **Si el temario de agosto tiene `periodo_id` vacío, reportar y parar antes de la Parte B.** Un
filtro sobre una columna vacía produce **un deck con cero encuentros sin que nada falle**, que es
exactamente el modo de falla que este repo persigue.

**0.3 · Los 17 marcadores del par, cruzados contra el CSV de casos.** Para cada uno: qué caso lo
cubre, o **ninguno**. Se espera que los cinco `ecv_insc_*_pct` queden cubiertos como cociente de
`V-39`…`V-42` y que los `ecv_barrio1-3` estén diferidos. **Los que queden sin número esperado se
listan y se paran ahí** — qué hacer con ésos lo decide el usuario, no este prompt.

**0.4 · Quién más llama a `leerReuniones_`**, además de `itemsDeSeccion_`.

**0.5 · Confirmar que nadie lee `SECCIONES.itera_sobre` sin chequear antes `modo === 'repetible'`.**
Al 22/08 se espera que `seccionesRepetiblesDe_` corte por `modo` y que el panel exija `repetible`
para agrupar. **Si aparece un lector que no chequea, reportarlo y parar:** declarar `itera_sobre` en
una sección de agregado le cambiaría el comportamiento sin que este paso lo haya medido.

---

## Parte A — el gancho declarativo · **Opus** · effort alto

**No se inventa mecanismo.** `itemsDeSeccion_` ya resuelve `itera_sobre === 'REUNIONES'` →
`anclarEncuentros` → ítems. Lo que falta es que una sección de **agregado** pueda pedirle ese
conjunto sin expandir láminas.

1. **`ecv_alcance_semanal` declara `itera: 'REUNIONES'`**, y **sólo ella**. `ministros` y `m2`
   quedan como están: `R-21` dice expresamente que **no iteran `REUNIONES` y siguen por ventana**, y
   `Union.gs` ya excluye `tipo = 'Agregado'` del anclaje.
2. **Se escribe por el seed, no por la celda** (`docs/ESCRITORES.md`).
3. ⚠ **El comentario que hoy acompaña a esa fila del seed dice lo contrario, con estas palabras:**
   *"Hermana de `encuentro` y en modo `agregado`: que no itere sobre `REUNIONES` es todo el
   punto"*. **Se reescribe en el mismo commit**, distinguiendo las dos cosas que la columna va a
   significar:
   - **universo** — de dónde salen las filas: del temario, sí;
   - **expansión** — cuántas láminas se emiten: una sola, porque `modo = 'agregado'`.

   Sin esa reescritura queda una contradicción documental **sobre la fila que el gancho toca**.
4. **El marcador recibe el conjunto de `fila_rdv` de los ítems.** ⛔ **La rama singular queda
   intacta.** `ecv_barrio`, `ecv_poblacion` y `enc_evento` **también se emiten dentro del bloque de
   encuentro**, donde entran por `fila_rdv` y `dimensiones` no se aplica: el mismo marcador se
   comporta distinto según dónde salga. **Control positivo por los dos caminos.**
5. **`ecv_encuentros` deja de contar sobre `inscriptos`.** Cuenta ítems del temario.

---

## Parte B — el nivel 1 de `R-21`, que es la mitad que muerde un número · **Opus** · effort alto

`leerReuniones_` filtra por `eje` y `mostrar` y **no por `periodo_id`**. `R-21` lo llama *"una
omisión, no un diseño"*, y la rama `CAMPANAS` de `itemsDeSeccion_` sí excluye `periodo_id` vacío
citando `D-19` — cinco líneas más arriba de la rama que no lo hace.

**El filtro va local en `itemsDeSeccion_`**, no en `leerReuniones_`: toca el universo del informe y
deja quieto lo que este paso no midió. Misma forma que el recorte del matcher de `b29674c`, y por
el mismo motivo.

⚠ **El gancho sin el filtro no sirve.** `ecv_encuentros` daría 2 hoy y después la cantidad de filas
con `mostrar = sí` de todo el temario histórico, **sin fallar nada**. Las Partes A y B son un solo
paso, no dos.

**Y sin período no se adivina una semana:** cae a `REVISAR`, mismo criterio que `D-19`.

---

## Parte C — el control, que ya estaba escrito · **Sonnet** · effort alto

**Dos corridas, y las dos hacen falta.**

**C.1 · Valores — semana 23–31/07.** Reproducir los siete casos `exacto`:

| caso | token | esperado |
|---|---|---|
| `V-38` | `ecv_inscriptos` | 2445 |
| `V-39` | `ecv_insc_mail` | 1170 |
| `V-40` | `ecv_insc_digital` | 960 |
| `V-41` | `ecv_insc_cc` | 272 |
| `V-42` | `ecv_insc_ivr` | 43 |
| `V-43` | `ecv_asistentes` | 497 |
| `V-44` | `ecv_encuentros` | **5** |

Y verificar que el motor **deja de publicar** `C-01` (2307) y `C-02` (4).

**C.2 · Mecanismo — `agosto_14_20`.** `ecv_encuentros` = **2** (hoy publica 1) y `ecv_barrios` lista
los dos barrios del temario. Se verifica contra `REUNIONES`, **no contra el deck del equipo**: el
deck del equipo no tiene lámina de agregado semanal, y el `0.3` del `_22` ya lo midió.

⛔ **`agosto_14_20`, no `agosto_14_21`.** Es la ventana del testigo `jm-20260821-234927`, y es lo
único que hace comparable esta corrida con la anterior. La de ocho días es una decisión abierta del
usuario que además contradice el `Addendum 1` de `R-11`: **no entra como control.**

⛔ **No elegir la opción del selector que dice `(por defecto)`.** Es un `periodo_ref` explícito que
ninguna reunión tiene.

**Si un caso no reproduce: reportar el número obtenido, el esperado y el camino, y parar.** No
ajustar el motor hasta que dé, y **no marcar el marcador como dudoso**: un marcador con caso
`exacto` no se publica con desconfianza, se corrige o se frena.

---

## Parte D — `CLAUDE.md`: leer lo validado antes de volver a medirlo · **Sonnet**

**Decisión del usuario, 22/08/2026.** Se escribió un paso entero alrededor de "medir el agregado y
comparar contra un umbral" cuando los siete números **ya estaban validados como `exacto` desde el
09/08**, con el universo correcto declarado en la nota del caso. Es la misma forma del error que
`CLAUDE.md` §7 ya previene para las reglas —*buscar la regla antes de tratar algo como pregunta
abierta*— aplicada a los números.

**Va en `CLAUDE.md` §1, que es donde alguien la lee justo antes de repetir el error**, y no a un
depósito aparte (`CLAUDE.md` §7, fila de convenciones).

Redactar con este contenido, no necesariamente con estas palabras:

> **Antes de medir un número, buscarlo en los casos validados.** `docs/casos_validacion_*.csv` y los
> `docs/VALIDACION_*.md` tienen los números ya medidos, con su universo, su operación y su estado.
> Un caso `exacto` es un **número esperado**: el control es **reproducirlo**, no volver a medirlo y
> compararlo contra sí mismo. Un caso `contradice` dice qué publica el motor hoy y **por qué está
> mal** — es la otra mitad del control.
>
> Volver a medir lo ya validado no es prudencia: **produce un número nuevo sin testigo** y descarta
> el trabajo que le dio universo al viejo. Si el caso existe y el motor no lo reproduce, **el paso
> falló** — no se ajusta el número esperado.
>
> Si al buscar no hay caso, eso se dice; y el número que salga **nace sin validar**, no validado.

**Y agregar el puntero en la fila de §7** que hoy responde *"¿qué número dio una medición y contra
qué se verificó?"*: que además de decir dónde vive, diga que **se consulta antes de medir**. Fila
puntero, no contenido duplicado.

---

## Parte E — lo que queda anotado, no arreglado · **Sonnet**

En `docs/PENDIENTES_consistencia.md`:

1. **`itera_sobre` pasa a tener dos significados** —universo y expansión— por decisión del usuario
   del 22/08 (reutilizar la columna en vez de abrir una nueva). Anotar el costo: el día que una
   sección `agregado` necesite iterar de verdad, o una `repetible` necesite un universo distinto del
   que expande, la columna no alcanza.
2. **`DIMENSIONES_.ambito.gcba` sigue declarando `'rdv|RVD JM-CM - ES': 'figura!=Jorge Macri'`**,
   negando una definición que dejará de existir (`0.2` del `_22`). Hoy no cuesta nada: cero
   marcadores cuelgan de ahí. El día que alguien cablee un `gcba_*`, cuesta un número.
3. **Los marcadores del `0.3` que hayan quedado sin caso de validación**, si los hay.

---

## Orden de sacrificabilidad

`0` → `A`+`B` → `C` son **un solo paso y no se parten**: el gancho sin el filtro publica un número
que crece solo, y sin la Parte C no hay testigo de ninguno de los dos.

`D` y `E` son las únicas sacrificables por tiempo, y si caen se retoman **antes** del paso
siguiente, no después.

## Commits

Uno por parte, para bisectabilidad. La reescritura del comentario del seed va **en el commit de la
Parte A**, no en el de documentación: es la fila que el gancho toca. Sin `Co-Authored-By`.
