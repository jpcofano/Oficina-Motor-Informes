# Pedido — Validar el deck generado, leyéndolo

**Estado:** vivo · **Fecha:** 2026-08-04 · **Ubicación:** `docs/Prompts/2026-08-04_Pedido-2_validar_deck.md`

> **Casi todo es sólo lectura.** No se corrige ningún número, no se edita ninguna base, no se
> toca la plantilla. Se abre el deck que salió, se lee qué quedó escrito, y se compara.
>
> **Por qué ahora.** El informe salió con **17 tokens con valor sobre 195, y 438 instancias en
> `«FALTA»`**. Nadie verificó todavía que esos 17 estén bien escritos ni en el lugar correcto.
> Un token con el valor de otro se ve igual de bien que uno correcto.

---

## Parte 0 — Cuál es el deck vigente. Sólo lectura. Reportar y **PARAR**.

`CORRIDAS` tiene **siete** filas, todas de hoy, con conteos crecientes: 1/194 · 6/449 · 6/449 ·
17/438 · 17/438 · 17/438 · 17/438. La última es `jm-20260804-180308`, deck
`1AU0tkyRQo0kGccnUGJqz0MoEqtiDpy5awYGy8VjTtH8`.

**Nota: eso descarta la sospecha de doble escritura por el reintento de `tools/api.js`.** Siete
`corrida_id` distintos, siete `deck_id` distintos, siete horas distintas y conteos que crecen es
desarrollo, no una llamada ejecutada dos veces. Anotarlo así en `docs/BITACORA.md` y bajar ese
`P1` a observación — **sin sacarlo**: el riesgo del reintento sobre una llamada que escribe sigue
existiendo, sólo que no se manifestó acá.

**0.1** Para cada una de las siete filas, verificar si el `deck_id` **todavía existe y se puede
abrir**. El usuario sacó varios de la carpeta con "Quitar", que los desvincula pero no los borra.
Reportar cuáles siguen accesibles.

**0.2** Confirmar que `1AU0tkyR…` existe, cuántas slides tiene, y que su mapa de `CORRIDAS` se
corresponde con lo que hay adentro.

**Reportar y PARAR.** Si ese deck no existe, decirlo: se regenera, que es correr de nuevo.

---

## Parte A — Qué quedó escrito, token por token

Con el mapa `token → objectId` de la fila `jm-20260804-180308`, abrir el deck y **leer el texto
de cada `objectId`**. Es lo que el mapa existe para permitir.

Producir una tabla: `token · slide · objectId · texto en la caja · estado`.

Tres cosas que hay que poder distinguir, y que la traza de la corrida no distingue:

- **escrito con valor** — hay un número o texto real;
- **`«FALTA:token»`** — el motor lo marcó;
- **el token crudo `{{token}}` sin reemplazar** — eso sería un error del motor, no un dato
  faltante. Si aparece alguno, reportarlo aparte y con prioridad.

Reportar el conteo de los tres, y **verificar que dé 17 con valor**. Si no coincide con lo que
dice `CORRIDAS`, la discrepancia es el hallazgo.

---

## Parte B — Que cada valor esté en la caja que le corresponde

Es el modo de falla que la armonización hizo visible: en la slide 5 las diez cajas estaban
rotadas una posición y en la slide 6 dos estaban cruzadas entre sí. Eso pasó **antes** en la
plantilla; hay que confirmar que no pasa **ahora** en el deck escrito.

Para cada token con valor, verificar que el texto de la **caja vecina** —el rótulo— corresponda
al token. `enc_mails_enviados` tiene que quedar bajo un rótulo de mails, no bajo uno de audiencia.
Reportar cualquiera donde el rótulo y el token no se correspondan.

---

## Parte C — Contra el número verificado

`docs/VALIDACION_2026-07-31.md` tiene `Orden Público 28/07` verificado dígito a dígito:
**753 inscriptos**, y los cinco canales **361 mail · 169 CC · 43 IVR · 180 RRSS · difusión
vacío**.

Buscar en el deck la slide de encuentro que corresponde a Orden Público y comparar. Reportar cada
diferencia con su token. **No corregir nada**: si un número no cierra, el hallazgo es la
diferencia.

---

## Parte D — Los faltantes, agrupados

438 instancias es demasiado para atacarlas de a una. Agrupar la hoja `FALTANTES` **por motivo** y
reportar el top, con cuántas instancias cada uno. La pregunta que tiene que quedar contestada:
**cuántas de las 438 se destraban con una sola cosa.**

Y separar dos casos que se cuentan igual y no son lo mismo:

- tokens de secciones que **se expandieron** —los `enc_*` de las cinco slides de encuentro— donde
  falta el dato;
- tokens de secciones que **no tienen contenido que recorrer**, como las láminas de campaña: hoy
  `CAMPANAS` no tiene ninguna fila de `jm`, así que esas slides no pueden tener número. Ese grupo
  se destraba con una fila curada, no con código.

---

## Parte E — Los números raros, medidos

Sin decidir nada, sólo medir:

- **`enc_mails_enviados` = 110 y `enc_mails_entregados` = 110.** Reportar si en la base son
  efectivamente iguales para esa cuenta o si el despachador está leyendo la misma columna dos
  veces. Es la diferencia entre un dato y un bug.
- **`enc_atendidos` = 6161** contra `enc_marque1` = 67 y `enc_e75` = 2229. Reportar de qué filas
  salen los tres y con qué operación.
- **IVR con `ULTIMO` sobre dos filas.** Reportar cuáles son esas dos filas de la cuenta de Orden
  Público, con sus valores, y qué daría cada token con `SUMA` en vez de `ULTIMO`. **No cambiar la
  operación:** es decisión de negocio del usuario, y el número comparado es lo que le permite
  decidir.

---

## Qué NO hacer

- No corregir ningún número, ni en el deck ni en las bases.
- No regenerar el informe salvo que la Parte 0 muestre que el deck no existe.
- No cambiar `ULTIMO` por `SUMA` en ningún marcador.
- No borrar filas de `CORRIDAS` ni decks.
- No tocar la plantilla.
- Sin trailer `Co-Authored-By`.

**Modelo:** Opus.
