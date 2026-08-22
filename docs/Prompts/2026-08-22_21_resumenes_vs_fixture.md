# Paso 2026-08-22_21 — Los resúmenes ejecutivos, marcador por marcador, contra el fixture

**Estado:** no ejecutado.
**Reemplaza:** nada.
**Toca:** `docs/VALIDACION_*` (documento nuevo), el CSV de casos,
`docs/PENDIENTES_consistencia.md`. **No toca ningún `.gs` ni ninguna hoja de configuración.**

---

## Contexto — qué separa este paso del reporte del 22/08

`docs/VALIDACION_deck_generado_vs_equipo_2026-08-22.md` comparó **deck contra deck**. Su propia §6
dice qué falta:

> Ninguna causa está medida contra las bases. […] El camino del fixture —abrir los `.xlsx` del
> mismo zip y reproducir la definición— **no se recorrió**, y es lo que separa *"la definición está
> mal"* de *"el motor la lee mal"*.

Este paso recorre ese camino, **sólo para los dos resúmenes ejecutivos**, que es donde el equipo
concentra lo que mira primero.

**Cada marcador se cierra con uno de tres veredictos, y hay que poder decir cuál:**

| veredicto | qué significa | qué trabajo manda |
|---|---|---|
| `coincide` | el motor publica lo que el fixture da | ninguno — caso `exacto` |
| `definicion` | el motor lee bien; la definición cableada no es la del equipo | decisión editorial del usuario |
| `lectura` | la definición es la correcta y el motor la lee mal | prompt de corrección |

⛔ **Un marcador que no llega a un veredicto no se fuerza a ninguno.** Queda `sin_resolver` con lo
que faltó para cerrarlo. Elegir el veredicto cómodo es peor que dejarlo abierto.

---

## Parte 0 — premisas y la ventana · **Sonnet** · sólo lectura · reportar y parar

⛔ **Dependencia dura, primero:** los fixtures **no están en el repo** —`.gitignore` los excluye
por el motivo escrito el 31/07, las bases traen nombres y volúmenes— así que **el usuario tiene que
adjuntar el zip**. Es el mismo `Seguimiento Digital 2026-08-20.zip` que ya tiene el deck del
equipo. Sin él, este paso no arranca: **decirlo y parar**, no buscar rodeos.

**0.1 · La huella, antes de citar un número.** `sha256` del zip contra
`f8ef3227fc6cc73ef5879948451093f8e7a278c0baf1f4341d187958f0f8cc87`. Si no coincide, **parar**: es
otro archivo y todo lo que se mida contra él no es comparable con el reporte del 22/08.

**0.2 · ⭐ La ventana, que gobierna todo lo demás.** El equipo titula *"14_08 al 21_08"*, ocho días;
`R-11` son siete.

⚠ **Dato del usuario, 22/08: las bases de este zip se bajaron el jueves.** Eso no impide medir —
**lo hace más limpio**, porque una base que corta el jueves **no puede** haber producido un número
de ocho días. Medir, no razonar:

1. Abrir el `.xlsx` y reportar **la fecha máxima y la mínima** que la base efectivamente contiene,
   sobre una columna de fecha de envío o de inicio.
2. Para **una** métrica de volumen del resumen —la de mail alcanza— calcular el total con la
   ventana de siete días y reportarlo contra lo que publica el equipo.

Los dos desenlaces, y los dos cierran algo:

- **Si la base termina el jueves y los siete días reproducen** — el título del equipo es
  decorativo, `R-11` estaba bien, y **la ventana queda descartada como causa**. Programmatic y las
  demás diferencias de volumen **vuelven a estar sin explicar** y hay que buscarlas en otro lado.
- **Si la base termina el jueves y los siete días NO reproducen** — el equipo generó su deck con
  una base más fresca que ésta. Entonces **este fixture no puede cerrar los números de volumen**, y
  eso es un límite del fixture, no un bug del motor. **Decirlo así**, para que nadie persiga
  después una diferencia que es de fecha de export.

⚠ **En los dos casos, todo lo que siga usa siete días.** Y si el segundo desenlace se confirma,
**marcar cada marcador de volumen como `sin_resolver` por fixture desactualizado** en vez de darle
un veredicto que la evidencia no sostiene.

**0.3 · Qué hay que reproducir.** Listar los marcadores de las dos láminas de resumen —la de JM y
la `gcba_*`— con su `base_id`, `solapa`, `campo_logico`, `operacion`, `filtro` y `dimensiones`
según `MARCADORES` viva. Reportar el conteo. **Si son más de ~45, reportarlo**: puede haber que
partir el paso en dos.

**0.4 · Qué se puede abrir.** De las solapas que 0.3 nombre, reportar **cuáles están en el zip y
cuáles no**. Las que no estén no se pueden cerrar acá y van a `sin_resolver` desde el principio,
no después de intentarlo.

**0.5 · Los casos que ya existen.** Reportar los casos del CSV que ya cubren alguno de estos
marcadores, con su estado. **Un caso `exacto` que este paso contradiga es un hallazgo grave**, no
una corrección de rutina: si aparece, se reporta y no se pisa.

**Reportar y parar.**

---

## Parte A — el recorrido · **Opus** · effort alto

Marcador por marcador, en el orden de la lámina. Para cada uno:

1. **Qué publica el equipo** — del deck ya verificado.
2. **Qué publica el motor** — de `jm-20260821-234927`, que es el testigo: período elegido, temario
   correcto, sin corte.
3. **Qué da el fixture** aplicando **la definición declarada en `MARCADORES`**, a mano, con la
   ventana de 0.2. Esta es la columna que el reporte del 22/08 no tiene y es la que decide.
4. **El veredicto**, de los tres de arriba.

Reglas del recorrido:

- **Se aplica la definición cableada, no la que uno cree correcta.** Si `filtro` dice
  `mail_tipo=Convocatoria`, se filtra por eso aunque parezca de más. El objetivo es saber **si el
  motor hace lo que dice hacer** — cambiar la definición mientras se mide destruye la medición.
- ⚠ **Si el fixture reproduce el número del equipo con **otra** definición, eso es información y va
  escrito** — pero el veredicto sigue siendo `definicion`, y **cuál va se decide después**. No se
  recablea acá.
- **Los que ya sabemos que no cierran** —`N envíos de Mail` publicando piezas, los seis `pauta_*`
  en `1`, Programmatic— **también se recorren**. El reporte del 22/08 dice *qué* difiere; este paso
  tiene que decir *por qué*, y son justamente los que más lo necesitan.
- **Un número que coincide también se reporta.** Los que ya cerraron exacto —las seis cifras del
  alcance, el mail de JM con un mail de diferencia— confirman que el método funciona; sin ellos el
  documento sólo tiene malas noticias y no se sabe si el instrumento sirve.

⛔ **Nada se arregla en esta parte.** Ni una celda de `MARCADORES`, ni un `.gs`. Es medición.

---

## Parte B — dejarlo escrito · **Sonnet**

**B.1** — documento nuevo `docs/VALIDACION_resumenes_vs_fixture_2026-08-22.md`, con la tabla de
cuatro columnas y el veredicto, y la huella del zip arriba. Los `sin_resolver` **con qué faltó**.

**B.2** — un caso en el CSV **por número cerrado**, con ids libres de su serie, sin reusar. Los
`coincide` van `exacto` **citando la lámina**. Los otros dos veredictos van con el estado que les
corresponda del vocabulario existente — ⚠ **y si ninguno encaja, se reporta y no se inventa uno
nuevo**: el vocabulario de estados ya tiene su propio paso pendiente (`2026-08-21_20`, diferido).

**B.3** — en `docs/PENDIENTES_consistencia.md`, lo que 0.2 haya medido sobre la ventana, con la
fecha máxima de la base y el número de siete días al lado del del equipo. Y **la consecuencia según
el desenlace**: si los siete reproducen, la ventana queda descartada y las diferencias de volumen
—Programmatic incluida— siguen abiertas, lo cual **cambia la prioridad** que el reporte del 22/08
había puesto en medir la ventana primero. Si no reproducen, queda anotado que **este fixture es de
una fecha anterior a la del deck del equipo** y no sirve para cerrar volúmenes.

---

## Fuera de alcance

- **Las láminas de encuentro, campaña, M2 y RRSS.** Este paso es sólo los dos resúmenes. El resto
  va después, con el mismo método, y probablemente en más de un paso.
- **Recablear cualquier cosa.** Los veredictos `definicion` esperan decisión del usuario; los
  `lectura` esperan su propio prompt.
- **La lámina de RRSS publicando la semana pasada.** Es el peor de los abiertos y no se arregla
  midiendo: su primer bloque no tiene tokens, así que el motor no lo toca y no hay nada que
  comparar.
- **`campo_id_cuenta` de `looker` y el ítem del IVR.** Son el `2026-08-22_20`.
