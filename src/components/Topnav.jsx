import { useApp } from '../context/AppContext';

const NAV_ITEMS = [
  { id: 'content', label: 'JIR List', icon: '📋' },
  { id: 'inspection', label: 'Inspect', icon: '🔬', requiresJIR: true },
  { id: 'specmaster', label: 'Spec', icon: '📖' },
  { id: 'itemmaster', label: 'Items', icon: '📦' },
  { id: 'vendors', label: 'Vendors', icon: '🚚' },
  { id: 'analytics', label: 'Analytics', icon: '📊' },
];

export default function TopNav() {
  const { role, toggleRole, navigateTo, currentScreen, currentJIR, toast } = useApp();
  const isInspector = role === 'inspector';

  return (
    <nav className="flex items-center justify-between px-5 h-[54px] bg-white border-b border-slate-200 sticky top-0 z-[500] shadow-sm">
      {/* Brand */}
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-white font-extrabold text-sm font-mono">Q</div>
        <div>
          <div className="font-extrabold text-sm tracking-tight">QMAS — JIR System</div>
          <div className="text-[10px] text-slate-400 font-mono">Quality Management Automation System</div>
        </div>
      </div>

      {/* Nav buttons */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="bg-amber-50 border border-amber-200 text-amber-600 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
          ⚡ DEMO
        </span>
        <span className="font-mono text-[11px] text-slate-400 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-md flex items-center gap-1">
          🏭 Sanjan
        </span>

        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              if (item.requiresJIR && !currentJIR) { toast('Select a JIR first', 'warn'); return; }
              navigateTo(item.id, item.id === 'inspection' && currentJIR ? currentJIR.jirNo : undefined);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11.5px] font-semibold border transition-all ${
              currentScreen === item.id
                ? 'bg-blue-50 border-blue-200 text-blue-600'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600'
            }`}
          >
            <span className="text-xs">{item.icon}</span> {item.label}
          </button>
        ))}

        {/* Role toggle */}
        <button
          onClick={toggleRole}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11.5px] font-semibold border cursor-pointer select-none transition-all ${
            isInspector ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-amber-50 text-amber-600 border-amber-200'
          }`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${isInspector ? 'bg-blue-500' : 'bg-amber-400 rdot-pulse'}`} />
          🛡️ {isInspector ? 'IQC Inspector' : 'IQC Approver'}
        </button>
      </div>
    </nav>
  );
}