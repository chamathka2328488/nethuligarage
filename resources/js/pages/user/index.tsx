import AppLayout from '@/layouts/app-layout';
import { router, usePage } from '@inertiajs/react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { type BreadcrumbItem } from '@/types';

interface User {
    id: number;
    name: string;
    email: string;
    role: 'owner' | 'admin' | 'mechanic';
    created_at: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'User Management', href: '/users' },
];

const emptyForm = {
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    role: 'mechanic' as 'owner' | 'admin' | 'mechanic',
};

type FormState = typeof emptyForm & { id?: number };

const roleBadge = (role: User['role']) => {
    const map = {
        owner:    'bg-purple-100 text-purple-700',
        admin:    'bg-blue-100 text-blue-700',
        mechanic: 'bg-gray-100 text-gray-600',
    };
    return (
        <span className={`px-2 py-0.5 rounded text-xs font-semibold capitalize ${map[role]}`}>
            {role}
        </span>
    );
};

export default function UserIndex() {
    const { users, auth } = usePage<{ users?: User[]; auth: { user: { id: number } } }>().props;
    const userList = users ?? [];

    const [open, setOpen]     = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [form, setForm]     = useState<FormState>(emptyForm);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleOpenAdd = () => {
        setForm(emptyForm);
        setErrors({});
        setIsEdit(false);
        setOpen(true);
    };

    const handleOpenEdit = (user: User) => {
        setForm({
            id: user.id,
            name: user.name,
            email: user.email,
            password: '',
            password_confirmation: '',
            role: user.role,
        });
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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isEdit && form.id) {
            router.put(`/users/${form.id}`, form, {
                onSuccess: handleClose,
                onError: errs => setErrors(errs as Record<string, string>),
            });
        } else {
            router.post('/users', form, {
                onSuccess: handleClose,
                onError: errs => setErrors(errs as Record<string, string>),
            });
        }
    };

    const handleDelete = (id: number) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            router.delete(`/users/${id}`);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Card className="p-6 mt-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold">User Management</h1>
                        <p className="text-sm text-gray-500 mt-1">
                            Manage staff accounts and their access roles.
                        </p>
                    </div>
                    <Button onClick={handleOpenAdd}>Add User</Button>
                </div>

                {/* Role legend */}
                <div className="flex gap-4 mb-4 p-3 bg-gray-50 dark:bg-neutral-800 rounded-lg text-xs">
                    <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-700 font-semibold">Owner</span>
                        <span className="text-gray-500">Full access — manage users, reports, all data</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-700 font-semibold">Admin</span>
                        <span className="text-gray-500">Manage all data except user accounts</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-600 font-semibold">Mechanic</span>
                        <span className="text-gray-500">View & manage job orders and quotations only</span>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full border text-sm rounded-lg">
                        <thead className="bg-gray-100 dark:bg-neutral-800">
                            <tr>
                                <th className="px-4 py-2 text-left font-semibold">ID</th>
                                <th className="px-4 py-2 text-left font-semibold">Name</th>
                                <th className="px-4 py-2 text-left font-semibold">Email</th>
                                <th className="px-4 py-2 text-left font-semibold">Role</th>
                                <th className="px-4 py-2 text-left font-semibold">Created</th>
                                <th className="px-4 py-2 text-left font-semibold">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {userList.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-4 py-6 text-center text-gray-400">No users found.</td>
                                </tr>
                            ) : (
                                userList.map(user => (
                                    <tr key={user.id} className="border-b last:border-0 hover:bg-gray-50 dark:hover:bg-neutral-700">
                                        <td className="px-4 py-2">{user.id}</td>
                                        <td className="px-4 py-2 font-medium">
                                            {user.name}
                                            {user.id === auth.user.id && (
                                                <span className="ml-2 text-xs text-gray-400">(you)</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-2">{user.email}</td>
                                        <td className="px-4 py-2">{roleBadge(user.role)}</td>
                                        <td className="px-4 py-2 text-gray-500">
                                            {new Date(user.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-4 py-2 flex gap-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleOpenEdit(user)}
                                            >
                                                Edit
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="destructive"
                                                onClick={() => handleDelete(user.id)}
                                                disabled={user.id === auth.user.id}
                                            >
                                                Delete
                                            </Button>
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
                        <DialogTitle>{isEdit ? 'Update User' : 'Add User'}</DialogTitle>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <Label>Full Name</Label>
                            <Input
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                placeholder="e.g. Kamal Perera"
                                required
                            />
                            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                        </div>

                        <div>
                            <Label>Email</Label>
                            <Input
                                name="email"
                                type="email"
                                value={form.email}
                                onChange={handleChange}
                                required
                            />
                            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                        </div>

                        <div>
                            <Label>Role</Label>
                            <select
                                name="role"
                                value={form.role}
                                onChange={handleChange}
                                required
                                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            >
                                <option value="mechanic">Mechanic</option>
                                <option value="admin">Admin</option>
                                <option value="owner">Owner</option>
                            </select>
                            {errors.role && <p className="text-xs text-red-500 mt-1">{errors.role}</p>}
                        </div>

                        <div>
                            <Label>{isEdit ? 'New Password (leave blank to keep current)' : 'Password'}</Label>
                            <Input
                                name="password"
                                type="password"
                                value={form.password}
                                onChange={handleChange}
                                required={!isEdit}
                            />
                            {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
                        </div>

                        <div>
                            <Label>Confirm Password</Label>
                            <Input
                                name="password_confirmation"
                                type="password"
                                value={form.password_confirmation}
                                onChange={handleChange}
                                required={!isEdit}
                            />
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