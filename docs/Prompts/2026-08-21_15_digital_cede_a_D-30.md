# Paso 2026-08-21_15 — La rama de `digital` cede cuando la solapa declara `campo_id_cuenta`

**Estado:** no ejecutado.
**Reemplaza:** nada.
**Toca:** `Generador.gs`, `docs/PLAN.md` (`D-30`), `Panel.html` o `PanelBackend.gs`.

---

## Contexto — el bug, medido

Los 24 `u1_` salieron `---` en la corrida `194602`. `FALTANTES` dice:

```
«FALTA:u1_total_impresiones@solapa_digital_desconocida» — "CAMPAÑAS_DESGLOCE_DIGITAL"
no es una de las solapas de canal que une el Paso 2.4
```

La causa está en `datosDeMarcador_` (`Generador.gs`): la rama `fila.base_id === 'digital'`
está **antes** que la rama por cuenta declarativa de `D-30`. La solapa declara
`campo_id_cuenta = des_id_cuenta` en `SOLAPAS`, pero nunca llega a la rama que lo lee. El
propio comentario de la rama declarativa lo dice: *"Las solapas de `digital` nunca llegan
hasta acá — la rama de `digital` de más arriba las atrapa"*.

**Se descartó** agregar la solapa a `SOLAPAS_CANAL_DIGITAL_`: la metería en la unión, que es
otra pregunta (unión de canales por cuenta), y esta solapa tiene grano
`campaña × plataforma`, no `cuenta`.

⚠ **Esto deroga una cláusula escrita de `D-30`** — su "Qué NO cambia" dice que las dos ramas
cableadas siguen primero y sin tocar. Por eso la Parte C no es opcional.

---

## Parte A — verificación de premisas · **Sonnet** · sólo lectura · reportar y parar

Nada de esto escribe. Medir, reportar, **parar**.

**A.1 · El orden de las ramas.** En `datosDeMarcador_`, confirmar que la rama
`base_id === 'digital'` está antes que la rama declarativa de `D-30`, y que dentro de la
primera el fallo `@solapa_digital_desconocida` se emite **después** de la guarda de
`SOLAPA_MAESTRA_DIGITAL_` y del lookup en `SOLAPAS_CANAL_DIGITAL_`. Reportar las cuatro
posiciones relativas, sin citar números de línea como dato.

**A.2 · Alcance real del cambio.** Sobre la hoja `SOLAPAS` viva: listar **todas** las filas
con `base_id = digital` que tengan `campo_id_cuenta` no vacío. La hipótesis es que es
exactamente una (`CAMPAÑAS_DESGLOCE_DIGITAL`). Si son más, **parar y reportar**: el cambio
deja de tener alcance 1 y hay que volver a decidir.

**A.3 · La intersección peligrosa.** Confirmar que ninguna de las cinco solapas de
`SOLAPAS_CANAL_DIGITAL_` (`Digital`, `Directa Mail`, `Directa SMS`, `Directa IVR`,
`Alcance`) ni `SOLAPA_MAESTRA_DIGITAL_` declara `campo_id_cuenta`. Si alguna lo declarara,
el `if` de la Parte B le cambiaría el camino a marcadores hoy validados — **parar**.

**A.4 · Qué pasa hoy sin ítem.** Confirmar contra el código que, tal como está, un marcador
de una solapa que declara `campo_id_cuenta` emitido **sin** `id_cuenta` **no falla**: cae a
la rama general y publica el agregado, con el aviso en `origen`. Reportar el texto exacto
del aviso. Es la premisa de la Parte C.2.

**A.5 · Los dos `u1_*_alcance`.** Sobre `MARCADORES` viva, reportar las filas
`u1_pre_meta_alcance` y `u1_post_meta_alcance`: `solapa`, `campo_logico`, `operacion`,
`dimensiones`, `filtro`. Reportar además qué campos lógicos tiene mapeados
`digital/Alcance`, y sobre qué pares `base|solapa` sabe expresarse `DIMENSIONES_.etapa`.
**No cablear nada acá.** Es una medición para una decisión del usuario.

**A.6 · El testigo de `D-31`.** Contar cuántas de las filas de `MAPEO` de
`digital/CAMPAÑAS_DESGLOCE_DIGITAL` tienen `encabezado` vacío. Reportar el número. No
llenarlo.

**Reportar y parar.**

---

## Parte B — el `if` · **Opus** · effort alto

Sólo si A.2 y A.3 confirmaron alcance 1.

En `datosDeMarcador_`, dentro de la rama `base_id === 'digital'`: **antes** de emitir el
fallo `@solapa_digital_desconocida`, y **después** de la guarda de la maestra y del lookup
de canal, ceder a la rama declarativa cuando la solapa declare `campo_id_cuenta`.

Reglas del cambio:

1. **Ceder, no fallar y no adivinar.** Si la solapa no es de canal, no es la maestra, y
   **declara** `campo_id_cuenta`, la rama de `digital` no resuelve: deja seguir. El fallo
   `@solapa_digital_desconocida` **se conserva** para las solapas que no declaran nada — es
   el que avisa de una solapa de `digital` que nadie configuró.
2. **La rama de la unión no se toca.** Las cinco solapas de canal y la maestra siguen
   exactamente por donde venían. A.3 es lo que lo garantiza.
3. **El agregado global de `digital` sin `id_cuenta` tampoco se toca.**
4. **El `origen` tiene que decir por dónde salió.** Después del cambio, un `u1_` resuelto
   debe reportar la rama por cuenta declarativa con la cuenta y el conteo de filas, no la
   unión. Es lo único que distingue "salió bien" de "salió plausible".

**Control positivo, obligatorio.** Un test que fije el ruteo por solapa: una solapa de
canal va a la unión, una solapa de `digital` que declara `campo_id_cuenta` va a la rama
declarativa, y una solapa de `digital` que no declara nada **sigue fallando** con
`@solapa_digital_desconocida`. Los tres asertos, no dos.

Commit propio.

---

## Parte C — la documentación · **Opus** · effort alto

Dos cosas, en `docs/PLAN.md`, como **addendum fechado a `D-30`** (no se edita el texto
original — `CLAUDE.md` §7).

**C.1 · La cláusula que este paso deroga.** El "Qué NO cambia" de `D-30` dice que las dos
ramas cableadas siguen primero y sin tocar. Ya no es cierto para `digital`. Escribir qué
condición exacta la hace ceder y por qué el orden entre las otras dos no cambia.

**C.2 · La derogación del 19/08 que nunca se escribió.** `D-30` punto 3 dice *"Sin
`id_cuenta`, falla; no cae a leer la solapa entera"*. El código hace lo contrario desde el
19/08 y **eso vive sólo en un comentario de código** — grepeado: no está en `PLAN.md`, ni
en `PENDIENTES_consistencia.md`, ni en `BITACORA.md`. Escribir la derogación con su fecha,
citando el aviso que A.4 reportó como la contención.

⚠ **Y decir la consecuencia nueva, que es de este paso:** después de la Parte B,
`CAMPAÑAS_DESGLOCE_DIGITAL` pasa a ser la primera solapa que llega a esta rama **y** puede
emitirse sin ítem. Un `u1_` fuera de una lámina de encuentro publicaría la suma de todas
las cuentas de la solapa — grande, plausible y equivocada. Anotarlo en
`docs/PENDIENTES_consistencia.md` como riesgo abierto, sin arreglarlo acá.

Sin Parte B verde, esta parte no corre.

---

## Parte D — `[object Object]` en el panel · **Sonnet**

`panel_generar` devuelve `periodo` como objeto y el front hace `esc(r.periodo)`. Se ve
`[object Object] · corrida jm-…`.

Arreglar **del lado que corresponda según quién es dueño del formato de `periodo`** —
medirlo primero, no asumir que es del front. Reportar cuál era y por qué.

Es cosmético y está en el camino del usuario, que es el que se va a recorrer ahora. Commit
propio, separado de B y C.

---

## Fuera de alcance, dicho para que no se cuele

- **Los dos `u1_*_alcance`.** A.5 los mide; no se tocan sin decisión del usuario.
- **Los seis `u1_bench_*`, `u1_total_alcance` y `u1_total_frecuencia`.** Son los ocho
  `/////` deliberados.
- **Los 49 crudos de las láminas escondidas.** Documentados, decisión pendiente.
- **La duplicación de láminas de M2 escondidas.** Es nueva y no se diagnosticó todavía.
- **Llenar el `encabezado` de `MAPEO`.** A.6 lo cuenta; el alta es otro paso.
