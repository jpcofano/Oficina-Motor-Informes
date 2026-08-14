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
