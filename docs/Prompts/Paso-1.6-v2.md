# Paso 1.6 (v2) — Carpetas por config + registro de plantillas robusto

> **Reemplaza a `docs/Prompts/Paso-1.6.md`.** Al correr "Registrar plantillas" no
> encuentra ningún Slides, aunque el ID de carpeta es correcto y la carpeta abre sin
> error. Este paso diagnostica por qué y saca los IDs del código.
>
> **Regla de oro:** no calcula nada. Lee Drive y escribe config.
>
> **Un commit por parte.**

---

## Parte A — Sacar los IDs de carpeta del código

Hoy hay un ID hardcodeado:

```js
var CARPETA_PLANTILLAS_ID_ = '1Q5At-COhFbidKCfYrwXhN6kZAbuxgYpi';
```

Eso rompe el principio del proyecto (todo por registros, nada nombrado en el código) y
obliga a un `clasp push` para cambiar una carpeta. **Mové los dos IDs a `CONFIG`**,
agregándolos a `SEED_CONFIG_DEFAULTS_`:

| clave | valor | para qué |
|---|---|---|
| `carpeta_plantillas` | `1Q5At-COhFbidKCfYrwXhN6kZAbuxgYpi` | de dónde se leen las plantillas (cuenta `reporteseinformesgcba`) |
| `carpeta_salida` | `1EyTlfg16vpyrftpUXgacShFk8iSbX_fJ` | dónde el motor deja los decks generados (cuenta `jpcofanogcba1`) |

`seedConfigConfig_` ya completa solo las claves vacías y nunca pisa lo cargado a mano,
así que sirve tal cual.

`menuRegistrarPlantillas_` debe leer `carpeta_plantillas` de `CONFIG` (vía
`leerConfig()`) en vez de la constante. Si la clave está vacía → mensaje claro
("Cargá `carpeta_plantillas` en CONFIG"), sin reventar.

> **Nota:** `carpeta_salida` todavía no la usa nadie — la va a usar `Generador.gs` en el
> Paso 4, cuando copie la plantilla para producir el deck. Se carga ahora para que esté
> lista y no quede otro ID suelto después.

→ **Commit A:** `Paso 1.6 v2 ✅ — carpetas de plantillas y salida por CONFIG`

---

## Parte B — Diagnóstico: por qué no aparecen las plantillas

`getFilesByType(MimeType.GOOGLE_SLIDES)` es exigente y falla en silencio en tres casos
frecuentes. Antes de arreglar, hay que **ver qué hay realmente en la carpeta**.

Agregá **"Diagnosticar carpeta de plantillas"** al menú: recorre
`carpeta.getFiles()` (**todos**, sin filtrar por tipo) y lista, por archivo:
`nombre · getMimeType() · getId()`. Además, contá y listá las subcarpetas
(`getFolders()`).

Los tres sospechosos, en orden de probabilidad:

1. **Archivos `.pptx` sin convertir** → MIME `application/vnd.openxmlformats-officedocument.presentationml.presentation`
   (`MimeType.MICROSOFT_POWERPOINT`), **no** `GOOGLE_SLIDES`. `SlidesApp.openById()`
   tampoco los abre, así que hay que convertirlos sí o sí.
2. **Accesos directos** → MIME `application/vnd.google-apps.shortcut`. Muy común entre
   dos cuentas cuando se hace "Agregar a Mi unidad". El shortcut es un tipo propio; hay
   que resolver el destino con `getTargetId()` (Advanced Drive Service) o pedirle al
   usuario que ponga el archivo real / lo comparta directo.
3. **Están en una subcarpeta** → `getFilesByType` **no es recursivo**.

→ **Commit B:** `Paso 1.6 v2 ✅ — diagnóstico de carpeta de plantillas`

---

## Parte C — Registro robusto

Reescribí `registrarPlantillasDesdeCarpeta(folderId)`:

1. **Recorré recursivamente** hasta 2 niveles de subcarpetas.
2. **Usá `getFiles()` y clasificá por MIME**, en vez de `getFilesByType`:
   - `GOOGLE_SLIDES` → candidata válida.
   - `MICROSOFT_POWERPOINT` (`.pptx`) → **no sirve**, pero **reportala explícitamente**:
     `⚠ <nombre> es .pptx — convertir a Google Slides nativo (Drive → Abrir con
     Presentaciones de Google → Archivo → Guardar como Presentaciones de Google)`.
     Es el mismo requisito que ya rige para las bases (`openById` solo abre nativos).
   - `application/vnd.google-apps.shortcut` → reportá
     `⚠ <nombre> es un acceso directo — poner el archivo real en la carpeta o
     compartirlo directo con el robot`.
   - Cualquier otro → ignorar en silencio.
3. **Matcheo sin cambios** (`MATCHEO_PLANTILLAS_`, SECCO antes que JM).
4. **No pises un `plantilla_id` distinto** ya cargado: si la celda tiene un ID que no
   coincide con el encontrado, **no sobrescribas** y reportá el conflicto. La decisión
   es del usuario.
5. **Resumen final honesto**, distinguiendo los casos:
   - `✅ <informe_id> ← <nombre>` (asignados)
   - `⚠ .pptx sin convertir: …`
   - `⚠ accesos directos: …`
   - `⚠ conflicto de ID en <informe_id>`
   - `— sin match de nombre: …`
   - `— sin fila en INFORMES para: …`
   - Si no hay **ningún** archivo de ningún tipo: decirlo así ("la carpeta está vacía o
     el robot no ve su contenido"), que es distinto de "no hay Slides".

→ **Commit C:** `Paso 1.6 v2 ✅ — registro de plantillas robusto (recursivo + MIME)`

---

## Prueba del usuario

1. `clasp push` → menú → **"Diagnosticar carpeta de plantillas"**. Anotá qué MIME
   aparece para JM y SECCO. **Esto ya te dice cuál de los tres casos es.**
2. Si salen `.pptx`: convertilas a Google Slides nativas y volvé a diagnosticar.
   Si salen como shortcut: poné el archivo real en la carpeta.
3. Menú → **"Registrar plantillas"** → `INFORMES` debe quedar con `plantilla_id` en
   `jm` y `secco`.
4. En `CONFIG`: verificar `carpeta_plantillas` y `carpeta_salida` cargadas.
5. Correr **de nuevo**: debe decir asignados sin duplicar ni pisar nada.

---

## Nota de arquitectura

Que la carpeta de plantillas sea de `reporteseinformesgcba` y la de salida de
`jpcofanogcba1` es correcto según Arq. 1: el robot **lee** las plantillas (permiso de
editor, porque las copia) y **escribe** los decks en su propia carpeta. Si en algún
momento se quiere que la salida vuelva al Drive del usuario, es cambiar
`carpeta_salida` en `CONFIG` — sin tocar código. Ese es exactamente el punto de haber
sacado los IDs del `.gs` en la Parte A.
