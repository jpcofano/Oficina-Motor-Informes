# Paso 2.14 — Generalizar `hayUi_()`

**Estado:** vivo · **Fecha:** 2026-08-02 · **Ubicación:** `docs/Prompts/Paso-2.14_generalizar_hayUi.md`

## Objetivo

Que todo el protocolo de configuración corra por API sin que nadie abra la planilla.

Hoy `hayUi_()` protege **un solo camino de 34**, y `menuEstadoConfiguracion_`
(`Instalar.gs:2052`) y `menuAplicarConfiguracion_` (`:1819`) rompen sobre HTTP. Está
registrado en el handoff del 01/08 y es el bloqueo real: mientras siga, cada verificación
del protocolo exige que una persona abra la planilla y copie números a mano.

---

## Parte A — Inventario (sólo lectura). Reportar y **PARAR**.

**A.1** — Las 40 llamadas a `getUi()` que registra `INVENTARIO_CODIGO.md`: cuáles están
protegidas por `hayUi_()` y cuáles no. Tabla `función → archivo:línea → protegida sí/no`.

**A.2** — Clasificar cada sitio sin proteger en uno de tres:

- **(a) `alert` / `toast` informativo** — se puede omitir sobre HTTP sin perder nada, con
  el contenido devuelto en la respuesta.
- **(b) `prompt` / `confirm` que decide el flujo** — sobre HTTP no hay quién responda. Hay
  que definir qué hace: fallar explícito, o tomar un default **declarado**.
- **(c) construcción de menú** — no aplica, corre sólo al abrir la planilla.

**La (b) es la que importa.** Un `confirm` que sobre HTTP se auto-responde "sí" convierte
una guarda en nada. Es el mismo error de categoría que retirar una migración por "nunca se
ejecutó", al revés.

**A.3** — Reportar y parar. No editar nada.

---

## Parte B — Se escribe con la decisión sobre A.2(b)

No adelantar. El criterio que va a gobernar B, para que no se pierda entre las partes:

> **Degradar sin romper y sin decidir en silencio** — el mismo patrón que `«FALTA»`. Un
> `alert` que no se puede mostrar **se omite y se devuelve en la respuesta**. Un `confirm`
> que no se puede hacer **no se asume**.

---

## Restricciones

- No cambiar la lógica de ninguna función. Esto es sólo la capa de UI.
- No tocar el motor de diff/upsert (las 113 líneas compartidas por seis llamadores).
- No arreglar la asimetría Estado / Aplicar — es el P1 abierto y es otro paso. Si al correr
  por API queda más expuesta, se anota.
- No renombrar nada.

---

## Verificación

1. Los cinco controles positivos por HTTP, 5 de 5: `probarBloqueDeAlcance_`,
   `probarMigracionesEnDiff_`, `probarSoloEnHoja_`, `probarProtegidasConDiferencia_`,
   `probarResumenDesagregado_`.
2. **Estado y Aplicar por API devuelven lo mismo que desde el menú.** El control es la
   corrida verificada del 02/08:
   `cambiadas: 0 · agregadas: 0 · migraciones: 0 · solo_en_hoja: 7 · protegidas (con
   diferencia): 0 · protegidas (sin diferencia): 8 · sin cambios: sí`
3. Aplicar ×2 por API, idénticas.
4. **Abrir la planilla y correr los dos desde el menú: siguen funcionando igual.**
   Generalizar `hayUi_()` no puede romper el camino con UI.
5. `git status --porcelain --untracked-files=all` limpio salvo lo del paso.

---

## Nota obligatoria al cerrar

`INVENTARIO_CODIGO.md` es la foto del 01/08 y este paso toca `Instalar.gs`. **No rehacer el
inventario**: anotar en el propio archivo qué números quedaron vencidos por este paso y por
qué. `tools/inventario.js` re-corrido sigue siendo la fuente viva — el `.md` es la foto, y
eso ya está declarado en `CLAUDE.md §7`.

---

## Qué NO hacer

- No borrar funciones.
- No tocar `promoverFechasElegidas` ni ningún escritor de `MAPEO`.
- No avanzar a la Parte B sin reportar la A.
- Sin trailer `Co-Authored-By`.

**Modelo:** Opus.

---

## Aviso de alcance

Si la Parte A encuentra muchos casos **(b)**, el paso se agranda y conviene partirlo.
Reportarlo antes de seguir en vez de resolverlos todos de corrido.
