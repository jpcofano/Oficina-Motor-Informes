# `_50` · Panel mock para el video — una hora y media

> **Modelo: Sonnet. Effort: alto.** Es maquetado, no diseño. Opus no aporta acá y cuesta tiempo.
>
> **Frena el `_49`.** B, C, D, E, F, G e I quedan para después. Lo medido en su Parte A se conserva
> y no se pierde nada.

---

## Qué se hace

Un **archivo nuevo**, `PanelDemo.html`, servido por una ruta propia. **No se toca `Panel.html`, no
se toca `PanelBackend.gs`, no se redespliega sobre el `/exec` que hoy funciona.** El panel real
anda y muestra dos decks de verdad: romperlo una hora antes de grabar es el único desenlace malo
posible acá.

Todo el contenido es **mock**: valores fijos en el archivo, sin una sola llamada al backend. Sin
`google.script.run`, sin esperas reales, sin generar nada.

**Reusar el CSS y el markup de `Panel.html`** — copiados, no importados. Tiene que verse igual que el
panel real porque **es** el panel real, con los datos puestos a mano.

---

## Las pantallas, en este orden de prioridad

Si el tiempo se corta, se corta de abajo.

1. **Inicio con selector de período.** Las seis de `PERIODOS` —`julio_24_30`, `junio_sem2`,
   `m2_mensual`, `quincena_rrss` y las otras dos— con sus fechas. Al cambiar de período **cambia lo
   que se ofrece abajo**: `julio_24_30` y `junio_sem2` muestran deck ya generado, las otras muestran
   el formulario de generar.
2. **Selector de secciones, siempre visible.** `encuentro`, `comunicaciones_post`, `campana`,
   tildables. En el panel real hoy se esconde cuando ya hay deck —un `return` temprano en
   `Panel.html:465-471`—; **en el mock se muestra siempre**, que es como va a quedar.
3. **Ya tiene deck** — con la fecha y hora de la corrida y el botón de abrir, más "generar de nuevo,
   a sabiendas". Usar los deck_id reales de hoy para que los links abran: julio `12nlfJZ…` (32
   láminas) y `junio_sem2` `1iu2KSI…` (27).
4. **Esperando** — el reloj corriendo de verdad, texto de que suele tardar entre tres y cinco
   minutos. Que termine solo a los pocos segundos, para que el video no espere.
5. **Terminó** — con los números reales de la corrida de hoy: 78 marcadores cableados, 32 láminas,
   los conteos con su unidad dicha. **No inventar cifras**: las de hoy están en la bitácora.
6. **El temario** — cargar y ver el temario del período: los seis ítems de julio con su barrio y su
   fecha. Alcanza con mostrarlo; el pegado de texto puede ser un textarea que no hace nada.
7. **Confirmar el anclaje** — la pantalla de `D-29`, que hoy no existe en el backend: el encuentro
   que no ancló, los candidatos con su puntaje, y elegir. Es capacidad futura y en el video se
   presenta como tal.
8. **Corridas recientes** — cuatro o cinco filas, con una sin cerrar visiblemente distinta.

---

## Lo único que no es cosmético

**Que se vea que es una maqueta desde adentro.** Un rótulo fijo, visible en pantalla, que diga que
es una demostración con datos de ejemplo. En el video se puede mostrar o no, pero el archivo no
puede existir sin él: dentro de dos semanas nadie va a saber cuál de los dos paneles era el real.

---

## Reporte final

- La URL o el ítem de menú para abrirlo.
- Qué pantallas quedaron y cuáles no llegaron.
- Un commit, al final, con el archivo nuevo. **Si el tiempo aprieta, primero que funcione y después
  se commitea.**
