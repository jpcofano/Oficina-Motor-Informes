# 2026-08-21_4 — `LAMINAS.seccion_id`: la lámina declara su sección, el generador deja de inferir

> **Estado:** no ejecutado · **subagente:** ninguno
> **Reemplaza** a un borrador anterior del mismo número que partía de una premisa falsa —que
> `LAMINAS` no existía—. **Existe, está poblada y el sellado ya ocurrió.**
>
> **Objetivo único:** que la pertenencia de una lámina a una sección sea **declarada** y no
> inferida de los tokens que lleva.

---

## El estado real, medido — snapshot del 20/08

```
LAMINAS          51 filas · las 51 selladas
seccion_id       vacío en las 51
rol, cobertura   vacíos
secco            L-001 … L-029
jm               L-030 … L-052      ⭐ la lámina 8 de jm es L-037
```

**El ancla está ejercida y verificada:** `#lamina: L-031` aparece en las notas de la lámina 2 de
`jm`, y `L-031` es exactamente `jm · orden 2`. **No falta el sellador ni la hoja: falta lo que va
adentro.**

## Por qué importa, y el caso que lo fuerza

**El 1 a 1 usa `L-037` y esa lámina nunca se resuelve.** Sus 36 tokens son familia `u1_`, y
**ninguna fila de `SECCIONES` declara esa familia**. Como el generador decide la pertenencia por
familia de tokens, la lámina queda sin sección: no se expande, no se resuelve, sale entera en
hueco. ⭐ **No es una regresión — nunca funcionó.**

⭐ **Y la misma inferencia produce el otro bug conocido:** `slidesModeloDe_` identifica una lámina
modelo **porque lleva tokens crudos**, y por eso una copia sin pintar es indistinguible de un
modelo — la N² del `2026-08-20_13`. **Con `lamina_id` eso muere de raíz.** Dos bugs, una causa.

### ⭐ El `lamina_id` existe para que el orden NO importe — decisión del usuario, 21/08/2026

**El id está justamente para poder agregar láminas y sellarlas sin que el orden mande.** Por eso
`L-052` con `orden_plantilla = 6`, igual que `L-035`, **no es una anomalía**: es una lámina
agregada después, que es exactamente el caso para el que el id existe.

⚠ **Lo que sí hay que verificar es lo contrario: que nada del motor resuelva por orden.** Un solo
sitio que use `orden_plantilla` como clave rompe el diseño en cuanto haya dos láminas con el mismo
número, y lo hace en silencio — devolviendo una de las dos.

⭐ **Y la pregunta que abre, que la Parte 0 tiene que contestar antes de la Parte A:** si el orden
de la plantilla deja de ser autoridad, **¿quién decide el orden del deck de salida?** Hoy sale en
el orden en que las láminas están en la plantilla. Una lámina nueva sellada queda donde la pusieron,
y `SECCIONES.orden` ordena **secciones**, no láminas dentro de una sección. **Medir qué gobierna hoy
ese orden y decirlo** — no decidirlo acá.

---

## Parte 0 — medir. Sólo lectura. **Reportar y seguir.**

> **Modelo: Sonnet · effort alto.**

1. **`LAMINAS` en la hoja viva**: cuántas filas, cuántas con `seccion_id`, y si cambió desde el
   snapshot del 20/08.
2. ⭐ **Que el ancla del deck coincida con la fila.** Recorrer las dos plantillas leyendo
   `anclaDeLamina_` y **cruzar contra `LAMINAS`**. Reportar: sin ancla · con ancla y sin fila ·
   con fila y sin ancla · **id que no corresponde al orden**. **Si el ancla y la hoja discrepan,
   todo lo demás se apoya en arena.**
3. ⭐ **Todos los sitios donde el motor usa `orden_plantilla` o la posición en la plantilla**, no
   sólo el caso de `L-035`/`L-052`. **Por decisión del usuario el orden no es autoridad: el id lo
   es.** Cualquier sitio que resuelva por orden es un bug latente que se dispara con la segunda
   lámina agregada. Reportar la lista completa aunque esté vacía.
   **Y por separado: qué gobierna hoy el orden de las láminas en el deck de salida.**
4. **Cómo decide hoy el generador** la pertenencia: `slidesModeloDe_`, `familia_tokens`, y qué
   pasa con una lámina cuya familia no declara ninguna sección. **Confirmar el caso de `L-037`.**
5. ⭐ **La propuesta de `seccion_id` para las 51**, según las familias de tokens que cada lámina
   lleva y las secciones que existen. **Reportarla como propuesta, en el reporte, sin escribir una
   sola celda.** Marcar aparte: las que no tienen sección candidata —`L-037` entre ellas— y las
   que tienen más de una.
6. **Qué significan `rol` y `cobertura`** según el seed. Están vacías y hay que saber si son parte
   de esto o de otra fase antes de tocarlas.

---

## Parte A — el generador usa `LAMINAS`

> **Modelo: Opus · effort alto.** ⚠ Cambia cómo se arma el deck entero.

1. ⭐ **La pertenencia sale de `LAMINAS.seccion_id`.** Una lámina sin fila o sin `seccion_id`
   **no se expande ni se resuelve**, y **se reporta con su `lamina_id`** — que es exactamente lo
   que hoy le pasa a `L-037` en silencio.
2. ⭐ **`slidesModeloDe_` deja de identificar un modelo por «lleva tokens crudos» y pasa a usar el
   `lamina_id`.** Es lo que mata la N² de raíz. **La fase atómica del `2026-08-20_10` se conserva
   igual: dos defensas, no una.**
3. **Camino de compatibilidad, declarado:** con `seccion_id` vacío en todas, el generador **avisa
   y usa la inferencia de hoy**. ⚠ **Y lo dice en el reporte**, para que nadie confunda *"no
   configuré `LAMINAS`"* con *"anda el mecanismo nuevo"*.
4. ⛔ **La asignación de `seccion_id` la hace una persona.** El motor **propone** —Parte 0 punto
   5— y la propuesta va al reporte o a `notas`, **nunca escrita como decisión**. Misma regla que el
   temario: proponer no es cargar.

**El control, y el primero solo no alcanza:**

| # | control | qué prueba |
|---|---|---|
| 1 | valores del deck **idénticos** a la corrida `171421` | que no se rompió nada |
| 2 ⭐ | **`L-037` aparece en el reporte como lámina sin sección**, con su id | que el mecanismo se aplicó |
| 3 ⭐ | **una copia sin pintar NO se detecta como modelo** | que la N² murió de raíz |

⚠ El control 1 daría verde aunque nada de esto se hubiera aplicado. **El 2 es el que distingue.**

---

## Parte B — la documentación

> **Modelo: Sonnet · effort medio.**

1. **`docs/PLAN.md`** — `D-23` Fase 2 cerrada del lado del consumo: el sello ya existía, lo que
   faltaba era usarlo.
2. **`CLAUDE.md` §4** — la regla: *inferir la identidad de algo por su contenido funciona hasta que
   el contenido cambia; `L-037` sin resolver y la N² son el mismo error con dos caras*.
3. **`docs/PENDIENTES_consistencia.md`** — las láminas sin sección candidata, que son el trabajo
   que queda, y el empate de orden entre `L-035` y `L-052`.
4. `docs/BITACORA.md` · `docs/HANDOFF_CODE.md`.

## Lo que este prompt **no** hace

- ⛔ No sella nada: ya está sellado.
- ⛔ No escribe `seccion_id`: propone, y decide una persona.
- ⛔ No escribe `#seccion:` en ninguna nota — `C-01` addendum 2 lo prohíbe.
- ⛔ No crea la sección del 1 a 1 ni cablea los `u1_`. Viene después.
- ⛔ No toca plantillas.
