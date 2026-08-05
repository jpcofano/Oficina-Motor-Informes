# Corrida nocturna — Cerrar la sección 1 y dejar las decisiones escritas

**Estado:** vivo · **Fecha:** 2026-08-05 · **v2** · **Ubicación:** `docs/Prompts/Corrida_nocturna_2026-08-05.md`

> **Sobrescribe a la v1 del mismo nombre.** Dos cambios, ninguno toca el punto 1, que ya está en
> curso: **(a)** la partición de los `ecv_` es **10 / 2 / 7**, no 9 / 2 / 8 — corregido por la
> `0bis.1`, y manda la lista, como el addendum previó; **(b)** el punto 2 tiene la respuesta del
> usuario sobre el default de campañas, que antes estaba como pregunta abierta.

> **Mismo modo de trabajo que la corrida del 04/08.** No se pide permiso. Donde un prompt diga
> "reportar y PARAR", se reporta **por escrito en la bitácora** y **se sigue**, salvo los cinco
> límites del final.
>
> **El objetivo de la noche es un informe generado con la sección 1 cerrada** —el agregado semanal
> de encuentros— y con las decisiones del usuario del 05/08 escritas donde viven. No hace falta que
> todo cierre. Hace falta que esté hecho o dicho.

---

## Cómo se trabaja esta noche

**Verificar sigue estando bien; frenar, no.** Si una premisa se cae, la corrección se decide, se
anota y se sigue. Si son dos caminos y ninguno es claramente mejor, se elige el más simple y
reversible, se anota por qué, y se sigue.

**Un commit por pieza que funciona, `git push` después de cada uno.** Si algo se rompe, se arregla
en el commit siguiente, no se revierte la noche.

**Si una pieza se traba, se salta y se sigue con la que viene.** El orden de abajo está pensado para
que trabarse en una no bloquee a las otras. El punto 1 es el único que tiene dependientes.

**Lo que salga mal se escribe y no se esconde.** Un paso que no se pudo hacer, con el motivo, es un
resultado válido. Un paso que se dio por hecho sin correr, no.

---

## Orden de trabajo

### 1 · Cerrar la sección 1 — el agregado semanal `ecv_`

**Prompt base:** `docs/Prompts/2026-08-04_Pedido-4_cerrar_ecv.md`, **con su addendum**
`docs/Prompts/Addendum_2026-08-05_Pedido-4_referencia_viva_y_opcion_C.md`. El addendum sustituye las
Partes A y D; B, C y E quedan como están. **Leer los dos antes de tocar nada** — el addendum cambia
el criterio de cierre y la forma de partir la sección.

La **Parte 0 bis** del addendum se corre igual, pero termina en bitácora y no en parada, salvo su
punto `0bis.2`, que es límite (ver abajo).

**La partición corregida por `0bis.1`, que es la que manda:** **10** de agregado semanal puro
(`ecv_encuentros`, `ecv_barrios`, `ecv_barrio1/2/3` y los cinco `ecv_insc_*_pct`), **2** de encuentro
(`ecv_barrio`, `ecv_poblacion`), **7** ambiguos (`ecv_inscriptos`, `ecv_asistentes` y los cinco
`ecv_insc_*`). Donde la Parte A del addendum dice "los 9", son **10**. Los **7** ambiguos no se
tocan.

Esto es lo principal de la noche. Si sólo sale esto, la noche fue buena.

### 2 · Escribir las decisiones del usuario del 05/08 sobre campañas

Documentación pura, sin código. Va a `docs/CONFIG_INFORMES.md`, que es el dueño de la decisión
editorial por informe. **No crear ningún `.md` nuevo.**

En **§1.1** (que hoy tiene cuatro `[?]` abiertas sobre campañas):

- **La selección es curada por el equipo, sobre las campañas del período de JM**, con la posibilidad
  de agregar o sacar dentro del último mes. El mecanismo ya existe y no hay que construir nada:
  `mostrar = sí/no` más `orden`.
- **Máximo cinco envíos por campaña**, confirmado por el usuario. Con eso `campana_desag_mail` queda
  acotada y **no se construye ninguna lámina extra de desagregados**. Cierra el `P2` que estaba
  abierto.
- **El default editorial son las campañas del período**, decisión del usuario del 05/08. Sobre ese
  default el equipo agrega o saca, dentro del último mes.
- **⚠ Eso no deroga `D-19`, y hay que escribir por qué no.** Son dos reglas de distinto nivel y se
  leen juntas sin conflicto: *"las campañas del período"* dice **qué campañas van** —regla
  editorial—; `D-19` dice **quién escribe la celda `periodo_id`** —regla mecánica—, y la respuesta
  sigue siendo **una persona**. El motor no deduce el período de las fechas de la campaña, porque con
  `R-11` Addendum 1 las ventanas pueden solaparse o dejar hueco. Dejarlo dicho con esas palabras en
  §1.1, para que el default editorial no se lea como permiso para que el motor complete la celda.
  **No tocar `D-19` ni escribir código que asigne `periodo_id`.**
- **La fuente ya estaba resuelta y hay que apuntar a ella, no repetirla:** §4.1 fija Seguimiento
  Digital como fuente de fila para `camp_*`. Dejar el puntero.

En **§2.5**:

- **Los once `camp_resp_*`** (`camp_resp_pos` / `_neu` / `_neg` / `_info` / `_sol`, sus cinco `_pct`,
  y `camp_resp_total`) **quedan diferidos**. Decisión del usuario del 05/08: no van en esta etapa, se
  dejan para el futuro. Marcarlos como diferidos y **no cablearlos**. La `[?]` de "fuente sin
  identificar" deja de ser una pregunta abierta y pasa a ser una decisión tomada.
- **Los tres `[MANUAL]`** —`camp_dig_insight`, `camp_mail_insight`, `camp_resp_insight`— **quedan
  manuales**, confirmado. Los escribe el equipo.
- **`camp_bench_` y `camp_bench_remitente` siguen abiertos.** El usuario no los resolvió. Dejarlos
  marcados como pregunta viva: ¿fijos, o del período anterior? **No cablearlos.**

Con esto, de los ~53 `camp_*` quedan **14 resueltos por decisión** (11 diferidos + 3 manuales), **2
abiertos** (`camp_bench_*`), y el resto con fuente conocida y bloqueados sólo por la falta de filas
en `CAMPANAS`.

### 3 · Addendum al `Pedido-1`, escrito

`docs/Prompts/2026-08-04_Pedido-1_corte_jm_gcba.md` corrió sus Partes 0 y D y paró. Dos de sus partes
quedaron sin objeto y hay que dejarlo asentado en el propio prompt, como addendum al pie —**el prompt
ya se ejecutó, así que no se edita en el lugar**:

- **Parte A, tercera viñeta: cancelada por regla.** `m2/Cuentas` pasó a `uso = ignorar` en `SOLAPAS`
  entre el snapshot del 01/08 y la corrida. Una solapa `ignorar` no se lee ni se mapea
  (`CLAUDE.md` §2). Se leyó antes de saberlo; lo leído queda como nota, no como mapeo.
- **Parte B: inaplicable a mail.** La propagación por `id_cuenta` que declara la Parte B no sirve
  para el remitente, porque **136 de las 880 cuentas con filas de mail mandan desde dos remitentes
  distintos**. El remitente es señal **por envío**, no por cuenta. Para IVR sí aplica: 0 cuentas con
  dos voceros.
- **Lo que queda vivo del Pedido-1:** los tres canales con señal propia —IVR por su columna `Vocero`,
  mail por `Mail remitente` fila a fila, SMS `GCBA` por decisión—, y lo que queda sin ninguna señal,
  que es **CC y la pauta digital**. Eso último es pregunta para el usuario, no trabajo de esta noche.

### 4 · `Pedido-3` — el filtro declarativo JM/GCBA

`docs/Prompts/2026-08-04_Pedido-3_filtro_declarativo.md`, **sin ejecutar**. Correrlo tal como está.

Va **después** del punto 1: si la sección 1 no cerró, esto se hace igual —no dependen entre sí— pero
el orden importa para el reporte.

Su Parte 0 se corre y termina en bitácora, no en parada.

### 5 · Si sobra tiempo — la familia `m2_`

31 tokens sin cablear, sección `m2` en modo `agregado`, no itera, fuente sin ambigüedad según
`MAPEO_completo.md`. Es la familia más grande que se puede cerrar sin depender de nada.

Cablear lo que se pueda contra `m2`, **solapa explícita**, y listar con motivo lo que no. No inventar
ninguna fila de `MARCADORES` cuyo `campo_logico` no exista en `MAPEO`.

---

## Los cinco límites que no se cruzan sin el usuario

Todo lo demás se decide solo.

1. **No se edita ninguna celda de las cuatro bases.** Los datos los cura una persona.
2. **No se edita ninguna plantilla `.pptx`.** La armonización de JM del 04/08 fue una autorización
   puntual y **no se renueva**. En particular: **no se renombra ningún token para desambiguar los
   ocho `ecv_`** — la plantilla es del equipo y el motor se adapta (`C-01`).
3. **No se agrega `seccion_id` a `MARCADORES`.** Es la solución correcta a largo plazo y está
   aceptada como tal, pero se decidió posponerla. Va con su propio prompt.
4. **No se deroga ni se reescribe una `R-NN`, `D-NN`, `S-NN` ni `C-01`.** Si una estorba —y `D-19`
   probablemente estorbe en el punto 2— se anota el conflicto en `PENDIENTES` y se sigue por otro
   lado.
5. **Si `0bis.2` encuentra que `MARCADORES` ya tiene filas de familia `ecv`, ahí sí se para el punto
   1.** Significa que una persona cableó en el medio y este prompt está escrito contra otra base.
   Listar las filas, no tocarlas, y **saltar al punto 2**. La noche sigue.

Y lo de siempre: **no se ajusta ningún número para que cierre**, y **no se reescribe historia de git**
ni se borra nada curado por una persona.

---

## El reporte de la mañana

Corto, en este orden:

1. **La sección 1: ¿cerró?** Cuántos de los 9 tokens quedaron cableados, y los números de la corrida
   con su hora — marcados como medición, no como referencia.
2. **La diferencia entre `ecv_inscriptos` y la suma de los cinco canales**, con las filas que la
   explican, una por una.
3. **¿Los agregados salen una vez o cinco?** Es el control que dice si la Parte A funcionó.
4. **Qué quedó escrito en `CONFIG_INFORMES.md`** y qué preguntas quedaron abiertas ahí.
5. **Qué se trabó, con el motivo**, y qué haría falta para destrabarlo.
6. **Qué decisiones tomaste solo y por qué.** La lista más importante: es donde el usuario puede
   desandar algo.
7. **Los números que salieron raros.** Sin analizarlos.

Sin trailer `Co-Authored-By`.

**Modelo:** Opus.
