export const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.sku.toLowerCase().includes(search.toLowerCase()) ||
    (p.barcode || '').includes(search)
  );

export const found = products.find(p =>
      p.barcode === scanInput || p.sku === scanInput
    );

export const handler = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && scanInput) handleScan()
    }

export const handlePrintLabels = (product: typeof products[0]) => {
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

export const ZONE_CONFIG = [
  { value: 'prijem', label: 'Prijem', color: 'bg-blue-500', light: 'bg-blue-100 text-blue-700 border-blue-300' },
  { value: 'skladistenje', label: 'Skladištenje', color: 'bg-emerald-500', light: 'bg-emerald-100 text-emerald-700 border-emerald-300' },
  { value: 'otprema', label: 'Otprema', color: 'bg-amber-500', light: 'bg-amber-100 text-amber-700 border-amber-300' },
  { value: 'kontrola', label: 'Kontrola', color: 'bg-purple-500', light: 'bg-purple-100 text-purple-700 border-purple-300' },
  { value: 'hladjenje', label: 'Hlađenje', color: 'bg-cyan-500', light: 'bg-cyan-100 text-cyan-700 border-cyan-300' },
  { value: 'return', label: 'Return', color: 'bg-rose-500', light: 'bg-rose-100 text-rose-700 border-rose-300' },
  { value: 'karantin', label: 'Karantin', color: 'bg-red-500', light: 'bg-red-100 text-red-700 border-red-300' },
]

export const filtered = selectedZone === 'all' ? locations : locations.filter(l => l.zone === selectedZone);

export const zoneCounts = ZONE_CONFIG.map(z => ({
    ...z,
    count: locations.filter(l => l.zone === z.value).length,
  }));

export const getZoneColor = (zone: string) => ZONE_CONFIG.find(z => z.value === zone)?.color || 'bg-gray-400';

export const getZoneLight = (zone: string) => ZONE_CONFIG.find(z => z.value === zone)?.light || 'bg-gray-100 text-gray-700';

export const maxRow = Math.max(...filtered.map(l => l.row), 1);

export const maxCol = Math.max(...filtered.map(l => l.col), 1);

export const grid: typeof filtered = []

export const loc = filtered.find(l => l.row === r && l.col === c);

export const r = Math.floor(i / (maxCol + 1));

export const c = i % (maxCol + 1);

export const loc = grid.find(l => l.row === r && l.col === c);

export const handleCreateWave = async () => {
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

export const handleStartWave = async (id: string) => {
    await fetch(`/api/wms/waves/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'u_toku' }) })
    const wRes = await fetch('/api/wms/waves'); setWaves(await wRes.json())
    toast.success('Wave pokrenuta')
  }

export const handlePickLine = async (waveId: string, lineId: string) => {
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

export const statusBadge = (s: string) => {
    switch (s) {
      case 'nacrt': return <Badge variant="outline">Nacrt</Badge>
      case 'u_toku': return <Badge className="bg-blue-100 text-blue-700">U toku</Badge>
      case 'zakljucana': return <Badge className="bg-amber-100 text-amber-700">Zaključana</Badge>
      case 'zavrsena': return <Badge className="bg-emerald-100 text-emerald-700">Završena</Badge>
      default: return <Badge>{s}</Badge>
    }
  }

export const addLine = () => setNewLines([...newLines, { productId: '', productName: '', quantity: 1 }]);

export const removeLine = (i: number) => setNewLines(newLines.filter((_, idx) => idx !== i));

export const activeWave = activeWaveId ? waves.find(w => w.id === activeWaveId) : null;

export const p = products.find(pr => pr.id === v);

export const [o, p, l] = await Promise.all([
      fetch('/api/wms/receiving').then(r => r.json()),
      fetch('/api/products').then(r => r.json()),
      fetch('/api/warehouse-locations').then(r => r.json()),
    ]);

export const handleCreate = async () => {
    const res = await fetch('/api/wms/receiving', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lines: newLines }),
    })
    if (res.ok) { toast.success('Nalog za prijem kreiran'); setShowCreate(false); setNewLines([]); loadData() }
  }

export const handleStartReceiving = async (id: string) => {
    await fetch(`/api/wms/receiving/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'u_toku' }) })
    loadData(); toast.success('Prijem započet')
  }

export const handleReceiveLine = async () => {
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

export const handleFinish = async (id: string) => {
    await fetch(`/api/wms/receiving/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'završen' }) })
    loadData(); toast.success('Prijem završen')
  }

export const statusBadge = (s: string) => {
    switch (s) {
      case 'nacrt': return <Badge variant="outline">Nacrt</Badge>
      case 'u_toku': return <Badge className="bg-blue-100 text-blue-700">U toku</Badge>
      case 'završen': return <Badge className="bg-emerald-100 text-emerald-700">Završen</Badge>
      default: return <Badge>{s}</Badge>
    }
  }

export const activeOrder = activeOrderId ? orders.find(o => o.id === activeOrderId) : null;

export const p = products.find(pr => pr.id === v);
