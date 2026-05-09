import { useMemo } from 'react'
import { cur } from '../utils/helpers'

const MONTH_NAMES = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']

function getMonthlyData(transactions) {
  const map = {}
  transactions.forEach(t => {
    if (!t.date) return
    const [y, m] = t.date.split('-')
    const key = `${y}-${m}`
    if (!map[key]) map[key] = { key, year: +y, month: +m, income: 0, expense: 0 }
    if (t.type === 'income')  map[key].income  += t.amount
    if (t.type === 'expense') map[key].expense += t.amount
  })
  return Object.values(map).sort((a, b) => a.year !== b.year ? a.year - b.year : a.month - b.month)
}

function BarChart({ months }) {
  if (months.length === 0) return null

  const allValues = months.flatMap(m => [m.income, m.expense])
  const maxVal = Math.max(...allValues, 1)
  const chartH = 180
  const barW = 28
  const gap = 10
  const groupW = barW * 2 + gap
  const paddingL = 60
  const paddingB = 40
  const paddingT = 20
  const totalW = paddingL + months.length * (groupW + 20) + 10
  const totalH = chartH + paddingB + paddingT

  // Y axis guides (4 lines)
  const guides = [0, 0.25, 0.5, 0.75, 1].map(p => ({
    y: paddingT + chartH * (1 - p),
    val: maxVal * p
  }))

  return (
    <svg width="100%" viewBox={`0 0 ${totalW} ${totalH}`} style={{ overflow: 'visible' }}>
      {/* Y axis guides */}
      {guides.map((g, i) => (
        <g key={i}>
          <line
            x1={paddingL} y1={g.y}
            x2={totalW - 10} y2={g.y}
            stroke="var(--border)" strokeWidth="1" strokeDasharray={i === 0 ? '0' : '4 3'}
          />
          <text
            x={paddingL - 6} y={g.y + 4}
            textAnchor="end"
            fontSize="9"
            fill="var(--muted)"
          >
            {g.val >= 1000 ? `$${(g.val/1000).toFixed(1)}k` : `$${Math.round(g.val)}`}
          </text>
        </g>
      ))}

      {/* Bars */}
      {months.map((m, i) => {
        const x = paddingL + i * (groupW + 20)
        const incH = (m.income / maxVal) * chartH
        const expH = (m.expense / maxVal) * chartH
        const label = `${MONTH_NAMES[m.month - 1]} ${String(m.year).slice(2)}`

        return (
          <g key={m.key}>
            {/* Income bar */}
            <rect
              x={x}
              y={paddingT + chartH - incH}
              width={barW}
              height={incH}
              rx="4"
              fill="var(--income)"
              opacity="0.85"
            />
            {incH > 14 && (
              <text x={x + barW/2} y={paddingT + chartH - incH - 4} textAnchor="middle" fontSize="8" fill="var(--income)" fontWeight="700">
                {m.income >= 1000 ? `${(m.income/1000).toFixed(1)}k` : Math.round(m.income)}
              </text>
            )}

            {/* Expense bar */}
            <rect
              x={x + barW + gap}
              y={paddingT + chartH - expH}
              width={barW}
              height={expH}
              rx="4"
              fill="var(--expense)"
              opacity="0.85"
            />
            {expH > 14 && (
              <text x={x + barW + gap + barW/2} y={paddingT + chartH - expH - 4} textAnchor="middle" fontSize="8" fill="var(--expense)" fontWeight="700">
                {m.expense >= 1000 ? `${(m.expense/1000).toFixed(1)}k` : Math.round(m.expense)}
              </text>
            )}

            {/* Month label */}
            <text
              x={x + barW + gap/2}
              y={paddingT + chartH + 16}
              textAnchor="middle"
              fontSize="10"
              fill="var(--muted)"
              fontWeight="600"
            >
              {label}
            </text>
          </g>
        )
      })}

      {/* Legend */}
      <g transform={`translate(${paddingL}, ${totalH - 10})`}>
        <rect x="0" y="-8" width="10" height="10" rx="2" fill="var(--income)" opacity="0.85" />
        <text x="14" y="0" fontSize="9" fill="var(--muted)">Entradas</text>
        <rect x="70" y="-8" width="10" height="10" rx="2" fill="var(--expense)" opacity="0.85" />
        <text x="84" y="0" fontSize="9" fill="var(--muted)">Gastos</text>
      </g>
    </svg>
  )
}

function DonutChart({ income, expense }) {
  const total = income + expense
  if (total === 0) return null

  const r = 48
  const cx = 70, cy = 65
  const circumference = 2 * Math.PI * r
  const incPct = income / total
  const expPct = expense / total
  const incDash = incPct * circumference
  const expDash = expPct * circumference
  const incOffset = 0
  const expOffset = -incDash

  return (
    <svg width="140" height="130" viewBox="0 0 140 130">
      {/* Background circle */}
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--border)" strokeWidth="18" />
      {/* Income arc */}
      <circle
        cx={cx} cy={cy} r={r}
        fill="none"
        stroke="var(--income)"
        strokeWidth="18"
        strokeDasharray={`${incDash} ${circumference - incDash}`}
        strokeDashoffset={circumference / 4}
        opacity="0.85"
      />
      {/* Expense arc */}
      <circle
        cx={cx} cy={cy} r={r}
        fill="none"
        stroke="var(--expense)"
        strokeWidth="18"
        strokeDasharray={`${expDash} ${circumference - expDash}`}
        strokeDashoffset={circumference / 4 - incDash}
        opacity="0.85"
      />
      {/* Center text */}
      <text x={cx} y={cy - 5} textAnchor="middle" fontSize="11" fill="var(--muted)" fontWeight="600">Balance</text>
      <text x={cx} y={cy + 11} textAnchor="middle" fontSize="10"
        fill={income >= expense ? 'var(--income)' : 'var(--expense)'}
        fontWeight="800"
      >
        {income >= expense ? '+' : '-'}{Math.round(Math.abs(income - expense) / total * 100)}%
      </text>
      {/* Legend */}
      <rect x="6" y="118" width="9" height="9" rx="2" fill="var(--income)" opacity="0.85" />
      <text x="18" y="126" fontSize="9" fill="var(--muted)">{Math.round(incPct * 100)}% ent.</text>
      <rect x="72" y="118" width="9" height="9" rx="2" fill="var(--expense)" opacity="0.85" />
      <text x="84" y="126" fontSize="9" fill="var(--muted)">{Math.round(expPct * 100)}% gast.</text>
    </svg>
  )
}

export default function Reports({ transactions }) {
  const months = useMemo(() => getMonthlyData(transactions), [transactions])

  const totalIncome  = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
  const balance      = totalIncome - totalExpense

  if (transactions.length === 0) {
    return (
      <div className="panel empty" style={{ padding: '3rem 1rem' }}>
        📊 Aún no hay transacciones para mostrar reportes.<br />
        <span style={{ fontSize: '.8rem' }}>Agrega entradas o gastos en la pestaña Balance.</span>
      </div>
    )
  }

  return (
    <>
      <div className="sec-ttl" style={{ marginBottom: '.9rem' }}>📈 Reportes</div>

      {/* Resumen global */}
      <div className="panel" style={{ marginBottom: '1rem' }}>
        <div className="panel-title" style={{ marginBottom: '1rem' }}>Resumen general</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
          <DonutChart income={totalIncome} expense={totalExpense} />
          <div style={{ flex: 1, minWidth: 140 }}>
            <div style={{ marginBottom: '.75rem' }}>
              <div style={{ fontSize: '.72rem', fontWeight: 800, color: 'var(--income)', textTransform: 'uppercase', letterSpacing: '.05em' }}>Total Entradas</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--income)' }}>{cur(totalIncome)}</div>
            </div>
            <div style={{ marginBottom: '.75rem' }}>
              <div style={{ fontSize: '.72rem', fontWeight: 800, color: 'var(--expense)', textTransform: 'uppercase', letterSpacing: '.05em' }}>Total Gastos</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--expense)' }}>{cur(totalExpense)}</div>
            </div>
            <div>
              <div style={{ fontSize: '.72rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '.05em' }}>Balance</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 900, color: balance >= 0 ? 'var(--income)' : 'var(--expense)' }}>
                {balance >= 0 ? '+' : '-'}{cur(Math.abs(balance))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Gráfica de barras por mes */}
      {months.length > 0 && (
        <div className="panel" style={{ marginBottom: '1rem', overflowX: 'auto' }}>
          <div className="panel-title" style={{ marginBottom: '1rem' }}>Entradas vs Gastos por mes</div>
          <div style={{ minWidth: Math.max(300, months.length * 80) }}>
            <BarChart months={months} />
          </div>
        </div>
      )}

      {/* Tabla detallada por mes */}
      <div className="panel">
        <div className="panel-title" style={{ marginBottom: '1rem' }}>Detalle mensual</div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.82rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border)' }}>
                <th style={{ textAlign: 'left', padding: '.5rem .6rem', color: 'var(--muted)', fontWeight: 700 }}>Mes</th>
                <th style={{ textAlign: 'right', padding: '.5rem .6rem', color: 'var(--income)', fontWeight: 700 }}>Entradas</th>
                <th style={{ textAlign: 'right', padding: '.5rem .6rem', color: 'var(--expense)', fontWeight: 700 }}>Gastos</th>
                <th style={{ textAlign: 'right', padding: '.5rem .6rem', color: 'var(--primary)', fontWeight: 700 }}>Balance</th>
              </tr>
            </thead>
            <tbody>
              {months.map((m, i) => {
                const bal = m.income - m.expense
                return (
                  <tr key={m.key} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg)' }}>
                    <td style={{ padding: '.5rem .6rem', fontWeight: 600 }}>
                      {MONTH_NAMES[m.month - 1]} {m.year}
                    </td>
                    <td style={{ padding: '.5rem .6rem', textAlign: 'right', color: 'var(--income)', fontWeight: 700 }}>
                      {cur(m.income)}
                    </td>
                    <td style={{ padding: '.5rem .6rem', textAlign: 'right', color: 'var(--expense)', fontWeight: 700 }}>
                      {cur(m.expense)}
                    </td>
                    <td style={{ padding: '.5rem .6rem', textAlign: 'right', fontWeight: 800, color: bal >= 0 ? 'var(--income)' : 'var(--expense)' }}>
                      {bal >= 0 ? '+' : ''}{cur(bal)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
