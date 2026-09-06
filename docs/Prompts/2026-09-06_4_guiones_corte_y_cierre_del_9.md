# 2026-09-06_4 — Los guiones que sí, el corte por `D`, y el `_9` cerrado

**Cuatro partes.** Las dos primeras escriben código que **no se corre**; las dos últimas registran.

⚠ **Este prompt reemplaza al `_3` que no llegó a pasarse** —el número ya estaba tomado por el
reporte y por `2026-09-06_2_auditoria_documental.md`—. **Su Parte A cambió**: el gate de `D-58` que
escribiste el 06/09 reduce la lista de cinco a **cuatro**.

---

## Reglas

1. ⛔ **No corras nada contra la planilla viva.** ⛔ **No hagas `clasp push`.** ⛔ **No toques
   plantillas.**
2. ⛔ **Si algo necesita una decisión no escrita, PARÁ ESA PARTE** con la pregunta exacta.
3. **Un commit por parte.** ⛔ **Ningún número al reporte sin el comando que lo produjo.**
4. ⭐ **El cruce se hace sobre el BLOQUE entero, no sobre los casos que este prompt nombra.** ⚠ **Es
   la falla de los dos últimos días, y las dos veces fue por citar un bloque sin su límite.** Si
   algo de acá contradice una decisión que no nombro, **gana la decisión** y se reporta.

**Subagentes:** `verificador` al cerrar `A` y `B`. ⛔ `cableador` **no se usa**.

---

## Parte 0 — Premisas · **Sonnet** · effort normal · SÓLO LECTURA

| # | premisa | reproductor | esperado |
|---|---|---|---|
| **0.1** | La lista está vacía y la función aborta | `grep -n 'GUIONES_A_LEVANTAR_' Auditoria.gs` | `= []`, con el abort declarado |
| **0.2** | El gate de `D-58` existe y guarda `previos` | leer la constante de casos por nombre | cada entrada trae `estado`, `caso`, `csv` y `previos` |
| **0.3** | **Los cuatro del `C-99` NO cruzan la mitad insegura** | leer sus entradas | `camp_ctor`, `camp_enviados`, `camp_or`, `camp_mail_clics` con `previos: []` |
| **0.4** | **`imp_prog` SÍ la cruza** | leer su entrada | `previos` incluye `contradice`, y el nuevo `exacto` la **sacaría** |
| **0.5** | `C-101` es lo que hoy bloquea a los cinco `emin_*` | leer `C-101` entero en `docs/casos_validacion_2026-09-06.csv` | `contradice`: 7 filas y **son otras siete**. ⚠ Su último párrafo **está vencido**: dice que lo destraba el desplazamiento por solapa, que se revirtió esa misma mañana |
| **0.7** | El corte medido el 06/09 era `E`, y **el usuario ya lo pasó a `D` a mano** | el log de `diagCorteAgenda()`, corrida `16:20` del 06/09 | decía `fecha_periodo → E`; **Sabor entra por `D`, Quirós por `E`**. ⛔ El estado de hoy **no lo podés verificar**: es la hoja viva |
| **0.8** | **`levantarRevisar_` ya existía** desde el 01/09 | `grep -n 'function levantarRevisar_' Instalar.gs` | existe, con su par `diag`/`aplicar` y su propia lista congelada |

⭐ **`0.3` a `0.5` son la Parte A.** Si alguna no se reproduce, **parar y reportar**.

---

## Parte A — La lista, y son cuatro · **Opus** · effort alto

De los ocho que `diagGuionesPorLamina()` puso en el grupo (a), **cuatro se levantan y cuatro no**.
Los dos motivos son distintos y **los dos ya están escritos en el repo**.

### ⭐ Los cinco `emin_*` — destrabados por decisión del usuario, 06/09

⭐⭐ **Decisión del usuario:** *«la lista sale de la ventana y listo; no es necesario validar contra
el equipo»*. ⇒ **El criterio de la sección `ministros` es la ventana**, y el corte por `D` —la fecha
del encuentro, ya aplicado en `MAPEO`— **es** ese criterio.

⇒ ⭐ **`C-101` queda SUPERADO por decisión, no por medición**, y `emin_lista` y `emin_encuentros`
**salen del grupo (b)**. Con ellos se destraban `emin_or`, `emin_ctor` y `emin_ctr`, cuyo único
bloqueo era el universo desmentido por `C-101`.

⚠ **Y lo que esto NO borra:** `C-101` **es evidencia fechada y se queda**. Lo que se escribe es un
caso nuevo que lo supersede, citando la decisión — **la forma que `D-58` prescribe**.

⛔ **Pero la decisión no es una medición.** El corte por `D` se cargó a mano y **ninguna corrida lo
confirmó todavía**. ⇒ **Los cinco entran a la lista con un gate**, no con fe: ver abajo.

### ⛔ `imp_prog` — la mitad insegura de `D-58`

Sus `previos` incluyen `contradice`, así que el `exacto` de `V-108` **sacaría** la marca. `D-58` dice
que **esos casos se listan y se paran** hasta que el usuario conteste si la regla es simétrica.
⇒ **Se lista, no se levanta**, y el log dice **por qué** — no basta con omitirlo.

### ⭐ Lo que se escribe

`GUIONES_A_LEVANTAR_` con **nueve**, en dos bloques y con su motivo al lado:

| bloque | marcadores | por qué |
|---|---|---|
| `C-99`, 04/09 | `camp_enviados` · `camp_or` · `camp_mail_clics` · `camp_ctor` | comparados número por número contra el deck del equipo |
| decisión 06/09 | `emin_lista` · `emin_encuentros` · `emin_or` · `emin_ctor` · `emin_ctr` | el criterio es la ventana; el corte por `D` lo implementa |

Y `GUIONES_A_LEVANTAR_FECHA_ = '2026-09-06'`.

### ⛔⛔ El gate de los cinco `emin_*`, y aborta la operación entera

**Antes de escribir**, la función verifica **por identidad** sobre la solapa viva que el corte por
`D` esté haciendo efecto: **Ezequiel Sabor entra y Fernán Quirós no**.

- ⛔ **Si el control no pasa, no se escribe NADA** —ni los cuatro del `C-99`—: una operación a medias
  deja la hoja en un estado que nadie midió.
- ⛔ **Un control que cuente no sirve.** Está medido: **6 por `D` contra 7 por `E`**, y el deck viejo
  publicaba 7 con las equivocadas. **Se compara por nombre.**
- ⭐ **Es un gate, no un filtro:** la lista sigue siendo explícita y congelada con su fecha. El gate
  decide **si** se escribe, nunca **qué** se escribe.

- ⛔ **Levantar son DOS escrituras**: el `_revisar` del `formato` **y** el `SIN VALIDAR` de `notas`.
  Si una falla, no se hace ninguna. **Verificá que siga así después de tu cambio.**
- ⭐ **Banco por identidad**: falla si entra `imp_prog`, y falla si el gate no aborta cuando el
  control de identidad no pasa. **Nueve nombres, no «nueve».**

⛔ **No la corras.**

`verificador` al cerrar. Un commit.

---

## Parte B — El corte por `D`, ya aplicado a mano · **Opus** · effort alto

⭐ **El usuario migró la celda el 06/09.** La fila de `MAPEO` quedó:
`reuniones · Agenda funcionarios · fecha_periodo · Agenda funcionarios · **D** · fecha · fecha`,
con la nota del `2026-09-01_4` Parte B —*«declarada por letra; encabezado es testigo, nunca
fallback»*—.

⇒ ⭐ **La función de migración YA NO SE ESCRIBE.** No hay nada que migrar.

### Lo que sí se escribe: la verificación posterior

⚠ **Un cambio a mano no deja rastro y nadie lo puede auditar después.** Lo que falta es el
instrumento que confirme que el corte hace lo que tiene que hacer, **y `diagCorteAgenda()` ya lo
mide**: sólo hay que dejar escrito **qué tiene que dar ahora**.

- ⭐ **El control es por identidad**: con el corte por `D`, **Ezequiel Sabor entra y Fernán Quirós
  no**. ⛔ **Un control que cuente no sirve** — está medido: **6 por `D` contra 7 por `E`**, y el
  deck viejo publicaba 7 con las equivocadas.
- ⚠ **Y el otro veredicto posible, que no es error:** si `diagCorteAgenda()` ahora reporta `D` **y
  la lista sigue trayendo a Quirós**, la hipótesis se cae y el problema es de la ventana, no del
  corte. **Que el log lo diga con esas palabras** en vez de dar verde por la coincidencia del
  `MAPEO`.
- ⭐ **Registrá el cambio a mano como evidencia fechada**: qué celda, qué decía antes (`E`), qué dice
  ahora (`D`), quién lo hizo y cuándo. ⇒ **El seed ya decía `D` desde el 03/09**, así que esto
  cierra la brecha entre seed y hoja — **y esa brecha es la lección**: un cambio de seed no existe
  hasta que se empuja.

⚠ **Y decilo en el reporte:** cuando la próxima corrida confirme el corte, **`C-101` queda superado**
y los tres `emin_*` de la Parte A **dejan de estar bloqueados**. ⇒ **Pero el caso nuevo lo escribe
una corrida con deck, no esta parte.**

`verificador` al cerrar. Un commit.

---

## Parte C — El `_9` se cierra · **Sonnet** · effort normal

**Decisión del usuario, 06/09:** ⭐ **`camp_meta_frecuencia` se calcula** —no se lee de una columna—
**y queda supeditada al alcance**: cuando el alcance esté bien, la frecuencia lo está.

⇒ **La confirmación de la columna `meta_frecuencia` queda SIN OBJETO y el `_9` se cierra entero.**

- Registrarlo donde `CLAUDE.md` §7 mande, citando **`R-34`** y **`C-96`**.
- ⛔ **Lo que esto NO cierra**, al lado: `camp_meta_frecuencia` **sigue con su guion**, en el grupo
  del `cerrado`, que no habilita a levantar. **`cerrado` es «no se vuelve sobre esto», no «el número
  coincide».**
- ⭐ **La condición que lo reabre:** *«si el alcance cambia de fuente, la frecuencia derivada cambia
  con él»*.

Un commit.

---

## Parte E — El criterio de la lista de ministros, cerrado · **Sonnet** · effort normal

⭐⭐ **Decisión del usuario, 06/09:** *«la lista sale de la ventana y listo; no es necesario validar
contra el equipo»*.

⇒ **El criterio de la sección `ministros` queda cerrado**: lo que la lista publica es **lo que cae
en la ventana**, cortando por la fecha del encuentro. **No hay comparación pendiente contra el
equipo y no la va a haber.**

Lo que se escribe:

1. **Un caso nuevo que supersede a `C-101`**, citando la decisión y el corte por `D` ya aplicado.
   ⛔ **`C-101` no se toca**: es evidencia fechada. La forma es la de `D-58` — **el más nuevo manda**.
2. ⭐ **La corrección del párrafo vencido de `C-101`**, fechada al lado y **no editando el caso**: el
   caso dice que lo destraba *«el desplazamiento de ventana por solapa, `ventana_desde_dias` y
   `ventana_hasta_dias`»*, y **eso se revirtió esa misma mañana**. Lo que lo destrabó fue el corte
   por `D`. ⚠ **El caso se escribió antes del revert** — no estaba mal cuando se escribió, está
   vencido ahora, y ésa es la diferencia que hay que dejar clara.
3. ⭐ **La condición que lo reabre**, porque un criterio escrito como estado vence solo: *«se revisa
   si el equipo pide una lista que no sea la de la ventana»*.

⛔ **Y lo que este cierre NO abarca**, dicho para que nadie lo lea de más: **la ventana en sí la
elige el usuario en cada corrida** (`D-59`). Esta decisión dice **qué se recorta**, no **con qué
ventana**.

Un commit.

---

## Parte D — Dos funciones que hacen lo mismo · **Sonnet** · effort normal

⛔ **Registrar, no resolver. Ninguna se borra: cuál sobrevive lo decide el usuario.**

`levantarRevisar_` (01/09, `D-56`) y `guionesValidados_` (06/09) **escriben la misma celda con el
mismo diseño**, cada una con su par `diag`/`aplicar` y su propia lista congelada.

Lo que el registro tiene que dejar comparable, **medido y no argumentado**:

| | `levantarRevisar_` | `guionesValidados_` |
|---|---|---|
| fecha de su lista | | |
| ¿cruza `D-58` antes de escribir? | | |
| ¿escribe `notas` además del `formato`? | | |
| ¿qué deja escrito en `notas`? | | |

⭐ **Y el riesgo concreto que justifica registrarlo hoy:** la lista de la vieja es del **01/09**, y
hay CSV del 04/09 y del 06/09 posteriores. **Es la figura de `confirmarNumerosDeUnoAUno()` otra
vez**: una lista congelada no puede enterarse de lo que vino después. ⇒ **Ninguna `confirmar*()` ni
`aplicar*()` se re-corre sin cruzar su lista contra los CSV posteriores a su fecha** (`D-58`,
`CLAUDE.md` §4).

⚠ **Y anotá también lo que trajo la verificación y todavía no está cubierto:** **cinco escritores
del `formato`, y sólo uno mira `notas`** — la defensa de las dos escrituras **protege contra un
escritor y no contra los otros cuatro**. ⛔ **No lo arregles acá** — medilo, nombralos, y decí cuál
prompt lo tomaría.

Un commit.

---

## El reporte

1. La tabla de la Parte 0.
2. Una fila por parte: parte · estado · commit · una línea.
3. **«Para correr»**, en orden, con **qué tiene que dar cada una**.
4. **«Bloqueado, decide el usuario»** — la pregunta exacta, una línea.
5. Lo que encontraste y no estaba en el prompt.

## Orden

```
0 → A (Opus)   ← si sólo entra una, es ésta
    B (Opus)   ← ya no migra: deja escrito el control que lo confirma
    C (Sonnet)
    E (Sonnet) ← cierra ministros por decisión
    D (Sonnet) ← ⚠ la primera que se cae
```
