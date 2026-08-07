# Las láminas escondidas no entran a la corrida

**Un objetivo.** Código. **Higiene**, no un escalón de la escalera: no lleva ID `T<tramo>.<n>`.
Va **antes** de `T2.1.1`, porque `T2.1.1` escribe una barrida final sobre los tokens que
quedaron y no conviene que nazca pintando láminas que no se emiten.

**Qué está mal.** `mapaDeTokens_` (`Armonizar.gs`) **excluye las láminas escondidas** desde el
16/08 — por eso el denominador de la plantilla JM es **172**. Las funciones que usa
`generarInforme` **no miran `isSkipped()`**, así que la corrida ve **195**: los 23 tokens de la
lámina 10 de M2, escondida el 14/08 con backup y a propósito. `HANDOFF_CODE.md` ya tiene
anotada la diferencia entre 195 y 172 como *"no está explicado"*. Ésta es la explicación.

**Qué produce hoy:** 23 tokens resueltos y pintados sobre una lámina que no se emite, y 23
filas de `FALTANTES` que nadie quiere ver. No es un problema de tiempo —el costo está adentro
de `resolverMarcadores`, que resuelve por `informe_id` y no por lámina— es de exactitud.

---

## Parte 0 — premisas (sólo lectura, reportar y parar)

`0.1` · **Los recorridos de la corrida.** Confirmar cuáles de los que usa `generarInforme`
—`mapaTokenObjectId_`, `tokensPorSlide_`, `tokensDeSlide_`— miran `isSkipped()` y cuáles no.
La lectura de afuera dice que ninguno; que lo diga el código.

`0.2` · **Qué se estaría excluyendo, medido con lo que ya existe.** `mapaDeTokens_` ya
devuelve `laminas_escondidas`, `tokens_en_laminas_escondidas` y
`cuantos_en_laminas_escondidas`. Usarlo sobre la plantilla JM en vez de contar a mano.
Reportar la lista.

`0.3` · **Un bloque repetible puede heredar el escondido.** `duplicate()` copia el estado de
la slide modelo. Si el modelo de una sección repetible estuviera escondido, todas sus copias
lo estarían y el filtro se comería ítems reales. Verificar si alguna slide modelo de `jm` está
escondida hoy. **Si lo está, se reporta y se para**: el filtro cambia de forma.

`0.4` · **Quién más llama a estas funciones.** `tokensPorSlide_` vive en `Armonizar.gs` y
puede tener consumidores de inventario que **necesitan** ver todo. Greppear antes de tocarla
(`CLAUDE.md` §1): si los tiene, el filtro va **en el punto de llamada de `Generador.gs`**, no
adentro de la función.

**Reportar `0.1`–`0.4` y parar.**

---

## Parte A — el filtro

`A.1` · **No escribir un quinto recorrido.** `Armonizar.gs` ya tiene la forma correcta,
incluido el `try/catch` que trata un servicio sin `isSkipped` como visible. Reusarla; si hace
falta un helper, uno solo y con el motivo escrito arriba.

`A.2` · **Dónde va el filtro** — lo decide `0.4`: adentro de la función si nadie más la usa,
en el punto de llamada de `Generador.gs` si alguien la usa para inventariar.

`A.3` · **Nada se excluye en silencio** (`D-21`). El resultado de la corrida dice **cuántos
tokens quedaron afuera por lámina escondida y de qué láminas**. Una exclusión que no se
reporta es indistinguible de un token que se perdió.

`A.4` · **Lo que se anota.** La explicación de los 195 contra 172 va a
`PENDIENTES_consistencia.md` —es el dueño de la inconsistencia abierta— y el handoff deja de
decir que no está explicado.

**Fuera de alcance:** no se toca `T2.1.1`, no se muestra la lámina escondida, y no se cambia
ningún otro denominador del repo.

---

## Cuándo está hecho

Verificación **barata, sin corrida completa**: `mapaTokenObjectId_` sobre la plantilla JM
devuelve **172** y no 195, y la lista de excluidos coincide con la de `0.2`. La corrida
completa la corre el usuario cuando toque, no este prompt.

## El reporte

1. `0.1`–`0.4`, y en particular si alguna slide modelo está escondida.
2. Dónde quedó el filtro y por qué ahí.
3. Los dos números después del cambio.
4. Qué decisiones tomaste solo.
5. Qué premisa de este prompt resultó falsa, si alguna.

Sin trailer `Co-Authored-By`.

**Modelo:** Opus.
