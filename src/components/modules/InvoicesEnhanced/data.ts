export const load = async () => {
      const res = await fetch('/api/invoices')
      if (cancelled) return
      const data = await res.json()
      // Filter invoices that have installment info
      const installmentInvoices = (data || []).filter((inv: InstallmentPlan) => inv.totalInstallments && inv.totalInstallments > 1)
      setInvoices(installmentInvoices)
      setLoading(false)
    }

export const getFiltered = () => {
    switch (filter) {
      case 'pending': return invoices.filter(i => i.status === 'nacrt' || i.status === 'poslata')
      case 'active': return invoices.filter(i => i.status === 'poslata')
      case 'completed': return invoices.filter(i => i.status === 'placena')
      default: return invoices
    }
  }

export const getStatusBadge = (status: string) => {
    switch (status) {
      case 'nacrt': return <Badge variant="outline">Nacrt</Badge>
      case 'poslata': return <Badge className="bg-blue-100 text-blue-700">Poslata</Badge>
      case 'placena': return <Badge className="bg-emerald-100 text-emerald-700">Plaćena</Badge>
      case 'otkazana': return <Badge variant="destructive">Otkazana</Badge>
      default: return <Badge>{status}</Badge>
    }
  }

export const getProgress = (inv: InstallmentPlan) => {
    if (!inv.totalInstallments) return 0
    return Math.round(((inv.paidInstallments || 0) / inv.totalInstallments) * 100)
  }

export const filtered = getFiltered();

export const progress = getProgress(inv);

export const amountPerInstallment = inv.totalAmount / (inv.totalInstallments || 1);

export const paidAmount = amountPerInstallment * (inv.paidInstallments || 0);

export const remainingAmount = inv.totalAmount - paidAmount;

export const isPaid = i < (inv.paidInstallments || 0);

export const isNext = i === (inv.paidInstallments || 0);

export const d = new Date(inv.date);

export const [incoterms] = ['DAP', 'FOB', 'CIF', 'EXW', 'DDP', 'FCA', 'CPT', 'DPU']

export const load = async () => {
      const res = await fetch('/api/invoices')
      if (cancelled) return
      setInvoices((await res.json()) || [])
      setLoading(false)
    }

export const handleFiskalizuj = async (id: string, number: string) => {
    try {
      const res = await fetch(`/api/invoices/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fiscalizedNumber: `FIS-${new Date().getFullYear()}-${number.replace(/[^0-9]/g, '')}`,
          fiscalizedAt: new Date().toISOString(),
          status: 'poslata',
        })
      })
      if (res.ok) {
        setInvoices(prev => prev.map(inv => inv.id === id ? { ...inv, fiscalizedNumber: `FIS-${new Date().getFullYear()}-${number.replace(/[^0-9]/g, '')}`, fiscalizedAt: new Date().toISOString(), status: 'poslata' } : inv))
        toast.success(`Faktura ${number} fiskalizovana`)
      }
    } catch {
      toast.error('Greška pri fiskalizaciji')
    }
  }

export const handleSetIncoterms = async (id: string, term: string) => {
    try {
      await fetch(`/api/invoices/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ incoterms: term || null })
      })
      setInvoices(prev => prev.map(inv => inv.id === id ? { ...inv, incoterms: term || null } : inv))
      toast.success(`Incoterms ažuriran na ${term}`)
    } catch {
      toast.error('Greška')
    }
  }

export const outputInvoices = invoices.filter(i => i.type === 'izlazna');

export const totalFiscalized = outputInvoices.filter(i => i.fiscalizedNumber).length;

export const totalUnfiscalized = outputInvoices.filter(i => !i.fiscalizedNumber && (i.status === 'poslata' || i.status === 'nacrt')).length;
