import AppLayout from '@/layouts/app-layout';
import { router, usePage } from '@inertiajs/react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { type BreadcrumbItem } from '@/types';

interface InventoryItem {
    id: number;
    item_name: string;
    part_number: string | null;
    category: string | null;
    quantity: number;
    low_stock_threshold: number;
    unit_price: number;
    supplier_name: string | null;
    supplier_contact: string | null;
    notes: string | null;
    stock_status: 'in_stock' | 'low_stock' | 'out_of_stock';
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Inventory', href: '/inventory' },
];

const emptyForm = {
    item_name: '',
    part_number: '',
    category: '',
    quantity: '' as string | number,
    low_stock_threshold: '5' as string | number,
    unit_price: '' as string | number,
    supplier_name: '',
    supplier_contact: '',
    notes: '',
};

type FormState = typeof emptyForm & { id?: number };

const stockBadge = (status: InventoryItem['stock_status']) => {
    if (status === 'out_of_stock') return <span className="px-2 py-0.5 rounded text-xs bg-red-100 text-red-700 font-semibold">Out of Stock</span>;
    if (status === 'low_stock')    return <span className="px-2 py-0.5 rounded text-xs bg-yellow-100 text-yellow-700 font-semibold">Low Stock</span>;
    return <span className="px-2 py-0.5 rounded text-xs bg-green-100 text-green-700 font-semibold">In Stock</span>;
};

export default function InventoryIndex() {
    const { items } = usePage<{ items?: InventoryItem[] }>().props;
    const itemList = items ?? [];

    const [open, setOpen]     = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [form, setForm]     = useState<FormState>(emptyForm);
    const [search, setSearch] = useState('');
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleOpenAdd = () => { setForm(emptyForm); setErrors({}); setIsEdit(false); setOpen(true); };

    const handleOpenEdit = (item: InventoryItem) => {
        setForm({
            id: item.id, item_name: item.item_name, part_number: item.part_number ?? '',
            category: item.category ?? '', quantity: item.quantity,
            low_stock_threshold: item.low_stock_threshold, unit_price: item.unit_price,
            supplier_name: item.supplier_name ?? '', supplier_contact: item.supplier_contact ?? '',
            notes: item.notes ?? '',
        });
        setErrors({}); setIsEdit(true); setOpen(true);
    };

    const handleClose = () => { setOpen(false); setForm(emptyForm); setErrors({}); setIsEdit(false); };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const payload = {
            item_name: form.item_name, part_number: form.part_number || null,
            category: form.category || null, quantity: Number(form.quantity),
            low_stock_threshold: Number(form.low_stock_threshold), unit_price: Number(form.unit_price),
            supplier_name: form.supplier_name || null, supplier_contact: form.supplier_contact || null,
            notes: form.notes || null,
        };
        if (isEdit && form.id) {
            router.put(`/inventory/${form.id}`, payload, { onSuccess: handleClose, onError: errs => setErrors(errs as Record<string, string>) });
        } else {
            router.post('/inventory', payload, { onSuccess: handleClose, onError: errs => setErrors(errs as Record<string, string>) });
        }
    };

    const handleDelete = (id: number) => {
        if (window.confirm('Delete this item?')) router.delete(`/inventory/${id}`);
    };

    const lowStockCount = itemList.filter(i => i.stock_status !== 'in_stock').length;

    const filtered = itemList.filter(i => {
        const term = search.toLowerCase();
        return (
            i.item_name.toLowerCase().includes(term) ||
            (i.part_number ?? '').toLowerCase().includes(term) ||
            (i.category ?? '').toLowerCase().includes(term)
        );
    });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Card className="p-6 mt-6">
                <div className="flex flex-col gap-3 mb-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Inventory</h1>
                        {lowStockCount > 0 && (
                            <p className="text-sm text-yellow-600 mt-1">⚠ {lowStockCount} item(s) need attention</p>
                        )}
                    </div>
                    <div className="flex gap-2">
                        <Input placeholder="Search items…" value={search} onChange={e => setSearch(e.target.value)} className="w-56" />
                        <Button onClick={handleOpenAdd}>Add Item</Button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full border text-sm rounded-lg">
                        <thead className="bg-gray-100 dark:bg-neutral-800">
                            <tr>
                                <th className="px-4 py-2 text-left font-semibold">ID</th>
                                <th className="px-4 py-2 text-left font-semibold">Item Name</th>
                                <th className="px-4 py-2 text-left font-semibold">Part No</th>
                                <th className="px-4 py-2 text-left font-semibold">Category</th>
                                <th className="px-4 py-2 text-left font-semibold">Qty</th>
                                <th className="px-4 py-2 text-left font-semibold">Unit Price (Rs.)</th>
                                <th className="px-4 py-2 text-left font-semibold">Supplier</th>
                                <th className="px-4 py-2 text-left font-semibold">Status</th>
                                <th className="px-4 py-2 text-left font-semibold">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr><td colSpan={9} className="px-4 py-6 text-center text-gray-400">No items found.</td></tr>
                            ) : (
                                filtered.map(item => (
                                    <tr key={item.id} className="border-b last:border-0 hover:bg-gray-50 dark:hover:bg-neutral-700">
                                        <td className="px-4 py-2">{item.id}</td>
                                        <td className="px-4 py-2 font-medium">{item.item_name}</td>
                                        <td className="px-4 py-2">{item.part_number ?? '—'}</td>
                                        <td className="px-4 py-2">{item.category ?? '—'}</td>
                                        <td className="px-4 py-2">{item.quantity}</td>
                                        <td className="px-4 py-2">{Number(item.unit_price).toFixed(2)}</td>
                                        <td className="px-4 py-2">{item.supplier_name ?? '—'}</td>
                                        <td className="px-4 py-2">{stockBadge(item.stock_status)}</td>
                                        <td className="px-4 py-2 flex gap-2">
                                            <Button size="sm" variant="outline" onClick={() => handleOpenEdit(item)}>Edit</Button>
                                            <Button size="sm" variant="destructive" onClick={() => handleDelete(item.id)}>Delete</Button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>{isEdit ? 'Update Item' : 'Add Item'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <Label>Item Name</Label>
                            <Input name="item_name" value={form.item_name} onChange={handleChange} required />
                            {errors.item_name && <p className="text-xs text-red-500 mt-1">{errors.item_name}</p>}
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <Label>Part Number</Label>
                                <Input name="part_number" value={form.part_number} onChange={handleChange} />
                            </div>
                            <div>
                                <Label>Category</Label>
                                <Input name="category" value={form.category} onChange={handleChange} />
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                            <div>
                                <Label>Quantity</Label>
                                <Input name="quantity" type="number" min={0} value={form.quantity} onChange={handleChange} required />
                                {errors.quantity && <p className="text-xs text-red-500 mt-1">{errors.quantity}</p>}
                            </div>
                            <div>
                                <Label>Low Stock Alert</Label>
                                <Input name="low_stock_threshold" type="number" min={0} value={form.low_stock_threshold} onChange={handleChange} required />
                            </div>
                            <div>
                                <Label>Unit Price (Rs.)</Label>
                                <Input name="unit_price" type="number" step="0.01" min={0} value={form.unit_price} onChange={handleChange} required />
                                {errors.unit_price && <p className="text-xs text-red-500 mt-1">{errors.unit_price}</p>}
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <Label>Supplier Name</Label>
                                <Input name="supplier_name" value={form.supplier_name} onChange={handleChange} />
                            </div>
                            <div>
                                <Label>Supplier Contact</Label>
                                <Input name="supplier_contact" value={form.supplier_contact} onChange={handleChange} />
                            </div>
                        </div>
                        <div>
                            <Label>Notes</Label>
                            <textarea name="notes" value={form.notes} onChange={handleChange} rows={2}
                                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                            <Button type="button" variant="outline" onClick={handleClose}>Cancel</Button>
                            <Button type="submit">{isEdit ? 'Update' : 'Add'}</Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}