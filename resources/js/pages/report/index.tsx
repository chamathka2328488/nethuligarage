import AppLayout from '@/layouts/app-layout';
import { router, usePage } from '@inertiajs/react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { type BreadcrumbItem } from '@/types';
import { useState, useEffect, useRef } from 'react';

// ── Types ──────────────────────────────────────────────────────────────────────

interface PartsExpense {
    item_name: string;
    category: string | null;
    total_qty: number;
    total_cost: number;
}

interface MonthlyStat {
    month: string;
    cost?: number;
    revenue?: number;
}

interface InventoryItem {
    id: number;
    item_name: string;
    category: string | null;
    quantity: number;
    low_stock_threshold: number;
    unit_price: number;
    stock_value: number;
    stock_status: 'in_stock' | 'low_stock' | 'out_of_stock';
}

interface JobSummary {
    status: string;
    count: number;
}

interface RevenueSummary {
    total_revenue: number;
    total_parts: number;
    total_labour: number;
    total_discount: number;
    invoice_count: number;
}

interface TopPart {
    item_name: string;
    total_used: number;
}

interface DailyJobSummary {
    date: string;
    total_jobs: number;
    completed: number;
    in_progress: number;
    pending: number;
    total_labour: number;
}

interface PageProps {
    partsExpense:     PartsExpense[];
    monthlyCost:      MonthlyStat[];
    inventorySummary: InventoryItem[];
    jobSummary:       JobSummary[];
    revenueSummary:   RevenueSummary | null;
    monthlyRevenue:   MonthlyStat[];
    topParts:         TopPart[];
    dailyJobSummary:  DailyJobSummary[];
    filters:          { from: string; to: string };
}

// ── Constants ──────────────────────────────────────────────────────────────────

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Reports', href: '/reports' },
];

// ── Helpers ────────────────────────────────────────────────────────────────────

const fmt = (n: number | null | undefined) =>
    Number(n ?? 0).toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const stockBadge = (status: InventoryItem['stock_status']) => {
    if (status === 'out_of_stock') return <span className="px-2 py-0.5 rounded text-xs bg-red-100 text-red-700 font-semibold">Out of Stock</span>;
    if (status === 'low_stock')    return <span className="px-2 py-0.5 rounded text-xs bg-yellow-100 text-yellow-700 font-semibold">Low Stock</span>;
    return <span className="px-2 py-0.5 rounded text-xs bg-green-100 text-green-700 font-semibold">In Stock</span>;
};

const jobStatusColor: Record<string, string> = {
    pending:     'bg-yellow-100 text-yellow-700',
    in_progress: 'bg-blue-100 text-blue-700',
    completed:   'bg-green-100 text-green-700',
};

const jobStatusLabel: Record<string, string> = {
    pending:     'Pending',
    in_progress: 'In Progress',
    completed:   'Completed',
};

// ── Bar Chart Component ────────────────────────────────────────────────────────

function BarChart({ data, color }: { data: { label: string; value: number }[]; color: string }) {
    const max = Math.max(...data.map(d => d.value), 1);
    return (
        <div className="space-y-2 mt-2">
            {data.map((d, i) => (
                <div key={i} className="flex items-center gap-3 text-sm">
                    <div className="w-28 text-right text-xs text-gray-500 truncate shrink-0">{d.label}</div>
                    <div className="flex-1 bg-gray-100 dark:bg-neutral-700 rounded-full h-5 overflow-hidden">
                        <div
                            className="h-5 rounded-full flex items-center pl-2 text-xs font-medium text-white transition-all duration-500"
                            style={{ width: `${Math.max((d.value / max) * 100, 4)}%`, background: color }}
                        >
                            {d.value > max * 0.15 ? fmt(d.value) : ''}
                        </div>
                    </div>
                    <div className="w-20 text-xs text-gray-500 shrink-0 text-right">
                        {d.value <= max * 0.15 ? fmt(d.value) : ''}
                    </div>
                </div>
            ))}
        </div>
    );
}

// ── Line Sparkline ─────────────────────────────────────────────────────────────

function Sparkline({ data, color }: { data: number[]; color: string }) {
    const ref = useRef<SVGSVGElement>(null);
    const max  = Math.max(...data, 1);
    const min  = Math.min(...data, 0);
    const W    = 300;
    const H    = 80;
    const pad  = 8;

    if (data.length < 2) return <p className="text-xs text-gray-400 mt-2">Not enough data</p>;

    const x = (i: number) => pad + (i / (data.length - 1)) * (W - 2 * pad);
    const y = (v: number) => H - pad - ((v - min) / (max - min + 1)) * (H - 2 * pad);

    const points = data.map((v, i) => `${x(i)},${y(v)}`).join(' ');
    const area   = `M${x(0)},${H - pad} ` + data.map((v, i) => `L${x(i)},${y(v)}`).join(' ') + ` L${x(data.length - 1)},${H - pad} Z`;

    return (
        <svg ref={ref} viewBox={`0 0 ${W} ${H}`} className="w-full mt-2" style={{ height: H }}>
            <path d={area} fill={color} fillOpacity="0.12" />
            <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" />
            {data.map((v, i) => (
                <circle key={i} cx={x(i)} cy={y(v)} r="3" fill={color} />
            ))}
        </svg>
    );
}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function ReportIndex() {
    const {
        partsExpense, monthlyCost, inventorySummary,
        jobSummary, revenueSummary, monthlyRevenue, topParts,
        dailyJobSummary, filters,
    } = usePage<PageProps>().props;

    const [from, setFrom] = useState(filters.from);
    const [to,   setTo]   = useState(filters.to);

    const handleFilter = () => {
        router.get('/reports', { from, to }, { preserveState: true });
    };

    const totalJobs = (jobSummary ?? []).reduce((s, j) => s + Number(j.count), 0);

    const costMonths   = (monthlyCost   ?? []).map(m => m.month.slice(5));
    const costValues   = (monthlyCost   ?? []).map(m => Number(m.cost ?? 0));
    const revMonths    = (monthlyRevenue ?? []).map(m => m.month.slice(5));
    const revValues    = (monthlyRevenue ?? []).map(m => Number(m.revenue ?? 0));

    const topPartsData = (topParts ?? []).map(p => ({ label: p.item_name, value: Number(p.total_used) }));
    const partsExpData = (partsExpense ?? []).slice(0, 8).map(p => ({ label: p.item_name, value: Number(p.total_cost) }));

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="p-4 space-y-6 mt-2">

                {/* ── Date filter ── */}
                <Card className="p-4">
                    <div className="flex flex-wrap items-end gap-3">
                        <div>
                            <label className="text-xs text-gray-500 block mb-1">From</label>
                            <Input type="date" value={from} onChange={e => setFrom(e.target.value)} className="w-40" />
                        </div>
                        <div>
                            <label className="text-xs text-gray-500 block mb-1">To</label>
                            <Input type="date" value={to} onChange={e => setTo(e.target.value)} className="w-40" />
                        </div>
                        <Button onClick={handleFilter}>Generate Report</Button>
                    </div>
                </Card>

                {/* ── Revenue summary cards ── */}
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    {[
                        { label: 'Total Revenue',   value: fmt(revenueSummary?.total_revenue),  color: 'text-green-600' },
                        { label: 'Parts Cost',       value: fmt(revenueSummary?.total_parts),    color: 'text-blue-600'  },
                        { label: 'Labour Income',    value: fmt(revenueSummary?.total_labour),   color: 'text-purple-600'},
                        { label: 'Total Discounts',  value: fmt(revenueSummary?.total_discount), color: 'text-orange-600'},
                    ].map(c => (
                        <Card key={c.label} className="p-4">
                            <p className="text-xs text-gray-500">{c.label} (Rs.)</p>
                            <p className={`text-xl font-bold mt-1 ${c.color}`}>{c.value}</p>
                        </Card>
                    ))}
                </div>

                {/* ── Job status + Monthly revenue ── */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

                    {/* Job status breakdown */}
                    <Card className="p-4">
                        <h2 className="font-semibold text-sm mb-3">Job order status ({totalJobs} total)</h2>
                        {(jobSummary ?? []).length === 0 ? (
                            <p className="text-xs text-gray-400">No job orders in this period.</p>
                        ) : (
                            <div className="space-y-3">
                                {(jobSummary ?? []).map(j => {
                                    const pct = totalJobs > 0 ? Math.round((Number(j.count) / totalJobs) * 100) : 0;
                                    return (
                                        <div key={j.status}>
                                            <div className="flex justify-between text-sm mb-1">
                                                <span className={`px-2 py-0.5 rounded text-xs font-semibold ${jobStatusColor[j.status] ?? 'bg-gray-100 text-gray-600'}`}>
                                                    {jobStatusLabel[j.status] ?? j.status}
                                                </span>
                                                <span className="text-gray-500 text-xs">{j.count} jobs ({pct}%)</span>
                                            </div>
                                            <div className="bg-gray-100 dark:bg-neutral-700 rounded-full h-2">
                                                <div className="h-2 rounded-full bg-blue-500" style={{ width: `${pct}%` }} />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </Card>

                    {/* Monthly revenue sparkline */}
                    <Card className="p-4">
                        <h2 className="font-semibold text-sm mb-1">Monthly revenue (last 6 months)</h2>
                        <div className="flex gap-2 flex-wrap mb-1">
                            {revMonths.map((m, i) => (
                                <span key={i} className="text-xs text-gray-400">{m}: <span className="text-gray-600 font-medium">Rs.{fmt(revValues[i])}</span></span>
                            ))}
                        </div>
                        <Sparkline data={revValues} color="#16a34a" />
                    </Card>
                </div>

                {/* ── Parts expense + Monthly cost ── */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

                    {/* Parts expense bar chart */}
                    <Card className="p-4">
                        <h2 className="font-semibold text-sm mb-1">Parts expenditure — top 8 (Rs.)</h2>
                        <p className="text-xs text-gray-400 mb-2">Period: {filters.from} → {filters.to}</p>
                        {partsExpData.length === 0 ? (
                            <p className="text-xs text-gray-400">No parts used in this period.</p>
                        ) : (
                            <BarChart data={partsExpData} color="#2563eb" />
                        )}
                    </Card>

                    {/* Monthly parts cost sparkline */}
                    <Card className="p-4">
                        <h2 className="font-semibold text-sm mb-1">Monthly parts cost (last 6 months)</h2>
                        <div className="flex gap-2 flex-wrap mb-1">
                            {costMonths.map((m, i) => (
                                <span key={i} className="text-xs text-gray-400">{m}: <span className="text-gray-600 font-medium">Rs.{fmt(costValues[i])}</span></span>
                            ))}
                        </div>
                        <Sparkline data={costValues} color="#dc2626" />
                    </Card>
                </div>

                {/* ── Top 5 most used parts ── */}
                <Card className="p-4">
                    <h2 className="font-semibold text-sm mb-3">Top 5 most used parts (by quantity)</h2>
                    {topPartsData.length === 0 ? (
                        <p className="text-xs text-gray-400">No parts usage data in this period.</p>
                    ) : (
                        <BarChart data={topPartsData} color="#7c3aed" />
                    )}
                </Card>

                {/* ── Full parts expense table ── */}
                <Card className="p-4">
                    <h2 className="font-semibold text-sm mb-3">Parts expense detail</h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full border text-sm rounded-lg">
                            <thead className="bg-gray-100 dark:bg-neutral-800">
                                <tr>
                                    <th className="px-4 py-2 text-left font-semibold">Part Name</th>
                                    <th className="px-4 py-2 text-left font-semibold">Category</th>
                                    <th className="px-4 py-2 text-right font-semibold">Qty Used</th>
                                    <th className="px-4 py-2 text-right font-semibold">Total Cost (Rs.)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(partsExpense ?? []).length === 0 ? (
                                    <tr><td colSpan={4} className="px-4 py-6 text-center text-gray-400">No data for this period.</td></tr>
                                ) : (
                                    (partsExpense ?? []).map((p, i) => (
                                        <tr key={i} className="border-b last:border-0 hover:bg-gray-50 dark:hover:bg-neutral-700">
                                            <td className="px-4 py-2 font-medium">{p.item_name}</td>
                                            <td className="px-4 py-2 text-gray-500">{p.category ?? '—'}</td>
                                            <td className="px-4 py-2 text-right">{p.total_qty}</td>
                                            <td className="px-4 py-2 text-right font-semibold">{fmt(p.total_cost)}</td>
                                        </tr>
                                    ))
                                )}
                                {(partsExpense ?? []).length > 0 && (
                                    <tr className="bg-gray-50 dark:bg-neutral-800 font-bold">
                                        <td className="px-4 py-2" colSpan={3}>Total</td>
                                        <td className="px-4 py-2 text-right">
                                            {fmt((partsExpense ?? []).reduce((s, p) => s + Number(p.total_cost), 0))}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>

                {/* ── Inventory stock value table ── */}
                <Card className="p-4">
                    <h2 className="font-semibold text-sm mb-3">Current inventory stock value</h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full border text-sm rounded-lg">
                            <thead className="bg-gray-100 dark:bg-neutral-800">
                                <tr>
                                    <th className="px-4 py-2 text-left font-semibold">Item Name</th>
                                    <th className="px-4 py-2 text-left font-semibold">Category</th>
                                    <th className="px-4 py-2 text-right font-semibold">Qty</th>
                                    <th className="px-4 py-2 text-right font-semibold">Unit Price (Rs.)</th>
                                    <th className="px-4 py-2 text-right font-semibold">Stock Value (Rs.)</th>
                                    <th className="px-4 py-2 text-left font-semibold">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(inventorySummary ?? []).length === 0 ? (
                                    <tr><td colSpan={6} className="px-4 py-6 text-center text-gray-400">No inventory items.</td></tr>
                                ) : (
                                    (inventorySummary ?? []).map(item => (
                                        <tr key={item.id} className="border-b last:border-0 hover:bg-gray-50 dark:hover:bg-neutral-700">
                                            <td className="px-4 py-2 font-medium">{item.item_name}</td>
                                            <td className="px-4 py-2 text-gray-500">{item.category ?? '—'}</td>
                                            <td className="px-4 py-2 text-right">{item.quantity}</td>
                                            <td className="px-4 py-2 text-right">{fmt(item.unit_price)}</td>
                                            <td className="px-4 py-2 text-right font-semibold">{fmt(item.stock_value)}</td>
                                            <td className="px-4 py-2">{stockBadge(item.stock_status)}</td>
                                        </tr>
                                    ))
                                )}
                                {(inventorySummary ?? []).length > 0 && (
                                    <tr className="bg-gray-50 dark:bg-neutral-800 font-bold">
                                        <td className="px-4 py-2" colSpan={4}>Total Stock Value</td>
                                        <td className="px-4 py-2 text-right">
                                            {fmt((inventorySummary ?? []).reduce((s, i) => s + Number(i.stock_value), 0))}
                                        </td>
                                        <td />
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>

                {/* ── Daily job summary ── */}
                <Card className="p-4">
                    <div className="flex items-center justify-between mb-3">
                        <div>
                            <h2 className="font-semibold text-sm">Daily job summary</h2>
                            <p className="text-xs text-gray-400 mt-0.5">
                                Period: {filters.from} → {filters.to}
                            </p>
                        </div>
                        {/* Quick totals row */}
                        {(dailyJobSummary ?? []).length > 0 && (
                            <div className="flex gap-4 text-xs">
                                <div className="text-center">
                                    <p className="font-bold text-base text-gray-700 dark:text-gray-200">
                                        {(dailyJobSummary ?? []).reduce((s, d) => s + Number(d.total_jobs), 0)}
                                    </p>
                                    <p className="text-gray-400">Total jobs</p>
                                </div>
                                <div className="text-center">
                                    <p className="font-bold text-base text-green-600">
                                        {(dailyJobSummary ?? []).reduce((s, d) => s + Number(d.completed), 0)}
                                    </p>
                                    <p className="text-gray-400">Completed</p>
                                </div>
                                <div className="text-center">
                                    <p className="font-bold text-base text-blue-600">
                                        {(dailyJobSummary ?? []).reduce((s, d) => s + Number(d.in_progress), 0)}
                                    </p>
                                    <p className="text-gray-400">In Progress</p>
                                </div>
                                <div className="text-center">
                                    <p className="font-bold text-base text-yellow-600">
                                        {(dailyJobSummary ?? []).reduce((s, d) => s + Number(d.pending), 0)}
                                    </p>
                                    <p className="text-gray-400">Pending</p>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full border text-sm rounded-lg">
                            <thead className="bg-gray-100 dark:bg-neutral-800">
                                <tr>
                                    <th className="px-4 py-2 text-left font-semibold">Date</th>
                                    <th className="px-4 py-2 text-right font-semibold">Total Jobs</th>
                                    <th className="px-4 py-2 text-right font-semibold">Completed</th>
                                    <th className="px-4 py-2 text-right font-semibold">In Progress</th>
                                    <th className="px-4 py-2 text-right font-semibold">Pending</th>
                                    <th className="px-4 py-2 text-right font-semibold">Labour (Rs.)</th>
                                    <th className="px-4 py-2 text-left font-semibold">Activity</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(dailyJobSummary ?? []).length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-4 py-6 text-center text-gray-400">
                                            No job orders in this period.
                                        </td>
                                    </tr>
                                ) : (
                                    (dailyJobSummary ?? []).map((day, i) => {
                                        const maxJobs = Math.max(...(dailyJobSummary ?? []).map(d => Number(d.total_jobs)), 1);
                                        const pct     = Math.round((Number(day.total_jobs) / maxJobs) * 100);
                                        return (
                                            <tr key={i} className="border-b last:border-0 hover:bg-gray-50 dark:hover:bg-neutral-700">
                                                <td className="px-4 py-2 font-medium">{day.date}</td>
                                                <td className="px-4 py-2 text-right font-semibold">{day.total_jobs}</td>
                                                <td className="px-4 py-2 text-right">
                                                    <span className="px-2 py-0.5 rounded text-xs bg-green-100 text-green-700 font-semibold">
                                                        {day.completed}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-2 text-right">
                                                    <span className="px-2 py-0.5 rounded text-xs bg-blue-100 text-blue-700 font-semibold">
                                                        {day.in_progress}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-2 text-right">
                                                    <span className="px-2 py-0.5 rounded text-xs bg-yellow-100 text-yellow-700 font-semibold">
                                                        {day.pending}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-2 text-right">{fmt(day.total_labour)}</td>
                                                <td className="px-4 py-2 w-32">
                                                    <div className="bg-gray-100 dark:bg-neutral-700 rounded-full h-2">
                                                        <div
                                                            className="h-2 rounded-full bg-blue-500"
                                                            style={{ width: `${pct}%` }}
                                                        />
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                                {(dailyJobSummary ?? []).length > 0 && (
                                    <tr className="bg-gray-50 dark:bg-neutral-800 font-bold">
                                        <td className="px-4 py-2">Total</td>
                                        <td className="px-4 py-2 text-right">
                                            {(dailyJobSummary ?? []).reduce((s, d) => s + Number(d.total_jobs), 0)}
                                        </td>
                                        <td className="px-4 py-2 text-right text-green-600">
                                            {(dailyJobSummary ?? []).reduce((s, d) => s + Number(d.completed), 0)}
                                        </td>
                                        <td className="px-4 py-2 text-right text-blue-600">
                                            {(dailyJobSummary ?? []).reduce((s, d) => s + Number(d.in_progress), 0)}
                                        </td>
                                        <td className="px-4 py-2 text-right text-yellow-600">
                                            {(dailyJobSummary ?? []).reduce((s, d) => s + Number(d.pending), 0)}
                                        </td>
                                        <td className="px-4 py-2 text-right">
                                            {fmt((dailyJobSummary ?? []).reduce((s, d) => s + Number(d.total_labour), 0))}
                                        </td>
                                        <td />
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>

            </div>
        </AppLayout>
    );
}