import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { cur, fmtDate, today } from './helpers'

export function exportPDF(data) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const inc = data.transactions.filter(t => t.type === 'income')
  const exp = data.transactions.filter(t => t.type === 'expense')
  const tI = inc.reduce((s, t) => s + t.amount, 0)
  const tE = exp.reduce((s, t) => s + t.amount, 0)
  const bal = tI - tE

  const now = new Date().toLocaleDateString('es-MX', { dateStyle: 'full' })
  let y = 15

  // Header
  doc.setFillColor(37, 99, 235)
  doc.rect(0, 0, 210, 30, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text('🚚 Gastos Choferes', 14, 18)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text(`Reporte generado: ${now}`, 14, 26)
  y = 40

  // Summary boxes
  const boxW = 57, boxH = 22
  // Income box
  doc.setFillColor(220, 252, 231)
  doc.roundedRect(14, y, boxW, boxH, 4, 4, 'F')
  doc.setTextColor(22, 163, 74)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  doc.text('TOTAL ENTRADAS', 14 + boxW/2, y + 7, { align: 'center' })
  doc.setFontSize(14)
  doc.text(cur(tI), 14 + boxW/2, y + 15, { align: 'center' })
  doc.setFontSize(7)
  doc.text(`${inc.length} registros`, 14 + boxW/2, y + 20, { align: 'center' })

  // Expense box
  doc.setFillColor(254, 226, 226)
  doc.roundedRect(76, y, boxW, boxH, 4, 4, 'F')
  doc.setTextColor(220, 38, 38)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  doc.text('TOTAL GASTOS', 76 + boxW/2, y + 7, { align: 'center' })
  doc.setFontSize(14)
  doc.text(cur(tE), 76 + boxW/2, y + 15, { align: 'center' })
  doc.setFontSize(7)
  doc.text(`${exp.length} registros`, 76 + boxW/2, y + 20, { align: 'center' })

  // Balance box
  doc.setFillColor(219, 234, 254)
  doc.roundedRect(138, y, boxW, boxH, 4, 4, 'F')
  doc.setTextColor(bal >= 0 ? 22 : 220, bal >= 0 ? 163 : 38, bal >= 0 ? 74 : 38)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  doc.text('BALANCE', 138 + boxW/2, y + 7, { align: 'center' })
  doc.setFontSize(14)
  doc.text(cur(Math.abs(bal)), 138 + boxW/2, y + 15, { align: 'center' })
  doc.setFontSize(7)
  doc.text(bal >= 0 ? 'Positivo' : 'Negativo', 138 + boxW/2, y + 20, { align: 'center' })
  y += boxH + 10

  // Entradas table
  if (inc.length > 0) {
    doc.setTextColor(22, 163, 74)
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text('↗ Entradas', 14, y)
    y += 2
    autoTable(doc, {
      startY: y,
      head: [['Descripción', 'Monto', 'Fecha']],
      body: inc.map(t => [t.desc, cur(t.amount), fmtDate(t.date)]),
      styles: { fontSize: 9 },
      headStyles: { fillColor: [220, 252, 231], textColor: [22, 163, 74], fontStyle: 'bold' },
      columnStyles: { 1: { halign: 'right', textColor: [22, 163, 74] }, 2: { halign: 'right' } },
      margin: { left: 14, right: 14 },
    })
    y = doc.lastAutoTable.finalY + 8
  }

  // Gastos table
  if (exp.length > 0) {
    if (y > 220) { doc.addPage(); y = 15 }
    doc.setTextColor(220, 38, 38)
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text('↘ Gastos', 14, y)
    y += 2
    autoTable(doc, {
      startY: y,
      head: [['Descripción', 'Monto', 'Fecha']],
      body: exp.map(t => [t.desc, cur(t.amount), fmtDate(t.date)]),
      styles: { fontSize: 9 },
      headStyles: { fillColor: [254, 226, 226], textColor: [220, 38, 38], fontStyle: 'bold' },
      columnStyles: { 1: { halign: 'right', textColor: [220, 38, 38] }, 2: { halign: 'right' } },
      margin: { left: 14, right: 14 },
    })
  }

  doc.save(`gastos_choferes_${today()}.pdf`)
}
