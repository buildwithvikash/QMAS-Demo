import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { INITIAL_JIRS } from '../data/jirs';
import { INITIAL_SPECS } from '../data/specs';
import { ITEMS } from '../data/items';
import { VENDORS } from '../data/vendors';
import { deepClone } from '../utils/helpers';

const AppContext = createContext(null);
const SECTION_BY_TEST = { Dim: 'dimSpecs', Vis: 'visSpecs', Rel: 'relSpecs' };

const buildJIRSpecKey = (row) => `${row.type}|${row.checkpoint}|${row.spec}|${row.uom}|${row.instrument}|${row.frequency}|${row.place}`;

const mergeJIRWithSpecs = (jir, specs) => {
  const existingRows = [...(jir.dimSpecs || []), ...(jir.visSpecs || []), ...(jir.relSpecs || [])];
  const existingByKey = existingRows.reduce((acc, row) => {
    acc[buildJIRSpecKey(row)] = row;
    return acc;
  }, {});

  const merged = { ...jir, dimSpecs: [], visSpecs: [], relSpecs: [] };
  const sectionCounters = { dimSpecs: 0, visSpecs: 0, relSpecs: 0 };

  specs.filter((spec) => spec.itemCode === jir.itemCode).forEach((spec) => {
    const section = SECTION_BY_TEST[spec.testName] || 'relSpecs';
    sectionCounters[section] += 1;
    const key = buildJIRSpecKey({
      type: spec.testName,
      checkpoint: spec.checkpoint,
      spec: spec.spec,
      uom: spec.uom,
      instrument: spec.instrument,
      frequency: spec.frequency,
      place: spec.place,
    });
    const existing = existingByKey[key];
    merged[section].push({
      sr: existing?.sr || sectionCounters[section],
      type: spec.testName,
      checkpoint: spec.checkpoint,
      spec: spec.spec,
      uom: spec.uom,
      instrument: spec.instrument,
      frequency: spec.frequency,
      place: spec.place,
      observations: existing?.observations || [null, null, null],
      wrlObservations: existing?.wrlObservations ?? (existing?.observations || [null, null, null]),
      vendorObservations: existing?.vendorObservations || [],
      remark: existing?.remark || '',
      docFile: existing?.docFile || null,
    });
  });

  return merged;
};

export function AppProvider({ children }) {
  const [jirs, setJirs] = useState(deepClone(INITIAL_JIRS));
  const [specs, setSpecs] = useState(deepClone(INITIAL_SPECS));
  const [items, setItems] = useState(deepClone(ITEMS));
  const [vendors, setVendors] = useState(deepClone(VENDORS));
  const [currentScreen, setCurrentScreen] = useState('content');
  const [currentJIRNo, setCurrentJIRNo] = useState(null);
  const [role, setRole] = useState('inspector');
  const [toasts, setToasts] = useState([]);

  const toast = useCallback((msg, type = 'info', dur = 3000) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, msg, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), dur);
  }, []);

  const toggleRole = useCallback(() => {
    setRole((r) => {
      const next = r === 'inspector' ? 'approver' : 'inspector';
      return next;
    });
  }, []);

  const jirsWithSpecs = useMemo(() => {
    return jirs.map((jir) => {
      const item = items.find((it) => it.code === jir.itemCode) || {};
      const itemSpecs = specs.filter((spec) => spec.itemCode === jir.itemCode);
      const merged = itemSpecs.length ? mergeJIRWithSpecs(jir, itemSpecs) : jir;
      return { ...merged, group: merged.group || item.group || '—' };
    });
  }, [jirs, specs, items]);

  const updateJIR = useCallback((jirNo, updater) => {
    setJirs((prev) => prev.map((j) => j.jirNo === jirNo ? { ...j, ...updater(j) } : j));
  }, []);

  const navigateTo = useCallback((screen, jirNo) => {
    if (screen === 'inspection' && jirNo) setCurrentJIRNo(jirNo);
    if (screen === 'content') setCurrentJIRNo(null);
    setCurrentScreen(screen);
  }, []);

  const currentJIR = jirsWithSpecs.find((j) => j.jirNo === currentJIRNo) || null;

  return (
    <AppContext.Provider value={{
      jirs: jirsWithSpecs, setJirs, specs, setSpecs, items, setItems, vendors, setVendors,
      currentScreen, navigateTo, currentJIR, currentJIRNo, setCurrentJIRNo,
      role, toggleRole, toast, toasts, updateJIR,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);