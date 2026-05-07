import { useApp } from '../context/AppContext';

function SbItem({ icon, label, active, onClick, badge, badgeColor = 'blue' }) {
  const badgeStyles = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    amber: 'bg-amber-50 text-amber-600 border-amber-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
  };
  return (
    <div
      onClick={onClick}
      className={`relative flex items-center gap-2 px-3 py-2 mx-2 rounded-lg text-[12.5px] font-medium cursor-pointer transition-all ${
        active ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-700'
      }`}
    >
      {active && <span className="absolute -left-2 top-1/2 -translate-y-1/2 w-0.5 h-[18px] bg-blue-600 rounded-r" />}
      <span className="w-4 text-center text-[13px]">{icon}</span>
      {label}
      {badge !== undefined && (
        <span className={`ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full border ${badgeStyles[badgeColor]}`}>{badge}</span>
      )}
    </div>
  );
}

export default function Sidebar({ statusCounts }) {
  const { currentScreen, navigateTo, currentJIR, toast, jirs } = useApp();

  const counts = {
    Open: jirs.filter((j) => j.status === 'Open').length,
    'In Progress': jirs.filter((j) => j.status === 'In Progress').length,
    Submitted: jirs.filter((j) => j.status === 'Submitted').length,
    Approved: jirs.filter((j) => j.status === 'Approved').length,
  };

  return (
    <aside className="w-[214px] min-w-[214px] bg-white border-r border-slate-200 py-3.5 sticky top-[54px] h-[calc(100vh-54px)] overflow-y-auto">
      <div className="text-[9.5px] font-bold tracking-widest text-slate-400 uppercase px-4 pt-3 pb-1">Inspection</div>
      <SbItem icon="📋" label="JIR Listing" active={currentScreen === 'content'} onClick={() => navigateTo('content')} />
      <SbItem icon="🔬" label="Inspection" active={currentScreen === 'inspection'}
        onClick={() => currentJIR ? navigateTo('inspection') : toast('Select a JIR first', 'warn')} />

      <div className="text-[9.5px] font-bold tracking-widest text-slate-400 uppercase px-4 pt-4 pb-1">Status Filter</div>
      <SbItem icon="🔵" label="Open" onClick={() => navigateTo('content')} badge={counts['Open']} badgeColor="blue" />
      <SbItem icon="🟡" label="In Progress" onClick={() => navigateTo('content')} badge={counts['In Progress']} badgeColor="amber" />
      <SbItem icon="🟣" label="Submitted" onClick={() => navigateTo('content')} badge={counts['Submitted']} badgeColor="purple" />
      <SbItem icon="🟢" label="Approved" onClick={() => navigateTo('content')} badge={counts['Approved']} badgeColor="green" />

      <div className="text-[9.5px] font-bold tracking-widest text-slate-400 uppercase px-4 pt-4 pb-1">Master Data</div>
      <SbItem icon="📏" label="Spec Table" active={currentScreen === 'specmaster'} onClick={() => navigateTo('specmaster')} />
      <SbItem icon="📦" label="Item Master" active={currentScreen === 'itemmaster'} onClick={() => navigateTo('itemmaster')} />
      <SbItem icon="🚚" label="Vendor List" active={currentScreen === 'vendors'} onClick={() => navigateTo('vendors')} />

      <div className="text-[9.5px] font-bold tracking-widest text-slate-400 uppercase px-4 pt-4 pb-1">Reports</div>
      <SbItem icon="📊" label="Analytics" active={currentScreen === 'analytics'} onClick={() => navigateTo('analytics')} />
      <SbItem icon="📤" label="Export Reports" onClick={() => {}} />
    </aside>
  );
}