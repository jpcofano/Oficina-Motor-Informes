# De qué está hecho el presupuesto de una corrida

**Un objetivo.** Que una corrida entera entre en los 360 s.

**Lo que cambió y hace posible medir.** Con `4934f9c` una invocación produce una
corrida. Hasta ahora cualquier tiempo podía estar midiendo dos.

**Las dos corridas que hay, y lo que muestran juntas:**

| | etapas 1+2 | etapa 3 | murió en |
|---|---|---|---|
| `05/08 231421` | ≤125 s | ~200 s (125→324) | etapa 4 |
| `06/08 135202` | 159 s | no la terminó | etapa 3 |

Mismo trabajo, 34 s de diferencia en 1+2, y la muerte se corre de una etapa a
otra. **La lectura es que el presupuesto no da y la varianza decide dónde cae** —
pero es lectura, no medición: dos corridas no son una distribución.

**Lo que sigue siendo candidato.** Que las mate el límite de 6 minutos. Ninguna
dejó registro de su propia muerte. El `ECONNRESET` del cliente a los ~302 s cortó
la conexión, no la ejecución.

**Lo que este prompt NO es.** No es reanudación por etapas. Si la medición muestra
que ni con la etapa 3 en cero entra, el trabajo es reanudación y este prompt
cierra ahí, con ese dato.

---

## Parte 0 — el presupuesto entero (sólo lectura, reportar y parar)

`0.0` · **El instrumento primero.** `marcarEtapa_` traga sus excepciones. Los
tiempos por etapa salen de restar dos marcas, y una marca ausente puede ser una
etapa que no llegó o una escritura que falló callada. **¿Hay forma de saber si una
marca se escribió?** Si no la hay, todo número de este prompt es candidato.

---

> **Nota de Code al archivarlo (06/08).** El prompt, tal como llegó, **termina en
> `0.0`**: no trae `0.1` ni el resto de la Parte 0 que su propio encabezado
> anuncia. Se ejecutó `0.0` y se paró ahí, según la regla de la §4 de `CLAUDE.md`
> —"si el prompt no alcanza para saber qué hacer, eso se reporta como falta"—.
> El reporte de `0.0` está en `docs/BITACORA.md`.
