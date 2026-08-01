# DOC-6 — Una sola fuente de verdad: catálogo, plan y decisiones

**Estado:** vivo · **Fecha:** 2026-08-01 · **Ubicación:** `docs/Prompts/DOC-6_plan_y_fuente_unica.md`

> **Este prompt no toca código.** Ni un `.gs`. Mueve texto, deduplica reglas y escribe un
> plan que hoy no existe en ningún archivo. Todos sus commits son de documentación.
>
> **Un commit por parte. Se para al final de cada parte y se avisa** (`CLAUDE.md` §4.1).
>
> **La Parte A es sólo lectura y se reporta antes de tocar nada.** Si el censo contradice
> lo que dicen las partes siguientes, la discrepancia es el hallazgo y se pregunta.

---

## Por qué ahora

El plan de trabajo real vive hoy en el `§6 Cola de trabajo` del handoff de claude.ai — el
artefacto más volátil del repo, que se reemplaza cada sesión. Cada reemplazo recopia la
cola a mano y pierde el *porqué* del orden. `PROYECTO.md` se declaró alguna vez como "el
único doc que se actualiza" y no se cumplió: vive en una carpeta llamada *Plan Inicial* y
nadie la abre a mitad de proyecto.

`CLAUDE.md`, en cambio, se lee en cada corrida. Ese es el motivo mecánico por el que se
mantiene vivo y `PROYECTO.md` no. **El archivo que se mantiene verdadero es el que alguien
lee obligatoriamente.**

Pero `CLAUDE.md` ya tiene 225 líneas y la convención recomienda no pasar de ~200: un
archivo inflado entierra las reglas que importan. Así que el plan **no va adentro de
`CLAUDE.md`**: va a un archivo propio, y `CLAUDE.md` lo declara en su catálogo. Un lugar
para cada cosa no significa un archivo para todo — significa que ninguna cosa está en dos.

**Archivo nuevo: uno solo, `docs/PLAN.md`.** No se crea ningún otro.

---

## Parte A — Censo de enunciados normativos (sólo lectura)

Antes de mover nada, saber dónde están las reglas hoy.

**A.1** — `grep` sobre todo `.md` **vivo** (excluir `_archivo/` y `docs/Sesiones/`)
buscando enunciados normativos: `siempre`, `nunca`, `no se debe`, `hay que`, `obligatorio`,
`regla`, más los patrones `R-[0-9]{2}` y `S-[0-9]{2}`.

**A.2** — Salida en una tabla `enunciado → archivo:línea → ¿está también en otro archivo?`.

**A.3** — Reportar y **parar**. No deduplicar todavía.

El criterio para la Parte siguiente: **un duplicado se resuelve borrando uno, no
sincronizando los dos.** Donde una regla aparezca dos veces, queda la del archivo dueño y
la otra se reemplaza por un puntero de una línea. Si esta parte termina con "mantenerlos
alineados", falló.

---

## Parte B — Auditoría de IDs `R-` / `S-`

Hallazgo ya verificado desde afuera, para confirmar y arreglar:

`docs/Prompts/Paso-2.10_anclar_a_numeros_verificados.md` define tres reglas con números que
hoy significan otra cosa en `docs/REGLAS_NEGOCIO.md`:

| en el prompt 2.10 | en `REGLAS_NEGOCIO.md` |
|---|---|
| `R-03` · el agregado suma universos de JM y aperturas de JM+GCBA | **`R-05`** |
| `R-04` · el `id_cuenta` manda | **`R-06`** |
| `R-05` · `fecha_corte` es obligatoria | **`R-07`** |

Se renumeró `+2` al consolidar y el prompt quedó con la numeración vieja. Hoy `R-04` apunta
a dos reglas distintas según qué archivo se abra. `docs/Prompts/Paso-2.4.md:22` define
`R-04` de forma **consistente** con el canon — ése no es el problema.

`docs/BITACORA.md` tiene ~20 citas de estos IDs: hay que verificar si alguna quedó con la
numeración vieja.

**B.1** — Confirmar el conflicto contra los archivos.

**B.2** — Los prompts ya ejecutados **no se editan** (están congelados). Se les agrega una
**nota de equivalencia** al pie: *"Los IDs `R-03`/`R-04`/`R-05` de este documento
corresponden a `R-05`/`R-06`/`R-07` del canon vigente (`docs/REGLAS_NEGOCIO.md`).
Renumerados al consolidar; este texto no se modifica."*

**B.3** — En `docs/REGLAS_NEGOCIO.md`, dejar escrita la causa: la regla de ID estable ya
estaba, pero los prompts congelados quedaron fuera del alcance de la consolidación que
renumeró. Es el mismo criterio de un ADR: **una decisión no se edita, se supersede.**

**B.4** — Corregir las citas de `BITACORA.md` que hayan quedado con la numeración vieja,
**sólo si son citas** (no reescribir entradas históricas: agregar la equivalencia entre
paréntesis).

---

## Parte C — `docs/PLAN.md` (archivo nuevo)

Encabezado con estado `vivo`. Cuatro secciones, y **la frontera entre las tres últimas es
lo que hace que el archivo sirva**: `Próximo` es una lista ordenada con dependencias;
`Planificado y bloqueado` nombra qué destraba cada ítem y de quién depende; `Backlog` no
tiene orden ni fecha. La prueba para saber en cuál va algo: *si no podés decir qué lo
desbloquea, es backlog.*

Regla del archivo, arriba de todo: **una entrada es una línea o un párrafo corto. Si
necesita más, el detalle va a `docs/BITACORA.md` y acá queda el puntero.**

### C.1 — Decisiones de arquitectura

IDs `D-NN`, estables, **nunca se reutilizan**. Una decisión no se edita: se supersede con
una nueva que la cita. Mismo criterio que `R-` y `S-`.

Texto a escribir, tal cual (decidido en sesión del 01/08/2026):

- **`D-01` — La extensibilidad es una métrica, no una puerta.** El objetivo final es
  agregar un informe o una base sin tocar `.gs`. No es criterio de aceptación hoy. Cada vez
  que se agrega uno, se anota **qué código hubo que tocar y por qué**; esa lista de "por
  qué" es la hoja de ruta hacia el objetivo. El número baja o no baja, y eso se ve.
- **`D-02` — Dos cuentas, dos roles.** `reporteseinformesgcba` ejecuta el motor;
  `jpcofanogcba1` es dueño del script y de la planilla de control. **Consecuencia dura:**
  un script *bound* corre con la identidad de quien toca el menú, así que
  `reporteseinformesgcba` necesita lectura sobre las cuatro bases. Hoy la cuenta que pasa
  esa barrera es `jpcofanogcba1` (`BITACORA.md:708`). Dos bases son de terceros, así que el
  pedido tiene demora y arranca ya.
- **`D-03` — Reportes es dueño de todo lo que un humano abre.** Plantillas (ya lo es) y
  salidas. `carpeta_salida` apunta hoy a una carpeta de `jpcofanogcba1` y está sin usar:
  se repunta antes de que el Paso 4 genere el primer deck. `jpcofanogcba1` es dueño del
  motor, nada más.
- **`D-04` — El panel es web app (`doGet`), no barra lateral.** Un script bound a la
  planilla de control no puede abrir una barra lateral dentro de una presentación. Una sola
  superficie HTML, alcanzable desde un link en cualquier lado, incluida la lámina.
- **`D-05` — Corridas a demanda.** No hay generación programada del informe. Lo único que
  tiene sentido programado es el chequeo previo de `D-09`.
- **`D-06` — Generación en dos etapas.** *Etapa 1 (ahora):* copia de plantilla, reemplazo
  de tokens, deck nuevo por corrida, **y se guarda la configuración con la que se armó**.
  *Etapa 2 (bloqueada):* actualizar el mismo deck respetando lo escrito a mano. Reemplazar
  por búsqueda de texto sólo funciona una vez —cuando `{{ecv_total}}` pasa a ser "1.234",
  el token deja de existir—, así que la etapa 2 exige escribir por `objectId` y por lo
  tanto el mapa `token → objectId` que la etapa 1 registra al crear el deck.
- **`D-07` — La configuración de una corrida es un insumo editable, no un log.** Se abre,
  se agrega una reunión, se vuelve a correr. El registro de qué valores tomó cada token es
  otra cosa (traza) y se deriva de ésta, no al revés.
- **`D-08` — La curaduría se guarda por período.** `CAMPANAS` y `REUNIONES` ganan
  `periodo_id` como clave foránea a `PERIODOS`. Hoy no la tienen y el propio código las
  declara *"curada a mano, cambia cada semana"* (`Instalar.gs:1965`): sin clave de período,
  la curaduría de esta semana pisa la anterior y volver a correr un período pasado devuelve
  otro resultado, sin fallar y sin avisar. `ESCRITORES.md` confirma que `CAMPANAS` tiene
  **cero escritores**, así que el cambio no toca código.
- **`D-09` — Régimen de selección declarado por sección, no por informe.** Hay dos
  regímenes conviviendo: **por período** (la fila entra si su fecha cae en la ventana) y
  **por temario** (el universo lo define una lista curada y la fecha no decide — `R-02`).
  JM tiene los dos: reuniones por temario, `m2_*` por ventana. El régimen se deriva de
  `SECCIONES.itera` — si la sección itera sobre una hoja curada, su universo sale de ahí.
  El caso **mixto** (curada y además con ventana propia, que es lo que hace `CAMPANAS` con
  `desde`/`hasta`) queda nombrado, no como excepción tácita. `MAPEO`/`modo_periodo` sólo
  aplica a las secciones de período.
- **`D-10` — Cuando al motor le falta una definición, pregunta, guarda la respuesta y no
  vuelve a preguntar.** Es viable porque no hay corridas desatendidas (`D-05`). La
  respuesta se persiste en `SECCIONES`; si vive sólo en el momento de la corrida, la misma
  sección puede salir por temario esta semana y por período la próxima sin dejar rastro.
  Mismo criterio que `«FALTA»` —no romper, exponer— pero para configuración en vez de datos.
- **`D-11` — Chequeo previo de estructura antes de correr.** Cada fila de `MAPEO` tiene que
  resolver contra una columna que existe hoy en la base viva. Las bases son de terceros y
  cambian sin aviso. Precondición: arreglar antes el P2 de `Fuentes.gs:117`
  (`getSheets()` crudo sin `usoSolapa_()`), o el chequeo va a avisar sobre solapas
  marcadas `ignorar`.
- **`D-12` — Hoja `FALTANTES`, se pisa en cada corrida.** Los `«FALTA:token»` quedan hoy en
  la lámina y nadie los agrega. Hoja en la planilla de control con base, solapa y campo,
  para atacarlos de a uno. Sin historial por ahora.
- **`D-13` — Los números congelados se comparan contra un período cerrado, no contra la
  semana viva.** Las métricas derivan legítimamente: en M2, aperturas y clics siguen
  creciendo después del envío y sólo `Enviados` se congela. Un control que grita todas las
  semanas se ignora en tres. Se construye en el Paso 4, y el insumo es la configuración
  guardada de `D-06`.
- **`D-14` — Orden del plan: motor → panel → automatización.** La dependencia es dura, no
  heredada: la selección de campañas es curada a mano porque los nombres son inconsistentes
  entre fuentes, así que una corrida programada no puede decidir qué campañas entran. La
  automatización depende del panel; el panel no depende de la automatización.

### C.2 — Próximo (ordenado, con dependencias)

1. **Cerrar el Paso 1.8.** Commit de cierre con el `✅` y la bitácora. Verificado que nunca
   entró: `fd58902` toca sólo los seis docs de C.2-7.
2. **Tramo 1 — cerrar configuración.** Sale cuando el diff da cero ruido.
   - Pedir acceso de `reporteseinformesgcba` a las cuatro bases (`D-02`) — **arranca ya**,
     depende de terceros.
   - Abrir el P1 del tercer escritor de `MAPEO` (`consolidarMapeoLooker_`,
     `Solapas.gs:455-456`), que además escribe `BASES.hoja_default` y seis celdas de
     `SOLAPAS` desde un ítem de menú.
   - `Paso-2.12` Parte 2 — las 17 disposiciones de `SOLAPAS.uso`. Las diez líneas
     `protegida (habría cambiado)` son la lista de trabajo y son todas de `SOLAPAS`.
   - Generalizar `hayUi_()` — desbloquea correr el protocolo entero por API.
   - `periodo_id` en `CAMPANAS` y `REUNIONES` (`D-08`).
   - Repuntar `carpeta_salida` a reportes (`D-03`).
   - **Registrar M2** con los parámetros validados el 01/08: `modo_periodo` de `snapshot` a
     `filtrar`, `fecha_periodo` → `Fecha envio` de la solapa `Directa mail`, y excluir
     `Estado = Proyectado`. Es la **primera medición de `D-01`** (eje "base nueva").
     *Predicción a anotar antes de correrla:* las dos primeras son config; excluir
     `Proyectado` probablemente no lo sea, y si es así ése es el primer renglón de la lista
     de "por qué hubo que tocar código".
3. **Tramo 2 — corte vertical, JM solo.** Pasos 3, 4 y 5. Se hace contra JM únicamente:
   construir los dos en paralelo impide después distinguir qué necesitó código y qué salió
   solo. **`Paso-4.md` se revisa antes de ejecutarlo** — está escrito y casi seguro asume
   copiar-y-reemplazar sin registrar la configuración de la corrida (`D-06`).
4. **Tramo 3 — prueba de motor.** SECCO, midiendo líneas de `.gs` tocadas. Es el paso que
   valida la tesis del proyecto; si falla, lo que salga es el trabajo real del tramo
   siguiente.
5. **Tramo 4 — panel** (`D-04`).
6. **Tramo 5 — chequeo previo programado** (`D-11`). Es todo lo que queda de lo que antes
   eran los Pasos 10-12.

### C.3 — Planificado y bloqueado

Cada ítem nombra **qué lo destraba y de quién depende**.

| qué | qué lo destraba | depende de |
|---|---|---|
| Fuente de MiBA | definir de dónde salen los datos | tercero |
| Tercer informe | no es prioritario: el objetivo es la capacidad de incorporar informes, no un informe puntual | usuario |
| Ventana jueves-a-jueves de M2 | confirmar con una segunda semana; hoy hay **un solo caso observado** | equipo |
| Qué regla selecciona los envíos de M2 dentro de la ventana | no es la marca `M2` ni la fecha; si es curaduría manual, hace falta registro a nivel `ID MailUp` | equipo |
| La lámina dice 18 envíos y 11 campañas; el número sale de 10 envíos y 3 campañas | preguntar quién armó la lámina | equipo |
| Etapa 2: actualizar el deck en sitio (`D-06`) | el mapa `token → objectId` de la etapa 1, más decidir qué hace el motor cuando una caja registrada ya no está | interno |

Nota: los tokens de MiBA ya están marcados en las plantillas, así que en cuanto corra el
Paso 4 van a emitir `«FALTA:miba_*»` en `FALTANTES` en cada corrida. **Lo postergado se
auto-reporta.**

### C.4 — Backlog (sin orden, sin fecha)

- Historial de `FALTANTES` — `tools/snapshot.js` ya lo archivaría por corrida.
- Fusionar `SUPUESTOS.md` y `REGLAS_NEGOCIO.md`: son la misma clase de cosa (enunciados con
  ID, ciclo de vida y derogación idénticos). **Decisión del usuario, no la asuma este
  prompt** — rompe ~40 referencias si se hace mal.
- Cortes baratos de `Instalar.gs` según `INVENTARIO_CODIGO.md` Parte C: plantillas y
  `diagnosticoDrive`.
- Unificar el motor de diff/upsert: son 113 líneas compartidas por cinco trabajos más
  `Fechas.gs`, y `menuEstadoConfiguracion_` lo **reimplementa** en vez de usarlo. El arreglo
  del P1 de asimetría Estado/Aplicar es hacerlo usar el motor común, no parchear la
  comparación.

---

## Parte D — `CLAUDE.md`

**D.1** — Sección nueva `## 9. Plan y decisiones`, **corta** (máximo 12 líneas): qué hay en
`docs/PLAN.md`, la frontera entre sus tres secciones de futuro, y el invariante de `D-01`
escrito junto a la regla de oro:

> *Si agregar un informe o una base necesita tocar `.gs`, eso se anota como medición, no se
> silencia. El objetivo es que ese número baje.*

**D.2** — Filas nuevas en el mapa del repo (§6):

```
docs/PLAN.md                        plan, decisiones D-NN, backlog
docs/INVENTARIO_CODIGO.md           foto del código al 01/08 (congelado)
docs/ESCRITORES.md                  quién escribe cada hoja de registro (vivo)
tools/                              scripts de verificación independiente
```

**D.3** — Filas correspondientes en la tabla de dueños (§7), con la pregunta que cada uno
responde.

**D.4** — **Arreglar un duplicado por construcción en §3.** Hoy dice que un documento nuevo
se registre en §7 **y** en la taxonomía de `PROYECTO.md` §9, en el mismo commit. Eso obliga
a mantener dos índices sincronizados, que es exactamente lo que este prompt viene a
eliminar. Queda **sólo §7**. `PROYECTO.md` deja de ser índice.

---

## Parte E — `PROYECTO.md`

**E.1** — Inventario de qué de `PROYECTO.md` **sigue siendo verdad**. No es un `git mv`: el
§9 tiene reglas vivas que hoy se citan (convención de nombre de handoffs, regla de
namespace con el caso `parsearFecha_`, separación `DOC-N` vs `Paso-N`).

**E.2** — Lo que siga vivo y no esté ya en `CLAUDE.md` migra a `CLAUDE.md`. Lo que esté
duplicado se borra de `PROYECTO.md`, no se sincroniza.

**E.3** — `PROYECTO.md` pasa a estado **congelado**, declarado en su propio encabezado, con
una línea al inicio que diga dónde vive ahora cada cosa que contenía.

**E.4** — Reportar cualquier regla de `PROYECTO.md` que **no** tenga destino claro en el
catálogo. Ésas son el hallazgo de esta parte: no inventar destino, preguntar.

---

## Verificación

Antes de cada commit, reportando resultado y no afirmación:

1. `git status --porcelain --untracked-files=all` limpio salvo lo que la parte agrega.
2. **Un solo `.md` nuevo en todo el prompt**: `docs/PLAN.md`. Si aparece otro, parar.
3. `grep -rn "R-0[3-5]" docs/Prompts/Paso-2.10_anclar_a_numeros_verificados.md` devuelve el
   texto original intacto más la nota de equivalencia.
4. Ninguna regla queda en dos archivos vivos. Reportar la lista de duplicados eliminados y
   dónde quedó cada uno.
5. `wc -l CLAUDE.md` — reportar el número. Si superó las ~250 líneas, decirlo: es señal de
   que algo que debía ir a `PLAN.md` se quedó adentro.
6. Ningún dato personal en lo que se va a commitear.

---

## Qué NO hacer

- **No crear ningún `.md` fuera de `docs/PLAN.md`.**
- No fusionar `SUPUESTOS.md` con `REGLAS_NEGOCIO.md`. Está en el backlog, decide el usuario.
- No editar prompts ya ejecutados: sólo notas de equivalencia al pie.
- No tocar `.gs`. Ninguno. Ni `Instalar.gs`, ni el P2 de `Fuentes.gs:117` — está en el plan,
  no en este paso.
- No implementar `periodo_id`, ni `FALTANTES`, ni el chequeo previo. Este prompt **los
  escribe como decisión**; ejecutarlos es trabajo de sus propios pasos.
- No reordenar ni reescribir `docs/BITACORA.md` más allá de las notas de equivalencia de la
  Parte B.
- Sin trailer `Co-Authored-By`.

---

## Modelo

Opus alcanza. Todo este paso es grep, mover texto y transcribir decisiones ya tomadas. La
única parte con juicio es la E.4 —qué de `PROYECTO.md` no tiene destino— y se resuelve
preguntando, no decidiendo.
