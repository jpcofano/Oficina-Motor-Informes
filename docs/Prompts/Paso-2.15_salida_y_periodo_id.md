# Paso 2.15 — `carpeta_salida` a reportes y `periodo_id` en la curaduría

**Estado:** vivo · **Fecha:** 2026-08-02 · **Ubicación:** `docs/Prompts/Paso-2.15_salida_y_periodo_id.md`

> Dos ítems del Tramo 1 de `PLAN.md §2`. Los dos son cambios de configuración y tocan los
> mismos seeds, por eso van juntos. **Registrar M2 va aparte**: es la primera medición de
> `D-01` y compartir commit haría irrespondible "cuántas líneas de `.gs` necesitó".
>
> **Un commit por parte. Se para y se avisa al final de cada una.**

---

## Parte 0 — Verificación de premisas. Sólo lectura. Reportar y **PARAR**.

**0.1 · Esquemas vivos.** Confirmar contra la planilla las columnas actuales de `CAMPANAS`
y `REUNIONES`, y que `PERIODOS` tenga la columna que va a hacer de clave. Lo que tengo
registrado y hay que verificar, no asumir:

- `CAMPANAS`: `campana_id`, `nombre`, `informe_id`, `base_id`, `tipo`, `desde`, `hasta`,
  `mostrar`, `orden` — 3 filas.
- `REUNIONES`: `orden`, `eje`, `tipo`, `nombre`, `fecha`, `etapa`, `mostrar`,
  `texto_original`, `notas` — 7 filas.
- `PERIODOS`: 2 filas.

**0.2 · Asimetría de estructura.** El resumen de `instalar()` lista `REUNIONES` entre las
hojas cuya **estructura** verifica y repara, pero **no** lista `CAMPANAS`. Las dos están
excluidas de la auditoría de **contenido** (`Instalar.gs:1965`). Confirmar si es así: cambia
cómo se agrega la columna en cada una, y si `CAMPANAS` no tiene nadie que le verifique la
estructura, agregar la columna a mano no queda respaldado por nada.

> ✅ **Verificado el 02/08/2026 contra `Instalar.gs`, y la asimetría es la contraria — con
> una consecuencia que cambia la Parte B.**
>
> El discriminador no es el resumen (las dos ramas hacen `actualizadas.push(nombre)`, así que
> aparecer ahí no distingue nada). Es **`COLUMNAS_DELTA_`**, que tiene
> `MARCADORES · CAMPANAS · BASES · MAPEO · SOLAPAS` — **`REUNIONES` no está**. Y las dos
> ramas hacen cosas muy distintas:
>
> | hoja | rama | qué hace |
> |---|---|---|
> | `CAMPANAS` | **con** delta | `asegurarColumna_` por cada columna faltante — inserta sin pisar encabezados ni filas |
> | `REUNIONES` | **sin** delta | `hoja.getRange(1,1,1,def.headers.length).setValues([def.headers])` — **reescribe la fila 1 entera** |
>
> **Consecuencia dura para B.1:** en `REUNIONES`, poner `periodo_id` "al principio o junto a
> las columnas de identidad" **desalinea la hoja**. `instalar()` reescribe los encabezados en
> el orden nuevo pero **no mueve los datos**, así que cada columna a partir del punto de
> inserción queda etiquetada con el nombre de la anterior. Sobre una hoja curada a mano, en
> silencio. Es el modo de falla caro de este proyecto en su forma más literal.
>
> Las dos salidas, y hay que elegir **antes** de escribir la columna:
> 1. `periodo_id` **al final** en `REUNIONES` — seguro con el código de hoy, contra lo que
>    pide B.1.
> 2. **Agregar `REUNIONES` a `COLUMNAS_DELTA_`** con la posición deseada, y recién ahí
>    ponerla donde B.1 quiere. Es una línea más de código y deja a `REUNIONES` con el mismo
>    trato que las otras cinco.
>
> La 2 es mejor y es la que la asimetría estaba pidiendo desde antes de este paso; la 1 es la
> que no toca nada. **No se decide acá.**

**0.3 · Escritores.** `ESCRITORES.md` registra `CAMPANAS` con **cero escritores**. `REUNIONES`
**sí tiene uno desde ayer**: `cargarTemario(texto)`, que el Paso 2.14 separó de su envoltorio
de menú y **agrega filas**. Si `REUNIONES` gana `periodo_id`, `cargarTemario` tiene que
poder escribirlo — si no, cada temario cargado entra sin período y la curaduría vuelve a
pisarse, que es justo lo que este paso viene a evitar. Verificar y reportar.

**0.4 · La carpeta de destino. ✅ Dada por el usuario el 02/08/2026.**

`CONFIG.carpeta_salida` apunta hoy a `1EyTlfg16vpyrftpUXgacShFk8iSbX_fJ`, de
`jpcofanogcba1`, y está sin usar. El destino nuevo es:

```
1LAEVlWZXoGjon2cnaMjGksV0THz3Ejlz
```

**Verificado contra Drive el 02/08**, antes de escribirlo acá: existe, es una carpeta
(`application/vnd.google-apps.folder`), se llama **"Salidas Reportes"** y su dueño es
**`reporteseinformesgcba@gmail.com`** — o sea que cumple `D-03` ("Reportes es dueño de todo
lo que un humano abre") sin que haya que asumirlo. Lo que la Parte 0 igual tiene que
confirmar es que la **cuenta que ejecuta** pueda escribir ahí, que es otra cosa que ser
dueño del ID.

**0.5 · Reportar y parar.**

---

## Parte A — `carpeta_salida` a reportes (`D-03`)

Cambio de una fila de `CONFIG`: `carpeta_salida` pasa a apuntar a la carpeta que dio el
usuario en 0.4, en el Drive de `reporteseinformesgcba`.

**Por qué ahora y no cuando se genere el primer deck:** hoy es una fila de config. Después
del Paso 4 es mudanza de archivos, con los IDs ya escritos en el registro de corridas.

El seed también cambia, no sólo la hoja — si sólo se edita la planilla, el próximo
`Aplicar configuración` lo revierte o lo marca como diferencia. **Verificar cuál de las dos
cosas pasa** y dejarlo consistente: hoja y `SEED_CONFIG_` diciendo lo mismo.

**Verificación:** `Aplicar configuración` ×2 después del cambio. La primera puede reportar
`cambiadas: 1`; la segunda tiene que dar `sin cambios: sí` y `protegidas (con diferencia): 0`.
Si el piso de ruido vuelve a subir, el cambio quedó mal.

→ **Commit A:** `Paso 2.15 ✅ — carpeta_salida a reportes (D-03)`

---

## Parte B — `periodo_id` en `CAMPANAS` y `REUNIONES` (`D-08`)

Columna nueva en las dos hojas, clave foránea a `PERIODOS`.

**El problema que resuelve**, escrito para que no se pierda: el propio código declara que
estas dos hojas son *"curada a mano, cambia cada semana"*. Sin clave de período, la
curaduría de esta semana **pisa la anterior**, y volver a correr un informe de un período
pasado devuelve otro resultado — sin fallar y sin avisar. Con `periodo_id`, la curaduría se
acumula, el motor filtra por período al correr, y agregar una reunión es una fila más en vez
de reconfigurar todo.

**B.1** — Agregar `periodo_id` a las dos hojas y a sus seeds de ejemplo
(`SEED_CAMPANAS_EJEMPLO_`, `SEED_REUNIONES_EJEMPLO_`). Posición: al principio o junto a las
otras columnas de identidad, no al final — se lee como clave, no como dato suelto.

**B.2** — Las filas existentes (3 y 7, todas de ejemplo). **Proponer qué valor llevan y
parar**: asignarles el período vigente, dejarlas vacías con una regla explícita de qué hace
el motor con una fila sin `periodo_id`, o marcarlas como ejemplo y excluirlas. **No decidirlo
solo** — es el precedente de cómo se interpreta una fila sin período, y eso gobierna todas
las que vengan.

**B.3** — `cargarTemario(texto)` tiene que escribir `periodo_id` en las filas que agrega.
Si el período no viene por parámetro, la función **falla explícito**, no asume el vigente:
asumirlo en silencio es exactamente el modo de falla que `periodo_id` viene a cerrar.
Consistente con `D-10` — cuando falta una definición, el motor no la inventa.

**B.4** — `ESCRITORES.md`: actualizar el contrato de `cargarTemario` sobre `REUNIONES`.

**B.5** — **No** implementar el filtrado por período en el motor. Este paso agrega la
columna y garantiza que se escriba; consumirla es del Paso 3 y del Paso 5.

**Verificación:** `Aplicar configuración` ×2. Las dos hojas siguen fuera de la auditoría de
contenido, así que el diff **no debería moverse**: `protegidas (con diferencia): 0` y
`sin cambios: sí` en la segunda. Si el diff se mueve, la columna se agregó en un lugar que
sí se audita y hay que entender por qué.

→ **Commit B:** `Paso 2.15 ✅ — periodo_id en CAMPANAS y REUNIONES (D-08)`

---

## Qué NO hacer

- No implementar el filtrado por período (Pasos 3 y 5).
- No sembrar `CAMPANAS` ni `REUNIONES` automáticamente: son curadas a mano a propósito.
- No tocar `MARCADORES` — su dueño quedó decidido en `D-17` y es del Tramo 2.
- No registrar M2: va en su propio paso, por `D-01`.
- No mover archivos de Drive. La Parte A cambia una fila de config, nada más.
- Sin trailer `Co-Authored-By`.

**Modelo:** Opus.
