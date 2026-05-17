import { useState, useEffect, useRef } from 'react'
import Dashboard from './pages/Dashboard'
import Voice from './pages/Voice'
import Photos from './pages/Photos'
import Reports from './pages/Reports'
import { loadData, saveData, applyTheme } from './utils/helpers'
import { exportPDF } from './utils/pdf'

const TABS = [
  { id: 'dashboard', label: '📊 Balance' },
  { id: 'voice',     label: '🎙️ Notas de Voz' },
  { id: 'photos',    label: '📷 Fotos / Recibos' },
  { id: 'reports',   label: '📈 Reportes' },
]

const THEME_LIST = [
  { id: 'azul',    label: 'Azul',    color: '#2563eb' },
  { id: 'verde',   label: 'Verde',   color: '#16a34a' },
  { id: 'morado',  label: 'Morado',  color: '#7c3aed' },
  { id: 'naranja', label: 'Naranja', color: '#ea580c' },
  { id: 'rojo',    label: 'Rojo',    color: '#dc2626' },
  { id: 'rosa',    label: 'Rosa',    color: '#db2777' },
  { id: 'cian',    label: 'Cian',    color: '#0891b2' },
  { id: 'oscuro',  label: 'Oscuro',  color: '#1e293b' },
]

export default function App() {
  const [data, setData] = useState(() => loadData())
  const [tab, setTab] = useState('dashboard')
  const [showThemes, setShowThemes] = useState(false)
  const [showResetModal, setShowResetModal] = useState(false)
  const themePanelRef = useRef()

  // Persist & apply theme
  useEffect(() => {
    saveData(data)
    applyTheme(data.theme)
  }, [data])

  // Close theme panel on outside click
  useEffect(() => {
    const handler = (e) => {
      if (themePanelRef.current && !themePanelRef.current.contains(e.target)
        && !e.target.closest('.btn-theme-hdr')) {
        setShowThemes(false)
      }
    }
    document.addEventListener('click', handler)
    return () => document.removeEventListener('click', handler)
  }, [])

  const update = (key, val) => setData(d => ({ ...d, [key]: val }))

  // Reset for new month: clear transactions, photos, voice notes
  const resetForNewMonth = () => {
    setData(d => ({
      ...d,
      transactions: [],
      photos: [],
      voiceNotes: [],
    }))
    setShowResetModal(false)
    setTab('dashboard')
  }

  // Transaction handlers
  const addTx = (tx) => update('transactions', [...data.transactions, tx])
  const delTx = (id) => {
    update('transactions', data.transactions.filter(t => t.id !== id))
    update('photos', data.photos.filter(p => p.id !== id))
  }
  const editTx = (id, updated) =>
    update('transactions', data.transactions.map(t => t.id === id ? { ...t, ...updated } : t))

  // Photo handlers
  const addPhoto = (photo) => {
    setData(d => ({
      ...d,
      photos: [...d.photos, photo],
      transactions: [...d.transactions, {
        id: photo.id,
        type: 'expense',
        desc: `📷 ${photo.desc}`,
        amount: photo.amount,
        date: photo.date
      }]
    }))
  }
  const delPhoto = (id) => {
    setData(d => ({
      ...d,
      photos: d.photos.filter(p => p.id !== id),
      transactions: d.transactions.filter(t => t.id !== id)
    }))
  }

  return (
    <>
      <header className="header">
        <div className="header-top">
          <div className="app-title">🚚 Gastos Choferes</div>
          <div className="header-btns">
            <button className="btn-hdr btn-theme-hdr" onClick={() => setShowThemes(s => !s)}>
              🎨 Temas
            </button>
            <button className="btn-hdr btn-pdf-hdr" onClick={() => exportPDF(data)}>
              📄 PDF
            </button>
            <button className="btn-hdr btn-reset-hdr" onClick={() => setShowResetModal(true)}>
              🗑️ Nuevo Mes
            </button>
          </div>
        </div>
        <nav>
          {TABS.map(t => (
            <button key={t.id} className={`ntab${tab === t.id ? ' active' : ''}`}
              onClick={() => setTab(t.id)}>
              {t.label}
            </button>
          ))}
        </nav>
      </header>

      {/* Theme panel */}
      {showThemes && (
        <div className="theme-panel open" ref={themePanelRef}>
          <div className="tp-title">Elige un tema</div>
          <div className="theme-opts">
            {THEME_LIST.map(th => (
              <button
                key={th.id}
                className={`tbtn${data.theme === th.id ? ' active' : ''}`}
                onClick={() => { update('theme', th.id); setShowThemes(false) }}
              >
                <span className="tc" style={{
                  background: th.color,
                  border: th.id === 'oscuro' ? '1px solid #475569' : 'none'
                }} />
                {th.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Reset confirmation modal */}
      {showResetModal && (
        <div className="overlay open" onClick={e => e.target === e.currentTarget && setShowResetModal(false)}>
          <div className="modal">
            <div className="modal-title">🗑️ Nuevo Mes</div>
            <p style={{ fontSize: '.875rem', color: 'var(--muted)', marginBottom: '1rem', lineHeight: 1.6 }}>
              Esto va a borrar:
              <br />• Todas las <strong>entradas y gastos</strong>
              <br />• Todas las <strong>fotos y recibos</strong>
              <br />• Todas las <strong>notas de voz</strong>
              <br /><br />
              <strong>Esta acción no se puede deshacer.</strong> ¿Deseas continuar?
            </p>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowResetModal(false)}>Cancelar</button>
              <button
                style={{ padding: '.45rem .9rem', border: 'none', borderRadius: 8, background: '#dc2626', color: '#fff', cursor: 'pointer', fontSize: '.8rem', fontWeight: 700 }}
                onClick={resetForNewMonth}
              >
                Sí, borrar todo
              </button>
            </div>
          </div>
        </div>
      )}

      <main>
        {tab === 'dashboard' && (
          <Dashboard
            transactions={data.transactions}
            onAdd={addTx}
            onDelete={delTx}
            onEdit={editTx}
          />
        )}
        {tab === 'voice' && (
          <Voice
            voiceNotes={data.voiceNotes}
            onChange={val => update('voiceNotes', val)}
          />
        )}
        {tab === 'photos' && (
          <Photos
            photos={data.photos}
            onAdd={addPhoto}
            onDelete={delPhoto}
          />
        )}
        {tab === 'reports' && (
          <Reports transactions={data.transactions} />
        )}
      </main>
    </>
  )
}
