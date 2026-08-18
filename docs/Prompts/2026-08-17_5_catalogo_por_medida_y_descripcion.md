# 2026-08-17_5 — `MARCADORES.descripcion` y el catálogo agrupado por medida

> **Estado:** no ejecutado · **reemplaza:** nada · **subagente:** ninguno
>
> **Objetivo único:** que el catálogo deje de ser una lista de tokens y pase a ser un catálogo de
> **medidas con sus dimensiones**, y que cada marcador pueda decir **qué mide** en la misma fila
> donde está definido.
>
> ⛔ **NO se llena ninguna descripción en este prompt.** Primero la columna y el generador; las
> descripciones se llenan **por tandas, empezando por los 42 migrados**, y eso es otro prompt.
> Mezclarlo sería escribir 78 textos contra un formato que todavía no se probó.

---

## La decisión, y de dónde sale

**Decisión del usuario, 17/08/2026**, siguiendo el estándar de los *semantic layers* (dbt, Cube,
LookML). Cuatro puntos, y cada uno resuelve algo que hoy está roto o ausente:

| # | qué | qué resuelve |
|---|---|---|
| 1 | **`descripcion` es columna de `MARCADORES`** | la descripción vive **junto a la definición**, no en un glosario paralelo |
| 2 | **el catálogo se agrupa por medida** | una fila por token **oculta lo que la migración ganó** |
| 3 | **sin descripción → indocumentado**, contado | es el equivalente del test de dbt |
| 4 | **estado explícito**: publica / no publica, con motivo | hoy `config` dice otra cosa y se confunde |

### Por qué la descripción va en la hoja y no en un `.md`

**El repo ya tiene el contraejemplo y costó caro:** `docs/CATALOGO_tokens.md` se regenera y por eso
sirve; todo `.md` escrito a mano sobre el contenido de una hoja **se desincronizó**. Una
descripción en un glosario aparte envejece en la primera migración y **nadie se entera** — es
exactamente el modo de falla de §4: *"un dato medido una vez y citado tres veces"*.

⚠ **Y la razón por la que esto es más fuerte que una preferencia:** la descripción es **lo único
del marcador que una máquina no puede derivar**. La base, la solapa, la operación, el filtro y las
dimensiones se leen de la fila; *"qué es esto y por qué existe"* sólo lo sabe quien lo cableó, y
**se pierde el día que esa persona no está**.

---

## Parte 0 — medir antes de tocar

**No editar nada todavía.**

1. **¿Existe ya una columna `descripcion` o parecida?** Greppear `descripcion`, `descripción`,
   `glosario` sobre `*.gs` y sobre el `SEED_MARCADORES_`. ⚠ **Hoy `MARCADORES` tiene una columna
   `notas`** —15 columnas, la última— y **hay que decidir explícitamente si son la misma cosa o
   no**, no asumirlo.
   - **Lo medido al escribir este prompt:** `notas` está poblada y contiene **historia de la
     decisión** —fechas, prompts, validaciones, *"SIN VALIDAR - demo 12/08"*—, no descripción
     funcional. **Son cosas distintas**: `notas` dice *por qué está así*, `descripcion` diría *qué
     mide*. Verificarlo y reportar si el muestreo lo desmiente.
2. **El estado de arranque, contado:** cuántos marcadores hay (78 al 18/08), cuántos con
   `dimensiones` poblada (42), y **cuántos quedarían indocumentados el día uno** — que es 78,
   porque la columna nace vacía. **Ese número es el punto de partida de la medición del punto 3**,
   y sin él la mejora no se puede afirmar.
3. **Los diez que no publican.** El catálogo actual declara `config` **78 de 78** mientras el motor
   publica **diez en error**. **Medir cuáles son y por qué**, porque son el insumo del punto 4.

---

## Parte A — la columna

1. **`descripcion` entra a `MARCADORES`** por `COLUMNAS_DELTA_`, como se agregó `dimensiones`.
2. ⚠ **Entra al `SEED_MARCADORES_` también, aunque nazca vacía.** No es prolijidad:
   `upsertPorClave_` reescribe la fila entera con `(h in obj) ? obj[h] : ''`, así que **una columna
   que el seed no conoce se borra sola** en cuanto cambie cualquier otra. Es la lección de `D-31`
   con `encabezado`, textual.
3. **Dónde va: al final, después de `notas`.** Insertarla en el medio corre las letras de columna,
   y `MAPEO` referencia columnas **por letra** — es el caso que `D-31` existe para vigilar.
4. **`docs/ESCRITORES.md`**: fila en §1 y en la tabla de propagación §1 bis, diciendo **quién puede
   escribirla**. ⚠ **La propagación se decide y se escribe, no se hereda**: `MARCADORES` va por
   `upsertPorClave_` —el seed corrige—, así que **una descripción escrita a mano en la hoja se
   pisa** en la próxima siembra si el seed la tiene vacía. **Eso hay que resolverlo en este prompt,
   no descubrirlo después.**
   - **Recomendación, que el prompt propone y el usuario confirma:** que el seed **no toque
     `descripcion`** — es texto de negocio que una persona escribe, y el seed no tiene qué decir
     ahí. Requiere excluirla explícitamente, porque el default de la familia es lo contrario.

---

## Parte B — el catálogo agrupado por medida

**Hoy `tools/catalogo.js` emite una fila por token. Eso es lo que hay que cambiar.**

La unidad pasa a ser **la medida** —`base_id` + `solapa` + `campo_logico` + `operacion`—, que es
exactamente con lo que agrupa `testigoDeImpresiones()`. Por cada medida:

```
MEDIDA  Impresiones · looker/DIGITAL · SUMA
  descripción   <de la fila; si las filas discrepan, se dice>
  dimensiones   ambito: jm | gcba      plataforma: meta | google | programmatic
  tokens        imp_total, imp_meta, imp_google, imp_prog,
                gcba_imp_total, gcba_imp_meta, gcba_imp_google, gcba_imp_prog
  estado        8 publican
```

⚠ **Lo que esta forma hace visible y la lista plana escondía:** que **ocho tokens son una medida
con dos dimensiones**. Es el resultado de `D-33` y hoy **no se ve en ningún lado** — el catálogo
sigue mostrándolos como ocho cosas distintas, que es justo la lectura que la migración vino a
eliminar.

⚠ **Y el caso que hay que decidir, porque no es obvio:** una medida cuyos marcadores tienen
**descripciones distintas**. Puede ser un error (dos personas describiendo lo mismo) o legítimo.
**Que el generador lo reporte y no elija en silencio** — elegir la primera es exactamente cómo se
pierde un hallazgo.

### Las dimensiones se leen de las filas, no de `DIMENSIONES_`

**El catálogo dice qué dimensiones USA esa medida**, no cuáles existen. Son preguntas distintas y
mezclarlas daría un catálogo que promete cortes que ningún token publica.

---

## Parte C — indocumentados y estado

### 1 · Sin descripción, indocumentado — **contado, no escondido**

**El marcador sale igual en el catálogo, marcado.** No se omite: un catálogo que esconde lo
indocumentado hace parecer que está todo documentado, que es peor que el hueco.

**Y el total se reporta arriba**, como el `cuadre` de `verificarEncabezadosDeMapeo()`: *"78
marcadores · 0 con descripción · **78 indocumentados**"*. Es el número que las tandas de llenado
tienen que bajar, y **el día uno es 78 a propósito**.

### 2 · Estado explícito: publica / no publica, **con el motivo**

⚠ **Esto NO es la columna `config`, y la distinción es el acierto de la primera versión del
catálogo — hay que conservarla.** `config` dice *"la fila está bien armada"*: el cruce estático da
**78 de 78** mientras el motor publica **diez en error**, porque ésos fallan **en ejecución**.

**Entonces el estado nuevo necesita una corrida**, y eso hay que decirlo en el prompt en vez de
descubrirlo: el generador es estático y **no puede saber solo** si un token publica. Dos salidas, y
**el prompt no elige**: se mide cuál es más barata y se reporta.

- **`FALTANTES`**, que la corrida ya escribe. ⚠ **Lista por ítem, no por token**, con sufijo
  `@<ítem>` — **contar ahí mezcla láminas** (`CLAUDE.md` §4).
- **`CORRIDAS`**, que guarda `faltantes` y `tokens_reemplazados` por corrida.

**Y si no hay corrida disponible, el catálogo dice `estado: sin medir`** — nunca `ok`. Un estado
inventado sobre un token que no publica es el modo de falla más caro del proyecto.

---

## Parte D — verificar

1. **Ningún token desaparece.** Los **78** tienen que seguir apareciendo, ahora dentro de su
   medida. **La suma de tokens de todas las medidas = 78**, y el generador lo afirma. ⚠ Es la misma
   clase de control que la partición de la tanda 4: **una suma exhaustiva sobre el universo**.
2. **Las 8 medidas de `looker/DIGITAL/Impresiones/SUMA` caen en UN grupo**, no en ocho.
3. **El conteo de indocumentados es 78** el día uno, y baja sólo cuando se llenen.
4. **`node tools/listas.js` pasa** — no se agrega hoja, pero la columna toca `SEED_MARCADORES_`.
5. **El catálogo regenerado declara de qué snapshot salió**, como hoy.

---

## Lo que este prompt **no** hace

- ⛔ **No escribe ni una descripción.** Es lo primero que se va a querer hacer y es lo que hay que
  no hacer: el formato no está probado hasta que el generador corra.
- **No toca `dimensiones` ni ningún corte.** La migración está cerrada (42 de 48).
- **No renombra ningún token.**
- **No toca plantillas ni `MAPEO`.**
- **No cambia `config`** — se le suma un estado, no se la reemplaza.
