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
interface Vehicle  { id: number; reg_no: string; make: string; model: string; }
interface JobOrder { id: number; vehicle?: Vehicle; customer?: Customer; labour_charge: number; }
interface Invoice {
    id: number; job_order_id: number; customer_id: number;
    parts_total: number; labour_charge: number; discount: number;
    total_amount: number; payment_status: 'pending' | 'paid';
    invoice_date: string; notes: string | null;
    job_order?: JobOrder; customer?: Customer;
}

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Invoices', href: '/invoices' }];

const emptyForm = {
    job_order_id: '' as string | number,
    customer_id: '' as string | number,
    parts_total: '' as string | number,
    labour_charge: '' as string | number,
    discount: '0' as string | number,
    total_amount: '' as string | number,
    payment_status: 'pending' as 'pending' | 'paid',
    invoice_date: new Date().toISOString().split('T')[0],
    notes: '',
};

type FormState = typeof emptyForm & { id?: number };

const payBadge = (status: Invoice['payment_status']) =>
    status === 'paid'
        ? <span className="px-2 py-0.5 rounded text-xs bg-green-100 text-green-700 font-semibold">Paid</span>
        : <span className="px-2 py-0.5 rounded text-xs bg-red-100 text-red-700 font-semibold">Pending</span>;

export default function InvoiceIndex() {
    const { invoices, jobOrders } = usePage<{ invoices?: Invoice[]; jobOrders?: JobOrder[] }>().props;
    const invoiceList = invoices  ?? [];
    const jobList     = jobOrders ?? [];

    const [open, setOpen]         = useState(false);
    const [isEdit, setIsEdit]     = useState(false);
    const [form, setForm]         = useState<FormState>(emptyForm);
    const [errors, setErrors]     = useState<Record<string, string>>({});
    const [printInv, setPrintInv] = useState<Invoice | null>(null);
    const [search, setSearch]     = useState('');

    const handleOpenAdd = () => { setForm(emptyForm); setErrors({}); setIsEdit(false); setOpen(true); };

    const handleOpenEdit = (inv: Invoice) => {
        setForm({
            id: inv.id, job_order_id: inv.job_order_id, customer_id: inv.customer_id,
            parts_total: inv.parts_total, labour_charge: inv.labour_charge,
            discount: inv.discount, total_amount: inv.total_amount,
            payment_status: inv.payment_status, invoice_date: inv.invoice_date, notes: inv.notes ?? '',
        });
        setErrors({}); setIsEdit(true); setOpen(true);
    };

    const handleClose = () => { setOpen(false); setForm(emptyForm); setErrors({}); setIsEdit(false); };

    const recalcTotal = (parts: number, labour: number, discount: number) =>
        String(Math.max(0, parts + labour - discount).toFixed(2));

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        const updated = { ...form, [name]: value };

        if (name === 'job_order_id') {
            const job = jobList.find(j => j.id === Number(value));
            if (job) {
                updated.customer_id  = job.customer?.id ?? '';
                updated.labour_charge = job.labour_charge;
                updated.total_amount  = recalcTotal(Number(updated.parts_total) || 0, job.labour_charge, Number(updated.discount) || 0);
            }
        }
        if (['parts_total', 'labour_charge', 'discount'].includes(name)) {
            updated.total_amount = recalcTotal(
                Number(name === 'parts_total'   ? value : updated.parts_total)   || 0,
                Number(name === 'labour_charge' ? value : updated.labour_charge) || 0,
                Number(name === 'discount'      ? value : updated.discount)      || 0,
            );
        }
        setForm(updated);
        if (errors[name]) setErrors({ ...errors, [name]: '' });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const payload = {
            job_order_id: Number(form.job_order_id), customer_id: Number(form.customer_id),
            parts_total: Number(form.parts_total), labour_charge: Number(form.labour_charge),
            discount: Number(form.discount), total_amount: Number(form.total_amount),
            payment_status: form.payment_status, invoice_date: form.invoice_date, notes: form.notes || null,
        };
        if (isEdit && form.id) {
            router.put(`/invoices/${form.id}`, payload, { onSuccess: handleClose, onError: errs => setErrors(errs as Record<string, string>) });
        } else {
            router.post('/invoices', payload, { onSuccess: handleClose, onError: errs => setErrors(errs as Record<string, string>) });
        }
    };

    const handleDelete = (id: number) => {
        if (window.confirm('Delete this invoice?')) router.delete(`/invoices/${id}`);
    };

    const handlePrint = (inv: Invoice) => {
        setPrintInv(inv);
        setTimeout(() => window.print(), 300);
    };

    const filtered = invoiceList.filter(inv => {
        const term = search.toLowerCase();
        return (
            String(inv.id).includes(term) ||
            (inv.customer ? `${inv.customer.f_name} ${inv.customer.l_name}` : '').toLowerCase().includes(term) ||
            (inv.job_order?.vehicle?.reg_no ?? '').toLowerCase().includes(term) ||
            inv.payment_status.includes(term)
        );
    });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            {/* Print area */}
            {printInv && (
                <div className="hidden print:block p-8">
                    <h1 className="text-3xl font-bold mb-1">Nethuli Garage</h1>
                    <p className="text-sm text-gray-500 mb-6">136, A1 Stanley Thilakarathna Mawatha, Nugegoda 10250</p>
                    <h2 className="text-xl font-semibold mb-4">Invoice #{printInv.id}</h2>
                    <div className="mb-4 text-sm space-y-1">
                        <p><strong>Customer:</strong> {printInv.customer?.f_name} {printInv.customer?.l_name}</p>
                        <p><strong>Vehicle:</strong> {printInv.job_order?.vehicle?.reg_no} — {printInv.job_order?.vehicle?.make} {printInv.job_order?.vehicle?.model}</p>
                        <p><strong>Date:</strong> {printInv.invoice_date}</p>
                    </div>
                    <table className="w-full text-sm border mb-4">
                        <tbody>
                            <tr className="border-b"><td className="p-2">Parts Total</td><td className="p-2 text-right">Rs. {Number(printInv.parts_total).toFixed(2)}</td></tr>
                            <tr className="border-b"><td className="p-2">Labour Charge</td><td className="p-2 text-right">Rs. {Number(printInv.labour_charge).toFixed(2)}</td></tr>
                            <tr className="border-b"><td className="p-2">Discount</td><td className="p-2 text-right">- Rs. {Number(printInv.discount).toFixed(2)}</td></tr>
                            <tr className="font-bold"><td className="p-2">Total</td><td className="p-2 text-right">Rs. {Number(printInv.total_amount).toFixed(2)}</td></tr>
                        </tbody>
                    </table>
                    <p className="text-sm"><strong>Payment Status:</strong> {printInv.payment_status.toUpperCase()}</p>
                    {printInv.notes && <p className="text-sm mt-2"><strong>Notes:</strong> {printInv.notes}</p>}
                </div>
            )}

            <Card className="p-6 mt-6 print:hidden">
                <div className="flex flex-col gap-3 mb-4 sm:flex-row sm:items-center sm:justify-between">
                    <h1 className="text-2xl font-bold">Invoices</h1>
                    <div className="flex gap-2">
                        <Input placeholder="Search invoices…" value={search} onChange={e => setSearch(e.target.value)} className="w-56" />
                        <Button onClick={handleOpenAdd}>New Invoice</Button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full border text-sm rounded-lg">
                        <thead className="bg-gray-100 dark:bg-neutral-800">
                            <tr>
                                <th className="px-4 py-2 text-left font-semibold">ID</th>
                                <th className="px-4 py-2 text-left font-semibold">Customer</th>
                                <th className="px-4 py-2 text-left font-semibold">Vehicle</th>
                                <th className="px-4 py-2 text-left font-semibold">Date</th>
                                <th className="px-4 py-2 text-left font-semibold">Total (Rs.)</th>
                                <th className="px-4 py-2 text-left font-semibold">Payment</th>
                                <th className="px-4 py-2 text-left font-semibold">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr><td colSpan={7} className="px-4 py-6 text-center text-gray-400">No invoices found.</td></tr>
                            ) : (
                                filtered.map(inv => (
                                    <tr key={inv.id} className="border-b last:border-0 hover:bg-gray-50 dark:hover:bg-neutral-700">
                                        <td className="px-4 py-2 font-mono font-semibold">#{inv.id}</td>
                                        <td className="px-4 py-2">{inv.customer ? `${inv.customer.f_name} ${inv.customer.l_name}` : '—'}</td>
                                        <td className="px-4 py-2 font-mono">{inv.job_order?.vehicle?.reg_no ?? '—'}</td>
                                        <td className="px-4 py-2">{inv.invoice_date}</td>
                                        <td className="px-4 py-2">{Number(inv.total_amount).toFixed(2)}</td>
                                        <td className="px-4 py-2">{payBadge(inv.payment_status)}</td>
                                        <td className="px-4 py-2 flex gap-2">
                                            <Button size="sm" variant="outline" onClick={() => handleOpenEdit(inv)}>Edit</Button>
                                            <Button size="sm" variant="outline" onClick={() => handlePrint(inv)}>Print</Button>
                                            <Button size="sm" variant="destructive" onClick={() => handleDelete(inv.id)}>Delete</Button>
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
                    <DialogHeader><DialogTitle>{isEdit ? 'Update Invoice' : 'New Invoice'}</DialogTitle></DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {!isEdit && (
                            <div>
                                <Label>Completed Job Order</Label>
                                <select name="job_order_id" value={form.job_order_id} onChange={handleChange} required
                                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                                    <option value="">— Select Job Order —</option>
                                    {jobList.map(j => (
                                        <option key={j.id} value={j.id}>
                                            #{j.id} — {j.vehicle?.reg_no} ({j.customer?.f_name} {j.customer?.l_name})
                                        </option>
                                    ))}
                                </select>
                                {errors.job_order_id && <p className="text-xs text-red-500 mt-1">{errors.job_order_id}</p>}
                            </div>
                        )}
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <Label>Parts Total (Rs.)</Label>
                                <Input name="parts_total" type="number" step="0.01" min={0} value={form.parts_total} onChange={handleChange} required />
                            </div>
                            <div>
                                <Label>Labour Charge (Rs.)</Label>
                                <Input name="labour_charge" type="number" step="0.01" min={0} value={form.labour_charge} onChange={handleChange} required />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <Label>Discount (Rs.)</Label>
                                <Input name="discount" type="number" step="0.01" min={0} value={form.discount} onChange={handleChange} />
                            </div>
                            <div>
                                <Label>Total Amount (Rs.)</Label>
                                <Input name="total_amount" type="number" step="0.01" value={form.total_amount} onChange={handleChange} required />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <Label>Payment Status</Label>
                                <select name="payment_status" value={form.payment_status} onChange={handleChange} required
                                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                                    <option value="pending">Pending</option>
                                    <option value="paid">Paid</option>
                                </select>
                            </div>
                            <div>
                                <Label>Invoice Date</Label>
                                <Input name="invoice_date" type="date" value={form.invoice_date} onChange={handleChange} required />
                            </div>
                        </div>
                        <div>
                            <Label>Notes</Label>
                            <textarea name="notes" value={form.notes} onChange={handleChange} rows={2}
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