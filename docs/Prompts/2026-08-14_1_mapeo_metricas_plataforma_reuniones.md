# 2026-08-14_1 — `MAPEO` de las métricas por plataforma de `reuniones`

> **Estado:** no ejecutado · **subagente:** ninguno
>
> **Reemplaza en el lugar** al contenido anterior de este mismo número —un censo y alta de
> "base nueva"— cuyas tres premisas se descartaron el 14/08 en su propia Parte A: la planilla
> ya está de alta como `base_id = 'reuniones'` desde el `_44`, PRE/POST ya está resuelto en
> `C-50`, y `MAPEO` ya tiene sus doce filas. Se reescribe y no lleva addendum: no se ejecutó.
>
> **Objetivo único:** mapear las métricas por plataforma de las dos solapas de `reuniones` que
> hoy entran sólo con su clave. **No escribe ningún marcador, no toca ninguna plantilla, no da
> de alta ninguna base ni solapa.**

---

## De qué se trata

`SEED_SOLAPAS_` describe `Agenda JM | Post` como *"Alcance, impresiones, clics y
visualizaciones por plataforma"*, y `Agenda JM` como que trae *"impresiones por plataforma en
la misma fila"*. De las dos, `MAPEO` sólo tiene hoy el `id_cuenta` de la POST y el embudo de
Call Center de la PRE. El seed lo dejó dicho: *la POST entra con su clave nada más, sus
métricas las cablea el prompt que las pida*. Éste es ese prompt.

Lo que lo hace necesario ahora: la lámina del "1 a 1" muestra `ALCANCE` dentro de la tarjeta
de Meta, y `digital/CAMPAÑAS_DESGLOCE_DIGITAL` —de donde salen los `u1_*` de los casos `V-21`
a `V-26`— no tiene columna de alcance. El alcance por plataforma, si existe en algún lado, es
acá.

---

## Parte A — censo de columnas y cruce, **sólo lectura** · modelo: **Sonnet** · effort: alto

**No editar ningún archivo ni ninguna hoja. Termina en reportar y parar.**

1. **Los encabezados que faltan.** De `reuniones/Agenda JM` y `reuniones/Agenda JM | Post`
   (encabezado en la **fila 2** en las dos), listar **todas** las columnas y marcar cuáles ya
   están en `MAPEO` vivo y cuáles no. Encabezados **textuales**, sin normalizar: la nota de
   `R-24` sobre un valor de plataforma con espacio al final vale igual para los encabezados.

2. **Qué plataformas hay, y en qué forma.** Si las métricas están **en columnas** —una columna
   por plataforma, tipo "Impresiones Meta"— reportar la lista tal cual. Si están **en filas**,
   con una columna de plataforma, reportar sus valores distintos y cuántas filas tiene cada
   uno. Las dos formas se mapean distinto y no se puede asumir cuál es.

3. **Dónde está el alcance.** Por solapa: qué columnas de alcance hay, con qué encabezado, y
   si son por plataforma o una sola por encuentro. **Si no hay alcance por plataforma en
   ninguna de las dos, decirlo nombrando las columnas revisadas** — cierra la pregunta abierta
   desde el 13/08 y evita que se siga buscando.

4. **Tipos sobre el valor crudo.** `typeof` sobre la celda antes de convertir, y para los
   porcentajes decir si vienen como fracción (`0,2920`) o como número (`29,20`). Los
   `cc_*_pct` de esta misma solapa vienen como fracción y están marcados así en `MAPEO`; no
   suponer que el resto sigue la misma convención.

5. **El cruce que decide el gate.** Para los dos encuentros que el consolidado del 14/08 ya
   tiene medidos —San Cristóbal (`Id cuentas 3354-JULJDGAG`) y Retiro (`3346-JULJDGAG`)—
   comparar, número contra número:
   - lo que dan las columnas por plataforma de `reuniones`, contra
   - lo que dan los `V-21` a `V-26` desde `digital/CAMPAÑAS_DESGLOCE_DIGITAL`, contra
   - `imp_totales` de la PRE (`V-88`, columna AA).

   **La hipótesis a falsar:** en San Cristóbal, `17.401` de Google más `25.099` de Meta da
   `42.500`, que es el `imp_totales` del `V-88`. Si las columnas de `reuniones` reproducen ese
   desglose, las dos fuentes dicen lo mismo y hay que elegir una. **Si no lo reproducen, la
   diferencia es el hallazgo y no se resuelve acá:** se reporta.

6. **`3346` en el reporte, con su advertencia al lado.** Ese encuentro trae el bloque digital
   en cero. **Un cero suyo no es una medición**, y no sirve para confirmar ni para descartar
   nada. Reportarlo, marcado.

**Reportar y parar.**

---

## Gate — decisión del usuario

Con el cruce a la vista, el usuario define **cuál fuente manda para el desglose PRE**:
`reuniones/Agenda JM` o `digital/CAMPAÑAS_DESGLOCE_DIGITAL`. Es la decisión, no el censo, y
`CLAUDE.md` §7 pide una sola fuente por pregunta: si las dos quedan mapeadas, la que no manda
tiene que decir en sus notas que no manda y por qué. **La Parte B no arranca sin esto.**

---

## Parte B — escribir `MAPEO` · modelo: **Opus** · effort: alto

1. **Una fila por columna** en `SEED_MAPEO_REUNIONES_`, con `base_id`, `campo_logico`, `hoja`,
   `columna` y `notas`. Los nombres de `campo_logico` **se eligen contra los que ya existen**,
   no de cero: la familia `u1_*` del consolidado ya usa `u1_meta_impresiones`,
   `u1_meta_clics`, `u1_meta_vistas`, `u1_google_impresiones`, `u1_google_clics`, y
   `alc_potencial` / `alc_cobertura_pct` ya ocupan el prefijo de alcance en esta misma base.
   Reusar donde signifique lo mismo; **inventar sólo lo que no existe, y decir en las notas
   por qué**.

2. **Cada fila lleva su nota con el encabezado textual de origen**, como las doce que ya
   están. Es lo que permite auditar el mapeo sin abrir la planilla.

3. **Los porcentajes**, con su formato declarado según lo medido en A.4 — `fraccion` si viene
   fracción. Un porcentaje mal declarado publica un número cien veces mayor sin que nada falle.

4. **No derogar `R-24`.** El reparto Meta / Google / Programmatic tiene regla escrita, con
   Programmatic **por resta**. Si las columnas de `reuniones` traen una columna propia de
   Programmatic, eso **no** deroga la regla por sí solo: se reporta la contradicción y se
   decide aparte. Escribir una fila de `MAPEO` que la contradiga en silencio es exactamente lo
   que `CLAUDE.md` §7 prohíbe.

5. **Nada de filtros ni marcadores.** Si el mapeo sugiere que algún marcador necesita filtro,
   **verificar primero que el campo esté en `MAPEO`** —un filtro sobre un campo no mapeado se
   ignora en silencio— y **anotarlo en el reporte**, no ejecutarlo.

6. **La rama por cuenta está cableada a `base_id === 'digital'`.** Si el desglose PRE termina
   saliendo de `reuniones`, esa rama no lo alcanza. **No tocarla en este prompt:** anotarlo
   como consecuencia, que es un cambio de código y va aparte.

7. Correr `tools/listas.js`, commit de una sola parte lógica, y `git push`.

---

## Lo que este prompt **no** hace

- **No cablea `MARCADORES`.** Sin decisión de fuente no hay token, y el gate es del usuario.
- **No agrega la tarjeta de Google al PRE de la plantilla.** Eso es de la plantilla, `C-01`.
- **No define `-` ni `---`.** Esa decisión sigue abierta y tiene prompt propio pendiente.
