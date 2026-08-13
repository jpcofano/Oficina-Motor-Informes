const { Button, Select, Checkbox, Alert, ProgressTimer, StatusDot, StatRow, DeckLinkCard, RunHistoryItem } = window.MotorDeInformesDesignSystem_37ea89;

const INFORMES = [
  { id: 'jm', nombre: 'Informe semanal JM', cableados: 57, secciones: [
    { id: 'uno_a_uno', label: 'Uno a uno Comuna 10', sub: 'itera reuniones' },
    { id: 'servicios', label: 'Servicios esenciales' },
    { id: 'mayores', label: 'Personas mayores' },
    { id: 'm2', label: 'M2' },
  ]},
  { id: 'secco', nombre: 'Seguimiento SECCO – SSCDI', cableados: 0, secciones: [
    { id: 'uno_a_uno', label: 'Uno a uno Comuna 10', sub: 'itera reuniones' },
    { id: 'analisis', label: 'Análisis comparativo Imagen', sub: 'itera red social' },
    { id: 'miba', label: 'Integración MiBA' },
    { id: 'proveedores', label: 'Nuevos Proveedores', sub: 'itera proveedor' },
  ]},
  { id: 'custom', nombre: 'Informe semanal personalizado', cableados: 57, custom: true, secciones: [] },
];
const TIPOS = [
  { id: 'uno_a_uno', label: 'Uno a uno', sub: 'itera reuniones' },
  { id: 'm2', label: 'M2' },
  { id: 'servicios', label: 'Servicios esenciales' },
  { id: 'mayores', label: 'Personas mayores' },
  { id: 'analisis', label: 'Análisis comparativo Imagen', sub: 'itera red social' },
  { id: 'miba', label: 'Integración MiBA' },
  { id: 'proveedores', label: 'Nuevos Proveedores', sub: 'itera proveedor' },
];
const PERIODOS = [
  { value: '', label: 'El del período activo · muestra 04/08 a 10/08' },
  { value: 'p1', label: 'p1 · 28/07 a 03/08' },
  { value: 'p2', label: 'p2 · 21/07 a 27/07' },
  { value: 'p3', label: 'p3 · fecha sin cargar', broken: true },
];
const CORRIDAS = [
  { informe: 'Informe semanal JM', fecha: '2026-08-11 09:42', cerrada: true, faltantes: 207 },
  { informe: 'Seguimiento SECCO – SSCDI', fecha: '', cerrada: false },
  { informe: 'Informe semanal JM', fecha: '2026-08-04 09:15', cerrada: true, faltantes: 183 },
];
const DECKS_EXISTENTES = { 'jm|': { fecha: '2026-08-11 09:42', corrida: '2026-08-11_0001' } };
const ANCLAJES = [
  { id: 1, encuentro: 'Reunión 12/08 · Comuna 10 · «seguimiento de obra»', candidatas: ['Obras Comuna 10 – 3er trimestre', 'Vecinal Comuna 10 – agenda abierta'] },
  { id: 2, encuentro: 'Reunión 11/08 · sin comuna cargada · «mesa de trabajo»', candidatas: ['Mesa de trabajo intersectorial', 'Servicios esenciales – seguimiento'] },
  { id: 3, encuentro: 'Reunión 09/08 · Comuna 4 · «recorrida»', candidatas: ['Recorridas Comuna 4', 'Obras Comuna 4 – 3er trimestre'] },
];

const PROXIMO = [
  { id: 'temario', titulo: 'Pegar el temario', desc: 'Pegar la agenda de la semana y que el motor la parta en encuentros, sin cargar fila por fila.' },
  { id: 'preview', titulo: 'Vista previa antes de generar', desc: 'Ver qué láminas van a salir y con qué datos, antes de esperar los cinco minutos.' },
  { id: 'marcador', titulo: 'Agregar un marcador desde el panel', desc: 'Cablear un token nuevo sin abrir la planilla de configuración.' },
  { id: 'periodos', titulo: 'Editar la cadena de períodos', desc: 'Corregir un desde/hasta mal cargado desde acá, en vez de ir a la hoja D-20.' },
  { id: 'aviso', titulo: 'Aviso cuando la corrida termina', desc: 'Un mail al cerrar la corrida, para no quedarse mirando la ventana.' },
];

const sectionLabel = { fontSize: 'var(--text-2xs)', textTransform: 'uppercase', letterSpacing: 'var(--tracking-label)', color: 'var(--text-tertiary)', fontWeight: 'var(--weight-medium)' };
const note = { fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', lineHeight: 'var(--line-normal)' };

function Tabs({ value, onChange, items }) {
  return (
    <div style={{ display: 'flex', gap: 2, background: 'var(--surface-sunken)', borderRadius: 'var(--radius-pill)', padding: 3 }}>
      {items.map(it => (
        <button key={it.id} onClick={() => onChange(it.id)} style={{ flex: 1, border: 0, cursor: 'pointer', borderRadius: 'var(--radius-pill)', padding: '6px 6px', fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-medium)', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, background: value === it.id ? 'var(--surface-page)' : 'transparent', color: value === it.id ? 'var(--text-primary)' : 'var(--text-tertiary)', boxShadow: value === it.id ? 'var(--shadow-sm)' : 'none', transition: 'background var(--duration-fast) var(--ease-standard)' }}>
          {it.label}{it.badge ? <span style={{ fontSize: 'var(--text-2xs)', color: 'var(--color-primary)' }}>{it.badge}</span> : null}
        </button>
      ))}
    </div>
  );
}

function App() {
  const [tab, setTab] = React.useState('generar');
  const [informeId, setInformeId] = React.useState('jm');
  const [periodo, setPeriodo] = React.useState('');
  const [raya, setRaya] = React.useState(true);
  const [secciones, setSecciones] = React.useState(() => new Set(INFORMES[0].secciones.map(s => s.id)));
  const [estado, setEstado] = React.useState('form'); // form | generando | listo | fallo
  const [elapsed, setElapsed] = React.useState(0);
  const [forzarNuevo, setForzarNuevo] = React.useState(false);
  const [anclajePaso, setAnclajePaso] = React.useState(0);
  const [anclajeElegida, setAnclajeElegida] = React.useState(null);
  const [anclajeResueltos, setAnclajeResueltos] = React.useState(() => new Set());
  const [proximoAbierto, setProximoAbierto] = React.useState(null);
  const [nombreCustom, setNombreCustom] = React.useState('Informe semanal personalizado JM');
  const [bloques, setBloques] = React.useState([{ key: 1, tipo: 'uno_a_uno' }, { key: 2, tipo: 'm2' }]);
  const [tipoAAgregar, setTipoAAgregar] = React.useState('servicios');

  const informe = INFORMES.find(i => i.id === informeId);
  const periodoSel = PERIODOS.find(p => p.value === periodo);
  const deckExistente = DECKS_EXISTENTES[informeId + '|' + periodo];
  const defectoSinResolver = informeId === 'secco' && periodo === '';
  const pendientes = ANCLAJES.length - anclajeResueltos.size;
  const esCustom = !!informe.custom;
  const nombreInforme = esCustom ? nombreCustom : informe.nombre;
  const bloquesResueltos = bloques.map(b => ({ ...b, ...TIPOS.find(t => t.id === b.tipo) }));

  function agregarBloque() { setBloques(prev => [...prev, { key: Date.now(), tipo: tipoAAgregar }]); }
  function quitarBloque(key) { setBloques(prev => prev.filter(b => b.key !== key)); }
  function moverBloque(i, dir) {
    setBloques(prev => { const n = [...prev]; const j = i + dir; if (j < 0 || j >= n.length) return prev; [n[i], n[j]] = [n[j], n[i]]; return n; });
  }

  function toggleInforme(id) {
    setInformeId(id);
    setSecciones(new Set(INFORMES.find(i => i.id === id).secciones.map(s => s.id)));
    setForzarNuevo(false);
  }
  function cambiarPeriodo(v) { setPeriodo(v); setForzarNuevo(false); }
  function toggleSeccion(id, on) {
    setSecciones(prev => { const n = new Set(prev); on ? n.add(id) : n.delete(id); return n; });
  }

  React.useEffect(() => {
    if (estado !== 'generando') return;
    const t0 = Date.now();
    const id = setInterval(() => setElapsed(Math.round((Date.now() - t0) / 1000)), 1000);
    const done = setTimeout(() => { clearInterval(id); setEstado(informeId === 'secco' ? 'fallo' : 'listo'); }, 6000);
    return () => { clearInterval(id); clearTimeout(done); };
  }, [estado]);

  function generar() { setElapsed(0); setEstado('generando'); }

  return (
    <div style={{ width: '100%', maxWidth: 560, minHeight: 600, background: 'var(--surface-page)', fontFamily: 'var(--font-sans)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg, 12px)', padding: 24, boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: 16, boxShadow: 'var(--shadow-sm)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <img src="../assets/logos/ba-ciudad-logo-horizontal.png" alt="Buenos Aires Ciudad" style={{ height: 22, width: 'auto', alignSelf: 'flex-start', display: 'block' }} />
          <div style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-medium)', letterSpacing: '-0.01em' }}>Motor de Informes</div>
        </div>
        <span style={{ fontSize: 'var(--text-2xs)', letterSpacing: 'var(--tracking-label)', textTransform: 'uppercase', color: 'var(--text-tertiary)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-pill)', padding: '3px 8px', whiteSpace: 'nowrap' }}>en desarrollo</span>
      </div>

      <Tabs value={tab} onChange={setTab} items={[
        { id: 'generar', label: 'Generar' },
        { id: 'anclajes', label: 'Anclajes', badge: pendientes || null },
        { id: 'corridas', label: 'Corridas' },
        { id: 'proximo', label: 'Próximo' },
      ]} />

      {tab === 'proximo' ? (
        proximoAbierto === 'temario' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button onClick={() => setProximoAbierto(null)} style={{ alignSelf: 'flex-start', background: 'none', border: 0, padding: 0, cursor: 'pointer', color: 'var(--text-tertiary)', fontSize: 'var(--text-xs)', fontFamily: 'var(--font-sans)' }}>← Próximo</button>
            <div style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-medium)' }}>Pegar el temario</div>
            <div style={note}>Se pega la agenda tal como llega y el motor la parte en encuentros. Todavía no está conectado.</div>
            <textarea readOnly rows={6} defaultValue={'Lun 11/08 · 10:00 · Comuna 10 · recorrida de obra\nMar 12/08 · 09:30 · Servicios esenciales · mesa de trabajo\nMié 13/08 · 15:00 · Personas mayores · centro de jubilados'} style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', lineHeight: 'var(--line-normal)', color: 'var(--text-secondary)', padding: 10, border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)', background: 'var(--surface-sunken)', resize: 'none', width: '100%', boxSizing: 'border-box' }} />
            <div style={note}>Se detectarían 3 encuentros · 1 sin comuna cargada.</div>
            <Button variant="primary" disabled>Partir el temario</Button>
          </div>
        ) : proximoAbierto === 'preview' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button onClick={() => setProximoAbierto(null)} style={{ alignSelf: 'flex-start', background: 'none', border: 0, padding: 0, cursor: 'pointer', color: 'var(--text-tertiary)', fontSize: 'var(--text-xs)', fontFamily: 'var(--font-sans)' }}>← Próximo</button>
            <div style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-medium)' }}>Vista previa antes de generar</div>
            <div style={note}>Qué láminas saldrían y con qué datos, sin esperar la corrida. Todavía no está conectado.</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {['Portada', 'Uno a uno Comuna 10 · 4 láminas', 'Servicios esenciales', 'Personas mayores', 'M2'].map((l, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'center', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: 8 }}>
                  <div style={{ width: 44, height: 26, borderRadius: 3, background: 'var(--surface-sunken)', flexShrink: 0 }}></div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>{l}</div>
                </div>
              ))}
            </div>
            <Button variant="primary" disabled>Generar con esta previa</Button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={sectionLabel}>Lo que viene</div>
            {PROXIMO.map(p => (
              <button key={p.id} onClick={() => (p.id === 'temario' || p.id === 'preview') && setProximoAbierto(p.id)} style={{ textAlign: 'left', cursor: (p.id === 'temario' || p.id === 'preview') ? 'pointer' : 'default', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', background: 'var(--surface-page)', padding: '10px 12px', fontFamily: 'var(--font-sans)', display: 'flex', flexDirection: 'column', gap: 3 }}>
                <div style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-medium)', color: 'var(--text-primary)' }}>{p.titulo}{(p.id === 'temario' || p.id === 'preview') && <span style={{ color: 'var(--text-tertiary)', fontWeight: 'var(--weight-regular)' }}> ›</span>}</div>
                <div style={note}>{p.desc}</div>
              </button>
            ))}
          </div>
        )
      ) : tab === 'corridas' ? (
        <div>
          <div style={{ ...sectionLabel, marginBottom: 6 }}>Últimas corridas</div>
          {CORRIDAS.map((c, i) => <RunHistoryItem key={i} informe={c.informe} fecha={c.fecha} cerrada={c.cerrada} faltantes={c.faltantes} />)}
        </div>
      ) : tab === 'anclajes' ? (
        anclajePaso >= ANCLAJES.length ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ fontSize: 'var(--text-sm)' }}>Listo. {anclajeResueltos.size} de {ANCLAJES.length} quedaron ligados a una campaña.</div>
            <div style={note}>Los que quedaron sin ligar no salen en el informe hasta confirmarlos.</div>
            <Button variant="secondary" onClick={() => { setAnclajePaso(0); setAnclajeElegida(null); setAnclajeResueltos(new Set()); }}>Revisar de nuevo</Button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={note}>Encuentro sin ligar {anclajePaso + 1} de {ANCLAJES.length}</div>
            <div style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-medium)', lineHeight: 'var(--line-normal)' }}>{ANCLAJES[anclajePaso].encuentro}</div>
            <div style={note}>No se encontró una campaña con confianza suficiente. Elegí una, o dejalo sin ligar por ahora.</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {ANCLAJES[anclajePaso].candidatas.map((c, i) => (
                <button key={i} onClick={() => setAnclajeElegida(i)} style={{ textAlign: 'left', cursor: 'pointer', padding: '10px 12px', borderRadius: 'var(--radius-md)', border: '1px solid ' + (anclajeElegida === i ? 'var(--color-primary)' : 'var(--border-default)'), background: anclajeElegida === i ? 'var(--surface-primary-subtle)' : 'var(--surface-page)', color: 'var(--text-primary)', fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', transition: 'background var(--duration-fast) var(--ease-standard)' }}>{c}</button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 4, alignItems: 'stretch' }}>
              <Button variant="ghost" style={{ width: 'auto', whiteSpace: 'nowrap' }} onClick={() => { setAnclajePaso(p => p + 1); setAnclajeElegida(null); }}>Saltear por ahora</Button>
              <Button variant="primary" disabled={anclajeElegida === null} onClick={() => { setAnclajeResueltos(prev => new Set(prev).add(ANCLAJES[anclajePaso].id)); setAnclajePaso(p => p + 1); setAnclajeElegida(null); }}>Confirmar</Button>
            </div>
          </div>
        )
      ) : estado === 'form' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Select label="Informe" options={INFORMES.map(i => ({ value: i.id, label: i.nombre }))} value={informeId} onChange={toggleInforme} />
          {!informe.cableados && <div style={note}>Este informe todavía no tiene marcadores cableados: el deck va a salir con huecos en casi todos los tokens.</div>}
          {esCustom && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={sectionLabel} htmlFor="nombre-custom">Nombre del informe</label>
              <input id="nombre-custom" value={nombreCustom} onChange={e => setNombreCustom(e.target.value)} style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', padding: '8px 10px', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-sm)', background: 'var(--surface-page)', color: 'var(--text-primary)', width: '100%', boxSizing: 'border-box' }} />
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <Select label="Período" hint="Sale de la cadena de D-20, eslabón «vigente»." options={PERIODOS} value={periodo} onChange={cambiarPeriodo} />
            {periodoSel && periodoSel.broken && <div style={{ ...note, color: 'var(--color-error)' }}>Fecha sin cargar bien — los demás períodos funcionan igual.</div>}
          </div>

          {defectoSinResolver ? (
            <Alert kind="warning" title="No se resolvió el período por defecto.">La cadena D-20 no tiene eslabón vigente para este informe. Elegí un período de la lista para poder generar.</Alert>
          ) : deckExistente && !forzarNuevo ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={note}>Este período ya tiene un deck generado: se abre al instante.</div>
              <DeckLinkCard name={nombreInforme} href="#" meta={'Generado el ' + deckExistente.fecha + ' · corrida ' + deckExistente.corrida} />
              <Button variant="secondary" onClick={() => setForzarNuevo(true)}>Generar de nuevo, a sabiendas</Button>
            </div>
          ) : (
            <React.Fragment>
              {deckExistente && forzarNuevo && <Alert kind="warning">Ya existe un deck de este período. Esto genera otro y tarda entre 120 y 320 s igual.</Alert>}
              {esCustom ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={sectionLabel}>Bloques del informe</div>
                  {bloquesResueltos.length === 0 && <div style={note}>Todavía no agregaste ningún bloque.</div>}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {bloquesResueltos.map((b, i) => (
                      <div key={b.key} style={{ display: 'flex', alignItems: 'center', gap: 6, border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '7px 8px 7px 10px' }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <span style={{ fontSize: 'var(--text-sm)' }}>{b.label}</span>
                          {b.sub && <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginLeft: 6 }}>{b.sub}</span>}
                        </div>
                        <button onClick={() => moverBloque(i, -1)} disabled={i === 0} title="Subir" style={{ border: 0, background: 'none', cursor: i === 0 ? 'default' : 'pointer', color: i === 0 ? 'var(--text-disabled)' : 'var(--text-tertiary)', fontSize: 13, padding: 2 }}>↑</button>
                        <button onClick={() => moverBloque(i, 1)} disabled={i === bloquesResueltos.length - 1} title="Bajar" style={{ border: 0, background: 'none', cursor: i === bloquesResueltos.length - 1 ? 'default' : 'pointer', color: i === bloquesResueltos.length - 1 ? 'var(--text-disabled)' : 'var(--text-tertiary)', fontSize: 13, padding: 2 }}>↓</button>
                        <button onClick={() => quitarBloque(b.key)} title="Sacar" style={{ border: 0, background: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', fontSize: 14, padding: 2 }}>×</button>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <Select label="Agregar por tipo" options={TIPOS.map(t => ({ value: t.id, label: t.label }))} value={tipoAAgregar} onChange={setTipoAAgregar} />
                    </div>
                    <Button variant="secondary" style={{ width: 'auto', whiteSpace: 'nowrap' }} onClick={agregarBloque}>Agregar</Button>
                  </div>
                  <div style={note}>Se pueden repetir tipos — un bloque por cada uno. Menos bloques, corrida más corta: el techo es de 350 s.</div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <div style={sectionLabel}>Secciones que entran en la corrida</div>
                  {informe.secciones.map(s => <Checkbox key={s.id} id={'sec-' + s.id} label={s.label} sublabel={s.sub} checked={secciones.has(s.id)} onChange={on => toggleSeccion(s.id, on)} />)}
                  <div style={{ ...note, marginTop: 4 }}>Sacar una acorta la corrida — el techo es de 350 s.</div>
                </div>
              )}
              <Checkbox id="raya" label="Los huecos se ven como «—»" checked={raya} onChange={setRaya} />
              <Button variant="primary" disabled={esCustom && bloques.length === 0} onClick={generar}>Generar informe</Button>
            </React.Fragment>
          )}
        </div>
      ) : estado === 'generando' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 8 }}>
          <ProgressTimer elapsedSeconds={elapsed} stage={elapsed < 3 ? 'Copiando la plantilla' : 'Resolviendo marcadores'} />
          <div style={note}>Una corrida completa tarda entre 120 y 320 s: copia la plantilla, expande las secciones y resuelve cada marcador.</div>
          <div style={{ ...note, borderTop: '1px solid var(--border-subtle)', paddingTop: 10 }}>Si se cierra esta ventana la corrida sigue en el servidor. Al volver a abrir el panel, va a aparecer en «Corridas» cuando termine.</div>
        </div>
      ) : estado === 'fallo' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Alert kind="error" title="No se pudo generar el informe.">No se resolvió ningún marcador cableado para «{nombreInforme}» — no hay nada para copiar en la plantilla.</Alert>
          <div style={note}>No se generó ningún deck ni quedó registrada una corrida cerrada.</div>
          <Button variant="secondary" onClick={() => setEstado('form')}>Volver</Button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <DeckLinkCard name={nombreInforme + ' · muestra'} href="#" meta="Período de muestra · corrida 2026-08-12_0001" />
          <Alert kind="warning">Corte por tiempo en la etapa de secciones a los 340 s. El deck es válido pero está incompleto.</Alert>
          <div>
            <StatRow label="Tokens distintos en el deck" value={159} />
            <StatRow label="Impresiones con valor" unit="token × lámina" value={2480} />
            <StatRow label="Filas en FALTANTES" unit="una por token y por ítem" value={207} />
          </div>
          <div style={note}>En el deck los huecos se imprimieron como <b>{raya ? '«—»' : '«FALTA:token»'}</b>. Tardó 340 s de un techo de 350 s — al filo: la próxima corrida puede cortar.</div>
          <div>
            <div style={{ ...sectionLabel, marginBottom: 4 }}>Secciones repetibles</div>
            {esCustom
              ? bloquesResueltos.map(b => <StatusDot key={b.key} status="ok" label={b.label} note="emitido(s) de muestra" />)
              : informe.secciones.map(s => secciones.has(s.id)
                ? <StatusDot key={s.id} status="ok" label={s.label} note="emitido(s) de muestra" />
                : <StatusDot key={s.id} status="omitted" label={s.label} note="fuera de esta corrida" />)}
          </div>
          {pendientes > 0 && (
            <div style={{ background: 'var(--surface-sunken)', borderRadius: 'var(--radius-md)', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-primary)', lineHeight: 'var(--line-normal)' }}>{pendientes} encuentros no se pudieron ligar a una campaña con confianza suficiente. No salieron en este informe.</div>
              <Button variant="secondary" onClick={() => setTab('anclajes')}>Revisar y confirmar</Button>
            </div>
          )}
          <Button variant="secondary" onClick={() => setEstado('form')}>Generar otro</Button>
        </div>
      )}

      <div style={{ marginTop: 'auto', paddingTop: 14 }}>
        <img src="../assets/brand/ba-banner.png" alt="" style={{ width: 'calc(100% + 48px)', marginLeft: -24, marginBottom: -24, display: 'block', borderBottomLeftRadius: 'var(--radius-lg, 12px)', borderBottomRightRadius: 'var(--radius-lg, 12px)' }} />
      </div>
    </div>
  );
}
ReactDOM.createRoot(document.getElementById('root')).render(<App />);
