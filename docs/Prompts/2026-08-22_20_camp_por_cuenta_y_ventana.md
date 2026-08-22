# Paso 2026-08-22_20 — Los `camp_*` por cuenta, el ítem del IVR, y la ventana del equipo

**Estado:** no ejecutado.
**Reemplaza:** nada.
**Toca:** las hojas `SOLAPAS`, `PERIODOS`, quizá `MARCADORES`; `docs/PENDIENTES_consistencia.md`; el
CSV de casos. **Puede tocar `.gs` sólo en la Parte B, y sólo si 0.2 lo justifica.**

---

## Contexto — tres cosas medidas en `jm-20260821-234927`

Esa corrida es el testigo: período elegido (`periodo_ref:agosto_14_20`), temario correcto,
**192 s de 350 y sin corte**, cuatro etapas con punto de control, 127 impresos.

1. ⛔ **Los nueve `camp_*` leyeron el agregado, no la cuenta.** La traza dice
   `solapa "resumen_metricas_dinamico"` y **no** dice rama por cuenta. Tomó **9 filas
   compartiendo la fecha más alta**. `ULTIMO` se negó a elegir entre 160 / 507 / 12.985 / 14.040 /
   84.325 / 103.639 — la guarda funcionó, pero el cableado está mal.
2. ⭐ **El IVR no es un problema de cableado.** Los cuatro números del equipo
   —96.549 · 304 · 33.139 · 107.194— el motor **los publica exactos**, en la copia equivocada de
   la lámina. Con el temario correcto salen `-`. Falla **qué ítem llega**, no el cableado.
3. ⚠ **`camp_remitente` y `camp_titulo` quedaron crudos** —`{{}}` a la vista— y el motor lo avisa
   solo: *"quedó crudo en el deck sin que hubiera corte por tiempo — revisar"*.

Y una cuarta, del informe del equipo: **titula «14_08 al 21_08», ocho días**, contra los siete de
`R-11`. El equipo actualiza el archivo el viernes al mediodía.

---

## Parte 0 — verificación de premisas · **Sonnet** · sólo lectura · reportar y parar

**0.1 · Qué declara `looker` hoy.** Sobre `SOLAPAS` viva, reportar la fila de
`looker/resumen_metricas_dinamico`: `campo_id_cuenta`, `ventana_ref`, `uso`. ⚠ **Reportar la fila
cruda entera** — `campo_id_cuenta` es la columna 11 de 12 y ya se leyó mal una vez.
Reportar también qué campos lógicos tiene mapeados esa solapa y **cuál de ellos es el `ID Cuentas`**.
Si ninguno lo es, **parar**: falta una fila de `MAPEO` antes que nada.

**0.2 · ⭐ Por qué el ítem correcto no llega a la lámina del IVR.** Es la parte que más rinde y la
que menos se sabe. Medir, contra el código y contra `FALTANTES` de `jm-20260821-234927`:
qué ítem recibe la lámina que publica los cuatro números exactos, qué ítem recibe la que publica
`-`, y **de dónde sale cada uno**. La hipótesis a favorecer o descartar es que la lámina se emite
sobre el ítem de una sección y los `enc_*` de IVR esperan el de otra. **Reportar el mecanismo, no
proponer el arreglo todavía.**

**0.3 · Los dos crudos.** `camp_remitente` y `camp_titulo`. Reportar: si tienen fila en
`MARCADORES`; si el aviso *"quedó crudo sin corte"* distingue *"no se intentó"* de *"se intentó y
el escritor no lo pisó"*; y en qué láminas quedaron. `camp_titulo` **sí** aparece resuelto en otras
láminas de la misma corrida —con `@ultimo_ambiguo`—, así que el crudo es de un lugar puntual.

**0.4 · `PERIODOS` hoy.** Reportar todas las filas. Se sabe de dos rarezas: `julio_24_30`
duplicado, y un `periodo_id` que es una frase —`vie 14/08 -- jue 20/08 (por defecto)`—. **No
tocarlas**: reportar si son inertes o si alguna puede ganarle a la elegida en pantalla.

**0.5 · Qué dice `R-11` exactamente.** Traer su texto y sus addenda. La Parte D **no lo deroga**;
necesita saber qué dice para no contradecirlo sin decirlo.

**Reportar y parar.**

---

## Parte A — `camp_*` por cuenta, verificado contra el informe del equipo · **Opus** · effort alto

Sólo si 0.1 encontró el campo del `ID Cuentas` mapeado.

Declarar `campo_id_cuenta` en `SOLAPAS` para `looker/resumen_metricas_dinamico`, con el campo
lógico que 0.1 identificó. Es la misma forma que `D-30` ya usa para
`digital/CAMPAÑAS_DESGLOCE_DIGITAL`.

⚠ **La intersección peligrosa, medida antes de escribir.** Listar **todos** los marcadores que hoy
leen esa solapa. Declarar `campo_id_cuenta` **les cambia el camino a todos**, no sólo a los nueve
`camp_*`. Si alguno está validado con un caso `exacto`, **parar y reportar**: se estaría moviendo
un número ya verificado.

**El control no es que salga un número: es que salga el número correcto.** El deck del equipo de
esta semana ya está verificado por `sha256` en
`docs/VALIDACION_deck_generado_vs_equipo_2026-08-22.md`. **Citar de ahí** los `camp_*` de la
campaña destacada —entregados, aperturas, clics, impresiones— y reportar el valor del motor al
lado del del equipo, con la diferencia. **No se corre para verificar: se reporta y el usuario
corre.**

⛔ **Si después del cambio `ULTIMO` sigue dando `@ultimo_ambiguo`**, el problema no era la cuenta:
es que la solapa tiene varias filas por cuenta y fecha. **Reportarlo y parar** — no inventar un
desempate.

---

## Parte B — el ítem que no llega · **Opus** · effort alto

Sólo con 0.2 reportado y el mecanismo entendido.

Arreglar que la lámina del IVR reciba el ítem correcto. Reglas:

1. **El cableado no se toca.** Publica los cuatro números exactos; el bug es de ruteo de ítem.
2. **Si el arreglo es declarativo** —`LAMINAS`, `SECCIONES`, una fila de config— va por ahí. Un
   `.gs` sólo si 0.2 mostró que no hay forma declarativa, **y diciéndolo**.
3. **Control positivo:** que la lámina reciba el ítem esperado y que la que hoy lo recibe por error
   **deje de recibirlo**. Los dos asertos.

**El control final es que los cuatro números del equipo aparezcan en la lámina correcta.**

---

## Parte C — los dos crudos · **Sonnet**

Con lo que 0.3 haya medido. ⚠ **Un token crudo es peor que un hueco**: `/////` o `---` avisan;
`{{camp_titulo}}` en un deck que va al equipo parece un error de plantilla, no del motor.

Si la causa es que no hay fila en `MARCADORES`, eso es cableado y **va en otro paso** — acá se
reporta. Si es que el escritor no pisó un token que sí se resolvió, **eso sí se arregla acá**, con
su control.

---

## Parte D — la ventana del equipo como opción · **Sonnet**

**Alta en `PERIODOS`:** `agosto_14_21`, `2026-08-14` → `2026-08-21`, con nota diciendo que es la
ventana que publica el equipo, que son **ocho días**, y por qué: el equipo actualiza el archivo el
viernes al mediodía, así que su corte incluye el viernes de cierre.

Es una fila. No toca código, no toca `R-11`.

⚠ **Y escribir la consecuencia en `docs/PENDIENTES_consistencia.md`, porque no es obvia:** una
ventana viernes–viernes de ocho días hace que **el viernes se cuente en dos informes seguidos**.
`R-11` son siete días justamente para que no se solape. Con `agosto_14_21` disponible como opción,
dos corridas de semanas consecutivas pueden sumar el mismo día dos veces **sin que nada falle**.

⛔ **Lo que este paso NO hace: cambiar el default.** `R-11` sigue siendo viernes–jueves. Que la
opción exista no la convierte en la regla. **Esa decisión es del usuario** y va anotada como
pendiente abierto, con las dos consecuencias enfrentadas: comparar contra el informe del equipo se
vuelve directo, y el solapamiento del viernes aparece.

**Y anotar, sin tocarlas**, las rarezas que 0.4 haya reportado en `PERIODOS`.

---

## Fuera de alcance

- **El encabezado de `digital/Directa IVR`.** Las 12 desalineadas siguen siendo su propio paso.
- **`N envíos de Mail`** (541.002 contra 6): mide piezas, no envíos. Es una definición y la decide
  el usuario.
- **Los seis `pauta_*`** que publican `1` contra 28 y 270: es el frente 3, `C-64`.
- **Programmatic 3,6–7,2×.** ⚠ **Mirar primero la ventana de ocho días** — puede explicar parte, y
  perseguir la plataforma antes de descartarla es trabajo perdido.
- **RRSS publicando la semana pasada sin marcarlo.** Es el peor de los abiertos —un número viejo no
  avisa de nada— y necesita su propio paso.
