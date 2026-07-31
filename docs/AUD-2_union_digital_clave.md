# AUD-2 — `unirDigitalPorCuenta`: ¿une por `clave` o por `id_cuenta`?

> Auditoría de solo lectura, Paso 2.7 Parte C (`docs/Prompts/Paso-2.7_destrabar_solapas.md`).
> No corrige nada — responde con la línea de código exacta. 30/07/2026.

---

## La pregunta

`digital/Digital/clave` está mapeado a la **columna A** (ejemplo: `"Ciudad Bilingue"`, un
nombre de campaña). `digital/Digital/dig_id_cuenta` está en la **columna T** (ejemplo:
`"0637-OCTEDUCG"`). En las otras cinco solapas de `digital`, el `id_cuenta` está en la
columna A. Si `unirDigitalPorCuenta()` uniera por `clave` en vez de por `dig_id_cuenta`,
estaría comparando nombre de campaña contra código de cuenta: nunca matchearía, o
matchearía por casualidad — y eso encajaría con el timeout de 6 minutos de
`menuProbarUnionYAnclaje_` (Tarea 7 de AUD-1, todavía sin diagnosticar).

## 1. ¿Por qué campo une `unirDigitalPorCuenta`?

**Por `*_id_cuenta`, no por `clave`.** `Union.gs:81-87` declara el join explícitamente
por solapa:

```js
var SOLAPAS_CANAL_DIGITAL_ = [
  { solapa: 'Digital', idCampo: 'dig_id_cuenta', prefijo: 'dig' },
  { solapa: 'Directa Mail', idCampo: 'mail_id_cuenta', prefijo: 'mail' },
  { solapa: 'Directa SMS', idCampo: 'sms_id_cuenta', prefijo: 'sms' },
  { solapa: 'Directa IVR', idCampo: 'ivr_id_cuenta', prefijo: 'ivr' },
  { solapa: 'Alcance', idCampo: 'alc_id_cuenta', prefijo: 'alc' }
];
```

Y la maestra `Seguimiento digital` se indexa por `sd_id_cuenta` (`Union.gs:93`):

```js
var idMaestra = buscarMapeo(BASE_DIGITAL_, SOLAPA_MAESTRA_DIGITAL_, 'sd_id_cuenta');
```

`canal.idCampo` es lo que resuelve la columna real vía `buscarMapeo()` (`Union.gs:127`),
así que para la solapa `Digital` el join usa `dig_id_cuenta` → columna **T**, no `clave`
→ columna A. El campo `clave` **no aparece en ningún punto de `Union.gs`** — no se
importa, no se lee, no se compara.

## 2. ¿Está comparando nombre de campaña contra código de cuenta?

**No.** La hipótesis que motivó esta auditoría queda descartada por el código: el join
ya es `id_cuenta` ↔ `id_cuenta` en las seis solapas, con la columna correcta resuelta por
`campo_logico` (no por posición fija). El timeout de 6 minutos de `menuProbarUnionYAnclaje_`
sigue sin explicación — no es esto. Sigue abierto (ver `PROYECTO.md` §7, Tarea 7 de AUD-1).

## 3. ¿`resolverClave_` usa el `campo_logico` literal `clave`?

**Sí, con fallback a `campana`** (`Fuentes.gs:121-125`):

```js
function resolverClave_(baseId, solapa) {
  var clave = buscarMapeo(baseId, solapa, 'clave');
  if (clave.ok) return clave;
  return buscarMapeo(baseId, solapa, 'campana');
}
```

Pero esta función **no la usa `Union.gs`** — la usa únicamente `leerFuente()`
(`Fuentes.gs:278`), y solo para decidir qué filas son basura al leer una solapa (fórmulas
que devuelven `''`, colas de la hoja). Es un problema de *calidad del descarte de
filas al leer*, no del join.

**Las cinco solapas de canal no tienen `clave` ni `campana` planos** — solo tienen la
versión con prefijo (`mail_campana`, `sms_campana`, `ivr_campana`; `Alcance` y
`Seguimiento digital` no tienen ningún campo de campaña plano). Para esas cinco,
`resolverClave_()` devuelve `{ok:false}` en las dos llamadas, y `leerFuente()` cae al
criterio documentado en `Fuentes.gs:36`: fila 100% vacía. No es un error ni un silencio
— es el fallback que el propio código anuncia — pero es un descarte de basura más flojo
que el de las solapas que sí tienen `clave`/`campana` plano (`digital/Digital`, que
además es la fila que la Parte B de este mismo prompt marca como probable sobrante).

## Conclusión

El diseño del join está bien. La hipótesis que vinculaba el timeout con `clave` vs
`id_cuenta` no se sostiene — hay que seguir buscando la causa del timeout por otro lado
(candidato más probable con esta evidencia: el scoring `O(realizadas × candidatos)` de
`anclarEncuentros()`/`scoreMatchDigitalRdv_()`, que no se tocó en esta auditoría).
