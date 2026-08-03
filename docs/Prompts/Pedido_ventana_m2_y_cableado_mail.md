# Pedido — La ventana de los `m2_*` y su cableado contra `digital/Directa Mail`

**Estado:** vivo · **Fecha:** 2026-08-03 · **Ubicación:** `docs/Prompts/Pedido_ventana_m2_y_cableado_mail.md`

> **Documentación y configuración, no código.** Nada de esto toca un `.gs`. Va suelto, como
> `D-21`, porque es cableado y regla de negocio.
>
> **De dónde sale:** decisiones del usuario del 03/08/2026, tomadas en conversación y
> todavía sin destino en el repo. Se escriben acá para que no se pierdan.

---

## Parte 0 — Verificación de premisas. Sólo lectura. Reportar y **PARAR**.

**0.1 · `digital/Directa Mail` y su espejo.** `SOLAPAS` registra `m2/Directa mail` como
`derivada`, con la nota "espejo de `digital/Directa Mail`". El usuario decidió cablear contra
la **original**, no contra el espejo. Confirmar que `digital/Directa Mail` sigue
`uso = fuente` y que `m2/Directa mail` sigue `derivada`. **No reclasificar ninguna.**

**0.2 · La columna F.** `MAPEO` la tiene como `digital/Directa Mail/mail_fecha` → `F`. El
contrato de fecha es `fecha_periodo` (`S-02`), y `leerFuente` **sólo** busca ese
`campo_logico`. Confirmar que hoy no existe `digital/Directa Mail/fecha_periodo`.

**0.3 · El estado del año tipeado.** `R-03` marcó `rango_plausible = no` en esa columna por
un año `20206`. El usuario dice que **ya lo corrigieron en la base**. Verificar contra la
base viva: cuántas filas tienen fecha fuera de rango plausible en `digital/Directa Mail`
col F hoy. Reportar el número, no la impresión.

**0.4 · El filtro de estado ya está.** `MAPEO` tiene
`digital/Directa Mail/mail_estado` → `D` con `valores_incluidos = "Implementado, En curso"`.
Confirmarlo y reportar cuántas filas excluye hoy, con el desglose por valor.

**0.5 · `digital` es `snapshot`.** `BASES` lo declara así por decisión del `Paso-2.3`: el
recorte por período lo hace el agregador vía link campaña↔encuentro, **no** por ventana de
fecha cruda. Confirmar que sigue así. **No cambiarlo.**

**Reportar 0.1–0.5 y PARAR.**

---

## Parte A — La regla de la ventana, en `REGLAS_NEGOCIO.md`

Escribir una `R-NN` nueva —el número lo asigna el archivo, no este pedido— con este
contenido:

- **La ventana de los `m2_*` es la de `R-11`: siete días, viernes a jueves, extremos
  inclusive.** No lleva `periodo_ref` propio: cae al eslabón 4 (`CONFIG`) o al 5 (calculado)
  como el resto del informe.
- **El equipo hoy trabaja de viernes a viernes**, ocho días. Es una diferencia conocida y
  deliberada: el usuario decidió el 03/08/2026 que el motor use siete. **Los números del
  motor van a diferir de los publicados**, por las filas del viernes de cierre. Cuando la
  diferencia aparezca en la primera prueba de punta a punta, **no es un bug** — está acá
  escrito antes de que pase.
- **El default es "todo lo que M2 tenga `Implementado` o `En curso` en la ventana"**, y el
  equipo saca o pone lo que necesite. Configurar es el caso normal (`R-11` Addendum 1
  punto 2).

Referenciar `R-11` y `D-21`, no repetirlos.

---

## Parte B — La fila que falta en `MAPEO`

Agregar `digital/Directa Mail/fecha_periodo` → columna `F`, con nota que diga que es la
misma columna que `mail_fecha` y que el contrato vivo es `fecha_periodo` (`S-02`).

**Va al seed, no sólo a la hoja** — `upsertPorClave_` reescribe la fila entera desde el seed
y una celda cargada sola se borra en la corrida siguiente. Es la misma trampa que se midió
con `INFORMES.plantilla_id` el 03/08.

**Y no cambia ningún número hoy:** mientras `digital` sea `snapshot`, `leerFuente` devuelve
antes de mirar la fecha. Se carga igual, porque la columna elegida es una decisión y sin la
fila no queda registrada en ningún lado.

---

## Parte C — Los pendientes que esto abre

En `docs/PENDIENTES_consistencia.md`:

- **`P1` · Los `m2_*` no se pueden calcular hasta el Paso 5.** Se cablean contra
  `digital/Directa Mail`, y `digital` se lee por `filasDigitalDeEncuentro()`, que necesita el
  `id_cuenta` del ítem que se emite. El despachador todavía no lo recibe.
- **`P1` · La fecha de generación del informe no tiene con qué salir.** Ninguna de las seis
  operaciones produce "ahora": `TEXTO` lee un literal de `valor_fijo`, no construye. Misma
  forma que el `P1` de la operación de lista. Y antes que eso, **el token tiene que existir
  en la plantilla, que es del equipo** (`C-01`): no se agrega por criterio técnico.
- **`P2` · `m2/Directa mail` quedó sin usarse.** Es espejo de la solapa que sí se usa. Si
  alguna vez se lee, hay doble conteo — mismo caso que `digital/RDV`. Sigue `derivada` a
  propósito.

---

## Qué NO hacer

- No cambiar `modo_periodo` de `digital`.
- No reclasificar `m2/Directa mail`.
- No cablear filas de `MARCADORES`: eso es de la Parte D del `Paso-3-v3`.
- No inventar el número de la `R-NN`: usar el siguiente libre del archivo.
- Sin trailer `Co-Authored-By`.

**Modelo:** Opus.
