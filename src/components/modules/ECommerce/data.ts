export const productStatusConfig: Record<string, { label: string; color: string }> = {
  active: { label: 'Aktivan', color: 'bg-green-100 text-green-700' },
  draft: { label: 'Nacrt', color: 'bg-gray-100 text-gray-700' },
  out_of_stock: { label: 'Nema na stanju', color: 'bg-red-100 text-red-700' },
  archived: { label: 'Arhiviran', color: 'bg-gray-200 text-gray-500' },
}

export const orderStatusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  nacrt: { label: 'Nacrt', color: 'bg-gray-100 text-gray-700', icon: FileText },
  'potvrđena': { label: 'Potvrđena', color: 'bg-blue-100 text-blue-700', icon: CheckCircle2 },
  u_pripremi: { label: 'U pripremi', color: 'bg-amber-100 text-amber-700', icon: Package },
  poslata: { label: 'Poslata', color: 'bg-purple-100 text-purple-700', icon: Truck },
  u_isporuci: { label: 'U isporuci', color: 'bg-indigo-100 text-indigo-700', icon: Truck },
  isporučena: { label: 'Isporučena', color: 'bg-teal-100 text-teal-700', icon: CheckCircle2 },
  završena: { label: 'Završena', color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
  otkazana: { label: 'Otkazana', color: 'bg-red-100 text-red-700', icon: AlertCircle },
}

export const paymentStatusConfig: Record<string, { label: string; color: string }> = {
  čekanje: { label: 'Čeka plaćanje', color: 'bg-amber-100 text-amber-700' },
  plaćeno: { label: 'Plaćeno', color: 'bg-green-100 text-green-700' },
  delimično: { label: 'Delimično', color: 'bg-orange-100 text-orange-700' },
  otkazano: { label: 'Otkazano', color: 'bg-red-100 text-red-700' },
}

export const paymentMethodLabels: Record<string, string> = {
  kartica: 'Kartica',
  pouzece: 'Pouzećem',
  virman: 'Virman',
  paypal: 'PayPal',
}

export const formatCurrency = (val: number) => `${val.toLocaleString('sr-RS', { minimumFractionDigits: 2 })} RSD`;

export const orderStatusFlow = ['nacrt', 'potvrđena', 'u_pripremi', 'poslata', 'u_isporuci', 'isporučena', 'završena'] as const;

export const mockProducts: StoreProduct[] = [
  { id: '1', name: 'Bežične slušalice Sony WH-1000XM5', sku: 'SNY-WH1000XM5', category: 'Audio', description: 'Premium bežične slušalice sa aktivnom kontrolom buke', price: 54999, comparePrice: 62999, costPrice: 32000, stock: 45, weight: 0.25, dimensions: '22 x 18 x 8 cm', seoTitle: 'Sony WH-1000XM5 slušalice', seoDescription: 'Najbolje bežične slušalice sa ANC', rating: 4.8, reviews: 234, status: 'active', featured: true, createdAt: '2024-01-15T10:00:00Z' },
  { id: '2', name: 'Pametni sat Apple Watch Series 9', sku: 'APL-WATCH9-45', category: 'Pametni satovi', description: 'Napredni pametni sat sa GPS i zdravstvenim senzorima', price: 79999, comparePrice: 89999, costPrice: 55000, stock: 28, weight: 0.052, dimensions: '45 x 38 x 10.7 mm', seoTitle: 'Apple Watch Series 9', seoDescription: 'Novi pametni sat od Apple', rating: 4.9, reviews: 567, status: 'active', featured: true, createdAt: '2024-02-01T10:00:00Z' },
  { id: '3', name: 'Laptop Dell XPS 15 9530', sku: 'DEL-XPS15-9530', category: 'Laptopovi', description: 'Ultrabook sa Intel Core i7 i OLED ekranom', price: 189999, comparePrice: 219999, costPrice: 145000, stock: 12, weight: 1.86, dimensions: '34.4 x 22.0 x 1.78 cm', seoTitle: 'Dell XPS 15 Laptop', seoDescription: 'Premium ultrabook za profesionalce', rating: 4.7, reviews: 89, status: 'active', featured: true, createdAt: '2024-01-20T10:00:00Z' },
  { id: '4', name: 'Bežični miš Logitech MX Master 3S', sku: 'LOG-MX3S-GRY', category: 'Periferija', description: 'Ergonomski bežični miš za produktivnost', price: 14999, costPrice: 8500, stock: 78, weight: 0.141, dimensions: '12.5 x 8.4 x 5.1 cm', rating: 4.6, reviews: 412, status: 'active', featured: false, createdAt: '2024-03-01T10:00:00Z' },
  { id: '5', name: 'Tastatura Mechanical Keychron Q1', sku: 'KEY-Q1-BLK', category: 'Periferija', description: 'Premium mehanička tastatura sa QMK podrškom', price: 24999, comparePrice: 27999, costPrice: 15000, stock: 34, weight: 1.15, dimensions: '32.5 x 13.5 x 3.1 cm', rating: 4.8, reviews: 156, status: 'active', featured: true, createdAt: '2024-02-15T10:00:00Z' },
  { id: '6', name: 'Monitor LG UltraFine 27" 4K', sku: 'LG-27UN850-W', category: 'Monitori', description: 'IPS 4K monitor sa USB-C konekcijom', price: 69999, costPrice: 42000, stock: 19, weight: 6.3, dimensions: '61.2 x 45.2 x 19.8 cm', rating: 4.5, reviews: 98, status: 'active', featured: false, createdAt: '2024-01-25T10:00:00Z' },
  { id: '7', name: 'Drone DJI Mini 4 Pro', sku: 'DJI-MINI4P', category: 'Dronovi', description: 'Kompaktni drone sa 4K kamerom', price: 119999, costPrice: 80000, stock: 7, weight: 0.249, dimensions: '14.8 x 9.4 x 5.8 cm', rating: 4.9, reviews: 67, status: 'active', featured: true, createdAt: '2024-03-10T10:00:00Z' },
  { id: '8', name: 'Zvučnik JBL Charge 5', sku: 'JBL-CHG5-BLK', category: 'Audio', description: 'Prenosni Bluetooth zvučnik sa IP67 zaštitom', price: 24999, costPrice: 14000, stock: 56, weight: 0.96, dimensions: '22.0 x 9.6 x 9.6 cm', rating: 4.7, reviews: 345, status: 'active', featured: false, createdAt: '2024-02-20T10:00:00Z' },
  { id: '9', name: 'SSD Samsung 990 Pro 2TB', sku: 'SAM-990PRO-2TB', category: 'Komponente', description: 'NVMe M.2 SSD za najbrže performanse', price: 35999, comparePrice: 39999, costPrice: 22000, stock: 3, weight: 0.009, dimensions: '8.0 x 2.4 cm', rating: 4.9, reviews: 211, status: 'active', featured: false, createdAt: '2024-03-05T10:00:00Z' },
  { id: '10', name: 'Web kamera Logitech Brio 4K', sku: 'LOG-BRIO-4K', category: 'Periferija', description: 'Ultra HD web kamera za video pozive', price: 32999, costPrice: 19500, stock: 0, weight: 0.063, dimensions: '10.2 x 2.7 x 2.7 cm', rating: 4.4, reviews: 87, status: 'out_of_stock', featured: false, createdAt: '2024-01-30T10:00:00Z' },
  { id: '11', name: 'Tablet Samsung Galaxy Tab S9', sku: 'SAM-TABS9-128', category: 'Tableti', description: 'Android tablet sa AMOLED ekranom', price: 89999, costPrice: 62000, stock: 15, weight: 0.526, dimensions: '25.6 x 16.5 x 0.6 cm', rating: 4.6, reviews: 134, status: 'draft', featured: false, createdAt: '2024-03-15T10:00:00Z' },
  { id: '12', name: 'Hardver za stolariju Festool', sku: 'FST-OF1010', category: 'Alati', description: 'Profesionalna freza za drvo', price: 74999, costPrice: 52000, stock: 4, weight: 3.4, dimensions: '26.0 x 10.0 x 28.0 cm', rating: 4.8, reviews: 23, status: 'active', featured: false, createdAt: '2024-02-10T10:00:00Z' },
]

export const mockOrders: StoreOrder[] = [
  {
    id: 'o1', orderNumber: 'WEB-2024-001', customerName: 'Marko Petrović', customerEmail: 'marko@email.com', customerPhone: '+381631234567', customerAddress: 'Knez Mihailova 24, Beograd',
    items: [{ id: 'i1', productId: '1', productName: 'Sony WH-1000XM5', sku: 'SNY-WH1000XM5', quantity: 1, unitPrice: 54999, totalPrice: 54999 }, { id: 'i2', productId: '4', productName: 'Logitech MX Master 3S', sku: 'LOG-MX3S-GRY', quantity: 1, unitPrice: 14999, totalPrice: 14999 }],
    subtotal: 69998, shipping: 0, tax: 0, discount: 5000, total: 64998,
    status: 'isporučena', paymentMethod: 'kartica', paymentStatus: 'plaćeno', shippingMethod: 'Kurir BEX', trackingNumber: 'BEX-2024-78901',
    timeline: [{ status: 'nacrt', date: '2024-03-01T09:15:00Z' }, { status: 'potvrđena', date: '2024-03-01T09:30:00Z' }, { status: 'u_pripremi', date: '2024-03-01T14:00:00Z', note: 'Pakovanje u toku' }, { status: 'poslata', date: '2024-03-02T10:00:00Z', note: 'Predata kuriru BEX' }, { status: 'u_isporuci', date: '2024-03-02T16:00:00Z' }, { status: 'isporučena', date: '2024-03-03T11:30:00Z', note: 'Preuzeto u Beogradu' }],
    createdAt: '2024-03-01T09:15:00Z', updatedAt: '2024-03-03T11:30:00Z',
  },
  {
    id: 'o2', orderNumber: 'WEB-2024-002', customerName: 'Ana Jovanović', customerEmail: 'ana.j@email.com', customerPhone: '+381649876543', customerAddress: 'Bulevar Kralja Aleksandra 73, Niš',
    items: [{ id: 'i3', productId: '2', productName: 'Apple Watch Series 9', sku: 'APL-WATCH9-45', quantity: 1, unitPrice: 79999, totalPrice: 79999 }],
    subtotal: 79999, shipping: 500, tax: 0, discount: 0, total: 80499,
    status: 'u_pripremi', paymentMethod: 'pouzece', paymentStatus: 'čekanje', shippingMethod: 'Pošta',
    timeline: [{ status: 'nacrt', date: '2024-03-15T14:20:00Z' }, { status: 'potvrđena', date: '2024-03-15T14:25:00Z' }, { status: 'u_pripremi', date: '2024-03-16T09:00:00Z' }],
    createdAt: '2024-03-15T14:20:00Z', updatedAt: '2024-03-16T09:00:00Z',
  },
  {
    id: 'o3', orderNumber: 'WEB-2024-003', customerName: 'Nikola Stanković', customerEmail: 'nikola.s@email.com', customerPhone: '+381601112233',
    items: [{ id: 'i4', productId: '7', productName: 'DJI Mini 4 Pro', sku: 'DJI-MINI4P', quantity: 1, unitPrice: 119999, totalPrice: 119999 }, { id: 'i5', productId: '9', productName: 'Samsung 990 Pro 2TB', sku: 'SAM-990PRO-2TB', quantity: 2, unitPrice: 35999, totalPrice: 71998 }],
    subtotal: 191997, shipping: 0, tax: 0, discount: 10000, total: 181997,
    status: 'poslata', paymentMethod: 'virman', paymentStatus: 'plaćeno', shippingMethod: 'Kurir BEX', trackingNumber: 'BEX-2024-81234', couponCode: 'DRAŽ10',
    timeline: [{ status: 'nacrt', date: '2024-03-10T08:00:00Z' }, { status: 'potvrđena', date: '2024-03-10T10:30:00Z' }, { status: 'u_pripremi', date: '2024-03-11T08:00:00Z' }, { status: 'poslata', date: '2024-03-12T15:00:00Z', note: 'Predata BEX ekspres' }],
    createdAt: '2024-03-10T08:00:00Z', updatedAt: '2024-03-12T15:00:00Z',
  },
  {
    id: 'o4', orderNumber: 'WEB-2024-004', customerName: 'Jelena Milić', customerEmail: 'jelena.m@email.com', customerPhone: '+381655554444',
    items: [{ id: 'i6', productId: '5', productName: 'Keychron Q1', sku: 'KEY-Q1-BLK', quantity: 1, unitPrice: 24999, totalPrice: 24999 }],
    subtotal: 24999, shipping: 350, tax: 0, discount: 0, total: 25349,
    status: 'potvrđena', paymentMethod: 'kartica', paymentStatus: 'plaćeno', shippingMethod: 'Kurir AKS',
    timeline: [{ status: 'nacrt', date: '2024-03-18T11:00:00Z' }, { status: 'potvrđena', date: '2024-03-18T11:05:00Z' }],
    createdAt: '2024-03-18T11:00:00Z', updatedAt: '2024-03-18T11:05:00Z',
  },
  {
    id: 'o5', orderNumber: 'WEB-2024-005', customerName: 'Stefan Nikolić', customerEmail: 'stefan.n@email.com', customerPhone: '+381637778888', customerAddress: 'Strahinjića Bana 15, Beograd',
    items: [{ id: 'i7', productId: '3', productName: 'Dell XPS 15 9530', sku: 'DEL-XPS15-9530', quantity: 1, unitPrice: 189999, totalPrice: 189999 }, { id: 'i8', productId: '6', productName: 'LG UltraFine 27" 4K', sku: 'LG-27UN850-W', quantity: 1, unitPrice: 69999, totalPrice: 69999 }],
    subtotal: 259998, shipping: 0, tax: 0, discount: 15000, total: 244998,
    status: 'završena', paymentMethod: 'kartica', paymentStatus: 'plaćeno', shippingMethod: 'Dostava na ruke', notes: 'Kupac zadovoljan, ostavio pozitivan review',
    timeline: [{ status: 'nacrt', date: '2024-02-20T16:00:00Z' }, { status: 'potvrđena', date: '2024-02-20T16:10:00Z' }, { status: 'u_pripremi', date: '2024-02-21T09:00:00Z' }, { status: 'poslata', date: '2024-02-22T10:00:00Z' }, { status: 'u_isporuci', date: '2024-02-23T08:00:00Z' }, { status: 'isporučena', date: '2024-02-23T14:00:00Z' }, { status: 'završena', date: '2024-02-28T10:00:00Z', note: 'Garancija aktivirana' }],
    createdAt: '2024-02-20T16:00:00Z', updatedAt: '2024-02-28T10:00:00Z',
  },
]

export const mockCategories: Category[] = [
  { id: 'c1', name: 'Audio', slug: 'audio', description: 'Slušalice, zvučnici i audio oprema', productCount: 2, sortOrder: 1, isActive: true },
  { id: 'c2', name: 'Pametni satovi', slug: 'pametni-satovi', description: 'Smartwatch uređaji', productCount: 1, sortOrder: 2, isActive: true },
  { id: 'c3', name: 'Laptopovi', slug: 'laptopovi', description: 'Prenosni računari', productCount: 1, sortOrder: 3, isActive: true },
  { id: 'c4', name: 'Periferija', slug: 'periferija', description: 'Miševi, tastature, web kamere', productCount: 3, sortOrder: 4, isActive: true },
  { id: 'c5', name: 'Monitori', slug: 'monitori', description: 'Računarski monitori', productCount: 1, sortOrder: 5, isActive: true },
  { id: 'c6', name: 'Dronovi', slug: 'dronovi', description: 'Kamere i dronovi', productCount: 1, sortOrder: 6, isActive: true },
  { id: 'c7', name: 'Komponente', slug: 'komponente', description: 'Grafičke kartice, SSD, RAM', productCount: 1, sortOrder: 7, isActive: true },
  { id: 'c8', name: 'Tableti', slug: 'tableti', description: 'Tablet računari', productCount: 1, sortOrder: 8, isActive: true },
  { id: 'c9', name: 'Alati', slug: 'alati', description: 'Ručni alati i mašine', productCount: 1, sortOrder: 9, isActive: true },
]

export const mockCoupons: Coupon[] = [
  { id: 'cp1', code: 'DRAŽ10', type: 'procenat', value: 10, minOrder: 50000, maxDiscount: 15000, validFrom: '2024-01-01', validTo: '2024-06-30', maxUses: 500, usedCount: 87, isActive: true, appliesTo: 'Svi proizvodi', createdAt: '2024-01-01T00:00:00Z' },
  { id: 'cp2', code: 'POČETNI20', type: 'fiksni_iznos', value: 2000, minOrder: 10000, validFrom: '2024-01-01', validTo: '2024-12-31', maxUses: 1000, usedCount: 342, isActive: true, appliesTo: 'Novi korisnici', createdAt: '2024-01-01T00:00:00Z' },
  { id: 'cp3', code: 'DOSTAVA0', type: 'besplatna_dostava', value: 0, minOrder: 20000, validFrom: '2024-03-01', validTo: '2024-03-31', maxUses: 200, usedCount: 45, isActive: true, appliesTo: 'Svi proizvodi', createdAt: '2024-02-28T00:00:00Z' },
  { id: 'cp4', code: 'VIP15', type: 'procenat', value: 15, minOrder: 100000, maxDiscount: 30000, validFrom: '2024-02-01', validTo: '2024-05-31', maxUses: 50, usedCount: 23, isActive: true, appliesTo: 'VIP korisnici', createdAt: '2024-02-01T00:00:00Z' },
  { id: 'cp5', code: 'LETNJE25', type: 'procenat', value: 25, minOrder: 30000, validFrom: '2024-06-01', validTo: '2024-08-31', maxUses: 300, usedCount: 0, isActive: false, appliesTo: 'Letnja kolekcija', createdAt: '2024-05-01T00:00:00Z' },
]

export const defaultSettings: StoreSettings = {
  storeName: 'Moja Prodavnica', storeUrl: 'www.mojaprodavnica.rs', storeDescription: 'Vaša omiljena online prodavnica',
  storeEmail: 'prodaja@mojaprodavnica.rs', storePhone: '+381 11 123 4567', currency: 'RSD', language: 'sr',
  taxRate: 20, freeShippingThreshold: 50000, enableReviews: true, enableWishlist: true, enableRegistration: true, enableGuestCheckout: true,
  lowStockAlert: 5, outOfStockBehavior: 'sakrij',
  paymentMethods: [
    { id: 'pm1', name: 'Platne kartice', enabled: true, icon: 'CreditCard' },
    { id: 'pm2', name: 'Pouzećem', enabled: true, icon: 'Banknote' },
    { id: 'pm3', name: 'Virman', enabled: true, icon: 'FileText' },
    { id: 'pm4', name: 'PayPal', enabled: false, icon: 'Globe' },
  ],
  shippingOptions: [
    { id: 'sh1', name: 'Kurir BEX', price: 450, estimatedDays: '1-2 radna dana', enabled: true },
    { id: 'sh2', name: 'Kurir AKS', price: 400, estimatedDays: '1-3 radna dana', enabled: true },
    { id: 'sh3', name: 'Pošta', price: 250, estimatedDays: '3-5 radna dana', enabled: true },
    { id: 'sh4', name: 'Lično preuzimanje', price: 0, estimatedDays: 'Istog dana', enabled: true },
  ],
  notifications: { newOrder: true, lowStock: true, orderStatusChange: true, newReview: true, dailyReport: false, weeklyReport: true },
}

export const maxValue = Math.max(...data.map((d) => d.value), 1);

export const { activeCompanyId } = useAppStore();

export const { t } = useTranslation();

export const res = await fetch(`/api/products?companyId=${activeCompanyId}&limit=100`);

export const data = await res.json();

export const items = data.items || data || []

export const allCats = [...new Set(products.map((p) => p.category).filter(Boolean))]

export const totalProducts = products.length;

export const activeOrders = orders.filter((o) => !['završena', 'otkazana'].includes(o.status)).length;

export const totalRevenue = orders.filter((o) => o.paymentStatus === 'plaćeno').reduce((s, o) => s + o.total, 0);

export const conversionRate = 3.8;

export const totalCustomers = [...new Set(orders.map((o) => o.customerEmail))].length;

export const avgOrderValue = orders.length > 0 ? orders.reduce((s, o) => s + o.total, 0) / orders.length : 0;

export const statusCounts = orders.reduce<Record<string, number>>((acc, o) => {
    acc[o.status] = (acc[o.status] || 0) + 1
    return acc
  }, {});

export const topProducts = [...products].sort((a, b) => b.reviews - a.reviews).slice(0, 5);

export const recentOrders = [...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);

export const revenueData = [
    { label: 'Jan', value: 1250000 },
    { label: 'Feb', value: 1480000 },
    { label: 'Mar', value: 1820000 },
    { label: 'Apr', value: 1350000 },
    { label: 'Maj', value: 1690000 },
    { label: 'Jun', value: 2100000 },
    { label: 'Jul', value: 1890000 },
    { label: 'Avg', value: 2250000 },
    { label: 'Sep', value: 1950000 },
    { label: 'Okt', value: 2400000 },
    { label: 'Nov', value: 2850000 },
    { label: 'Dec', value: 3100000 },
  ]

export const lowStockProducts = products.filter((p) => p.stock > 0 && p.stock <= 5);

export const cfg = orderStatusConfig[status]

export const pct = orders.length > 0 ? (count / orders.length) * 100 : 0;

export const cfg = orderStatusConfig[o.status]

export const emptyForm = (): StoreProduct => ({
    id: '', name: '', sku: '', category: '', description: '', price: 0, comparePrice: 0, costPrice: 0,
    stock: 0, weight: 0, dimensions: '', seoTitle: '', seoDescription: '', rating: 0, reviews: 0,
    status: 'draft', featured: false, createdAt: new Date().toISOString(),
  });

export const filtered = products.filter((p) => {
    if (search && !p.name.toLowerCase().includes(search.toLowerCase()) && !p.sku.toLowerCase().includes(search.toLowerCase())) return false
    if (catFilter !== 'all' && p.category !== catFilter) return false
    if (statusFilter !== 'all' && p.status !== statusFilter) return false
    return true
  });

export const openCreate = () => {
    setEditingProduct(null)
    setForm(emptyForm())
    setDialogOpen(true)
  }

export const openEdit = (p: StoreProduct) => {
    setEditingProduct(p)
    setForm({ ...p })
    setDialogOpen(true)
  }

export const handleSave = async () => {
    setDialogOpen(false)
    if (editingProduct) {
      setProducts((prev) => prev.map((p) => p.id === editingProduct.id ? { ...p, ...form } : p))
    } else {
      const newProduct = { ...form, id: `p-${Date.now()}`, createdAt: new Date().toISOString(), rating: 0, reviews: 0 }
      setProducts((prev) => [...prev, newProduct])
    }
  }

export const handleDelete = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id))
    setDeleteConfirm(null)
  }

export const toggleFeatured = (id: string) => {
    setProducts((prev) => prev.map((p) => p.id === id ? { ...p, featured: !p.featured } : p))
  }

export const cfg = productStatusConfig[p.status]

export const cfg = productStatusConfig[p.status]

export const filtered = orders.filter((o) => {
    if (search && !o.orderNumber.toLowerCase().includes(search.toLowerCase()) && !o.customerName.toLowerCase().includes(search.toLowerCase())) return false
    if (statusFilter !== 'all' && o.status !== statusFilter) return false
    return true
  });

export const advanceStatus = (orderId: string) => {
    setOrders((prev) => prev.map((o) => {
      if (o.id !== orderId) return o
      const currentIndex = orderStatusFlow.indexOf(o.status as typeof orderStatusFlow[number])
      if (currentIndex < 0 || currentIndex >= orderStatusFlow.length - 1) return o
      const newStatus = orderStatusFlow[currentIndex + 1]
      return {
        ...o,
        status: newStatus,
        updatedAt: new Date().toISOString(),
        timeline: [...o.timeline, { status: newStatus, date: new Date().toISOString() }],
      }
    }))
  }

export const cancelOrder = (orderId: string) => {
    setOrders((prev) => prev.map((o) => {
      if (o.id !== orderId) return o
      return {
        ...o,
        status: 'otkazana' as const,
        paymentStatus: 'otkazano' as const,
        updatedAt: new Date().toISOString(),
        timeline: [...o.timeline, { status: 'otkazana', date: new Date().toISOString(), note: 'Porudžbina otkazana' }],
      }
    }))
  }

export const formatDate = (d: string) => new Date(d).toLocaleString('sr-RS', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

export const cfg = orderStatusConfig[o.status]

export const payCfg = paymentStatusConfig[o.paymentStatus]

export const isActive = selectedOrder.status === s;

export const isPast = orderStatusFlow.indexOf(selectedOrder.status) > i;

export const cfg = orderStatusConfig[entry.status]

export const emptyCat = (): Category => ({
    id: '', name: '', slug: '', description: '', productCount: 0, sortOrder: categories.length + 1, isActive: true,
  });

export const openCreate = () => { setEditingCat(null); setForm(emptyCat()); setDialogOpen(true) }

export const openEdit = (c: Category) => { setEditingCat(c); setForm({ ...c }); setDialogOpen(true) }

export const handleSave = () => {
    if (!form.name) return
    const slug = form.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    setDialogOpen(false)
    if (editingCat) {
      setCategories((prev) => prev.map((c) => c.id === editingCat.id ? { ...form, slug } : c))
    } else {
      setCategories((prev) => [...prev, { ...form, id: `c-${Date.now()}`, slug }])
    }
  }

export const handleDelete = (id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id))
    setDeleteConfirm(null)
  }

export const toggleActive = (id: string) => {
    setCategories((prev) => prev.map((c) => c.id === id ? { ...c, isActive: !c.isActive } : c))
  }

export const moveUp = (index: number) => {
    if (index === 0) return
    setCategories((prev) => {
      const arr = [...prev]
      const tmp = arr[index]
      arr[index] = arr[index - 1]
      arr[index - 1] = tmp
      return arr.map((c, i) => ({ ...c, sortOrder: i + 1 }))
    })
  }

export const moveDown = (index: number) => {
    if (index >= categories.length - 1) return
    setCategories((prev) => {
      const arr = [...prev]
      const tmp = arr[index]
      arr[index] = arr[index + 1]
      arr[index + 1] = tmp
      return arr.map((c, i) => ({ ...c, sortOrder: i + 1 }))
    })
  }

export const emptyCoupon = (): Coupon => ({
    id: '', code: '', type: 'procenat', value: 0, minOrder: 0, maxDiscount: 0,
    validFrom: new Date().toISOString().split('T')[0], validTo: new Date().toISOString().split('T')[0],
    maxUses: 100, usedCount: 0, isActive: true, appliesTo: 'Svi proizvodi', createdAt: new Date().toISOString(),
  });

export const openCreate = () => { setEditingCoupon(null); setForm(emptyCoupon()); setDialogOpen(true) }

export const openEdit = (c: Coupon) => { setEditingCoupon(c); setForm({ ...c }); setDialogOpen(true) }

export const handleSave = () => {
    if (!form.code) return
    setDialogOpen(false)
    if (editingCoupon) {
      setCoupons((prev) => prev.map((c) => c.id === editingCoupon.id ? { ...form } : c))
    } else {
      setCoupons((prev) => [...prev, { ...form, id: `cp-${Date.now()}` }])
    }
  }

export const toggleActive = (id: string) => {
    setCoupons((prev) => prev.map((c) => c.id === id ? { ...c, isActive: !c.isActive } : c))
  }

export const copyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
  }

export const typeLabels: Record<string, string> = {
    procenat: 'Procenat',
    fiksni_iznos: 'Fiksni iznos',
    besplatna_dostava: 'Besplatna dostava',
  }

export const isExpired = (coupon: Coupon) => new Date(coupon.validTo) < new Date();

export const isScheduled = (coupon: Coupon) => new Date(coupon.validFrom) > new Date();

export const expired = isExpired(coupon);

export const scheduled = isScheduled(coupon);

export const usagePct = coupon.maxUses > 0 ? (coupon.usedCount / coupon.maxUses) * 100 : 0;

export const totalRevenue = orders.filter((o) => o.paymentStatus === 'plaćeno').reduce((s, o) => s + o.total, 0);

export const totalOrders = orders.length;

export const avgOrder = totalOrders > 0 ? totalRevenue / totalOrders : 0;

export const completedOrders = orders.filter((o) => o.status === 'završena' || o.status === 'isporučena').length;

export const canceledOrders = orders.filter((o) => o.status === 'otkazana').length;

export const returnedRate = totalOrders > 0 ? (canceledOrders / totalOrders) * 100 : 0;

export const topSellingProducts = [...products].sort((a, b) => b.reviews - a.reviews).slice(0, 8);

export const categoryRevenue = [...new Set(products.map((p) => p.category).filter(Boolean))].map((cat) => {
    const catProducts = products.filter((p) => p.category === cat)
    const revenue = catProducts.reduce((s, p) => s + p.price * Math.floor(Math.random() * 20), 0)
    return { category: cat, revenue, products: catProducts.length }
  }).sort((a, b) => b.revenue - a.revenue);

export const totalCustomers = [...new Set(orders.map((o) => o.customerEmail))].length;

export const returningCustomers = 2;

export const salesByPeriod = [
    { label: 'Pon', value: 85000 }, { label: 'Uto', value: 120000 }, { label: 'Sre', value: 95000 },
    { label: 'Čet', value: 140000 }, { label: 'Pet', value: 175000 }, { label: 'Sub', value: 210000 }, { label: 'Ned', value: 130000 },
  ]

export const conversionFunnel = [
    { stage: 'Posete sajtu', value: 12450, color: 'bg-blue-500' },
    { stage: 'Pregled proizvoda', value: 8230, color: 'bg-indigo-500' },
    { stage: 'Dodato u korpu', value: 3420, color: 'bg-purple-500' },
    { stage: 'Započeta narudžbina', value: 1850, color: 'bg-amber-500' },
    { stage: 'Završena kupovina', value: 620, color: 'bg-green-500' },
  ]

export const inventoryValue = products.reduce((s, p) => s + p.price * p.stock, 0);

export const avgStock = products.length > 0 ? products.reduce((s, p) => s + p.stock, 0) / products.length : 0;

export const widthPct = (step.value / conversionFunnel[0].value) * 100;

export const convRate = i > 0 ? ((step.value / conversionFunnel[i - 1].value) * 100).toFixed(1) : '100';

export const maxRev = categoryRevenue[0]?.revenue || 1;

export const pct = (cr.revenue / maxRev) * 100;

export const update = (key: keyof StoreSettings, value: unknown) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

export const updatePaymentMethod = (id: string, enabled: boolean) => {
    setSettings((prev) => ({
      ...prev,
      paymentMethods: prev.paymentMethods.map((pm) => pm.id === id ? { ...pm, enabled } : pm),
    }))
  }

export const updateShippingOption = (id: string, enabled: boolean) => {
    setSettings((prev) => ({
      ...prev,
      shippingOptions: prev.shippingOptions.map((so) => so.id === id ? { ...so, enabled } : so),
    }))
  }

export const updateNotification = (key: keyof StoreSettings['notifications'], value: boolean) => {
    setSettings((prev) => ({
      ...prev,
      notifications: { ...prev.notifications, [key]: value },
    }))
  }
