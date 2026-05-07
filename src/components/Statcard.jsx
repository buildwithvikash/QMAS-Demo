const accentMap = {
  blue: 'bg-blue-600', amber: 'bg-amber-400', purple: 'bg-purple-600',
  green: 'bg-green-600', red: 'bg-red-600', teal: 'bg-cyan-600',
};
const valMap = {
  blue: 'text-blue-600', amber: 'text-amber-400', purple: 'text-purple-600',
  green: 'text-green-600', red: 'text-red-600', teal: 'text-cyan-600',
};

export default function StatCard({ label, value, sub, color = 'blue', icon }) {
  return (
    <div className="relative bg-white border border-slate-200 rounded-xl px-4 py-3 shadow-sm flex-1 min-w-[120px] overflow-hidden">
      <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-xl ${accentMap[color]}`} />
      <div className="text-[10.5px] text-slate-400 font-semibold mb-1 flex items-center gap-1 pl-1">
        {icon && <span className="text-xs">{icon}</span>} {label}
      </div>
      <div className={`text-2xl font-extrabold font-mono pl-1 leading-none ${valMap[color]}`}>{value}</div>
      {sub && <div className="text-[10.5px] text-slate-400 pl-1 mt-1">{sub}</div>}
    </div>
  );
}