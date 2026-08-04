# Addendum — Deroga de `mail_fecha`, censo por lectura cruda, y seguir con el pedido de `m2`

**Estado:** vivo · **Fecha:** 2026-08-03 · **Ubicación:** `docs/Prompts/Addendum_2026-08-03_deroga_mail_fecha.md`

> Dos prompts ya ejecutados en parte llevan addendum, no edición:
> `Pedido_ventana_m2_y_cableado_mail.md` (v2) y `Pedido_diferencia_54_canales_rdv.md`.
> Este archivo escribe los dos addenda y después continúa.
>
> **Cinco commits, en orden. Se avisa al final de cada uno.**

---

## Parte A — Addendum al `Pedido_ventana_m2_y_cableado_mail.md` (v2). Documentación.

Anexar al final del pedido, fechado `03/08/2026`:

> **`0.2` vencida y `Parte B` sin objeto.** La fila `digital/Directa Mail/fecha_periodo → F`
> **ya existía**: la promovió el `Paso-2.3.1`/`2.3.2` y la bitácora del `2.16` lo decía. El
> pedido la mandaba a agregar. La verificación de premisas hizo lo suyo y frenó antes de la
> primera edición.
>
> **Lo que la reemplaza:** derogar `mail_fecha`, la fila vieja sobre la misma columna y sin
> consumidor. Decisión del usuario, 03/08/2026. Dos filas apuntando a la misma columna es la
> ambigüedad que ya mordió con `SECCIONES.periodo_id` / `periodo_ref`.

## Parte B — Addendum al `Pedido_diferencia_54_canales_rdv.md`. Documentación.

Anexar al final, fechado `03/08/2026`:

> **Se invierte una instrucción del propio pedido.** Decía "no agregar una función para
> esto", asumiendo que existía una vía de lectura externa a las bases. No existe: los scopes
> de `clasp` son `drive.file` + `drive.metadata.readonly`, y `gviz`, `export` y `htmlview`
> devuelven 404/403.
>
> **El censo se hace con una función temporal dentro del motor.** La objeción de que eso es
> confirmar el motor consigo mismo apunta a `leerFuente`, no a Apps Script: un `getValues()`
> directo no pasa por `leerFuente`, ni por su normalización, ni por `snapshot`, ni por
> `D-21`. Y es lo que el censo necesita — `leerFuente` normaliza y borra justamente la
> diferencia entre celda vacía, cero explícito y texto no numérico.

---

## Parte C — Derogar `mail_fecha`

El usuario **ya la borró de la hoja `MAPEO`**. Falta el seed: sin eso, `upsertPorClave_` la
repone en la corrida siguiente.

Quitar la fila de `mail_fecha` de `SEED_MAPEO` en `Instalar.gs`, dejando en su lugar un
comentario con el mismo formato que usan las derogaciones anteriores del archivo: qué fila
era, por qué se deroga —misma columna que `fecha_periodo`, sin consumidor, el contrato vivo
es `fecha_periodo` por `S-02`— y la fecha.

**No tocar** el mapa de tipos donde figura `mail_fecha: 'fecha'` junto a `dig_fecha_inicio`,
`dig_fecha_fin` y `sms_fecha`: ese mapa lo consultan otros campos. Y **no tocar**
`docs/Prompts/Paso-2.3.md`, que es histórico y ejecutado.

Después de quitarla, correr el diff de configuración. La referencia sigue siendo
`protegidas (con diferencia): 0`. Reportar si `mail_fecha` aparece como `solo_en_hoja`.

---

## Parte D — El censo del `−54`, por lectura cruda

Función **temporal**, marcada como tal, que se retira junto con los `prueba_*`.

Abre `rdv` por su ID de `BASES`, lee el rango con `getValues()` y lista las **12 filas** de la
ventana 24–30/07 con `status = Realizada`:

`FECHA` · `EVENTO` · `Barrio` · `inscriptos` (K) · `insc_mail` (L) · `insc_cc` (M) ·
`insc_ivr` (N) · `insc_digital` (O) · `insc_dif` (P) · suma de los cinco · diferencia.

Por cada celda de canal que no aporte, clasificarla en uno de los tres casos, que
`leerFuente` colapsa en uno solo:

- **vacía** (`''`);
- **cero explícito** (`0` numérico);
- **no numérica** (texto: `s/d`, `-`, un guión largo, un espacio).

Reportar cuántas filas cierran exacto, cuántas quedan cortas y si alguna queda **larga** —
ese caso sería distinto y peor.

**No corregir ninguna celda.** La base la cura una persona.

Con el censo a la vista, anotar la pregunta al equipo en `docs/PENDIENTES_consistencia.md`,
sin marcarla como bloqueo: o faltan datos y la identidad `inscriptos = mail + cc + ivr +
digital + difusión` vale, o hay inscriptos que no vienen de esos cinco canales y entonces
`cierraSuma` del `2.9E` es una verificación por fila y **no** una regla general.

---

## Parte E — Seguir con el pedido de `m2`: Partes A, D y E

Ninguna depende de la `0.2`.

- **Parte A** — la `R-NN` de la ventana en `REGLAS_NEGOCIO.md`, con la nota de que el equipo
  trabaja de viernes a viernes y los números van a diferir.
- **Parte D** — el cableado de `MARCADORES` contra `digital`, derivado del inventario de
  `0.6` (59 campos en 6 solapas) cruzado con el diccionario de `TOKENS.md` §1. Van a fallar
  todas con `«FALTA:@digital_sin_cuenta»` y eso es lo esperado.
- **Parte E** — los pendientes.

Sobre `0.6`: `Cuentas` y `CAMPAÑAS_DESGLOCE_DIGITAL` son `fuente` y no tienen ni un campo
mapeado. **No abrir ese mapeo acá** — `PLAN.md` §2 dice que las solapas que falten se ajustan
después de la primera prueba de punta a punta. Anotarlo y seguir.

---

## Qué NO hacer

- No reponer `mail_fecha` en ningún lado.
- No corregir celdas de `rdv`.
- No mapear `Cuentas` ni `CAMPAÑAS_DESGLOCE_DIGITAL`.
- No retirar los `prueba_*`.
- No cambiar `modo_periodo` de `digital`.
- Sin trailer `Co-Authored-By`.

**Modelo:** Opus.
