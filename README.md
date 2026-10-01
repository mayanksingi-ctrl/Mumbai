# Mumbai City Summary — Web Dashboard

A self-contained, filterable dashboard for Mumbai's BA-level sales data, mirroring the format
established for Gujarat and Pune's dashboards. Open `index.html` in a browser; it reads
`Mumbai_Summary_Data.xlsx` (same folder) and `mumbai_so_performance.json` directly via fetch, so
keep all files together, served from a local web server or any static host (opening the HTML file
directly via `file://` will not work due to browser fetch restrictions — use `python3 -m http.server`
or similar in this folder, or host it anywhere static files are served).

## What's here
- **index.html / mumbai_logic.js** — the dashboard itself. Filters: BA Type, BA Segment, Loyalty,
  Zone, Locality Category, Focus Account.
- **Mumbai_Summary_Data.xlsx** — the full workbook (Methodology, Summary, Detailed Sheet, Cube,
  SO Performance Raw). The dashboard reads only the Detailed Sheet and SO Performance Raw sheets
  live; everything else in the workbook is for reference.
- **mumbai_so_performance.json** — pre-exported SO Performance data (33 Mumbai Sales Officers),
  since that section is a static reference table, not filter-driven.

## Key differences from Gujarat/Pune's dashboards — read before relying on this
This build reflects real structural differences in what data was available for Mumbai, not
oversights. Full detail is in the workbook's own Methodology sheet; the headline points:

- **Zone is inferred, not sourced.** The underlying file (Mumbai_Review_Data) has no Zone or
  District column — only 468 individual Cluster/neighborhood names (Andheri, Kurla, Vasai, Thane,
  etc). Zone here is Claude's own keyword-based mapping of those clusters into 4 broad areas
  (Mumbai & Suburbs / Thane / Navi Mumbai / Vasai-Virar), plus Out-of-Region and Other/Unmapped
  catch-alls (93.2% of accounts mapped with reasonable confidence). Treat Zone rollups as a
  reasonable approximation of Mumbai geography, not an authoritative boundary definition.
- **"Growth (23-24→26-27)"**, not "Pro-Rata Growth". Gujarat and Pune's dashboards pro-rate the
  current year against a specific as-of-date within the fiscal year. No such pro-rata factor was
  established for Mumbai, so this column is the raw first-year-to-last-year change across all 4
  years of data — a real but differently-shaped comparison than the other two dashboards use.
  Don't read it as directly comparable to Gujarat/Pune's pro-rata figures.
- **No Product Category filter.** The source data has product-line detail (Brand MIS Group: LAM,
  SLC, CAL+, etc.) at a finer grain than one row per account, but this workbook aggregates to one
  row per GSTIN — that dimension was summed away and isn't filterable here.
- **Focus Accounts**: a genuine, curated list (Mumbai_Focused_Accounts_List_SFDC_1st_Oct_26.xlsx,
  GST-matched — 934 of 4,044 accounts), not an approximation. This is the same standard Gujarat's
  Focus Accounts sheet and Pune's later-arriving list both meet.
- **Locality Category (Hotspot)** is built at zone level (4 zones), not neighborhood level —
  Gujarat's version covers ~26-28 individual localities. The same weighted methodology applies
  (60% sales volume, 20% retail counter density, 20% kitchen showroom density via Google Places),
  just at the coarser granularity the source data supports.
- **No map.** Gujarat and Pune's dashboards include an interactive Hotspot map with geocoded
  localities; building an equivalent for Mumbai's 4 zone-level areas was not attempted here, since
  4 points add little over the table already on this page.

## Verification
Every table was checked against direct aggregation of the source Excel file before this package
was built: Grand Total (Qty by year) 1,004,906 / 1,040,282 / 1,007,554 / 458,405 across 4,044 BAs,
934 Focus Accounts — confirmed matching exactly in both the Excel workbook and this dashboard's
own JavaScript computation, including under the Focus Account filter.

## Updating the data
Replace `Mumbai_Summary_Data.xlsx` with a newer version of the same structure (same sheet names,
same Detailed Sheet column headers) and reload the page — no code changes needed, as long as the
column headers match exactly. To refresh SO Performance, re-export `mumbai_so_performance.json`
from the workbook's SO Performance Raw sheet in the same shape.
