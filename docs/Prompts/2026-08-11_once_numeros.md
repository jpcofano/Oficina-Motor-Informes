# Los once números de Orden Público. Un solo objetivo.

**Estado:** vivo · **Fecha:** 2026-08-11 · **Ubicación:** `docs/Prompts/2026-08-11_once_numeros.md`

> **Cuarto prompt del formato nuevo: un objetivo, nada más.**
>
> **Documentación mínima mientras se trabaja:** una línea de bitácora por commit. **La documentación
> completa al final.**

---

## Antes de empezar — dejar anotado el objetivo B

Decisión del usuario del 11/08: **primero esto, después el circuito de confianza.** Para que B no se
pierda, anotarlo **antes** de arrancar, con su contexto, en `PENDIENTES_consistencia.md`. Es corto y
es lo único que se documenta antes del objetivo.

**Entrada, `P1`:** *el score de anclaje saturó y el circuito de confianza nunca se probó.*

- **Los cinco anclajes dan `1,00` exacto** tras el cambio del 10/08. **Un score saturado no ordena**:
  si dos candidatos tienen barrio y fecha correctos, empatan en el techo.
- **En ese empate actúa el desempate temporal del 09/08 y el motor elige solo.** Eso **contradice la
  regla del usuario** —*cuando la confianza no alcanza se pregunta y el usuario elige*— y es el mismo
  modo de falla que `3347`, que sobrevivió tres semanas porque el número parecía razonable.
- **El circuito de pregunta está entero y nunca corrió.** `ANCLAJE_PENDIENTE` registra el top‑3, el
  motor **lee** la columna `elegido` en la corrida siguiente y no pisa la decisión humana; el umbral
  sale de `CONFIG` (`umbral_anclaje_reunion`). Nada de eso se ejecutó ni una vez de punta a punta,
  porque ningún caso cayó bajo umbral.
- **Qué haría falta:** que el score ordene en vez de saturar, que un empate real vaya a
  `ANCLAJE_PENDIENTE` en vez de resolverse por proximidad, y probar el circuito completo con un caso
  forzado.

**No implementar nada de esto ahora.** Sólo que quede escrito con el contexto suficiente para
retomarlo.

---

## El objetivo

**Que los once números de Orden Público cierren contra el informe publicado.**

La cuenta ya está bien: desde el 10/08 el motor lee `3387` y no `3347`. Los once fallan **sólo por la
operación**, que es lo que el usuario quiso medir aislado desde el 04/08.

---

## ⚠ El plan no es "`ULTIMO` → `SUMA`", y esto cambia el prompt

La corrección venía anunciada como un cambio único de operación. **`VALIDACION_2026-07-31.md`
§3.2 y §3.3 dicen que son dos casos distintos y opuestos**, y aplicar `SUMA` a los dos rompe mail:

**IVR — sí es `SUMA`, y está verificado dígito a dígito.** §3.2: la cuenta `3387` tiene dos filas en
`Directa IVR` (22/07 y 23/07) y el deck publicado es la suma exacta.

| | 22/07 | 23/07 | suma | deck |
|---|---|---|---|---|
| llamados | 40.874 | 37.763 | **78.637** | 78.637 |
| atendidos | 37.055 | 34.179 | **71.234** | 71.234 |
| escucha +75% | 13.766 | 13.833 | **27.599** | 27.599 |
| marque 1 | 82 | 174 | **256** | 256 |

**Mail — NO es `SUMA`, y tampoco es `ULTIMO`.** §3.3 es explícito: la lámina toma **el envío de
convocatoria**, no el total de la cuenta. La cuenta `3387` acumula **271.701 enviados en 5 envíos**;
la lámina publicada muestra **44.043**, que es la fila del **25/07**. Los otros cuatro envíos son "Te
Cuento" de otros ejes y el post. §3.3 lo dice con todas las letras: **`SUMA por id_cuenta` da el
número equivocado para el iceberg.**

Hoy `ULTIMO` toma la fila del **03/08 — fuera de la ventana** — y por eso `enc_mails_enviados` da
582. Ni sumar ni tomar la última: **hay que seleccionar la fila correcta**, y cuál es "la correcta"
no está definido en ninguna decisión. Eso lo mide la Parte 0.

---

## Parte 0 — Qué distingue al envío de convocatoria. Sólo lectura. Reportar y seguir.

- **0.1 · Las cinco filas de mail de `3387`, enteras.** Fecha, nombre de campaña del envío,
  enviados, entregados, aperturas, clics. Las cinco, sin interpretar. **La fila del 25/07 tiene que
  dar 44.043 / 43.439 / 4.652 / 145**; si no da, la premisa se cayó y hay que decirlo.
- **0.2 · ¿Qué campo distingue la convocatoria de los otros cuatro?** Candidatos a mirar: el nombre
  del envío —§3.3 dice que los otros son "Te Cuento" de otros ejes y el post—, la fecha respecto del
  encuentro, algún campo de tipo o etapa. **Reportar qué hay disponible, no elegir todavía.**
- **0.3 · ¿La ventana sola alcanza?** Si de las cinco filas sólo una cae en la ventana del informe,
  entonces filtrar por ventana resuelve el caso sin ninguna regla nueva. **Medirlo**: cuántas de las
  cinco caen dentro de 24–30/07.
- **0.4 · ¿El caso se generaliza?** Para los otros encuentros anclados —San Cristóbal `3354`, Retiro
  `3346`—: cuántas filas de mail tiene cada uno y cuántas caen en ventana. Una regla que sirve para
  `3387` y falla para los otros dos no sirve.
- **0.5 · Los once marcadores hoy.** Cuáles existen en `MARCADORES`, con qué `operacion` y qué
  `periodo_ref`. Es la foto previa: sin ella no se sabe qué cambió.

Reportar los cinco y **seguir**. Si `0.3` muestra que la ventana alcanza, **ésa es la solución y no
hace falta inventar nada** — decirlo y seguir por ahí.

---

## Parte A — IVR pasa a `SUMA`

Los cuatro marcadores de IVR —`enc_atendidos`, `enc_e75`, `enc_marque1`, `enc_audiencia`, más los
derivados de porcentaje— pasan de `ULTIMO` a `SUMA` sobre `id_cuenta`.

Es configuración: filas de `MARCADORES`, no código. **Diff antes y después**, con
`protegidas (con diferencia): 0` como referencia.

---

## Parte B — Mail selecciona la fila, no la agrega

Con lo que salga de `0.2` y `0.3`, hacer que los marcadores de mail lean **el envío de
convocatoria** y no el total ni el último.

- **Preferir la solución más simple que funcione.** Si filtrar por ventana alcanza (`0.3`), se usa
  eso: no se escribe una regla nueva.
- **Si hace falta una regla, que sea declarativa** —una fila de configuración, no una condición
  cableada al caso de Orden Público—. Ya existe `MARCADORES.filtro` desde el 08/08 y puede ser el
  lugar.
- **Si dos filas quedan igual de elegibles, el marcador falla con motivo propio** y no elige. Misma
  razón de siempre: un número plausible de la fila equivocada es peor que un hueco.

---

## Parte C — Medir los once, uno por uno

Generar el informe y comparar contra `VALIDACION_2026-07-31.md` §3.2 y §3.3.

**Los cuatro de IVR son el control duro: 78.637 · 71.234 · 27.599 · 256, dígito a dígito.** Los de
mail contra la fila del 25/07: **44.043 / 43.439 / 4.652 (10,7%) / 145 (3,1%)**.

**Reportar los once uno por uno**, y para cada uno que no cierre, si falla por IVR, por mail, o por
otra cosa. **No ajustar ningún número para que cierre.**

---

## Los límites

1. **No se edita ninguna celda de las cuatro bases.** `ANCLAJE_PENDIENTE` sí es escribible: es hoja
   del motor.
2. **No se edita ninguna plantilla `.pptx`.**
3. **No se toca el score de anclaje ni el desempate temporal.** Es el objetivo B, ya anotado, y
   mezclarlo acá impide medir este cambio aislado — que es todo el punto.
4. **`VENTANA_DIAS_CANDIDATOS_ANCLAJE_ = 14` sigue hardcodeado.** No se arregla acá.
5. **No se agrega `seccion_id` a `MARCADORES`**, no se tocan los 7 `ecv_` ambiguos, ni los tres
   remitentes sueltos, ni `camp_bench_*`, ni `m2_`.
6. **No se deroga ni se reescribe una `R-NN`, `D-NN`, `S-NN` ni `C-01`.**
7. **No se ajusta ningún número para que cierre**, y **no se reescribe historia de git**.

---

## Cuándo está hecho

- **Los cuatro de IVR cierran** dígito a dígito.
- **`enc_mails_enviados` da 44.043** y no 582.
- **La regla de mail sirve también para San Cristóbal y Retiro**, o se explica por qué no.
- **Nada de lo que hoy ancla bien se rompió** — comparado contra la foto de `0.5`.

---

## El reporte

1. **Las cinco mediciones de la Parte 0**, cortas. En especial `0.3`: ¿la ventana alcanzaba?
2. **Los once números, uno por uno**: cierra / no cierra, y por qué.
3. **Los cuatro criterios: cuáles se cumplen.**
4. **Qué decisiones tomaste solo y por qué.**
5. **Qué premisa de este prompt resultó falsa**, si alguna. Van tres prompts seguidos con una premisa
   central falsa; sigue siendo información útil.
6. **Los números que salieron raros.** Sin analizarlos.

**Recién después, la documentación completa.** Sin trailer `Co-Authored-By`.

**Modelo:** Opus.
