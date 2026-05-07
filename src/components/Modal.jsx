import { useEffect } from 'react';

export function ConfirmModal({ open, title, body, confirmLabel, confirmColor, onConfirm, onCancel }) {
  useEffect(() => {
    const handle = (e) => { if (e.key === 'Escape') onCancel?.(); };
    if (open) document.addEventListener('keydown', handle);
    return () => document.removeEventListener('keydown', handle);
  }, [open, onCancel]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-slate-900/30 z-[600] flex items-center justify-center backdrop-blur-sm">
      <div className="modal-in bg-white border border-slate-200 rounded-xl p-6 w-[90%] max-w-[400px] shadow-2xl">
        <div className="text-base font-extrabold mb-2 flex items-center gap-2">
          <span className="text-blue-600">?</span> {title}
        </div>
        <div className="text-[12.5px] text-slate-500 leading-relaxed mb-5" dangerouslySetInnerHTML={{ __html: body }} />
        <div className="flex gap-2 justify-end">
          <button onClick={onCancel} className="px-4 py-2 rounded-lg text-sm text-slate-500 border border-slate-200 hover:bg-slate-50 transition-colors">Cancel</button>
          <button onClick={onConfirm} className="px-4 py-2 rounded-lg text-sm font-bold text-white transition-colors" style={{ background: confirmColor || '#059669' }}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export function FormModal({ open, title, children, onSave, onCancel, saveLabel = 'Save' }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-slate-900/30 z-[600] flex items-center justify-center backdrop-blur-sm">
      <div className="modal-in bg-white border border-slate-200 rounded-xl p-6 w-[92%] max-w-[540px] shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="text-base font-extrabold mb-4 flex items-center gap-2">{title}</div>
        {children}
        <div className="flex gap-2 justify-end pt-3 border-t border-slate-100 mt-4">
          <button onClick={onCancel} className="px-4 py-2 rounded-lg text-sm text-slate-500 border border-slate-200 hover:bg-slate-50 transition-colors">Cancel</button>
          <button onClick={onSave} className="px-4 py-2 rounded-lg text-sm font-bold text-white bg-green-600 hover:bg-green-700 transition-colors">{saveLabel}</button>
        </div>
      </div>
    </div>
  );
}

export function FormGrid({ children }) {
  return <div className="grid grid-cols-2 gap-3 mb-4">{children}</div>;
}

export function FormGroup({ label, full, children }) {
  return (
    <div className={full ? 'col-span-2' : ''}>
      <label className="block text-[10.5px] font-bold uppercase tracking-wide text-slate-400 mb-1">{label}</label>
      {children}
    </div>
  );
}

export function FormInput({ ...props }) {
  return <input {...props} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-[12.5px] font-[Plus_Jakarta_Sans] outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-50 transition-all" />;
}

export function FormSelect({ children, ...props }) {
  return (
    <select {...props} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-[12.5px] font-[Plus_Jakarta_Sans] outline-none focus:border-blue-500 focus:bg-white transition-all">
      {children}
    </select>
  );
}

export function FormTextarea({ ...props }) {
  return <textarea {...props} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-[12.5px] font-[Plus_Jakarta_Sans] outline-none focus:border-blue-500 focus:bg-white resize-y min-h-[60px] transition-all" />;
}