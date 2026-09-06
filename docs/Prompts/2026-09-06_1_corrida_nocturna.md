# 2026-09-06_1 — Corrida nocturna del 06/09

**El usuario duerme.** Cuatro partes. ⭐ **La primera implementa; las otras tres registran.**

⛔ **Este prompt reemplaza dos versiones anteriores del mismo número, ninguna ejecutada:** la del
censo de tokens sin llaves —descartada, el usuario lo arregla en las plantillas— y una primera
nocturna que trataba la ventana `vie–vie` como defecto. **No lo es:** `PERIODOS` tiene filas de las
dos formas y `2026_agosto_21_28` declara en su nota que salió del asistente como personalizado. ⇒
**La ventana la elige el usuario.** Esa parte se cayó entera.

---

## Las reglas de la noche

1. ⛔ **Nada corre contra la planilla viva.** El código nuevo queda escrito y sin correr.
2. ⛔ **No hagas `clasp push`.** ⛔ **No toques plantillas.**
3. ⭐ **Si una parte se bloquea, anotá por qué y SEGUÍ.**
4. ⛔ **Si algo necesita una decisión no escrita, PARÁ ESA PARTE** con la pregunta exacta. **No
   inventes el faltante.**
5. **Un commit por parte.** Código y documentación separados.
6. ⛔ **Ningún número al reporte sin el comando que lo produjo**, salvo los de los decks, que van
   citados como medición ajena.

**Subagentes:** `verificador` al cerrar las Partes A y B. ⛔ `cableador` **no se usa** — no se
escribe en ninguna hoja. ⚠ Su reporte **no es luz verde**: hereda las premisas de la sesión que
implementa.

### Los decks, que no están en el repo

Corridos el 06/09, leídos con `markitdown` fuera de esta sesión, los dos con ventana
`vie 28/08 – jue 03/09`: `Informe_semanal_JM` (32 láminas) y `Seguimiento_SECCO-SSCDI` (38).
⛔ **No podés reproducir ningún número que venga de ahí.** Se citan; no se verifican.

---

## Parte 0 — Premisas · **Sonnet** · effort normal · SÓLO LECTURA

| # | premisa | reproductor | esperado |
|---|---|---|---|
| **0.1** | El diseño del desplazamiento **ya está escrito y sin implementar** | leer el bloque `P0` del 03/09 en `docs/PENDIENTES_consistencia.md` | dice **columna nueva en `SOLAPAS`, no valor compuesto en `ventana_ref`**, y **dos puntas distintas** |
| **0.2** | `ventana_ref` hoy admite `propia` **o** un nombre de solapa, un solo nivel | leer `referenciaDeVentana_` en `Fuentes.gs` por nombre | falla con `«FALTA:ventana_ref@…»` ante una cadena |
| **0.3** | **No existe ningún desplazamiento en el motor** | `grep -rn 'VENTANA_ENVIO_CONTROL_' *.gs` | aparece **sólo dentro de un diagnóstico**, con su comentario diciendo que no es configuración |
| **0.4** | `SOLAPAS` se siembra desde `SEED_SOLAPAS_` | `grep -n 'SEED_SOLAPAS_' Instalar.gs` | existe, y es de donde salen las columnas |
| **0.5** | El máximo global de `caso_id` es `C-99` | `cut -d, -f1 docs/casos_validacion_*.csv \| grep -oE '^C-[0-9]+' \| sort -t- -k2 -n \| tail -1` | `C-99` |
| **0.6** | El banco afirma que hay cuatro CSV | `grep -n 'dir.length' tools/probar-cambios-0409.js` | `afirmar(dir.length === 4, …)` |

⭐ **`0.1` y `0.3` son la Parte A.** Si el desplazamiento ya existe en alguna forma, **parar y
reportar**: el trabajo sería otro.

---

## Parte A — El desplazamiento de ventana por solapa · **Opus** · effort alto · ⭐ ES LA QUE ARREGLA

⭐⭐ **El problema está medido y es peor que un número mal.** Sobre la solapa viva (576 filas), la
ventana configurada `28/08–03/09` **devuelve 7 filas y son otras siete**: sobra **Fernán Quirós**
(encuentro 08/09) y falta **Ezequiel Sabor**. ⇒ `emin_encuentros = 7` **da verde sobre una lista
equivocada** — dos diferencias que se cancelan en el total. El deck del 06/09 lo publica así.

⛔ **Y no se arregla con un desplazamiento simétrico:** el lead time entre envío y encuentro es
**2, 3, 3, 3, 3, 4 y 5 días**. No es un número. El barrido de `0..−4 × 0..−4` acota las
combinaciones que reproducen exactamente las siete a **inicio −1…−3 con fin −1…−2**: **las dos
puntas son distintas.**

### Lo que se implementa

**Dos columnas nuevas en `SOLAPAS`** —el mínimo que el `P0` del 03/09 ya prescribe, con su motivo
escrito—, leídas por el resolutor de ventana:

- Una para el corrimiento del **inicio**, otra para el del **fin**. Los nombres los elegís vos, pero
  **que digan las dos cosas distintas**: de qué punta, y cuántos días.
- ⭐⭐ **Default `0` en las dos: el comportamiento de hoy no cambia para ninguna solapa.** Esta noche
  el motor tiene que producir **exactamente los mismos números** que produce ahora. La única
  diferencia es que existe **dónde** declarar el corrimiento.
- ⛔ **No elijas el valor de la Agenda.** `−3 / −2` es lo que la medición reproduce, pero **el
  desplazamiento lo decide el usuario** y su celda queda en `0` hasta que él la cargue.
- ⛔ **No es un valor compuesto en `ventana_ref`.** Esa columna contesta *de dónde* sale la ventana;
  esto contesta *cuánto se corre*. Son dos preguntas, y el `P0` explica por qué no van juntas.

### Dónde toca, y con qué cuidado

- `SEED_SOLAPAS_` en `Instalar.gs` — las columnas nacen del seed. ⚠ **`SOLAPAS` es de las hojas que
  sólo siembran lo ausente**: verificá qué pasa con una hoja **ya creada** y **decilo en el
  reporte**. Si el seed no repara columnas faltantes, el usuario necesita un paso extra y tiene que
  saberlo **antes** de correr, no después.
- `resolverVentana` y `referenciaDeVentana_` en `Fuentes.gs` — el corrimiento se aplica **después**
  de resolver de dónde sale la ventana, nunca antes: una solapa que la toma prestada también puede
  necesitar correrla.
- ⛔ **Un valor no numérico NO cae a `0` en silencio.** Ausente es `0`; **basura es `«FALTA:…»`**. La
  cadena vacía no está en el vocabulario de salida.

### Los bancos, y son tres

1. **Neutralidad** — con las dos columnas en `0`, la ventana resuelta es **idéntica** a la de antes.
   Con control negativo: si el banco no distingue, no prueba nada.
2. **Aplicación** — con `−3 / −2` sobre una ventana conocida, el rango resultante es el esperado.
3. ⭐⭐ **Identidad, no conteo** — sobre un conjunto fijo de filas, el desplazamiento tiene que
   cambiar **qué filas entran**, no cuántas. **Es exactamente el defecto que motiva todo esto: el
   conteo coincidía y las filas no.** Un banco que compare `length` repite el error que viene a
   arreglar.

⛔ **No toques `ROSTER_CONTROL_`** — es evidencia fechada. ⛔ **No corras nada contra la hoja.**

`verificador` al cerrar. Un commit de código + sus bancos.

---

## Parte B — El banco que se pondría rojo por el motivo equivocado · **Sonnet** · effort normal

`tools/probar-cambios-0409.js` afirma `dir.length === 4`: *«hay CUATRO CSV de casos»*. ⛔ **El curso
normal es agregar un CSV por corrida de validación** —la Parte C agrega el quinto— **así que ese
banco se pone rojo por el motivo equivocado**, y un rojo que no significa lo que dice enseña a
ignorar los rojos.

Lo que la afirmación quiere decir es **«los CSV se acumulan, no se reemplazan»**. Reescribila así:
el conteo **no baja**, y los archivos previos **siguen estando**.

⭐ **Control en las dos direcciones**: pasa con el CSV nuevo, **falla** si un CSV anterior
desaparece.

`verificador` al cerrar. Un commit.

---

## Parte C — Los casos de validación del 06/09 · **Sonnet** · effort normal

CSV nuevo `docs/casos_validacion_2026-09-06.csv`, mismo encabezado que el del 04/09. ⛔ **No editar
ningún CSV anterior.** ⭐ **Numeración desde el máximo GLOBAL** (`0.5`).

| qué registra | estado |
|---|---|
| **Ítem 34 en producción** — `emin_lista` publica **siete renglones** (funcionario + comuna + fecha) en `L-012` de `secco`, con `emin_encuentros` en `-7-` | `exacto` |
| ⛔⛔ **Y el mismo caso dice que ese verde es falso** — la lista trae `04/09` y `08/09`, fuera del encabezado `28/08 – 03/09`, y el `P0` del 03/09 ya midió que **son otras siete**. **El arreglo del `ctx.plantilla` funciona; la ventana de la solapa no.** Las dos cosas en el mismo caso: separarlas deja el primero leyéndose como cierre | |
| **El `%` duplicado, cerrado** — `emin_or`, `emin_ctor` y `emin_ctr` publican `-18.5-%`, `-2-%`, `-0.3-%`: **un solo signo**. El `TESTIGO_emin_2026-09-04_PRE.md` los tenía repetidos | `exacto` |
| **Ítem 33 también en `secco`** — dos bloques `L-016`…`L-023` con títulos distintos en la misma corrida | `exacto` |

⛔ **Y una corrección a un registro anterior:** `camp_env4_fecha}}` aparece **dos veces en `jm`**
—una por bloque— y **cero veces en `secco`**. La Parte D del `_6` lo declaró *«en los dos
informes»*. Registrar la medición y **las dos explicaciones** —lo corrigieron en `secco`, o el
registro estaba mal— **sin elegir**.

Un commit.

---

## Parte D — Las tres correcciones documentales · **Sonnet** · effort normal

⛔ **Grepear antes de escribir.** Donde ya esté, **registrar el cero**. ⛔ **Nada se borra**: la
corrección va fechada al lado.

1. ⛔⛔ **La ventana `vie–vie` NO es un defecto.** El registro de la Parte D del `_6` la trata como
   hallazgo. El asistente ofrece **dos formas —`vie–jue` y `vie–vie`— más períodos personalizados**,
   y `PERIODOS` tiene filas de las dos: `2026_agosto_21_28` lo dice en su propia nota. ⇒ **La
   ventana la elige el usuario y las dos son válidas.**
   ⚠ **Y el hueco que esto deja a la vista:** el **título** de `R-11` sigue diciendo *«de viernes a
   viernes»* mientras su Addendum 1 define *«siete días, viernes a jueves»*. **Registrar el hueco;
   no reescribir la regla** — `REGLAS_NEGOCIO.md` es append-only y el enunciado lo cambia el
   usuario.
2. **Ítem 34** — su nota dice *«falta la corrida»*. La corrida existe: agregá el resultado con su
   fecha, **y que el control de conteo dio verde sobre la lista equivocada**. No reescribas la nota
   vieja.
3. **Ítem 9, dato nuevo y nada más** — en la corrida de `secco` del 06/09, **en los dos bloques**,
   `L-016` publica el título —`-Operativo Muro | 25/8-` y `- Fin de las mafias de los celulares
   robados-`— y **`L-023` publica `/////` dos veces**, con sus `camp_resp_*` crudos. ⛔ **No se sabe
   qué token son esos dos `/////`**: eso espera el dato del Drive. **El ítem sigue frenado.**

Un commit.

---

## El reporte

1. La tabla de la Parte 0.
2. Una fila por parte: parte · estado · commit · una línea.
3. **«Para correr»** — qué función y **qué tiene que dar** para valer. ⭐ La Parte A necesita
   `instalar()` o su equivalente para que las columnas aparezcan: **decí exactamente qué correr, en
   qué orden, y qué tiene que verse en `SOLAPAS` después**.
4. **«Bloqueado, decide el usuario»** — la pregunta exacta, una línea.
5. **Lo que encontraste y no estaba en el prompt.** **Mejorar no es ampliar.**

## Orden y sacrificabilidad

```
0 → A (Opus)    ← la única que arregla; si sólo entra una, es ésta
    B (Sonnet)  ← barata, evita un rojo falso mañana
    C (Sonnet)  ← la evidencia fechada
    D (Sonnet)  ← ⚠ la primera que se cae
```

---

## Lo que la noche NO puede cerrar

| qué | por qué |
|---|---|
| **El valor del desplazamiento de la Agenda** | ⛔ decide el usuario. La medición dice que `−3 / −2` reproduce sus siete; el valor lo carga él |
| `meta_frecuencia` | exige la base viva |
| Los siete `contradice` sin marca, y el `notas` / `SIN VALIDAR` | ⛔ decisión pendiente |
| Ítem 9 · qué token son los dos `/////` de `L-023` | falta el dato del Drive |
| El prefijo `D-` de los CSV · el remitente (**son dos cosas**) | ⛔ decisión pendiente |
| Los 14 prompts del 04/09 sin copiar | ⛔ no se reconstruyen de memoria |
