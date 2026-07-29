# Paso 1.8 — Higiene de proyecto: commit por paso + zona horaria + scopes

> **Contexto:** revisión del repo al 29/07/2026 (commit `8f76cc5`). El motor ya tiene
> las 7 hojas registro, `seedConfiguracion()`, `registrarPlantillasDesdeCarpeta()`,
> `leerBases/leerInformes` y `abrirBase` con caché. Antes de entrar al Paso 2
> (lectura de datos con ventana de fechas) hay que cerrar tres cosas de higiene.
>
> **Regla de oro:** este paso NO calcula nada, NO lee bases. Solo config del proyecto
> y documentación.
>
> **Importante:** este prompt tiene **tres partes y cada una lleva su propio commit.**
> La Parte A es justamente la regla que hace que sea así.

---

## Parte A — Convención: UN COMMIT POR PASO

En el commit `8f76cc5` quedaron bundleados cuatro pasos (0.5, 1, 1.6, 1.7) porque se
fueron encimando en los mismos archivos sin commit intermedio. **No se rehace**
(reescribir historia ya pusheada no vale la pena, y el mensaje detalla qué entró).
Pero de acá en adelante:

1. Terminás un paso → **avisás y esperás** que el usuario lo pruebe. No seguís al
   siguiente por tu cuenta.
2. El usuario confirma que pasó.
3. Recién ahí: actualizás la doc (ver Parte C) y commiteás.
4. Mensaje: `Paso N ✅ — <resumen corto>`. **Un paso por commit, sin bundles.**
5. Si un paso toca los mismos archivos que el anterior, igual va en su propio commit:
   alcanza el orden temporal, no hace falta separar por archivo.
6. **Si estás por commitear y en el working tree hay cambios de más de un paso,
   pará y preguntá** en vez de bundlear.

**Tarea:** dejá esta regla escrita en `Plan Inicial/PROYECTO.md` (sección propia, p. ej.
"Convención de trabajo"), para que quede fija y no dependa de que se repita en cada prompt.

→ **Commit A:** `Convención: un commit por paso (documentada en PROYECTO.md)`

---

## Parte B — Zona horaria y scopes (`appsscript.json`)

Hoy el archivo dice:

```json
{
  "timeZone": "America/New_York",
  "dependencies": {},
  "exceptionLogging": "STACKDRIVER",
  "runtimeVersion": "V8"
}
```

**B.1 — `timeZone`.** Tiene que ser `America/Argentina/Buenos_Aires`. No es cosmético:
desde el Paso 2 el motor filtra por ventana de fechas, y `new Date()`, la lectura de
celdas de fecha y `Utilities.formatDate()` usan la zona del proyecto. Con New York
(3 h de offset) los encuentros del borde del período caen del lado equivocado y los
totales dan mal sin tirar ningún error — el peor tipo de bug.

**B.2 — `oauthScopes`.** Declaralos explícitos para que la pantalla de autorización sea
una sola y previsible, en vez de ir pidiendo permisos de a poco a medida que el motor
toca servicios nuevos:

```json
"oauthScopes": [
  "https://www.googleapis.com/auth/spreadsheets",
  "https://www.googleapis.com/auth/drive",
  "https://www.googleapis.com/auth/presentations",
  "https://www.googleapis.com/auth/script.container.ui"
]
```

> `drive` (no `drive.file`) porque el motor abre bases y plantillas **por ID** que no
> fueron creadas por el script. Si más adelante se agrega el trigger semanal y el aviso
> por mail (Paso 10), van a hacer falta `script.scriptapp` y `send_mail`; **no los
> agregues ahora**, que se sumen cuando ese paso llegue.

**Después de editar:** `clasp push`. Ojo que al cambiar scopes Google va a pedir
**re-autorizar** la próxima vez que se corra algo desde el menú — es esperable, no es un
error.

→ **Commit B:** `Fix: timeZone Buenos Aires + oauthScopes explícitos`

---

## Parte C — Documentar al cerrar cada paso

De acá en adelante, antes de cada commit de paso, actualizá
`docs/Sesiones/HANDOFF.md` con una entrada:

```
## Paso <N> — <nombre corto> (<AAAA-MM-DD>)
- **Qué hace el prompt:** <1–2 líneas, el objetivo>.
- **Qué se hizo:** <archivos/funciones editados, hojas/columnas/menús tocados>.
- **Prueba:** <cómo se probó y resultado>.
- **Pendientes/decisiones:** <si quedó algo abierto; si no, "ninguno">.
```

Y si el paso cambió algo estructural (esquema de hojas, arquitectura, decisiones),
reflejalo también en `Plan Inicial/PROYECTO.md`, que es el doc maestro vivo.

**Tarea de este paso:** dejá esa plantilla de entrada escrita al inicio de
`HANDOFF.md` para que se use siempre igual, y agregá las entradas de las Partes A y B.

→ **Commit C:** `Doc: plantilla de bitácora por paso en HANDOFF.md`

---

## Prueba del usuario

1. Abrir `appsscript.json`: confirmar `America/Argentina/Buenos_Aires` y los 4 scopes.
2. `clasp push` → abrir la planilla → correr cualquier ítem del menú → **re-autorizar**
   cuando lo pida, y verificar que la pantalla pida los permisos de una sola vez.
3. Correr `probarConexionBases()` para confirmar que sigue funcionando después del
   cambio de scopes.
4. `git log --oneline` → deben verse **tres commits separados** (A, B, C), no uno solo.
   Ese es, literalmente, el test de la Parte A.

---

## Decisión que sigue abierta (NO la resuelvas vos)

**Looker vs Seguimiento Digital como fuente de verdad digital/directa.** Ambas cubren
lo mismo (métricas por campaña) y las dos están mapeadas en `docs/MAPEO_completo.md`.
Que estén las dos en `MAPEO` **no** genera doble verdad: `MAPEO` es solo lookup físico
`campo_logico → columna`. La canonicidad se define en `MARCADORES`, al decidir qué
`base_id` alimenta cada token — o sea, **en el Paso 3**, no antes.

Recomendación a favor de **Looker**: viene consolidado por campaña en una sola hoja
(`resumen_metricas`), que calza con el modelo "una fila por campaña → `camp_*`".
Seguimiento Digital da más detalle por canal, pero son 5 hojas y más joins.
**La decisión es del usuario**; preguntala cuando arranque el Paso 3.
