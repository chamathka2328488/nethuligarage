import AppLayout from '@/layouts/app-layout';
import { router, usePage } from '@inertiajs/react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { type BreadcrumbItem } from '@/types';

interface Customer {
    id: number;
    f_name: string;
    l_name: string;
}

interface Vehicle {
    id: number;
    customer_id: number;
    reg_no: string;
    make: string;
    model: string;
    year: number;
    color: string | null;
    engine_no: string | null;
    chassis_no: string | null;
    customer: Customer;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Vehicles', href: '/vehicles' },
];

const emptyForm = {
    customer_id: '' as string | number,
    reg_no: '',
    make: '',
    model: '',
    year: '' as string | number,
    color: '',
    engine_no: '',
    chassis_no: '',
};

type FormState = typeof emptyForm & { id?: number };

export default function VehicleIndex() {
    const { vehicles, customers } = usePage<{ vehicles?: Vehicle[]; customers?: Customer[] }>().props;
    const vehicleList  = vehicles  ?? [];
    const customerList = customers ?? [];

    const [open, setOpen]     = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [form, setForm]     = useState<FormState>(emptyForm);
    const [search, setSearch] = useState('');
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleOpenAdd = () => { setForm(emptyForm); setErrors({}); setIsEdit(false); setOpen(true); };

    const handleOpenEdit = (v: Vehicle) => {
        setForm({
            id: v.id, customer_id: v.customer_id, reg_no: v.reg_no,
            make: v.make, model: v.model, year: v.year,
            color: v.color ?? '', engine_no: v.engine_no ?? '', chassis_no: v.chassis_no ?? '',
        });
        setErrors({}); setIsEdit(true); setOpen(true);
    };

    const handleClose = () => { setOpen(false); setForm(emptyForm); setErrors({}); setIsEdit(false); };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (name === 'customer_id' || name === 'year') {
            setForm({ ...form, [name]: value === '' ? '' : Number(value) });
        } else {
            setForm({ ...form, [name]: value });
        }
        if (errors[name]) setErrors({ ...errors, [name]: '' });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const payload = {
            customer_id: Number(form.customer_id),
            reg_no: form.reg_no, make: form.make, model: form.model,
            year: Number(form.year), color: form.color || null,
            engine_no: form.engine_no || null, chassis_no: form.chassis_no || null,
        };
        if (isEdit && form.id) {
            router.put(`/vehicles/${form.id}`, payload, { onSuccess: handleClose, onError: errs => setErrors(errs as Record<string, string>) });
        } else {
            router.post('/vehicles', payload, { onSuccess: handleClose, onError: errs => setErrors(errs as Record<string, string>) });
        }
    };

    const handleDelete = (id: number) => {
        if (window.confirm('Delete this vehicle?')) router.delete(`/vehicles/${id}`);
    };

    const filtered = vehicleList.filter(v => {
        const term = search.toLowerCase();
        return (
            v.reg_no.toLowerCase().includes(term) ||
            v.make.toLowerCase().includes(term)   ||
            v.model.toLowerCase().includes(term)  ||
            `${v.customer.f_name} ${v.customer.l_name}`.toLowerCase().includes(term)
        );
    });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Card className="p-6 mt-6">
                <div className="flex flex-col gap-3 mb-4 sm:flex-row sm:items-center sm:justify-between">
                    <h1 className="text-2xl font-bold">Vehicles</h1>
                    <div className="flex gap-2">
                        <Input placeholder="Search vehicles…" value={search} onChange={e => setSearch(e.target.value)} className="w-56" />
                        <Button onClick={handleOpenAdd}>Add Vehicle</Button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full border text-sm rounded-lg">
                        <thead className="bg-gray-100 dark:bg-neutral-800">
                            <tr>
                                <th className="px-4 py-2 text-left font-semibold">ID</th>
                                <th className="px-4 py-2 text-left font-semibold">Reg No</th>
                                <th className="px-4 py-2 text-left font-semibold">Make</th>
                                <th className="px-4 py-2 text-left font-semibold">Model</th>
                                <th className="px-4 py-2 text-left font-semibold">Year</th>
                                <th className="px-4 py-2 text-left font-semibold">Color</th>
                                <th className="px-4 py-2 text-left font-semibold">Owner</th>
                                <th className="px-4 py-2 text-left font-semibold">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr><td colSpan={8} className="px-4 py-6 text-center text-gray-400">No vehicles found.</td></tr>
                            ) : (
                                filtered.map(v => (
                                    <tr key={v.id} className="border-b last:border-0 hover:bg-gray-50 dark:hover:bg-neutral-700">
                                        <td className="px-4 py-2">{v.id}</td>
                                        <td className="px-4 py-2 font-mono font-semibold">{v.reg_no}</td>
                                        <td className="px-4 py-2">{v.make}</td>
                                        <td className="px-4 py-2">{v.model}</td>
                                        <td className="px-4 py-2">{v.year}</td>
                                        <td className="px-4 py-2">{v.color ?? '—'}</td>
                                        <td className="px-4 py-2">{v.customer.f_name} {v.customer.l_name}</td>
                                        <td className="px-4 py-2 flex gap-2">
                                            <Button size="sm" variant="outline" onClick={() => handleOpenEdit(v)}>Edit</Button>
                                            <Button size="sm" variant="destructive" onClick={() => handleDelete(v.id)}>Delete</Button>
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
                        <DialogTitle>{isEdit ? 'Update Vehicle' : 'Add Vehicle'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <Label>Owner (Customer)</Label>
                            <select name="customer_id" value={form.customer_id} onChange={handleChange} required
                                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                                <option value="">— Select Customer —</option>
                                {customerList.map(c => (
                                    <option key={c.id} value={c.id}>{c.f_name} {c.l_name}</option>
                                ))}
                            </select>
                            {errors.customer_id && <p className="text-xs text-red-500 mt-1">{errors.customer_id}</p>}
                        </div>
                        <div>
                            <Label>Registration No</Label>
                            <Input name="reg_no" value={form.reg_no} onChange={handleChange} placeholder="e.g. CAB-1234" required />
                            {errors.reg_no && <p className="text-xs text-red-500 mt-1">{errors.reg_no}</p>}
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <Label>Make</Label>
                                <Input name="make" value={form.make} onChange={handleChange} placeholder="e.g. Toyota" required />
                                {errors.make && <p className="text-xs text-red-500 mt-1">{errors.make}</p>}
                            </div>
                            <div>
                                <Label>Model</Label>
                                <Input name="model" value={form.model} onChange={handleChange} placeholder="e.g. Corolla" required />
                                {errors.model && <p className="text-xs text-red-500 mt-1">{errors.model}</p>}
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <Label>Year</Label>
                                <Input name="year" type="number" value={form.year} onChange={handleChange} min={1900} max={new Date().getFullYear() + 1} required />
                                {errors.year && <p className="text-xs text-red-500 mt-1">{errors.year}</p>}
                            </div>
                            <div>
                                <Label>Color</Label>
                                <Input name="color" value={form.color} onChange={handleChange} placeholder="e.g. White" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <Label>Engine No</Label>
                                <Input name="engine_no" value={form.engine_no} onChange={handleChange} />
                            </div>
                            <div>
                                <Label>Chassis No</Label>
                                <Input name="chassis_no" value={form.chassis_no} onChange={handleChange} />
                            </div>
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