const YEARS = ['23-24', '24-25', '25-26', '26-27'];

function toNum(v) {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  return isNaN(n) ? null : n;
}

function prepareRows(raw) {
  return raw.map(r => ({
    gstin: (r['BA GSTIN'] || '').toString().trim().toUpperCase(),
    name: r['BA Name'],
    baType: (r['BA Type'] || '(Blank)').toString().trim(),
    segment: (r['BA Segment'] || '(Blank)').toString().trim(),
    town: r['Town'],
    zone: (r['Zone'] || '(Unmapped)').toString().trim(),
    cluster: r['Cluster'],
    loyalty: (r['Loyalty'] || '(Blank)').toString().trim(),
    y1: toNum(r['23-24']), y2: toNum(r['24-25']), y3: toNum(r['25-26']), y4: toNum(r['26-27']),
    localityCategory: (r['Locality Category'] || 'Not classified').toString().trim(),
    isFocus: r['Focus: GSTIN (revised - Mumbai_Focused_Accounts_List_SFDC_1st_Oct_26.xlsx, GST-matched)'] === 'Yes',
  }));
}

function matchesFilters(r, f) {
  if (f.baType !== '(All)' && r.baType !== f.baType) return false;
  if (f.segment !== '(All)' && r.segment !== f.segment) return false;
  if (f.loyalty !== '(All)' && r.loyalty !== f.loyalty) return false;
  if (f.zone !== '(All)' && r.zone !== f.zone) return false;
  if (f.localityCategory !== '(All)' && r.localityCategory !== f.localityCategory) return false;
  if (f.focusAccount === 'Yes' && !r.isFocus) return false;
  if (f.focusAccount === 'No' && r.isFocus) return false;
  return true;
}

function applyFilters(rows, f) {
  return rows.filter(r => matchesFilters(r, f));
}

// ---------------- zone table (district-equivalent) ----------------
function zoneTable(rows) {
  const byZone = new Map();
  for (const r of rows) {
    if (!byZone.has(r.zone)) byZone.set(r.zone, { zone: r.zone, qty: [0,0,0,0], gst: new Set(), focusGst: new Set() });
    const d = byZone.get(r.zone);
    const ys = [r.y1, r.y2, r.y3, r.y4];
    ys.forEach((y,i) => { if (y !== null) d.qty[i] += y; });
    d.gst.add(r.gstin);
    if (r.isFocus) d.focusGst.add(r.gstin);
  }
  const out = [];
  for (const d of byZone.values()) {
    const totalQty = d.qty.reduce((a,b)=>a+b,0);
    out.push({ zone: d.zone, qty: d.qty, totalQty, baCount: d.gst.size, focusCount: d.focusGst.size });
  }
  out.sort((a,b) => b.qty[3] - a.qty[3]);
  return out;
}

function grandTotal(table) {
  const qty = [0,0,0,0];
  let baCount = 0, focusCount = 0, totalQty = 0;
  table.forEach(z => { z.qty.forEach((v,i)=>qty[i]+=v); baCount += z.baCount; focusCount += z.focusCount; totalQty += z.totalQty; });
  return { qty, baCount, focusCount, totalQty };
}

function growth(prev, cur) {
  if (!prev) return null;
  return (cur - prev) / prev;
}

// ---------------- segment table ----------------
function segmentTable(rows) {
  const bySeg = new Map();
  for (const r of rows) {
    if (!bySeg.has(r.segment)) bySeg.set(r.segment, { segment: r.segment, qty: [0,0,0,0], gst: new Set(), focusGst: new Set() });
    const d = bySeg.get(r.segment);
    const ys = [r.y1, r.y2, r.y3, r.y4];
    ys.forEach((y,i) => { if (y !== null) d.qty[i] += y; });
    d.gst.add(r.gstin);
    if (r.isFocus) d.focusGst.add(r.gstin);
  }
  const out = [];
  for (const d of bySeg.values()) {
    const totalQty = d.qty.reduce((a,b)=>a+b,0);
    const focusCount = d.focusGst.size;
    const baCount = d.gst.size;
    out.push({ segment: d.segment, qty: d.qty, totalQty, baCount, focusCount,
               coveragePct: baCount > 0 ? focusCount / baCount : null });
  }
  out.sort((a,b) => b.qty[3] - a.qty[3]);
  return out;
}

// ---------------- locality category (hotspot) summary ----------------
function localityTable(rows) {
  const byCat = new Map();
  for (const r of rows) {
    if (!byCat.has(r.localityCategory)) byCat.set(r.localityCategory, { category: r.localityCategory, qty: [0,0,0,0], gst: new Set(), focusGst: new Set() });
    const d = byCat.get(r.localityCategory);
    const ys = [r.y1, r.y2, r.y3, r.y4];
    ys.forEach((y,i) => { if (y !== null) d.qty[i] += y; });
    d.gst.add(r.gstin);
    if (r.isFocus) d.focusGst.add(r.gstin);
  }
  const order = ['Hotspot - High value', 'Hotspot - Medium value', 'Hotspot - Low value', 'Area of Interest', 'Not classified'];
  const out = [];
  for (const cat of order) {
    if (byCat.has(cat)) {
      const d = byCat.get(cat);
      const totalQty = d.qty.reduce((a,b)=>a+b,0);
      out.push({ category: cat, qty: d.qty, totalQty, baCount: d.gst.size, focusCount: d.focusGst.size });
    }
  }
  return out;
}

if (typeof module !== 'undefined') {
  module.exports = { prepareRows, applyFilters, matchesFilters, zoneTable, grandTotal, growth, segmentTable, localityTable };
}
