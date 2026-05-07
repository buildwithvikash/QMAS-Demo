import { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { StatusBadge } from '../components/Badge';
import StatCard from '../components/StatCard';
import { ageColor } from '../utils/helpers';

export default function JIRListing() {
  const { jirs, navigateTo, toast } = useApp();
  const [plant, setPlant] = useState('MH-01');
  const [itemCode, setItemCode] = useState('');
  const [vendor, setVendor] = useState('');
  const [search, setSearch] = useState('');
  const [filtered, setFiltered] = useState(jirs);

  const uniqueItems = useMemo(() => [...new Set(jirs.map((j) => j.itemCode))], [jirs]);

  const applyFilters = () => {
    if (!plant) { toast('Plant Code is required', 'warn'); return; }
    let result = jirs.filter((j) => {
      if (plant && j.plant !== plant) return false;
      if (itemCode && j.itemCode !== itemCode) return false;
      if (vendor && !j.vendorCode.toLowerCase().includes(vendor.toLowerCase())) return false;
      return true;
    });
    setFiltered(result);
    toast(`${result.length} records found`, 'info');
  };

  const resetFilters = () => {
    setPlant('MH-01'); setItemCode(''); setVendor(''); setSearch('');
    setFiltered(jirs); toast('Filters reset', 'info');
  };

  const displayed = search
    ? filtered.filter((j) => [j.jirNo, j.vendor, j.group, j.itemName, j.itemCode, j.vendorCode].some(v => v.toLowerCase().includes(search.toLowerCase())))
    : filtered;

  const counts = { Open: 0, 'In Progress': 0, Submitted: 0, Approved: 0, Rejected: 0 };
  displayed.forEach((j) => { if (counts[j.status] !== undefined) counts[j.status]++; });
  const avg = displayed.length ? Math.round(displayed.reduce((s, j) => s + j.ageHrs, 0) / displayed.length) : 0;

  return (
    <div>
      <div className="text-[11px] text-slate-400 font-mono mb-2 flex items-center gap-1">
        🏠 QMAS <span className="text-slate-300">›</span> <span className="text-blue-600 font-semibold">JIR Listing</span>
      </div>
      <div className="mb-5">
        <h1 className="text-xl font-extrabold tracking-tight flex items-center gap-2">📋 Inward Goods Inspection — JIR Records</h1>
        <p className="text-slate-400 text-[12.5px] mt-1">Filter by Plant, Item Code & Date to load GRN-linked JIR records from SAP via SLO Service</p>
      </div>

      {/* Filter Bar */}
      <div className="flex items-end gap-3 bg-white border border-slate-200 rounded-xl p-3.5 mb-4 shadow-sm flex-wrap">
        <div className="flex flex-col gap-1">
          <label className="text-[10.5px] font-bold uppercase text-slate-400">🏭 Plant Code <span className="text-red-500">*</span></label>
          <select value={plant} onChange={e => setPlant(e.target.value)} className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-[12.5px] outline-none focus:border-blue-500 min-w-[120px]">
            <option value="">Select Plant</option>
            <option value="MH-01">SANJAN</option>
            <option value="PU-02">TADGAM</option>
            <option value="NA-03">SILVASA</option>
            <option value="NA-04">Sahapur</option>
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[10.5px] font-bold uppercase text-slate-400">📦 Item Code</label>
          <select value={itemCode} onChange={e => setItemCode(e.target.value)} className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-[12.5px] outline-none focus:border-blue-500 min-w-[140px]">
            <option value="">All Items</option>
            {uniqueItems.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[10.5px] font-bold uppercase text-slate-400">📅 GRN Date</label>
          <input type="date" defaultValue="2026-05-02" className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-[12.5px] outline-none focus:border-blue-500" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[10.5px] font-bold uppercase text-slate-400">🚚 Vendor Code</label>
          <input value={vendor} onChange={e => setVendor(e.target.value)} placeholder="e.g. V-1042" className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-[12.5px] outline-none focus:border-blue-500 min-w-[110px]" />
        </div>
        <button onClick={applyFilters} className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 text-white text-[12.5px] font-bold self-end hover:bg-blue-700 transition-all hover:-translate-y-0.5 shadow hover:shadow-blue-200">
          🔍 Search
        </button>
        <button onClick={resetFilters} className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 text-slate-500 text-[12.5px] self-end hover:bg-slate-50 transition-all">
          ↺ Reset
        </button>
      </div>

      {/* Stats Row */}
      <div className="flex gap-2.5 mb-4 flex-wrap">
        <StatCard label="Open" value={counts['Open']} sub="Awaiting inspection" color="blue" />
        <StatCard label="In Progress" value={counts['In Progress']} sub="Underway" color="amber" />
        <StatCard label="Submitted" value={counts['Submitted']} sub="Pending approval" color="purple" />
        <StatCard label="Approved" value={counts['Approved']} sub="Completed" color="green" />
        <StatCard label="Rejected" value={counts['Rejected']} sub="Returned to vendor" color="red" />
        <StatCard label="Avg Ageing" value={avg} sub="Hours avg" color="teal" />
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50 rounded-t-xl">
          <div className="text-[13px] font-bold flex items-center gap-2">📊 JIR Records — Plant MH-01</div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">🔍</span>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search JIR, vendor, item…" className="pl-7 pr-3 py-1.5 text-[12.5px] bg-slate-100 border border-slate-200 rounded-lg outline-none focus:border-blue-500 focus:bg-white w-48 transition-all" />
            </div>
            <span className="text-[11.5px] text-slate-400 font-mono">Showing {displayed.length} records</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50">
                {['JIR No.','Vendor','Group','Item','GRN Date','Qty','Base UOM','Invoice No.','Ageing','Inspector','Decider','Decision','Status','Action'].map(h => (
                  <th key={h} className="px-3 py-2.5 text-left text-[10.5px] font-bold uppercase tracking-wide text-slate-400 border-b border-slate-100 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {displayed.length === 0 ? (
                <tr><td colSpan={13} className="text-center text-slate-400 py-8">No JIR records match filters.</td></tr>
              ) : displayed.map((j) => (
                <tr key={j.jirNo} className="hover:bg-slate-50/60 transition-colors border-b border-slate-100 last:border-0">
                  <td className="px-3 py-2.5">
                    <span className="font-mono text-[11.5px] font-bold text-blue-600">📄 {j.jirNo}</span>
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="font-semibold text-[12px]">{j.vendor}</div>
                    <div className="font-mono text-[10px] text-slate-400">{j.vendorCode}</div>
                  </td>
                  <td className="px-3 py-2.5 text-[12px] text-slate-500 font-medium whitespace-nowrap">{j.group || '—'}</td>
                  <td className="px-3 py-2.5 max-w-[160px]">
                    <div className="font-semibold text-[12px] whitespace-normal leading-tight">{j.itemName}</div>
                    <div className="font-mono text-[10px] text-slate-400">{j.itemCode}</div>
                  </td>
                  <td className="px-3 py-2.5 font-mono text-[11.5px] whitespace-nowrap">{j.grnDate}</td>
                  <td className="px-3 py-2.5 font-mono font-bold whitespace-nowrap">{j.qty.toLocaleString()} <span className="text-[10px] text-slate-400">{j.uom}</span></td>
                  <td className="px-3 py-2.5 text-slate-400 text-[12px]">{j.baseUom}</td>
                  <td className="px-3 py-2.5 font-mono text-[11px] text-slate-400">{j.financeNo}</td>
                  <td className="px-3 py-2.5">
                    <span className="font-mono text-[11.5px] font-bold whitespace-nowrap" style={{ color: ageColor(j.ageHrs) }}>⏱ {j.ageHrs}h</span>
                  </td>
                  <td className="px-3 py-2.5 text-[12px] whitespace-nowrap">🛡️ {j.inspector}</td>
                  <td className="px-3 py-2.5 text-[12px] text-slate-400">{j.initiator || '—'}</td>
                  <td className="px-3 py-2.5">
                    {j.decision ? <span className="inline-flex px-2 py-0.5 rounded-xl text-[10px] font-semibold border bg-slate-50 border-slate-200 text-slate-500 whitespace-nowrap">{j.decision}</span> : <span className="text-slate-300">—</span>}
                  </td>
                  <td className="px-3 py-2.5"><StatusBadge status={j.status} /></td>
                  <td className="px-3 py-2.5">
                    <button onClick={() => navigateTo('inspection', j.jirNo)} className="w-7 h-7 rounded-md bg-blue-50 border border-blue-200 text-blue-600 hover:bg-blue-600 hover:text-white transition-all text-xs flex items-center justify-center hover:scale-110">→</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}