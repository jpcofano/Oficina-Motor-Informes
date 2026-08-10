# Corrida nocturna — 09/08

**Cómo se lee.** Cola en orden. **Ninguna tarea espera una respuesta del usuario.** Si una se
traba, se anota y se pasa a la siguiente. **Regla de dos intentos:** si algo falla dos veces, se
anota y se sigue. Un commit por tarea, con el ID adelante y `CLAUDE.md` en el mismo commit cuando
corresponda.

**Modelo: Opus, effort alto.** Subagente `verificador` antes de arrancar, sobre este archivo.

**El orden no es negociable y tiene un motivo:** `N2` agrega una columna a `LAMINAS` y `N3`
siembra otra columna de la misma hoja. Al revés, `N3` correría contra un esquema que `N2` está por
cambiar.

---

## Lo que NO se hace, pase lo que pase

- **No se escribe sobre ninguna plantilla.** Leer sí, y las tres tareas leen. Sellar, anexar
  notas, `setText`: no. **No se corre `sellarPlantilla` con `dryRun` en falso.**
- **No se valida ningún número contra un informe publicado.** Regla nueva del 09/08 y es filosa:
  **Code audita forma, no valores, ni siquiera en Parte 0.** Si una medición compara un total con
  un número publicado, esa medición no es de esta corrida: se anota como pregunta y se para ahí.
- **No se cablea ningún marcador nuevo** ni se renombra ningún token, salvo lo que el
  `2026-08-09_1` ya tenga escrito y aprobado en sus partes.
- **No se decide el nombre de una columna, ni el alcance de una siembra.** Las dos decisiones ya
  están escritas: `titulo` en el `_16` §0.2, y la lista corta del `15.1`. Lo que no esté escrito
  se reporta.
- **No se borra nada. Backup antes de escribir en la planilla**; si el backup falla, la tarea no
  se hace.
- **No se cierra ningún paso como verificado.**

---

## `N1` · Cerrar el `2026-08-09_1`, con sus tres addenda

`docs/Prompts/2026-08-09_1_cablear_laminas_2_y_3.md`, más `1.1` correcciones, `1.2` solapas y
`1.3` el alcance de `ignorar` y el `hoja_default`.

La Parte A estaba en curso: **verificar el camino declarado en `ESCRITORES.md` antes de escribir
en `SOLAPAS`**, y de ahí `R-22`, las solapas congeladas y `looker/Cuentas`. Seguir por donde quedó
y llegar hasta donde llegue, parte por parte.

**Tres cosas que el reporte de la mañana tiene que traer sí o sí**, porque son las que el
coordinador va a mirar primero:

1. `contarLecturaBase_('digital')` — **cuánto da ahora**. Son dos números distintos según si la
   ventana aplica o no, y cuál sea decide si `probarLecturaPeriodo` estaba midiendo la tabla
   congelada.
2. `looker/Cuentas` — que su acotación de **tabla de dimensión** quedó escrita en `notas`:
   sirve para el join, **ningún marcador toma un número de ahí**.
3. Los marcadores que apuntan a `digital/Digital` — que caen a `FALTA:…@solapa_no_fuente` **y no
   a cero**. Un cero es un número plausible y ése es el modo de falla que `R-22` existe para
   evitar.

---

## `N2` · El `_16` — la columna `titulo` en `LAMINAS`

`docs/Prompts/2026-08-09_16_columna_titulo_en_laminas.md`, completo.

**Su Parte A termina en «reportar y parar», y de noche eso se resuelve así:** se sigue a la Parte
B **sólo si las cinco premisas confirman** —13 columnas con `notas` última, sin entrada `LAMINAS`
en el delta, los dos arrays de `sellarPlantilla` con 13 posiciones, `leerLaminas_` por encabezado
y ningún otro lector por posición—. **Cualquier resultado distinto para y pasa a `N3`**, con el
reporte escrito. No hay tercera opción: el esquema del que dependen B y C sería otro.

`A.5` y `A.6` **no bloquean**: son mediciones para el reporte. `A.6` en particular —la
contradicción entre el comentario de `Instalar.gs` y `PLAN.md` §2 sobre si `seccion_id` hereda—
**se reporta y no se corrige de noche**, porque es la premisa sobre la que descansa `N3`.

---

## `N3` · El `_15` con su `15.1` — sembrar `seccion_id`

`docs/Prompts/2026-08-09_15_sembrar_seccion_id.md` + `docs/Prompts/2026-08-09_15.1_addendum_alcance.md`.

**El alcance ya quedó recortado por la medición del propio `15.1`, y no se reabre de noche:**

- **`seccion_id`** — se siembra, por las tres vías con la regla de acuerdo de dos. Es lo único.
- **`escondida`** — ya sembrada por el sellador en el `_11`, 7 filas. **Se re-verifica, no se
  escribe.**
- **`titulo`** — la puebla `N2`. `N3` **no la toca**.
- **`modo`, `itera_sobre`, `filtro`** — **fuera de alcance, y no por prudencia: vacío ya
  significa algo.** Significa «hereda de `SECCIONES`». Copiarles el valor de la sección las
  declararía en dos lugares, y el día que la sección cambie las 51 filas seguirían diciendo lo
  viejo. Hoy no hay ninguna lámina que difiera de su sección.
- **`rol`** — listada, no sembrada: **no tiene fuente declarada en ningún lado.**
- **`cobertura` y `falta`** — vacías. Se derivan del motor resolviendo los tokens, y eso es el
  `_14`. Sembrarlas desde los documentos congela una foto del 09/08.

**Si `N2` paró en su Parte A, `N3` corre igual** — siembra `seccion_id`, que no depende de la
columna nueva.

**Y una fila por columna en el reporte**, como pidió el usuario: cuántas sembradas, cuántas
listadas, y **por qué** las listadas. Llenar todo es adivinar.

---

## El reporte de la mañana

Un solo documento, y que se pueda leer sin abrir el repo:

- **Qué corrió, qué no, y por qué no.** Una tarea trabada con su motivo vale más que tres a medias.
- **Las decisiones que hubo que tomar**, marcadas como propias, con lo que se descartó al lado.
- **Los conteos, con fecha y hora de lectura.** Un dato medido una vez y citado tres veces
  envejece igual que cualquier otro.
- **Lo que quedó fuera de alcance y a qué prompt le corresponde.** Si algo se decidió durante la
  noche y no entró en ningún archivo del repo, decir dónde va **antes** de darlo por hecho.
- **Las premisas que se cayeron.** Es lo primero que se mira: la Parte 0 del día dio vuelta cuatro
  decisiones ya tomadas, y ése es el rendimiento real de estas corridas.
