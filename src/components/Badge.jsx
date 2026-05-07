const statusStyles = {
  Open: 'bg-blue-50 border-blue-200 text-blue-700',
  'In Progress': 'bg-amber-50 border-amber-200 text-amber-700',
  Submitted: 'bg-purple-50 border-purple-200 text-purple-700',
  Approved: 'bg-emerald-50 border-emerald-200 text-emerald-700',
  Rejected: 'bg-red-50 border-red-200 text-red-700',
  default: 'bg-slate-50 border-slate-200 text-slate-600',
};

export function StatusBadge({ status }) {
  const style = statusStyles[status] || statusStyles.default;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full border text-[11px] font-semibold ${style}`}>
      <span className="text-xs">{status === 'Approved' ? '✓' : status === 'Rejected' ? '✕' : '●'}</span>
      {status}
    </span>
  );
}

const pillStyles = {
  blue: 'bg-blue-50 border-blue-200 text-blue-700',
  green: 'bg-emerald-50 border-emerald-200 text-emerald-700',
  purple: 'bg-purple-50 border-purple-200 text-purple-700',
  amber: 'bg-amber-50 border-amber-200 text-amber-700',
  slate: 'bg-slate-50 border-slate-200 text-slate-600',
};

export function Pill({ color = 'slate', children }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full border text-[11px] font-semibold ${pillStyles[color] || pillStyles.slate}`}>
      {children}
    </span>
  );
}

const typeStyles = {
  Dim: 'bg-blue-50 border-blue-200 text-blue-700',
  Vis: 'bg-purple-50 border-purple-200 text-purple-700',
  Rel: 'bg-amber-50 border-amber-200 text-amber-700',
};

export function TypeBadge({ type }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full border text-[11px] font-semibold ${typeStyles[type] || pillStyles.slate}`}>
      {type}
    </span>
  );
}
