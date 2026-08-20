# 2026-08-20_4 — SECCO deja de estar vacío: el vocabulario compartido y los `emin_*`

> **Estado:** no ejecutado · **reemplaza:** nada · **subagente:** ninguno
>
> **Objetivo único:** que los marcadores que sirven a los dos informes lo declaren con
> `informe_id = '*'`, y que `ministros` publique.
>
> ⚠ **Este prompt hace que SECCO empiece a publicar números.** Hasta hoy su deck sale entero en
> hueco: `MARCADORES` tiene 87 filas y **las 87 dicen `jm`**.

---

## Lo que ya está resuelto y no se rediscute

**El mecanismo existe y funciona.** `resolverMarcadores` filtra con
`suyo === informeId || suyo === '*'`, y el censo de cobertura hace lo mismo. **No hay que decidir
arquitectura ni construir nada:** hay que poner `*` donde corresponde.

`D-33` addendum 1 ya declara la consecuencia y hay que citarla, no redescubrirla: **un token
compartido va a dar números distintos en `jm` y en `secco`, y los dos van a estar bien** — la
ventana es propiedad del informe, no del token.

**Decisiones del usuario, 20/08/2026:**

- **`ministros` es de SECCO.** `jm` no lo lleva.
- **`jm` tiene dos láminas de agregados que `secco` no tiene** (las 2 y 3: el acumulado `jm` y el
  `gcba`). Sus marcadores **se quedan en `jm`**.
- ⭐ **El universo de `ministros`: todo lo que NO es JM, con `STATUS = Realizada`, desde `rdv`,
  filtrando por `figura`.**

---

## Parte 0 — medir. Sólo lectura. **Reportar y parar.**

> **Modelo: Sonnet · effort alto.**

1. ⭐ **El censo de tokens de la plantilla de `secco`**, por lámina, con el mismo instrumento que
   dio el de `jm` el 20/08 (171 sin fila de 285 leídos, 24 láminas). **Sin este censo no se puede
   escribir una sola `*`.**
2. ⭐ **La intersección**: qué tokens están en las **dos** plantillas. Reportar tres listas —
   sólo `jm` · sólo `secco` · en las dos— y, para los de la intersección, **en qué lámina cae en
   cada plantilla**.
3. **Los `emin_*` de `secco`**: cuáles son, en qué lámina, y confirmar contra `MARCADORES` que
   **ninguno tiene fila**. Reportar también si existe `emin_lista` y de qué tipo parece ser
   (lista de nombres vs. número).
4. **`SECCIONES.ministros`**: `informes`, `modo`, `familia_tokens`, `itera_sobre`. Al 20/08 es
   `SECCO`, `agregado`, `emin_`, `itera_sobre` vacío. **Confirmar contra la hoja viva.**
5. **La lámina de `rrss_*` de `jm`** —21 tokens sin fila, la que el censo del 20/08 numeró 23—:
   reportar **si está escondida** y su título real. ⚠ **No confundirla con la de `secco`**: son
   dos láminas distintas con el mismo prefijo, y el repo ya tiene medido que reclamarlas juntas
   sale mal.
6. **El estado de `rdv`** para lo que `ministros` necesita: que `figura` y `status` estén mapeados,
   y que la lista blanca `status = Realizada` siga declarada en `MAPEO` (`D-21` addendum 1).
   Reportar cuántas filas quedan con `figura != Jorge Macri` y `status = Realizada`.

**Reportar todo junto y parar.** ⛔ No escribir una sola celda en esta corrida.

---

## Parte A — las filas que pasan a `*`

> **Modelo: Opus · effort alto.** Mueve números publicables en dos informes a la vez.

### La regla, y se aplica token por token contra la medición de la Parte 0

**Pasa a `*` un marcador cuyo token existe en las dos plantillas Y mide el mismo hecho.**

⛔ **Mismo nombre NO alcanza, y hay un caso medido en contra:** `rrss_` vive en `jm` en el Resumen
Ejecutivo (Sentiment) y en `secco` en Interacción positiva en RRSS — **secciones distintas**.
Declararlo compartido reclama las dos. Es el mismo modo de falla que rompió `enc_audiencia` con un
renombre global, y el mismo que `familia_tokens` ya tiene documentado con `post_`.

**Tres exclusiones, decididas y no negociables en este prompt:**

1. **Los marcadores de las láminas 2 y 3 de `jm`** —los agregados `jm` y `gcba` que `secco` no
   tiene— **se quedan en `jm`**. La regla los excluye sola si sus tokens no están en la plantilla
   de `secco`; **si alguno apareciera igual, se reporta y no se toca**.
2. **Todo token que caiga en secciones distintas en cada plantilla se queda como está**, con su
   fila en el reporte. **La lista de éstos es una salida del prompt**, no un residuo.
3. **Un token que en una plantilla está en una lámina escondida no pasa a `*` por eso solo** — se
   reporta y se decide aparte. Esconder no es lo mismo que no existir.

### ⭐ Los dos controles, y el primero por sí solo no sirve

| # | control | qué prueba |
|---|---|---|
| 1 | **los 87 valores de `jm` idénticos**, testigo antes y después, misma sesión | que no se rompió nada |
| 2 ⭐ | **`secco` pasa de 0 marcadores resueltos a N**, con N declarado antes de correr | **que el cambio se aplicó** |

⚠ **El control 1 daría verde tanto si el cambio se aplicó como si no.** Es exactamente la regla
del 19/08 —*un testigo que no mide el cambio no es testigo del cambio, por más que dé verde*—. **El
que distingue es el 2**, y por eso N se escribe **antes** de la corrida, derivado de la Parte 0.

**El testigo de `jm` se toma en la misma sesión, con minutos entre tomas.** Es la metodología que
cerró las tandas 2 y 3: la pregunta no es si la base está quieta, es si se mueve dentro del
intervalo.

⛔ **No se renombra ningún token.** Un renombre es de `C-01` y arrastra las plantillas.
⛔ **No se toca `familia_tokens`.** Sigue congelado hasta la Fase 4 (`D-23`).

---

## Parte B — los `emin_*`

> **Modelo: Opus · effort alto.** Es cableado nuevo que publica.

**El universo, declarado por el usuario y traducido al vocabulario que ya existe:**

```
base_id      rdv
dimensiones  ambito=gcba
filtro       (vacío)
```

⭐ **`ambito=gcba` ya significa exactamente lo que el usuario pidió.** `D-33` lo define como *todo
lo que no es `jm`*, por negación, y en `rdv` la expresión física es `figura != Jorge Macri`. **No
se escribe un filtro nuevo**: el corte ya está en el vocabulario, y ésta es la primera vez que la
migración se cobra sola.

⭐ **`STATUS = Realizada` tampoco se escribe.** Ya lo aplica `leerFuente` por la lista blanca de
`D-21` sobre `rdv/status`, declarada el 03/08. **Escribirlo en `filtro` sería filtrar dos veces por
lo mismo** — el problema que `T2.9.4` está pendiente de retirar en `Union.gs`, y no hay que crear
uno nuevo. ⚠ **Confirmarlo con la Parte 0 punto 6 antes de escribir**: si la lista blanca no
estuviera declarada, esta afirmación se cae y el alta se detiene.

**El alta sigue `D-33` addendum 2:** el corte va en `dimensiones`, nunca en `filtro` ni en el
nombre. `filtro` queda para guardas técnicas, y acá no hay ninguna.

**Lo que este prompt NO resuelve y deja anotado:** la `[?]` de `CONFIG_INFORMES.md` §2.4 sobre
`emin_lista` —si es una lista de nombres o un conteo—. **Si la Parte 0 muestra que `emin_lista`
necesita una operación que no existe** (`LISTA` sobre nombres, o un `DISTINCT`), **ese token queda
sin cablear y se reporta**, no se le inventa una operación. Los demás `emin_*` entran igual.

---

## Parte C — verificar

> **Modelo: Sonnet · effort medio.**

1. Los dos controles de la Parte A, con el 2 leído **antes** que el 1 en el reporte: si `secco`
   sigue en 0, nada de lo demás significa nada.
2. **Una corrida de `secco`** después del cambio, y el conteo de marcadores resueltos contra el N
   declarado. ⚠ **La corre el usuario**; el prompt deja el instrumento y el número esperado.
3. `node tools/listas.js` pasa · snapshots de `MARCADORES` versionados antes y después.
4. **El catálogo se regenera** (`tools/catalogo.js`) — es parte de cerrar, no una tarea aparte.

---

## Parte D — la documentación

> **Modelo: Sonnet · effort medio.**

1. **`docs/PLAN.md`** — la `*` deja de ser un mecanismo sin uso. Se anota **cuántas filas quedaron
   en cada estado** (`jm` · `secco` · `*`) y **la lista de los que no pasaron por caer en
   secciones distintas**, que es la salida más valiosa de este prompt.
2. **`docs/CONFIG_INFORMES.md` §2.4** — el universo de `ministros` queda escrito con su dueño y su
   fecha. La `[?]` de `emin_lista` se actualiza con lo que la Parte 0 midió.
3. `docs/BITACORA.md`, `docs/TOKENS.md` si algún token cambia de alcance.

## Lo que este prompt **no** hace

- ⛔ No renombra ningún token ni toca las plantillas.
- ⛔ No toca `familia_tokens`.
- ⛔ No esconde ni muestra ninguna lámina.
- ⛔ No inventa operaciones para los tokens que no las tienen.
