# `_21` · Presupuesto de alcance — cómo se corta el ciclo de addenda

> **Modelo: Sonnet.** Es un prompt de proceso: **no toca código de negocio, no cablea nada, no
> lee ninguna base.** Escribe reglas en `CLAUDE.md` y reordena la cola. Nada acá mueve un número.
>
> Nace de una medición del propio día: **ocho archivos de prompt escritos o editados el 09 y el
> 10/08, el `_16` reescrito cuatro veces, y cero láminas más cerca de publicar.**

---

## 0 · El diagnóstico, en tres líneas

1. **Los prompts nacen con premisas sin verificar.** La Parte A las tumba y eso produce un
   addendum. Es el mecanismo funcionando —y por eso la Parte A se queda— pero el costo se paga en
   pasadas.
2. **Cada parada vuelve a la conversación del coordinador.** Media parte corrida, un archivo
   nuevo, otra pasada. **El loop es el costo, no el trabajo.**
3. **La cola derivó a infraestructura.** `LAMINAS`, `titulo`, el escritor de columnas,
   `ESCRITORES.md`, las tres listas divergentes. Nada de eso publica una lámina.

---

## 1 · La regla de alcance, y va a `CLAUDE.md`

Tres líneas, escritas para poder citarse:

> **Un hallazgo lateral se anota, no se arregla.** Si aparece algo roto que no está en la ruta de
> la tarea en curso, va a `PENDIENTES_consistencia.md` con su medición y **la corrida sigue**.
> Arreglarlo en el momento es lo que convierte una tarea en tres.
>
> **La Parte A que confirma no vuelve a preguntar.** Si las premisas dan lo que el prompt
> declaraba, **se sigue a la parte siguiente sin reportar y parar**. Sólo se para cuando una
> premisa se cae, y entonces se para de verdad. «Reportar y parar» es para el desacuerdo, no para
> el acuerdo.
>
> **Nada de higiene entra en una corrida cuya tarea es publicar.** Censos, matrices, listas
> divergentes y documentación de fondo tienen su propia corrida. Se anotan y esperan.

**La segunda es la que más ahorra y es la más delicada**, así que lleva su límite escrito al lado:
**vale para las premisas que el prompt enumera, no para lo que la medición descubra de más.** Una
premisa que confirma habilita seguir; un hallazgo nuevo, no.

### 1.1 · Y una cuarta: el modelo se elige por parte, no por prompt

Hasta hoy todos los prompts arrancaron con «Opus, effort alto» de oficio. **Eso es caro y en la
mayoría de las partes no compra nada.** La regla, y va a `CLAUDE.md` con las otras tres:

> **Cada parte de un prompt declara su modelo.** Sonnet para lo mecánico: verificar forma, contar
> filas, incorporar filas a un CSV, actualizar documentación, correr un censo. **Opus para lo que
> decide**: diseño, elegir entre caminos de implementación, y **cualquier parte que mueva un
> número que ya se publicó o que vaya a publicarse**.
>
> Cuando una parte no lo declara, es Sonnet. **Opus se pide, no se hereda.**

El criterio en una línea: **si equivocarse cuesta una re-corrida, Sonnet; si cuesta un número mal
en un deck, Opus.**

---

## 2 · La cola, reordenada

**El criterio es uno solo, y es el que el handoff puso arriba de todo: ¿acerca o aleja la demo —
las láminas 1 a 6 de `JM` publicando?**

| | qué | por qué ahí |
|---|---|---|
| **1** | **`_18`** | **Es el camino crítico.** Su `0.0` decide si la Parte B del `2026-08-09_1` está bloqueada de verdad o si la mitad sale de `resumen_metricas_dinamico`. Todo lo demás espera esa respuesta |
| **2** | **`_19` Parte B**, acotada por el `19.1` | Barata y a un paso. Tres prompts esperan esa pieza |
| **3** | **`_20`** | Los tres casos y el solape. Cambia números, así que va con predicción escrita |
| **4** | **Parte B del `_1`**, con lo que el `_18` haya destrabado | Acá vuelven las láminas 2 y 3 |
| — | `_16` (`titulo`), Parte C del `_19`, las tres listas, el censo | **Congelados hasta después de la demo** |

**El `_18` sube de último a primero, y conviene decir por qué estaba último:** se lo trató como
una medición exploratoria cuando en realidad es el que decide si hace falta construir una
capacidad de join. **Una medición que puede evitar un prompt de diseño no es exploratoria: es la
tarea.**

---

## 3 · Lo que Code decide sin volver a preguntar

Para cortar el loop, y acotado a esto:

- **Seguir cuando la Parte A confirma.** Ver §1.
- **Elegir el camino de implementación** cuando hay más de uno y el prompt no lo fija — como se
  eligió el seed sobre la celda a mano en `SOLAPAS`. Se reporta con el motivo.
- **Anotar un hallazgo lateral y seguir**, en vez de frenar la cola.
- **Parar de verdad** cuando: se cae una premisa declarada, hay que escribir un dato que no
  ocurrió, o la decisión es de negocio y no de implementación. **Los tres bloqueos del `_19` son
  el ejemplo de cuándo parar está bien** — el tercero, que la excepción del `1.4` no se cumplía,
  no lo habría visto nadie más.

Lo que **no** se decide solo, y sigue igual: nombres de columnas, alcance de una siembra, qué
fuente alimenta un token, y **cualquier cosa que compare un número con un informe publicado**.

---

## 4 · Qué se escribe

- **`CLAUDE.md`** — las tres reglas de §1, en su sección de proceso. En el mismo commit que todo
  lo demás.
- **`docs/PLAN.md`** — la cola de §2 como orden vigente, con el criterio de la demo enunciado
  arriba. **Con el número que esté libre al escribirla**, y no anunciado antes.
- **`PENDIENTES_consistencia.md`** — lo congelado de §2, para que no se pierda por estar
  postergado: `titulo`, la Parte C del `_19`, las tres listas divergentes, el backup del
  spreadsheet de control.
- **`BITACORA.md`** — la medición que originó este prompt: ocho archivos, cuatro reescrituras,
  cero láminas movidas. **Un proceso que no se mide se corrige por impresión.**

### Criterio de aceptación

Uno solo, y es estructural: **la próxima corrida que empiece por el `_18` no vuelve a la
conversación del coordinador hasta tener el `0.0` respondido.** Si vuelve antes, alguna de las
tres reglas de §1 no estaba bien escrita, y eso es el hallazgo.
