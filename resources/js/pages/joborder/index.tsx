import AppLayout from '@/layouts/app-layout';
import { router, usePage } from '@inertiajs/react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { type BreadcrumbItem } from '@/types';

interface Customer { id: number; f_name: string; l_name: string; }
interface Vehicle  { id: number; reg_no: string; make: string; model: string; customer?: Customer; }
interface InventoryItem { id: number; item_name: string; unit_price: number; quantity: number; }
interface JobOrderItem  { id?: number; inventory_item_id: number; quantity_used: number; unit_price: number; inventory_item?: InventoryItem; }
interface JobOrder {
    id: number; vehicle_id: number; customer_id: number; mechanic_name: string | null;
    description: string; status: 'pending' | 'in_progress' | 'completed';
    date_in: string; date_out: string | null; labour_charge: number; notes: string | null;
    vehicle?: Vehicle; customer?: Customer; items?: JobOrderItem[];
}

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Job Orders', href: '/joborders' }];

const emptyForm = {
    vehicle_id: '' as string | number, customer_id: '' as string | number,
    mechanic_name: '', description: '', status: 'pending' as 'pending' | 'in_progress' | 'completed',
    date_in: new Date().toISOString().split('T')[0], date_out: '',
    labour_charge: '' as string | number, notes: '',
};

type FormState = typeof emptyForm & { id?: number };
type PartRow   = { inventory_item_id: number | string; quantity_used: number | string; unit_price: number | string; };

const statusBadge = (status: JobOrder['status']) => {
    const map    = { pending: 'bg-yellow-100 text-yellow-700', in_progress: 'bg-blue-100 text-blue-700', completed: 'bg-green-100 text-green-700' };
    const labels = { pending: 'Pending', in_progress: 'In Progress', completed: 'Completed' };
    return <span className={`px-2 py-0.5 rounded text-xs font-semibold ${map[status]}`}>{labels[status]}</span>;
};

export default function JobOrderIndex() {
    const { jobOrders, vehicles, customers, inventory } = usePage<{
        jobOrders?: JobOrder[]; vehicles?: Vehicle[]; customers?: Customer[]; inventory?: InventoryItem[];
    }>().props;

    const jobList       = jobOrders ?? [];
    const vehicleList   = vehicles  ?? [];
    const customerList  = customers ?? [];
    const inventoryList = inventory ?? [];

    const [open, setOpen]       = useState(false);
    const [isEdit, setIsEdit]   = useState(false);
    const [form, setForm]       = useState<FormState>(emptyForm);
    const [parts, setParts]     = useState<PartRow[]>([]);
    const [errors, setErrors]   = useState<Record<string, string>>({});
    const [viewJob, setViewJob] = useState<JobOrder | null>(null);
    const [search, setSearch]   = useState('');
    const [filterFrom, setFilterFrom] = useState('');
    const [filterTo,   setFilterTo]   = useState('');
    const [filterStatus, setFilterStatus] = useState('');

    const handleOpenAdd = () => { setForm(emptyForm); setParts([]); setErrors({}); setIsEdit(false); setOpen(true); };

    const handleOpenEdit = (job: JobOrder) => {
        setForm({
            id: job.id, vehicle_id: job.vehicle_id, customer_id: job.customer_id,
            mechanic_name: job.mechanic_name ?? '', description: job.description,
            status: job.status, date_in: job.date_in, date_out: job.date_out ?? '',
            labour_charge: job.labour_charge, notes: job.notes ?? '',
        });
        setParts([]); setErrors({}); setIsEdit(true); setOpen(true);
    };

    const handleClose = () => { setOpen(false); setForm(emptyForm); setParts([]); setErrors({}); setIsEdit(false); };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        if (name === 'vehicle_id') {
            const vehicle = vehicleList.find(v => v.id === Number(value));
            setForm(prev => ({ ...prev, vehicle_id: Number(value), customer_id: vehicle?.customer?.id ?? prev.customer_id }));
            return;
        }
        if (name === 'customer_id' || name === 'labour_charge') {
            setForm(prev => ({ ...prev, [name]: value === '' ? '' : Number(value) }));
        } else {
            setForm(prev => ({ ...prev, [name]: value }));
        }
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const handleAddPart = () => setParts(prev => [...prev, { inventory_item_id: '', quantity_used: 1, unit_price: 0 }]);

    const handlePartChange = (index: number, field: keyof PartRow, value: string) => {
        setParts(prev => {
            const updated = [...prev];
            if (field === 'inventory_item_id') {
                const item = inventoryList.find(i => i.id === Number(value));
                updated[index] = { ...updated[index], inventory_item_id: Number(value), unit_price: item?.unit_price ?? 0 };
            } else {
                updated[index] = { ...updated[index], [field]: Number(value) };
            }
            return updated;
        });
    };

    const handleRemovePart = (index: number) => setParts(prev => prev.filter((_, i) => i !== index));

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newErrors: Record<string, string> = {};
        if (!form.vehicle_id)    newErrors.vehicle_id    = 'Please select a vehicle.';
        if (!form.customer_id)   newErrors.customer_id   = 'Please select a customer.';
        if (!form.description)   newErrors.description   = 'Description is required.';
        if (!form.date_in)       newErrors.date_in       = 'Date in is required.';
        if (form.labour_charge === '') newErrors.labour_charge = 'Labour charge is required.';
        if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }

        const payload = {
            vehicle_id: Number(form.vehicle_id), customer_id: Number(form.customer_id),
            mechanic_name: form.mechanic_name || null, description: form.description,
            status: form.status, date_in: form.date_in, date_out: form.date_out || null,
            labour_charge: Number(form.labour_charge), notes: form.notes || null,
            items: parts.filter(p => Number(p.inventory_item_id) > 0).map(p => ({
                inventory_item_id: Number(p.inventory_item_id),
                quantity_used: Number(p.quantity_used),
                unit_price: Number(p.unit_price),
            })),
        };

        if (isEdit && form.id) {
            router.put(`/joborders/${form.id}`, payload, { onSuccess: handleClose, onError: errs => setErrors(errs as Record<string, string>) });
        } else {
            router.post('/joborders', payload, { onSuccess: handleClose, onError: errs => setErrors(errs as Record<string, string>) });
        }
    };

    const handleDelete = (id: number) => {
        if (window.confirm('Delete this job order?')) router.delete(`/joborders/${id}`);
    };

    const filtered = jobList.filter(job => {
        const term = search.toLowerCase();
        const matchText =
            String(job.id).includes(term) ||
            (job.vehicle?.reg_no ?? '').toLowerCase().includes(term) ||
            (job.customer ? `${job.customer.f_name} ${job.customer.l_name}` : '').toLowerCase().includes(term) ||
            (job.mechanic_name ?? '').toLowerCase().includes(term) ||
            job.status.toLowerCase().includes(term);

        const matchStatus = filterStatus ? job.status === filterStatus : true;

        const jobDate = job.date_in; // 'YYYY-MM-DD'
        const matchFrom = filterFrom ? jobDate >= filterFrom : true;
        const matchTo   = filterTo   ? jobDate <= filterTo   : true;

        return matchText && matchStatus && matchFrom && matchTo;
    });

    const handleClearFilters = () => {
        setSearch('');
        setFilterFrom('');
        setFilterTo('');
        setFilterStatus('');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Card className="p-6 mt-6">
                <div className="flex flex-col gap-3 mb-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <h1 className="text-2xl font-bold">Job Orders</h1>
                        <Button onClick={handleOpenAdd}>New Job Order</Button>
                    </div>

                    {/* Filter bar */}
                    <div className="flex flex-wrap gap-2 items-end p-3 bg-gray-50 dark:bg-neutral-800 rounded-lg border border-gray-200 dark:border-neutral-700">
                        <div>
                            <label className="text-xs text-gray-500 block mb-1">Search</label>
                            <Input
                                placeholder="ID, vehicle, customer, mechanic…"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="w-52"
                            />
                        </div>

                        <div>
                            <label className="text-xs text-gray-500 block mb-1">Status</label>
                            <select
                                value={filterStatus}
                                onChange={e => setFilterStatus(e.target.value)}
                                className="rounded-md border border-input bg-background px-3 py-2 text-sm h-10"
                            >
                                <option value="">All statuses</option>
                                <option value="pending">Pending</option>
                                <option value="in_progress">In Progress</option>
                                <option value="completed">Completed</option>
                            </select>
                        </div>

                        <div>
                            <label className="text-xs text-gray-500 block mb-1">Date In — From</label>
                            <Input
                                type="date"
                                value={filterFrom}
                                onChange={e => setFilterFrom(e.target.value)}
                                className="w-40"
                            />
                        </div>

                        <div>
                            <label className="text-xs text-gray-500 block mb-1">Date In — To</label>
                            <Input
                                type="date"
                                value={filterTo}
                                onChange={e => setFilterTo(e.target.value)}
                                className="w-40"
                            />
                        </div>

                        {(search || filterStatus || filterFrom || filterTo) && (
                            <Button variant="outline" size="sm" onClick={handleClearFilters} className="self-end">
                                Clear filters
                            </Button>
                        )}

                        <div className="self-end ml-auto">
                            <span className="text-xs text-gray-400">
                                {filtered.length} of {jobList.length} job orders
                            </span>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full border text-sm rounded-lg">
                        <thead className="bg-gray-100 dark:bg-neutral-800">
                            <tr>
                                <th className="px-4 py-2 text-left font-semibold">ID</th>
                                <th className="px-4 py-2 text-left font-semibold">Vehicle</th>
                                <th className="px-4 py-2 text-left font-semibold">Customer</th>
                                <th className="px-4 py-2 text-left font-semibold">Mechanic</th>
                                <th className="px-4 py-2 text-left font-semibold">Date In</th>
                                <th className="px-4 py-2 text-left font-semibold">Date Out</th>
                                <th className="px-4 py-2 text-left font-semibold">Status</th>
                                <th className="px-4 py-2 text-left font-semibold">Labour (Rs.)</th>
                                <th className="px-4 py-2 text-left font-semibold">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr><td colSpan={9} className="px-4 py-6 text-center text-gray-400">No job orders found.</td></tr>
                            ) : (
                                filtered.map(job => (
                                    <tr key={job.id} className="border-b last:border-0 hover:bg-gray-50 dark:hover:bg-neutral-700">
                                        <td className="px-4 py-2 font-mono font-semibold">#{job.id}</td>
                                        <td className="px-4 py-2 font-mono">{job.vehicle?.reg_no ?? '—'}</td>
                                        <td className="px-4 py-2">{job.customer ? `${job.customer.f_name} ${job.customer.l_name}` : '—'}</td>
                                        <td className="px-4 py-2">{job.mechanic_name ?? '—'}</td>
                                        <td className="px-4 py-2">{job.date_in}</td>
                                        <td className="px-4 py-2">{job.date_out ?? '—'}</td>
                                        <td className="px-4 py-2">{statusBadge(job.status)}</td>
                                        <td className="px-4 py-2">{Number(job.labour_charge).toFixed(2)}</td>
                                        <td className="px-4 py-2 flex gap-2">
                                            <Button size="sm" variant="outline" onClick={() => setViewJob(job)}>View</Button>
                                            <Button size="sm" variant="outline" onClick={() => handleOpenEdit(job)}>Edit</Button>
                                            <Button size="sm" variant="destructive" onClick={() => handleDelete(job.id)}>Delete</Button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* View Dialog */}
            <Dialog open={!!viewJob} onOpenChange={() => setViewJob(null)}>
                <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader><DialogTitle>Job Order #{viewJob?.id}</DialogTitle></DialogHeader>
                    {viewJob && (
                        <div className="space-y-3 text-sm">
                            <div className="grid grid-cols-2 gap-2">
                                <div><span className="font-semibold">Vehicle:</span> {viewJob.vehicle?.reg_no} — {viewJob.vehicle?.make} {viewJob.vehicle?.model}</div>
                                <div><span className="font-semibold">Customer:</span> {viewJob.customer?.f_name} {viewJob.customer?.l_name}</div>
                                <div><span className="font-semibold">Mechanic:</span> {viewJob.mechanic_name ?? '—'}</div>
                                <div><span className="font-semibold">Status:</span> {statusBadge(viewJob.status)}</div>
                                <div><span className="font-semibold">Date In:</span> {viewJob.date_in}</div>
                                <div><span className="font-semibold">Date Out:</span> {viewJob.date_out ?? '—'}</div>
                                <div><span className="font-semibold">Labour:</span> Rs. {Number(viewJob.labour_charge).toFixed(2)}</div>
                            </div>
                            <div><span className="font-semibold">Description:</span><p className="mt-1 text-gray-600">{viewJob.description}</p></div>
                            {viewJob.notes && <div><span className="font-semibold">Notes:</span><p className="mt-1 text-gray-600">{viewJob.notes}</p></div>}
                            {viewJob.items && viewJob.items.length > 0 && (
                                <div>
                                    <p className="font-semibold mb-1">Parts Used</p>
                                    <table className="w-full border text-xs">
                                        <thead className="bg-gray-100"><tr><th className="p-2 text-left">Part</th><th className="p-2 text-right">Qty</th><th className="p-2 text-right">Price</th><th className="p-2 text-right">Subtotal</th></tr></thead>
                                        <tbody>
                                            {viewJob.items.map((item, i) => (
                                                <tr key={i} className="border-t">
                                                    <td className="p-2">{item.inventory_item?.item_name ?? `Item #${item.inventory_item_id}`}</td>
                                                    <td className="p-2 text-right">{item.quantity_used}</td>
                                                    <td className="p-2 text-right">{Number(item.unit_price).toFixed(2)}</td>
                                                    <td className="p-2 text-right">{(Number(item.quantity_used) * Number(item.unit_price)).toFixed(2)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Add / Edit Dialog */}
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader><DialogTitle>{isEdit ? 'Update Job Order' : 'New Job Order'}</DialogTitle></DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <Label>Vehicle</Label>
                            <select name="vehicle_id" value={form.vehicle_id} onChange={handleChange} required
                                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                                <option value="">— Select Vehicle —</option>
                                {vehicleList.map(v => <option key={v.id} value={v.id}>{v.reg_no} — {v.make} {v.model}</option>)}
                            </select>
                            {errors.vehicle_id && <p className="text-xs text-red-500 mt-1">{errors.vehicle_id}</p>}
                        </div>
                        <div>
                            <Label>Customer</Label>
                            <select name="customer_id" value={form.customer_id} onChange={handleChange} required
                                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                                <option value="">— Select Customer —</option>
                                {customerList.map(c => <option key={c.id} value={c.id}>{c.f_name} {c.l_name}</option>)}
                            </select>
                            {errors.customer_id && <p className="text-xs text-red-500 mt-1">{errors.customer_id}</p>}
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <Label>Mechanic Name</Label>
                                <Input name="mechanic_name" value={form.mechanic_name} onChange={handleChange} placeholder="e.g. Kamal" />
                            </div>
                            <div>
                                <Label>Status</Label>
                                <select name="status" value={form.status} onChange={handleChange} required
                                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                                    <option value="pending">Pending</option>
                                    <option value="in_progress">In Progress</option>
                                    <option value="completed">Completed</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <Label>Description</Label>
                            <textarea name="description" value={form.description} onChange={handleChange} required rows={3} placeholder="Describe the work…"
                                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
                            {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description}</p>}
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                            <div>
                                <Label>Date In</Label>
                                <Input name="date_in" type="date" value={form.date_in} onChange={handleChange} required />
                                {errors.date_in && <p className="text-xs text-red-500 mt-1">{errors.date_in}</p>}
                            </div>
                            <div>
                                <Label>Date Out</Label>
                                <Input name="date_out" type="date" value={form.date_out} onChange={handleChange} />
                            </div>
                            <div>
                                <Label>Labour Charge (Rs.)</Label>
                                <Input name="labour_charge" type="number" step="0.01" min={0} value={form.labour_charge} onChange={handleChange} required />
                                {errors.labour_charge && <p className="text-xs text-red-500 mt-1">{errors.labour_charge}</p>}
                            </div>
                        </div>

                        {!isEdit && (
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <Label>Parts Used</Label>
                                    <Button type="button" size="sm" variant="outline" onClick={handleAddPart}>+ Add Part</Button>
                                </div>
                                {parts.length === 0 && <p className="text-xs text-gray-400 mb-2">No parts added yet.</p>}
                                {parts.map((part, index) => (
                                    <div key={index} className="grid grid-cols-12 gap-2 mb-2 items-center">
                                        <div className="col-span-5">
                                            <select value={part.inventory_item_id} onChange={e => handlePartChange(index, 'inventory_item_id', e.target.value)}
                                                className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm">
                                                <option value="">— Select Part —</option>
                                                {inventoryList.map(i => <option key={i.id} value={i.id}>{i.item_name} (Stock: {i.quantity})</option>)}
                                            </select>
                                        </div>
                                        <div className="col-span-2">
                                            <Input type="number" min={1} placeholder="Qty" value={part.quantity_used} onChange={e => handlePartChange(index, 'quantity_used', e.target.value)} />
                                        </div>
                                        <div className="col-span-4">
                                            <Input type="number" step="0.01" placeholder="Unit Price" value={part.unit_price} onChange={e => handlePartChange(index, 'unit_price', e.target.value)} />
                                        </div>
                                        <div className="col-span-1">
                                            <Button type="button" size="sm" variant="destructive" onClick={() => handleRemovePart(index)}>✕</Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div>
                            <Label>Notes</Label>
                            <textarea name="notes" value={form.notes} onChange={handleChange} rows={2} placeholder="Additional notes…"
                                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                            <Button type="button" variant="outline" onClick={handleClose}>Cancel</Button>
                            <Button type="submit">{isEdit ? 'Update' : 'Create'}</Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}