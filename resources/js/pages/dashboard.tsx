import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage, Link } from '@inertiajs/react';
import { Users, Car, ClipboardList, PackageOpen, Receipt, Notebook, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { Card } from '@/components/ui/card';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
    },
];

interface DashboardProps {
    stats: {
        total_customers: number;
        total_vehicles: number;
        total_job_orders: number;
        pending_jobs: number;
        in_progress_jobs: number;
        completed_jobs: number;
        total_inventory_items: number;
        low_stock_items: number;
        out_of_stock_items: number;
        total_invoices: number;
        pending_invoices: number;
        total_quotations: number;
    };
    recent_jobs: {
        id: number;
        description: string;
        status: 'pending' | 'in_progress' | 'completed';
        date_in: string;
        mechanic_name: string;
        vehicle?: { reg_no: string; make: string; model: string };
        customer?: { f_name: string; l_name: string };
    }[];
    low_stock_items: {
        id: number;
        item_name: string;
        quantity: number;
        low_stock_threshold: number;
    }[];
}

const statusBadge = (status: 'pending' | 'in_progress' | 'completed') => {
    const map = {
        pending:     'bg-yellow-100 text-yellow-700',
        in_progress: 'bg-blue-100 text-blue-700',
        completed:   'bg-green-100 text-green-700',
    };
    const labels = { pending: 'Pending', in_progress: 'In Progress', completed: 'Completed' };
    return (
        <span className={`px-2 py-0.5 rounded text-xs font-semibold ${map[status]}`}>
            {labels[status]}
        </span>
    );
};

export default function Dashboard() {
    const { stats, recent_jobs, low_stock_items } = usePage<DashboardProps>().props;

    const statCards = [
        { title: 'Total Customers',   value: stats?.total_customers ?? 0,       icon: Users,         color: 'text-blue-600',   bg: 'bg-blue-50 dark:bg-blue-900/20',   href: '/customers' },
        { title: 'Total Vehicles',    value: stats?.total_vehicles ?? 0,        icon: Car,           color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20', href: '/vehicles' },
        { title: 'Total Job Orders',  value: stats?.total_job_orders ?? 0,      icon: ClipboardList, color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-900/20', href: '/joborders' },
        { title: 'Inventory Items',   value: stats?.total_inventory_items ?? 0, icon: PackageOpen,   color: 'text-teal-600',   bg: 'bg-teal-50 dark:bg-teal-900/20',   href: '/inventory' },
        { title: 'Total Invoices',    value: stats?.total_invoices ?? 0,        icon: Receipt,       color: 'text-green-600',  bg: 'bg-green-50 dark:bg-green-900/20', href: '/invoices' },
        { title: 'Total Quotations',  value: stats?.total_quotations ?? 0,      icon: Notebook,      color: 'text-rose-600',   bg: 'bg-rose-50 dark:bg-rose-900/20',   href: '/quotations' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />

            <div className="flex flex-col gap-6 p-4 overflow-x-auto">

                {/* ── Stat Cards ── */}
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
                    {statCards.map((card) => (
                        <Link key={card.title} href={card.href}>
                            <Card className={`p-4 flex flex-col gap-2 hover:shadow-md transition-shadow cursor-pointer ${card.bg}`}>
                                <div className="flex items-center justify-between">
                                    <card.icon className={`w-5 h-5 ${card.color}`} />
                                </div>
                                <p className="text-2xl font-bold">{card.value}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{card.title}</p>
                            </Card>
                        </Link>
                    ))}
                </div>

                {/* ── Job Status Summary ── */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <Card className="p-4 flex items-center gap-4 bg-yellow-50 dark:bg-yellow-900/20">
                        <Clock className="w-8 h-8 text-yellow-500" />
                        <div>
                            <p className="text-2xl font-bold">{stats?.pending_jobs ?? 0}</p>
                            <p className="text-sm text-gray-500">Pending Jobs</p>
                        </div>
                    </Card>
                    <Card className="p-4 flex items-center gap-4 bg-blue-50 dark:bg-blue-900/20">
                        <ClipboardList className="w-8 h-8 text-blue-500" />
                        <div>
                            <p className="text-2xl font-bold">{stats?.in_progress_jobs ?? 0}</p>
                            <p className="text-sm text-gray-500">Jobs In Progress</p>
                        </div>
                    </Card>
                    <Card className="p-4 flex items-center gap-4 bg-green-50 dark:bg-green-900/20">
                        <CheckCircle className="w-8 h-8 text-green-500" />
                        <div>
                            <p className="text-2xl font-bold">{stats?.completed_jobs ?? 0}</p>
                            <p className="text-sm text-gray-500">Completed Jobs</p>
                        </div>
                    </Card>
                </div>

                {/* ── Bottom Section: Recent Jobs + Low Stock ── */}
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">

                    {/* Recent Job Orders */}
                    <Card className="p-4 lg:col-span-2">
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="font-semibold text-base">Recent Job Orders</h2>
                            <Link href="/joborders" className="text-xs text-blue-600 hover:underline">View all</Link>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-sm">
                                <thead>
                                    <tr className="border-b text-gray-500 text-xs">
                                        <th className="pb-2 text-left font-medium">ID</th>
                                        <th className="pb-2 text-left font-medium">Vehicle</th>
                                        <th className="pb-2 text-left font-medium">Customer</th>
                                        <th className="pb-2 text-left font-medium">Mechanic</th>
                                        <th className="pb-2 text-left font-medium">Date</th>
                                        <th className="pb-2 text-left font-medium">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(recent_jobs ?? []).length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="py-6 text-center text-gray-400 text-sm">No job orders yet</td>
                                        </tr>
                                    ) : (
                                        (recent_jobs ?? []).map((job) => (
                                            <tr key={job.id} className="border-b last:border-0 hover:bg-gray-50 dark:hover:bg-neutral-800">
                                                <td className="py-2 pr-3">#{job.id}</td>
                                                <td className="py-2 pr-3">{job.vehicle?.reg_no ?? '-'}</td>
                                                <td className="py-2 pr-3">{job.customer ? `${job.customer.f_name} ${job.customer.l_name}` : '-'}</td>
                                                <td className="py-2 pr-3">{job.mechanic_name ?? '-'}</td>
                                                <td className="py-2 pr-3">{job.date_in}</td>
                                                <td className="py-2">{statusBadge(job.status)}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Card>

                    {/* Low Stock Alerts */}
                    <Card className="p-4">
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="font-semibold text-base flex items-center gap-1">
                                <AlertTriangle className="w-4 h-4 text-yellow-500" />
                                Stock Alerts
                            </h2>
                            <Link href="/inventory" className="text-xs text-blue-600 hover:underline">View all</Link>
                        </div>

                        {(low_stock_items ?? []).length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-8 text-gray-400 gap-2">
                                <CheckCircle className="w-8 h-8 text-green-400" />
                                <p className="text-sm">All items well stocked</p>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-2">
                                {(low_stock_items ?? []).map((item) => (
                                    <div key={item.id} className="flex items-center justify-between rounded-lg px-3 py-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
                                        <div>
                                            <p className="text-sm font-medium">{item.item_name}</p>
                                            <p className="text-xs text-gray-500">Min: {item.low_stock_threshold}</p>
                                        </div>
                                        <span className={`text-xs font-bold px-2 py-0.5 rounded ${item.quantity === 0 ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                            {item.quantity === 0 ? 'Out' : `Qty: ${item.quantity}`}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Invoice alert */}
                        {(stats?.pending_invoices ?? 0) > 0 && (
                            <div className="mt-4 flex items-center justify-between rounded-lg px-3 py-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                                <div>
                                    <p className="text-sm font-medium text-red-700">Unpaid Invoices</p>
                                    <p className="text-xs text-gray-500">Requires attention</p>
                                </div>
                                <Link href="/invoices">
                                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-red-100 text-red-700">{stats.pending_invoices}</span>
                                </Link>
                            </div>
                        )}
                    </Card>

                </div>
            </div>
        </AppLayout>
    );
}