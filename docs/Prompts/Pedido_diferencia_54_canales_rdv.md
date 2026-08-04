# Pedido — La diferencia de 54 entre `inscriptos` y la suma de los cinco canales

**Estado:** vivo · **Fecha:** 2026-08-03 · **Ubicación:** `docs/Prompts/Pedido_diferencia_54_canales_rdv.md`

> **Sólo lectura y documentación.** No toca `.gs` ni escribe hojas. Sale del control agregado
> del corte vertical, que no cerró: `prueba_inscriptos = 2919` contra `2865` de la suma de los
> cinco `prueba_insc_*`, sobre las 12 filas de la ventana 24–30/07.
>
> **Ya está descartado que sea el motor.** La suma es conmutativa y asociativa: sumar cada
> columna y después sumar las columnas da idéntico a sumar fila por fila. Si el agregado no
> cierra, la identidad no se cumple en alguna de las 12 filas — aunque sí se cumpla en la de
> `Orden Público 28/07`, donde `361 + 169 + 43 + 180 + vacío = 753`.
>
> **Es un hallazgo sobre los datos, y hay que dejarlo escrito antes de tocarlos.**

---

## Parte 0 — El censo. Sólo lectura. Reportar y **PARAR**.

Sobre las **12 filas** de `rdv/RVD JM-CM - ES` que caen en la ventana con `status = Realizada`
(`D-21`), listar una por una:

`FECHA` · `EVENTO` · `Barrio` · `inscriptos` (K) · `insc_mail` (L) · `insc_cc` (M) ·
`insc_ivr` (N) · `insc_digital` (O) · `insc_dif` (P) · **suma de los cinco** ·
**diferencia contra `inscriptos`**.

Y por cada celda de canal que no aporte, decir **cuál de los tres casos es**, que no son lo
mismo:

- **vacía** — nadie la cargó;
- **cero explícito** — alguien cargó `0`;
- **no numérica** — tiene texto (`s/d`, `-`, un guión largo, un espacio). `SUMA` la saltea
  igual que a la vacía, y en la traza no se distinguen.

Reportar además cuántas de las 12 filas cierran exacto, cuántas quedan cortas, y si alguna
queda **larga** — que sería un caso distinto y peor.

**Reportar y PARAR.** No corregir ninguna celda: la base la cura una persona.

---

## Parte A — La pregunta que hay que hacerle al equipo

Del censo salen dos lecturas, y **no las decide el motor**:

1. **Faltan datos** — los canales están sin cargar en algunas filas, y la identidad
   `inscriptos = mail + cc + ivr + digital + difusión` sí vale. Entonces es curaduría de la
   base.
2. **La identidad no vale siempre** — hay inscriptos que no vienen de esos cinco canales
   (inscripción espontánea, presencial, un canal no mapeado). Entonces `cierraSuma` del
   `2.9E` es una verificación válida por fila pero **no** una regla general, y hay que
   escribirla como tal.

Anotar la pregunta en `docs/PENDIENTES_consistencia.md` → "Preguntas al equipo", con el censo
como respaldo. **No marcarla como bloqueo:** el corte vertical cerró, y esto no traba ningún
paso.

---

## Parte B — Lo que sí se documenta ahora

En `docs/BITACORA.md`:

- **El control agregado del corte no cerró: −54 sobre 2919 (1,8%).** Descartado el motor por
  el argumento de arriba. Queda como hallazgo abierto sobre los datos de `rdv`.
- **Cobertura por canal en la ventana**, que es el dato más útil del corte: `insc_mail` 9 de
  12 filas con valor numérico, `insc_digital` 9, `insc_cc` 2, `insc_ivr` 1, `insc_dif` 2,
  contra `inscriptos` 12 de 12. Es la primera medición de cuán completa está esa base.
- **`prueba_alcance = 1.255.486` no es el alcance de los encuentros de la semana.**
  `looker.fecha_periodo` es la fecha de **inicio de campaña**, y las campañas arrancan días
  antes del encuentro: la ventana devuelve las campañas que **empezaron** entre el 24 y el
  30. El número es una lectura correcta de una pregunta que no es la del deck. Confirma por
  qué los `camp_*` se cablean contra `digital` y no contra `looker`, y por qué `digital`
  quedó en `snapshot` en el `Paso-2.3`.

---

## Qué NO hacer

- No corregir celdas de `rdv`.
- No agregar una operación ni una función para esto: el censo se reporta, no se instala.
- No retirar los `prueba_*` todavía — los mira el usuario.
- No marcar la pregunta al equipo como bloqueo.
- Sin trailer `Co-Authored-By`.

**Modelo:** Opus.
