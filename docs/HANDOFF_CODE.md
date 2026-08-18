# HANDOFF CODE — estado actual

> Lo escribe **solo Claude Code**, y se **reescribe** entero cada vez: es un puntero al
> presente, no un historial. La historia está en `docs/BITACORA.md`.

**Última actualización:** 2026-08-17, al cerrar la **tanda 4** de `D-33`

## ⭐ Dónde estamos: **la migración de `D-33` está CERRADA sobre todo lo migrable — 42 de 48**

**El frente 13 terminó.** Piloto, tandas 1, 2, 3 y 4, todas cerradas y verificadas.

| tanda | qué | criterio de cierre |
|---|---|---|
| piloto | los 8 `imp_*` de `looker/DIGITAL` | identidad de filas + descuadre + canario |
| 1 | los `mail_*` de `digital` | **igualdad exacta de valores** |
| 2 | los 7 `m2_*` | **igualdad exacta**, 11 min entre tomas |
| 3 | los 17 de `rdv` | **igualdad exacta**, 5 min 52 s entre tomas |
| **4** | `frecuencia`/`gcba_frecuencia` | **la partición `4 + 22 = 26`** — los valores **no** podían ser el criterio |

**Los seis `enc_mails_*` que faltan NO son una tanda pendiente**: no publican
(`«FALTA:@ultimo_ambiguo»`), así que no hay contra qué verificar. **Es un hueco de dato y lo
destraba una decisión del usuario**, no un prompt de migración. **42 de 48 no es "faltan seis": es
"está completo"** sobre lo que hoy se puede migrar y comprobar.

## ▶ Lo que esto destraba: **el frente 13 bis**

**`DIMENSIONES_` pasa a ser hoja de registro** — decidido por el usuario el 16/08, y **esperaba
exactamente a esto**: mover el traductor mientras se traduce es cambiar las dos variables a la vez.
Esa colisión ya no existe.

**Prompt escrito y sin ejecutar: `docs/Prompts/2026-08-16_6_dimensiones_a_hoja.md`.** ⚠ **Se revisa
antes de correr** — es de antes del cierre de la migración y sus premisas envejecieron dos días.

## Lo demás que está escrito y sin correr

| qué | estado |
|---|---|
| `2026-08-16_5` — los `pauta_*` duplicados | escrito, sin ejecutar. Van a validación, no a migración: filtro vacío en los dos lados |
| `verificarEncabezadosDeMapeo()` | corrió **una vez** (dio el hallazgo 151/161) y **no se re-corrió después de arreglar el cuadre** |
| `R-26` Parte B | la Parte A cerró: la premisa se sostiene **como régimen**, no como invariante |

## Lo que quedó abierto de esta corrida — **los tres en `PENDIENTES`**

1. ⚠ **Ninguna hoja de registro fecha una escritura sobre `MARCADORES`.** La tanda 4 **estaba
   aplicada y no se sabe en qué corrida** — entre las 11:58 y las 19:08 del 17/08. `CORRIDAS` no lo
   puede responder: registra generaciones de informe y es un **insumo, no un log** (`D-07`).
2. ⚠ **`tools/snapshot.js` fecha en UTC** y adelanta un día después de las 21:00 locales. Se
   corrige con `--fecha=AAAA-MM-DD`, pero **el default no avisa**.
3. ⚠ **Re-correr el snapshot el mismo día pisa la evidencia anterior.** Pasó con
   `MARCADORES_2026-08-17.tsv`: se recuperó de git, pero nada en el script advierte.

## Dos cosas del instrumental que cambiaron esta corrida y conviene saber

- **`curarCamposMarcadores_` falla cuando un lote no escribe ninguna celda**, con el diagnóstico por
  marcador —¿existe la fila?, ¿qué dice la hoja?, ¿qué se pedía?—. **Los once wrappers lo heredaron
  sin tocarlos**, y dejaron de imprimir el paso siguiente sobre una corrida que no hizo nada.
  ⚠ **«Ya estaba aplicado» también falla, a propósito.**
- **`operandosDeRatio_` nunca había matcheado la traza real.** El fixture de su prueba estaba
  **deducido del template** en vez de copiado de una salida: fixture y código compartían el supuesto
  falso y daba verde. Ahora `tools/probar-tanda4.js` tiene **26 afirmaciones** sobre la traza real.

## Lo que NO se tocó y sigue como estaba

- **Los `cc_*` publican `—` por `_32.2`** — decidido, no se reabre.
- **`SECCIONES` se siembra como `CONFIG`** (sólo lo ausente) — decidido, en `PENDIENTES` sin
  arreglar.
- **Los estados `-` y `---`** — decididos y diferidos.
