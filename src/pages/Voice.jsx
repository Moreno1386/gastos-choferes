import { useState, useRef } from 'react'
import { fmtDT } from '../utils/helpers'

export default function Voice({ voiceNotes, onChange }) {
  const [recording, setRecording] = useState(false)
  const [status, setStatus] = useState('Presiona el botón para grabar')
  const [timer, setTimer] = useState('')
  const [showTitleModal, setShowTitleModal] = useState(false)
  const [title, setTitle] = useState('')
  const mrRef = useRef(null)
  const chunksRef = useRef([])
  const intervalRef = useRef(null)
  const blobRef = useRef(null)
  const audioRefs = useRef({})

  const startRec = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mr = new MediaRecorder(stream)
      chunksRef.current = []
      mr.ondataavailable = e => chunksRef.current.push(e.data)
      mr.onstop = () => {
        blobRef.current = new Blob(chunksRef.current, { type: 'audio/webm' })
        stream.getTracks().forEach(t => t.stop())
        setTitle('')
        setShowTitleModal(true)
        setStatus('Presiona el botón para grabar')
      }
      mr.start()
      mrRef.current = mr
      setRecording(true)
      setStatus('Grabando... (toca ⏹️ para detener)')
      let sec = 0
      intervalRef.current = setInterval(() => {
        sec++
        const m = String(Math.floor(sec / 60)).padStart(2, '0')
        const s = String(sec % 60).padStart(2, '0')
        setTimer(`${m}:${s}`)
      }, 1000)
    } catch {
      alert('No se pudo acceder al micrófono. Verifica los permisos.')
    }
  }

  const stopRec = () => {
    mrRef.current?.stop()
    clearInterval(intervalRef.current)
    setRecording(false)
    setTimer('')
  }

  const toggleRec = () => recording ? stopRec() : startRec()

  const saveVoice = () => {
    if (!blobRef.current) return
    const reader = new FileReader()
    reader.onload = e => {
      onChange([...voiceNotes, {
        id: Date.now(),
        title: title.trim() || 'Nota de voz',
        date: new Date().toISOString(),
        audio: e.target.result
      }])
    }
    reader.readAsDataURL(blobRef.current)
    blobRef.current = null
    setShowTitleModal(false)
  }

  const discardVoice = () => { blobRef.current = null; setShowTitleModal(false) }

  const delNote = (id) => {
    if (!confirm('¿Eliminar esta nota?')) return
    onChange(voiceNotes.filter(v => v.id !== id))
  }

  const playVoice = (id, src) => {
    const a = audioRefs.current[id]
    if (!a) {
      const audio = new Audio(src)
      audioRefs.current[id] = audio
      audio.play()
    } else {
      if (a.paused) a.play(); else { a.pause(); a.currentTime = 0 }
    }
  }

  return (
    <>
      <div className="sec-ttl" style={{ marginBottom: '.9rem' }}>🎙️ Notas de Voz</div>

      <div className="panel voice-center">
        {timer && <div className="rec-timer">{timer}</div>}
        <div className="rec-status">{status}</div>
        <button className={`rec-btn${recording ? ' on' : ''}`} onClick={toggleRec}>
          {recording ? '⏹️' : '🎙️'}
        </button>
      </div>

      {voiceNotes.length === 0
        ? <div className="panel empty">No hay notas de voz guardadas</div>
        : [...voiceNotes].reverse().map(v => (
          <div className="vn-item" key={v.id}>
            <button className="btn-play" onClick={() => playVoice(v.id, v.audio)}>▶</button>
            <div className="vn-info">
              <div className="vn-title">{v.title}</div>
              <div className="vn-date">{fmtDT(v.date)}</div>
            </div>
            <button className="btn-del" onClick={() => delNote(v.id)}>🗑</button>
          </div>
        ))
      }

      {/* Title modal */}
      {showTitleModal && (
        <div className="overlay open" onClick={e => e.target === e.currentTarget && discardVoice()}>
          <div className="modal">
            <div className="modal-title">Guardar Nota de Voz</div>
            <div className="fg">
              <label className="flbl">Título (opcional)</label>
              <input className="finp" value={title} onChange={e => setTitle(e.target.value)}
                placeholder="Ej. Recordatorio compras" autoFocus
                onKeyDown={e => e.key === 'Enter' && saveVoice()} />
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={discardVoice}>Descartar</button>
              <button className="btn-save" onClick={saveVoice}>Guardar</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
