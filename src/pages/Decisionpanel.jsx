import { useState } from 'react';
import { PRIMARY_DECISIONS, HOLD_DECISIONS, HOLD_TO_DECISION_NAME } from '../data/decisions';
import { hasNOKAny } from '../utils/helpers';

export default function DecisionPanel({ jir, locked, onDecisionChange }) {
  const [selPrimary, setSelPrimary] = useState(() => {
    if (!jir.decision) return null;
    if (jir.decision === 'Fully Accepted') return 'accepted';
    if (jir.decision === 'Rejected') return 'rejected';
    return 'hold';
  });
  const [selHold, setSelHold] = useState(() => {
    if (!jir.decision) return null;
    const hd = HOLD_DECISIONS.find(d => d.name === jir.decision);
    return hd ? hd.id : null;
  });
  const [scmSent, setScmSent] = useState(false);
  const [devNote, setDevNote] = useState(null);
  const [reworkQty, setReworkQty] = useState('');
  const [acceptedQty, setAcceptedQty] = useState('');
  const [conformQty, setConformQty] = useState('');
  const [nonConformQty, setNonConformQty] = useState('');

  const hasNOK = hasNOKAny(jir);

  const handlePrimary = (id) => {
    if (locked) return;
    const newPrimary = id;
    const newHold = id !== 'hold' ? null : selHold;
    setSelPrimary(newPrimary);
    if (id !== 'hold') { setSelHold(null); setScmSent(false); setDevNote(null); }
    const decName = id === 'accepted' ? 'Fully Accepted' : id === 'rejected' ? 'Rejected' : null;
    onDecisionChange?.({ selPrimary: newPrimary, selHold: newHold, scmSent, devNote, canSubmit: id !== 'hold' });
  };

  const handleHold = (id) => {
    if (locked) return;
    setSelHold(id); setScmSent(false); setDevNote(null);
    onDecisionChange?.({ selPrimary, selHold: id, scmSent: false, devNote: null, canSubmit: false });
  };

  const handleSendEmail = () => {
    setScmSent(true);
    onDecisionChange?.({ selPrimary, selHold, scmSent: true, devNote, canSubmit: false });
  };

  const handleUploadNote = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setDevNote(file.name);
    onDecisionChange?.({ selPrimary, selHold, scmSent: true, devNote: file.name, canSubmit: true });
  };

  const getDecisionName = () => {
    if (selPrimary === 'accepted') return 'Fully Accepted';
    if (selPrimary === 'rejected') return 'Rejected';
    if (selHold) return HOLD_TO_DECISION_NAME[selHold];
    return null;
  };

  const canSubmit = () => {
    if (!selPrimary) return false;
    if (selPrimary === 'accepted' || selPrimary === 'rejected') return true;
    if (selPrimary === 'hold') return !!(selHold && scmSent && devNote);
    return false;
  };

  const holdDec = selHold ? HOLD_DECISIONS.find(d => d.id === selHold) : null;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 mb-4 shadow-sm">
      <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-slate-600 mb-3">
        <span className="text-blue-600">⚖</span> Final Decision
        <span className="flex-1 h-px bg-slate-100" />
      </div>

      {hasNOK && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-4 text-[11.5px] text-red-600">
          ⚠ <strong>NOK rows detected.</strong>&nbsp;One or more tests failed — select the appropriate decision.
        </div>
      )}

      <p className="text-[11px] text-slate-400 font-semibold mb-2 tracking-wide">SELECT PRIMARY OUTCOME</p>

      {/* Level 1 */}
      <div className="flex flex-wrap gap-2.5 mb-0">
        {PRIMARY_DECISIONS.map((d) => {
          const isSel = selPrimary === d.id;
          const borderColor = isSel ? (d.id === 'accepted' ? '#059669' : d.id === 'rejected' ? '#dc2626' : '#f59e0b') : '#e2e8f0';
          const bgColor = isSel ? (d.id === 'accepted' ? '#ecfdf5' : d.id === 'rejected' ? '#fef2f2' : '#fffbeb') : '#f8fafc';
          return (
            <div
              key={d.id}
              onClick={() => handlePrimary(d.id)}
              className={`relative flex-1 min-w-[140px] flex items-center gap-2.5 p-3.5 rounded-xl border-2 transition-all ${locked ? 'opacity-70 cursor-default' : 'cursor-pointer hover:-translate-y-0.5 hover:shadow-md'}`}
              style={{ borderColor, background: bgColor }}
            >
              <span className="text-2xl">{d.icon}</span>
              <div className="flex-1">
                <div className="text-[13px] font-bold">{d.name}</div>
                <div className="text-[10.5px] text-slate-400 mt-0.5 leading-tight">{d.desc}</div>
              </div>
              {d.hasSubLevel && <span className="absolute top-2 right-2 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-200">Sub-options ›</span>}
              <div className="w-4 h-4 rounded-full border-2 flex items-center justify-center ml-auto" style={{ borderColor: isSel ? borderColor : '#cbd5e1' }}>
                {isSel && <div className="w-2 h-2 rounded-full" style={{ background: borderColor }} />}
              </div>
            </div>
          );
        })}
      </div>

      {/* Level 2: Hold sub-options */}
      {selPrimary === 'hold' && (
        <div className="slide-down mt-4">
          <div className="flex items-center gap-2 px-3.5 py-2.5 bg-amber-50 border border-amber-200 rounded-t-xl text-[11.5px] font-bold text-amber-600">
            ⏸ HOLD — Select Disposition &amp; Complete Workflow
          </div>
          <div className="border border-amber-200 border-t-0 rounded-b-xl p-3.5 bg-amber-50/30">
            {/* Steps */}
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              {[
                { label: 'Select Hold Type', done: !!selHold, active: !selHold },
                { label: 'Email SCM', done: scmSent, active: !!selHold && !scmSent },
                { label: 'Upload Note', done: !!devNote, active: scmSent && !devNote },
                { label: 'Submit', done: false, active: !!(selHold && scmSent && devNote) },
              ].map((s, i) => (
                <span key={i} className="flex items-center gap-1.5">
                  {i > 0 && <span className="text-slate-300 text-xs">›</span>}
                  <span className={`flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full border ${s.done ? 'bg-green-50 border-green-200 text-green-600' : s.active ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
                    {s.done ? '✓' : i + 1} {s.label}
                  </span>
                </span>
              ))}
            </div>

            {/* Hold sub-options */}
            <div className="flex flex-wrap gap-2 mb-3">
              {HOLD_DECISIONS.map((d) => {
                const isSel = selHold === d.id;
                const borderColor = isSel ? d.color : '#e2e8f0';
                const bgColor = isSel ? (d.id === 'rework' ? '#fffbeb' : d.id === 'segregation' ? '#fff7ed' : '#f5f3ff') : '#fff';
                return (
                  <div key={d.id} onClick={() => handleHold(d.id)}
                    className={`flex-1 min-w-[130px] flex items-center gap-2 px-3.5 py-3 rounded-xl border-2 transition-all ${locked ? 'opacity-70 cursor-default' : 'cursor-pointer hover:-translate-y-0.5'}`}
                    style={{ borderColor, background: bgColor }}>
                    <span className="text-lg">{d.icon}</span>
                    <div className="flex-1">
                      <div className="text-[12px] font-bold">{d.name}</div>
                      <div className="text-[10.5px] text-slate-400 mt-0.5 leading-tight">{d.desc}</div>
                    </div>
                    <div className="w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center" style={{ borderColor: isSel ? d.color : '#cbd5e1' }}>
                      {isSel && <div className="w-1.5 h-1.5 rounded-full" style={{ background: d.color }} />}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Qty boxes */}
            {selHold === 'rework' && (
              <div className="fade-in flex flex-wrap gap-4 p-3.5 rounded-xl bg-amber-50 border border-amber-200 mb-3">
                <div>
                  <label className="text-[10.5px] font-bold text-amber-600 uppercase mb-1 block">🔧 Rework Qty</label>
                  <input type="number" value={reworkQty} onChange={e => setReworkQty(e.target.value)} className="w-32 bg-white border-2 border-amber-200 rounded-lg px-3 py-1.5 font-mono text-[13px] font-bold text-amber-600 outline-none focus:border-amber-400" placeholder="0" />
                  <div className="text-[10.5px] text-slate-400 mt-1">Units requiring rework</div>
                </div>
                <div>
                  <label className="text-[10.5px] font-bold text-amber-600 uppercase mb-1 block">✓ Accepted Qty</label>
                  <input type="number" value={acceptedQty} onChange={e => setAcceptedQty(e.target.value)} className="w-32 bg-white border-2 border-amber-200 rounded-lg px-3 py-1.5 font-mono text-[13px] font-bold text-amber-600 outline-none focus:border-amber-400" placeholder="0" />
                  <div className="text-[10.5px] text-slate-400 mt-1">Units without rework</div>
                </div>
                <div className="flex items-end">
                  <div className="bg-white/60 border border-amber-200/60 rounded-lg px-3 py-2 text-[11.5px]">
                    Total: <strong className="font-mono">{jir.qty}</strong> | Rework: <strong className="text-amber-600">{reworkQty || 0}</strong> | Accepted: <strong className="text-green-600">{acceptedQty || 0}</strong>
                    {(parseInt(reworkQty || 0) + parseInt(acceptedQty || 0)) > jir.qty && <span className="text-red-600 font-bold ml-2">⚠ Exceeds GRN!</span>}
                  </div>
                </div>
              </div>
            )}
            {selHold === 'segregation' && (
              <div className="fade-in flex flex-wrap gap-4 p-3.5 rounded-xl bg-orange-50 border border-orange-200 mb-3">
                <div>
                  <label className="text-[10.5px] font-bold text-orange-600 uppercase mb-1 block">✓ Conforming Qty</label>
                  <input type="number" value={conformQty} onChange={e => setConformQty(e.target.value)} className="w-32 bg-white border-2 border-orange-200 rounded-lg px-3 py-1.5 font-mono text-[13px] font-bold text-orange-600 outline-none" placeholder="0" />
                </div>
                <div>
                  <label className="text-[10.5px] font-bold text-orange-600 uppercase mb-1 block">✕ Non-Conforming Qty</label>
                  <input type="number" value={nonConformQty} onChange={e => setNonConformQty(e.target.value)} className="w-32 bg-white border-2 border-orange-200 rounded-lg px-3 py-1.5 font-mono text-[13px] font-bold text-orange-600 outline-none" placeholder="0" />
                </div>
              </div>
            )}

            {/* SCM Email */}
            {selHold && (
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm mb-3">
                <div className="flex items-center justify-between px-4 py-2.5 bg-blue-50 border-b border-blue-200">
                  <div className="text-[12px] font-bold text-blue-600 flex items-center gap-2">✉ SCM Notification Email</div>
                  {scmSent && <span className="flex items-center gap-1.5 bg-green-50 border border-green-200 text-green-600 text-[11.5px] font-bold px-3 py-1 rounded-lg">✓ Sent to SCM</span>}
                  {!scmSent && <span className="text-[10.5px] text-blue-500 font-semibold">Preview before sending</span>}
                </div>
                <div className="p-4 text-[12px] text-slate-600 leading-relaxed bg-[#fafcff]">
                  <div className="grid grid-cols-[50px_1fr] gap-1 mb-3 text-[11.5px]">
                    <span className="font-bold text-slate-400">To:</span><span>scm-team@company.in; quality-head@company.in</span>
                    <span className="font-bold text-slate-400">Subject:</span>
                    <span className="font-semibold">[HOLD — {holdDec?.name}] {jir.jirNo} | {jir.itemName.substring(0, 40)}</span>
                  </div>
                  <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 text-[11.5px] leading-relaxed">
                    Dear SCM Team,<br /><br />
                    JIR <strong>{jir.jirNo}</strong> is on <strong>HOLD</strong> — disposition: <strong>{holdDec?.name}</strong>.<br />
                    <strong>Item:</strong> {jir.itemCode} — {jir.itemName}<br />
                    <strong>Vendor:</strong> {jir.vendor} | <strong>Qty:</strong> {jir.qty} {jir.uom}
                  </div>
                </div>
                {!scmSent && (
                  <div className="px-4 py-3 border-t border-slate-100 flex justify-end">
                    <button onClick={handleSendEmail} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-[12px] font-bold hover:bg-blue-700 hover:-translate-y-0.5 transition-all shadow">
                      ✉ Send Email to SCM
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Upload deviation note */}
            {scmSent && selHold && (
              <div className={`p-4 rounded-xl border-2 border-dashed transition-all ${devNote ? 'bg-green-50 border-green-300' : 'bg-slate-50 border-slate-200'}`}>
                <div className="text-[11.5px] font-bold text-slate-600 mb-2">
                  📎 Upload {selHold === 'deviation' ? 'Deviation Note' : 'SCM Clearance Note'}
                </div>
                <div className="text-[11.5px] text-slate-400 mb-3">
                  {selHold === 'deviation' ? 'Upload the SCM deviation approval note to proceed.' : 'Upload the clearance note from SCM before submitting.'}
                </div>
                {devNote ? (
                  <div className="flex items-center gap-2 text-green-600 font-semibold text-[12px]">
                    ✅ {devNote} — uploaded successfully
                  </div>
                ) : (
                  <label className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg cursor-pointer hover:border-blue-300 hover:bg-blue-50 text-[12.5px] font-semibold transition-all">
                    📁 Browse &amp; Upload Note
                    <input type="file" accept=".pdf,.jpg,.png,.docx" className="hidden" onChange={handleUploadNote} />
                  </label>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Summary */}
      {(selPrimary && (selPrimary !== 'hold' || (selHold && scmSent && devNote))) && (
        <div className="mt-4 flex items-center gap-2 text-[12px] font-semibold text-slate-600">
          <span>Final Decision:</span>
          <span className="px-3 py-1 rounded-full border font-bold text-[11px]"
            style={{ background: selPrimary === 'accepted' ? '#ecfdf5' : selPrimary === 'rejected' ? '#fef2f2' : '#fffbeb',
                     color: selPrimary === 'accepted' ? '#059669' : selPrimary === 'rejected' ? '#dc2626' : '#d97706',
                     borderColor: selPrimary === 'accepted' ? '#a7f3d0' : selPrimary === 'rejected' ? '#fecaca' : '#fde68a' }}>
            {getDecisionName()}
          </span>
        </div>
      )}

      {/* Expose canSubmit for parent */}
      <input type="hidden" id="can-submit" value={canSubmit() ? '1' : '0'} />
    </div>
  );
}