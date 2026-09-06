# 2026-09-06_3 — Revertir la Parte A, cerrar la ventana, y los guiones

> ⚠ **NOTA DE CODE: este prompt se entregó como `2026-09-06_2` y se guardó como `_3`.** El `_2` ya
> estaba tomado por `2026-09-06_2_auditoria_documental.md`, que llegó desde la otra herramienta.
> `CLAUDE.md` §3 manda mirar la carpeta filtrando por la fecha de hoy **antes** de escribir el
> nombre; sin eso habría sido la cuarta colisión de la serie.

**Cuatro partes.** La `A` deshace, la `B` cierra un criterio, la `C` es el trabajo real, la `D`
mide y para.

⛔ **La Parte A de la corrida nocturna se REVIERTE. Decisión del usuario, 06/09.** El motivo es el
que vos mismo reportaste: tu decisión del 03/09 —*«un desplazamiento que compensa una ventana mal
cortada es un RODEO»*— declara que las dos columnas **no hacen falta** y que `R-20` queda **sin
objeto**. Completarlas sería reabrir algo cerrado.

---

## Reglas

1. ⛔ **No corras nada contra la planilla viva.** Lo que se escriba para correr **queda escrito y
   sin correr**.
2. ⛔ **No hagas `clasp push`.** ⛔ **No toques plantillas.**
3. ⛔ **Si algo necesita una decisión no escrita, PARÁ ESA PARTE** con la pregunta exacta.
4. **Un commit por parte.** ⛔ **Ningún número al reporte sin el comando que lo produjo.**
5. ⭐ **El cruce se hace sobre el BLOQUE entero, no sobre los casos que este prompt nombra**
   (`CLAUDE.md` §1). ⚠ **Esa es la regla que la nocturna violó, y la violó porque el prompt citaba
   un bloque y no el que lo cancelaba 25 líneas más abajo.** Si algo de acá contradice una decisión
   que este prompt no nombra, **gana la decisión** y se reporta.

**Subagentes:** `verificador` al cerrar `A` y `C`. ⛔ `cableador` **no se usa**. ⚠ Su reporte **no es
luz verde**.

---

## Parte 0 — Premisas · **Sonnet** · effort normal · SÓLO LECTURA

| # | premisa | reproductor | esperado |
|---|---|---|---|
| **0.1** | El commit de la Parte A revertible está identificado | `git log --oneline -12` | el de las dos columnas de desplazamiento, y el `P0` posterior que lo declara inerte |
| **0.2** | Las columnas **no** las lee nadie | leer `leerSolapasSinCache_` por nombre | lista blanca de campos; las dos nuevas **no están** |
| **0.3** | El último `D-NN` es `D-58` | `grep -oE '\bD-[0-9]{2}\b' docs/PLAN.md \| sort -u -t- -k2 -n \| tail -1` | `D-58` ⇒ el nuevo es **`D-59`** |
| **0.4** | El corte de la Agenda **en el seed** es la columna `D` (`Fecha`, el encuentro) | `grep -n "campo_logico: 'fecha_periodo'" Instalar.gs` | `columna: 'D'`, con la medición al lado |
| **0.5** | El medidor del cruce existe y corre | `node tools/medir-casos-exactos-con-revisar.js` | reporta sobre el **snapshot del 31/08**, y lo declara |

---

## Parte A — Revertir · **Opus** · effort alto

Sacar las dos columnas de desplazamiento y todo lo que las acompaña.

- **El seed, el lector de ventana y los bancos.** ⭐ **Y las citas**: un comentario que explique un
  mecanismo que ya no existe es un testigo vencido, y esta semana ya costó una noche.
- ⭐ **Control de reversión, obligatorio en las dos direcciones:** la suite en verde **y** un
  `grep` de los nombres de las dos columnas que devuelva **cero** fuera de la documentación
  histórica. Un revert que deja el nombre suelto en un comentario invita a reimplementarlo.
- ⛔ **No borres el registro de que pasó.** El incidente queda —es la evidencia de la lección—; lo
  que se va es el **código**.

⚠ **Y revisá si el revert toca algo que la nocturna arregló bien.** Las Partes B, C y D de esa noche
**se conservan enteras**: sólo se deshace la `A`.

`verificador` al cerrar. Un commit.

---

## Parte B — El criterio de ventana, cerrado · **Sonnet** · effort normal

**Decisión del usuario, 06/09:** la ventana **queda como está**. El asistente ofrece `vie–jue`,
`vie–vie` y períodos personalizados; **la elige el usuario en cada corrida** y las tres son
válidas. ⇒ **No hay defecto de ventana y el frente se cierra.**

Va como **`D-59`** en `docs/PLAN.md`, con:

- ⭐ **La condición que la reabre, no un estado:** *«se revisa cuando el equipo defina un criterio
  fijo de ventana»*. Hasta entonces, **la selección manda**.
- ⛔ **Y lo que esta decisión NO cierra**, dicho para que nadie lo lea de más: **el corte de
  `reuniones / Agenda funcionarios`** —qué columna se usa para recortar esa solapa— **es otra cosa**
  y sigue abierto en la Parte D.
- El hueco ya registrado del **título de `R-11`**, que dice *«viernes a viernes»* mientras su
  Addendum 1 define *«siete días, viernes a jueves»*. ⛔ **No reescribas la regla**: `REGLAS_NEGOCIO`
  es append-only y el enunciado lo cambia el usuario.

Un commit.

---

## Parte C — Los guiones · **Opus** · effort alto · ⭐ ES EL TRABAJO REAL

**El usuario lo reportó sobre los decks del 06/09:** quedan guiones —la marca `_revisar`— **en los
títulos de campaña** y **sobre datos que ya están validados** en el detalle de campaña.

⛔⛔ **No son el mismo caso y tratarlos igual publica una validación falsa.** Hay que separar el
universo **antes** de tocar nada:

| grupo | qué corresponde |
|---|---|
| **(a)** marcador con caso `exacto` **vigente** y todavía con `_revisar` | ⇒ el guion **sobra**: es el que hay que levantar |
| **(b)** marcador con caso `contradice` vigente | ⇒ el guion **está bien puesto**. ⛔ **No se toca** |
| **(c)** marcador sin caso | ⇒ el guion **está bien puesto**. ⛔ **No se toca** |

⛔⛔ **`camp_titulo` es del grupo (c) y NO se levanta**, aunque sea el que el usuario ve primero: el
**ítem 9 sigue abierto** —publica el título de otra campaña— y sacarle la marca sería **declarar
validado lo que está en investigación**. Decilo en el reporte con esas palabras.

### C.1 · Medir el universo en vivo, y sólo eso

Un diagnóstico de **sólo lectura** que cruce `MARCADORES` contra **todos** los CSV y liste los tres
grupos **por lámina**, para que se vea dónde cae cada guion del deck.

- ⭐ **Aplicá `D-58`**: cuando dos casos hablan del mismo marcador, **manda el más nuevo**.
- ⛔ **Desarmá los `token_propuesto` con varios marcadores en una celda** —`V-125` tiene seis
  separados por ` / `—. Contar celdas en vez de marcadores da un número que no corresponde a nada.
- ⭐ **Control positivo**: si el cruce no reencuentra casos `exacto` conocidos, **aborta**; no
  reporta cero.
- ⚠ **El medidor de anoche corre sobre el snapshot del 31/08 y da 3.** ⛔ **Ese número no es de
  hoy** —el snapshot es anterior a la migración a `'*'` y a los `emin_*`—. Éste tiene que leer la
  **hoja viva**, y por eso **se escribe y no se corre**.

### C.2 · La función que levanta — escrita, no corrida

⛔⛔ **Sacar `_revisar` del `formato` NO alcanza:** `revisarASinValidar_` **repone la marca** a toda
fila cuyo `notas` contenga `SIN VALIDAR`. Es lo que pasó del 26/08 al 01/09 y estuvo ocho días en el
deck.

⇒ **Levantar un marcador son dos escrituras en la misma operación**: el `formato` **y** el
`SIN VALIDAR` de `notas` de esa fila. **Si una de las dos falla, no se hace ninguna.**

- **Sólo el grupo (a)**, con la lista explícita que produzca `C.1` — ⛔ **no un filtro que la
  recalcule al correr**: una lista congelada se puede auditar, un filtro cambia con los datos.
- ⭐ **`D-58` como gate**: la lista lleva su fecha y **se cruza contra los CSV posteriores antes de
  escribir**. Sin eso repite lo de `confirmarNumerosDeUnoAUno()`, cuya lista del 26/08 no pudo
  enterarse de `X-42` y `X-43` del 28/08.
- **Backup antes de escribir. Relectura después para verificar.**
- ⭐ **Y el control que importa: por identidad, no por conteo.** Tiene que decir **qué filas** cambió
  y **cuáles quedaron**, no cuántas. El defecto que costó esta semana fue un conteo que coincidía
  sobre filas equivocadas.

⛔ **No se corre.** El usuario la corre y compara contra el deck siguiente.

`verificador` al cerrar. Un commit.

---

## Parte D — El corte de la Agenda: medir y parar · **Sonnet** · effort normal · SÓLO LECTURA

**El seed dice que la Agenda corta por `D` (`Fecha`, el encuentro).** Pero el deck de `secco` del
06/09 publica a **Fernán Quirós, encuentro `08/09`**, dentro de un informe cuyo encabezado cierra el
**`03/09`**. ⇒ **Con el corte por `D` esa fila no puede entrar.**

**Hipótesis a medir, sin arreglar nada:** la hoja viva **todavía corta por `E`** (`Fecha de envío`),
porque el cambio está en el seed y **el seed no repara lo ya creado**.

- Escribí el diagnóstico de **sólo lectura** que reporte **por qué columna corta hoy** esa solapa y
  **qué filas trae** con la ventana del informe.
- ⭐ **Control por identidad:** con el corte por `D` y la ventana correcta, **Sabor tiene que entrar
  y Quirós tiene que quedar afuera**. ⛔ **Un control que cuente siete da verde sobre las siete
  equivocadas** — ya pasó, está medido, y es el motivo de que esto se mida por nombre.
- ⛔ **No cambies `MAPEO`, ni el seed, ni corras nada.** Si la hipótesis se confirma, el arreglo es
  una migración de una celda y **la decide el usuario**.

Un commit.

---

## El reporte

1. La tabla de la Parte 0.
2. Una fila por parte: parte · estado · commit · una línea.
3. **«Para correr»** — qué función, en qué orden, y **qué tiene que dar** para valer.
4. **«Bloqueado, decide el usuario»** — la pregunta exacta, una línea.
5. **Lo que encontraste y no estaba en el prompt.** ⭐ **Y si este prompt vuelve a citar un bloque
   sin su cancelación, decilo**: es la falla que se está corrigiendo.

## Orden

```
0 → A (Opus)    ← primero: deja el árbol limpio
    B (Sonnet)
    C (Opus)    ← el trabajo real; si sólo entra una además de A, es ésta
    D (Sonnet)  ← ⚠ la primera que se cae
```
