# Dos subagentes: `verificador` y `cableador`

> **Reemplaza al borrador que circuló con el número `_12`**, que colisiona: `_12` es el
> `DISTINCT` de barrios y ya está en el repo. **Ese borrador no se ejecutó y no entra.**
> Cambios respecto de aquél: siete ajustes, marcados `AJ-N` donde tocan.

**Un objetivo.** Crear la configuración de subagentes del proyecto. **Cero `.gs`, ninguna hoja,
ninguna plantilla, ninguna corrida.** Sólo archivos de configuración, dos filas de ruteo y una
sección de runbook.

**Por qué estos dos y no otros.** Salen de los dos modos de falla medidos: premisas falsas que
llegan hasta el prompt —cinco de ocho lo tuvieron— y trabajo repetitivo de alto volumen
(`T2.11`, 125 tokens que son cableado y no motor).

**`AJ-1` · Qué NO es el `verificador`, y va en el archivo, no sólo acá.** Un subagente corre
**dentro** de la sesión de Code, con las herramientas que Code le da y el prompt que Code le
escribe: **hereda sus premisas, no las contrasta.** Baja el costo de atajar una premisa falsa;
**no reemplaza** la verificación desde afuera contra los archivos vivos, que es lo que el
proyecto tiene escrito como principio —el agente que implementa no se verifica solo—. Si esto
no queda en el archivo del subagente, en tres semanas alguien saltea el paso porque *"ya lo
verificó el verificador"*.

---

## Parte 0 — premisas (sólo lectura, reportar y parar)

`0.1` · **Qué hay hoy en `.claude/`.** El repo tiene `settings.json` con reglas de permisos; se
espera que **no** haya `agents/`. **Si ya hay subagentes definidos, no se pisan:** se reporta y
se decide.

`0.2` · **La versión de Claude Code instalada.** El formato —markdown con frontmatter YAML en
`.claude/agents/`— es estable, pero **desde la `v2.1.198` el comando `/agents` ya no abre el
asistente de creación**. Reportar la versión para que el runbook diga la forma que existe hoy.

`0.3` · **`AJ-2` · Qué ve un subagente de este proyecto.** Su ventana **arranca fresca**: el
único canal del padre al subagente es el string con que se lo invoca. **Medir si el `CLAUDE.md`
del proyecto se le inyecta o no.** De eso depende todo el diseño: si no lo ve, "incorporar las
convenciones por referencia" **no funciona** y el archivo tiene que decirle explícitamente qué
archivos abrir. **No asumirlo en ninguno de los dos sentidos: probarlo.**

`0.4` · **Con qué herramienta mide Code hoy** contra las hojas y las plantillas —`tools/`,
`clasp`, o qué—, y **por qué camino escribiría una fila en `MARCADORES`**. Lo segundo importa
más que lo primero: ver `AJ-4`.

`0.5` · **Los diez primeros tokens de `T2.11`.** Del inventario de tokens sin valor: cuántos son
cableado puro —existe la fila en `MAPEO`, falta la de `MARCADORES`— contra cuántos están
bloqueados por datos o por decisiones. **Los dos números.**

`0.6` · **Dónde manda `CLAUDE.md` §7** que se documente la configuración de herramientas del
proyecto. Si no hay fila, decirlo: hay que agregarla.

**Reportar `0.1`–`0.6` y parar.**

---

## Parte A — `.claude/agents/verificador.md`

`A.1` · **`AJ-3` · Sólo lectura, y la garantía es la lista de `tools`, no el texto.** El
frontmatter declara la lista blanca explícita —lectura del repo, búsqueda, y lo que `0.4` diga
que hace falta para medir—. **Sin `Write`, sin `Edit`, sin nada que commitee.** El cuerpo del
archivo lo repite como recordatorio, pero **lo que lo hace cierto es el frontmatter.**

`A.2` · **Qué hace.** Recibe un prompt sin ejecutar y devuelve, por cada premisa:

- **se sostiene** — con la evidencia medida al lado;
- **no se sostiene** — con qué la desmiente;
- **no se pudo verificar** — dicho como tal, **nunca completado con algo verosímil**.

Y además: qué `D-NN` / `R-NN` / `S-NN` podría estar derogando sin querer, y si algo que el
prompt pide **ya está hecho**.

`A.3` · **`AJ-5` · Y una pregunta más, que es la que hoy nos costó el día:** *¿de qué filas sale
este número?* El error de la lámina 5 pasó las tres verificaciones de `A.2` sin despeinarse —el
token tenía fila en `MARCADORES`, el `MAPEO` estaba bien, la fuente tenía filas, el formato era
correcto— y contaba doce figuras en vez de una. **Ninguna verificación del proyecto miraba el
universo.** El `verificador` pregunta, para cada número que un prompt toque: **qué filas entran,
cuál es el denominador, y quién declaró ese recorte.**

`A.4` · **Lo que no hace, y va en su prompt de sistema:** no propone soluciones, no reescribe el
prompt, no decide. **Verifica y reporta. Su valor está en frenar, no en avanzar.**

`A.5` · **La `description` se redacta para invocación explícita, no para auto-delegación.**
Claude lee ese campo para decidir solo cuándo delegar, y acá no queremos eso: se invoca **por
nombre**, y sólo cuando un prompt lo pida. El control queda en el prompt, que es donde vive la
disciplina de este proyecto.

`A.6` · **`AJ-2` aplicado.** El cuerpo cita las convenciones del repo **sin copiarlas** —medir
antes de prescribir, causa contra observación, los snapshots son fotos con fecha, una medición
con dos corridas no es una medición— **y, si `0.3` dice que el subagente no ve `CLAUDE.md`, le
indica leerlo primero, con la ruta.** Una convención citada que el subagente no puede abrir es
una convención que no existe.

`A.7` · **`AJ-1` escrito adentro:** un párrafo que diga que este subagente **no cierra** la
verificación del proyecto, que corre dentro de la sesión que implementa, y que el reporte que
devuelve **no es luz verde** — la luz verde la da el usuario.

## Parte B — `.claude/agents/cableador.md`

`B.1` · **`AJ-7` · Nace bloqueado, y el archivo lo dice.** **No se invoca hasta que el universo
de figura esté cerrado** (`2026-08-07_13_universo_de_figura.md`). Cablear contra una fuente sin
el filtro declarado produce **números plausibles y mal**, que es el modo de falla que el
proyecto persigue, y a diez por lote tarda en notarse. El archivo se crea igual: lo que se
frena es la invocación, no la definición.

`B.2` · **Un token por vez, con condición de corte verificable:**

1. tomar un token de la lista de sin valor;
2. verificar que exista la fila en `MAPEO` para su `(base, solapa, campo_logico)`;
3. si no existe, **parar y reportarlo** — no se inventa el mapeo;
4. si existe, escribir la fila en `MARCADORES` con su `operacion` y su `formato`;
5. verificar; ver `AJ-6` en `B.4`;
6. siguiente.

`B.3` · **`AJ-4` · El camino de escritura no lo inventa el subagente.** `docs/ESCRITORES.md` es
el contrato de quién escribe cada hoja de registro y por qué camino, y su matriz se regenera con
un censo mecánico sobre el código. **El `cableador` escribe por un camino ya declarado, o no
escribe.** Si `0.4` muestra que no hay ninguno, **eso es el hallazgo** y el `cableador` queda en
sólo-propuesta: emite las filas para que las pegue una persona. **Y `ESCRITORES.md` lleva la
fila que corresponda** — un escritor nuevo que no figura ahí es exactamente lo que ese
documento existe para impedir.

`B.4` · **`AJ-6` · La verificación del paso 5 no puede ser una corrida por token.** Una corrida
son ~300 s contra un techo de 350, y `T2.3` todavía no está. **Por token: verificación dirigida
del marcador.** **Por lote de diez: una sola corrida**, y ahí sí se mira `FALTANTES`. Si el
criterio está mal, se descubre a los diez y no a los ciento veinticinco.

`B.5` · **Los cruces obligatorios antes de cablear**, que ya están en el repo y acá sólo se
citan: los `[MANUAL]` y las `[?]` de `CONFIG_INFORMES.md`, las operaciones que el motor tiene
contra la que el token necesita, y `PENDIENTES_consistencia.md` por si ya está anotado como
hueco. **Un token que toca un `[MANUAL]` no se cablea: se reporta.**

`B.6` · **`description` para invocación explícita**, igual que `A.5`. Un subagente que escribe en
`MARCADORES` no arranca porque el modelo lo consideró pertinente.

`B.7` · **No toca `familia_tokens`** — congelado hasta la Fase 4 (`D-23`).

## Parte C — el ruteo y el runbook

`C.1` · Una fila en la tabla de `CLAUDE.md` §7: dónde vive la configuración de subagentes y
quién es su dueño. Si `0.6` muestra que tampoco hay fila para `.claude/settings.json`, **entra
una sola fila que cubra las dos cosas**.

`C.2` · Una sección corta en `docs/RUNBOOK.md`: cómo se invocan, qué hace cada uno, **el aviso de
costo** y **dos hechos operativos**:

- **Los agentes se cargan al arranque.** Un archivo nuevo con la sesión abierta **no existe**
  hasta reiniciarla.
- **`/agents` ya no crea nada** desde la `v2.1.198`: se editan los archivos.

**`AJ-8` · Y el aviso de costo dicho con precisión:** los subagentes **no reparten consumo entre
cuentas**. Corren dentro de la sesión de Code y gastan su cuota; cada uno mantiene su propio
contexto, así que un flujo con varios consume bastante más que una sesión sola.

`C.3` · **Convención nueva, y va donde `CLAUDE.md` mande:** todo prompt declara arriba qué
subagente usa, o dice explícitamente que ninguno. **Sin esa línea, no se invoca ninguno.**

`C.4` · **`AJ-1` · Cómo entra el `verificador` al flujo, escrito en el runbook:** el usuario
recibe un prompt sin ejecutar, se lo pasa a Code, y **antes de la Parte 0 le pide que corra el
`verificador` sobre el archivo**. El reporte vuelve al usuario, no habilita la ejecución. Es el
único paso nuevo del flujo y no cambia nada más.

`C.5` · **No inventar un tercer subagente.** Si aparece la necesidad, se agrega con su propio
prompt.

## Commits

Uno por parte. `git push` después de cada uno.

## Verificación

Se cierra cuando el `verificador` corre sobre un prompt real —`2026-08-07_11_fase2_sellador.md`
sirve— y devuelve el reporte de premisas **incluyendo la pregunta de `A.3`**. **El `cableador`
no corre en esta corrida ni en la siguiente:** está bloqueado por `B.1`.
