import { useState, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { StatusBadge } from '../components/Badge';
import ObsSection from './Obssection';
import DecisionPanel from './Decisionpanel';
import { ConfirmModal } from '../components/Modal';
import { ageColor, hasNOKAny } from '../utils/helpers';
import { HOLD_TO_DECISION_NAME } from '../data/decisions';

const WF_STEPS = ['SAP Data Pull', 'Filters Applied', 'JIR Created', 'Inspection', 'Submitted', 'Approved'];

function WorkflowStep({ label, state, idx }) {
  const cls = `wf-${state}`;
  return (
    <>
      {idx > 0 && <div className="text-slate-300 text-xs">›</div>}
      <div className="flex flex-col items-center gap-1 min-w-[70px]">
        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10.5px] font-bold border-2 ${cls}`}>
          {state === 'done' ? '✓' : idx + 1}
        </div>
        <div className="text-[8.5px] text-slate-400 text-center max-w-[66px] leading-tight font-medium">{label}</div>
      </div>
    </>
  );
}

export default function Inspection() {
  const { currentJIR, jirs, setJirs, role, navigateTo, toast } = useApp();
  const [decState, setDecState] = useState({ selPrimary: null, selHold: null, scmSent: false, devNote: null, canSubmit: false });
  const [comments, setComments] = useState('');
  const [confirmModal, setConfirmModal] = useState(null);

  if (!currentJIR) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="text-5xl">🔬</div>
        <div className="text-slate-500 font-semibold">No JIR selected. Go back to the listing.</div>
        <button onClick={() => navigateTo('content')} className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold text-sm">← Back to List</button>
      </div>
    );
  }

  const j = currentJIR;
  const locked = j.status === 'Approved';
  const isInspector = role === 'inspector';
  const isApprover = role === 'approver';

  const wfStates = () => {
    const app = j.status === 'Approved', sub = j.status === 'Submitted' || app, inP = j.status === 'In Progress';
    return [
      'done', 'done', 'done',
      inP || (!sub && !app) ? 'active' : 'done',
      sub ? 'done' : inP ? 'active' : 'pending',
      app ? 'done' : sub ? 'active' : 'pending',
    ];
  };

  const updateJirLocal = (updater) => {
    setJirs(prev => prev.map(x => x.jirNo === j.jirNo ? updater(x) : x));
  };

  // ── FIXED: accepts 'wrl' subRow only ──────────────
  const handleObsUpdate = useCallback((secKey, rIdx, subRow, oIdx, val) => {
    if (subRow !== 'wrl') return; // Only handle WRL observations
    updateJirLocal(jir => {
      const updated = { ...jir };
      updated[secKey] = jir[secKey].map((row, ri) => {
        if (ri !== rIdx) return row;
        const obs = [...(row.wrlObservations || [])];
        obs[oIdx] = val === '' ? null : val;
        return { ...row, wrlObservations: obs };
      });
      return updated;
    });
  }, [j.jirNo]);

  const handleFieldUpdate = useCallback((secKey, rIdx, field, val) => {
    updateJirLocal(jir => {
      const updated = { ...jir };
      updated[secKey] = jir[secKey].map((row, ri) => ri === rIdx ? { ...row, [field]: val } : row);
      return updated;
    });
  }, [j.jirNo]);

  const handleDeleteRow = useCallback((secKey, rIdx) => {
    updateJirLocal(jir => ({ ...jir, [secKey]: jir[secKey].filter((_, ri) => ri !== rIdx) }));
  }, [j.jirNo]);

  // ── FIXED: adds a column to wrlObservations only ────
  const handleAddColumn = useCallback((secKey) => {
    updateJirLocal(jir => ({
      ...jir,
      [secKey]: jir[secKey].map(row => ({
        ...row,
        wrlObservations: [...(row.wrlObservations || []), null],
      }))
    }));
  }, [j.jirNo]);

  // ── FIXED: reads from wrlObservations only ─────────────────
  const maxObs = (secKey) => Math.max(3, ...(j[secKey] || []).map(r => (r.wrlObservations || []).length));

  const getDecisionName = () => {
    const { selPrimary, selHold } = decState;
    if (selPrimary === 'accepted') return 'Fully Accepted';
    if (selPrimary === 'rejected') return 'Rejected';
    if (selHold) return HOLD_TO_DECISION_NAME[selHold];
    return null;
  };

  const submitJIR = () => {
    const { selPrimary, selHold, scmSent, devNote, canSubmit } = decState;
    if (!selPrimary) { toast('Please select a primary decision.', 'warn'); return; }
    if (selPrimary === 'hold') {
      if (!selHold) { toast('Please select a Hold disposition.', 'warn'); return; }
      if (!scmSent) { toast('Please send the SCM notification email first.', 'warn'); return; }
      if (!devNote) { toast('Please upload the SCM note before submitting.', 'warn'); return; }
    }
    const decName = getDecisionName();
    setConfirmModal({
      title: 'Submit JIR',
      body: `Submit <strong>${j.jirNo}</strong> with decision: <strong>${decName}</strong>?<br><br>This will lock the JIR and send it for Approver review.`,
      confirmLabel: 'Submit',
      confirmColor: '#2563eb',
      onConfirm: () => {
        updateJirLocal(jir => ({ ...jir, status: 'Submitted', decision: decName }));
        toast(`${j.jirNo} submitted!`, 'success');
        setConfirmModal(null);
      },
    });
  };

  const approveJIR = () => {
    if (!isApprover) { toast('Switch to Approver role to approve.', 'warn'); return; }
    setConfirmModal({
      title: 'Approve JIR',
      body: `Grant final approval to <strong>${j.jirNo}</strong> — Decision: <strong>${j.decision}</strong>?<br><br>This action is final.`,
      confirmLabel: 'Approve',
      confirmColor: '#059669',
      onConfirm: () => {
        updateJirLocal(jir => ({ ...jir, status: 'Approved', initiator: 'S. Joshi' }));
        toast(`${j.jirNo} approved! Workflow complete.`, 'success');
        setConfirmModal(null);
      },
    });
  };

  const wfS = wfStates();
  const canSubmitBtn = decState.canSubmit || (decState.selPrimary && decState.selPrimary !== 'hold');

  return (
    <div>
      <div className="text-[11px] text-slate-400 font-mono mb-2 flex items-center gap-1">
        🏠 QMAS <span className="text-slate-300">›</span>
        <span className="text-blue-600 cursor-pointer hover:underline" onClick={() => navigateTo('content')}>JIR Listing</span>
        <span className="text-slate-300">›</span> <span className="text-blue-600 font-semibold">{j.jirNo}</span>
      </div>
      <div className="mb-5">
        <h1 className="text-xl font-extrabold tracking-tight flex items-center gap-2">🔬 JIR Inspection Page</h1>
        <p className="text-slate-400 text-[12.5px] mt-1">Conduct dimensional, visual & reliability tests — record observations, pass/fail & final decision</p>
      </div>

      {/* Role banner */}
      <div className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border mb-4 text-[12px] ${isInspector ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-amber-50 border-amber-200 text-amber-700'}`}>
        ℹ You are logged in as <strong>{isInspector ? 'IQC Inspector' : 'IQC Initiator/Approver'}</strong> — {isInspector ? 'Fill observations and submit the JIR.' : 'Review submitted JIR and grant final approval.'}
      </div>

      {/* Workflow */}
      <div className="flex items-center bg-white border border-slate-200 rounded-xl px-4 py-3 mb-4 shadow-sm overflow-x-auto gap-1">
        {WF_STEPS.map((label, idx) => <WorkflowStep key={label} label={label} state={wfS[idx]} idx={idx} />)}
      </div>

      {/* JIR Header */}
      <div className="bg-white border border-slate-200 rounded-xl px-5 py-4 mb-4 shadow-sm">
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="text-[9.5px] font-bold uppercase tracking-wider text-slate-400">JIR NUMBER</div>
            <div className="font-mono text-[17px] font-bold text-blue-600">{j.jirNo}</div>
          </div>
          <StatusBadge status={j.status} />
        </div>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(155px,1fr))] gap-2.5">
          {[
            ['Material Code', j.itemCode, true], ['Material Description', j.itemName, false],
            ['Item Group', j.group || '—', true], ['Vendor Code', j.vendorCode, true], ['Vendor Name', j.vendor, false],
            ['GRN Date', j.grnDate, true], ['Qty (Ordered)', `${j.qty.toLocaleString()} ${j.uom}`, false],
            ['Base UOM', j.baseUom, true], ['Sample Level', j.sampleLevel, false],
            ['Sample Size', j.sampleSize, false], ['Invoice No.', j.financeNo, true],
            ['Ageing', `${j.ageHrs} hrs`, false], ['Drawing No.', j.drawingNo, true],
            ['Drawing Rev.', j.drawingRev, false], ['Plant', j.plant, true],
            ['IQC Inspector', j.inspector, false], ['IQC Initiator', j.initiator || '—', false],
          ].map(([lbl, val, mono]) => (
            <div key={lbl} className="flex flex-col gap-0.5 p-2 bg-slate-50 rounded-lg border border-slate-100">
              <div className="text-[9.5px] font-bold uppercase tracking-wide text-slate-400">{lbl}</div>
              <div className={`text-[12.5px] font-semibold ${mono ? 'font-mono text-blue-600 text-[11.5px]' : ''}`}
                style={lbl === 'Ageing' ? { color: ageColor(j.ageHrs) } : {}}>{val}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Observation sections */}
      {[
        { secKey: 'dimSpecs', label: 'Dimensional Test', type: 'Dim' },
        { secKey: 'visSpecs', label: 'Visual Test', type: 'Vis' },
        { secKey: 'relSpecs', label: 'Reliability Test', type: 'Rel' },
      ].map(({ secKey, label, type }) => (
        <ObsSection
          key={secKey}
          secKey={secKey}
          label={label}
          type={type}
          rows={(j[secKey] || []).map(row => ({
            ...row,
            // ── migrate legacy flat `observations` array into wrl shape
            wrlObservations: row.wrlObservations ?? row.observations ?? [],
          }))}
          locked={locked}
          maxObs={maxObs(secKey)}
          onUpdate={(rIdx, subRow, oIdx, val) => handleObsUpdate(secKey, rIdx, subRow, oIdx, val)}
          onUpdateField={(rIdx, field, val) => handleFieldUpdate(secKey, rIdx, field, val)}
          onDelete={(rIdx) => handleDeleteRow(secKey, rIdx)}
          onAddColumn={() => handleAddColumn(secKey)}
        />
      ))}

      {/* Global Comments */}
      <div className="bg-white border border-slate-200 rounded-xl px-4 py-4 mb-4 shadow-sm">
        <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-slate-600 mb-2">
          <span className="text-blue-600">💬</span> Global Comments <span className="flex-1 h-px bg-slate-100" />
        </div>
        <textarea
          value={comments}
          onChange={e => setComments(e.target.value)}
          placeholder="Enter overall remarks / notes for this JIR inspection…"
          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-[12.5px] font-[Plus_Jakarta_Sans] resize-y min-h-[70px] outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-50 transition-all mt-2"
        />
      </div>

      {/* Decision Panel */}
      <DecisionPanel jir={j} locked={locked} onDecisionChange={setDecState} />

      {/* Action Buttons */}
      <div className="flex gap-2.5 mb-5 flex-wrap">
        <button onClick={() => navigateTo('content')} className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-slate-200 text-slate-500 font-bold text-[13px] hover:bg-slate-50 transition-all">
          ← Back to List
        </button>
        <button
          disabled={locked || !canSubmitBtn}
          onClick={submitJIR}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 text-white font-bold text-[13px] hover:bg-blue-700 hover:-translate-y-0.5 transition-all shadow disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
        >
          ✉ {locked || j.status === 'Submitted' ? 'Submitted' : 'Submit JIR'}
        </button>
        <button
          disabled={j.status !== 'Submitted' || !isApprover}
          onClick={approveJIR}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-green-600 text-white font-bold text-[13px] hover:bg-green-700 hover:-translate-y-0.5 transition-all shadow disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
        >
          ✓ {locked ? 'Approved' : 'Approve JIR'}
        </button>
      </div>

      {confirmModal && (
        <ConfirmModal open={true} {...confirmModal} onCancel={() => setConfirmModal(null)} />
      )}
    </div>
  );
}