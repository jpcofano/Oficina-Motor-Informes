# 2026-08-14_5 — El orden de los frentes va a `PLAN.md`

> **Estado:** no ejecutado · **reemplaza:** nada · **subagente:** ninguno
>
> **Objetivo único:** dejar en `docs/PLAN.md` el orden de los frentes abiertos al 14/08, en
> sus tres secciones de futuro. **No crea ningún documento nuevo de plan** — `CLAUDE.md` §7
> declara a `PLAN.md` dueño único de *"¿Qué sigue y en qué orden?"*, y §9 dice que es el único
> lugar donde vive el plan.
>
> **No cablea nada, no toca hojas de registro, no escribe reglas.**

---

## Parte A — leer las tres secciones, **sólo lectura** · modelo: **Sonnet** · effort: normal

**No editar nada. Termina en reportar y parar.**

1. **Qué hay hoy** en *Próximo*, *Planificado y bloqueado* y *Backlog*: los ítems, en su orden
   actual, y **cuáles ya están hechos** — un plan con ítems cumplidos adentro deja de leerse.

2. **Qué se superpone** con lo que este prompt viene a agregar. Si un frente ya está listado,
   **se actualiza en su lugar; no se agrega de nuevo**.

3. **La frontera entre las tres**, aplicada a lo que hay: la prueba de `CLAUDE.md` §9 es *si no
   podés decir qué lo desbloquea, es backlog*. Reportar todo ítem de *Planificado y bloqueado*
   que hoy **no nombre qué lo destraba** — ésos están en la sección equivocada.

**Reportar y parar.**

---

## Parte B — escribir · modelo: **Opus** · effort: alto

Ordenar es decidir dependencias, no transcribir una lista.

### Próximo — ordenado, con las dependencias dichas

**El criterio del orden, que hay que escribir junto a la lista:** la definición del vocabulario
va **antes que todo cableado nuevo**. Cada marcador que se crea con la estructura vieja es
deuda que se contrae sabiendo que es deuda. Una vez tomada la decisión, lo nuevo nace bien y lo
viejo se migra sin apuro — por eso la migración de los 51 no bloquea a nadie, pero la decisión
sí.

1. **El alta de las 20 solapas de `reuniones`**, con su censo volcado a un documento de
   evidencia en `docs/` antes de escribirla. Cierra el `_1`. *(Punto 5 del `_4`, frenado
   porque la medición existía sólo en un reporte de conversación.)*
2. **El sembrador deja de pisar un `uso` existente.** Va antes de la migración: ésa toca muchas
   filas de configuración, y hoy existe un mecanismo que puede revertirlas en silencio.
   *(`_3`.)*
3. **`C-64` — las dos capas de la base.** Filas contra agregado, y el deck a veces publica una
   fila de abajo. Va acá porque cambia **cómo se leen las fuentes**, no cómo se nombran: es
   independiente del vocabulario y condiciona todo lo que se cablee después. Explica el patrón
   `X-16`/`X-17` en tres canales.
4. **`_2` — censo de dimensiones y `D-NN` del vocabulario.** Es la decisión de estructura:
   una medida, y el corte como dimensión. Todo lo que se cablee antes de esto nace con el corte
   metido en el nombre.
5. **El piloto con una familia** — migrar una a `informe_id = '*'` y verificar que `jm`
   reproduzca los mismos números. Barato, y si no reproduce el plan se detiene acá.
6. **La letra manda, el título valida** — cada fila de `MAPEO` lleva el encabezado que espera
   encontrar en esa letra. Va **antes de `C-61`** porque le saca el filo: hoy insertar una
   columna corre todas las letras a su derecha y el mapeo apunta una más allá sin fallar. El
   título como testigo convierte eso en una falla ruidosa. La función que valida se difiere;
   poblar la columna ya mide, y esa medición puede encontrar mapeos ya corridos. *(`_6`.)*
7. **`C-61`** — el alta de columna que mueve 229 cuentas. **Bloquea el embudo de Call Center**,
   y antes de escribir hay que medir si el motor lee CC **por encabezado o por posición**: si
   es por posición, una columna nueva corre todo lo demás sin que nada falle.
8. **`R-NN` de los dos universos de Call Center** — `enc_*` filtra por tipo de llamado, `cc_*`
   no filtra. Prompt propio: es una regla, no un detalle de un cableado.
9. **`R-26`** — el "1 a 1" se comunica sólo por digital. Independiente de todo lo demás.
10. **`enc_impresiones` / `enc_visualizaciones` / `enc_clics`** — operación confirmada 4 de 4,
   ya con el vocabulario decidido.
11. **El embudo de Call Center** — depende de 7 y 8.
12. **`alcance` y `clics` de campaña destacada, y `m2_campanias`** como `LISTA + CUENTA(LISTA)`.
13. **La migración de los 51 marcadores, por tandas**, empezando por los nueve pares `gcba_*`:
    son el caso donde la dimensión ya está escrita en el `filtro` y sólo hay que sacarla del
    nombre. Cada tanda se compara contra la corrida anterior antes de la siguiente. **No
    bloquea a nadie:** lo nuevo ya nace con la estructura buena.
14. **El catálogo de tokens generado desde `MARCADORES`** — qué mide cada uno, de dónde sale,
    con qué operación y con qué filtro. **Es el objetivo declarado de todo esto:** que alguien
    del equipo arme una filmina eligiendo tokens documentados que dicen qué son y cómo se
    arman. Generado, no escrito a mano — escrito a mano se desincroniza en la primera
    migración.

### Planificado y bloqueado — cada uno nombra qué lo destraba

- **Los siete `ecv_*` ambiguos.** Destraba: la `D-NN` del `_2`. Es precondición de globalizar
  esa familia, no prolijidad.
- **Los estados `-` y `---`.** Destraba: decisión del usuario sobre si `---` reemplaza a
  `«FALTA:token»` en el deck. Anotar la salvaguarda pendiente — que el reporte de corrida siga
  distinguiendo *"no calculable"* de *"falló el cableado"* aunque el deck no lo haga. Ver
  `S-NN` del `_4`: mientras el deck lo lea sólo quien lo desarrolla, el `«FALTA:»` crudo dice
  más.
- **Los nombres de los tokens de la lámina del "1 a 1"**, más *"el desglose por herramienta es
  sólo de `jm`"*. Destraba: el `_2`.
- **`tipo` viaja con el ítem del encuentro**, y **qué consume hoy `LAMINAS`**. Son las dos
  piezas de *"que la lámina se use sólo en 1 a 1"*. Destraba: nada técnico; espera su turno.
- **Sellado y alta de la lámina en `jm`** (`L-052`+) **y su cableado.** Destraba: los nombres.
  **Hasta entonces la lámina se queda en la plantilla, visible y sin cablear**: sus
  `«FALTA:token»` son la lista de lo que falta.
- **Qué pasa con la lámina de "Uno a uno — resultados plataforma" de `secco`**, que tiene los
  `u1_bench_*` marcados. Destraba: decisión del usuario.
- **La remedición de los cuatro bloques PRE contra `V-101`.** Destraba: la corrida del 15/08.

### Backlog — sin orden y sin fecha

- **`C-21`** — ocho fixtures sin versionar. No se resuelve midiendo.
- **`gcba_pauta_meta` y `pauta_meta`** con la definición idéntica, filtro vacío incluido: un
  número que hoy se publica dos veces.
- **`A-14` / `A-15`** — `enc_alcance` sin fuente medible **porque la base está incompleta**, no
  porque la hipótesis falle.
- **`C-58`** — los `cc_*` no van contra `Agenda JM`.
- **`ecv_barrio1-3`**, diferido por decisión previa.

### Cierre

- **No crear ningún archivo nuevo de plan.** Si aparece uno, es el error que este prompt viene
  a evitar.
- El alcance de Meta **no se vuelve a medir** (decisión del usuario, 14/08): `alc_real` ya está
  mapeado y su nota dice de dónde se copió. No entra al plan.
- Commit de documentación, y `git push`.
