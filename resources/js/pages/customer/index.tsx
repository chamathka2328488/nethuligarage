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
    mobile_no: string;
    email: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Customers', href: '/customers' },
];

const emptyForm = {
    f_name: '',
    l_name: '',
    mobile_no: '',
    email: '',
};

type FormState = typeof emptyForm & { id?: number };

export default function CustomerIndex() {
    const { customers } = usePage<{ customers?: Customer[] }>().props;
    const customerList = customers ?? [];

    const [open, setOpen]     = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [form, setForm]     = useState<FormState>(emptyForm);
    const [search, setSearch] = useState('');
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleOpenAdd = () => {
        setForm(emptyForm);
        setErrors({});
        setIsEdit(false);
        setOpen(true);
    };

    const handleOpenEdit = (c: Customer) => {
        setForm({ id: c.id, f_name: c.f_name, l_name: c.l_name, mobile_no: c.mobile_no, email: c.email });
        setErrors({});
        setIsEdit(true);
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setForm(emptyForm);
        setErrors({});
        setIsEdit(false);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isEdit && form.id) {
            router.put(`/customers/${form.id}`, form, {
                onSuccess: handleClose,
                onError: errs => setErrors(errs as Record<string, string>),
            });
        } else {
            router.post('/customers', form, {
                onSuccess: handleClose,
                onError: errs => setErrors(errs as Record<string, string>),
            });
        }
    };

    const handleDelete = (id: number) => {
        if (window.confirm('Are you sure you want to delete this customer?')) {
            router.delete(`/customers/${id}`);
        }
    };

    const filtered = customerList.filter(c => {
        const term = search.toLowerCase();
        return (
            c.f_name.toLowerCase().includes(term) ||
            c.l_name.toLowerCase().includes(term) ||
            c.email.toLowerCase().includes(term)  ||
            c.mobile_no.includes(term)
        );
    });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Card className="p-6 mt-6">
                <div className="flex flex-col gap-3 mb-4 sm:flex-row sm:items-center sm:justify-between">
                    <h1 className="text-2xl font-bold">Customers</h1>
                    <div className="flex gap-2">
                        <Input
                            placeholder="Search customers…"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-56"
                        />
                        <Button onClick={handleOpenAdd}>Add Customer</Button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full border text-sm rounded-lg">
                        <thead className="bg-gray-100 dark:bg-neutral-800">
                            <tr>
                                <th className="px-4 py-2 text-left font-semibold">ID</th>
                                <th className="px-4 py-2 text-left font-semibold">First Name</th>
                                <th className="px-4 py-2 text-left font-semibold">Last Name</th>
                                <th className="px-4 py-2 text-left font-semibold">Phone</th>
                                <th className="px-4 py-2 text-left font-semibold">Email</th>
                                <th className="px-4 py-2 text-left font-semibold">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-4 py-6 text-center text-gray-400">No customers found.</td>
                                </tr>
                            ) : (
                                filtered.map(c => (
                                    <tr key={c.id} className="border-b last:border-0 hover:bg-gray-50 dark:hover:bg-neutral-700">
                                        <td className="px-4 py-2">{c.id}</td>
                                        <td className="px-4 py-2">{c.f_name}</td>
                                        <td className="px-4 py-2">{c.l_name}</td>
                                        <td className="px-4 py-2">{c.mobile_no}</td>
                                        <td className="px-4 py-2">{c.email}</td>
                                        <td className="px-4 py-2 flex gap-2">
                                            <Button size="sm" variant="outline" onClick={() => handleOpenEdit(c)}>Edit</Button>
                                            <Button size="sm" variant="destructive" onClick={() => handleDelete(c.id)}>Delete</Button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>{isEdit ? 'Update Customer' : 'Add Customer'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <Label>First Name</Label>
                            <Input name="f_name" value={form.f_name} onChange={handleChange} required />
                            {errors.f_name && <p className="text-xs text-red-500 mt-1">{errors.f_name}</p>}
                        </div>
                        <div>
                            <Label>Last Name</Label>
                            <Input name="l_name" value={form.l_name} onChange={handleChange} required />
                            {errors.l_name && <p className="text-xs text-red-500 mt-1">{errors.l_name}</p>}
                        </div>
                        <div>
                            <Label>Phone</Label>
                            <Input name="mobile_no" value={form.mobile_no} onChange={handleChange} required />
                            {errors.mobile_no && <p className="text-xs text-red-500 mt-1">{errors.mobile_no}</p>}
                        </div>
                        <div>
                            <Label>Email</Label>
                            <Input name="email" type="email" value={form.email} onChange={handleChange} required />
                            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
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