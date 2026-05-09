import { useState, useEffect, useRef } from 'react'
import { cur, fmtDate, today } from '../utils/helpers'

// ── Parsear texto de voz ──────────────────────────────────────────────────────
function parseVoice(text) {
  const lower = text.toLowerCase()

  // Extraer monto: primer número con posibles decimales
  const numMatch = lower.match(/(\d+(?:[.,]\d+)?)/)
  const amount = numMatch ? parseFloat(numMatch[1].replace(',', '.')) : null

  // Extraer descripción: texto después de preposición "de", "en", "para", "por"
  const prepMatch = lower.match(/\b(?:de|en|para|por)\s+(.+)/)
  let desc = ''
  if (prepMatch) {
    desc = prepMatch[1].trim()
  } else {
    desc = lower
      .replace(/\d+(?:[.,]\d+)?/g, '')
      .replace(/\b(?:pesos?|mxn|dlls?|dólares?|dolares?|gasté|gaste|entró|entro|cobré|cobre|pagué|pague|me\s+pagaron|recibí|recibi)\b/g, '')
      .trim()
  }

  // Capitalizar primera letra
  desc = desc ? desc.charAt(0).toUpperCase() + desc.slice(1) : ''

  return { amount, desc }
}

// ── Botón micrófono ───────────────────────────────────────────────────────────
function MicButton({ onResult, colorClass }) {
  const [listening, setListening] = useState(false)
  const recRef = useRef(null)

  const handleClick = () => {
    if (listening) {
      recRef.current?.stop()
      return
    }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) {
      alert('Tu navegador no soporta reconocimiento de voz. Usa Chrome o Edge.')
      return
    }
    const rec = new SR()
    rec.lang = 'es-MX'
    rec.interimResults = false
    rec.maxAlternatives = 1
    rec.onresult = (e) => {
      onResult(e.results[0][0].transcript)
      setListening(false)
    }
    rec.onerror = () => setListening(false)
    rec.onend = () => setListening(false)
    rec.start()
    recRef.current = rec
    setListening(true)
  }

  return (
    <button
      className={`btn-mic${listening ? ' listening' : ''} ${colorClass}`}
      onClick={handleClick}
      title={listening ? 'Escuchando... (toca para cancelar)' : 'Dictar por voz'}
    >
      🎤
    </button>
  )
}

// ── Modal ─────────────────────────────────────────────────────────────────────
function Modal({ open, title, onClose, onSave, initDesc = '', initAmount = '' }) {
  const [desc, setDesc] = useState('')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(today())

  useEffect(() => {
    if (open) {
      setDesc(initDesc)
      setAmount(initAmount ? String(initAmount) : '')
      setDate(today())
    }
  }, [open, initDesc, initAmount])

  const handleSave = () => {
    if (!desc.trim() || !amount || parseFloat(amount) <= 0) {
      alert('Completa descripción y monto correctamente.')
      return
    }
    onSave({ desc: desc.trim(), amount: parseFloat(amount), date })
    setDesc(''); setAmount(''); setDate(today())
  }

  if (!open) return null
  return (
    <div className="overlay open" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-title">{title}</div>
        <div className="fg">
          <label className="flbl">Descripción</label>
          <input className="finp" value={desc} onChange={e => setDesc(e.target.value)}
            placeholder="Ej. Pago de cliente" autoFocus />
        </div>
        <div className="fg">
          <label className="flbl">Monto ($)</label>
          <input className="finp" type="number" value={amount} onChange={e => setAmount(e.target.value)}
            placeholder="0.00" step="0.01" min="0" />
        </div>
        <div className="fg">
          <label className="flbl">Fecha</label>
          <input className="finp" type="date" value={date} onChange={e => setDate(e.target.value)} />
        </div>
        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose}>Cancelar</button>
          <button className="btn-save" onClick={handleSave}>Guardar</button>
        </div>
      </div>
    </div>
  )
}

// ── Barra de búsqueda ─────────────────────────────────────────────────────────
function SearchBar({ value, onChange, onClear }) {
  return (
    <div className="search-bar">
      <span className="search-icon">🔍</span>
      <input
        className="search-input"
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="Buscar por descripción, monto o fecha..."
      />
      {value && (
        <button className="search-clear" onClick={onClear}>✕</button>
      )}
    </div>
  )
}

// ── Lista de transacciones ────────────────────────────────────────────────────
function TxList({ items, type, emptyMsg, onDelete }) {
  const sorted = [...items].sort((a, b) => new Date(b.date) - new Date(a.date))
  if (sorted.length === 0) return <div className="empty">{emptyMsg}</div>
  return sorted.map(t => (
    <div className="tx-row" key={t.id}>
      <div className="tx-info">
        <div className="tx-desc">{t.desc}</div>
        <div className="tx-date">{fmtDate(t.date)}</div>
      </div>
      <div className={`tx-amt ${type}`}>{type === 'inc' ? '+' : '-'}{cur(t.amount)}</div>
      <button className="btn-del" onClick={() => onDelete(t.id)}>🗑</button>
    </div>
  ))
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
export default function Dashboard({ transactions, onAdd, onDelete }) {
  const [modal, setModal] = useState(null)
  const [modalInit, setModalInit] = useState({ desc: '', amount: '' })
  const [search, setSearch] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [toast, setToast] = useState(null)

  const inc = transactions.filter(t => t.type === 'income')
  const exp = transactions.filter(t => t.type === 'expense')
  const tI = inc.reduce((s, t) => s + t.amount, 0)
  const tE = exp.reduce((s, t) => s + t.amount, 0)
  const bal = tI - tE

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3500)
  }

  const handleSave = ({ desc, amount, date }) => {
    onAdd({ id: Date.now(), type: modal, desc, amount, date })
    setModal(null)
  }

  const handleVoice = (type, text) => {
    const { amount, desc } = parseVoice(text)
    if (amount && amount > 0 && desc.length > 1) {
      // Auto-guardar con fecha de hoy
      onAdd({ id: Date.now(), type, desc, amount, date: today() })
      const label = type === 'income' ? '↗ Entrada' : '↘ Gasto'
      showToast(`${label} guardado: "${desc}" — ${cur(amount)}`)
    } else {
      // Abrir modal pre-llenado con lo que se pudo parsear
      setModalInit({ desc: desc || '', amount: amount || '' })
      setModal(type)
    }
  }

  const openModal = (type) => {
    setModalInit({ desc: '', amount: '' })
    setModal(type)
  }

  const toggleSearch = () => {
    setSearchOpen(s => !s)
    setSearch('')
  }

  const applyFilter = (arr) => {
    if (!search.trim()) return arr
    const q = search.toLowerCase()
    return arr.filter(t =>
      t.desc.toLowerCase().includes(q) ||
      String(t.amount).includes(q) ||
      fmtDate(t.date).includes(q)
    )
  }

  const filteredInc = applyFilter(inc)
  const filteredExp = applyFilter(exp)
  const isFiltering = search.trim().length > 0
  const totalFound = filteredInc.length + filteredExp.length

  return (
    <>
      {/* Resumen */}
      <div className="sum-grid">
        <div className="sum-card inc">
          <div className="sum-lbl">↗ Total Entradas</div>
          <div className="sum-amt">{cur(tI)}</div>
          <div className="sum-sub">{inc.length} registro{inc.length !== 1 ? 's' : ''}</div>
        </div>
        <div className="sum-card exp">
          <div className="sum-lbl">↘ Total Gastos</div>
          <div className="sum-amt">{cur(tE)}</div>
          <div className="sum-sub">{exp.length} registro{exp.length !== 1 ? 's' : ''}</div>
        </div>
        <div className="sum-card bal">
          <div className="sum-lbl">⚖ Balance</div>
          <div className="sum-amt" style={{ color: bal >= 0 ? 'var(--income)' : 'var(--expense)' }}>
            {cur(Math.abs(bal))}
          </div>
          <div className="sum-sub">{bal >= 0 ? 'Positivo' : 'Negativo'}</div>
        </div>
      </div>

      {/* Búsqueda */}
      <div className="search-wrapper">
        <button
          className={`btn-search-toggle${searchOpen ? ' active' : ''}`}
          onClick={toggleSearch}
          title="Buscar"
        >
          🔍 {searchOpen ? 'Cerrar búsqueda' : 'Buscar'}
        </button>
        {isFiltering && (
          <span className="search-results-lbl">
            {totalFound} resultado{totalFound !== 1 ? 's' : ''} encontrado{totalFound !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {searchOpen && (
        <SearchBar value={search} onChange={setSearch} onClear={() => setSearch('')} />
      )}

      {/* Entradas */}
      <div className="panel">
        <div className="panel-hdr">
          <div className="panel-title">
            ↗ Entradas
            <span className="badge">{isFiltering ? `${filteredInc.length}/${inc.length}` : inc.length}</span>
          </div>
          <div className="panel-actions">
            <MicButton colorClass="mic-inc" onResult={(text) => handleVoice('income', text)} />
            <button className="btn-add-i" onClick={() => openModal('income')}>+ Nueva Entrada</button>
          </div>
        </div>
        <TxList
          items={filteredInc}
          type="inc"
          emptyMsg={isFiltering ? 'Sin resultados para esta búsqueda' : 'No hay entradas registradas'}
          onDelete={onDelete}
        />
      </div>

      {/* Gastos */}
      <div className="panel">
        <div className="panel-hdr">
          <div className="panel-title">
            ↘ Gastos
            <span className="badge">{isFiltering ? `${filteredExp.length}/${exp.length}` : exp.length}</span>
          </div>
          <div className="panel-actions">
            <MicButton colorClass="mic-exp" onResult={(text) => handleVoice('expense', text)} />
            <button className="btn-add-e" onClick={() => openModal('expense')}>+ Nuevo Gasto</button>
          </div>
        </div>
        <TxList
          items={filteredExp}
          type="exp"
          emptyMsg={isFiltering ? 'Sin resultados para esta búsqueda' : 'No hay gastos registrados'}
          onDelete={onDelete}
        />
      </div>

      <Modal
        open={modal !== null}
        title={modal === 'income' ? 'Nueva Entrada' : 'Nuevo Gasto'}
        onClose={() => setModal(null)}
        onSave={handleSave}
        initDesc={modalInit.desc}
        initAmount={modalInit.amount}
      />

      {/* Toast de confirmación */}
      {toast && <div className="toast">{toast}</div>}
    </>
  )
}
