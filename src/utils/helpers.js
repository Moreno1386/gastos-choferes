export const STORAGE_KEY = 'gastos_choferes_v1'

export const DEFAULT_DATA = {
  transactions: [],
  voiceNotes: [],
  photos: [],
  theme: 'azul',
}

export const THEMES = {
  azul:    { primary:'#2563eb', light:'#dbeafe', dark:'#1d4ed8', bg:'#f1f5f9', card:'#fff', text:'#1e293b', muted:'#64748b', border:'#e2e8f0', income:'#16a34a', incomeBg:'#dcfce7', expense:'#dc2626', expenseBg:'#fee2e2' },
  verde:   { primary:'#16a34a', light:'#dcfce7', dark:'#15803d', bg:'#f0fdf4', card:'#fff', text:'#1e293b', muted:'#64748b', border:'#e2e8f0', income:'#16a34a', incomeBg:'#dcfce7', expense:'#dc2626', expenseBg:'#fee2e2' },
  morado:  { primary:'#7c3aed', light:'#ede9fe', dark:'#6d28d9', bg:'#faf5ff', card:'#fff', text:'#1e293b', muted:'#64748b', border:'#e2e8f0', income:'#16a34a', incomeBg:'#dcfce7', expense:'#dc2626', expenseBg:'#fee2e2' },
  naranja: { primary:'#ea580c', light:'#ffedd5', dark:'#c2410c', bg:'#fff7ed', card:'#fff', text:'#1e293b', muted:'#64748b', border:'#e2e8f0', income:'#16a34a', incomeBg:'#dcfce7', expense:'#dc2626', expenseBg:'#fee2e2' },
  rojo:    { primary:'#dc2626', light:'#fee2e2', dark:'#b91c1c', bg:'#fff5f5', card:'#fff', text:'#1e293b', muted:'#64748b', border:'#e2e8f0', income:'#16a34a', incomeBg:'#dcfce7', expense:'#dc2626', expenseBg:'#fee2e2' },
  rosa:    { primary:'#db2777', light:'#fce7f3', dark:'#be185d', bg:'#fdf2f8', card:'#fff', text:'#1e293b', muted:'#64748b', border:'#e2e8f0', income:'#16a34a', incomeBg:'#dcfce7', expense:'#dc2626', expenseBg:'#fee2e2' },
  cian:    { primary:'#0891b2', light:'#cffafe', dark:'#0e7490', bg:'#ecfeff', card:'#fff', text:'#1e293b', muted:'#64748b', border:'#e2e8f0', income:'#16a34a', incomeBg:'#dcfce7', expense:'#dc2626', expenseBg:'#fee2e2' },
  oscuro:  { primary:'#60a5fa', light:'#1e3a5f', dark:'#93c5fd', bg:'#0f172a', card:'#1e293b', text:'#f1f5f9', muted:'#94a3b8', border:'#334155', income:'#4ade80', incomeBg:'#14532d', expense:'#f87171', expenseBg:'#7f1d1d' },
}

export function applyTheme(name) {
  const t = THEMES[name] || THEMES.azul
  const r = document.documentElement.style
  r.setProperty('--primary', t.primary)
  r.setProperty('--primary-light', t.light)
  r.setProperty('--primary-dark', t.dark)
  r.setProperty('--bg', t.bg)
  r.setProperty('--card', t.card)
  r.setProperty('--text', t.text)
  r.setProperty('--muted', t.muted)
  r.setProperty('--border', t.border)
  r.setProperty('--income', t.income)
  r.setProperty('--income-light', t.incomeBg)
  r.setProperty('--expense', t.expense)
  r.setProperty('--expense-light', t.expenseBg)
}

export function cur(n) {
  return '$' + Number(n).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

export function fmtDate(s) {
  if (!s) return ''
  const [y, m, d] = s.split('-')
  return `${d}/${m}/${y}`
}

export function fmtDT(iso) {
  const d = new Date(iso)
  return d.toLocaleDateString('es-MX') + ' ' + d.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
}

export function today() {
  return new Date().toISOString().split('T')[0]
}

export function loadData() {
  try {
    const s = localStorage.getItem(STORAGE_KEY)
    return s ? { ...DEFAULT_DATA, ...JSON.parse(s) } : { ...DEFAULT_DATA }
  } catch { return { ...DEFAULT_DATA } }
}

export function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}
