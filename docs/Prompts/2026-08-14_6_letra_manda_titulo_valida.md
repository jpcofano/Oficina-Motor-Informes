# 2026-08-14_6 — La letra manda, el título valida

> **Estado:** no ejecutado · **reemplaza:** nada · **subagente:** ninguno
>
> **Objetivo único:** que cada fila de `MAPEO` lleve, además de la letra de columna, **el
> encabezado que espera encontrar ahí**. La letra sigue siendo la referencia; el título es el
> testigo.
>
> **No escribe la función que valida** —eso es un paso posterior, por decisión del usuario del
> 14/08— **no cablea nada, no toca plantillas, no migra marcadores.**

---

## Por qué

Medido sobre el snapshot del 11/08: las 72 filas de `MAPEO` referencian **por letra de
columna** en las cuatro bases, ninguna por título, y las once de `reuniones` que se agregaron
después también. Eso es correcto y hay que conservarlo — los títulos se repiten (`Agenda JM |
Post` tiene cuatro `% CTR`, `Base_Digital` ocho `ID Cuentas`, `Desglose impresiones` tres
claves) y buscar por título elegiría siempre el primero.

Pero deja un modo de falla sin red: **insertar una columna corre todas las letras a su
derecha**, y el mapeo pasa a apuntar una columna más allá. Un `SUMA` sobre la columna de al
lado devuelve un número, no un error. Es exactamente el modo de falla que el proyecto decidió
no tolerar, y es lo que `C-61` viene rondando desde el 12/08.

**La forma de la regla, que hay que dejar escrita con todas las letras:** el título **no** es
una segunda manera de encontrar la columna. Es un control de integridad sobre la primera. El
día que alguien lo use como fallback —*"si la letra falla, buscá por título"*— vuelve el
problema completo, agravado, porque ahora falla en silencio de dos maneras.

---

## Parte A — medir, **sólo lectura** · modelo: **Sonnet** · effort: alto

**No editar ningún archivo ni ninguna hoja. Termina en reportar y parar.**

1. **El encabezado real de cada fila.** Para cada fila de `MAPEO` **vivo**, leer el encabezado
   que hay hoy en esa solapa y esa letra, en su fila de encabezado. Reportar la tabla completa:
   `base_id`, `solapa`, `campo_logico`, `columna`, encabezado leído.

2. **Los que ya están corridos.** Cruzar el encabezado leído contra lo que las `notas` de la
   fila dicen que debería ser — muchas lo traen textual, porque se venía pidiendo así.
   **Reportar toda discrepancia.** Este punto es la razón de correr la Parte A antes de
   escribir nada: si algún mapeo ya está apuntando a la columna equivocada, se descubre acá y
   no dentro de seis semanas.

3. **Los vacíos y los repetidos.** Cuántas letras apuntan a una columna **sin encabezado**, y
   en qué solapas el encabezado leído **aparece más de una vez**. Los repetidos no son un
   problema para este diseño —por eso la letra manda— pero hay que saber cuáles son para que
   la futura validación no los lea como error.

4. **Las solapas sin fila de títulos.** El censo del 14/08 registró que `IVR` y `Mail` tienen
   datos en la fila 1. Para ésas, el testigo no puede ser un encabezado: **reportarlas aparte
   y proponer qué hacer**, sin decidirlo.

5. **La forma de la hoja.** Qué columnas tiene `MAPEO` hoy y cuál sería la posición de una
   nueva, en la hoja y en el seed. **Sin escribirla.**

**Reportar y parar.**

---

## Gate — decisión del usuario

Con las discrepancias del punto 2 a la vista, el usuario decide si alguna se corrige antes de
poblar la columna. **Poblar con el valor leído convierte un mapeo corrido en un mapeo corrido y
bendecido** — el testigo pasaría a certificar el error. Ése es el único riesgo real de este
prompt y por eso hay gate.

---

## Parte B — escribir · modelo: **Opus** · effort: alto

1. **La columna nueva en `MAPEO`**, en la hoja y en el seed **por el mismo camino** — escribir
   en los dos lados por separado es lo que produjo las reversiones silenciosas de `instalar()`
   sobre `seedConfiguracion()`.

2. **Poblarla con el encabezado leído**, salvo las filas que el gate haya marcado para
   corregir primero. Las de `IVR` y `Mail` quedan vacías con el motivo en `notas`.

3. **La `D-NN` en `docs/PLAN.md`**, número verificado contra el destino:
   - la letra es la referencia operativa y **sigue siendo la única forma de encontrar la
     columna**;
   - el encabezado esperado es **control de integridad, nunca fallback**, con esa frase o
     equivalente, porque es la parte que se va a olvidar;
   - qué se hace cuando no coinciden — **se define acá aunque todavía no haya nada que lo
     ejecute**, para que la función posterior no invente la política.

4. **Anotar en `PENDIENTES_consistencia.md` la función que valida**, con lo que necesita y por
   qué se difirió. Y anotar la precisión sobre `C-61`: con el testigo puesto, el alta de una
   columna deja de ser silenciosa, así que **este prompt cambia el riesgo de `C-61`** y hay que
   revisar ese caso a la luz de esto.

5. **`tools/listas.js`** antes de cerrar, y commits separados entre configuración y
   documentación.

---

## Lo que este prompt **no** hace

- **No escribe la función validadora.** Diferida por decisión del usuario del 14/08.
- **No corrige ningún mapeo.** Los reporta; corregir es del gate.
- **No cambia ninguna letra.**
- **No resuelve `C-61`.** Le saca el filo y lo deja anotado.
