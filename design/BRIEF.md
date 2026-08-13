# Brief para Claude Design — Panel del Motor de Informes (GCBA)

> Para pegar en Claude Design. **No es un prompt para Claude Code.**
> Contrato del backend verificado contra `PanelBackend.gs` el 12/08/2026.

---

## Qué es

Herramienta interna de una oficina de comunicación del Gobierno de la Ciudad de Buenos Aires.
Una persona elige un informe y un período, aprieta generar, y sale una presentación de Google Slides
con los números de la semana. Uso interno, español rioplatense, sobria. **Sin marca inventada, sin
logos, sin nombres de producto nuevos.**

---

## Restricciones duras — condicionan el diseño, no son detalles de implementación

- Google Apps Script + `HtmlService`, dentro de un **iframe con sandbox**.
- **Sin npm, sin bundler, sin build.** CSS y JS en un solo archivo.
- **Nada de `localStorage` ni `sessionStorage`.** No hay estado entre recargas.
- **Componentes React no sirven.** Lo aprovechable es: tokens, CSS plano, y HTML con JS sin
  dependencias.
- Cada llamada al backend es un `google.script.run` — **bloqueante y sin progreso intermedio**. El
  servidor no puede avisar por dónde va.

---

## El problema central: la espera

Una corrida tarda **entre 120 y 320 segundos**, con techo duro de 350, y **la varianza es el riesgo
real**: 316 / 204 / 220 segundos para el mismo resultado. Hoy la persona aprieta generar y no sabe
si el sistema murió.

**Y no hay progreso real que mostrar.** Cualquier barra que avance sola es una mentira. El diseño
tiene que sostener tres o cinco minutos de espera diciendo la verdad: cuánto pasó, cuánto suele
tardar, y qué pasa si se cierra la ventana.

---

## Los dos estados que hoy se ven iguales

Es el pedido explícito del usuario y la mejora más grande del flujo:

- **este período ya tiene deck** → abrirlo al instante, sin regenerar;
- **generá uno nuevo y esperá** los tres a cinco minutos.

El dato ya existe: cada corrida queda registrada con su `deck_id` y su fecha. **Un deck ya generado
se abre en un clic.**

---

## El contrato del backend, tal como es hoy

**`panel_getEstado()`** — una sola llamada; el panel se pinta una vez o falla una vez. Devuelve:

- `informes[]` con `id`, `nombre`, `notas`, **`marcadores_cableados`** (un informe con 0 sigue
  apareciendo, pero el panel tiene que poder decirlo **antes** de que alguien espere cinco minutos
  por un deck vacío) y `secciones[]` repetibles con `id` e `itera_sobre`;
- `informe_activo`;
- `periodos[]` con `id`, `desde`, `hasta`, `notas` — **una fecha mal cargada se muestra rota y las
  demás siguen andando**, así que hay que dibujar ese caso;
- `por_defecto`: o `{ ok: true, etiqueta, desde, hasta, origen }`, o `{ ok: false, motivo }`. **Si
  no resuelve, el botón de generar no se ofrece**: fallaría recién a los cinco minutos.

**`panel_generar(informeId, periodoId, faltantesComoRaya, secciones)`** — devuelve
`{ ok: false, motivo }` o, con `ok: true`:

- `deck`, `periodo`, `corrida_id`;
- `conteos`: `tokens_distintos`, `impresiones_con_valor`, `filas_en_faltantes`. **Son tres unidades
  distintas y no se suman ni se convierten en un porcentaje.** Que `filas_en_faltantes` sea mayor
  que `tokens_distintos` es normal, no un error: uno cuenta tokens del deck, el otro cuenta filas
  que se escriben por token **y por ítem**. El diseño tiene que decir de qué es cada número;
- `escondidas`, `cableados_sin_caja`, `secciones`, `tiempos_por_seccion`;
- cuatro avisos que **cambian cómo se lee todo lo anterior** y viajan siempre, aunque sean `null`:
  `corte`, `fallo`, `instrumento`, `presupuesto`.

**`panel_ultimasCorridas(cuantas)`** — sólo lectura. `corrida_id`, `informe_id`, `deck_id`,
`fecha_generacion`, **`cerrada`**, `tokens_reemplazados`, `faltantes`. De la más nueva a la más
vieja.

- **`cerrada: false` es una corrida que murió**: nunca escribió su fecha. Hoy se ve como una fila
  rota. Necesita forma propia — no es un deck que se pueda abrir.
- Con dos decks del mismo informe y período en la misma carpeta, **el nombre no alcanza para
  distinguirlos**: la fecha y hora sí.

---

## Pantallas a diseñar

1. **Inicio** — elegir informe y período. El período por defecto ya viene resuelto: se muestra, no
   se pregunta. Las secciones repetibles se tildan (destildar todas es una elección válida, no un
   pedido de correr todas). Y una opción: si un token no tiene dato, ¿sale como raya?
2. **Ya existe un deck de esto** — la vía rápida. Abrir, o generar de nuevo a sabiendas.
3. **Esperando** — el estado largo. Sin progreso falso.
4. **Terminó** — el link al deck primero, y abajo qué tiene adentro, con cada número diciendo de qué
   es. Los cuatro avisos, cuando hay.
5. **No se pudo** — con el motivo, que el backend siempre manda.
6. **Corridas recientes** — la lista, con las muertas visiblemente distintas.

---

## Una pantalla más, sin backend todavía

**Confirmar el anclaje.** Cuando el motor no logra ligar un encuentro con su campaña con suficiente
confianza, hoy ese encuentro simplemente no sale en el informe. Se decidió que **lo resuelve la
persona confirmando**, y que eso es capacidad del panel. **No existe la función del backend**, así
que va como diseño de la interacción, sin contrato: qué ve, entre qué elige, y cómo se entera de que
había algo para confirmar. **No inventar nombres de funciones ni campos.**

---

## Lo que hace falta que salga de Claude Design

Tokens y CSS plano, y el HTML de cada estado. La paleta y la tipografía deberían salir de las
presentaciones que la oficina ya publica, no de un sistema nuevo. **Si el resultado son componentes
React, no se puede usar.**
