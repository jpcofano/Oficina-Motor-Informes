# `_42` · Los hallazgos del censo, a `PENDIENTES_consistencia.md` — con una premisa mía corregida

> **Modelo por parte, declarado en cada una.** Sin declaración, Sonnet.
>
> El `_41` tenía una Parte D que no se ejecutó: los cuatro hallazgos del censo quedaron sólo en
> `docs/BITACORA.md`, que es el dueño de *qué se hizo y cuándo*, no de *qué sigue abierto*
> (`CLAUDE.md` §7). Un hueco anotado sólo en la bitácora se pierde.
>
> **Y una de las cuatro entradas del `_41` estaba mal encuadrada.** El repo ya tiene la respuesta y
> yo no la crucé antes de escribirla. Va corregida abajo.

---

## Lo que la bitácora ya decía sobre `3387` y sus mails

El `_41` pedía anotar como `P0` que *"Orden Público publica ~1/6 de sus mails"*. **No es un
defecto.** `docs/BITACORA.md` lo tiene medido dos veces:

- `MARCADORES` lleva `filtro = mail_tipo=Convocatoria` con `operacion = ULTIMO`. Las cinco filas de
  mail de `3387` son `Convocatoria` ×3 (22/07 ×2 y 25/07), `Confirmación` (27/07) y
  `Agradecimiento` (03/08). **El corte por `mail_tipo` ya existe y funciona.**
- La verificación de los once números (11/08) dice que la fila del **25/07** da
  `44.043 / 43.439 / 4.652 / 145`, **exactamente lo publicado**.

Así que `44.043` es el número validado, y los `271.118` de la base nueva son **otra definición**:
la base agrega el envío completo de la campaña, el motor publica el envío del encuentro. El hallazgo
sigue siendo útil, pero al revés de como lo escribí: **la base nueva no arbitra sobre los `enc_mails_*`.**

---

## Parte A · Sólo lectura

**Modelo: Sonnet. Effort: normal.**

1. Confirmar contra `docs/PENDIENTES_consistencia.md` que **ninguno** de los cuatro hallazgos está
   ya anotado: el `enc_alcance` de `3156` Boedo, el contraste base–`looker` de 28/49, la
   corroboración de dos testigos sobre `digital/Alcance`, y lo de `3387`. Grep por
   `258.684`, `3156`, `28 de 49`, `Alcance manual`, `meta_alcance`.
2. **`3156` Boedo, `enc_alcance = 258.684`: buscar si algún testigo lo sostiene.** Grepear el
   número en `docs/` entero, incluidos los tres CSV de casos. Reportar si aparece validado, si
   aparece sólo como salida del motor, o si no aparece.
3. Confirmar que `MARCADORES` tiene `filtro = mail_tipo=Convocatoria` sobre `enc_mails_enviados`
   **hoy** — el snapshot más reciente de `docs/_snapshots/MARCADORES_*.tsv` alcanza, y decir de qué
   fecha es esa foto.

**Reportar y parar.**

---

## Parte B · Las cuatro entradas

**Modelo: Opus. Effort: alto.** Dos de las cuatro dicen si un número publicado está bien o mal.

Todo va a `docs/PENDIENTES_consistencia.md`. **No se crean archivos nuevos, no se edita `R-24`, no
se decide ninguna regla de `Alcance`.**

1. **Addendum fechado a la sección `digital/Alcance` — dos filas por cuenta (12/08, `P1`).**
   Aparecieron dos testigos independientes que no existían cuando se escribió:
   `looker/resumen_metricas_dinamico.meta_alcance` y `Agenda JM.Alcance manual` coinciden entre sí
   en 6 de 7 cuentas, y **en los 4 casos ambiguos las dos eligen la primera de las dos filas** —
   `3387` 66.345, `3289` 157.580, más 20.876 y 104.438. Excepción: `3346` Retiro, donde la base
   dice 0 contra 47.753 de las otras dos, y esa fila trae **todo el bloque digital en cero**.
   **No cierra la regla:** dos testigos que coinciden son evidencia, no la columna que discrimina.
   La sección sigue abierta y las láminas siguen publicando `—` con motivo.
2. **`P1` · `3156` Boedo publica un `enc_alcance` sin testigo.** El motor imprime `258.684`; la
   base nueva y `looker` traen la celda vacía. La guarda del `_39` no lo tapa porque **una de las
   dos filas está vacía y `ULTIMO` se queda con la otra** — la guarda exige dos valores distintos.
   Redactarlo con lo que devuelva la Parte A.2: si ningún testigo lo sostiene, **es un número
   publicado que no tiene de dónde salir**, y eso es lo que hay que escribir.
3. **`P2` · la base nueva no arbitra sobre `enc_mails_*`.** Con el encuadre de arriba: `44.043` es
   el valor validado y el corte por `mail_tipo` es correcto; los `271.118` de la base son el envío
   de campaña completo. **Consecuencia para el alta:** una columna de mail de `Agenda JM` que
   contradiga al motor no es evidencia de defecto — mide otra cosa.
4. **`P2` · base nueva contra `looker`: 28 de 49 celdas difieren.** `meta_alcance` 7/7,
   `digital_impresiones` 1/7, Call Center 3/7 y los tres son ceros; para `3387` la base dice 0
   discados y `looker` 7.954. **Dos candidatos de explicación, ninguno medido:** la base es una fila
   por encuentro con su fecha de envío contra un tramo de campaña de `looker` (17/07–20/08 para
   `3289`); y `C-41` —una cuenta por encuentro en la base contra dos campañas publicadas en el
   deck—, que hoy está sólo en el cuerpo de un commit y por eso no lo lee nadie.

**Un commit.**

---

## Reporte final

- Qué devolvió A.2 sobre `258.684`.
- La fecha del snapshot de `MARCADORES` usado en A.3.
- Si alguna de las cuatro ya estaba anotada y quedó como addendum en vez de entrada nueva.
