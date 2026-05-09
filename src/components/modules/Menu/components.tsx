'use client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Plus, Search, Trash2, Pencil, Eye, UtensilsCrossed, Star } from 'lucide-react'
import type { MenuItem } from './types'
import { CATEGORIES, formatRSD } from './data'

/* ---- KPI Cards ---- */
export function KpiCards({ data }: { data: MenuItem[] }) {
  const availableCount = data.filter(i => i.isAvailable).length
  const topRated = [...data].sort((a, b) => b.rating - a.rating)[0]
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <Card className="p-4"><div className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><UtensilsCrossed className="h-3 w-3" />Ukupno</div><p className="text-2xl font-bold">{data.length}</p></Card>
      <Card className="p-4"><div className="text-xs text-emerald-600 mb-1">Dostupnih</div><p className="text-2xl font-bold text-emerald-700">{availableCount}</p></Card>
      <Card className="p-4"><div className="text-xs text-amber-600 mb-1 flex items-center gap-1"><Star className="h-3 w-3" />Najbolje ocenjeno</div><p className="text-xs font-bold text-amber-700">{topRated?.name || '—'} ({topRated?.rating})</p></Card>
      <Card className="p-4"><div className="text-xs text-blue-600 mb-1">Prosek cena</div><p className="text-2xl font-bold text-blue-700">{formatRSD(data.reduce((s, i) => s + i.price, 0) / data.length)}</p></Card>
    </div>
  )
}

/* ---- Table Section ---- */
export function TableSection({ filtered, search, categoryFilter, availabilityFilter, onSearchChange, onCategoryChange, onAvailabilityChange, onViewDetail, onEdit, onDelete }: {
  filtered: MenuItem[]
  search: string
  categoryFilter: string
  availabilityFilter: string
  onSearchChange: (v: string) => void
  onCategoryChange: (v: string) => void
  onAvailabilityChange: (v: string) => void
  onViewDetail: (id: string) => void
  onEdit: (item: MenuItem) => void
  onDelete: (id: string) => void
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="text-base">Jelovnik</CardTitle>
          <div className="flex gap-2 items-center flex-wrap">
            <div className="relative"><Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" /><Input placeholder="Pretraga..." className="pl-8 h-8 w-44 text-xs" value={search} onChange={e => onSearchChange(e.target.value)} /></div>
            <Select value={categoryFilter || 'all'} onValueChange={v => onCategoryChange(v === 'all' ? '' : v)}><SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Sve</SelectItem><SelectItem value="grill">Roštilj</SelectItem><SelectItem value="main_course">Glavno</SelectItem><SelectItem value="soup">Supa</SelectItem><SelectItem value="salad">Salata</SelectItem><SelectItem value="dessert">Desert</SelectItem><SelectItem value="drink">Piće</SelectItem></SelectContent></Select>
            <Select value={availabilityFilter || 'all'} onValueChange={v => onAvailabilityChange(v === 'all' ? '' : v)}><SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Svi</SelectItem><SelectItem value="available">Dostupno</SelectItem><SelectItem value="unavailable">Nedostupno</SelectItem></SelectContent></Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="max-h-[480px] overflow-y-auto">
          <Table>
            <TableHeader><TableRow><TableHead className="text-xs">Naziv</TableHead><TableHead className="text-xs hidden sm:table-cell">Kategorija</TableHead><TableHead className="text-xs hidden md:table-cell">Opis</TableHead><TableHead className="text-xs hidden md:table-cell">Cena</TableHead><TableHead className="text-xs hidden lg:table-cell">Ocene</TableHead><TableHead className="text-xs">Tagovi</TableHead><TableHead className="text-xs text-right">Akcije</TableHead></TableRow></TableHeader>
            <TableBody>
              {filtered.length === 0 ? <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground text-sm">Nema artikala</TableCell></TableRow> : filtered.map(item => (
                <TableRow key={item.id} className={!item.isAvailable ? 'opacity-60' : ''}>
                  <TableCell className="text-xs font-medium">{item.name}</TableCell>
                  <TableCell className="text-xs text-muted-foreground hidden sm:table-cell">{CATEGORIES[item.category]?.label}</TableCell>
                  <TableCell className="text-xs text-muted-foreground hidden md:table-cell max-w-[160px] truncate">{item.description}</TableCell>
                  <TableCell className="text-xs font-semibold hidden md:table-cell">{formatRSD(item.price)}</TableCell>
                  <TableCell className="text-xs hidden lg:table-cell"><div className="flex items-center gap-1"><Star className="h-3 w-3 text-amber-500 fill-amber-500" /><span>{item.rating}</span><span className="text-muted-foreground">({item.orderCount})</span></div></TableCell>
                  <TableCell><div className="flex flex-wrap gap-0.5">
                    {item.isVegetarian && <Badge className="text-xs bg-green-100 text-green-700">Veg</Badge>}
                    {item.isVegan && <Badge className="text-xs bg-green-100 text-green-700">Vegan</Badge>}
                    {item.isSpicy && <Badge className="text-xs bg-red-100 text-red-700">Ljuto</Badge>}
                    {!item.isAvailable && <Badge className="text-xs bg-gray-100 text-gray-700">N/A</Badge>}
                  </div></TableCell>
                  <TableCell className="text-right"><div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onViewDetail(item.id)}><Eye className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onEdit(item)}><Pencil className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => onDelete(item.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}

/* ---- Create Tab ---- */
export function CreateTab({ form, onFormChange, onSave }: { form: Partial<MenuItem>; onFormChange: (f: Partial<MenuItem>) => void; onSave: () => void }) {
  return (
    <Card>
      <CardHeader><CardTitle className="text-base">Novo jelo</CardTitle></CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="grid gap-2"><Label className="text-xs">Naziv *</Label><Input className="text-xs" value={form.name || ''} onChange={e => onFormChange({ ...form, name: e.target.value })} /></div>
            <div className="grid gap-2"><Label className="text-xs">Kategorija</Label><Select value={form.category || 'main_course'} onValueChange={v => onFormChange({ ...form, category: v as MenuItem['category'] })}><SelectTrigger className="text-xs"><SelectValue /></SelectTrigger><SelectContent>{Object.entries(CATEGORIES).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent></Select></div>
            <div className="grid gap-2 sm:col-span-2"><Label className="text-xs">Opis</Label><Input className="text-xs" value={form.description || ''} onChange={e => onFormChange({ ...form, description: e.target.value })} /></div>
            <div className="grid gap-2"><Label className="text-xs">Cena (RSD)</Label><Input className="text-xs" type="number" value={form.price || ''} onChange={e => onFormChange({ ...form, price: Number(e.target.value) })} /></div>
            <div className="grid gap-2"><Label className="text-xs">Vreme pripreme (min)</Label><Input className="text-xs" type="number" value={form.preparationTime || ''} onChange={e => onFormChange({ ...form, preparationTime: Number(e.target.value) })} /></div>
            <div className="grid gap-2"><Label className="text-xs">Kalorije</Label><Input className="text-xs" type="number" value={form.calories || ''} onChange={e => onFormChange({ ...form, calories: Number(e.target.value) })} /></div>
            <div className="grid gap-2"><Label className="text-xs">Sastojci (zarez)</Label><Input className="text-xs" value={(form.ingredients || []).join(', ')} onChange={e => onFormChange({ ...form, ingredients: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} /></div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Label className="text-xs flex items-center gap-1"><input type="checkbox" checked={form.isVegetarian || false} onChange={e => onFormChange({ ...form, isVegetarian: e.target.checked })} />Vegetarijansko</Label>
            <Label className="text-xs flex items-center gap-1"><input type="checkbox" checked={form.isVegan || false} onChange={e => onFormChange({ ...form, isVegan: e.target.checked })} />Vegansko</Label>
            <Label className="text-xs flex items-center gap-1"><input type="checkbox" checked={form.isSpicy || false} onChange={e => onFormChange({ ...form, isSpicy: e.target.checked })} />Ljuto</Label>
          </div>
          <Button size="sm" className="w-fit gap-2" onClick={onSave}><Plus className="h-4 w-4" />Dodaj jelo</Button>
        </div>
      </CardContent>
    </Card>
  )
}

/* ---- Edit Tab ---- */
export function EditTab({ data, onEdit, onDelete }: { data: MenuItem[]; onEdit: (item: MenuItem) => void; onDelete: (id: string) => void }) {
  return (
    <Card>
      <CardHeader><CardTitle className="text-base">Uredi jelovnik</CardTitle></CardHeader>
      <CardContent>
        <div className="max-h-[500px] overflow-y-auto space-y-3">
          {data.map(item => (
            <div key={item.id} className="flex items-center gap-3 p-3 border rounded-lg">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2"><span className="text-xs font-medium">{item.name}</span><Badge className="text-xs bg-muted">{CATEGORIES[item.category]?.label}</Badge>{!item.isAvailable && <Badge className="text-xs bg-gray-100 text-gray-700">N/A</Badge>}</div>
                <p className="text-xs text-muted-foreground truncate">{formatRSD(item.price)} — {item.description}</p>
              </div>
              <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => onEdit(item)}><Pencil className="h-3.5 w-3.5" /></Button>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 shrink-0" onClick={() => onDelete(item.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

/* ---- Detail Dialog ---- */
export function DetailDialog({ detailItem, open, onClose }: { detailItem: MenuItem | null; open: boolean; onClose: () => void }) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader><DialogTitle>{detailItem?.name}</DialogTitle></DialogHeader>
        {detailItem && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">{detailItem.description}</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                ['Kategorija', CATEGORIES[detailItem.category]?.label],
                ['Cena', formatRSD(detailItem.price)],
                ['Vreme pripreme', `${detailItem.preparationTime} min`],
                ['Kalorije', `${detailItem.calories} kcal`],
                ['Ocena', `${detailItem.rating}/5 (${detailItem.orderCount} narudžbi)`],
                ['Dostupno', detailItem.isAvailable ? 'Da' : 'Ne'],
                ['Vegetarijansko', detailItem.isVegetarian ? 'Da' : 'Ne'],
                ['Vegansko', detailItem.isVegan ? 'Da' : 'Ne'],
              ].map(([label, val]) => (
                <div key={label} className="p-2 rounded-lg bg-muted/50"><div className="text-xs text-muted-foreground">{label}</div><div className="text-xs font-medium">{val}</div></div>
              ))}
            </div>
            <div className="p-2 rounded-lg bg-muted/50"><div className="text-xs text-muted-foreground mb-1">Sastojci</div><div className="flex flex-wrap gap-1">{detailItem.ingredients.map(ing => <Badge key={ing} className="text-xs bg-muted">{ing}</Badge>)}</div></div>
            {detailItem.allergens.length > 0 && <div className="p-2 rounded-lg bg-amber-50"><div className="text-xs text-amber-600 mb-1">⚠ Alergeni</div><div className="flex flex-wrap gap-1">{detailItem.allergens.map(a => <Badge key={a} className="text-xs bg-amber-100 text-amber-700">{a}</Badge>)}</div></div>}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

/* ---- Edit Dialog ---- */
export function EditDialog({ form, editItem, open, onClose, onFormChange, onSave }: { form: Partial<MenuItem>; editItem: MenuItem | null; open: boolean; onClose: () => void; onFormChange: (f: Partial<MenuItem>) => void; onSave: () => void }) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader><DialogTitle>{editItem ? 'Uredi' : 'Novo jelo'}</DialogTitle></DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2"><Label className="text-xs">Naziv *</Label><Input className="text-xs" value={form.name || ''} onChange={e => onFormChange({ ...form, name: e.target.value })} /></div>
            <div className="grid gap-2"><Label className="text-xs">Cena</Label><Input className="text-xs" type="number" value={form.price || ''} onChange={e => onFormChange({ ...form, price: Number(e.target.value) })} /></div>
            <div className="grid gap-2"><Label className="text-xs">Kategorija</Label><Select value={form.category || 'main_course'} onValueChange={v => onFormChange({ ...form, category: v as MenuItem['category'] })}><SelectTrigger className="text-xs"><SelectValue /></SelectTrigger><SelectContent>{Object.entries(CATEGORIES).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent></Select></div>
            <div className="grid gap-2"><Label className="text-xs">Dostupno</Label><Select value={form.isAvailable ? 'yes' : 'no'} onValueChange={v => onFormChange({ ...form, isAvailable: v === 'yes' })}><SelectTrigger className="text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="yes">Da</SelectItem><SelectItem value="no">Ne</SelectItem></SelectContent></Select></div>
          </div>
          <div className="grid gap-2"><Label className="text-xs">Opis</Label><Input className="text-xs" value={form.description || ''} onChange={e => onFormChange({ ...form, description: e.target.value })} /></div>
        </div>
        <DialogFooter><Button variant="outline" size="sm" onClick={onClose}>Otkaži</Button><Button size="sm" onClick={onSave}>Sačuvaj</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
