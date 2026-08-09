# 12 · Contención de `pauta_*`, secuencia, y qué pasa con los tres hallazgos

> **Modelo: Opus, effort alto.** No bajar a Sonnet.
>
> Responde la pregunta que quedó abierta al final del `10.1`. **"Hacelo bien" significa lo que
> dice este prompt**, y no las dos lecturas que planteaste: los tres hallazgos de tu Parte 0
> **no se arreglan en esta corrida**. Uno solo tiene acción inmediata, y es contención, no
> arreglo.

---

## 0 · La decisión que destraba

Los tres hallazgos son buenos y los tres cambian el plan. Ninguno de los tres se resuelve
escribiendo lógica ahora, por un motivo común: **los tres dicen que una fuente no produce el
número que se le está pidiendo.** Eso no se arregla en el consumidor. Arreglarlo en el
consumidor es inventar el número.

Entonces:

| hallazgo | acción en esta corrida | dónde va lo demás |
|---|---|---|
| 1 · los `imp_*` no se reproducen | **ninguna en código.** Se asienta y mata al `_13` (§1) | pregunta abierta a la rama de validación |
| 2 · los seis `pauta_*` sobre booleanos | **contención: a `REVISAR`** (§2) | el arreglo, prompt propio |
| 3 · `RDV_otros_ministros` corrido | **ninguna en código.** Corrige el handoff §4 (§3) | depende de `C-09` |

---

## 1 · Los `imp_*`: la medición cierra la puerta, no la abre

Tu medición es concluyente y hay que leerla como tal. 436 filas de `CAMPAÑAS_DESGLOCE_DIGITAL`
solapan 24–31/07: GCBA 431, `Sin Tipo` 5, **JM cero**. Las 107 filas JM de esa solapa se cortan
en abril de 2026. Cruzando con las 166 cuentas JM de `digital/Digital`: 34 históricas, **0 en la
ventana**.

**Meta 716.650 / Google 531.403 / Programmatic 5.194.898 no salen de ese cruce con ningún corte
JM.** No es que falte afinar el join: no hay filas.

Consecuencias, las tres:

- **El `_13` que estaba anunciado se cancela.** El cruce `Digital` × `CAMPAÑAS_DESGLOCE_DIGITAL`
  era el destrabador de las láminas 2 y 3 por el lado de las impresiones por plataforma. Está
  medido y no destraba. No escribir ese prompt.
- **Las láminas 2 y 3 quedan parciales por dos motivos, no uno.** El handoff decía que las
  destrababan dos cosas: este cruce y una semana que publique el bloque IVR. El cruce se cayó.
  Queda una sola vía viva y no la controlamos nosotros.
- **`imp_meta`, `imp_google` e `imp_prog` siguen sin existir en `MARCADORES`, y ahora se sabe
  que no pueden crearse desde ahí.** Esto confirma que retirar `C.4` fue correcto: la poda de
  derivados habría borrado `imp_total`, que es la única fila que produce un número, para
  reemplazarla por tres filas imposibles.

**Acción:** asentarlo en `BITACORA` con la medición completa —los tres cortes, el conteo de 107
y el de 34/0— y abrir la pregunta en `PENDIENTES_consistencia.md` dirigida a la rama de
validación: *«¿de qué fuente salen Meta 716.650 / Google 531.403 / Programmatic 5.194.898 del
deck del 31/07? `CAMPAÑAS_DESGLOCE_DIGITAL` está descartada por medición.»* **Con caso
numerado**, o no está preguntada.

**No inventar una fuente candidata.** Si aparece una hipótesis mientras escribís, va marcada
como hipótesis y sin código atrás.

---

## 2 · Los seis `pauta_*`: contención ahora, arreglo después

Éste es el único que no puede esperar, y el motivo es el que `R-20` acaba de dejar escrito: **un
cero se suma y se publica; un `REVISAR` frena.**

Hoy hay seis marcadores con `SUMA` y `tipo_esperado: numero` apuntando a columnas que son
`"true"`/`"false"` como texto, con **cero valores numéricos en 950+ filas**. Eso no falla: da
cero, y el cero sale impreso en el deck como si fuera un dato. Es peor que un `«FALTA»`.

**Acción, y es la única escritura en `MARCADORES` de esta corrida:** las seis filas `pauta_*`
pasan a `REVISAR`. No se borran, no se reescriben, no se les cambia la fuente. Un commit, sin
lógica, con el motivo en `CLAUDE.md`: *«`pauta_*` a `REVISAR` — `SUMA` sobre columna booleana de
texto, publica cero. Medido en la Parte 0 del `_10`.»*

**Lo que NO se hace en esta corrida:** cambiar los marcadores a un conteo. Tu propia medición
dice que contar `true` en la ventana da 1/1/1 contra los 9/7/14 de `X-11`, así que el conteo
tampoco es la respuesta y cablearlo sería cambiar un número malo por otro.

**Hipótesis, marcada como hipótesis, para el prompt que lo arregle:** si las columnas son
booleanas por campaña, `pauta_*` es *cuántas campañas usaron cada plataforma*, y la brecha
1/1/1 → 9/7/14 se parece a un problema de universo, no de operación — `Seguimiento digital`
podría comportarse como `snapshot`, igual que `digital`, en cuyo caso la ventana no debería
intervenir. **No verificado. No escribir código contra esto.** Va como fila de
`PENDIENTES_consistencia.md`, no como decisión.

---

## 3 · `RDV_otros_ministros`: corrige el handoff, y es una mina

Dos cosas salen de tu hallazgo, y la segunda es más grave que la primera.

**Primera.** La solapa tiene un solo campo en `MAPEO` —ni `figura`, ni `inscriptos`, ni
`asistentes`—, así que la cascada que la segunda mitad de `R-20` necesita no es ejecutable. La
regla ya nació marcada `SIN MECANISMO`; esto agrega el segundo motivo y **se anota en la misma
marca**, no en una nueva.

**Y corrige el handoff §4.** Ahí dice que los encuentros de ministros —unión de `RVD JM-CM - ES`
y `RDV_otros_ministros`, ventana del informe, excluyendo `Figura=Jorge Macri`— reproducen 8 de
8, y lo lista entre lo *«cableable hoy sin preguntarle nada a nadie»*. **Con `figura` fuera del
`MAPEO`, ese filtro no es ejecutable por el motor.** El 8 de 8 se validó a mano sobre las bases,
que es lo que la rama de validación hace. Sigue siendo cierto como número y **falso como
cableado.** Corregir esa línea donde esté asentada.

**Segunda, y es la que importa.** `fecha_periodo` resuelve a `hora_cita_evento` y *funciona*
porque los encabezados están corridos una columna. **Eso es un acierto por compensación de dos
errores.** El día que `C-09` se arregle, esta lectura se rompe sin que nada la señale: no va a
fallar, va a leer otra columna.

**Acción:** una fila en `PENDIENTES_consistencia.md` **atada a `C-09`**, que diga que arreglar
el corrimiento obliga a rehacer el `MAPEO` de esa solapa en el mismo commit. Y un comentario en
el `MAPEO` de `rdv/RDV_otros_ministros/fecha_periodo` con el mismo texto. **Sin esto, `C-09` se
arregla algún día y rompe ministros en silencio.**

No tocar el `MAPEO` ahora. El mapeo corrido es correcto *mientras* la solapa esté corrida.

---

## 4 · La secuencia, ahora sí

En este orden, un commit por paso, `CLAUDE.md` en el mismo commit:

1. **§2 — los seis `pauta_*` a `REVISAR`.** Primero, porque es lo único que hoy publica un
   número falso.
2. **§1 y §3 — asientos y pendientes.** Sin código.
3. **El `_11` (`2026-08-07_11_fase2_sellador.md`).** Crea `LAMINAS.estado` y `LAMINAS.falta`.
   **Aplicá el reemplazo de caso de prueba que propusiste en el `0.5`** — está aceptado, con una
   condición: el caso de reemplazo tiene que fallar si el sellado no ocurre. Un caso que pasa
   con y sin la lógica no es un control. Si el que propusiste no cumple eso, decilo y pará.
   **Corre despierto, nunca de noche.**
4. **La Parte B del `_10`** — el operador `CONTIENE`, `R-15 Addendum 2` y las filas de
   `MARCADORES` que quedaron definidas. **Son tres consumidores de `parsearFiltro_`, no dos:
   `Generador.gs:428`, `:1180` y `:1241-1245`.** Tu corrección se toma; el `_10` decía dos y
   estaba mal. Verificá los tres contra `HEAD` antes de aplicar: los números de línea envejecen.

**Reportar y parar** después del paso 2, antes de arrancar el `_11`. Los pasos 3 y 4 son de
corrida larga y no quiero que empiecen sobre un reporte sin leer.

---

## 5 · Lo que este prompt NO autoriza

- No tocar `Generador.gs`, `Union.gs` ni `Reuniones.gs` salvo por el operador del paso 4.
- No crear filas de `MARCADORES` para `imp_meta`, `imp_google` ni `imp_prog`.
- No cambiar la operación ni la fuente de los seis `pauta_*` — sólo su estado.
- No tocar el `MAPEO` de `rdv/RDV_otros_ministros`.
- No escribir el código de `R-21`. Va en su propio prompt, después del `_11`.
