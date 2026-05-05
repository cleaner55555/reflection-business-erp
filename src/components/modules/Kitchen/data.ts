export const mockData = [
  { id: '1', name: 'Наруџба #101', status: 'active', date: '2024-01-15', value: 'У припреми' },
  { id: '2', name: 'Наруџба #102', status: 'pending', date: '2024-02-20', value: 'Спремно' },
  { id: '3', name: 'Наруџба #103', status: 'completed', date: '2024-03-10', value: 'Услуужно' },
  { id: '4', name: 'Наруџба #104', status: 'active', date: '2024-04-05', value: 'На чекању' },
  { id: '5', name: 'Наруџба #105', status: 'pending', date: '2024-05-12', value: 'У припреми' },
]

export const filtered = data.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

export const handleAdd = () => {
    if (!formData.name) return
    const newItem = {
      id: String(Date.now()),
      name: formData.name,
      status: 'active',
      date: new Date().toISOString().split('T')[0],
      value: formData.value || '0',
    }
    setData([newItem, ...data])
    setFormData({ name: '', value: '' })
    setOpen(false)
  }

export const handleDelete = (id: string) => {
    setData(data.filter((item) => item.id !== id))
  }

export const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      completed: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    }
    const labels: Record<string, string> = {
      active: 'Активно',
      pending: 'На чекању',
      completed: 'Завршено',
    }
    return <Badge className={colors[status] || ''}>{labels[status] || status}</Badge>
  }
