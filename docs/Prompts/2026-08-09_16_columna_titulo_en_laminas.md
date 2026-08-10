# `_16` · `LAMINAS.titulo` — que la lámina se reconozca desde la hoja

> **Modelo: Opus, effort alto.** Subagente `verificador` antes de arrancar, sobre este archivo.
> Nace del `15.1` §1: el usuario decide agregar la columna. El `_15` **no** la siembra — ver §0.3.

---

## 0 · Lo que este prompt fija antes de tocar nada

### 0.1 · La decisión del usuario (09/08)

Agregar la columna al esquema de `LAMINAS`. Motivo: **una fila de `LAMINAS` hoy no permite saber
de qué lámina habla.** Tiene id, informe y orden, y el orden es reportado y no autoritativo. Para
mirar la hoja y entender qué se está configurando hay que abrir el deck y contar.

Y hay un antecedente escrito que esto mitiga: `PLAN.md` §2 punto 5 —*«el deck deja de ser
autodescriptivo, riesgo asumido»*—. La defensa declarada ahí es que la hoja se siembra leyendo el
deck. Con un texto reconocible en la fila, esa defensa deja de depender de que el id sobreviva.

### 0.2 · El nombre: `titulo`, y es decisión propia del coordinador

El `15.1` §1 dejó la disyuntiva abierta —`titulo` o `primer_texto`— porque lo que la plantilla da
no siempre es un título. Se resuelve así, y es una decisión mía, no una medición:

**Se llama `titulo` y se puebla por dos vías con precedencia:**

1. el **placeholder de título** de la lámina, si existe y tiene texto;
2. si no, el **primer bloque de texto no vacío** en orden de lectura.

`primer_texto` nombraría la vía 2 y describiría mal la vía 1. `titulo` nombra **para qué existe la
columna** —reconocer la lámina—, que es lo que pidió el usuario. La vía que produjo cada valor no
va en la celda: va en el conteo del reporte.

**Es reversible y la Parte A trae el dato que lo decide:** si resulta que la mayoría de las 51
láminas no tiene placeholder de título y todo sale por la vía 2, el nombre vuelve a discutirse.
Reportarlo, no decidirlo.

### 0.3 · Las tres reglas que la columna hereda sin discusión

- **Reflejada, nunca decidida.** Sale de la plantilla, igual que `escondida` (`B.3` del `_11`).
  La plantilla es autoritativa; la hoja es registro reparable.
- **Reportada, nunca autoritativa.** Mismo caveat que `orden_plantilla`: **ninguna decisión del
  motor puede depender de este texto.** No se filtra, no se matchea, no se usa para elegir lámina.
  Si en algún momento hace falta que el motor conozca el título, eso es otra columna y otra
  decisión.
- **Los tokens se copian crudos.** Si el título de la plantilla dice `Resumen {{periodo}}`, la
  celda dice `Resumen {{periodo}}`. Resolver el token acá sería congelar una foto — el mismo
  argumento que el `15.1` usa para dejar `cobertura` y `falta` al `_14`.

### 0.4 · Lo que este prompt NO hace

- **No siembra ninguna otra columna de `LAMINAS`.** El `_15` con su `15.1` sigue siendo el dueño
  de `seccion_id`. Este prompt agrega la columna y la puebla; nada más.
- **No escribe sobre ninguna plantilla.** Lee. No sella, no anexa notas, no llama `setText`.
- **No toca `modo`, `itera_sobre`, `filtro`, `rol`, `cobertura` ni `falta`** — el `15.1` ya las
  dejó fuera de alcance y este prompt no reabre eso.

---

## A · Verificación de premisas — sólo lectura, **reportar y parar**

Este prompt es una hipótesis hasta que la Parte A la confirme. Si cualquiera de A.1 a A.4 sale
distinto de lo escrito acá, **parar y reportar**: el esquema del que dependen las Partes B y C
sería otro.

**A.1 · El esquema declarado.** Listar `HOJAS_CONFIG_.LAMINAS.headers` en orden, con su índice.
Confirmar que son 13 nombres y que `notas` es el último.

**A.2 · La rama que toma la hoja hoy.** Confirmar si `COLUMNAS_DELTA_` tiene o no entrada
`LAMINAS`. Si no la tiene: decir qué rama de `aplicarInstalacion_` recibe la hoja, y **qué le pasa
a las 51 filas si se agrega un nombre a `headers` sin agregar antes la entrada al delta.** Es el
modo de falla que ya documentaron `SECCIONES`, `CAMPANAS` y `REUNIONES` en sus comentarios: la
fila 1 se reescribe y los datos no se mueven, en silencio y sin fallar.

**A.3 · Los escritores por posición.** En `sellarPlantilla` hay dos lugares que arman filas de
`LAMINAS` como arrays literales —el de las láminas a sellar y el de las filas a reparar—.
Reportar cuántas posiciones tiene cada uno y **qué columna recibiría cada valor si se inserta una
columna nueva en el índice 5**. Reportar también si el objeto que junta las láminas que ya tienen
ancla conserva el `slide` o sólo el orden y el ancla: de eso depende que la rama de reparación
pueda leer un título.

**A.4 · Los lectores.** Confirmar que `leerLaminas_` mapea por encabezado y no por índice.
Greppear cualquier otro acceso a `LAMINAS` —lectura o escritura— que dependa de la posición de una
columna, en `.gs` y en `tools/`.

**A.5 · De dónde saldría el título, medido.** Sobre las plantillas vivas de los informes activos,
**sin escribir nada**, y para cada una de sus láminas: si tiene placeholder de título con texto no
vacío; si no, si tiene algún shape con texto no vacío; si ninguna de las dos. Reportar:

- los tres conteos, por informe;
- los primeros 60 caracteres de **cinco ejemplos de cada categoría**;
- la lista completa, por `lamina_id`, de **las láminas sin ningún texto**. La lámina 4 de `jm` es
  una pregunta abierta del handoff —¿es de imagen o es un hueco?— y esta medición la contesta de
  paso;
- cuántos de los títulos encontrados **contienen `{{`**.

**A.6 · Una contradicción documental, para reportar y no corregir todavía.** El comentario de
`LAMINAS` en `Instalar.gs` lista `seccion_id` junto a `modo`, `itera_sobre` y `filtro` como
«vacío = hereda de `SECCIONES`». `PLAN.md` §2 dice lo contrario con todas las letras: identidad y
estado propio —`seccion_id`, `escondida`, `origen`— **no se heredan nunca**. Transcribir las dos
citas con su ubicación.

No es una nota al pie: **si `seccion_id` heredara, sembrarlo sería exactamente lo que el `15.1`
objeta para `modo`** — declarar en dos lugares y romper la herencia. El `_15` entero descansa en
que `PLAN.md` tiene razón y el comentario está viejo. Reportar cuál es la fuente de verdad y
esperar; la corrección va en la Parte D o en el `_15`, no acá.

**Fin de la Parte A: reportar y parar.**

---

## B · El esquema, en un solo commit

El orden importa y no es estético:

- **B.1 · La entrada del delta, primero.** `COLUMNAS_DELTA_.LAMINAS = [{ nombre: 'titulo',
  indice: 5 }]`, con comentario que explique por qué existe la entrada — mismo molde que el de
  `SECCIONES`: sin ella la hoja cae en la rama que reescribe la fila 1 sobre 51 filas ya
  sembradas.
- **B.2 · Recién después, `'titulo'` en `HOJAS_CONFIG_.LAMINAS.headers`**, en la posición 5:
  `lamina_id · informe_id · seccion_id · orden_plantilla · titulo · escondida · …`. Va ahí y no
  antes de `notas` porque la columna existe **para que la lea una persona**, y una persona lee de
  izquierda a derecha: id, informe, orden, qué lámina es. `notas` sigue siendo la última.
- **B.3 · Los dos arrays de `sellarPlantilla` pasan a 14 posiciones**, con el título en la 5. Si
  A.3 confirma que la rama de reparación no tiene el `slide` a mano, guardarlo al armar la lista
  de láminas con ancla. Una fila reparada sin título es aceptable sólo si el motivo se reporta.
- **B.4 · Antes de aplicar: correr la instalación en modo cálculo** —el que usa *Estado de
  configuración*— y **pegar el diff en el reporte**. Aplicar recién después, y comparar el
  encabezado real de la hoja contra lo esperado. El precedente de `MARCADORES.filtro` está escrito
  en `Instalar.gs`: la columna terminó en un índice distinto del declarado y no importó, porque
  todo se lee por nombre. **Si acá pasa lo mismo, se deja como quedó y se anota** — mover una
  columna de una hoja curada es el riesgo que el delta existe para evitar.

---

## C · El poblador

Función nueva en `Sellador.gs`. **Greppear el nombre antes de escribirlo** (`CLAUDE.md` §1).

```
refrescarTitulosLaminas(opciones)   // opciones.dryRun === true, como sellarPlantilla
```

**Qué hace:** abre las plantillas de los informes activos, arma `lamina_id → titulo` leyendo el
ancla de cada lámina, y escribe **sólo la columna `titulo`** de las filas que ya existen,
buscándolas por `lamina_id`.

**Qué no hace, y es la mitad del diseño:** no crea filas, no borra filas, no escribe ninguna otra
columna, no toca las notas del orador, no toca la plantilla. Un `lamina_id` de la hoja que no
aparece en ninguna plantilla **se reporta y se saltea** — ése es el caso «fila sin ancla» que
`verificarLaminas()` ya sabe nombrar, y es el peor de los cinco; este prompt no lo repara.

**El helper**, también con grep previo:

```
tituloDeLamina_(slide)   // vía 1: placeholder de título · vía 2: primer texto no vacío · '' si no hay
```

Normaliza con `R-10` —colapsar espacios y saltos, `trim()`, **preservando mayúsculas y
acentos**— y trunca a 120 caracteres. Si trunca, que se note en el valor.

**El reporte devuelve conteos, no una lista de 51:** escritas, sin cambio, vacías por falta de
texto, filas sin ancla, y **cuántas salieron por cada vía**. Ese último número es el que decide si
el nombre `titulo` se sostiene (§0.2).

**Ítem de menú** bajo Plantillas: *Refrescar títulos de `LAMINAS`*. Y **probar los dos caminos** —
CLI y menú—: `C.1` del `_11` ya se cobró un bug de diálogo por probar sólo desde el CLI.

---

## D · Verificación y documentación

- **`verificarLaminas()` gana un chequeo, en lista aparte.** Título de la hoja distinto del de la
  plantilla → `titulos_desactualizados`. **No suma al contador de `problemas`**: un título que
  cambió en el deck es información, no una hoja rota, y meterlo en el semáforo haría que la
  verificación diera rojo por una edición de texto.
- **`ESCRITORES.md` no tiene fila para `LAMINAS`.** Agregarla: dueño declarado del contenido, los
  escritores vivos, y el nuevo. Re-correr `node tools/escritores.js` y actualizar la matriz —
  el documento pide eso explícitamente al editar código que escribe hojas de registro.
- **`PLAN.md`: `D-24`** con la decisión, el régimen de la columna (§0.3) y por qué el nombre es
  `titulo`. Actualizar la fila de la tabla de fases de §2 que enumera las columnas de `LAMINAS`:
  hoy dice trece y va a decir catorce.
- **El comentario de `LAMINAS` en `Instalar.gs`** suma la columna. La contradicción de A.6 se
  corrige acá **sólo si la Parte A la confirmó y `PLAN.md` es la fuente de verdad**; si hay duda,
  queda como fila en `PENDIENTES_consistencia.md` y se decide despierto.
- **`BITACORA.md`**: entrada fechada con los conteos de A.5 y del refresco, y con la fecha y hora
  de lectura de las plantillas. Un conteo sin fecha envejece en silencio.
- **`CLAUDE.md` en el mismo commit** si algo del ruteo cambia.

### Criterios de aceptación — estructurales, no por lámina

1. Las 51 filas conservan lo que ya tenían. **Control positivo: las 7 filas con `escondida`
   marcada siguen siendo 7** (2 de `jm`, 5 de `secco`), y los `lamina_id` siguen en la columna 1.
   Si ese conteo se mueve, el delta no hizo lo que debía.
2. Toda lámina con texto tiene título en la hoja; toda lámina sin texto tiene la celda vacía **y
   figura nombrada en el reporte**.
3. Correr `refrescarTitulosLaminas()` dos veces seguidas: la segunda escribe cero.
4. `verificarLaminas()` sigue dando los mismos cinco desajustes que daba antes del cambio, y la
   lista nueva no altera el contador de problemas.
5. Un `dryRun` no escribe.
