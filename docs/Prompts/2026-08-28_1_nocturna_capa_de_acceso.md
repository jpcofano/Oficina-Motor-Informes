# Corrida nocturna del 28/08 — la capa de acceso: medirla y diseñarla, no construirla

**El objetivo de la noche es que mañana haya un documento de diseño con las opciones medidas y una
pregunta bien hecha, no código nuevo.** La decisión de fondo —cómo se identifica alguien que no
tiene compartidas las bases— **no está tomada**, y depende de un experimento que sólo puede correr
el usuario con una cuenta externa.

## Las reglas de la noche

1. ⛔ **No toques `appsscript.json`.** Cambiar `access` o `executeAs` cambia quién puede disparar el
   motor con la cuenta del dueño. Es la decisión que este prompt existe para preparar.
2. ⛔ **No corras `jm`, no toques plantillas, no hagas `clasp push`.**
3. ⛔ **No implementes ninguna de las opciones de la Parte B.** Ni la hoja `ACCESOS`, ni el
   compartido de salidas, ni una verificación de identidad. **La noche entrega un documento.**
4. ⭐ **Las partes son independientes. Si una se bloquea, anotá por qué y seguí.** La única que va
   primero es la A.
5. **Un commit por parte.** Documentación separada de código.
6. ⛔ **Si una parte necesita una decisión que no está escrita, PARÁ ESA PARTE** y anotala en el
   reporte como *«bloqueada, decide el usuario»* con la pregunta exacta.
7. ⭐ **Toda afirmación sobre el estado lleva el comando al lado.** Especialmente las de esta noche:
   varias de las que están escritas en los docs **ya no son ciertas** y la Parte A existe para
   encontrar cuáles.

---

## Parte A — el censo de la capa de acceso, tal como está (Sonnet · SÓLO LECTURA)

Seis mediciones. **Cada una con el comando.** Las seis vienen medidas desde afuera del repo el
28/08 y hay que **verificarlas**, no darlas por buenas.

**A.1 — El manifiesto.** `appsscript.json` declara, a verificar: `access: "ANYONE"` y
`executeAs: "USER_DEPLOYING"`. Y la lista de `oauthScopes` completa, textual.

**A.2 — ⛔ El manifiesto contradice a `D-15`.** `docs/PLAN.md` declara *«el panel se despliega como
ejecuta el usuario que accede»* y funda esa elección en que con *ejecutar como yo* sobre cuentas
Gmail `getActiveUser()` suele volver vacío. El manifiesto dice **lo contrario**. Reportar las dos
citas enfrentadas, con archivo y sección. ⚠ **No resolverla**: `D-15` está además **acoplada a
`D-02`** por su propio texto, y `PLAN.md` §3015 dice que *«la decisión del 23/08 le cambia la
forma»*. Reportar también esa tercera cita: **son tres testigos de la misma cosa y no coinciden.**

**A.3 — Un testigo vencido en el código.** El comentario de `servirPanel_` (`Api.gs`) afirma que el
manifiesto declara `access: ANYONE_ANONYMOUS`. Hoy dice `ANYONE`. Confirmar y anotar — **no
corregir el comentario en esta parte**, va en la D con el resto.

**A.4 — La barrera y su insumo.** `apiBarrera1_` y `apiListaAutorizados_`: transcribir el criterio
exacto y los cinco motivos de rechazo. Y el valor de `mails_autorizados` en `CONFIG` **de la hoja
viva** — no el del seed de `Instalar.gs`. Reportar cuántos mails y si alguno es externo al equipo.

**A.5 — ⛔⛔ Nadie comparte una salida.** Grepear `addViewer`, `addEditor`, `setSharing`,
`addViewers` y `Drive.Permissions` en todo el repo. Medido desde afuera: **cero apariciones**.
⛔ La *«hoja de accesos»* que citan `D-16` y `D-18` **no existe como hoja**, y un tercero autorizado
por la lista de mails **no puede abrir el deck que el motor le genera**. Verificar las dos mitades:
que no hay compartido, y que no hay hoja `ACCESOS` en `Instalar.gs` ni en los snapshots.

**A.6 — ⭐ ¿El deck filtra sus fuentes?** Pregunta nueva y es la que decide si compartir un deck es
seguro. Un gráfico **vinculado** a una planilla exige que quien lo abre tenga acceso a la planilla,
y un link pegado en una lámina la expone. Medir: ¿el generador inserta gráficos vinculados, o sólo
reemplaza texto en formas? ¿Alguna lámina lleva URLs de las bases? Si el deck es **texto plano
sellado**, compartirlo no filtra nada y eso hay que poder afirmarlo con el comando al lado.

**Reportar. En esta noche no se para: se anota y se sigue a la B.**

---

## Parte B — `docs/SEGURIDAD.md`, el documento de diseño (Opus · effort alto)

**Es el entregable de la noche.** Un documento nuevo, dueño único de la pregunta *«cómo entra
alguien que no tiene las bases»*. Se agrega al ruteo de `CLAUDE.md` §7.

### B.1 — Separar tres preguntas que hoy están mezcladas en una

⭐ **La confusión de fondo es que `D-15`, `D-16` y `D-18` mezclan tres cosas que se resuelven con
mecanismos distintos, y por eso la pieza 3 lleva un mes sin solución.** El documento las separa y no
las vuelve a juntar:

| | pregunta | mecanismo | estado medido |
|---|---|---|---|
| **identidad** | ¿con qué cuenta entró? | `executeAs` + `Session` | ⛔ ver B.2 |
| **autorización** | ¿qué puede pedir? | lista en `CONFIG`, hoja `ACCESOS` | 🟡 pieza 1 hecha, 2 no |
| **acceso al dato** | ¿qué archivo puede abrir? | permisos de Drive | ⛔ nadie lo hace (A.5) |

⭐ **Y la que contesta la pregunta del usuario es la tercera, no la primera.** Con
`executeAs: USER_DEPLOYING` el motor lee las bases con la cuenta del dueño y **el usuario no
necesita que se le comparta ninguna**: eso ya está resuelto por el manifiesto. Lo que falta es que
pueda abrir **la salida**.

### B.2 — El nudo, y hay que dejarlo escrito antes de proponer nada

⛔ **`D-15` y `D-18` no pueden ser ciertas las dos.** `D-15` pide *ejecutar como el usuario que
accede*; `D-18` prohíbe que el tercero toque la planilla de control. Pero el script está **bound**
a esa planilla: ejecutando como el usuario, **toda lectura y escritura de `CONFIG`, `PERIODOS`,
`REUNIONES` y `CORRIDAS` va con la identidad del usuario** y falla salvo que se le comparta la
planilla — que es exactamente lo que `D-18` prohíbe, y compartirla en lectura tampoco alcanza
porque el asistente **escribe**.

⭐ `executeAs: USER_DEPLOYING` no es una preferencia: **es forzoso**, y el manifiesto ya lo tiene.
⭐ **El código no se adelantó por descuido: llegó primero a la conclusión correcta.** Lo que falta
es que la decisión escrita lo alcance.

⚠ **Y el precio, que es el problema real:** con `USER_DEPLOYING`,
`Session.getActiveUser().getEmail()` sólo devuelve el mail cuando quien accede está **en el mismo
dominio de Workspace que el dueño**. La cuenta dueña es `@gmail.com` — **no hay dominio** — es
esperable que devuelva vacío para todos, y la Barrera 1 los rechace con `sin identidad`.

⛔⛔ **Esto NO se puede medir desde acá y no se puede razonar hasta la certeza.** Lo mide el usuario
con la cuenta de prueba — Parte C. **El documento se escribe con las dos ramas abiertas**, no
asumiendo la que parece más probable. Es la regla que este proyecto ya pagó cuatro veces.

### B.3 — Las opciones de identidad, cada una con lo que rompe

⛔⛔ **Dato del usuario, 28/08: son todas cuentas de Gmail personales. No hay dominio de Workspace.**
Eso **cierra** la opción que habría resuelto la identidad sin escribir una línea —`access: DOMAIN`
con `USER_DEPLOYING`— y hace que el vacío de `getActiveUser()` de B.2 pase de probable a esperado.
El documento la escribe **cerrada y con el motivo**, no la omite: una opción que no está escrita se
vuelve a proponer.

Quedan tres, y ninguna se implementa esta noche. Para cada una: qué exige, qué decisión escrita
deroga, y qué se puede verificar antes de elegirla.

1. ⭐ **El portero: un segundo script, *standalone*, desplegado como «ejecuta el usuario que
   accede».** Su único trabajo es leer `Session.getActiveUser()`, firmar `mail + vencimiento` con
   una clave compartida y redirigir al panel. El panel real sigue como está y **valida la firma en
   vez de preguntarle a `Session`**.

   ⭐ **Por qué funciona donde el panel no puede:** el problema de B.2 no es `USER_ACCESSING`, es
   estar *bound* a la planilla de control. **Un standalone no abre ninguna planilla**, así que
   ejecuta como el usuario sin necesitar que se le comparta nada, y ahí `getActiveUser()` **sí**
   devuelve el mail — que es el fundamento con el que se escribió `D-15`. ⭐ `D-15` no estaba
   equivocada: estaba aplicada al script equivocado.

   ⚠ Lo que hay que decir y no dar por resuelto: **un segundo deployment** con su propia
   autorización; **una clave compartida** que hoy no tiene dónde vivir —`PropertiesService` no se
   comparte entre proyectos, así que se copia a mano en dos lados y eso es una fuente de verdad
   duplicada—; el **vencimiento** de la firma, que si es largo es un link reenviable y si es corto
   molesta; y ⛔ el **corolario de `D-18`** —*«no se copia código a mano a ninguna cuenta»*—, que
   esto no viola sólo si el portero **vive en este repo y se despliega con `clasp`** como segundo
   proyecto. Escribirlo como condición, no como comentario.

2. **Sign-In del lado del cliente + verificación del `id_token` en el servidor.** Identidad
   confiable, sin segundo deployment y sin clave compartida. ⚠ Exige Cloud project propio, un
   Client ID y el scope `script.external_request`, que **hoy no está** (A.1). Es la opción con más
   piezas y la única que no depende de nada de Apps Script.

3. **Link con secreto por persona.** Barato y débil: se reenvía, no caduca y **no identifica —
   autoriza**. ⚠ Puede ser suficiente si el universo son cinco personas de confianza, y eso **es
   una decisión del usuario sobre el riesgo, no una conclusión técnica**. Escribirla como escalón
   explícito, no como solución.

⛔ **Descartada, y se escribe descartada para que no se vuelva a proponer:** *dos deployments del
mismo script bound*, uno para identificar y otro para ejecutar. El que identifica seguiría atado a
la planilla de control y choca con B.2 antes de hacer nada. ⚠ **Es distinta de la opción 1**, y la
diferencia entera es *standalone* contra *bound*.

### B.4 — La pieza 3, que es la que el usuario preguntó

El diseño propuesto, **como propuesta y no como plan**: la hoja `ACCESOS` (`mail × informe_id ×
rol`), el motor comparte cada salida con los mails que esa hoja declare al terminar la corrida, y
el panel filtra qué informes ofrece con la misma hoja. Una sola fuente para las tres cosas.

⚠ **Condicionado a A.6.** Si el deck lleva gráficos vinculados o links a las bases, compartirlo
**es** compartir la base y el diseño cambia. Si es texto sellado, no filtra nada — y ésa es la
propiedad que hace que todo esto funcione, así que va escrita como afirmación con su comando.

⛔ **Lo que el documento no hace: elegir.** Termina en una lista numerada de preguntas para el
usuario, cada una con lo que se desbloquea al contestarla.

---

## Parte C — el experimento que Code no puede correr (Sonnet)

⭐ **Con el dato del 28/08 —todas cuentas de Gmail personales— éste pasó a ser el paso que decide.**
Las tres opciones que quedan cuestan trabajo distinto según lo que devuelva `activo`, y ninguna se
puede elegir antes. **Va escrito arriba de todo en el reporte final.**

Un procedimiento en `docs/RUNBOOK.md`, escrito para que el usuario lo ejecute en cinco minutos con
la cuenta de prueba externa que registra `docs/ENTORNO.local.md`:

1. Abrir la URL de `/exec` con la cuenta de prueba, **no** con una del equipo.
2. Anotar **textual** qué aparece: el panel, o la pantalla de rechazo con su código de motivo.
3. Con la cuenta del dueño, leer el log de ejecuciones y anotar la línea
   `panel — acceso denegado · motivo=… · activo=«…» · efectivo=«…»`.

⭐ **`activo` es el dato entero.** Si viene vacío y `efectivo` trae al dueño, **la Barrera 1 no
puede funcionar con cuentas de fuera del dominio** y la opción 1 o la 2 de B.3 dejan de ser
alternativas: son el trabajo. Si viene poblado, `D-15` estaba bien fundada y el problema es otro.

⚠ **Agregar el mail de prueba a `mails_autorizados` antes de correrlo**, o el experimento mide la
lista y no la identidad — que es el control positivo compartiendo camino con lo que mide.

---

## Parte D — los testigos vencidos (Sonnet)

Sin decidir nada, sólo dejar de afirmar lo que ya no es cierto:

- El comentario de `servirPanel_` que dice `ANYONE_ANONYMOUS` (A.3) pasa a citar el valor real **y
  a decir que el valor vive en el manifiesto**, no a repetirlo — un comentario que copia una
  constante nace venciendo.
- `docs/PENDIENTES_consistencia.md`: la contradicción `D-15` ↔ manifiesto ↔ §3015 (A.2), con los
  tres testigos, marcada **abierta y sin resolver**.
- `docs/PENDIENTES_consistencia.md`: que `D-16` pieza 3 y `D-18` afirman un compartido de salidas
  que **no existe en el código** (A.5). ⛔ Es una afirmación de doc sin testigo: la familia que
  este proyecto ya conoce.
- `CLAUDE.md` §7: `docs/SEGURIDAD.md` entra al ruteo como dueño de la pregunta de acceso.

⛔ **No editar `D-15`, `D-16` ni `D-18` en `PLAN.md`.** Derogar una decisión es del usuario.

---

## Parte E — bancos de la barrera (Sonnet · cae primera si la noche se acorta)

Si no existen ya, bancos sobre `apiBarrera1_` para los cinco motivos —`sin identidad`,
`fuera de lista`, `clave ausente`, `lista vacía`, `config ilegible`— con la propiedad que importa:
⛔ **los cinco deniegan.** El comentario de `API_CLAVE_AUTORIZADOS_` declara que no hay default de
código y que un error de lectura **no** puede convertirse en acceso concedido. Hoy eso es una
afirmación sin testigo.

Antes de escribirlos, **medir si ya existen**: si están, decirlo y no duplicar.

---

## El reporte final

- Las seis mediciones de A con sus comandos.
- El link a `docs/SEGURIDAD.md`.
- ⭐ **Las preguntas para el usuario, numeradas y en orden de cuánto desbloquean.** ⚠ La del
  dominio Workspace **ya está contestada y cerrada** (B.3): no volver a preguntarla.
- Lo que quedó bloqueado, con la pregunta exacta.
