# DECISIÓN — Periodicidad semanal por reunión y períodos por bloque

**Estado:** propuesta (a confirmar)
**Alcance:** JM y SECCO-SSCDI
**Relacionado con:** hoja `PERIODOS` (Paso 0.5), `CONFIG`, `MARCADORES`, `CAMPANAS`

---

## Contexto

Los dos informes en producción (JM y SECCO-SSCDI) no son entregables de fecha fija: se
arman en función de las **reuniones** que se cargan al inicio del ciclo. La reunión define
el corte temporal por defecto de todo el informe.

Al mismo tiempo, no todo el informe corre siempre con la misma ventana: hay bloques que
por definición se miran con otro período (acumulado del año, mes cerrado, ventana propia
de una campaña).

## Decisión

1. **Los dos informes son semanales por defecto.** La periodicidad no está hardcodeada en
   el código ni en la plantilla: sale de la hoja de configuración.
2. **La ventana por defecto la define la reunión cargada al principio del ciclo.** Cargar la
   reunión es la única acción manual necesaria para mover el informe de una semana a la
   siguiente. No se editan fechas sueltas repartidas por la configuración.
3. **Cualquier bloque puede pedir un período distinto al del informe**, declarándolo en la
   configuración (`periodo_ref`). Esto no requiere cambios de código: es una fila más.
4. **No hay corte diario de datos.** La información es la que está cargada en las bases al
   momento de correr el informe. El motor lee en vivo, no consume un snapshot previo.

Esto es coherente con la premisa del motor: agregar o cambiar un informe = plantilla nueva
+ filas de config, nunca código.

## Modelo de datos

**`PERIODOS`** — un registro por ventana temporal reutilizable:

| columna | contenido |
|---|---|
| `id_periodo` | clave que se referencia desde otras hojas (ej. `sem_2026_31`) |
| `tipo` | `semanal` / `mensual` / `acumulado` / `custom` |
| `fecha_desde` | inicio de ventana (inclusive) |
| `fecha_hasta` | fin de ventana (inclusive) |
| `etiqueta` | texto legible para pintar en la placa (ej. "Semana del 27/07 al 02/08") |
| `reunion` | reunión a la que corresponde, si aplica |

**`CONFIG`** — apunta al período activo del run (`periodo_activo` = un `id_periodo`).

**`MARCADORES`** — columna `periodo_ref` opcional. Vacía = usa el período activo.

## Orden de resolución de la ventana temporal

Se mantiene la lógica ya definida, con la reunión entrando como origen del período global:

1. **Fechas propias de la campaña** (`CAMPANAS.fecha_desde` / `fecha_hasta`)
2. **`periodo_ref` del marcador o bloque** → busca en `PERIODOS`
3. **`CONFIG.periodo_activo`** → busca en `PERIODOS` → fila de la reunión del ciclo

La primera capa que resuelve, gana. Si ninguna resuelve, el token falla de forma
controlada como `«FALTA:token»`, sin cortar la corrida.

## Corte de datos: momento de la corrida

No existe un proceso de corte diario ni una foto intermedia. El dato válido es el que está
en la base cuando se ejecuta el informe. De esto se desprende:

- **Cada corrida lee una sola vez cada base** y todos los marcadores trabajan sobre esos
  mismos valores. Esto garantiza que el informe sea internamente consistente, aunque alguien
  esté cargando datos mientras corre. (Ya resuelto con el caché por base en `Fuentes.gs`.)
- **El informe lleva estampa de actualización.** Se pinta en la placa vía token
  (`{{fecha_actualizacion}}` o equivalente) con fecha y hora de la corrida. Sin esa estampa,
  dos versiones del mismo informe son indistinguibles.
- **El último día de la ventana puede estar incompleto.** Si `fecha_hasta` es el mismo día
  de la reunión, ese día refleja solo lo cargado hasta esa hora. Hay que decidir si la
  ventana cierra el día anterior o si se acepta el día parcial declarándolo en la etiqueta.
- **Dos corridas del mismo `id_periodo` pueden no dar el mismo número.** Es esperable, no es
  un bug: significa que hubo carga posterior. La trazabilidad de `Marcadores.gs` debe
  registrar el timestamp de corrida junto a cada valor, no solo el período.

## Consecuencias

- El cambio de semana es **una fila nueva en `PERIODOS` + un valor en `CONFIG`**. Nada más.
- El mismo motor sirve para un informe mensual o para uno a pedido: cambia el `tipo` y las
  fechas, no la lógica.
- Se puede reprocesar una semana pasada apuntando `periodo_activo` a un `id_periodo`
  anterior. El reproceso recupera **la ventana**, no la foto: si hubo cargas tardías, los
  números van a diferir del informe original. Por eso el PDF/Slides ya entregado, con su
  estampa de actualización, es el registro de lo que se informó ese día.
- **No cambia la regla de oro:** el cálculo de la ventana y todo el filtrado por fecha vive
  en `Marcadores.gs`. Los módulos de lectura y de Slides no interpretan fechas.
- La etiqueta del período se pinta desde `PERIODOS.etiqueta`, no se arma por concatenación
  en la plantilla.

## Casos de uso que esto habilita

- Informe semanal estándar: todo hereda el período de la reunión.
- Bloque de acumulado anual dentro del informe semanal: `periodo_ref = acum_2026`.
- Campaña que arrancó a mitad de semana: usa sus propias fechas y no distorsiona el resto.
- Pedido puntual ("necesito solo la parte de ECV de junio"): se crea un `id_periodo`
  `custom` y se referencia desde ese bloque.

## Pendiente de confirmar

- Si "reunión" es una entidad propia (hoja `REUNIONES` con fecha, tipo y responsable) o
  alcanza con una columna dentro de `PERIODOS`.
- Si la ventana semanal se deriva automáticamente de la fecha de la reunión (ej. los 7 días
  previos) o se carga a mano en `fecha_desde` / `fecha_hasta`.
- Qué columna de fecha usa cada base para filtrar (queda en `MAPEO`, aún abierto).
- Si la ventana cierra el día anterior a la reunión o incluye el día parcial.
- Nombre definitivo del token de estampa de actualización.
