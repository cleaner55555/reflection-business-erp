'use client'

import { useCallback, useEffect, useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table'
'use client'

import { useCallback, useEffect, useState } from 'react'

import { AlertTriangle, ArrowDownToLine, BarChart3, CheckCircle2, ChevronRight, Clock, Layers, MapPin, Play, Plus, Printer, ScanBarcode, Search, Trash2, Warehouse } from 'lucide-react'

function BarkodiTab() {
  const [products, setProducts] = useState<Array<{ id: string; name: string; sku: string; barcode: string | null; currentStock: number }>>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [scanInput, setScanInput] = useState('')
  const [selectedProduct, setSelectedProduct] = useState<typeof products[0] | null>(null)

  useEffect(() => {
    fetch('/api/products').then(r => r.json()).then(data => { setProducts(data); setLoading(false) })
  }, [])

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.sku.toLowerCase().includes(search.toLowerCase()) ||
    (p.barcode || '').includes(search)
  )

  const handleScan = useCallback(() => {
    if (!scanInput) return
    const found = products.find(p =>
      p.barcode === scanInput || p.sku === scanInput
    )
    if (found) {
      setSelectedProduct(found)
      toast.success(`Pronađeno: ${found.name}`)
    } else {
      toast.error(`Nije pronađeno: ${scanInput}`)
    }
    setScanInput('')
  }, [scanInput, products])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && scanInput) handleScan()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [scanInput, handleScan])

  const handlePrintLabels = (product: typeof products[0]) => {
    const svgUrl = `/api/barcodes/generate?data=${encodeURIComponent(product.barcode || product.sku)}&type=code128&width=200&height=70`
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(`
        <html><head><title>Label: ${product.name}</title>
        <style>body{font-family:monospace;text-align:center;padding:20px}
        .label{border:1px dashed #000;padding:15px;margin:10px auto;width:250px;page-break-after:always}
        h3{margin:0 0 5px;font-size:14px}p{margin:2px 0;font-size:11px}</style></head><body>
        <div class="label"><h3>${product.name}</h3>
        <p>SKU: ${product.sku}</p>
        <img src="${svgUrl}" width="200" height="70"/><p>Stanje: ${product.currentStock}</p></div>
        <script>window.onload=()=>{window.print();window.close()}<\/script></body></html>
      `)
      printWindow.document.close()
    }
  }

  if (loading) return <div className="space-y-4">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16" />)}</div>

  return (
    <div className="space-y-4">
      {/* Scanner input */}
      <Card className="border-dashed border-2 border-emerald-300 bg-emerald-50/30">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <ScanBarcode className="h-6 w-6 text-emerald-600" />
            <div className="flex-1">
              <Label className="text-xs font-semibold text-emerald-700">Skeniranje barkoda / Šifre</Label>
              <Input
                className="mt-1 h-10 text-lg font-mono"
                placeholder="Skeniraj barkod ili unesi šifru..."
                value={scanInput}
                onChange={e => setScanInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleScan()}
                autoFocus
              />
            </div>
            <Button className="h-10 gap-2" onClick={handleScan}>
              <Search className="h-4 w-4" /> Traži
            </Button>
          </div>
          {selectedProduct && (
            <div className="mt-3 p-3 bg-white rounded-lg border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                <div>
                  <p className="font-medium text-sm">{selectedProduct.name}</p>
                  <p className="text-xs text-muted-foreground">SKU: {selectedProduct.sku} | Stanje: {selectedProduct.currentStock}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="gap-1" onClick={() => handlePrintLabels(selectedProduct)}>
                  <Printer className="h-3.5 w-3.5" /> Štampaj
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setSelectedProduct(null)}>✕</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Product list with barcodes */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <BarChart3 className="h-4 w-4" /> {filtered.length} proizvoda
        </div>
        <div className="relative max-w-xs">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input className="pl-8 h-9" placeholder="Pretraži..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {filtered.slice(0, 24).map(p => (
          <Card key={p.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedProduct(p)}>
            <CardContent className="p-3">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{p.name}</p>
                  <p className="text-xs text-muted-foreground font-mono">{p.sku}</p>
                </div>
                <Badge variant={p.currentStock <= 0 ? 'destructive' : p.currentStock <= 5 ? 'secondary' : 'outline'} className="text-[10px]">
                  {p.currentStock}
                </Badge>
              </div>
              <div className="flex items-center justify-center py-2 bg-white rounded border">
                <img
                  src={`/api/barcodes/generate?data=${encodeURIComponent(p.barcode || p.sku)}&type=code128&width=150&height=50`}
                  alt={p.barcode || p.sku}
                  className="h-10 w-auto"
                />
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-[10px] text-muted-foreground">{p.barcode || 'Nema barkoda'}</span>
                <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={e => { e.stopPropagation(); handlePrintLabels(p) }}>
                  <Printer className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

function ZoneMapTab() {
  const [locations, setLocations] = useState<Array<{
    id: string; name: string; code: string; type: string; zone: string;
    row: number; col: number; capacity: number; isActive: boolean;
    _count?: { children: number; stockMovements: number; lots: number }
  }>>([])
  const [loading, setLoading] = useState(true)
  const [selectedZone, setSelectedZone] = useState('all')

  useEffect(() => {
    fetch('/api/warehouse-locations').then(r => r.json()).then(data => { setLocations(data); setLoading(false) })
  }, [])

  const filtered = selectedZone === 'all' ? locations : locations.filter(l => l.zone === selectedZone)

  const zoneCounts = ZONE_CONFIG.map(z => ({
    ...z,
    count: locations.filter(l => l.zone === z.value).length,
  }))

  const getZoneColor = (zone: string) => ZONE_CONFIG.find(z => z.value === zone)?.color || 'bg-gray-400'
  const getZoneLight = (zone: string) => ZONE_CONFIG.find(z => z.value === zone)?.light || 'bg-gray-100 text-gray-700'

  const maxRow = Math.max(...filtered.map(l => l.row), 1)
  const maxCol = Math.max(...filtered.map(l => l.col), 1)

  // Build grid
  const grid: typeof filtered = []
  for (let r = 0; r <= maxRow; r++) {
    for (let c = 0; c <= maxCol; c++) {
      const loc = filtered.find(l => l.row === r && l.col === c)
      if (loc) grid.push(loc)
    }
  }

  if (loading) return <div className="space-y-4"><Skeleton className="h-96" /></div>

  return (
    <div className="space-y-4">
      {/* Zone summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
        <Card className={`p-2 text-center cursor-pointer ${selectedZone === 'all' ? 'ring-2 ring-primary' : ''}`} onClick={() => setSelectedZone('all')}>
          <p className="text-lg font-bold">{locations.length}</p>
          <p className="text-[10px] text-muted-foreground">Ukupno</p>
        </Card>
        {zoneCounts.map(z => (
          <Card key={z.value} className={`p-2 text-center cursor-pointer ${selectedZone === z.value ? 'ring-2 ring-primary' : ''}`} onClick={() => setSelectedZone(selectedZone === z.value ? 'all' : z.value)}>
            <p className="text-lg font-bold">{z.count}</p>
            <p className="text-[10px] text-muted-foreground">{z.label}</p>
          </Card>
        ))}
      </div>

      {/* Visual grid map */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <MapPin className="h-4 w-4" /> Vizuelna mapa magacina
          </CardTitle>
        </CardHeader>
        <CardContent>
          {grid.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Warehouse className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Nema lokacija sa pozicijama (row/col)</p>
              <p className="text-xs mt-1">Podesite red i kolonu u lokacijama za prikaz mape</p>
            </div>
          ) : (
            <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${maxCol + 1}, minmax(0, 1fr))` }}>
              {Array.from({ length: (maxRow + 1) * (maxCol + 1) }, (_, i) => {
                const r = Math.floor(i / (maxCol + 1))
                const c = i % (maxCol + 1)
                const loc = grid.find(l => l.row === r && l.col === c)
                if (!loc) return <div key={i} />
                return (
                  <div key={loc.id} className={`rounded-lg p-2 border text-center transition-all hover:shadow-md cursor-pointer ${getZoneLight(loc.zone)}`}>
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <div className={`w-2 h-2 rounded-full ${getZoneColor(loc.zone)}`} />
                      <span className="text-[10px] font-mono font-medium">{loc.code}</span>
                    </div>
                    <p className="text-[10px] truncate">{loc.name}</p>
                    <p className="text-[9px] opacity-70">{loc._count?.lots || 0} lotova</p>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Location list */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Lokacije po zonama ({filtered.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-h-64 overflow-y-auto">
            <Table>
              <TableHeader><TableRow>
                <TableHead className="text-xs">Šifra</TableHead>
                <TableHead className="text-xs">Naziv</TableHead>
                <TableHead className="text-xs">Tip</TableHead>
                <TableHead className="text-xs">Zona</TableHead>
                <TableHead className="text-xs">Pozicija</TableHead>
                <TableHead className="text-xs text-center">Lotova</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {filtered.map(loc => (
                  <TableRow key={loc.id}>
                    <TableCell className="text-xs font-mono">{loc.code}</TableCell>
                    <TableCell className="text-xs">{loc.name}</TableCell>
                    <TableCell className="text-xs"><Badge variant="outline" className="text-[10px]">{loc.type}</Badge></TableCell>
                    <TableCell className="text-xs"><Badge variant="outline" className={`text-[10px] ${getZoneLight(loc.zone)}`}>{ZONE_CONFIG.find(z => z.value === loc.zone)?.label || loc.zone}</Badge></TableCell>
                    <TableCell className="text-xs font-mono">{loc.row},{loc.col}</TableCell>
                    <TableCell className="text-xs text-center">{loc._count?.lots || 0}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function PickingTab() {
  const [waves, setWaves] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [activeWaveId, setActiveWaveId] = useState<string | null>(null)
  const [newLines, setNewLines] = useState<Array<{ productId: string; productName: string; quantity: number }>>([])

  useEffect(() => {
    Promise.all([fetch('/api/wms/waves'), fetch('/api/products')]).then(([w, p]) => {
      setWaves(w.ok ? [] : [])
      setProducts(p.ok ? [] : [])
      return Promise.all([w.json(), p.json()])
    }).then(([w, p]) => { setWaves(w); setProducts(p); setLoading(false) })
  }, [])

  const handleCreateWave = async () => {
    if (newLines.length === 0) { toast.error('Dodaj bar jednu stavku'); return }
    const res = await fetch('/api/wms/waves', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lines: newLines }),
    })
    if (res.ok) {
      const wave = await res.json()
      toast.success(`Wave ${wave.name} kreirana`)
      setShowCreate(false); setNewLines([])
      const wRes = await fetch('/api/wms/waves'); setWaves(await wRes.json())
    }
  }

  const handleStartWave = async (id: string) => {
    await fetch(`/api/wms/waves/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'u_toku' }) })
    const wRes = await fetch('/api/wms/waves'); setWaves(await wRes.json())
    toast.success('Wave pokrenuta')
  }

  const handlePickLine = async (waveId: string, lineId: string) => {
    const qty = prompt('Količina pokupljena:')
    if (!qty) return
    await fetch(`/api/wms/waves/${waveId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pickedLineId: lineId, pickedQty: parseFloat(qty) }),
    })
    const wRes = await fetch('/api/wms/waves'); setWaves(await wRes.json())
    toast.success('Stavka pokupljena')
  }

  const statusBadge = (s: string) => {
    switch (s) {
      case 'nacrt': return <Badge variant="outline">Nacrt</Badge>
      case 'u_toku': return <Badge className="bg-blue-100 text-blue-700">U toku</Badge>
      case 'zakljucana': return <Badge className="bg-amber-100 text-amber-700">Zaključana</Badge>
      case 'zavrsena': return <Badge className="bg-emerald-100 text-emerald-700">Završena</Badge>
      default: return <Badge>{s}</Badge>
    }
  }

  const addLine = () => setNewLines([...newLines, { productId: '', productName: '', quantity: 1 }])
  const removeLine = (i: number) => setNewLines(newLines.filter((_, idx) => idx !== i))

  if (loading) return <div className="space-y-4"><Skeleton className="h-64" /></div>

  const activeWave = activeWaveId ? waves.find(w => w.id === activeWaveId) : null

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <Layers className="h-4 w-4" />
          <span>{waves.length} wave-ova</span>
          <Badge variant="outline">{waves.filter(w => w.status === 'u_toku').length} aktivnih</Badge>
        </div>
        <Button size="sm" className="gap-1.5" onClick={() => setShowCreate(true)}>
          <Plus className="h-3.5 w-3.5" /> Nova wave
        </Button>
      </div>

      {/* Create dialog */}
      {showCreate && (
        <Card className="p-4 border-dashed">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Nova Pick Wave</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {newLines.map((line, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Select value={line.productId} onValueChange={v => {
                    const p = products.find(pr => pr.id === v)
                    setNewLines(newLines.map((l, idx) => idx === i ? { ...l, productId: v, productName: p?.name || '' } : l))
                  }}>
                    <SelectTrigger className="flex-1 h-9"><SelectValue placeholder="Proizvod" /></SelectTrigger>
                    <SelectContent>{products.filter(p => p.currentStock > 0).map(p => <SelectItem key={p.id} value={p.id}>{p.sku} - {p.name} ({p.currentStock})</SelectItem>)}</SelectContent>
                  </Select>
                  <Input type="number" min={1} value={line.quantity} onChange={e => setNewLines(newLines.map((l, idx) => idx === i ? { ...l, quantity: parseInt(e.target.value) || 1 } : l))} className="w-20 h-9" />
                  <Button variant="ghost" size="sm" className="h-9 w-9 p-0 text-red-500" onClick={() => removeLine(i)}><Trash2 className="h-3.5 w-3.5" /></Button>
                </div>
              ))}
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={addLine}><Plus className="h-3.5 w-3.5" /> Dodaj stavku</Button>
                <Button size="sm" onClick={handleCreateWave} disabled={newLines.length === 0}>Kreiraj wave</Button>
                <Button size="sm" variant="ghost" onClick={() => setShowCreate(false)}>Otkaži</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active wave detail */}
      {activeWave && (
        <Card className="border-blue-200">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CardTitle className="text-sm font-semibold">{activeWave.name}</CardTitle>
                {statusBadge(activeWave.status)}
                <Badge variant="outline" className="text-[10px]">{activeWave.progress}%</Badge>
              </div>
              <Button size="sm" variant="ghost" onClick={() => setActiveWaveId(null)}>Zatvori</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {activeWave.lines.map((line: any) => (
                <div key={line.id} className="flex items-center justify-between p-2 rounded hover:bg-muted/50 border">
                  <div className="flex items-center gap-3">
                    {line.status === 'pokupljeno' ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    ) : line.status === 'nedostaje' ? (
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                    ) : (
                      <Clock className="h-4 w-4 text-muted-foreground" />
                    )}
                    <div>
                      <p className="text-xs font-medium">{line.productName}</p>
                      <p className="text-[10px] text-muted-foreground">Lokacija: {line.locationCode || 'Nije dodeljena'} | Lot: {line.lotNumber || '-'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs">{line.pickedQty}/{line.quantity}</span>
                    {activeWave.status === 'u_toku' && line.status !== 'pokupljeno' && (
                      <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => handlePickLine(activeWave.id, line.id)}>
                        Pokupi
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {activeWave.progress > 0 && (
              <div className="mt-3">
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 transition-all" style={{ width: `${activeWave.progress}%` }} />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Waves list */}
      <div className="space-y-2">
        {waves.map(wave => (
          <Card key={wave.id} className="cursor-pointer hover:shadow-sm transition-shadow" onClick={() => setActiveWaveId(wave.id === activeWaveId ? null : wave.id)}>
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {statusBadge(wave.status)}
                  <div>
                    <p className="text-sm font-medium">{wave.name}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {wave.totalLines} stavki | {wave.completedLines}/{wave.totalLines} pokupljeno
                      {wave.priority !== 'srednji' && ` | Prioritet: ${wave.priority}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-16">
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 transition-all" style={{ width: `${wave.progress}%` }} />
                    </div>
                    <p className="text-[9px] text-muted-foreground text-center mt-0.5">{wave.progress}%</p>
                  </div>
                  {wave.status === 'nacrt' && (
                    <Button size="sm" className="h-7 gap-1" onClick={e => { e.stopPropagation(); handleStartWave(wave.id) }}>
                      <Play className="h-3 w-3" /> Pokreni
                    </Button>
                  )}
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {waves.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Layers className="h-10 w-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">Nema wave-ova. Kreirajte novu wave za početak.</p>
          </div>
        )}
      </div>
    </div>
  )
}

function PrijemTab() {
  const [orders, setOrders] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [locations, setLocations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null)
  const [newLines, setNewLines] = useState<Array<{ productId: string; productName: string; expectedQty: number; unitCost: number }>>([])
  const [receiveMode, setReceiveMode] = useState<{ orderId: string; lineId: string } | null>(null)
  const [receiveQty, setReceiveQty] = useState(0)
  const [receiveLot, setReceiveLot] = useState('')
  const [receiveExpiry, setReceiveExpiry] = useState('')
  const [receiveLocation, setReceiveLocation] = useState('')

  const loadData = useCallback(async () => {
    const [o, p, l] = await Promise.all([
      fetch('/api/wms/receiving').then(r => r.json()),
      fetch('/api/products').then(r => r.json()),
      fetch('/api/warehouse-locations').then(r => r.json()),
    ])
    setOrders(o); setProducts(p); setLocations(l); setLoading(false)
  }, [])

  useEffect(() => { loadData() }, [])  

  const handleCreate = async () => {
    const res = await fetch('/api/wms/receiving', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lines: newLines }),
    })
    if (res.ok) { toast.success('Nalog za prijem kreiran'); setShowCreate(false); setNewLines([]); loadData() }
  }

  const handleStartReceiving = async (id: string) => {
    await fetch(`/api/wms/receiving/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'u_toku' }) })
    loadData(); toast.success('Prijem započet')
  }

  const handleReceiveLine = async () => {
    if (!receiveMode) return
    await fetch(`/api/wms/receiving/${receiveMode.orderId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        receiveLineId: receiveMode.lineId,
        receivedQty: receiveQty,
        lotNumber: receiveLot || null,
        expiryDate: receiveExpiry || null,
        locationId: receiveLocation || null,
      }),
    })
    setReceiveMode(null); setReceiveQty(0); setReceiveLot(''); setReceiveExpiry(''); setReceiveLocation('')
    loadData(); toast.success('Roba primljena')
  }

  const handleFinish = async (id: string) => {
    await fetch(`/api/wms/receiving/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'završen' }) })
    loadData(); toast.success('Prijem završen')
  }

  const statusBadge = (s: string) => {
    switch (s) {
      case 'nacrt': return <Badge variant="outline">Nacrt</Badge>
      case 'u_toku': return <Badge className="bg-blue-100 text-blue-700">U toku</Badge>
      case 'završen': return <Badge className="bg-emerald-100 text-emerald-700">Završen</Badge>
      default: return <Badge>{s}</Badge>
    }
  }

  const activeOrder = activeOrderId ? orders.find(o => o.id === activeOrderId) : null

  if (loading) return <div className="space-y-4"><Skeleton className="h-64" /></div>

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <ArrowDownToLine className="h-4 w-4" />
          <span>{orders.length} naloga</span>
          <Badge variant="outline">{orders.filter(o => o.status === 'u_toku').length} aktivnih</Badge>
        </div>
        <Button size="sm" className="gap-1.5" onClick={() => setShowCreate(true)}>
          <Plus className="h-3.5 w-3.5" /> Novi prijem
        </Button>
      </div>

      {/* Create */}
      {showCreate && (
        <Card className="p-4 border-dashed">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Novi nalog za prijem</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {newLines.map((line, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Select value={line.productId} onValueChange={v => {
                    const p = products.find(pr => pr.id === v)
                    setNewLines(newLines.map((l, idx) => idx === i ? { ...l, productId: v, productName: p?.name || '', unitCost: p?.purchasePrice || 0 } : l))
                  }}>
                    <SelectTrigger className="flex-1 h-9"><SelectValue placeholder="Proizvod" /></SelectTrigger>
                    <SelectContent>{products.map(p => <SelectItem key={p.id} value={p.id}>{p.sku} - {p.name}</SelectItem>)}</SelectContent>
                  </Select>
                  <Input type="number" min={1} placeholder="Količina" value={line.expectedQty} onChange={e => setNewLines(newLines.map((l, idx) => idx === i ? { ...l, expectedQty: parseInt(e.target.value) || 1 } : l))} className="w-24 h-9" />
                  <Input type="number" step="0.01" placeholder="Cena" value={line.unitCost} onChange={e => setNewLines(newLines.map((l, idx) => idx === i ? { ...l, unitCost: parseFloat(e.target.value) || 0 } : l))} className="w-24 h-9" />
                  <Button variant="ghost" size="sm" className="h-9 w-9 p-0 text-red-500" onClick={() => setNewLines(newLines.filter((_, idx) => idx !== i))}><Trash2 className="h-3.5 w-3.5" /></Button>
                </div>
              ))}
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => setNewLines([...newLines, { productId: '', productName: '', expectedQty: 1, unitCost: 0 }])}><Plus className="h-3.5" /> Stavka</Button>
                <Button size="sm" onClick={handleCreate} disabled={newLines.length === 0}>Kreiraj</Button>
                <Button size="sm" variant="ghost" onClick={() => setShowCreate(false)}>Otkaži</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Receive dialog */}
      {receiveMode && (
        <Card className="p-4 border-blue-200">
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><ScanBarcode className="h-4 w-4" /> Primanje robe</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div><Label className="text-xs">Količina *</Label><Input type="number" min={0} value={receiveQty} onChange={e => setReceiveQty(parseFloat(e.target.value) || 0)} className="mt-1 h-9" /></div>
              <div><Label className="text-xs">Lot broj</Label><Input value={receiveLot} onChange={e => setReceiveLot(e.target.value)} className="mt-1 h-9" placeholder="LOT-001" /></div>
              <div><Label className="text-xs">Rok trajanja</Label><Input type="date" value={receiveExpiry} onChange={e => setReceiveExpiry(e.target.value)} className="mt-1 h-9" /></div>
              <div><Label className="text-xs">Lokacija</Label>
                <Select value={receiveLocation} onValueChange={setReceiveLocation}>
                  <SelectTrigger className="mt-1 h-9"><SelectValue placeholder="Izaberi..." /></SelectTrigger>
                  <SelectContent>{locations.filter(l => l.zone === 'skladistenje' || l.zone === 'prijem').map(l => <SelectItem key={l.id} value={l.id}>{l.code} - {l.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              <Button size="sm" onClick={handleReceiveLine} disabled={receiveQty <= 0}>Potvrdi prijem</Button>
              <Button size="sm" variant="ghost" onClick={() => setReceiveMode(null)}>Otkaži</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active order detail */}
      {activeOrder && (
        <Card className="border-blue-200">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CardTitle className="text-sm">{activeOrder.number}</CardTitle>
                {statusBadge(activeOrder.status)}
                <span className="text-xs text-muted-foreground">{activeOrder.partner?.name || 'Nema partnera'}</span>
              </div>
              <div className="flex gap-2">
                {activeOrder.status === 'u_toku' && <Button size="sm" onClick={() => handleFinish(activeOrder.id)}>Završi prijem</Button>}
                <Button size="sm" variant="ghost" onClick={() => setActiveOrderId(null)}>Zatvori</Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow>
                <TableHead className="text-xs">Proizvod</TableHead>
                <TableHead className="text-xs text-right">Očekivano</TableHead>
                <TableHead className="text-xs text-right">Primljeno</TableHead>
                <TableHead className="text-xs">Lot</TableHead>
                <TableHead className="text-xs">Akcija</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {activeOrder.lines.map((line: any) => (
                  <TableRow key={line.id}>
                    <TableCell className="text-xs">{line.productName}</TableCell>
                    <TableCell className="text-xs text-right">{line.expectedQty}</TableCell>
                    <TableCell className={`text-xs text-right font-medium ${line.receivedQty > 0 ? 'text-emerald-600' : ''}`}>{line.receivedQty || 0}</TableCell>
                    <TableCell className="text-xs font-mono">{line.lotNumber || '-'}</TableCell>
                    <TableCell>
                      {activeOrder.status === 'u_toku' && (
                        <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => setReceiveMode({ orderId: activeOrder.id, lineId: line.id })}>
                          <ScanBarcode className="h-3 w-3" /> Primi
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Orders list */}
      <div className="space-y-2">
        {orders.map(order => (
          <Card key={order.id} className="cursor-pointer hover:shadow-sm" onClick={() => setActiveOrderId(order.id === activeOrderId ? null : order.id)}>
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {statusBadge(order.status)}
                  <div>
                    <p className="text-sm font-medium">{order.number}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {order.lines?.length || 0} stavki | {order.partner?.name || 'Nema partnera'} | {order.documentRef || ''}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {order.status === 'nacrt' && (
                    <Button size="sm" className="h-7 gap-1" onClick={e => { e.stopPropagation(); handleStartReceiving(order.id) }}>
                      <Play className="h-3 w-3" /> Pokreni
                    </Button>
                  )}
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {orders.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <ArrowDownToLine className="h-10 w-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">Nema naloga za prijem</p>
          </div>
        )}
      </div>
    </div>
  )
}
