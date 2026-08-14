# 2026-08-14_4 — Las decisiones sueltas del 13–14/08

> **Estado:** no ejecutado · **reemplaza:** nada · **subagente:** ninguno
>
> **Objetivo único:** que ninguna decisión tomada en conversación entre el 13 y el 14/08 quede
> sin destino en el repo. Son cinco escrituras chicas y un alta ya medida.
>
> **No cablea ningún token, no toca ninguna plantilla, no migra nada.**

---

## Por qué van juntas

Cada una por separado no justifica un prompt, y todas juntas comparten el mismo riesgo: una
decisión que vive sólo en la conversación se pierde, y la próxima corrida la contradice sin
que nadie se entere. Ya pasó dos veces esta semana — una medición de `R-22` del 09/08 congelada
en el seed, y un `uso = fuente` revertido por el sembrador.

---

## Parte A — verificar los destinos, **sólo lectura** · modelo: **Sonnet** · effort: normal

**No editar nada. Termina en reportar y parar.**

1. **Los números libres.** El último `R-NN` de `docs/REGLAS_NEGOCIO.md` y el último `S-NN` de
   `docs/SUPUESTOS.md`, medidos contra el archivo. **`R-26` está pedido por el prompt del "1 a
   1", que todavía no se ejecutó:** si ya corrió cuando esto se ejecute, el número está tomado
   y hay que seguir. No dar ninguno por libre sin mirar.

2. **Si alguna ya está escrita.** Buscar las cinco en sus destinos antes de agregarlas. Escribir
   dos veces la misma decisión es exactamente lo que produce las reversiones silenciosas que
   `CLAUDE.md` §7 viene a evitar.

3. **La forma de cada destino.** `SUPUESTOS.md` es una tabla de cinco columnas —ID, supuesto,
   evidencia, síntoma que lo desmiente, cómo se revierte—; respetarla, no inventar formato.

**Reportar y parar.**

---

## Parte B — escribir · modelo: **Opus** · effort: alto

### 1 · `S-NN` — el deck sólo lo lee quien lo desarrolla

Declarado por el usuario el 14/08/2026. **Síntoma que lo desmiente:** alguien pide un deck, se
comparte, o se presenta.

La columna de "cómo se revierte" es la que importa, porque lista decisiones que hoy se toman al
amparo del supuesto y que dejan de valer con él:

- una lámina puede vivir en la plantilla **sin cablear**, publicando `«FALTA:token»` hasta que
  le toque — con lector externo, o se cablea o se esconde;
- las migraciones **no mantienen compatibilidad hacia atrás** ni régimen de transición;
- **`---` reemplazando a `«FALTA:token»`** es una decisión pensada para un deck que se muestra;
  mientras el supuesto valga, el `«FALTA:»` crudo dice más.

**Ninguna de esas decisiones se toca acá.** El supuesto está vivo; sólo quedan listadas para
que el día que caiga se encuentren.

### 2 · `R-NN` — el alcance lo aporta sólo Meta

Decisión del usuario del 14/08, **y confirmada por la estructura de la base**, que es lo que la
vuelve regla y no preferencia: `reuniones/Base_Digital` titula el bloque `Alcance Meta
Convocatoria` y `Alcance Meta Post` con todas las letras, y **no existe banda de alcance de
Google ni de Programmatic**.

Con su consecuencia, que es la mitad útil: el `Alcance` que la solapa POST archiva bajo la
banda `Acumulado` **está mal rotulado** — el número viene del bloque `Alcance Meta Post`, y se
verificó igual celda a celda. La lámina del "1 a 1" muestra ese alcance en la tarjeta de Meta
porque es de Meta, no por conveniencia de diseño.

### 3 · `CONFIG_INFORMES.md` — el desglose por herramienta es sólo de `jm`

Decisión del usuario del 13/08. Va en la sección del informe `jm`, **con el pendiente anotado
al lado**: `secco` tiene su propia lámina de "Uno a uno — resultados plataforma" con los
`u1_bench_*` marcados, y todavía no está decidido si se retira, si se cablea con los mismos
tokens, o si queda como está.

### 4 · `CONFIG_INFORMES.md` — SECCO repite casi todo JM

Declarado por el usuario el 14/08: el informe SECCO incluye casi todo lo de JM, **a veces
actualizado un día después**. Dos consecuencias que hay que dejar escritas, porque no son
obvias:

- el desfasaje **no genera tokens nuevos**: es la misma medida con otra ventana, y la ventana
  ya se resuelve por informe;
- es el argumento más fuerte a favor del vocabulario global, y por eso el `_2` lo va a medir en
  vez de darlo por cierto.

### 5 · El alta de las 20 solapas de `reuniones`

`Base_Digital` en `referencia`, las otras 19 en `ignorar`. Ya está todo medido.

**Cada fila `ignorar` lleva en `notas` la medición y su fecha, no el veredicto** — *"0 de 25
Uno a uno (medido 14/08/2026)"* para las tres que se abrieron, y el motivo concreto para las
otras 16. Una nota que dice sólo *"no sirve"* es indistinguible de una regla, y quien la lea en
noviembre no va a poder saber si sigue siendo cierta. Es el mismo modo de falla que revirtió
`CAMPAÑAS_DESGLOCE_DIGITAL` esta semana.

### 6 · Cierre

`tools/listas.js`, `BITACORA.md` y `HANDOFF_CODE.md`. Commits separados entre documentación y
configuración, y `git push`.

---

## Lo que este prompt **no** hace

- **No escribe `R-26`.** Esa regla tiene su propio prompt, con su propia Parte A de medición.
- **No decide qué pasa con la lámina de SECCO.** La anota como pendiente.
- **No implementa `---` ni `-`.** Los menciona dentro del supuesto, nada más.
- **No toca el sembrador.** Eso es el `_3`.
