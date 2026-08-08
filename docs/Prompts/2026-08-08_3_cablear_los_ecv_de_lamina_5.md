# Cablear los `ecv_*` de la lámina 5 — el primer lote del `cableador`

**Subagentes que usa este prompt:** `verificador` **antes** de la Parte 0, sobre este mismo
archivo. `cableador` en la Parte B. **Requiere reiniciar la sesión** para que se carguen.

**Un objetivo.** Que la lámina 5 deje de publicar porcentajes sin sus numeradores. **Ningún
`.gs`.** Filas de `MARCADORES` y una corrida de verificación.

**Por qué este lote y no los diez primeros de la lista.** Completan **una lámina entera**,
comparten universo y comparten fuente, así que **un error de criterio se ve en los nueve juntos**
y no disperso en diez tokens sin relación. Y es la lámina donde el error ya se cometió una vez.

---

## Antes de la Parte 0 — el `verificador`

Correr el `verificador` sobre este archivo. Su reporte **no habilita la ejecución**: vuelve al
usuario. **Interesa especialmente su pregunta de universo** —de qué filas sale cada número—,
porque es la que esta lámina ya falló.

## Parte 0 — el lote, enumerado (sólo lectura, reportar y parar)

`0.1` · **La lista exacta.** Enumerar los `ecv_*` de la lámina 5 **sin fila en `MARCADORES`**.
El conteo de anoche dio **nueve**: **confirmarlo o corregirlo**, con los nombres. Los siete
numeradores conocidos son `ecv_inscriptos`, `ecv_asistentes` y los cinco `ecv_insc_*`.

`0.2` · **⚠ Separar a `ecv_barrio1-3` del resto, si están en la lista.** El `_18` decidió que
salen de **la misma lista** que `ecv_barrios`, y eso **no es un campo**: es **una posición dentro
de una lista**. Reportar si la operación de lista sabe devolver la posición N o si haría falta
otra cosa. **Si hace falta otra cosa, salen del lote** y se cablean los que sí se pueden. **No
inventar una operación para completar un número redondo.**

`0.3` · **Para cada token del lote: que exista la fila en `MAPEO`** para su
`(base, solapa, campo_logico)`. **El que no la tenga sale del lote y se reporta** — no se inventa
el mapeo.

`0.4` · **De qué operación es cada uno.** Los cinco `_pct` ya existen y **no se tocan**; lo que
falta son sus numeradores. Reportar qué operación de las que el motor tiene le corresponde a cada
token del lote, y **si alguno necesita una que no existe, sale del lote**.

`0.5` · **Los valores esperados, antes de escribir nada.** Para cada token del lote, el número que
tiene que dar con el filtro de JM puesto, medido contra la base. **Es contra esto que se verifica
después** — un valor calculado después de cablear no verifica nada.

`0.6` · **Los cruces obligatorios**, que el `cableador` tiene escritos: los `[MANUAL]` y las `[?]`
de `CONFIG_INFORMES.md`, y `PENDIENTES_consistencia.md`. **Un token que toca un `[MANUAL]` no se
cablea: se reporta.**

**Reportar `0.1`–`0.6` y parar.**

---

## Parte A — la regla que no se negocia

`A.1` · **Cada fila nace con `filtro = figura=Jorge Macri`.** Es la regla permanente que reemplazó
al bloqueo del `cableador`: todo token que lea `rdv` nace con su filtro declarado. **Una fila del
lote sin filtro es el error del 07/08 otra vez, multiplicado por nueve.**

`A.2` · **Y antes de escribir cada filtro, que su campo esté en `MAPEO`.** Un filtro propio con
campo no mapeado falla; el heredado se ignora en silencio. Está escrito en `CLAUDE.md` §4 y en el
`cableador`.

## Parte B — cablear

`B.1` · El `cableador`, un token por vez, con su condición de corte. **No pisar ninguna celda que
ya traiga valor**, y **no tocar las seis filas existentes** del `_13`.

`B.2` · **Verificación dirigida por token** contra el valor de `0.5`. **Una sola corrida completa
al final del lote**, no una por token.

`B.3` · **Si un token da distinto de lo esperado, se revierte esa fila y se sigue con el
siguiente.** Al final se reporta cuáles quedaron. **No dejar una fila escrita dando mal.**

## Parte C — verificar la lámina, no los tokens

`C.1` · **Los cinco `_pct` tienen que seguir dando lo mismo que anoche.** Si un numerador nuevo
mueve un porcentaje que ya estaba bien, el numerador está mal o el porcentaje nunca estuvo bien.
**Cualquiera de las dos cosas es un hallazgo y se para.**

`C.2` · **La coherencia interna de la lámina, que es la prueba que ningún token pasa solo:** la
suma de los cinco `ecv_insc_*` contra `ecv_inscriptos`. **Si no cierran, decirlo aunque los nueve
tokens hayan resuelto** — nueve números correctos que no suman es exactamente el modo de falla que
este proyecto persigue, y ningún control por token lo detecta.

`C.3` · Cuántas filas de `FALTANTES` quedan, contra las 264 de anoche.

## Commits

Documentación aparte. Las filas de `MARCADORES` no son un commit: van a la bitácora con lo que
midió `B.2`.

## Verificación

Se cierra cuando la lámina 5 publica sus numeradores, los cinco porcentajes no se movieron, y
`C.2` cierra o está reportada.
