'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import type { BarcodeItem } from './types'
import { INITIAL_ITEMS } from './data'
import { BarcodeHeader, BarcodeScanCard, BarcodeKpiCards, BarcodeTableSection, BarcodeFormDialog } from './components'

export function Barkod() {
  const [items, setItems] = useState<BarcodeItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [catFilter, setCatFilter] = useState('')
  const [scanInput, setScanInput] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<BarcodeItem | null>(null)
  const [formData, setFormData] = useState({ code: '', type: 'EAN13' as BarcodeItem['type'], productName: '', productId: '', category: '' })
  const [printMode, setPrintMode] = useState(false)
  const [selectedForPrint, setSelectedForPrint] = useState<Set<string>>(new Set())

  useEffect(() => { setLoading(true); setTimeout(() => { setItems(INITIAL_ITEMS); setLoading(false) }, 200) }, [])

  const categories = [...new Set(items.map(i => i.category))]

  const filtered = items.filter(i => {
    const matchSearch = !search || i.code.includes(search) || i.productName.toLowerCase().includes(search.toLowerCase())
    const matchType = !typeFilter || i.type === typeFilter
    const matchCat = !catFilter || i.category === catFilter
    return matchSearch && matchType && matchCat
  })

  const handleScan = () => {
    if (!scanInput) return
    const found = items.find(i => i.code === scanInput)
    if (found) { toast.success(`Pronađeno: ${found.productName}`, { description: found.code }) }
    else { toast.error('Barkod nije pronađen', { description: scanInput }) }
    setScanInput('')
  }

  const handleNew = () => { setEditing(null); setFormData({ code: '', type: 'EAN13', productName: '', productId: '', category: '' }); setDialogOpen(true) }
  const handleEdit = (item: BarcodeItem) => { setEditing(item); setFormData({ code: item.code, type: item.type, productName: item.productName, productId: item.productId, category: item.category }); setDialogOpen(true) }

  const handleSave = () => {
    if (!formData.code || !formData.productName) { toast.error('Popunite sva polja'); return }
    if (editing) {
      setItems(prev => prev.map(i => i.id === editing.id ? { ...i, ...formData } : i))
      toast.success('Barkod ažuriran')
    } else {
      setItems(prev => [{ id: `bc-${Date.now()}`, ...formData, createdAt: new Date().toISOString() }, ...prev])
      toast.success('Barkod kreiran')
    }
    setDialogOpen(false)
  }

  const handleDelete = (id: string) => {
    if (!confirm('Obrisati barkod?')) return
    setItems(prev => prev.filter(i => i.id !== id))
    toast.success('Barkod obrisan')
  }

  const togglePrint = (id: string) => {
    const next = new Set(selectedForPrint)
    if (next.has(id)) next.delete(id); else next.add(id)
    setSelectedForPrint(next)
  }

  const handleGenerate = (type: BarcodeItem['type']) => {
    let code = ''
    if (type === 'EAN13') code = '860' + String(Math.floor(Math.random() * 10000000000)).padStart(10, '0')
    else if (type === 'EAN8') code = '860' + String(Math.floor(Math.random() * 10000)).padStart(4, '0')
    else if (type === 'QR') code = `QR-${Date.now()}`
    else code = `CODE128-${Math.floor(Math.random() * 9999)}`
    setFormData(prev => ({ ...prev, code, type }))
  }

  if (loading) return <div className="space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-64" /></div>

  return (
    <div className="space-y-6">
      <BarcodeHeader
        selectedForPrint={selectedForPrint}
        onNew={handleNew}
        onPrint={() => { toast.success(`Štampa ${selectedForPrint.size} barkodova...`); setSelectedForPrint(new Set()) }}
      />

      <BarcodeScanCard scanInput={scanInput} setScanInput={setScanInput} onScan={handleScan} />

      <BarcodeKpiCards items={items} categories={categories} />

      <BarcodeTableSection
        filtered={filtered}
        categories={categories}
        search={search}
        typeFilter={typeFilter}
        catFilter={catFilter}
        setSearch={setSearch}
        setTypeFilter={setTypeFilter}
        setCatFilter={setCatFilter}
        selectedForPrint={selectedForPrint}
        onTogglePrint={togglePrint}
        onPrint={() => {}}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onPrintItem={() => toast.info('Barkod generisan za stampu...')}
      />

      <BarcodeFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editing={editing}
        formData={formData}
        setFormData={setFormData}
        onSave={handleSave}
        onGenerate={handleGenerate}
      />
    </div>
  )
}
