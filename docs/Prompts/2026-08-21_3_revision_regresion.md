# 2026-08-21_3 — Revisión: qué dejó de funcionar, y el 1 a 1 lee la solapa equivocada

> **Estado:** no ejecutado · **subagente:** ninguno
>
> **Objetivo único:** decir **qué cambió** entre el deck que estaba bien y el de hoy, con
> evidencia, y separar tres cosas que hoy están mezcladas: una regresión, una pieza que nunca
> existió, y un modo de salida mal elegido.
>
> ⛔ **No se arregla nada en este prompt.** Es un diagnóstico. Arreglar sin saber cuál de las tres
> causas es cada síntoma es cómo se llega acá.

---

## Lo observado — deck `[en proceso] Informe semanal JM — vie 14/08 — jue 20/08`

```
49 láminas   (la corrida del 20/08 daba 32)
 0 /////     ⭐ y la lámina 1 dice «FALTA:periodo» — salió en MODO CRUDO, no en símbolos
49 {{token}} crudos
70 números · 4 entre guiones · 8 con `-`
```

**Y el usuario reporta dos cosas distintas, que hay que tratar por separado:**

1. **"Hay cosas que ya estaban bien que dejaron de estarlo."** ⚠ Es la afirmación grave y hay que
   verificarla con evidencia, no con memoria.
2. **"Para uno a uno tiene que cargar la otra solapa, no el iceberg."**

---

## Parte 0 — el diagnóstico. Sólo lectura. **Reportar y parar.**

> **Modelo: Opus · effort alto.** Es resolver una contradicción entre lo que se esperaba y lo que
> salió; equivocarse acá manda a arreglar lo que no está roto.

### A · Por qué salió en modo crudo

1. **Qué valor de `presentacion_faltantes` reportó la corrida** y qué mandó el panel. Al 20/08 el
   `_1` dejó los símbolos como default y el crudo detrás de un checkbox. **Si el default se
   invirtió o el panel manda destildado, es una línea** — pero hay que saber cuál de las dos.
2. **Si el `_7` Parte B se aplicó**: cuántas filas de `MARCADORES` tienen formato `*_revisar` hoy.
   Se esperaban **32** (29 nuevas + 3 previas). **Sólo 4 valores salieron entre guiones en el
   deck**, y eso no cuadra con 32 filas marcadas: reportar el número real.

### B · ⭐ Qué cambió respecto del deck que estaba bien

3. ⭐ **El diff de `MARCADORES` entre el snapshot del 20/08 y la hoja viva**, fila por fila:
   `informe_id`, `formato`, `solapa`, `campo_logico`, `operacion`, `filtro`, `dimensiones`.
   **Reportar sólo lo que cambió.** Es la única forma de contestar si fue la migración.
4. **Si alguna fila que pasó a `*` cambió lo que resuelve para `jm`.** No debería: `*` amplía el
   alcance, no altera la lectura. **Verificarlo, no asumirlo** — el `_7` tocó 49 filas y su
   control 1 comparaba valores de `jm`, así que si ese testigo se corrió y dio verde, citarlo; si
   no se corrió, decirlo.
5. **El diff de `SECCIONES`** entre el 20/08 y hoy, y **qué explica que el deck pase de 32 a 49
   láminas**. Reportar cuántas asignaciones hay hoy y por qué crecieron: ¿dos campañas nuevas, más
   encuentros, o más láminas modelo por ítem?
6. ⚠ **Comparar contra la corrida `171421`** —307 s, 155 tokens reemplazados, la que terminó bien—
   token por token si hace falta: **qué tokens tenían valor ahí y no lo tienen hoy**. **Ésa es la
   lista que contesta "dejaron de estarlo"**, y sin ella la afirmación no es accionable.

### C · El 1 a 1

7. **Cómo se decide qué solapa lee un marcador `enc_*`.** Al 20/08 la solapa está **clavada en la
   fila de `MARCADORES`** —`Directa IVR`, `Directa Mail`, `Agenda JM`, `RVD JM-CM - ES`— y
   `SECCIONES.encuentro` itera sobre `REUNIONES` **sin filtro por tipo**. Confirmarlo.
8. ⭐ **Si existe hoy alguna forma de que un marcador lea una solapa distinta según el tipo de
   ítem.** **Si no existe, decirlo con esas palabras:** entonces el 1 a 1 **nunca funcionó** y no
   es una regresión — es una pieza que falta, y confundirlas manda a buscar un culpable que no
   está.
9. **Qué solapa debería leer el 1 a 1**, según `SOLAPAS` y `MAPEO`: qué solapas de `rdv` hay, cuál
   corresponde al 1 a 1, y **qué columnas tiene que no estén ya mapeadas**.
10. **Cuántas láminas de 1 a 1 salieron y de qué ítems vienen.** En el deck hay cinco. Reportar
    qué filas de `REUNIONES` las generaron y con qué `tipo`.

### D · El corte

11. **Cómo terminó la corrida**: si cortó por presupuesto, si murió, y con qué techo. El deck
    quedó con sello. Reportar qué dejó sucio.

**Reportar todo junto y parar.** ⛔ No tocar `MARCADORES`, ni `SECCIONES`, ni el motor.

---

## Lo que este prompt **no** hace

- ⛔ No arregla el modo crudo, ni el 1 a 1, ni nada de lo que encuentre.
- ⛔ No revierte la migración de las `*`.
- ⛔ No borra ni edita ninguna fila.
