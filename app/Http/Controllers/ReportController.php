<?php

namespace App\Http\Controllers;

use App\Models\JobOrderItem;
use App\Models\InventoryItem;
use App\Models\Invoice;
use App\Models\JobOrder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ReportController extends Controller
{
    public function index(Request $request)
    {
        $from = $request->get('from', now()->startOfMonth()->toDateString());
        $to   = $request->get('to',   now()->toDateString());

        // ── 1. Parts expense report ─────────────────────────────────────────────
        // Total spent on each part within date range (via job order items)
        $partsExpense = JobOrderItem::join('inventory_items', 'job_order_items.inventory_item_id', '=', 'inventory_items.id')
            ->join('job_orders', 'job_order_items.job_order_id', '=', 'job_orders.id')
            ->whereBetween('job_orders.date_in', [$from, $to])
            ->select(
                'inventory_items.item_name',
                'inventory_items.category',
                DB::raw('SUM(job_order_items.quantity_used) as total_qty'),
                DB::raw('SUM(job_order_items.quantity_used * job_order_items.unit_price) as total_cost')
            )
            ->groupBy('inventory_items.id', 'inventory_items.item_name', 'inventory_items.category')
            ->orderByDesc('total_cost')
            ->get();

        // ── 2. Monthly parts cost trend (last 6 months) ─────────────────────────
        $monthlyCost = JobOrderItem::join('job_orders', 'job_order_items.job_order_id', '=', 'job_orders.id')
            ->where('job_orders.date_in', '>=', now()->subMonths(6)->toDateString())
            ->select(
                DB::raw("DATE_FORMAT(job_orders.date_in, '%Y-%m') as month"),
                DB::raw('SUM(job_order_items.quantity_used * job_order_items.unit_price) as cost')
            )
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        // ── 3. Inventory current stock summary ──────────────────────────────────
        $inventorySummary = InventoryItem::select(
                'id', 'item_name', 'category',
                'quantity', 'low_stock_threshold', 'unit_price',
                DB::raw('quantity * unit_price as stock_value')
            )
            ->orderByDesc('stock_value')
            ->get()
            ->map(function ($item) {
                $item->stock_status = $item->stock_status;
                return $item;
            });

        // ── 4. Job order summary by status ─────────────────────────────────────
        $jobSummary = JobOrder::whereBetween('date_in', [$from, $to])
            ->select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->get();

        // ── 5. Revenue summary (invoices) ───────────────────────────────────────
        $revenueSummary = Invoice::whereBetween('invoice_date', [$from, $to])
            ->select(
                DB::raw('SUM(total_amount) as total_revenue'),
                DB::raw('SUM(parts_total) as total_parts'),
                DB::raw('SUM(labour_charge) as total_labour'),
                DB::raw('SUM(discount) as total_discount'),
                DB::raw('COUNT(*) as invoice_count')
            )
            ->first();

        // ── 6. Monthly revenue trend (last 6 months) ────────────────────────────
        $monthlyRevenue = Invoice::where('invoice_date', '>=', now()->subMonths(6)->toDateString())
            ->select(
                DB::raw("DATE_FORMAT(invoice_date, '%Y-%m') as month"),
                DB::raw('SUM(total_amount) as revenue')
            )
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        // ── 7. Top 5 most used parts ────────────────────────────────────────────
        $topParts = JobOrderItem::join('inventory_items', 'job_order_items.inventory_item_id', '=', 'inventory_items.id')
            ->join('job_orders', 'job_order_items.job_order_id', '=', 'job_orders.id')
            ->whereBetween('job_orders.date_in', [$from, $to])
            ->select(
                'inventory_items.item_name',
                DB::raw('SUM(job_order_items.quantity_used) as total_used')
            )
            ->groupBy('inventory_items.id', 'inventory_items.item_name')
            ->orderByDesc('total_used')
            ->take(5)
            ->get();

        // ── 8. Daily job summary ─────────────────────────────────────────────────
        // Each day in range: how many jobs came in, how many completed, total labour
        $dailyJobSummary = JobOrder::whereBetween('date_in', [$from, $to])
            ->select(
                'date_in as date',
                DB::raw('COUNT(*) as total_jobs'),
                DB::raw('SUM(CASE WHEN status = "completed" THEN 1 ELSE 0 END) as completed'),
                DB::raw('SUM(CASE WHEN status = "in_progress" THEN 1 ELSE 0 END) as in_progress'),
                DB::raw('SUM(CASE WHEN status = "pending" THEN 1 ELSE 0 END) as pending'),
                DB::raw('SUM(labour_charge) as total_labour')
            )
            ->groupBy('date_in')
            ->orderBy('date_in', 'desc')
            ->get();

        return Inertia::render('report/index', [
            'partsExpense'     => $partsExpense,
            'monthlyCost'      => $monthlyCost,
            'inventorySummary' => $inventorySummary,
            'jobSummary'       => $jobSummary,
            'revenueSummary'   => $revenueSummary,
            'monthlyRevenue'   => $monthlyRevenue,
            'topParts'         => $topParts,
            'dailyJobSummary'  => $dailyJobSummary,
            'filters'          => ['from' => $from, 'to' => $to],
        ]);
    }
}