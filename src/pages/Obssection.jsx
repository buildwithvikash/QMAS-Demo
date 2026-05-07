// ── Spec parser ───────────────────────────────────────────────────────────────
// Supported formats: "25±0.5"  "12-14"  ">=5"  "<=1.6"  ">5"  "<10"  "10"
function parseSpec(spec) {
  if (!spec) return null;
  const s = String(spec).trim();

  let m;
  m = s.match(/^([\d.]+)\s*±\s*([\d.]+)$/);
  if (m) { const c = +m[1], t = +m[2]; return { min: c - t, max: c + t }; }

  m = s.match(/^([\d.]+)\s*[-–]\s*([\d.]+)$/);
  if (m) return { min: +m[1], max: +m[2] };

  m = s.match(/^(?:>=|≥)\s*([\d.]+)$/);
  if (m) return { min: +m[1], max: Infinity };

  m = s.match(/^(?:<=|≤)\s*([\d.]+)$/);
  if (m) return { min: -Infinity, max: +m[1] };

  m = s.match(/^>\s*([\d.]+)$/);
  if (m) return { min: +m[1], max: Infinity };

  m = s.match(/^<\s*([\d.]+)$/);
  if (m) return { min: -Infinity, max: +m[1] };

  m = s.match(/^([\d.]+)$/);
  if (m) { const v = +m[1]; return { min: v, max: v }; }

  return null;
}

/** true = in range | false = out of range | null = indeterminate */
function checkVal(val, spec) {
  const range = parseSpec(spec);
  if (!range) return null;
  const n = parseFloat(val);
  if (isNaN(n)) return null;
  return n >= range.min && n <= range.max;
}

/**
 * Compute average and overall PASS/FAIL across ALL wrl + vendor values.
 * A single out-of-range value → FAIL.
 */
function computeResult(wrlObs = [], vendorObs = [], spec) {
  const all = [...wrlObs, ...vendorObs].filter((v) => v !== '' && v != null);
  if (!all.length) return { result: '—', ok: null };

  const checks = all.map((v) => checkVal(v, spec)).filter((c) => c !== null);
  if (!checks.length) return { result: '—', ok: null };

  const ok  = checks.every(Boolean);
  const avg = (all.reduce((s, v) => s + parseFloat(v), 0) / all.length).toFixed(2);
  return { result: avg, ok };
}

// ── ObsCell ───────────────────────────────────────────────────────────────────
function ObsCell({ val, spec, isDim, locked, onChange }) {
  const ok = isDim ? checkVal(val, spec) : null;

  if (locked) {
    return (
      <span
        className={`font-mono text-[11.5px] ${
          ok === false ? 'text-red-600 font-bold'
          : ok === true ? 'text-green-700'
          : 'text-slate-400'
        }`}
      >
        {val !== '' && val != null ? val : '—'}
      </span>
    );
  }

  return (
    <input
      type={isDim ? 'number' : 'text'}
      inputMode={isDim ? 'decimal' : 'text'}
      step="0.01"
      value={val ?? ''}
      placeholder={isDim ? '0.00' : 'txt'}
      autoComplete="off"
      tabIndex={0}
      onFocus={(e) => e.currentTarget.select()}
      onChange={(e) => onChange(e.target.value)}
      className={`w-16 border rounded px-1.5 py-1 text-center font-mono text-[11.5px] outline-none transition-all bg-slate-50 border-slate-200 focus:border-blue-400 focus:bg-white pointer-events-auto ${
        ok === false ? 'text-red-600 font-bold'
        : ok === true ? 'text-green-700'
        : 'text-slate-700'
      }`}
    />
  );
}

// ── ObsRow ────────────────────────────────────────────────────────────────────
/**
 * Renders TWO <tr> elements — WRL and Vendor — inside a React fragment.
 *
 * Shared columns (Sr → Place, Avg, Result, Doc, Remark, Delete)
 * use rowSpan={2} and are rendered only in the first (WRL) row.
 *
 * onUpdate(rIdx, subRow, oIdx, value)
 *   subRow: 'wrl' | 'vendor'
 *
 * Row shape expected:
 *   { checkpoint, spec, uom, instrument, frequency, place,
 *     wrlObservations: string[],    // length === maxObs
 *     vendorObservations: string[], // length === maxObs
 *     remark, docFile }
 */
function ObsRow({ row, rIdx, isDim, locked, maxObs, onUpdate, onUpdateField, onDelete, canDelete }) {
  const wrlObs = Array.from({ length: maxObs }, (_, idx) => row.wrlObservations?.[idx] ?? '');
  const vendorObs = Array.from({ length: maxObs }, (_, idx) => row.vendorObservations?.[idx] ?? '');
  const wrlResult = computeResult(wrlObs, [], row.spec);
  const vendorResult = computeResult([], vendorObs, row.spec);
  const isObservationLocked = (oIdx) => locked && oIdx >= 3;

  const sharedLeft = (
    <>
      <td rowSpan={2} className="px-3 py-2 font-mono text-[11px] text-slate-400 align-middle">{rIdx + 1}</td>
      <td rowSpan={2} className="px-3 py-2 font-semibold text-[12.5px] whitespace-nowrap align-middle text-slate-800">{row.checkpoint}</td>
      <td rowSpan={2} className="px-3 py-2 font-mono text-[11.5px] text-amber-600 font-bold whitespace-nowrap align-middle">{row.spec}</td>
      <td rowSpan={2} className="px-3 py-2 text-slate-400 text-[11.5px] align-middle">{row.uom}</td>
      <td rowSpan={2} className="px-3 py-2 text-slate-500 text-[11.5px] align-middle">{row.instrument || '—'}</td>
      <td rowSpan={2} className="px-3 py-2 font-mono text-[10.5px] text-slate-400 align-middle">{row.frequency}</td>
      <td rowSpan={2} className="px-3 py-2 text-[11.5px] text-slate-400 align-middle">{row.place}</td>
    </>
  );

  const sharedRight = (
    <>
      {/* Doc upload */}
      <td rowSpan={2} className="px-3 py-2 align-middle">
        {locked ? (
          <span className="text-[10.5px] text-slate-400">{row.docFile ? `✅ ${row.docFile}` : '—'}</span>
        ) : (
          <label className="inline-flex items-center gap-1 px-2 py-1 rounded bg-slate-50 border border-slate-200 text-[10.5px] text-slate-500 cursor-pointer hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all">
            ⬆ Upload
            <input
              type="file" accept=".pdf,.jpg,.png" className="hidden"
              onChange={(e) => { if (e.target.files[0]) onUpdateField(rIdx, 'docFile', e.target.files[0].name); }}
            />
          </label>
        )}
      </td>

      {/* Remark */}
      <td rowSpan={2} className="px-3 py-2 align-middle">
        {locked ? (
          <span className="text-[11.5px] text-slate-400">{row.remark || '—'}</span>
        ) : (
          <input
            value={row.remark || ''}
            onChange={(e) => onUpdateField(rIdx, 'remark', e.target.value)}
            placeholder="Remark…"
            className="bg-slate-50 border border-slate-200 rounded px-2 py-1 text-[12px] w-28 outline-none focus:border-blue-400 transition-all text-slate-700"
          />
        )}
      </td>

      {/* Delete */}
      <td rowSpan={2} className="px-3 py-2 align-middle">
        {!locked && canDelete && (
          <button
            onClick={() => onDelete(rIdx)}
            className="w-6 h-6 rounded bg-red-50 border border-red-200 text-red-500 hover:bg-red-500 hover:text-white transition-all text-xs flex items-center justify-center"
          >–</button>
        )}
      </td>
    </>
  );

  return (
    <>
      {/* ── WRL row ──────────────────────────────────────────────────────── */}
      <tr className="border-b border-slate-100 hover:bg-slate-50/40 transition-colors">
        {sharedLeft}
        <td className="px-3 py-1.5 bg-blue-50 border-r border-blue-100">
          <span className="text-[10.5px] font-bold text-blue-700">WRL</span>
        </td>
        {Array.from({ length: maxObs }, (_, oIdx) => (
          <td key={oIdx} className="px-2 py-1.5">
            <ObsCell
              val={wrlObs[oIdx]}
              spec={row.spec}
              isDim={isDim}
              locked={isObservationLocked(oIdx)}
              onChange={(v) => onUpdate(rIdx, 'wrl', oIdx, v)}
            />
          </td>
        ))}
        <td className="px-3 py-2 align-middle">
          {wrlResult.result === '—'
            ? <span className="text-slate-300 text-[11.5px]">—</span>
            : <span className={`font-mono text-[11.5px] font-bold ${wrlResult.ok === false ? 'text-red-600' : 'text-green-600'}`}>{wrlResult.result}</span>}
        </td>
        <td className="px-3 py-2 align-middle">
          {wrlResult.ok === null
            ? <span className="text-slate-300 text-[11.5px]">—</span>
            : wrlResult.ok
            ? <span className="inline-block text-[11px] font-bold text-green-700 bg-green-50 border border-green-300 px-2 py-0.5 rounded">✓ PASS</span>
            : <span className="inline-block text-[11px] font-bold text-red-700 bg-red-50 border border-red-300 px-2 py-0.5 rounded">✕ FAIL</span>}
        </td>
        {sharedRight}
      </tr>

      {/* ── Vendor row ───────────────────────────────────────────────────── */}
      <tr className="border-b border-slate-100 last:border-0 hover:bg-slate-50/40 transition-colors">
        <td className="px-3 py-1.5 bg-purple-50 border-r border-purple-100">
          <span className="text-[10.5px] font-bold text-purple-700">Vendor</span>
        </td>
        {Array.from({ length: maxObs }, (_, oIdx) => (
          <td key={oIdx} className="px-2 py-1.5">
            <ObsCell
              val={vendorObs[oIdx]}
              spec={row.spec}
              isDim={isDim}
              locked={isObservationLocked(oIdx)}
              onChange={(v) => onUpdate(rIdx, 'vendor', oIdx, v)}
            />
          </td>
        ))}
        <td className="px-3 py-2 align-middle">
          {vendorResult.result === '—'
            ? <span className="text-slate-300 text-[11.5px]">—</span>
            : <span className={`font-mono text-[11.5px] font-bold ${vendorResult.ok === false ? 'text-red-600' : 'text-green-600'}`}>{vendorResult.result}</span>}
        </td>
        <td className="px-3 py-2 align-middle">
          {vendorResult.ok === null
            ? <span className="text-slate-300 text-[11.5px]">—</span>
            : vendorResult.ok
            ? <span className="inline-block text-[11px] font-bold text-green-700 bg-green-50 border border-green-300 px-2 py-0.5 rounded">✓ PASS</span>
            : <span className="inline-block text-[11px] font-bold text-red-700 bg-red-50 border border-red-300 px-2 py-0.5 rounded">✕ FAIL</span>}
        </td>
      </tr>
    </>
  );
}

// ── Section theme ─────────────────────────────────────────────────────────────
const sectionTheme = {
  Dim: { hdr: 'bg-blue-50 border-blue-200 text-blue-700',       wrap: 'border-blue-200',   addCls: 'border-blue-300 text-blue-600 hover:bg-blue-50',     icon: '📏' },
  Vis: { hdr: 'bg-purple-50 border-purple-200 text-purple-700', wrap: 'border-purple-200', addCls: 'border-purple-300 text-purple-700 hover:bg-purple-50', icon: '👁' },
  Rel: { hdr: 'bg-amber-50 border-amber-200 text-amber-700',    wrap: 'border-amber-200',  addCls: 'border-amber-300 text-amber-600 hover:bg-amber-50',   icon: '⚡' },
};

// ── ObsSection ────────────────────────────────────────────────────────────────
/**
 * Props
 * ─────
 * secKey        string
 * label         string
 * type          'Dim' | 'Vis' | 'Rel'
 * rows          Row[]
 * locked        boolean
 * maxObs        number          current observation column count
 * onUpdate      (rIdx, subRow: 'wrl'|'vendor', oIdx, value) => void
 * onUpdateField (rIdx, field, value) => void
 * onDelete      (rIdx) => void
 * onAddColumn   () => void
 */
export default function ObsSection({
  secKey, label, type, rows, locked, maxObs,
  onUpdate, onUpdateField, onDelete, onAddColumn,
}) {
  const isDim   = type === 'Dim';
  const theme   = sectionTheme[type];
  const obsCols = Array.from({ length: maxObs }, (_, i) => `X${i + 1}`);

  const headers = [
    'Sr', 'Checkpoint', 'Specification', 'UOM',
    'Instrument', 'Frequency', 'Place',
    'Type',       // WRL / Vendor label column
    ...obsCols,
    'Avg', 'Result', 'Doc', 'Remark', '',
  ];

  return (
    <div className="mb-5">
      {/* Section header */}
      <div className={`flex items-center justify-between px-4 py-2.5 rounded-t-lg border ${theme.hdr}`}>
        <span className="text-[12px] font-bold">{theme.icon} {label}</span>
        <span className="text-[10.5px] font-semibold opacity-70">
          {rows.length} checkpoint{rows.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Table */}
      <div className={`border border-t-0 rounded-b-lg overflow-hidden shadow-sm ${theme.wrap}`}>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50">
                {headers.map((h) => (
                  <th
                    key={h}
                    className="px-3 py-2 text-left text-[10.5px] font-bold uppercase tracking-wide text-slate-400 border-b border-slate-100 whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={headers.length} className="text-center text-slate-400 py-6 text-[12px]">
                    No {label} checkpoints.
                  </td>
                </tr>
              ) : (
                rows.map((row, rIdx) => (
                  <ObsRow
                    key={rIdx}
                    row={row}
                    rIdx={rIdx}
                    secKey={secKey}
                    isDim={isDim}
                    locked={locked}
                    maxObs={maxObs}
                    onUpdate={onUpdate}
                    onUpdateField={onUpdateField}
                    onDelete={onDelete}
                    canDelete={rows.length > 1}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        {!locked && (
          <div className={`px-4 py-2.5 border-t ${theme.wrap}`}>
            <button
              onClick={onAddColumn}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-[11.5px] font-bold border-2 border-dashed transition-all ${theme.addCls}`}
            >
              + Add X{maxObs + 1}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
