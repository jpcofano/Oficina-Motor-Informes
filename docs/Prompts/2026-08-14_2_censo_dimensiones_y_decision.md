# 2026-08-14_2 — Censo de dimensiones y `D-NN` del vocabulario estructurado

> **Estado:** no ejecutado · **reemplaza:** nada · **subagente:** ninguno
>
> **Objetivo único:** dejar decidida y escrita la estructura **medida + dimensión** del
> vocabulario de tokens, después de censar cómo está expresado hoy.
>
> **No migra ningún marcador, no toca ninguna plantilla, no cablea nada, no renombra nada.**
> Es el paso 1 de seis del plan de vocabulario global.

---

## La decisión que hay que fundamentar

El usuario decidió el 14/08 que el vocabulario se estructura como **métricas y dimensiones**,
y que los nombres importan menos que la estructura. La forma que ya tiene el motor del lado de
las medidas —`campo_logico` como medida lógica, `MAPEO` como su traducción a columna física
por base— **todavía no existe del lado de los cortes**: `filtro` es texto libre, distinto por
base, y el corte también vive en el nombre del token.

Medido sobre el snapshot del 11/08, la dimensión "ámbito JM / GCBA" está escrita de **cuatro
formas** según de dónde salga el dato: `figura=Jorge Macri`, `mail_remitente=…`,
`dig_jm_gcba=JM`, `campana~=JM`. Son cuatro implementaciones físicas de un solo corte de
negocio. Ése es el hecho que la decisión tiene que ordenar.

---

## Parte A — censo, **sólo lectura** · modelo: **Sonnet** · effort: alto

**No editar ningún archivo ni ninguna hoja. Termina en reportar y parar.** Todo se mide
contra `MARCADORES` **vivo**, no contra el snapshot: las cifras de arriba son del 11/08 y
sirven de referencia, no de dato.

1. **Qué hay en `filtro`, y qué clase de cosa es cada uno.** Listar toda expresión distinta,
   con cuántos marcadores la usan, y clasificarla en dos montones:
   - **dimensión de negocio** — un corte que alguien del equipo entendería y podría pedir
     ("sólo Jorge Macri", "sólo convocatoria", "sólo Meta");
   - **restricción técnica** — una condición que no es un corte sino una regla de validez de
     la fila (por ejemplo un estado que descarta filas no confirmadas).

   La clasificación es el corazón del censo: sólo el primer montón se vuelve dimensión. **Si
   alguna expresión no cae claramente en ninguno, reportarla aparte en vez de forzarla.**

2. **Agrupar por dimensión lógica.** Para cada corte de negocio, qué expresiones distintas lo
   implementan y sobre qué base cada una. Se espera que el ámbito JM/GCBA agrupe varias; el
   censo dice si hay otras dimensiones igual de dispersas.

3. **Los duplicados por dimensión.** Todo par de marcadores cuya definición —base, solapa,
   `campo_logico`, `operacion`— sea **idéntica** y sólo difiera en `filtro`, y por separado
   todo par que **no difiera en nada**. Los nueve pares `gcba_*` / sin prefijo son el caso
   conocido, y `gcba_pauta_meta` / `pauta_meta` aparecían con la definición completa idéntica,
   filtro vacío incluido. **Confirmar contra la hoja viva y reportar si son los mismos nueve.**

4. **`gcba` no es el informe.** Verificar y dejar dicho en el reporte: los `gcba_*` viven con
   `informe_id = jm`. El prefijo es el ámbito de la campaña, no el informe que la publica.
   Confundirlos al migrar rompería los dos.

5. **La dimensión temporal.** Qué valores tiene `periodo_ref` hoy y cuántos marcadores lo
   usan. Importa porque SECCO repite casi todo JM **con un día de desfasaje**: eso no es otro
   token, es la misma medida con otra ventana, y hay que confirmar que la ventana ya se
   resuelve por informe y no por nombre.

6. **Las colisiones entre informes** se miden sobre las **plantillas y `TOKENS.md`**, no sobre
   `MARCADORES`: `secco` no tiene ninguna fila, así que ahí no hay nada que cruzar. Repartir
   los tokens de las dos plantillas en tres montones — mismo hecho, hecho distinto con el
   mismo nombre, nombre distinto para el mismo hecho. **Los siete `ecv_*` ambiguos deberían
   caer en el segundo; el censo dice si hay más.**

**Reportar y parar.** El reporte **propone** un vocabulario de dimensiones —nombre lógico,
valores posibles, y la expresión física por base— y **no escribe ninguno**.

---

## Gate — decisión del usuario

Con el reporte delante, el usuario define el vocabulario de dimensiones: cuáles son, qué
valores admite cada una, y cuáles de las expresiones de hoy son dimensión y cuáles quedan como
restricción técnica. **La Parte B no arranca sin eso.**

---

## Parte B — escribir la decisión · modelo: **Opus** · effort: alto

1. **La `D-NN` en `docs/PLAN.md`**, con el número verificado como libre contra el destino
   antes de escribirlo. Tiene que dejar dicho:
   - que el vocabulario se estructura como **medida + dimensiones**, y que el corte deja de
     ser parte de la identidad del token;
   - **dónde vive la traducción de dimensión lógica a expresión física por base** — es
     simétrico a lo que `MAPEO` hace con las medidas, y esa simetría es el argumento: si el
     motor ya sabe que una medida se llama distinto en cada base, un corte también;
   - qué pasa con la precedencia entre `informe_id = '*'` y un informe concreto, **o que se
     decide en el paso 2** si el gate no la cierra;
   - **las cifras del censo como medición fechada**, no como enunciado.

2. **Reescribir la regla de `CLAUDE.md`** que hoy dice que los renombres son por `informe_id`,
   nunca globales. No se borra: pasa a ser el régimen de transición —mientras un token no esté
   declarado global, su renombre sigue siendo por informe— y se anota que la premisa original
   se invierte cuando el vocabulario es global. **Es la única edición de `CLAUDE.md` de este
   prompt.**

3. **Anotar los duplicados como deuda**, en `docs/PENDIENTES_consistencia.md`, con el par y la
   diferencia medida. **No resolverlos acá**: `gcba_pauta_meta` y `pauta_meta` con la
   definición idéntica es un número que hoy se publica dos veces, y eso es un caso de
   validación con su propio prompt.

4. **Nada de migración.** Ni una fila de `MARCADORES` cambia en este prompt. Si al escribir la
   decisión aparece que algún marcador queda mal, **se anota en el reporte**.

5. Commit de documentación, separado, y `git push`.

---

## Lo que este prompt **no** hace

- **No migra los 51 marcadores.** Eso es el paso 4, y va después del piloto.
- **No define la sintaxis que se tipea en la plantilla.** Define la estructura; cómo se
  escribe en la caja de la slide sale del vocabulario que fije el gate.
- **No toca los siete `ecv_*` ambiguos.** Los cuenta y los deja anotados como precondición.
- **No implementa precedencia.** Eso es el paso 2 y es código.

---

## Addendum 14/08/2026 — entra desde el `_1`

Estamos en desarrollo y no hace falta mantener dos sistemas andando. Consecuencia sobre este
prompt, anotada al cerrar la Parte B del `_1`:

- **El paso de precedencia entre `informe_id = '*'` y un informe concreto se cae**, salvo que
  se quiera un override explícito.
- **La regla de `CLAUDE.md` se reescribe directo** en vez de quedar como régimen de
  transición, así que el punto 2 de la Parte B se simplifica.

## Addendum — 15/08/2026 · gate resuelto, y tres correcciones al cuerpo

> Se agrega al final de `2026-08-14_2_censo_dimensiones_y_decision.md`, que ya se
> ejecutó hasta el gate. El cuerpo no se edita.

### Correcciones a lo que el cuerpo daba por cierto

1. **`dig_jm_gcba` no aparece en ningún filtro.** El cuerpo lo nombraba como una de las
   cuatro formas del ámbito; existe como columna en `digital/Digital` y sin usarse. La
   cuarta forma real es `nombre_campaña~=JM` en `looker/DIGITAL`. Siguen siendo cuatro
   campos, pero uno es otro. El error salió de leer el snapshot del 11/08.
2. **Los duplicados son siete, no nueve.** Tres pares `pauta_*` / `gcba_pauta_*` con
   definición idéntica y filtro vacío, y cuatro pares `enc_*` / `ivr_*`.
3. **`periodo_ref` está vacío en los 78 marcadores.** La ventana se resuelve entera por
   la cadena de `D-20`, así que el desfasaje de un día de SECCO **no toca el
   vocabulario**. El punto 5 del cuerpo queda cerrado con esa respuesta.

### La línea base de la migración

**`docs/_snapshots/MARCADORES_2026-08-15.tsv`** es el estado del cableado que funciona,
tomado antes de tocar nada. **La `D-NN` lo cita por nombre.** No se crea ningún
mecanismo de backup aparte: sería una segunda copia de lo mismo, y la gracia del
snapshot es justamente que no sale del código que se está migrando.

Cada tanda de la migración se compara contra ese archivo, no contra la corrida
anterior.

---

### El vocabulario, decidido

Tres dimensiones. La expresión física por base va en la `D-NN` con las cuatro formas
medidas:

| dimensión | valores | cómo se implementa |
|---|---|---|
| `ambito` | `jm` · `gcba` | `rdv`: `figura=Jorge Macri` / el resto · `digital/Directa Mail`: por remitente · `looker/DIGITAL`: por nombre de campaña · `looker/resumen_…`: por campaña |
| `plataforma` | `meta` · `google` · `programmatic` | `Plataforma=Meta` / `=Google ads` / el resto, por `R-24` |
| `tipo_envio` | `convocatoria` · `m2` | `mail_tipo` |

**`ambito` aplica en `rdv`**, con el mismo criterio que en las otras tres: `Jorge Macri`
es `jm`, todo lo demás —ministros incluidos— es `gcba`.

**La negación se conserva como implementación, y la `D-NN` tiene que decirlo en voz
alta:** `gcba` es *todo lo que no es `jm`*, no un valor propio. La consecuencia es que
**una fila sin `figura`, sin remitente o sin nombre de campaña cae en `gcba`**, no queda
afuera de las dos. Hoy ya funciona así en las cuatro bases; lo que cambia es que deja de
ser un accidente heredado y pasa a ser una decisión con su nombre. Si alguna vez hay que
distinguir *"es GCBA"* de *"no está clasificado"*, ahí se rompe — y ése es el síntoma
que hay que anotar como límite.

**Las guardas `!=0` y `estado=Activa` no son dimensiones.** Son restricciones técnicas:
las nueve `!=0` son la contracara de `R-18` —descartan filas donde el cero es un
*"Revisar"* disfrazado— y `estado=Activa` nunca aparece sola. Quedan como `filtro`, no
migran a dimensión, y la `D-NN` explica por qué: una dimensión es un corte que alguien
del equipo pediría; una restricción es una regla de validez de la fila.

---

### Los duplicados: tres destinos distintos

**No todos son el mismo problema y no van al mismo lado.**

1. **`looker/DIGITAL/Impresiones/SUMA` — ocho marcadores que sólo difieren en el
   filtro.** Es el caso que justifica el frente entero: una medida × `ambito` (2) ×
   `plataforma` (3, con `programmatic` por resta) da ocho nombres para un solo hecho.
   **Es el piloto**, y va en prompt propio.

2. **Los tres pares `pauta_*` / `gcba_pauta_*` — definición idéntica, filtro vacío en
   los dos.** Esto **no es migración, es un número publicado dos veces**: los dos
   marcadores dan lo mismo y uno de los dos está mal, o los dos lo están y falta el
   filtro. Va a validación con su caso, **no a la migración**. Migrarlos sería
   convertir un error en un error estructurado.

3. **Los cuatro pares `enc_*` / `ivr_*` — dos familias sobre el mismo hecho.**
   `enc_atendidos`/`ivr_atendidos`, `enc_e75`/`ivr_75`, `enc_e75_pct`/`ivr_75_pct`,
   `enc_marque1`/`ivr_marque1`: misma base, misma solapa, mismo campo, sin filtro.
   No es descuido, es **una migración a medio hacer** — `TOKENS.md` ya declara `enc_*`
   como canónico y los `ivr_*` siguen cableados porque las láminas 2 y 5 los usan.

   **Decisión del usuario del 15/08: sobrevive `enc_*`.** Pero **no entra al `_2`**:
   unificar significa renombrar tokens en la plantilla, que es de `C-01`, y arrastra
   las láminas 2 y 5. Va como paso propio **después del piloto**, y se anota en el
   *Planificado y bloqueado* de `PLAN.md` con esa dependencia.

---

### Parte B — qué escribir ahora · modelo: **Opus** · effort: alto

Lo del cuerpo, más lo de arriba:

1. **La `D-NN` en `PLAN.md`** con las tres dimensiones, la expresión física por base, la
   negación declarada con su límite, y **la línea base citada por nombre**.
2. **La regla de `CLAUDE.md` reescrita.** Sin régimen de transición: `S-05` está vivo,
   hay un solo lector y no hace falta mantener dos sistemas.
3. **Los duplicados a sus tres destinos**, con el motivo de cada uno. Los `pauta_*` a
   validación, los `enc_*`/`ivr_*` a `PLAN.md` como bloqueado, el caso de `imp_total`
   como piloto.
4. **Ni una fila de `MARCADORES` cambia en este prompt.** Si al escribir aparece que
   alguno queda mal, **se anota en el reporte**.
5. Commit de documentación, separado, y `git push`.
