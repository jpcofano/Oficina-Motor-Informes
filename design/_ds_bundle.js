/* @ds-bundle: {"format":4,"namespace":"MotorDeInformesDesignSystem_37ea89","components":[{"name":"DeckLinkCard","sourcePath":"components/data/DeckLinkCard.jsx"},{"name":"RunHistoryItem","sourcePath":"components/data/RunHistoryItem.jsx"},{"name":"StatRow","sourcePath":"components/data/StatRow.jsx"},{"name":"Alert","sourcePath":"components/feedback/Alert.jsx"},{"name":"ProgressTimer","sourcePath":"components/feedback/ProgressTimer.jsx"},{"name":"StatusDot","sourcePath":"components/feedback/StatusDot.jsx"},{"name":"Button","sourcePath":"components/forms/Button.jsx"},{"name":"Checkbox","sourcePath":"components/forms/Checkbox.jsx"},{"name":"Select","sourcePath":"components/forms/Select.jsx"}],"sourceHashes":{"components/data/DeckLinkCard.jsx":"755fd5d136eb","components/data/RunHistoryItem.jsx":"3f42506b5aa3","components/data/StatRow.jsx":"d55aa4451769","components/feedback/Alert.jsx":"37ec88c36fa6","components/feedback/ProgressTimer.jsx":"6b070b5c341b","components/feedback/StatusDot.jsx":"d52c39988a7d","components/forms/Button.jsx":"6bdd3cd2e994","components/forms/Checkbox.jsx":"1e6b72b843d7","components/forms/Select.jsx":"409d4a02b444","ui_kits/panel/PanelApp.jsx":"b34719e7205f"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.MotorDeInformesDesignSystem_37ea89 = window.MotorDeInformesDesignSystem_37ea89 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/data/DeckLinkCard.jsx
try { (() => {
function DeckLinkCard({
  name,
  href,
  meta
}) {
  return React.createElement('a', {
    href,
    target: '_blank',
    rel: 'noreferrer',
    style: {
      display: 'block',
      textDecoration: 'none',
      background: 'var(--surface-primary-subtle)',
      color: 'var(--text-on-primary-subtle)',
      borderRadius: 'var(--radius-md)',
      padding: '12px 14px',
      fontWeight: 'var(--weight-medium)',
      fontSize: 'var(--text-sm)'
    }
  }, name + ' ↗', meta && React.createElement('div', {
    style: {
      color: 'var(--text-tertiary)',
      fontWeight: 'var(--weight-regular)',
      fontSize: 'var(--text-xs)',
      marginTop: 4
    }
  }, meta));
}
Object.assign(__ds_scope, { DeckLinkCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/DeckLinkCard.jsx", error: String((e && e.message) || e) }); }

// components/data/RunHistoryItem.jsx
try { (() => {
function RunHistoryItem({
  informe,
  fecha,
  cerrada,
  faltantes
}) {
  return React.createElement('div', {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      padding: '8px 0',
      borderBottom: '1px solid var(--border-subtle)',
      fontSize: 'var(--text-sm)'
    }
  }, React.createElement('div', null, React.createElement('div', {
    style: {
      color: 'var(--text-primary)',
      fontWeight: 'var(--weight-medium)'
    }
  }, informe), React.createElement('div', {
    style: {
      color: cerrada ? 'var(--text-tertiary)' : 'var(--color-error)',
      fontSize: 'var(--text-xs)'
    }
  }, cerrada ? fecha : 'no cerró — sin fecha de generación')), faltantes !== undefined && React.createElement('div', {
    style: {
      color: 'var(--text-tertiary)',
      fontSize: 'var(--text-xs)',
      textAlign: 'right'
    }
  }, faltantes + ' en FALTANTES'));
}
Object.assign(__ds_scope, { RunHistoryItem });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/RunHistoryItem.jsx", error: String((e && e.message) || e) }); }

// components/data/StatRow.jsx
try { (() => {
function StatRow({
  label,
  unit,
  value
}) {
  return React.createElement('div', {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'baseline',
      padding: '5px 0',
      borderBottom: '1px solid var(--border-subtle)'
    }
  }, React.createElement('div', null, React.createElement('div', {
    style: {
      fontSize: 'var(--text-sm)',
      color: 'var(--text-primary)'
    }
  }, label), unit && React.createElement('div', {
    style: {
      fontSize: 'var(--text-2xs)',
      color: 'var(--text-tertiary)'
    }
  }, unit)), React.createElement('div', {
    style: {
      fontSize: 'var(--text-md)',
      fontWeight: 'var(--weight-medium)',
      fontVariantNumeric: 'tabular-nums',
      color: 'var(--text-primary)'
    }
  }, value));
}
Object.assign(__ds_scope, { StatRow });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/StatRow.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Alert.jsx
try { (() => {
const KIND = {
  error: {
    bg: 'var(--surface-error-subtle)',
    fg: 'var(--color-error)'
  },
  warning: {
    bg: 'var(--surface-warning-subtle)',
    fg: 'var(--color-warning)'
  },
  info: {
    bg: 'var(--surface-primary-subtle)',
    fg: 'var(--text-on-primary-subtle)'
  }
};
function Alert({
  kind = 'info',
  title,
  children
}) {
  const c = KIND[kind];
  return React.createElement('div', {
    style: {
      background: c.bg,
      color: c.fg,
      borderRadius: 'var(--radius-sm)',
      padding: '10px 12px',
      fontSize: 'var(--text-xs)',
      lineHeight: 'var(--line-normal)'
    }
  }, title && React.createElement('div', {
    style: {
      fontWeight: 'var(--weight-bold)',
      marginBottom: 2
    }
  }, title), children);
}
Object.assign(__ds_scope, { Alert });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Alert.jsx", error: String((e && e.message) || e) }); }

// components/feedback/ProgressTimer.jsx
try { (() => {
function ProgressTimer({
  elapsedSeconds = 0,
  ceilingSeconds = 350,
  typicalMin = 120,
  typicalMax = 320,
  stage
}) {
  const clamp = s => Math.min(100, Math.max(0, s / ceilingSeconds * 100));
  const bandLeft = clamp(typicalMin),
    bandWidth = clamp(typicalMax) - bandLeft;
  const markerLeft = clamp(elapsedSeconds);
  const overTypical = elapsedSeconds > typicalMax;
  const markerColor = elapsedSeconds > ceilingSeconds - 30 ? 'var(--color-error)' : overTypical ? 'var(--color-warning)' : 'var(--color-primary)';
  return React.createElement('div', {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 8
    }
  }, React.createElement('div', {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'baseline'
    }
  }, React.createElement('span', {
    style: {
      fontSize: 'var(--text-lg)',
      fontWeight: 'var(--weight-medium)',
      color: 'var(--text-primary)',
      fontVariantNumeric: 'tabular-nums'
    }
  }, elapsedSeconds + ' s'), React.createElement('span', {
    style: {
      fontSize: 'var(--text-xs)',
      color: 'var(--text-tertiary)'
    }
  }, stage || 'Generando…')), React.createElement('div', {
    style: {
      position: 'relative',
      height: 6,
      borderRadius: 'var(--radius-pill)',
      background: 'var(--surface-sunken)'
    }
  }, React.createElement('div', {
    style: {
      position: 'absolute',
      left: bandLeft + '%',
      width: bandWidth + '%',
      top: 0,
      bottom: 0,
      borderRadius: 'var(--radius-pill)',
      background: 'var(--surface-primary-subtle)'
    }
  }), React.createElement('div', {
    style: {
      position: 'absolute',
      left: 'calc(' + markerLeft + '% - 2px)',
      top: -3,
      width: 4,
      height: 12,
      borderRadius: 2,
      background: markerColor,
      transition: 'left var(--duration-normal) var(--ease-standard)'
    }
  })), React.createElement('div', {
    style: {
      fontSize: 'var(--text-2xs)',
      color: 'var(--text-tertiary)'
    }
  }, 'Rango habitual: ' + typicalMin + '–' + typicalMax + ' s de ' + ceilingSeconds + ' s de techo'));
}
Object.assign(__ds_scope, { ProgressTimer });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/ProgressTimer.jsx", error: String((e && e.message) || e) }); }

// components/feedback/StatusDot.jsx
try { (() => {
const MAP = {
  ok: {
    symbol: '●',
    color: 'var(--color-success)'
  },
  omitted: {
    symbol: '○',
    color: 'var(--text-tertiary)'
  },
  warning: {
    symbol: '▲',
    color: 'var(--color-warning)'
  }
};
function StatusDot({
  status = 'ok',
  label,
  note
}) {
  const s = MAP[status];
  return React.createElement('div', {
    style: {
      display: 'flex',
      gap: 8,
      alignItems: 'baseline',
      fontSize: 'var(--text-sm)',
      padding: '2px 0'
    }
  }, React.createElement('span', {
    style: {
      color: s.color,
      fontSize: 10
    }
  }, s.symbol), React.createElement('span', {
    style: {
      color: 'var(--text-primary)',
      fontWeight: 'var(--weight-medium)'
    }
  }, label), note && React.createElement('span', {
    style: {
      color: 'var(--text-tertiary)',
      fontSize: 'var(--text-xs)'
    }
  }, note));
}
Object.assign(__ds_scope, { StatusDot });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/StatusDot.jsx", error: String((e && e.message) || e) }); }

// components/forms/Button.jsx
try { (() => {
function Button({
  variant = 'primary',
  size = 'md',
  disabled,
  children,
  onClick,
  style
}) {
  const base = {
    fontFamily: 'var(--font-sans)',
    fontWeight: 'var(--weight-medium)',
    fontSize: 'var(--text-sm)',
    border: 0,
    borderRadius: 'var(--radius-sm)',
    cursor: disabled ? 'default' : 'pointer',
    padding: size === 'sm' ? '6px 12px' : '10px 16px',
    transition: 'background var(--duration-fast) var(--ease-standard)',
    width: '100%',
    boxSizing: 'border-box'
  };
  const variants = {
    primary: {
      background: disabled ? 'var(--color-disabled-bg)' : 'var(--color-primary)',
      color: disabled ? 'var(--color-disabled-fg)' : 'var(--text-on-primary)'
    },
    secondary: {
      background: 'var(--surface-page)',
      color: disabled ? 'var(--text-disabled)' : 'var(--color-primary)',
      border: '1px solid var(--border-default)'
    },
    ghost: {
      background: 'transparent',
      color: disabled ? 'var(--text-disabled)' : 'var(--text-secondary)'
    }
  };
  return React.createElement('button', {
    disabled,
    onClick,
    style: {
      ...base,
      ...variants[variant],
      ...style
    },
    onMouseEnter: e => {
      if (!disabled && variant === 'primary') e.currentTarget.style.background = 'var(--color-primary-hover)';
    },
    onMouseLeave: e => {
      if (!disabled && variant === 'primary') e.currentTarget.style.background = 'var(--color-primary)';
    }
  }, children);
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Button.jsx", error: String((e && e.message) || e) }); }

// components/forms/Checkbox.jsx
try { (() => {
function Checkbox({
  id,
  label,
  sublabel,
  checked,
  onChange,
  disabled
}) {
  return React.createElement('label', {
    htmlFor: id,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      fontSize: 'var(--text-sm)',
      color: disabled ? 'var(--text-disabled)' : 'var(--text-primary)',
      cursor: disabled ? 'default' : 'pointer',
      padding: '4px 0'
    }
  }, React.createElement('input', {
    type: 'checkbox',
    id,
    checked,
    disabled,
    onChange: e => onChange && onChange(e.target.checked),
    style: {
      width: 16,
      height: 16,
      accentColor: 'var(--color-primary)',
      margin: 0
    }
  }), React.createElement('span', null, label, sublabel && React.createElement('span', {
    style: {
      fontSize: 'var(--text-xs)',
      color: 'var(--text-tertiary)',
      marginLeft: 6
    }
  }, sublabel)));
}
Object.assign(__ds_scope, { Checkbox });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Checkbox.jsx", error: String((e && e.message) || e) }); }

// components/forms/Select.jsx
try { (() => {
function Select({
  label,
  hint,
  options = [],
  value,
  onChange,
  disabled
}) {
  return React.createElement('div', {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 4
    }
  }, label && React.createElement('label', {
    style: {
      fontSize: 'var(--text-2xs)',
      textTransform: 'uppercase',
      letterSpacing: 'var(--tracking-label)',
      color: 'var(--text-tertiary)',
      fontWeight: 'var(--weight-medium)'
    }
  }, label), React.createElement('select', {
    value,
    disabled,
    onChange: e => onChange && onChange(e.target.value),
    style: {
      fontFamily: 'var(--font-sans)',
      fontSize: 'var(--text-sm)',
      padding: '8px 10px',
      border: '1px solid var(--border-default)',
      borderRadius: 'var(--radius-sm)',
      background: 'var(--surface-page)',
      color: 'var(--text-primary)',
      width: '100%',
      boxSizing: 'border-box'
    }
  }, options.map(o => React.createElement('option', {
    key: o.value,
    value: o.value
  }, o.label))), hint && React.createElement('div', {
    style: {
      fontSize: 'var(--text-xs)',
      color: 'var(--text-tertiary)',
      lineHeight: 'var(--line-normal)'
    }
  }, hint));
}
Object.assign(__ds_scope, { Select });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Select.jsx", error: String((e && e.message) || e) }); }

// ui_kits/panel/PanelApp.jsx
try { (() => {
const {
  Button,
  Select,
  Checkbox,
  Alert,
  ProgressTimer,
  StatusDot,
  StatRow,
  DeckLinkCard,
  RunHistoryItem
} = window.MotorDeInformesDesignSystem_37ea89;
const INFORMES = [{
  id: 'jm',
  nombre: 'Informe semanal JM',
  cableados: 57,
  secciones: [{
    id: 'uno_a_uno',
    label: 'Uno a uno Comuna 10',
    sub: 'itera reuniones'
  }, {
    id: 'servicios',
    label: 'Servicios esenciales'
  }, {
    id: 'mayores',
    label: 'Personas mayores'
  }, {
    id: 'm2',
    label: 'M2'
  }]
}, {
  id: 'secco',
  nombre: 'Seguimiento SECCO – SSCDI',
  cableados: 0,
  secciones: [{
    id: 'uno_a_uno',
    label: 'Uno a uno Comuna 10',
    sub: 'itera reuniones'
  }, {
    id: 'analisis',
    label: 'Análisis comparativo Imagen',
    sub: 'itera red social'
  }, {
    id: 'miba',
    label: 'Integración MiBA'
  }, {
    id: 'proveedores',
    label: 'Nuevos Proveedores',
    sub: 'itera proveedor'
  }]
}, {
  id: 'custom',
  nombre: 'Informe semanal personalizado',
  cableados: 57,
  custom: true,
  secciones: []
}];
const TIPOS = [{
  id: 'uno_a_uno',
  label: 'Uno a uno',
  sub: 'itera reuniones'
}, {
  id: 'm2',
  label: 'M2'
}, {
  id: 'servicios',
  label: 'Servicios esenciales'
}, {
  id: 'mayores',
  label: 'Personas mayores'
}, {
  id: 'analisis',
  label: 'Análisis comparativo Imagen',
  sub: 'itera red social'
}, {
  id: 'miba',
  label: 'Integración MiBA'
}, {
  id: 'proveedores',
  label: 'Nuevos Proveedores',
  sub: 'itera proveedor'
}];
const PERIODOS = [{
  value: '',
  label: 'El del período activo · muestra 04/08 a 10/08'
}, {
  value: 'p1',
  label: 'p1 · 28/07 a 03/08'
}, {
  value: 'p2',
  label: 'p2 · 21/07 a 27/07'
}, {
  value: 'p3',
  label: 'p3 · fecha sin cargar',
  broken: true
}];
const CORRIDAS = [{
  informe: 'Informe semanal JM',
  fecha: '2026-08-11 09:42',
  cerrada: true,
  faltantes: 207
}, {
  informe: 'Seguimiento SECCO – SSCDI',
  fecha: '',
  cerrada: false
}, {
  informe: 'Informe semanal JM',
  fecha: '2026-08-04 09:15',
  cerrada: true,
  faltantes: 183
}];
const DECKS_EXISTENTES = {
  'jm|': {
    fecha: '2026-08-11 09:42',
    corrida: '2026-08-11_0001'
  }
};
const ANCLAJES = [{
  id: 1,
  encuentro: 'Reunión 12/08 · Comuna 10 · «seguimiento de obra»',
  candidatas: ['Obras Comuna 10 – 3er trimestre', 'Vecinal Comuna 10 – agenda abierta']
}, {
  id: 2,
  encuentro: 'Reunión 11/08 · sin comuna cargada · «mesa de trabajo»',
  candidatas: ['Mesa de trabajo intersectorial', 'Servicios esenciales – seguimiento']
}, {
  id: 3,
  encuentro: 'Reunión 09/08 · Comuna 4 · «recorrida»',
  candidatas: ['Recorridas Comuna 4', 'Obras Comuna 4 – 3er trimestre']
}];
const PROXIMO = [{
  id: 'temario',
  titulo: 'Pegar el temario',
  desc: 'Pegar la agenda de la semana y que el motor la parta en encuentros, sin cargar fila por fila.'
}, {
  id: 'preview',
  titulo: 'Vista previa antes de generar',
  desc: 'Ver qué láminas van a salir y con qué datos, antes de esperar los cinco minutos.'
}, {
  id: 'marcador',
  titulo: 'Agregar un marcador desde el panel',
  desc: 'Cablear un token nuevo sin abrir la planilla de configuración.'
}, {
  id: 'periodos',
  titulo: 'Editar la cadena de períodos',
  desc: 'Corregir un desde/hasta mal cargado desde acá, en vez de ir a la hoja D-20.'
}, {
  id: 'aviso',
  titulo: 'Aviso cuando la corrida termina',
  desc: 'Un mail al cerrar la corrida, para no quedarse mirando la ventana.'
}];
const sectionLabel = {
  fontSize: 'var(--text-2xs)',
  textTransform: 'uppercase',
  letterSpacing: 'var(--tracking-label)',
  color: 'var(--text-tertiary)',
  fontWeight: 'var(--weight-medium)'
};
const note = {
  fontSize: 'var(--text-xs)',
  color: 'var(--text-tertiary)',
  lineHeight: 'var(--line-normal)'
};
function Tabs({
  value,
  onChange,
  items
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 2,
      background: 'var(--surface-sunken)',
      borderRadius: 'var(--radius-pill)',
      padding: 3
    }
  }, items.map(it => /*#__PURE__*/React.createElement("button", {
    key: it.id,
    onClick: () => onChange(it.id),
    style: {
      flex: 1,
      border: 0,
      cursor: 'pointer',
      borderRadius: 'var(--radius-pill)',
      padding: '6px 6px',
      fontFamily: 'var(--font-sans)',
      fontSize: 'var(--text-xs)',
      fontWeight: 'var(--weight-medium)',
      whiteSpace: 'nowrap',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 4,
      background: value === it.id ? 'var(--surface-page)' : 'transparent',
      color: value === it.id ? 'var(--text-primary)' : 'var(--text-tertiary)',
      boxShadow: value === it.id ? 'var(--shadow-sm)' : 'none',
      transition: 'background var(--duration-fast) var(--ease-standard)'
    }
  }, it.label, it.badge ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--text-2xs)',
      color: 'var(--color-primary)'
    }
  }, it.badge) : null)));
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
  const [bloques, setBloques] = React.useState([{
    key: 1,
    tipo: 'uno_a_uno'
  }, {
    key: 2,
    tipo: 'm2'
  }]);
  const [tipoAAgregar, setTipoAAgregar] = React.useState('servicios');
  const informe = INFORMES.find(i => i.id === informeId);
  const periodoSel = PERIODOS.find(p => p.value === periodo);
  const deckExistente = DECKS_EXISTENTES[informeId + '|' + periodo];
  const defectoSinResolver = informeId === 'secco' && periodo === '';
  const pendientes = ANCLAJES.length - anclajeResueltos.size;
  const esCustom = !!informe.custom;
  const nombreInforme = esCustom ? nombreCustom : informe.nombre;
  const bloquesResueltos = bloques.map(b => ({
    ...b,
    ...TIPOS.find(t => t.id === b.tipo)
  }));
  function agregarBloque() {
    setBloques(prev => [...prev, {
      key: Date.now(),
      tipo: tipoAAgregar
    }]);
  }
  function quitarBloque(key) {
    setBloques(prev => prev.filter(b => b.key !== key));
  }
  function moverBloque(i, dir) {
    setBloques(prev => {
      const n = [...prev];
      const j = i + dir;
      if (j < 0 || j >= n.length) return prev;
      [n[i], n[j]] = [n[j], n[i]];
      return n;
    });
  }
  function toggleInforme(id) {
    setInformeId(id);
    setSecciones(new Set(INFORMES.find(i => i.id === id).secciones.map(s => s.id)));
    setForzarNuevo(false);
  }
  function cambiarPeriodo(v) {
    setPeriodo(v);
    setForzarNuevo(false);
  }
  function toggleSeccion(id, on) {
    setSecciones(prev => {
      const n = new Set(prev);
      on ? n.add(id) : n.delete(id);
      return n;
    });
  }
  React.useEffect(() => {
    if (estado !== 'generando') return;
    const t0 = Date.now();
    const id = setInterval(() => setElapsed(Math.round((Date.now() - t0) / 1000)), 1000);
    const done = setTimeout(() => {
      clearInterval(id);
      setEstado(informeId === 'secco' ? 'fallo' : 'listo');
    }, 6000);
    return () => {
      clearInterval(id);
      clearTimeout(done);
    };
  }, [estado]);
  function generar() {
    setElapsed(0);
    setEstado('generando');
  }
  return /*#__PURE__*/React.createElement("div", {
    style: {
      width: 360,
      minHeight: 600,
      background: 'var(--surface-page)',
      fontFamily: 'var(--font-sans)',
      color: 'var(--text-primary)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-lg, 12px)',
      padding: 18,
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      gap: 14,
      boxShadow: 'var(--shadow-sm)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 6
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/logos/ba-ciudad-logo-horizontal.png",
    alt: "Buenos Aires Ciudad",
    style: {
      height: 22,
      width: 'auto',
      alignSelf: 'flex-start',
      display: 'block'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--text-lg)',
      fontWeight: 'var(--weight-medium)',
      letterSpacing: '-0.01em'
    }
  }, "Motor de Informes")), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--text-2xs)',
      letterSpacing: 'var(--tracking-label)',
      textTransform: 'uppercase',
      color: 'var(--text-tertiary)',
      border: '1px solid var(--border-default)',
      borderRadius: 'var(--radius-pill)',
      padding: '3px 8px',
      whiteSpace: 'nowrap'
    }
  }, "en desarrollo")), /*#__PURE__*/React.createElement(Tabs, {
    value: tab,
    onChange: setTab,
    items: [{
      id: 'generar',
      label: 'Generar'
    }, {
      id: 'anclajes',
      label: 'Anclajes',
      badge: pendientes || null
    }, {
      id: 'corridas',
      label: 'Corridas'
    }, {
      id: 'proximo',
      label: 'Próximo'
    }]
  }), tab === 'proximo' ? proximoAbierto === 'temario' ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => setProximoAbierto(null),
    style: {
      alignSelf: 'flex-start',
      background: 'none',
      border: 0,
      padding: 0,
      cursor: 'pointer',
      color: 'var(--text-tertiary)',
      fontSize: 'var(--text-xs)',
      fontFamily: 'var(--font-sans)'
    }
  }, "\u2190 Pr\xF3ximo"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--text-sm)',
      fontWeight: 'var(--weight-medium)'
    }
  }, "Pegar el temario"), /*#__PURE__*/React.createElement("div", {
    style: note
  }, "Se pega la agenda tal como llega y el motor la parte en encuentros. Todav\xEDa no est\xE1 conectado."), /*#__PURE__*/React.createElement("textarea", {
    readOnly: true,
    rows: 6,
    defaultValue: 'Lun 11/08 · 10:00 · Comuna 10 · recorrida de obra\nMar 12/08 · 09:30 · Servicios esenciales · mesa de trabajo\nMié 13/08 · 15:00 · Personas mayores · centro de jubilados',
    style: {
      fontFamily: 'var(--font-sans)',
      fontSize: 'var(--text-xs)',
      lineHeight: 'var(--line-normal)',
      color: 'var(--text-secondary)',
      padding: 10,
      border: '1px solid var(--border-default)',
      borderRadius: 'var(--radius-md)',
      background: 'var(--surface-sunken)',
      resize: 'none',
      width: '100%',
      boxSizing: 'border-box'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: note
  }, "Se detectar\xEDan 3 encuentros \xB7 1 sin comuna cargada."), /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    disabled: true
  }, "Partir el temario")) : proximoAbierto === 'preview' ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => setProximoAbierto(null),
    style: {
      alignSelf: 'flex-start',
      background: 'none',
      border: 0,
      padding: 0,
      cursor: 'pointer',
      color: 'var(--text-tertiary)',
      fontSize: 'var(--text-xs)',
      fontFamily: 'var(--font-sans)'
    }
  }, "\u2190 Pr\xF3ximo"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--text-sm)',
      fontWeight: 'var(--weight-medium)'
    }
  }, "Vista previa antes de generar"), /*#__PURE__*/React.createElement("div", {
    style: note
  }, "Qu\xE9 l\xE1minas saldr\xEDan y con qu\xE9 datos, sin esperar la corrida. Todav\xEDa no est\xE1 conectado."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 6
    }
  }, ['Portada', 'Uno a uno Comuna 10 · 4 láminas', 'Servicios esenciales', 'Personas mayores', 'M2'].map((l, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: 'flex',
      gap: 10,
      alignItems: 'center',
      border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-md)',
      padding: 8
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 44,
      height: 26,
      borderRadius: 3,
      background: 'var(--surface-sunken)',
      flexShrink: 0
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--text-xs)',
      color: 'var(--text-secondary)'
    }
  }, l)))), /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    disabled: true
  }, "Generar con esta previa")) : /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: sectionLabel
  }, "Lo que viene"), PROXIMO.map(p => /*#__PURE__*/React.createElement("button", {
    key: p.id,
    onClick: () => (p.id === 'temario' || p.id === 'preview') && setProximoAbierto(p.id),
    style: {
      textAlign: 'left',
      cursor: p.id === 'temario' || p.id === 'preview' ? 'pointer' : 'default',
      border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-md)',
      background: 'var(--surface-page)',
      padding: '10px 12px',
      fontFamily: 'var(--font-sans)',
      display: 'flex',
      flexDirection: 'column',
      gap: 3
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--text-sm)',
      fontWeight: 'var(--weight-medium)',
      color: 'var(--text-primary)'
    }
  }, p.titulo, (p.id === 'temario' || p.id === 'preview') && /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--text-tertiary)',
      fontWeight: 'var(--weight-regular)'
    }
  }, " \u203A")), /*#__PURE__*/React.createElement("div", {
    style: note
  }, p.desc)))) : tab === 'corridas' ? /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      ...sectionLabel,
      marginBottom: 6
    }
  }, "\xDAltimas corridas"), CORRIDAS.map((c, i) => /*#__PURE__*/React.createElement(RunHistoryItem, {
    key: i,
    informe: c.informe,
    fecha: c.fecha,
    cerrada: c.cerrada,
    faltantes: c.faltantes
  }))) : tab === 'anclajes' ? anclajePaso >= ANCLAJES.length ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--text-sm)'
    }
  }, "Listo. ", anclajeResueltos.size, " de ", ANCLAJES.length, " quedaron ligados a una campa\xF1a."), /*#__PURE__*/React.createElement("div", {
    style: note
  }, "Los que quedaron sin ligar no salen en el informe hasta confirmarlos."), /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    onClick: () => {
      setAnclajePaso(0);
      setAnclajeElegida(null);
      setAnclajeResueltos(new Set());
    }
  }, "Revisar de nuevo")) : /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: note
  }, "Encuentro sin ligar ", anclajePaso + 1, " de ", ANCLAJES.length), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--text-sm)',
      fontWeight: 'var(--weight-medium)',
      lineHeight: 'var(--line-normal)'
    }
  }, ANCLAJES[anclajePaso].encuentro), /*#__PURE__*/React.createElement("div", {
    style: note
  }, "No se encontr\xF3 una campa\xF1a con confianza suficiente. Eleg\xED una, o dejalo sin ligar por ahora."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 6
    }
  }, ANCLAJES[anclajePaso].candidatas.map((c, i) => /*#__PURE__*/React.createElement("button", {
    key: i,
    onClick: () => setAnclajeElegida(i),
    style: {
      textAlign: 'left',
      cursor: 'pointer',
      padding: '10px 12px',
      borderRadius: 'var(--radius-md)',
      border: '1px solid ' + (anclajeElegida === i ? 'var(--color-primary)' : 'var(--border-default)'),
      background: anclajeElegida === i ? 'var(--surface-primary-subtle)' : 'var(--surface-page)',
      color: 'var(--text-primary)',
      fontFamily: 'var(--font-sans)',
      fontSize: 'var(--text-sm)',
      transition: 'background var(--duration-fast) var(--ease-standard)'
    }
  }, c))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      marginTop: 4,
      alignItems: 'stretch'
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "ghost",
    style: {
      width: 'auto',
      whiteSpace: 'nowrap'
    },
    onClick: () => {
      setAnclajePaso(p => p + 1);
      setAnclajeElegida(null);
    }
  }, "Saltear por ahora"), /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    disabled: anclajeElegida === null,
    onClick: () => {
      setAnclajeResueltos(prev => new Set(prev).add(ANCLAJES[anclajePaso].id));
      setAnclajePaso(p => p + 1);
      setAnclajeElegida(null);
    }
  }, "Confirmar"))) : estado === 'form' ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 14
    }
  }, /*#__PURE__*/React.createElement(Select, {
    label: "Informe",
    options: INFORMES.map(i => ({
      value: i.id,
      label: i.nombre
    })),
    value: informeId,
    onChange: toggleInforme
  }), !informe.cableados && /*#__PURE__*/React.createElement("div", {
    style: note
  }, "Este informe todav\xEDa no tiene marcadores cableados: el deck va a salir con huecos en casi todos los tokens."), esCustom && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 4
    }
  }, /*#__PURE__*/React.createElement("label", {
    style: sectionLabel,
    htmlFor: "nombre-custom"
  }, "Nombre del informe"), /*#__PURE__*/React.createElement("input", {
    id: "nombre-custom",
    value: nombreCustom,
    onChange: e => setNombreCustom(e.target.value),
    style: {
      fontFamily: 'var(--font-sans)',
      fontSize: 'var(--text-sm)',
      padding: '8px 10px',
      border: '1px solid var(--border-default)',
      borderRadius: 'var(--radius-sm)',
      background: 'var(--surface-page)',
      color: 'var(--text-primary)',
      width: '100%',
      boxSizing: 'border-box'
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 4
    }
  }, /*#__PURE__*/React.createElement(Select, {
    label: "Per\xEDodo",
    hint: "Sale de la cadena de D-20, eslab\xF3n \xABvigente\xBB.",
    options: PERIODOS,
    value: periodo,
    onChange: cambiarPeriodo
  }), periodoSel && periodoSel.broken && /*#__PURE__*/React.createElement("div", {
    style: {
      ...note,
      color: 'var(--color-error)'
    }
  }, "Fecha sin cargar bien \u2014 los dem\xE1s per\xEDodos funcionan igual.")), defectoSinResolver ? /*#__PURE__*/React.createElement(Alert, {
    kind: "warning",
    title: "No se resolvi\xF3 el per\xEDodo por defecto."
  }, "La cadena D-20 no tiene eslab\xF3n vigente para este informe. Eleg\xED un per\xEDodo de la lista para poder generar.") : deckExistente && !forzarNuevo ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: note
  }, "Este per\xEDodo ya tiene un deck generado: se abre al instante."), /*#__PURE__*/React.createElement(DeckLinkCard, {
    name: nombreInforme,
    href: "#",
    meta: 'Generado el ' + deckExistente.fecha + ' · corrida ' + deckExistente.corrida
  }), /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    onClick: () => setForzarNuevo(true)
  }, "Generar de nuevo, a sabiendas")) : /*#__PURE__*/React.createElement(React.Fragment, null, deckExistente && forzarNuevo && /*#__PURE__*/React.createElement(Alert, {
    kind: "warning"
  }, "Ya existe un deck de este per\xEDodo. Esto genera otro y tarda entre 120 y 320 s igual."), esCustom ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: sectionLabel
  }, "Bloques del informe"), bloquesResueltos.length === 0 && /*#__PURE__*/React.createElement("div", {
    style: note
  }, "Todav\xEDa no agregaste ning\xFAn bloque."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 4
    }
  }, bloquesResueltos.map((b, i) => /*#__PURE__*/React.createElement("div", {
    key: b.key,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-md)',
      padding: '7px 8px 7px 10px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--text-sm)'
    }
  }, b.label), b.sub && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--text-xs)',
      color: 'var(--text-tertiary)',
      marginLeft: 6
    }
  }, b.sub)), /*#__PURE__*/React.createElement("button", {
    onClick: () => moverBloque(i, -1),
    disabled: i === 0,
    title: "Subir",
    style: {
      border: 0,
      background: 'none',
      cursor: i === 0 ? 'default' : 'pointer',
      color: i === 0 ? 'var(--text-disabled)' : 'var(--text-tertiary)',
      fontSize: 13,
      padding: 2
    }
  }, "\u2191"), /*#__PURE__*/React.createElement("button", {
    onClick: () => moverBloque(i, 1),
    disabled: i === bloquesResueltos.length - 1,
    title: "Bajar",
    style: {
      border: 0,
      background: 'none',
      cursor: i === bloquesResueltos.length - 1 ? 'default' : 'pointer',
      color: i === bloquesResueltos.length - 1 ? 'var(--text-disabled)' : 'var(--text-tertiary)',
      fontSize: 13,
      padding: 2
    }
  }, "\u2193"), /*#__PURE__*/React.createElement("button", {
    onClick: () => quitarBloque(b.key),
    title: "Sacar",
    style: {
      border: 0,
      background: 'none',
      cursor: 'pointer',
      color: 'var(--text-tertiary)',
      fontSize: 14,
      padding: 2
    }
  }, "\xD7")))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6,
      alignItems: 'flex-end'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement(Select, {
    label: "Agregar por tipo",
    options: TIPOS.map(t => ({
      value: t.id,
      label: t.label
    })),
    value: tipoAAgregar,
    onChange: setTipoAAgregar
  })), /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    style: {
      width: 'auto',
      whiteSpace: 'nowrap'
    },
    onClick: agregarBloque
  }, "Agregar")), /*#__PURE__*/React.createElement("div", {
    style: note
  }, "Se pueden repetir tipos \u2014 un bloque por cada uno. Menos bloques, corrida m\xE1s corta: el techo es de 350 s.")) : /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 2
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: sectionLabel
  }, "Secciones que entran en la corrida"), informe.secciones.map(s => /*#__PURE__*/React.createElement(Checkbox, {
    key: s.id,
    id: 'sec-' + s.id,
    label: s.label,
    sublabel: s.sub,
    checked: secciones.has(s.id),
    onChange: on => toggleSeccion(s.id, on)
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      ...note,
      marginTop: 4
    }
  }, "Sacar una acorta la corrida \u2014 el techo es de 350 s.")), /*#__PURE__*/React.createElement(Checkbox, {
    id: "raya",
    label: "Los huecos se ven como \xAB\u2014\xBB",
    checked: raya,
    onChange: setRaya
  }), /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    disabled: esCustom && bloques.length === 0,
    onClick: generar
  }, "Generar informe"))) : estado === 'generando' ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 14,
      marginTop: 8
    }
  }, /*#__PURE__*/React.createElement(ProgressTimer, {
    elapsedSeconds: elapsed,
    stage: elapsed < 3 ? 'Copiando la plantilla' : 'Resolviendo marcadores'
  }), /*#__PURE__*/React.createElement("div", {
    style: note
  }, "Una corrida completa tarda entre 120 y 320 s: copia la plantilla, expande las secciones y resuelve cada marcador."), /*#__PURE__*/React.createElement("div", {
    style: {
      ...note,
      borderTop: '1px solid var(--border-subtle)',
      paddingTop: 10
    }
  }, "Si se cierra esta ventana la corrida sigue en el servidor. Al volver a abrir el panel, va a aparecer en \xABCorridas\xBB cuando termine.")) : estado === 'fallo' ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(Alert, {
    kind: "error",
    title: "No se pudo generar el informe."
  }, "No se resolvi\xF3 ning\xFAn marcador cableado para \xAB", nombreInforme, "\xBB \u2014 no hay nada para copiar en la plantilla."), /*#__PURE__*/React.createElement("div", {
    style: note
  }, "No se gener\xF3 ning\xFAn deck ni qued\xF3 registrada una corrida cerrada."), /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    onClick: () => setEstado('form')
  }, "Volver")) : /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 14
    }
  }, /*#__PURE__*/React.createElement(DeckLinkCard, {
    name: nombreInforme + ' · muestra',
    href: "#",
    meta: "Per\xEDodo de muestra \xB7 corrida 2026-08-12_0001"
  }), /*#__PURE__*/React.createElement(Alert, {
    kind: "warning"
  }, "Corte por tiempo en la etapa de secciones a los 340 s. El deck es v\xE1lido pero est\xE1 incompleto."), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(StatRow, {
    label: "Tokens distintos en el deck",
    value: 159
  }), /*#__PURE__*/React.createElement(StatRow, {
    label: "Impresiones con valor",
    unit: "token \xD7 l\xE1mina",
    value: 2480
  }), /*#__PURE__*/React.createElement(StatRow, {
    label: "Filas en FALTANTES",
    unit: "una por token y por \xEDtem",
    value: 207
  })), /*#__PURE__*/React.createElement("div", {
    style: note
  }, "En el deck los huecos se imprimieron como ", /*#__PURE__*/React.createElement("b", null, raya ? '«—»' : '«FALTA:token»'), ". Tard\xF3 340 s de un techo de 350 s \u2014 al filo: la pr\xF3xima corrida puede cortar."), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      ...sectionLabel,
      marginBottom: 4
    }
  }, "Secciones repetibles"), esCustom ? bloquesResueltos.map(b => /*#__PURE__*/React.createElement(StatusDot, {
    key: b.key,
    status: "ok",
    label: b.label,
    note: "emitido(s) de muestra"
  })) : informe.secciones.map(s => secciones.has(s.id) ? /*#__PURE__*/React.createElement(StatusDot, {
    key: s.id,
    status: "ok",
    label: s.label,
    note: "emitido(s) de muestra"
  }) : /*#__PURE__*/React.createElement(StatusDot, {
    key: s.id,
    status: "omitted",
    label: s.label,
    note: "fuera de esta corrida"
  }))), pendientes > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--surface-sunken)',
      borderRadius: 'var(--radius-md)',
      padding: '12px 14px',
      display: 'flex',
      flexDirection: 'column',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--text-xs)',
      color: 'var(--text-primary)',
      lineHeight: 'var(--line-normal)'
    }
  }, pendientes, " encuentros no se pudieron ligar a una campa\xF1a con confianza suficiente. No salieron en este informe."), /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    onClick: () => setTab('anclajes')
  }, "Revisar y confirmar")), /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    onClick: () => setEstado('form')
  }, "Generar otro")), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 'auto',
      paddingTop: 14
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/brand/ba-banner.png",
    alt: "",
    style: {
      width: 'calc(100% + 36px)',
      marginLeft: -18,
      marginBottom: -18,
      display: 'block',
      borderBottomLeftRadius: 'var(--radius-lg, 12px)',
      borderBottomRightRadius: 'var(--radius-lg, 12px)'
    }
  })));
}
ReactDOM.createRoot(document.getElementById('root')).render(/*#__PURE__*/React.createElement(App, null));
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/panel/PanelApp.jsx", error: String((e && e.message) || e) }); }

__ds_ns.DeckLinkCard = __ds_scope.DeckLinkCard;

__ds_ns.RunHistoryItem = __ds_scope.RunHistoryItem;

__ds_ns.StatRow = __ds_scope.StatRow;

__ds_ns.Alert = __ds_scope.Alert;

__ds_ns.ProgressTimer = __ds_scope.ProgressTimer;

__ds_ns.StatusDot = __ds_scope.StatusDot;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.Checkbox = __ds_scope.Checkbox;

__ds_ns.Select = __ds_scope.Select;

})();
