# `_46` · Los mails autorizados salen del código, y después se despliega

> **Reemplaza al `_46` entregado antes, que no se ejecutó.**
>
> **Modelo por parte, declarado en cada una.** Sin declaración, Sonnet.
>
> Hay reunión hoy. **Si algo no cierra, reportar y parar** — no improvisar un despliegue que después
> haya que desarmar.

---

## Lo que hay que arreglar, en orden

1. **`API_AUTORIZADOS_` es una constante en `Api.gs`** con un solo mail. Sumar a alguien exige
   `clasp push`. Tiene que salir a `CONFIG`, como ya salió `umbral_anclaje_reunion` por el mismo
   motivo: es un parámetro de operación, no código.
2. **El `access` del despliegue.** `appsscript.json` declara `ANYONE_ANONYMOUS`, y con eso
   `Session.getActiveUser().getEmail()` devuelve vacío. `servirPanel_` llama a `apiBarrera1_`, que
   rechaza sin mail: **tal como está, el panel rechaza a todo el mundo, incluido el dueño.** Y no se
   arregla sacando la barrera — con `executeAs: USER_DEPLOYING`, cualquiera con la URL dispararía
   una generación con la cuenta del que desplegó.

---

## Parte A · Sólo lectura

**Modelo: Sonnet. Effort: alto.**

1. **`CONFIG`** — confirmar que no hay ninguna clave de mails hoy, y con qué nombre encajaría en el
   estilo de las que ya están.
2. **El cache.** `leerConfig` pasa por `memoRegistro_`. Decir **cuánto dura** y qué hay que hacer
   para que un mail agregado a mano tenga efecto — si hace falta esperar o limpiar algo, eso es
   parte de la instrucción de uso y va escrito.
3. **`tools/api.js`** — confirmar si postea **sin sesión de Google**, sólo con el token de la
   barrera 2. Si es así, subir el `access` a "cualquiera con cuenta de Google" **le rompe el cliente
   Node**, y eso es un intercambio que decide el usuario.
4. **Qué despliegues existen hoy**, con su `access` y su URL, y si `clasp` puede desplegar desde acá.
5. **¿Un mismo proyecto admite dos despliegues con `access` distinto** — uno anónimo para la API y
   uno con login para el panel? **Si no lo sabés con certeza, decilo.** Es lo que decide si hay
   solución sin intercambio.

**Reportar y parar.**

---

## Parte B · Los mails a `CONFIG`

**Modelo: Opus. Effort: alto.** Es la puerta de entrada al motor; equivocarse acá no cuesta una
re-corrida.

1. **Una clave en `CONFIG`** con la lista de mails autorizados, separados por comas. `apiBarrera1_`
   la lee de ahí en vez de la constante.
2. **Falla cerrada, y esto es lo que hay que hacer bien.** Si la hoja no se puede leer, si la clave
   no existe o si viene vacía, **la barrera deniega**. No cae a un default del código, no deja pasar
   "porque no pudo verificar". Un fallo de lectura y una lista vacía tienen que terminar los dos en
   rechazo, y el motivo del rechazo tiene que distinguirlos en la traza.
3. **Normalizar antes de comparar** — espacios alrededor y mayúsculas. Una lista cargada a mano trae
   las dos cosas.
4. **El default de seed** lleva **estos cuatro**, que dio el usuario el 13/08:

   ```
   jpcofanogcba1@gmail.com, reporteseinformesgcba@gmail.com, jpcofano@gmail.com, jpcofano2@gmail.com
   ```

   Recordar que el seed **sólo completa celdas vacías**: si la fila ya existe, no la repunta, así que
   hay que verificar cómo quedó la celda viva y reportarlo. Y que la lista quede cargada **no
   alcanza**: con `access: ANYONE_ANONYMOUS` ninguno de los cuatro llega con mail — eso lo arregla
   la Parte C.
5. **Documentar la clave** donde `CLAUDE.md` §7 diga que van las de `CONFIG`.
6. **Decir en el documento el riesgo que esto acepta:** quien pueda editar la planilla puede
   agregarse a la lista. Es aceptable —quien edita la planilla ya tiene los datos— pero se escribe,
   no se da por obvio.

**Prueba** (**modelo: Sonnet**), un fixture por afirmación: un mail de la lista pasa; uno que no está
se rechaza; la clave vacía rechaza; el fallo de lectura rechaza. **El cuarto es el que importa** —
un dato que satisface dos afirmaciones a la vez no distingue entre ellas.

---

## Parte C · El despliegue

**Modelo: Sonnet. Effort: normal.** Sólo después de que el usuario elija sobre A.5.

- Si se pueden dos despliegues: dejar el de la API como está y crear uno para el panel con acceso
  restringido a cuentas de Google.
- Si no: cambiar `access`, desplegar, y **reportar que `tools/api.js` queda afuera hasta nuevo aviso.**

En los dos casos:

- **Probar la URL antes de reportarla.** Que abra el panel y no la pantalla roja ni un error de
  Google. Decir con qué cuenta se probó.
- **No tocar `doGet`, `doPost` ni `manejarPedido_`.** El despacho por presencia de `accion` está
  bien y no es lo que falla.
- **No generar ningún deck desde el panel para probar.** Son 200 segundos y hay dos decks de hoy que
  ya sirven. Alcanza con que el panel cargue su estado inicial.

---

## Reporte final

- La clave de `CONFIG` que quedó y qué hay que hacer para que un mail nuevo tenga efecto.
- La URL, con qué cuenta se probó y qué se vio.
- Si `tools/api.js` quedó afectado.
- Qué quedó sin verificar, dicho como tal.
