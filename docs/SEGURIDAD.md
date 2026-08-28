# SEGURIDAD — cómo entra alguien que no tiene las bases

> **Estado: VIVO.** Dueño único de la pregunta *«cómo entra al motor alguien que no tiene
> compartidas las bases»* (`CLAUDE.md` §7). Creado el 28/08/2026 por el prompt
> `docs/Prompts/2026-08-28_1_nocturna_capa_de_acceso.md`.
>
> ⛔ **Este documento NO elige.** Separa tres preguntas que hoy están mezcladas, mide lo que se
> puede medir desde el repo, escribe las opciones con lo que cada una rompe, y termina en una
> lista numerada de preguntas para el usuario. **Derogar una decisión `D-NN` es del usuario**, y
> ninguna de las opciones de §4 está implementada ni empezada.

---

## 1 · Las tres preguntas que hoy están mezcladas en una

⭐ **La confusión de fondo es que `D-15`, `D-16` y `D-18` mezclan tres cosas que se resuelven con
mecanismos distintos, y por eso la pieza 3 de `D-16` lleva un mes sin solución.** Separadas, cada
una tiene su propio estado y su propio trabajo pendiente:

| | pregunta | mecanismo | estado medido el 28/08 |
|---|---|---|---|
| **identidad** | ¿con qué cuenta entró? | `executeAs` + `Session.getActiveUser()` | ⛔ **sin medir** — depende del experimento de §5 |
| **autorización** | ¿qué puede pedir? | lista `mails_autorizados` en `CONFIG`; hoja `ACCESOS` | 🟡 **pieza 1 hecha, pieza 2 no** — la lista existe y filtra el acceso *entero*, no por informe |
| **acceso al dato** | ¿qué archivo puede abrir? | permisos de Drive | ⛔ **nadie lo hace** — cero llamadas de compartido en todo el repo (§2, A.5) |

⭐ **Y la que contesta la pregunta del usuario es la tercera, no la primera.** Con
`executeAs: USER_DEPLOYING` —lo que el manifiesto ya declara— el motor lee las bases con la cuenta
del dueño, así que **al tercero no hay que compartirle ninguna base**: eso ya está resuelto. Lo que
falta es que pueda **abrir la salida**, y hoy no puede.

⚠ **Las tres se contestan por separado y no se implican.** Un tercero puede estar en
`mails_autorizados` (autorización ✅), entrar al panel, apretar el botón, ver la corrida terminar
bien — y **no poder abrir el deck** que acaba de generar, porque nadie le dio permiso sobre el
archivo. Ése es el estado de hoy, medido, no una hipótesis.

---

## 2 · Lo que está medido — el censo del 28/08/2026

**Toda afirmación de esta sección lleva su comando.** Es evidencia fechada: para saber qué es
cierto más adelante, se re-corren.

### 2.1 — El manifiesto (A.1)

```
cat appsscript.json
```

```json
"webapp": { "access": "ANYONE", "executeAs": "USER_DEPLOYING" }
```

`oauthScopes`, textual y completa — **seis**:

```
https://www.googleapis.com/auth/spreadsheets
https://www.googleapis.com/auth/drive
https://www.googleapis.com/auth/presentations
https://www.googleapis.com/auth/script.container.ui
https://www.googleapis.com/auth/script.scriptapp
https://www.googleapis.com/auth/userinfo.email
```

⭐ **`script.external_request` NO está**, y eso es dato para la opción 2 de §4: esa opción no
empieza sin agregar un scope, lo que fuerza **re-autorizar el proyecto entero**.

### 2.2 — Tres testigos de la misma cosa y no coinciden (A.2)

```
grep -n "D-15" docs/PLAN.md
sed -n '181,195p' docs/PLAN.md
sed -n '3326p'   docs/PLAN.md
```

| testigo | qué dice | dónde |
|---|---|---|
| **`D-15`** | *«El panel se despliega como **ejecuta el usuario que accede**»*, y funda la elección en que *«con ejecutar como: yo sobre cuentas Gmail personales, `getActiveUser()` suele volver vacío y el filtro deja de servir»* | `docs/PLAN.md:181-194` |
| **el manifiesto** | `executeAs: "USER_DEPLOYING"` — **lo contrario** | `appsscript.json` |
| **la decisión del 23/08** | *«La decisión ya está tomada: el motor ejecuta con SU identidad —`executeAs: USER_DEPLOYING`— … ⛔ **Deroga `D-15`** … ⚠ El `D-NN` que las supersede **NO se escribe hoy**»* | `docs/PLAN.md:3326`, última fila de la tabla de backlog |

⚠ **Corrección de premisa del prompt:** la cita se pedía en *«`PLAN.md` §3015»*. **Esa sección no
existe con ese contenido**; las líneas reales son **3321** (fila de `D-16`) y **3326** (la fila del
deploy multiusuario, que es la que deroga). Se anota acá porque la referencia por número envejece,
que es exactamente lo que `CLAUDE.md` §4 manda no hacer.

⛔ **No se resuelve acá.** `D-15` está **acoplada a `D-02`** por su propio texto —*«no son
decisiones independientes»*—, así que superseder una arrastra a la otra, y **eso es del usuario**.
Queda registrada como contradicción abierta en `docs/PENDIENTES_consistencia.md`.

### 2.3 — Un testigo vencido en el código (A.3)

```
grep -rn "ANYONE_ANONYMOUS" --include=*.gs .
```

`Api.gs:109`, en el comentario de `servirPanel_`: *«`appsscript.json` declara hoy
`access: ANYONE_ANONYMOUS`»*. **El manifiesto dice `ANYONE`.** El comentario copió una constante
que vive en otro archivo — nació venciendo. Corregido en la Parte D del mismo prompt: ahora **cita
dónde vive el valor en vez de repetirlo**.

⚠ **La diferencia no es cosmética.** `ANYONE` exige que Google autentique al visitante antes de
correr el código; `ANYONE_ANONYMOUS` no. El comentario justificaba la barrera con el escenario
*más* abierto de los dos, así que **el argumento sobrevive** — pero la frase *«sobre un usuario
anónimo `getActiveUser()` devuelve `''`»* describe un despliegue que hoy no es el que hay.

### 2.4 — La barrera y su insumo (A.4)

```
sed -n '295,395p' Api.gs
```

`apiBarrera1_` (`Api.gs:362`) — el criterio exacto, en orden:

1. `Session.getActiveUser().getEmail()`. Si tira, deja `barrera 1: no se pudo leer la identidad`.
2. **Sin mail → rechazo `sin identidad`**, *antes* de tocar la planilla. ⭐ Deliberado: *«un anónimo
   no puede costar una lectura de `CONFIG`»*.
3. `apiListaAutorizados_` resuelve la lista, y **sus tres motivos viajan tal cual** — no se
   colapsan en `fuera de lista`, porque *«colapsarlos manda a investigar a la persona equivocada»*.
4. El mail se compara normalizado contra la lista; si no está → `fuera de lista`.
5. `ok`, y el mail vuelve **sin normalizar**, que es la identidad que devolvió Google.

Los **cinco motivos de rechazo**, y la propiedad que importa es que **los cinco deniegan**:

| motivo | lo produce | qué significa |
|---|---|---|
| `sin identidad` | `apiBarrera1_` | Google no dio mail |
| `fuera de lista` | `apiBarrera1_` | hay mail y no está en `mails_autorizados` |
| `config ilegible` | `apiListaAutorizados_` | la lectura de `CONFIG` tiró excepción |
| `clave ausente` | `apiListaAutorizados_` | `CONFIG` no tiene la clave `mails_autorizados` |
| `lista vacía` | `apiListaAutorizados_` | la clave está y no resuelve a ningún mail |

⭐ **`apiListaAutorizados_` nunca devuelve `ok` por no haber podido verificar**, y lo declara en su
propio comentario. **Hoy eso ya tiene testigo** — ver §6.

**El insumo**, `mails_autorizados`:

```
grep -n "mails_autorizados" docs/_snapshots/CONFIG_2026-08-26.tsv
grep -n "mails_autorizados" Instalar.gs
```

```
jpcofanogcba1@gmail.com, reporteseinformesgcba@gmail.com, jpcofano@gmail.com, jpcofano2@gmail.com
```

**Cuatro mails, los cuatro del usuario, ninguno externo al equipo.** Las cuatro son cuentas
`@gmail.com`.

⚠ **Esto NO es la hoja viva.** El prompt pedía el valor de `CONFIG` **vivo** y **Code no puede
leer la planilla desde acá**: lo de arriba es el snapshot del **26/08** más el seed, que coinciden
entre sí. `CONFIG` es además una de las **dos hojas donde una corrección del seed nunca llega**
—sólo siembra lo ausente, `docs/ESCRITORES.md`—, así que la coincidencia seed↔snapshot no prueba
que la hoja de hoy diga lo mismo. **Para el valor vivo hace falta una corrida.**

### 2.5 — Nadie comparte una salida (A.5)

```
grep -rn "addViewer\|addEditor\|setSharing\|addViewers\|Drive.Permissions\|setShareableByEditors" --include=*.gs --include=*.html --include=*.js .
grep -rn "ACCESOS" --include=*.gs --include=*.html --include=*.js .
```

**Las dos: cero apariciones.** (`exit 1`, sin ninguna línea.)

⛔ Las dos mitades quedan verificadas:

- **No hay compartido de salidas.** Ninguna de las seis APIs de permisos de Drive se usa en
  ninguna parte del repo. El deck generado queda con los permisos que hereda de la carpeta de
  reportes y del dueño que lo creó, y **nadie lo modifica**.
- **No hay hoja `ACCESOS`.** No está en `Instalar.gs`, no está en ningún `SEED_*`, no aparece en
  los snapshots de `docs/_snapshots/`.

⛔ **Entonces `D-16` pieza 3 y `D-18` afirman un mecanismo que no existe.** `D-18` dice *«el motor
crea el deck en la carpeta de reportes y **lo comparte con quien corresponda según la hoja de
accesos** (`D-16`)»*, y `D-16` pieza 1 dice que la lista *«va a una hoja (mail × `informe_id` ×
rol)»*. **Ninguna de las dos cosas ocurrió.** La lista salió de `Api.gs` y fue a `CONFIG` —una
celda, un solo eje, sin `informe_id` ni rol—, y el compartido no se escribió nunca.

⚠ Es una **afirmación de doc sin testigo**, la familia que este proyecto ya conoce: nada la
contradecía porque nada compara un `D-NN` contra el código que debería implementarlo.

### 2.6 — ¿El deck filtra sus fuentes? (A.6)

⭐ **Es la medición que decide si compartir un deck es seguro**, y tiene dos mitades. Una está
medida y la otra **no se puede medir desde el repo**.

**Mitad medida — el motor sólo reemplaza texto.**

```
grep -rno "replaceAllText\|insertSheetsChart\|insertSheetsTable\|setLinkUrl\|insertImage\|insertVideo" --include=*.gs . | sort | uniq -c
```

**25 apariciones, las 25 de `replaceAllText`.** Cero de las otras cinco. El motor **no inserta
gráficos vinculados, ni tablas vinculadas, ni imágenes, ni videos, ni links** en ninguna lámina:
la única escritura de contenido que hace sobre Slides es sustitución de texto.

```
grep -rn "insertSheetsChart\|SheetsChart\|asSheetsChart\|SHEETS_CHART" --include=*.gs .
```

Cero. ⭐ **Y el corolario sobre el `getUrl()`:** las seis apariciones de `getUrl()` del repo
(`Armonizar.gs:403,856`, `Generador.gs:5570`, `Sellador.gs:571,884`) devuelven la URL **del deck**
al reporte y a `CORRIDAS`; **ninguna la escribe adentro de una lámina**.

**Mitad NO medida — qué trae la plantilla del equipo.** ⚠ El motor no inserta un gráfico vinculado,
pero **la plantilla podría traer uno de fábrica**: la plantilla es del equipo (`C-01`) y el motor
la copia entera. Un gráfico vinculado que ya viene en la plantilla **sobrevive a la copia** y
exigiría acceso a su planilla de origen para renderizar.

⛔ **Esto no se puede contestar con `grep`**: exige recorrer `getPageElements()` de la plantilla
viva buscando `SlidesApp.PageElementType.SHEETS_CHART`, y **ese censo no existe** —

```
grep -rn "SHEETS_CHART" --include=*.gs .        # cero
grep -rln "SHEETS_CHART" docs/                   # cero
```

⭐ **Es un instrumento de una función**, y hasta que se corra, la afirmación *«el deck es texto
plano sellado y compartirlo no filtra nada»* **está a medias**: probada del lado del motor, sin
probar del lado de la plantilla. Va como pregunta 4 de §7.

---

## 3 · El nudo — `D-15` y `D-18` no pueden ser ciertas las dos

⛔ **`D-15` pide *ejecutar como el usuario que accede*. `D-18` prohíbe que el tercero toque la
planilla de control.** Y el script está **bound** a esa planilla.

Ejecutando como el usuario que accede, **toda lectura y escritura de `CONFIG`, `PERIODOS`,
`REUNIONES` y `CORRIDAS` va con la identidad del usuario** — y falla, salvo que se le comparta la
planilla de control. Que es exactamente lo que `D-18` prohíbe, con su motivo escrito: *«la planilla
de control **es la superficie de configuración**; compartirla da acceso de edición a `BASES`,
`MAPEO`, `CONFIG` y el resto»*. ⚠ **Y compartirla en lectura tampoco alcanza**: el asistente
**escribe** —`CORRIDAS`, el sellado, el estado de las secciones—, así que lectura no es una versión
más suave del problema: es directamente no funcionar.

⭐ **Por lo tanto `executeAs: USER_DEPLOYING` no es una preferencia: es forzoso** mientras el script
esté bound a la planilla de control. Y el manifiesto **ya lo tiene** (§2.1).

⭐ **El código no se adelantó por descuido: llegó primero a la conclusión correcta.** Lo que falta
es que la decisión escrita lo alcance — y ése es exactamente el `D-NN` que la fila del 23/08 dice
que **todavía no se escribe**.

⚠ **Y el precio, que es el problema real.** Con `USER_DEPLOYING`,
`Session.getActiveUser().getEmail()` sólo devuelve el mail cuando quien accede está **en el mismo
dominio de Workspace que el dueño**. La cuenta dueña es `@gmail.com` — **no hay dominio** — así que
es **esperable** que devuelva vacío para todos, y que la Barrera 1 rechace a cualquiera con
`sin identidad`. Incluido al propio dueño.

⛔⛔ **Esto NO se puede medir desde acá y no se puede razonar hasta la certeza.** Lo mide el usuario
en cinco minutos con la cuenta de prueba: el procedimiento está en `docs/RUNBOOK.md` y resumido en
§5. **Las dos ramas quedan abiertas en este documento** — no se asume la que parece más probable,
que es la regla que este proyecto ya pagó cuatro veces con premisas centrales falsas.

| si el experimento devuelve | entonces |
|---|---|
| `activo` **vacío** y `efectivo` = el dueño | la Barrera 1 **no puede funcionar** con cuentas de fuera del dominio. La opción 1 o la 2 de §4 dejan de ser alternativas: **son el trabajo**, y hasta entonces `access: ANYONE` + lista que no filtra a nadie = la URL rechaza a todos (falla cerrada, que es lo correcto, pero el panel no sirve) |
| `activo` **poblado** | `D-15` estaba bien fundada en su premisa, la lista blanca **sí** filtra bajo `USER_DEPLOYING`, y el problema que queda es **sólo** el tercero de §1: el acceso al archivo |

---

## 4 · Las opciones de identidad, cada una con lo que rompe

⛔ **Ninguna se implementa hasta que corra el experimento de §5.**

### 4.0 — Cerrada: `access: DOMAIN` con `USER_DEPLOYING`

⛔⛔ **Cerrada por un dato del usuario del 28/08/2026: son todas cuentas de Gmail personales. No hay
dominio de Workspace.**

Era la opción que resolvía la identidad **sin escribir una línea** —bajo `USER_DEPLOYING`,
`getActiveUser()` devuelve el mail dentro del dominio del dueño— y es la misma razón por la que el
vacío de §3 pasa de *probable* a *esperado*.

⭐ **Se escribe cerrada y con el motivo, no se omite: una opción que no está escrita se vuelve a
proponer.**

### 4.1 — El portero: un segundo script *standalone*

⭐ Un segundo proyecto de Apps Script, **standalone** (no atado a ninguna planilla), desplegado
como *«ejecuta el usuario que accede»*. Su único trabajo: leer `Session.getActiveUser()`, firmar
`mail + vencimiento` con una clave compartida, y redirigir al panel. **El panel real sigue como
está** y **valida la firma en vez de preguntarle a `Session`**.

⭐ **Por qué funciona donde el panel no puede:** el problema de §3 no es `USER_ACCESSING` —es estar
**bound** a la planilla de control. **Un standalone no abre ninguna planilla**, así que puede
ejecutar como el usuario sin necesitar que se le comparta nada, y ahí `getActiveUser()` **sí**
devuelve el mail. ⭐ **`D-15` no estaba equivocada: estaba aplicada al script equivocado.**

⚠ **Lo que hay que decir y no dar por resuelto:**

- **Un segundo deployment**, con su propia autorización de scopes y su propia URL.
- **Una clave compartida que hoy no tiene dónde vivir.** `PropertiesService` **no se comparte entre
  proyectos**, así que la clave se copia a mano en dos lados — y eso es una **fuente de verdad
  duplicada**, la forma que este repo ya conoce.
- **El vencimiento de la firma**, que es una elección con dos lados malos: largo, y el link es
  reenviable; corto, y molesta.
- ⛔ **El corolario de `D-18`** —*«no se copia código a mano a ninguna cuenta»*—. Esto **no lo viola
  sólo si** el portero **vive en este repo y se despliega con `clasp`** como segundo proyecto. ⭐ Va
  escrito como **condición de la opción**, no como comentario: sin eso, la opción es un `.gs`
  suelto en otra cuenta.

**Qué se puede verificar antes de elegirla:** que un standalone con `USER_ACCESSING` devuelve mail
con una cuenta Gmail externa — que es **el mismo experimento de §5**, corrido sobre un script de
tres líneas en vez de sobre el panel.

**Qué decisión escrita deroga:** ninguna, si se lee `D-15` como *«la identidad se toma con
`USER_ACCESSING`»*. ⚠ Pero **choca con la fila del 23/08**, que decidió `USER_DEPLOYING` para
*todo*. Hay que decidir si esa decisión aplicaba **al motor** o **al sistema entero**.

### 4.2 — Sign-In del lado del cliente + verificación del `id_token` en el servidor

Identidad confiable, **sin segundo deployment y sin clave compartida**: el panel muestra el botón
de Google, el navegador obtiene un `id_token`, y el servidor lo verifica contra el endpoint de
Google antes de dar nada.

⚠ **Exige tres piezas que hoy no están:** un **Cloud project propio** para el script (hoy usa el
default), un **Client ID** de OAuth, y el scope **`script.external_request`** — que **no está en el
manifiesto** (§2.1), así que agregarlo fuerza **re-autorizar el proyecto entero**.

⭐ Es la opción con **más piezas** y la única que **no depende de nada de Apps Script**: la
identidad la da Google directamente al navegador, así que no le importa `executeAs`, ni el dominio,
ni si el script está bound.

**Qué se puede verificar antes de elegirla:** nada dentro del repo. Es todo trabajo de consola de
Google Cloud.

**Qué decisión escrita deroga:** ninguna directamente; **vacía** el fundamento de `D-15`, que
eligió su despliegue *«porque es la única que combina identidad con lista blanca»* — con esta
opción, la identidad deja de depender del despliegue.

### 4.3 — Link con secreto por persona

Barato y débil: a cada persona se le manda una URL con un secreto distinto; el panel valida el
secreto contra una lista.

⚠ **No identifica — autoriza.** Se reenvía, no caduca, y no hay forma de saber quién está del otro
lado: sólo que **alguien** tiene un secreto que se le dio a Fulano.

⚠ **Puede ser suficiente si el universo son cinco personas de confianza**, y eso **es una decisión
del usuario sobre el riesgo, no una conclusión técnica**. ⭐ Va escrita como **escalón explícito**
—algo que se puede poner esta semana y reemplazar después— **no como solución**.

**Qué se puede verificar antes de elegirla:** nada; no depende de ninguna medición pendiente. Es la
única de las tres que **funciona pase lo que pase en el experimento de §5**.

**Qué decisión escrita deroga:** `D-15` entera, porque abandona la identidad. Y deja `D-16`
pieza 2 —*«el panel filtra qué informes ofrece»*— apoyada sobre un secreto en vez de sobre un mail.

### 4.4 — ⛔ Descartada: dos deployments del **mismo script bound**

Uno para identificar (`USER_ACCESSING`) y otro para ejecutar (`USER_DEPLOYING`).

**No funciona:** el que identifica seguiría **atado a la planilla de control**, así que choca con
§3 antes de hacer nada — al arrancar necesita `getActiveSpreadsheet()` y `leerConfig()` con la
identidad del visitante.

⚠ **Es distinta de la opción 4.1, y la diferencia entera es *standalone* contra *bound*.** Se
escribe descartada, con el motivo, **para que no se vuelva a proponer**.

---

## 5 · El experimento que decide (Parte C)

⭐ **Con el dato del 28/08 —todas cuentas de Gmail personales— éste es el paso que decide.** Las
tres opciones de §4 cuestan trabajo distinto según lo que devuelva `activo`, y **ninguna se puede
elegir antes**.

El procedimiento completo está en **`docs/RUNBOOK.md`, sección «Experimento de identidad»**.
Resumen: abrir `/exec` con la cuenta de prueba externa, anotar textual qué aparece, y leer del log
de ejecuciones la línea

```
panel — acceso denegado · motivo=… · activo=«…» · efectivo=«…»
```

⭐ **`activo` es el dato entero.** Ver la tabla de ramas en §3.

⚠ **El mail de prueba se agrega a `mails_autorizados` ANTES de correrlo**, o el experimento mide la
lista y no la identidad. Es el control positivo compartiendo camino con lo que mide.

---

## 6 · Lo que ya tiene testigo, y lo que no (Parte E)

```
grep -n "probarBarreraDeMails_" Pruebas.gs
sed -n '1270,1345p' Pruebas.gs
```

`probarBarreraDeMails_` (`Pruebas.gs:1281`, del `_46` Parte B) **ya existe** y cubre **cuatro de
los cinco motivos**, más la normalización y el caso de `servirPanel_` sin planilla atada:

| motivo | ¿tiene banco? |
|---|---|
| `fuera de lista` | ✅ `Pruebas.gs:1299` |
| `lista vacía` | ✅ `:1305`, y también la celda de puras comas (`:1311`) |
| `clave ausente` | ✅ `:1317`, **y una afirmación de que no comparte motivo con `lista vacía`** (`:1319`) |
| `config ilegible` | ✅ `:1326`, y el caso sin planilla atada (`:1337`, `:1339`) |
| **`sin identidad`** | ⛔ **no** |

⛔ **No se duplicó nada**, que era la instrucción. Y el hueco tiene causa: `sin identidad` lo
produce `apiBarrera1_` leyendo `Session.getActiveUser()` **directo**, sin inyección —a diferencia
de `apiListaAutorizados_`, que recibe `leer` justamente *«para que las pruebas puedan inyectar los
modos de falla sin tocar la planilla»*.

⚠ **Y es el motivo que más importa**, porque es el que §3 predice para **todos** los visitantes. Un
banco exigiría inyectarle a `apiBarrera1_` cómo lee la identidad — un cambio de firma sobre la
función que decide el acceso, así que **no se hace de noche y sin que nadie lo pida**. Queda como
pregunta 5 de §7.

---

## 7 · Preguntas para el usuario — en orden de cuánto desbloquean

1. ⭐⭐ **¿Corrés el experimento de §5?** Es cinco minutos y **decide entre las tres opciones de
   §4**. Sin él, cualquier elección se hace sobre una premisa sin medir — que es lo que este repo
   ya pagó cuatro veces. **Desbloquea: todo lo demás de este documento.**
2. ⭐ **La decisión del 23/08 que deroga `D-15`, ¿aplica al sistema entero o sólo al motor?** Si es
   *al motor*, la opción 4.1 (el portero standalone) es compatible y no deroga nada. Si es *al
   sistema entero*, 4.1 queda fuera y sólo quedan 4.2 y 4.3. **Desbloquea: cuál de las tres
   opciones se puede siquiera evaluar.** ⚠ Y sea cual sea, hace falta que alguien **escriba el
   `D-NN` que supersede a `D-15` y ajusta `D-02`** — hoy la contradicción está registrada como
   abierta en `PENDIENTES` y nada más.
3. ⭐ **El universo real de terceros, ¿cuántas personas son y qué riesgo tolerás?** Si son cinco
   personas de confianza, 4.3 (link con secreto) se pone esta semana y el problema se cierra por un
   tiempo. Si van a ser veinte o si el deck lleva algo sensible, no alcanza. **Es una decisión sobre
   el riesgo, no una conclusión técnica** — y es la única pregunta de esta lista que Code no puede
   ni siquiera acotar.
4. **¿Autorizás una corrida de un instrumento de una función que censa la plantilla viva buscando
   gráficos vinculados?** Cierra la mitad abierta de §2.6. **Desbloquea: poder afirmar que
   compartir un deck no filtra ninguna base** — que es la propiedad sobre la que se apoya todo el
   diseño de §8.
5. **¿Se le agrega inyección de identidad a `apiBarrera1_` para poder darle banco a
   `sin identidad`?** Es un cambio de firma en la función que decide el acceso. **Desbloquea: que
   el motivo que §3 predice para todos los visitantes tenga testigo.**

---

## 8 · La pieza 3 de `D-16` — propuesta, no plan

⛔ **Esto es una propuesta.** No está decidido, no está empezado, y **no se implementa hasta que se
contesten las preguntas 1 y 4 de §7.**

**La hoja `ACCESOS`** — `mail × informe_id × rol` —, que es lo que `D-16` pieza 1 dice desde el
principio y nunca se hizo. Una sola fuente para las tres cosas:

1. **Autorización de entrada** — reemplaza a `mails_autorizados` de `CONFIG`: si el mail no tiene
   ninguna fila, no entra. ⭐ La celda de `CONFIG` tiene **un solo eje** y no puede expresar «este
   informe sí, este no»; la hoja tiene los tres.
2. **Filtro del panel** — qué informes ofrece, según las filas de ese mail. Es `D-16` pieza 2.
3. **Compartido de la salida** — al terminar la corrida, el motor comparte el deck con los mails
   que la hoja declare para ese `informe_id`. Es `D-16` pieza 3, y **es lo único que hace que un
   tercero pueda abrir lo que generó** (§2.5).

⚠ **Condicionado a §2.6.** Si la plantilla lleva gráficos vinculados o links a las bases,
**compartir el deck es compartir la base**, y el diseño cambia: haría falta aplanar el gráfico
antes de compartir, o compartir la fuente, o no compartir el archivo y entregar un PDF. Si el deck
es texto sellado, no filtra nada — ⭐ **y ésa es la propiedad que hace que todo esto funcione**, así
que no se da por supuesta: es la pregunta 4.

⚠ **Y lo que hay que resolver antes de escribir una fila de código**, porque `D-16` pieza 3 lo
nombra y sigue sin respuesta: **qué pasa cuando alguien puede ver un informe pero no la base de la
que sale**. Con `USER_DEPLOYING` el caso **desaparece del lado de la lectura** —el motor lee con la
cuenta del dueño, el usuario nunca toca una base— y **queda entero del lado de la salida**: quién
es el dueño del deck generado, y si se comparte como lector o como editor.
