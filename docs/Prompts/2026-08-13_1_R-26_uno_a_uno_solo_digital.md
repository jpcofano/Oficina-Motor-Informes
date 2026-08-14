# 2026-08-13_1 — `R-26`: el "1 a 1" se comunica sólo por digital

> **Estado:** no ejecutado · **reemplaza:** nada · **subagente:** ninguno
>
> **Objetivo único:** dejar escrita como regla del dominio la decisión del usuario del
> 13/08/2026 —*"el 1 a 1 sólo se comunica por digital"*— después de medirla contra `rdv`.
> **No cablea ningún token, no toca ninguna plantilla, no toca ninguna hoja de registro.**

---

## Contexto — por qué esta regla importa más de lo que parece

Los cinco `ecv_insc_*` (mail, call center, IVR, digital, difusión) y sus `_pct` existen para
todos los encuentros por igual. Si el "1 a 1" se convoca **sólo por el canal digital**,
entonces los otros cuatro canales valen **cero por diseño** en ese tipo de encuentro — y un
cero por diseño **no es lo mismo que un dato faltante**. Hoy el motor no distingue las dos
cosas, y quien lea el deck tampoco.

Es el modo de falla de siempre visto al revés: acá el riesgo no es publicar un número
plausible y equivocado, sino **tratar un cero correcto como si fuera un hueco** y salir a
buscarle fuente a algo que no existe.

---

## Parte A — medición, **sólo lectura** · modelo: **Sonnet** · effort: normal

**No editar ningún archivo en esta parte. Termina en reportar y parar.**

1. **Resolver los campos, no adivinarlos.** Contra `MAPEO` **vivo**, obtener las columnas de
   `rdv` (hoja según `BASES.rdv`, hoy `RVD JM-CM - ES`) para los campos lógicos que hoy usan
   los `ecv_insc_*_pct`: `insc_mail`, `insc_cc`, `insc_ivr`, `insc_digital`, `insc_dif`,
   `inscriptos`, más los de `evento`, `figura`, `barrio`, `fecha` y `status`. Reportar cuál
   falta, **nombrando base y solapa** — un "no está" sin ámbito no sirve.

2. **El universo.** Filas de `rdv` cuyo `evento` normalizado sea el "1 a 1"
   —`docs/HALLAZGOS_validacion_decks.md` registra el valor de la celda como `"1 a 1"`; no
   asumir la forma exacta: **medir qué valores distintos tiene la columna `evento`** y decir
   cuál(es) corresponden—. Sin filtro de ventana: se quiere el comportamiento del tipo de
   encuentro, no el de una semana.

3. **El reparto por canal.** Para esas filas, y **sin ventana**:
   - cuántas filas hay, y cuántas con `figura = Jorge Macri`;
   - suma de cada uno de los cinco canales y de `inscriptos`;
   - **cuántas filas tienen valor distinto de cero en cada canal** — el conteo importa más
     que la suma: una sola fila con mail rompe un "siempre cero" y hay que verla;
   - si algún canal no-digital tiene filas con dato, **listar esas filas** (figura, barrio,
     fecha, valor) hasta un máximo de 20.

4. **El contraste, que es lo que le da sentido al número.** Repetir el punto 3 para los otros
   tipos de encuentro de la columna `evento`, una línea por tipo. Un canal en cero sólo dice
   algo si en los demás tipos no lo está.

5. **Los dos vocabularios.** `REUNIONES.tipo` usa `Uno a uno`
   (`TIPOS_REUNION_CONOCIDOS_`, `Reuniones.gs`) y la columna `evento` de `rdv` usa otra
   forma. **Reportar las dos**, textuales, sin normalizar. Es el insumo de un prompt
   posterior y no se resuelve acá.

**Reportar y parar.** Si el punto 2 no encuentra ninguna fila del tipo, o si el punto 3
muestra un canal no-digital con volumen comparable al digital, **la premisa de la regla está
vencida: decirlo y no escribir nada.**

---

## Parte B — redacción · modelo: **Opus** · effort: alto

**Sólo si el usuario confirma que la Parte A sostiene la premisa.** No arrancar sola.

1. **`docs/REGLAS_NEGOCIO.md` — `R-26`**, append-only, con el número verificado como libre
   antes de escribirlo (el último es `R-25`). Enunciado: *el encuentro tipo "1 a 1" se
   convoca **sólo por el canal digital**; los demás canales de convocatoria valen cero por
   diseño, no por falta de dato.* La regla lleva:
   - el origen (decisión del usuario, 13/08/2026) y **los números de la Parte A** como
     medición fechada, no como enunciado;
   - **la consecuencia operativa, que es la mitad que sirve**: un `ecv_insc_*` no-digital en
     cero sobre un "1 a 1" es correcto y **no se reporta como hueco de cableado**;
   - **el borde, escrito con todas las letras**: si la Parte A encontró filas con mail o call
     center, la regla dice *"sólo digital"* como **régimen de convocatoria**, no como
     invariante aritmética — y entonces deja dicho cuántas filas la contradicen y qué se hace
     con ellas (se publican, no se recortan).

2. **`docs/CONFIG_INFORMES.md`** — una línea en §1 que **apunte a `R-26`**, sin repetir el
   contenido. La regla del dominio vive en un solo lugar (`CLAUDE.md` §7).

3. **Nada más.** No tocar `MARCADORES`, `SECCIONES`, `LAMINAS`, ni ninguna plantilla. Si al
   escribir aparece que algún token queda afectado, **anotarlo en el reporte**, no ejecutarlo.

4. Commit de documentación, separado, y `git push`.

---

## Lo que este prompt **no** hace, para que no se cuele

- **No implementa el filtro por tipo de encuentro.** Medido el 13/08 contra el repo: el ítem
  de iteración de `REUNIONES` que arma `anclarEncuentros` (`Union.gs`) expone
  `reunion`, `fecha`, `etapa`, `idCuenta`, `score`, `registroDigital`, `candidatoNombre`
  (+ `filaRdv`/`hojaRdv`), y **no expone `tipo`** — así que un `filtro = tipo=…` sobre
  `SECCIONES` o `LAMINAS` hoy no acota: **excluye todos los ítems**. Va en prompt propio.
- **No toca la lámina nueva** ni le pone tokens.
- **No agrega bases nuevas.**
