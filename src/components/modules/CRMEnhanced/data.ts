export const load = async () => {
      const res = await fetch('/api/crm-automation-rules')
      if (cancelled) return
      setRules(await res.json())
      setLoading(false)
    }

export const handleSubmit = async () => {
    if (editId) {
      await fetch(`/api/crm-automation-rules/${editId}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form)
      })
    } else {
      await fetch('/api/crm-automation-rules', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, companyId: 'default' })
      })
    }
    setShowForm(false); setEditId(null)
    setForm({ name: '', trigger: 'stage_change', condition: '', action: 'move_stage', actionData: '', isActive: true })
    const res = await fetch('/api/crm-automation-rules'); setRules(await res.json())
    toast.success(editId ? 'Pravilo ažurirano' : 'Pravilo kreirano')
  }

export const handleToggle = async (id: string, isActive: boolean) => {
    await fetch(`/api/crm-automation-rules/${id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isActive })
    })
    setRules(prev => prev.map(r => r.id === id ? { ...r, isActive } : r))
    toast.success(isActive ? 'Pravilo aktivirano' : 'Pravilo deaktivirano')
  }

export const handleDelete = async (id: string) => {
    await fetch(`/api/crm-automation-rules/${id}`, { method: 'DELETE' })
    setRules(prev => prev.filter(r => r.id !== id))
    toast.success('Pravilo obrisano')
  }

export const getTriggerLabel = (t: string) => {
    switch (t) {
      case 'stage_change': return 'Promena faze'
      case 'deal_created': return 'Novi deal'
      case 'days_inactive': return 'Neaktivnost'
      case 'score_above': return 'Score iznad'
      default: return t
    }
  }

export const getActionLabel = (a: string) => {
    switch (a) {
      case 'move_stage': return 'Premesti fazu'
      case 'assign_to': return 'Dodeli'
      case 'send_email': return 'Pošalji email'
      case 'add_tag': return 'Dodaj tag'
      case 'set_score': return 'Postavi score'
      default: return a
    }
  }

export const activeCount = rules.filter(r => r.isActive).length;
