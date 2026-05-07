export function passResultRow(row, isDim) {
  const obs = (row.observations || []).filter((v) => v !== null && v !== '');
  if (!obs.length) return { result: '—', ok: null };
  if (!isDim) {
    const fail = obs.some(
      (x) => String(x).toLowerCase().includes('fail') || String(x).toUpperCase() === 'NOK'
    );
    return { result: fail ? 'NOK' : 'OK', ok: !fail };
  }
  const nums = obs.filter((v) => !isNaN(+v)).map(Number);
  if (!nums.length) return { result: '—', ok: null };
  const avg = nums.reduce((a, b) => a + b, 0) / nums.length;
  const s = String(row.spec);
  let ok = true;
  const pm = s.match(/^([\d.]+)±([\d.]+)/);
  const ge = s.match(/^≥([\d.]+)/);
  const lt = s.match(/^<([\d.]+)/);
  const rng = s.match(/^([\d.]+)–([\d.]+)/);
  if (pm) { const c = +pm[1], t = +pm[2]; ok = avg >= c - t && avg <= c + t; }
  else if (ge) { ok = avg >= +ge[1]; }
  else if (lt) { ok = avg < +lt[1]; }
  else if (rng) { ok = avg >= +rng[1] && avg <= +rng[2]; }
  return { result: avg.toFixed(2), ok };
}

export function hasNOKAny(jir) {
  return [...(jir.dimSpecs || []), ...(jir.visSpecs || []), ...(jir.relSpecs || [])].some(
    (r) => passResultRow(r, r.type === 'Dim').ok === false
  );
}

export function ageColor(h) {
  return h <= 24 ? '#059669' : h <= 72 ? '#f59e0b' : '#dc2626';
}

export function stars(r) {
  const f = Math.round(r);
  return '★'.repeat(f) + '☆'.repeat(5 - f);
}

export function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}