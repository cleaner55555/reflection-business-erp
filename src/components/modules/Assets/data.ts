export const STATUS_LABELS: Record<string, string> = {
  aktivno: 'Aktivno', na_popravci: 'Na popravci', izvan_upotrebe: 'Izvan upotrebe', prodato: 'Prodato', otpisano: 'Otpisano',
}

export const STATUS_COLORS: Record<string, string> = {
  aktivno: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  na_popravci: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  izvan_upotrebe: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  prodato: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  otpisano: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
}

export const CATEGORIES = [
  { value: 'IT oprema', icon: Laptop, color: 'bg-blue-50 text-blue-600' },
  { value: 'Vozila', icon: Car, color: 'bg-emerald-50 text-emerald-600' },
  { value: 'Mašine i oprema', icon: Cpu, color: 'bg-purple-50 text-purple-600' },
  { value: 'Nameštaj', icon: Sofa, color: 'bg-amber-50 text-amber-600' },
  { value: 'Pokućinstva', icon: Building, color: 'bg-teal-50 text-teal-600' },
  { value: 'Alati', icon: Wrench, color: 'bg-red-50 text-red-600' },
  { value: 'Vozni park', icon: Truck, color: 'bg-orange-50 text-orange-600' },
  { value: 'Bezbednost', icon: Shield, color: 'bg-slate-100 text-slate-600' },
  { value: 'Ostalo', icon: Package, color: 'bg-gray-50 text-gray-600' },
]

export const formatCurrency = (val: number) => formatRSD(val);

export const { activeCompanyId } = useAppStore();

export const { t } = useTranslation();

export const emptyForm = { name: '', category: 'IT oprema', serialNumber: '', purchaseDate: '', purchasePrice: 0, currentValue: 0, usefulLife: 60, location: '', status: 'aktivno', notes: '', responsible: '', insurance: '', maintenanceDate: '', warrantyExpiry: '' }

export const showToast = (msg: string) => { setToastMsg(msg); setTimeout(() => setToastMsg(''), 3000) }

export const res = await fetch('/api/assets');

export const q = searchQuery.toLowerCase();

export const total = assets.length;

export const active = assets.filter(a => a.status === 'aktivno').length;

export const repair = assets.filter(a => a.status === 'na_popravci').length;

export const totalValue = assets.reduce((s, a) => s + (a.currentValue || 0), 0);

export const totalPurchase = assets.reduce((s, a) => s + (a.purchasePrice || 0), 0);

export const totalDepreciation = assets.reduce((s, a) => s + (a.depreciation || 0), 0);

export const netValue = totalValue - totalDepreciation;

export const byCategory: Record<string, { count: number; value: number; depreciation: number }> = {}

export const cat = a.category || 'Nekategorizovano';

export const byStatus: Record<string, number> = {}

export const expiringWarranty = assets.filter(a => {
      if (!a.warrantyExpiry) return false
      const diff = new Date(a.warrantyExpiry).getTime() - Date.now()
      return diff > 0 && diff < 90 * 24 * 60 * 60 * 1000
    });

export const maintenanceSoon = assets.filter(a => {
      if (!a.maintenanceDate) return false
      const diff = new Date(a.maintenanceDate).getTime() - Date.now()
      return diff > 0 && diff < 30 * 24 * 60 * 60 * 1000
    });

export const oldAssets = assets.filter(a => a.usefulLife > 0 && a.purchaseDate).filter(a => {
      const age = (Date.now() - new Date(a.purchaseDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000)
      return age >= (a.usefulLife * 0.8)
    });

export const recentAssets = [...assets].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);

export const monthlyDepreciation = assets.reduce((s, a) => {
      if (a.usefulLife > 0 && a.status === 'aktivno') {
        const age = a.purchaseDate ? (Date.now() - new Date(a.purchaseDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000) : 0
        if (age < a.usefulLife) return s + ((a.purchasePrice || 0) / a.usefulLife) * 30.44
      }
      return s
    }, 0);

export const openNewAsset = () => { setEditingAsset(null); setAssetForm(emptyForm); setAssetDialogOpen(true) }

export const openEditAsset = (asset: Asset) => {
    setEditingAsset(asset)
    setAssetForm({
      name: asset.name || '', category: asset.category || 'IT oprema', serialNumber: asset.serialNumber || '',
      purchaseDate: asset.purchaseDate?.split('T')[0] || '', purchasePrice: asset.purchasePrice || 0,
      currentValue: asset.currentValue || 0, usefulLife: asset.usefulLife || 60, location: asset.location || '',
      status: asset.status || 'aktivno', notes: asset.notes || '', responsible: asset.responsible || '',
      insurance: asset.insurance || '', maintenanceDate: asset.maintenanceDate?.split('T')[0] || '',
      warrantyExpiry: asset.warrantyExpiry?.split('T')[0] || '',
    })
    setAssetDialogOpen(true)
  }

export const handleSubmitAsset = async () => {
    if (!assetForm.name.trim()) { showToast('Naziv je obavezan'); return }
    setSubmitting(true)
    try {
      const body = { ...assetForm, purchasePrice: Number(assetForm.purchasePrice) || 0, currentValue: Number(assetForm.currentValue) || 0, usefulLife: Number(assetForm.usefulLife) || 60 }
      const url = editingAsset ? `/api/assets/${editingAsset.id}` : '/api/assets'
      const res = await fetch(url, { method: editingAsset ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      if (res.ok) { setAssetDialogOpen(false); loadAssets(); showToast(editingAsset ? 'Sredstvo ažurirano' : 'Sredstvo kreirano') }
    } catch { showToast('Greška') }
    setSubmitting(false)
  }

export const handleDeleteAsset = async () => {
    if (!selectedAsset) return
    try { await fetch(`/api/assets/${selectedAsset.id}`, { method: 'DELETE' }); setDeleteConfirmOpen(false); setSelectedAsset(null); loadAssets(); showToast('Sredstvo obrisano') }
    catch { showToast('Greška') }
  }

export const handleStatusChange = async (asset: Asset, status: string) => {
    try { await fetch(`/api/assets/${asset.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) }); loadAssets(); showToast(`Status: ${STATUS_LABELS[status] || status}`) }
    catch { showToast('Greška') }
  }

export const Kpi = ({ label, value, icon: Icon, sub, color }: { label: string; value: string | number; icon: React.ElementType; sub?: string; color?: string }) => (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-muted-foreground">{label}</span>
        <Icon className={`h-4 w-4 ${color || 'text-muted-foreground'}`} />
      </div>
      <p className="text-2xl font-bold">{value}</p>
      {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
    </Card>
  );

export const catInfo = CATEGORIES.find(c => c.value === cat);

export const max = Math.max(...Object.values(stats.byCategory).map(d => d.value), 1);

export const catInfo = CATEGORIES.find(c => c.value === cat);

export const annualDep = data.value > 0 && data.count > 0 ? data.depreciation / data.count : 0;
