# `_44` · El mecanismo por cuenta, el alta de la base, y dos corridas

> **Reemplaza al `_44` entregado antes, que no se ejecutó.** Aquél medía si el join `CC × Cuentas`
> resolvía `X-21`; el usuario decidió que esa pregunta no frena la corrida.
>
> **Modelo por parte, declarado en cada una.** Sin declaración, Sonnet.

---

## La decisión que cambia el orden — usuario, 12/08/2026

**Cuando el dato vivo y un deck de referencia discrepan, y la discrepancia se explica por filas que
llegaron después, manda el vivo.** Cómo se forma el número lo valida la ventana de validación, en su
conversación y a su tiempo. **Una diferencia del orden del 10 % no frena una corrida.**

Aplicado a `X-21`: las tres filas de `3387` en `looker/CC` suman 7.954 y el deck de referencia
publica 7.232. **Call Center se cablea con el vivo.** El caso queda abierto donde está, y el prompt
no lo cierra.

**Lo que sí tiene que estar bien para la demo, y es el criterio de aceptación de la Parte D:** que
la sección repetible **itere sobre las reuniones del período**, que M2 aparezca, y que lo que viene
de `rdv` —inscriptos, asistentes, barrio, fecha— esté correcto.

---

## Parte A · Sólo lectura — de dónde sale Call Center por cuenta

**Modelo: Opus. Effort: alto.** Decide la fuente de un número publicable.

1. **El camino barato.** `looker/resumen_metricas_dinamico` tiene `call_enviado`, `call_discado`,
   `call_contactados`, `call_efectivos`; está mapeada, es legible, tiene `fecha_periodo` y ya tiene
   el corte de `R-23`. Para las 7 cuentas ancladas: **cuántas filas hay por cuenta** y qué dan esos
   cuatro campos. Si hay una sola fila por cuenta, decirlo — cambia la operación.
2. **Contra `looker/CC`.** El `_43` ya midió que la suma de `CC` cierra exacta contra `call_discado`
   y `call_contactados`. Confirmar si también cierran `call_enviado` y `call_efectivos`, y si
   `call_enviado` trae el número **sin la trampa del serial** que tiene `Base enviada`.
3. **`MAPEO`, qué falta.** Qué campos lógicos de `resumen_metricas_dinamico` habría que agregar para
   los cuatro `enc_*` de Call Center, y si alguno ya existe con otro nombre. **No agregarlos acá.**

**Reportar y parar.** Si el camino barato no sirve, decirlo: **no se fuerza.**

---

## Parte B · `SOLAPAS.campo_id_cuenta` — el mecanismo que falta

**Modelo: Opus. Effort: alto.** Es la Parte B del `_43`, que nunca se ejecutó. Va con su `D-NN` en
`docs/PLAN.md`.

Sin esto, un marcador de cualquier base que no sea `rdv` ni `digital` **publica el mismo agregado en
las seis láminas** — el bug que el `_28` arregló para `rdv`. Bloquea Call Center, el embudo del
iceberg y las impresiones por plataforma, todo junto.

La decisión tiene que decir tres cosas, y la tercera es la que evita el modo de falla de siempre:

1. **Qué campo lleva la cuenta**, declarado **por solapa** — `C-50` lo exige: la clave del par
   PRE/POST es `(ID, solapa)`, así que el mismo `id_cuenta` vive en dos solapas y cada una declara
   la suya.
2. **Que esa solapa no se recorta por ventana**, igual que `rdv` y por `R-17`: el temario ya
   seleccionó, y San Cristóbal 23/07 queda afuera de la ventana de julio. Precedente de forma:
   `SOLAPAS.ventana_ref` ya es un campo por solapa que cambia cómo se resuelve la ventana.
3. **Qué pasa cuando un marcador de esa solapa se emite sin `id_cuenta`** —el agregado del Resumen
   Ejecutivo—. **No debe caer a leer la solapa entera**: sin fecha y sin cuenta no hay nada que la
   acote, y una `SUMA` sobre todas las filas da un número grande, plausible y de todos los períodos.
   Devuelve `FALTA` con el motivo nombrado.

Con la guarda de solapa de la rama de `rdv`: la letra de columna vale para la solapa donde se
resolvió el mapeo; si el marcador apunta a otra, se cae a la rama general.

**Pruebas** (**modelo: Sonnet**), un fixture por afirmación: filtra por la cuenta del ítem; cae a la
rama general sin `id_cuenta`; la guarda de solapa dispara. Criterio de `CLAUDE.md` §4 — un dato que
satisface dos afirmaciones a la vez no distingue entre ellas.

---

## Parte C · El alta y el cableado

**Modelo: Opus. Effort: alto.**

1. **Alta de `Base reuniones - Digital - Call Center`**
   (`12b0v67FbxjuIndK7DgVU3MYxx-k0yBIS9gtyV45rFaY`): fila en `BASES`, sus `SOLAPAS` con
   `fila_encabezado: 2` y su `campo_id_cuenta`, y las filas de `MAPEO` que hagan falta.
   `Agenda JM` y `Agenda JM | Post` — la segunda trae alcance, impresiones, clics y visualizaciones
   por plataforma.
2. **El embudo del iceberg contra `Agenda JM`**, con **`REVISAR` cuando el bloque venga en cero**
   (`C-58`). Un cero ahí sería una afirmación falsa: la fila de `3387` declara 0 en Call Center con
   todo lo demás cargado.
3. **Los `enc_*` de Call Center** por la fuente que haya quedado legible en la Parte A.
4. **`enc_impresiones`, `enc_clics`, `enc_visualizaciones`**, que ya tenían operación confirmada y
   estaban bloqueados sólo por el mecanismo.
5. **Lo que no se cablea, y se dice en el reporte:** `enc_alcance` sigue en `—` mientras la regla de
   `digital/Alcance` esté abierta, y los `cc_*` agregados de las láminas 2 y 5 siguen bloqueados por
   otro motivo — sin fecha en `looker/CC` no hay con qué acotar la semana.

---

## Parte D · Dos corridas

**Modelo: Sonnet. Effort: normal.**

Una corrida de julio 24–30/07 y una de `junio_sem2` 12–18/06. **Una por vez** — dos ejecuciones
sobre la misma planilla se estorban y cualquier tiempo medido así mide las dos.

Leer los dos decks con `diagTextoDeDeck_` y reportar, contra el criterio de aceptación de arriba:

- que la sección repetible **iteró sobre las reuniones del período** — seis pares en julio, tres en
  `junio_sem2`, con barrios disjuntos;
- que M2 aparece;
- que lo que viene de `rdv` está bien: inscriptos, asistentes, barrio y fecha por encuentro;
- qué publica ahora la lámina de encuentro en Call Center e impresiones, cuenta por cuenta;
- los conteos de la corrida con su unidad dicha, y el tiempo de cada una.

**Un commit por parte.** Si una parte no se puede completar, se reporta y se para — no se sigue con
la siguiente.
