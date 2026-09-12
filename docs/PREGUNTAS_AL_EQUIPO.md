# Preguntas al equipo — abiertas, y qué bloquea cada una

> **Estado: vivo.** Se edita. Creado el 11/09/2026 (`2026-09-11_4` Parte D), autorizado
> explícitamente por el usuario.
>
> **Reemplaza** a la sección *"Preguntas al equipo"* de `docs/PENDIENTES_consistencia.md` como dueño
> de la pregunta *«¿qué se le preguntó al equipo y sigue sin respuesta?»* (`CLAUDE.md` §7, fila
> actualizada en el mismo commit).

---

## Por qué existe

Estas preguntas estaban **repartidas** entre `PENDIENTES`, los `VALIDACION_*` congelados y
`CONFIG_INFORMES.md`, y las tres cosas las guardan por motivos distintos: `PENDIENTES` las ordena
por **hueco**, `VALIDACION_*` las congela con su **medición**, `CONFIG_INFORMES` las mezcla con
decisiones editoriales ya tomadas. ⛔ **Ninguno contesta la pregunta que importa cuando se va a
hablar con el equipo:** *¿qué hay que preguntarle, y qué se destraba con cada respuesta?*

⭐ **Una fila por pregunta, y no duplica texto: apunta.** El detalle vive donde §7 dice que vive; acá
está **qué se pregunta**, **qué bloquea** y **dónde va a vivir la respuesta**. Un documento que
repite el contenido de otros seis se separa de los seis en una semana.

⚠ **Y lo que este archivo NO es:** no es un backlog de trabajo propio ni una lista de dudas
técnicas. Una pregunta entra acá **sólo si la respuesta es del equipo** — si la puede contestar una
medición, es un pendiente y va a `PENDIENTES`.

---

## Las seis abiertas

| # | qué se pregunta | ⛔ qué BLOQUEA | dónde vive la decisión |
|---|---|---|---|
| **1** | ⭐⭐ **`R-05`: ¿cómo se identifica un reenvío?** El equipo confirmó el **criterio** el 11/09 —*«no lo sumamos en Entregados y Enviados. El resto se acumula todo»*— pero **no la SEÑAL**. El motor usa hoy la etiqueta `Remitente` (col AI) del envío de **fecha mínima**, que es una implementación nuestra, no algo que el equipo haya validado | La señal **sólo discrimina en 126 de 434** campañas multi-envío (**29 %**). En las otras **308 la etiqueta no cambia** entre el primer envío y los reenvíos ⇒ **la duplicación vuelve sin fallar**. Sin una señal mejor, `R-05` queda aplicada al 29 % del universo | `REGLAS_NEGOCIO.md` `R-05` (regla) · caso `V-144` del CSV del 11/09 (números y límite) |
| **2** | **¿De dónde sale el `1.037.621` de la caja Alcance de `L-012`?** No se reprodujo desde ninguna fuente conocida | La caja Alcance de `L-012` no se puede cablear ni validar. Cualquier número que el motor publique ahí nace **sin testigo** | `CONFIG_INFORMES.md` §2 (el bloque de `L-012`) |
| **3** | **`cc_campanias`: ¿cuál es la regla definitiva?** Hoy corre con una **regla provisoria** y el marcador publica `---` (tiene fila y falla) | El bloque de Call Center de la lámina no cierra. Y mientras la regla sea provisoria, **un número correcto no se distingue de uno que acertó** | `CONFIG_INFORMES.md` §2 · la fila de `MARCADORES` |
| **4** | **La regla de cálculo del FORMATO de post:** el formato **no se calcula** — el motor no tiene con qué derivarlo | `L-010` publica `/////` por una causa distinta de *«nadie lo cableó»*, y esa distinción ya está escrita como una de las cinco causas de un `/////` | `CONFIG_INFORMES.md` §4.4 (las cinco causas) |
| **5** | ⭐ **La plantilla (`C-01`):** qué cajas son del motor y cuáles las escribe el equipo a mano, lámina por lámina donde todavía no está claro | `C-01` dice *«la plantilla es del equipo, el motor se adapta»*, así que **el motor nunca decide esto solo**. Sin la respuesta, un `-` tipeado por el equipo y un `/////` del motor **son indistinguibles mirando el deck** (`C-75`) | `REGLAS_NEGOCIO.md` `C-01` · `CIERRE_POR_LAMINA.md` (el ✅ lo pone el usuario) |
| **6** | ⛔ **El `% OR` global del equipo: ¿sobre qué denominador?** Su deck **saca la fila entera** del reenvío en vez de filtrarla, así que publica aperturas `86.464` y clics `444` donde su propia regla pide `150.506` y `1.376` | **Ninguno de los dos decks publica hoy los cuatro números correctos** ⇒ el arreglo de `R-05` **no se valida contra el equipo**. No hay testigo externo para los cuatro a la vez | caso `C-134` del CSV del 11/09 |

---

## Cómo se cierra una fila

⭐ **Con la respuesta escrita en el documento que §7 declara dueño**, y acá sólo se tacha la fila con
la fecha y el puntero. ⛔ **No se borra:** una pregunta cerrada explica por qué algo se decidió como
se decidió, y ese es justamente el contexto que se pierde primero.

⚠ **Una respuesta parcial NO cierra la fila.** La 1 es el caso vivo: el equipo contestó el
**criterio** y la fila sigue abierta por la **señal**. Dar por cerrada una pregunta con media
respuesta es cómo se publica una regla que nadie validó del todo.
