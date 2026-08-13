# Handoff: Panel del Motor de Informes (GCBA)

## Qué es

Panel de una herramienta interna de una oficina de comunicación del Gobierno de la Ciudad
de Buenos Aires. Una persona elige un informe y un período, aprieta generar, y sale un deck de
Google Slides con los números de la semana. Uso interno, español rioplatense, sobrio, sin marca de
producto inventada.

El objetivo inmediato del pedido: **poder generar los dos informes reales** (`Informe semanal JM` y
`Seguimiento SECCO – SSCDI`) desde el panel, más un tercer modo **personalizado** donde el informe
se arma agregando bloques por tipo.

## Sobre los archivos de este paquete

Los archivos HTML/JSX incluidos son **referencias de diseño**, no código de producción para copiar
tal cual. El prototipo usa React sólo para poder mostrarse en un navegador; **la implementación
real es Google Apps Script + `HtmlService`: un único `Panel.html` con CSS y JS planos, sin build,
sin npm, sin React**. La tarea es reproducir estas pantallas en ese entorno, tomando los tokens y
los patrones de componentes de acá.

### Restricciones duras del entorno (condicionan el diseño, no son detalles)

- Google Apps Script + `HtmlService`, **desplegado como web app** (`doGet` devolviendo
  `HtmlService.createHtmlOutputFromFile('Panel')`, con `setXFrameOptionsMode(ALLOWALL)` si hace
  falta embeberlo). Se abre con su propia URL de Google desde Chrome — no es la barra lateral de la
  planilla. El backend es el mismo `PanelBackend.gs` y se sigue llamando con `google.script.run`.
  Ojo con el despliegue: "ejecutar como" y "quién tiene acceso" definen con qué cuenta corre el
  motor y quién puede entrar; el acceso queda restringido a la gente de la oficina.
- El contenido igual corre dentro de un **iframe con sandbox** de Apps Script.
- **Sin npm, sin bundler, sin build.** CSS y JS en un solo archivo.
- **Nada de `localStorage` ni `sessionStorage`.** No hay estado entre recargas.
- Cada llamada al backend es un `google.script.run` — **bloqueante y sin progreso intermedio**.
- Página centrada: tarjeta de hasta 560 px de ancho sobre fondo `--surface-sunken`. Al no ser una
  barra lateral no hay techo de 360 px, pero el contenido es una sola columna: no se ensancha más.

## Fidelidad

**Alta (hi-fi).** Colores, tipografía, espaciado y copy son finales. Reproducir tal cual, salvo lo
marcado como dato de muestra.

---

## Contrato del backend (`PanelBackend.gs`, verificado 12/08/2026)

### `panel_getEstado()`
Una sola llamada; el panel se pinta una vez o falla una vez. Devuelve:

- `informes[]`: `id`, `nombre`, `notas`, `marcadores_cableados`, `secciones[]` (con `id` e
  `itera_sobre`). Un informe con `marcadores_cableados: 0` sigue apareciendo, pero **el panel tiene
  que decirlo antes** de que alguien espere cinco minutos por un deck vacío.
- `informe_activo`
- `periodos[]`: `id`, `desde`, `hasta`, `notas`. **Una fecha mal cargada se muestra rota y las demás
  siguen andando** — hay que dibujar ese caso, no romper la lista.
- `por_defecto`: `{ ok: true, etiqueta, desde, hasta, origen }` o `{ ok: false, motivo }`.
  **Si no resuelve, el botón de generar no se ofrece**: fallaría recién a los cinco minutos.

### `panel_generar(informeId, periodoId, faltantesComoRaya, secciones)`
Devuelve `{ ok: false, motivo }` o, con `ok: true`:

- `deck`, `periodo`, `corrida_id`
- `conteos`: `tokens_distintos`, `impresiones_con_valor`, `filas_en_faltantes`. **Son tres unidades
  distintas: no se suman ni se convierten en porcentaje.** Que `filas_en_faltantes` sea mayor que
  `tokens_distintos` es normal (una cuenta tokens del deck; la otra, filas por token *y por ítem*).
  Cada número se muestra con su unidad al lado.
- `escondidas`, `cableados_sin_caja`, `secciones`, `tiempos_por_seccion`
- Cuatro avisos que **cambian cómo se lee todo lo anterior** y viajan siempre, aunque sean `null`:
  `corte`, `fallo`, `instrumento`, `presupuesto`. **Van antes que los números.**

### `panel_ultimasCorridas(cuantas)`
Sólo lectura, de la más nueva a la más vieja: `corrida_id`, `informe_id`, `deck_id`,
`fecha_generacion`, `cerrada`, `tokens_reemplazados`, `faltantes`.

- **`cerrada: false` es una corrida que murió**: nunca escribió su fecha. No es un deck que se pueda
  abrir — tiene forma propia en la lista (texto en rojo, sin link).
- Con dos decks del mismo informe y período en la misma carpeta, el nombre no alcanza para
  distinguirlos: **la fecha y hora sí**. Siempre mostrar fecha y hora.

### Lo que NO existe todavía en el backend
`panel_getPeriodos`, `panel_getCamposFuente`, `panel_getPreview`, `panel_addMarcador` están vacías.
La pantalla de **Confirmar anclaje** y la pestaña **Próximo** están diseñadas sin contrato: no
inventar nombres de función ni de campo al implementarlas; dejarlas inertes o detrás de un flag.

---

## Estructura de la pantalla

Página: fondo `--surface-sunken`, contenido centrado, padding 32/24.
Tarjeta del panel: `width:100%; max-width:560px`, fondo `--surface-page`, borde 1 px
`--border-subtle`, radio 12 px, padding 24 px, `display:flex; flex-direction:column; gap:16px`,
sombra `--shadow-sm`.

1. **Encabezado**: logo BA Ciudad (alto 22 px, proporción libre — cuidado con estirarlo dentro de un
   flex column: necesita `align-self:flex-start`), título "Motor de Informes" (20 px / 500), y a la
   derecha una única cápsula `en desarrollo` (11 px, mayúsculas, `letter-spacing .4px`, borde 1 px
   `--border-default`, radio pill, padding 3/8).
2. **Pestañas** (segmentado): fondo `--surface-sunken`, radio pill, padding 3; el activo va con
   fondo blanco y `--shadow-sm`. `Generar` · `Anclajes` (con contador de pendientes como número
   chico en `--color-primary`) · `Corridas` · `Próximo`. Todo en una línea: `white-space:nowrap`.
3. **Cuerpo** según pestaña y estado.
4. **Pie**: banda institucional `ba-banner.png` a sangre, pegada al borde inferior del panel.

---

## Pantallas

### 1. Generar — formulario (estado `form`)

- `Select` **Informe**: los informes de `panel_getEstado()` + la opción "Informe semanal
  personalizado".
- Si `marcadores_cableados === 0`: nota gris (12 px, `--text-tertiary`) bajo el select —
  *"Este informe todavía no tiene marcadores cableados: el deck va a salir con huecos en casi todos
  los tokens."* No es una alerta roja; es una advertencia previa, no un error.
- Si el informe es **personalizado**: campo de texto **Nombre del informe** (default
  *"Informe semanal personalizado JM"*).
- `Select` **Período**, con hint *"Sale de la cadena de D-20, eslabón «vigente»."*
  - Período con fecha rota: bajo el select, línea 12 px en `--color-error` — *"Fecha sin cargar bien
    — los demás períodos funcionan igual."* El resto de la lista sigue funcionando.
- Si `por_defecto.ok === false` y el usuario dejó el período por defecto: `Alert` ámbar
  *"No se resolvió el período por defecto."* + motivo, y **no se muestra el botón de generar**.
  Al elegir un período explícito de la lista, el botón vuelve.
- **Secciones** (informes fijos): un checkbox por sección repetible, con el `itera_sobre` como
  sublabel gris. Destildar todas es una elección válida (no significa "correr todas"). Nota:
  *"Sacar una acorta la corrida — el techo es de 350 s."*
- **Bloques** (informe personalizado): lista ordenable de bloques ya agregados (cada fila: nombre +
  sublabel, botones ↑ ↓ ×), más un `Select` "Agregar por tipo" + botón `Agregar`. Los tipos se
  pueden repetir. Nota: *"Se pueden repetir tipos — un bloque por cada uno. Menos bloques, corrida
  más corta: el techo es de 350 s."* El botón de generar queda deshabilitado con 0 bloques.
- Checkbox **"Los huecos se ven como «—»"** (default tildado) → `faltantesComoRaya`.
- Botón primario **Generar informe** (ancho completo).

### 2. Ya existe un deck de este período (la vía rápida)

Si el par informe+período ya tiene una corrida cerrada con `deck_id`, en lugar del bloque de
secciones y del botón de generar:

- Nota: *"Este período ya tiene un deck generado: se abre al instante."*
- `DeckLinkCard` con el nombre del informe y meta *"Generado el AAAA-MM-DD HH:MM · corrida <id>"*.
- Botón secundario **"Generar de nuevo, a sabiendas"** → despliega el formulario completo con un
  `Alert` ámbar: *"Ya existe un deck de este período. Esto genera otro y tarda entre 120 y 320 s
  igual."*

Es la mejora más importante del flujo: hoy los dos casos se ven iguales.

### 3. Esperando (estado `generando`)

La corrida tarda **120–320 s**, con techo duro de 350 s, y **la varianza es el riesgo real**
(316 / 204 / 220 s medidos para el mismo output). El backend no reporta avance.

- **Nunca una barra que avance sola hacia 100 %**: sería mentira. El indicador es una **regla fija**
  con una banda que marca el rango habitual (120–320 s sobre 350 s de techo) y un **marcador que se
  mueve con el tiempo real transcurrido**. El marcador pasa a ámbar al superar el rango habitual y a
  rojo a menos de 30 s del techo.
- Segundos transcurridos en grande (20 px, `font-variant-numeric: tabular-nums`) + etapa a la
  derecha (12 px gris).
- Texto: *"Una corrida completa tarda entre 120 y 320 s: copia la plantilla, expande las secciones y
  resuelve cada marcador."*
- Y, separado por una línea fina: *"Si se cierra esta ventana la corrida sigue en el servidor. Al
  volver a abrir el panel, va a aparecer en «Corridas» cuando termine."*
- Como `google.script.run` es bloqueante, el contador corre en el cliente con `setInterval` desde el
  momento del click; el callback de éxito/fallo lo detiene.

### 4. Terminó (estado `listo`)

Orden exacto — **el link primero, los avisos antes que los números**:

1. `DeckLinkCard` con el nombre del deck y meta período + corrida.
2. Los avisos que vengan (`corte`, `fallo`, `instrumento`, `presupuesto`) como `Alert`.
3. Los tres conteos, cada uno con su unidad:
   - "Tokens distintos en el deck"
   - "Impresiones con valor" · unidad *token × lámina*
   - "Filas en FALTANTES" · unidad *una por token y por ítem*
4. Nota de cómo se imprimieron los huecos («—» o «FALTA:token») y el tiempo de la corrida contra el
   techo.
5. Lista de secciones repetibles con `StatusDot`: verde las emitidas, círculo gris las que quedaron
   fuera de la corrida.
6. Si hay encuentros sin ligar: caja gris con el conteo y botón **"Revisar y confirmar"** → Anclajes.
7. Botón secundario **"Generar otro"**.

### 5. No se pudo (estado `fallo`)

`Alert` rojo con título *"No se pudo generar el informe."* y el `motivo` que manda el backend
(nunca un texto inventado). Debajo: *"No se generó ningún deck ni quedó registrada una corrida
cerrada."* + botón **Volver**.

### 6. Corridas

Lista de `panel_ultimasCorridas()`. Cada fila: nombre del informe (13 px / 500) + fecha y hora
(12 px gris) a la izquierda, y `N en FALTANTES` a la derecha. Separador 1 px `--border-subtle`.
**Corrida con `cerrada: false`**: en lugar de la fecha, *"no cerró — sin fecha de generación"* en
`--color-error`, y sin conteo ni link.

### 7. Anclajes — confirmar el anclaje (sin backend)

Cuando el motor no logra ligar un encuentro con su campaña con confianza suficiente, hoy ese
encuentro simplemente no sale en el informe. Se decidió que **lo resuelve la persona confirmando**.
La interacción diseñada (sin contrato: no inventar nombres de función ni de campo):

- Recorrido de a uno: *"Encuentro sin ligar N de M"*.
- Descripción del encuentro (fecha · comuna · texto).
- *"No se encontró una campaña con confianza suficiente. Elegí una, o dejalo sin ligar por ahora."*
- Candidatas como botones seleccionables (borde `--color-primary` + fondo `--surface-primary-subtle`
  cuando está elegida).
- Acciones: **Saltear por ahora** (ghost) y **Confirmar** (primario, deshabilitado sin selección).
- Al terminar: *"Listo. X de M quedaron ligados a una campaña."* + *"Los que quedaron sin ligar no
  salen en el informe hasta confirmarlos."*
- El usuario se entera de que hay algo para confirmar por el contador en la pestaña y por la caja al
  final de la pantalla de resultado.

### 8. Próximo (lo que todavía no está)

Lista de lo que viene, con dos pantallas ya diseñadas y botones inertes:
- **Pegar el temario** — textarea con la agenda pegada; *"Se detectarían 3 encuentros · 1 sin comuna
  cargada."*
- **Vista previa antes de generar** — lista de láminas con miniatura gris.
- Agregar un marcador desde el panel · Editar la cadena de períodos · Aviso por mail al terminar.

---

## Estado que hay que manejar

| Estado | Origen | Notas |
|---|---|---|
| `informes[]`, `periodos[]`, `por_defecto`, `informe_activo` | `panel_getEstado()` | una sola llamada al abrir; si falla, pantalla de error única |
| `informeId`, `periodoId` | usuario | cambiar cualquiera resetea "generar de nuevo" |
| `secciones` (Set) | usuario | se reinicia al cambiar de informe (todas tildadas) |
| `bloques[]` (personalizado) | usuario | `[{key, tipo}]`, ordenable, tipos repetibles |
| `nombreCustom` | usuario | default "Informe semanal personalizado JM" |
| `faltantesComoRaya` | usuario | default `true` |
| `estado` | flujo | `form` / `generando` / `listo` / `fallo` |
| `elapsed` | `setInterval` 1 s | arranca al click, se limpia en el callback |
| resultado de la corrida | `panel_generar()` | deck, conteos, avisos, secciones |
| `corridas[]` | `panel_ultimasCorridas()` | refrescar al terminar una corrida |

**No persistir nada**: sin `localStorage` ni `sessionStorage`. Al recargar, el panel vuelve a
`panel_getEstado()`.

---

## Tokens

Están completos en `tokens/*.css` (copiar tal cual dentro del `<style>` del `Panel.html`).

**Color** — paleta Google Workspace, porque el panel vive dentro de una Google Sheet:
`--color-primary #1a73e8` (hover `#1967d2`, active `#185abc`, sutil `#e8f0fe`);
grises `#f8f9fa #f1f3f4 #e8eaed #dadce0 #bdc1c6 #9aa0a6 #80868b #5f6368 #3c4043 #202124`;
error `#c5221f` sobre `#fce8e6`; atención `#b06000` sobre `#fef7e0`; éxito `#188038` sobre `#e6f4ea`.
Institucionales (**sólo para el deck y piezas con marca, no para la UI del panel**):
navy `#003040`, teal `#7cc7c3`, amarillo `#fdc400`.

**Tipografía**: `'Roboto', Arial, sans-serif`. Escala 11 / 12 / 13 / 14 / 16 / 20 / 24 px.
Pesos 400 / 500 / 700. Interlineado 1.2 / 1.4 / 1.6. `letter-spacing .4px` en rótulos en mayúscula.

**Espaciado**: 4 / 8 / 12 / 16 / 20 / 24 / 32 / 40 px.

**Radios**: 4 (controles) / 8 (tarjetas) / 12 (panel) / pill (pestañas).

**Sombras**: `--shadow-sm: 0 1px 2px rgba(60,64,67,.30), 0 1px 3px 1px rgba(60,64,67,.15)`.

**Movimiento**: 120 ms (hover) y 200 ms (marcador del timer), `cubic-bezier(.4,0,.2,1)`. Nada
decorativo, nada que rebote.

---

## Copy — cómo se escribe

- Español rioplatense, sobrio. Nunca "vos podés" ni "¡Ya casi está tu informe!": el panel describe
  el estado del sistema, no le habla al usuario como un producto.
- **Los avisos van antes que los números.**
- **Los números siempre con su unidad al lado**, nunca sueltos.
- **Sin emoji.**
- Los números de ejemplo de los mocks son datos de muestra, no valores reales.

---

## Assets

- `assets/logos/ba-ciudad-logo-horizontal.png` — encabezado del panel (alto 22 px).
- `assets/brand/ba-banner.png` — banda institucional al pie.
- `assets/logos/ba-isologo-navy.png`, `ba-ciudad-logo-azul.png`, `assets/brand/sscdi-banner.png` —
  para el deck y piezas con marca.
- Usar tal cual: no recolorear, no redibujar, no recombinar con otra marca.
- Íconos: **Material Symbols** (outlined, peso 400) si hacen falta; el panel actual no tiene sistema
  de íconos propio.

---

## Archivos de este paquete

- `prototipo/index.html` + `prototipo/panel-app.jsx` — el prototipo navegable completo (todas las
  pantallas de arriba). Abrir `index.html` en Chrome.
- `tokens/*.css`, `styles.css` — los tokens, para copiar al `Panel.html`.
- `componentes/` — los nueve componentes (fuente en `.jsx.txt`) con su `.prompt.md` (variantes, cuándo usar cada uno):
  `Button`, `Select`, `Checkbox`, `Alert`, `ProgressTimer`, `StatusDot`, `StatRow`, `DeckLinkCard`,
  `RunHistoryItem`.
- `assets/` — logo y banda institucional.
- `capturas/` — una captura por pantalla (`01-inicio-ya-existe-deck`, `02-generar-de-nuevo`,
  `03-informe-personalizado`, `04-esperando`, `05-termino`, `06-anclajes`, `07-corridas`,
  `08-proximo`). Algunas quedan cortadas abajo por el alto de la captura: el prototipo es la
  referencia completa.
- `BRIEF.md` — el brief original de diseño, con el contrato del backend verificado.

Repo del motor (fuente de verdad del backend):
https://github.com/jpcofano/Oficina-Motor-Informes
