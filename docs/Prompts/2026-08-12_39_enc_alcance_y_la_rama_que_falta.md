# `_39` · `enc_alcance` apunta a la solapa equivocada — y la rama que falta

> **Modelo por parte, declarado en cada una.** Sin declaración, Sonnet.
>
> El `_38` dejó el diagnóstico cerrado. **De los 16 indicadores vacíos, sólo uno se puede arreglar
> hoy sin código nuevo, y hay uno que no se arregla nunca.** Esto hace el primero y deja el resto
> nombrado.

---

## Lo que el `_38` dejó medido

**Causa 2 — el dato no existe.** San Cristóbal y Retiro tienen **cero filas** de Mail, SMS e IVR en
toda la base, no sólo en la ventana. Se barrieron las solapas enteras. **Esos tokens publican `—`
para siempre y está bien que lo hagan.** No hay nada que arreglar y no se va a insistir.

**Causa 4 — la más grande, y no tiene que ver con el enlace.** 8 tokens sin fila en `MARCADORES`
—el embudo de Call Center completo más `enc_alcance_pct` y `enc_alcance_potencial`— más
`enc_impresiones` y `enc_alcance`, que apuntan a `digital/Digital`, que es **`uso = ignorar`**
(`R-22`).

**Y el hallazgo lateral que resulta ser el arreglo:** `digital/Alcance` **sí tiene** el dato de San
Cristóbal — `Alcance 1412`, campaña *1 A 1 JM | 23/7 SAN CRISTÓBAL*. Y `A.2` del `_38` midió que
**los seis ítems tienen 1 o 2 filas de `Alcance`**. Ningún marcador de la lámina la lee.

---

## Parte A · Premisas — sólo lectura, reportar y parar

**Modelo: Sonnet, effort alto.**

**A.1** — La fila de `MARCADORES` de `enc_alcance` tal cual, con su `notas`. La nota dice que la
ambigüedad `Digital/dig_alcance` contra `Alcance/alc_alcance` se resolvió hacia `Digital` **por
coherencia con `enc_impresiones`**. Citarla textual: es la premisa que hay que dar por vencida.

**A.2** — `digital/Alcance` en `SOLAPAS`: su `uso` y su `MAPEO`. Se espera `uso = fuente` y un campo
lógico para la columna `Alcance`. **Si `uso` no es `fuente`, parar**: el arreglo no existe y hay que
pensarlo de nuevo.

**A.3** — El valor de `Alcance` de la cuenta anclada de **cada uno de los seis ítems**, leído por la
rama por cuenta. Los seis, no sólo San Cristóbal.

**A.4 — la que decide lo que viene después.** En `datosDeMarcador_` hay dos ramas por ítem: una para
`rdv` y una para `digital`. **Confirmar que no hay ninguna para `looker`.** Si no la hay, un
marcador de `looker` emitido dentro de una lámina de encuentro cae a la rama general y publica **el
agregado de la ventana, igual en las seis láminas** — que es exactamente el bug que `_28` arregló
para `rdv`. Reportarlo, sin implementar nada.

**Reportar y parar.**

---

## Parte B · Re-apuntar `enc_alcance`

**Modelo: Opus, effort alto.** Mueve un número publicable.

**Sólo si A.2 dice `uso = fuente` y A.3 devolvió valores.**

`enc_alcance` pasa a `digital/Alcance`, campo de la columna `Alcance`.

**La derogación va escrita, no implícita.** En `notas`, que la resolución anterior hacia `Digital`
se apoyaba en la coherencia con `enc_impresiones`, y que esa coherencia **ya no sostiene nada**:
`digital/Digital` es `uso = ignorar`, así que `enc_impresiones` tampoco publica. Se alineaba con un
marcador que no funciona. Más `SIN VALIDAR — 12/08` y el caso `V-*` si la ventana de validación
tiene uno para alcance por encuentro.

**Sólo `enc_alcance`.** Ni `enc_alcance_pct` ni `enc_alcance_potencial`: `digital/Alcance` tiene seis
columnas y ninguna es *potencial*. Ésos son de la Parte que no se hace hoy.

---

## Parte C · Correr y leer

**Modelo: Sonnet.**

Sólo si la Parte B cambió algo, y **después** de que el `_36.1` haya cerrado — no se encadenan dos
cambios en una corrida sin leer la del medio.

Del deck: `enc_alcance` en las seis láminas, **valores distintos entre sí**, y San Cristóbal en
`1412` si la base no se movió. Una sola corrida.

---

## Lo que queda nombrado y no se hace hoy

**Una rama por cuenta para `looker`, contraparte exacta de las de `rdv` y `digital`.** Es lo que
destraba los 8 sin fila más `enc_impresiones`: las columnas existen y están medidas —`call_enviado`,
`call_discado`, `call_contactados`, `call_efectivos`, `digital_impresiones`, `meta_alcance` en
`resumen_metricas_dinamico`, con clave `id_cuentas`— y es un filtro sobre una solapa, no la unión de
seis que necesita `digital`.

**Cablearlos sin la rama publicaría el agregado de la semana en las seis láminas.** Un número
grande, plausible y equivocado, que es el modo de falla de siempre. **No se cablea ninguno hasta que
la rama exista.**
