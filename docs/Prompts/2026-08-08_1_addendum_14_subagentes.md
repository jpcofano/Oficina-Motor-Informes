# `14.1` · Addendum al prompt `2026-08-07_14_subagentes_verificador_y_cableador.md` — luz verde a A, B y C

**Luz verde.** La Parte 0 corrió y midió lo que tenía que medir. Se sigue con A, B y C, con los
cuatro ajustes de abajo. El prompt original no se edita.

---

## Los cuatro ajustes

`AJ-1` · **`0.3` dio negativo y eso reescribe `A.6`.** Un subagente **no ve el `CLAUDE.md` del
proyecto** — medido lanzando uno sin herramientas, devolvió que no tiene instrucciones de
proyecto en contexto. Entonces **"citar las convenciones por referencia" no existe como opción**:
cada archivo de subagente tiene que **decir qué archivos abrir, con la ruta**, y esa lectura es
su primer paso, no una sugerencia.

**Y la consecuencia que hay que escribir adentro del archivo, no sólo acá:** un subagente que se
saltea esa lectura **no está operando con las reglas del proyecto**, aunque parezca que sí. Es
el modo de falla propio de esta herramienta y conviene que esté nombrado.

`AJ-2` · **El `cableador` se desbloquea.** `B.1` lo dejaba frenado hasta que cerrara el universo
de figura. **Cerró anoche**: el filtro `figura=Jorge Macri` está escrito en las seis filas del
`_13` y verificado por el camino del motor. El archivo se escribe **sin el bloqueo**, y en su
lugar lleva la regla que lo reemplaza: **todo token que lea `rdv` nace con su filtro declarado.**
El bloqueo era temporal; la regla es permanente.

`AJ-3` · **`0.5` dimensionó el trabajo y le da un primer lote obvio.** De 264 filas de
`FALTANTES`, **206 son cableado puro y 58 fallan por datos**. El primer lote de diez **no se
elige por orden de lista**: son **los nueve `ecv_*` de la lámina 5** que el `_13` dejó
bloqueados y que ahora pueden cablearse. Motivo, y va escrito: son los que **completan una
lámina entera** —hoy publica porcentajes sin sus numeradores— y comparten universo, así que un
error de criterio se ve en los nueve juntos y no disperso en diez tokens sin relación.

`AJ-4` · **El `verificador` estrena con material real, y no es el `_11`.** `A.3` le pide
preguntar de qué filas sale cada número. **La primera corrida del `verificador` es sobre el
lote de nueve de `AJ-3`, antes de que el `cableador` los toque.** Si esa pregunta hubiera
existido hace una semana, la lámina 5 no habría publicado doce figuras durante quince días. El
`_11` sigue siendo buen material, pero el valor está en usarlo donde el error ya se cometió una
vez.

---

## Lo que no cambia

`A.1` y su lista blanca de `tools` como garantía del sólo-lectura. `A.5` y `B.6`, invocación
explícita por nombre. `B.3`, el camino de escritura declarado en `ESCRITORES.md` o el
`cableador` queda en sólo-propuesta. `B.4`, verificación dirigida por token y **una sola corrida
por lote de diez**. `B.7`, `familia_tokens` congelado.

`C.2` incorpora lo que midió `0.2`: versión **2.1.220**, `/agents` ya no crea nada, y los
agentes **se cargan al arranque** — un archivo nuevo con la sesión abierta no existe hasta
reiniciarla.

## Commits

Uno por parte. `git push` después de cada uno.
