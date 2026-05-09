import { useState, useRef } from 'react'
import { cur, fmtDate, today } from '../utils/helpers'

export default function Photos({ photos, onAdd, onDelete }) {
  const [pendingImg, setPendingImg] = useState(null)
  const [desc, setDesc] = useState('')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(today())
  const inputRef = useRef()

  const handlePhoto = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      setPendingImg(ev.target.result)
      setDesc(''); setAmount(''); setDate(today())
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const savePhoto = () => {
    if (!desc.trim() || !amount || parseFloat(amount) <= 0) {
      alert('Completa descripción y monto.')
      return
    }
    onAdd({
      id: Date.now(),
      desc: desc.trim(),
      amount: parseFloat(amount),
      date,
      image: pendingImg
    })
    setPendingImg(null)
  }

  return (
    <>
      <div className="sec-ttl" style={{ marginBottom: '.9rem' }}>📷 Fotos / Recibos</div>

      <label className="photo-drop" htmlFor="photoInput">
        <div className="photo-drop-icon">📸</div>
        <div className="photo-drop-txt">
          Toca para tomar foto o seleccionar de galería<br />
          <small>Se guardará y se agregará automáticamente a tus gastos</small>
        </div>
        <input
          type="file"
          id="photoInput"
          ref={inputRef}
          accept="image/*"
          capture="environment"
          style={{ display: 'none' }}
          onChange={handlePhoto}
        />
      </label>

      {photos.length === 0
        ? null
        : (
          <div className="photo-grid">
            {[...photos].reverse().map(p => (
              <div className="ph-card" key={p.id}>
                <img className="ph-img" src={p.image} alt={p.desc} />
                <div className="ph-info">
                  <div className="ph-desc">{p.desc}</div>
                  <div className="ph-amt">-{cur(p.amount)}</div>
                  <div className="ph-date">{fmtDate(p.date)}</div>
                  <button className="ph-del" onClick={() => onDelete(p.id)}>🗑 Eliminar</button>
                </div>
              </div>
            ))}
          </div>
        )
      }

      {/* Photo expense modal */}
      {pendingImg && (
        <div className="overlay open" onClick={e => e.target === e.currentTarget && setPendingImg(null)}>
          <div className="modal">
            <div className="modal-title">Registrar Gasto de Foto</div>
            <div className="fg">
              <img src={pendingImg} style={{ width: '100%', borderRadius: 9, maxHeight: 180, objectFit: 'cover' }} alt="preview" />
            </div>
            <div className="fg">
              <label className="flbl">Descripción</label>
              <input className="finp" value={desc} onChange={e => setDesc(e.target.value)}
                placeholder="Ej. Compra supermercado" autoFocus />
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
              <button className="btn-cancel" onClick={() => setPendingImg(null)}>Cancelar</button>
              <button className="btn-save" onClick={savePhoto}>Guardar Gasto</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
