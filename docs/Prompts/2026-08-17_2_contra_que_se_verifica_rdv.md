# 2026-08-17_2 — ¿Contra qué se verifica una migración en `rdv`?

> **Estado:** no ejecutado · **reemplaza:** nada · **subagente:** ninguno
>
> ## No migra nada. **Es un prompt de medición y termina en reportar y parar.**
>
> **Objetivo único:** decidir, con evidencia, **contra qué se verifica** una migración en `rdv` —
> porque hoy **no hay canario posible** y sin eso los 17 marcadores no se pueden tocar.

---

## Por qué esto va ahora y no cuando toque migrar `rdv`

**Son 17 de 48 — más de un tercio de lo que queda** — y es el **único grupo sin canario posible**:
**los 17 marcadores de `rdv` tienen el mismo filtro, `figura=Jorge Macri`, y ninguno tiene el
filtro vacío** (medido sobre `MARCADORES_2026-08-17.tsv`).

**Eso no es el último ítem de una lista: es el riesgo principal de lo que queda.** Descubrirlo al
escribir la tanda deja el trabajo trabado con todo el contexto encima; resolverlo antes lo
convierte en una precondición cumplida.

**Y aparece dos veces.** El par `frecuencia`/`gcba_frecuencia` tiene el mismo problema en `looker`:
cuando migren, **no va a quedar ningún marcador de `looker` sin migrar** contra el cual leer.
**Conviene resolverlo una sola vez y que las dos tandas hereden la respuesta.**

### Por qué el canario del piloto no sirve acá

El canario funciona porque es **un marcador de la misma base que el cambio no toca**. En `rdv` no
existe: **los 17 comparten filtro**, así que migrar `ambito` los toca **a todos a la vez**. No hay
un decimoctavo que quede afuera.

⚠ **Y un canario de otra base no sirve**: mide que **esa** base esté quieta, no `rdv`. Es la misma
confusión que la tanda 1 casi comete al buscarle canario de `looker` cuando el corte estaba en
`digital`.

---

## Las tres salidas — **medidas, no propuestas**

**El prompt no elige de antemano.** Cada una se mide y el reporte dice cuál sirve, con el número
al lado. Si más de una sirve, decir cuál es más barata.

### Salida 1 · ¿`rdv` está quieta? — **es la pregunta previa y puede cerrar el tema sola**

**Si `rdv` está quieta, la igualdad exacta de valores alcanza y el canario sobra**, exactamente
como pasó en la tanda 1 con `digital`.

**Cómo se mide, y es barato:** dos tomas de los 17 separadas en el tiempo, **sin tocar nada en el
medio**. Si dan idénticas, `rdv` se comporta como `snapshot`.

- ✅ **Cuánto separarlas: DOS O TRES DÍAS, y no es una estimación.** El usuario midió que **`rdv`
  se actualiza en ese ritmo** (17/08/2026). Una segunda toma al día siguiente **no distingue
  "quieta" de "todavía no la tocaron"** — daría idénticas por cadencia, no por estabilidad, y esa
  es la conclusión falsa más fácil de sacar acá.
- **Por qué no vale el criterio de las otras dos bases:** en `looker` el drift se vio en **1h45**
  y en `digital` no hubo movimiento en más de una hora, así que ahí una hora alcanzaba. **`rdv` es
  una base de carga humana** —alguien agrega encuentros— y su patrón de cambio es **diario, no
  continuo**: el reloj que corresponde es el de quien la carga, no el del reloj.
- ⚠ **Un "no se movió" en una ventana cerrada no prueba que nunca se mueva.** Decir sobre qué
  ventana se midió, y si esa ventana ya está cerrada o es la corriente. **Es la diferencia entre
  *"está quieta"* y *"esta semana no la tocaron"*.**

### Salida 2 · ¿Hay alguna medida de `rdv` que se pueda leer por dos caminos distintos?

**Si un mismo hecho se puede obtener de dos formas independientes, la coincidencia entre las dos es
un control** — que es la propiedad que hizo bueno al par `enc_atendidos`/`ivr_atendidos`: **dos
lecturas de la misma medida**, y si divergen el problema es el instrumento.

Candidatos a mirar, **verificando y no asumiendo**:

- **`CONTEO` contra `SUMA`.** `ecv_encuentros` cuenta filas; varios `ecv_*` suman columnas sobre
  **el mismo conjunto**. La **cuenta de filas de la traza** tiene que ser la misma para los 17,
  porque comparten filtro. **Eso ya es un control gratis y no necesita nada nuevo.**
- **Las cinco identidades de canal.** ¿`insc_mail + insc_cc + insc_ivr + insc_digital + insc_dif`
  da `inscriptos`? Si cierra, **es una invariante estructural** como `total = suma de partes` del
  piloto, y **sobrevive al drift**. ⚠ **Hay que medirlo antes de confiar**: si hoy no cierra, no
  sirve — y **si hoy no cierra, eso es un hallazgo propio** y se reporta aparte.
- **Los cinco `_pct` contra sus dos sumas.** ⚠ **Ojo: esto NO es un control** — es el mismo caso
  que `mail_or` en la tanda 1: los tres comparten filtro, así que el `PCT` es el ratio de dos sumas
  sobre las mismas filas y **se cumple por construcción**. Sirve sólo para confirmar que valores y
  cuentas salieron de la misma lectura.

### Salida 3 · ¿Sirve la toma doble separada en el tiempo?

Es lo que se planteó para `looker` y **es la salida cara**: exige dos corridas con una espera en el
medio, y **cada `testigoDeImpresiones()` cuesta ~3m30s contra un límite de 6 minutos**.

**Medir qué agrega sobre la salida 1**, porque puede ser la misma medición con otro nombre. Si
`rdv` resultó quieta, esto **no agrega nada** y no se hace.

---

---

## ✅ Primera toma: 17/08/2026 — **los dos hallazgos cierran**

| hallazgo | resultado |
|---|---|
| **1 · las 17 cuentas de filas** | **idénticas**: 4 de 15 en los diecisiete |
| **2 · las cinco identidades de canal** | **cierran exacto: 2.307** |

**La identidad de canales es entonces la invariante estructural equivalente al descuadre del
piloto**, y sirve como control que **sobrevive al drift**: no depende del momento sino de que las
partes cubran el total.

⚠ **Con un borde medido el mismo día y que no la invalida:** **sin recorte por ventana** la
identidad **no** cierra —sobra 1 sobre 4.330 (`PENDIENTES`, 17/08)—. **La que vale como control es
la de ventana**, que es la que una migración va a tener que reproducir. Son dos mediciones
distintas del mismo campo y **no se pueden usar indistintamente**.

## Segunda lectura: 17/08/2026, **12 horas después — NO responde la pregunta 1**

Dio **idéntica**: 4 de 15 en los diecisiete, identidad de canales en **2.307**, los 17 valores
iguales.

⚠ **Y aun así no cuenta como respuesta**, porque **12 horas no distinguen *"quieta"* de *"todavía
no la tocaron"*** con una cadencia de carga de dos o tres días. **Es exactamente lo que la
advertencia de arriba anticipaba**, y por eso se registra como lo que es:

> **Una tercera lectura consistente con las otras dos. Sirve para confirmar que el instrumento es
> estable —tres corridas, mismos números— y nada más.**

**Contarla como respuesta sería el error que este prompt existe para evitar:** tomar una identidad
producida por la **cadencia** y leerla como **estabilidad**. Sería un verde que no probó lo que
dice — el mismo patrón de la prueba de `ULTIMO` que pasó meses afirmando algo que no verificaba.

**La toma que decide va el miércoles 19 o el jueves 20**, con **dos o tres días** de separación
real de la primera.

---

## Qué tiene que decir el reporte

1. **¿`rdv` está quieta?** Sí / no / no concluyente, **con las dos tomas, sus horas y la ventana**.
2. **Si está quieta:** *"la tanda de `rdv` se verifica por igualdad exacta de valores, sin
   canario"*, y el prompt de esa tanda se puede escribir.
3. **Si NO está quieta:** cuál de las salidas 2 o 3 sirve, **con el número que lo demuestra**. Si
   ninguna sirve, **decirlo** — que la tanda de `rdv` no se puede verificar hoy es un resultado
   válido y es mejor saberlo antes de migrar 17 marcadores.
4. **La respuesta para `looker`**, que hereda el mismo problema: decir si la salida elegida le
   aplica o si necesita una propia. `looker` **ya está medida como base que se mueve**, así que es
   probable que difiera — y si difiere, **decirlo, no forzar una respuesta única**.
5. **Si aparecen las identidades de canal**, dejarlas escritas como control reusable: sirven para
   `rdv` y para cualquier tanda futura sobre esa base.

**Reportar y parar. No migrar nada, no tocar `MARCADORES`, no escribir el prompt de la tanda.**

---

## Lo que ya está medido y no hay que volver a medir

- **Los 17 marcadores de `rdv`**, todos con `filtro = figura=Jorge Macri`, sobre
  `rdv/RVD JM-CM - ES`. Operaciones: 7 `SUMA`, 5 `PCT`, 3 `ULTIMO`, 1 `CONTEO`, 1 `LISTA`.
- **Ninguno tiene el filtro vacío** — por eso no hay canario.
- **`DIMENSIONES_` ya sabe expresar `ambito` en esta base**: `jm` es `figura=Jorge Macri` y `gcba`
  es `figura!=Jorge Macri`. **La tanda no necesitaría tocar código.**
- ⚠ **Pero los 17 son `jm` y no hay ninguno `gcba`**, así que **no hay partición que medir**: el
  control de la tanda 1 no tiene equivalente acá. Es parte de por qué este prompt existe.
