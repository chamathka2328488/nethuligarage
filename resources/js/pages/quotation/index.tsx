import AppLayout from '@/layouts/app-layout';
import { router, usePage } from '@inertiajs/react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useState, useRef } from 'react';
import { type BreadcrumbItem } from '@/types';

interface Customer { id: number; f_name: string; l_name: string; }
interface Vehicle  { id: number; reg_no: string; make: string; model: string; customer?: Customer; }
interface QuotationItem  { part_name: string; quantity: number; unit_price: number; }
interface QuotationImage { id: number; image_path: string; }
interface Quotation {
    id: number; vehicle_id: number; customer_id: number;
    insurance_company: string | null; insurance_policy_no: string | null; insurance_contact: string | null;
    damage_description: string; parts_total: number; labour_charge: number; total_amount: number;
    status: 'draft' | 'submitted' | 'approved' | 'rejected';
    quotation_date: string; notes: string | null;
    vehicle?: Vehicle; customer?: Customer; items?: QuotationItem[]; images?: QuotationImage[];
}

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Quotations', href: '/quotations' }];

const emptyForm = {
    vehicle_id: '' as string | number, customer_id: '' as string | number,
    insurance_company: '', insurance_policy_no: '', insurance_contact: '',
    damage_description: '', parts_total: '' as string | number,
    labour_charge: '' as string | number, total_amount: '' as string | number,
    status: 'draft' as 'draft' | 'submitted' | 'approved' | 'rejected',
    quotation_date: new Date().toISOString().split('T')[0], notes: '',
};

type FormState = typeof emptyForm & { id?: number };

const statusBadge = (status: Quotation['status']) => {
    const map = { draft: 'bg-gray-100 text-gray-600', submitted: 'bg-blue-100 text-blue-700', approved: 'bg-green-100 text-green-700', rejected: 'bg-red-100 text-red-700' };
    return <span className={`px-2 py-0.5 rounded text-xs font-semibold capitalize ${map[status]}`}>{status}</span>;
};

export default function QuotationIndex() {
    const { quotations, vehicles, customers } = usePage<{ quotations?: Quotation[]; vehicles?: Vehicle[]; customers?: Customer[] }>().props;
    const quotationList = quotations ?? [];
    const vehicleList   = vehicles   ?? [];
    const customerList  = customers  ?? [];

    const [open, setOpen]             = useState(false);
    const [isEdit, setIsEdit]         = useState(false);
    const [form, setForm]             = useState<FormState>(emptyForm);
    const [parts, setParts]           = useState<QuotationItem[]>([]);
    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const [existingImages, setExistingImages] = useState<QuotationImage[]>([]);
    const [deletedImageIds, setDeletedImageIds] = useState<number[]>([]);
    const [errors, setErrors]         = useState<Record<string, string>>({});
    const [viewQuote, setViewQuote]   = useState<Quotation | null>(null);
    const [search, setSearch]         = useState('');
    const fileRef = useRef<HTMLInputElement>(null);

    const handleOpenAdd = () => { setForm(emptyForm); setParts([]); setImageFiles([]); setExistingImages([]); setDeletedImageIds([]); setErrors({}); setIsEdit(false); setOpen(true); };

    const handleOpenEdit = (q: Quotation) => {
        setForm({
            id: q.id, vehicle_id: q.vehicle_id, customer_id: q.customer_id,
            insurance_company: q.insurance_company ?? '', insurance_policy_no: q.insurance_policy_no ?? '',
            insurance_contact: q.insurance_contact ?? '', damage_description: q.damage_description,
            parts_total: q.parts_total, labour_charge: q.labour_charge, total_amount: q.total_amount,
            status: q.status, quotation_date: q.quotation_date, notes: q.notes ?? '',
        });
        setParts(q.items ?? []);
        setExistingImages(q.images ?? []);
        setDeletedImageIds([]);
        setImageFiles([]);
        setErrors({});
        setIsEdit(true);
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setForm(emptyForm);
        setParts([]);
        setImageFiles([]);
        setExistingImages([]);
        setDeletedImageIds([]);
        setErrors({});
        setIsEdit(false);
    };

    const handleDeleteExistingImage = (id: number) => {
        setDeletedImageIds(prev => [...prev, id]);
        setExistingImages(prev => prev.filter(img => img.id !== id));
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        const updated = { ...form, [name]: value };
        if (['parts_total', 'labour_charge'].includes(name)) {
            const p = parseFloat(name === 'parts_total'   ? value : String(updated.parts_total))  || 0;
            const l = parseFloat(name === 'labour_charge' ? value : String(updated.labour_charge)) || 0;
            updated.total_amount = String((p + l).toFixed(2));
        }
        setForm(updated);
        if (errors[name]) setErrors({ ...errors, [name]: '' });
    };

    const handleAddPart = () => setParts(prev => [...prev, { part_name: '', quantity: 1, unit_price: 0 }]);

    const handlePartChange = (index: number, field: keyof QuotationItem, value: string) => {
        setParts(prev => {
            const updated = [...prev];
            updated[index] = { ...updated[index], [field]: field === 'part_name' ? value : Number(value) };
            const total = updated.reduce((sum, p) => sum + p.quantity * p.unit_price, 0);
            const labour = parseFloat(String(form.labour_charge)) || 0;
            setForm(f => ({ ...f, parts_total: String(total.toFixed(2)), total_amount: String((total + labour).toFixed(2)) }));
            return updated;
        });
    };

    const handleRemovePart = (index: number) => {
        const updated = parts.filter((_, i) => i !== index);
        setParts(updated);
        const total = updated.reduce((sum, p) => sum + p.quantity * p.unit_price, 0);
        const labour = parseFloat(String(form.labour_charge)) || 0;
        setForm(f => ({ ...f, parts_total: String(total.toFixed(2)), total_amount: String((total + labour).toFixed(2)) }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const data = new FormData();
        Object.entries(form).forEach(([k, v]) => { if (v !== undefined && v !== null) data.append(k, String(v)); });
        parts.forEach((p, i) => {
            data.append(`items[${i}][part_name]`,  p.part_name);
            data.append(`items[${i}][quantity]`,   String(p.quantity));
            data.append(`items[${i}][unit_price]`, String(p.unit_price));
        });
        imageFiles.forEach(file => data.append('images[]', file));
        deletedImageIds.forEach(id => data.append('delete_image_ids[]', String(id)));

        if (isEdit && form.id) {
            router.post(`/quotations/${form.id}?_method=PUT`, data, { onSuccess: handleClose, onError: errs => setErrors(errs as Record<string, string>) });
        } else {
            router.post('/quotations', data, { forceFormData: true, onSuccess: handleClose, onError: errs => setErrors(errs as Record<string, string>) });
        }
    };

    const handleDelete = (id: number) => {
        if (window.confirm('Delete this quotation?')) router.delete(`/quotations/${id}`);
    };

    const filtered = quotationList.filter(q => {
        const term = search.toLowerCase();
        return (
            String(q.id).includes(term) ||
            (q.vehicle?.reg_no ?? '').toLowerCase().includes(term) ||
            (q.customer ? `${q.customer.f_name} ${q.customer.l_name}` : '').toLowerCase().includes(term) ||
            (q.insurance_company ?? '').toLowerCase().includes(term) ||
            q.status.includes(term)
        );
    });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Card className="p-6 mt-6">
                <div className="flex flex-col gap-3 mb-4 sm:flex-row sm:items-center sm:justify-between">
                    <h1 className="text-2xl font-bold">Quotations</h1>
                    <div className="flex gap-2">
                        <Input placeholder="Search quotations…" value={search} onChange={e => setSearch(e.target.value)} className="w-56" />
                        <Button onClick={handleOpenAdd}>New Quotation</Button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full border text-sm rounded-lg">
                        <thead className="bg-gray-100 dark:bg-neutral-800">
                            <tr>
                                <th className="px-4 py-2 text-left font-semibold">ID</th>
                                <th className="px-4 py-2 text-left font-semibold">Customer</th>
                                <th className="px-4 py-2 text-left font-semibold">Vehicle</th>
                                <th className="px-4 py-2 text-left font-semibold">Insurance Co.</th>
                                <th className="px-4 py-2 text-left font-semibold">Date</th>
                                <th className="px-4 py-2 text-left font-semibold">Total (Rs.)</th>
                                <th className="px-4 py-2 text-left font-semibold">Status</th>
                                <th className="px-4 py-2 text-left font-semibold">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr><td colSpan={8} className="px-4 py-6 text-center text-gray-400">No quotations found.</td></tr>
                            ) : (
                                filtered.map(q => (
                                    <tr key={q.id} className="border-b last:border-0 hover:bg-gray-50 dark:hover:bg-neutral-700">
                                        <td className="px-4 py-2 font-mono font-semibold">#{q.id}</td>
                                        <td className="px-4 py-2">{q.customer ? `${q.customer.f_name} ${q.customer.l_name}` : '—'}</td>
                                        <td className="px-4 py-2 font-mono">{q.vehicle?.reg_no ?? '—'}</td>
                                        <td className="px-4 py-2">{q.insurance_company ?? '—'}</td>
                                        <td className="px-4 py-2">{q.quotation_date}</td>
                                        <td className="px-4 py-2">{Number(q.total_amount).toFixed(2)}</td>
                                        <td className="px-4 py-2">{statusBadge(q.status)}</td>
                                        <td className="px-4 py-2 flex gap-2">
                                            <Button size="sm" variant="outline" onClick={() => setViewQuote(q)}>View</Button>
                                            <Button size="sm" variant="outline" onClick={() => handleOpenEdit(q)}>Edit</Button>
                                            <Button size="sm" variant="destructive" onClick={() => handleDelete(q.id)}>Delete</Button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* View Dialog */}
            <Dialog open={!!viewQuote} onOpenChange={() => setViewQuote(null)}>
                <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader><DialogTitle>Quotation #{viewQuote?.id}</DialogTitle></DialogHeader>
                    {viewQuote && (
                        <div className="space-y-3 text-sm">
                            <div className="grid grid-cols-2 gap-2">
                                <div><span className="font-semibold">Customer:</span> {viewQuote.customer?.f_name} {viewQuote.customer?.l_name}</div>
                                <div><span className="font-semibold">Vehicle:</span> {viewQuote.vehicle?.reg_no} — {viewQuote.vehicle?.make} {viewQuote.vehicle?.model}</div>
                                <div><span className="font-semibold">Insurance Co.:</span> {viewQuote.insurance_company ?? '—'}</div>
                                <div><span className="font-semibold">Policy No:</span> {viewQuote.insurance_policy_no ?? '—'}</div>
                                <div><span className="font-semibold">Contact:</span> {viewQuote.insurance_contact ?? '—'}</div>
                                <div><span className="font-semibold">Date:</span> {viewQuote.quotation_date}</div>
                                <div><span className="font-semibold">Status:</span> {statusBadge(viewQuote.status)}</div>
                            </div>
                            <div><span className="font-semibold">Damage Description:</span><p className="mt-1 text-gray-600">{viewQuote.damage_description}</p></div>
                            {viewQuote.items && viewQuote.items.length > 0 && (
                                <div>
                                    <p className="font-semibold mb-1">Parts</p>
                                    <table className="w-full border text-xs">
                                        <thead className="bg-gray-100"><tr><th className="p-2 text-left">Part</th><th className="p-2 text-right">Qty</th><th className="p-2 text-right">Price</th><th className="p-2 text-right">Subtotal</th></tr></thead>
                                        <tbody>
                                            {viewQuote.items.map((item, i) => (
                                                <tr key={i} className="border-t">
                                                    <td className="p-2">{item.part_name}</td>
                                                    <td className="p-2 text-right">{item.quantity}</td>
                                                    <td className="p-2 text-right">{Number(item.unit_price).toFixed(2)}</td>
                                                    <td className="p-2 text-right">{(item.quantity * item.unit_price).toFixed(2)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                            <div className="border-t pt-2 space-y-1 text-sm">
                                <div className="flex justify-between"><span>Parts Total:</span><span>Rs. {Number(viewQuote.parts_total).toFixed(2)}</span></div>
                                <div className="flex justify-between"><span>Labour Charge:</span><span>Rs. {Number(viewQuote.labour_charge).toFixed(2)}</span></div>
                                <div className="flex justify-between font-bold border-t pt-1"><span>Total:</span><span>Rs. {Number(viewQuote.total_amount).toFixed(2)}</span></div>
                            </div>
                            {viewQuote.images && viewQuote.images.length > 0 && (
                                <div>
                                    <p className="font-semibold mb-1">Damage Images</p>
                                    <div className="flex flex-wrap gap-2">
                                        {viewQuote.images.map(img => (
                                            <img key={img.id} src={`/storage/${img.image_path}`} alt="damage" className="w-24 h-24 object-cover rounded border" />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Add / Edit Dialog */}
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader><DialogTitle>{isEdit ? 'Update Quotation' : 'New Quotation'}</DialogTitle></DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
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
                        </div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Insurance Details</p>
                        <div className="grid grid-cols-3 gap-3">
                            <div><Label>Insurance Company</Label><Input name="insurance_company" value={form.insurance_company} onChange={handleChange} /></div>
                            <div><Label>Policy No</Label><Input name="insurance_policy_no" value={form.insurance_policy_no} onChange={handleChange} /></div>
                            <div><Label>Contact</Label><Input name="insurance_contact" value={form.insurance_contact} onChange={handleChange} /></div>
                        </div>
                        <div>
                            <Label>Damage Description</Label>
                            <textarea name="damage_description" value={form.damage_description} onChange={handleChange} required rows={2}
                                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
                            {errors.damage_description && <p className="text-xs text-red-500 mt-1">{errors.damage_description}</p>}
                        </div>
                        {!isEdit && (
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <Label>Parts / Items</Label>
                                    <Button type="button" size="sm" variant="outline" onClick={handleAddPart}>+ Add Part</Button>
                                </div>
                                {parts.map((part, index) => (
                                    <div key={index} className="grid grid-cols-12 gap-2 mb-2 items-center">
                                        <div className="col-span-5"><Input placeholder="Part name" value={part.part_name} onChange={e => handlePartChange(index, 'part_name', e.target.value)} /></div>
                                        <div className="col-span-2"><Input type="number" min={1} placeholder="Qty" value={part.quantity} onChange={e => handlePartChange(index, 'quantity', e.target.value)} /></div>
                                        <div className="col-span-4"><Input type="number" step="0.01" placeholder="Price" value={part.unit_price} onChange={e => handlePartChange(index, 'unit_price', e.target.value)} /></div>
                                        <div className="col-span-1"><Button type="button" size="sm" variant="destructive" onClick={() => handleRemovePart(index)}>✕</Button></div>
                                    </div>
                                ))}
                            </div>
                        )}
                        <div className="grid grid-cols-3 gap-3">
                            <div><Label>Parts Total (Rs.)</Label><Input name="parts_total" type="number" step="0.01" value={form.parts_total} onChange={handleChange} required /></div>
                            <div><Label>Labour Charge (Rs.)</Label><Input name="labour_charge" type="number" step="0.01" value={form.labour_charge} onChange={handleChange} required /></div>
                            <div><Label>Total Amount (Rs.)</Label><Input name="total_amount" type="number" step="0.01" value={form.total_amount} onChange={handleChange} required /></div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <Label>Status</Label>
                                <select name="status" value={form.status} onChange={handleChange} required
                                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                                    <option value="draft">Draft</option>
                                    <option value="submitted">Submitted</option>
                                    <option value="approved">Approved</option>
                                    <option value="rejected">Rejected</option>
                                </select>
                            </div>
                            <div><Label>Quotation Date</Label><Input name="quotation_date" type="date" value={form.quotation_date} onChange={handleChange} required /></div>
                        </div>
                        {!isEdit && (
                            <div>
                                <Label>Upload Damage Images</Label>
                                <input ref={fileRef} type="file" accept="image/*" multiple onChange={e => setImageFiles(e.target.files ? Array.from(e.target.files) : [])}
                                    className="mt-1 w-full border rounded px-3 py-2 text-sm" />
                                {imageFiles.length > 0 && <p className="text-xs text-gray-500 mt-1">{imageFiles.length} file(s) selected</p>}
                            </div>
                        )}

                        {isEdit && (
                            <div>
                                <Label>Damage Images</Label>

                                {/* Existing images with delete option */}
                                {existingImages.length > 0 && (
                                    <div className="mt-2 mb-3">
                                        <p className="text-xs text-gray-500 mb-2">Existing images — click ✕ to remove</p>
                                        <div className="flex flex-wrap gap-2">
                                            {existingImages.map(img => (
                                                <div key={img.id} className="relative group">
                                                    <img
                                                        src={`/storage/${img.image_path}`}
                                                        alt="damage"
                                                        className="w-20 h-20 object-cover rounded border border-gray-200"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDeleteExistingImage(img.id)}
                                                        className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center hover:bg-red-600 shadow"
                                                    >
                                                        ✕
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {existingImages.length === 0 && deletedImageIds.length > 0 && (
                                    <p className="text-xs text-gray-400 mb-2">All existing images removed.</p>
                                )}

                                {existingImages.length === 0 && deletedImageIds.length === 0 && (
                                    <p className="text-xs text-gray-400 mb-2">No images uploaded yet.</p>
                                )}

                                {/* Upload new images */}
                                <p className="text-xs text-gray-500 mb-1">Add new images</p>
                                <input
                                    ref={fileRef}
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={e => setImageFiles(e.target.files ? Array.from(e.target.files) : [])}
                                    className="w-full border rounded px-3 py-2 text-sm"
                                />
                                {imageFiles.length > 0 && (
                                    <p className="text-xs text-green-600 mt-1">{imageFiles.length} new file(s) will be added</p>
                                )}
                            </div>
                        )}
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